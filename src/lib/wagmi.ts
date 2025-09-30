import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia } from 'wagmi/chains';

// Define the Sepolia testnet configuration
const sepoliaTestnet = {
  ...sepolia,
  name: 'Sepolia Testnet',
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY']
    },
    public: {
      http: [process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY']
    }
  },
  blockExplorers: {
    default: {
      name: 'Etherscan',
      url: 'https://sepolia.etherscan.io'
    }
  }
};

// Get WalletConnect project ID from environment
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

if (!projectId) {
  console.warn('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set');
}

// Configure wagmi with RainbowKit
export const config = getDefaultConfig({
  appName: 'FHE-Pay',
  projectId: projectId || 'default-project-id',
  chains: [sepoliaTestnet],
  ssr: true, // Enable server-side rendering support
});

// Contract configuration
export const CONTRACT_CONFIG = {
  address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
  chainId: sepoliaTestnet.id,
} as const;

// FHE Gateway configuration
export const FHE_CONFIG = {
  GATEWAY_URL: process.env.NEXT_PUBLIC_FHE_GATEWAY_URL || 'https://relayer.testnet.zama.cloud',
  KMS_CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_KMS_CONTRACT_ADDRESS || '0x09b2205186649ddd58e8b4d47277480242c8ced8',
  chainId: sepoliaTestnet.id,
} as const;

// Export chain for use in components
export { sepoliaTestnet as defaultChain };