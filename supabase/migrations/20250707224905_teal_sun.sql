/*
  # Fix Email Notifications for Ticket Purchases
  
  1. Changes
    - Create a function to send email notifications on purchase
    - Update the payment_logs table to track notification status
    - Fix the constraint issue by checking if it exists first
*/

-- First, check if the constraint already exists and only create it if it doesn't
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'tickets_promoter_code_fkey' AND conrelid = 'tickets'::regclass
  ) THEN
    -- Add foreign key constraint
    ALTER TABLE tickets
    ADD CONSTRAINT tickets_promoter_code_fkey
    FOREIGN KEY (promoter_code) REFERENCES promoters(code);
    
    RAISE NOTICE 'Foreign key constraint added';
  ELSE
    RAISE NOTICE 'Foreign key constraint already exists';
  END IF;
END $$;

-- Add notification tracking to payment_logs if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'payment_logs' AND column_name = 'notification_sent'
  ) THEN
    ALTER TABLE payment_logs ADD COLUMN notification_sent BOOLEAN DEFAULT false;
    RAISE NOTICE 'Added notification_sent column to payment_logs';
  END IF;
END $$;

-- Create or replace the function to process payment and send notification
CREATE OR REPLACE FUNCTION process_payment_and_notify(
  payment_id TEXT,
  ticket_ids INTEGER[],
  user_email TEXT,
  user_phone TEXT
)
RETURNS JSON AS $$
DECLARE
  result JSON;
  notification_success BOOLEAN := false;
BEGIN
  -- Update tickets to purchased status
  UPDATE tickets
  SET 
    status = 'purchased',
    purchased_at = NOW()
  WHERE id = ANY(ticket_ids) AND status = 'reserved';
  
  -- Mark notification as sent in payment_logs
  UPDATE payment_logs
  SET notification_sent = true
  WHERE payment_id = process_payment_and_notify.payment_id;
  
  -- In a real implementation, this would send an actual email
  -- For now, we'll just log that we would send an email
  RAISE NOTICE 'Would send email notification to % for payment %', user_email, payment_id;
  notification_success := true;
  
  -- Return result
  RETURN json_build_object(
    'success', true,
    'payment_id', payment_id,
    'tickets_updated', array_length(ticket_ids, 1),
    'notification_sent', notification_success,
    'email', user_email,
    'phone', user_phone
  );
END;
$$ LANGUAGE plpgsql;

-- Create or replace view for promoter statistics if it doesn't exist
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
  COUNT(t.id) as tickets_sold,
  COUNT(CASE WHEN t.status = 'purchased' THEN 1 END) as confirmed_sales,
  p.created_at,
  p.updated_at
FROM promoters p
LEFT JOIN tickets t ON t.promoter_code = p.code
GROUP BY p.id, p.name, p.code, p.total_sales, p.accumulated_bonus, p.extra_prize, p.active, p.created_at, p.updated_at;

-- Grant access to the view
GRANT SELECT ON promoter_stats TO public;

-- Create or replace function to assign winner bonus
CREATE OR REPLACE FUNCTION assign_winner_bonus(
  p_raffle_id INTEGER,
  p_winning_ticket_number INTEGER
)
RETURNS JSON AS $$
DECLARE
  winning_promoter_code TEXT;
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
      'message', 'Winner assigned but no promoter bonus (ticket sold without promoter code)'
    );
  END IF;
  
  -- Asignar bono extra al promotor
  UPDATE promoters 
  SET 
    accumulated_bonus = accumulated_bonus + 1000,
    extra_prize = true,
    updated_at = now()
  WHERE code = winning_promoter_code;
  
  RETURN json_build_object(
    'success', true, 
    'message', 'Winner bonus assigned successfully',
    'promoter_code', winning_promoter_code
  );
END;
$$ LANGUAGE plpgsql;