/*
  # Add email field to users table

  1. Changes
    - Add email column to users table
    - Update existing functions to support email notifications
    - Add notification tracking to payment_logs
    
  2. Security
    - Maintain existing RLS policies
    - Ensure email field is properly protected
*/

-- Add email column to users table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'email'
  ) THEN
    ALTER TABLE users ADD COLUMN email TEXT;
    RAISE NOTICE 'Added email column to users table';
  ELSE
    RAISE NOTICE 'Email column already exists in users table';
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

-- Create or replace function to send manual notification for a ticket
CREATE OR REPLACE FUNCTION send_manual_notification(
  p_ticket_id INTEGER,
  p_notification_type TEXT
)
RETURNS JSON AS $$
DECLARE
  ticket_record RECORD;
  user_record RECORD;
  raffle_record RECORD;
  result JSON;
BEGIN
  -- Get ticket information
  SELECT * INTO ticket_record FROM tickets WHERE id = p_ticket_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Ticket not found',
      'ticket_id', p_ticket_id
    );
  END IF;
  
  -- Get user information
  SELECT * INTO user_record FROM users WHERE id = ticket_record.user_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'User not found for this ticket',
      'ticket_id', p_ticket_id
    );
  END IF;
  
  -- Get raffle information
  SELECT * INTO raffle_record FROM raffles WHERE id = ticket_record.raffle_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Raffle not found for this ticket',
      'ticket_id', p_ticket_id
    );
  END IF;
  
  -- Log notification details
  IF p_notification_type = 'email' THEN
    RAISE NOTICE 'Would send email to % for ticket %', user_record.email, ticket_record.number;
    RAISE NOTICE 'User: % %', user_record.first_name, user_record.last_name;
    RAISE NOTICE 'Raffle: %', raffle_record.name;
  ELSIF p_notification_type = 'whatsapp' THEN
    RAISE NOTICE 'Would send WhatsApp to % for ticket %', user_record.phone, ticket_record.number;
    RAISE NOTICE 'User: % %', user_record.first_name, user_record.last_name;
    RAISE NOTICE 'Raffle: %', raffle_record.name;
  ELSE
    RETURN json_build_object(
      'success', false,
      'error', 'Invalid notification type',
      'notification_type', p_notification_type
    );
  END IF;
  
  -- Return success
  RETURN json_build_object(
    'success', true,
    'message', format('Manual %s notification would be sent', p_notification_type),
    'ticket_id', p_ticket_id,
    'ticket_number', ticket_record.number,
    'user_name', format('%s %s', user_record.first_name, user_record.last_name),
    'user_email', user_record.email,
    'user_phone', user_record.phone,
    'raffle_name', raffle_record.name
  );
END;
$$ LANGUAGE plpgsql;

-- Create or replace function to resend notifications for purchased tickets
CREATE OR REPLACE FUNCTION resend_purchase_notifications()
RETURNS JSON AS $$
DECLARE
  purchased_count INTEGER;
  notified_count INTEGER;
  result JSON;
BEGIN
  -- Count purchased tickets
  SELECT COUNT(*) INTO purchased_count 
  FROM tickets 
  WHERE status = 'purchased';
  
  -- Count tickets with notifications sent
  SELECT COUNT(*) INTO notified_count 
  FROM payment_logs 
  WHERE notification_sent = true;
  
  -- Log notification details
  RAISE NOTICE 'Total purchased tickets: %', purchased_count;
  RAISE NOTICE 'Tickets with notifications sent: %', notified_count;
  RAISE NOTICE 'Tickets needing notifications: %', purchased_count - notified_count;
  
  -- Return statistics
  RETURN json_build_object(
    'success', true,
    'total_purchased', purchased_count,
    'notifications_sent', notified_count,
    'notifications_needed', purchased_count - notified_count,
    'timestamp', now()
  );
END;
$$ LANGUAGE plpgsql;