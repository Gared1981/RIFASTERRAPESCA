/*
  # Add email field to users table

  1. Changes
    - Add email column to users table if it doesn't exist
    - Update existing users with email from payment logs if available
    - Add index on email column for better performance
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
BEGIN
  -- Update users with email from payment logs metadata
  WITH payment_emails AS (
    SELECT 
      DISTINCT ON (t.user_id) 
      t.user_id,
      pl.metadata->>'user_email' AS email
    FROM 
      payment_logs pl
      JOIN tickets t ON t.id = ANY(pl.ticket_ids)
    WHERE 
      pl.metadata->>'user_email' IS NOT NULL
      AND t.user_id IS NOT NULL
  )
  UPDATE users u
  SET email = pe.email
  FROM payment_emails pe
  WHERE 
    u.id = pe.user_id
    AND (u.email IS NULL OR u.email = '');
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  
  RAISE NOTICE 'Updated % users with email from payment logs', updated_count;
END $$;

-- Create function to update user email when tickets are purchased
CREATE OR REPLACE FUNCTION update_user_email_on_purchase()
RETURNS TRIGGER AS $$
BEGIN
  -- If the ticket status is changing to purchased and we have metadata with email
  IF NEW.status = 'purchased' AND OLD.status != 'purchased' AND NEW.user_id IS NOT NULL THEN
    -- Check if there's a payment log with this ticket ID that has user_email in metadata
    DECLARE
      user_email TEXT;
    BEGIN
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
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update user email when tickets are purchased
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_user_email_on_purchase_trigger'
  ) THEN
    CREATE TRIGGER update_user_email_on_purchase_trigger
    AFTER UPDATE ON tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_user_email_on_purchase();
    
    RAISE NOTICE 'Created trigger to update user email on purchase';
  ELSE
    RAISE NOTICE 'Trigger to update user email already exists';
  END IF;
END $$;