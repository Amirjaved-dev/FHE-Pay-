import { FhevmInstance, createInstance } from '@zama-fhe/relayer-sdk/web';
import { JsonRpcSigner } from 'ethers';
import { FHE_CONFIG } from './wagmi';

// Global FHE instance
let fheInstance: FhevmInstance | null = null;

/**
 * Initialize FHE instance for encryption/decryption operations
 * @param chainId - The chain ID to connect to
 * @returns Promise<FhevmInstance>
 */
export async function initializeFHE(chainId: number = FHE_CONFIG.chainId): Promise<FhevmInstance> {
  if (fheInstance) {
    return fheInstance;
  }

  try {
    console.log('🔐 Initializing FHE instance...');
    fheInstance = await createInstance({
      chainId,
      gatewayUrl: FHE_CONFIG.gatewayUrl,
    });
    console.log('✅ FHE instance initialized successfully');
    return fheInstance;
  } catch (error) {
    console.error('❌ Failed to initialize FHE instance:', error);
    throw new Error('Failed to initialize FHE encryption');
  }
}

/**
 * Get the current FHE instance
 * @returns FhevmInstance | null
 */
export function getFHEInstance(): FhevmInstance | null {
  return fheInstance;
}

/**
 * Generate FHE public key for a user
 * @param signer - The user's signer
 * @param contractAddress - The contract address
 * @returns Promise<string> - The public key
 */
export async function generateFHEPublicKey(
  signer: JsonRpcSigner,
  contractAddress: string
): Promise<string> {
  try {
    const instance = await initializeFHE();
    const publicKey = instance.generatePublicKey({
      gatewayUrl: FHE_CONFIG.gatewayUrl,
    });
    
    console.log('🔑 Generated FHE public key');
    return publicKey;
  } catch (error) {
    console.error('❌ Failed to generate FHE public key:', error);
    throw new Error('Failed to generate FHE public key');
  }
}

/**
 * Encrypt a number using FHE
 * @param value - The number to encrypt
 * @param publicKey - The public key to use for encryption
 * @returns Promise<Uint8Array> - The encrypted value
 */
export async function encryptNumber(
  value: number | bigint,
  publicKey?: string
): Promise<Uint8Array> {
  try {
    const instance = await initializeFHE();
    
    // Convert to string for encryption
    const valueStr = value.toString();
    
    // Encrypt the value
    const encrypted = instance.encrypt64(BigInt(valueStr));
    
    console.log(`🔒 Encrypted value: ${valueStr}`);
    return encrypted;
  } catch (error) {
    console.error('❌ Failed to encrypt number:', error);
    throw new Error('Failed to encrypt number');
  }
}

/**
 * Encrypt a salary amount (in wei) using FHE
 * @param salaryWei - The salary amount in wei
 * @param publicKey - The public key to use for encryption
 * @returns Promise<Uint8Array> - The encrypted salary
 */
export async function encryptSalary(
  salaryWei: bigint,
  publicKey?: string
): Promise<Uint8Array> {
  try {
    const instance = await initializeFHE();
    
    // Encrypt the salary amount
    const encrypted = instance.encrypt64(salaryWei);
    
    console.log(`💰 Encrypted salary: ${salaryWei.toString()} wei`);
    return encrypted;
  } catch (error) {
    console.error('❌ Failed to encrypt salary:', error);
    throw new Error('Failed to encrypt salary amount');
  }
}

/**
 * Request decryption of an encrypted value
 * @param encryptedValue - The encrypted value to decrypt
 * @param signer - The user's signer
 * @param contractAddress - The contract address
 * @returns Promise<string> - The decryption request ID
 */
export async function requestDecryption(
  encryptedValue: Uint8Array,
  signer: JsonRpcSigner,
  contractAddress: string
): Promise<string> {
  try {
    const instance = await initializeFHE();
    
    // Create decryption request
    const requestId = await instance.requestDecryption(
      encryptedValue,
      await signer.getAddress(),
      contractAddress
    );
    
    console.log(`🔓 Requested decryption with ID: ${requestId}`);
    return requestId;
  } catch (error) {
    console.error('❌ Failed to request decryption:', error);
    throw new Error('Failed to request decryption');
  }
}

/**
 * Get decryption result
 * @param requestId - The decryption request ID
 * @returns Promise<bigint | null> - The decrypted value or null if not ready
 */
export async function getDecryptionResult(requestId: string): Promise<bigint | null> {
  try {
    const instance = await initializeFHE();
    
    // Get decryption result
    const result = await instance.getDecryptionResult(requestId);
    
    if (result) {
      console.log(`🔓 Decryption result: ${result.toString()}`);
      return BigInt(result.toString());
    }
    
    return null;
  } catch (error) {
    console.error('❌ Failed to get decryption result:', error);
    return null;
  }
}

/**
 * Convert ETH to Wei
 * @param ethAmount - Amount in ETH
 * @returns bigint - Amount in Wei
 */
export function ethToWei(ethAmount: string | number): bigint {
  const ethStr = ethAmount.toString();
  const [whole, decimal = ''] = ethStr.split('.');
  const paddedDecimal = decimal.padEnd(18, '0').slice(0, 18);
  return BigInt(whole + paddedDecimal);
}

/**
 * Convert Wei to ETH
 * @param weiAmount - Amount in Wei
 * @returns string - Amount in ETH
 */
export function weiToEth(weiAmount: bigint): string {
  const weiStr = weiAmount.toString();
  const len = weiStr.length;
  
  if (len <= 18) {
    const padded = weiStr.padStart(18, '0');
    return `0.${padded}`;
  }
  
  const ethPart = weiStr.slice(0, len - 18);
  const weiPart = weiStr.slice(len - 18);
  return `${ethPart}.${weiPart}`;
}

/**
 * Format salary for display
 * @param salaryWei - Salary in wei
 * @param decimals - Number of decimal places to show
 * @returns string - Formatted salary
 */
export function formatSalary(salaryWei: bigint, decimals: number = 4): string {
  const ethAmount = weiToEth(salaryWei);
  const num = parseFloat(ethAmount);
  return num.toFixed(decimals);
}

/**
 * Validate FHE instance is ready
 * @returns boolean - True if FHE instance is ready
 */
export function isFHEReady(): boolean {
  return fheInstance !== null;
}

/**
 * Reset FHE instance (useful for testing or reconnection)
 */
export function resetFHEInstance(): void {
  fheInstance = null;
  console.log('🔄 FHE instance reset');
}

/**
 * Get FHE instance status
 * @returns object - Status information
 */
export function getFHEStatus() {
  return {
    initialized: fheInstance !== null,
    chainId: FHE_CONFIG.chainId,
    gatewayUrl: FHE_CONFIG.gatewayUrl,
  };
}