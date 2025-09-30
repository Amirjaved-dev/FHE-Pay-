import { ethers } from 'ethers';
import { config } from 'dotenv';
import { readFileSync } from 'fs';

config({ path: '.env.local' });

async function deploy() {
  const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
  const privateKey = process.env.PRIVATE_KEY;

  console.log('Private key length:', privateKey ? privateKey.length : 'undefined');
  console.log('Private key format:', privateKey ? privateKey.substring(0, 6) + '...' : 'undefined');

  const wallet = new ethers.Wallet(privateKey, provider);

  console.log('Deployer address:', wallet.address);

  const artifact = JSON.parse(readFileSync('./artifacts/contracts/PayrollStream.sol/PayrollStream.json', 'utf8'));
  
  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
  const contract = await factory.deploy();
  
  console.log('Deploying contract...');
  await contract.waitForDeployment();
  
  const address = await contract.getAddress();
  console.log('Deployed to:', address);
  console.log('NEXT_PUBLIC_CONTRACT_ADDRESS=' + address);
}

deploy().catch(console.error);
