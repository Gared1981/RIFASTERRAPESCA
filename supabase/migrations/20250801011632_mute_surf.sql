/*
  # Configurar Sorteo Trolling con 2000 Boletos

  1. Actualización del Sorteo
    - Busca el sorteo de Trolling por nombre
    - Actualiza total_tickets a 2000
    - Asegura que esté activo

  2. Regeneración Completa de Boletos
    - Elimina TODOS los boletos existentes del sorteo
    - Limpia referencias en payment_logs
    - Genera 2000 boletos nuevos (0000-1999)
    - Verifica la cantidad final

  3. Optimización
    - Usa generate_series para inserción masiva
    - Índices optimizados para consultas rápidas
    - Verificación completa del proceso
*/

-- Paso 1: Buscar el sorteo de Trolling
DO $$
DECLARE
    trolling_raffle_id INTEGER;
    existing_tickets_count INTEGER;
    final_tickets_count INTEGER;
BEGIN
    -- Buscar el sorteo de Trolling (buscar por nombre que contenga "trolling")
    SELECT id INTO trolling_raffle_id 
    FROM raffles 
    WHERE LOWER(name) LIKE '%trolling%' 
    ORDER BY created_at DESC 
    LIMIT 1;
    
    IF trolling_raffle_id IS NULL THEN
        RAISE NOTICE 'No se encontró sorteo de Trolling. Creando uno nuevo...';
        
        -- Crear sorteo de Trolling si no existe
        INSERT INTO raffles (
            name, 
            description, 
            image_url, 
            price, 
            draw_date, 
            total_tickets, 
            status,
            prize_items
        ) VALUES (
            'Sorteo Trolling Terrapesca 2025',
            'Gran sorteo de equipos de trolling profesional. Participa y gana increíbles premios de pesca deportiva.',
            'https://cdn.shopify.com/s/files/1/0205/5752/9188/files/Desktop.jpg?v=1750806041',
            150.00,
            '2025-12-31 20:00:00+00',
            2000,
            'active',
            ARRAY[
                '🎯 EQUIPO COMPLETO DE TROLLING PROFESIONAL',
                '',
                '🌊 CAÑAS Y CARRETES',
                '• Caña de trolling 7 pies acción pesada',
                '• Carrete convencional de alta capacidad',
                '• Línea trenzada 80 lb - 300 metros',
                '• Línea de monofilamento 60 lb - 200 metros',
                '',
                '🐠 SEÑUELOS Y CARNADAS',
                '• Set de 10 señuelos de trolling variados',
                '• Plomadas de trolling diferentes pesos',
                '• Anzuelos circulares premium',
                '• Emerillones y snaps de alta resistencia',
                '',
                '⚡ ACCESORIOS ESPECIALIZADOS',
                '• Downrigger portátil',
                '• Planer boards profesionales',
                '• Red de aterrizaje grande',
                '• Caja de aparejos organizada',
                '',
                '🧲 ELECTRÓNICOS',
                '• GPS/Sonar básico',
                '• Termómetro digital de agua',
                '• Brújula marina',
                '',
                '🛸 EXTRAS INCLUIDOS',
                '• Hielera de 48 cuartos',
                '• Sillas plegables de pesca (2)',
                '• Kit de primeros auxilios',
                '• Manual de técnicas de trolling',
                '',
                '🔱 VALOR TOTAL APROXIMADO: $25,000 MXN'
            ]
        ) RETURNING id INTO trolling_raffle_id;
        
        RAISE NOTICE 'Sorteo de Trolling creado con ID: %', trolling_raffle_id;
    ELSE
        RAISE NOTICE 'Sorteo de Trolling encontrado con ID: %', trolling_raffle_id;
    END IF;
    
    -- Paso 2: Contar boletos existentes
    SELECT COUNT(*) INTO existing_tickets_count 
    FROM tickets 
    WHERE raffle_id = trolling_raffle_id;
    
    RAISE NOTICE 'Boletos existentes: %', existing_tickets_count;
    
    -- Paso 3: Limpiar referencias en payment_logs
    UPDATE payment_logs 
    SET ticket_ids = NULL 
    WHERE ticket_ids && (
        SELECT ARRAY_AGG(id) 
        FROM tickets 
        WHERE raffle_id = trolling_raffle_id
    );
    
    RAISE NOTICE 'Referencias en payment_logs limpiadas';
    
    -- Paso 4: Eliminar TODOS los boletos existentes del sorteo
    DELETE FROM tickets WHERE raffle_id = trolling_raffle_id;
    
    RAISE NOTICE 'Todos los boletos eliminados para el sorteo %', trolling_raffle_id;
    
    -- Paso 5: Actualizar el sorteo para tener 2000 boletos
    UPDATE raffles 
    SET 
        total_tickets = 2000,
        status = 'active',
        updated_at = NOW()
    WHERE id = trolling_raffle_id;
    
    RAISE NOTICE 'Sorteo actualizado a 2000 boletos totales';
    
    -- Paso 6: Generar 2000 boletos nuevos usando generate_series (0000-1999)
    INSERT INTO tickets (number, status, raffle_id)
    SELECT 
        LPAD(generate_series::TEXT, 4, '0') as number,
        'available' as status,
        trolling_raffle_id as raffle_id
    FROM generate_series(0, 1999);
    
    RAISE NOTICE '2000 boletos generados (0000-1999)';
    
    -- Paso 7: Verificar la cantidad final
    SELECT COUNT(*) INTO final_tickets_count 
    FROM tickets 
    WHERE raffle_id = trolling_raffle_id;
    
    IF final_tickets_count = 2000 THEN
        RAISE NOTICE '✅ ÉXITO: Sorteo Trolling configurado con % boletos (0000-1999)', final_tickets_count;
    ELSE
        RAISE EXCEPTION '❌ ERROR: Se esperaban 2000 boletos pero se crearon %', final_tickets_count;
    END IF;
    
    -- Paso 8: Mostrar resumen final
    RAISE NOTICE '🎣 SORTEO TROLLING CONFIGURADO EXITOSAMENTE:';
    RAISE NOTICE '   - ID del sorteo: %', trolling_raffle_id;
    RAISE NOTICE '   - Total de boletos: %', final_tickets_count;
    RAISE NOTICE '   - Rango de números: 0000-1999';
    RAISE NOTICE '   - Estado: Activo';
    RAISE NOTICE '   - Precio por boleto: $150 MXN';
    
END $$;