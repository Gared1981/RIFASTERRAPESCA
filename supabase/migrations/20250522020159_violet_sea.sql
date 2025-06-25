/*
  # Add INSERT policy for tickets table

  1. Changes
    - Add INSERT policy to tickets table allowing authenticated users to create tickets
    
  2. Security
    - Only authenticated users can insert tickets
    - Ensures basic ticket data validation
*/

CREATE POLICY "Allow authenticated users to insert tickets"
ON public.tickets
FOR INSERT
TO public
WITH CHECK (
  -- Ensure user is authenticated
  auth.role() = 'authenticated' AND
  -- Basic validation
  status IN ('available', 'reserved', 'purchased') AND
  number > 0 AND
  raffle_id IS NOT NULL
);