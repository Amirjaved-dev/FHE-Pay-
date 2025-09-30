import { useState, useEffect, useCallback } from 'react'
import { useAccount, usePublicClient, useWalletClient } from 'wagmi'
import { getContract, parseEther, formatEther } from 'viem'
import { CONTRACT_CONFIG } from '../lib/wagmi'
import { PAYROLL_STREAM_ABI, StreamDetails, CreateStreamParams, ERROR_MESSAGES } from '../config/blockchain'
import { initializeFHE, encryptNumber, getFHEInstance, FHEKeyStorage } from '../lib/fhe'
import { toast } from 'react-hot-toast'

export interface Stream extends StreamDetails {
  id: bigint
  encryptedSalaryAmount?: Uint8Array
  earnedAmount?: bigint
  availableAmount?: bigint
}

export interface UsePayrollStreamReturn {
  // State
  streams: Stream[]
  employerStreams: Stream[]
  employeeStreams: Stream[]
  loading: boolean
  error: string | null
  contractBalance: bigint
  isOwner: boolean
  isPaused: boolean
  fheKeyRegistered: boolean
  
  // Actions
  createStream: (params: CreateStreamParams) => Promise<boolean>
  requestWithdrawal: (streamId: bigint) => Promise<boolean>
  pauseStream: (streamId: bigint) => Promise<boolean>
  resumeStream: (streamId: bigint) => Promise<boolean>
  registerFHEKey: () => Promise<boolean>
  refreshStreams: () => Promise<void>
  refreshContractData: () => Promise<void>
  
  // Utilities
  getStreamDetails: (streamId: bigint) => Promise<Stream | null>
  calculateEarnedAmount: (stream: Stream) => bigint
  formatSalaryAmount: (amount: bigint) => string
}

export function usePayrollStream(): UsePayrollStreamReturn {
  const { address, chainId } = useAccount()
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()
  
  // State
  const [streams, setStreams] = useState<Stream[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [contractBalance, setContractBalance] = useState<bigint>(0n)
  const [isOwner, setIsOwner] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [fheKeyRegistered, setFheKeyRegistered] = useState(false)
  
  // Derived state
  const employerStreams = streams.filter(stream => 
    address && stream.employer.toLowerCase() === address.toLowerCase()
  )
  const employeeStreams = streams.filter(stream => 
    address && stream.employee.toLowerCase() === address.toLowerCase()
  )
  
  // Get contract instance
  const getContractInstance = useCallback(() => {
    if (!publicClient || !CONTRACT_CONFIG.address) {
      throw new Error(ERROR_MESSAGES.CONTRACT_NOT_DEPLOYED)
    }
    
    return getContract({
      address: CONTRACT_CONFIG.address,
      abi: PAYROLL_STREAM_ABI,
      client: publicClient,
    })
  }, [publicClient])
  
  // Initialize FHE when chain changes
  useEffect(() => {
    if (chainId) {
      initializeFHE(chainId).catch(console.error)
    }
  }, [chainId])
  
  // Check FHE key registration status
  const checkFHEKeyRegistration = useCallback(async () => {
    if (!address) {
      setFheKeyRegistered(false)
      return
    }
    
    try {
      const contract = getContractInstance()
      const registered = await contract.read.keyRegistered([address])
      setFheKeyRegistered(registered as boolean)
    } catch (error) {
      console.error('Failed to check FHE key registration:', error)
      setFheKeyRegistered(false)
    }
  }, [address, getContractInstance])
  
  // Refresh contract data
  const refreshContractData = useCallback(async () => {
    if (!address) return
    
    try {
      const contract = getContractInstance()
      
      // Get contract info
      const [balance, owner, paused] = await Promise.all([
        contract.read.getContractBalance(),
        contract.read.owner(),
        contract.read.paused(),
      ])
      
      setContractBalance(balance as bigint)
      setIsOwner((owner as string).toLowerCase() === address.toLowerCase())
      setIsPaused(paused as boolean)
      
      // Check FHE key registration
      await checkFHEKeyRegistration()
    } catch (error) {
      console.error('Failed to refresh contract data:', error)
      setError(handleError(error))
    }
  }, [address, getContractInstance, checkFHEKeyRegistration])
  
  // Get stream details
  const getStreamDetails = useCallback(async (streamId: bigint): Promise<Stream | null> => {
    try {
      const contract = getContractInstance()
      const details = await contract.read.getStream([streamId])
      
      const [employer, employee, duration, startTime, totalWithdrawn, active] = details as [
        string, string, bigint, bigint, bigint, boolean
      ]
      
      const stream: Stream = {
        id: streamId,
        employer,
        employee,
        duration,
        startTime,
        totalWithdrawn,
        active,
      }
      
      // Calculate earned amount
      stream.earnedAmount = calculateEarnedAmount(stream)
      stream.availableAmount = stream.earnedAmount - totalWithdrawn
      
      return stream
    } catch (error) {
      console.error('Failed to get stream details:', error)
      return null
    }
  }, [getContractInstance])
  
  // Calculate earned amount for a stream
  const calculateEarnedAmount = useCallback((stream: Stream): bigint => {
    if (!stream.active) return 0n
    
    const now = BigInt(Math.floor(Date.now() / 1000))
    const timeElapsed = now - stream.startTime
    const duration = stream.duration
    
    if (timeElapsed >= duration) {
      // Stream completed, return full amount (simplified calculation)
      return parseEther('10') // This would be the decrypted salary amount
    }
    
    // Calculate proportional amount
    const fullAmount = parseEther('10') // This would be the decrypted salary amount
    return (fullAmount * timeElapsed) / duration
  }, [])
  
  // Refresh streams
  const refreshStreams = useCallback(async () => {
    if (!address) {
      setStreams([])
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const contract = getContractInstance()
      
      // Get stream IDs for user
      const [employerStreamIds, employeeStreamIds] = await Promise.all([
        contract.read.getEmployerStreams([address]),
        contract.read.getEmployeeStreams([address]),
      ])
      
      // Combine and deduplicate stream IDs
      const allStreamIds = Array.from(new Set([
        ...(employerStreamIds as bigint[]),
        ...(employeeStreamIds as bigint[]),
      ]))
      
      // Get details for all streams
      const streamPromises = allStreamIds.map(id => getStreamDetails(id))
      const streamResults = await Promise.all(streamPromises)
      
      // Filter out null results
      const validStreams = streamResults.filter((stream): stream is Stream => stream !== null)
      
      setStreams(validStreams)
    } catch (error) {
      console.error('Failed to refresh streams:', error)
      setError(handleError(error))
    } finally {
      setLoading(false)
    }
  }, [address, getContractInstance, getStreamDetails])
  
  // Register FHE key
  const registerFHEKey = useCallback(async (): Promise<boolean> => {
    if (!address || !walletClient) {
      setError(ERROR_MESSAGES.WALLET_NOT_CONNECTED)
      return false
    }
    
    try {
      setLoading(true)
      setError(null)
      
      // Check if keys already exist in storage
      let keys = FHEKeyStorage.retrieve(address)
      
      if (!keys) {
        // Generate new FHE key pair
        const fheInstance = getFHEInstance()
        if (!fheInstance) {
          throw new Error('FHE instance not initialized')
        }
        
        const keyPair = fheInstance.generateKeypair()
        keys = {
          publicKey: `0x${Buffer.from(keyPair.publicKey).toString('hex')}`,
          privateKey: `0x${Buffer.from(keyPair.privateKey).toString('hex')}`,
        }
        
        // Store keys
        FHEKeyStorage.store(address, keys.publicKey, keys.privateKey)
      }
      
      // Register public key on contract
      const hash = await walletClient.writeContract({
        address: CONTRACT_CONFIG.address,
        abi: PAYROLL_STREAM_ABI,
        functionName: 'registerFHEKey',
        args: [keys.publicKey as `0x${string}`],
      })
      
      // Wait for transaction confirmation
      await publicClient?.waitForTransactionReceipt({ hash })
      
      setFheKeyRegistered(true)
      toast.success('FHE key registered successfully!')
      return true
    } catch (error) {
      console.error('Failed to register FHE key:', error)
      const errorMessage = handleError(error)
      setError(errorMessage)
      toast.error(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }, [address, walletClient, publicClient])
  
  // Create stream
  const createStream = useCallback(async (params: CreateStreamParams): Promise<boolean> => {
    if (!address || !walletClient) {
      setError(ERROR_MESSAGES.WALLET_NOT_CONNECTED)
      return false
    }

    if (!fheKeyRegistered) {
      setError(ERROR_MESSAGES.FHE_KEY_NOT_REGISTERED)
      return false
    }

    try {
      setLoading(true)
      setError(null)

      // Encrypt salary amount
      const encryptedAmount = await encryptNumber(Number(formatEther(params.value)))
      
      // Create stream on contract
      const hash = await walletClient.writeContract({
        address: CONTRACT_CONFIG.address,
        abi: PAYROLL_STREAM_ABI,
        functionName: 'createStream',
        args: [
          params.employee as `0x${string}`,
          `0x${Buffer.from(encryptedAmount).toString('hex')}` as `0x${string}`,
          params.duration,
          params.employeePublicKey as `0x${string}`,
        ],
        value: params.value,
      })
      
      // Wait for transaction confirmation
      await publicClient?.waitForTransactionReceipt({ hash })
      
      // Refresh streams
      await refreshStreams()
      
      toast.success('Stream created successfully!')
      return true
    } catch (error) {
      console.error('Failed to create stream:', error)
      const errorMessage = handleError(error)
      setError(errorMessage)
      toast.error(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }, [address, walletClient, publicClient, fheKeyRegistered, refreshStreams])
  
  // Request withdrawal
  const requestWithdrawal = useCallback(async (streamId: bigint): Promise<boolean> => {
    if (!address || !walletClient) {
      setError(ERROR_MESSAGES.WALLET_NOT_CONNECTED)
      return false
    }
    
    try {
      setLoading(true)
      setError(null)
      
      const hash = await walletClient.writeContract({
        address: CONTRACT_CONFIG.address,
        abi: PAYROLL_STREAM_ABI,
        functionName: 'requestWithdrawal',
        args: [streamId],
      })
      
      await publicClient?.waitForTransactionReceipt({ hash })
      
      // Refresh streams
      await refreshStreams()
      
      toast.success('Withdrawal requested successfully!')
      return true
    } catch (error) {
      console.error('Failed to request withdrawal:', error)
      const errorMessage = handleError(error)
      setError(errorMessage)
      toast.error(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }, [address, walletClient, publicClient, refreshStreams])
  
  // Pause stream
  const pauseStream = useCallback(async (streamId: bigint): Promise<boolean> => {
    if (!address || !walletClient) {
      setError(ERROR_MESSAGES.WALLET_NOT_CONNECTED)
      return false
    }
    
    try {
      setLoading(true)
      setError(null)
      
      const hash = await walletClient.writeContract({
        address: CONTRACT_CONFIG.address,
        abi: PAYROLL_STREAM_ABI,
        functionName: 'pauseStream',
        args: [streamId],
      })
      
      await publicClient?.waitForTransactionReceipt({ hash })
      
      // Refresh streams
      await refreshStreams()
      
      toast.success('Stream paused successfully!')
      return true
    } catch (error) {
      console.error('Failed to pause stream:', error)
      const errorMessage = handleError(error)
      setError(errorMessage)
      toast.error(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }, [address, walletClient, publicClient, refreshStreams])
  
  // Resume stream
  const resumeStream = useCallback(async (streamId: bigint): Promise<boolean> => {
    if (!address || !walletClient) {
      setError(ERROR_MESSAGES.WALLET_NOT_CONNECTED)
      return false
    }
    
    try {
      setLoading(true)
      setError(null)
      
      const hash = await walletClient.writeContract({
        address: CONTRACT_CONFIG.address,
        abi: PAYROLL_STREAM_ABI,
        functionName: 'resumeStream',
        args: [streamId],
      })
      
      await publicClient?.waitForTransactionReceipt({ hash })
      
      // Refresh streams
      await refreshStreams()
      
      toast.success('Stream resumed successfully!')
      return true
    } catch (error) {
      console.error('Failed to resume stream:', error)
      const errorMessage = handleError(error)
      setError(errorMessage)
      toast.error(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }, [address, walletClient, publicClient, refreshStreams])
  
  // Format salary amount
  const formatSalaryAmount = useCallback((amount: bigint): string => {
    return `${formatEther(amount)} ETH`
  }, [])
  
  // Initialize data when address changes
  useEffect(() => {
    if (address) {
      refreshContractData()
      refreshStreams()
    } else {
      setStreams([])
      setContractBalance(0n)
      setIsOwner(false)
      setIsPaused(false)
      setFheKeyRegistered(false)
    }
  }, [address, refreshContractData, refreshStreams])
  
  return {
    // State
    streams,
    employerStreams,
    employeeStreams,
    loading,
    error,
    contractBalance,
    isOwner,
    isPaused,
    fheKeyRegistered,
    
    // Actions
    createStream,
    requestWithdrawal,
    pauseStream,
    resumeStream,
    registerFHEKey,
    refreshStreams,
    refreshContractData,
    
    // Utilities
    getStreamDetails,
    calculateEarnedAmount,
    formatSalaryAmount,
  }
}

// Error handling utility
function handleError(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes('User rejected')) {
      return 'Transaction was rejected by user'
    }
    if (error.message.includes('insufficient funds')) {
      return ERROR_MESSAGES.INSUFFICIENT_BALANCE
    }
    if (error.message.includes('Contract not deployed')) {
      return ERROR_MESSAGES.CONTRACT_NOT_DEPLOYED
    }
    return error.message
  }
  return ERROR_MESSAGES.TRANSACTION_FAILED
}