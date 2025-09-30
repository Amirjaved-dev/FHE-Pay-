'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { formatEther, parseEther } from 'viem';
import { usePayrollContract, useCreateStream, useWithdrawFromStream, useToggleStream } from './useContract';
import { useFHE } from './useFHE';
import { useAppStore } from '@/store/useAppStore';

export interface Stream {
  id: string;
  employer: string;
  employee: string;
  encryptedSalary: Uint8Array;
  decryptedSalary?: string; // in ETH
  duration: number; // in seconds
  startTime: number; // timestamp
  totalWithdrawn: bigint;
  active: boolean;
  earnedAmount?: string; // in ETH
  progress?: number; // percentage
  remainingTime?: number; // in seconds
}

export interface StreamSummary {
  totalStreams: number;
  activeStreams: number;
  totalSalaryPaid: string; // in ETH
  totalEarned: string; // in ETH
  pendingWithdrawals: number;
}

export function useStreams() {
  const { address, isConnected } = useAccount();
  const { 
    getStream, 
    getEmployerStreams, 
    getEmployeeStreams, 
    getEncryptedEarnedAmount,
    streamCount 
  } = usePayrollContract();
  const { decryptValue } = useFHE();
  const { 
    streams, 
    setStreams, 
    addStream, 
    updateStream,
    userRole,
    setUserRole 
  } = useAppStore();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load streams for current user
  const loadStreams = useCallback(async () => {
    if (!isConnected || !address) {
      setStreams([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Get streams as both employer and employee
      const [employerStreamIds, employeeStreamIds] = await Promise.all([
        getEmployerStreams(address).catch(() => []),
        getEmployeeStreams(address).catch(() => [])
      ]);

      // Determine user role
      if (employerStreamIds.length > 0 && employeeStreamIds.length === 0) {
        setUserRole('employer');
      } else if (employeeStreamIds.length > 0 && employerStreamIds.length === 0) {
        setUserRole('employee');
      } else if (employerStreamIds.length > 0 && employeeStreamIds.length > 0) {
        setUserRole('both');
      } else {
        setUserRole(null);
      }

      // Combine all stream IDs
      const allStreamIds = [...new Set([...employerStreamIds, ...employeeStreamIds])];
      
      // Load detailed stream data
      const streamPromises = allStreamIds.map(async (streamId) => {
        try {
          const streamData = await getStream(streamId.toString());
          
          // Calculate additional properties
          const now = Math.floor(Date.now() / 1000);
          const elapsed = Math.max(0, now - streamData.startTime);
          const progress = Math.min(100, (elapsed / streamData.duration) * 100);
          const remainingTime = Math.max(0, streamData.duration - elapsed);

          // Try to get earned amount for employees
          let earnedAmount: string | undefined;
          if (streamData.employee.toLowerCase() === address.toLowerCase()) {
            try {
              const encryptedEarned = await getEncryptedEarnedAmount(streamId.toString());
              if (encryptedEarned) {
                const decryptedEarned = await decryptValue(encryptedEarned);
                if (decryptedEarned !== null) {
                  earnedAmount = formatEther(decryptedEarned);
                }
              }
            } catch (err) {
              console.warn('Failed to get earned amount for stream', streamId, err);
            }
          }

          const stream: Stream = {
            ...streamData,
            progress,
            remainingTime,
            earnedAmount,
          };

          return stream;
        } catch (err) {
          console.error('Failed to load stream', streamId, err);
          return null;
        }
      });

      const loadedStreams = (await Promise.all(streamPromises))
        .filter((stream): stream is Stream => stream !== null);

      setStreams(loadedStreams);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load streams';
      setError(errorMessage);
      console.error('Load streams error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, address, getEmployerStreams, getEmployeeStreams, getStream, getEncryptedEarnedAmount, decryptValue, setStreams, setUserRole]);

  // Get streams by role
  const getStreamsByRole = useCallback((role: 'employer' | 'employee'): Stream[] => {
    if (!address) return [];
    
    return streams.filter(stream => {
      if (role === 'employer') {
        return stream.employer.toLowerCase() === address.toLowerCase();
      } else {
        return stream.employee.toLowerCase() === address.toLowerCase();
      }
    });
  }, [streams, address]);

  // Get stream summary
  const getStreamSummary = useCallback((role?: 'employer' | 'employee'): StreamSummary => {
    const relevantStreams = role ? getStreamsByRole(role) : streams;
    
    const totalStreams = relevantStreams.length;
    const activeStreams = relevantStreams.filter(s => s.active).length;
    
    let totalSalaryPaid = '0';
    let totalEarned = '0';
    const pendingWithdrawals = 0;

    relevantStreams.forEach(stream => {
      if (role === 'employer' || (!role && stream.employer.toLowerCase() === address?.toLowerCase())) {
        // For employers: sum total withdrawn amounts
        totalSalaryPaid = (parseFloat(totalSalaryPaid) + parseFloat(formatEther(stream.totalWithdrawn))).toString();
      }
      
      if (role === 'employee' || (!role && stream.employee.toLowerCase() === address?.toLowerCase())) {
        // For employees: sum earned amounts
        if (stream.earnedAmount) {
          totalEarned = (parseFloat(totalEarned) + parseFloat(stream.earnedAmount)).toString();
        }
      }
    });

    return {
      totalStreams,
      activeStreams,
      totalSalaryPaid,
      totalEarned,
      pendingWithdrawals,
    };
  }, [streams, getStreamsByRole, address]);

  // Refresh a specific stream
  const refreshStream = useCallback(async (streamId: string) => {
    try {
      const streamData = await getStream(streamId);
      
      // Calculate additional properties
      const now = Math.floor(Date.now() / 1000);
      const elapsed = Math.max(0, now - streamData.startTime);
      const progress = Math.min(100, (elapsed / streamData.duration) * 100);
      const remainingTime = Math.max(0, streamData.duration - elapsed);

      // Try to get earned amount if user is employee
      let earnedAmount: string | undefined;
      if (streamData.employee.toLowerCase() === address?.toLowerCase()) {
        try {
          const encryptedEarned = await getEncryptedEarnedAmount(streamId);
          if (encryptedEarned) {
            const decryptedEarned = await decryptValue(encryptedEarned);
            if (decryptedEarned !== null) {
              earnedAmount = formatEther(decryptedEarned);
            }
          }
        } catch (err) {
          console.warn('Failed to get earned amount for stream', streamId, err);
        }
      }

      const updatedStream: Stream = {
        ...streamData,
        progress,
        remainingTime,
        earnedAmount,
      };

      updateStream(updatedStream);
      return updatedStream;
    } catch (err) {
      console.error('Failed to refresh stream', streamId, err);
      throw err;
    }
  }, [getStream, getEncryptedEarnedAmount, decryptValue, updateStream, address]);

  // Auto-load streams when wallet connects
  useEffect(() => {
    if (isConnected && address) {
      loadStreams();
    } else {
      setStreams([]);
      setUserRole(null);
    }
  }, [isConnected, address, loadStreams, setStreams, setUserRole]);

  // Auto-refresh streams periodically
  useEffect(() => {
    if (!isConnected || streams.length === 0) return;

    const interval = setInterval(() => {
      // Only refresh active streams
      const activeStreams = streams.filter(s => s.active);
      activeStreams.forEach(stream => {
        refreshStream(stream.id).catch(console.error);
      });
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [isConnected, streams, refreshStream]);

  return {
    // State
    streams,
    isLoading,
    error,
    userRole,
    streamCount,
    
    // Functions
    loadStreams,
    refreshStream,
    getStreamsByRole,
    getStreamSummary,
    
    // Computed values
    employerStreams: getStreamsByRole('employer'),
    employeeStreams: getStreamsByRole('employee'),
    employerSummary: getStreamSummary('employer'),
    employeeSummary: getStreamSummary('employee'),
  };
}

// Hook for stream creation
export function useStreamCreation() {
  const { createStream, isLoading, error } = useCreateStream();
  const { loadStreams } = useStreams();
  const { addStream } = useAppStore();
  
  const [isCreating, setIsCreating] = useState(false);

  const createNewStream = useCallback(async (params: {
    employee: string;
    salaryAmount: string;
    duration: number;
  }) => {
    try {
      setIsCreating(true);
      
      // Create the stream
      const tx = await createStream(params);
      
      if (tx) {
        // Wait for transaction confirmation
        await tx.wait();
        
        // Reload streams to get the new stream
        await loadStreams();
      }
      
      return tx;
    } catch (err) {
      console.error('Stream creation error:', err);
      throw err;
    } finally {
      setIsCreating(false);
    }
  }, [createStream, loadStreams]);

  return {
    createNewStream,
    isCreating: isLoading || isCreating,
    error,
  };
}

// Hook for stream withdrawal
export function useStreamWithdrawal() {
  const { requestWithdrawal, isLoading, error } = useWithdrawFromStream();
  const { refreshStream } = useStreams();
  
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const withdrawFromStream = useCallback(async (params: {
    streamId: string;
    amount: string;
  }) => {
    try {
      setIsWithdrawing(true);
      
      // Request withdrawal
      const tx = await requestWithdrawal(params);
      
      if (tx) {
        // Wait for transaction confirmation
        await tx.wait();
        
        // Refresh the stream data
        await refreshStream(params.streamId);
      }
      
      return tx;
    } catch (err) {
      console.error('Withdrawal error:', err);
      throw err;
    } finally {
      setIsWithdrawing(false);
    }
  }, [requestWithdrawal, refreshStream]);

  return {
    withdrawFromStream,
    isWithdrawing: isLoading || isWithdrawing,
    error,
  };
}

// Hook for stream management (pause/resume)
export function useStreamManagement() {
  const { toggleStream, isLoading, error } = useToggleStream();
  const { refreshStream } = useStreams();
  
  const [isToggling, setIsToggling] = useState(false);

  const toggleStreamStatus = useCallback(async (streamId: string, shouldPause: boolean) => {
    try {
      setIsToggling(true);
      
      // Toggle stream status
      const tx = await toggleStream(streamId, shouldPause);
      
      if (tx) {
        // Wait for transaction confirmation
        await tx.wait();
        
        // Refresh the stream data
        await refreshStream(streamId);
      }
      
      return tx;
    } catch (err) {
      console.error('Stream toggle error:', err);
      throw err;
    } finally {
      setIsToggling(false);
    }
  }, [toggleStream, refreshStream]);

  return {
    toggleStreamStatus,
    isToggling: isLoading || isToggling,
    error,
  };
}

// Utility functions for stream calculations
export const streamUtils = {
  // Calculate earned amount based on time elapsed
  calculateEarnedAmount: (stream: Stream): string => {
    const now = Math.floor(Date.now() / 1000);
    const elapsed = Math.max(0, now - stream.startTime);
    const progress = Math.min(1, elapsed / stream.duration);
    
    // This is a rough calculation - actual earned amount should come from contract
    if (stream.decryptedSalary) {
      const earned = parseFloat(stream.decryptedSalary) * progress;
      return earned.toFixed(6);
    }
    
    return '0';
  },

  // Format duration in human readable format
  formatDuration: (seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) {
      return `${days}d ${hours}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  },

  // Calculate stream status
  getStreamStatus: (stream: Stream): 'active' | 'paused' | 'completed' | 'expired' => {
    const now = Math.floor(Date.now() / 1000);
    const endTime = stream.startTime + stream.duration;
    
    if (now >= endTime) {
      return 'completed';
    } else if (!stream.active) {
      return 'paused';
    } else {
      return 'active';
    }
  },

  // Get stream progress percentage
  getStreamProgress: (stream: Stream): number => {
    const now = Math.floor(Date.now() / 1000);
    const elapsed = Math.max(0, now - stream.startTime);
    return Math.min(100, (elapsed / stream.duration) * 100);
  },
};