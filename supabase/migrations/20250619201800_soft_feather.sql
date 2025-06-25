/*
  # Add Video Support to Raffles

  1. New Fields
    - video_url: Main video URL for the raffle
    - video_urls: Array of additional video URLs

  2. Changes
    - Update public_raffles view to include video fields
    - Maintain all existing functionality
*/

-- Agregar columnas de video a la tabla raffles
ALTER TABLE raffles 
ADD COLUMN IF NOT EXISTS video_url TEXT,
ADD COLUMN IF NOT EXISTS video_urls TEXT[] DEFAULT '{}';

-- Actualizar la vista pública para incluir videos
DROP VIEW IF EXISTS public_raffles;

CREATE VIEW public_raffles AS
SELECT 
  r.id,
  r.name,
  r.description,
  r.image_url,
  r.images,
  r.video_url,
  r.video_urls,
  r.draw_date,
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
  r.images,
  r.video_url,
  r.video_urls,
  r.draw_date,
  r.slug,
  r.drawn_at,
  r.status,
  r.winner_id,
  r.price,
  r.total_tickets,
  u.first_name,
  u.last_name;