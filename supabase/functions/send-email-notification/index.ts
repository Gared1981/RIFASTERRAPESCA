import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

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

    // Resend API key
    const RESEND_API_KEY = "re_UurBRH4T_7tgo3qyw6wipbkoDFVmXPM3Y";
    
    // Check if this is a direct email request or a ticket notification
    const requestBody = await req.json();
    
    if (requestBody.to && requestBody.subject && requestBody.body) {
      // This is a direct email request
      const { to, subject, body, cc, bcc, replyTo, isHtml } = requestBody as EmailNotificationRequest;
      
      console.log(`Sending email to: ${to}`);
      console.log(`Subject: ${subject}`);
      
      try {
        // Send email using Resend API
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            from: "Sorteos Terrapesca <ventasweb@terrapesca.com>",
            to: [to],
            subject: subject,
            html: isHtml ? body : undefined,
            text: !isHtml ? body : undefined,
            cc: cc,
            bcc: bcc,
            reply_to: replyTo || "ventasweb@terrapesca.com"
          })
        });
        
        const result = await response.json();
        
        if (!response.ok) {
          console.error("Resend API error:", result);
          throw new Error(`Resend API error: ${JSON.stringify(result)}`);
        }
        
        console.log("Email sent successfully:", result);
        
        return new Response(
          JSON.stringify({
            success: true,
            message: "Email sent successfully",
            to,
            subject,
            id: result.id
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );
      } catch (emailError) {
        console.error("Error sending email:", emailError);
        throw new Error(`Error sending email: ${emailError.message}`);
      }
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
      
      try {
        // Send customer email using Resend API
        if (userEmail) {
          const customerResponse = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${RESEND_API_KEY}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              from: "Sorteos Terrapesca <ventasweb@terrapesca.com>",
              to: [userEmail],
              subject: customerSubject,
              html: customerBody
            })
          });
          
          const customerResult = await customerResponse.json();
          
          if (!customerResponse.ok) {
            console.error("Resend API error (customer email):", customerResult);
          } else {
            console.log("Customer email sent successfully:", customerResult);
          }
        }
        
        // Send admin email using Resend API
        const adminResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            from: "Sorteos Terrapesca <ventasweb@terrapesca.com>",
            to: [adminEmail],
            subject: adminSubject,
            html: adminBody
          })
        });
        
        const adminResult = await adminResponse.json();
        
        if (!adminResponse.ok) {
          console.error("Resend API error (admin email):", adminResult);
        } else {
          console.log("Admin email sent successfully:", adminResult);
        }
        
        // For WhatsApp, you would typically use a WhatsApp Business API provider
        // Here we're just logging what would be sent
        
        return new Response(
          JSON.stringify({
            success: true,
            message: "Email notifications sent successfully",
            customerEmail: userEmail,
            adminEmail: adminEmail,
            ticketsProcessed: finalTicketNumbers.length,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );
      } catch (emailError) {
        console.error("Error sending emails:", emailError);
        throw new Error(`Error sending emails: ${emailError.message}`);
      }
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