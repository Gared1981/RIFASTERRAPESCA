-- Create temp_user_emails table if it doesn't exist
-- Crear tabla temporal para correos si no existe
CREATE TABLE IF NOT EXISTS temp_user_emails (
  user_id UUID PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE temp_user_emails ENABLE ROW LEVEL SECURITY;

-- Agregar columna email a users si no existe
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

-- Eliminar todas las policies en raffles que puedan causar conflicto
DO $$
BEGIN
  DROP POLICY IF EXISTS "Allow authenticated operations" ON raffles;
  DROP POLICY IF EXISTS "Allow public read access" ON raffles;
  DROP POLICY IF EXISTS "Allow authenticated users to manage raffles" ON raffles;
  DROP POLICY IF EXISTS "Authenticated users can manage raffles" ON raffles;
  DROP POLICY IF EXISTS "Authenticated sessions can manage raffles" ON raffles;
  DROP POLICY IF EXISTS "Enable read access for all users" ON raffles;
  DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON raffles;
  DROP POLICY IF EXISTS "Public read access for raffles" ON raffles;
  DROP POLICY IF EXISTS "Authenticated insert for raffles" ON raffles;
  DROP POLICY IF EXISTS "Authenticated update for raffles" ON raffles;
  DROP POLICY IF EXISTS "Authenticated delete for raffles" ON raffles;

  RAISE NOTICE 'Dropped all existing raffle policies';
END $$;

-- Crear nuevas policies seguras con nombres únicos
DO $$
BEGIN
  CREATE POLICY "raffle_public_read_access_v2"
  ON raffles FOR SELECT
  TO public
  USING (true);

  CREATE POLICY "raffle_authenticated_management_v2"
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

  RAISE NOTICE 'Created new raffle policies with unique names';
END $$;

-- Intentar actualizar el rol del admin (no válido en Supabase, pero dejamos el mensaje)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'admin@terrapesca.com'
  ) THEN
    RAISE NOTICE 'Admin user found, but roles must be set via JWT or auth claims.';
  ELSE
    RAISE NOTICE 'Admin user not found';
  END IF;
END $$;

-- Función para actualizar email al comprar
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

      RAISE NOTICE 'Updated user email for user_id: % with email: %', NEW.user_id, user_email;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para ejecutar función después de comprar
DO $$
BEGIN
  DROP TRIGGER IF EXISTS update_user_email_on_purchase_trigger ON tickets;

  CREATE TRIGGER update_user_email_on_purchase_trigger
  AFTER UPDATE ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_user_email_on_purchase();

  RAISE NOTICE 'Created trigger to update user email on purchase';
END $$;

-- Agregar columna notification_sent a payment_logs si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'payment_logs' AND column_name = 'notification_sent'
  ) THEN
    ALTER TABLE payment_logs ADD COLUMN notification_sent BOOLEAN DEFAULT false;
    RAISE NOTICE 'Added notification_sent column to payment_logs table';
  ELSE
    RAISE NOTICE 'notification_sent column already exists in payment_logs table';
  END IF;
END $$;
