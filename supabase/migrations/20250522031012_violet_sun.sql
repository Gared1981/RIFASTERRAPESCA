/*
  # Update ticket numbers to 4 digits

  1. Changes
    - Delete existing tickets
    - Create new tickets with 4-digit numbers (1001-9999)
    - Add check constraint to ensure 4-digit numbers
*/

-- First, delete existing tickets
DELETE FROM tickets;

-- Reset the tickets id sequence
ALTER SEQUENCE tickets_id_seq RESTART WITH 1;

-- Add check constraint for 4-digit numbers
ALTER TABLE tickets ADD CONSTRAINT tickets_number_check CHECK (number >= 1001 AND number <= 9999);

-- Insert new tickets with 4-digit numbers for active raffles
INSERT INTO tickets (number, status, raffle_id)
SELECT 
  generate_series,
  'available',
  r.id
FROM generate_series(1001, 9999), raffles r
WHERE r.status = 'active';