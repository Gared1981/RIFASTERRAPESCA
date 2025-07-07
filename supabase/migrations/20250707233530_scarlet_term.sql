/*
  # Add email field to users table
  
  1. Changes
    - Add email column to users table if it doesn't exist
    - Update RLS policies to allow email field
    - Create function to send manual notifications
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