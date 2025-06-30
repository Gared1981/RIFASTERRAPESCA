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
  message += `🔗 *Enlace para pagar en línea:* ${baseUrl}/boletos?raffle=${raffleInfo.id}\n\n`;
  message += `2️⃣ *Pagar por WhatsApp*\n`;
  message += `https://cdn.shopify.com/s/files/1/0205/5752/9188/files/f09af494-4c14-40e1-93b3-2aebe6e3ee50_1.jpg?v=1751326649\n\n`;
  message += `¡Gracias por participar en Sorteos Terrapesca! 🐟`;
  
  return message;
}

/**
 * No quantity-based bonuses - removed as per requirements
 */
export function calculateBonus(quantity: number): string | null {
  // No bonuses for quantity as per new requirements
  return null;
}