/*
  # Fix ticket numbering to start from 0000

  1. Changes
    - Update all existing tickets to start numbering from 0000
    - Renumber tickets sequentially starting from 0 for each raffle
    - Maintain the same order but change the numbering system

  2. Security
    - This operation will update ticket numbers but preserve all other data
    - User assignments and status remain unchanged
*/

-- Function to renumber tickets for all raffles starting from 0000
DO $$
DECLARE
    raffle_record RECORD;
    ticket_record RECORD;
    new_number INTEGER;
BEGIN
    -- Loop through each raffle
    FOR raffle_record IN 
        SELECT DISTINCT raffle_id FROM tickets ORDER BY raffle_id
    LOOP
        new_number := 0;
        
        -- Loop through tickets for this raffle, ordered by current number
        FOR ticket_record IN 
            SELECT id FROM tickets 
            WHERE raffle_id = raffle_record.raffle_id 
            ORDER BY number ASC
        LOOP
            -- Update ticket number to sequential starting from 0
            UPDATE tickets 
            SET number = new_number 
            WHERE id = ticket_record.id;
            
            new_number := new_number + 1;
        END LOOP;
        
        RAISE NOTICE 'Renumbered tickets for raffle % starting from 0000', raffle_record.raffle_id;
    END LOOP;
END $$;

-- Verify the changes
SELECT 
    raffle_id,
    MIN(number) as min_number,
    MAX(number) as max_number,
    COUNT(*) as total_tickets
FROM tickets 
GROUP BY raffle_id 
ORDER BY raffle_id;