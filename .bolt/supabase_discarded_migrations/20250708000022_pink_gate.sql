/*
  # Fix Admin Access and Email Column

  1. Changes
    - Create temp_user_emails table if it doesn't exist
    - Fix email column in users table
    - Update authentication policies
    - Ensure admin user has proper permissions
*/

-- Create temp_user_emails table if it doesn't exist
CREATE TABLE IF NOT EXISTS temp_user_emails (
  user_id UUID PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on temp_user_emails
ALTER TABLE temp_user_emails ENABLE ROW LEVEL SECURITY;

-- Add email column to users table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'email'
  ) THEN
    ALTER TABLE users ADD COLUMN email TEXT;
    CREATE INDEX IF NOT EXISTS users_email_idx ON users (email);
    RAISE NOTICE 'Added email column to users table';
  ELSE
    RAISE NOTICE 'Email column already exists in users table';
  END IF;
END $$;

-- Fix authentication for admin access
DO $$
BEGIN
  -- Drop existing policies that might be causing issues
  DROP POLICY IF EXISTS "Allow authenticated operations" ON raffles;
  DROP POLICY IF EXISTS "Allow public read access" ON raffles;
  
  -- Create new, more permissive policies
  CREATE POLICY "Allow authenticated users to manage raffles"
  ON raffles FOR ALL
  TO public
  USING (
    (uid() IS NOT NULL) OR 
    (role() = 'authenticated') OR 
    (current_setting('role', true) = 'authenticated') OR
    (SESSION_USER = 'authenticated')
  )
  WITH CHECK (
    (uid() IS NOT NULL) OR 
    (role() = 'authenticated') OR 
    (current_setting('role', true) = 'authenticated') OR
    (SESSION_USER = 'authenticated')
  );
  
  -- Ensure public read access
  CREATE POLICY "Allow public read access"
  ON raffles FOR SELECT
  TO public
  USING (true);
  
  -- Update admin user if needed
  IF EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'admin@terrapesca.com'
  ) THEN
    -- Update admin user role
    UPDATE auth.users
    SET role = 'authenticated'
    WHERE email = 'admin@terrapesca.com';
    
    RAISE NOTICE 'Updated admin user role';
  END IF;
END $$;

-- Create function to update user email when tickets are purchased
CREATE OR REPLACE FUNCTION update_user_email_on_purchase()
RETURNS TRIGGER AS $$
DECLARE
  user_email TEXT;
BEGIN
  -- If the ticket status is changing to purchased and we have a user_id
  IF NEW.status = 'purchased' AND OLD.status != 'purchased' AND NEW.user_id IS NOT NULL THEN
    -- Check if there's a payment log with this ticket ID that has user_email in metadata
    SELECT pl.metadata->>'user_email' INTO user_email
    FROM payment_logs pl
    WHERE NEW.id = ANY(pl.ticket_ids)
    AND pl.metadata->>'user_email' IS NOT NULL
    LIMIT 1;
    
    IF user_email IS NOT NULL THEN
      -- Update the user's email if it's not set
      UPDATE users
      SET email = user_email
      WHERE id = NEW.user_id
      AND (email IS NULL OR email = '');
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update user email when tickets are purchased
DO $$
BEGIN
  -- Drop the trigger if it exists to avoid conflicts
  DROP TRIGGER IF EXISTS update_user_email_on_purchase_trigger ON tickets;
  
  -- Create the trigger
  CREATE TRIGGER update_user_email_on_purchase_trigger
  AFTER UPDATE ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_user_email_on_purchase();
  
  RAISE NOTICE 'Created trigger to update user email on purchase';
END $$;