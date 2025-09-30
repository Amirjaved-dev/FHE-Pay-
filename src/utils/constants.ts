// Time constants
export const TIME_CONSTANTS = {
  SECOND: 1,
  MINUTE: 60,
  HOUR: 3600,
  DAY: 86400,
  WEEK: 604800,
  MONTH: 2592000, // 30 days
  YEAR: 31536000, // 365 days
} as const;

// Duration options for stream creation
export const DURATION_OPTIONS = [
  { label: '1 Hour', value: TIME_CONSTANTS.HOUR },
  { label: '1 Day', value: TIME_CONSTANTS.DAY },
  { label: '1 Week', value: TIME_CONSTANTS.WEEK },
  { label: '2 Weeks', value: TIME_CONSTANTS.WEEK * 2 },
  { label: '1 Month', value: TIME_CONSTANTS.MONTH },
  { label: '3 Months', value: TIME_CONSTANTS.MONTH * 3 },
  { label: '6 Months', value: TIME_CONSTANTS.MONTH * 6 },
  { label: '1 Year', value: TIME_CONSTANTS.YEAR },
] as const;

// Stream status types
export const STREAM_STATUS = {
  ACTIVE: 'active',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  EXPIRED: 'expired',
} as const;

export type StreamStatus = typeof STREAM_STATUS[keyof typeof STREAM_STATUS];

// User roles
export const USER_ROLES = {
  EMPLOYER: 'employer',
  EMPLOYEE: 'employee',
  BOTH: 'both',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

// Transaction types
export const TRANSACTION_TYPES = {
  STREAM_CREATED: 'stream_created',
  WITHDRAWAL_REQUESTED: 'withdrawal_requested',
  WITHDRAWAL_FULFILLED: 'withdrawal_fulfilled',
  STREAM_PAUSED: 'stream_paused',
  STREAM_RESUMED: 'stream_resumed',
  STREAM_COMPLETED: 'stream_completed',
} as const;

export type TransactionType = typeof TRANSACTION_TYPES[keyof typeof TRANSACTION_TYPES];

// Modal types
export const MODAL_TYPES = {
  CREATE_STREAM: 'create_stream',
  WITHDRAW: 'withdraw',
  CONFIRM_ACTION: 'confirm_action',
  STREAM_DETAILS: 'stream_details',
  ROLE_SELECTION: 'role_selection',
} as const;

export type ModalType = typeof MODAL_TYPES[keyof typeof MODAL_TYPES];

// Network constants
export const NETWORK_CONSTANTS = {
  SEPOLIA_CHAIN_ID: 11155111,
  MAINNET_CHAIN_ID: 1,
  BLOCK_CONFIRMATION_COUNT: 2,
  TRANSACTION_TIMEOUT: 300000, // 5 minutes
} as const;

// FHE constants
export const FHE_CONSTANTS = {
  ENCRYPTION_TIMEOUT: 30000, // 30 seconds
  DECRYPTION_TIMEOUT: 30000, // 30 seconds
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;

// UI constants
export const UI_CONSTANTS = {
  REFRESH_INTERVAL: 30000, // 30 seconds
  TOAST_DURATION: 5000, // 5 seconds
  LOADING_DELAY: 200, // 200ms
  DEBOUNCE_DELAY: 300, // 300ms
  ANIMATION_DURATION: 200, // 200ms
} as const;

// Validation constants
export const VALIDATION_CONSTANTS = {
  MIN_SALARY_AMOUNT: 0.001, // ETH
  MAX_SALARY_AMOUNT: 10000, // ETH
  MIN_DURATION: TIME_CONSTANTS.HOUR, // 1 hour
  MAX_DURATION: TIME_CONSTANTS.YEAR * 10, // 10 years
  MAX_DESCRIPTION_LENGTH: 500,
  MAX_INPUT_LENGTH: 1000,
  ADDRESS_LENGTH: 42,
  TX_HASH_LENGTH: 66,
} as const;

// Error messages
export const ERROR_MESSAGES = {
  WALLET_NOT_CONNECTED: 'Please connect your wallet to continue',
  INSUFFICIENT_BALANCE: 'Insufficient balance for this transaction',
  TRANSACTION_FAILED: 'Transaction failed. Please try again.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  FHE_INITIALIZATION_FAILED: 'Failed to initialize FHE. Please refresh and try again.',
  ENCRYPTION_FAILED: 'Failed to encrypt data. Please try again.',
  DECRYPTION_FAILED: 'Failed to decrypt data. Please try again.',
  INVALID_ADDRESS: 'Invalid Ethereum address',
  INVALID_AMOUNT: 'Invalid amount format',
  STREAM_NOT_FOUND: 'Stream not found',
  UNAUTHORIZED_ACTION: 'You are not authorized to perform this action',
  CONTRACT_INTERACTION_FAILED: 'Contract interaction failed',
  UNKNOWN_ERROR: 'An unknown error occurred',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  STREAM_CREATED: 'Stream created successfully!',
  WITHDRAWAL_REQUESTED: 'Withdrawal requested successfully!',
  STREAM_PAUSED: 'Stream paused successfully!',
  STREAM_RESUMED: 'Stream resumed successfully!',
  TRANSACTION_CONFIRMED: 'Transaction confirmed!',
  WALLET_CONNECTED: 'Wallet connected successfully!',
  FHE_INITIALIZED: 'FHE initialized successfully!',
} as const;

// Loading messages
export const LOADING_MESSAGES = {
  CONNECTING_WALLET: 'Connecting wallet...',
  INITIALIZING_FHE: 'Initializing FHE...',
  CREATING_STREAM: 'Creating stream...',
  REQUESTING_WITHDRAWAL: 'Requesting withdrawal...',
  PAUSING_STREAM: 'Pausing stream...',
  RESUMING_STREAM: 'Resuming stream...',
  LOADING_STREAMS: 'Loading streams...',
  ENCRYPTING_DATA: 'Encrypting data...',
  DECRYPTING_DATA: 'Decrypting data...',
  CONFIRMING_TRANSACTION: 'Confirming transaction...',
} as const;

// Color constants for status indicators
export const STATUS_COLORS = {
  [STREAM_STATUS.ACTIVE]: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200',
    dot: 'bg-green-500',
  },
  [STREAM_STATUS.PAUSED]: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-200',
    dot: 'bg-yellow-500',
  },
  [STREAM_STATUS.COMPLETED]: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
  },
  [STREAM_STATUS.EXPIRED]: {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-200',
    dot: 'bg-gray-500',
  },
} as const;

// Role colors
export const ROLE_COLORS = {
  [USER_ROLES.EMPLOYER]: {
    bg: 'bg-purple-100',
    text: 'text-purple-800',
    border: 'border-purple-200',
  },
  [USER_ROLES.EMPLOYEE]: {
    bg: 'bg-indigo-100',
    text: 'text-indigo-800',
    border: 'border-indigo-200',
  },
  [USER_ROLES.BOTH]: {
    bg: 'bg-gradient-to-r from-purple-100 to-indigo-100',
    text: 'text-gray-800',
    border: 'border-gray-200',
  },
} as const;

// API endpoints (if needed for external services)
export const API_ENDPOINTS = {
  HEALTH_CHECK: '/api/health',
  STREAM_EVENTS: '/api/streams/events',
  USER_PROFILE: '/api/user/profile',
  NOTIFICATIONS: '/api/notifications',
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  USER_PREFERENCES: 'fhe_pay_user_preferences',
  THEME: 'fhe_pay_theme',
  LAST_CONNECTED_WALLET: 'fhe_pay_last_wallet',
  STREAM_CACHE: 'fhe_pay_stream_cache',
  FHE_PUBLIC_KEY: 'fhe_pay_public_key',
} as const;

// Feature flags
export const FEATURE_FLAGS = {
  ENABLE_NOTIFICATIONS: true,
  ENABLE_ANALYTICS: false,
  ENABLE_DARK_MODE: true,
  ENABLE_STREAM_TEMPLATES: false,
  ENABLE_BULK_OPERATIONS: false,
} as const;

// Pagination constants
export const PAGINATION_CONSTANTS = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  STREAM_PAGE_SIZE: 20,
  TRANSACTION_PAGE_SIZE: 50,
} as const;

// Chart constants
export const CHART_CONSTANTS = {
  DEFAULT_HEIGHT: 300,
  COLORS: {
    PRIMARY: '#8b5cf6',
    SECONDARY: '#06b6d4',
    SUCCESS: '#10b981',
    WARNING: '#f59e0b',
    ERROR: '#ef4444',
    GRAY: '#6b7280',
  },
  GRADIENTS: {
    PRIMARY: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
    SUCCESS: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
    WARNING: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
  },
} as const;

// Export all constants as a single object for convenience
export const CONSTANTS = {
  TIME: TIME_CONSTANTS,
  DURATION_OPTIONS,
  STREAM_STATUS,
  USER_ROLES,
  TRANSACTION_TYPES,
  MODAL_TYPES,
  NETWORK: NETWORK_CONSTANTS,
  FHE: FHE_CONSTANTS,
  UI: UI_CONSTANTS,
  VALIDATION: VALIDATION_CONSTANTS,
  ERRORS: ERROR_MESSAGES,
  SUCCESS: SUCCESS_MESSAGES,
  LOADING: LOADING_MESSAGES,
  STATUS_COLORS,
  ROLE_COLORS,
  API: API_ENDPOINTS,
  STORAGE: STORAGE_KEYS,
  FEATURES: FEATURE_FLAGS,
  PAGINATION: PAGINATION_CONSTANTS,
  CHART: CHART_CONSTANTS,
} as const;