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
