import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { polygon, polygonMumbai } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'SAP Protocol',
  projectId: 'your-project-id', // Get this from https://cloud.walletconnect.com/
  chains: [polygon, polygonMumbai],
  ssr: false, // If your dApp uses server side rendering (SSR)
});

export const supportedChains = [polygon, polygonMumbai];
