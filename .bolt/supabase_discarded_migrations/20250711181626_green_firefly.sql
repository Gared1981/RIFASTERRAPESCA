/*
  # Fix role() function error in Supabase migration

  1. Security Updates
    - Replace role() with current_setting('role', true) in all policies
    - Ensure compatibility with Supabase authentication system
    - Maintain proper RLS security

  2. Function Updates
    - Update all functions that use role() validation
    - Ensure proper authentication checks
    - Maintain backward compatibility
*/

-- Drop existing policies that use role() function
DROP POLICY IF EXISTS "Allow authenticated users to manage promoters" ON promoters;
DROP POLICY IF EXISTS "Allow authenticated users to manage raffles" ON raffles;
DROP POLICY IF EXISTS "raffle_authenticated_management_v2" ON raffles;
DROP POLICY IF EXISTS "Allow authenticated users to insert tickets" ON tickets;
DROP POLICY IF EXISTS "Allow authenticated users to update tickets" ON tickets;

-- Recreate policies with corrected role() function
CREATE POLICY "Allow authenticated users to manage promoters" ON promoters
FOR ALL TO public
USING (
  (auth.uid() IS NOT NULL) OR 
  (current_setting('role', true) = 'authenticated') OR 
  (SESSION_USER = 'authenticated'::name)
)
WITH CHECK (
  (auth.uid() IS NOT NULL) OR 
  (current_setting('role', true) = 'authenticated') OR 
  (SESSION_USER = 'authenticated'::name)
);

CREATE POLICY "Allow authenticated users to manage raffles" ON raffles
FOR ALL TO public
USING (
  (auth.uid() IS NOT NULL) OR 
  (current_setting('role', true) = 'authenticated') OR 
  (SESSION_USER = 'authenticated'::name)
)
WITH CHECK (
  (auth.uid() IS NOT NULL) OR 
  (current_setting('role', true) = 'authenticated') OR 
  (SESSION_USER = 'authenticated'::name)
);

CREATE POLICY "raffle_authenticated_management_v2" ON raffles
FOR ALL TO public
USING (
  (auth.uid() IS NOT NULL) OR 
  (current_setting('role', true) = 'authenticated') OR 
  (SESSION_USER = 'authenticated'::name)
)
WITH CHECK (
  (auth.uid() IS NOT NULL) OR 
  (current_setting('role', true) = 'authenticated') OR 
  (SESSION_USER = 'authenticated'::name)
);

CREATE POLICY "Allow authenticated users to insert tickets" ON tickets
FOR INSERT TO public
WITH CHECK (current_setting('role', true) = 'authenticated');

CREATE POLICY "Allow authenticated users to update tickets" ON tickets
FOR UPDATE TO public
USING (current_setting('role', true) = 'authenticated');

-- Update check_raffle_permissions function
CREATE OR REPLACE FUNCTION check_raffle_permissions()
RETURNS TABLE(
  has_auth_uid boolean,
  current_role text,
  session_user text,
  can_manage boolean
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    auth.uid() IS NOT NULL as has_auth_uid,
    current_setting('role', true) as current_role,
    SESSION_USER::text as session_user,
    (
      auth.uid() IS NOT NULL OR 
      current_setting('role', true) = 'authenticated' OR 
      SESSION_USER = 'authenticated'::name
    ) as can_manage;
END;
$$;

-- Update admin_update_raffle function with corrected role check
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
  -- Check authentication using corrected role function
  IF NOT (
    auth.uid() IS NOT NULL OR 
    current_setting('role', true) = 'authenticated' OR 
    SESSION_USER = 'authenticated'::name
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Unauthorized: Authentication required'
    );
  END IF;

  -- Get sample promoter codes (corrected syntax)
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
    video_url = COALESCE((update_data->>'video_url')::text, video_url),
    price = COALESCE((update_data->>'price')::numeric, price),
    draw_date = COALESCE((update_data->>'draw_date')::timestamptz, draw_date),
    total_tickets = COALESCE((update_data->>'total_tickets')::integer, total_tickets),
    status = COALESCE((update_data->>'status')::text, status),
    images = COALESCE((update_data->>'images')::text[], images),
    video_urls = COALESCE((update_data->>'video_urls')::text[], video_urls),
    prize_items = COALESCE((update_data->>'prize_items')::text[], prize_items),
    updated_at = now()
  WHERE id = raffle_id;

  -- Check if update was successful
  IF FOUND THEN
    result := jsonb_build_object(
      'success', true,
      'message', 'Raffle updated successfully',
      'raffle_id', raffle_id,
      'sample_codes', sample_codes,
      'updated_at', now()
    );
  ELSE
    result := jsonb_build_object(
      'success', false,
      'error', 'Raffle not found or no changes made',
      'raffle_id', raffle_id
    );
  END IF;

  RETURN result;
END;
$$;

-- Update admin_cleanup_expired_tickets function
CREATE OR REPLACE FUNCTION admin_cleanup_expired_tickets()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  released_count integer := 0;
BEGIN
  -- Check authentication using corrected role function
  IF NOT (
    auth.uid() IS NOT NULL OR 
    current_setting('role', true) = 'authenticated' OR 
    SESSION_USER = 'authenticated'::name
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Unauthorized: Authentication required',
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
    'cleanup_time', now()
  );
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION check_raffle_permissions() TO public;
GRANT EXECUTE ON FUNCTION admin_update_raffle(integer, jsonb) TO public;
GRANT EXECUTE ON FUNCTION admin_cleanup_expired_tickets() TO public;

-- Ensure RLS is enabled on all tables
ALTER TABLE promoters ENABLE ROW LEVEL SECURITY;
ALTER TABLE raffles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_logs ENABLE ROW LEVEL SECURITY;

-- Add helpful indexes for performance
CREATE INDEX IF NOT EXISTS idx_tickets_status_reserved_at ON tickets(status, reserved_at) WHERE status = 'reserved';
CREATE INDEX IF NOT EXISTS idx_promoters_active_code ON promoters(active, code) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_raffles_status ON raffles(status);