# SAP Protocol

Sovereign Agent Protocol - A decentralized protocol for zkVM-ready BitNet LLM agents with WorldID integration and workflow orchestration.

## Project Overview

SAP Protocol combines:

- **zkVM-Ready BitNet LLM Agent**: AI agents running in zero-knowledge virtual machines
- **WorldID Integration**: Sybil-resistant agent registration using Worldcoin's World ID
- **Smart Contract TaskBoard**: Decentralized task management and reward system
- **Workflow Orchestrator**: n8n-style workflow engine for complex multi-step processes
- **React Frontend**: Modern web interface for agent management and task execution

## Architecture

```
sap-protocol/
├── frontend/          # React + Vite + Wagmi frontend
├── contracts/         # Smart contracts (WorldID + TaskBoard)
├── agent/            # zkVM-ready BitNet LLM implementation
├── workflow/         # n8n-style workflow orchestrator
├── scripts/          # Deployment and utility scripts
└── docs/             # Documentation
```

## Features

### 🤖 AI Agent System

- BitNet LLM inference in zkVM environment
- Cryptographic proof generation for agent outputs
- Performance optimized for blockchain integration

### 🌍 WorldID Integration

- Sybil-resistant agent registration
- One-agent-per-person guarantee
- Privacy-preserving identity verification

### 📋 Task Management

- Decentralized task board
- Automated reward distribution
- Performance tracking and scoring

### 🔄 Workflow Orchestration

- Visual workflow designer
- Conditional logic and branching
- Integration with blockchain and external APIs

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm or yarn
- Git

### Installation

1. Clone the repository

```bash
git clone <repository-url>
cd sap-protocol
```

2. Install dependencies

```bash
pnpm install
```

3. Set up environment variables

```bash
cp .env.example .env
```

4. Run the development server

```bash
pnpm dev
```

## Development Phases

The project is developed in 9 phases:

1. **Project Structure Setup** ✅
2. **Agent (zkVM-Ready BitNet LLM)** 🔄
3. **Smart Contracts (WorldID + TaskBoard)** 📋
4. **Frontend (React + Vite + Wagmi + WorldID + API)** 📋
5. **Workflow Orchestrator (n8n-Style)** 📋
6. **Agent ↔ Chain Integration** 📋
7. **Testnet & Demo** 📋
8. **Presentation & Pitch** 📋
9. **Post-V1 Development** 📋

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.

## Roadmap

### V1 (Current)

- Single agent workflows
- Basic WorldID integration
- Simple task management

### V2 (Future)

- Multi-agent workflows
- Advanced workflow conditions
- On-chain workflow storage
- Agent marketplace

## Support

For questions and support, please open an issue in the GitHub repository.
