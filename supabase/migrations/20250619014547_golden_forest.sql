/*
  # Sistema de Códigos de Promotor

  1. Nuevas Tablas
    - `promoters` - Información de promotores/empleados
    - Actualización de `tickets` para incluir código de promotor

  2. Funciones
    - Función para registrar venta con promotor
    - Función para asignar ganador y bono extra

  3. Seguridad
    - RLS habilitado en todas las tablas
    - Políticas para acceso público y administrador
*/

-- Tabla de promotores
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

-- Agregar columna de promotor a tickets si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tickets' AND column_name = 'promoter_code'
  ) THEN
    ALTER TABLE tickets ADD COLUMN promoter_code TEXT REFERENCES promoters(code);
  END IF;
END $$;

-- Crear índices para rendimiento
CREATE INDEX IF NOT EXISTS promoters_code_idx ON promoters (code);
CREATE INDEX IF NOT EXISTS tickets_promoter_code_idx ON tickets (promoter_code);

-- Habilitar RLS
ALTER TABLE promoters ENABLE ROW LEVEL SECURITY;

-- Políticas para promoters
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
  WHERE id = p_ticket_id AND status = 'purchased';
  
  -- Verificar que el ticket fue actualizado
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Ticket not found or not purchased');
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

-- Insertar algunos promotores de ejemplo
INSERT INTO promoters (name, code) VALUES 
  ('Juan Pérez', 'JP001'),
  ('María González', 'MG002'),
  ('Carlos Rodríguez', 'CR003'),
  ('Ana López', 'AL004'),
  ('Luis Martínez', 'LM005')
ON CONFLICT (code) DO NOTHING;

-- Crear vista para estadísticas de promotores
CREATE OR REPLACE VIEW promoter_stats AS
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