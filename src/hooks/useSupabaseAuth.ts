import { useAccount } from 'wagmi'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase, User, UserInsert } from '@/lib/supabase'

export const useSupabaseUser = () => {
  const { address } = useAccount()
  const queryClient = useQueryClient()

  const { data: user, isLoading, error } = useQuery({
    queryKey: ['supabase-user', address],
    queryFn: async () => {
      if (!address) return null

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('wallet_address', address.toLowerCase())
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      return data as User
    },
    enabled: !!address,
  })

  const createUser = useMutation({
    mutationFn: async (userData: Omit<UserInsert, 'wallet_address'>) => {
      if (!address) throw new Error('No wallet address')

      const { data, error } = await supabase
        .from('users')
        .insert([{ ...userData, wallet_address: address.toLowerCase() }])
        .select()
        .single()

      if (error) throw error
      return data as User
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['supabase-user', address], data)
    },
  })

  const updateUser = useMutation({
    mutationFn: async (userData: UserUpdate) => {
      if (!address) throw new Error('No wallet address')

      const { data, error } = await supabase
        .from('users')
        .update(userData)
        .eq('wallet_address', address.toLowerCase())
        .select()
        .single()

      if (error) throw error
      return data as User
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['supabase-user', address], data)
    },
  })

  return {
    user,
    isLoading,
    error,
    createUser,
    updateUser,
    isAuthenticated: !!user,
  }
}