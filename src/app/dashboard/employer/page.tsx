'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Users,
  DollarSign,
  TrendingUp,
  Clock,
  AlertCircle,
  Shield,
  Eye,
  Pause,
  Play,
  Settings,
  BarChart3
} from 'lucide-react';

import { usePayrollContract, useToggleStream } from '@/hooks/useContract';
import { useFHE } from '@/hooks/useFHE';
import { useRealtimeMetrics, useEmployerStreams } from '@/hooks/useContractData';
import { BlockchainDataProvider } from '@/components/BlockchainDataProvider';
import CreateStreamModal from '@/components/CreateStreamModal';
import StreamCard, { StreamCardSkeleton } from '@/components/StreamCard';
import EmployeeManagement from '@/components/EmployeeManagement';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import { ContractTestPanel } from '@/components/ContractTestPanel';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { CONTRACT_ADDRESSES } from '@/config/blockchain';
import { formatEther, formatUnits } from 'viem';
import { cn } from '@/lib/utils';

interface StreamData {
  id: string;
  employee: string;
  salaryAmount: string;
  duration: number;
  startTime: number;
  endTime: number;
  active: boolean;
  totalWithdrawn: string;
  earnedAmount?: string;
  lastWithdrawal?: number;
}

export default function EmployerDashboard() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const { getEmployerStreams, getStream, isLoading: contractLoading } = usePayrollContract();
  const { toggleStream, isLoading: toggleLoading } = useToggleStream();
  // Real-time blockchain metrics
  const metrics = useRealtimeMetrics(address);

  // Real employer streams data
  const {
    streams: employerStreamsData,
    isLoading: streamsLoading,
    totalPayroll,
    totalEarned
  } = useEmployerStreams(address);
  const { isReady: fheReady } = useFHE();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCheckingConnection, setIsCheckingConnection] = useState(true);

  useEffect(() => {
    // Add a small delay to allow wagmi to properly initialize
    const checkConnection = setTimeout(() => {
      setIsCheckingConnection(false);
      if (!isConnected || !address) {
        router.push('/');
        return;
      }
    }, 1000); // 1 second delay

    return () => clearTimeout(checkConnection);
  }, [isConnected, address, router]);

  // Show loading state while checking connection
  if (isCheckingConnection) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking connection...</p>
        </div>
      </div>
    );
  }

  const handleToggleStream = async (streamId: string) => {
    try {
      await toggleStream(streamId, false); // The toggle function will determine the current state
      // The hooks will auto-refresh due to their refetch intervals
    } catch (error) {
      console.error('Failed to toggle stream:', error);
    }
  };

  // Calculate stats from real blockchain data only
  const stats = {
    totalStreams: employerStreamsData.length,
    activeStreams: employerStreamsData.filter(s => s.active).length,
    totalEmployees: employerStreamsData ? new Set(employerStreamsData.map(s => s.employee)).size : 0,
    totalPaid: totalEarned.toString(),
    averageSalary: employerStreamsData.length > 0 ? (totalPayroll / employerStreamsData.length).toFixed(4) : '0.0000',
    monthlyGrowth: metrics.monthlyGrowth || 0,
  };

  if (!isConnected) {
    return null;
  }

  return (
    <BlockchainDataProvider employerAddress={address}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Employer Dashboard</h1>
                  <p className="text-sm text-gray-500">Manage payroll and employees</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/dashboard')}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View All
                </Button>
                <Button
                  onClick={() => setShowCreateModal(true)}
                  disabled={!CONTRACT_ADDRESSES.PAYROLL_STREAM}
                  className={!fheReady ? "bg-yellow-600 hover:bg-yellow-700" : ""}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Stream
                  {!fheReady && (
                    <span className="ml-2 text-xs">(Demo Mode)</span>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* FHE Status Warning */}
        {(!fheReady || !CONTRACT_ADDRESSES.PAYROLL_STREAM) && (
          <div className="bg-yellow-50 border-b border-yellow-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                  <p className="text-sm text-yellow-800">
                    {!fheReady
                      ? 'FHE encryption is initializing. Using demo mode for now...'
                      : 'Smart contract not configured. Please check your environment variables.'
                    }
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.location.reload()}
                  className="text-yellow-800 hover:text-yellow-900"
                >
                  Retry
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Dashboard Content with Tabs */}
          <DashboardTabs
            stats={stats}
            streams={employerStreamsData}
            loading={streamsLoading || metrics.isLoading}
            onRefresh={() => {
              // Manual refresh - the hooks auto-refresh already
              console.log('Manual refresh requested');
            }}
            onToggleStream={handleToggleStream}
            onCreateStream={() => setShowCreateModal(true)}
            fheReady={fheReady}
          />
        </div>

        {/* Create Stream Modal */}
        <CreateStreamModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            // Stream created - hooks will auto-refresh
            console.log('Stream created successfully');
          }}
        />
      </div>
    </BlockchainDataProvider>
  );
}

// Dashboard Tabs Component
function DashboardTabs({
  stats,
  streams,
  loading,
  onRefresh,
  onToggleStream,
  onCreateStream,
  fheReady
}: {
  stats: any;
  streams: StreamData[];
  loading: boolean;
  onRefresh: () => void;
  onToggleStream: (streamId: string) => void;
  onCreateStream: () => void;
  fheReady: boolean;
}) {
  const [activeTab, setActiveTab] = useState<'overview' | 'streams' | 'employees' | 'analytics'>('overview');
  const [analyticsTimeRange, setAnalyticsTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'streams', label: 'Streams', icon: Clock },
    { id: 'employees', label: 'Employees', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 }
  ] as const;

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Streams</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalStreams}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.activeStreams} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Employees</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalEmployees}</div>
                <p className="text-xs text-muted-foreground">
                  Currently streaming
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{parseFloat(stats.totalPaid).toFixed(4)} ETH</div>
                <p className="text-xs text-muted-foreground">
                  All time
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Privacy Status</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <Badge variant={fheReady ? "default" : "secondary"}>
                    {fheReady ? "Secure" : "Loading"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  FHE encryption
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button
                  onClick={onCreateStream}
                  className="justify-start"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Stream
                  {!fheReady && (
                    <span className="ml-2 text-xs text-yellow-300">(Demo)</span>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setActiveTab('employees')}
                  className="justify-start"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Manage Employees
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setActiveTab('analytics')}
                  className="justify-start"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Analytics
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.open('https://docs.zama.ai/', '_blank')}
                  className="justify-start"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  FHE Docs
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Streams Preview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Streams</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setActiveTab('streams')}>
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(3)].map((_, i) => (
                    <StreamCardSkeleton key={i} />
                  ))}
                </div>
              ) : streams.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No streams yet</h3>
                  <p className="text-gray-500 mb-4">
                    Create your first encrypted salary stream to get started
                  </p>
                  <Button onClick={onCreateStream}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Stream
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {streams.slice(0, 6).map((stream) => (
                    <StreamCard
                      key={stream.id}
                      stream={{
                        ...stream,
                        employeeName: `Employee ${stream.employee.slice(0, 6)}...`,
                        salaryAmount: stream.salaryAmount,
                        status: stream.active ? 'active' : 'paused',
                        earnedAmount: '0',
                        withdrawnAmount: stream.totalWithdrawn,
                        createdAt: stream.startTime,
                      }}
                      viewType="employer"
                      onToggleStatus={onToggleStream}
                      onViewDetails={(id) => console.log('View details:', id)}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'streams' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">All Streams</h2>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={onRefresh} disabled={loading}>
                <Clock className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={onCreateStream}>
                <Plus className="h-4 w-4 mr-2" />
                Create Stream
                {!fheReady && (
                  <span className="ml-2 text-xs text-yellow-300">(Demo)</span>
                )}
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <StreamCardSkeleton key={i} />
              ))}
            </div>
          ) : streams.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <div className="flex flex-col items-center space-y-4">
                  <div className="p-4 bg-gray-100 rounded-full">
                    <Clock className="h-8 w-8 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No streams yet</h3>
                    <p className="text-gray-500 mb-4">
                      Create your first encrypted salary stream to get started
                    </p>
                    <Button onClick={onCreateStream}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Stream
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {streams.map((stream) => (
                <StreamCard
                  key={stream.id}
                  stream={{
                    ...stream,
                    employeeName: `Employee ${stream.employee.slice(0, 6)}...`,
                    salaryAmount: stream.salaryAmount,
                    status: stream.active ? 'active' : 'paused',
                    earnedAmount: '0',
                    withdrawnAmount: stream.totalWithdrawn,
                    createdAt: stream.startTime,
                  }}
                  viewType="employer"
                  onToggleStatus={onToggleStream}
                  onViewDetails={(id) => console.log('View details:', id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'employees' && (
        <EmployeeManagement
          onEmployeeSelect={(employee) => {
            console.log('Selected employee:', employee);
          }}
        />
      )}

      {activeTab === 'analytics' && (
        <AnalyticsDashboard
          timeRange={analyticsTimeRange}
          onTimeRangeChange={setAnalyticsTimeRange}
        />
      )}
    </div>
  );
}