/**
 * Generates a WhatsApp link with a pre-filled message containing the selected ticket numbers
 * @param phone User's phone number
 * @param tickets Array of ticket numbers
 * @param raffleInfo Optional raffle information
 * @returns WhatsApp link with encoded message
 */
export function generateWhatsAppLink(
  phone: string,
  tickets: number[],
  raffleInfo?: { name: string; price: number }
): string {
  let message = `¡Hola! Me gustaría confirmar la reserva de mis boletos: ${tickets.join(', ')}`;
  
  if (raffleInfo) {
    const total = tickets.length * raffleInfo.price;
    message += `\n\nPara el sorteo: ${raffleInfo.name}`;
    message += `\nTotal a pagar: $${total.toLocaleString()} MXN`;
    message += `\n\n¿Cómo puedo realizar el pago?`;
  }
  
  // Use the fixed WhatsApp number
  return `https://wa.me/526686889571?text=${encodeURIComponent(message)}`;
}

/**
 * Generates a comprehensive WhatsApp confirmation message for reserved tickets
 * This message is sent TO THE CUSTOMER'S PHONE NUMBER
 */
export function generateReservationConfirmationMessage(
  ticketNumbers: number[],
  userInfo: {
    firstName: string;
    lastName: string;
    phone: string;
    state: string;
  },
  raffleInfo: {
    id: number;
    name: string;
    price: number;
    draw_date: string;
  },
  promoterCode?: string
): string {
  const totalAmount = ticketNumbers.length * raffleInfo.price;
  const baseUrl = window.location.origin;
  
  let message = `🎟️ *BOLETOS RESERVADOS EXITOSAMENTE* 🎟️\n\n`;
  message += `👤 *Cliente:* ${userInfo.firstName} ${userInfo.lastName}\n`;
  message += `📱 *WhatsApp:* ${userInfo.phone}\n`;
  message += `📍 *Estado:* ${userInfo.state}\n\n`;
  message += `🎰 *Sorteo:* ${raffleInfo.name}\n`;
  message += `🎫 *Boletos reservados:* ${ticketNumbers.join(', ')}\n`;
  message += `💰 *Total a pagar:* $${totalAmount.toLocaleString()} MXN\n\n`;
  
  if (promoterCode) {
    message += `👨‍💼 *Código de promotor:* ${promoterCode}\n\n`;
  }
  
  message += `⏰ *IMPORTANTE:* Tus boletos están reservados por *3 horas*.\n\n`;
  message += `💳 *Para completar tu pago, puedes:*\n`;
  message += `1️⃣ *Pagar en línea con Mercado Pago (recomendado)*\n`;
  message += `🔗 *Enlace para pagar en línea:* ${baseUrl}/boletos?raffle=${raffleInfo.id}${promoterCode ? `&promo=${promoterCode}` : ''}\n\n`;
  message += `2️⃣ *Pagar por WhatsApp*\n`;
  message += `📞 *Contactar:* +52 668 688 9571\n`;
  message += `https://cdn.shopify.com/s/files/1/0205/5752/9188/files/f09af494-4c14-40e1-93b3-2aebe6e3ee50_1.jpg?v=1751326649\n\n`;
  message += `¡Gracias por participar en Sorteos Terrapesca! 🐟`;
  
  return message;
}

/**
 * Sends WhatsApp message to customer's phone number
 * @param customerPhone Customer's phone number
 * @param message Message to send
 */
export function sendWhatsAppToCustomer(customerPhone: string, message: string): void {
  // Clean the phone number (remove any non-digits)
  const cleanPhone = customerPhone.replace(/\D/g, '');
  
  // Add Mexico country code if not present
  let formattedPhone = cleanPhone;
  if (cleanPhone.length === 10) {
    formattedPhone = `52${cleanPhone}`;
  } else if (cleanPhone.length === 12 && cleanPhone.startsWith('52')) {
    formattedPhone = cleanPhone;
  } else if (cleanPhone.length === 13 && cleanPhone.startsWith('521')) {
    formattedPhone = cleanPhone;
  }
  
  // Create WhatsApp link to customer's number
  const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
  
  // Open WhatsApp
  window.open(whatsappUrl, '_blank');
}

/**
 * No quantity-based bonuses - removed as per requirements
 */
export function calculateBonus(quantity: number): string | null {
  // No bonuses for quantity as per new requirements
  return null;
}