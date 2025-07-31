/*
  # Vista de análisis de ganancias por sorteo

  1. Nueva Vista
    - `raffle_analytics`
      - Calcula ingresos totales por sorteo
      - Calcula comisiones pagadas (15%)
      - Calcula ganancia neta
      - Muestra margen de ganancia
      - Incluye estadísticas de boletos vendidos

  2. Funcionalidad
    - Análisis financiero por sorteo
    - Seguimiento de comisiones de promotores
    - Cálculo de rentabilidad
    - Dashboard de ganancias para administradores
*/

-- Crear vista de análisis de ganancias por sorteo
CREATE OR REPLACE VIEW raffle_analytics AS
SELECT 
  r.id as raffle_id,
  r.name as raffle_name,
  r.status as raffle_status,
  r.price as ticket_price,
  r.total_tickets,
  r.draw_date,
  r.created_at,
  
  -- Estadísticas de boletos
  COALESCE(ticket_stats.tickets_sold, 0) as tickets_sold,
  COALESCE(ticket_stats.tickets_reserved, 0) as tickets_reserved,
  COALESCE(ticket_stats.tickets_available, 0) as tickets_available,
  
  -- Cálculos financieros
  COALESCE(ticket_stats.tickets_sold, 0) * r.price as total_revenue,
  
  -- Comisiones de promotores (15% de boletos vendidos con código)
  COALESCE(promoter_stats.total_commissions, 0) as total_commissions,
  COALESCE(promoter_stats.tickets_with_promoter, 0) as tickets_with_promoter_code,
  COALESCE(promoter_stats.tickets_without_promoter, 0) as tickets_without_promoter_code,
  
  -- Ganancia neta (ingresos - comisiones)
  (COALESCE(ticket_stats.tickets_sold, 0) * r.price) - COALESCE(promoter_stats.total_commissions, 0) as net_profit,
  
  -- Margen de ganancia (porcentaje)
  CASE 
    WHEN COALESCE(ticket_stats.tickets_sold, 0) > 0 THEN
      ROUND(
        ((COALESCE(ticket_stats.tickets_sold, 0) * r.price) - COALESCE(promoter_stats.total_commissions, 0)) / 
        (COALESCE(ticket_stats.tickets_sold, 0) * r.price) * 100, 
        2
      )
    ELSE 0 
  END as profit_margin,
  
  -- Porcentaje de ventas
  CASE 
    WHEN r.total_tickets > 0 THEN
      ROUND((COALESCE(ticket_stats.tickets_sold, 0)::numeric / r.total_tickets) * 100, 2)
    ELSE 0 
  END as sales_percentage,
  
  -- Información del ganador si existe
  winner_info.winner_name,
  winner_info.winner_ticket_number,
  winner_info.winner_promoter_code

FROM raffles r

-- Estadísticas de boletos
LEFT JOIN (
  SELECT 
    raffle_id,
    COUNT(*) as total_tickets_in_system,
    COUNT(CASE WHEN status = 'purchased' THEN 1 END) as tickets_sold,
    COUNT(CASE WHEN status = 'reserved' THEN 1 END) as tickets_reserved,
    COUNT(CASE WHEN status = 'available' THEN 1 END) as tickets_available
  FROM tickets
  GROUP BY raffle_id
) ticket_stats ON r.id = ticket_stats.raffle_id

-- Estadísticas de promotores y comisiones
LEFT JOIN (
  SELECT 
    t.raffle_id,
    -- Comisiones totales (15% de boletos vendidos con código de promotor)
    SUM(CASE 
      WHEN t.status = 'purchased' AND t.promoter_code IS NOT NULL 
      THEN r.price * 0.15 
      ELSE 0 
    END) as total_commissions,
    
    -- Conteo de boletos con y sin promotor
    COUNT(CASE 
      WHEN t.status = 'purchased' AND t.promoter_code IS NOT NULL 
      THEN 1 
    END) as tickets_with_promoter,
    
    COUNT(CASE 
      WHEN t.status = 'purchased' AND t.promoter_code IS NULL 
      THEN 1 
    END) as tickets_without_promoter,
    
    -- Promotores únicos que participaron
    COUNT(DISTINCT t.promoter_code) FILTER (WHERE t.promoter_code IS NOT NULL) as unique_promoters
    
  FROM tickets t
  JOIN raffles r ON t.raffle_id = r.id
  GROUP BY t.raffle_id
) promoter_stats ON r.id = promoter_stats.raffle_id

-- Información del ganador
LEFT JOIN (
  SELECT 
    r.id as raffle_id,
    CONCAT(u.first_name, ' ', u.last_name) as winner_name,
    t.number as winner_ticket_number,
    t.promoter_code as winner_promoter_code
  FROM raffles r
  JOIN tickets t ON r.winner_id = t.user_id AND t.raffle_id = r.id
  JOIN users u ON t.user_id = u.id
  WHERE r.winner_id IS NOT NULL
) winner_info ON r.id = winner_info.raffle_id

ORDER BY r.created_at DESC;

-- Función para obtener resumen financiero general
CREATE OR REPLACE FUNCTION get_financial_summary()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result json;
BEGIN
  SELECT json_build_object(
    'total_revenue', COALESCE(SUM(total_revenue), 0),
    'total_commissions', COALESCE(SUM(total_commissions), 0),
    'total_net_profit', COALESCE(SUM(net_profit), 0),
    'average_profit_margin', COALESCE(AVG(profit_margin), 0),
    'total_tickets_sold', COALESCE(SUM(tickets_sold), 0),
    'total_raffles', COUNT(*),
    'active_raffles', COUNT(CASE WHEN raffle_status = 'active' THEN 1 END),
    'completed_raffles', COUNT(CASE WHEN raffle_status = 'completed' THEN 1 END),
    'tickets_with_promoter_percentage', 
      CASE 
        WHEN SUM(tickets_sold) > 0 THEN
          ROUND((SUM(tickets_with_promoter_code)::numeric / SUM(tickets_sold)) * 100, 2)
        ELSE 0 
      END,
    'average_commission_per_raffle', 
      CASE 
        WHEN COUNT(*) > 0 THEN
          COALESCE(SUM(total_commissions), 0) / COUNT(*)
        ELSE 0 
      END
  ) INTO v_result
  FROM raffle_analytics;
  
  RETURN v_result;
END;
$$;

-- Función para obtener top promotores por sorteo
CREATE OR REPLACE FUNCTION get_top_promoters_by_raffle(p_raffle_id integer)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result json;
BEGIN
  SELECT json_agg(
    json_build_object(
      'promoter_code', promoter_code,
      'promoter_name', p.name,
      'tickets_sold', tickets_sold,
      'commission_earned', commission_earned,
      'percentage_of_sales', percentage_of_sales
    ) ORDER BY tickets_sold DESC
  ) INTO v_result
  FROM (
    SELECT 
      t.promoter_code,
      COUNT(*) as tickets_sold,
      SUM(r.price * 0.15) as commission_earned,
      ROUND((COUNT(*)::numeric / total_sold.total) * 100, 2) as percentage_of_sales
    FROM tickets t
    JOIN raffles r ON t.raffle_id = r.id
    CROSS JOIN (
      SELECT COUNT(*) as total 
      FROM tickets 
      WHERE raffle_id = p_raffle_id AND status = 'purchased'
    ) total_sold
    LEFT JOIN promoters p ON t.promoter_code = p.code
    WHERE t.raffle_id = p_raffle_id 
      AND t.status = 'purchased' 
      AND t.promoter_code IS NOT NULL
    GROUP BY t.promoter_code, total_sold.total
  ) promoter_sales
  LEFT JOIN promoters p ON promoter_sales.promoter_code = p.code;
  
  RETURN COALESCE(v_result, '[]'::json);
END;
$$;

-- Comentarios para documentación
COMMENT ON VIEW raffle_analytics IS 'Vista de análisis financiero por sorteo incluyendo ingresos, comisiones del 15% y ganancias netas';
COMMENT ON FUNCTION get_financial_summary IS 'Obtiene resumen financiero general de todos los sorteos';
COMMENT ON FUNCTION get_top_promoters_by_raffle IS 'Obtiene los promotores más exitosos por sorteo específico';