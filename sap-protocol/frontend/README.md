# SAP Protocol Frontend

This is the frontend application for SAP Protocol (Sovereign Agent Protocol) built with React + TypeScript + Vite.

## Features

- **Agent Registration**: Register and manage zkVM-powered agents
- **Task Management**: Submit and track tasks through the TaskBoard
- **Workflow Designer**: Create complex automation workflows with visual node editor
- **AI Assistant**: Intelligent chatbot powered by LLM APIs for protocol guidance
- **Profile Management**: View agent profiles and statistics
- **WorldID Integration**: Secure identity verification (with bypass mode for development)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or pnpm
- Wallet (MetaMask recommended)

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Environment Variables

Create a `.env` file in the frontend directory:

```bash
# LLM API Keys (optional - app works with mock responses)
VITE_OPENAI_API_KEY=your_openai_api_key_here
VITE_ANTHROPIC_API_KEY=your_anthropic_api_key_here
VITE_LOCAL_LLM_URL=http://localhost:11434/v1

# Wallet Connect
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id

# RPC URLs
VITE_INFURA_API_KEY=your_infura_api_key
VITE_ALCHEMY_API_KEY=your_alchemy_api_key
```

## AI Assistant

The AI Assistant tab provides intelligent help for SAP Protocol users:

### Features
- **Multiple Modes**: General, Agent, Workflow, and Technical assistance
- **Real-time Chat**: Interactive conversation with LLM models
- **Smart Responses**: Context-aware answers about protocol features
- **Quick Prompts**: Pre-built questions to get started
- **Message History**: Full conversation tracking
- **Copy & Share**: Easy message copying functionality

### Supported LLM Providers
- **OpenAI**: GPT-3.5-turbo, GPT-4 (requires API key)
- **Anthropic**: Claude-3-sonnet (requires API key)
- **Local LLM**: Ollama or custom endpoints
- **Mock Mode**: Works without API keys for demonstration

### Usage
1. Connect your wallet
2. Navigate to the "AI Assistant" tab
3. Select an assistance mode (General, Agent, Workflow, Technical)
4. Ask questions about:
   - Agent registration and setup
   - Workflow creation and design
   - Task submission and tracking
   - Technical implementation details
   - Smart contract interactions

## Architecture

### Components
- `Dashboard.tsx`: Main application container with tab navigation
- `ChatBot.tsx`: LLM-powered AI assistant interface
- `AgentRegistration.tsx`: Agent registration and management
- `TaskBoard.tsx`: Task submission and tracking
- `WorkflowDesignerPro.tsx`: Visual workflow editor
- `AgentProfile.tsx`: Agent statistics and profile

### Hooks
- `useLLM.ts`: Custom hook for LLM API integration with multiple providers

### Configuration
- `contracts.ts`: Smart contract addresses and LLM configuration
- `wagmi.ts`: Wallet and blockchain configuration

## Development

### ESLint Configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

### React-specific lint rules

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x';
import reactDom from 'eslint-plugin-react-dom';

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
