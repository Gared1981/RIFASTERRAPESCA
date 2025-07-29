/*
  # Fix promoter links and add foreign key constraint

  1. Changes
    - Add foreign key constraint between tickets.promoter_code and promoters.code
    - Create view for promoter statistics
    - Fix any existing invalid promoter codes
*/

-- First, clean up any invalid promoter codes in tickets
UPDATE tickets
SET promoter_code = NULL
WHERE promoter_code IS NOT NULL AND NOT EXISTS (
  SELECT 1 FROM promoters WHERE code = tickets.promoter_code
);

-- Add foreign key constraint
ALTER TABLE tickets
ADD CONSTRAINT tickets_promoter_code_fkey
FOREIGN KEY (promoter_code) REFERENCES promoters(code);

-- Create or replace view for promoter statistics
CREATE OR REPLACE VIEW promoter_stats AS
SELECT 
  p.id,
  p.name,
  p.code,
  p.total_sales,
  p.accumulated_bonus,
  p.extra_prize,
  p.active,
  COUNT(t.id) as tickets_sold,
  COUNT(CASE WHEN t.status = 'purchased' THEN 1 END) as confirmed_sales,
  p.created_at,
  p.updated_at
FROM promoters p
LEFT JOIN tickets t ON t.promoter_code = p.code
GROUP BY p.id, p.name, p.code, p.total_sales, p.accumulated_bonus, p.extra_prize, p.active, p.created_at, p.updated_at;

-- Grant access to the view
GRANT SELECT ON promoter_stats TO public;

-- Create function to assign winner bonus
CREATE OR REPLACE FUNCTION assign_winner_bonus(
  p_raffle_id INTEGER,
  p_winning_ticket_number INTEGER
)
RETURNS JSON AS $$
DECLARE
  winning_promoter_code TEXT;
  result JSON;
BEGIN
  -- Obtener el código del promotor del boleto ganador
  SELECT promoter_code INTO winning_promoter_code
  FROM tickets 
  WHERE raffle_id = p_raffle_id 
    AND number = p_winning_ticket_number 
    AND status = 'purchased';
  
  -- Si no hay promotor asociado, no hay bono extra
  IF winning_promoter_code IS NULL THEN
    RETURN json_build_object(
      'success', true, 
      'message', 'Winner assigned but no promoter bonus (ticket sold without promoter code)'
    );
  END IF;
  
  -- Asignar bono extra al promotor
  UPDATE promoters 
  SET 
    accumulated_bonus = accumulated_bonus + 1000,
    extra_prize = true,
    updated_at = now()
  WHERE code = winning_promoter_code;
  
  RETURN json_build_object(
    'success', true, 
    'message', 'Winner bonus assigned successfully',
    'promoter_code', winning_promoter_code
  );
END;
$$ LANGUAGE plpgsql;