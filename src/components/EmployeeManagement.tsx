'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import {
  Users,
  Plus,
  Search,
  Mail,
  Shield,
  Calendar,
  MoreHorizontal,
  Edit,
  Trash2,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  Download,
  Upload,
  TrendingUp
} from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { formatAddress, formatDate, formatEth } from '@/utils/format';
import { cn } from '@/utils/helpers';

interface Employee {
  id: string;
  name: string;
  email: string;
  address: string;
  role: 'employee' | 'manager' | 'admin';
  department: string;
  startDate: number;
  status: 'active' | 'inactive' | 'pending';
  salaryAmount: string; // ETH
  currency: string;
  paymentFrequency: 'weekly' | 'bi-weekly' | 'monthly';
  streamsCount: number;
  totalPaid: string;
  lastPaymentDate?: number;
  nextPaymentDate?: number;
  avatar?: string;
  notes?: string;
}

interface EmployeeManagementProps {
  onEmployeeSelect?: (employee: Employee) => void;
  className?: string;
}

export default function EmployeeManagement({ onEmployeeSelect, className }: EmployeeManagementProps) {
  const { address } = useAccount();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'pending'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Mock data - replace with actual contract calls
  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    filterEmployees();
  }, [employees, searchTerm, statusFilter]);

  const loadEmployees = async () => {
    try {
      setLoading(true);

      // Mock data - replace with actual employee data from contract/backend
      const mockEmployees: Employee[] = [
        {
          id: '1',
          name: 'Alice Johnson',
          email: 'alice@company.com',
          address: '0x1234567890abcdef1234567890abcdef12345678',
          role: 'employee',
          department: 'Engineering',
          startDate: Math.floor(Date.now() / 1000) - (90 * 24 * 60 * 60), // 90 days ago
          status: 'active',
          salaryAmount: '0.5',
          currency: 'ETH',
          paymentFrequency: 'monthly',
          streamsCount: 3,
          totalPaid: '45.0',
          lastPaymentDate: Math.floor(Date.now() / 1000) - (7 * 24 * 60 * 60),
          nextPaymentDate: Math.floor(Date.now() / 1000) + (23 * 24 * 60 * 60),
          notes: 'Senior developer, excellent performance'
        },
        {
          id: '2',
          name: 'Bob Smith',
          email: 'bob@company.com',
          address: '0x2345678901bcdef12345678901bcdef123456789',
          role: 'employee',
          department: 'Design',
          startDate: Math.floor(Date.now() / 1000) - (180 * 24 * 60 * 60), // 180 days ago
          status: 'active',
          salaryAmount: '0.35',
          currency: 'ETH',
          paymentFrequency: 'monthly',
          streamsCount: 6,
          totalPaid: '31.5',
          lastPaymentDate: Math.floor(Date.now() / 1000) - (5 * 24 * 60 * 60),
          nextPaymentDate: Math.floor(Date.now() / 1000) + (25 * 24 * 60 * 60),
        },
        {
          id: '3',
          name: 'Carol Davis',
          email: 'carol@company.com',
          address: '0x3456789012cdef123456789012cdef1234567890',
          role: 'manager',
          department: 'Marketing',
          startDate: Math.floor(Date.now() / 1000) - (365 * 24 * 60 * 60), // 1 year ago
          status: 'active',
          salaryAmount: '0.75',
          currency: 'ETH',
          paymentFrequency: 'monthly',
          streamsCount: 12,
          totalPaid: '90.0',
          lastPaymentDate: Math.floor(Date.now() / 1000) - (3 * 24 * 60 * 60),
          nextPaymentDate: Math.floor(Date.now() / 1000) + (27 * 24 * 60 * 60),
        },
        {
          id: '4',
          name: 'David Wilson',
          email: 'david@company.com',
          address: '0x4567890123def1234567890123def12345678901',
          role: 'employee',
          department: 'Sales',
          startDate: Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60), // 30 days ago
          status: 'pending',
          salaryAmount: '0.4',
          currency: 'ETH',
          paymentFrequency: 'monthly',
          streamsCount: 0,
          totalPaid: '0',
          notes: 'Onboarding in progress'
        }
      ];

      setEmployees(mockEmployees);
    } catch (error) {
      console.error('Failed to load employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterEmployees = () => {
    let filtered = employees;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(emp =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(emp => emp.status === statusFilter);
    }

    setFilteredEmployees(filtered);
  };

  const handleEmployeeClick = (employee: Employee) => {
    setSelectedEmployee(employee);
    onEmployeeSelect?.(employee);
  };

  const handleEditEmployee = (employee: Employee, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedEmployee(employee);
    setShowEditModal(true);
  };

  const getStatusColor = (status: Employee['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleColor = (role: Employee['role']) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'manager':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'employee':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const stats = {
    total: employees.length,
    active: employees.filter(e => e.status === 'active').length,
    pending: employees.filter(e => e.status === 'pending').length,
    totalPayroll: employees.reduce((sum, e) => sum + parseFloat(e.salaryAmount), 0),
  };

  if (loading) {
    return (
      <div className={cn('space-y-6', className)}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.active} active, {stats.pending} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Payroll</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPayroll.toFixed(2)} ETH</div>
            <p className="text-xs text-muted-foreground">
              ${(stats.totalPayroll * 2000).toFixed(0)} USD {/* Mock ETH price */}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Streams</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {employees.reduce((sum, e) => sum + e.streamsCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total active payroll streams
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Salary</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.total > 0 ? (stats.totalPayroll / stats.active).toFixed(3) : '0'} ETH
            </div>
            <p className="text-xs text-muted-foreground">
              Per employee
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Employee Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Employee Management</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {/* Implement export */}}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {/* Implement import */}}
              >
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
              <Button
                onClick={() => setShowAddModal(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Employee
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Employee List */}
          {filteredEmployees.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No employees found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Get started by adding your first employee'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Button onClick={() => setShowAddModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Employee
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Employee</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Department</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Role</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Salary</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Streams</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Next Payment</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((employee) => (
                    <tr
                      key={employee.id}
                      className="border-b hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleEmployeeClick(employee)}
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-medium">
                              {employee.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{employee.name}</div>
                            <div className="text-sm text-gray-500">{employee.email}</div>
                            <div className="text-xs text-gray-400">{formatAddress(employee.address)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-medium text-gray-900">{employee.department}</div>
                        <div className="text-sm text-gray-500">
                          Since {formatDate(employee.startDate, 'short')}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant="outline" className={getRoleColor(employee.role)}>
                          {employee.role}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant="outline" className={getStatusColor(employee.status)}>
                          {employee.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-medium text-gray-900">
                          {formatEth(employee.salaryAmount)} ETH
                        </div>
                        <div className="text-sm text-gray-500">
                          {employee.paymentFrequency}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-medium text-gray-900">{employee.streamsCount}</div>
                        <div className="text-sm text-gray-500">
                          {formatEth(employee.totalPaid)} ETH paid
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {employee.nextPaymentDate ? (
                          <div>
                            <div className="font-medium text-gray-900">
                              {formatDate(employee.nextPaymentDate, 'short')}
                            </div>
                            <div className="text-sm text-gray-500">
                              {Math.floor((employee.nextPaymentDate - Math.floor(Date.now() / 1000)) / (24 * 60 * 60))} days
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleEditEmployee(employee, e)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              {/* Implement delete */}
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Employee Modal */}
      <AddEmployeeModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          setShowAddModal(false);
          loadEmployees();
        }}
      />

      {/* Edit Employee Modal */}
      {selectedEmployee && (
        <EditEmployeeModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          employee={selectedEmployee}
          onSuccess={() => {
            setShowEditModal(false);
            loadEmployees();
          }}
        />
      )}
    </div>
  );
}

// Add Employee Modal Component
function AddEmployeeModal({ isOpen, onClose, onSuccess }: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    role: 'employee' as const,
    department: '',
    salaryAmount: '',
    paymentFrequency: 'monthly' as const,
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Implement add employee logic
    console.log('Adding employee:', formData);
    onSuccess();
  };

  if (!isOpen) return null;

  return (
    <Modal onClose={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Add New Employee</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="John Doe"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="john@company.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Wallet Address</label>
            <Input
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              placeholder="0x..."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
              <Input
                value={formData.department}
                onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                placeholder="Engineering"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Salary (ETH)</label>
              <Input
                type="number"
                step="0.001"
                value={formData.salaryAmount}
                onChange={(e) => setFormData(prev => ({ ...prev, salaryAmount: e.target.value }))}
                placeholder="0.5"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Frequency</label>
              <select
                value={formData.paymentFrequency}
                onChange={(e) => setFormData(prev => ({ ...prev, paymentFrequency: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="weekly">Weekly</option>
                <option value="bi-weekly">Bi-weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional notes about the employee..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Add Employee
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

// Edit Employee Modal Component
function EditEmployeeModal({ isOpen, onClose, employee, onSuccess }: {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    name: employee.name,
    email: employee.email,
    department: employee.department,
    role: employee.role,
    salaryAmount: employee.salaryAmount,
    paymentFrequency: employee.paymentFrequency,
    status: employee.status,
    notes: employee.notes || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Implement edit employee logic
    console.log('Editing employee:', { id: employee.id, ...formData });
    onSuccess();
  };

  if (!isOpen) return null;

  return (
    <Modal onClose={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Edit Employee</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
              <Input
                value={formData.department}
                onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Salary (ETH)</label>
              <Input
                type="number"
                step="0.001"
                value={formData.salaryAmount}
                onChange={(e) => setFormData(prev => ({ ...prev, salaryAmount: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Frequency</label>
              <select
                value={formData.paymentFrequency}
                onChange={(e) => setFormData(prev => ({ ...prev, paymentFrequency: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="weekly">Weekly</option>
                <option value="bi-weekly">Bi-weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional notes about the employee..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Employee Information</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Address:</strong> {formatAddress(employee.address)}</p>
              <p><strong>Start Date:</strong> {formatDate(employee.startDate, 'long')}</p>
              <p><strong>Total Streams:</strong> {employee.streamsCount}</p>
              <p><strong>Total Paid:</strong> {formatEth(employee.totalPaid)} ETH</p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}