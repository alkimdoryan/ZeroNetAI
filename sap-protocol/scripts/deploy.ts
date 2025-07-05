/**
 * SAP Protocol Smart Contract Deployment Script
 * Task 3.6: Deployment scripts with WorldID params & TaskBoard deploy
 */

import hre from 'hardhat';
import fs from 'fs';
import path from 'path';

const { ethers } = hre;

// WorldID configuration for different networks
const WORLD_ID_CONFIG = {
  mumbai: {
    worldIdRouter: '0x515f06B36E6D3b707eAecBdeD18d8B384944c87f', // Mumbai testnet
    appId: 'app_staging_example', // Replace with your app ID
    actionId: 'register-agent', // Replace with your action ID
  },
  polygon: {
    worldIdRouter: '0x163b09b4fE21177c455D850BD815B6D583732432', // Polygon mainnet
    appId: 'app_prod_example', // Replace with your app ID
    actionId: 'register-agent', // Replace with your action ID
  },
  localhost: {
    worldIdRouter: '0x0000000000000000000000000000000000000001', // Mock for testing
    appId: 'app_test_example',
    actionId: 'register-agent',
  },
};

interface DeploymentAddresses {
  agentRegistry: string;
  taskBoard: string;
  rewardToken: string;
  worldIdRouter: string;
  network: string;
  blockNumber: number;
  timestamp: number;
}

async function main() {
  console.log('🚀 Starting SAP Protocol deployment...\n');

  // Get network info
  const network = await ethers.provider.getNetwork();
  const networkName = network.name === 'unknown' ? 'localhost' : network.name;

  console.log(`📡 Network: ${networkName} (Chain ID: ${network.chainId})`);

  // Get signer
  const [deployer] = await ethers.getSigners();
  console.log(`👤 Deployer: ${deployer.address}`);

  // Check balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`💰 Balance: ${ethers.formatEther(balance)} ETH\n`);

  // Get WorldID config for this network
  const worldIdConfig =
    WORLD_ID_CONFIG[networkName as keyof typeof WORLD_ID_CONFIG] ||
    WORLD_ID_CONFIG.localhost;

  console.log('🌍 WorldID Configuration:');
  console.log(`   Router: ${worldIdConfig.worldIdRouter}`);
  console.log(`   App ID: ${worldIdConfig.appId}`);
  console.log(`   Action ID: ${worldIdConfig.actionId}\n`);

  // Deploy AgentRegistry
  console.log('📋 Deploying AgentRegistry...');
  const AgentRegistry = await ethers.getContractFactory('AgentRegistry');
  const agentRegistry = await AgentRegistry.deploy(
    worldIdConfig.worldIdRouter,
    worldIdConfig.appId,
    worldIdConfig.actionId
  );
  await agentRegistry.waitForDeployment();
  const agentRegistryAddress = await agentRegistry.getAddress();
  console.log(`✅ AgentRegistry deployed to: ${agentRegistryAddress}`);

  // Deploy TaskBoard
  console.log('\n📋 Deploying TaskBoard...');
  const TaskBoard = await ethers.getContractFactory('TaskBoard');
  const taskBoard = await TaskBoard.deploy(agentRegistryAddress);
  await taskBoard.waitForDeployment();
  const taskBoardAddress = await taskBoard.getAddress();
  console.log(`✅ TaskBoard deployed to: ${taskBoardAddress}`);

  // Deploy RewardToken
  console.log('\n📋 Deploying RewardToken...');
  const RewardToken = await ethers.getContractFactory('RewardToken');
  const rewardToken = await RewardToken.deploy(
    agentRegistryAddress,
    taskBoardAddress
  );
  await rewardToken.waitForDeployment();
  const rewardTokenAddress = await rewardToken.getAddress();
  console.log(`✅ RewardToken deployed to: ${rewardTokenAddress}`);

  // Get deployment info
  const blockNumber = await ethers.provider.getBlockNumber();
  const timestamp = Math.floor(Date.now() / 1000);

  const deploymentAddresses: DeploymentAddresses = {
    agentRegistry: agentRegistryAddress,
    taskBoard: taskBoardAddress,
    rewardToken: rewardTokenAddress,
    worldIdRouter: worldIdConfig.worldIdRouter,
    network: networkName,
    blockNumber,
    timestamp,
  };

  // Save deployment addresses
  const deploymentsDir = path.join(__dirname, '../deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentFile = path.join(
    deploymentsDir,
    `${networkName}-${timestamp}.json`
  );
  fs.writeFileSync(
    deploymentFile,
    JSON.stringify(deploymentAddresses, null, 2)
  );

  // Also save as latest
  const latestFile = path.join(deploymentsDir, `${networkName}-latest.json`);
  fs.writeFileSync(latestFile, JSON.stringify(deploymentAddresses, null, 2));

  console.log(`\n💾 Deployment addresses saved to: ${deploymentFile}`);

  // Export ABIs
  await exportABIs(deploymentAddresses);

  // Verify contracts on Etherscan (if not localhost)
  if (networkName !== 'localhost' && process.env.ETHERSCAN_API_KEY) {
    console.log('\n🔍 Verifying contracts on Etherscan...');
    await verifyContracts(deploymentAddresses, worldIdConfig);
  }

  console.log('\n🎉 Deployment completed successfully!');
  console.log('\n📄 Contract Addresses:');
  console.log(`   AgentRegistry: ${agentRegistryAddress}`);
  console.log(`   TaskBoard:     ${taskBoardAddress}`);
  console.log(`   RewardToken:   ${rewardTokenAddress}`);
  console.log(`   WorldID Router: ${worldIdConfig.worldIdRouter}`);
}

async function exportABIs(addresses: DeploymentAddresses) {
  console.log('\n📦 Exporting ABIs...');

  const artifactsDir = path.join(__dirname, '../artifacts');
  const exportsDir = path.join(__dirname, '../frontend/src/contracts');

  if (!fs.existsSync(exportsDir)) {
    fs.mkdirSync(exportsDir, { recursive: true });
  }

  // Contract info
  const contracts = [
    {
      name: 'AgentRegistry',
      path: 'contracts/AgentRegistry.sol/AgentRegistry.json',
      address: addresses.agentRegistry,
    },
    {
      name: 'TaskBoard',
      path: 'contracts/TaskBoard.sol/TaskBoard.json',
      address: addresses.taskBoard,
    },
    {
      name: 'RewardToken',
      path: 'contracts/RewardToken.sol/RewardToken.json',
      address: addresses.rewardToken,
    },
  ];

  const exports: Record<string, any> = {};

  for (const contract of contracts) {
    const artifactPath = path.join(artifactsDir, contract.path);

    if (fs.existsSync(artifactPath)) {
      const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));

      exports[contract.name] = {
        address: contract.address,
        abi: artifact.abi,
      };

      console.log(`✅ Exported ${contract.name} ABI`);
    } else {
      console.log(
        `⚠️  Artifact not found for ${contract.name}: ${artifactPath}`
      );
    }
  }

  // Add deployment info
  exports.deployment = addresses;

  // Save to frontend
  const exportsFile = path.join(exportsDir, 'index.ts');
  const exportsContent = `// Auto-generated contract exports
// Generated at: ${new Date().toISOString()}

export const contracts = ${JSON.stringify(exports, null, 2)} as const;

export type ContractName = keyof typeof contracts;

export default contracts;
`;

  fs.writeFileSync(exportsFile, exportsContent);
  console.log(`✅ Contract exports saved to: ${exportsFile}`);
}

async function verifyContracts(
  addresses: DeploymentAddresses,
  worldIdConfig: {
    worldIdRouter: string;
    appId: string;
    actionId: string;
  }
) {
  try {
    // Dynamic import for hardhat
    const hardhat = await import('hardhat');

    // Verify AgentRegistry
    await hardhat.run('verify:verify', {
      address: addresses.agentRegistry,
      constructorArguments: [
        worldIdConfig.worldIdRouter,
        worldIdConfig.appId,
        worldIdConfig.actionId,
      ],
    });

    // Verify TaskBoard
    await hardhat.run('verify:verify', {
      address: addresses.taskBoard,
      constructorArguments: [addresses.agentRegistry],
    });

    // Verify RewardToken
    await hardhat.run('verify:verify', {
      address: addresses.rewardToken,
      constructorArguments: [addresses.agentRegistry, addresses.taskBoard],
    });

    console.log('✅ All contracts verified successfully');
  } catch (error) {
    console.log('⚠️  Contract verification failed:', error);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run the deployment
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { main as deployContracts };
export type { DeploymentAddresses };
