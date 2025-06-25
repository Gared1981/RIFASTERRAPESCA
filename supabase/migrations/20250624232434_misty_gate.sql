/*
  # Actualizar sorteo de trolling con artículos detallados
  
  1. Cambios
    - Actualizar sorteo existente con información completa de trolling
    - Agregar todos los artículos del premio organizados por categorías
    - Crear boletos si no existen
    - Manejar conflicto de slug único
*/

-- Primero, verificar si existe un sorteo con el slug que queremos usar
DO $$
DECLARE
  existing_raffle_id INTEGER;
  current_raffle_id INTEGER;
  ticket_count INTEGER;
  target_slug TEXT := 'sorteo-trolling-de-terrapesca';
BEGIN
  -- Buscar si ya existe un sorteo con este slug
  SELECT id INTO existing_raffle_id FROM raffles WHERE slug = target_slug;
  
  -- Si existe, actualizar ese sorteo
  IF existing_raffle_id IS NOT NULL THEN
    UPDATE raffles
    SET 
      name = 'Sorteo Trolling de Terrapesca 🐟',
      description = '¡El sorteo más completo para los amantes de la pesca de trolling! Gana un equipo profesional valorado en más de $52,000 MXN con los mejores señuelos y equipo pesado del mercado.',
      price = 150,
      draw_date = '2025-08-15 18:00:00-06',
      image_url = 'https://images.pexels.com/photos/1430677/pexels-photo-1430677.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      video_url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      images = ARRAY[
        'https://images.pexels.com/photos/1430677/pexels-photo-1430677.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/1592384/pexels-photo-1592384.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/1266810/pexels-photo-1266810.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://images.pexels.com/photos/1374295/pexels-photo-1374295.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
      ],
      prize_items = ARRAY[
        '🐠 SEÑUELOS NOMAD SLIPSTREAM 8"',
        '• 🎯 Sun Spot',
        '• 🌊 Ulysses', 
        '• 💡 Lumo Glow',
        '',
        '🐟 SEÑUELOS NOMAD DTX MINNOW 220 HD',
        '• 🔴 Red Bait',
        '• 🐟 Sardine',
        '• 🌸 Pink Mackerel',
        '• 🍬 Candy Pilchard',
        '',
        '⚡ SEÑUELOS NOMAD MADMACS 200 HIGH SPEED',
        '• 🐟 Sardine',
        '• 🟠 Orange Mackerel',
        '• 🇪🇸 Spanish Mackerel',
        '',
        '🧲 SEÑUELOS NOEBY METAL MOUTH FLOATING',
        '• ⚫ Black Silver',
        '• 🔴 Red Head',
        '• 🔵 Blue Blood',
        '',
        '🛸 SEÑUELOS RAPALA SARDA 18 CM 200G',
        '• 🐟 Flying Fish UV',
        '• 🐯 Fire Tiger',
        '• 🚨 Red Head UV',
        '• ⛵ Sailfish UV',
        '',
        '🔱 SEÑUELOS WILLIAMSON GLADIATOR TROLLING LURE 330 MM',
        '• ❤️💛 Red/Yellow',
        '• 💜💙 Purple/Blue',
        '• 💚💛 Green/Yellow',
        '',
        '🌀 SEÑUELOS FATHOM 9" PRE-RIGGED',
        '• 🌸 Hot Pink Shell',
        '• 🐚 Mother of Pearl Shell',
        '• 🐬 Liquid Dolphin Shell',
        '• 🍊 Orange Paua Shell',
        '• 💚 Chartreuse Shell',
        '• 🦑 Liquid Squid Shell',
        '',
        '🐬 SEÑUELOS FATHOM 14" SHAKA SLANT',
        '• 🐬 Liquid Dolphin Shell',
        '• 🌸 Hot Pink Shell',
        '• 🐚 Mother of Pearl Shell',
        '• 🇪🇸 Liquid Spanish Shell',
        '',
        '🛶 EQUIPO PESADO PROFESIONAL',
        '• 🪵 Vara DAIWA Trolling Boat V.I.P.-A 5''6" XXH 40–130 lbs',
        '• 🎣 Carrete SHIMANO TIAGRA 50 WIDE SPOOL 40 lbs',
        '',
        '💰 VALOR TOTAL DEL SORTEO: $52,737.54 MXN'
      ],
      status = 'active',
      total_tickets = 1000,
      updated_at = now()
    WHERE id = existing_raffle_id;
    
    current_raffle_id := existing_raffle_id;
    RAISE NOTICE 'Updated existing trolling raffle with ID: %', existing_raffle_id;
    
  ELSE
    -- Si no existe, buscar el primer sorteo activo y actualizarlo
    SELECT id INTO current_raffle_id FROM raffles WHERE status = 'active' OR active = true LIMIT 1;
    
    IF current_raffle_id IS NOT NULL THEN
      UPDATE raffles
      SET 
        name = 'Sorteo Trolling de Terrapesca 🐟',
        description = '¡El sorteo más completo para los amantes de la pesca de trolling! Gana un equipo profesional valorado en más de $52,000 MXN con los mejores señuelos y equipo pesado del mercado.',
        price = 150,
        draw_date = '2025-08-15 18:00:00-06',
        image_url = 'https://images.pexels.com/photos/1430677/pexels-photo-1430677.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        video_url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        images = ARRAY[
          'https://images.pexels.com/photos/1430677/pexels-photo-1430677.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
          'https://images.pexels.com/photos/1592384/pexels-photo-1592384.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
          'https://images.pexels.com/photos/1266810/pexels-photo-1266810.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
          'https://images.pexels.com/photos/1374295/pexels-photo-1374295.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
        ],
        prize_items = ARRAY[
          '🐠 SEÑUELOS NOMAD SLIPSTREAM 8"',
          '• 🎯 Sun Spot',
          '• 🌊 Ulysses', 
          '• 💡 Lumo Glow',
          '',
          '🐟 SEÑUELOS NOMAD DTX MINNOW 220 HD',
          '• 🔴 Red Bait',
          '• 🐟 Sardine',
          '• 🌸 Pink Mackerel',
          '• 🍬 Candy Pilchard',
          '',
          '⚡ SEÑUELOS NOMAD MADMACS 200 HIGH SPEED',
          '• 🐟 Sardine',
          '• 🟠 Orange Mackerel',
          '• 🇪🇸 Spanish Mackerel',
          '',
          '🧲 SEÑUELOS NOEBY METAL MOUTH FLOATING',
          '• ⚫ Black Silver',
          '• 🔴 Red Head',
          '• 🔵 Blue Blood',
          '',
          '🛸 SEÑUELOS RAPALA SARDA 18 CM 200G',
          '• 🐟 Flying Fish UV',
          '• 🐯 Fire Tiger',
          '• 🚨 Red Head UV',
          '• ⛵ Sailfish UV',
          '',
          '🔱 SEÑUELOS WILLIAMSON GLADIATOR TROLLING LURE 330 MM',
          '• ❤️💛 Red/Yellow',
          '• 💜💙 Purple/Blue',
          '• 💚💛 Green/Yellow',
          '',
          '🌀 SEÑUELOS FATHOM 9" PRE-RIGGED',
          '• 🌸 Hot Pink Shell',
          '• 🐚 Mother of Pearl Shell',
          '• 🐬 Liquid Dolphin Shell',
          '• 🍊 Orange Paua Shell',
          '• 💚 Chartreuse Shell',
          '• 🦑 Liquid Squid Shell',
          '',
          '🐬 SEÑUELOS FATHOM 14" SHAKA SLANT',
          '• 🐬 Liquid Dolphin Shell',
          '• 🌸 Hot Pink Shell',
          '• 🐚 Mother of Pearl Shell',
          '• 🇪🇸 Liquid Spanish Shell',
          '',
          '🛶 EQUIPO PESADO PROFESIONAL',
          '• 🪵 Vara DAIWA Trolling Boat V.I.P.-A 5''6" XXH 40–130 lbs',
          '• 🎣 Carrete SHIMANO TIAGRA 50 WIDE SPOOL 40 lbs',
          '',
          '💰 VALOR TOTAL DEL SORTEO: $52,737.54 MXN'
        ],
        slug = target_slug,
        status = 'active',
        total_tickets = 1000,
        updated_at = now()
      WHERE id = current_raffle_id;
      
      RAISE NOTICE 'Updated raffle with ID: % to trolling raffle', current_raffle_id;
    ELSE
      -- Si no hay sorteos, crear uno nuevo
      INSERT INTO raffles (
        name,
        description,
        price,
        draw_date,
        image_url,
        video_url,
        images,
        prize_items,
        slug,
        status,
        total_tickets
      ) VALUES (
        'Sorteo Trolling de Terrapesca 🐟',
        '¡El sorteo más completo para los amantes de la pesca de trolling! Gana un equipo profesional valorado en más de $52,000 MXN con los mejores señuelos y equipo pesado del mercado.',
        150,
        '2025-08-15 18:00:00-06',
        'https://images.pexels.com/photos/1430677/pexels-photo-1430677.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        ARRAY[
          'https://images.pexels.com/photos/1430677/pexels-photo-1430677.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
          'https://images.pexels.com/photos/1592384/pexels-photo-1592384.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
          'https://images.pexels.com/photos/1266810/pexels-photo-1266810.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
          'https://images.pexels.com/photos/1374295/pexels-photo-1374295.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
        ],
        ARRAY[
          '🐠 SEÑUELOS NOMAD SLIPSTREAM 8"',
          '• 🎯 Sun Spot',
          '• 🌊 Ulysses', 
          '• 💡 Lumo Glow',
          '',
          '🐟 SEÑUELOS NOMAD DTX MINNOW 220 HD',
          '• 🔴 Red Bait',
          '• 🐟 Sardine',
          '• 🌸 Pink Mackerel',
          '• 🍬 Candy Pilchard',
          '',
          '⚡ SEÑUELOS NOMAD MADMACS 200 HIGH SPEED',
          '• 🐟 Sardine',
          '• 🟠 Orange Mackerel',
          '• 🇪🇸 Spanish Mackerel',
          '',
          '🧲 SEÑUELOS NOEBY METAL MOUTH FLOATING',
          '• ⚫ Black Silver',
          '• 🔴 Red Head',
          '• 🔵 Blue Blood',
          '',
          '🛸 SEÑUELOS RAPALA SARDA 18 CM 200G',
          '• 🐟 Flying Fish UV',
          '• 🐯 Fire Tiger',
          '• 🚨 Red Head UV',
          '• ⛵ Sailfish UV',
          '',
          '🔱 SEÑUELOS WILLIAMSON GLADIATOR TROLLING LURE 330 MM',
          '• ❤️💛 Red/Yellow',
          '• 💜💙 Purple/Blue',
          '• 💚💛 Green/Yellow',
          '',
          '🌀 SEÑUELOS FATHOM 9" PRE-RIGGED',
          '• 🌸 Hot Pink Shell',
          '• 🐚 Mother of Pearl Shell',
          '• 🐬 Liquid Dolphin Shell',
          '• 🍊 Orange Paua Shell',
          '• 💚 Chartreuse Shell',
          '• 🦑 Liquid Squid Shell',
          '',
          '🐬 SEÑUELOS FATHOM 14" SHAKA SLANT',
          '• 🐬 Liquid Dolphin Shell',
          '• 🌸 Hot Pink Shell',
          '• 🐚 Mother of Pearl Shell',
          '• 🇪🇸 Liquid Spanish Shell',
          '',
          '🛶 EQUIPO PESADO PROFESIONAL',
          '• 🪵 Vara DAIWA Trolling Boat V.I.P.-A 5''6" XXH 40–130 lbs',
          '• 🎣 Carrete SHIMANO TIAGRA 50 WIDE SPOOL 40 lbs',
          '',
          '💰 VALOR TOTAL DEL SORTEO: $52,737.54 MXN'
        ],
        target_slug,
        'active',
        1000
      ) RETURNING id INTO current_raffle_id;
      
      RAISE NOTICE 'Created new trolling raffle with ID: %', current_raffle_id;
    END IF;
  END IF;
  
  -- Verificar si ya existen boletos para este sorteo
  SELECT COUNT(*) INTO ticket_count FROM tickets WHERE raffle_id = current_raffle_id;
  
  -- Si no hay boletos, crearlos
  IF ticket_count = 0 THEN
    INSERT INTO tickets (number, status, raffle_id)
    SELECT 
      generate_series,
      'available',
      current_raffle_id
    FROM generate_series(1001, 2000);
    
    RAISE NOTICE 'Created 1000 tickets for trolling raffle';
  ELSE
    RAISE NOTICE 'Tickets already exist for this raffle: %', ticket_count;
  END IF;
END $$;