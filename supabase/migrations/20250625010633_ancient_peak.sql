/*
  # Crear tabla para logs de pagos

  1. Nueva tabla
    - `payment_logs` - Para registrar todas las transacciones y webhooks
    
  2. Campos
    - Información del pago de Mercado Pago
    - Datos del webhook
    - Referencias a boletos y sorteos
    - Timestamps para auditoría
    
  3. Seguridad
    - Solo acceso para funciones del servidor
    - Logs completos para debugging
*/

CREATE TABLE IF NOT EXISTS payment_logs (
  id SERIAL PRIMARY KEY,
  preference_id TEXT,
  payment_id TEXT,
  external_reference TEXT,
  status TEXT,
  status_detail TEXT,
  amount DECIMAL(10,2),
  ticket_ids INTEGER[],
  metadata JSONB,
  webhook_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Crear índices para consultas eficientes
CREATE INDEX IF NOT EXISTS payment_logs_preference_id_idx ON payment_logs (preference_id);
CREATE INDEX IF NOT EXISTS payment_logs_payment_id_idx ON payment_logs (payment_id);
CREATE INDEX IF NOT EXISTS payment_logs_external_reference_idx ON payment_logs (external_reference);
CREATE INDEX IF NOT EXISTS payment_logs_status_idx ON payment_logs (status);
CREATE INDEX IF NOT EXISTS payment_logs_created_at_idx ON payment_logs (created_at);

-- Habilitar RLS
ALTER TABLE payment_logs ENABLE ROW LEVEL SECURITY;

-- Política para que solo las funciones del servidor puedan acceder
CREATE POLICY "Service role can manage payment logs"
ON payment_logs
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Función para limpiar logs antiguos (opcional)
CREATE OR REPLACE FUNCTION cleanup_old_payment_logs()
RETURNS void AS $$
BEGIN
  -- Eliminar logs de más de 1 año
  DELETE FROM payment_logs 
  WHERE created_at < NOW() - INTERVAL '1 year';
END;
$$ LANGUAGE plpgsql;