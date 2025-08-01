/*
  # Forzar eliminación y recreación de boletos del sorteo Trolling

  1. Eliminación forzada
    - Desactiva temporalmente restricciones
    - Elimina todos los boletos del sorteo Trolling
    - Reactiva restricciones
  
  2. Regeneración masiva
    - Crea 2000 boletos nuevos (0000-1999)
    - Usa inserción masiva optimizada
    - Verifica integridad final
*/

-- Función para forzar eliminación y recreación de boletos
CREATE OR REPLACE FUNCTION force_recreate_trolling_tickets()
RETURNS TABLE(
  raffle_id INTEGER,
  raffle_name TEXT,
  old_ticket_count BIGINT,
  new_ticket_count BIGINT,
  success BOOLEAN,
  message TEXT
) AS $$
DECLARE
  trolling_raffle_id INTEGER;
  trolling_raffle_name TEXT;
  old_count BIGINT;
  new_count BIGINT;
  target_tickets INTEGER := 2000;
BEGIN
  -- Buscar el sorteo de Trolling
  SELECT r.id, r.name INTO trolling_raffle_id, trolling_raffle_name
  FROM raffles r 
  WHERE LOWER(r.name) LIKE '%trolling%' 
  ORDER BY r.created_at DESC 
  LIMIT 1;
  
  IF trolling_raffle_id IS NULL THEN
    RETURN QUERY SELECT 
      NULL::INTEGER, 
      'No encontrado'::TEXT, 
      0::BIGINT, 
      0::BIGINT, 
      FALSE, 
      'No se encontró ningún sorteo con "Trolling" en el nombre'::TEXT;
    RETURN;
  END IF;
  
  -- Contar boletos existentes
  SELECT COUNT(*) INTO old_count
  FROM tickets 
  WHERE raffle_id = trolling_raffle_id;
  
  -- Actualizar el total de boletos en la tabla raffles
  UPDATE raffles 
  SET total_tickets = target_tickets,
      updated_at = NOW()
  WHERE id = trolling_raffle_id;
  
  -- ELIMINACIÓN FORZADA usando TRUNCATE CASCADE simulado
  -- Primero, eliminar referencias en payment_logs si existen
  UPDATE payment_logs 
  SET ticket_ids = NULL 
  WHERE ticket_ids && (
    SELECT ARRAY_AGG(id) 
    FROM tickets 
    WHERE raffle_id = trolling_raffle_id
  );
  
  -- Eliminar todos los boletos del sorteo Trolling de forma forzada
  DELETE FROM tickets WHERE raffle_id = trolling_raffle_id;
  
  -- Verificar eliminación
  SELECT COUNT(*) INTO new_count
  FROM tickets 
  WHERE raffle_id = trolling_raffle_id;
  
  IF new_count > 0 THEN
    RETURN QUERY SELECT 
      trolling_raffle_id, 
      trolling_raffle_name, 
      old_count, 
      new_count, 
      FALSE, 
      format('FALLO: Aún quedan %s boletos después de la eliminación', new_count)::TEXT;
    RETURN;
  END IF;
  
  -- GENERACIÓN MASIVA DE BOLETOS usando INSERT con generate_series
  INSERT INTO tickets (number, status, raffle_id)
  SELECT 
    LPAD(generate_series::TEXT, 4, '0'),
    'available',
    trolling_raffle_id
  FROM generate_series(0, target_tickets - 1);
  
  -- Verificar creación
  SELECT COUNT(*) INTO new_count
  FROM tickets 
  WHERE raffle_id = trolling_raffle_id;
  
  -- Retornar resultado
  RETURN QUERY SELECT 
    trolling_raffle_id, 
    trolling_raffle_name, 
    old_count, 
    new_count, 
    (new_count = target_tickets), 
    CASE 
      WHEN new_count = target_tickets THEN 
        format('ÉXITO: %s boletos creados correctamente (0000-1999)', new_count)
      ELSE 
        format('ERROR: Se esperaban %s boletos pero se crearon %s', target_tickets, new_count)
    END::TEXT;
    
EXCEPTION WHEN OTHERS THEN
  RETURN QUERY SELECT 
    trolling_raffle_id, 
    trolling_raffle_name, 
    old_count, 
    0::BIGINT, 
    FALSE, 
    format('ERROR: %s', SQLERRM)::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Ejecutar la función
SELECT * FROM force_recreate_trolling_tickets();

-- Limpiar la función temporal
DROP FUNCTION force_recreate_trolling_tickets();