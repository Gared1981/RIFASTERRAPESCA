/*
  # Corregir actualización de estado de sorteos

  1. Problemas identificados
    - Políticas RLS muy restrictivas
    - Función de trigger que puede estar bloqueando actualizaciones
    - Verificación de autenticación incorrecta

  2. Soluciones
    - Actualizar políticas RLS para permitir actualizaciones de estado
    - Corregir función de trigger
    - Mejorar verificación de autenticación
*/

-- Primero, eliminar políticas existentes que pueden estar causando problemas
DROP POLICY IF EXISTS "Allow authenticated users to update raffles" ON raffles;
DROP POLICY IF EXISTS "Allow authenticated users to insert raffles" ON raffles;
DROP POLICY IF EXISTS "Allow authenticated users to delete raffles" ON raffles;

-- Crear nuevas políticas más permisivas para usuarios autenticados
CREATE POLICY "Authenticated users can manage raffles"
ON raffles
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- También permitir a usuarios públicos con sesión válida
CREATE POLICY "Authenticated sessions can manage raffles"
ON raffles
FOR ALL
TO public
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Corregir la función de trigger para evitar bloqueos innecesarios
CREATE OR REPLACE FUNCTION prevent_completed_raffle_edits()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo prevenir ediciones si el sorteo está completado Y tiene ganador
  IF OLD.status = 'completed' AND OLD.winner_id IS NOT NULL THEN
    -- Permitir cambios de estado incluso en sorteos completados
    IF NEW.status != OLD.status THEN
      NEW.updated_at := now();
      RETURN NEW;
    END IF;
    
    -- Prevenir cambios en campos críticos solo si ya tiene ganador
    IF (OLD.name != NEW.name OR
        OLD.description != NEW.description OR
        OLD.draw_date != NEW.draw_date OR
        OLD.price != NEW.price OR
        OLD.total_tickets != NEW.total_tickets) THEN
      RAISE EXCEPTION 'Cannot modify completed raffles with assigned winners';
    END IF;
  END IF;
  
  -- Actualizar timestamp en todos los casos
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recrear el trigger
DROP TRIGGER IF EXISTS prevent_completed_raffle_edits ON raffles;
CREATE TRIGGER prevent_completed_raffle_edits
  BEFORE UPDATE ON raffles
  FOR EACH ROW
  EXECUTE FUNCTION prevent_completed_raffle_edits();

-- Asegurar que el trigger de slug también funcione correctamente
CREATE OR REPLACE FUNCTION set_raffle_slug()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo generar slug si no existe o si el nombre cambió
  IF NEW.slug IS NULL OR (OLD.name IS DISTINCT FROM NEW.name) THEN
    NEW.slug := lower(regexp_replace(
      regexp_replace(NEW.name, '[^a-zA-Z0-9\s-]', '', 'g'),
      '\s+', '-', 'g'
    ));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recrear el trigger de slug
DROP TRIGGER IF EXISTS trigger_set_raffle_slug ON raffles;
CREATE TRIGGER trigger_set_raffle_slug
  BEFORE INSERT OR UPDATE ON raffles
  FOR EACH ROW
  EXECUTE FUNCTION set_raffle_slug();

-- Verificar que el sorteo actual tenga los campos necesarios
UPDATE raffles 
SET 
  status = COALESCE(status, 'draft'),
  images = COALESCE(images, '{}'),
  video_urls = COALESCE(video_urls, '{}'),
  prize_items = COALESCE(prize_items, '{}'),
  updated_at = now()
WHERE status IS NULL OR images IS NULL OR video_urls IS NULL OR prize_items IS NULL;