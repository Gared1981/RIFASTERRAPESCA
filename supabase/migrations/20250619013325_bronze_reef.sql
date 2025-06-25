/*
  # Create Admin User for Terrapesca

  1. New User
    - Creates admin user with email and password authentication
    - Sets up proper authentication records
    - Ensures user can access admin panel

  2. Security
    - Uses secure password hashing
    - Creates proper auth.users and auth.identities records
    - Handles conflicts gracefully
*/

-- Create admin user in auth.users table
DO $$
DECLARE
    user_id uuid;
BEGIN
    -- Check if user already exists
    SELECT id INTO user_id FROM auth.users WHERE email = 'admin@terrapesca.com';
    
    -- If user doesn't exist, create it
    IF user_id IS NULL THEN
        user_id := gen_random_uuid();
        
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            confirmation_token,
            email_change,
            email_change_token_new,
            recovery_token
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            user_id,
            'authenticated',
            'authenticated',
            'admin@terrapesca.com',
            crypt('Terrapesca2025!', gen_salt('bf')),
            NOW(),
            NOW(),
            NOW(),
            '',
            '',
            '',
            ''
        );
        
        -- Create corresponding identity record
        INSERT INTO auth.identities (
            id,
            user_id,
            identity_data,
            provider,
            last_sign_in_at,
            created_at,
            updated_at
        ) VALUES (
            gen_random_uuid(),
            user_id,
            jsonb_build_object(
                'sub', user_id::text,
                'email', 'admin@terrapesca.com'
            ),
            'email',
            NOW(),
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'Admin user created successfully with email: admin@terrapesca.com';
    ELSE
        RAISE NOTICE 'Admin user already exists with email: admin@terrapesca.com';
    END IF;
END $$;