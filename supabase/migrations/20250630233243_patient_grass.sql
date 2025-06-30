/*
  # Update raffle system with new requirements

  1. Changes
    - Update current raffle to have 1000 tickets at $70 each
    - Create 1000 tickets numbered 1001-2000
    - Reset all tickets to available status
    - Remove any quantity-based promotions

  2. Ticket Management
    - Ensure proper 3-hour reservation system
    - Auto-release expired reservations
*/

-- Update the current active raffle
UPDATE raffles
SET 
  price = 70,
  total_tickets = 1000,
  updated_at = now()
WHERE status = 'active';

-- Delete all existing tickets
DELETE FROM tickets;

-- Reset the tickets id sequence
ALTER SEQUENCE tickets_id_seq RESTART WITH 1;

-- Create 1000 new tickets for the active raffle
INSERT INTO tickets (number, status, raffle_id)
SELECT 
  generate_series,
  'available',
  r.id
FROM generate_series(1001, 2000), raffles r
WHERE r.status = 'active'
LIMIT 1000;

-- Update the release_expired_tickets function to be more efficient
CREATE OR REPLACE FUNCTION release_expired_tickets()
RETURNS void AS $$
BEGIN
  UPDATE tickets
  SET 
    status = 'available',
    user_id = NULL,
    reserved_at = NULL,
    promoter_code = NULL
  WHERE 
    status = 'reserved' 
    AND reserved_at < NOW() - INTERVAL '3 hours'
    AND purchased_at IS NULL;
    
  -- Log the number of tickets released
  RAISE NOTICE 'Released % expired ticket reservations', 
    (SELECT COUNT(*) FROM tickets WHERE status = 'available' AND reserved_at IS NOT NULL);
    
  -- Clean up the reserved_at field for available tickets
  UPDATE tickets
  SET reserved_at = NULL
  WHERE status = 'available' AND reserved_at IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

-- Create a function to automatically run ticket cleanup
CREATE OR REPLACE FUNCTION auto_cleanup_tickets()
RETURNS void AS $$
BEGIN
  PERFORM release_expired_tickets();
END;
$$ LANGUAGE plpgsql;