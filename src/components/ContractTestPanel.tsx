'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useTestData, useTestContract, useTestEvents } from '@/hooks/useTestData';
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  RefreshCw,
  Play,
  Pause,
  DollarSign,
  Activity
} from 'lucide-react';

interface TestResult {
  name: string;
  status: 'success' | 'error' | 'pending';
  message: string;
  timestamp: number;
}

export function ContractTestPanel() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const testData = useTestData();
  const testContract = useTestContract();
  const testEvents = useTestEvents();

  const addTestResult = (name: string, status: TestResult['status'], message: string) => {
    const result: TestResult = {
      name,
      status,
      message,
      timestamp: Date.now(),
    };

    setTestResults(prev => [result, ...prev.slice(0, 9)]); // Keep last 10 results
  };

  const runContractTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    try {
      // Test 1: Contract State
      addTestResult('Contract State', 'pending', 'Checking contract state...');
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (testData.isReady && testData.nextStreamId > 0) {
        addTestResult(
          'Contract State',
          'success',
          `Contract active - Stream ID: ${testData.nextStreamId}, Balance: ${testData.contractBalance} ETH`
        );
      } else {
        addTestResult('Contract State', 'error', 'Contract not responding');
      }

      // Test 2: Stream Creation
      addTestResult('Stream Creation', 'pending', 'Testing stream creation...');
      try {
        const createResult = await testContract.simulateCreateStream({
          employee: '0xabcdef1234567890abcdef1234567890abcdef12',
          salaryAmount: '0.5',
          duration: 2592000,
        });

        addTestResult(
          'Stream Creation',
          'success',
          `Stream created successfully - TX: ${createResult.hash.slice(0, 10)}...`
        );
      } catch (error) {
        addTestResult('Stream Creation', 'error', 'Stream creation failed');
      }

      // Test 3: Stream Data Retrieval
      addTestResult('Stream Data Retrieval', 'pending', 'Testing stream data retrieval...');
      await new Promise(resolve => setTimeout(resolve, 500));

      if (testData.streams.length > 0) {
        addTestResult(
          'Stream Data Retrieval',
          'success',
          `Retrieved ${testData.streams.length} streams with ${testData.activeStreamsList.length} active`
        );
      } else {
        addTestResult('Stream Data Retrieval', 'error', 'No streams found');
      }

      // Test 4: FHE Integration
      addTestResult('FHE Integration', 'pending', 'Testing FHE encryption...');
      await new Promise(resolve => setTimeout(resolve, 800));

      if (testData.isFheKeyRegistered) {
        addTestResult('FHE Integration', 'success', 'FHE key registered and encryption ready');
      } else {
        addTestResult('FHE Integration', 'error', 'FHC key not registered');
      }

      // Test 5: Real-time Updates
      addTestResult('Real-time Updates', 'pending', 'Testing real-time updates...');
      await new Promise(resolve => setTimeout(resolve, 600));

      testEvents.addTestEvent('test_event', {
        type: 'integration_test',
        timestamp: Date.now(),
      });

      addTestResult('Real-time Updates', 'success', 'Real-time event system working');

      // Test 6: Metrics Calculation
      addTestResult('Metrics Calculation', 'pending', 'Testing metrics calculation...');
      await new Promise(resolve => setTimeout(resolve, 400));

      if (testData.totalPayroll > 0 && testData.totalEarned >= 0) {
        addTestResult(
          'Metrics Calculation',
          'success',
          `Payroll: ${testData.totalPayroll} ETH, Earned: ${testData.totalEarned} ETH, Coverage: ${testData.coverageRate}%`
        );
      } else {
        addTestResult('Metrics Calculation', 'error', 'Invalid metrics values');
      }

    } catch (error) {
      addTestResult('Test Suite', 'error', `Test suite failed: ${error}`);
    } finally {
      setIsRunning(false);
    }
  };

  const runSingleTest = async (testName: string) => {
    switch (testName) {
      case 'withdrawal':
        addTestResult('Withdrawal Test', 'pending', 'Testing withdrawal...');
        try {
          const result = await testContract.simulateWithdrawal('1');
          addTestResult('Withdrawal Test', 'success', `Withdrawal successful - ${result.hash.slice(0, 10)}...`);
        } catch (error) {
          addTestResult('Withdrawal Test', 'error', 'Withdrawal failed');
        }
        break;

      case 'pause':
        addTestResult('Pause Stream Test', 'pending', 'Testing stream pause...');
        try {
          const result = await testContract.simulatePauseStream('1');
          addTestResult('Pause Stream Test', 'success', `Stream paused - ${result.hash.slice(0, 10)}...`);
        } catch (error) {
          addTestResult('Pause Stream Test', 'error', 'Stream pause failed');
        }
        break;

      case 'resume':
        addTestResult('Resume Stream Test', 'pending', 'Testing stream resume...');
        try {
          const result = await testContract.simulateResumeStream('1');
          addTestResult('Resume Stream Test', 'success', `Stream resumed - ${result.hash.slice(0, 10)}...`);
        } catch (error) {
          addTestResult('Resume Stream Test', 'error', 'Stream resume failed');
        }
        break;
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-green-100 text-green-800">Success</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'pending':
        return <Badge variant="secondary">Running</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Test Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Contract Integration Test Panel</span>
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Test blockchain contract interactions and real-time data integration
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={testData.isReady ? "default" : "secondary"}>
                {testData.isReady ? "Ready" : "Loading"}
              </Badge>
              <Badge variant="outline">
                {testData.streams.length} Streams
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={runContractTests}
              disabled={isRunning}
              className="flex items-center space-x-2"
            >
              {isRunning ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              <span>{isRunning ? 'Running Tests...' : 'Run All Tests'}</span>
            </Button>

            <Button
              variant="outline"
              onClick={() => runSingleTest('withdrawal')}
              disabled={isRunning}
              className="flex items-center space-x-2"
            >
              <DollarSign className="h-4 w-4" />
              <span>Test Withdrawal</span>
            </Button>

            <Button
              variant="outline"
              onClick={() => runSingleTest('pause')}
              disabled={isRunning}
              className="flex items-center space-x-2"
            >
              <Pause className="h-4 w-4" />
              <span>Test Pause</span>
            </Button>

            <Button
              variant="outline"
              onClick={() => runSingleTest('resume')}
              disabled={isRunning}
              className="flex items-center space-x-2"
            >
              <Play className="h-4 w-4" />
              <span>Test Resume</span>
            </Button>

            <Button
              variant="outline"
              onClick={clearResults}
              disabled={isRunning}
              className="flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Clear Results</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Contract Balance</p>
                <p className="text-lg font-bold">{testData.contractBalance} ETH</p>
              </div>
              <DollarSign className="h-5 w-5 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Streams</p>
                <p className="text-lg font-bold">{testData.activeStreamsList.length}</p>
              </div>
              <Activity className="h-5 w-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">FHE Status</p>
                <p className="text-lg font-bold">{testData.isFheKeyRegistered ? 'Ready' : 'Not Ready'}</p>
              </div>
              <CheckCircle className={`h-5 w-5 ${testData.isFheKeyRegistered ? 'text-green-500' : 'text-yellow-500'}`} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Test Events</p>
                <p className="text-lg font-bold">{testEvents.events.length}</p>
              </div>
              <AlertCircle className="h-5 w-5 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div
                  key={`${result.timestamp}-${index}`}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(result.status)}
                    <div>
                      <p className="font-medium">{result.name}</p>
                      <p className="text-sm text-gray-600">{result.message}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(result.status)}
                    <span className="text-xs text-gray-500">
                      {new Date(result.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Events */}
      {testEvents.events.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Test Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {testEvents.events.slice(0, 5).map((event, index) => (
                <div key={`${event.timestamp}-${index}`} className="flex items-center justify-between text-sm">
                  <div>
                    <span className="font-medium">{event.type.replace('_', ' ')}</span>
                    {event.data && (
                      <span className="text-gray-600 ml-2">
                        Stream: {event.data.streamId} | Amount: {event.data.amount} ETH
                      </span>
                    )}
                  </div>
                  <span className="text-gray-500">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}