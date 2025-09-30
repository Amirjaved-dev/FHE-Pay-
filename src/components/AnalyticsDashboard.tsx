'use client';

import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  TrendingUp,
  DollarSign,
  Users,
  Clock,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  BarChart3,
  PieChart as PieChartIcon,
  Activity
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatEth, formatCurrency, formatDate } from '@/utils/format';
import { cn } from '@/utils/helpers';

interface AnalyticsData {
  totalPayroll: number;
  totalEmployees: number;
  activeStreams: number;
  totalPaid: number;
  averageSalary: number;
  monthlyGrowth: number;
  departmentDistribution: Array<{ name: string; value: number; employees: number }>;
  paymentTrends: Array<{ month: string; amount: number; streams: number }>;
  salaryDistribution: Array<{ range: string; count: number; totalAmount: number }>;
  topEarners: Array<{ name: string; amount: number; department: string }>;
  paymentFrequency: Array<{ frequency: string; count: number; percentage: number }>;
}

interface AnalyticsDashboardProps {
  className?: string;
  timeRange?: '7d' | '30d' | '90d' | '1y';
  onTimeRangeChange?: (range: '7d' | '30d' | '90d' | '1y') => void;
}

export default function AnalyticsDashboard({
  className,
  timeRange = '30d',
  onTimeRangeChange
}: AnalyticsDashboardProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<'overview' | 'payroll' | 'employees' | 'trends'>('overview');

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);

      // Mock analytics data - replace with actual data from contract/backend
      const mockData: AnalyticsData = {
        totalPayroll: 12.5,
        totalEmployees: 24,
        activeStreams: 18,
        totalPaid: 145.8,
        averageSalary: 0.52,
        monthlyGrowth: 15.2,
        departmentDistribution: [
          { name: 'Engineering', value: 35, employees: 8 },
          { name: 'Design', value: 20, employees: 5 },
          { name: 'Marketing', value: 25, employees: 6 },
          { name: 'Sales', value: 20, employees: 5 }
        ],
        paymentTrends: [
          { month: 'Jan', amount: 8.5, streams: 12 },
          { month: 'Feb', amount: 9.2, streams: 14 },
          { month: 'Mar', amount: 10.1, streams: 15 },
          { month: 'Apr', amount: 11.3, streams: 16 },
          { month: 'May', amount: 12.5, streams: 18 },
          { month: 'Jun', amount: 13.8, streams: 20 }
        ],
        salaryDistribution: [
          { range: '0.1-0.3 ETH', count: 8, totalAmount: 1.6 },
          { range: '0.3-0.5 ETH', count: 10, totalAmount: 4.0 },
          { range: '0.5-0.8 ETH', count: 4, totalAmount: 2.6 },
          { range: '0.8-1.0+ ETH', count: 2, totalAmount: 1.8 }
        ],
        topEarners: [
          { name: 'Alice Johnson', amount: 0.85, department: 'Engineering' },
          { name: 'Bob Smith', amount: 0.75, department: 'Marketing' },
          { name: 'Carol Davis', amount: 0.72, department: 'Engineering' },
          { name: 'David Wilson', amount: 0.68, department: 'Sales' },
          { name: 'Eve Brown', amount: 0.65, department: 'Design' }
        ],
        paymentFrequency: [
          { frequency: 'Monthly', count: 18, percentage: 75 },
          { frequency: 'Bi-weekly', count: 4, percentage: 17 },
          { frequency: 'Weekly', count: 2, percentage: 8 }
        ]
      };

      setData(mockData);
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

  if (loading) {
    return (
      <div className={cn('space-y-6', className)}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-gray-500">Comprehensive insights into your payroll operations</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 bg-white border rounded-lg p-1">
            {(['7d', '30d', '90d', '1y'] as const).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onTimeRangeChange?.(range)}
                className="px-3 py-1 text-sm"
              >
                {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : range === '90d' ? '90 Days' : '1 Year'}
              </Button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={loadAnalyticsData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payroll</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatEth(data.totalPayroll)} ETH</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(data.totalPayroll * 2000)} USD
            </p>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs text-green-500">+{data.monthlyGrowth}% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalEmployees}</div>
            <p className="text-xs text-muted-foreground">
              {data.activeStreams} active streams
            </p>
            <div className="flex items-center mt-2">
              <Activity className="h-3 w-3 text-blue-500 mr-1" />
              <span className="text-xs text-blue-500">{Math.round((data.activeStreams / data.totalEmployees) * 100)}% coverage</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatEth(data.totalPaid)} ETH</div>
            <p className="text-xs text-muted-foreground">
              All time payments
            </p>
            <div className="flex items-center mt-2">
              <Clock className="h-3 w-3 text-purple-500 mr-1" />
              <span className="text-xs text-purple-500">Avg {formatEth(data.averageSalary)} ETH/month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Monthly Salary</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatEth(data.averageSalary)} ETH</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(data.averageSalary * 2000)} USD
            </p>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-xs text-green-500">Above market average</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Payment Trends</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data.paymentTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  formatter={(value: any) => [`${formatEth(value)} ETH`, 'Amount']}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="amount"
                  stackId="1"
                  stroke="#8b5cf6"
                  fill="#8b5cf6"
                  fillOpacity={0.6}
                  name="Amount (ETH)"
                />
                <Area
                  type="monotone"
                  dataKey="streams"
                  stackId="2"
                  stroke="#06b6d4"
                  fill="#06b6d4"
                  fillOpacity={0.6}
                  name="Active Streams"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Department Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChartIcon className="h-5 w-5" />
              <span>Department Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.departmentDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.departmentDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [`${value}%`, 'Percentage']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {data.departmentDistribution.map((dept, index) => (
                <div key={dept.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span>{dept.name}</span>
                  </div>
                  <span className="text-gray-500">{dept.employees} employees</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Salary Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Salary Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.salaryDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip
                  formatter={(value: any, name: string) => [
                    name === 'count' ? `${value} employees` : `${formatEth(value)} ETH`,
                    name === 'count' ? 'Employees' : 'Total Amount'
                  ]}
                />
                <Legend />
                <Bar dataKey="count" fill="#8b5cf6" name="Employees" />
                <Bar dataKey="totalAmount" fill="#06b6d4" name="Total Amount (ETH)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Payment Frequency */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Frequency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.paymentFrequency.map((freq) => (
                <div key={freq.frequency} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{freq.frequency}</span>
                    <Badge variant="outline">{freq.percentage}%</Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${freq.percentage}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-500">{freq.count} employees</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Earners */}
      <Card>
        <CardHeader>
          <CardTitle>Top Earners</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.topEarners.map((earner, index) => (
              <div key={earner.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                    <span className="text-blue-600 font-semibold text-sm">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{earner.name}</p>
                    <p className="text-sm text-gray-500">{earner.department}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{formatEth(earner.amount)} ETH</p>
                  <p className="text-sm text-gray-500">{formatCurrency(earner.amount * 2000)}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}