'use client';

import { useAccount } from 'wagmi';
import { usePayrollStream } from '@/hooks/usePayrollStream';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import {
  DollarSign,
  Download,
  Calendar,
  Clock,
  Building,
  TrendingUp,
  Wallet,
  AlertCircle
} from 'lucide-react';
import { formatEther, formatAddress } from 'viem';
import { toast } from 'sonner';

export default function EmployeeDashboard() {
  const { isConnected, address } = useAccount();
  const {
    employeeStreams,
    loading,
    error,
    requestWithdrawal,
    refreshStreams,
    formatSalaryAmount
  } = usePayrollStream();

  const handleWithdrawal = async (streamId: bigint) => {
    try {
      await requestWithdrawal(streamId);
      toast.success('Withdrawal request submitted successfully!');
    } catch (error) {
      console.error('Withdrawal failed:', error);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Connect Your Wallet</h2>
              <p className="text-gray-600">Please connect your wallet to view your employee dashboard</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading && employeeStreams.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <h1 className="text-2xl font-bold text-gray-900">Employee Dashboard</h1>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </div>
    );
  }

  // Calculate total stats
  const totalEarned = employeeStreams.reduce((sum, stream) => sum + (stream.earnedAmount || 0n), 0n);
  const totalAvailable = employeeStreams.reduce((sum, stream) => sum + (stream.availableAmount || 0n), 0n);
  const activeStreams = employeeStreams.filter(stream => stream.active).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">Employee Dashboard</h1>
            <Button
              variant="outline"
              onClick={refreshStreams}
              disabled={loading}
            >
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Display */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 text-red-700">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <TrendingUp className="w-4 h-4 mr-2" />
                Total Earned
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatEther(totalEarned)} ETH
              </div>
              <p className="text-xs text-gray-500 mt-1">
                From {employeeStreams.length} stream{employeeStreams.length !== 1 ? 's' : ''}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <Download className="w-4 h-4 mr-2" />
                Available to Withdraw
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatEther(totalAvailable)} ETH
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Ready for withdrawal
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Active Streams
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {activeStreams}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Currently active
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Streams List */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Your Payroll Streams</h2>
            {employeeStreams.length > 0 && (
              <span className="text-sm text-gray-500">
                {employeeStreams.length} stream{employeeStreams.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {employeeStreams.length === 0 ? (
            <Card>
              <CardContent className="pt-6 pb-6">
                <div className="text-center">
                  <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Payroll Streams Yet</h3>
                  <p className="text-gray-500">
                    You don't have any active payroll streams. Check back later or contact your employer.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {employeeStreams.map((stream) => {
                const canWithdraw = stream.availableAmount && stream.availableAmount > 0n;
                const progress = stream.duration
                  ? Math.min((Number(BigInt(Math.floor(Date.now() / 1000)) - stream.startTime) / Number(stream.duration)) * 100, 100)
                  : 0;

                return (
                  <Card key={stream.id.toString()} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg flex items-center">
                            <Building className="w-5 h-5 mr-2 text-gray-500" />
                            {formatAddress(stream.employer)}
                          </CardTitle>
                          <p className="text-sm text-gray-500 mt-1">
                            Stream ID: #{stream.id.toString()}
                          </p>
                        </div>
                        <StatusBadge
                          status={stream.active ? 'active' : 'paused'}
                          size="sm"
                        />
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Financial Info */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500 flex items-center">
                            <DollarSign className="w-3 h-3 mr-1" />
                            Total Earned
                          </p>
                          <p className="font-semibold">
                            {stream.earnedAmount ? formatEther(stream.earnedAmount) : '0'} ETH
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 flex items-center">
                            <Download className="w-3 h-3 mr-1" />
                            Available
                          </p>
                          <p className="font-semibold text-green-600">
                            {stream.availableAmount ? formatEther(stream.availableAmount) : '0'} ETH
                          </p>
                        </div>
                      </div>

                      {/* Progress */}
                      <div>
                        <div className="flex justify-between items-center text-sm mb-2">
                          <span className="text-gray-500">Stream Progress</span>
                          <span className="font-medium">{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Time Info */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500 flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            Started
                          </p>
                          <p className="font-medium">
                            {new Date(Number(stream.startTime) * 1000).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            Duration
                          </p>
                          <p className="font-medium">
                            {stream.duration ? Math.round(Number(stream.duration) / 86400) : 0} days
                          </p>
                        </div>
                      </div>

                      {/* Withdrawn Amount */}
                      {stream.totalWithdrawn > 0n && (
                        <div className="text-sm">
                          <p className="text-gray-500">Already Withdrawn</p>
                          <p className="font-medium text-gray-700">
                            {formatEther(stream.totalWithdrawn)} ETH
                          </p>
                        </div>
                      )}
                    </CardContent>

                    {/* Action Buttons */}
                    <div className="px-6 pb-6 pt-2">
                      <Button
                        onClick={() => handleWithdrawal(stream.id)}
                        disabled={!canWithdraw || loading}
                        className="w-full"
                        variant={canWithdraw ? "default" : "secondary"}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        {canWithdraw ? 'Withdraw Available' : 'No Funds Available'}
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}