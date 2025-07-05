/**
 * SAP Protocol Simple Deployment Script
 * Task 3.6: Basic deployment script
 */

const hre = require('hardhat');
const fs = require('fs');
const path = require('path');

// WorldID configuration for different networks
const WORLD_ID_CONFIG = {
  mumbai: {
    worldIdRouter: '0x515f06B36E6D3b707eAecBdeD18d8B384944c87f',
    appId: 'app_staging_example',
    actionId: 'register-agent',
  },
  polygon: {
    worldIdRouter: '0x163b09b4fE21177c455D850BD815B6D583732432',
    appId: 'app_prod_example',
    actionId: 'register-agent',
  },
  localhost: {
    worldIdRouter: '0x0000000000000000000000000000000000000001',
    appId: 'app_test_example',
    actionId: 'register-agent',
  },
};

async function main() {
  console.log('🚀 Starting SAP Protocol deployment...\n');

  // Get network info
  const network = await hre.ethers.provider.getNetwork();
  const networkName = network.name === 'unknown' ? 'localhost' : network.name;

  console.log(`📡 Network: ${networkName} (Chain ID: ${network.chainId})`);

  // Get signer
  const [deployer] = await hre.ethers.getSigners();
  console.log(`👤 Deployer: ${deployer.address}`);

  // Check balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`💰 Balance: ${hre.ethers.formatEther(balance)} ETH\n`);

  // Get WorldID config for this network
  const worldIdConfig =
    WORLD_ID_CONFIG[networkName] || WORLD_ID_CONFIG.localhost;

  console.log('🌍 WorldID Configuration:');
  console.log(`   Router: ${worldIdConfig.worldIdRouter}`);
  console.log(`   App ID: ${worldIdConfig.appId}`);
  console.log(`   Action ID: ${worldIdConfig.actionId}\n`);

  // Deploy AgentRegistry
  console.log('📋 Deploying AgentRegistry...');
  const AgentRegistry = await hre.ethers.getContractFactory('AgentRegistry');
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
  const TaskBoard = await hre.ethers.getContractFactory('TaskBoard');
  const taskBoard = await TaskBoard.deploy(agentRegistryAddress);
  await taskBoard.waitForDeployment();
  const taskBoardAddress = await taskBoard.getAddress();
  console.log(`✅ TaskBoard deployed to: ${taskBoardAddress}`);

  // Deploy RewardToken
  console.log('\n📋 Deploying RewardToken...');
  const RewardToken = await hre.ethers.getContractFactory('RewardToken');
  const rewardToken = await RewardToken.deploy(
    agentRegistryAddress,
    taskBoardAddress
  );
  await rewardToken.waitForDeployment();
  const rewardTokenAddress = await rewardToken.getAddress();
  console.log(`✅ RewardToken deployed to: ${rewardTokenAddress}`);

  // Get deployment info
  const blockNumber = await hre.ethers.provider.getBlockNumber();
  const timestamp = Math.floor(Date.now() / 1000);

  const deploymentAddresses = {
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

  console.log('\n🎉 Deployment completed successfully!');
  console.log('\n📄 Contract Addresses:');
  console.log(`   AgentRegistry: ${agentRegistryAddress}`);
  console.log(`   TaskBoard:     ${taskBoardAddress}`);
  console.log(`   RewardToken:   ${rewardTokenAddress}`);
  console.log(`   WorldID Router: ${worldIdConfig.worldIdRouter}`);
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

module.exports = { main };
