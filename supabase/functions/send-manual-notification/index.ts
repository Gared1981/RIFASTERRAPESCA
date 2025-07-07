import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface ManualNotificationRequest {
  ticketId: number;
  notificationType: 'email' | 'whatsapp';
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

    const { ticketId, notificationType } = await req.json() as ManualNotificationRequest;

    // Get ticket information with user details
    const { data: ticket, error: ticketError } = await supabase
      .from("tickets")
      .select(`
        *,
        user:user_id(*),
        raffle:raffle_id(name, price)
      `)
      .eq("id", ticketId)
      .single();

    if (ticketError) {
      throw new Error(`Error fetching ticket: ${ticketError.message}`);
    }

    if (!ticket.user) {
      throw new Error("No user information found for this ticket");
    }

    // Prepare notification content
    const userName = `${ticket.user.first_name} ${ticket.user.last_name}`;
    const userEmail = ticket.user.email || "";
    const userPhone = ticket.user.phone || "";
    const ticketNumber = ticket.number;
    const raffleName = ticket.raffle?.name || "Sorteo Terrapesca";
    const rafflePrice = ticket.raffle?.price || 0;

    if (notificationType === 'email') {
      // Prepare email content
      const emailSubject = `Confirmación de Boleto #${ticketNumber} - ${raffleName}`;
      const emailBody = `
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #003B73; color: white; padding: 20px; text-align: center;">
            <h1>¡Boleto Confirmado!</h1>
          </div>
          
          <div style="padding: 20px;">
            <p>Hola ${userName},</p>
            
            <p>Tu boleto para el sorteo <strong>${raffleName}</strong> ha sido confirmado.</p>
            
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3>Detalles de tu boleto:</h3>
              <p><strong>Número de boleto:</strong> ${ticketNumber}</p>
              <p><strong>Estado:</strong> ${ticket.status === 'purchased' ? 'Pagado' : 'Reservado'}</p>
              <p><strong>Fecha de compra:</strong> ${new Date(ticket.purchased_at || '').toLocaleString()}</p>
              <p><strong>Precio:</strong> $${rafflePrice} MXN</p>
            </div>
            
            <p>Puedes verificar el estado de tu boleto en cualquier momento visitando <a href="https://sorteosterrapesca.com/verificar">nuestra página de verificación</a>.</p>
            
            <p>Si tienes alguna pregunta, no dudes en contactarnos:</p>
            <ul>
              <li>WhatsApp: +52 668 688 9571</li>
              <li>Email: ventasweb@terrapesca.com</li>
            </ul>
            
            <p>¡Buena suerte en el sorteo!</p>
            
            <p>Atentamente,<br>
            Equipo de Sorteos Terrapesca</p>
          </div>
          
          <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666;">
            <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
            <p>© ${new Date().getFullYear()} Sorteos Terrapesca. Todos los derechos reservados.</p>
          </div>
        </body>
        </html>
      `;

      // Log the email that would be sent (for development/testing)
      console.log(`Would send email to: ${userEmail}`);
      console.log(`Subject: ${emailSubject}`);
      console.log(`Body: ${emailBody.substring(0, 100)}...`);

      // In production, you would use an email service here
      // For now, we just log the email details

      return new Response(
        JSON.stringify({
          success: true,
          message: "Email notification would be sent (disabled in development)",
          to: userEmail,
          subject: emailSubject,
          ticketNumber,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    } else if (notificationType === 'whatsapp') {
      // Prepare WhatsApp message
      const whatsappMessage = `
¡Hola ${userName}!

Te confirmamos que tu boleto #${ticketNumber} para el sorteo "${raffleName}" ha sido registrado correctamente.

Detalles:
- Número de boleto: ${ticketNumber}
- Estado: ${ticket.status === 'purchased' ? 'Pagado' : 'Reservado'}
- Fecha: ${new Date(ticket.purchased_at || '').toLocaleString()}

Puedes verificar el estado de tu boleto en cualquier momento en nuestra página web.

¡Buena suerte en el sorteo!

Atentamente,
Equipo de Sorteos Terrapesca
      `;

      // Log the WhatsApp message that would be sent
      console.log(`Would send WhatsApp to: ${userPhone}`);
      console.log(`Message: ${whatsappMessage}`);

      // In production, you would use a WhatsApp API here
      // For now, we just log the message details

      return new Response(
        JSON.stringify({
          success: true,
          message: "WhatsApp notification would be sent (disabled in development)",
          to: userPhone,
          ticketNumber,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    } else {
      throw new Error(`Invalid notification type: ${notificationType}`);
    }
  } catch (error) {
    console.error(`Error processing manual notification: ${error.message}`);
    
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