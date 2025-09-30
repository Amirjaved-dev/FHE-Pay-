import { formatEther, parseEther } from 'viem';

/**
 * Format ETH amount for display
 */
export function formatETH(value: bigint | string, decimals: number = 4): string {
  try {
    const ethValue = typeof value === 'string' ? parseEther(value) : value;
    const formatted = formatEther(ethValue);
    const num = parseFloat(formatted);
    
    if (num === 0) return '0';
    if (num < 0.0001) return '< 0.0001';
    
    return num.toFixed(decimals).replace(/\.?0+$/, '');
  } catch {
    return '0';
  }
}

/**
 * Format currency with symbol
 */
export function formatCurrency(amount: string | number, symbol: string = 'ETH'): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(num)) return `0 ${symbol}`;
  
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(2)}M ${symbol}`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(2)}K ${symbol}`;
  } else if (num < 0.0001 && num > 0) {
    return `< 0.0001 ${symbol}`;
  } else {
    return `${num.toFixed(4).replace(/\.?0+$/, '')} ${symbol}`;
  }
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  if (isNaN(value)) return '0%';
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format time duration
 */
export function formatDuration(seconds: number): string {
  if (seconds < 0) return '0s';
  
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (days > 0) {
    return `${days}d ${hours}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

/**
 * Format time remaining
 */
export function formatTimeRemaining(seconds: number): string {
  if (seconds <= 0) return 'Completed';
  
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (days > 7) {
    const weeks = Math.floor(days / 7);
    return `${weeks}w ${days % 7}d remaining`;
  } else if (days > 0) {
    return `${days}d ${hours}h remaining`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m remaining`;
  } else {
    return `${minutes}m remaining`;
  }
}

/**
 * Format date
 */
export function formatDate(timestamp: number, format: 'short' | 'long' | 'relative' = 'short'): string {
  const date = new Date(timestamp * 1000);
  const now = new Date();
  
  if (format === 'relative') {
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  }
  
  if (format === 'long') {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format address (truncate)
 */
export function formatAddress(address: string, startChars: number = 6, endChars: number = 4): string {
  if (!address || address.length < startChars + endChars) {
    return address || '';
  }
  
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Format transaction hash
 */
export function formatTxHash(hash: string): string {
  return formatAddress(hash, 8, 6);
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Format number with commas
 */
export function formatNumber(num: number | string, decimals?: number): string {
  const number = typeof num === 'string' ? parseFloat(num) : num;
  
  if (isNaN(number)) return '0';
  
  const formatted = decimals !== undefined 
    ? number.toFixed(decimals)
    : number.toString();
  
  return formatted.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Format compact number (1K, 1M, etc.)
 */
export function formatCompactNumber(num: number): string {
  if (isNaN(num)) return '0';
  
  if (num >= 1000000000) {
    return `${(num / 1000000000).toFixed(1)}B`;
  } else if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  } else {
    return num.toString();
  }
}

/**
 * Format stream status
 */
export function formatStreamStatus(status: string): string {
  switch (status.toLowerCase()) {
    case 'active':
      return 'Active';
    case 'paused':
      return 'Paused';
    case 'completed':
      return 'Completed';
    case 'expired':
      return 'Expired';
    default:
      return 'Unknown';
  }
}

/**
 * Format role
 */
export function formatRole(role: string): string {
  switch (role.toLowerCase()) {
    case 'employer':
      return 'Employer';
    case 'employee':
      return 'Employee';
    case 'both':
      return 'Employer & Employee';
    default:
      return 'Unknown';
  }
}

/**
 * Parse and format user input for ETH amounts
 */
export function parseETHInput(input: string): string {
  // Remove any non-numeric characters except decimal point
  const cleaned = input.replace(/[^0-9.]/g, '');

  // Ensure only one decimal point
  const parts = cleaned.split('.');
  if (parts.length > 2) {
    return parts[0] + '.' + parts.slice(1).join('');
  }

  // Limit decimal places to 18 (ETH precision)
  if (parts[1] && parts[1].length > 18) {
    parts[1] = parts[1].slice(0, 18);
  }

  return parts.join('');
}

/**
 * Format ETH amount - alias for formatETH
 */
export function formatEth(value: bigint | string, decimals: number = 4): string {
  return formatETH(value, decimals);
}

/**
 * Format duration - alias for formatDuration
 */
export const formatDurationAlias = formatDuration;

/**
 * Validate ETH amount
 */
export function validateETHAmount(amount: string): { isValid: boolean; error?: string } {
  if (!amount || amount.trim() === '') {
    return { isValid: false, error: 'Amount is required' };
  }
  
  const num = parseFloat(amount);
  
  if (isNaN(num)) {
    return { isValid: false, error: 'Invalid amount format' };
  }
  
  if (num <= 0) {
    return { isValid: false, error: 'Amount must be greater than 0' };
  }
  
  if (num > 1000000) {
    return { isValid: false, error: 'Amount is too large' };
  }
  
  // Check decimal places
  const decimalPlaces = (amount.split('.')[1] || '').length;
  if (decimalPlaces > 18) {
    return { isValid: false, error: 'Too many decimal places (max 18)' };
  }
  
  return { isValid: true };
}