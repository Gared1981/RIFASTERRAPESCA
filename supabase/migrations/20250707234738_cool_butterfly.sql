/*
  # Add email column to users table and update existing users
  
  1. Changes
    - Add email column to users table if it doesn't exist
    - Create function to update user email when tickets are purchased
    - Create trigger to automatically update user email
    
  2. Security
    - Ensures email column exists before attempting updates
    - Properly handles column references in SQL statements
*/

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

-- Update existing users with email from payment logs if available
DO $$
DECLARE
  updated_count INTEGER := 0;
  email_column_exists BOOLEAN;
BEGIN
  -- Check if email column exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'email'
  ) INTO email_column_exists;
  
  IF email_column_exists THEN
    -- First create a temporary table with the data we want to update
    CREATE TEMP TABLE temp_user_emails AS
    SELECT DISTINCT ON (t.user_id) 
      t.user_id,
      pl.metadata->>'user_email' AS user_email
    FROM 
      payment_logs pl
      JOIN tickets t ON t.id = ANY(pl.ticket_ids)
    WHERE 
      pl.metadata->>'user_email' IS NOT NULL
      AND t.user_id IS NOT NULL;
    
    -- Then update users table using the temp table
    UPDATE users
    SET email = temp.user_email
    FROM temp_user_emails temp
    WHERE 
      users.id = temp.user_id
      AND (users.email IS NULL OR users.email = '');
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    
    -- Drop the temporary table
    DROP TABLE temp_user_emails;
    
    RAISE NOTICE 'Updated % users with email from payment logs', updated_count;
  ELSE
    RAISE NOTICE 'Email column does not exist, skipping email update';
  END IF;
END $$;

-- Create function to update user email when tickets are purchased
CREATE OR REPLACE FUNCTION update_user_email_on_purchase()
RETURNS TRIGGER AS $$
DECLARE
  user_email TEXT;
  email_column_exists BOOLEAN;
BEGIN
  -- If the ticket status is changing to purchased and we have a user_id
  IF NEW.status = 'purchased' AND OLD.status != 'purchased' AND NEW.user_id IS NOT NULL THEN
    -- Check if email column exists in users table
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'email'
    ) INTO email_column_exists;
    
    IF NOT email_column_exists THEN
      -- Skip the update if email column doesn't exist
      RETURN NEW;
    END IF;
    
    -- Check if there's a payment log with this ticket ID that has user_email in metadata
    SELECT pl.metadata->>'user_email' INTO user_email
    FROM payment_logs pl
    WHERE NEW.id = ANY(pl.ticket_ids)
    AND pl.metadata->>'user_email' IS NOT NULL
    LIMIT 1;
    
    IF user_email IS NOT NULL THEN
      -- Update the user's email if it's not set
      EXECUTE 'UPDATE users SET email = $1 WHERE id = $2 AND (email IS NULL OR email = $3)'
      USING user_email, NEW.user_id, '';
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