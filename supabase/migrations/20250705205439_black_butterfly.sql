/*
  # Restaurar sistema de promotores completo

  1. Recrear tabla de promotores si no existe
  2. Recrear funciones de promotores
  3. Recrear vista de estadísticas
  4. Insertar promotores existentes
*/

-- Crear tabla de promotores si no existe
CREATE TABLE IF NOT EXISTS promoters (
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

-- Crear índices si no existen
CREATE INDEX IF NOT EXISTS promoters_code_idx ON promoters (code);
CREATE INDEX IF NOT EXISTS tickets_promoter_code_idx ON tickets (promoter_code);

-- Habilitar RLS
ALTER TABLE promoters ENABLE ROW LEVEL SECURITY;

-- Crear políticas para promoters
DROP POLICY IF EXISTS "Promoters are viewable by everyone" ON promoters;
DROP POLICY IF EXISTS "Allow authenticated users to manage promoters" ON promoters;

CREATE POLICY "Promoters are viewable by everyone"
  ON promoters FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to manage promoters"
  ON promoters FOR ALL
  TO public
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Función para registrar venta con promotor
CREATE OR REPLACE FUNCTION register_ticket_sale(
  p_ticket_id INTEGER,
  p_promoter_code TEXT
)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  -- Actualizar el ticket con el código del promotor
  UPDATE tickets 
  SET promoter_code = p_promoter_code
  WHERE id = p_ticket_id AND status IN ('reserved', 'purchased');
  
  -- Verificar que el ticket fue actualizado
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Ticket not found or not reserved/purchased');
  END IF;
  
  -- Actualizar métricas del promotor
  UPDATE promoters 
  SET 
    total_sales = total_sales + 1,
    accumulated_bonus = accumulated_bonus + 1000,
    updated_at = now()
  WHERE code = p_promoter_code AND active = true;
  
  -- Verificar que el promotor fue actualizado
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Promoter not found or inactive');
  END IF;
  
  RETURN json_build_object('success', true, 'message', 'Sale registered successfully');
END;
$$ LANGUAGE plpgsql;

-- Función para asignar ganador y bono extra
CREATE OR REPLACE FUNCTION assign_winner_bonus(
  p_raffle_id INTEGER,
  p_winning_ticket_number INTEGER
)
RETURNS JSON AS $$
DECLARE
  winning_promoter_code TEXT;
  result JSON;
BEGIN
  -- Obtener el código del promotor del boleto ganador
  SELECT promoter_code INTO winning_promoter_code
  FROM tickets 
  WHERE raffle_id = p_raffle_id 
    AND number = p_winning_ticket_number 
    AND status = 'purchased';
  
  -- Si no hay promotor asociado, no hay bono extra
  IF winning_promoter_code IS NULL THEN
    RETURN json_build_object(
      'success', true, 
      'message', 'Winner assigned but no promoter bonus (ticket sold without promoter code)'
    );
  END IF;
  
  -- Asignar bono extra al promotor
  UPDATE promoters 
  SET 
    accumulated_bonus = accumulated_bonus + 1000,
    extra_prize = true,
    updated_at = now()
  WHERE code = winning_promoter_code;
  
  RETURN json_build_object(
    'success', true, 
    'message', 'Winner bonus assigned successfully',
    'promoter_code', winning_promoter_code
  );
END;
$$ LANGUAGE plpgsql;

-- Crear vista para estadísticas de promotores
DROP VIEW IF EXISTS promoter_stats;

CREATE VIEW promoter_stats AS
SELECT 
  p.id,
  p.name,
  p.code,
  p.total_sales,
  p.accumulated_bonus,
  p.extra_prize,
  p.active,
  COUNT(t.id) as tickets_sold,
  COUNT(CASE WHEN t.status = 'purchased' THEN 1 END) as confirmed_sales,
  p.created_at,
  p.updated_at
FROM promoters p
LEFT JOIN tickets t ON t.promoter_code = p.code
GROUP BY p.id, p.name, p.code, p.total_sales, p.accumulated_bonus, p.extra_prize, p.active, p.created_at, p.updated_at;

-- Conceder acceso a la vista
GRANT SELECT ON promoter_stats TO public;

-- Insertar promotores si no existen
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
ON CONFLICT (code) DO NOTHING;