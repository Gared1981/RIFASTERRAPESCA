-- Update the draw date for the active raffle
UPDATE raffles
SET draw_date = '2025-06-13 18:00:00-06'
WHERE active = true;