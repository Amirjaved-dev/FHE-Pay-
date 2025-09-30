'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { formatEther } from 'viem';

/**
 * Hook for testing contract integration with mock data
 * Simulates real blockchain data without requiring deployed contracts
 */
export function useTestData() {
  const { address } = useAccount();
  const [isReady, setIsReady] = useState(false);

  // Simulate blockchain data
  const mockStreams = [
    {
      id: '1',
      employer: address || '0x1234567890abcdef1234567890abcdef12345678',
      employee: '0xabcdef1234567890abcdef1234567890abcdef12',
      duration: 2592000n, // 30 days
      startTime: BigInt(Math.floor(Date.now() / 1000) - 864000), // 10 days ago
      totalWithdrawn: 750000000000000000n, // 0.75 ETH
      active: true,
      encryptedAmount: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      earned: '0.25',
      remaining: '0.50',
      totalAmount: '0.75',
      progress: 33,
      isExpired: false,
    },
    {
      id: '2',
      employer: address || '0x1234567890abcdef1234567890abcdef12345678',
      employee: '0xbcdef1234567890abcdef1234567890abcdef1234',
      duration: 2592000n, // 30 days
      startTime: BigInt(Math.floor(Date.now() / 1000) - 432000), // 5 days ago
      totalWithdrawn: 600000000000000000n, // 0.60 ETH
      active: false,
      encryptedAmount: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      earned: '0.10',
      remaining: '0.50',
      totalAmount: '0.60',
      progress: 17,
      isExpired: false,
    }
  ];

  const mockContractData = {
    nextStreamId: 3,
    streamCount: 2,
    isPaused: false,
    contractBalance: 1350000000000000000n, // 1.35 ETH
    isFheKeyRegistered: true,
  };

  const mockMetrics = {
    totalStreams: 2,
    activeStreams: 1,
    totalPayroll: 1.35,
    totalEarned: 0.35,
    averageSalary: 0.675,
    monthlyGrowth: 15.2,
    coverageRate: 50,
    pendingWithdrawals: 0,
  };

  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return {
    // Mock contract data
    nextStreamId: mockContractData.nextStreamId,
    streamCount: mockContractData.streamCount,
    isPaused: mockContractData.isPaused,
    contractBalance: formatEther(mockContractData.contractBalance),
    isFheKeyRegistered: mockContractData.isFheKeyRegistered,

    // Mock metrics
    totalStreams: mockMetrics.totalStreams,
    activeStreams: mockMetrics.activeStreams,
    totalPayroll: mockMetrics.totalPayroll,
    totalEarned: mockMetrics.totalEarned,
    averageSalary: mockMetrics.averageSalary,
    monthlyGrowth: mockMetrics.monthlyGrowth,
    coverageRate: mockMetrics.coverageRate,
    pendingWithdrawals: mockMetrics.pendingWithdrawals,

    // Mock streams
    streams: mockStreams,
    activeStreamsList: mockStreams.filter(s => s.active),
    pausedStreamsList: mockStreams.filter(s => !s.active),

    // State
    isLoading: !isReady,
    isReady,
    lastUpdate: Date.now(),

    // Actions
    refresh: () => {
      setIsReady(false);
      setTimeout(() => setIsReady(true), 500);
    },
  };
}

/**
 * Hook for simulating real-time blockchain events
 */
export function useTestEvents() {
  const [events, setEvents] = useState<any[]>([]);

  const addTestEvent = useCallback((type: string, data: any) => {
    const event = {
      id: Date.now().toString(),
      type,
      timestamp: Date.now(),
      data,
    };

    setEvents(prev => [event, ...prev.slice(0, 19)]); // Keep last 20 events
  }, []);

  // Simulate periodic events
  useEffect(() => {
    const interval = setInterval(() => {
      const eventTypes = ['withdrawal', 'stream_created', 'stream_updated'];
      const randomType = eventTypes[Math.floor(Math.random() * eventTypes.length)];

      addTestEvent(randomType, {
        streamId: Math.floor(Math.random() * 10) + 1,
        amount: (Math.random() * 0.5).toFixed(4),
        employee: `0x${Math.random().toString(16).substr(2, 8)}...`,
      });
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [addTestEvent]);

  return {
    events,
    addTestEvent,
    clearEvents: () => setEvents([]),
  };
}

/**
 * Hook for testing contract interactions
 */
export function useTestContract() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const simulateTransaction = useCallback(async (type: string, data: any) => {
    try {
      setIsLoading(true);
      setError(null);

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate transaction hash
      const txHash = `0x${Math.random().toString(16).substr(2, 64)}`;

      return {
        hash: txHash,
        type,
        data,
        status: 'success',
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Transaction failed';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const simulateCreateStream = useCallback(async (params: any) => {
    return simulateTransaction('createStream', params);
  }, [simulateTransaction]);

  const simulateWithdrawal = useCallback(async (streamId: string) => {
    return simulateTransaction('withdrawal', { streamId });
  }, [simulateTransaction]);

  const simulatePauseStream = useCallback(async (streamId: string) => {
    return simulateTransaction('pauseStream', { streamId });
  }, [simulateTransaction]);

  const simulateResumeStream = useCallback(async (streamId: string) => {
    return simulateTransaction('resumeStream', { streamId });
  }, [simulateTransaction]);

  return {
    isLoading,
    error,
    simulateCreateStream,
    simulateWithdrawal,
    simulatePauseStream,
    simulateResumeStream,
  };
}