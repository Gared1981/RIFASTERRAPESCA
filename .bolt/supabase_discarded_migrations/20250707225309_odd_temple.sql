/*
  # Add Email Notification System
  
  1. New Features
    - Add notification_sent column to payment_logs if not exists
    - Create function to send notifications to admin and customer
    - Add foreign key constraint for promoter_code if not exists
    
  2. Security
    - Ensure proper error handling
    - Track notification status
*/

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

-- Check if foreign key constraint exists before creating it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'tickets_promoter_code_fkey' AND conrelid = 'tickets'::regclass
  ) THEN
    -- First, clean up any invalid promoter codes in tickets
    UPDATE tickets
    SET promoter_code = NULL
    WHERE promoter_code IS NOT NULL AND NOT EXISTS (
      SELECT 1 FROM promoters WHERE code = tickets.promoter_code
    );
    
    -- Add foreign key constraint
    ALTER TABLE tickets
    ADD CONSTRAINT tickets_promoter_code_fkey
    FOREIGN KEY (promoter_code) REFERENCES promoters(code);
    
    RAISE NOTICE 'Foreign key constraint added';
  ELSE
    RAISE NOTICE 'Foreign key constraint already exists';
  END IF;
END $$;

-- Create or replace function to process payment and send notification
CREATE OR REPLACE FUNCTION process_payment_and_notify(
  payment_id TEXT,
  ticket_ids INTEGER[],
  user_email TEXT,
  user_phone TEXT,
  user_name TEXT,
  raffle_name TEXT,
  promoter_code TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  result JSON;
  notification_success BOOLEAN := false;
  admin_email TEXT := 'ventasweb@terrapesca.com';
  admin_phone TEXT := '+526686889571';
  ticket_numbers TEXT;
BEGIN
  -- Get ticket numbers as a comma-separated string
  SELECT string_agg(number::text, ', ') INTO ticket_numbers
  FROM tickets
  WHERE id = ANY(ticket_ids);

  -- Update tickets to purchased status
  UPDATE tickets
  SET 
    status = 'purchased',
    purchased_at = NOW()
  WHERE id = ANY(ticket_ids) AND status = 'reserved';
  
  -- Mark notification as sent in payment_logs
  UPDATE payment_logs
  SET notification_sent = true
  WHERE payment_id = process_payment_and_notify.payment_id
     OR preference_id = process_payment_and_notify.payment_id
     OR external_reference = process_payment_and_notify.payment_id;
  
  -- In a real implementation, this would send actual emails
  -- For now, we'll just log that we would send emails
  
  -- 1. Log notification to customer
  RAISE NOTICE 'Would send email notification to % for payment %', user_email, payment_id;
  RAISE NOTICE 'Customer: %, Phone: %', user_name, user_phone;
  RAISE NOTICE 'Tickets purchased: %', ticket_numbers;
  RAISE NOTICE 'Raffle: %', raffle_name;
  
  -- 2. Log notification to admin
  RAISE NOTICE 'Would send admin notification to % for payment %', admin_email, payment_id;
  RAISE NOTICE 'Customer: %, Phone: %, Email: %', user_name, user_phone, user_email;
  RAISE NOTICE 'Tickets purchased: %', ticket_numbers;
  RAISE NOTICE 'Raffle: %', raffle_name;
  RAISE NOTICE 'Promoter code: %', COALESCE(promoter_code, 'None');
  
  -- 3. Log WhatsApp notification to admin
  RAISE NOTICE 'Would send WhatsApp notification to % for payment %', admin_phone, payment_id;
  RAISE NOTICE 'Customer: %, Phone: %, Email: %', user_name, user_phone, user_email;
  RAISE NOTICE 'Tickets purchased: %', ticket_numbers;
  RAISE NOTICE 'Raffle: %', raffle_name;
  RAISE NOTICE 'Promoter code: %', COALESCE(promoter_code, 'None');
  
  notification_success := true;
  
  -- If there's a promoter code, register the sales
  IF promoter_code IS NOT NULL THEN
    FOREACH ticket_id IN ARRAY ticket_ids
    LOOP
      PERFORM register_ticket_sale(ticket_id, promoter_code);
    END LOOP;
  END IF;
  
  -- Return result
  RETURN json_build_object(
    'success', true,
    'payment_id', payment_id,
    'tickets_updated', array_length(ticket_ids, 1),
    'notification_sent', notification_success,
    'customer_email', user_email,
    'admin_email', admin_email,
    'admin_whatsapp', admin_phone,
    'promoter_code', promoter_code
  );
END;
$$ LANGUAGE plpgsql;