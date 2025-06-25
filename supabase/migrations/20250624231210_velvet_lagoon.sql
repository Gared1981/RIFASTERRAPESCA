/*
  # Solución completa para problemas de actualización de sorteos

  1. Limpiar políticas RLS conflictivas
  2. Crear políticas simples y funcionales
  3. Simplificar triggers problemáticos
  4. Verificar y corregir datos existentes
  5. Crear función de debugging
*/

-- 1. LIMPIAR POLÍTICAS EXISTENTES
DROP POLICY IF EXISTS "Raffles are viewable by everyone" ON raffles;
DROP POLICY IF EXISTS "Allow authenticated users to insert raffles" ON raffles;
DROP POLICY IF EXISTS "Allow authenticated users to update raffles" ON raffles;
DROP POLICY IF EXISTS "Allow authenticated users to delete raffles" ON raffles;
DROP POLICY IF EXISTS "Authenticated users can manage raffles" ON raffles;
DROP POLICY IF EXISTS "Authenticated sessions can manage raffles" ON raffles;

-- 2. CREAR POLÍTICAS SIMPLES Y FUNCIONALES
-- Permitir lectura a todos
CREATE POLICY "Enable read access for all users" ON raffles
  FOR SELECT USING (true);

-- Permitir todas las operaciones a usuarios autenticados
CREATE POLICY "Enable all operations for authenticated users" ON raffles
  FOR ALL USING (
    auth.uid() IS NOT NULL
  ) WITH CHECK (
    auth.uid() IS NOT NULL
  );

-- 3. SIMPLIFICAR TRIGGERS
-- Eliminar trigger problemático
DROP TRIGGER IF EXISTS prevent_completed_raffle_edits ON raffles;
DROP FUNCTION IF EXISTS prevent_completed_raffle_edits();

-- Crear función de trigger más simple
CREATE OR REPLACE FUNCTION update_raffle_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := now();
  
  -- Solo generar slug si no existe
  IF NEW.slug IS NULL THEN
    NEW.slug := lower(regexp_replace(
      regexp_replace(NEW.name, '[^a-zA-Z0-9\s-]', '', 'g'),
      '\s+', '-', 'g'
    ));
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger simple
DROP TRIGGER IF EXISTS update_raffle_timestamp_trigger ON raffles;
CREATE TRIGGER update_raffle_timestamp_trigger
  BEFORE INSERT OR UPDATE ON raffles
  FOR EACH ROW
  EXECUTE FUNCTION update_raffle_timestamp();

-- 4. VERIFICAR Y CORREGIR DATOS EXISTENTES
-- Asegurar que todos los sorteos tengan valores por defecto
UPDATE raffles 
SET 
  status = COALESCE(status, 'draft'),
  images = COALESCE(images, '{}'),
  video_urls = COALESCE(video_urls, '{}'),
  prize_items = COALESCE(prize_items, '{}'),
  updated_at = COALESCE(updated_at, now()),
  slug = COALESCE(slug, lower(regexp_replace(
    regexp_replace(name, '[^a-zA-Z0-9\s-]', '', 'g'),
    '\s+', '-', 'g'
  )))
WHERE 
  status IS NULL OR 
  images IS NULL OR 
  video_urls IS NULL OR 
  prize_items IS NULL OR
  updated_at IS NULL OR
  slug IS NULL;

-- 5. VERIFICAR ESTRUCTURA DE TABLA
-- Asegurar que todas las columnas existan con valores por defecto correctos
ALTER TABLE raffles 
  ALTER COLUMN status SET DEFAULT 'draft',
  ALTER COLUMN images SET DEFAULT '{}',
  ALTER COLUMN video_urls SET DEFAULT '{}',
  ALTER COLUMN prize_items SET DEFAULT '{}',
  ALTER COLUMN updated_at SET DEFAULT now();

-- 6. CREAR FUNCIÓN DE DEBUGGING
CREATE OR REPLACE FUNCTION debug_raffle_update(
  raffle_id INTEGER,
  new_status TEXT
)
RETURNS JSON AS $$
DECLARE
  result JSON;
  current_user_id UUID;
  update_count INTEGER;
BEGIN
  -- Obtener información del usuario actual
  current_user_id := auth.uid();
  
  -- Intentar la actualización
  BEGIN
    UPDATE raffles 
    SET 
      status = new_status,
      updated_at = now()
    WHERE id = raffle_id;
    
    GET DIAGNOSTICS update_count = ROW_COUNT;
    
    IF update_count > 0 THEN
      result := json_build_object(
        'success', true,
        'message', 'Raffle updated successfully',
        'user_id', current_user_id,
        'raffle_id', raffle_id,
        'new_status', new_status,
        'rows_affected', update_count
      );
    ELSE
      result := json_build_object(
        'success', false,
        'error', 'Raffle not found or no changes made',
        'user_id', current_user_id,
        'raffle_id', raffle_id,
        'rows_affected', update_count
      );
    END IF;
    
  EXCEPTION WHEN OTHERS THEN
    result := json_build_object(
      'success', false,
      'error', SQLERRM,
      'error_code', SQLSTATE,
      'user_id', current_user_id,
      'raffle_id', raffle_id
    );
  END;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. CREAR FUNCIÓN PARA VERIFICAR PERMISOS
CREATE OR REPLACE FUNCTION check_raffle_permissions()
RETURNS JSON AS $$
DECLARE
  result JSON;
  current_user_id UUID;
  is_authenticated BOOLEAN;
BEGIN
  current_user_id := auth.uid();
  is_authenticated := current_user_id IS NOT NULL;
  
  result := json_build_object(
    'user_id', current_user_id,
    'is_authenticated', is_authenticated,
    'can_update_raffles', is_authenticated,
    'timestamp', now()
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;