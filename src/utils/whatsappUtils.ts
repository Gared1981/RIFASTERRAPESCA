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
  if (!phone || tickets.length === 0) {
    console.error('Invalid parameters for WhatsApp link generation');
    return 'https://wa.me/526686889571';
  }
  
  let message = `¡Hola! Me gustaría confirmar la reserva de mis boletos: ${tickets.join(', ')}`;
  
  if (raffleInfo) {
    const total = tickets.length * raffleInfo.price;
    message += `\n\nPara el sorteo: ${raffleInfo.name}`;
    message += `\nTotal a pagar: $${total.toLocaleString()} MXN`;
    message += `\n\n¿Cómo puedo realizar el pago?`;
  }
  
  // Use the fixed WhatsApp number
  try {
    return `https://wa.me/526686889571?text=${encodeURIComponent(message)}`;
  } catch (error) {
    console.error('Error encoding WhatsApp message:', error);
    return 'https://wa.me/526686889571';
  }
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
  
  let message = `🎉 ¡Hola ${userInfo.firstName}!
Tu boleto #${ticketNumbers.join(', ')} ha sido registrado con éxito en Sorteos Terrapesca 🎣
¡Estás oficialmente dentro! 🙌

Ahora solo queda cruzar los dedos 🤞 y esperar que la suerte esté de tu lado 🍀
¡Gracias por participar y mucha suerte! 🎁

#EquipaTuAventura 🌊\n\n`;
  
  if (promoterCode) {
    message += `👨 *Código de promotor:* ${promoterCode}\n`;
  }
  
  message += `📞 *Contacto:* +52 668 688 9571\n`;
  message += `🌐 *Web:* ${baseUrl}\n`;
  
  return message;
}

/**
 * Sends WhatsApp message to customer's phone number
 * @param customerPhone Customer's phone number
 * @param message Message to send
 */
export function sendWhatsAppToCustomer(customerPhone: string, message: string): void {
  if (!customerPhone || !message) {
    console.error('Invalid parameters for WhatsApp customer message');
    return;
  }
  
  // Clean the phone number (remove any non-digits)
  const cleanPhone = customerPhone.replace(/\D/g, '');
  
  if (cleanPhone.length < 10) {
    console.error('Invalid phone number format:', customerPhone);
    return;
  }
  
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
  try {
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
    
    // Open WhatsApp
    window.open(whatsappUrl, '_blank');
  } catch (error) {
    console.error('Error creating WhatsApp URL:', error);
    // Fallback to basic WhatsApp
    window.open('https://wa.me/526686889571', '_blank');
  }
}
  
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