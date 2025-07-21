/*
  # Create policies table for insurance policies and warranties

  1. New Tables
    - `policies`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `title` (text, policy name/title)
      - `type` (text, e.g., 'auto', 'renters', 'health', 'warranty')
      - `category` (text, e.g., 'insurance', 'warranty', 'protection_plan')
      - `provider` (text, insurance company or warranty provider)
      - `policy_number` (text, optional)
      - `coverage_amount` (numeric, optional)
      - `deductible` (numeric, optional)
      - `premium` (numeric, monthly premium amount)
      - `start_date` (date, optional)
      - `end_date` (date, optional)
      - `status` (text, default 'active')
      - `document_url` (text, optional, for uploaded policy documents)
      - `notes` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `policies` table
    - Add policies for users to manage their own policies
*/

CREATE TABLE IF NOT EXISTS policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  type text NOT NULL,
  category text NOT NULL DEFAULT 'insurance',
  provider text NOT NULL,
  policy_number text,
  coverage_amount numeric,
  deductible numeric,
  premium numeric,
  start_date date,
  end_date date,
  status text DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'pending')),
  document_url text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE policies ENABLE ROW LEVEL SECURITY;

-- Users can read their own policies
CREATE POLICY "Users can read own policies"
  ON policies
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own policies
CREATE POLICY "Users can insert own policies"
  ON policies
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own policies
CREATE POLICY "Users can update own policies"
  ON policies
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own policies
CREATE POLICY "Users can delete own policies"
  ON policies
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Trigger to automatically update updated_at
CREATE TRIGGER update_policies_updated_at
  BEFORE UPDATE ON policies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_policies_user_id ON policies(user_id);
CREATE INDEX IF NOT EXISTS idx_policies_type ON policies(type);
CREATE INDEX IF NOT EXISTS idx_policies_status ON policies(status);
CREATE INDEX IF NOT EXISTS idx_policies_end_date ON policies(end_date);