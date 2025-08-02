/*
  # Sistema de Comisiones Mejorado - 15% + Bonos Especiales
  
  1. Nuevas Comisiones
    - 15% por cada boleto vendido (antes 10%)
    - $2,000 MXN si el ganador tiene código del promotor
    - $1,000 MXN extra si el promotor vendió 100+ boletos Y su cliente gana
    
  2. Funciones Actualizadas
    - Cálculo automático del 15%
    - Sistema de bonos por ganador
    - Tracking de ventas para bonus de 100+ boletos
    
  3. Dashboard Mejorado
    - Nuevas métricas de comisiones
    - Indicadores de bonos especiales
    - Progreso hacia 100 boletos
*/

-- Actualizar la función register_ticket_sale para calcular 15% automáticamente
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
  
  -- Calcular comisión del 15% (actualizado de 10%)
  v_commission := v_ticket_price * 0.15;
  
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
      'commission_rate', '15%',
      'status', 'commission_applied'
    );
  ELSE
    -- El boleto está reservado, la comisión se aplicará cuando se pague
    v_result := json_build_object(
      'success', true,
      'commission_pending', v_commission,
      'ticket_price', v_ticket_price,
      'commission_rate', '15%',
      'status', 'commission_pending'
    );
  END IF;
  
  RETURN v_result;
END;
$$;

-- Crear función para calcular comisiones cuando se confirma el pago (actualizada al 15%)
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
      -- Calcular comisión del 15% (actualizado)
      v_commission := v_ticket_price * 0.15;
      
      -- Actualizar las comisiones del promotor
      UPDATE promoters 
      SET accumulated_bonus = accumulated_bonus + v_commission,
          updated_at = now()
      WHERE code = NEW.promoter_code AND active = true;
      
      -- Log para debugging
      RAISE NOTICE 'Commission calculated: % (15%%) for promoter % on ticket %', 
        v_commission, NEW.promoter_code, NEW.number;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Función mejorada para asignar bonos de ganador
CREATE OR REPLACE FUNCTION assign_winner_bonus(
  p_raffle_id INTEGER,
  p_winning_ticket_number TEXT
)
RETURNS JSON AS $$
DECLARE
  winning_promoter_code TEXT;
  promoter_total_sales INTEGER;
  base_bonus NUMERIC := 2000; -- Bono base por ganador
  extra_bonus NUMERIC := 0;   -- Bono extra por 100+ ventas
  total_bonus NUMERIC;
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
      'message', 'Winner assigned but no promoter bonus (ticket sold without promoter code)',
      'base_bonus', 0,
      'extra_bonus', 0,
      'total_bonus', 0
    );
  END IF;
  
  -- Obtener total de ventas del promotor
  SELECT total_sales INTO promoter_total_sales
  FROM promoters 
  WHERE code = winning_promoter_code;
  
  -- Calcular bono extra si vendió 100+ boletos
  IF promoter_total_sales >= 100 THEN
    extra_bonus := 1000;
  END IF;
  
  total_bonus := base_bonus + extra_bonus;
  
  -- Asignar bonos al promotor
  UPDATE promoters 
  SET 
    accumulated_bonus = accumulated_bonus + total_bonus,
    extra_prize = true,
    updated_at = now()
  WHERE code = winning_promoter_code;
  
  RETURN json_build_object(
    'success', true, 
    'message', 'Winner bonus assigned successfully',
    'promoter_code', winning_promoter_code,
    'promoter_total_sales', promoter_total_sales,
    'base_bonus', base_bonus,
    'extra_bonus', extra_bonus,
    'total_bonus', total_bonus,
    'qualified_for_extra', promoter_total_sales >= 100
  );
END;
$$ LANGUAGE plpgsql;

-- Actualizar la vista promoter_stats para mostrar cálculos del 15%
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
  
  -- Cálculos de comisiones al 15%
  COALESCE(commission_stats.total_commission_earned, 0) as total_commission_earned,
  COALESCE(commission_stats.pending_commission, 0) as pending_commission,
  COALESCE(commission_stats.average_ticket_price, 0) as average_ticket_price,
  
  -- Estadísticas por sorteo
  COALESCE(raffle_stats.active_raffles_count, 0) as active_raffles_count,
  COALESCE(raffle_stats.total_raffles_participated, 0) as total_raffles_participated,
  
  -- Nuevos campos para bonos especiales
  CASE WHEN p.total_sales >= 100 THEN true ELSE false END as qualified_for_extra_bonus,
  GREATEST(0, 100 - p.total_sales) as tickets_to_100_bonus,
  ROUND((p.total_sales::numeric / 100) * 100, 1) as progress_to_100_percent

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

-- Estadísticas de comisiones calculadas al 15%
LEFT JOIN (
  SELECT 
    t.promoter_code,
    SUM(CASE WHEN t.status = 'purchased' THEN r.price * 0.15 ELSE 0 END) as total_commission_earned,
    SUM(CASE WHEN t.status = 'reserved' THEN r.price * 0.15 ELSE 0 END) as pending_commission,
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

-- Función para obtener estadísticas detalladas con nuevos bonos
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
      'commission_rate', '15%',
      'total_earned', COALESCE(stats.total_commission_earned, 0),
      'pending_commission', COALESCE(stats.pending_commission, 0),
      'accumulated_bonus', p.accumulated_bonus,
      'average_commission_per_ticket', CASE 
        WHEN COALESCE(stats.confirmed_sales, 0) > 0 
        THEN ROUND(COALESCE(stats.total_commission_earned, 0) / stats.confirmed_sales, 2)
        ELSE 0 
      END
    ),
    'bonus_system', json_build_object(
      'qualified_for_extra_bonus', stats.qualified_for_extra_bonus,
      'tickets_to_100_bonus', stats.tickets_to_100_bonus,
      'progress_to_100_percent', stats.progress_to_100_percent,
      'winner_base_bonus', 2000,
      'winner_extra_bonus', CASE WHEN stats.qualified_for_extra_bonus THEN 1000 ELSE 0 END,
      'total_potential_winner_bonus', CASE WHEN stats.qualified_for_extra_bonus THEN 3000 ELSE 2000 END
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

-- Comentarios para documentación
COMMENT ON FUNCTION register_ticket_sale IS 'Registra venta de boleto y calcula comisión del 15% automáticamente';
COMMENT ON FUNCTION calculate_promoter_commission_on_payment IS 'Calcula comisiones del 15% cuando el boleto cambia de reservado a pagado';
COMMENT ON FUNCTION assign_winner_bonus IS 'Asigna bono de $2,000 por ganador + $1,000 extra si vendió 100+ boletos';
COMMENT ON VIEW promoter_stats IS 'Vista con estadísticas completas de promotores incluyendo comisiones del 15% y sistema de bonos';
COMMENT ON FUNCTION get_promoter_detailed_stats IS 'Obtiene estadísticas detalladas de un promotor específico con nuevos bonos';