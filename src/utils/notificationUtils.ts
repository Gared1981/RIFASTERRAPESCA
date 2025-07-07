/**
 * Utilities for sending notifications about ticket purchases and reservations
 */

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

/**
 * Sends a notification to the admin and optionally to the customer
 * about ticket purchases or reservations
 */
export async function sendNotification(payload: NotificationPayload): Promise<boolean> {
  try {
    // Get Supabase URL from environment
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl) {
      console.error('Supabase URL not found in environment variables');
      return false;
    }
    
    // Call the notification edge function
    const response = await fetch(`${supabaseUrl}/functions/v1/send-email-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error sending notification:', errorData);
      return false;
    }
    
    const result = await response.json();
    console.log('Notification sent successfully:', result);
    return true;
    
  } catch (error) {
    console.error('Error sending notification:', error);
    return false;
  }
}

/**
 * Sends a notification specifically for successful payments
 */
export async function sendPaymentSuccessNotification(
  ticketIds: number[],
  userInfo: {
    email: string;
    phone: string;
    firstName: string;
    lastName: string;
  },
  raffleInfo: {
    name: string;
    id: number;
  },
  paymentInfo: {
    id: string;
    method: 'mercadopago' | 'whatsapp';
  },
  promoterCode?: string
): Promise<boolean> {
  return sendNotification({
    ticketIds,
    userEmail: userInfo.email,
    userPhone: userInfo.phone,
    userName: `${userInfo.firstName} ${userInfo.lastName}`,
    raffleName: raffleInfo.name,
    promoterCode,
    paymentId: paymentInfo.id,
    paymentMethod: paymentInfo.method
  });
}

/**
 * Sends a direct email using the email notification edge function
 */
export async function sendDirectEmail(
  to: string,
  subject: string,
  body: string,
  options?: {
    cc?: string[];
    bcc?: string[];
    replyTo?: string;
    isHtml?: boolean;
  }
): Promise<boolean> {
  try {
    // Get Supabase URL from environment
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl) {
      console.error('Supabase URL not found in environment variables');
      return false;
    }
    
    // Call the email notification edge function
    const response = await fetch(`${supabaseUrl}/functions/v1/send-email-notification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({
        to,
        subject,
        body,
        ...options
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error sending email:', errorData);
      return false;
    }
    
    const result = await response.json();
    console.log('Email sent successfully:', result);
    return true;
    
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}