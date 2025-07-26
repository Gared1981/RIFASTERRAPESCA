/*
  # Fix ticket numbers - Final solution
  
  1. Create function to generate tickets with proper numbering
  2. Regenerate all tickets for all raffles
  3. Verify ticket generation worked correctly
*/

-- Function to generate tickets for a specific raffle
CREATE OR REPLACE FUNCTION generate_raffle_tickets(raffle_id_param INTEGER, total_tickets_param INTEGER)
RETURNS INTEGER AS $$
DECLARE
  i INTEGER;
  ticket_number TEXT;
  tickets_created INTEGER := 0;
BEGIN
  -- Validate inputs
  IF raffle_id_param IS NULL OR total_tickets_param IS NULL OR total_tickets_param <= 0 THEN
    RAISE EXCEPTION 'Invalid parameters: raffle_id and total_tickets must be positive integers';
  END IF;
  
  -- Delete existing tickets for this raffle
  DELETE FROM tickets WHERE raffle_id = raffle_id_param;
  
  -- Generate tickets from 0000 to total_tickets-1
  FOR i IN 0..(total_tickets_param - 1) LOOP
    -- Format number as 4-digit text with leading zeros
    ticket_number := LPAD(i::TEXT, 4, '0');
    
    -- Insert ticket
    INSERT INTO tickets (number, status, raffle_id)
    VALUES (ticket_number, 'available', raffle_id_param);
    
    tickets_created := tickets_created + 1;
  END LOOP;
  
  RETURN tickets_created;
END;
$$ LANGUAGE plpgsql;

-- Function to regenerate tickets for all raffles
CREATE OR REPLACE FUNCTION regenerate_all_raffle_tickets()
RETURNS TABLE(raffle_id INTEGER, raffle_name TEXT, expected_tickets INTEGER, created_tickets INTEGER, status TEXT) AS $$
DECLARE
  raffle_record RECORD;
  created_count INTEGER;
BEGIN
  -- Process all raffles that have total_tickets > 0
  FOR raffle_record IN 
    SELECT id, name, total_tickets 
    FROM raffles 
    WHERE total_tickets > 0
    ORDER BY id
  LOOP
    -- Generate tickets for this raffle
    BEGIN
      SELECT generate_raffle_tickets(raffle_record.id, raffle_record.total_tickets) INTO created_count;
      
      -- Return success result
      raffle_id := raffle_record.id;
      raffle_name := raffle_record.name;
      expected_tickets := raffle_record.total_tickets;
      created_tickets := created_count;
      status := 'SUCCESS';
      RETURN NEXT;
      
    EXCEPTION WHEN OTHERS THEN
      -- Return error result
      raffle_id := raffle_record.id;
      raffle_name := raffle_record.name;
      expected_tickets := raffle_record.total_tickets;
      created_tickets := 0;
      status := 'ERROR: ' || SQLERRM;
      RETURN NEXT;
    END;
  END LOOP;
  
  RETURN;
END;
$$ LANGUAGE plpgsql;

-- Regenerate all tickets
SELECT * FROM regenerate_all_raffle_tickets();

-- Verify ticket generation
SELECT 
  r.id as raffle_id,
  r.name as raffle_name,
  r.total_tickets as expected,
  COUNT(t.id) as actual_tickets,
  CASE 
    WHEN COUNT(t.id) = r.total_tickets THEN 'OK'
    ELSE 'MISMATCH'
  END as status,
  MIN(t.number) as first_ticket,
  MAX(t.number) as last_ticket
FROM raffles r
LEFT JOIN tickets t ON r.id = t.raffle_id
WHERE r.total_tickets > 0
GROUP BY r.id, r.name, r.total_tickets
ORDER BY r.id;