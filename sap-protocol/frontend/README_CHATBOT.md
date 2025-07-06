# zkVM LLM Chatbot Documentation

## Overview
SAP Protocol now includes a powerful zkVM-powered LLM chatbot interface that provides cryptographically verified AI assistance. The chatbot leverages BitNet architecture running on zero-knowledge virtual machines.

## Features

### 🤖 AI Chat Interface
- **zkVM-Powered**: All LLM computations run on zero-knowledge virtual machines
- **BitNet Architecture**: Efficient 1-bit quantized neural networks
- **Cryptographic Proofs**: Every response includes zkVM proof of computation
- **Streaming Responses**: Real-time message streaming for better UX

### 🎨 UI Design
- **Consistent Design**: Uses the same color palette and design system as the main application
- **Responsive Layout**: Works on all screen sizes
- **Sidebar Navigation**: Session management and chat history
- **Modern Interface**: Glass morphism effects and smooth animations

### 💬 Chat Features
- **Multi-Session Support**: Create and manage multiple chat sessions
- **Message History**: Persistent conversation history
- **Copy Messages**: Easy message copying functionality
- **Status Indicators**: Real-time connection and computation status
- **Keyboard Shortcuts**: Enhanced typing experience

### ⚙️ Configuration
- **Model Selection**: Choose from various BitNet models
- **Temperature Control**: Adjust response creativity
- **Token Limits**: Configure maximum response length
- **Endpoint Configuration**: Custom zkVM endpoint settings
- **Proof Generation**: Toggle zkVM proof generation

## Usage

### Starting a Chat
1. Connect your wallet
2. Navigate to the "zkVM Chat" tab
3. Type your message and press Enter
4. Watch as the AI responds with cryptographically verified answers

### Managing Sessions
- Click the "+" button to create new chat sessions
- Switch between sessions using the sidebar
- Each session maintains its own conversation history

### Configuring Settings
- Click the "Settings" button to open configuration
- Adjust model parameters, endpoints, and proof settings
- Test connection status with the built-in health check

## Technical Details

### zkVM Integration
The chatbot integrates with zkVM infrastructure through:
- **REST API**: Standard HTTP endpoints for chat and streaming
- **WebSocket Support**: Real-time bidirectional communication
- **Proof Verification**: Cryptographic verification of all responses
- **Gas Tracking**: Monitor computation costs

### Supported Models
- **BitNet B1.58 Large**: Most capable model
- **BitNet B1.58 Base**: Balanced performance
- **BitNet 1B**: Lightweight option
- **BitNet 3B**: High-performance option

### API Endpoints
```
GET  /api/llm/health          - Health check
POST /api/llm/chat            - Send message
POST /api/llm/chat/stream     - Streaming chat
POST /api/llm/verify          - Verify proof
```

## Development Setup

### Environment Configuration
Create a `.env.local` file in the frontend directory:
```bash
# zkVM LLM Configuration
VITE_ZKVM_ENDPOINT=http://localhost:8080/api/llm
VITE_DEV_MODE=true
VITE_API_TIMEOUT=30000
VITE_ENABLE_STREAMING=true
```

### Running the Application
```bash
# Start the frontend
cd sap-protocol/frontend
npm run dev

# The chatbot will be available at http://localhost:5173
# Navigate to the "zkVM Chat" tab
```

### Mock Server (Development)
For development without a real zkVM endpoint, the service includes:
- **Fallback Responses**: Simulated AI responses
- **Mock Proofs**: Placeholder zkVM proofs
- **Error Handling**: Graceful degradation
- **Connection Testing**: Endpoint validation

## Color Palette
The chatbot uses the same design system as the main application:
- **Primary**: Blue gradient (#3b82f6 to #2563eb)
- **Secondary**: Purple accents (#8b5cf6 to #7c3aed)
- **Success**: Green (#22c55e)
- **Warning**: Orange (#f59e0b)
- **Error**: Red (#ef4444)

## Architecture

### Component Structure
```
LLMChatbot/
├── Main Chat Interface
├── Sidebar (Sessions)
├── Message Area
├── Input Controls
├── Settings Modal
└── Status Indicators
```

### State Management
- **Local State**: React hooks for UI state
- **Session Storage**: Chat history persistence
- **Global Config**: LLM parameters and settings
- **Connection State**: Real-time status tracking

### Error Handling
- **Connection Errors**: Graceful fallback to offline mode
- **API Errors**: User-friendly error messages
- **Validation**: Input sanitization and validation
- **Recovery**: Automatic retry mechanisms

## Security

### zkVM Proofs
- **Computation Verification**: Every response includes cryptographic proof
- **Privacy Protection**: Zero-knowledge execution
- **Integrity Guarantees**: Tamper-evident results
- **Audit Trail**: Complete computation history

### Data Protection
- **Local Storage**: Conversations stored locally
- **No Server Logs**: Messages not permanently stored
- **Encrypted Transport**: HTTPS/WSS only
- **Access Control**: Wallet-based authentication

## Performance

### Optimization Features
- **Streaming**: Real-time response chunks
- **Caching**: Response caching where appropriate
- **Compression**: Efficient data transfer
- **Lazy Loading**: On-demand resource loading

### Monitoring
- **Connection Status**: Real-time endpoint health
- **Response Times**: Latency tracking
- **Gas Usage**: Computation cost monitoring
- **Error Rates**: Failure tracking

## Future Enhancements

### Planned Features
- **Voice Chat**: Speech-to-text and text-to-speech
- **File Upload**: Document analysis and processing
- **Code Execution**: Secure code evaluation
- **Multi-Modal**: Image and video processing
- **Workflow Integration**: Chat-driven workflow creation

### Technical Improvements
- **Offline Mode**: Local model inference
- **Better Caching**: Intelligent response caching
- **Performance Metrics**: Advanced analytics
- **Custom Models**: User-trained model support

## Support

For issues or questions regarding the zkVM LLM chatbot:
1. Check the connection status indicator
2. Verify your zkVM endpoint configuration
3. Review the browser console for error messages
4. Test with the built-in health check feature

## License

This chatbot feature is part of the SAP Protocol and follows the same licensing terms as the main project. 