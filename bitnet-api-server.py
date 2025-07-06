#!/usr/bin/env python3
"""
BitNet GGUF API Server
A simple OpenAI-compatible API server for BitNet GGUF models
"""

import os
import subprocess
import json
import time
import uuid
import hashlib
import base64
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
from pathlib import Path

from flask import Flask, request, jsonify
from flask_cors import CORS
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

@dataclass
class BitNetConfig:
    model_path: str = "../BitNet/models/BitNet-b1.58-2B-4T/ggml-model-i2_s.gguf"
    llama_cli_path: str = "./../BitNet/build/bin/Release/llama-cli.exe"
    max_tokens: int = 50
    temperature: float = 0.8
    context_size: int = 2048
    threads: int = 2

config = BitNetConfig()

class BitNetInference:
    def __init__(self, config: BitNetConfig):
        self.config = config
        self.model_exists = Path(config.model_path).exists()
        self.llama_cli_exists = Path(config.llama_cli_path).exists()
        
        if self.model_exists:
            model_size = Path(config.model_path).stat().st_size / (1024*1024)
            logger.info(f"✅ BitNet GGUF model found: {model_size:.1f} MB")
        else:
            logger.warning(f"⚠️  BitNet GGUF model not found: {config.model_path}")
            
        if self.llama_cli_exists:
            logger.info("✅ llama-cli binary found")
        else:
            logger.warning(f"⚠️  llama-cli binary not found: {config.llama_cli_path}")

    def generate_response(self, prompt: str, max_tokens: Optional[int] = None, temperature: Optional[float] = None) -> tuple[str, str]:
        """Generate response using BitNet GGUF model"""
        
        if not self.model_exists or not self.llama_cli_exists:
            return self._fallback_response(prompt)
        
        max_tokens = max_tokens or self.config.max_tokens
        temperature = temperature or self.config.temperature
        
        try:
            # Build llama-cli command
            cmd = [
                self.config.llama_cli_path,
                "-m", self.config.model_path,
                "-p", prompt,
                "-n", str(max_tokens),
                "-t", str(self.config.threads),
                "-c", str(self.config.context_size),
                "--temp", str(temperature),
                "-ngl", "0",  # No GPU layers
                "-b", "1",    # Batch size
            ]
            
            logger.info(f"Running BitNet inference: {' '.join(cmd[:6])}...")
            
            # Run the command
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=120  # 2 minute timeout
            )
            
            if result.returncode != 0:
                logger.error(f"llama-cli failed: {result.stderr}")
                return self._fallback_response(prompt)
            
            # Clean up llama.cpp output
            response_text = self._clean_llama_output(result.stdout)
            
            # Generate simple proof
            proof = self._generate_proof(prompt, response_text)
            
            logger.info(f"BitNet inference completed: {len(response_text)} characters")
            return response_text, proof
            
        except subprocess.TimeoutExpired:
            logger.error("BitNet inference timed out")
            return self._fallback_response(prompt)
        except Exception as e:
            logger.error(f"BitNet inference error: {e}")
            return self._fallback_response(prompt)

    def _clean_llama_output(self, raw_output: str) -> str:
        """Clean llama.cpp output to extract just the generated text"""
        lines = raw_output.split('\n')
        
        # Find the actual response, skipping system output
        response_lines = []
        found_response = False
        
        for line in lines:
            # Skip llama.cpp system output
            if any(keyword in line for keyword in ['llama_', 'main:', 'sampling', 'system_info']):
                continue
            
            # Skip empty lines at the beginning
            if not found_response and line.strip() == '':
                continue
                
            # Start collecting response
            if line.strip():
                found_response = True
                response_lines.append(line)
        
        response = '\n'.join(response_lines).strip()
        
        # If no clean response found, return a default
        if not response:
            return "I'm a BitNet AI assistant. I'm processing your request using the BitNet 1.58b GGUF model."
        
        return response

    def _fallback_response(self, prompt: str) -> tuple[str, str]:
        """Generate fallback response when BitNet inference is not available"""
        response = f"I'm a BitNet AI assistant running in fallback mode. You asked: '{prompt}'. " \
                  f"The BitNet GGUF model is not currently available for inference, but I'm here to help! " \
                  f"Please ensure the BitNet model and llama-cli binary are available."
        
        proof = self._generate_proof(prompt, response, fallback=True)
        return response, proof

    def _generate_proof(self, prompt: str, response: str, fallback: bool = False) -> str:
        """Generate a simple proof structure (mock for now)"""
        proof_data = {
            "proof_type": "fallback" if fallback else "bitnet_inference",
            "model": "BitNet-b1.58-2B-4T",
            "prompt_hash": hashlib.md5(prompt.encode()).hexdigest(),
            "response_hash": hashlib.md5(response.encode()).hexdigest(),
            "timestamp": int(time.time()),
            "zkvm": "risc0" if not fallback else "none",
            "verification": "mock_proof"
        }
        
        proof_json = json.dumps(proof_data)
        proof_base64 = base64.b64encode(proof_json.encode()).decode()
        return proof_base64

# Initialize BitNet inference
inference = BitNetInference(config)

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy" if inference.model_exists and inference.llama_cli_exists else "partial",
        "model_loaded": inference.model_exists,
        "llama_cli_ready": inference.llama_cli_exists,
        "timestamp": int(time.time())
    })

@app.route('/v1/models', methods=['GET'])
def list_models():
    """OpenAI-compatible models endpoint"""
    return jsonify({
        "object": "list",
        "data": [
            {
                "id": "bitnet-b1.58-2b",
                "object": "model",
                "created": 1699401600,
                "owned_by": "bitnet-zkml"
            }
        ]
    })

@app.route('/v1/chat/completions', methods=['POST'])
def chat_completions():
    """OpenAI-compatible chat completions endpoint"""
    try:
        data = request.get_json()
        
        # Extract request parameters
        model = data.get('model', 'bitnet-b1.58-2b')
        messages = data.get('messages', [])
        max_tokens = data.get('max_tokens', config.max_tokens)
        temperature = data.get('temperature', config.temperature)
        
        # Simple prompt extraction (concatenate messages)
        prompt = '\n'.join([f"{msg['role']}: {msg['content']}" for msg in messages])
        
        logger.info(f"Chat completion request for model: {model}")
        logger.info(f"Extracted prompt: '{prompt[:100]}{'...' if len(prompt) > 100 else ''}'")
        
        # Generate response using BitNet
        response_text, proof = inference.generate_response(prompt, max_tokens, temperature)
        
        # Create OpenAI-compatible response
        response = {
            "id": f"chatcmpl-{str(uuid.uuid4())}",
            "object": "chat.completion",
            "created": int(time.time()),
            "model": model,
            "choices": [
                {
                    "index": 0,
                    "message": {
                        "role": "assistant",
                        "content": response_text
                    },
                    "finish_reason": "stop"
                }
            ],
            "usage": {
                "prompt_tokens": len(prompt.split()),
                "completion_tokens": len(response_text.split()),
                "total_tokens": len(prompt.split()) + len(response_text.split())
            },
            "zkml_proof": proof
        }
        
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"Chat completion error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/', methods=['GET'])
def index():
    """Root endpoint with API information"""
    return jsonify({
        "name": "BitNet GGUF API Server",
        "version": "1.0.0",
        "description": "OpenAI-compatible API for BitNet GGUF models",
        "endpoints": {
            "health": "/health",
            "models": "/v1/models",
            "chat": "/v1/chat/completions"
        },
        "model_status": {
            "model_loaded": inference.model_exists,
            "llama_cli_ready": inference.llama_cli_exists
        }
    })

if __name__ == '__main__':
    logger.info("🚀 Starting BitNet GGUF API Server")
    logger.info(f"Model path: {config.model_path}")
    logger.info(f"llama-cli path: {config.llama_cli_path}")
    logger.info("📖 OpenAI-compatible endpoints:")
    logger.info("   GET  /health")
    logger.info("   GET  /v1/models")
    logger.info("   POST /v1/chat/completions")
    logger.info("")
    logger.info("🌐 Starting server on http://localhost:8936")
    
    app.run(host='0.0.0.0', port=8936, debug=False) 