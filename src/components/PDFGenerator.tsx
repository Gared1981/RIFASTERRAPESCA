import React from 'react';
import { Ticket, User } from '../utils/supabaseClient';
import { Download, FileText } from 'lucide-react';

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
  const generateHTML = async () => {
    try {
      // Crear contenido HTML mejorado para el comprobante
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Comprobante - Sorteos Terrapesca</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
              padding: 20px;
            }
            
            .container {
              max-width: 800px;
              margin: 0 auto;
              background: white;
              border-radius: 20px;
              overflow: hidden;
              box-shadow: 0 25px 50px rgba(0,0,0,0.15);
              position: relative;
            }
            
            .watermark {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(-45deg);
              font-size: 80px;
              color: rgba(0, 59, 115, 0.03);
              font-weight: bold;
              z-index: 1;
              pointer-events: none;
              white-space: nowrap;
            }
            
            .header {
              background: linear-gradient(135deg, #003B73 0%, #0074B3 100%);
              color: white;
              padding: 40px 30px;
              text-align: center;
              position: relative;
              z-index: 2;
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
              font-size: 32px;
              font-weight: bold;
              margin-bottom: 15px;
              position: relative;
              z-index: 1;
              text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            }
            
            .subtitle {
              font-size: 18px;
              opacity: 0.95;
              position: relative;
              z-index: 1;
              font-weight: 300;
            }
            
            .content {
              padding: 40px;
              position: relative;
              z-index: 2;
            }
            
            .special-prize {
              background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
              color: #8B4513;
              padding: 25px;
              border-radius: 15px;
              margin: 25px 0;
              text-align: center;
              border: 3px solid #FFD700;
              box-shadow: 0 8px 25px rgba(255, 215, 0, 0.4);
              animation: glow 2s ease-in-out infinite alternate;
            }
            
            @keyframes glow {
              from { box-shadow: 0 8px 25px rgba(255, 215, 0, 0.4); }
              to { box-shadow: 0 8px 35px rgba(255, 215, 0, 0.6); }
            }
            
            .special-prize h3 {
              margin: 0 0 15px 0;
              font-size: 26px;
              text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
            }
            
            .special-prize p {
              margin: 0;
              font-size: 16px;
              font-weight: 600;
              line-height: 1.4;
            }
            
            .info-section {
              background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
              padding: 30px;
              border-radius: 15px;
              margin: 25px 0;
              border-left: 6px solid #003B73;
              box-shadow: 0 4px 15px rgba(0,0,0,0.05);
            }
            
            .info-section h3 {
              margin: 0 0 20px 0;
              color: #003B73;
              font-size: 22px;
              display: flex;
              align-items: center;
              gap: 10px;
            }
            
            .info-row {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin: 15px 0;
              padding: 12px 0;
              border-bottom: 1px solid rgba(0,0,0,0.1);
            }
            
            .info-row:last-child {
              border-bottom: none;
            }
            
            .label {
              font-weight: 600;
              color: #495057;
              font-size: 15px;
            }
            
            .value {
              color: #212529;
              font-weight: 500;
              text-align: right;
              max-width: 60%;
            }
            
            .ticket-section {
              margin: 30px 0;
            }
            
            .ticket-section h3 {
              color: #003B73;
              margin-bottom: 20px;
              font-size: 22px;
              text-align: center;
            }
            
            .ticket-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
              gap: 20px;
              margin: 25px 0;
            }
            
            .ticket {
              background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
              color: white;
              padding: 25px 20px;
              border-radius: 15px;
              text-align: center;
              font-weight: bold;
              font-size: 20px;
              box-shadow: 0 6px 20px rgba(76, 175, 80, 0.3);
              border: 3px solid #4CAF50;
              transition: transform 0.2s ease;
              position: relative;
              overflow: hidden;
            }
            
            .ticket::before {
              content: '';
              position: absolute;
              top: -50%;
              left: -50%;
              width: 200%;
              height: 200%;
              background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent);
              transform: rotate(45deg);
              animation: shine 3s infinite;
            }
            
            @keyframes shine {
              0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
              50% { transform: translateX(100%) translateY(100%) rotate(45deg); }
              100% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
            }
            
            .ticket-number {
              position: relative;
              z-index: 1;
            }
            
            .verification-section {
              text-align: center;
              margin: 30px 0;
              padding: 25px;
              background: linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%);
              border-radius: 15px;
              border: 2px solid #4CAF50;
            }
            
            .verification-section h4 {
              margin: 0 0 15px 0;
              color: #2e7d32;
              font-size: 20px;
            }
            
            .verification-section p {
              margin: 8px 0;
              color: #2e7d32;
              font-weight: 500;
            }
            
            .qr-placeholder {
              width: 120px;
              height: 120px;
              background: linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%);
              border: 3px dashed #999;
              margin: 25px auto;
              display: flex;
              align-items: center;
              justify-content: center;
              border-radius: 15px;
              font-size: 14px;
              color: #666;
              font-weight: 600;
            }
            
            .footer {
              background: linear-gradient(135deg, #003B73 0%, #002850 100%);
              color: white;
              padding: 30px;
              text-align: center;
              font-size: 14px;
            }
            
            .footer p {
              margin: 8px 0;
            }
            
            .footer .company-name {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 15px;
            }
            
            .footer .contact-info {
              opacity: 0.9;
              margin: 5px 0;
            }
            
            .footer .generation-info {
              margin-top: 20px;
              font-size: 12px;
              opacity: 0.7;
              border-top: 1px solid rgba(255,255,255,0.2);
              padding-top: 15px;
            }
            
            .status-badge {
              display: inline-block;
              padding: 8px 16px;
              border-radius: 25px;
              font-size: 14px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            
            .status-confirmed {
              background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
              color: white;
            }
            
            .status-pending {
              background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
              color: white;
            }
            
            @media print {
              body {
                background: white;
                padding: 0;
              }
              
              .container {
                box-shadow: none;
                border-radius: 0;
              }
              
              .special-prize {
                animation: none;
              }
              
              .ticket::before {
                animation: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="watermark">SORTEOS TERRAPESCA</div>
          <div class="container">
            <div class="header">
              <div style="text-align: center; margin-bottom: 20px;">
                <img src="https://cdn.shopify.com/s/files/1/0205/5752/9188/files/Logo-Terrapesca-01_205270e5-d546-4e33-a8d1-db0a91f1e554.png?v=1700262873" alt="Terrapesca" style="height: 80px; width: auto; margin: 0 auto;" />
              </div>
              <div class="logo">🎣 SORTEOS TERRAPESCA</div>
              <div class="subtitle">Comprobante de Participación Oficial</div>
            </div>
            
            <div class="content">
              ${paymentMethod === 'mercadopago' ? `
                <div class="special-prize">
                  <h3>🏆 ¡PARTICIPAS EN EL PREMIO ESPECIAL! 🏆</h3>
                  <p>Por pagar con Mercado Pago, automáticamente participas en nuestro premio especial adicional con envío GRATIS a toda la República Mexicana</p>
                </div>
              ` : ''}
              
              <div class="info-section">
                <h3>👤 Información del Participante</h3>
                <div class="info-row">
                  <span class="label">Nombre Completo:</span>
                  <span class="value">${user.first_name} ${user.last_name}</span>
                </div>
                <div class="info-row">
                  <span class="label">Teléfono WhatsApp:</span>
                  <span class="value">${user.phone}</span>
                </div>
                <div class="info-row">
                  <span class="label">Estado:</span>
                  <span class="value">${user.state}</span>
                </div>
                <div class="info-row">
                  <span class="label">Método de Pago:</span>
                  <span class="value">
                    <span class="status-badge ${paymentMethod === 'mercadopago' ? 'status-confirmed' : 'status-pending'}">
                      ${paymentMethod === 'mercadopago' ? '✅ Mercado Pago (Confirmado)' : '⏳ WhatsApp (Pendiente)'}
                    </span>
                  </span>
                </div>
              </div>
              
              <div class="info-section">
                <h3>🎰 Información del Sorteo</h3>
                <div class="info-row">
                  <span class="label">Nombre del Sorteo:</span>
                  <span class="value">${raffleInfo.name}</span>
                </div>
                <div class="info-row">
                  <span class="label">Fecha y Hora del Sorteo:</span>
                  <span class="value">${new Date(raffleInfo.draw_date).toLocaleDateString('es-MX', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZone: 'America/Mazatlan'
                  })}</span>
                </div>
                <div class="info-row">
                  <span class="label">Zona Horaria:</span>
                  <span class="value">Hora del Pacífico - Sinaloa</span>
                </div>
                <div class="info-row">
                  <span class="label">Precio por Boleto:</span>
                  <span class="value">$${raffleInfo.price.toLocaleString()} MXN</span>
                </div>
                <div class="info-row">
                  <span class="label">Cantidad de Boletos:</span>
                  <span class="value">${tickets.length} boleto${tickets.length > 1 ? 's' : ''}</span>
                </div>
                <div class="info-row">
                  <span class="label">Total Pagado:</span>
                  <span class="value"><strong>$${(tickets.length * raffleInfo.price).toLocaleString()} MXN</strong></span>
                </div>
              </div>
              
              <div class="ticket-section">
                <h3>🎫 Tus Números de la Suerte (${tickets.length})</h3>
                <div class="ticket-grid">
                  ${tickets.map(ticket => `
                    <div class="ticket">
                      <div class="ticket-number">#${ticket.number}</div>
                    </div>
                  `).join('')}
                </div>
              </div>
              
              <div class="qr-placeholder">
                <span>Código QR<br>de Verificación</span>
              </div>
              
              <div class="verification-section">
                <h4>✅ Boletos Confirmados y Registrados</h4>
                <p><strong>Estado:</strong> ${paymentMethod === 'mercadopago' ? 'Pagado y Confirmado' : 'Reservado - Pendiente de Pago'}</p>
                <p>Puedes verificar tus boletos en cualquier momento en:</p>
                <p><strong>www.sorteosterrapesca.com/verificar</strong></p>
                ${paymentMethod === 'mercadopago' ? `
                  <p style="color: #FF6B35; font-weight: bold; margin-top: 15px;">
                    🎁 BONUS: Participas automáticamente en el premio especial con envío GRATIS
                  </p>
                ` : `
                  <p style="color: #FF6B35; font-weight: bold; margin-top: 15px;">
                    📞 Te contactaremos por WhatsApp para coordinar el pago
                  </p>
                `}
              </div>
            </div>
            
            <div class="footer">
              <p class="company-name">Sorteos Terrapesca</p>
              <p class="contact-info">📞 +52 668 688 9571</p>
              <p class="contact-info">📧 ventasweb@terrapesca.com</p>
              <p class="contact-info">🌐 www.sorteosterrapesca.com</p>
              <p class="contact-info">📍 Los Mochis, Sinaloa, México</p>
              <div class="generation-info">
                <p>Comprobante generado el ${new Date().toLocaleDateString('es-MX', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })} a las ${new Date().toLocaleTimeString('es-MX')}</p>
                <p>Documento oficial válido para reclamación de premios</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      // Crear blob del HTML
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      onGenerate(blob);
      
    } catch (error) {
      console.error('Error generating HTML:', error);
    }
  };

  return (
    <div className="text-center">
      <button
        onClick={generateHTML}
        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
      >
        <Download className="mr-2 h-5 w-5" />
        Descargar Comprobante
      </button>
      <p className="text-sm text-gray-600 mt-2">
        Guarda tu comprobante oficial de participación
      </p>
    </div>
  );
};

export default PDFGenerator;