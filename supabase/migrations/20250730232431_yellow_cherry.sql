/*
  # Sistema de Comisiones del 10% para Promotores

  1. Modificaciones
    - Actualizar función register_ticket_sale para calcular 10% automáticamente
    - Mejorar vista promoter_stats para mostrar comisiones calculadas
    - Agregar campos para tracking de comisiones

  2. Cálculos
    - Comisión = precio_boleto * 0.10
    - Se calcula automáticamente al confirmar pago
    - Se acumula en accumulated_bonus

  3. Dashboard
    - Mostrar comisiones en tiempo real
    - Calcular totales automáticamente
    - Mostrar progreso de ventas
*/

-- Actualizar la función register_ticket_sale para calcular 10% automáticamente
CREATE OR REPLACE FUNCTION register_ticket_sale(
  p_ticket_id integer,
  p_promoter_code text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_promoter_id uuid;
  v_ticket_price numeric;
  v_commission numeric;
  v_result json;
BEGIN
  -- Verificar que el promotor existe y está activo
  SELECT id INTO v_promoter_id
  FROM promoters 
  WHERE code = p_promoter_code AND active = true;
  
  IF v_promoter_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Promoter not found or inactive'
    );
  END IF;
  
  -- Obtener el precio del boleto desde el sorteo
  SELECT r.price INTO v_ticket_price
  FROM tickets t
  JOIN raffles r ON t.raffle_id = r.id
  WHERE t.id = p_ticket_id;
  
  IF v_ticket_price IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Ticket or raffle not found'
    );
  END IF;
  
  -- Calcular comisión del 10%
  v_commission := v_ticket_price * 0.10;
  
  -- Actualizar estadísticas del promotor
  UPDATE promoters 
  SET 
    total_sales = total_sales + 1,
    accumulated_bonus = accumulated_bonus + v_commission,
    updated_at = now()
  WHERE id = v_promoter_id;
  
  -- Verificar si el boleto está pagado para calcular comisión
  IF EXISTS (
    SELECT 1 FROM tickets 
    WHERE id = p_ticket_id AND status = 'purchased'
  ) THEN
    -- El boleto ya está pagado, la comisión se aplica inmediatamente
    v_result := json_build_object(
      'success', true,
      'commission_earned', v_commission,
      'ticket_price', v_ticket_price,
      'commission_rate', '10%',
      'status', 'commission_applied'
    );
  ELSE
    -- El boleto está reservado, la comisión se aplicará cuando se pague
    v_result := json_build_object(
      'success', true,
      'commission_pending', v_commission,
      'ticket_price', v_ticket_price,
      'commission_rate', '10%',
      'status', 'commission_pending'
    );
  END IF;
  
  RETURN v_result;
END;
$$;

-- Crear función para calcular comisiones cuando se confirma el pago
CREATE OR REPLACE FUNCTION calculate_promoter_commission_on_payment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_ticket_price numeric;
  v_commission numeric;
BEGIN
  -- Solo procesar si el boleto cambió de reservado a pagado
  IF OLD.status = 'reserved' AND NEW.status = 'purchased' AND NEW.promoter_code IS NOT NULL THEN
    
    -- Obtener el precio del boleto
    SELECT r.price INTO v_ticket_price
    FROM raffles r
    WHERE r.id = NEW.raffle_id;
    
    IF v_ticket_price IS NOT NULL THEN
      -- Calcular comisión del 10%
      v_commission := v_ticket_price * 0.10;
      
      -- Actualizar las comisiones del promotor
      UPDATE promoters 
      SET accumulated_bonus = accumulated_bonus + v_commission,
          updated_at = now()
      WHERE code = NEW.promoter_code AND active = true;
      
      -- Log para debugging
      RAISE NOTICE 'Commission calculated: % for promoter % on ticket %', 
        v_commission, NEW.promoter_code, NEW.number;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Crear trigger para calcular comisiones automáticamente
DROP TRIGGER IF EXISTS calculate_commission_on_payment ON tickets;
CREATE TRIGGER calculate_commission_on_payment
  AFTER UPDATE ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION calculate_promoter_commission_on_payment();

-- Actualizar la vista promoter_stats para mostrar cálculos mejorados
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
  p.created_at,
  p.updated_at,
  
  -- Estadísticas de boletos
  COALESCE(ticket_stats.tickets_sold, 0) as tickets_sold,
  COALESCE(ticket_stats.confirmed_sales, 0) as confirmed_sales,
  COALESCE(ticket_stats.pending_sales, 0) as pending_sales,
  
  -- Cálculos de comisiones
  COALESCE(commission_stats.total_commission_earned, 0) as total_commission_earned,
  COALESCE(commission_stats.pending_commission, 0) as pending_commission,
  COALESCE(commission_stats.average_ticket_price, 0) as average_ticket_price,
  
  -- Estadísticas por sorteo
  COALESCE(raffle_stats.active_raffles_count, 0) as active_raffles_count,
  COALESCE(raffle_stats.total_raffles_participated, 0) as total_raffles_participated

FROM promoters p

-- Estadísticas básicas de boletos
LEFT JOIN (
  SELECT 
    promoter_code,
    COUNT(*) as tickets_sold,
    COUNT(CASE WHEN status = 'purchased' THEN 1 END) as confirmed_sales,
    COUNT(CASE WHEN status = 'reserved' THEN 1 END) as pending_sales
  FROM tickets 
  WHERE promoter_code IS NOT NULL
  GROUP BY promoter_code
) ticket_stats ON p.code = ticket_stats.promoter_code

-- Estadísticas de comisiones calculadas
LEFT JOIN (
  SELECT 
    t.promoter_code,
    SUM(CASE WHEN t.status = 'purchased' THEN r.price * 0.10 ELSE 0 END) as total_commission_earned,
    SUM(CASE WHEN t.status = 'reserved' THEN r.price * 0.10 ELSE 0 END) as pending_commission,
    AVG(r.price) as average_ticket_price
  FROM tickets t
  JOIN raffles r ON t.raffle_id = r.id
  WHERE t.promoter_code IS NOT NULL
  GROUP BY t.promoter_code
) commission_stats ON p.code = commission_stats.promoter_code

-- Estadísticas por sorteo
LEFT JOIN (
  SELECT 
    t.promoter_code,
    COUNT(DISTINCT CASE WHEN r.status = 'active' THEN r.id END) as active_raffles_count,
    COUNT(DISTINCT r.id) as total_raffles_participated
  FROM tickets t
  JOIN raffles r ON t.raffle_id = r.id
  WHERE t.promoter_code IS NOT NULL
  GROUP BY t.promoter_code
) raffle_stats ON p.code = raffle_stats.promoter_code

ORDER BY p.total_sales DESC, p.accumulated_bonus DESC;

-- Función para obtener estadísticas detalladas de un promotor
CREATE OR REPLACE FUNCTION get_promoter_detailed_stats(p_promoter_code text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result json;
BEGIN
  SELECT json_build_object(
    'promoter_info', json_build_object(
      'name', p.name,
      'code', p.code,
      'active', p.active,
      'member_since', p.created_at
    ),
    'sales_summary', json_build_object(
      'total_tickets_sold', COALESCE(stats.tickets_sold, 0),
      'confirmed_sales', COALESCE(stats.confirmed_sales, 0),
      'pending_sales', COALESCE(stats.pending_sales, 0),
      'conversion_rate', CASE 
        WHEN COALESCE(stats.tickets_sold, 0) > 0 
        THEN ROUND((COALESCE(stats.confirmed_sales, 0)::numeric / stats.tickets_sold) * 100, 2)
        ELSE 0 
      END
    ),
    'commission_summary', json_build_object(
      'total_earned', COALESCE(stats.total_commission_earned, 0),
      'pending_commission', COALESCE(stats.pending_commission, 0),
      'accumulated_bonus', p.accumulated_bonus,
      'average_commission_per_ticket', CASE 
        WHEN COALESCE(stats.confirmed_sales, 0) > 0 
        THEN ROUND(COALESCE(stats.total_commission_earned, 0) / stats.confirmed_sales, 2)
        ELSE 0 
      END
    ),
    'performance_metrics', json_build_object(
      'active_raffles_participating', COALESCE(stats.active_raffles_count, 0),
      'total_raffles_participated', COALESCE(stats.total_raffles_participated, 0),
      'average_ticket_price', ROUND(COALESCE(stats.average_ticket_price, 0), 2)
    )
  ) INTO v_result
  FROM promoters p
  LEFT JOIN promoter_stats stats ON p.code = stats.code
  WHERE p.code = p_promoter_code;
  
  RETURN COALESCE(v_result, json_build_object('error', 'Promoter not found'));
END;
$$;

-- Crear índices para optimizar consultas de comisiones
CREATE INDEX IF NOT EXISTS idx_tickets_promoter_status ON tickets(promoter_code, status) WHERE promoter_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tickets_promoter_raffle ON tickets(promoter_code, raffle_id) WHERE promoter_code IS NOT NULL;

-- Comentarios para documentación
COMMENT ON FUNCTION register_ticket_sale IS 'Registra venta de boleto y calcula comisión del 10% automáticamente';
COMMENT ON FUNCTION calculate_promoter_commission_on_payment IS 'Calcula comisiones cuando el boleto cambia de reservado a pagado';
COMMENT ON VIEW promoter_stats IS 'Vista con estadísticas completas de promotores incluyendo comisiones del 10%';
COMMENT ON FUNCTION get_promoter_detailed_stats IS 'Obtiene estadísticas detalladas de un promotor específico';