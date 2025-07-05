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

// WorldID Configuration - Updated for proper staging environment
export const WORLDID_APP_ID = 'app_staging_b4f8d2e1c3a5678f';
export const WORLDID_ACTION_REGISTER = 'register-agent';
export const WORLDID_ACTION_CREATE_NODE = 'create-custom-node'; 
export const WORLDID_ACTION_SAVE_WORKFLOW = 'save-workflow';

// WorldID Verification Levels
export const WORLDID_VERIFICATION_LEVEL = 'device'; // 'orb' | 'device'

// WorldID Error Messages
export const WORLDID_ERRORS = {
  USER_CANCELLED: 'Kullanıcı doğrulamayı iptal etti',
  VERIFICATION_FAILED: 'Kimlik doğrulama başarısız',
  NETWORK_ERROR: 'Ağ hatası, lütfen tekrar deneyin',
  INVALID_PROOF: 'Geçersiz doğrulama kanıtı',
  GENERIC_ERROR: 'Bir hata oluştu, lütfen tekrar deneyin'
};

// Helper function to get user-friendly error message
export const getWorldIDErrorMessage = (error: string): string => {
  if (error.includes('User cancelled')) return WORLDID_ERRORS.USER_CANCELLED;
  if (error.includes('Verification failed')) return WORLDID_ERRORS.VERIFICATION_FAILED;
  if (error.includes('Network')) return WORLDID_ERRORS.NETWORK_ERROR;
  if (error.includes('Invalid proof')) return WORLDID_ERRORS.INVALID_PROOF;
  return WORLDID_ERRORS.GENERIC_ERROR;
};
