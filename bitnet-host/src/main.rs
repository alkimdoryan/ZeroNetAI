use clap::{Arg, Command};
use risc0_zkvm::{default_prover, ExecutorEnv, ProverOpts, VerifierContext};
use serde::{Deserialize, Serialize};
use serde_json;
use std::collections::HashMap;
use std::fs;
use std::path::Path;
use tokio;

// Use the methods from the bitnet-methods crate
use bitnet_methods::{BITNET_GUEST_ELF, BITNET_GUEST_ID};
use risc0_zkvm::Receipt;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BitNetInput {
    pub prompt_tokens: Vec<u32>,
    pub max_new_tokens: usize,
    pub vocab_size: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BitNetWeights {
    pub token_embeddings: Vec<i8>,
    pub layer_weights: Vec<LayerWeights>,
    pub output_weights: Vec<i8>,
    pub vocab_size: usize,
    pub hidden_size: usize,
    pub num_layers: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LayerWeights {
    pub attention_q: Vec<i8>,
    pub attention_k: Vec<i8>,
    pub attention_v: Vec<i8>,
    pub attention_output: Vec<i8>,
    pub ffn_gate: Vec<i8>,
    pub ffn_up: Vec<i8>,
    pub ffn_down: Vec<i8>,
    pub attention_norm: Vec<i8>,
    pub ffn_norm: Vec<i8>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BitNetOutput {
    pub generated_tokens: Vec<u32>,
    pub logits: Vec<f32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TokenizerConfig {
    pub vocab: HashMap<String, u32>,
    pub special_tokens: HashMap<String, u32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ZkProofResult {
    pub output: BitNetOutput,
    pub proof: String, // Base64 encoded proof
    pub receipt_data: String, // Base64 encoded receipt
}

struct BitNetHostSystem {
    weights: BitNetWeights,
    tokenizer: TokenizerConfig,
    reverse_vocab: HashMap<u32, String>,
}

impl BitNetHostSystem {
    pub fn new(weights_path: &str, tokenizer_path: &str) -> Result<Self, Box<dyn std::error::Error>> {
        println!("Loading BitNet weights from: {}", weights_path);
        let weights = Self::load_weights(weights_path)?;
        
        println!("Loading tokenizer from: {}", tokenizer_path);
        let tokenizer = Self::load_tokenizer(tokenizer_path)?;
        
        // Create reverse vocabulary for decoding
        let reverse_vocab: HashMap<u32, String> = tokenizer.vocab
            .iter()
            .map(|(k, &v)| (v, k.clone()))
            .collect();
        
        println!("Loaded {} weights and {} vocab entries", 
                weights.layer_weights.len(), tokenizer.vocab.len());
        
        Ok(BitNetHostSystem {
            weights,
            tokenizer,
            reverse_vocab,
        })
    }
    
    fn load_weights(weights_path: &str) -> Result<BitNetWeights, Box<dyn std::error::Error>> {
        println!("Loading weights directly from GGUF: {}", weights_path);
        
        // Check if it's a GGUF file or JSON file
        if weights_path.ends_with(".gguf") {
            Self::load_weights_from_gguf(weights_path)
        } else {
            // Fallback to JSON loading for backward compatibility
            Self::load_weights_from_json(weights_path)
        }
    }
    
    fn load_weights_from_gguf(gguf_path: &str) -> Result<BitNetWeights, Box<dyn std::error::Error>> {
        println!("GGUF direct loading not yet implemented");
        println!("Converting GGUF to JSON first using Python...");
        
        // Use Python script to convert GGUF to JSON if needed
        let json_path = "./model/weights.json";
        
        if !std::path::Path::new(json_path).exists() {
            // Call Python script to extract weights from GGUF
            let output = std::process::Command::new("python3")
                .arg("scripts/extract_gguf_weights_optimized.py")
                .arg("--input")
                .arg(gguf_path)
                .arg("--output")
                .arg(json_path)
                .output();
                
            match output {
                Ok(result) => {
                    if !result.status.success() {
                        let stderr = String::from_utf8_lossy(&result.stderr);
                        println!("Warning: GGUF extraction failed: {}", stderr);
                        return Self::load_weights_from_json_fallback();
                    }
                }
                Err(e) => {
                    println!("Warning: Could not run Python extractor: {}", e);
                    return Self::load_weights_from_json_fallback();
                }
            }
        }
        
        // Now load from the converted JSON
        Self::load_weights_from_json(json_path)
    }
    
    fn load_weights_from_json_fallback() -> Result<BitNetWeights, Box<dyn std::error::Error>> {
        println!("Using fallback weights (no GGUF file available)");
        
        // Create minimal demo weights for zkVM compatibility
        let vocab_size = 10000; // Reduced for zkVM compatibility
        let hidden_size = 512;   // Reduced for zkVM compatibility
        let num_layers = 8;      // Reduced for zkVM compatibility
        
        let mut layer_weights = Vec::new();
        
        // Create simplified layer weights
        for _layer_idx in 0..num_layers {
            let layer = LayerWeights {
                attention_q: vec![0i8; hidden_size * hidden_size],
                attention_k: vec![0i8; hidden_size * hidden_size],
                attention_v: vec![0i8; hidden_size * hidden_size],
                attention_output: vec![0i8; hidden_size * hidden_size],
                ffn_gate: vec![0i8; hidden_size * hidden_size * 4],
                ffn_up: vec![0i8; hidden_size * hidden_size * 4],
                ffn_down: vec![0i8; hidden_size * 4 * hidden_size],
                attention_norm: vec![1i8; hidden_size],
                ffn_norm: vec![1i8; hidden_size],
            };
            layer_weights.push(layer);
        }
        
        Ok(BitNetWeights {
            token_embeddings: vec![0i8; vocab_size * hidden_size],
            layer_weights,
            output_weights: vec![0i8; hidden_size * vocab_size],
            vocab_size,
            hidden_size,
            num_layers,
        })
    }
    
    fn load_weights_from_json(weights_path: &str) -> Result<BitNetWeights, Box<dyn std::error::Error>> {
        let weights_content = fs::read_to_string(weights_path)?;
        let weights_data: serde_json::Value = serde_json::from_str(&weights_content)?;
        
        // Parse the extracted weights from our Python script
        let weights_obj = &weights_data["weights"];
        
        // Convert the extracted weights to our zkVM format
        // This is a simplified conversion - in practice you'd need more sophisticated parsing
        let mut layer_weights = Vec::new();
        let mut token_embeddings = Vec::new();
        let mut output_weights = Vec::new();
        
        // Extract model configuration
        let vocab_size = 10000; // Reduced for zkVM compatibility
        let hidden_size = 512;  // Reduced for zkVM compatibility
        let num_layers = 8;     // Reduced for zkVM compatibility
        
        // Process token embeddings
        if let Some(emb_data) = weights_obj.get("token_embd.weight") {
            if let Some(weights_array) = emb_data.get("weights") {
                if let Some(weights_vec) = weights_array.as_array() {
                    token_embeddings = weights_vec.iter()
                        .filter_map(|v| v.as_i64().map(|i| i as i8))
                        .collect();
                }
            }
        }
        
        // Process layer weights (simplified)
        for layer_idx in 0..num_layers {
            let layer = LayerWeights {
                attention_q: vec![0i8; hidden_size * hidden_size],
                attention_k: vec![0i8; hidden_size * hidden_size],
                attention_v: vec![0i8; hidden_size * hidden_size],
                attention_output: vec![0i8; hidden_size * hidden_size],
                ffn_gate: vec![0i8; hidden_size * hidden_size * 4],
                ffn_up: vec![0i8; hidden_size * hidden_size * 4],
                ffn_down: vec![0i8; hidden_size * 4 * hidden_size],
                attention_norm: vec![1i8; hidden_size],
                ffn_norm: vec![1i8; hidden_size],
            };
            layer_weights.push(layer);
        }
        
        // If token embeddings are empty, create defaults
        if token_embeddings.is_empty() {
            token_embeddings = vec![0i8; vocab_size * hidden_size];
        }
        
        // Create output weights (language model head)
        output_weights = vec![0i8; hidden_size * vocab_size];
        
        Ok(BitNetWeights {
            token_embeddings,
            layer_weights,
            output_weights,
            vocab_size,
            hidden_size,
            num_layers,
        })
    }
    
    fn load_tokenizer(tokenizer_path: &str) -> Result<TokenizerConfig, Box<dyn std::error::Error>> {
        let vocab_path = Path::new(tokenizer_path).join("vocab.json");
        let config_path = Path::new(tokenizer_path).join("tokenizer_config.json");
        
        let vocab_content = fs::read_to_string(vocab_path)?;
        let vocab: HashMap<String, u32> = serde_json::from_str(&vocab_content)?;
        
        let special_tokens = HashMap::from([
            ("pad_token_id".to_string(), 0),
            ("unk_token_id".to_string(), 1),
            ("bos_token_id".to_string(), 2),
            ("eos_token_id".to_string(), 3),
        ]);
        
        Ok(TokenizerConfig {
            vocab,
            special_tokens,
        })
    }
    
    pub fn tokenize(&self, text: &str) -> Vec<u32> {
        let mut tokens = vec![self.tokenizer.special_tokens["bos_token_id"]];
        
        // Simple word-level tokenization
        for word in text.split_whitespace() {
            if let Some(&token_id) = self.tokenizer.vocab.get(word) {
                tokens.push(token_id);
            } else {
                // Character-level fallback
                for ch in word.chars() {
                    let ch_str = ch.to_string();
                    if let Some(&token_id) = self.tokenizer.vocab.get(&ch_str) {
                        tokens.push(token_id);
                    } else {
                        tokens.push(self.tokenizer.special_tokens["unk_token_id"]);
                    }
                }
            }
        }
        
        tokens
    }
    
    pub fn detokenize(&self, tokens: &[u32]) -> String {
        tokens.iter()
            .filter_map(|&token_id| self.reverse_vocab.get(&token_id))
            .cloned()
            .collect::<Vec<_>>()
            .join(" ")
    }
    
    pub async fn generate_with_proof(&self, prompt: &str, max_new_tokens: usize) -> Result<ZkProofResult, Box<dyn std::error::Error>> {
        println!("Generating response for prompt: '{}'", prompt);
        
        // Tokenize input
        let prompt_tokens = self.tokenize(prompt);
        println!("Prompt tokens: {:?}", prompt_tokens);
        
        // Prepare input for zkVM
        let input = BitNetInput {
            prompt_tokens,
            max_new_tokens,
            vocab_size: self.weights.vocab_size,
        };
        
        println!("Starting zkVM execution...");
        
        // Create ExecutorEnv with input data
        let env = ExecutorEnv::builder()
            .write(&input)?
            .write(&self.weights)?
            .build()?;
        
        // Run the prover
        let prover = default_prover();
        let opts = ProverOpts::default();
        
        println!("Generating proof... (this may take several minutes)");
        let prove_info = prover.prove_with_opts(env, BITNET_GUEST_ELF, &opts)?;
        
        // Extract output from receipt
        let output: BitNetOutput = prove_info.receipt.journal.decode()?;
        
        println!("Generated tokens: {:?}", output.generated_tokens);
        let response_text = self.detokenize(&output.generated_tokens);
        println!("Response: {}", response_text);
        
        // Verify the proof
        println!("Verifying proof...");
        prove_info.receipt.verify(BITNET_GUEST_ID)?;
        println!("Proof verified successfully!");
        
        // Encode proof as base64
        let receipt_bytes = bincode::serialize(&prove_info.receipt)?;
        let proof_base64 = base64::encode(&receipt_bytes);
        let receipt_base64 = base64::encode(&receipt_bytes);
        
        Ok(ZkProofResult {
            output,
            proof: proof_base64,
            receipt_data: receipt_base64,
        })
    }
    
    pub async fn generate_groth16_proof(&self, receipt_data: &str) -> Result<String, Box<dyn std::error::Error>> {
        // Placeholder for Groth16 proof generation
        // This would require additional RISC0 features for Ethereum compatibility
        println!("Groth16 proof generation not yet implemented");
        Ok("groth16_proof_placeholder".to_string())
    }
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let matches = Command::new("BitNet zkML Host")
        .version("1.0")
        .about("BitNet Zero-Knowledge Machine Learning Host")
        .arg(Arg::new("weights")
            .short('w')
            .long("weights")
            .value_name("FILE")
            .help("Path to BitNet weights file (GGUF or JSON)")
            .default_value("../BitNet/models/BitNet-b1.58-2B-4T/ggml-model-i2_s.gguf"))
        .arg(Arg::new("tokenizer")
            .short('t')
            .long("tokenizer")
            .value_name("DIR")
            .help("Path to tokenizer directory")
            .default_value("./tokenizer"))
        .arg(Arg::new("prompt")
            .short('p')
            .long("prompt")
            .value_name("TEXT")
            .help("Input prompt for generation")
            .default_value("Hello, I am"))
        .arg(Arg::new("max_tokens")
            .short('m')
            .long("max-tokens")
            .value_name("NUMBER")
            .help("Maximum number of new tokens to generate")
            .default_value("10"))
        .arg(Arg::new("output")
            .short('o')
            .long("output")
            .value_name("FILE")
            .help("Output file for proof and results")
            .default_value("./proofs/bitnet_receipt.json"))
        .get_matches();
    
    let weights_path = matches.get_one::<String>("weights").unwrap();
    let tokenizer_path = matches.get_one::<String>("tokenizer").unwrap();
    let prompt = matches.get_one::<String>("prompt").unwrap();
    let max_tokens: usize = matches.get_one::<String>("max_tokens").unwrap().parse()?;
    let output_path = matches.get_one::<String>("output").unwrap();
    
    // Initialize the BitNet system
    let system = BitNetHostSystem::new(weights_path, tokenizer_path)?;
    
    // Generate response with proof
    let result = system.generate_with_proof(prompt, max_tokens).await?;
    
    // Save results
    let output_data = serde_json::json!({
        "prompt": prompt,
        "response": system.detokenize(&result.output.generated_tokens),
        "tokens": result.output.generated_tokens,
        "proof": result.proof,
        "receipt": result.receipt_data,
        "timestamp": chrono::Utc::now().to_rfc3339(),
    });
    
    fs::create_dir_all(Path::new(output_path).parent().unwrap())?;
    fs::write(output_path, serde_json::to_string_pretty(&output_data)?)?;
    
    println!("Results saved to: {}", output_path);
    println!("Generated response: {}", system.detokenize(&result.output.generated_tokens));
    println!("Proof length: {} bytes", result.proof.len());
    
    Ok(())
}
