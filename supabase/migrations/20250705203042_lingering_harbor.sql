/*
  # Verificar y corregir credenciales de administrador

  1. Verificar usuario existente
  2. Actualizar credenciales si es necesario
  3. Crear usuario si no existe
  4. Asegurar configuración correcta
*/

-- Función para verificar y crear/actualizar usuario admin
DO $$
DECLARE
    admin_user_id uuid;
    user_exists boolean := false;
BEGIN
    -- Verificar si el usuario admin ya existe
    SELECT id INTO admin_user_id 
    FROM auth.users 
    WHERE email = 'admin@terrapesca.com';
    
    IF admin_user_id IS NOT NULL THEN
        user_exists := true;
        RAISE NOTICE 'Usuario admin encontrado con ID: %', admin_user_id;
        
        -- Actualizar la contraseña del usuario existente
        UPDATE auth.users 
        SET 
            encrypted_password = crypt('Terrapesca2025!', gen_salt('bf')),
            email_confirmed_at = NOW(),
            updated_at = NOW(),
            raw_app_meta_data = '{"provider": "email", "providers": ["email"]}',
            raw_user_meta_data = '{}',
            is_super_admin = false,
            role = 'authenticated',
            aud = 'authenticated'
        WHERE id = admin_user_id;
        
        -- Actualizar la identidad correspondiente
        UPDATE auth.identities 
        SET 
            identity_data = jsonb_build_object(
                'sub', admin_user_id::text,
                'email', 'admin@terrapesca.com',
                'email_verified', true,
                'phone_verified', false
            ),
            last_sign_in_at = NOW(),
            updated_at = NOW()
        WHERE user_id = admin_user_id AND provider = 'email';
        
        RAISE NOTICE 'Credenciales del usuario admin actualizadas exitosamente';
    ELSE
        -- Crear nuevo usuario admin
        admin_user_id := gen_random_uuid();
        
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            invited_at,
            confirmation_token,
            confirmation_sent_at,
            recovery_token,
            recovery_sent_at,
            email_change_token_new,
            email_change,
            email_change_sent_at,
            last_sign_in_at,
            raw_app_meta_data,
            raw_user_meta_data,
            is_super_admin,
            created_at,
            updated_at,
            phone,
            phone_confirmed_at,
            phone_change,
            phone_change_token,
            phone_change_sent_at,
            email_change_token_current,
            email_change_confirm_status,
            banned_until,
            reauthentication_token,
            reauthentication_sent_at,
            is_sso_user,
            deleted_at
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            admin_user_id,
            'authenticated',
            'authenticated',
            'admin@terrapesca.com',
            crypt('Terrapesca2025!', gen_salt('bf')),
            NOW(),
            NULL,
            '',
            NULL,
            '',
            NULL,
            '',
            '',
            NULL,
            NULL,
            '{"provider": "email", "providers": ["email"]}',
            '{}',
            false,
            NOW(),
            NOW(),
            NULL,
            NULL,
            '',
            '',
            NULL,
            '',
            0,
            NULL,
            '',
            NULL,
            false,
            NULL
        );
        
        -- Crear identidad correspondiente
        INSERT INTO auth.identities (
            provider_id,
            user_id,
            identity_data,
            provider,
            last_sign_in_at,
            created_at,
            updated_at,
            email,
            id
        ) VALUES (
            admin_user_id::text,
            admin_user_id,
            jsonb_build_object(
                'sub', admin_user_id::text,
                'email', 'admin@terrapesca.com',
                'email_verified', true,
                'phone_verified', false
            ),
            'email',
            NOW(),
            NOW(),
            NOW(),
            'admin@terrapesca.com',
            gen_random_uuid()
        );
        
        RAISE NOTICE 'Usuario admin creado exitosamente con ID: %', admin_user_id;
    END IF;
    
    -- Verificar que el usuario puede autenticarse
    RAISE NOTICE 'Credenciales de acceso:';
    RAISE NOTICE 'Email: admin@terrapesca.com';
    RAISE NOTICE 'Password: Terrapesca2025!';
    RAISE NOTICE 'Usuario ID: %', admin_user_id;
    
END $$;

-- Función para verificar el estado del usuario admin
CREATE OR REPLACE FUNCTION check_admin_user_status()
RETURNS JSON AS $$
DECLARE
    user_info RECORD;
    identity_info RECORD;
    result JSON;
BEGIN
    -- Obtener información del usuario
    SELECT 
        id,
        email,
        email_confirmed_at,
        created_at,
        updated_at,
        role,
        aud,
        raw_app_meta_data,
        last_sign_in_at
    INTO user_info
    FROM auth.users 
    WHERE email = 'admin@terrapesca.com';
    
    -- Obtener información de la identidad
    SELECT 
        provider,
        identity_data,
        last_sign_in_at as identity_last_sign_in,
        created_at as identity_created_at
    INTO identity_info
    FROM auth.identities 
    WHERE user_id = user_info.id AND provider = 'email';
    
    -- Construir respuesta
    result := json_build_object(
        'user_exists', user_info.id IS NOT NULL,
        'user_id', user_info.id,
        'email', user_info.email,
        'email_confirmed', user_info.email_confirmed_at IS NOT NULL,
        'role', user_info.role,
        'aud', user_info.aud,
        'last_sign_in', user_info.last_sign_in_at,
        'user_created_at', user_info.created_at,
        'user_updated_at', user_info.updated_at,
        'identity_exists', identity_info.provider IS NOT NULL,
        'identity_provider', identity_info.provider,
        'identity_last_sign_in', identity_info.identity_last_sign_in,
        'identity_created_at', identity_info.identity_created_at,
        'check_time', NOW()
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ejecutar verificación del estado
SELECT check_admin_user_status();