/*
  # Fix Migration Errors

  1. Security Policies
    - Replace invalid uid() function with auth.uid()
    - Update all RLS policies to use correct authentication function
  
  2. SQL Syntax Fixes
    - Fix LIMIT usage within array_agg function
    - Use subquery approach for limited aggregation
  
  3. Function Updates
    - Ensure all functions use proper Supabase auth functions
    - Update any remaining uid() references
*/

-- First, let's fix any existing policies that use uid() instead of auth.uid()

-- Fix raffles table policies
DROP POLICY IF EXISTS "Allow authenticated users to manage raffles" ON raffles;
DROP POLICY IF EXISTS "raffle_authenticated_management_v2" ON raffles;

CREATE POLICY "Allow authenticated users to manage raffles"
  ON raffles
  FOR ALL
  TO public
  USING (
    auth.uid() IS NOT NULL OR 
    role() = 'authenticated'::text OR 
    current_setting('role'::text, true) = 'authenticated'::text OR 
    SESSION_USER = 'authenticated'::name
  )
  WITH CHECK (
    auth.uid() IS NOT NULL OR 
    role() = 'authenticated'::text OR 
    current_setting('role'::text, true) = 'authenticated'::text OR 
    SESSION_USER = 'authenticated'::name
  );

-- Fix promoters table policies
DROP POLICY IF EXISTS "Allow authenticated users to manage promoters" ON promoters;

CREATE POLICY "Allow authenticated users to manage promoters"
  ON promoters
  FOR ALL
  TO public
  USING (
    auth.uid() IS NOT NULL OR 
    role() = 'authenticated'::text OR 
    current_setting('role'::text, true) = 'authenticated'::text
  )
  WITH CHECK (
    auth.uid() IS NOT NULL OR 
    role() = 'authenticated'::text OR 
    current_setting('role'::text, true) = 'authenticated'::text
  );

-- Fix users table policies
DROP POLICY IF EXISTS "Users can update own data" ON users;

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO public
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create or replace function to check raffle permissions with correct auth
CREATE OR REPLACE FUNCTION check_raffle_permissions()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is authenticated using proper auth function
  IF auth.uid() IS NOT NULL THEN
    RETURN true;
  END IF;
  
  -- Check role-based authentication
  IF role() = 'authenticated'::text OR 
     current_setting('role'::text, true) = 'authenticated'::text OR
     SESSION_USER = 'authenticated'::name THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- Create or replace admin update function with proper auth checks
CREATE OR REPLACE FUNCTION admin_update_raffle(
  raffle_id integer,
  update_data jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result jsonb;
  sample_codes text[];
BEGIN
  -- Check authentication using proper function
  IF NOT (
    auth.uid() IS NOT NULL OR 
    role() = 'authenticated'::text OR 
    current_setting('role'::text, true) = 'authenticated'::text OR
    SESSION_USER = 'authenticated'::name
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Authentication required'
    );
  END IF;

  -- Get sample promoter codes using corrected syntax
  SELECT array_agg(code) INTO sample_codes
  FROM (
    SELECT code
    FROM promoters
    WHERE active = true
    ORDER BY code
    LIMIT 5
  ) AS limited_promoters;

  -- Update the raffle
  UPDATE raffles 
  SET 
    name = COALESCE((update_data->>'name')::text, name),
    description = COALESCE((update_data->>'description')::text, description),
    image_url = COALESCE((update_data->>'image_url')::text, image_url),
    video_url = CASE 
      WHEN update_data ? 'video_url' THEN (update_data->>'video_url')::text
      ELSE video_url
    END,
    price = COALESCE((update_data->>'price')::numeric, price),
    draw_date = COALESCE((update_data->>'draw_date')::timestamptz, draw_date),
    total_tickets = COALESCE((update_data->>'total_tickets')::integer, total_tickets),
    status = COALESCE((update_data->>'status')::text, status),
    images = COALESCE(
      CASE 
        WHEN update_data ? 'images' THEN 
          ARRAY(SELECT jsonb_array_elements_text(update_data->'images'))
        ELSE images
      END, 
      images
    ),
    video_urls = COALESCE(
      CASE 
        WHEN update_data ? 'video_urls' THEN 
          ARRAY(SELECT jsonb_array_elements_text(update_data->'video_urls'))
        ELSE video_urls
      END, 
      video_urls
    ),
    prize_items = COALESCE(
      CASE 
        WHEN update_data ? 'prize_items' THEN 
          ARRAY(SELECT jsonb_array_elements_text(update_data->'prize_items'))
        ELSE prize_items
      END, 
      prize_items
    ),
    updated_at = now()
  WHERE id = raffle_id;

  -- Check if update was successful
  IF FOUND THEN
    result := jsonb_build_object(
      'success', true,
      'message', 'Raffle updated successfully',
      'sample_codes', array_to_json(sample_codes)
    );
  ELSE
    result := jsonb_build_object(
      'success', false,
      'error', 'Raffle not found or no changes made'
    );
  END IF;

  RETURN result;
END;
$$;

-- Create or replace cleanup function with proper auth
CREATE OR REPLACE FUNCTION admin_cleanup_expired_tickets()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  released_count integer := 0;
BEGIN
  -- Check authentication
  IF NOT (
    auth.uid() IS NOT NULL OR 
    role() = 'authenticated'::text OR 
    current_setting('role'::text, true) = 'authenticated'::text
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Authentication required',
      'released_count', 0
    );
  END IF;

  -- Release expired tickets (older than 3 hours)
  UPDATE tickets 
  SET 
    status = 'available',
    user_id = NULL,
    reserved_at = NULL,
    promoter_code = NULL
  WHERE 
    status = 'reserved' 
    AND reserved_at < (now() - interval '3 hours');
    
  GET DIAGNOSTICS released_count = ROW_COUNT;
  
  RETURN jsonb_build_object(
    'success', true,
    'released_count', released_count,
    'message', format('Released %s expired tickets', released_count)
  );
END;
$$;

-- Update any other functions that might use uid()
CREATE OR REPLACE FUNCTION auto_cleanup_tickets()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  released_count integer := 0;
BEGIN
  -- Release expired reserved tickets (older than 3 hours)
  UPDATE tickets 
  SET 
    status = 'available',
    user_id = NULL,
    reserved_at = NULL,
    promoter_code = NULL
  WHERE 
    status = 'reserved' 
    AND reserved_at < (now() - interval '3 hours');
    
  GET DIAGNOSTICS released_count = ROW_COUNT;
  
  RETURN released_count;
END;
$$;

-- Ensure all tables have proper RLS enabled
ALTER TABLE raffles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE promoters ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_logs ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Create index for better performance on auth queries
CREATE INDEX IF NOT EXISTS idx_tickets_user_auth ON tickets(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tickets_reserved_cleanup ON tickets(reserved_at) WHERE status = 'reserved';