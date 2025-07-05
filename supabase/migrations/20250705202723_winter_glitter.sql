-- Eliminar funciones existentes para evitar conflictos de tipo de retorno
DROP FUNCTION IF EXISTS release_expired_tickets();
DROP FUNCTION IF EXISTS auto_cleanup_tickets();
DROP FUNCTION IF EXISTS get_tickets_with_cleanup(INTEGER);
DROP FUNCTION IF EXISTS check_and_release_ticket(INTEGER);
DROP FUNCTION IF EXISTS admin_cleanup_expired_tickets();

-- Mejorar la función de liberación de boletos expirados
CREATE OR REPLACE FUNCTION release_expired_tickets()
RETURNS INTEGER AS $$
DECLARE
  released_count INTEGER;
BEGIN
  -- Liberar boletos reservados por más de 3 horas
  UPDATE tickets
  SET 
    status = 'available',
    user_id = NULL,
    reserved_at = NULL,
    promoter_code = NULL
  WHERE 
    status = 'reserved' 
    AND reserved_at < NOW() - INTERVAL '3 hours'
    AND purchased_at IS NULL;
    
  GET DIAGNOSTICS released_count = ROW_COUNT;
  
  -- Log para debugging
  IF released_count > 0 THEN
    RAISE NOTICE 'Released % expired ticket reservations at %', released_count, NOW();
  END IF;
  
  RETURN released_count;
END;
$$ LANGUAGE plpgsql;

-- Función mejorada que se ejecuta automáticamente
CREATE OR REPLACE FUNCTION auto_cleanup_tickets()
RETURNS INTEGER AS $$
DECLARE
  released_count INTEGER;
BEGIN
  -- Ejecutar limpieza de boletos expirados
  SELECT release_expired_tickets() INTO released_count;
  
  RETURN released_count;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener boletos con limpieza automática
CREATE OR REPLACE FUNCTION get_tickets_with_cleanup(p_raffle_id INTEGER)
RETURNS TABLE(
  id INTEGER,
  number INTEGER,
  status TEXT,
  user_id UUID,
  raffle_id INTEGER,
  reserved_at TIMESTAMPTZ,
  purchased_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  promoter_code TEXT
) AS $$
DECLARE
  cleanup_count INTEGER;
BEGIN
  -- Primero ejecutar limpieza automática
  SELECT auto_cleanup_tickets() INTO cleanup_count;
  
  -- Luego retornar los boletos
  RETURN QUERY
  SELECT 
    t.id,
    t.number,
    t.status,
    t.user_id,
    t.raffle_id,
    t.reserved_at,
    t.purchased_at,
    t.created_at,
    t.promoter_code
  FROM tickets t
  WHERE t.raffle_id = p_raffle_id
  ORDER BY t.number;
END;
$$ LANGUAGE plpgsql;

-- Función para verificar y liberar boletos específicos
CREATE OR REPLACE FUNCTION check_and_release_ticket(p_ticket_id INTEGER)
RETURNS JSON AS $$
DECLARE
  ticket_record RECORD;
  was_released BOOLEAN := false;
BEGIN
  -- Obtener información del boleto
  SELECT * INTO ticket_record FROM tickets WHERE id = p_ticket_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Ticket not found',
      'ticket_id', p_ticket_id
    );
  END IF;
  
  -- Verificar si debe ser liberado
  IF ticket_record.status = 'reserved' 
     AND ticket_record.reserved_at < NOW() - INTERVAL '3 hours'
     AND ticket_record.purchased_at IS NULL THEN
    
    -- Liberar el boleto
    UPDATE tickets
    SET 
      status = 'available',
      user_id = NULL,
      reserved_at = NULL,
      promoter_code = NULL
    WHERE id = p_ticket_id;
    
    was_released := true;
  END IF;
  
  RETURN json_build_object(
    'success', true,
    'ticket_id', p_ticket_id,
    'was_released', was_released,
    'current_status', CASE WHEN was_released THEN 'available' ELSE ticket_record.status END,
    'reserved_at', ticket_record.reserved_at,
    'hours_since_reservation', 
      CASE 
        WHEN ticket_record.reserved_at IS NOT NULL THEN
          EXTRACT(EPOCH FROM (NOW() - ticket_record.reserved_at)) / 3600
        ELSE NULL
      END
  );
END;
$$ LANGUAGE plpgsql;

-- Función para limpieza manual desde el admin
CREATE OR REPLACE FUNCTION admin_cleanup_expired_tickets()
RETURNS JSON AS $$
DECLARE
  released_count INTEGER;
  total_reserved INTEGER;
  expired_tickets RECORD;
BEGIN
  -- Contar boletos reservados antes de la limpieza
  SELECT COUNT(*) INTO total_reserved FROM tickets WHERE status = 'reserved';
  
  -- Ejecutar limpieza
  SELECT release_expired_tickets() INTO released_count;
  
  -- Obtener información detallada de boletos que siguen reservados
  SELECT 
    COUNT(*) as still_reserved,
    MIN(reserved_at) as oldest_reservation,
    MAX(reserved_at) as newest_reservation
  INTO expired_tickets
  FROM tickets 
  WHERE status = 'reserved';
  
  RETURN json_build_object(
    'success', true,
    'released_count', released_count,
    'total_reserved_before', total_reserved,
    'still_reserved', expired_tickets.still_reserved,
    'oldest_reservation', expired_tickets.oldest_reservation,
    'newest_reservation', expired_tickets.newest_reservation,
    'cleanup_time', NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ejecutar limpieza inicial
SELECT release_expired_tickets();