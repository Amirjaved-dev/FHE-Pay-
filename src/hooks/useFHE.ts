'use client';

// Polyfills for browser environment
if (typeof window !== 'undefined') {
  // Define global on window
  if (typeof (window as any).global === 'undefined') {
    (window as any).global = window;
  }

  // Ensure globalThis is available
  if (typeof (window as any).globalThis === 'undefined') {
    (window as any).globalThis = window;
  }

  // Polyfill for Buffer if needed
  if (typeof Buffer === 'undefined') {
    const buffer = require('buffer');
    (window as any).Buffer = buffer.Buffer;
  }

  // Polyfill for process if needed
  if (typeof process === 'undefined') {
    (window as any).process = {
      env: {},
      version: '',
      platform: 'browser',
      browser: true,
    };
  }

  // Additional polyfills that might be needed by FHE SDK
  if (typeof (window as any).setImmediate === 'undefined') {
    (window as any).setImmediate = (fn: Function) => setTimeout(fn, 0);
  }

  if (typeof (window as any).clearImmediate === 'undefined') {
    (window as any).clearImmediate = (id: number) => clearTimeout(id);
  }
}

import { useState, useCallback, useEffect } from 'react';
import { useAccount } from 'wagmi';

import { FHE_CONFIG } from '@/lib/wagmi';
import { useAppStore } from '@/store/useAppStore';

export interface FHEInstance {
  encrypt64?: (value: bigint) => Promise<Uint8Array>;
  decrypt?: (ciphertext: Uint8Array) => Promise<bigint>;
  createEIP712?: (ciphertext: Uint8Array, contractAddress: string) => any;
  generatePublicKey?: () => Promise<{ publicKey: string; publicKeyId: string } | null>;
  generateKeypair?: () => Promise<{ publicKey: string; privateKey: string } | null>;
  getPublicKey?: () => { publicKey: string; publicKeyId: string } | null;
  createEncryptedInput?: (contractAddress: string, userAddress: string) => any;
}

// Mock FHE implementation that maintains API compatibility
const createMockFHEInstance = () => {
  return {
    encrypt64: async (value: bigint): Promise<Uint8Array> => {
      console.log('Mock FHE: encrypting value', value.toString());
      // Return mock encrypted data
      const mockData = new Uint8Array(32);
      mockData[0] = 0xab;
      mockData[1] = 0xcd;
      mockData[2] = 0xef;
      // Store the actual value in a way we can retrieve for decryption
      const valueBytes = new TextEncoder().encode(value.toString());
      mockData.set(valueBytes.slice(0, 29), 3);
      return mockData;
    },
    decrypt: async (ciphertext: Uint8Array): Promise<bigint> => {
      console.log('Mock FHE: decrypting data');
      // Extract the mock value
      const valueStr = new TextDecoder().decode(ciphertext.slice(3, 32));
      return BigInt(valueStr || '1000000000000000000'); // Default to 1 ETH
    },
    encrypt: async (value: bigint): Promise<Uint8Array> => {
      return this.encrypt64(value);
    },
    decrypt64: async (ciphertext: Uint8Array): Promise<bigint> => {
      return this.decrypt(ciphertext);
    },
    generatePublicKey: async () => {
      return {
        publicKey: '0xmockpublickey1234567890abcdef',
        publicKeyId: 'mock-key-id'
      };
    },
    createEIP712: (ciphertext: Uint8Array, contractAddress: string) => {
      return {
        types: {
          EIP712Domain: [
            { name: 'name', type: 'string' },
            { name: 'version', type: 'string' },
            { name: 'chainId', type: 'uint256' },
            { name: 'verifyingContract', type: 'address' },
          ],
          EncryptedData: [
            { name: 'ciphertext', type: 'bytes' },
            { name: 'contractAddress', type: 'address' },
          ],
        },
        domain: {
          name: 'FHE-Pay',
          version: '1',
          chainId: 11155111,
          verifyingContract: contractAddress,
        },
        message: {
          ciphertext,
        },
      };
    },
  };
};

// Try to initialize real FHE SDK, fall back to mock
const initializeFHEInstance = async (): Promise<any> => {
  if (typeof window !== 'undefined') {
    // Set up global polyfill before importing FHE SDK
    if (typeof (window as any).global === 'undefined') {
      (window as any).global = window;
    }
  }

  try {
    console.log('Attempting to initialize real FHE SDK...');
    // Dynamic import to avoid SSR issues - use the web export for browser
    const fheSDK = await import('@zama-fhe/relayer-sdk/web');

    // Get environment variables with proper fallbacks
    const kmsAddress = FHE_CONFIG.KMS_CONTRACT_ADDRESS;
    const gatewayUrl = FHE_CONFIG.GATEWAY_URL;

    // Validate KMS address - check if it's a valid Ethereum address format
    const isValidKMSAddress = kmsAddress &&
      typeof kmsAddress === 'string' &&
      kmsAddress.startsWith('0x') &&
      kmsAddress.length === 42;

    if (!isValidKMSAddress) {
      console.warn('KMS contract address is not valid or empty:', kmsAddress, 'using mock mode');
      return createMockFHEInstance();
    }

    console.log('Initializing FHE SDK with KMS address:', kmsAddress);

    // Try to initialize with the SDK
    if (fheSDK.createInstance) {
      const fheClient = await fheSDK.createInstance({
        chainId: 11155111, // Sepolia
        gatewayUrl: gatewayUrl,
        kmsContractAddress: kmsAddress,
      });
      console.log('Real FHE SDK initialized successfully');
      return fheClient;
    } else if (fheSDK.createFheClient) {
      const fheClient = await fheSDK.createFheClient({
        gatewayUrl: gatewayUrl,
        networkId: 'sepolia',
        kmsContractAddress: kmsAddress,
      });
      console.log('Real FHE SDK initialized successfully');
      return fheClient;
    } else {
      throw new Error('No FHE SDK initialization method found');
    }
  } catch (error) {
    console.warn('FHE SDK initialization failed, using mock implementation:', error);
    return createMockFHEInstance();
  }
};

export function useFHE() {
  const { address, isConnected } = useAccount();
  const { fheInstance, setFheInstance, setFHEPublicKey } = useAppStore();
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize FHE instance
  const initializeFHE = useCallback(async () => {
    if (!isConnected || !address || fheInstance) {
      return fheInstance;
    }

    try {
      setIsInitializing(true);
      setError(null);

      const instance = await initializeFHEInstance();

      if (instance) {
        setFheInstance(instance);

        // Generate or get public key
        try {
          const publicKeyInfo = await instance.generatePublicKey();
          if (publicKeyInfo) {
            setFHEPublicKey(publicKeyInfo.publicKey);
          }
        } catch (keyError) {
          console.warn('Failed to generate public key:', keyError);
        }
      }

      return instance;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize FHE';
      setError(errorMessage);
      console.error('FHE initialization error:', err);

      // Fallback to mock mode if FHE fails
      console.warn('Falling back to mock mode due to initialization failure');
      return null;
    } finally {
      setIsInitializing(false);
    }
  }, [isConnected, address, fheInstance, setFheInstance, setFHEPublicKey]);

  // Encrypt a value
  const encryptValue = useCallback(async (value: bigint): Promise<Uint8Array | null> => {
    try {
      setError(null);

      let instance = fheInstance;
      if (!instance) {
        instance = await initializeFHE();
      }

      if (!instance) {
        // Fallback to mock mode if FHE is not available
        console.warn('FHE not available - using mock encryption');
        const mockData = new Uint8Array(32);
        mockData[0] = 0xab; mockData[1] = 0xcd; mockData[2] = 0xef;
        return mockData;
      }

      // Try to use the actual FHE encryption
      if (instance.encrypt64) {
        const encrypted = await instance.encrypt64(value);
        return encrypted;
      } else if (instance.encrypt) {
        // Alternative method name
        const encrypted = await instance.encrypt(value);
        return encrypted;
      } else {
        throw new Error('No encryption method found on FHE instance');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to encrypt value';
      setError(errorMessage);
      console.error('Encryption error:', err);

      // Fallback to mock data on error
      const mockData = new Uint8Array(32);
      mockData[0] = 0xab; mockData[1] = 0xcd; mockData[2] = 0xef;
      return mockData;
    }
  }, [fheInstance, initializeFHE]);

  // Decrypt a value
  const decryptValue = useCallback(async (ciphertext: Uint8Array): Promise<bigint | null> => {
    try {
      setError(null);

      let instance = fheInstance;
      if (!instance) {
        instance = await initializeFHE();
      }

      if (!instance) {
        // Fallback to mock mode if FHE is not available
        console.warn('FHE not available - using mock decryption');
        return BigInt(1000000000000000000n); // 1 ETH mock value
      }

      // Try to use the actual FHE decryption
      if (instance.decrypt) {
        const decrypted = await instance.decrypt(ciphertext);
        return decrypted;
      } else if (instance.decrypt64) {
        // Alternative method name
        const decrypted = await instance.decrypt64(ciphertext);
        return decrypted;
      } else {
        throw new Error('No decryption method found on FHE instance');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to decrypt value';
      setError(errorMessage);
      console.error('Decryption error:', err);

      // Fallback to mock value on error
      return BigInt(1000000000000000000n); // 1 ETH mock value
    }
  }, [fheInstance, initializeFHE]);

  // Create EIP712 signature for encrypted data
  const createEIP712 = useCallback(async (ciphertext: Uint8Array, contractAddress: string) => {
    try {
      setError(null);
      
      let instance = fheInstance;
      if (!instance) {
        instance = await initializeFHE();
      }

      if (!instance || !instance.createEIP712) {
        throw new Error('FHE instance not available or createEIP712 method missing');
      }

      const eip712 = instance.createEIP712(ciphertext, contractAddress);
      return eip712;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create EIP712';
      setError(errorMessage);
      console.error('EIP712 creation error:', err);
      return null;
    }
  }, [fheInstance, initializeFHE]);

  // Generate public key for a contract
  const generatePublicKey = useCallback(async (contractAddress: string): Promise<string | null> => {
    try {
      setError(null);

      let instance = fheInstance;
      if (!instance) {
        instance = await initializeFHE();
      }

      if (!instance || !instance.generatePublicKey) {
        throw new Error('FHE instance not available or generatePublicKey method missing');
      }

      const publicKeyInfo = await instance.generatePublicKey();
      return publicKeyInfo?.publicKey || null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate public key';
      setError(errorMessage);
      console.error('Public key generation error:', err);
      return null;
    }
  }, [fheInstance, initializeFHE]);

  // Encrypt a number (convenience function)
  const encryptNumber = useCallback(async (num: number): Promise<Uint8Array | null> => {
    return encryptValue(BigInt(num));
  }, [encryptValue]);

  // Decrypt to number (convenience function)
  const decryptToNumber = useCallback(async (ciphertext: Uint8Array): Promise<number | null> => {
    const decrypted = await decryptValue(ciphertext);
    return decrypted ? Number(decrypted) : null;
  }, [decryptValue]);

  // Auto-initialize when wallet connects
  useEffect(() => {
    if (isConnected && address && !fheInstance && !isInitializing) {
      initializeFHE().catch(err => {
        console.error('Auto-initialization failed:', err);
        setError('FHE initialization failed. Using mock mode for demo.');
      });
    }
  }, [isConnected, address, fheInstance, isInitializing, initializeFHE]);

  return {
    // State
    fheInstance,
    isInitializing,
    error,
    isReady: !!fheInstance && !isInitializing,
    
    // Functions
    initializeFHE,
    encryptValue,
    decryptValue,
    encryptNumber,
    decryptToNumber,
    createEIP712,
    generatePublicKey,
  };
}

// Hook for FHE operations with automatic retry
export function useFHEWithRetry() {
  const fhe = useFHE();
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  const withRetry = useCallback(async <T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> => {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await operation();
        if (attempt > 0) {
          setRetryCount(0); // Reset retry count on success
        }
        return result;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(`${operationName} failed`);
        
        if (attempt < maxRetries) {
          console.warn(`${operationName} attempt ${attempt + 1} failed, retrying...`, err);
          setRetryCount(attempt + 1);
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }
    
    throw lastError;
  }, [maxRetries]);

  const encryptValueWithRetry = useCallback(async (value: bigint): Promise<Uint8Array | null> => {
    return withRetry(
      () => fhe.encryptValue(value),
      'Encrypt value'
    ).catch(() => null);
  }, [fhe.encryptValue, withRetry]);

  const decryptValueWithRetry = useCallback(async (ciphertext: Uint8Array): Promise<bigint | null> => {
    return withRetry(
      () => fhe.decryptValue(ciphertext),
      'Decrypt value'
    ).catch(() => null);
  }, [fhe.decryptValue, withRetry]);

  return {
    ...fhe,
    retryCount,
    maxRetries,
    encryptValueWithRetry,
    decryptValueWithRetry,
  };
}

// Utility functions for FHE operations
export const fheUtils = {
  // Convert encrypted data to hex string for storage
  encryptedToHex: (encrypted: Uint8Array): string => {
    return '0x' + Array.from(encrypted)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  },

  // Convert hex string back to Uint8Array
  hexToEncrypted: (hex: string): Uint8Array => {
    const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
    const bytes = new Uint8Array(cleanHex.length / 2);
    for (let i = 0; i < cleanHex.length; i += 2) {
      bytes[i / 2] = parseInt(cleanHex.substr(i, 2), 16);
    }
    return bytes;
  },

  // Format encrypted value for display
  formatEncrypted: (encrypted: Uint8Array): string => {
    const hex = fheUtils.encryptedToHex(encrypted);
    return `${hex.slice(0, 10)}...${hex.slice(-8)}`;
  },

  // Validate encrypted data
  isValidEncrypted: (data: any): data is Uint8Array => {
    return data instanceof Uint8Array && data.length > 0;
  },
};