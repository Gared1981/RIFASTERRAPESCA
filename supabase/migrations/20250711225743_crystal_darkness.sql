/*
  # Delete Tris Clásico Raffle

  1. Remove all tickets associated with the Tris Clásico raffle
  2. Delete the Tris Clásico raffle itself
  
  This migration safely removes the raffle and all its associated data.
*/

-- First, delete all tickets for the Tris Clásico raffle
DELETE FROM tickets 
WHERE raffle_id IN (
  SELECT id FROM raffles 
  WHERE name = 'Sorteo Tris Clásico'
);

-- Then delete the raffle itself
DELETE FROM raffles 
WHERE name = 'Sorteo Tris Clásico';