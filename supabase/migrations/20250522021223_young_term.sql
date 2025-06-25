-- First, drop existing raffle policies to start fresh
DROP POLICY IF EXISTS "Raffles are viewable by everyone" ON raffles;
DROP POLICY IF EXISTS "Only admins can insert raffles" ON raffles;
DROP POLICY IF EXISTS "Only admins can update raffles" ON raffles;

-- Create new policies

-- Allow anyone to view raffles
CREATE POLICY "Raffles are viewable by everyone"
ON raffles FOR SELECT
TO public
USING (true);

-- Allow authenticated users to insert raffles
CREATE POLICY "Allow authenticated users to insert raffles"
ON raffles FOR INSERT
TO public
WITH CHECK (
  auth.role() = 'authenticated'
);

-- Allow authenticated users to update raffles
CREATE POLICY "Allow authenticated users to update raffles"
ON raffles FOR UPDATE
TO public
USING (
  auth.role() = 'authenticated'
);

-- Allow authenticated users to delete raffles
CREATE POLICY "Allow authenticated users to delete raffles"
ON raffles FOR DELETE
TO public
USING (
  auth.role() = 'authenticated'
);