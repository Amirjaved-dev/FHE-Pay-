import { ethers } from 'hardhat';
import fs from 'fs';
import path from 'path';

async function main() {
  console.log("Deploying PayrollStream contract...");

  try {
    // Get the deployer account
    const [deployer] = await ethers.getSigners();
    console.log(`Deploying contracts with account: ${deployer.address}`);
    console.log(`Account balance: ${ethers.formatEther(await ethers.provider.getBalance(deployer.address))} ETH`);

    // Get network information
    const network = await ethers.provider.getNetwork();
    console.log(`Network: ${network.name} (Chain ID: ${network.chainId})`);

    // Deploy the contract
    const PayrollStream = await ethers.getContractFactory("PayrollStream");
    const payrollStream = await PayrollStream.deploy();

    await payrollStream.waitForDeployment();

    const contractAddress = await payrollStream.getAddress();
    console.log(`PayrollStream deployed to: ${contractAddress}`);

    // Log deployment info
    console.log(`Owner: ${await payrollStream.owner()}`);
    console.log(`Contract paused: ${await payrollStream.paused()}`);

    // Save deployment information
    const deploymentInfo = {
      network: network.name,
      chainId: network.chainId.toString(),
      contractAddress: contractAddress,
      deployerAddress: deployer.address,
      deploymentTime: new Date().toISOString(),
      blockNumber: (await ethers.provider.getBlockNumber()).toString(),
    };

    // Save to deployments directory
    const deploymentsDir = path.join(__dirname, '..', 'deployments');
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    const deploymentFile = path.join(deploymentsDir, `${network.name}.json`);
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    console.log(`Deployment info saved to: ${deploymentFile}`);

    // Log contract verification command
    console.log('\nTo verify the contract on Etherscan, run:');
    console.log(`npx hardhat verify --network ${network.name} ${contractAddress}`);

    // Update .env file with contract address
    console.log("\nPlease update your .env file with:");
    console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}`);
    console.log(`NEXT_PUBLIC_PAYROLL_CONTRACT_ADDRESS=${contractAddress}`);

    console.log('\nDeployment completed successfully!');
  } catch (error) {
    console.error('Deployment failed:', error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });