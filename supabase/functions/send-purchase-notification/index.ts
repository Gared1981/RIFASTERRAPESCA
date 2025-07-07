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

    // 1. Update tickets to purchased status
    const { error: ticketError } = await supabase
      .from("tickets")
      .update({
        status: "purchased",
        purchased_at: new Date().toISOString(),
      })
      .in("id", ticketIds);

    if (ticketError) {
      throw new Error(`Error updating tickets: ${ticketError.message}`);
    }

    // 2. Mark notification as sent in payment_logs
    const { error: logError } = await supabase
      .from("payment_logs")
      .update({
        notification_sent: true,
      })
      .eq("payment_id", paymentId);

    if (logError) {
      console.warn(`Warning: Could not update payment log: ${logError.message}`);
    }

    // 3. If there's a promoter code, register the sales
    if (promoterCode) {
      console.log(`Registering sales for promoter: ${promoterCode}`);
      
      for (const ticketId of ticketIds) {
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

    // 4. In a real implementation, this would send an actual email
    // For now, we'll just log that we would send an email
    console.log(`Would send email notification to ${userEmail} for payment ${paymentId}`);
    console.log(`Tickets purchased: ${ticketNumbers.join(", ")}`);

    // 5. Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: "Notification processed successfully",
        paymentId,
        ticketsUpdated: ticketIds.length,
        notificationSent: true,
        email: userEmail,
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