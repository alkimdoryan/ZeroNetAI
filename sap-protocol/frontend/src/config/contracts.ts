import type { Address } from 'viem';
import { polygon, polygonMumbai } from 'wagmi/chains';

type ContractConfig = {
  agentRegistry: Address;
  taskBoard: Address;
  rewardToken: Address;
};

export const contracts: Record<number, ContractConfig> = {
  [polygonMumbai.id]: {
    agentRegistry: '0x0000000000000000000000000000000000000000' as Address,
    taskBoard: '0x0000000000000000000000000000000000000000' as Address,
    rewardToken: '0x0000000000000000000000000000000000000000' as Address,
  },
  [polygon.id]: {
    agentRegistry: '0x0000000000000000000000000000000000000000' as Address,
    taskBoard: '0x0000000000000000000000000000000000000000' as Address,
    rewardToken: '0x0000000000000000000000000000000000000000' as Address,
  },
};

export const getContractAddress = (
  chainId: number,
  contractName: keyof ContractConfig
) => {
  return contracts[chainId]?.[contractName];
};

// WorldID Configuration - Demo environment
export const WORLDID_APP_ID = 'app_staging_4c8b2f9d3a1e7f6a'; // Demo app ID for development
export const WORLDID_ACTION_REGISTER = 'register-agent';
export const WORLDID_ACTION_CREATE_NODE = 'create-custom-node'; 
export const WORLDID_ACTION_SAVE_WORKFLOW = 'save-workflow';

// WorldID Verification Levels
export const WORLDID_VERIFICATION_LEVEL = 'device'; // 'orb' | 'device'

// WorldID Bypass Configuration - Development Only
export const WORLDID_BYPASS_CONFIG = {
  // Enable bypass for all WorldID verifications
  enabled: true,
  
  // Bypass specific flows
  agentRegistration: true,
  workflowSave: true,
  customNodeCreation: true,
  
  // Mock verification data for bypass
  mockProof: {
    merkle_root: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    nullifier_hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    proof: '0x000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    verification_level: 'device'
  }
};

// Helper function to check if WorldID bypass is enabled
export const isWorldIDBypassEnabled = (action?: string): boolean => {
  if (!WORLDID_BYPASS_CONFIG.enabled) return false;
  
  if (action === 'register-agent') {
    return WORLDID_BYPASS_CONFIG.agentRegistration;
  }
  
  if (action === 'save-workflow') {
    return WORLDID_BYPASS_CONFIG.workflowSave;
  }
  
  if (action === 'create-custom-node') {
    return WORLDID_BYPASS_CONFIG.customNodeCreation;
  }
  
  return true;
};

// Helper function to get mock WorldID verification result
export const getMockWorldIDResult = () => ({
  merkle_root: WORLDID_BYPASS_CONFIG.mockProof.merkle_root,
  nullifier_hash: WORLDID_BYPASS_CONFIG.mockProof.nullifier_hash,
  proof: WORLDID_BYPASS_CONFIG.mockProof.proof,
  verification_level: WORLDID_BYPASS_CONFIG.mockProof.verification_level
});

// Helper function to simulate WorldID success
export const simulateWorldIDSuccess = (onSuccess: (result: any) => void, delay: number = 1000) => {
  setTimeout(() => {
    onSuccess(getMockWorldIDResult());
  }, delay);
};

// WorldID Error Messages
export const WORLDID_ERRORS = {
  USER_CANCELLED: 'User cancelled verification',
  VERIFICATION_FAILED: 'Identity verification failed',
  NETWORK_ERROR: 'Network error, please try again',
  INVALID_PROOF: 'Invalid verification proof',
  WALLET_NOT_CONNECTED: 'Please connect your wallet first',
  GENERIC_ERROR: 'An error occurred, please try again'
};

// Helper function to get user-friendly error message
export const getWorldIDErrorMessage = (error: string): string => {
  if (error.includes('User cancelled') || error.includes('user_cancelled')) return WORLDID_ERRORS.USER_CANCELLED;
  if (error.includes('Verification failed') || error.includes('verification_failed')) return WORLDID_ERRORS.VERIFICATION_FAILED;
  if (error.includes('Network') || error.includes('network')) return WORLDID_ERRORS.NETWORK_ERROR;
  if (error.includes('Invalid proof') || error.includes('invalid_proof')) return WORLDID_ERRORS.INVALID_PROOF;
  if (error.includes('wallet') || error.includes('connection')) return WORLDID_ERRORS.WALLET_NOT_CONNECTED;
  return WORLDID_ERRORS.GENERIC_ERROR;
};
