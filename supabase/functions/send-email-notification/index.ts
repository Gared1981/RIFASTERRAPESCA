import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { SmtpClient } from "npm:@orama/mailman@0.2.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface EmailNotificationRequest {
  to: string;
  subject: string;
  body: string;
  cc?: string[];
  bcc?: string[];
  replyTo?: string;
  isHtml?: boolean;
}

interface TicketNotificationRequest {
  paymentId: string;
  ticketIds: number[];
  ticketNumbers: number[];
  userEmail: string;
  userPhone: string;
  userName: string;
  raffleName: string;
  promoterCode?: string;
  paymentMethod?: 'mercadopago' | 'whatsapp';
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

    // Email configuration
    const smtpHost = "smtp.gmail.com"; // Replace with your SMTP server
    const smtpPort = 587;
    const smtpUsername = "ventasweb@terrapesca.com"; // Replace with your email
    const smtpPassword = "your-app-password"; // Replace with your app password
    
    // Check if this is a direct email request or a ticket notification
    const requestBody = await req.json();
    
    if (requestBody.to && requestBody.subject && requestBody.body) {
      // This is a direct email request
      const { to, subject, body, cc, bcc, replyTo, isHtml } = requestBody as EmailNotificationRequest;
      
      // Log the email that would be sent (for development/testing)
      console.log(`Would send email to: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Body: ${body.substring(0, 100)}...`);
      
      // In production, uncomment this code to actually send emails
      /*
      const client = new SmtpClient();
      await client.connect({
        hostname: smtpHost,
        port: smtpPort,
        username: smtpUsername,
        password: smtpPassword,
      });
      
      await client.send({
        from: smtpUsername,
        to: [to],
        cc: cc || [],
        bcc: bcc || [],
        subject: subject,
        content: body,
        html: isHtml === true,
      });
      
      await client.close();
      */
      
      return new Response(
        JSON.stringify({
          success: true,
          message: "Email notification would be sent (disabled in development)",
          to,
          subject,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    } else {
      // This is a ticket notification request
      const { 
        paymentId, 
        ticketIds, 
        ticketNumbers, 
        userEmail, 
        userPhone, 
        userName,
        raffleName,
        promoterCode,
        paymentMethod = 'mercadopago'
      } = requestBody as TicketNotificationRequest;
      
      // Get ticket numbers if not provided
      let finalTicketNumbers = ticketNumbers;
      if (!finalTicketNumbers || finalTicketNumbers.length === 0) {
        const { data: tickets, error: ticketsError } = await supabase
          .from("tickets")
          .select("number")
          .in("id", ticketIds);
          
        if (ticketsError) {
          throw new Error(`Error fetching tickets: ${ticketsError.message}`);
        }
        
        finalTicketNumbers = tickets.map(t => t.number);
      }
      
      // Mark notification as sent in payment_logs
      const { error: logError } = await supabase
        .from("payment_logs")
        .update({
          notification_sent: true,
        })
        .or(`payment_id.eq.${paymentId},preference_id.eq.${paymentId},external_reference.eq.${paymentId}`);
      
      if (logError) {
        console.warn(`Warning: Could not update payment log: ${logError.message}`);
      }
      
      // 1. Prepare customer email
      const customerSubject = `¡Boletos Confirmados! - Sorteo ${raffleName}`;
      const customerBody = `
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #003B73; color: white; padding: 20px; text-align: center;">
            <h1>¡Gracias por tu compra!</h1>
          </div>
          
          <div style="padding: 20px;">
            <p>Hola ${userName},</p>
            
            <p>¡Tu compra ha sido confirmada! Tus boletos para el sorteo <strong>${raffleName}</strong> han sido registrados exitosamente.</p>
            
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3>Detalles de tu compra:</h3>
              <p><strong>Boletos:</strong> ${finalTicketNumbers.join(", ")}</p>
              <p><strong>Método de pago:</strong> ${paymentMethod === 'mercadopago' ? 'Mercado Pago' : 'WhatsApp'}</p>
              ${promoterCode ? `<p><strong>Código de promotor:</strong> ${promoterCode}</p>` : ''}
            </div>
            
            ${paymentMethod === 'mercadopago' ? `
            <div style="background-color: #FFF3CD; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #FFD700;">
              <h3 style="color: #856404;">¡Premio Especial!</h3>
              <p>Por haber pagado con Mercado Pago, participas automáticamente en nuestro premio especial con envío GRATIS a toda la República Mexicana.</p>
            </div>
            ` : ''}
            
            <p>Puedes verificar el estado de tus boletos en cualquier momento visitando <a href="https://sorteosterrapesca.com/verificar">nuestra página de verificación</a>.</p>
            
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
      
      // 2. Prepare admin email
      const adminEmail = "ventasweb@terrapesca.com";
      const adminSubject = `Nueva venta de boletos - ${userName}`;
      const adminBody = `
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #003B73; color: white; padding: 20px; text-align: center;">
            <h1>¡Nueva Venta de Boletos!</h1>
          </div>
          
          <div style="padding: 20px;">
            <h2>Detalles de la venta:</h2>
            
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3>Información del cliente:</h3>
              <p><strong>Nombre:</strong> ${userName}</p>
              <p><strong>Email:</strong> ${userEmail}</p>
              <p><strong>Teléfono:</strong> ${userPhone}</p>
            </div>
            
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3>Información de la compra:</h3>
              <p><strong>Sorteo:</strong> ${raffleName}</p>
              <p><strong>Boletos:</strong> ${finalTicketNumbers.join(", ")}</p>
              <p><strong>Método de pago:</strong> ${paymentMethod === 'mercadopago' ? 'Mercado Pago' : 'WhatsApp'}</p>
              <p><strong>ID de pago:</strong> ${paymentId}</p>
              ${promoterCode ? `<p><strong>Código de promotor:</strong> ${promoterCode}</p>` : ''}
            </div>
            
            <p>Puedes ver más detalles en el <a href="https://sorteosterrapesca.com/admin">panel de administración</a>.</p>
          </div>
          
          <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666;">
            <p>Este es un correo automático generado por el sistema de Sorteos Terrapesca.</p>
            <p>© ${new Date().getFullYear()} Sorteos Terrapesca. Todos los derechos reservados.</p>
          </div>
        </body>
        </html>
      `;
      
      // 3. Prepare WhatsApp message for admin
      const adminPhone = "+526686889571";
      const adminWhatsappMessage = `
🎫 *NUEVA VENTA DE BOLETOS* 🎫

👤 *Cliente:* ${userName}
📱 *Teléfono:* ${userPhone}
📧 *Email:* ${userEmail}

🎟️ *Boletos:* ${finalTicketNumbers.join(", ")}
🎰 *Sorteo:* ${raffleName}
💰 *Método de pago:* ${paymentMethod === 'mercadopago' ? 'Mercado Pago' : 'WhatsApp'}
${promoterCode ? `👨‍💼 *Código promotor:* ${promoterCode}` : ''}

⏰ *Fecha:* ${new Date().toLocaleString('es-MX')}
🆔 *ID Transacción:* ${paymentId}
      `;
      
      // 4. Prepare WhatsApp message for customer - new format
      const customerWhatsappMessage = `🎉✨ ¡Hola ${userName.split(' ')[0]}!
Tu boleto #${finalTicketNumbers.join(', ')} ha sido registrado con éxito en Sorteos Terrapesca 🎣🧢
¡Estás oficialmente dentro! 🙌🔥

Ahora solo queda cruzar los dedos 🤞 y esperar que la suerte esté de tu lado 🍀🎁
¡Gracias por participar y mucha, muuucha suerte! 💥🚀

#EquipaTuAventura 🌊🐟

${promoterCode ? `👨‍💼 *Código de promotor:* ${promoterCode}\n` : ""}
📞 *Contacto:* +52 668 688 9571
🌐 *Web:* ${supabaseUrl.replace('/functions/v1/send-email-notification', '')}`;
      
      console.log(`Would send customer email to: ${userEmail}`);
      console.log(`Would send admin email to: ${adminEmail}`);
      console.log(`Would send WhatsApp message to admin: ${adminPhone}`);
      console.log(`Would send WhatsApp message to customer: ${userPhone}`);
      
      // In production, uncomment this code to actually send emails
      /*
      const client = new SmtpClient();
      await client.connect({
        hostname: smtpHost,
        port: smtpPort,
        username: smtpUsername,
        password: smtpPassword,
      });
      
      // Send customer email
      await client.send({
        from: smtpUsername,
        to: [userEmail],
        subject: customerSubject,
        content: customerBody,
        html: true,
      });
      
      // Send admin email
      await client.send({
        from: smtpUsername,
        to: [adminEmail],
        subject: adminSubject,
        content: adminBody,
        html: true,
      });
      
      await client.close();
      */
      
      // For WhatsApp, you would typically use a WhatsApp Business API provider
      // Here we're just logging what would be sent
      
      return new Response(
        JSON.stringify({
          success: true,
          message: "Notifications would be sent (disabled in development)",
          customerEmail: userEmail,
          adminEmail: adminEmail,
          adminWhatsapp: adminPhone,
          ticketsProcessed: finalTicketNumbers.length,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }
  } catch (error) {
    console.error(`Error processing email notification: ${error.message}`);
    
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