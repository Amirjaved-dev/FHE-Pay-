import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { STORAGE_KEYS, TIME_CONSTANTS } from './constants';

/**
 * Combine class names with tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Sleep utility
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Generate unique ID
 */
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

/**
 * Generate UUID v4
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const result = document.execCommand('copy');
      textArea.remove();
      return result;
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

/**
 * Local storage utilities
 */
export const storage = {
  get: <T>(key: string, defaultValue?: T): T | null => {
    try {
      if (typeof window === 'undefined') return defaultValue || null;
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue || null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return defaultValue || null;
    }
  },

  set: <T>(key: string, value: T): boolean => {
    try {
      if (typeof window === 'undefined') return false;
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Error writing to localStorage:', error);
      return false;
    }
  },

  remove: (key: string): boolean => {
    try {
      if (typeof window === 'undefined') return false;
      window.localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing from localStorage:', error);
      return false;
    }
  },

  clear: (): boolean => {
    try {
      if (typeof window === 'undefined') return false;
      window.localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  },
};

/**
 * Session storage utilities
 */
export const sessionStorage = {
  get: <T>(key: string, defaultValue?: T): T | null => {
    try {
      if (typeof window === 'undefined') return defaultValue || null;
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue || null;
    } catch (error) {
      console.error('Error reading from sessionStorage:', error);
      return defaultValue || null;
    }
  },

  set: <T>(key: string, value: T): boolean => {
    try {
      if (typeof window === 'undefined') return false;
      window.sessionStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Error writing to sessionStorage:', error);
      return false;
    }
  },

  remove: (key: string): boolean => {
    try {
      if (typeof window === 'undefined') return false;
      window.sessionStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing from sessionStorage:', error);
      return false;
    }
  },
};

/**
 * URL utilities
 */
export const urlUtils = {
  getQueryParam: (param: string): string | null => {
    if (typeof window === 'undefined') return null;
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  },

  setQueryParam: (param: string, value: string): void => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    url.searchParams.set(param, value);
    window.history.replaceState({}, '', url.toString());
  },

  removeQueryParam: (param: string): void => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    url.searchParams.delete(param);
    window.history.replaceState({}, '', url.toString());
  },

  buildUrl: (base: string, params: Record<string, string>): string => {
    const url = new URL(base);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
    return url.toString();
  },
};

/**
 * Array utilities
 */
export const arrayUtils = {
  unique: <T>(array: T[]): T[] => {
    return [...new Set(array)];
  },

  groupBy: <T, K extends keyof T>(array: T[], key: K): Record<string, T[]> => {
    return array.reduce((groups, item) => {
      const group = String(item[key]);
      groups[group] = groups[group] || [];
      groups[group].push(item);
      return groups;
    }, {} as Record<string, T[]>);
  },

  sortBy: <T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] => {
    return [...array].sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];
      
      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  },

  chunk: <T>(array: T[], size: number): T[][] => {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  },

  shuffle: <T>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  },
};

/**
 * Object utilities
 */
export const objectUtils = {
  pick: <T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
    const result = {} as Pick<T, K>;
    keys.forEach(key => {
      if (key in obj) {
        result[key] = obj[key];
      }
    });
    return result;
  },

  omit: <T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => {
    const result = { ...obj };
    keys.forEach(key => {
      delete result[key];
    });
    return result;
  },

  isEmpty: (obj: any): boolean => {
    if (obj == null) return true;
    if (Array.isArray(obj) || typeof obj === 'string') return obj.length === 0;
    return Object.keys(obj).length === 0;
  },

  deepClone: <T>(obj: T): T => {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime()) as any;
    if (obj instanceof Array) return obj.map(item => objectUtils.deepClone(item)) as any;
    if (typeof obj === 'object') {
      const cloned = {} as any;
      Object.keys(obj).forEach(key => {
        cloned[key] = objectUtils.deepClone((obj as any)[key]);
      });
      return cloned;
    }
    return obj;
  },
};

/**
 * Date utilities
 */
export const dateUtils = {
  now: (): number => Math.floor(Date.now() / 1000),
  
  toTimestamp: (date: Date): number => Math.floor(date.getTime() / 1000),
  
  fromTimestamp: (timestamp: number): Date => new Date(timestamp * 1000),
  
  addSeconds: (timestamp: number, seconds: number): number => timestamp + seconds,
  
  addMinutes: (timestamp: number, minutes: number): number => 
    timestamp + (minutes * TIME_CONSTANTS.MINUTE),
  
  addHours: (timestamp: number, hours: number): number => 
    timestamp + (hours * TIME_CONSTANTS.HOUR),
  
  addDays: (timestamp: number, days: number): number => 
    timestamp + (days * TIME_CONSTANTS.DAY),
  
  isExpired: (timestamp: number): boolean => dateUtils.now() > timestamp,
  
  timeUntil: (timestamp: number): number => Math.max(0, timestamp - dateUtils.now()),
  
  timeSince: (timestamp: number): number => Math.max(0, dateUtils.now() - timestamp),
};

/**
 * Number utilities
 */
export const numberUtils = {
  clamp: (value: number, min: number, max: number): number => {
    return Math.min(Math.max(value, min), max);
  },

  round: (value: number, decimals: number = 0): number => {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
  },

  randomBetween: (min: number, max: number): number => {
    return Math.random() * (max - min) + min;
  },

  randomInt: (min: number, max: number): number => {
    return Math.floor(numberUtils.randomBetween(min, max + 1));
  },

  isNumeric: (value: any): boolean => {
    return !isNaN(parseFloat(value)) && isFinite(value);
  },

  percentage: (value: number, total: number): number => {
    if (total === 0) return 0;
    return (value / total) * 100;
  },
};

/**
 * String utilities
 */
export const stringUtils = {
  capitalize: (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },

  camelCase: (str: string): string => {
    return str.replace(/[-_\s]+(.)?/g, (_, char) => char ? char.toUpperCase() : '');
  },

  kebabCase: (str: string): string => {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  },

  snakeCase: (str: string): string => {
    return str.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
  },

  truncate: (str: string, length: number, suffix: string = '...'): string => {
    if (str.length <= length) return str;
    return str.slice(0, length - suffix.length) + suffix;
  },

  removeWhitespace: (str: string): string => {
    return str.replace(/\s+/g, '');
  },

  slugify: (str: string): string => {
    return str
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  },
};

/**
 * Error handling utilities
 */
export const errorUtils = {
  getErrorMessage: (error: unknown): string => {
    if (error instanceof Error) return error.message;
    if (typeof error === 'string') return error;
    return 'An unknown error occurred';
  },

  isNetworkError: (error: unknown): boolean => {
    const message = errorUtils.getErrorMessage(error).toLowerCase();
    return message.includes('network') || 
           message.includes('fetch') || 
           message.includes('connection');
  },

  isUserRejectedError: (error: unknown): boolean => {
    const message = errorUtils.getErrorMessage(error).toLowerCase();
    return message.includes('user rejected') || 
           message.includes('user denied') ||
           message.includes('cancelled');
  },

  logError: (error: unknown, context?: string): void => {
    const message = errorUtils.getErrorMessage(error);
    const logMessage = context ? `[${context}] ${message}` : message;
    console.error(logMessage, error);
  },
};

/**
 * Performance utilities
 */
export const perfUtils = {
  measure: async <T>(name: string, fn: () => Promise<T>): Promise<T> => {
    const start = performance.now();
    try {
      const result = await fn();
      const end = performance.now();
      console.log(`${name} took ${end - start} milliseconds`);
      return result;
    } catch (error) {
      const end = performance.now();
      console.log(`${name} failed after ${end - start} milliseconds`);
      throw error;
    }
  },

  measureSync: <T>(name: string, fn: () => T): T => {
    const start = performance.now();
    try {
      const result = fn();
      const end = performance.now();
      console.log(`${name} took ${end - start} milliseconds`);
      return result;
    } catch (error) {
      const end = performance.now();
      console.log(`${name} failed after ${end - start} milliseconds`);
      throw error;
    }
  },
};

/**
 * Browser detection utilities
 */
export const browserUtils = {
  isMobile: (): boolean => {
    if (typeof window === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  },

  isIOS: (): boolean => {
    if (typeof window === 'undefined') return false;
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  },

  isAndroid: (): boolean => {
    if (typeof window === 'undefined') return false;
    return /Android/.test(navigator.userAgent);
  },

  supportsWebGL: (): boolean => {
    if (typeof window === 'undefined') return false;
    try {
      const canvas = document.createElement('canvas');
      return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
    } catch {
      return false;
    }
  },

  supportsLocalStorage: (): boolean => {
    if (typeof window === 'undefined') return false;
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  },
};