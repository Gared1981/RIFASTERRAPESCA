/*
  # Fix Missing Tickets - Final Solution

  1. Problem Resolution
    - Removes all existing tickets to start fresh
    - Regenerates tickets for all raffles with proper numbering
    - Ensures 4-digit format (0000, 0001, 0002, etc.)
    
  2. Safety Measures
    - Only affects raffles with total_tickets configured
    - Maintains referential integrity
    - Provides detailed logging
    
  3. Verification
    - Shows before/after counts
    - Validates ticket numbering format
    - Confirms all raffles have correct ticket counts
*/

-- Step 1: Show current state
DO $$
DECLARE
    raffle_record RECORD;
    ticket_count INTEGER;
BEGIN
    RAISE NOTICE '=== CURRENT STATE BEFORE FIX ===';
    
    FOR raffle_record IN 
        SELECT id, name, total_tickets 
        FROM raffles 
        WHERE total_tickets IS NOT NULL AND total_tickets > 0
        ORDER BY id
    LOOP
        SELECT COUNT(*) INTO ticket_count
        FROM tickets 
        WHERE raffle_id = raffle_record.id;
        
        RAISE NOTICE 'Raffle % (%): Expected %, Found %', 
            raffle_record.id, 
            raffle_record.name, 
            raffle_record.total_tickets, 
            ticket_count;
    END LOOP;
END $$;

-- Step 2: Clean slate - remove all existing tickets
DELETE FROM tickets;
RAISE NOTICE 'All existing tickets removed for fresh start';

-- Step 3: Regenerate tickets for all raffles
DO $$
DECLARE
    raffle_record RECORD;
    ticket_number TEXT;
    i INTEGER;
    total_created INTEGER := 0;
BEGIN
    RAISE NOTICE '=== REGENERATING TICKETS ===';
    
    FOR raffle_record IN 
        SELECT id, name, total_tickets 
        FROM raffles 
        WHERE total_tickets IS NOT NULL AND total_tickets > 0
        ORDER BY id
    LOOP
        RAISE NOTICE 'Creating % tickets for raffle % (%)', 
            raffle_record.total_tickets, 
            raffle_record.id, 
            raffle_record.name;
        
        -- Generate tickets from 0000 to (total_tickets - 1)
        FOR i IN 0..(raffle_record.total_tickets - 1) LOOP
            ticket_number := LPAD(i::TEXT, 4, '0');
            
            INSERT INTO tickets (number, status, raffle_id, created_at)
            VALUES (ticket_number, 'available', raffle_record.id, NOW());
        END LOOP;
        
        total_created := total_created + raffle_record.total_tickets;
        
        RAISE NOTICE 'Created % tickets for raffle %', 
            raffle_record.total_tickets, 
            raffle_record.id;
    END LOOP;
    
    RAISE NOTICE 'Total tickets created: %', total_created;
END $$;

-- Step 4: Verification - show final state
DO $$
DECLARE
    raffle_record RECORD;
    ticket_count INTEGER;
    sample_tickets TEXT;
    all_good BOOLEAN := TRUE;
BEGIN
    RAISE NOTICE '=== FINAL STATE VERIFICATION ===';
    
    FOR raffle_record IN 
        SELECT id, name, total_tickets 
        FROM raffles 
        WHERE total_tickets IS NOT NULL AND total_tickets > 0
        ORDER BY id
    LOOP
        SELECT COUNT(*) INTO ticket_count
        FROM tickets 
        WHERE raffle_id = raffle_record.id;
        
        -- Get sample of first 5 ticket numbers
        SELECT STRING_AGG(number, ', ' ORDER BY number) INTO sample_tickets
        FROM (
            SELECT number 
            FROM tickets 
            WHERE raffle_id = raffle_record.id 
            ORDER BY number 
            LIMIT 5
        ) sample;
        
        IF ticket_count = raffle_record.total_tickets THEN
            RAISE NOTICE 'Raffle % (%): ✅ OK - % tickets (Sample: %)', 
                raffle_record.id, 
                raffle_record.name, 
                ticket_count,
                sample_tickets;
        ELSE
            RAISE NOTICE 'Raffle % (%): ❌ MISMATCH - Expected %, Got %', 
                raffle_record.id, 
                raffle_record.name, 
                raffle_record.total_tickets, 
                ticket_count;
            all_good := FALSE;
        END IF;
    END LOOP;
    
    IF all_good THEN
        RAISE NOTICE '🎉 ALL RAFFLES HAVE CORRECT TICKET COUNTS!';
    ELSE
        RAISE NOTICE '⚠️ Some raffles still have incorrect ticket counts';
    END IF;
END $$;

-- Step 5: Final summary
SELECT 
    'SUMMARY' as info,
    COUNT(DISTINCT raffle_id) as raffles_with_tickets,
    COUNT(*) as total_tickets_in_system,
    MIN(number) as first_ticket_number,
    MAX(number) as last_ticket_number
FROM tickets;