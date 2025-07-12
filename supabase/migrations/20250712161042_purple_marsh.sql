/*
  # Change ticket number format to text with leading zeros

  1. Changes
    - Change `number` column from integer to text
    - Update all existing ticket numbers to 4-digit format with leading zeros
    - Update constraints to work with text format
    - Add validation for 4-digit format

  2. Security
    - Maintains all existing RLS policies
    - Preserves all data relationships
*/

-- First, let's see what we're working with
DO $$
BEGIN
  RAISE NOTICE 'Current ticket number range before conversion:';
END $$;

-- Show current range
SELECT 
  raffle_id,
  MIN(number) as min_number,
  MAX(number) as max_number,
  COUNT(*) as total_tickets
FROM tickets 
GROUP BY raffle_id;

-- Step 1: Add a temporary column for the new format
ALTER TABLE tickets ADD COLUMN number_text TEXT;

-- Step 2: Convert existing numbers to 4-digit text format
UPDATE tickets 
SET number_text = LPAD(CAST(number AS TEXT), 4, '0');

-- Step 3: Verify the conversion
DO $$
DECLARE
  conversion_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO conversion_count 
  FROM tickets 
  WHERE number_text IS NOT NULL;
  
  RAISE NOTICE 'Converted % tickets to text format', conversion_count;
END $$;

-- Step 4: Drop the old constraints that reference the number column
ALTER TABLE tickets DROP CONSTRAINT IF EXISTS tickets_number_check;
ALTER TABLE tickets DROP CONSTRAINT IF EXISTS tickets_number_non_negative;
ALTER TABLE tickets DROP CONSTRAINT IF EXISTS tickets_number_raffle_id_key;

-- Step 5: Drop the old indexes
DROP INDEX IF EXISTS tickets_number_idx;
DROP INDEX IF EXISTS tickets_number_raffle_id_key;

-- Step 6: Drop the old column and rename the new one
ALTER TABLE tickets DROP COLUMN number;
ALTER TABLE tickets RENAME COLUMN number_text TO number;

-- Step 7: Add constraints for the new text format
ALTER TABLE tickets ADD CONSTRAINT tickets_number_format_check 
  CHECK (number ~ '^[0-9]{4}$');

-- Step 8: Add unique constraint for number + raffle_id
ALTER TABLE tickets ADD CONSTRAINT tickets_number_raffle_id_key 
  UNIQUE (number, raffle_id);

-- Step 9: Add index for performance
CREATE INDEX tickets_number_idx ON tickets (number);

-- Step 10: Update the validation trigger function to work with text
CREATE OR REPLACE FUNCTION validate_ticket_number_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate format (4 digits)
  IF NEW.number !~ '^[0-9]{4}$' THEN
    RAISE EXCEPTION 'Ticket number must be exactly 4 digits: %', NEW.number;
  END IF;
  
  -- Check for duplicates within the same raffle (excluding current record)
  IF EXISTS (
    SELECT 1 FROM tickets 
    WHERE raffle_id = NEW.raffle_id 
    AND number = NEW.number 
    AND id != COALESCE(NEW.id, -1)
  ) THEN
    RAISE EXCEPTION 'Ticket number % already exists for raffle %', NEW.number, NEW.raffle_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 11: Create function to safely update ticket numbers with text format
CREATE OR REPLACE FUNCTION safe_update_ticket_number(
  ticket_id INTEGER,
  new_number_int INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  new_number_text TEXT;
  raffle_id_val INTEGER;
BEGIN
  -- Format the number as 4-digit text
  new_number_text := LPAD(CAST(new_number_int AS TEXT), 4, '0');
  
  -- Validate the number
  IF new_number_int < 0 OR new_number_int > 9999 THEN
    RAISE EXCEPTION 'Ticket number must be between 0 and 9999, got: %', new_number_int;
  END IF;
  
  -- Get the raffle_id for this ticket
  SELECT t.raffle_id INTO raffle_id_val FROM tickets t WHERE t.id = ticket_id;
  
  IF raffle_id_val IS NULL THEN
    RAISE EXCEPTION 'Ticket with id % not found', ticket_id;
  END IF;
  
  -- Check for duplicates
  IF EXISTS (
    SELECT 1 FROM tickets 
    WHERE raffle_id = raffle_id_val 
    AND number = new_number_text 
    AND id != ticket_id
  ) THEN
    RAISE EXCEPTION 'Ticket number % already exists for raffle %', new_number_text, raffle_id_val;
  END IF;
  
  -- Update the ticket
  UPDATE tickets 
  SET number = new_number_text
  WHERE id = ticket_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Step 12: Create function to safely renumber all tickets in a raffle
CREATE OR REPLACE FUNCTION safe_renumber_tickets(raffle_id_param INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
  ticket_record RECORD;
  new_number_int INTEGER := 0;
  new_number_text TEXT;
BEGIN
  -- Renumber all tickets in order of their current ID
  FOR ticket_record IN 
    SELECT id FROM tickets 
    WHERE raffle_id = raffle_id_param 
    ORDER BY id
  LOOP
    new_number_text := LPAD(CAST(new_number_int AS TEXT), 4, '0');
    
    UPDATE tickets 
    SET number = new_number_text
    WHERE id = ticket_record.id;
    
    new_number_int := new_number_int + 1;
  END LOOP;
  
  RAISE NOTICE 'Renumbered % tickets for raffle %', new_number_int, raffle_id_param;
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Step 13: Show the final result
DO $$
BEGIN
  RAISE NOTICE 'Ticket number conversion completed. New format:';
END $$;

SELECT 
  raffle_id,
  MIN(number) as min_number,
  MAX(number) as max_number,
  COUNT(*) as total_tickets
FROM tickets 
GROUP BY raffle_id;

-- Step 14: Show some sample tickets to verify format
SELECT 
  id,
  number,
  status,
  raffle_id
FROM tickets 
ORDER BY raffle_id, number
LIMIT 10;