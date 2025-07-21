/*
  # Insert sample data for testing and demonstration

  1. Sample Data
    - Sample coverage recommendations
    - Sample policy types and categories
    - Common scenario types

  Note: This data will be inserted for demonstration purposes
*/

-- Insert sample coverage recommendation types (these can be used as templates)
INSERT INTO coverage_recommendations (
  user_id, 
  type, 
  priority, 
  title, 
  description, 
  action_type, 
  estimated_impact
) VALUES 
-- These are template recommendations that won't show up for users
-- They're just here to demonstrate the data structure
('00000000-0000-0000-0000-000000000000', 'liability', 'high', 'Increase Liability Coverage', 'Consider increasing your renters insurance liability coverage to $300K for better protection', 'increase_coverage', 'Better protection against lawsuits'),
('00000000-0000-0000-0000-000000000000', 'gap_analysis', 'medium', 'Add Umbrella Policy', 'You may benefit from an umbrella policy to cover gaps in your current coverage', 'add_policy', 'Additional $1M+ in liability protection'),
('00000000-0000-0000-0000-000000000000', 'cost_optimization', 'low', 'Review Deductibles', 'Consider raising your auto insurance deductible to lower your premium', 'review_deductible', 'Potential savings of $200-400/year')
ON CONFLICT DO NOTHING;

-- Create a function to calculate coverage health score
CREATE OR REPLACE FUNCTION calculate_coverage_health_score(user_uuid uuid)
RETURNS integer AS $$
DECLARE
  score integer := 100;
  policy_count integer;
  expired_count integer;
  missing_essential boolean := false;
BEGIN
  -- Get policy counts
  SELECT COUNT(*) INTO policy_count 
  FROM policies 
  WHERE user_id = user_uuid AND status = 'active';
  
  SELECT COUNT(*) INTO expired_count 
  FROM policies 
  WHERE user_id = user_uuid AND status = 'expired';
  
  -- Deduct points for expired policies
  score := score - (expired_count * 10);
  
  -- Deduct points if no policies at all
  IF policy_count = 0 THEN
    score := score - 50;
  END IF;
  
  -- Check for essential coverage types
  IF NOT EXISTS (
    SELECT 1 FROM policies 
    WHERE user_id = user_uuid 
    AND type IN ('auto', 'renters', 'health') 
    AND status = 'active'
  ) THEN
    score := score - 20;
  END IF;
  
  -- Ensure score is between 0 and 100
  IF score < 0 THEN score := 0; END IF;
  IF score > 100 THEN score := 100; END IF;
  
  RETURN score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;