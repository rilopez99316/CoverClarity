/*
  # Create coverage recommendations table for AI-generated suggestions

  1. New Tables
    - `coverage_recommendations`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `type` (text, recommendation type)
      - `priority` (text, high/medium/low)
      - `title` (text, recommendation title)
      - `description` (text, detailed recommendation)
      - `action_type` (text, e.g., 'increase_coverage', 'add_policy', 'review_deductible')
      - `estimated_impact` (text, optional impact description)
      - `is_dismissed` (boolean, default false)
      - `is_completed` (boolean, default false)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `coverage_recommendations` table
    - Add policies for users to manage their own recommendations
*/

CREATE TABLE IF NOT EXISTS coverage_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  title text NOT NULL,
  description text NOT NULL,
  action_type text NOT NULL,
  estimated_impact text,
  is_dismissed boolean DEFAULT false,
  is_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE coverage_recommendations ENABLE ROW LEVEL SECURITY;

-- Users can read their own recommendations
CREATE POLICY "Users can read own recommendations"
  ON coverage_recommendations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can update their own recommendations (dismiss/complete)
CREATE POLICY "Users can update own recommendations"
  ON coverage_recommendations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- System can insert recommendations for users
CREATE POLICY "System can insert recommendations"
  ON coverage_recommendations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Trigger to automatically update updated_at
CREATE TRIGGER update_coverage_recommendations_updated_at
  BEFORE UPDATE ON coverage_recommendations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_coverage_recommendations_user_id ON coverage_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_coverage_recommendations_priority ON coverage_recommendations(priority);
CREATE INDEX IF NOT EXISTS idx_coverage_recommendations_dismissed ON coverage_recommendations(is_dismissed);
CREATE INDEX IF NOT EXISTS idx_coverage_recommendations_completed ON coverage_recommendations(is_completed);