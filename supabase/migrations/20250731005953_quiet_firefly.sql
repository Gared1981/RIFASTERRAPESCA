/*
  # Actualizar vista de análisis de sorteos para comisiones del 15%

  1. Actualización de Vista
    - Modificar cálculo de comisiones de 10% a 15%
    - Actualizar ganancia neta con nuevo porcentaje
    - Recalcular márgenes de ganancia
    
  2. Nuevos Cálculos
    - Comisiones = 15% del precio por boleto vendido con código de promotor
    - Ganancia neta = Ingresos totales - Comisiones del 15%
    - Margen = (Ganancia neta / Ingresos totales) × 100
    
  3. Métricas Mejoradas
    - Diferenciación entre boletos con/sin promotor
    - Cálculo preciso de comisiones por sorteo
    - Análisis de rentabilidad actualizado
*/

-- Eliminar vista existente
DROP VIEW IF EXISTS raffle_analytics;

-- Crear vista actualizada con comisiones del 15%
CREATE VIEW raffle_analytics AS
SELECT 
  r.id as raffle_id,
  r.name as raffle_name,
  r.status as raffle_status,
  r.price as ticket_price,
  r.total_tickets,
  r.draw_date,
  r.created_at,
  
  -- Conteo de boletos por estado
  COALESCE(sold_tickets.count, 0) as tickets_sold,
  COALESCE(reserved_tickets.count, 0) as tickets_reserved,
  COALESCE(available_tickets.count, 0) as tickets_available,
  
  -- Cálculos financieros
  COALESCE(sold_tickets.count, 0) * r.price as total_revenue,
  
  -- Comisiones del 15% (solo para boletos con código de promotor)
  COALESCE(promoter_tickets.count, 0) * r.price * 0.15 as total_commissions,
  
  -- Conteo de boletos con/sin promotor
  COALESCE(promoter_tickets.count, 0) as tickets_with_promoter_code,
  COALESCE(sold_tickets.count, 0) - COALESCE(promoter_tickets.count, 0) as tickets_without_promoter_code,
  
  -- Ganancia neta (ingresos - comisiones del 15%)
  (COALESCE(sold_tickets.count, 0) * r.price) - (COALESCE(promoter_tickets.count, 0) * r.price * 0.15) as net_profit,
  
  -- Margen de ganancia
  CASE 
    WHEN COALESCE(sold_tickets.count, 0) > 0 THEN
      ((COALESCE(sold_tickets.count, 0) * r.price) - (COALESCE(promoter_tickets.count, 0) * r.price * 0.15)) / (COALESCE(sold_tickets.count, 0) * r.price) * 100
    ELSE 0
  END as profit_margin,
  
  -- Porcentaje de ventas
  CASE 
    WHEN r.total_tickets > 0 THEN
      (COALESCE(sold_tickets.count, 0)::numeric / r.total_tickets::numeric) * 100
    ELSE 0
  END as sales_percentage,
  
  -- Información del ganador
  winner_info.first_name as winner_name,
  winner_ticket.number as winner_ticket_number,
  winner_ticket.promoter_code as winner_promoter_code

FROM raffles r

-- Boletos vendidos (pagados)
LEFT JOIN (
  SELECT 
    raffle_id, 
    COUNT(*) as count
  FROM tickets 
  WHERE status = 'purchased'
  GROUP BY raffle_id
) sold_tickets ON r.id = sold_tickets.raffle_id

-- Boletos reservados
LEFT JOIN (
  SELECT 
    raffle_id, 
    COUNT(*) as count
  FROM tickets 
  WHERE status = 'reserved'
  GROUP BY raffle_id
) reserved_tickets ON r.id = reserved_tickets.raffle_id

-- Boletos disponibles
LEFT JOIN (
  SELECT 
    raffle_id, 
    COUNT(*) as count
  FROM tickets 
  WHERE status = 'available'
  GROUP BY raffle_id
) available_tickets ON r.id = available_tickets.raffle_id

-- Boletos vendidos con código de promotor (para cálculo de comisiones del 15%)
LEFT JOIN (
  SELECT 
    raffle_id, 
    COUNT(*) as count
  FROM tickets 
  WHERE status = 'purchased' 
    AND promoter_code IS NOT NULL 
    AND promoter_code != ''
  GROUP BY raffle_id
) promoter_tickets ON r.id = promoter_tickets.raffle_id

-- Información del ganador
LEFT JOIN users winner_info ON r.winner_id = winner_info.id
LEFT JOIN tickets winner_ticket ON r.winner_id = winner_ticket.user_id AND r.id = winner_ticket.raffle_id

ORDER BY r.created_at DESC;

-- Comentario sobre la vista
COMMENT ON VIEW raffle_analytics IS 'Vista de análisis financiero por sorteo incluyendo ingresos, comisiones del 15% y ganancias netas';