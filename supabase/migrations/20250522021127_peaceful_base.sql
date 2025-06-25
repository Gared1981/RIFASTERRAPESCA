/*
  # Fix RLS policies for tickets table
  
  1. Changes
    - Drop existing policies that are causing conflicts
    - Create new, more permissive policies for ticket management
    - Ensure authenticated users can manage tickets
    - Allow public users to view tickets
  
  2. Security
    - Maintain basic security while allowing necessary operations
    - Keep public read access for ticket availability
*/

-- First, drop all existing ticket policies to start fresh
DROP POLICY IF EXISTS "Tickets are viewable by everyone" ON tickets;
DROP POLICY IF EXISTS "Allow reserving available tickets" ON tickets;
DROP POLICY IF EXISTS "Admins can update any ticket" ON tickets;
DROP POLICY IF EXISTS "Allow authenticated users to insert tickets" ON tickets;

-- Create new policies

-- Allow anyone to view tickets
CREATE POLICY "Tickets are viewable by everyone"
ON tickets FOR SELECT
TO public
USING (true);

-- Allow authenticated users to insert tickets
CREATE POLICY "Allow authenticated users to insert tickets"
ON tickets FOR INSERT
TO public
WITH CHECK (
  auth.role() = 'authenticated'
);

-- Allow authenticated users to update any ticket
CREATE POLICY "Allow authenticated users to update tickets"
ON tickets FOR UPDATE
TO public
USING (
  auth.role() = 'authenticated'
);

-- Allow public users to reserve available tickets
CREATE POLICY "Allow public users to reserve available tickets"
ON tickets FOR UPDATE
TO public
USING (
  status = 'available'
)
WITH CHECK (
  status = 'reserved' AND
  reserved_at IS NOT NULL AND
  user_id IS NOT NULL
);