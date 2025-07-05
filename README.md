# ZeroNetAI - SAP Protocol (Sovereign Agent Protocol)

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=flat&logo=react&logoColor=%2361DAFB)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=flat&logo=typescript&logoColor=white)
![Solidity](https://img.shields.io/badge/Solidity-%23363636.svg?style=flat&logo=solidity&logoColor=white)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=flat&logo=vite&logoColor=white)

## 🚀 Overview

ZeroNetAI is a revolutionary **Sovereign Agent Protocol (SAP)** that combines zkVM-ready BitNet LLM agents with WorldID integration and an intuitive n8n-style workflow designer. This protocol enables decentralized autonomous agents to execute complex tasks while maintaining privacy and security through zero-knowledge proofs.

## ✨ Key Features

### 🤖 BitNet LLM Agents
- **zkVM-Ready**: Agents run in zero-knowledge virtual machines for privacy
- **BitNet Integration**: Optimized for efficient LLM inference
- **WorldID Authentication**: Secure identity verification for agents
- **Task Execution**: Automated problem-solving with configurable parameters

### 🔧 Workflow Designer
- **Drag & Drop Interface**: n8n-style visual workflow builder
- **14 Node Types**: Comprehensive set of workflow components
- **Real-time Execution**: Live workflow monitoring and debugging
- **Multi-layer Support**: Organize workflows with layer management
- **Custom Nodes**: Create and share custom workflow components

### 🔐 Blockchain Integration
- **Smart Contracts**: Solidity contracts for agent registry and task management
- **WorldID Integration**: Decentralized identity verification
- **Reward System**: Token-based incentive mechanism
- **Multi-chain Support**: Built for Polygon and other EVM chains

## 🏗️ Architecture

```
ZeroNetAI/
├── sap-protocol/
│   ├── frontend/          # React + TypeScript frontend
│   ├── contracts/         # Solidity smart contracts
│   ├── agent/            # BitNet LLM agent infrastructure
│   ├── workflow/         # Workflow engine and node types
│   └── scripts/          # Deployment and utility scripts
├── sap_phases.yaml       # Development roadmap
└── README.md            # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm or npm
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/alkimdoryan/ZeroNetAI.git
   cd ZeroNetAI
   ```

2. **Install dependencies**
   ```bash
   cd sap-protocol/frontend
   pnpm install
   ```

3. **Start the development server**
   ```bash
   pnpm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

### Smart Contract Deployment

1. **Navigate to contracts directory**
   ```bash
   cd sap-protocol/contracts
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Deploy to testnet**
   ```bash
   npx hardhat run scripts/deploy.ts --network mumbai
   ```

## 🎯 Core Components

### Frontend Application
- **Dashboard**: Overview of agents, tasks, and workflows
- **Agent Registration**: WorldID-protected agent creation
- **Task Board**: Decentralized task marketplace
- **Workflow Designer**: Visual workflow builder with 14 node types
- **Agent Profile**: Agent statistics and performance metrics

### Workflow Nodes
1. **Trigger Node** - Workflow initiation
2. **Agent Node** - BitNet LLM execution
3. **HTTP Request Node** - API integrations
4. **Database Node** - Data operations
5. **Condition Node** - Conditional branching
6. **Loop Node** - Iterative processing
7. **Transform Node** - Data transformation
8. **Email Node** - Communication
9. **Delay Node** - Timing control
10. **Error Handler Node** - Error management
11. **Custom Function Node** - JavaScript execution
12. **Notification Node** - Multi-channel alerts
13. **Chain Submit Node** - Blockchain operations
14. **Connector Node** - System integrations

### Smart Contracts
- **AgentRegistry.sol**: Agent registration and management
- **TaskBoard.sol**: Decentralized task marketplace
- **RewardToken.sol**: Token rewards and incentives
- **WorldID Integration**: Identity verification

## 🔧 Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS
- **Blockchain**: Solidity, Hardhat, Ethers.js, Wagmi
- **UI/UX**: React Flow, Lucide React, Framer Motion
- **Identity**: WorldID, zkVM integration
- **AI/ML**: BitNet LLM, zkVM-ready inference
- **Package Manager**: pnpm

## 📊 Development Phases

The project follows a comprehensive 9-phase development roadmap:

1. **Phase 1**: Project Structure Setup ✅
2. **Phase 2**: Agent (zkVM-Ready BitNet LLM) ✅
3. **Phase 3**: Smart Contracts (WorldID + TaskBoard) ✅
4. **Phase 4**: Frontend (React + Vite + Wagmi) ✅
5. **Phase 5**: Workflow Orchestrator (n8n-Style) ✅
6. **Phase 6**: Agent ↔ Chain Integration 🔄
7. **Phase 7**: Testnet & Demo 🔄
8. **Phase 8**: Presentation & Pitch 🔄
9. **Phase 9**: Post-V1 Development 🔄

## 🤝 Contributing

We welcome contributions from the community! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Repository**: [https://github.com/alkimdoryan/ZeroNetAI](https://github.com/alkimdoryan/ZeroNetAI)
- **Documentation**: Coming soon
- **Demo**: Coming soon
- **Discord**: Coming soon

## 🚧 Roadmap

### V1.0 (Current)
- [x] Basic agent infrastructure
- [x] Smart contract deployment
- [x] Frontend application
- [x] Workflow designer
- [x] WorldID integration

### V2.0 (Upcoming)
- [ ] Multi-agent workflows
- [ ] Advanced zkVM integration
- [ ] Cross-chain support
- [ ] Agent marketplace
- [ ] Advanced analytics

## 📞 Support

For support, please:
1. Check existing [Issues](https://github.com/alkimdoryan/ZeroNetAI/issues)
2. Create a new issue if needed
3. Join our community discussions

---

**Made with ❤️ by the ZeroNetAI Team** 