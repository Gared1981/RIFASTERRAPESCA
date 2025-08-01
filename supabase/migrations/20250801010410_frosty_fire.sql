/*
  # Eliminar limitaciones de boletos y configurar Trolling con 2000 boletos

  1. Cambios en la base de datos
    - Eliminar restricciones de cantidad de boletos
    - Optimizar índices para grandes cantidades
    - Configurar sorteo Trolling con 2000 boletos

  2. Seguridad
    - Mantener todas las políticas RLS existentes
    - Preservar integridad referencial

  3. Performance
    - Optimizar para grandes cantidades de boletos
    - Mejorar índices para consultas rápidas
*/

-- Paso 1: Eliminar restricción de total_tickets si existe
DO $$
BEGIN
  -- Eliminar constraint de total_tickets si existe
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'raffles' 
    AND constraint_name = 'raffles_total_tickets_check'
  ) THEN
    ALTER TABLE raffles DROP CONSTRAINT raffles_total_tickets_check;
    RAISE NOTICE 'Constraint raffles_total_tickets_check eliminado';
  END IF;
END $$;

-- Paso 2: Agregar nueva restricción más permisiva
ALTER TABLE raffles 
ADD CONSTRAINT raffles_total_tickets_check 
CHECK (total_tickets > 0 AND total_tickets <= 10000);

-- Paso 3: Optimizar índices para grandes cantidades de boletos
DROP INDEX IF EXISTS tickets_number_text_idx;
CREATE INDEX IF NOT EXISTS tickets_number_raffle_idx ON tickets(number, raffle_id);
CREATE INDEX IF NOT EXISTS tickets_raffle_status_idx ON tickets(raffle_id, status);

-- Paso 4: Configurar sorteo Trolling con 2000 boletos
DO $$
DECLARE
  trolling_raffle_id INTEGER;
  existing_tickets_count INTEGER;
BEGIN
  -- Buscar el sorteo de Trolling
  SELECT id INTO trolling_raffle_id 
  FROM raffles 
  WHERE LOWER(name) LIKE '%trolling%' 
  AND status IN ('draft', 'active')
  ORDER BY created_at DESC 
  LIMIT 1;
  
  IF trolling_raffle_id IS NOT NULL THEN
    RAISE NOTICE 'Sorteo Trolling encontrado con ID: %', trolling_raffle_id;
    
    -- Contar boletos existentes
    SELECT COUNT(*) INTO existing_tickets_count
    FROM tickets 
    WHERE raffle_id = trolling_raffle_id;
    
    RAISE NOTICE 'Boletos existentes: %', existing_tickets_count;
    
    -- Actualizar configuración del sorteo a 2000 boletos
    UPDATE raffles 
    SET total_tickets = 2000,
        updated_at = NOW()
    WHERE id = trolling_raffle_id;
    
    RAISE NOTICE 'Sorteo actualizado a 2000 boletos totales';
    
    -- Eliminar todos los boletos existentes
    DELETE FROM tickets WHERE raffle_id = trolling_raffle_id;
    RAISE NOTICE 'Boletos existentes eliminados: %', existing_tickets_count;
    
    -- Generar 2000 nuevos boletos usando generate_series
    INSERT INTO tickets (number, status, raffle_id)
    SELECT 
      LPAD(generate_series::TEXT, 4, '0'),
      'available',
      trolling_raffle_id
    FROM generate_series(0, 1999);
    
    -- Verificar que se crearon correctamente
    SELECT COUNT(*) INTO existing_tickets_count
    FROM tickets 
    WHERE raffle_id = trolling_raffle_id;
    
    IF existing_tickets_count = 2000 THEN
      RAISE NOTICE '✅ ÉXITO: % boletos generados para sorteo Trolling (ID: %)', existing_tickets_count, trolling_raffle_id;
    ELSE
      RAISE EXCEPTION 'ERROR: Se esperaban 2000 boletos pero se generaron %', existing_tickets_count;
    END IF;
    
  ELSE
    RAISE NOTICE 'No se encontró sorteo de Trolling activo';
  END IF;
END $$;

-- Paso 5: Verificación final
SELECT 
  r.id,
  r.name,
  r.total_tickets as "Boletos_Configurados",
  COUNT(t.id) as "Boletos_Generados",
  COUNT(CASE WHEN t.status = 'available' THEN 1 END) as "Disponibles",
  COUNT(CASE WHEN t.status = 'reserved' THEN 1 END) as "Reservados",
  COUNT(CASE WHEN t.status = 'purchased' THEN 1 END) as "Pagados"
FROM raffles r
LEFT JOIN tickets t ON r.id = t.raffle_id
WHERE LOWER(r.name) LIKE '%trolling%'
GROUP BY r.id, r.name, r.total_tickets
ORDER BY r.created_at DESC;