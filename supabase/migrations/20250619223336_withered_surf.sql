/*
  # Agregar columna de artículos del premio

  1. Cambios
    - Agregar columna prize_items como array de texto
    - Actualizar vista public_raffles para incluir prize_items
    - Mantener compatibilidad con datos existentes

  2. Funcionalidad
    - Permite almacenar lista de artículos que componen el premio
    - Se puede gestionar desde el panel de administración
    - Se muestra en la página de detalles del sorteo
*/

-- Agregar columna de artículos del premio
ALTER TABLE raffles 
ADD COLUMN IF NOT EXISTS prize_items TEXT[] DEFAULT '{}';

-- Actualizar la vista pública para incluir prize_items
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
  r.prize_items,
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
  r.prize_items,
  r.draw_date,
  r.slug,
  r.drawn_at,
  r.status,
  r.winner_id,
  r.price,
  r.total_tickets,
  u.first_name,
  u.last_name;