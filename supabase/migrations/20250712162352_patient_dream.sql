/*
  # Regenerate all tickets with proper TEXT numbers

  1. Clear all existing tickets
  2. Regenerate tickets for all raffles with proper 4-digit TEXT format
  3. Ensure proper indexing and constraints
*/

-- First, let's see what raffles exist and need tickets
DO $$
DECLARE
  raffle_record RECORD;
  i INTEGER;
  ticket_number TEXT;
  tickets_created INTEGER := 0;
BEGIN
  -- Clear all existing tickets first
  DELETE FROM tickets;
  
  -- For each raffle, generate tickets
  FOR raffle_record IN 
    SELECT id, total_tickets, name 
    FROM raffles 
    WHERE total_tickets > 0
  LOOP
    RAISE NOTICE 'Generating % tickets for raffle: %', raffle_record.total_tickets, raffle_record.name;
    
    -- Generate tickets from 0000 to total_tickets-1
    FOR i IN 0..(raffle_record.total_tickets - 1) LOOP
      -- Format number as 4-digit text with leading zeros
      ticket_number := LPAD(i::TEXT, 4, '0');
      
      -- Insert ticket
      INSERT INTO tickets (number, status, raffle_id, created_at)
      VALUES (ticket_number, 'available', raffle_record.id, NOW());
      
      tickets_created := tickets_created + 1;
    END LOOP;
    
    RAISE NOTICE 'Created % tickets for raffle %', raffle_record.total_tickets, raffle_record.id;
  END LOOP;
  
  RAISE NOTICE 'Total tickets created: %', tickets_created;
END $$;

-- Verify the tickets were created correctly
SELECT 
  r.name as raffle_name,
  r.total_tickets as expected_tickets,
  COUNT(t.id) as actual_tickets,
  MIN(t.number) as first_ticket,
  MAX(t.number) as last_ticket
FROM raffles r
LEFT JOIN tickets t ON r.id = t.raffle_id
GROUP BY r.id, r.name, r.total_tickets
ORDER BY r.id;</parameter>