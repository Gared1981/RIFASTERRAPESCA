import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Usar las credenciales de producción proporcionadas
    const MERCADO_PAGO_ACCESS_TOKEN = 'APP_USR-5657825947610699-062421-8f083607d7c24ff7e1d97fc9ab5640b4-541257667'

    const body = await req.json()
    console.log('Webhook received:', JSON.stringify(body, null, 2))

    // Verificar que es una notificación de pago
    if (body.type === 'payment') {
      const paymentId = body.data.id

      // Obtener información del pago desde Mercado Pago
      const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      })

      if (!paymentResponse.ok) {
        const errorText = await paymentResponse.text()
        console.error('Failed to fetch payment data:', errorText)
        throw new Error(`Failed to fetch payment data: ${paymentResponse.status}`)
      }

      const paymentData = await paymentResponse.json()
      console.log('Payment data received:', JSON.stringify(paymentData, null, 2))

      // Actualizar o insertar el log del pago
      const { error: logError } = await supabaseClient
        .from('payment_logs')
        .upsert({
          payment_id: paymentData.id,
          preference_id: paymentData.preference_id,
          external_reference: paymentData.external_reference,
          status: paymentData.status,
          status_detail: paymentData.status_detail,
          amount: paymentData.transaction_amount,
          metadata: paymentData.metadata,
          webhook_data: paymentData,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'payment_id'
        })

      if (logError) {
        console.error('Error logging webhook:', logError)
      }

      // Procesar el pago según su estado
      if (paymentData.status === 'approved') {
        console.log('Processing approved payment...')
        
        const metadata = paymentData.metadata
        if (metadata && metadata.ticket_ids) {
          const ticketIds = Array.isArray(metadata.ticket_ids) 
            ? metadata.ticket_ids 
            : [metadata.ticket_ids]

          // Actualizar estado de los boletos a "purchased"
          const { error: updateError } = await supabaseClient
            .from('tickets')
            .update({
              status: 'purchased',
              purchased_at: new Date().toISOString()
            })
            .in('id', ticketIds)

          if (updateError) {
            console.error('Error updating tickets:', updateError)
            throw updateError
          }

          console.log(`Tickets updated to purchased: ${ticketIds.join(', ')}`)

          // Si hay código de promotor, registrar la venta
          if (metadata.promoter_code) {
            console.log(`Registering sales for promoter: ${metadata.promoter_code}`)
            
            for (const ticketId of ticketIds) {
              try {
                const { data: saleResult, error: saleError } = await supabaseClient
                  .rpc('register_ticket_sale', {
                    p_ticket_id: ticketId,
                    p_promoter_code: metadata.promoter_code
                  })

                if (saleError) {
                  console.error('Error registering promoter sale:', saleError)
                } else {
                  console.log('Sale registered for promoter:', saleResult)
                }
              } catch (saleErr) {
                console.error('Exception registering promoter sale:', saleErr)
              }
            }
          }

          // Log successful processing
          console.log(`Payment ${paymentData.id} processed successfully for tickets: ${metadata.ticket_numbers?.join(', ')}`)
        }
      } else if (paymentData.status === 'rejected' || paymentData.status === 'cancelled') {
        console.log('Processing rejected/cancelled payment...')
        
        const metadata = paymentData.metadata
        if (metadata && metadata.ticket_ids) {
          const ticketIds = Array.isArray(metadata.ticket_ids) 
            ? metadata.ticket_ids 
            : [metadata.ticket_ids]

          // Liberar boletos
          const { error: releaseError } = await supabaseClient
            .from('tickets')
            .update({
              status: 'available',
              user_id: null,
              reserved_at: null,
              promoter_code: null
            })
            .in('id', ticketIds)

          if (releaseError) {
            console.error('Error releasing tickets:', releaseError)
            throw releaseError
          }

          console.log(`Tickets released due to payment ${paymentData.status}: ${ticketIds.join(', ')}`)
        }
      } else if (paymentData.status === 'pending') {
        console.log('Payment is pending, no action needed yet')
        // Para pagos pendientes, mantener los boletos reservados
      } else {
        console.log(`Unhandled payment status: ${paymentData.status}`)
      }
    } else {
      console.log(`Unhandled webhook type: ${body.type}`)
    }

    return new Response(
      JSON.stringify({ 
        received: true, 
        processed: true,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Webhook processing error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        received: true,
        processed: false,
        timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})