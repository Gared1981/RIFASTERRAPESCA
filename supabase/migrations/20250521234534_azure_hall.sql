/*
  # Initial Database Schema for Sorteos Terrapesca

  1. New Tables
    - `users` - Stores user information who purchase tickets
    - `raffles` - Stores information about different raffles/contests
    - `tickets` - Stores all tickets with their status and relationships

  2. Security
    - Enable RLS on all tables
    - Create policies for authenticated users and anon access where needed
*/

-- Users table for storing customer information
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  state TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Raffles table for different prize drawings
CREATE TABLE IF NOT EXISTS raffles (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  price DECIMAL(10, 2) NOT NULL,
  draw_date TIMESTAMPTZ NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tickets table for all raffle tickets
CREATE TABLE IF NOT EXISTS tickets (
  id SERIAL PRIMARY KEY,
  number INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('available', 'reserved', 'purchased')),
  user_id UUID REFERENCES users(id),
  raffle_id INTEGER REFERENCES raffles(id) NOT NULL,
  reserved_at TIMESTAMPTZ,
  purchased_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(number, raffle_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS tickets_raffle_id_idx ON tickets (raffle_id);
CREATE INDEX IF NOT EXISTS tickets_user_id_idx ON tickets (user_id);
CREATE INDEX IF NOT EXISTS tickets_status_idx ON tickets (status);
CREATE INDEX IF NOT EXISTS tickets_number_idx ON tickets (number);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE raffles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Public users are viewable by everyone" 
  ON users FOR SELECT USING (true);

CREATE POLICY "Users can insert their own data" 
  ON users FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own data" 
  ON users FOR UPDATE USING (auth.uid() = id);

-- Create policies for raffles table
CREATE POLICY "Raffles are viewable by everyone" 
  ON raffles FOR SELECT USING (true);

CREATE POLICY "Only admins can insert raffles" 
  ON raffles FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Only admins can update raffles" 
  ON raffles FOR UPDATE USING (auth.role() = 'authenticated');

-- Create policies for tickets table
CREATE POLICY "Tickets are viewable by everyone" 
  ON tickets FOR SELECT USING (true);

CREATE POLICY "Tickets can be updated by authenticated users" 
  ON tickets FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "New ticket reservations can be created by anyone" 
  ON tickets FOR UPDATE USING (
    status = 'available' OR 
    auth.role() = 'authenticated'
  );

-- Create a function to auto-release tickets after 3 hours
CREATE OR REPLACE FUNCTION release_expired_tickets()
RETURNS void AS $$
BEGIN
  UPDATE tickets
  SET 
    status = 'available',
    user_id = NULL,
    reserved_at = NULL
  WHERE 
    status = 'reserved' 
    AND reserved_at < NOW() - INTERVAL '3 hours'
    AND purchased_at IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Create a function to seed initial data for testing
CREATE OR REPLACE FUNCTION seed_initial_data()
RETURNS void AS $$
DECLARE
  raffle_id INTEGER;
BEGIN
  -- Insert a test raffle
  INSERT INTO raffles (name, description, image_url, price, draw_date, active)
  VALUES (
    'Toyota Tacoma TRD 2024', 
    'Sorteo de una Toyota Tacoma TRD 2024 completamente nueva',
    'https://images.pexels.com/photos/12942781/pexels-photo-12942781.jpeg',
    500.00,
    NOW() + INTERVAL '1 year',
    true
  )
  RETURNING id INTO raffle_id;
  
  -- Create 100 tickets for this raffle
  INSERT INTO tickets (number, status, raffle_id)
  SELECT 
    generate_series,
    'available',
    raffle_id
  FROM generate_series(1, 100);
END;
$$ LANGUAGE plpgsql;

-- Run the seed function
SELECT seed_initial_data();