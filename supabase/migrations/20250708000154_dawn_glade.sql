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
  DROP POLICY IF EXISTS "Allow authenticated operations" ON raffles;
  DROP POLICY IF EXISTS "Allow public read access" ON raffles;

  CREATE POLICY "Allow authenticated users to manage raffles"
  ON raffles FOR ALL
  TO public
  USING (
    auth.uid() IS NOT NULL OR 
    current_setting('role', true) = 'authenticated'
  )
  WITH CHECK (
    auth.uid() IS NOT NULL OR 
    current_setting('role', true) = 'authenticated'
  );

  CREATE POLICY "Allow public read access"
  ON raffles FOR SELECT
  TO public
  USING (true);

  -- Nota: No es posible modificar el rol en auth.users directamente
  RAISE NOTICE 'Policies created. Skipped role update in auth.users (not supported)';
END $$;

-- Function to update user email when tickets are purchased
CREATE OR REPLACE FUNCTION update_user_email_on_purchase()
RETURNS TRIGGER AS $$
DECLARE
  user_email TEXT;
BEGIN
  IF NEW.status = 'purchased' AND OLD.status != 'purchased' AND NEW.user_id IS NOT NULL THEN
    SELECT pl.metadata->>'user_email' INTO user_email
    FROM payment_logs pl
    WHERE NEW.id = ANY(pl.ticket_ids)
    AND pl.metadata->>'user_email' IS NOT NULL
    LIMIT 1;

    IF user_email IS NOT NULL THEN
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
  DROP TRIGGER IF EXISTS update_user_email_on_purchase_trigger ON tickets;

  CREATE TRIGGER update_user_email_on_purchase_trigger
  AFTER UPDATE ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_user_email_on_purchase();

  RAISE NOTICE 'Created trigger to update user email on purchase';
END $$;
