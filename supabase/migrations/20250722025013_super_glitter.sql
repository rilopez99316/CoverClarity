/*
  # Fix RLS policies for policies table

  1. Security
    - Drop existing policies that may be misconfigured
    - Create new policies with proper auth.uid() checks
    - Ensure authenticated users can perform CRUD operations on their own policies
    - Use standard Supabase RLS patterns

  2. Changes
    - Fix INSERT policy to allow authenticated users to create policies
    - Ensure WITH CHECK clause properly validates user ownership
    - Add comprehensive CRUD policies for complete access control
*/

-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.policies;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.policies;
DROP POLICY IF EXISTS "Enable select for users based on user_id" ON public.policies;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.policies;

-- Ensure RLS is enabled
ALTER TABLE public.policies ENABLE ROW LEVEL SECURITY;

-- Create new policies with proper auth checks
CREATE POLICY "policies_insert_policy" ON public.policies
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "policies_select_policy" ON public.policies
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "policies_update_policy" ON public.policies
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "policies_delete_policy" ON public.policies
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);