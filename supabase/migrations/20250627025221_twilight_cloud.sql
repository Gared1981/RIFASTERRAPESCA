/*
  # Reiniciar todos los boletos a disponible

  1. Cambios
    - Cambiar todos los boletos a estado 'available'
    - Limpiar user_id, reserved_at, purchased_at y promoter_code
    - Mantener la estructura de números de boleto existente

  2. Propósito
    - Reiniciar completamente el sistema de boletaje
    - Permitir que todos los boletos estén disponibles para nueva venta
*/

-- Reiniciar todos los boletos a estado disponible
UPDATE tickets 
SET 
  status = 'available',
  user_id = NULL,
  reserved_at = NULL,
  purchased_at = NULL,
  promoter_code = NULL
WHERE status IN ('reserved', 'purchased');

-- Mensaje de confirmación
DO $$
DECLARE
  ticket_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO ticket_count FROM tickets WHERE status = 'available';
  RAISE NOTICE 'Todos los boletos han sido reiniciados. Total de boletos disponibles: %', ticket_count;
END $$;