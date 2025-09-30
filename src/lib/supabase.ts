import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          wallet_address: string
          email: string | null
          name: string | null
          role: 'employer' | 'employee'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          wallet_address: string
          email?: string | null
          name?: string | null
          role: 'employer' | 'employee'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          wallet_address?: string
          email?: string | null
          name?: string | null
          role?: 'employer' | 'employee'
          updated_at?: string
        }
      }
      payroll_streams: {
        Row: {
          id: string
          stream_id: string
          employer_id: string
          employee_id: string
          contract_address: string
          encrypted_salary: string
          salary_amount: number
          currency: string
          status: 'active' | 'paused' | 'completed' | 'cancelled'
          start_date: string
          end_date: string | null
          last_withdrawal_at: string | null
          total_withdrawn: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          stream_id: string
          employer_id: string
          employee_id: string
          contract_address: string
          encrypted_salary: string
          salary_amount: number
          currency?: string
          status?: 'active' | 'paused' | 'completed' | 'cancelled'
          start_date: string
          end_date?: string | null
          last_withdrawal_at?: string | null
          total_withdrawn?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          stream_id?: string
          employer_id?: string
          employee_id?: string
          contract_address?: string
          encrypted_salary?: string
          salary_amount?: number
          currency?: string
          status?: 'active' | 'paused' | 'completed' | 'cancelled'
          start_date?: string
          end_date?: string | null
          last_withdrawal_at?: string | null
          total_withdrawn?: number
          updated_at?: string
        }
      }
      withdrawals: {
        Row: {
          id: string
          stream_id: string
          payroll_stream_id: string
          employee_id: string
          withdrawal_request_id: string
          amount: number
          currency: string
          status: 'pending' | 'processing' | 'completed' | 'failed'
          transaction_hash: string | null
          block_number: number | null
          gas_used: number | null
          error_message: string | null
          created_at: string
          updated_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          stream_id: string
          payroll_stream_id: string
          employee_id: string
          withdrawal_request_id: string
          amount: number
          currency?: string
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          transaction_hash?: string | null
          block_number?: number | null
          gas_used?: number | null
          error_message?: string | null
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          stream_id?: string
          payroll_stream_id?: string
          employee_id?: string
          withdrawal_request_id?: string
          amount?: number
          currency?: string
          status?: 'pending' | 'processing' | 'completed' | 'failed'
          transaction_hash?: string | null
          block_number?: number | null
          gas_used?: number | null
          error_message?: string | null
          updated_at?: string
          completed_at?: string | null
        }
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          resource_type: string
          resource_id: string | null
          old_values: Record<string, unknown> | null
          new_values: Record<string, unknown> | null
          ip_address: string | null
          user_agent: string | null
          metadata: Record<string, unknown> | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          resource_type: string
          resource_id?: string | null
          old_values?: Record<string, any> | null
          new_values?: Record<string, any> | null
          ip_address?: string | null
          user_agent?: string | null
          metadata?: Record<string, any> | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          action?: string
          resource_type?: string
          resource_id?: string | null
          old_values?: Record<string, any> | null
          new_values?: Record<string, any> | null
          ip_address?: string | null
          user_agent?: string | null
          metadata?: Record<string, any> | null
        }
      }
    }
  }
}

// Type helpers
export type User = Database['public']['Tables']['users']['Row']
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type UserUpdate = Database['public']['Tables']['users']['Update']

export type PayrollStream = Database['public']['Tables']['payroll_streams']['Row']
export type PayrollStreamInsert = Database['public']['Tables']['payroll_streams']['Insert']
export type PayrollStreamUpdate = Database['public']['Tables']['payroll_streams']['Update']

export type Withdrawal = Database['public']['Tables']['withdrawals']['Row']
export type WithdrawalInsert = Database['public']['Tables']['withdrawals']['Insert']
export type WithdrawalUpdate = Database['public']['Tables']['withdrawals']['Update']

export type AuditLog = Database['public']['Tables']['audit_logs']['Row']
export type AuditLogInsert = Database['public']['Tables']['audit_logs']['Insert']