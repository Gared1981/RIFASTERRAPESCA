/*
  # Add Raffle Management Features

  1. New Fields
    - status: Track raffle state (draft, active, completed)
    - images: Array of additional image URLs
    - updated_at: Last modification timestamp

  2. Changes
    - Add trigger to prevent editing completed raffles
    - Create public view for raffle information
    - Add validation for raffle status
*/

-- First drop the existing view if it exists
DROP VIEW IF EXISTS public_raffles;

-- Add new columns to raffles table
ALTER TABLE raffles 
ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('draft', 'active', 'completed')) DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Create function to prevent editing completed raffles
CREATE OR REPLACE FUNCTION prevent_completed_raffle_edits()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status = 'completed' AND NEW.status = 'completed' THEN
    IF OLD.winner_id IS NOT NULL AND (
      OLD.name != NEW.name OR
      OLD.description != NEW.description OR
      OLD.draw_date != NEW.draw_date OR
      OLD.price != NEW.price OR
      OLD.total_tickets != NEW.total_tickets
    ) THEN
      RAISE EXCEPTION 'Cannot modify completed raffles';
    END IF;
  END IF;
  
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for preventing edits
DROP TRIGGER IF EXISTS prevent_completed_raffle_edits ON raffles;
CREATE TRIGGER prevent_completed_raffle_edits
  BEFORE UPDATE ON raffles
  FOR EACH ROW
  EXECUTE FUNCTION prevent_completed_raffle_edits();

-- Create new public raffles view
CREATE VIEW public_raffles AS
SELECT 
  r.id,
  r.name,
  r.description,
  r.image_url,
  r.draw_date,
  r.images,
  r.slug,
  r.drawn_at,
  r.status,
  r.winner_id,
  r.price,
  r.total_tickets as max_tickets,
  u.first_name as winner_first_name,
  u.last_name as winner_last_name,
  COUNT(DISTINCT t.user_id) as participant_count,
  COUNT(t.id) as tickets_sold
FROM raffles r
LEFT JOIN tickets t ON t.raffle_id = r.id
LEFT JOIN users u ON u.id = r.winner_id
GROUP BY 
  r.id,
  r.name,
  r.description,
  r.image_url,
  r.draw_date,
  r.images,
  r.slug,
  r.drawn_at,
  r.status,
  r.winner_id,
  r.price,
  r.total_tickets,
  u.first_name,
  u.last_name;