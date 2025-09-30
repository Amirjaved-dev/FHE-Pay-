// Contract ABI and type definitions for FHE-Pay

// Contract ABI (simplified for key functions)
export const PAYROLL_STREAM_ABI = [
  // Read functions
  'function owner() view returns (address)',
  'function nextStreamId() view returns (uint256)',
  'function paused() view returns (bool)',
  'function getStream(uint256 streamId) view returns (address employer, address employee, uint256 duration, uint256 startTime, uint256 totalWithdrawn, bool active)',
  'function streamCount() view returns (uint256)',
  'function getEmployerStreams(address employer) view returns (uint256[])',
  'function getEmployeeStreams(address employee) view returns (uint256[])',
  'function getContractBalance() view returns (uint256)',
  'function userPublicKeys(address) view returns (bytes32)',
  'function keyRegistered(address) view returns (bool)',
  'function getEncryptedEarnedAmount(uint256 streamId) returns (bytes32)',
  'function getWithdrawalRequest(uint256 requestId) view returns (uint256 streamId, address employee, uint256 requestTime, bool processed, uint256 decryptedAmount)',

  // Write functions
  'function registerFHEKey(bytes32 publicKey)',
  'function createStream(address employee, bytes32 inputHandle, bytes memory inputProof, uint256 duration, bytes32 employeePublicKey) payable',
  'function requestWithdrawal(uint256 streamId)',
  'function pauseStream(uint256 streamId)',
  'function resumeStream(uint256 streamId)',
  'function emergencyPause()',
  'function emergencyResume()',

  // Events
  'event StreamCreated(uint256 indexed streamId, address indexed employer, address indexed employee, uint256 duration)',
  'event SalaryWithdrawn(uint256 indexed streamId, address indexed employee, uint256 amount)',
  'event WithdrawalRequested(uint256 indexed requestId, uint256 indexed streamId, address indexed employee)',
  'event FHEKeyRegistered(address indexed user, bytes32 publicKey)',
  'event StreamPaused(uint256 indexed streamId)',
  'event StreamResumed(uint256 indexed streamId)',
] as const

// Type definitions
export interface StreamDetails {
  employer: string
  employee: string
  duration: bigint
  startTime: bigint
  totalWithdrawn: bigint
  active: boolean
}

export interface CreateStreamParams {
  employee: string
  encryptedSalaryAmount: Uint8Array
  duration: bigint
  employeePublicKey: string
  value: bigint
}

export interface WithdrawalRequest {
  streamId: bigint
  employee: string
  requestTime: bigint
  processed: boolean
}

// Contract addresses from environment variables
export const CONTRACT_ADDRESSES = {
  PAYROLL_STREAM: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || process.env.NEXT_PUBLIC_PAYROLL_CONTRACT_ADDRESS,
  KMS: process.env.NEXT_PUBLIC_KMS_CONTRACT_ADDRESS,
} as const

// Error messages
export const ERROR_MESSAGES = {
  WALLET_NOT_CONNECTED: 'Please connect your wallet first',
  UNSUPPORTED_NETWORK: 'Please switch to a supported network',
  CONTRACT_NOT_DEPLOYED: 'Contract address not configured',
  INSUFFICIENT_BALANCE: 'Insufficient balance for this transaction',
  TRANSACTION_FAILED: 'Transaction failed. Please try again.',
  FHE_KEY_NOT_REGISTERED: 'Please register your FHE key first',
  INVALID_STREAM_ID: 'Invalid stream ID',
  NOT_AUTHORIZED: 'You are not authorized for this action',
  STREAM_NOT_ACTIVE: 'Stream is not active',
  CONTRACT_PAUSED: 'Contract is currently paused',
} as const