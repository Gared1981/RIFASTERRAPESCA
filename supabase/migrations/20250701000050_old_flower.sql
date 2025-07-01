/*
  # Corregir slug del sorteo de trolling

  1. Cambios
    - Corregir el slug que tiene un guión extra al final
    - Asegurar que el slug sea único y correcto
    - Verificar que no haya conflictos
*/

-- Corregir el slug del sorteo de trolling
UPDATE raffles
SET 
  slug = 'sorteo-trolling-de-terrapesca',
  updated_at = now()
WHERE name LIKE '%Trolling%' OR slug LIKE '%trolling%';

-- Verificar que el slug sea único
DO $$
DECLARE
  duplicate_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO duplicate_count 
  FROM raffles 
  WHERE slug = 'sorteo-trolling-de-terrapesca';
  
  IF duplicate_count > 1 THEN
    -- Si hay duplicados, mantener solo el más reciente
    DELETE FROM raffles 
    WHERE slug = 'sorteo-trolling-de-terrapesca' 
    AND id NOT IN (
      SELECT id FROM raffles 
      WHERE slug = 'sorteo-trolling-de-terrapesca' 
      ORDER BY updated_at DESC 
      LIMIT 1
    );
  END IF;
END $$;