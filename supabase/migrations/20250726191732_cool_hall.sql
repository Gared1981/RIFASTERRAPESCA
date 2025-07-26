/*
  # Fix tickets immediately - regenerate all missing ticket numbers

  1. Create function to generate tickets with proper TEXT format
  2. Regenerate tickets for all raffles that need them
  3. Verify ticket generation was successful
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

-- Function to regenerate tickets for all raffles that need them
CREATE OR REPLACE FUNCTION regenerate_missing_tickets()
RETURNS TABLE(raffle_id INTEGER, raffle_name TEXT, expected_tickets INTEGER, created_tickets INTEGER, status TEXT) AS $$
DECLARE
  raffle_record RECORD;
  created_count INTEGER;
  existing_count INTEGER;
BEGIN
  -- Process all raffles
  FOR raffle_record IN 
    SELECT r.id, r.name, r.total_tickets 
    FROM raffles r 
    WHERE r.total_tickets > 0
    ORDER BY r.id
  LOOP
    -- Count existing tickets
    SELECT COUNT(*) INTO existing_count 
    FROM tickets t 
    WHERE t.raffle_id = raffle_record.id;
    
    -- If tickets are missing or count doesn't match, regenerate
    IF existing_count = 0 OR existing_count != raffle_record.total_tickets THEN
      -- Generate tickets for this raffle
      SELECT generate_raffle_tickets(raffle_record.id, raffle_record.total_tickets) INTO created_count;
      
      -- Return the result
      raffle_id := raffle_record.id;
      raffle_name := raffle_record.name;
      expected_tickets := raffle_record.total_tickets;
      created_tickets := created_count;
      status := 'REGENERATED';
      RETURN NEXT;
    ELSE
      -- Tickets already exist and count matches
      raffle_id := raffle_record.id;
      raffle_name := raffle_record.name;
      expected_tickets := raffle_record.total_tickets;
      created_tickets := existing_count;
      status := 'OK';
      RETURN NEXT;
    END IF;
  END LOOP;
  
  RETURN;
END;
$$ LANGUAGE plpgsql;

-- Execute the regeneration
SELECT * FROM regenerate_missing_tickets();

-- Verify ticket generation
SELECT 
  r.id as raffle_id,
  r.name as raffle_name,
  r.total_tickets as expected,
  COUNT(t.id) as actual,
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