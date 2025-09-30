# FHE-Pay: Privacy-Preserving Payroll Streaming Platform

FHE-Pay is a revolutionary payroll streaming platform built on Ethereum that uses Fully Homomorphic Encryption (FHE) to enable employers to create encrypted salary streams while keeping salary amounts completely private. Employees can withdraw from their salary streams in real-time with total privacy protection.

## 🌟 Key Features

- **🔐 End-to-End Encryption**: All salary amounts are encrypted using FHE, ensuring complete privacy
- **⚡ Real-Time Streaming**: Employees can access their earned salary instantly as it accrues
- **🏦 Blockchain-Based**: Built on Ethereum with smart contract automation
- **👥 Multi-Party Support**: Separate interfaces for employers and employees
- **🔒 Security First**: Comprehensive security measures including reentrancy protection
- **📊 Analytics Dashboard**: Real-time insights into payroll and earnings

## 🏗️ Architecture

### Smart Contract Layer
- **Core Contract**: `contracts/PayrollStream.sol` - Main payroll streaming contract with FHE integration
- **FHE Integration**: Built with Zama's fhEVM for encrypted salary calculations
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

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- MetaMask or compatible Web3 wallet
- Ethereum Sepolia testnet ETH for testing

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fhe-pay
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Configure your `.env.local` with:
   ```env
   # Blockchain Configuration
   NEXT_PUBLIC_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
   NEXT_PUBLIC_CONTRACT_ADDRESS=YOUR_DEPLOYED_CONTRACT_ADDRESS
   NEXT_PUBLIC_CHAIN_ID=11155111
   NEXT_PUBLIC_ENVIRONMENT=development

   # FHE Configuration
   NEXT_PUBLIC_FHE_GATEWAY_URL=https://gateway.zama.ai
   PRIVATE_KEY=YOUR_PRIVATE_KEY

   # WalletConnect
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=YOUR_WALLETCONNECT_PROJECT_ID

   # Etherscan
   ETHERSCAN_API_KEY=YOUR_ETHERSCAN_API_KEY
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 💻 Development

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
npx hardhat deploy       # Deploy contracts
```

### Contract Deployment
```bash
# Deploy to Sepolia testnet
npx hardhat run scripts/deploy.ts --network sepolia

# Verify contract on Etherscan
npx hardhat verify --network sepolia <contract_address>
```

## 🧪 Testing

### Running Tests
```bash
npx hardhat test                # Run all tests
npx hardhat test --grep <pattern>  # Run specific tests
npx hardhat coverage            # Run coverage report
```

### Test Structure
- Location: `test/PayrollStream.test.ts`
- Framework: Hardhat + ethers + chai
- Coverage: All contract functions including FHE operations

## 🔐 FHE Integration

### How It Works
1. **Encryption**: Salary amounts are encrypted on the frontend using @zama-fhe/relayer-sdk
2. **Storage**: Encrypted values are stored as TFHE.euint256 in the smart contract
3. **Calculations**: All mathematical operations are performed on encrypted data
4. **Decryption**: Async gateway requests for withdrawal amounts when needed

### Key Components
- `src/lib/fhe.ts` - Core FHE utilities and instance management
- `src/hooks/useFHE.ts` - React hooks for FHE operations
- `contracts/PayrollStream.sol` - Contract with TFHE integration

## 📱 Usage

### For Employers
1. Connect your Web3 wallet
2. Navigate to the Employer Dashboard
3. Create new payroll streams by specifying employee addresses and encrypted salary amounts
4. Manage existing streams (pause, resume, modify)
5. Monitor total payroll obligations

### For Employees
1. Connect your Web3 wallet
2. View your active salary streams
3. Withdraw available earnings in real-time
4. Track withdrawal history and remaining balance

## 🚀 Deployment

### Local Development
1. Start Hardhat local network: `npx hardhat node`
2. Deploy contracts: `npx hardhat run scripts/deploy.ts --network localhost`
3. Update frontend .env with contract address

### Testnet Deployment (Sepolia)
1. Ensure you have Sepolia ETH
2. Compile contracts: `npx hardhat compile`
3. Deploy: `npx hardhat run scripts/deploy.ts --network sepolia`
4. Verify: `npx hardhat verify --network sepolia <address>`
5. Update frontend environment variables

### Production Deployment
1. Security audit required before mainnet deployment
2. Follow the same deployment process as testnet
3. Use mainnet configuration in hardhat.config.ts

## 🔒 Security Features

- **FHE Encryption**: End-to-end encryption of all salary data
- **Reentrancy Protection**: Prevents recursive contract calls
- **Emergency Controls**: Contract owner can pause operations in emergencies
- **Async Decryption**: Prevents blocking operations during decryption
- **Input Validation**: Comprehensive validation on all contract functions
- **Access Control**: Role-based permissions for different user types

## 🛠️ Technologies Used

### Blockchain & Smart Contracts
- **Solidity**: Smart contract development
- **Hardhat**: Development environment and testing framework
- **Ethers**: Ethereum library for contract interaction
- **Zama fhEVM**: FHE-enabled Ethereum Virtual Machine

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **Wagmi**: React hooks for Ethereum
- **RainbowKit**: Wallet connection library

### FHE & Privacy
- **@zama-fhe/relayer-sdk**: Client-side FHE operations
- **TFHE**: Threshold Fully Homomorphic Encryption
- **Async Gateway**: Decryption service for FHE operations

### State Management & Data
- **Zustand**: Lightweight state management
- **React Query**: Server state management and caching
- **Supabase**: Backend services (if applicable)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This software is provided as-is for educational and development purposes. Please conduct thorough security audits before deploying to production environments. The developers are not responsible for any financial losses or security breaches.

## 📞 Support

For questions or support:
- Create an issue in the GitHub repository
- Review the [CLAUDE.md](./CLAUDE.md) file for development guidance
- Check the [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment instructions

## 🔗 Links

- [Zama FHE Documentation](https://docs.zama.ai/)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Ethereum Sepolia Faucet](https://sepoliafaucet.com/)