'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount, useContractRead, useWatchContractEvent } from 'wagmi';
import { CONTRACT_CONFIG } from '@/lib/wagmi';
import { PAYROLL_STREAM_ABI } from '@/config/blockchain';
import { formatEther } from 'viem';

export interface Stream {
  id: string;
  employee: string;
  employeeName: string;
  department: string;
  amount: string;
  encryptedAmount: string;
  duration: number;
  startTime: number;
  endTime: number;
  isPaused: boolean;
  earned: string;
  remaining: string;
  lastWithdrawal: number;
  status: 'active' | 'paused' | 'completed' | 'expired';
}

export interface StreamEvent {
  type: 'created' | 'paused' | 'resumed' | 'withdrawal' | 'completed' | 'expired';
  streamId: string;
  timestamp: number;
  data?: any;
}

export function useStreamMonitor(employerAddress?: string) {
  const { address } = useAccount();
  const [streams, setStreams] = useState<Stream[]>([]);
  const [events, setEvents] = useState<StreamEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());

  // Watch for stream creation events
  useWatchContractEvent({
    address: CONTRACT_CONFIG.address,
    abi: PAYROLL_STREAM_ABI,
    eventName: 'StreamCreated',
    onLogs: (logs) => {
      logs.forEach((log) => {
        const event: StreamEvent = {
          type: 'created',
          streamId: log.args.streamId?.toString() || '0',
          timestamp: Date.now(),
          data: {
            employee: log.args.employee,
            employer: log.args.employer,
            duration: log.args.duration?.toString()
          }
        };

        setEvents(prev => [event, ...prev]);
        setLastUpdate(Date.now());
        fetchStreams(); // Refresh streams when new stream is created
      });
    },
  });

  // Watch for withdrawal events
  useWatchContractEvent({
    address: CONTRACT_CONFIG.address,
    abi: PAYROLL_STREAM_ABI,
    eventName: 'WithdrawalRequested',
    onLogs: (logs) => {
      logs.forEach((log) => {
        const event: StreamEvent = {
          type: 'withdrawal',
          streamId: log.args.streamId?.toString() || '0',
          timestamp: Date.now(),
          data: {
            employee: log.args.employee,
            amount: log.args.amount?.toString()
          }
        };

        setEvents(prev => [event, ...prev]);
        setLastUpdate(Date.now());
      });
    },
  });

  // Watch for pause/resume events
  useWatchContractEvent({
    address: CONTRACT_CONFIG.address,
    abi: PAYROLL_STREAM_ABI,
    eventName: 'StreamPaused',
    onLogs: (logs) => {
      logs.forEach((log) => {
        const event: StreamEvent = {
          type: 'paused',
          streamId: log.args.streamId?.toString() || '0',
          timestamp: Date.now(),
          data: {
            pausedBy: log.args.pausedBy
          }
        };

        setEvents(prev => [event, ...prev]);
        setLastUpdate(Date.now());
        updateStreamStatus(log.args.streamId?.toString() || '0', 'paused');
      });
    },
  });

  useWatchContractEvent({
    address: CONTRACT_CONFIG.address,
    abi: PAYROLL_STREAM_ABI,
    eventName: 'StreamResumed',
    onLogs: (logs) => {
      logs.forEach((log) => {
        const event: StreamEvent = {
          type: 'resumed',
          streamId: log.args.streamId?.toString() || '0',
          timestamp: Date.now(),
          data: {
            resumedBy: log.args.resumedBy
          }
        };

        setEvents(prev => [event, ...prev]);
        setLastUpdate(Date.now());
        updateStreamStatus(log.args.streamId?.toString() || '0', 'active');
      });
    },
  });

  const fetchStreams = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const targetAddress = employerAddress || address;
      if (!targetAddress) {
        setStreams([]);
        return;
      }

      // Import the real contract data hook
      const { useEmployerStreams } = await import('./useContractData');

      // Get real blockchain data
      const { streams: contractStreams, isLoading } = useEmployerStreams(targetAddress);

      if (isLoading) {
        return; // Wait for data to load
      }

      // Transform contract data to Stream format
      const transformedStreams: Stream[] = contractStreams.map(stream => ({
        id: stream.id,
        employee: stream.employee,
        employeeName: `Employee ${stream.employee.slice(0, 6)}...${stream.employee.slice(-4)}`, // Placeholder name
        department: 'Engineering', // Default department - would need additional data source
        amount: stream.totalAmount,
        encryptedAmount: stream.encryptedEarnedAmount || '0x0',
        duration: stream.duration,
        startTime: stream.startTime,
        endTime: stream.endTime,
        isPaused: !stream.active,
        earned: stream.earned,
        remaining: stream.remaining,
        lastWithdrawal: Math.floor(Date.now() / 1000) - 3600, // Mock withdrawal time - would need real data
        status: stream.active ? 'active' : stream.isExpired ? 'completed' : 'paused'
      }));

      setStreams(transformedStreams);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch streams';
      setError(errorMessage);
      console.error('Stream monitoring error:', err);
      setStreams([]); // Set empty array instead of mock data
    } finally {
      setIsLoading(false);
    }
  }, [address, employerAddress]);

  const updateStreamStatus = useCallback((streamId: string, status: Stream['status']) => {
    setStreams(prev => prev.map(stream =>
      stream.id === streamId ? { ...stream, status } : stream
    ));
  }, []);

  const getStreamById = useCallback((streamId: string) => {
    return streams.find(stream => stream.id === streamId);
  }, [streams]);

  const getActiveStreams = useCallback(() => {
    return streams.filter(stream => stream.status === 'active');
  }, [streams]);

  const getPausedStreams = useCallback(() => {
    return streams.filter(stream => stream.status === 'paused');
  }, [streams]);

  const getTotalPayroll = useCallback(() => {
    return streams.reduce((total, stream) => total + parseFloat(stream.amount), 0);
  }, [streams]);

  const getTotalEarned = useCallback(() => {
    return streams.reduce((total, stream) => total + parseFloat(stream.earned), 0);
  }, [streams]);

  const getRecentEvents = useCallback((limit: number = 10) => {
    return events.slice(0, limit);
  }, [events]);

  // Initial fetch
  useEffect(() => {
    fetchStreams();
  }, [fetchStreams]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchStreams();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchStreams]);

  return {
    // Data
    streams,
    events,
    lastUpdate,

    // Computed values
    activeStreams: getActiveStreams(),
    pausedStreams: getPausedStreams(),
    totalPayroll: getTotalPayroll(),
    totalEarned: getTotalEarned(),
    recentEvents: getRecentEvents(),

    // State
    isLoading,
    error,

    // Functions
    fetchStreams,
    getStreamById,
    refresh: () => {
      setLastUpdate(Date.now());
      fetchStreams();
    }
  };
}

// Hook for monitoring a single stream
export function useSingleStreamMonitor(streamId: string) {
  const [stream, setStream] = useState<Stream | null>(null);
  const [events, setEvents] = useState<StreamEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Watch for events specific to this stream
  useWatchContractEvent({
    address: CONTRACT_CONFIG.address,
    abi: PAYROLL_STREAM_ABI,
    eventName: 'WithdrawalRequested',
    onLogs: (logs) => {
      logs.forEach((log) => {
        if (log.args.streamId?.toString() === streamId) {
          const event: StreamEvent = {
            type: 'withdrawal',
            streamId,
            timestamp: Date.now(),
            data: {
              employee: log.args.employee,
              amount: log.args.amount?.toString()
            }
          };

          setEvents(prev => [event, ...prev]);
        }
      });
    },
  });

  const fetchStream = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!streamId || streamId === '0') {
        setStream(null);
        return;
      }

      // Import the real contract data hook
      const { useStreamDetails } = await import('./useContractData');

      // Get real blockchain data
      const { stream: contractStream } = useStreamDetails(streamId);

      if (!contractStream) {
        setStream(null);
        return;
      }

      // Transform contract data to Stream format
      const transformedStream: Stream = {
        id: contractStream.id,
        employee: contractStream.employee,
        employeeName: `Employee ${contractStream.employee.slice(0, 6)}...${contractStream.employee.slice(-4)}`,
        department: 'Engineering', // Default department
        amount: contractStream.totalAmount,
        encryptedAmount: contractStream.encryptedEarnedAmount || '0x0',
        duration: contractStream.duration,
        startTime: contractStream.startTime,
        endTime: contractStream.endTime,
        isPaused: !contractStream.active,
        earned: contractStream.earned,
        remaining: contractStream.remaining,
        lastWithdrawal: Math.floor(Date.now() / 1000) - 3600, // Mock withdrawal time - would need real data
        status: contractStream.active ? 'active' : contractStream.isExpired ? 'completed' : 'paused'
      };

      setStream(transformedStream);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch stream';
      setError(errorMessage);
      console.error('Single stream monitoring error:', err);
      setStream(null);
    } finally {
      setIsLoading(false);
    }
  }, [streamId]);

  useEffect(() => {
    if (streamId) {
      fetchStream();
    }
  }, [streamId, fetchStream]);

  // Auto-refresh every 10 seconds for active streams
  useEffect(() => {
    if (!stream || stream.status !== 'active') return;

    const interval = setInterval(() => {
      fetchStream();
    }, 10000);

    return () => clearInterval(interval);
  }, [stream, fetchStream]);

  return {
    stream,
    events,
    isLoading,
    error,
    refresh: fetchStream
  };
}