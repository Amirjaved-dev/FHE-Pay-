'use client';

import { useContractRead, useAccount } from 'wagmi';
import { useMemo } from 'react';
import { CONTRACT_CONFIG } from '@/lib/wagmi';
import { PAYROLL_STREAM_ABI, StreamDetails } from '@/config/blockchain';
import { formatEther, formatUnits } from 'viem';
import { decryptValue } from './useFHE';

/**
 * Hook for fetching real-time blockchain data
 * Replaces mock data with actual contract reads
 */
export function useContractData() {
  const { address } = useAccount();

  // Read contract state
  const { data: nextStreamId, isLoading: isLoadingStreamId } = useContractRead({
    address: CONTRACT_CONFIG.address,
    abi: PAYROLL_STREAM_ABI,
    functionName: 'nextStreamId',
    query: {
      refetchInterval: 5000, // Refetch every 5 seconds
    },
  });

  const { data: isPaused, isLoading: isLoadingPaused } = useContractRead({
    address: CONTRACT_CONFIG.address,
    abi: PAYROLL_STREAM_ABI,
    functionName: 'paused',
    query: {
      refetchInterval: 10000, // Refetch every 10 seconds
    },
  });

  const { data: contractBalance, isLoading: isLoadingBalance } = useContractRead({
    address: CONTRACT_CONFIG.address,
    abi: PAYROLL_STREAM_ABI,
    functionName: 'getContractBalance',
    query: {
      refetchInterval: 5000,
    },
  });

  const { data: isFheKeyRegistered } = useContractRead({
    address: CONTRACT_CONFIG.address,
    abi: PAYROLL_STREAM_ABI,
    functionName: 'keyRegistered',
    args: [address],
    query: {
      refetchInterval: 15000,
    },
  });

  return {
    // Raw contract data
    nextStreamId: nextStreamId ? Number(nextStreamId) : 0,
    streamCount: nextStreamId ? Number(nextStreamId) - 1 : 0,
    isPaused: isPaused || false,
    contractBalance: contractBalance || 0n,
    isFheKeyRegistered: isFheKeyRegistered || false,

    // Loading states
    isLoading: isLoadingStreamId || isLoadingPaused || isLoadingBalance,

    // Computed values
    contractBalanceETH: contractBalance ? formatEther(contractBalance) : '0',
    activeStreams: nextStreamId ? Number(nextStreamId) - 1 : 0,
  };
}

/**
 * Hook for getting detailed stream information
 */
export function useStreamDetails(streamId: string | number) {
  const { data: streamData, isLoading } = useContractRead({
    address: CONTRACT_CONFIG.address,
    abi: PAYROLL_STREAM_ABI,
    functionName: 'getStream',
    args: [BigInt(streamId)],
    query: {
      refetchInterval: 3000, // Refetch every 3 seconds for real-time updates
      enabled: !!streamId && streamId !== '0',
    },
  });

  const { data: encryptedEarnedAmount } = useContractRead({
    address: CONTRACT_CONFIG.address,
    abi: PAYROLL_STREAM_ABI,
    functionName: 'getEncryptedEarnedAmount',
    args: [BigInt(streamId)],
    query: {
      refetchInterval: 5000,
      enabled: !!streamId && streamId !== '0',
    },
  });

  const stream = useMemo(() => {
    if (!streamData) return null;

    const [employer, employee, duration, startTime, totalWithdrawn, active] = streamData as [
      string,
      string,
      bigint,
      bigint,
      bigint,
      boolean
    ];

    const currentTime = BigInt(Math.floor(Date.now() / 1000));
    const elapsed = currentTime - startTime;
    const streamEndTime = startTime + duration;
    const isExpired = currentTime > streamEndTime;

    // Calculate earned amount based on elapsed time and duration
    const totalAmount = duration > 0n ? totalWithdrawn + (elapsed * totalWithdrawn) / duration : totalWithdrawn;
    const earned = isExpired ? totalWithdrawn : (elapsed > 0n ? (elapsed * totalWithdrawn) / duration : 0n);
    const remaining = totalAmount - earned;

    return {
      id: streamId.toString(),
      employer,
      employee,
      duration: Number(duration),
      startTime: Number(startTime),
      endTime: Number(streamEndTime),
      totalWithdrawn: formatEther(totalWithdrawn),
      totalAmount: formatEther(totalAmount),
      earned: formatEther(earned),
      remaining: formatEther(remaining),
      active: active && !isExpired,
      isExpired,
      encryptedEarnedAmount,
      progress: duration > 0 ? Number((elapsed * 100n) / duration) : 0,
    };
  }, [streamData, encryptedEarnedAmount, streamId]);

  return {
    stream,
    isLoading,
    encryptedEarnedAmount,
  };
}

/**
 * Hook for getting all streams for an employer
 */
export function useEmployerStreams(employerAddress?: string) {
  const { address } = useAccount();
  const targetAddress = employerAddress || address;

  const { data: streamIds, isLoading: isLoadingIds } = useContractRead({
    address: CONTRACT_CONFIG.address,
    abi: PAYROLL_STREAM_ABI,
    functionName: 'getEmployerStreams',
    args: [targetAddress],
    query: {
      refetchInterval: 10000,
      enabled: !!targetAddress,
    },
  });

  const streamIdsArray = useMemo(() => {
    if (!streamIds || !Array.isArray(streamIds)) return [];
    return streamIds.map((id: bigint) => id.toString());
  }, [streamIds]);

  // Fetch details for each stream
  const streams = useMemo(() => {
    return streamIdsArray.map(id => useStreamDetails(id));
  }, [streamIdsArray]);

  const isLoading = isLoadingIds || streams.some(s => s.isLoading);

  const allStreams = useMemo(() => {
    return streams
      .map(s => s.stream)
      .filter((stream): stream is NonNullable<typeof stream> => stream !== null);
  }, [streams]);

  const activeStreams = useMemo(() => {
    return allStreams.filter(stream => stream.active);
  }, [allStreams]);

  const pausedStreams = useMemo(() => {
    return allStreams.filter(stream => !stream.active && !stream.isExpired);
  }, [allStreams]);

  const completedStreams = useMemo(() => {
    return allStreams.filter(stream => stream.isExpired);
  }, [allStreams]);

  const totalPayroll = useMemo(() => {
    return allStreams.reduce((total, stream) => total + parseFloat(stream.totalAmount), 0);
  }, [allStreams]);

  const totalEarned = useMemo(() => {
    return allStreams.reduce((total, stream) => total + parseFloat(stream.earned), 0);
  }, [allStreams]);

  return {
    streams: allStreams,
    activeStreams,
    pausedStreams,
    completedStreams,
    totalPayroll,
    totalEarned,
    isLoading,
    streamCount: allStreams.length,
  };
}

/**
 * Hook for getting all streams for an employee
 */
export function useEmployeeStreams(employeeAddress?: string) {
  const { address } = useAccount();
  const targetAddress = employeeAddress || address;

  const { data: streamIds, isLoading: isLoadingIds } = useContractRead({
    address: CONTRACT_CONFIG.address,
    abi: PAYROLL_STREAM_ABI,
    functionName: 'getEmployeeStreams',
    args: [targetAddress],
    query: {
      refetchInterval: 8000,
      enabled: !!targetAddress,
    },
  });

  const streamIdsArray = useMemo(() => {
    if (!streamIds || !Array.isArray(streamIds)) return [];
    return streamIds.map((id: bigint) => id.toString());
  }, [streamIds]);

  // Fetch details for each stream
  const streams = useMemo(() => {
    return streamIdsArray.map(id => useStreamDetails(id));
  }, [streamIdsArray]);

  const isLoading = isLoadingIds || streams.some(s => s.isLoading);

  const allStreams = useMemo(() => {
    return streams
      .map(s => s.stream)
      .filter((stream): stream is NonNullable<typeof stream> => stream !== null);
  }, [streams]);

  const activeStreams = useMemo(() => {
    return allStreams.filter(stream => stream.active);
  }, [allStreams]);

  const totalEarned = useMemo(() => {
    return allStreams.reduce((total, stream) => total + parseFloat(stream.earned), 0);
  }, [allStreams]);

  const totalRemaining = useMemo(() => {
    return allStreams.reduce((total, stream) => total + parseFloat(stream.remaining), 0);
  }, [allStreams]);

  return {
    streams: allStreams,
    activeStreams,
    totalEarned,
    totalRemaining,
    isLoading,
    streamCount: allStreams.length,
  };
}

/**
 * Hook for getting withdrawal requests
 */
export function useWithdrawalRequests() {
  const { data: requests, isLoading } = useContractRead({
    address: CONTRACT_CONFIG.address,
    abi: PAYROLL_STREAM_ABI,
    functionName: 'getWithdrawalRequests',
    query: {
      refetchInterval: 5000,
    },
  });

  const processedRequests = useMemo(() => {
    if (!requests || !Array.isArray(requests)) return [];
    return requests.filter((request: any) => request.processed);
  }, [requests]);

  const pendingRequests = useMemo(() => {
    if (!requests || !Array.isArray(requests)) return [];
    return requests.filter((request: any) => !request.processed);
  }, [requests]);

  return {
    requests: requests || [],
    processedRequests,
    pendingRequests,
    pendingCount: pendingRequests.length,
    isLoading,
  };
}

/**
 * Hook for real-time metrics
 */
export function useRealtimeMetrics(employerAddress?: string) {
  const {
    nextStreamId,
    contractBalance,
    isPaused,
    contractBalanceETH
  } = useContractData();

  const {
    streams,
    activeStreams,
    totalPayroll,
    totalEarned,
    isLoading
  } = useEmployerStreams(employerAddress);

  const { pendingRequests } = useWithdrawalRequests();

  // Calculate additional metrics
  const monthlyGrowth = useMemo(() => {
    if (streams.length < 2) return 0;

    const oneMonthAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const recentStreams = streams.filter(s => s.startTime * 1000 > oneMonthAgo);

    return recentStreams.length > 0 ? (recentStreams.length / streams.length) * 100 : 0;
  }, [streams]);

  const averageSalary = useMemo(() => {
    if (streams.length === 0) return 0;
    return totalPayroll / streams.length;
  }, [streams, totalPayroll]);

  const coverageRate = useMemo(() => {
    if (streams.length === 0) return 0;
    return (activeStreams.length / streams.length) * 100;
  }, [streams, activeStreams]);

  return {
    // Basic metrics
    totalStreams: streams.length,
    activeStreams: activeStreams.length,
    pausedStreams: streams.length - activeStreams.length,
    totalPayroll,
    totalEarned,
    averageSalary,

    // Contract metrics
    contractBalance: contractBalanceETH,
    isPaused,
    pendingWithdrawals: pendingRequests.length,

    // Calculated metrics
    monthlyGrowth,
    coverageRate,

    // Status
    isLoading,
    lastUpdate: Date.now(),
  };
}