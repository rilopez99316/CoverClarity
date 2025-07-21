/*
  # Create coverage scenarios table for "what if" simulations

  1. New Tables
    - `coverage_scenarios`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `scenario_type` (text, e.g., 'car_accident', 'phone_damage', 'theft')
      - `title` (text, scenario title)
      - `description` (text, scenario description)
      - `estimated_cost` (numeric, total estimated cost)
      - `covered_amount` (numeric, amount covered by insurance/warranty)
      - `out_of_pocket` (numeric, user's out-of-pocket cost)
      - `covering_policies` (jsonb, array of policy IDs that would cover this)
      - `coverage_details` (jsonb, detailed breakdown of coverage)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `coverage_scenarios` table
    - Add policies for users to manage their own scenarios
*/

CREATE TABLE IF NOT EXISTS coverage_scenarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  scenario_type text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  estimated_cost numeric DEFAULT 0,
  covered_amount numeric DEFAULT 0,
  out_of_pocket numeric DEFAULT 0,
  covering_policies jsonb DEFAULT '[]'::jsonb,
  coverage_details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE coverage_scenarios ENABLE ROW LEVEL SECURITY;

-- Users can read their own scenarios
CREATE POLICY "Users can read own scenarios"
  ON coverage_scenarios
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own scenarios
CREATE POLICY "Users can insert own scenarios"
  ON coverage_scenarios
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own scenarios
CREATE POLICY "Users can delete own scenarios"
  ON coverage_scenarios
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_coverage_scenarios_user_id ON coverage_scenarios(user_id);
CREATE INDEX IF NOT EXISTS idx_coverage_scenarios_type ON coverage_scenarios(scenario_type);