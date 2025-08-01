/*
  # Forzar actualización del sorteo Trolling a 2000 boletos

  1. Actualización forzada
    - Busca el sorteo de Trolling por nombre
    - Actualiza total_tickets a 2000
    - Elimina TODOS los boletos existentes
    - Genera exactamente 2000 boletos nuevos (0000-1999)
  
  2. Verificación completa
    - Confirma que se crearon exactamente 2000 boletos
    - Muestra estadísticas finales
    - Rollback automático si hay errores
*/

-- Paso 1: Identificar y actualizar el sorteo de Trolling
DO $$
DECLARE
    trolling_raffle_id INTEGER;
    existing_tickets_count INTEGER;
    new_tickets_count INTEGER;
    batch_size INTEGER := 100;
    current_batch INTEGER;
    total_batches INTEGER;
BEGIN
    -- Buscar el sorteo de Trolling
    SELECT id INTO trolling_raffle_id 
    FROM raffles 
    WHERE LOWER(name) LIKE '%trolling%' 
    ORDER BY created_at DESC 
    LIMIT 1;
    
    IF trolling_raffle_id IS NULL THEN
        RAISE EXCEPTION 'No se encontró el sorteo de Trolling';
    END IF;
    
    RAISE NOTICE 'Sorteo de Trolling encontrado con ID: %', trolling_raffle_id;
    
    -- Contar boletos existentes
    SELECT COUNT(*) INTO existing_tickets_count 
    FROM tickets 
    WHERE raffle_id = trolling_raffle_id;
    
    RAISE NOTICE 'Boletos existentes: %', existing_tickets_count;
    
    -- Paso 2: Actualizar configuración del sorteo
    UPDATE raffles 
    SET 
        total_tickets = 2000,
        updated_at = NOW()
    WHERE id = trolling_raffle_id;
    
    RAISE NOTICE 'Configuración del sorteo actualizada a 2000 boletos';
    
    -- Paso 3: Eliminar TODOS los boletos existentes
    DELETE FROM tickets WHERE raffle_id = trolling_raffle_id;
    
    -- Verificar que se eliminaron todos
    SELECT COUNT(*) INTO existing_tickets_count 
    FROM tickets 
    WHERE raffle_id = trolling_raffle_id;
    
    IF existing_tickets_count > 0 THEN
        RAISE EXCEPTION 'Error: Aún quedan % boletos sin eliminar', existing_tickets_count;
    END IF;
    
    RAISE NOTICE 'Todos los boletos existentes eliminados correctamente';
    
    -- Paso 4: Generar 2000 boletos nuevos en lotes
    total_batches := CEIL(2000.0 / batch_size);
    
    FOR current_batch IN 0..(total_batches - 1) LOOP
        DECLARE
            start_num INTEGER := current_batch * batch_size;
            end_num INTEGER := LEAST((current_batch + 1) * batch_size - 1, 1999);
            batch_count INTEGER := end_num - start_num + 1;
        BEGIN
            -- Insertar lote de boletos
            INSERT INTO tickets (number, status, raffle_id)
            SELECT 
                LPAD(generate_series::TEXT, 4, '0'),
                'available',
                trolling_raffle_id
            FROM generate_series(start_num, end_num);
            
            RAISE NOTICE 'Lote % de %: Creados boletos % a % (% boletos)', 
                current_batch + 1, total_batches, 
                LPAD(start_num::TEXT, 4, '0'), 
                LPAD(end_num::TEXT, 4, '0'), 
                batch_count;
        END;
    END LOOP;
    
    -- Paso 5: Verificación final
    SELECT COUNT(*) INTO new_tickets_count 
    FROM tickets 
    WHERE raffle_id = trolling_raffle_id;
    
    IF new_tickets_count != 2000 THEN
        RAISE EXCEPTION 'Error: Se esperaban 2000 boletos pero se crearon %', new_tickets_count;
    END IF;
    
    RAISE NOTICE '✅ ÉXITO: Se crearon exactamente % boletos para el sorteo de Trolling', new_tickets_count;
    
    -- Mostrar estadísticas finales
    RAISE NOTICE '📊 ESTADÍSTICAS FINALES:';
    RAISE NOTICE '- Sorteo ID: %', trolling_raffle_id;
    RAISE NOTICE '- Total boletos: %', new_tickets_count;
    RAISE NOTICE '- Rango: 0000 a 1999';
    RAISE NOTICE '- Estado: Todos disponibles';
    
END $$;

-- Verificación adicional y reporte final
SELECT 
    r.id as sorteo_id,
    r.name as nombre_sorteo,
    r.total_tickets as boletos_configurados,
    COUNT(t.id) as boletos_generados,
    COUNT(CASE WHEN t.status = 'available' THEN 1 END) as disponibles,
    COUNT(CASE WHEN t.status = 'reserved' THEN 1 END) as reservados,
    COUNT(CASE WHEN t.status = 'purchased' THEN 1 END) as pagados,
    MIN(t.number) as primer_boleto,
    MAX(t.number) as ultimo_boleto
FROM raffles r
LEFT JOIN tickets t ON r.id = t.raffle_id
WHERE LOWER(r.name) LIKE '%trolling%'
GROUP BY r.id, r.name, r.total_tickets
ORDER BY r.created_at DESC
LIMIT 1;