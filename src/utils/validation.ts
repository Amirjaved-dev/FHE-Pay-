import { isAddress } from 'viem';

/**
 * Validate Ethereum address
 */
export function validateAddress(address: string): { isValid: boolean; error?: string } {
  if (!address || address.trim() === '') {
    return { isValid: false, error: 'Address is required' };
  }
  
  if (!isAddress(address)) {
    return { isValid: false, error: 'Invalid Ethereum address format' };
  }
  
  return { isValid: true };
}

/**
 * Validate stream duration
 */
export function validateDuration(duration: number): { isValid: boolean; error?: string } {
  if (!duration || duration <= 0) {
    return { isValid: false, error: 'Duration must be greater than 0' };
  }
  
  // Minimum 1 hour
  if (duration < 3600) {
    return { isValid: false, error: 'Duration must be at least 1 hour' };
  }
  
  // Maximum 10 years
  if (duration > 315360000) {
    return { isValid: false, error: 'Duration cannot exceed 10 years' };
  }
  
  return { isValid: true };
}

/**
 * Validate salary amount
 */
export function validateSalaryAmount(amount: string): { isValid: boolean; error?: string } {
  if (!amount || amount.trim() === '') {
    return { isValid: false, error: 'Salary amount is required' };
  }
  
  const num = parseFloat(amount);
  
  if (isNaN(num)) {
    return { isValid: false, error: 'Invalid salary amount format' };
  }
  
  if (num <= 0) {
    return { isValid: false, error: 'Salary amount must be greater than 0' };
  }
  
  // Minimum 0.001 ETH
  if (num < 0.001) {
    return { isValid: false, error: 'Salary amount must be at least 0.001 ETH' };
  }
  
  // Maximum 10,000 ETH
  if (num > 10000) {
    return { isValid: false, error: 'Salary amount cannot exceed 10,000 ETH' };
  }
  
  return { isValid: true };
}

/**
 * Validate withdrawal amount
 */
export function validateWithdrawalAmount(
  amount: string, 
  availableAmount: string
): { isValid: boolean; error?: string } {
  if (!amount || amount.trim() === '') {
    return { isValid: false, error: 'Withdrawal amount is required' };
  }
  
  const num = parseFloat(amount);
  const available = parseFloat(availableAmount);
  
  if (isNaN(num)) {
    return { isValid: false, error: 'Invalid withdrawal amount format' };
  }
  
  if (num <= 0) {
    return { isValid: false, error: 'Withdrawal amount must be greater than 0' };
  }
  
  if (num > available) {
    return { isValid: false, error: 'Withdrawal amount exceeds available balance' };
  }
  
  return { isValid: true };
}

/**
 * Validate email address
 */
export function validateEmail(email: string): { isValid: boolean; error?: string } {
  if (!email || email.trim() === '') {
    return { isValid: false, error: 'Email is required' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Invalid email format' };
  }
  
  return { isValid: true };
}

/**
 * Validate stream creation form
 */
export interface StreamCreationForm {
  employeeAddress: string;
  salaryAmount: string;
  duration: number;
  description?: string;
}

export function validateStreamCreationForm(
  form: StreamCreationForm
): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  
  // Validate employee address
  const addressValidation = validateAddress(form.employeeAddress);
  if (!addressValidation.isValid) {
    errors.employeeAddress = addressValidation.error!;
  }
  
  // Validate salary amount
  const salaryValidation = validateSalaryAmount(form.salaryAmount);
  if (!salaryValidation.isValid) {
    errors.salaryAmount = salaryValidation.error!;
  }
  
  // Validate duration
  const durationValidation = validateDuration(form.duration);
  if (!durationValidation.isValid) {
    errors.duration = durationValidation.error!;
  }
  
  // Validate description length if provided
  if (form.description && form.description.length > 500) {
    errors.description = 'Description cannot exceed 500 characters';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate withdrawal form
 */
export interface WithdrawalForm {
  amount: string;
  availableAmount: string;
}

export function validateWithdrawalForm(
  form: WithdrawalForm
): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  
  // Validate withdrawal amount
  const amountValidation = validateWithdrawalAmount(form.amount, form.availableAmount);
  if (!amountValidation.isValid) {
    errors.amount = amountValidation.error!;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate URL
 */
export function validateURL(url: string): { isValid: boolean; error?: string } {
  if (!url || url.trim() === '') {
    return { isValid: false, error: 'URL is required' };
  }
  
  try {
    new URL(url);
    return { isValid: true };
  } catch {
    return { isValid: false, error: 'Invalid URL format' };
  }
}

/**
 * Validate transaction hash
 */
export function validateTxHash(hash: string): { isValid: boolean; error?: string } {
  if (!hash || hash.trim() === '') {
    return { isValid: false, error: 'Transaction hash is required' };
  }
  
  if (!/^0x[a-fA-F0-9]{64}$/.test(hash)) {
    return { isValid: false, error: 'Invalid transaction hash format' };
  }
  
  return { isValid: true };
}

/**
 * Validate positive integer
 */
export function validatePositiveInteger(value: number): { isValid: boolean; error?: string } {
  if (!Number.isInteger(value) || value <= 0) {
    return { isValid: false, error: 'Value must be a positive integer' };
  }
  
  return { isValid: true };
}

/**
 * Validate string length
 */
export function validateStringLength(
  value: string, 
  minLength: number = 0, 
  maxLength: number = Infinity
): { isValid: boolean; error?: string } {
  if (value.length < minLength) {
    return { isValid: false, error: `Minimum length is ${minLength} characters` };
  }
  
  if (value.length > maxLength) {
    return { isValid: false, error: `Maximum length is ${maxLength} characters` };
  }
  
  return { isValid: true };
}

/**
 * Validate required field
 */
export function validateRequired(value: any): { isValid: boolean; error?: string } {
  if (value === null || value === undefined || value === '') {
    return { isValid: false, error: 'This field is required' };
  }
  
  return { isValid: true };
}

/**
 * Validate numeric range
 */
export function validateRange(
  value: number, 
  min: number = -Infinity, 
  max: number = Infinity
): { isValid: boolean; error?: string } {
  if (value < min) {
    return { isValid: false, error: `Value must be at least ${min}` };
  }
  
  if (value > max) {
    return { isValid: false, error: `Value must be at most ${max}` };
  }
  
  return { isValid: true };
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): { isValid: boolean; error?: string; strength: 'weak' | 'medium' | 'strong' } {
  if (!password || password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters long', strength: 'weak' };
  }
  
  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  let score = 0;
  
  // Check for lowercase
  if (/[a-z]/.test(password)) score++;
  
  // Check for uppercase
  if (/[A-Z]/.test(password)) score++;
  
  // Check for numbers
  if (/\d/.test(password)) score++;
  
  // Check for special characters
  if (/[^\w\s]/.test(password)) score++;
  
  // Check length
  if (password.length >= 12) score++;
  
  if (score >= 4) {
    strength = 'strong';
  } else if (score >= 2) {
    strength = 'medium';
  }
  
  return { isValid: true, strength };
}

/**
 * Sanitize HTML input
 */
export function sanitizeHTML(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validate and sanitize user input
 */
export function validateAndSanitize(
  input: string, 
  maxLength: number = 1000
): { isValid: boolean; sanitized: string; error?: string } {
  if (!input) {
    return { isValid: false, sanitized: '', error: 'Input is required' };
  }
  
  if (input.length > maxLength) {
    return { 
      isValid: false, 
      sanitized: '', 
      error: `Input exceeds maximum length of ${maxLength} characters` 
    };
  }
  
  const sanitized = sanitizeHTML(input.trim());
  
  return { isValid: true, sanitized };
}

/**
 * Check if two addresses are the same
 */
export function isSameAddress(address1: string, address2: string): boolean {
  if (!address1 || !address2) return false;
  return address1.toLowerCase() === address2.toLowerCase();
}

/**
 * Validate contract interaction parameters
 */
export function validateContractParams(params: Record<string, any>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  Object.entries(params).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      errors.push(`Parameter '${key}' is required`);
    }
    
    if (key.toLowerCase().includes('address') && typeof value === 'string') {
      const addressValidation = validateAddress(value);
      if (!addressValidation.isValid) {
        errors.push(`Invalid address for parameter '${key}': ${addressValidation.error}`);
      }
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}