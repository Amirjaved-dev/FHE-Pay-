# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FHE-Pay is a privacy-preserving payroll streaming platform built on Ethereum using Fully Homomorphic Encryption (FHE). The application allows employers to create encrypted salary streams that employees can withdraw from in real-time while keeping salary amounts completely private.

## Development Commands

### Frontend Development
```bash
npm run dev          # Start Next.js development server
npm run build        # Build Next.js application
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Smart Contract Development
```bash
npx hardhat compile      # Compile Solidity contracts
npx hardhat test         # Run contract tests
npx hardhat node         # Start local Hardhat network
npx hardhat deploy       # Deploy contracts (requires network configuration)
```

### Contract Deployment
```bash
npx hardhat run scripts/deploy.ts --network <network>  # Deploy to specific network
npx hardhat verify --network <network> <contract_address>  # Verify on Etherscan
```

## Architecture Overview

### Smart Contract Layer
- **Core Contract**: `contracts/PayrollStream.sol` - Main payroll streaming contract with FHE integration
- **FHE Integration**: Uses Zama's fhEVM for encrypted salary calculations
- **Key Features**:
  - Encrypted salary storage using TFHE.euint256
  - Async withdrawal requests via gateway decryption
  - Stream management (create, pause, resume)
  - Multi-party support (employer/employee)

### Frontend Architecture
- **Framework**: Next.js 14 with App Router
- **State Management**: Zustand for global state, React Query for server state
- **Web3 Integration**: Wagmi + RainbowKit for wallet connection
- **Styling**: Tailwind CSS with custom components
- **FHE Integration**: @zama-fhe/relayer-sdk for client-side encryption

### Key Components
- `src/hooks/useContract.ts` - Contract interaction hooks
- `src/hooks/useFHE.ts` - FHE encryption/decryption utilities
- `src/lib/fhe.ts` - FHE instance management and encryption functions
- `src/app/providers.tsx` - Web3 provider configuration
- `src/app/dashboard/` - Employer and employee dashboards

## Environment Configuration

### Required Environment Variables
```bash
# Blockchain Configuration
NEXT_PUBLIC_SEPOLIA_RPC_URL=        # Sepolia RPC endpoint
NEXT_PUBLIC_CONTRACT_ADDRESS=      # Deployed contract address
NEXT_PUBLIC_CHAIN_ID=11155111       # Sepolia chain ID
NEXT_PUBLIC_ENVIRONMENT=development # Environment (development/production)

# FHE Configuration
NEXT_PUBLIC_FHE_GATEWAY_URL=        # FHE gateway URL
PRIVATE_KEY=                       # Deployer private key (for deployment)

# WalletConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID= # WalletConnect project ID

# Etherscan (for verification)
ETHERSCAN_API_KEY=                 # Etherscan API key
```

## FHE Integration Details

### Encryption Flow
1. **Frontend**: Uses @zama-fhe/relayer-sdk to encrypt salary amounts
2. **Contract**: Stores encrypted values as TFHE.euint256
3. **Calculations**: Performs FHE operations on encrypted data
4. **Decryption**: Async gateway requests for withdrawal amounts

### Key Files
- `src/lib/fhe.ts` - Core FHE utilities and instance management
- `src/hooks/useFHE.ts` - React hooks for FHE operations
- `contracts/PayrollStream.sol` - Contract with TFHE integration

## Contract Testing

### Test Structure
- Location: `test/PayrollStream.test.ts`
- Framework: Hardhat + ethers + chai
- Coverage: All contract functions including FHE operations

### Running Tests
```bash
npx hardhat test                # Run all tests
npx hardhat test --grep <pattern>  # Run specific tests
npx hardhat coverage            # Run coverage report (if configured)
```

## Deployment Workflow

1. **Local Development**: Use Hardhat network for testing
2. **Testnet**: Deploy to Sepolia for staging
3. **Production**: Deploy to mainnet (requires security audit)

### Deployment Steps
1. Compile contracts: `npx hardhat compile`
2. Run tests: `npx hardhat test`
3. Deploy: `npx hardhat run scripts/deploy.ts --network sepolia`
4. Verify: `npx hardhat verify --network sepolia <address>`
5. Update frontend .env with contract address

## Security Considerations

- All salary amounts are encrypted end-to-end using FHE
- Contract includes reentrancy protection
- Emergency pause functionality for contract owner
- Async decryption prevents blocking operations
- Input validation on all contract functions

## Common Development Patterns

### Contract Interactions
- Use prepared writes from wagmi for better UX
- Handle loading states and errors appropriately
- Use React Query for caching contract reads

### FHE Operations
- Initialize FHE instance before any encryption/decryption
- Handle async decryption requests properly
- Validate FHE instance readiness before operations

### State Management
- Use Zustand for global app state (theme, user preferences)
- Use React Query for blockchain state and caching
- Implement proper error boundaries for async operations