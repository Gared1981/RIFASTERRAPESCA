import React from 'react';
import { Ticket, User } from '../utils/supabaseClient';

interface PDFGeneratorProps {
  tickets: Ticket[];
  user: User;
  raffleInfo: {
    name: string;
    price: number;
    draw_date: string;
  };
  paymentMethod: 'mercadopago' | 'whatsapp';
  onGenerate: (pdfBlob: Blob) => void;
}

const PDFGenerator: React.FC<PDFGeneratorProps> = ({
  tickets,
  user,
  raffleInfo,
  paymentMethod,
  onGenerate
}) => {
  const generatePDF = async () => {
    try {
      // Crear contenido HTML para el PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
            }
            .container {
              max-width: 800px;
              margin: 0 auto;
              background: white;
              border-radius: 15px;
              overflow: hidden;
              box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            }
            .header {
              background: linear-gradient(135deg, #003B73 0%, #0074B3 100%);
              color: white;
              padding: 30px;
              text-align: center;
              position: relative;
            }
            .header::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.05)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
              opacity: 0.3;
            }
            .logo {
              font-size: 28px;
              font-weight: bold;
              margin-bottom: 10px;
              position: relative;
              z-index: 1;
            }
            .subtitle {
              font-size: 16px;
              opacity: 0.9;
              position: relative;
              z-index: 1;
            }
            .content {
              padding: 40px;
            }
            .special-prize {
              background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
              color: #8B4513;
              padding: 20px;
              border-radius: 10px;
              margin: 20px 0;
              text-align: center;
              border: 3px solid #FFD700;
              box-shadow: 0 5px 15px rgba(255, 215, 0, 0.3);
            }
            .special-prize h3 {
              margin: 0 0 10px 0;
              font-size: 24px;
              text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
            }
            .special-prize p {
              margin: 0;
              font-size: 16px;
              font-weight: bold;
            }
            .ticket-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
              gap: 15px;
              margin: 30px 0;
            }
            .ticket {
              background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
              color: white;
              padding: 20px;
              border-radius: 10px;
              text-align: center;
              font-weight: bold;
              font-size: 18px;
              box-shadow: 0 4px 8px rgba(0,0,0,0.1);
              border: 2px solid #4CAF50;
            }
            .info-section {
              background: #f8f9fa;
              padding: 25px;
              border-radius: 10px;
              margin: 20px 0;
              border-left: 5px solid #003B73;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              margin: 10px 0;
              padding: 8px 0;
              border-bottom: 1px solid #e9ecef;
            }
            .info-row:last-child {
              border-bottom: none;
            }
            .label {
              font-weight: bold;
              color: #495057;
            }
            .value {
              color: #212529;
            }
            .footer {
              background: #003B73;
              color: white;
              padding: 25px;
              text-align: center;
              font-size: 14px;
            }
            .qr-placeholder {
              width: 100px;
              height: 100px;
              background: #f0f0f0;
              border: 2px dashed #ccc;
              margin: 20px auto;
              display: flex;
              align-items: center;
              justify-content: center;
              border-radius: 10px;
            }
            .watermark {
              position: fixed;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(-45deg);
              font-size: 60px;
              color: rgba(0, 59, 115, 0.05);
              font-weight: bold;
              z-index: 0;
              pointer-events: none;
            }
          </style>
        </head>
        <body>
          <div class="watermark">SORTEOS TERRAPESCA</div>
          <div class="container">
            <div class="header">
              <div class="logo">🎣 SORTEOS TERRAPESCA</div>
              <div class="subtitle">Comprobante de Participación Oficial</div>
            </div>
            
            <div class="content">
              ${paymentMethod === 'mercadopago' ? `
                <div class="special-prize">
                  <h3>🏆 ¡PARTICIPAS EN EL PREMIO ESPECIAL! 🏆</h3>
                  <p>Por pagar con Mercado Pago, automáticamente participas en nuestro premio especial adicional</p>
                </div>
              ` : ''}
              
              <div class="info-section">
                <h3 style="margin-top: 0; color: #003B73;">📋 Información del Participante</h3>
                <div class="info-row">
                  <span class="label">Nombre:</span>
                  <span class="value">${user.first_name} ${user.last_name}</span>
                </div>
                <div class="info-row">
                  <span class="label">Teléfono:</span>
                  <span class="value">${user.phone}</span>
                </div>
                <div class="info-row">
                  <span class="label">Estado:</span>
                  <span class="value">${user.state}</span>
                </div>
                <div class="info-row">
                  <span class="label">Método de Pago:</span>
                  <span class="value">${paymentMethod === 'mercadopago' ? 'Mercado Pago (Pago Seguro)' : 'WhatsApp (Coordinación Manual)'}</span>
                </div>
              </div>
              
              <div class="info-section">
                <h3 style="margin-top: 0; color: #003B73;">🎰 Información del Sorteo</h3>
                <div class="info-row">
                  <span class="label">Sorteo:</span>
                  <span class="value">${raffleInfo.name}</span>
                </div>
                <div class="info-row">
                  <span class="label">Fecha del Sorteo:</span>
                  <span class="value">${new Date(raffleInfo.draw_date).toLocaleDateString('es-MX', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZone: 'America/Mazatlan'
                  })} (Hora del Pacífico - Sinaloa)</span>
                </div>
                <div class="info-row">
                  <span class="label">Precio por Boleto:</span>
                  <span class="value">$${raffleInfo.price.toLocaleString()} MXN</span>
                </div>
                <div class="info-row">
                  <span class="label">Total Pagado:</span>
                  <span class="value">$${(tickets.length * raffleInfo.price).toLocaleString()} MXN</span>
                </div>
              </div>
              
              <h3 style="color: #003B73;">🎫 Tus Boletos (${tickets.length})</h3>
              <div class="ticket-grid">
                ${tickets.map(ticket => `
                  <div class="ticket">
                    #${ticket.number}
                  </div>
                `).join('')}
              </div>
              
              <div class="qr-placeholder">
                <span style="color: #999;">QR Code</span>
              </div>
              
              <div style="text-align: center; margin-top: 30px; padding: 20px; background: #e8f5e8; border-radius: 10px;">
                <p style="margin: 0; color: #2e7d32; font-weight: bold;">
                  ✅ Boletos confirmados y registrados oficialmente
                </p>
                <p style="margin: 5px 0 0 0; color: #2e7d32; font-size: 14px;">
                  Puedes verificar tus boletos en cualquier momento en nuestra página web
                </p>
              </div>
            </div>
            
            <div class="footer">
              <p><strong>Sorteos Terrapesca</strong></p>
              <p>📞 +52 668 688 9571 | 📧 ventasweb@terrapesca.com</p>
              <p>🌐 www.sorteosterrapesca.com</p>
              <p style="margin-top: 15px; font-size: 12px; opacity: 0.8;">
                Generado el ${new Date().toLocaleDateString('es-MX')} a las ${new Date().toLocaleTimeString('es-MX')}
              </p>
            </div>
          </div>
        </body>
        </html>
      `;

      // Crear blob del PDF (simulado - en producción usarías una librería como jsPDF o Puppeteer)
      const blob = new Blob([htmlContent], { type: 'text/html' });
      onGenerate(blob);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <button
      onClick={generatePDF}
      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
    >
      📄 Generar Comprobante PDF
    </button>
  );
};

export default PDFGenerator;