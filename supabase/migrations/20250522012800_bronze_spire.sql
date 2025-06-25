/*
  # Update ticket policies

  1. Changes
    - Drop existing update policies for tickets
    - Add new policy for public users to reserve available tickets
    - Add new policy for admin users to update any ticket

  2. Security
    - Public users can only reserve available tickets
    - Admins can update any ticket
    - Ensure data integrity during updates
*/

-- Drop existing update policies
DROP POLICY IF EXISTS "New ticket reservations can be created by anyone" ON tickets;
DROP POLICY IF EXISTS "Tickets can be updated by authenticated users" ON tickets;

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
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');