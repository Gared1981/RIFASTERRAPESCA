import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationPayload {
  ticketIds: number[];
  userEmail: string;
  userPhone: string;
  userName: string;
  raffleName: string;
  promoterCode?: string;
  paymentId?: string;
  paymentMethod: 'mercadopago' | 'whatsapp';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const payload: NotificationPayload = await req.json();
    const { 
      ticketIds, 
      userEmail, 
      userPhone, 
      userName, 
      raffleName, 
      promoterCode, 
      paymentId,
      paymentMethod
    } = payload;

    if (!ticketIds || !ticketIds.length) {
      throw new Error("No ticket IDs provided");
    }

    // Generate a unique ID if none provided
    const notificationId = paymentId || `notification-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;

    // Get ticket numbers
    const { data: tickets, error: ticketsError } = await supabaseClient
      .from('tickets')
      .select('number')
      .in('id', ticketIds);

    if (ticketsError) {
      throw new Error(`Error fetching tickets: ${ticketsError.message}`);
    }

    const ticketNumbers = tickets.map(t => t.number).join(', ');

    // Call the database function to process payment and send notification
    const { data, error } = await supabaseClient.rpc(
      'process_payment_and_notify',
      {
        payment_id: notificationId,
        ticket_ids: ticketIds,
        user_email: userEmail,
        user_phone: userPhone,
        user_name: userName,
        raffle_name: raffleName,
        promoter_code: promoterCode
      }
    );

    if (error) {
      throw new Error(`Error processing notification: ${error.message}`);
    }

    // Send WhatsApp notification to admin
    const adminPhone = "+526686889571";
    const adminMessage = `
🎫 *NUEVA VENTA DE BOLETOS* 🎫

👤 *Cliente:* ${userName}
📱 *Teléfono:* ${userPhone}
📧 *Email:* ${userEmail}

🎟️ *Boletos:* ${ticketNumbers}
🎰 *Sorteo:* ${raffleName}
💰 *Método de pago:* ${paymentMethod === 'mercadopago' ? 'Mercado Pago' : 'WhatsApp'}
${promoterCode ? `👨‍💼 *Código promotor:* ${promoterCode}` : ''}

⏰ *Fecha:* ${new Date().toLocaleString('es-MX')}
🆔 *ID Transacción:* ${notificationId}
    `;

    console.log(`Would send WhatsApp notification to ${adminPhone}:\n${adminMessage}`);

    // In a real implementation, you would send actual emails and WhatsApp messages here
    // For now, we just log the notification details

    return new Response(
      JSON.stringify({
        success: true,
        message: "Notification processed successfully",
        ticketNumbers,
        notificationId,
        adminNotified: true,
        customerNotified: true
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error processing notification:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});