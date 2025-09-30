'use client';

import React, { ReactNode, useMemo } from 'react';
import { useContractData, useRealtimeMetrics, useEmployerStreams } from '@/hooks/useContractData';
import { useAccount } from 'wagmi';

interface BlockchainDataContextType {
  // Contract state
  nextStreamId: number;
  streamCount: number;
  isPaused: boolean;
  contractBalance: string;
  isFheKeyRegistered: boolean;

  // Real-time metrics
  totalStreams: number;
  activeStreams: number;
  totalPayroll: number;
  totalEarned: number;
  averageSalary: number;
  monthlyGrowth: number;
  coverageRate: number;
  pendingWithdrawals: number;

  // Stream data
  streams: any[];
  isLoading: boolean;
  lastUpdate: number;

  // Actions
  refresh: () => void;
}

const BlockchainDataContext = React.createContext<BlockchainDataContextType | null>(null);

export function useBlockchainData() {
  const context = React.useContext(BlockchainDataContext);
  if (!context) {
    throw new Error('useBlockchainData must be used within BlockchainDataProvider');
  }
  return context;
}

interface BlockchainDataProviderProps {
  children: ReactNode;
  employerAddress?: string;
}

export function BlockchainDataProvider({ children, employerAddress }: BlockchainDataProviderProps) {
  const { address } = useAccount();

  // Get basic contract data
  const contractData = useContractData();

  // Get real-time metrics
  const metrics = useRealtimeMetrics(employerAddress);

  // Get employer streams
  const { streams, isLoading: streamsLoading } = useEmployerStreams(employerAddress);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    // Contract state
    nextStreamId: contractData.nextStreamId,
    streamCount: contractData.streamCount,
    isPaused: contractData.isPaused,
    contractBalance: contractData.contractBalanceETH,
    isFheKeyRegistered: contractData.isFheKeyRegistered,

    // Real-time metrics
    totalStreams: metrics.totalStreams,
    activeStreams: metrics.activeStreams,
    totalPayroll: metrics.totalPayroll,
    totalEarned: metrics.totalEarned,
    averageSalary: metrics.averageSalary,
    monthlyGrowth: metrics.monthlyGrowth,
    coverageRate: metrics.coverageRate,
    pendingWithdrawals: metrics.pendingWithdrawals,

    // Stream data
    streams: streams,
    isLoading: contractData.isLoading || metrics.isLoading || streamsLoading,
    lastUpdate: metrics.lastUpdate,

    // Actions
    refresh: () => {
      // Force refresh of all data by triggering refetch
      window.location.reload();
    },
  }), [contractData, metrics, streams, streamsLoading]);

  return (
    <BlockchainDataContext.Provider value={contextValue}>
      {children}
    </BlockchainDataContext.Provider>
  );
}

// HOC for components that need blockchain data
export function withBlockchainData<P extends object>(
  Component: React.ComponentType<P>
) {
  return function WrappedComponent(props: P) {
    return (
      <BlockchainDataProvider>
        <Component {...props} />
      </BlockchainDataProvider>
    );
  };
}