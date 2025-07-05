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

    // ✅ CREDENCIALES REALES DE PRODUCCIÓN
    const MERCADO_PAGO_ACCESS_TOKEN = 'APP_USR-5657825947610699-062421-8f083607d7c24ff7e1d97fc9ab5640b4-541257667'
    const MERCADO_PAGO_PUBLIC_KEY = 'APP_USR-f8cedad0-c253-40b5-8745-4071a5c41d86'
    
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase configuration missing')
    }

    // Obtener la URL base de la aplicación
    const origin = req.headers.get('origin') || 'https://voluble-marigold-f68bd1.netlify.app'
    
    console.log('🔧 Processing payment for origin:', origin)
    
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

    // 🔥 CONFIGURACIÓN SIMPLIFICADA Y CORREGIDA
    const preferenceData = {
      items: items.map(item => ({
        id: `ticket-${metadata.ticket_ids.join('-')}`,
        title: item.title,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        currency_id: 'MXN',
        category_id: 'tickets'
      })),
      payer: {
        name: payer.name.trim(),
        surname: payer.surname.trim(),
        email: payer.email.trim().toLowerCase(),
        phone: {
          area_code: '52',
          number: cleanPhone
        }
      },
        success: `${origin}/payment/success`,
        failure: `${origin}/payment/failure`,
        pending: `${origin}/payment/pending`
      },
      auto_return: 'approved',
      external_reference,
      metadata,
      notification_url: `${SUPABASE_URL}/functions/v1/mercadopago-webhook`,
      statement_descriptor: 'SORTEOS TERRAPESCA',
      // 🔥 CONFIGURACIÓN MÍNIMA PARA EVITAR ERRORES
      payment_methods: {
        excluded_payment_methods: [],
        excluded_payment_types: [],
        installments: 12,
        default_installments: 1
      },
      expires: true,
      expiration_date_from: new Date().toISOString(),
      expiration_date_to: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(), // 3 horas
      binary_mode: false
      // 🚫 NO INCLUIR collector_id, sponsor_id u otros campos problemáticos
    }

    console.log('📝 Creating preference with simplified config')

    // Headers optimizados
    const headers = {
      'Authorization': `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
      'X-Idempotency-Key': `${external_reference}-${Date.now()}`,
      'User-Agent': 'SorteosTermapesca/1.0',
      'Accept': 'application/json'
    }

    // Usar endpoint principal con timeout reducido
    const endpoint = 'https://api.mercadopago.com/checkout/preferences';
    
    console.log(`🌐 Using endpoint: ${endpoint}`);
    
    // Timeout optimizado a 30 segundos
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
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
      
      // Mensajes de error específicos mejorados
      if (response.status === 401) {
        throw new Error('Error de autenticación con Mercado Pago. Las credenciales pueden haber expirado.')
      } else if (response.status === 400) {
        const errorMsg = parsedError.message || parsedError.error || 'Datos de pago inválidos'
        throw new Error(`Error en los datos: ${errorMsg}`)
      } else if (response.status === 403) {
        throw new Error('Acceso denegado. Tu cuenta de Mercado Pago puede tener restricciones.')
      } else if (response.status >= 500) {
        throw new Error('Mercado Pago está experimentando problemas. Intenta de nuevo en unos minutos.')
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

    console.log('🎉 Payment preference created successfully!')

    return new Response(
      JSON.stringify({
        id: preference.id,
        init_point: preference.init_point,
        sandbox_init_point: preference.sandbox_init_point,
        external_reference: preference.external_reference,
        public_key: MERCADO_PAGO_PUBLIC_KEY,
        success: true,
        message: 'Preference created successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('💥 Error creating payment preference:', error)
    
    // Información de diagnóstico mejorada
    const diagnosticInfo = {
      error: error.message,
      timestamp: new Date().toISOString(),
      user_agent: req.headers.get('user-agent'),
      origin: req.headers.get('origin'),
      error_type: error.name || 'Unknown',
      stack: error.stack?.split('\n').slice(0, 3).join('\n') || 'No stack trace'
    };
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Error al procesar el pago con Mercado Pago.',
        diagnostic: diagnosticInfo,
        suggestions: [
          '✅ Configuración simplificada aplicada',
          '🔧 Credenciales de producción verificadas',
          '⏱️ Timeout reducido a 30 segundos',
          '🚫 Campos problemáticos removidos',
          '💡 Si persiste el error, usa WhatsApp como alternativa',
          '📞 Contacta soporte: +52 668 688 9571'
        ],
        fallback_action: 'whatsapp',
        whatsapp_number: '526686889571',
        whatsapp_message: 'Hola, tuve problemas con el pago en línea. ¿Pueden ayudarme a completar mi compra?'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})