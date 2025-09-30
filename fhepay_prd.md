# PRD — FHE-Pay (MVP on Sepolia with Next.js + fhEVM)

## 1. Overview  
FHE-Pay is a **confidential salary streaming dApp** that leverages **Zama’s fhEVM** to enable **privacy-preserving payroll on Ethereum**.  
- Employers fund payroll in crypto (ETH/USDT on Sepolia).  
- Employees receive **encrypted salary streams** where balances are computed securely using FHE.  
- Decryption is handled client-side or via fhEVM’s async decryption.  
- Runs entirely on **Sepolia testnet**, with a **Next.js frontend** for seamless employer/employee access.  

📖 References:  
- [fhEVM Overview](https://docs.zama.ai/fhevm)  
- [fhEVM Solidity API](https://docs.zama.ai/fhevm/solidity-api)  
- [Deploying Contracts](https://docs.zama.ai/fhevm/getting-started/deploy)  
- [Async Decryption Guide](https://docs.zama.ai/fhevm/decryption/async)  

---

## 2. Goals (MVP)  
- ✅ **Smart Contract** — `PayrollStream.sol` with FHE types ([Uint](https://docs.zama.ai/fhevm/solidity-api#uint), [euint256](https://docs.zama.ai/fhevm/solidity-api#euint256)):  
  - Create encrypted salary streams.  
  - Compute earned balances privately.  
  - Withdraw salary while keeping amounts confidential.  

- ✅ **Frontend (Next.js)**:  
  - Employer: connect wallet, fund contract, create salary stream.  
  - Employee: connect wallet, view encrypted balance, withdraw funds.  

- ✅ **Public Repository**:  
  - Next.js frontend + Solidity contract + Hardhat/Foundry scripts.  
  - Clear README with setup, deploy, and run instructions.  
  - Automated tests for salary stream calculations.  

📖 References:  
- [Zama Solidity API — FHE types](https://docs.zama.ai/fhevm/solidity-api#uint)  
- [fhEVM Local Development](https://docs.zama.ai/fhevm/getting-started/local-dev)  

---

## 3. Features  

### Employer Features  
- Connect wallet (MetaMask, WalletConnect via RainbowKit).  
- Fund payroll contract with ETH/USDT (Sepolia).  
- Create an encrypted salary stream (amount + duration).  
- View and manage active employee streams.  

### Employee Features  
- Connect wallet to view payroll stream.  
- Real-time encrypted balance calculation.  
- Withdraw earned salary securely without revealing total salary.  

### System Features  
- All salary amounts stored and computed in **encrypted form (FHE)**.  
- Built for **Sepolia testnet**, structured to expand to mainnet.  
- Open-source repo for transparency and adoption.  

📖 References:  
- [Confidential Computing with fhEVM](https://docs.zama.ai/fhevm/overview)  
- [Encrypted Balance Calculation](https://docs.zama.ai/fhevm/solidity-api#arithmetic-operations)  

---

## 4. Non-Goals (initial release)  
- No multi-chain support (focus: Ethereum Sepolia → mainnet).  
- No tax automation, compliance integrations, or enterprise dashboards.  
- No advanced analytics — basic encrypted balance only.  
- No fiat off-ramps (crypto only).  

---

## 5. Tech Stack  
- **Smart Contract**: Solidity + `fhevm-solidity` (Zama libraries). Deploy to **Sepolia**.  
- **Frontend**: Next.js + RainbowKit + Wagmi for wallet connection.  
- **Backend**: None (direct wallet → contract interaction).  
- **Tooling**: Hardhat/Foundry for testing & deployments.  

📖 References:  
- [fhEVM Tooling](https://docs.zama.ai/fhevm/getting-started/tooling)  
- [Contract Deployment Walkthrough](https://docs.zama.ai/fhevm/getting-started/deploy)  

---

## 6. Success Criteria  
- Smart contract deployed & operational on **Sepolia testnet**.  
- Employers can fund, create streams, and manage payroll.  
- Employees can track encrypted balances and withdraw.  
- Repository includes contracts, deploy scripts, frontend, tests, and setup guide.  
- Product usable as a **working MVP** ready to expand to mainnet.  

📖 References:  
- [Testing Contracts with fhEVM](https://docs.zama.ai/fhevm/getting-started/testing)  

---

## 7. Security Considerations  
- Reentrancy guard in withdraw function.  
- Input validation for salary & duration.  
- Emergency pause function for payroll contract.  
- Future audits planned before mainnet launch.  

📖 References:  
- [Best Practices with fhEVM](https://docs.zama.ai/fhevm/overview#security)

