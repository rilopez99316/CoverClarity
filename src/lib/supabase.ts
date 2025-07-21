import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      policies: {
        Row: {
          id: string
          user_id: string
          title: string
          type: string
          category: string
          provider: string
          policy_number: string | null
          coverage_amount: number | null
          deductible: number | null
          premium: number | null
          start_date: string | null
          end_date: string | null
          status: string
          document_url: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          type: string
          category?: string
          provider: string
          policy_number?: string | null
          coverage_amount?: number | null
          deductible?: number | null
          premium?: number | null
          start_date?: string | null
          end_date?: string | null
          status?: string
          document_url?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          type?: string
          category?: string
          provider?: string
          policy_number?: string | null
          coverage_amount?: number | null
          deductible?: number | null
          premium?: number | null
          start_date?: string | null
          end_date?: string | null
          status?: string
          document_url?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      coverage_recommendations: {
        Row: {
          id: string
          user_id: string
          type: string
          priority: string
          title: string
          description: string
          action_type: string
          estimated_impact: string | null
          is_dismissed: boolean
          is_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          priority?: string
          title: string
          description: string
          action_type: string
          estimated_impact?: string | null
          is_dismissed?: boolean
          is_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          priority?: string
          title?: string
          description?: string
          action_type?: string
          estimated_impact?: string | null
          is_dismissed?: boolean
          is_completed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      coverage_scenarios: {
        Row: {
          id: string
          user_id: string
          scenario_type: string
          title: string
          description: string
          estimated_cost: number
          covered_amount: number
          out_of_pocket: number
          covering_policies: any
          coverage_details: any
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          scenario_type: string
          title: string
          description: string
          estimated_cost?: number
          covered_amount?: number
          out_of_pocket?: number
          covering_policies?: any
          coverage_details?: any
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          scenario_type?: string
          title?: string
          description?: string
          estimated_cost?: number
          covered_amount?: number
          out_of_pocket?: number
          covering_policies?: any
          coverage_details?: any
          created_at?: string
        }
      }
      user_settings: {
        Row: {
          id: string
          user_id: string
          notification_preferences: any
          coverage_goals: any
          risk_tolerance: string
          shared_access_users: any
          ai_coach_enabled: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          notification_preferences?: any
          coverage_goals?: any
          risk_tolerance?: string
          shared_access_users?: any
          ai_coach_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          notification_preferences?: any
          coverage_goals?: any
          risk_tolerance?: string
          shared_access_users?: any
          ai_coach_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Functions: {
      calculate_coverage_health_score: {
        Args: {
          user_uuid: string
        }
        Returns: number
      }
    }
  }
}