import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4c2ZqZXFjZmd6eG9yeWRhYmdwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzA5MzExNywiZXhwIjoyMDY4NjY5MTE3fQ.G631xC_3y6S2YzGv0elMklVoZT0Crnw9mU-2hOMeij4'

if (!supabaseUrl) {
  throw new Error('Missing Supabase URL environment variable')
}

// Create a Supabase client with the service role key which bypasses RLS
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  global: {
    headers: {
      'apikey': supabaseServiceRoleKey,
      'Authorization': `Bearer ${supabaseServiceRoleKey}`
    }
  }
})
