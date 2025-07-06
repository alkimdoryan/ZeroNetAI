/**
 * WorldID Integration Demo for Agent Registration
 * Task 7.3: WorldID Proof Implementation
 */

import { IDKitWidget, VerificationLevel } from '@worldcoin/idkit';
import { ethers } from 'ethers';

// WorldID configuration
const WORLDID_CONFIG = {
  appId: 'app_staging_sap_protocol',
  actionId: 'register-agent-v1',
  signal: '', // Will be set to user's wallet address
  verificationLevel: VerificationLevel.Orb
};

export function WorldIDRegistration({ walletAddress, onVerificationSuccess }) {
  const handleVerify = async (proof) => {
    try {
      console.log('WorldID verification successful:', proof);
      
      // Proof structure:
      // {
      //   merkle_root: string,
      //   nullifier_hash: string,
      //   proof: string,
      //   verification_level: string
      // }
      
      // Call smart contract to register agent
      await registerAgentWithWorldID(walletAddress, proof);
      
      onVerificationSuccess(proof);
    } catch (error) {
      console.error('Agent registration failed:', error);
    }
  };

  const handleError = (error) => {
    console.error('WorldID verification failed:', error);
  };

  return (
    <div className="worldid-registration">
      <h3>Agent Registration with WorldID</h3>
      <p>Verify your unique human identity to register as an agent</p>
      
      <IDKitWidget
        app_id={WORLDID_CONFIG.appId}
        action={WORLDID_CONFIG.actionId}
        signal={walletAddress}
        onSuccess={handleVerify}
        onError={handleError}
        verification_level={WORLDID_CONFIG.verificationLevel}
        credential_types={['orb', 'device']}
      />
    </div>
  );
}

async function registerAgentWithWorldID(walletAddress, worldIdProof) {
  // Connect to Mumbai testnet
  const provider = new ethers.JsonRpcProvider('https://rpc-mumbai.maticvigil.com');
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
  // Load contract
  const agentRegistryAddress = '0x1234567890123456789012345678901234567890'; // From deployment
  const agentRegistryABI = [
    'function registerAgent(address, uint256, uint256, uint256[8]) external',
    'function isRegistered(address) external view returns (bool)',
    'function getAgentInfo(address) external view returns (tuple(bool, uint256, uint256))'
  ];
  
  const agentRegistry = new ethers.Contract(
    agentRegistryAddress,
    agentRegistryABI,
    signer
  );
  
  // Prepare WorldID proof data
  const merkleRoot = worldIdProof.merkle_root;
  const nullifierHash = worldIdProof.nullifier_hash;
  const proof = worldIdProof.proof;
  
  // Convert proof to uint256[8] format expected by contract
  const proofArray = parseWorldIDProof(proof);
  
  // Submit registration transaction
  const tx = await agentRegistry.registerAgent(
    walletAddress,
    merkleRoot,
    nullifierHash,
    proofArray
  );
  
  console.log('Registration transaction submitted:', tx.hash);
  
  // Wait for confirmation
  const receipt = await tx.wait();
  console.log('Agent registration confirmed:', receipt.transactionHash);
  
  return receipt;
}

function parseWorldIDProof(proof) {
  // Convert WorldID proof string to uint256[8] array
  // This is a simplified version - actual implementation depends on proof format
  const proofArray = new Array(8).fill(0);
  
  // Parse proof hex string into 8 uint256 values
  // Implementation details depend on WorldID proof structure
  
  return proofArray;
}

export { registerAgentWithWorldID };
