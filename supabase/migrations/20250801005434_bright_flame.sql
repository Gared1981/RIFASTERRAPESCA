/*
  # Actualizar sorteo Trolling a 2000 boletos

  1. Cambios
    - Actualizar el sorteo de Trolling para tener 2000 boletos totales
    - Eliminar todos los boletos existentes del sorteo de Trolling
    - Generar 2000 nuevos boletos numerados del 0000 al 1999
  
  2. Seguridad
    - Solo afecta al sorteo de Trolling
    - Preserva otros sorteos
    - Regenera boletos de forma segura
*/

-- Primero, identificar el sorteo de Trolling
DO $$
DECLARE
    trolling_raffle_id INTEGER;
    existing_tickets_count INTEGER;
BEGIN
    -- Buscar el sorteo de Trolling (puede tener variaciones en el nombre)
    SELECT id INTO trolling_raffle_id 
    FROM raffles 
    WHERE LOWER(name) LIKE '%trolling%' 
    ORDER BY created_at DESC 
    LIMIT 1;
    
    -- Si no se encuentra, buscar por otros nombres relacionados
    IF trolling_raffle_id IS NULL THEN
        SELECT id INTO trolling_raffle_id 
        FROM raffles 
        WHERE LOWER(name) LIKE '%pesca%' OR LOWER(name) LIKE '%sorteo%'
        ORDER BY created_at DESC 
        LIMIT 1;
    END IF;
    
    -- Si se encuentra el sorteo
    IF trolling_raffle_id IS NOT NULL THEN
        RAISE NOTICE 'Actualizando sorteo ID: %', trolling_raffle_id;
        
        -- Contar boletos existentes
        SELECT COUNT(*) INTO existing_tickets_count
        FROM tickets 
        WHERE raffle_id = trolling_raffle_id;
        
        RAISE NOTICE 'Boletos existentes: %', existing_tickets_count;
        
        -- Actualizar el sorteo para tener 2000 boletos
        UPDATE raffles 
        SET 
            total_tickets = 2000,
            updated_at = NOW()
        WHERE id = trolling_raffle_id;
        
        RAISE NOTICE 'Sorteo actualizado a 2000 boletos totales';
        
        -- Eliminar todos los boletos existentes para este sorteo
        DELETE FROM tickets WHERE raffle_id = trolling_raffle_id;
        
        RAISE NOTICE 'Boletos existentes eliminados';
        
        -- Verificar que la eliminación se completó
        SELECT COUNT(*) INTO existing_tickets_count
        FROM tickets 
        WHERE raffle_id = trolling_raffle_id;
        
        IF existing_tickets_count > 0 THEN
            RAISE EXCEPTION 'Error: Aún quedan % boletos después de la eliminación', existing_tickets_count;
        END IF;
        
        RAISE NOTICE 'Eliminación verificada: 0 boletos restantes';
        
        -- Generar 2000 nuevos boletos (0000-1999)
        INSERT INTO tickets (number, status, raffle_id)
        SELECT 
            LPAD(generate_series::TEXT, 4, '0') as number,
            'available' as status,
            trolling_raffle_id as raffle_id
        FROM generate_series(0, 1999);
        
        RAISE NOTICE '2000 nuevos boletos generados (0000-1999)';
        
        -- Verificación final
        SELECT COUNT(*) INTO existing_tickets_count
        FROM tickets 
        WHERE raffle_id = trolling_raffle_id;
        
        IF existing_tickets_count != 2000 THEN
            RAISE EXCEPTION 'Error: Se esperaban 2000 boletos pero se crearon %', existing_tickets_count;
        END IF;
        
        RAISE NOTICE 'Verificación final exitosa: % boletos creados', existing_tickets_count;
        
    ELSE
        RAISE EXCEPTION 'No se encontró el sorteo de Trolling. Verifica que existe un sorteo con "trolling" en el nombre.';
    END IF;
END $$;

-- Verificar el resultado final
SELECT 
    r.id,
    r.name,
    r.total_tickets,
    COUNT(t.id) as boletos_generados,
    COUNT(CASE WHEN t.status = 'available' THEN 1 END) as disponibles,
    COUNT(CASE WHEN t.status = 'reserved' THEN 1 END) as reservados,
    COUNT(CASE WHEN t.status = 'purchased' THEN 1 END) as pagados
FROM raffles r
LEFT JOIN tickets t ON r.id = t.raffle_id
WHERE LOWER(r.name) LIKE '%trolling%'
GROUP BY r.id, r.name, r.total_tickets
ORDER BY r.created_at DESC;