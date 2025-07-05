/*
  # Corregir sistema de promotores

  1. Verificar y crear tabla promoters si no existe
  2. Verificar y agregar columna promoter_code a tickets
  3. Crear políticas RLS correctas
  4. Mejorar función register_ticket_sale
  5. Insertar/actualizar promotores
  6. Función de verificación
*/

-- Verificar que la tabla promoters existe y tiene la estructura correcta
DO $$
BEGIN
  -- Verificar si la tabla existe
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'promoters') THEN
    -- Crear tabla si no existe
    CREATE TABLE promoters (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      code TEXT UNIQUE NOT NULL,
      total_sales INTEGER DEFAULT 0,
      accumulated_bonus DECIMAL(10,2) DEFAULT 0,
      extra_prize BOOLEAN DEFAULT false,
      active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );
    
    -- Crear índices
    CREATE INDEX promoters_code_idx ON promoters (code);
    
    -- Habilitar RLS
    ALTER TABLE promoters ENABLE ROW LEVEL SECURITY;
    
    RAISE NOTICE 'Tabla promoters creada';
  ELSE
    RAISE NOTICE 'Tabla promoters ya existe';
  END IF;
END $$;

-- Verificar que la columna promoter_code existe en tickets
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tickets' AND column_name = 'promoter_code'
  ) THEN
    ALTER TABLE tickets ADD COLUMN promoter_code TEXT;
    CREATE INDEX IF NOT EXISTS tickets_promoter_code_idx ON tickets (promoter_code);
    RAISE NOTICE 'Columna promoter_code agregada a tickets';
  ELSE
    RAISE NOTICE 'Columna promoter_code ya existe en tickets';
  END IF;
END $$;

-- Limpiar políticas existentes y crear nuevas
DROP POLICY IF EXISTS "Promoters are viewable by everyone" ON promoters;
DROP POLICY IF EXISTS "Allow authenticated users to manage promoters" ON promoters;

-- Crear políticas RLS para promoters
CREATE POLICY "Promoters are viewable by everyone"
  ON promoters FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to manage promoters"
  ON promoters FOR ALL
  TO public
  USING (
    auth.uid() IS NOT NULL OR 
    auth.role() = 'authenticated' OR
    current_setting('role', true) = 'authenticated'
  )
  WITH CHECK (
    auth.uid() IS NOT NULL OR 
    auth.role() = 'authenticated' OR
    current_setting('role', true) = 'authenticated'
  );

-- Función mejorada para registrar venta con promotor
CREATE OR REPLACE FUNCTION register_ticket_sale(
  p_ticket_id INTEGER,
  p_promoter_code TEXT
)
RETURNS JSON AS $$
DECLARE
  result JSON;
  ticket_status TEXT;
  promoter_exists BOOLEAN;
BEGIN
  -- Verificar que el promotor existe y está activo
  SELECT EXISTS(
    SELECT 1 FROM promoters 
    WHERE code = p_promoter_code AND active = true
  ) INTO promoter_exists;
  
  IF NOT promoter_exists THEN
    RETURN json_build_object(
      'success', false, 
      'error', 'Promoter not found or inactive',
      'promoter_code', p_promoter_code
    );
  END IF;
  
  -- Obtener estado actual del ticket
  SELECT status INTO ticket_status FROM tickets WHERE id = p_ticket_id;
  
  IF ticket_status IS NULL THEN
    RETURN json_build_object(
      'success', false, 
      'error', 'Ticket not found',
      'ticket_id', p_ticket_id
    );
  END IF;
  
  -- Actualizar el ticket con el código del promotor (permitir en cualquier estado)
  UPDATE tickets 
  SET promoter_code = p_promoter_code
  WHERE id = p_ticket_id;
  
  -- Verificar que el ticket fue actualizado
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false, 
      'error', 'Failed to update ticket',
      'ticket_id', p_ticket_id
    );
  END IF;
  
  -- Solo actualizar métricas del promotor si el ticket está pagado
  IF ticket_status = 'purchased' THEN
    UPDATE promoters 
    SET 
      total_sales = total_sales + 1,
      accumulated_bonus = accumulated_bonus + 1000,
      updated_at = now()
    WHERE code = p_promoter_code AND active = true;
  END IF;
  
  RETURN json_build_object(
    'success', true, 
    'message', 'Sale registered successfully',
    'ticket_id', p_ticket_id,
    'promoter_code', p_promoter_code,
    'ticket_status', ticket_status
  );
END;
$$ LANGUAGE plpgsql;

-- Insertar o actualizar promotores
INSERT INTO promoters (name, code, active) VALUES 
  ('VARELA MEDINA MARIA FERNANDA', 'VMMF001', true),
  ('LANZARIN FERRE JESUS SALVADOR', 'LFJS002', true),
  ('VALDEZ GASTELUM JUAN MIGUEL', 'VGJM003', true),
  ('GIL FLORES ADAN ALEJANDRO', 'GFAA004', true),
  ('ROMERO GOMEZ EDGAR HUMBERTO', 'RGEH005', true),
  ('GASTELUM SOTO JORGE ABRAHAM', 'GSJA006', true),
  ('ANAYA TORRES IRAN LIZANDRO', 'ATIL007', true),
  ('FLORES MARQUEZ JOSE GILBERTO', 'FMJG008', true),
  ('LLAMAS ASTORGA JORGE LUIS', 'LAJL009', true),
  ('ARMENTA CRUZ EDGAR SAID', 'ACES010', true),
  ('LOZOYA HERNANDEZ CARLOS', 'LHCA011', true),
  ('GUZMAN GASTELUM ANDREA FERNANDA', 'GGAF012', true),
  ('TIZNADO COTA OSCAR ALEJANDRO', 'TCOA013', true),
  ('MIRANDA ORDOÑEZ EDUARDO', 'MOEA014', true),
  ('BASTIDAS GUZMAN OSCAR ALEXIS', 'BGOA015', true),
  ('SANCHEZ ENRIQUEZ LUIS AROLDO', 'SELA016', true),
  ('GASTELUM LOPEZ DANIEL', 'GLDA017', true),
  ('ANAYA TORRES HERBERTH FERNANDO', 'ATHF018', true),
  ('FUENTES QUINTERO MARTHA ABIGAIL', 'FQMA019', true),
  ('URTUSUASTEGUI MARTINEZ JOSE DANIEL', 'UMJD020', true)
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  active = true,
  updated_at = now();

-- Función para verificar promotores (corregida)
CREATE OR REPLACE FUNCTION check_promoters_status()
RETURNS JSON AS $$
DECLARE
  total_promoters INTEGER;
  active_promoters INTEGER;
  sample_codes TEXT[];
  result JSON;
BEGIN
  -- Contar promotores
  SELECT COUNT(*) INTO total_promoters FROM promoters;
  SELECT COUNT(*) INTO active_promoters FROM promoters WHERE active = true;
  
  -- Obtener algunos códigos de ejemplo (corregido)
  SELECT array_agg(code) INTO sample_codes 
  FROM (
    SELECT code FROM promoters WHERE active = true ORDER BY code LIMIT 5
  ) AS sample;
  
  result := json_build_object(
    'total_promoters', total_promoters,
    'active_promoters', active_promoters,
    'sample_codes', sample_codes,
    'check_time', now()
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Ejecutar verificación
SELECT check_promoters_status();