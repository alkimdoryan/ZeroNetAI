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

// WorldID App ID - Get from https://developer.worldcoin.org/
export const WORLDID_APP_ID = 'app_your-world-id-app-id';
export const WORLDID_ACTION = 'register-agent';
