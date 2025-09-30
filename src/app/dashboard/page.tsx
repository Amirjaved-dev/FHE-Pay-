'use client';

import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Shield, Users, User, ArrowRight } from 'lucide-react';
import { useEmployerStreams, useEmployeeStreams } from '@/hooks/useContractData';

export default function Dashboard() {
  const { isConnected, address } = useAccount();
  const router = useRouter();
  const [userType, setUserType] = useState<'employer' | 'employee' | null>(null);
  const [isCheckingConnection, setIsCheckingConnection] = useState(true);

  // Get real contract data
  const { streams: employerStreamsData } = useEmployerStreams(address);
  const { streams: employeeStreamsData } = useEmployeeStreams(address);

  useEffect(() => {
    // Add a small delay to allow wagmi to properly initialize
    const checkConnection = setTimeout(() => {
      setIsCheckingConnection(false);
      if (!isConnected || !address) {
        router.push('/');
        return;
      }

      // Check if user has existing streams to determine their role
      const hasEmployerStreams = employerStreamsData.length > 0;
      const hasEmployeeStreams = employeeStreamsData.length > 0;

      if (hasEmployerStreams && !hasEmployeeStreams) {
        setUserType('employer');
      } else if (hasEmployeeStreams && !hasEmployerStreams) {
        setUserType('employee');
      }
    }, 1000); // 1 second delay

    return () => clearTimeout(checkConnection);
  }, [isConnected, address, router, employerStreamsData, employeeStreamsData]);

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

  const handleRoleSelection = (role: 'employer' | 'employee') => {
    setUserType(role);
    router.push(`/dashboard/${role}`);
  };

  const handleContinue = () => {
    if (userType) {
      router.push(`/dashboard/${userType}`);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">Please connect your wallet to access the dashboard.</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (userType) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-6">
            <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back!</h1>
            <p className="text-gray-600">
              Continue to your {userType} dashboard
            </p>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <div className="flex items-center space-x-3">
              {userType === 'employer' ? (
                <Users className="h-8 w-8 text-blue-600" />
              ) : (
                <User className="h-8 w-8 text-blue-600" />
              )}
              <div>
                <h3 className="font-semibold text-gray-900 capitalize">{userType} Dashboard</h3>
                <p className="text-sm text-gray-600">
                  {userType === 'employer' 
                    ? 'Manage salary streams and employees'
                    : 'View your earnings and withdraw funds'
                  }
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleContinue}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
          >
            <span>Continue</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <Shield className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Choose Your Role</h1>
          <p className="text-gray-600">
            Select how you&apos;ll be using FHE-Pay to get started
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Employer Option */}
          <div 
            onClick={() => handleRoleSelection('employer')}
            className="border-2 border-gray-200 hover:border-blue-500 rounded-lg p-6 cursor-pointer transition-all hover:shadow-md group"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 group-hover:bg-blue-200 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Employer</h3>
              <p className="text-gray-600 mb-4">
                Create and manage salary streams for your employees with complete privacy
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Create encrypted salary streams</li>
                <li>• Manage multiple employees</li>
                <li>• Track stream analytics</li>
                <li>• Pause/resume streams</li>
              </ul>
            </div>
          </div>

          {/* Employee Option */}
          <div 
            onClick={() => handleRoleSelection('employee')}
            className="border-2 border-gray-200 hover:border-blue-500 rounded-lg p-6 cursor-pointer transition-all hover:shadow-md group"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 group-hover:bg-green-200 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
                <User className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Employee</h3>
              <p className="text-gray-600 mb-4">
                View your encrypted earnings and withdraw your salary in real-time
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• View encrypted earnings</li>
                <li>• Real-time salary streaming</li>
                <li>• Instant withdrawals</li>
                <li>• Complete privacy</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            You can switch between roles anytime from your profile settings
          </p>
        </div>
      </div>
    </div>
  );
}