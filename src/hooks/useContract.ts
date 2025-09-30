'use client';

import { useContractRead, useContractWrite } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { useState, useCallback } from 'react';
import { CONTRACT_CONFIG } from '@/lib/wagmi';
import { PAYROLL_STREAM_ABI } from '@/config/blockchain';
import { useFHE, fheUtils } from './useFHE';

export interface CreateStreamParams {
  employee: string;
  salaryAmount: string; // in ETH
  duration: number; // in seconds
}

export interface WithdrawParams {
  streamId: string;
  amount: string; // in ETH
}

export function usePayrollContract() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { encryptValue, decryptValue } = useFHE();

  // Read functions
  const { data: nextStreamId } = useContractRead({
    address: CONTRACT_CONFIG.address,
    abi: PAYROLL_STREAM_ABI,
    functionName: 'nextStreamId',
  });

  // Get stream details using contract read
  const getStream = useCallback(async (streamId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // We'll need to call this via contract read instead
      // For now, return mock data or use direct contract interaction
      throw new Error('getStream needs to be implemented with direct contract calls');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get stream';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get streams for employer
  const getEmployerStreams = useCallback(async (employerAddress: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Use contract read to get employer stream IDs
      const { data: streamIds, error: readError } = await useContractRead({
        address: CONTRACT_CONFIG.address,
        abi: PAYROLL_STREAM_ABI,
        functionName: 'getEmployerStreams',
        args: [employerAddress],
      });

      if (readError) {
        console.error('Failed to fetch employer streams:', readError);
        throw new Error('Failed to fetch employer streams');
      }

      if (!streamIds || !Array.isArray(streamIds)) {
        return [];
      }

      // Fetch details for each stream
      const streams = await Promise.all(
        streamIds.map(async (streamId: bigint) => {
          try {
            const stream = await getStream(streamId.toString());
            return stream;
          } catch (error) {
            console.error(`Failed to fetch stream ${streamId}:`, error);
            return null;
          }
        })
      );

      return streams.filter((stream): stream is any => stream !== null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get employer streams';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [getStream]);

  // Get streams for employee
  const getEmployeeStreams = useCallback(async (employeeAddress: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Use contract read to get employee stream IDs
      const { data: streamIds, error: readError } = await useContractRead({
        address: CONTRACT_CONFIG.address,
        abi: PAYROLL_STREAM_ABI,
        functionName: 'getEmployeeStreams',
        args: [employeeAddress],
      });

      if (readError) {
        console.error('Failed to fetch employee streams:', readError);
        throw new Error('Failed to fetch employee streams');
      }

      if (!streamIds || !Array.isArray(streamIds)) {
        return [];
      }

      // Fetch details for each stream
      const streams = await Promise.all(
        streamIds.map(async (streamId: bigint) => {
          try {
            const stream = await getStream(streamId.toString());
            return stream;
          } catch (error) {
            console.error(`Failed to fetch stream ${streamId}:`, error);
            return null;
          }
        })
      );

      return streams.filter((stream): stream is any => stream !== null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get employee streams';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [getStream]);

  // Get encrypted earned amount
  const getEncryptedEarnedAmount = useCallback(async (streamId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // For now, return mock data - needs to be implemented with proper contract calls
      console.warn('getEncryptedEarnedAmount needs contract implementation');
      return '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get earned amount';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    // State
    isLoading,
    error,
    streamCount: nextStreamId ? Number(nextStreamId) - 1 : 0,

    // Read functions
    getStream,
    getEmployerStreams,
    getEmployeeStreams,
    getEncryptedEarnedAmount,
  };
}

// Hook for creating streams
export function useCreateStream() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { encryptValue, createEIP712, generatePublicKey } = useFHE();

  const { writeAsync } = useContractWrite({
    address: CONTRACT_CONFIG.address,
    abi: PAYROLL_STREAM_ABI,
    functionName: 'createStream',
  });

  const createStream = useCallback(async (params: CreateStreamParams) => {
    try {
      setIsLoading(true);
      setError(null);

      // Convert salary to wei
      const salaryWei = parseEther(params.salaryAmount);

      // Encrypt salary amount
      const encryptedSalary = await encryptValue(BigInt(params.salaryAmount));
      if (!encryptedSalary) {
        throw new Error('Failed to encrypt salary amount');
      }

      // Generate public key
      const publicKey = await generatePublicKey(CONTRACT_CONFIG.address);
      if (!publicKey) {
        throw new Error('Failed to generate public key');
      }

      // Create EIP712 signature
      const eip712Signature = await createEIP712(encryptedSalary, CONTRACT_CONFIG.address);
      if (!eip712Signature) {
        throw new Error('Failed to create EIP712 signature');
      }

      console.log('Creating encrypted stream:', {
        employee: params.employee,
        encryptedAmount: fheUtils.encryptedToHex(encryptedSalary),
        duration: params.duration,
        publicKey
      });

      // Create the stream with encrypted data
      const tx = await writeAsync?.({
        args: [
          params.employee,
          fheUtils.encryptedToHex(encryptedSalary),
          eip712Signature.inputProof || '0x',
          BigInt(params.duration),
          publicKey,
        ],
        value: salaryWei,
      });

      return tx;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create stream';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [writeAsync, encryptValue, generatePublicKey, createEIP712]);

  return {
    createStream,
    isLoading,
    error,
  };
}

// Hook for withdrawing from streams
export function useWithdrawFromStream() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { writeAsync } = useContractWrite({
    address: CONTRACT_CONFIG.address,
    abi: PAYROLL_STREAM_ABI,
    functionName: 'requestWithdrawal',
  });

  const requestWithdrawal = useCallback(async (streamId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Call the contract to request withdrawal (only needs streamId)
      const tx = await writeAsync?.({
        args: [BigInt(streamId)],
      });

      return tx;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to request withdrawal';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [writeAsync]);

  return {
    requestWithdrawal,
    isLoading,
    error,
  };
}

// Hook for pausing/resuming streams (employer only)
export function useToggleStream() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { writeAsync: pauseAsync } = useContractWrite({
    address: CONTRACT_CONFIG.address,
    abi: PAYROLL_STREAM_ABI,
    functionName: 'pauseStream',
  });

  const { writeAsync: resumeAsync } = useContractWrite({
    address: CONTRACT_CONFIG.address,
    abi: PAYROLL_STREAM_ABI,
    functionName: 'resumeStream',
  });

  const toggleStream = useCallback(async (streamId: string, shouldPause: boolean) => {
    try {
      setIsLoading(true);
      setError(null);

      const tx = shouldPause 
        ? await pauseAsync?.({ args: [BigInt(streamId)] })
        : await resumeAsync?.({ args: [BigInt(streamId)] });

      return tx;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to ${shouldPause ? 'pause' : 'resume'} stream`;
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [pauseAsync, resumeAsync]);

  return {
    toggleStream,
    isLoading,
    error,
  };
}

// Hook for FHE key registration
export function useFHEKeyRegistration() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { generatePublicKey } = useFHE();

  const { writeAsync } = useContractWrite({
    address: CONTRACT_CONFIG.address,
    abi: PAYROLL_STREAM_ABI,
    functionName: 'registerFHEKey',
  });

  const registerFHEKey = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Generate public key
      const publicKey = await generatePublicKey(CONTRACT_CONFIG.address);

      if (!publicKey) {
        throw new Error('Failed to generate FHE public key');
      }

      // Register the public key with the contract
      const tx = await writeAsync?.({
        args: [publicKey],
      });

      return tx;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to register FHE key';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [writeAsync, generatePublicKey]);

  return {
    registerFHEKey,
    isLoading,
    error,
  };
}

// Hook for emergency functions (employer only)
export function useEmergencyFunctions() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { writeAsync: emergencyPauseAsync } = useContractWrite({
    address: CONTRACT_CONFIG.address,
    abi: PAYROLL_STREAM_ABI,
    functionName: 'emergencyPause',
  });

  const { writeAsync: emergencyResumeAsync } = useContractWrite({
    address: CONTRACT_CONFIG.address,
    abi: PAYROLL_STREAM_ABI,
    functionName: 'emergencyResume',
  });

  const emergencyPause = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const tx = await emergencyPauseAsync?.();
      return tx;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to emergency pause';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [emergencyPauseAsync]);

  const emergencyResume = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const tx = await emergencyResumeAsync?.();
      return tx;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to emergency resume';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [emergencyResumeAsync]);

  return {
    emergencyPause,
    emergencyResume,
    isLoading,
    error,
  };
}