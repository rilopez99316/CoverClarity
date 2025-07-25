/*
  # Fix RLS Policies for Policies Table

  This migration fixes the RLS policies by using the correct syntax for auth.uid()
  with SELECT statement to properly authenticate users.

  1. Security
    - Drop existing policies that may have incorrect syntax
    - Create new policies with (select auth.uid()) = user_id syntax
    - Ensure proper CRUD permissions for authenticated users
*/

-- Drop existing policies
DROP POLICY IF EXISTS "policies_select_policy" ON policies;
DROP POLICY IF EXISTS "policies_insert_policy" ON policies;
DROP POLICY IF EXISTS "policies_update_policy" ON policies;
DROP POLICY IF EXISTS "policies_delete_policy" ON policies;

-- Create new policies with correct auth.uid() syntax
CREATE POLICY "Users can view own policies"
  ON policies
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own policies"
  ON policies
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own policies"
  ON policies
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own policies"
  ON policies
  FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);