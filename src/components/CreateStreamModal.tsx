'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { X, DollarSign, Clock, Users, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useCreateStream } from '@/hooks/useContract';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { formatEther, parseEther } from 'viem';

interface CreateStreamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface FormData {
  employeeAddress: string;
  salaryAmount: string;
  duration: string;
  durationUnit: 'days' | 'weeks' | 'months';
}

export default function CreateStreamModal({ isOpen, onClose, onSuccess }: CreateStreamModalProps) {
  const { address } = useAccount();
  const { createStream, isLoading, error } = useCreateStream();

  const [formData, setFormData] = useState<FormData>({
    employeeAddress: '',
    salaryAmount: '',
    duration: '',
    durationUnit: 'months',
  });

  const [validationErrors, setValidationErrors] = useState<Partial<FormData>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateForm = (): boolean => {
    const errors: Partial<FormData> = {};

    // Employee address validation
    if (!formData.employeeAddress) {
      errors.employeeAddress = 'Employee address is required';
    } else if (!/^0x[a-fA-F0-9]{40}$/.test(formData.employeeAddress)) {
      errors.employeeAddress = 'Invalid Ethereum address';
    } else if (formData.employeeAddress.toLowerCase() === address?.toLowerCase()) {
      errors.employeeAddress = 'Cannot create stream to yourself';
    }

    // Salary amount validation
    if (!formData.salaryAmount) {
      errors.salaryAmount = 'Salary amount is required';
    } else {
      const amount = parseFloat(formData.salaryAmount);
      if (isNaN(amount) || amount <= 0) {
        errors.salaryAmount = 'Salary must be greater than 0';
      }
    }

    // Duration validation
    if (!formData.duration) {
      errors.duration = 'Duration is required';
    } else {
      const duration = parseInt(formData.duration);
      if (isNaN(duration) || duration <= 0) {
        errors.duration = 'Duration must be greater than 0';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const getDurationInSeconds = (): number => {
    const duration = parseInt(formData.duration);
    switch (formData.durationUnit) {
      case 'days':
        return duration * 24 * 60 * 60;
      case 'weeks':
        return duration * 7 * 24 * 60 * 60;
      case 'months':
        return duration * 30 * 24 * 60 * 60;
      default:
        return duration * 24 * 60 * 60;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitted(true);

      const tx = await createStream({
        employee: formData.employeeAddress,
        salaryAmount: formData.salaryAmount,
        duration: getDurationInSeconds(),
      });

      if (tx) {
        await tx.wait();
        onSuccess?.();
        onClose();

        // Reset form
        setFormData({
          employeeAddress: '',
          salaryAmount: '',
          duration: '',
          durationUnit: 'months',
        });
      }
    } catch (err) {
      console.error('Failed to create stream:', err);
    } finally {
      setIsSubmitted(false);
    }
  };

  const formatSalaryDisplay = (amount: string): string => {
    try {
      const ethAmount = formatEther(parseEther(amount || '0'));
      return `${parseFloat(ethAmount).toFixed(4)} ETH`;
    } catch {
      return '0 ETH';
    }
  };

  if (!isOpen) return null;

  return (
    <Modal onClose={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Create Salary Stream</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Employee Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="h-4 w-4 inline mr-1" />
              Employee Address
            </label>
            <Input
              type="text"
              placeholder="0x..."
              value={formData.employeeAddress}
              onChange={(e) => handleInputChange('employeeAddress', e.target.value)}
              error={validationErrors.employeeAddress}
            />
            {validationErrors.employeeAddress && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {validationErrors.employeeAddress}
              </p>
            )}
          </div>

          {/* Salary Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="h-4 w-4 inline mr-1" />
              Monthly Salary (ETH)
            </label>
            <Input
              type="number"
              placeholder="1.0"
              step="0.0001"
              min="0"
              value={formData.salaryAmount}
              onChange={(e) => handleInputChange('salaryAmount', e.target.value)}
              error={validationErrors.salaryAmount}
            />
            {formData.salaryAmount && !validationErrors.salaryAmount && (
              <p className="mt-1 text-sm text-green-600 flex items-center">
                <CheckCircle className="h-3 w-3 mr-1" />
                Total: {formatSalaryDisplay(formData.salaryAmount)}
              </p>
            )}
            {validationErrors.salaryAmount && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {validationErrors.salaryAmount}
              </p>
            )}
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="h-4 w-4 inline mr-1" />
              Duration
            </label>
            <div className="flex space-x-2">
              <Input
                type="number"
                placeholder="1"
                min="1"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', e.target.value)}
                error={validationErrors.duration}
                className="flex-1"
              />
              <select
                value={formData.durationUnit}
                onChange={(e) => handleInputChange('durationUnit', e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="days">Days</option>
                <option value="weeks">Weeks</option>
                <option value="months">Months</option>
              </select>
            </div>
            {validationErrors.duration && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {validationErrors.duration}
              </p>
            )}
            {formData.duration && !validationErrors.duration && (
              <p className="mt-1 text-sm text-gray-500">
                ≈ {getDurationInSeconds() / (24 * 60 * 60)} days total
              </p>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                {error}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || isSubmitted}
              className="flex-1 flex items-center justify-center"
            >
              {isLoading || isSubmitted ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Stream'
              )}
            </Button>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <p className="text-sm text-yellow-800">
              <strong>Important:</strong> This will transfer the full salary amount to the contract.
              The employee will be able to withdraw their earned salary continuously over the specified duration.
            </p>
          </div>
        </form>
      </div>
    </Modal>
  );
}