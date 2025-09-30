'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft,
  DollarSign, 
  Clock, 
  Calendar,
  User,
  Building,
  Play,
  Pause,
  Download,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Loader,
  TrendingUp,
  Activity
} from 'lucide-react';
// import { useAppStore } from '@/store/useAppStore';

interface StreamDetails {
  id: string;
  employer: string;
  employee: string;
  employerName: string;
  employeeName: string;
  salaryAmount: string;
  earnedAmount: string;
  withdrawnAmount: string;
  remainingAmount: string;
  duration: number;
  startTime: number;
  endTime: number;
  active: boolean;
  progress: number;
  withdrawalHistory: WithdrawalRecord[];
  streamEvents: StreamEvent[];
}

interface WithdrawalRecord {
  id: string;
  amount: string;
  timestamp: number;
  txHash: string;
  status: 'completed' | 'failed';
}

interface StreamEvent {
  id: string;
  type: 'created' | 'paused' | 'resumed' | 'withdrawal' | 'completed';
  timestamp: number;
  description: string;
  txHash?: string;
}

export default function StreamDetailsPage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const params = useParams();
  const streamId = params.id as string;
  const [showBalances, setShowBalances] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<'employer' | 'employee' | null>(null);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  // Mock stream data
  const [streamDetails, setStreamDetails] = useState<StreamDetails | null>(null);

  useEffect(() => {
    if (!isConnected) {
      router.push('/');
      return;
    }

    // Simulate loading stream details
    const loadStreamDetails = async () => {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockStream: StreamDetails = {
        id: streamId,
        employer: '0x1234567890123456789012345678901234567890',
        employee: '0x742d35Cc6634C0532925a3b8D4C9db4C4C4C4C4C',
        employerName: 'TechCorp Inc.',
        employeeName: 'Alice Johnson',
        salaryAmount: '***encrypted***',
        earnedAmount: '***encrypted***',
        withdrawnAmount: '***encrypted***',
        remainingAmount: '***encrypted***',
        duration: 2592000, // 30 days
        startTime: Date.now() - 86400000 * 15, // 15 days ago
        endTime: Date.now() + 86400000 * 15, // 15 days from now
        active: true,
        progress: 50,
        withdrawalHistory: [
          {
            id: '1',
            amount: '***encrypted***',
            timestamp: Date.now() - 86400000 * 2,
            txHash: '0xabcd1234567890abcdef1234567890abcdef1234',
            status: 'completed'
          },
          {
            id: '2',
            amount: '***encrypted***',
            timestamp: Date.now() - 86400000 * 7,
            txHash: '0xefgh5678901234567890abcdef1234567890abcd',
            status: 'completed'
          }
        ],
        streamEvents: [
          {
            id: '1',
            type: 'created',
            timestamp: Date.now() - 86400000 * 15,
            description: 'Salary stream created',
            txHash: '0x1234567890abcdef1234567890abcdef12345678'
          },
          {
            id: '2',
            type: 'withdrawal',
            timestamp: Date.now() - 86400000 * 7,
            description: 'Employee withdrew earned salary',
            txHash: '0xefgh5678901234567890abcdef1234567890abcd'
          },
          {
            id: '3',
            type: 'withdrawal',
            timestamp: Date.now() - 86400000 * 2,
            description: 'Employee withdrew earned salary',
            txHash: '0xabcd1234567890abcdef1234567890abcdef1234'
          }
        ]
      };
      
      setStreamDetails(mockStream);
      
      // Determine user role
      if (address?.toLowerCase() === mockStream.employer.toLowerCase()) {
        setUserRole('employer');
      } else if (address?.toLowerCase() === mockStream.employee.toLowerCase()) {
        setUserRole('employee');
      }
      
      setIsLoading(false);
    };

    loadStreamDetails();
  }, [isConnected, router, streamId, address]);

  const handleToggleStream = async () => {
    if (!streamDetails || userRole !== 'employer') return;
    
    setIsToggling(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setStreamDetails(prev => prev ? {
        ...prev,
        active: !prev.active,
        streamEvents: [
          {
            id: Date.now().toString(),
            type: prev.active ? 'paused' : 'resumed',
            timestamp: Date.now(),
            description: `Stream ${prev.active ? 'paused' : 'resumed'} by employer`,
            txHash: '0x' + Math.random().toString(16).substr(2, 40)
          },
          ...prev.streamEvents
        ]
      } : null);
    } catch (error) {
      console.error('Error toggling stream:', error);
    } finally {
      setIsToggling(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawalAmount || !streamDetails || userRole !== 'employee') return;
    
    setIsWithdrawing(true);
    try {
      // Simulate withdrawal process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const newWithdrawal: WithdrawalRecord = {
        id: Date.now().toString(),
        amount: '***encrypted***',
        timestamp: Date.now(),
        txHash: '0x' + Math.random().toString(16).substr(2, 40),
        status: 'completed'
      };
      
      const newEvent: StreamEvent = {
        id: Date.now().toString(),
        type: 'withdrawal',
        timestamp: Date.now(),
        description: 'Employee withdrew earned salary',
        txHash: newWithdrawal.txHash
      };
      
      setStreamDetails(prev => prev ? {
        ...prev,
        withdrawalHistory: [newWithdrawal, ...prev.withdrawalHistory],
        streamEvents: [newEvent, ...prev.streamEvents]
      } : null);
      
      setWithdrawalAmount('');
      setShowWithdrawModal(false);
      
    } catch (error) {
      console.error('Withdrawal failed:', error);
    } finally {
      setIsWithdrawing(false);
    }
  };

  const getEventIcon = (type: StreamEvent['type']) => {
    switch (type) {
      case 'created':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-red-500" />;
      case 'resumed':
        return <Play className="h-4 w-4 text-green-500" />;
      case 'withdrawal':
        return <Download className="h-4 w-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  if (!isConnected) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading stream details...</p>
        </div>
      </div>
    );
  }

  if (!streamDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Stream Not Found</h2>
          <p className="text-gray-600 mb-4">The requested salary stream could not be found.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="text-gray-500 hover:text-gray-700 flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Stream Details</h1>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                streamDetails.active 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {streamDetails.active ? 'Active' : 'Paused'}
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowBalances(!showBalances)}
                className="flex items-center space-x-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {showBalances ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                <span>{showBalances ? 'Hide' : 'Show'} Amounts</span>
              </button>
              
              {userRole === 'employer' && (
                <button
                  onClick={handleToggleStream}
                  disabled={isToggling}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    streamDetails.active
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  } disabled:opacity-50`}
                >
                  {isToggling ? (
                    <Loader className="h-4 w-4 animate-spin" />
                  ) : streamDetails.active ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                  <span>{isToggling ? 'Processing...' : (streamDetails.active ? 'Pause' : 'Resume')}</span>
                </button>
              )}
              
              {userRole === 'employee' && streamDetails.active && (
                <button
                  onClick={() => setShowWithdrawModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span>Withdraw</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stream Overview */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Stream Overview</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Participants */}
            <div className="space-y-6">
              <div className="flex items-start space-x-3">
                <Building className="h-5 w-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Employer</p>
                  <p className="font-medium text-gray-900">{streamDetails.employerName}</p>
                  <p className="text-sm text-gray-500">
                    {streamDetails.employer.slice(0, 10)}...{streamDetails.employer.slice(-8)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <User className="h-5 w-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Employee</p>
                  <p className="font-medium text-gray-900">{streamDetails.employeeName}</p>
                  <p className="text-sm text-gray-500">
                    {streamDetails.employee.slice(0, 10)}...{streamDetails.employee.slice(-8)}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Stream Info */}
            <div className="space-y-6">
              <div className="flex items-start space-x-3">
                <Calendar className="h-5 w-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="font-medium text-gray-900">
                    {Math.floor(streamDetails.duration / 86400)} days
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(streamDetails.startTime).toLocaleDateString()} - {new Date(streamDetails.endTime).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <DollarSign className="h-5 w-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Total Salary</p>
                  <p className="font-medium text-gray-900">
                    {showBalances ? '5.0 ETH' : streamDetails.salaryAmount}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Stream Progress</p>
              <p className="text-sm font-medium text-gray-900">{streamDetails.progress}%</p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-blue-600 h-3 rounded-full transition-all duration-300" 
                style={{ width: `${streamDetails.progress}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Started</span>
              <span>Current</span>
              <span>Ends</span>
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Earned Amount</p>
                <p className="text-xl font-bold text-gray-900">
                  {showBalances ? '2.5 ETH' : streamDetails.earnedAmount}
                </p>
              </div>
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Withdrawn</p>
                <p className="text-xl font-bold text-gray-900">
                  {showBalances ? '1.2 ETH' : streamDetails.withdrawnAmount}
                </p>
              </div>
              <Download className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Available</p>
                <p className="text-xl font-bold text-gray-900">
                  {showBalances ? '1.3 ETH' : '***encrypted***'}
                </p>
              </div>
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Remaining</p>
                <p className="text-xl font-bold text-gray-900">
                  {showBalances ? '2.5 ETH' : streamDetails.remainingAmount}
                </p>
              </div>
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Withdrawal History */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Withdrawal History</h3>
            </div>
            
            {streamDetails.withdrawalHistory.length === 0 ? (
              <div className="text-center py-8">
                <Download className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">No withdrawals yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {streamDetails.withdrawalHistory.map((withdrawal) => (
                  <div key={withdrawal.id} className="px-6 py-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        {showBalances ? '0.6 ETH' : withdrawal.amount}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(withdrawal.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        {withdrawal.status}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {withdrawal.txHash.slice(0, 10)}...{withdrawal.txHash.slice(-8)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Stream Events */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Stream Activity</h3>
            </div>
            
            <div className="px-6 py-4 max-h-96 overflow-y-auto">
              <div className="space-y-4">
                {streamDetails.streamEvents.map((event) => (
                  <div key={event.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {getEventIcon(event.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{event.description}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(event.timestamp).toLocaleString()}
                      </p>
                      {event.txHash && (
                        <p className="text-xs text-blue-600 hover:text-blue-800 cursor-pointer">
                          {event.txHash.slice(0, 10)}...{event.txHash.slice(-8)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Withdrawal Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Withdraw Earnings</h2>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Available Balance</p>
                <p className="text-2xl font-bold text-gray-900">
                  {showBalances ? '1.3 ETH' : '***encrypted***'}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Withdrawal Amount (ETH)
                </label>
                <input
                  type="number"
                  step="0.001"
                  max={showBalances ? "1.3" : undefined}
                  value={withdrawalAmount}
                  onChange={(e) => setWithdrawalAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.0"
                />
              </div>
              
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">FHE Decryption Required</p>
                    <p>This withdrawal will trigger encrypted balance decryption via the FHE Gateway.</p>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  disabled={isWithdrawing}
                >
                  Cancel
                </button>
                <button
                  onClick={handleWithdraw}
                  disabled={!withdrawalAmount || isWithdrawing}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {isWithdrawing ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>Withdraw</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}