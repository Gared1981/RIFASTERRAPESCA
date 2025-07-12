/*
  # Force regenerate all tickets for all raffles
  
  This migration will:
  1. Delete all existing tickets
  2. Regenerate tickets for all raffles that have total_tickets > 0
  3. Ensure proper TEXT format with leading zeros
*/

-- First, let's see what raffles exist and their ticket counts
DO $$
DECLARE
  raffle_record RECORD;
  i INTEGER;
  ticket_number TEXT;
  tickets_created INTEGER := 0;
BEGIN
  -- Log current state
  RAISE NOTICE 'Starting ticket regeneration process...';
  
  -- Delete ALL existing tickets
  DELETE FROM tickets;
  RAISE NOTICE 'Deleted all existing tickets';
  
  -- Loop through all raffles that should have tickets
  FOR raffle_record IN 
    SELECT id, name, total_tickets 
    FROM raffles 
    WHERE total_tickets > 0 
    ORDER BY id
  LOOP
    RAISE NOTICE 'Processing raffle: % (ID: %, Total tickets: %)', 
      raffle_record.name, raffle_record.id, raffle_record.total_tickets;
    
    -- Generate tickets for this raffle
    FOR i IN 0..(raffle_record.total_tickets - 1) LOOP
      -- Format number as 4-digit text with leading zeros
      ticket_number := LPAD(i::TEXT, 4, '0');
      
      -- Insert ticket
      INSERT INTO tickets (number, status, raffle_id, created_at)
      VALUES (ticket_number, 'available', raffle_record.id, NOW());
      
      tickets_created := tickets_created + 1;
    END LOOP;
    
    RAISE NOTICE 'Created % tickets for raffle %', raffle_record.total_tickets, raffle_record.name;
  END LOOP;
  
  RAISE NOTICE 'Ticket regeneration completed. Total tickets created: %', tickets_created;
END $$;

-- Verify the results
SELECT 
  r.id as raffle_id,
  r.name as raffle_name,
  r.total_tickets as expected_tickets,
  COUNT(t.id) as actual_tickets,
  CASE 
    WHEN COUNT(t.id) = r.total_tickets THEN 'OK'
    ELSE 'MISMATCH'
  END as status
FROM raffles r
LEFT JOIN tickets t ON r.id = t.raffle_id
WHERE r.total_tickets > 0
GROUP BY r.id, r.name, r.total_tickets
ORDER BY r.id;

-- Show sample tickets for verification
SELECT 
  r.name as raffle_name,
  t.number,
  t.status,
  t.created_at
FROM tickets t
JOIN raffles r ON t.raffle_id = r.id
ORDER BY r.id, t.number
LIMIT 20;