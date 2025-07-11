/*
  # Crear sorteo Tris Clásico

  1. Nuevo Sorteo
    - Nombre: "Sorteo Tris Clásico"
    - Fecha: 11 de agosto de 2025 a las 20:15 hrs (tiempo de Sinaloa)
    - Precio: $50 MXN por boleto
    - Total de boletos: 1001 (del 0000 al 1000)
    - Estado: activo

  2. Boletos
    - Numeración desde 0000 hasta 1000
    - Todos disponibles inicialmente

  3. Seguridad
    - Mantiene las políticas RLS existentes
*/

-- Insertar el nuevo sorteo Tris Clásico
INSERT INTO raffles (
  name,
  description,
  image_url,
  price,
  draw_date,
  total_tickets,
  status,
  active,
  prize_items
) VALUES (
  'Sorteo Tris Clásico',
  'Participa en nuestro sorteo especial Tris Clásico. El sorteo se realiza con el sistema oficial del Tris Clásico de la Lotería Nacional.

¡Gana increíbles premios de pesca deportiva!

El sorteo se celebra el 11 de agosto de 2025 a las 20:15 hrs (tiempo de Sinaloa), que corresponde a las 21:15 hrs del centro de México (CDMX).

Numeración especial: del 0000 al 1000 para mayor oportunidad de ganar.',
  'https://cdn.shopify.com/s/files/1/0205/5752/9188/files/Desktop.jpg?v=1750806041',
  50.00,
  '2025-08-11 20:15:00-07:00', -- Hora de Sinaloa (UTC-7)
  1001,
  'active',
  true,
  ARRAY[
    '🎣 EQUIPO COMPLETO DE PESCA DEPORTIVA',
    '',
    '🎯 CAÑA DE PESCAR PROFESIONAL',
    '• Caña de grafito alta resistencia',
    '• Longitud 7 pies',
    '• Acción media-pesada',
    '• Ideal para pesca en mar y lago',
    '',
    '🌊 CARRETE DE ALTA CALIDAD',
    '• Carrete spinning profesional',
    '• Sistema de freno suave',
    '• Rodamientos de acero inoxidable',
    '• Capacidad 200m línea 20lb',
    '',
    '🐠 ACCESORIOS DE PESCA',
    '• Caja de señuelos variados',
    '• Anzuelos de diferentes tamaños',
    '• Plomos y flotadores',
    '• Línea de pesca premium',
    '',
    '⚡ EXTRAS INCLUIDOS',
    '• Bolsa de transporte',
    '• Manual de técnicas de pesca',
    '• Garantía de 1 año',
    '',
    '🚚 ENVÍO GRATIS A TODA LA REPÚBLICA MEXICANA'
  ]
);

-- Obtener el ID del sorteo recién creado
DO $$
DECLARE
  raffle_id_var INTEGER;
BEGIN
  -- Obtener el ID del sorteo Tris Clásico
  SELECT id INTO raffle_id_var 
  FROM raffles 
  WHERE name = 'Sorteo Tris Clásico' 
  ORDER BY created_at DESC 
  LIMIT 1;

  -- Generar boletos del 0000 al 1000
  INSERT INTO tickets (number, status, raffle_id)
  SELECT 
    generate_series(0, 1000) as number,
    'available' as status,
    raffle_id_var as raffle_id;
    
END $$;