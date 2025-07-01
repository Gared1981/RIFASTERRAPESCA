/*
  # Mejorar políticas RLS para sorteos

  1. Cambios
    - Simplificar políticas RLS para evitar conflictos
    - Permitir actualizaciones más flexibles
    - Mejorar el sistema de autenticación
    - Agregar políticas específicas para diferentes operaciones
*/

-- Eliminar todas las políticas existentes para empezar limpio
DROP POLICY IF EXISTS "Enable read access for all users" ON raffles;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON raffles;
DROP POLICY IF EXISTS "Raffles are viewable by everyone" ON raffles;
DROP POLICY IF EXISTS "Allow authenticated users to insert raffles" ON raffles;
DROP POLICY IF EXISTS "Allow authenticated users to update raffles" ON raffles;
DROP POLICY IF EXISTS "Allow authenticated users to delete raffles" ON raffles;
DROP POLICY IF EXISTS "Authenticated users can manage raffles" ON raffles;
DROP POLICY IF EXISTS "Authenticated sessions can manage raffles" ON raffles;

-- Crear políticas más específicas y permisivas

-- 1. Lectura pública para todos
CREATE POLICY "Public read access for raffles"
ON raffles FOR SELECT
TO public
USING (true);

-- 2. Inserción para usuarios autenticados
CREATE POLICY "Authenticated insert for raffles"
ON raffles FOR INSERT
TO public
WITH CHECK (
  auth.uid() IS NOT NULL OR 
  auth.role() = 'authenticated' OR
  current_setting('role', true) = 'authenticated'
);

-- 3. Actualización para usuarios autenticados (más permisiva)
CREATE POLICY "Authenticated update for raffles"
ON raffles FOR UPDATE
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

-- 4. Eliminación para usuarios autenticados
CREATE POLICY "Authenticated delete for raffles"
ON raffles FOR DELETE
TO public
USING (
  auth.uid() IS NOT NULL OR 
  auth.role() = 'authenticated' OR
  current_setting('role', true) = 'authenticated'
);

-- Crear función para verificar autenticación de manera más robusta
CREATE OR REPLACE FUNCTION is_authenticated()
RETURNS boolean AS $$
BEGIN
  RETURN (
    auth.uid() IS NOT NULL OR 
    auth.role() = 'authenticated' OR
    current_setting('role', true) = 'authenticated' OR
    current_user = 'authenticated'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para forzar actualización de sorteo
CREATE OR REPLACE FUNCTION force_update_raffle(
  raffle_id INTEGER,
  raffle_data JSONB
)
RETURNS JSON AS $$
DECLARE
  result JSON;
  update_count INTEGER;
BEGIN
  -- Intentar la actualización directamente
  BEGIN
    UPDATE raffles 
    SET 
      name = COALESCE((raffle_data->>'name')::TEXT, name),
      description = COALESCE((raffle_data->>'description')::TEXT, description),
      price = COALESCE((raffle_data->>'price')::DECIMAL, price),
      draw_date = COALESCE((raffle_data->>'draw_date')::TIMESTAMPTZ, draw_date),
      status = COALESCE((raffle_data->>'status')::TEXT, status),
      image_url = COALESCE((raffle_data->>'image_url')::TEXT, image_url),
      video_url = COALESCE((raffle_data->>'video_url')::TEXT, video_url),
      images = COALESCE((raffle_data->>'images')::TEXT[], images),
      video_urls = COALESCE((raffle_data->>'video_urls')::TEXT[], video_urls),
      prize_items = COALESCE((raffle_data->>'prize_items')::TEXT[], prize_items),
      total_tickets = COALESCE((raffle_data->>'total_tickets')::INTEGER, total_tickets),
      updated_at = now()
    WHERE id = raffle_id;
    
    GET DIAGNOSTICS update_count = ROW_COUNT;
    
    IF update_count > 0 THEN
      result := json_build_object(
        'success', true,
        'message', 'Raffle updated successfully',
        'raffle_id', raffle_id,
        'rows_affected', update_count,
        'timestamp', now()
      );
    ELSE
      result := json_build_object(
        'success', false,
        'error', 'Raffle not found or no changes made',
        'raffle_id', raffle_id,
        'rows_affected', update_count
      );
    END IF;
    
  EXCEPTION WHEN OTHERS THEN
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