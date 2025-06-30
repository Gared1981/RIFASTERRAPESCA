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
  const drawDate = new Date(raffleInfo.draw_date).toLocaleDateString('es-MX', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Mazatlan'
  });
  
  let message = `🎟️ *BOLETOS RESERVADOS EXITOSAMENTE* 🎟️\n\n`;
  message += `👤 *Cliente:* ${userInfo.firstName} ${userInfo.lastName}\n`;
  message += `📱 *WhatsApp:* ${userInfo.phone}\n`;
  message += `📍 *Estado:* ${userInfo.state}\n\n`;
  message += `🎰 *Sorteo:* ${raffleInfo.name}\n`;
  message += `📅 *Fecha del sorteo:* ${drawDate}\n`;
  message += `🎫 *Boletos reservados:* ${ticketNumbers.join(', ')}\n`;
  message += `💰 *Total a pagar:* $${totalAmount.toLocaleString()} MXN\n`;
  message += `💵 *Precio por boleto:* $${raffleInfo.price} MXN\n\n`;
  
  if (promoterCode) {
    message += `👨‍💼 *Código de promotor:* ${promoterCode}\n`;
    message += `💼 *Comisión del promotor:* $${(ticketNumbers.length * 1000).toLocaleString()} MXN\n\n`;
  }
  
  message += `⏰ *IMPORTANTE:* Tus boletos están reservados por *3 HORAS*\n`;
  message += `⌛ *Después de este tiempo volverán a estar disponibles*\n\n`;
  message += `💳 *OPCIONES DE PAGO:*\n\n`;
  message += `🥇 *OPCIÓN 1 - PAGO EN LÍNEA (RECOMENDADO)*\n`;
  message += `✅ Pago inmediato con Mercado Pago\n`;
  message += `✅ Tarjetas de crédito/débito\n`;
  message += `✅ Transferencias bancarias\n`;
  message += `✅ Confirmación automática\n`;
  message += `🔗 *Enlace directo:* ${baseUrl}/boletos?raffle=${raffleInfo.id}\n\n`;
  message += `🥈 *OPCIÓN 2 - PAGO POR WHATSAPP*\n`;
  message += `📞 Coordinar pago directamente\n`;
  message += `🏦 Transferencia bancaria\n`;
  message += `💰 Depósito en efectivo\n`;
  message += `📱 Responde a este mensaje para coordinar\n\n`;
  message += `🐟 *¡Gracias por participar en Sorteos Terrapesca!* 🐟\n`;
  message += `🍀 *¡Mucha suerte en el sorteo!* 🍀`;
  
  return message;
}

/**
 * No quantity-based bonuses - removed as per requirements
 */
export function calculateBonus(quantity: number): string | null {
  // No bonuses for quantity as per new requirements
  return null;
}