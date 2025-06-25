import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PaymentItem {
  title: string;
  description: string;
  quantity: number;
  unit_price: number;
  currency_id: string;
}

interface PaymentPayer {
  name: string;
  surname: string;
  email: string;
  phone: {
    area_code: string;
    number: string;
  };
}

interface PaymentMetadata {
  raffle_id: number;
  ticket_ids: number[];
  promoter_code?: string;
  user_phone: string;
  user_email: string;
  ticket_numbers: number[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { items, payer, external_reference, metadata }: {
      items: PaymentItem[];
      payer: PaymentPayer;
      external_reference: string;
      metadata: PaymentMetadata;
    } = await req.json()

    // ✅ CREDENCIALES CORRECTAS DE MERCADO PAGO
    const MERCADO_PAGO_ACCESS_TOKEN = 'APP_USR-5657825947610699-062421-8f083607d7c24ff7e1d97fc9ab5640b4-541257667'
    const MERCADO_PAGO_PUBLIC_KEY = 'APP_USR-f8cedad0-c253-40b5-8745-4071a5c41d86'
    const MERCADO_PAGO_CLIENT_ID = '5657825947610699'
    const MERCADO_PAGO_CLIENT_SECRET = '1cgKmFgyoRtvv4sW0wzR1otNpmI2uxzU'
    
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase configuration missing')
    }

    // Obtener la URL base de la aplicación
    const origin = req.headers.get('origin') || req.headers.get('referer')?.split('/').slice(0, 3).join('/') || 'https://sorteos-terrapesca.com'
    
    console.log('🔧 Processing payment for origin:', origin)
    console.log('🔑 Using Client ID:', MERCADO_PAGO_CLIENT_ID)
    
    // Crear cliente de Supabase para validaciones
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Validar que los boletos existan y estén disponibles/reservados
    const { data: tickets, error: ticketsError } = await supabase
      .from('tickets')
      .select('id, number, status, raffle_id')
      .in('id', metadata.ticket_ids)

    if (ticketsError) {
      throw new Error(`Error validating tickets: ${ticketsError.message}`)
    }

    if (!tickets || tickets.length !== metadata.ticket_ids.length) {
      throw new Error('Some tickets not found')
    }

    // Verificar que todos los boletos estén reservados
    const invalidTickets = tickets.filter(ticket => ticket.status !== 'reserved')
    if (invalidTickets.length > 0) {
      throw new Error(`Tickets not properly reserved: ${invalidTickets.map(t => t.number).join(', ')}`)
    }

    // Limpiar y validar datos del pagador
    const cleanPhone = payer.phone.number.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      throw new Error('Invalid phone number format')
    }

    // 🔥 CONFIGURACIÓN CORREGIDA SIN COLLECTOR_ID
    const preferenceData = {
      items: items.map(item => ({
        ...item,
        category_id: 'tickets',
        picture_url: 'https://cdn.shopify.com/s/files/1/0205/5752/9188/files/Logo-Terrapesca-01_205270e5-d546-4e33-a8d1-db0a91f1e554.png?v=1700262873'
      })),
      payer: {
        name: payer.name,
        surname: payer.surname,
        email: payer.email,
        phone: {
          area_code: '52',
          number: cleanPhone
        }
      },
      back_urls: {
        success: `${origin}/payment/success`,
        failure: `${origin}/payment/failure`,
        pending: `${origin}/payment/pending`
      },
      auto_return: 'approved',
      external_reference,
      metadata,
      notification_url: `${SUPABASE_URL}/functions/v1/mercadopago-webhook`,
      statement_descriptor: 'SORTEOS TERRAPESCA',
      // 🔥 CONFIGURACIÓN SIMPLIFICADA PARA MÉXICO
      payment_methods: {
        excluded_payment_methods: [],
        excluded_payment_types: [],
        installments: 12,
        default_installments: 1
      },
      expires: true,
      expiration_date_from: new Date().toISOString(),
      expiration_date_to: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(), // 3 horas
      binary_mode: false,
      // 🔥 SIN COLLECTOR_ID - ESTO CAUSABA EL ERROR
      // collector_id: parseInt(MERCADO_PAGO_CLIENT_ID) || null, // ❌ REMOVIDO
      sponsor_id: null
    }

    console.log('📝 Creating preference WITHOUT collector_id:', JSON.stringify(preferenceData, null, 2))

    // Headers simplificados
    const headers = {
      'Authorization': `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
      'X-Idempotency-Key': `${external_reference}-${Date.now()}`,
      'User-Agent': 'SorteosTermapesca/1.0 (Mexico)',
      'Accept': 'application/json'
    }

    // Usar solo el endpoint principal
    const endpoint = 'https://api.mercadopago.com/checkout/preferences';
    
    console.log(`🌐 Using endpoint: ${endpoint}`);
    
    // Timeout optimizado
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000); // 45 segundos
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(preferenceData),
      signal: controller.signal
    })

    clearTimeout(timeoutId);

    console.log(`📊 Response status: ${response.status}`);

    if (!response.ok) {
      const errorData = await response.text()
      console.error(`❌ Error from API:`, errorData)
      
      // Intentar parsear el error como JSON
      let parsedError;
      try {
        parsedError = JSON.parse(errorData);
      } catch {
        parsedError = { message: errorData };
      }
      
      // Mensajes de error específicos
      if (response.status === 401) {
        throw new Error('Error de autenticación. Verifica las credenciales de Mercado Pago.')
      } else if (response.status === 400) {
        const errorMsg = parsedError.message || parsedError.error || 'Datos de pago inválidos'
        throw new Error(`Datos inválidos: ${errorMsg}`)
      } else if (response.status === 403) {
        throw new Error('Acceso denegado. Verifica los permisos de tu cuenta de Mercado Pago.')
      } else if (response.status >= 500) {
        throw new Error('Error del servidor de Mercado Pago. Intenta de nuevo en unos minutos.')
      } else {
        throw new Error(`Error HTTP ${response.status}: ${parsedError.message || errorData}`)
      }
    }

    const preference = await response.json()
    console.log('✅ Preference created successfully:', preference.id)

    // Registrar la preferencia en la base de datos para tracking
    const { error: logError } = await supabase
      .from('payment_logs')
      .insert({
        preference_id: preference.id,
        external_reference,
        ticket_ids: metadata.ticket_ids,
        amount: items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0),
        status: 'created',
        metadata: metadata
      })

    if (logError) {
      console.error('⚠️ Error logging payment preference:', logError)
    }

    console.log('🎉 Payment preference created successfully WITHOUT collector_id!')

    return new Response(
      JSON.stringify({
        id: preference.id,
        init_point: preference.init_point,
        sandbox_init_point: preference.sandbox_init_point,
        external_reference: preference.external_reference,
        client_id: MERCADO_PAGO_CLIENT_ID,
        public_key: MERCADO_PAGO_PUBLIC_KEY,
        success: true,
        message: 'Preference created successfully without collector_id'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('💥 Error creating payment preference:', error)
    
    // Información de diagnóstico detallada
    const diagnosticInfo = {
      error: error.message,
      timestamp: new Date().toISOString(),
      user_agent: req.headers.get('user-agent'),
      origin: req.headers.get('origin'),
      referer: req.headers.get('referer'),
      ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
      credentials_used: 'PRODUCTION_REAL_CREDENTIALS_NO_COLLECTOR_ID'
    };
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Error al crear la preferencia de pago (collector_id corregido).',
        diagnostic: diagnosticInfo,
        suggestions: [
          'Se removió el collector_id que causaba el error',
          'Las credenciales de producción están configuradas correctamente',
          'Verifica que tu cuenta de Mercado Pago esté activa y verificada',
          'Asegúrate de que no haya restricciones en tu cuenta',
          'Verifica tu conexión a internet',
          'Si el problema persiste, contacta a Mercado Pago',
          'Como alternativa, usa WhatsApp para coordinar el pago'
        ],
        fallback_action: 'whatsapp',
        whatsapp_number: '526686889571'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})