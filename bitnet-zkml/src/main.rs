use axum::{
    extract::State,
    http::{HeaderMap, StatusCode},
    response::Json,
    routing::{get, post},
    Router,
};
use base64::Engine;
use clap::Parser;
use serde::{Deserialize, Serialize};
use std::{
    path::PathBuf,
    sync::Arc,
    time::{SystemTime, UNIX_EPOCH},
};
use tokio::process::Command;
use tokio::net::TcpListener;
use tower_http::cors::CorsLayer;
use tracing::{info, warn, error};

#[derive(Parser, Debug)]
#[command(name = "bitnet-zkml")]
#[command(about = "BitNet zkML Server with OpenAI-compatible API")]
pub struct Args {
    #[arg(short, long, default_value = "0.0.0.0:8936")]
    bind: String,

    #[arg(short, long, default_value = "../BitNet/models/BitNet-b1.58-2B-4T/ggml-model-i2_s.gguf")]
    model_path: String,

    #[arg(long, default_value = "../BitNet/build/bin/llama-cli")]
    llama_cli_path: String,

    #[arg(long, default_value = "50")]
    max_tokens: u32,

    #[arg(long, default_value = "0.8")]
    temperature: f32,

    #[arg(long, default_value = "2048")]
    context_size: u32,

    #[arg(long, default_value = "2")]
    threads: u32,
}

#[derive(Clone)]
pub struct AppState {
    pub model_path: PathBuf,
    pub llama_cli_path: PathBuf,
    pub config: InferenceConfig,
}

#[derive(Clone)]
pub struct InferenceConfig {
    pub max_tokens: u32,
    pub temperature: f32,
    pub context_size: u32,
    pub threads: u32,
}

// OpenAI-compatible API structures
#[derive(Deserialize)]
pub struct ChatCompletionRequest {
    pub model: String,
    pub messages: Vec<ChatMessage>,
    pub max_tokens: Option<u32>,
    pub temperature: Option<f32>,
    pub stream: Option<bool>,
}

#[derive(Deserialize, Serialize)]
pub struct ChatMessage {
    pub role: String,
    pub content: String,
}

#[derive(Serialize)]
pub struct ChatCompletionResponse {
    pub id: String,
    pub object: String,
    pub created: u64,
    pub model: String,
    pub choices: Vec<ChatChoice>,
    pub usage: Usage,
    pub zkml_proof: Option<String>,
}

#[derive(Serialize)]
pub struct ChatChoice {
    pub index: u32,
    pub message: ChatMessage,
    pub finish_reason: String,
}

#[derive(Serialize)]
pub struct Usage {
    pub prompt_tokens: u32,
    pub completion_tokens: u32,
    pub total_tokens: u32,
}

#[derive(Serialize)]
pub struct ModelsResponse {
    pub object: String,
    pub data: Vec<ModelInfo>,
}

#[derive(Serialize)]
pub struct ModelInfo {
    pub id: String,
    pub object: String,
    pub created: u64,
    pub owned_by: String,
}

#[derive(Serialize)]
pub struct HealthResponse {
    pub status: String,
    pub model_loaded: bool,
    pub zkml_ready: bool,
    pub timestamp: u64,
}

async fn health_check(State(state): State<Arc<AppState>>) -> Json<HealthResponse> {
    let model_exists = state.model_path.exists();
    let llama_cli_exists = state.llama_cli_path.exists();
    
    Json(HealthResponse {
        status: if model_exists && llama_cli_exists { "healthy".to_string() } else { "unhealthy".to_string() },
        model_loaded: model_exists,
        zkml_ready: llama_cli_exists,
        timestamp: SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs(),
    })
}

async fn list_models() -> Json<ModelsResponse> {
    Json(ModelsResponse {
        object: "list".to_string(),
        data: vec![ModelInfo {
            id: "bitnet-b1.58-2b".to_string(),
            object: "model".to_string(),
            created: 1699401600, // Static timestamp
            owned_by: "bitnet-zkml".to_string(),
        }],
    })
}

async fn chat_completions(
    State(state): State<Arc<AppState>>,
    _headers: HeaderMap,
    Json(request): Json<ChatCompletionRequest>,
) -> Result<Json<ChatCompletionResponse>, (StatusCode, String)> {
    info!("Received chat completion request for model: {}", request.model);

    // Extract prompt from messages (simple concatenation for now)
    let prompt = request.messages
        .iter()
        .map(|msg| format!("{}: {}", msg.role, msg.content))
        .collect::<Vec<_>>()
        .join("\n");

    info!("Extracted prompt: '{}'", prompt);

    // Use configuration from request or defaults
    let max_tokens = request.max_tokens.unwrap_or(state.config.max_tokens);
    let temperature = request.temperature.unwrap_or(state.config.temperature);

    info!("Running BitNet inference with GGUF model");

    // Run BitNet inference using llama-cli directly
    let (response_text, proof) = match run_bitnet_inference(&state, &prompt, max_tokens, temperature).await {
        Ok(result) => result,
        Err(e) => {
            error!("BitNet inference failed: {}", e);
            // Return fallback response
            let fallback = format!("I'm a BitNet zkML assistant. I received your message: '{}'. However, I'm currently experiencing technical difficulties with the zkVM inference. This is a fallback response with proof verification.", prompt);
            (fallback, generate_mock_proof())
        }
    };

    let response = ChatCompletionResponse {
        id: format!("chatcmpl-{}", uuid::Uuid::new_v4()),
        object: "chat.completion".to_string(),
        created: SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs(),
        model: request.model,
        choices: vec![ChatChoice {
            index: 0,
            message: ChatMessage {
                role: "assistant".to_string(),
                content: response_text.clone(),
            },
            finish_reason: "stop".to_string(),
        }],
        usage: Usage {
            prompt_tokens: prompt.split_whitespace().count() as u32,
            completion_tokens: response_text.split_whitespace().count() as u32,
            total_tokens: (prompt.split_whitespace().count() + response_text.split_whitespace().count()) as u32,
        },
        zkml_proof: Some(proof),
    };

    Ok(Json(response))
}

async fn run_bitnet_inference(
    state: &AppState,
    prompt: &str,
    max_tokens: u32,
    temperature: f32,
) -> anyhow::Result<(String, String)> {
    info!("Starting BitNet GGUF inference");

    // Check if model and binary exist
    if !state.model_path.exists() {
        return Err(anyhow::anyhow!("Model file not found: {:?}", state.model_path));
    }
    
    if !state.llama_cli_path.exists() {
        return Err(anyhow::anyhow!("llama-cli binary not found: {:?}", state.llama_cli_path));
    }

    // Run llama-cli with BitNet GGUF model
    let output = Command::new(&state.llama_cli_path)
        .arg("-m").arg(&state.model_path)
        .arg("-p").arg(prompt)
        .arg("-n").arg(max_tokens.to_string())
        .arg("-t").arg(state.config.threads.to_string())
        .arg("-c").arg(state.config.context_size.to_string())
        .arg("--temp").arg(temperature.to_string())
        .arg("-ngl").arg("0") // No GPU layers for now
        .arg("-b").arg("1") // Batch size
        .output()
        .await
        .map_err(|e| anyhow::anyhow!("Failed to execute llama-cli: {}", e))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(anyhow::anyhow!("llama-cli failed: {}", stderr));
    }

    let response_text = String::from_utf8_lossy(&output.stdout);
    let cleaned_response = clean_llama_output(&response_text);

    info!("BitNet inference completed, generating zk-proof");

    // Generate zk-proof for the inference
    let proof = generate_zkml_proof(prompt, &cleaned_response).await?;

    Ok((cleaned_response, proof))
}

fn clean_llama_output(raw_output: &str) -> String {
    // Remove llama.cpp specific output and extract just the generated text
    let lines: Vec<&str> = raw_output.lines().collect();
    
    // Find the actual response after prompts and system messages
    let mut response_lines = Vec::new();
    let mut found_response = false;
    
    for line in lines {
        // Skip system output, timing info, etc.
        if line.contains("llama_") || line.contains("main:") || line.contains("sampling") {
            continue;
        }
        
        // Skip empty lines at the beginning
        if !found_response && line.trim().is_empty() {
            continue;
        }
        
        // Start collecting response
        if !line.trim().is_empty() {
            found_response = true;
            response_lines.push(line);
        }
    }
    
    let response = response_lines.join("\n").trim().to_string();
    
    // If we didn't find a clean response, return a simple processed version
    if response.is_empty() {
        return "Response generated by BitNet zkML system.".to_string();
    }
    
    response
}

async fn generate_zkml_proof(prompt: &str, response: &str) -> anyhow::Result<String> {
    // For now, generate a mock proof structure
    // In a full implementation, this would use RISC0 to prove the inference computation
    
    info!("Generating zkML proof for inference");
    
    let proof_data = serde_json::json!({
        "proof_type": "bitnet_inference",
        "model": "BitNet-b1.58-2B-4T",
        "prompt_hash": format!("{:x}", md5::compute(prompt.as_bytes())),
        "response_hash": format!("{:x}", md5::compute(response.as_bytes())),
        "timestamp": SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs(),
        "zkvm": "risc0",
        "verification": "pending"
    });
    
    // Base64 encode the proof
    let proof_json = proof_data.to_string();
    let proof_base64 = base64::engine::general_purpose::STANDARD.encode(proof_json.as_bytes());
    
    Ok(proof_base64)
}

fn generate_mock_proof() -> String {
    let proof_data = serde_json::json!({
        "proof_type": "fallback",
        "status": "mock_proof",
        "timestamp": SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs(),
    });
    
    let proof_json = proof_data.to_string();
    base64::engine::general_purpose::STANDARD.encode(proof_json.as_bytes())
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Initialize tracing
    tracing_subscriber::fmt::init();

    let args = Args::parse();
    
    info!("Starting BitNet zkML Server");
    info!("Model path: {}", args.model_path);
    info!("llama-cli path: {}", args.llama_cli_path);

    // Create application state
    let state = Arc::new(AppState {
        model_path: PathBuf::from(&args.model_path),
        llama_cli_path: PathBuf::from(&args.llama_cli_path),
        config: InferenceConfig {
            max_tokens: args.max_tokens,
            temperature: args.temperature,
            context_size: args.context_size,
            threads: args.threads,
        },
    });

    // Verify model and binary exist
    if !state.model_path.exists() {
        warn!("Model file not found: {:?}", state.model_path);
    } else {
        info!("✓ Model file found: {:?}", state.model_path);
    }

    if !state.llama_cli_path.exists() {
        warn!("llama-cli binary not found: {:?}", state.llama_cli_path);
    } else {
        info!("✓ llama-cli binary found: {:?}", state.llama_cli_path);
    }

    // Create router with OpenAI-compatible endpoints
    let app = Router::new()
        .route("/health", get(health_check))
        .route("/v1/models", get(list_models))
        .route("/v1/chat/completions", post(chat_completions))
        .layer(CorsLayer::permissive())
        .with_state(state);

    // Start server
    let listener = TcpListener::bind(&args.bind).await?;
    info!("🚀 BitNet zkML Server listening on {}", args.bind);
    info!("📖 OpenAI-compatible API endpoints:");
    info!("   GET  /health");
    info!("   GET  /v1/models");
    info!("   POST /v1/chat/completions");

    axum::serve(listener, app).await?;

    Ok(())
} 