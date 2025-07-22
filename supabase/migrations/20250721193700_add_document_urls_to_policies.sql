-- Add document_urls column to policies table
ALTER TABLE policies
ADD COLUMN document_urls TEXT[];

-- Update RLS policies to include document_urls
DROP POLICY IF EXISTS "Users can view own policies" ON policies;
DROP POLICY IF EXISTS "Users can insert own policies" ON policies;
DROP POLICY IF EXISTS "Users can update own policies" ON policies;

-- Recreate RLS policies to include document_urls
CREATE POLICY "Users can view own policies"
  ON policies
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own policies"
  ON policies
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own policies"
  ON policies
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
