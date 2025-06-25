/*
  # Update ticket numbers to 4 digits

  1. Changes
    - Update existing tickets to have 4-digit numbers
    - Create new tickets with 4-digit numbers
*/

-- First, delete existing tickets
DELETE FROM tickets;

-- Reset the tickets id sequence
ALTER SEQUENCE tickets_id_seq RESTART WITH 1;

-- Insert new tickets with 4-digit numbers
INSERT INTO tickets (number, status, raffle_id)
SELECT 
  generate_series,
  'available',
  (SELECT id FROM raffles WHERE active = true LIMIT 1)
FROM generate_series(1001, 2000);