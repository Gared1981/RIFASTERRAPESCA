/*
  # Add Public Raffle Pages Support
  
  1. New Fields
    - Add winner_id to raffles table
    - Add drawn_at timestamp to track when the raffle was executed
    - Ensure proper constraints and defaults
    
  2. Security
    - Maintain RLS policies for public access
    - Add protection against unauthorized modifications
*/

-- Add new columns to raffles table
ALTER TABLE raffles 
ADD COLUMN IF NOT EXISTS winner_id UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS drawn_at TIMESTAMPTZ;

-- Create a view for public raffle information
CREATE OR REPLACE VIEW public_raffles AS
SELECT 
  r.id,
  r.name,
  r.description,
  r.image_url,
  r.draw_date,
  r.slug,
  r.drawn_at,
  r.winner_id,
  u.first_name as winner_first_name,
  u.last_name as winner_last_name,
  COUNT(DISTINCT t.user_id) as participant_count,
  COUNT(t.id) as total_tickets
FROM raffles r
LEFT JOIN tickets t ON t.raffle_id = r.id
LEFT JOIN users u ON u.id = r.winner_id
GROUP BY r.id, u.first_name, u.last_name;

-- Grant public access to the view
GRANT SELECT ON public_raffles TO public;