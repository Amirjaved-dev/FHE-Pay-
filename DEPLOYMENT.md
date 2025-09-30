# FHE-Pay Deployment Guide

This guide will help you deploy the FHE-Pay smart contract and configure the frontend application.

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Hardhat
- MetaMask or other Web3 wallet
- ETH for gas fees (Sepolia testnet for testing)

## 1. Environment Setup

### Install Dependencies
```bash
npm install
```

### Configure Environment Variables
Copy the example environment file and fill in your values:

```bash
cp .env.example .env.local
```

Required environment variables:
- `NEXT_PUBLIC_SEPOLIA_RPC_URL` - Your Sepolia RPC endpoint
- `NEXT_PUBLIC_PAYROLL_CONTRACT_ADDRESS` - Deployed contract address (after deployment)
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` - WalletConnect project ID
- `PRIVATE_KEY` - Deployer private key (for deployment only)
- `NEXT_PUBLIC_FHE_GATEWAY_URL` - FHE gateway URL

## 2. Smart Contract Deployment

### Compile Contracts
```bash
npx hardhat compile
```

### Run Tests
```bash
npx hardhat test
```

### Deploy to Local Network (for development)
```bash
# Start local Hardhat node
npx hardhat node

# In another terminal, deploy to local network
npx hardhat run scripts/deploy.ts --network localhost
```

### Deploy to Sepolia Testnet
```bash
npx hardhat run scripts/deploy.ts --network sepolia
```

### Verify Contract on Etherscan
After deployment, verify your contract:

```bash
npx hardhat verify --network sepolia YOUR_CONTRACT_ADDRESS
```

## 3. Frontend Configuration

### Update Environment Variables
After deploying your contract, update `.env.local` with:
- `NEXT_PUBLIC_PAYROLL_CONTRACT_ADDRESS` - Your deployed contract address
- `NEXT_PUBLIC_CONTRACT_ADDRESS` - Same as above (for compatibility)

### Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 4. Testing the Application

### Connect Your Wallet
1. Open the application in your browser
2. Click "Connect Wallet"
3. Connect using MetaMask or WalletConnect

### Register FHE Key
1. Go to your dashboard (Employer or Employee)
2. Click "Register FHE Key"
3. Confirm the transaction

### Create a Salary Stream (Employer)
1. Go to Employer Dashboard
2. Click "Create Stream"
3. Fill in employee address and salary details
4. Confirm the transaction

### Withdraw Salary (Employee)
1. Go to Employee Dashboard
2. Find your active stream
3. Click "Withdraw" and enter amount
4. Confirm the transaction

## 5. Production Deployment

### Build the Application
```bash
npm run build
npm run start
```

### Deploy to Vercel
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy

## 6. Troubleshooting

### Common Issues

**Contract Not Found**
- Verify contract address is correctly set in `.env.local`
- Ensure you're on the correct network (Sepolia)

**FHE Operations Failed**
- Ensure FHE gateway URL is correct
- Check that FHE key is registered

**Transaction Failed**
- Check wallet has sufficient ETH balance
- Verify gas limits are adequate

**Deployment Issues**
- Ensure private key has sufficient funds
- Check network connectivity
- Verify RPC endpoint is accessible

### Logs and Debugging

- Check browser console for errors
- Review Hardhat deployment logs
- Monitor contract events in Etherscan

## 7. Security Considerations

- Never commit `.env.local` or private keys to version control
- Use environment-specific configurations
- Consider using a hardware wallet for production deployments
- Regularly update dependencies and audit contracts

## 8. Network Configuration

### Supported Networks
- **Hardhat Network** (Local development)
- **Sepolia Testnet** (Testing/staging)
- **Mainnet** (Production - requires audit)

### Contract Addresses
After deployment, your contract addresses will be saved in the `deployments/` directory:
- `deployments/hardhat.json` - Local network deployment
- `deployments/sepolia.json` - Sepolia testnet deployment

## 9. FHE Gateway Configuration

The application uses Zama's fhEVM for Fully Homomorphic Encryption. For production:

1. Set up your own FHE gateway or use Zama's testnet gateway
2. Configure `NEXT_PUBLIC_FHE_GATEWAY_URL` accordingly
3. Ensure proper key management and rotation procedures

## Support

For issues and questions:
- Check the troubleshooting section above
- Review the main README.md file
- Check browser console for detailed error messages