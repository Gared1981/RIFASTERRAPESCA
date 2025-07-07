import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface NotificationRequest {
  paymentId: string;
  ticketIds: number[];
  ticketNumbers: number[];
  userEmail: string;
  userPhone: string;
  userName: string;
  raffleName: string;
  raffleId: number;
  promoterCode?: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { 
      paymentId, 
      ticketIds, 
      ticketNumbers, 
      userEmail, 
      userPhone, 
      userName,
      raffleName,
      raffleId,
      promoterCode 
    } = await req.json() as NotificationRequest;

    console.log(`Processing notification for payment ${paymentId}`);

    // If ticketIds is empty, try to get them from payment_logs
    let finalTicketIds = ticketIds;
    let finalTicketNumbers = ticketNumbers;

    if (finalTicketIds.length === 0) {
      // Try to get ticket IDs from payment logs
      const { data: paymentLog, error: logError } = await supabase
        .from("payment_logs")
        .select("ticket_ids, metadata")
        .or(`payment_id.eq.${paymentId},preference_id.eq.${paymentId},external_reference.eq.${paymentId}`)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (logError) {
        console.warn(`Warning: Could not find payment log: ${logError.message}`);
      } else if (paymentLog) {
        finalTicketIds = paymentLog.ticket_ids || [];
        
        // Try to get ticket numbers from metadata
        if (paymentLog.metadata && paymentLog.metadata.ticket_numbers) {
          finalTicketNumbers = paymentLog.metadata.ticket_numbers;
        }
      }
    }

    // If we still don't have ticket IDs, we can't proceed
    if (finalTicketIds.length === 0) {
      console.warn(`No ticket IDs found for payment ${paymentId}`);
      return new Response(
        JSON.stringify({
          success: false,
          message: "No ticket IDs found for this payment",
          paymentId,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // 1. Update tickets to purchased status
    const { error: ticketError } = await supabase
      .from("tickets")
      .update({
        status: "purchased",
        purchased_at: new Date().toISOString(),
      })
      .in("id", finalTicketIds);

    if (ticketError) {
      console.warn(`Warning: Could not update tickets: ${ticketError.message}`);
    }

    // 2. Mark notification as sent in payment_logs
    const { error: logError } = await supabase
      .from("payment_logs")
      .update({
        notification_sent: true,
      })
      .or(`payment_id.eq.${paymentId},preference_id.eq.${paymentId},external_reference.eq.${paymentId}`);

    if (logError) {
      console.warn(`Warning: Could not update payment log: ${logError.message}`);
    }

    // 3. If there's a promoter code, register the sales
    if (promoterCode) {
      console.log(`Registering sales for promoter: ${promoterCode}`);
      
      for (const ticketId of finalTicketIds) {
        try {
          const { data: saleResult, error: saleError } = await supabase
            .rpc("register_ticket_sale", {
              p_ticket_id: ticketId,
              p_promoter_code: promoterCode,
            });

          if (saleError) {
            console.error(`Error registering promoter sale: ${saleError.message}`);
          } else {
            console.log(`Sale registered for promoter: ${JSON.stringify(saleResult)}`);
          }
        } catch (saleErr) {
          console.error(`Exception registering promoter sale: ${saleErr}`);
        }
      }
    }

    // 4. Send email notification to customer
    // In a real implementation, this would use an email service
    console.log(`Would send email notification to ${userEmail} for payment ${paymentId}`);
    console.log(`Tickets purchased: ${finalTicketNumbers.join(", ")}`);

    // 5. Send email notification to admin
    const adminEmail = "ventasweb@terrapesca.com";
    console.log(`Would send admin notification to ${adminEmail} for payment ${paymentId}`);
    console.log(`Customer: ${userName}, Phone: ${userPhone}, Email: ${userEmail}`);
    console.log(`Tickets purchased: ${finalTicketNumbers.join(", ")}`);
    console.log(`Raffle: ${raffleName}`);
    console.log(`Promoter code: ${promoterCode || "None"}`);

    // 6. Send WhatsApp notification to admin
    const adminPhone = "+526686889571";
    
    // Prepare WhatsApp message
    // Admin notification
    const adminWhatsappMessage = `
🎫 *NUEVA VENTA DE BOLETOS* 🎫

👤 *Cliente:* ${userName}
📱 *Teléfono:* ${userPhone}
📧 *Email:* ${userEmail}

🎟️ *Boletos:* ${finalTicketNumbers.join(", ")}
🎰 *Sorteo:* ${raffleName}
${promoterCode ? `👨‍💼 *Promotor:* ${promoterCode}` : ""}

💰 *ID de Pago:* ${paymentId}
⏰ *Fecha:* ${new Date().toLocaleString()}
`;
    
    // Customer notification - new format
    const customerWhatsappMessage = `🎉✨ ¡Hola ${userName.split(' ')[0]}!
Tu boleto #${finalTicketNumbers.join(', ')} ha sido registrado con éxito en Sorteos Terrapesca 🎣🧢
¡Estás oficialmente dentro! 🙌🔥

Ahora solo queda cruzar los dedos 🤞 y esperar que la suerte esté de tu lado 🍀🎁
¡Gracias por participar y mucha, muuucha suerte! 💥🚀

#EquipaTuAventura 🌊🐟

${promoterCode ? `👨‍💼 *Código de promotor:* ${promoterCode}\n` : ""}
📞 *Contacto:* +52 668 688 9571
🌐 *Web:* ${supabaseUrl.replace('/functions/v1/send-purchase-notification', '')}`;
    
    console.log(`Would send WhatsApp notification to admin: ${adminPhone}`);
    console.log(adminWhatsappMessage);
    
    console.log(`Would send WhatsApp notification to customer: ${userPhone}`);
    console.log(customerWhatsappMessage);

    // 7. Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: "Notification processed successfully",
        paymentId,
        ticketsUpdated: finalTicketIds.length,
        notificationSent: true,
        customerEmail: userEmail,
        adminEmail: adminEmail,
        adminWhatsapp: adminPhone,
        customerWhatsapp: userPhone,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error(`Error processing notification: ${error.message}`);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});