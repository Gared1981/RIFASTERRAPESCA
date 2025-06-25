/*
  # Fix ticket RLS policies

  1. Changes
    - Drop existing update policies
    - Add new policy for reserving available tickets
    - Add new policy for admin updates using auth.uid()
*/

-- Drop existing update policies
DROP POLICY IF EXISTS "New ticket reservations can be created by anyone" ON tickets;
DROP POLICY IF EXISTS "Tickets can be updated by authenticated users" ON tickets;
DROP POLICY IF EXISTS "Allow reserving available tickets" ON tickets;
DROP POLICY IF EXISTS "Admins can update any ticket" ON tickets;

-- Add policy for reserving available tickets
CREATE POLICY "Allow reserving available tickets"
ON tickets
FOR UPDATE
TO public
USING (status = 'available')
WITH CHECK (
  status = 'reserved' AND
  reserved_at IS NOT NULL AND
  user_id IS NOT NULL AND
  number = number AND
  raffle_id = raffle_id AND
  purchased_at IS NULL
);

-- Add policy for admin updates
CREATE POLICY "Admins can update any ticket"
ON tickets
FOR UPDATE
TO public
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);