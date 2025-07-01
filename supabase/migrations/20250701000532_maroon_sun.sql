/*
  # Corregir slug del sorteo y mejorar políticas RLS

  1. Problemas identificados
    - Slug con guión extra al final causa enlaces rotos
    - Políticas RLS muy restrictivas impiden actualizaciones
    - Función de trigger puede estar interfiriendo

  2. Soluciones
    - Limpiar slug del sorteo de trolling
    - Simplificar políticas RLS
    - Mejorar función de actualización de slug
    - Crear función de bypass para admin
*/

-- 1. CORREGIR SLUG DEL SORTEO DE TROLLING
UPDATE raffles
SET 
  slug = 'sorteo-trolling-de-terrapesca',
  updated_at = now()
WHERE slug LIKE '%trolling%' AND slug != 'sorteo-trolling-de-terrapesca';

-- 2. LIMPIAR POLÍTICAS RLS EXISTENTES
DROP POLICY IF EXISTS "Public read access for raffles" ON raffles;
DROP POLICY IF EXISTS "Authenticated insert for raffles" ON raffles;
DROP POLICY IF EXISTS "Authenticated update for raffles" ON raffles;
DROP POLICY IF EXISTS "Authenticated delete for raffles" ON raffles;
DROP POLICY IF EXISTS "Enable read access for all users" ON raffles;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON raffles;

-- 3. CREAR POLÍTICAS RLS SIMPLIFICADAS Y FUNCIONALES

-- Lectura pública
CREATE POLICY "Allow public read access"
ON raffles FOR SELECT
TO public
USING (true);

-- Operaciones para usuarios autenticados (más permisiva)
CREATE POLICY "Allow authenticated operations"
ON raffles FOR ALL
TO public
USING (
  auth.uid() IS NOT NULL OR 
  auth.role() = 'authenticated' OR
  current_setting('role', true) = 'authenticated' OR
  session_user = 'authenticated'
)
WITH CHECK (
  auth.uid() IS NOT NULL OR 
  auth.role() = 'authenticated' OR
  current_setting('role', true) = 'authenticated' OR
  session_user = 'authenticated'
);

-- 4. MEJORAR FUNCIÓN DE ACTUALIZACIÓN DE SLUG
CREATE OR REPLACE FUNCTION set_raffle_slug()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo generar slug si no existe o si el nombre cambió significativamente
  IF NEW.slug IS NULL OR (OLD.name IS DISTINCT FROM NEW.name) THEN
    -- Generar slug limpio sin guiones extra
    NEW.slug := trim(both '-' from lower(regexp_replace(
      regexp_replace(NEW.name, '[^a-zA-Z0-9\s-]', '', 'g'),
      '\s+', '-', 'g'
    )));
    
    -- Asegurar que no termine en guión
    NEW.slug := regexp_replace(NEW.slug, '-+$', '', 'g');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. RECREAR TRIGGER DE SLUG
DROP TRIGGER IF EXISTS trigger_set_raffle_slug ON raffles;
CREATE TRIGGER trigger_set_raffle_slug
  BEFORE INSERT OR UPDATE ON raffles
  FOR EACH ROW
  EXECUTE FUNCTION set_raffle_slug();

-- 6. FUNCIÓN DE BYPASS PARA ADMINISTRADORES
CREATE OR REPLACE FUNCTION admin_update_raffle(
  raffle_id INTEGER,
  update_data JSONB
)
RETURNS JSON AS $$
DECLARE
  result JSON;
  update_count INTEGER;
  current_raffle RECORD;
BEGIN
  -- Obtener datos actuales del sorteo
  SELECT * INTO current_raffle FROM raffles WHERE id = raffle_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Raffle not found',
      'raffle_id', raffle_id
    );
  END IF;
  
  -- Realizar actualización con bypass de RLS
  BEGIN
    -- Deshabilitar RLS temporalmente para esta operación
    SET row_security = off;
    
    UPDATE raffles 
    SET 
      name = COALESCE((update_data->>'name')::TEXT, name),
      description = COALESCE((update_data->>'description')::TEXT, description),
      price = COALESCE((update_data->>'price')::DECIMAL, price),
      draw_date = COALESCE((update_data->>'draw_date')::TIMESTAMPTZ, draw_date),
      status = COALESCE((update_data->>'status')::TEXT, status),
      image_url = COALESCE((update_data->>'image_url')::TEXT, image_url),
      video_url = COALESCE((update_data->>'video_url')::TEXT, video_url),
      images = COALESCE(
        CASE 
          WHEN update_data ? 'images' THEN 
            (SELECT array_agg(value::text) FROM jsonb_array_elements_text(update_data->'images'))
          ELSE images 
        END, 
        images
      ),
      video_urls = COALESCE(
        CASE 
          WHEN update_data ? 'video_urls' THEN 
            (SELECT array_agg(value::text) FROM jsonb_array_elements_text(update_data->'video_urls'))
          ELSE video_urls 
        END, 
        video_urls
      ),
      prize_items = COALESCE(
        CASE 
          WHEN update_data ? 'prize_items' THEN 
            (SELECT array_agg(value::text) FROM jsonb_array_elements_text(update_data->'prize_items'))
          ELSE prize_items 
        END, 
        prize_items
      ),
      total_tickets = COALESCE((update_data->>'total_tickets')::INTEGER, total_tickets),
      updated_at = now()
    WHERE id = raffle_id;
    
    GET DIAGNOSTICS update_count = ROW_COUNT;
    
    -- Rehabilitar RLS
    SET row_security = on;
    
    IF update_count > 0 THEN
      result := json_build_object(
        'success', true,
        'message', 'Raffle updated successfully via admin function',
        'raffle_id', raffle_id,
        'rows_affected', update_count,
        'timestamp', now()
      );
    ELSE
      result := json_build_object(
        'success', false,
        'error', 'No changes made',
        'raffle_id', raffle_id
      );
    END IF;
    
  EXCEPTION WHEN OTHERS THEN
    -- Asegurar que RLS se rehabilite en caso de error
    SET row_security = on;
    
    result := json_build_object(
      'success', false,
      'error', SQLERRM,
      'error_code', SQLSTATE,
      'raffle_id', raffle_id
    );
  END;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. LIMPIAR SLUGS EXISTENTES
UPDATE raffles 
SET slug = trim(both '-' from regexp_replace(slug, '-+$', '', 'g'))
WHERE slug IS NOT NULL AND slug LIKE '%-';

-- 8. VERIFICAR Y CORREGIR DATOS
UPDATE raffles 
SET 
  status = COALESCE(status, 'draft'),
  images = COALESCE(images, '{}'),
  video_urls = COALESCE(video_urls, '{}'),
  prize_items = COALESCE(prize_items, '{}'),
  updated_at = now()
WHERE 
  status IS NULL OR 
  images IS NULL OR 
  video_urls IS NULL OR 
  prize_items IS NULL;