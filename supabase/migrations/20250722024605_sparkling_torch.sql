/*
  # Fix RLS policies for policies table

  1. Security Updates
    - Drop existing policies that may be incorrectly configured
    - Recreate policies with proper auth.uid() references
    - Ensure authenticated users can perform CRUD operations on their own policies

  2. Policy Changes
    - Allow authenticated users to insert policies where user_id = auth.uid()
    - Allow authenticated users to select their own policies
    - Allow authenticated users to update their own policies
    - Allow authenticated users to delete their own policies
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert own policies" ON policies;
DROP POLICY IF EXISTS "Users can read own policies" ON policies;
DROP POLICY IF EXISTS "Users can update own policies" ON policies;
DROP POLICY IF EXISTS "Users can delete own policies" ON policies;
DROP POLICY IF EXISTS "Users can view own policies" ON policies;

-- Create new policies with proper auth checks
CREATE POLICY "Enable insert for authenticated users" ON policies
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable select for users based on user_id" ON policies
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Enable update for users based on user_id" ON policies
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable delete for users based on user_id" ON policies
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);