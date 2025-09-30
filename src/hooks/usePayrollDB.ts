import { useAccount, Address } from 'wagmi'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, PayrollStream, PayrollStreamInsert, PayrollStreamUpdate } from '@/lib/supabase'
import { useSupabaseUser } from './useSupabaseAuth'

export const usePayrollStreams = () => {
  // const { address } = useAccount()
  const { user } = useSupabaseUser()
  const queryClient = useQueryClient()

  const { data: streams, isLoading, error } = useQuery({
    queryKey: ['payroll-streams', user?.id],
    queryFn: async () => {
      if (!user?.id) return []

      const { data, error } = await supabase
        .from('payroll_streams')
        .select(`
          *,
          employer:users!payroll_streams_employer_id_fkey(*),
          employee:users!payroll_streams_employee_id_fkey(*)
        `)
        .or(`employer_id.eq.${user.id},employee_id.eq.${user.id}`)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as (PayrollStream & {
        employer: { id: string; wallet_address: string; name?: string }
        employee: { id: string; wallet_address: string; name?: string }
      })[]
    },
    enabled: !!user?.id,
  })

  const createStream = useMutation({
    mutationFn: async (streamData: Omit<PayrollStreamInsert, 'employer_id'>) => {
      if (!user?.id) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('payroll_streams')
        .insert([{ ...streamData, employer_id: user.id }])
        .select()
        .single()

      if (error) throw error
      return data as PayrollStream
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll-streams'] })
    },
  })

  const updateStream = useMutation({
    mutationFn: async ({ id, ...updates }: PayrollStreamUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('payroll_streams')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as PayrollStream
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll-streams'] })
    },
  })

  return {
    streams,
    isLoading,
    error,
    createStream,
    updateStream,
  }
}

export const useWithdrawals = (streamId?: string) => {
  const { user } = useSupabaseUser()
  const queryClient = useQueryClient()

  const { data: withdrawals, isLoading, error } = useQuery({
    queryKey: ['withdrawals', streamId, user?.id],
    queryFn: async () => {
      if (!user?.id) return []

      let query = supabase
        .from('withdrawals')
        .select(`
          *,
          employee:users!withdrawals_employee_id_fkey(*)
        `)
        .order('created_at', { ascending: false })

      if (streamId) {
        query = query.eq('stream_id', streamId)
      }

      const { data, error } = await query

      if (error) throw error
      return data as any[]
    },
    enabled: !!user?.id,
  })

  const createWithdrawal = useMutation({
    mutationFn: async (withdrawalData: WithdrawalInsert) => {
      if (!user?.id) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('withdrawals')
        .insert([withdrawalData])
        .select()
        .single()

      if (error) throw error
      return data as Withdrawal
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['withdrawals'] })
    },
  })

  return {
    withdrawals,
    isLoading,
    error,
    createWithdrawal,
  }
}