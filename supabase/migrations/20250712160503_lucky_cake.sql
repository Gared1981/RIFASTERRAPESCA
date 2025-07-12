/*
  # Add ticket number validation

  1. Constraints
    - Add check constraint to ensure ticket numbers are >= 0
    - Add function to validate ticket number ranges
  
  2. Security
    - Prevent invalid ticket numbers
    - Ensure data integrity
*/

-- Add check constraint to ensure ticket numbers are non-negative
ALTER TABLE tickets 
ADD CONSTRAINT tickets_number_non_negative 
CHECK (number >= 0);

-- Create function to validate ticket number updates
CREATE OR REPLACE FUNCTION validate_ticket_number_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Only allow updates if the new number is valid (>= 0)
  IF NEW.number < 0 THEN
    RAISE EXCEPTION 'Ticket number must be >= 0, got %', NEW.number;
  END IF;
  
  -- Check if the number already exists for this raffle (excluding current ticket)
  IF EXISTS (
    SELECT 1 FROM tickets 
    WHERE raffle_id = NEW.raffle_id 
    AND number = NEW.number 
    AND id != NEW.id
  ) THEN
    RAISE EXCEPTION 'Ticket number % already exists for raffle %', NEW.number, NEW.raffle_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for ticket number validation
DROP TRIGGER IF EXISTS validate_ticket_number_trigger ON tickets;
CREATE TRIGGER validate_ticket_number_trigger
  BEFORE INSERT OR UPDATE OF number ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION validate_ticket_number_update();

-- Create function for safe ticket number updates
CREATE OR REPLACE FUNCTION safe_update_ticket_number(
  p_ticket_id INTEGER,
  p_new_number INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  ticket_record RECORD;
  result BOOLEAN := FALSE;
BEGIN
  -- Validate input
  IF p_new_number < 0 THEN
    RAISE NOTICE 'Invalid ticket number: %. Must be >= 0', p_new_number;
    RETURN FALSE;
  END IF;
  
  -- Get ticket record
  SELECT * INTO ticket_record FROM tickets WHERE id = p_ticket_id;
  
  IF NOT FOUND THEN
    RAISE NOTICE 'Ticket with ID % not found', p_ticket_id;
    RETURN FALSE;
  END IF;
  
  -- Check if new number already exists for this raffle
  IF EXISTS (
    SELECT 1 FROM tickets 
    WHERE raffle_id = ticket_record.raffle_id 
    AND number = p_new_number 
    AND id != p_ticket_id
  ) THEN
    RAISE NOTICE 'Ticket number % already exists for raffle %', p_new_number, ticket_record.raffle_id;
    RETURN FALSE;
  END IF;
  
  -- Perform the update
  UPDATE tickets
  SET number = p_new_number,
      updated_at = NOW()
  WHERE id = p_ticket_id;
  
  IF FOUND THEN
    result := TRUE;
    RAISE NOTICE 'Successfully updated ticket % to number %', p_ticket_id, p_new_number;
  END IF;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create function for batch ticket renumbering with validation
CREATE OR REPLACE FUNCTION safe_renumber_tickets(p_raffle_id INTEGER)
RETURNS TABLE(
  ticket_id INTEGER,
  old_number INTEGER,
  new_number INTEGER,
  success BOOLEAN
) AS $$
DECLARE
  ticket_record RECORD;
  counter INTEGER := 0;
BEGIN
  -- Process tickets in order of their current number
  FOR ticket_record IN 
    SELECT id, number FROM tickets 
    WHERE raffle_id = p_raffle_id 
    ORDER BY number ASC
  LOOP
    -- Try to update the ticket number
    BEGIN
      UPDATE tickets 
      SET number = counter 
      WHERE id = ticket_record.id;
      
      -- Return success result
      ticket_id := ticket_record.id;
      old_number := ticket_record.number;
      new_number := counter;
      success := TRUE;
      
      RETURN NEXT;
      
      counter := counter + 1;
      
    EXCEPTION WHEN OTHERS THEN
      -- Return failure result
      ticket_id := ticket_record.id;
      old_number := ticket_record.number;
      new_number := counter;
      success := FALSE;
      
      RETURN NEXT;
      
      RAISE NOTICE 'Failed to update ticket %: %', ticket_record.id, SQLERRM;
    END;
  END LOOP;
END;
$$ LANGUAGE plpgsql;