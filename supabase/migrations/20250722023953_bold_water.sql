/*
  # Fix RLS policies for policies table

  1. Security Updates
    - Drop existing policies that may be misconfigured
    - Create new INSERT policy for authenticated users
    - Ensure proper user ID matching with auth.uid()
    - Add helper function to get current user ID safely

  2. Changes
    - Fix INSERT policy to allow users to create their own policies
    - Ensure auth.uid() properly matches user_id column
    - Add safety checks for authentication
*/

-- Create helper function to safely get current user ID
CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid
LANGUAGE sql STABLE
AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json ->> 'sub',
    (current_setting('request.jwt.claims', true)::json ->> 'user_id')
  )::uuid
$$;

-- Drop existing INSERT policy if it exists
DROP POLICY IF EXISTS "Users can insert own policies" ON policies;

-- Create new INSERT policy that allows authenticated users to insert their own policies
CREATE POLICY "Users can insert own policies"
  ON policies
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Ensure SELECT policy exists and is correct
DROP POLICY IF EXISTS "Users can read own policies" ON policies;
CREATE POLICY "Users can read own policies"
  ON policies
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Ensure UPDATE policy exists and is correct
DROP POLICY IF EXISTS "Users can update own policies" ON policies;
CREATE POLICY "Users can update own policies"
  ON policies
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Ensure DELETE policy exists and is correct
DROP POLICY IF EXISTS "Users can delete own policies" ON policies;
CREATE POLICY "Users can delete own policies"
  ON policies
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Ensure RLS is enabled on the policies table
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;