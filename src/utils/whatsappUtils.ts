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
 * Calculates any applicable bonus based on the number of tickets purchased
 * @param quantity Number of tickets
 * @returns Bonus message or null if no bonus applies
 */
export function calculateBonus(quantity: number): string | null {
  if (quantity >= 30) return 'BONO ENVÍO GRATIS';
  if (quantity >= 20) return 'BONO EXTRA';
  if (quantity >= 10) return 'BONO ADICIONAL';
  if (quantity >= 5) return 'BONO VIP';
  return null;
}