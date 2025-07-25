import { supabaseAdmin } from '../lib/supabaseAdmin'

export const useSupabaseAdmin = () => {
  return {
    supabase: supabaseAdmin,
    // You can add any admin-specific methods here
    async executeAsAdmin<T = any>(query: () => Promise<{ data: T | null; error: any }>) {
      // This method will execute the query with admin privileges
      return await query()
    }
  }
}
