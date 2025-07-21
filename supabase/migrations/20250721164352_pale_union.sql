/*
  # Create Specific User Profile

  1. User Details
    - Username: rilopez99316
    - Email: ilbroberto99316@gmail.com
    - Full Name: Roberto Lopez
    - Password: J3r3m!@h29:11

  2. Security
    - This creates the profile entry for the user
    - The actual auth user must be created through Supabase Auth
    - RLS policies will ensure data security

  Note: The auth user creation with password must be done through the application
  or Supabase dashboard, as we cannot directly insert into auth.users table.
*/

-- Create a function to handle user profile creation
CREATE OR REPLACE FUNCTION create_user_profile(
  p_user_id uuid,
  user_email text,
  user_full_name text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (p_user_id, user_email, user_full_name)
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    updated_at = now();
END;
$$;

-- Create default user settings function
CREATE OR REPLACE FUNCTION create_default_user_settings(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO user_settings (user_id)
  VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING;
END;
$$;

-- Create trigger to automatically create user settings when profile is created
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM create_default_user_settings(NEW.id);
  RETURN NEW;
END;
$$;

-- Drop trigger if exists and create new one
DROP TRIGGER IF EXISTS on_profile_created ON profiles;
CREATE TRIGGER on_profile_created
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();