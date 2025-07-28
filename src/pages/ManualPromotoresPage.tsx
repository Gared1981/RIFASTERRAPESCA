import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Download, Users, DollarSign, Gift, ExternalLink, Copy, MessageSquare, TrendingUp, Award, Shield, Clock, CheckCircle, AlertTriangle, Star } from 'lucide-react';
import Footer from '../components/Footer';
import toast from 'react-hot-toast';

const ManualPromotoresPage: React.FC = () => {
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('¡Texto copiado al portapapeles!');
    } catch (error) {
      toast.error('Error al copiar el texto');
    }
  };

  const handleDownloadPDF = () => {
    // Crear enlace de descarga del manual
    const pdfUrl = 'data:text/html;charset=utf-8,' + encodeURIComponent(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Manual para Promotores - Sorteos Terrapesca</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; color: #333; }
          h1 { color: #003B73; border-bottom: 3px solid #FF6B35; padding-bottom: 10px; }
          h2 { color: #003B73; margin-top: 30px; }
          h3 { color: #FF6B35; }
          .highlight { background: #FFD700; padding: 2px 6px; border-radius: 3px; font-weight: bold; }
          .contact { background: #f0f9ff; padding: 15px; border-left: 4px solid #003B73; margin: 20px 0; }
          .commission { background: #f0fdf4; padding: 15px; border-left: 4px solid #22c55e; margin: 20px 0; }
          .warning { background: #fef3cd; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0; }
          .example { background: #f8f9fa; padding: 15px; border: 1px solid #dee2e6; border-radius: 5px; margin: 10px 0; }
          .step { background: #e0f2fe; padding: 10px; margin: 10px 0; border-radius: 5px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #003B73; color: white; }
          .footer { margin-top: 50px; padding-top: 20px; border-top: 2px solid #003B73; text-align: center; }
        </style>
      </head>
      <body>
        <h1>🎣 Manual para Promotores - Sorteos Terrapesca</h1>
        
        <div class="contact">
          <h2>📞 Información de Contacto</h2>
          <p><strong>WhatsApp:</strong> +52 668 688 9571</p>
          <p><strong>Email:</strong> ventasweb@terrapesca.com</p>
          <p><strong>Página Web:</strong> https://voluble-marigold-f68bd1.netlify.app</p>
          <p><strong>Ubicación:</strong> Los Mochis, Sinaloa, México</p>
        </div>
        
        <h2>🎯 ¿Qué es el Programa de Promotores?</h2>
        <p>El programa de promotores de Sorteos Terrapesca te permite <span class="highlight">ganar dinero</span> promocionando nuestros sorteos de equipos de pesca profesionales. Por cada boleto que vendas, recibes una comisión inmediata.</p>
        
        <div class="commission">
          <h3>💰 Sistema de Comisiones</h3>
          <table>
            <tr>
              <th>Concepto</th>
              <th>Comisión</th>
              <th>Cuándo se paga</th>
            </tr>
            <tr>
              <td>Por cada boleto vendido</td>
              <td><strong>$1,000 MXN</strong></td>
              <td>Al confirmar el pago del cliente</td>
            </tr>
            <tr>
              <td>Bonus si tu cliente gana</td>
              <td><strong>$1,000 MXN adicionales</strong></td>
              <td>Después del sorteo (si aplica)</td>
            </tr>
          </table>
        </div>
        
        <h2>🚀 Cómo Empezar</h2>
        
        <div class="step">
          <h3>Paso 1: Obtén tu Código de Promotor</h3>
          <p>Contacta al administrador para obtener tu código único de promotor (ej: JP001, MARIA123, etc.)</p>
        </div>
        
        <div class="step">
          <h3>Paso 2: Recibe tu Enlace Personalizado</h3>
          <p>Tu enlace será: <code>https://voluble-marigold-f68bd1.netlify.app/boletos?promo=TUCODIGO</code></p>
        </div>
        
        <div class="step">
          <h3>Paso 3: Comparte y Vende</h3>
          <p>Comparte tu enlace en redes sociales, WhatsApp, con amigos y familiares.</p>
        </div>
        
        <h2>📱 Cómo Promocionar Efectivamente</h2>
        
        <h3>🎯 Estrategias de Venta</h3>
        <ul>
          <li><strong>Redes Sociales:</strong> Comparte en Facebook, Instagram, TikTok</li>
          <li><strong>WhatsApp:</strong> Envía a tus contactos y grupos</li>
          <li><strong>Boca a boca:</strong> Habla con amigos, familia, compañeros</li>
          <li><strong>Comunidades de pesca:</strong> Grupos especializados en pesca deportiva</li>
        </ul>
        
        <h3>📝 Mensajes Sugeridos</h3>
        
        <div class="example">
          <h4>Para WhatsApp:</h4>
          <p>🎣 ¡Hola! Te comparto una oportunidad increíble de ganar equipos de pesca profesionales en los Sorteos Terrapesca. 🏆</p>
          <p>✨ Premios espectaculares de pesca deportiva</p>
          <p>💰 Boletos desde $150 MXN</p>
          <p>🎯 Sorteos transparentes transmitidos en vivo</p>
          <p>🔗 Compra aquí: [TU ENLACE]</p>
          <p>¡No te pierdas esta oportunidad! 🍀</p>
        </div>
        
        <div class="example">
          <h4>Para Redes Sociales:</h4>
          <p>🎣 ¿Eres amante de la pesca? ¡Esta es tu oportunidad! 🏆</p>
          <p>Sorteos Terrapesca tiene increíbles premios de equipos profesionales de pesca. Boletos desde $150 MXN.</p>
          <p>✅ Sorteos transparentes en vivo</p>
          <p>✅ Premios de alta calidad</p>
          <p>✅ Empresa confiable de Sinaloa</p>
          <p>🔗 Participa aquí: [TU ENLACE]</p>
          <p>#Pesca #Sorteos #Terrapesca #EquipaTuAventura</p>
        </div>
        
        <h2>💼 Seguimiento de Ventas</h2>
        
        <h3>📊 Dashboard de Promotor</h3>
        <p>Tendrás acceso a un dashboard donde podrás ver:</p>
        <ul>
          <li>✅ Número total de boletos vendidos</li>
          <li>✅ Comisiones acumuladas</li>
          <li>✅ Estado de pagos</li>
          <li>✅ Historial de ventas</li>
          <li>✅ Enlaces personalizados</li>
        </ul>
        
        <h3>🔗 Tipos de Enlaces</h3>
        <table>
          <tr>
            <th>Tipo de Enlace</th>
            <th>Formato</th>
            <th>Uso</th>
          </tr>
          <tr>
            <td>General</td>
            <td>/boletos?promo=TUCODIGO</td>
            <td>Para todos los sorteos activos</td>
          </tr>
          <tr>
            <td>Sorteo específico</td>
            <td>/boletos?promo=TUCODIGO&raffle=123</td>
            <td>Para un sorteo en particular</td>
          </tr>
        </table>
        
        <h2>💰 Sistema de Pagos</h2>
        
        <div class="commission">
          <h3>🏦 Cómo y Cuándo Cobras</h3>
          <ol>
            <li><strong>Venta Confirmada:</strong> Cliente paga su boleto</li>
            <li><strong>Registro Automático:</strong> El sistema registra tu venta</li>
            <li><strong>Acumulación:</strong> Tus comisiones se acumulan</li>
            <li><strong>Pago Semanal:</strong> Recibes tus comisiones cada semana</li>
          </ol>
        </div>
        
        <h3>📋 Métodos de Pago para Promotores</h3>
        <ul>
          <li>💳 Transferencia bancaria (SPEI)</li>
          <li>📱 Mercado Pago</li>
          <li>💵 Efectivo (en ubicación física)</li>
        </ul>
        
        <h2>🏆 Programa de Incentivos</h2>
        
        <h3>🌟 Niveles de Promotor</h3>
        <table>
          <tr>
            <th>Nivel</th>
            <th>Ventas Mensuales</th>
            <th>Beneficios Extra</th>
          </tr>
          <tr>
            <td>Bronce</td>
            <td>1-10 boletos</td>
            <td>Comisión estándar</td>
          </tr>
          <tr>
            <td>Plata</td>
            <td>11-25 boletos</td>
            <td>+5% comisión extra</td>
          </tr>
          <tr>
            <td>Oro</td>
            <td>26-50 boletos</td>
            <td>+10% comisión extra</td>
          </tr>
          <tr>
            <td>Diamante</td>
            <td>50+ boletos</td>
            <td>+15% comisión extra + Premios especiales</td>
          </tr>
        </table>
        
        <h2>📚 Preguntas Frecuentes</h2>
        
        <h3>❓ ¿Cómo sé si alguien compró con mi código?</h3>
        <p>El sistema registra automáticamente todas las ventas con tu código. Puedes ver el reporte en tiempo real en tu dashboard.</p>
        
        <h3>❓ ¿Cuándo recibo mis comisiones?</h3>
        <p>Las comisiones se pagan semanalmente, los días viernes, por transferencia bancaria o el método que prefieras.</p>
        
        <h3>❓ ¿Qué pasa si mi cliente no paga?</h3>
        <p>Solo recibes comisión cuando el cliente confirma su pago. Si no paga en 3 horas, el boleto se libera automáticamente.</p>
        
        <h3>❓ ¿Puedo tener múltiples códigos?</h3>
        <p>Cada promotor tiene un código único. Si necesitas códigos adicionales para diferentes campañas, contacta al administrador.</p>
        
        <h3>❓ ¿Hay límite de ventas?</h3>
        <p>¡No hay límite! Mientras más vendas, más ganas. Los mejores promotores pueden ganar miles de pesos al mes.</p>
        
        <h2>🛡️ Términos y Condiciones</h2>
        
        <div class="warning">
          <h3>⚠️ Importante</h3>
          <ul>
            <li>✅ Promociona solo con información veraz</li>
            <li>✅ Respeta las fechas de los sorteos</li>
            <li>✅ No hagas promesas que no puedas cumplir</li>
            <li>✅ Mantén un trato profesional con los clientes</li>
            <li>❌ No uses métodos de spam o publicidad engañosa</li>
          </ul>
        </div>
        
        <h2>🎯 Consejos para Maximizar Ventas</h2>
        
        <h3>🔥 Estrategias Probadas</h3>
        <ol>
          <li><strong>Timing:</strong> Promociona cuando hay sorteos activos</li>
          <li><strong>Urgencia:</strong> Menciona fechas límite de sorteos</li>
          <li><strong>Beneficios:</strong> Destaca la calidad de los premios</li>
          <li><strong>Confianza:</strong> Comparte testimonios de ganadores</li>
          <li><strong>Facilidad:</strong> Explica lo fácil que es participar</li>
        </ol>
        
        <h3>📈 Mejores Horarios para Promocionar</h3>
        <ul>
          <li>🌅 <strong>Mañanas:</strong> 8:00 AM - 10:00 AM</li>
          <li>🌆 <strong>Tardes:</strong> 6:00 PM - 9:00 PM</li>
          <li>📅 <strong>Fines de semana:</strong> Todo el día</li>
          <li>🎣 <strong>Días de pesca:</strong> Viernes y sábados</li>
        </ul>
        
        <h2>📞 Soporte para Promotores</h2>
        
        <div class="contact">
          <h3>🆘 ¿Necesitas Ayuda?</h3>
          <p><strong>WhatsApp Directo:</strong> +52 668 688 9571</p>
          <p><strong>Email:</strong> ventasweb@terrapesca.com</p>
          <p><strong>Horario de Atención:</strong> Lunes a Viernes, 9:00 AM - 6:00 PM</p>
          <p><strong>Respuesta Promedio:</strong> Menos de 2 horas</p>
        </div>
        
        <h3>🎓 Capacitación Disponible</h3>
        <ul>
          <li>✅ Sesiones de entrenamiento por WhatsApp</li>
          <li>✅ Material promocional personalizado</li>
          <li>✅ Estrategias de venta probadas</li>
          <li>✅ Soporte técnico completo</li>
        </ul>
        
        <div class="footer">
          <h2>🚀 ¡Comienza Hoy Mismo!</h2>
          <p>Contacta al administrador para obtener tu código de promotor y comenzar a ganar dinero promocionando Sorteos Terrapesca.</p>
          <p><strong>WhatsApp:</strong> +52 668 688 9571</p>
          <p><strong>Email:</strong> ventasweb@terrapesca.com</p>
          <p style="margin-top: 30px; font-size: 14px; color: #666;">
            © ${new Date().getFullYear()} Sorteos Terrapesca. Manual para Promotores v1.0
          </p>
        </div>
      </body>
      </html>
    `);
    
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = 'Manual-Promotores-Sorteos-Terrapesca.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-8">
            <Link
              to="/"
              className="inline-flex items-center text-terrapesca-green-600 hover:text-terrapesca-green-700 font-medium mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al inicio
            </Link>
            
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-4xl font-bold text-terrapesca-blue-800 mb-2">
                  🎣 Manual para Promotores
                </h1>
                <p className="text-terrapesca-blue-600 text-lg">
                  Guía completa para ganar dinero promocionando Sorteos Terrapesca
                </p>
              </div>
              
              <button
                onClick={handleDownloadPDF}
                className="mt-4 md:mt-0 inline-flex items-center px-6 py-3 bg-terrapesca-orange-500 text-white rounded-lg hover:bg-terrapesca-orange-600 transition-colors font-semibold shadow-lg"
              >
                <Download className="mr-2 h-5 w-5" />
                Descargar Manual PDF
              </button>
            </div>
          </div>

          {/* Información de contacto destacada */}
          <div className="mb-8 p-6 bg-gradient-to-r from-terrapesca-blue-50 to-terrapesca-blue-100 border border-terrapesca-blue-200 rounded-lg">
            <div className="flex items-center mb-4">
              <MessageSquare className="h-8 w-8 text-terrapesca-blue-600 mr-4" />
              <div>
                <h3 className="text-xl font-semibold text-terrapesca-blue-800 mb-1">
                  📞 Contacto para Promotores
                </h3>
                <p className="text-terrapesca-blue-700">
                  Para obtener tu código de promotor y comenzar a ganar dinero
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <MessageSquare className="h-5 w-5 text-terrapesca-green-600 mr-2" />
                <span className="font-semibold text-terrapesca-blue-800">WhatsApp:</span>
                <span className="ml-2 text-terrapesca-blue-700">+52 668 688 9571</span>
                <button
                  onClick={() => copyToClipboard('+52 668 688 9571')}
                  className="ml-2 p-1 text-terrapesca-blue-600 hover:text-terrapesca-blue-800"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
              <div className="flex items-center">
                <span className="font-semibold text-terrapesca-blue-800">Email:</span>
                <span className="ml-2 text-terrapesca-blue-700">ventasweb@terrapesca.com</span>
                <button
                  onClick={() => copyToClipboard('ventasweb@terrapesca.com')}
                  className="ml-2 p-1 text-terrapesca-blue-600 hover:text-terrapesca-blue-800"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Contenido del manual */}
          <div className="space-y-8">
            {/* ¿Qué es el programa? */}
            <section className="bg-white rounded-lg shadow-terrapesca p-6 border border-terrapesca-blue-100">
              <h2 className="text-2xl font-bold text-terrapesca-blue-800 mb-4 flex items-center">
                🎯 ¿Qué es el Programa de Promotores?
              </h2>
              <p className="text-terrapesca-blue-600 text-lg mb-4">
                El programa de promotores de Sorteos Terrapesca te permite <strong className="text-terrapesca-orange-600">ganar dinero</strong> promocionando 
                nuestros sorteos de equipos de pesca profesionales. Por cada boleto que vendas, recibes una comisión inmediata.
              </p>
              <div className="bg-terrapesca-green-50 border border-terrapesca-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-terrapesca-green-800 mb-2">✨ Beneficios del Programa:</h3>
                <ul className="text-terrapesca-green-700 space-y-1">
                  <li>• 💰 Comisiones inmediatas por cada venta</li>
                  <li>• 🏆 Bonos adicionales si tu cliente gana</li>
                  <li>• 📊 Dashboard para seguimiento en tiempo real</li>
                  <li>• 🎯 Enlaces personalizados únicos</li>
                  <li>• 🆘 Soporte técnico completo</li>
                </ul>
              </div>
            </section>

            {/* Sistema de comisiones */}
            <section className="bg-gradient-to-r from-terrapesca-green-50 to-terrapesca-green-100 rounded-lg shadow-terrapesca p-6 border border-terrapesca-green-200">
              <h2 className="text-2xl font-bold text-terrapesca-green-800 mb-6 flex items-center">
                <DollarSign className="mr-3" />
                💰 Sistema de Comisiones
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white rounded-lg p-6 shadow-md border border-terrapesca-green-300">
                  <div className="flex items-center mb-4">
                    <TrendingUp className="h-8 w-8 text-terrapesca-green-600 mr-3" />
                    <h3 className="text-xl font-semibold text-terrapesca-green-800">Por Cada Venta</h3>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-terrapesca-green-600 mb-2">$1,000</div>
                    <div className="text-terrapesca-green-700 font-medium">MXN por boleto vendido</div>
                    <div className="text-sm text-terrapesca-green-600 mt-2">Se paga al confirmar el pago del cliente</div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-md border border-terrapesca-orange-300">
                  <div className="flex items-center mb-4">
                    <Award className="h-8 w-8 text-terrapesca-orange-600 mr-3" />
                    <h3 className="text-xl font-semibold text-terrapesca-orange-800">Bonus Ganador</h3>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-terrapesca-orange-600 mb-2">$1,000</div>
                    <div className="text-terrapesca-orange-700 font-medium">MXN adicionales</div>
                    <div className="text-sm text-terrapesca-orange-600 mt-2">Si tu cliente gana el sorteo</div>
                  </div>
                </div>
              </div>

              <div className="bg-terrapesca-blue-50 border border-terrapesca-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-terrapesca-blue-800 mb-2">📈 Ejemplo de Ganancias:</h4>
                <div className="text-terrapesca-blue-700 space-y-1">
                  <p>• Vendes 10 boletos = <strong>$10,000 MXN</strong> en comisiones</p>
                  <p>• Si 1 de tus clientes gana = <strong>+$1,000 MXN</strong> de bonus</p>
                  <p>• <strong>Total potencial: $11,000 MXN</strong> 🎉</p>
                </div>
              </div>
            </section>

            {/* Cómo empezar */}
            <section className="bg-white rounded-lg shadow-terrapesca p-6 border border-terrapesca-blue-100">
              <h2 className="text-2xl font-bold text-terrapesca-blue-800 mb-6 flex items-center">
                🚀 Cómo Empezar (3 Pasos Simples)
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-terrapesca-green-100 text-terrapesca-green-700 rounded-full w-10 h-10 flex items-center justify-center font-bold mr-4 mt-1">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold text-terrapesca-blue-800 mb-2">📱 Contacta para obtener tu código</h3>
                    <p className="text-terrapesca-blue-600 mb-3">
                      Envía un WhatsApp al <strong>+52 668 688 9571</strong> solicitando tu código único de promotor
                    </p>
                    <div className="bg-terrapesca-gray-50 p-3 rounded-lg border border-terrapesca-gray-200">
                      <p className="text-sm text-terrapesca-blue-700 mb-2"><strong>Mensaje sugerido:</strong></p>
                      <p className="text-sm text-terrapesca-blue-600 italic">
                        "Hola, me interesa ser promotor de Sorteos Terrapesca. ¿Pueden asignarme un código de promotor?"
                      </p>
                      <button
                        onClick={() => copyToClipboard('Hola, me interesa ser promotor de Sorteos Terrapesca. ¿Pueden asignarme un código de promotor?')}
                        className="mt-2 inline-flex items-center text-xs text-terrapesca-blue-600 hover:text-terrapesca-blue-800"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copiar mensaje
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-terrapesca-green-100 text-terrapesca-green-700 rounded-full w-10 h-10 flex items-center justify-center font-bold mr-4 mt-1">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold text-terrapesca-blue-800 mb-2">🔗 Recibe tu enlace personalizado</h3>
                    <p className="text-terrapesca-blue-600 mb-3">
                      Te proporcionaremos un enlace único que registra automáticamente tus ventas
                    </p>
                    <div className="bg-terrapesca-blue-50 p-3 rounded-lg border border-terrapesca-blue-200">
                      <p className="text-sm text-terrapesca-blue-700 mb-1"><strong>Formato de tu enlace:</strong></p>
                      <code className="text-sm text-terrapesca-blue-800 bg-white px-2 py-1 rounded">
                        https://voluble-marigold-f68bd1.netlify.app/boletos?promo=TUCODIGO
                      </code>
                    </div>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-terrapesca-green-100 text-terrapesca-green-700 rounded-full w-10 h-10 flex items-center justify-center font-bold mr-4 mt-1">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold text-terrapesca-blue-800 mb-2">📢 Comparte y comienza a ganar</h3>
                    <p className="text-terrapesca-blue-600 mb-3">
                      Promociona tu enlace en redes sociales, WhatsApp, con amigos y familiares
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <div className="bg-terrapesca-green-50 p-2 rounded text-center text-xs text-terrapesca-green-700">
                        📱 WhatsApp
                      </div>
                      <div className="bg-terrapesca-blue-50 p-2 rounded text-center text-xs text-terrapesca-blue-700">
                        📘 Facebook
                      </div>
                      <div className="bg-terrapesca-orange-50 p-2 rounded text-center text-xs text-terrapesca-orange-700">
                        📸 Instagram
                      </div>
                      <div className="bg-terrapesca-gray-50 p-2 rounded text-center text-xs text-terrapesca-gray-700">
                        🎵 TikTok
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Estrategias de promoción */}
            <section className="bg-white rounded-lg shadow-terrapesca p-6 border border-terrapesca-blue-100">
              <h2 className="text-2xl font-bold text-terrapesca-blue-800 mb-6 flex items-center">
                📱 Estrategias de Promoción Efectivas
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-terrapesca-blue-800 mb-4 flex items-center">
                    <MessageSquare className="mr-2 h-5 w-5" />
                    Mensajes para WhatsApp
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="bg-terrapesca-green-50 border border-terrapesca-green-200 rounded-lg p-4">
                      <h4 className="font-medium text-terrapesca-green-800 mb-2">Mensaje Básico:</h4>
                      <p className="text-sm text-terrapesca-green-700 mb-2">
                        🎣 ¡Hola! Te comparto una oportunidad increíble de ganar equipos de pesca profesionales en los Sorteos Terrapesca. 🏆<br/><br/>
                        ✨ Premios espectaculares de pesca deportiva<br/>
                        💰 Boletos desde $150 MXN<br/>
                        🎯 Sorteos transparentes transmitidos en vivo<br/><br/>
                        🔗 Compra aquí: [TU ENLACE]<br/><br/>
                        ¡No te pierdas esta oportunidad! 🍀
                      </p>
                      <button
                        onClick={() => copyToClipboard('🎣 ¡Hola! Te comparto una oportunidad increíble de ganar equipos de pesca profesionales en los Sorteos Terrapesca. 🏆\n\n✨ Premios espectaculares de pesca deportiva\n💰 Boletos desde $150 MXN\n🎯 Sorteos transparentes transmitidos en vivo\n\n🔗 Compra aquí: [TU ENLACE]\n\n¡No te pierdas esta oportunidad! 🍀')}
                        className="inline-flex items-center text-xs text-terrapesca-green-600 hover:text-terrapesca-green-800"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copiar mensaje
                      </button>
                    </div>

                    <div className="bg-terrapesca-blue-50 border border-terrapesca-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-terrapesca-blue-800 mb-2">Mensaje con Urgencia:</h4>
                      <p className="text-sm text-terrapesca-blue-700 mb-2">
                        ⏰ ¡ÚLTIMOS DÍAS! Sorteo Terrapesca - Equipos de pesca profesionales 🎣<br/><br/>
                        🏆 Premio: [DESCRIPCIÓN DEL PREMIO]<br/>
                        📅 Sorteo: [FECHA]<br/>
                        💰 Boletos: $[PRECIO] MXN<br/><br/>
                        🔗 ¡Participa YA!: [TU ENLACE]<br/><br/>
                        ¡No dejes pasar esta oportunidad! ⚡
                      </p>
                      <button
                        onClick={() => copyToClipboard('⏰ ¡ÚLTIMOS DÍAS! Sorteo Terrapesca - Equipos de pesca profesionales 🎣\n\n🏆 Premio: [DESCRIPCIÓN DEL PREMIO]\n📅 Sorteo: [FECHA]\n💰 Boletos: $[PRECIO] MXN\n\n🔗 ¡Participa YA!: [TU ENLACE]\n\n¡No dejes pasar esta oportunidad! ⚡')}
                        className="inline-flex items-center text-xs text-terrapesca-blue-600 hover:text-terrapesca-blue-800"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copiar mensaje
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-terrapesca-blue-800 mb-4 flex items-center">
                    📱 Para Redes Sociales
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="bg-terrapesca-orange-50 border border-terrapesca-orange-200 rounded-lg p-4">
                      <h4 className="font-medium text-terrapesca-orange-800 mb-2">Post para Facebook/Instagram:</h4>
                      <p className="text-sm text-terrapesca-orange-700 mb-2">
                        🎣 ¿Eres amante de la pesca? ¡Esta es tu oportunidad! 🏆<br/><br/>
                        Sorteos Terrapesca tiene increíbles premios de equipos profesionales de pesca. Boletos desde $150 MXN.<br/><br/>
                        ✅ Sorteos transparentes en vivo<br/>
                        ✅ Premios de alta calidad<br/>
                        ✅ Empresa confiable de Sinaloa<br/><br/>
                        🔗 Participa aquí: [TU ENLACE]<br/><br/>
                        #Pesca #Sorteos #Terrapesca #EquipaTuAventura
                      </p>
                      <button
                        onClick={() => copyToClipboard('🎣 ¿Eres amante de la pesca? ¡Esta es tu oportunidad! 🏆\n\nSorteos Terrapesca tiene increíbles premios de equipos profesionales de pesca. Boletos desde $150 MXN.\n\n✅ Sorteos transparentes en vivo\n✅ Premios de alta calidad\n✅ Empresa confiable de Sinaloa\n\n🔗 Participa aquí: [TU ENLACE]\n\n#Pesca #Sorteos #Terrapesca #EquipaTuAventura')}
                        className="inline-flex items-center text-xs text-terrapesca-orange-600 hover:text-terrapesca-orange-800"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copiar post
                      </button>
                    </div>

                    <div className="bg-terrapesca-gray-50 border border-terrapesca-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-terrapesca-gray-800 mb-2">Hashtags Sugeridos:</h4>
                      <p className="text-sm text-terrapesca-gray-700 mb-2">
                        #Pesca #PescaDeportiva #Sorteos #Terrapesca #EquipaTuAventura #PescaMexico #Sinaloa #LosMochis #PremiosPesca #SorteoTransparente
                      </p>
                      <button
                        onClick={() => copyToClipboard('#Pesca #PescaDeportiva #Sorteos #Terrapesca #EquipaTuAventura #PescaMexico #Sinaloa #LosMochis #PremiosPesca #SorteoTransparente')}
                        className="inline-flex items-center text-xs text-terrapesca-gray-600 hover:text-terrapesca-gray-800"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copiar hashtags
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Seguimiento y dashboard */}
            <section className="bg-white rounded-lg shadow-terrapesca p-6 border border-terrapesca-blue-100">
              <h2 className="text-2xl font-bold text-terrapesca-blue-800 mb-6 flex items-center">
                📊 Seguimiento de Ventas y Dashboard
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-terrapesca-blue-800 mb-4">📈 Qué puedes ver en tu Dashboard:</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center text-terrapesca-blue-600">
                      <CheckCircle className="h-4 w-4 text-terrapesca-green-500 mr-2" />
                      Número total de boletos vendidos
                    </li>
                    <li className="flex items-center text-terrapesca-blue-600">
                      <CheckCircle className="h-4 w-4 text-terrapesca-green-500 mr-2" />
                      Comisiones acumuladas en tiempo real
                    </li>
                    <li className="flex items-center text-terrapesca-blue-600">
                      <CheckCircle className="h-4 w-4 text-terrapesca-green-500 mr-2" />
                      Estado de pagos (pendientes/pagados)
                    </li>
                    <li className="flex items-center text-terrapesca-blue-600">
                      <CheckCircle className="h-4 w-4 text-terrapesca-green-500 mr-2" />
                      Historial completo de ventas
                    </li>
                    <li className="flex items-center text-terrapesca-blue-600">
                      <CheckCircle className="h-4 w-4 text-terrapesca-green-500 mr-2" />
                      Enlaces personalizados para cada sorteo
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-terrapesca-blue-800 mb-4">🔗 Tipos de Enlaces:</h3>
                  <div className="space-y-3">
                    <div className="bg-terrapesca-blue-50 p-3 rounded-lg border border-terrapesca-blue-200">
                      <h4 className="font-medium text-terrapesca-blue-800 mb-1">Enlace General:</h4>
                      <code className="text-xs text-terrapesca-blue-700 bg-white px-2 py-1 rounded">
                        /boletos?promo=TUCODIGO
                      </code>
                      <p className="text-xs text-terrapesca-blue-600 mt-1">Para todos los sorteos activos</p>
                    </div>
                    
                    <div className="bg-terrapesca-green-50 p-3 rounded-lg border border-terrapesca-green-200">
                      <h4 className="font-medium text-terrapesca-green-800 mb-1">Enlace Específico:</h4>
                      <code className="text-xs text-terrapesca-green-700 bg-white px-2 py-1 rounded">
                        /boletos?promo=TUCODIGO&raffle=123
                      </code>
                      <p className="text-xs text-terrapesca-green-600 mt-1">Para un sorteo en particular</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Sistema de pagos */}
            <section className="bg-gradient-to-r from-terrapesca-green-50 to-terrapesca-green-100 rounded-lg shadow-terrapesca p-6 border border-terrapesca-green-200">
              <h2 className="text-2xl font-bold text-terrapesca-green-800 mb-6 flex items-center">
                💰 Sistema de Pagos para Promotores
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg p-6 shadow-md">
                  <h3 className="text-lg font-semibold text-terrapesca-green-800 mb-4 flex items-center">
                    <Clock className="mr-2 h-5 w-5" />
                    ¿Cuándo cobras?
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <div className="bg-terrapesca-green-100 text-terrapesca-green-700 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                        1
                      </div>
                      <div>
                        <p className="font-medium text-terrapesca-green-800">Cliente paga su boleto</p>
                        <p className="text-sm text-terrapesca-green-600">El sistema confirma el pago automáticamente</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="bg-terrapesca-green-100 text-terrapesca-green-700 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                        2
                      </div>
                      <div>
                        <p className="font-medium text-terrapesca-green-800">Se registra tu venta</p>
                        <p className="text-sm text-terrapesca-green-600">Aparece inmediatamente en tu dashboard</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="bg-terrapesca-green-100 text-terrapesca-green-700 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                        3
                      </div>
                      <div>
                        <p className="font-medium text-terrapesca-green-800">Recibes tu pago</p>
                        <p className="text-sm text-terrapesca-green-600">Cada viernes por el método que prefieras</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-md">
                  <h3 className="text-lg font-semibold text-terrapesca-green-800 mb-4 flex items-center">
                    <DollarSign className="mr-2 h-5 w-5" />
                    Métodos de Pago
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center p-3 bg-terrapesca-blue-50 rounded-lg border border-terrapesca-blue-200">
                      <Shield className="h-5 w-5 text-terrapesca-blue-600 mr-3" />
                      <div>
                        <p className="font-medium text-terrapesca-blue-800">Transferencia Bancaria (SPEI)</p>
                        <p className="text-sm text-terrapesca-blue-600">Inmediata y sin comisiones</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center p-3 bg-terrapesca-green-50 rounded-lg border border-terrapesca-green-200">
                      <MessageSquare className="h-5 w-5 text-terrapesca-green-600 mr-3" />
                      <div>
                        <p className="font-medium text-terrapesca-green-800">Mercado Pago</p>
                        <p className="text-sm text-terrapesca-green-600">Rápido y seguro</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center p-3 bg-terrapesca-orange-50 rounded-lg border border-terrapesca-orange-200">
                      <Users className="h-5 w-5 text-terrapesca-orange-600 mr-3" />
                      <div>
                        <p className="font-medium text-terrapesca-orange-800">Efectivo</p>
                        <p className="text-sm text-terrapesca-orange-600">En ubicación física (Los Mochis)</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Programa de incentivos */}
            <section className="bg-white rounded-lg shadow-terrapesca p-6 border border-terrapesca-blue-100">
              <h2 className="text-2xl font-bold text-terrapesca-blue-800 mb-6 flex items-center">
                🏆 Programa de Incentivos y Niveles
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-b from-amber-100 to-amber-200 rounded-lg p-4 border border-amber-300">
                  <div className="text-center">
                    <div className="text-2xl mb-2">🥉</div>
                    <h3 className="font-bold text-amber-800 mb-2">Bronce</h3>
                    <p className="text-sm text-amber-700 mb-2">1-10 boletos/mes</p>
                    <p className="text-xs text-amber-600">Comisión estándar</p>
                  </div>
                </div>

                <div className="bg-gradient-to-b from-gray-100 to-gray-200 rounded-lg p-4 border border-gray-300">
                  <div className="text-center">
                    <div className="text-2xl mb-2">🥈</div>
                    <h3 className="font-bold text-gray-800 mb-2">Plata</h3>
                    <p className="text-sm text-gray-700 mb-2">11-25 boletos/mes</p>
                    <p className="text-xs text-gray-600">+5% comisión extra</p>
                  </div>
                </div>

                <div className="bg-gradient-to-b from-yellow-100 to-yellow-200 rounded-lg p-4 border border-yellow-300">
                  <div className="text-center">
                    <div className="text-2xl mb-2">🥇</div>
                    <h3 className="font-bold text-yellow-800 mb-2">Oro</h3>
                    <p className="text-sm text-yellow-700 mb-2">26-50 boletos/mes</p>
                    <p className="text-xs text-yellow-600">+10% comisión extra</p>
                  </div>
                </div>

                <div className="bg-gradient-to-b from-blue-100 to-blue-200 rounded-lg p-4 border border-blue-300">
                  <div className="text-center">
                    <div className="text-2xl mb-2">💎</div>
                    <h3 className="font-bold text-blue-800 mb-2">Diamante</h3>
                    <p className="text-sm text-blue-700 mb-2">50+ boletos/mes</p>
                    <p className="text-xs text-blue-600">+15% extra + Premios</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 bg-terrapesca-blue-50 border border-terrapesca-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-terrapesca-blue-800 mb-2">🌟 Beneficios Adicionales por Nivel:</h4>
                <ul className="text-sm text-terrapesca-blue-700 space-y-1">
                  <li>• <strong>Plata y superior:</strong> Acceso a sorteos exclusivos para promotores</li>
                  <li>• <strong>Oro y superior:</strong> Material promocional personalizado</li>
                  <li>• <strong>Diamante:</strong> Capacitación 1-a-1 y premios especiales trimestrales</li>
                </ul>
              </div>
            </section>

            {/* Consejos y mejores prácticas */}
            <section className="bg-white rounded-lg shadow-terrapesca p-6 border border-terrapesca-blue-100">
              <h2 className="text-2xl font-bold text-terrapesca-blue-800 mb-6 flex items-center">
                🎯 Consejos para Maximizar Ventas
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-terrapesca-blue-800 mb-4 flex items-center">
                    <Star className="mr-2 h-5 w-5" />
                    Estrategias Probadas
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <Clock className="h-4 w-4 text-terrapesca-green-500 mr-2 mt-1" />
                      <div>
                        <p className="font-medium text-terrapesca-blue-800">Timing perfecto</p>
                        <p className="text-sm text-terrapesca-blue-600">Promociona cuando hay sorteos activos y cerca de las fechas límite</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <AlertTriangle className="h-4 w-4 text-terrapesca-orange-500 mr-2 mt-1" />
                      <div>
                        <p className="font-medium text-terrapesca-blue-800">Crear urgencia</p>
                        <p className="text-sm text-terrapesca-blue-600">Menciona fechas límite y boletos disponibles restantes</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <Gift className="h-4 w-4 text-terrapesca-blue-500 mr-2 mt-1" />
                      <div>
                        <p className="font-medium text-terrapesca-blue-800">Destacar beneficios</p>
                        <p className="text-sm text-terrapesca-blue-600">Enfócate en la calidad de los premios y la transparencia</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <Shield className="h-4 w-4 text-terrapesca-green-500 mr-2 mt-1" />
                      <div>
                        <p className="font-medium text-terrapesca-blue-800">Generar confianza</p>
                        <p className="text-sm text-terrapesca-blue-600">Comparte testimonios de ganadores y la reputación de Terrapesca</p>
                      </div>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-terrapesca-blue-800 mb-4 flex items-center">
                    <Clock className="mr-2 h-5 w-5" />
                    Mejores Horarios
                  </h3>
                  <div className="space-y-3">
                    <div className="bg-terrapesca-green-50 p-3 rounded-lg border border-terrapesca-green-200">
                      <p className="font-medium text-terrapesca-green-800">🌅 Mañanas</p>
                      <p className="text-sm text-terrapesca-green-600">8:00 AM - 10:00 AM</p>
                      <p className="text-xs text-terrapesca-green-500">La gente revisa mensajes al despertar</p>
                    </div>
                    
                    <div className="bg-terrapesca-orange-50 p-3 rounded-lg border border-terrapesca-orange-200">
                      <p className="font-medium text-terrapesca-orange-800">🌆 Tardes</p>
                      <p className="text-sm text-terrapesca-orange-600">6:00 PM - 9:00 PM</p>
                      <p className="text-xs text-terrapesca-orange-500">Tiempo libre después del trabajo</p>
                    </div>
                    
                    <div className="bg-terrapesca-blue-50 p-3 rounded-lg border border-terrapesca-blue-200">
                      <p className="font-medium text-terrapesca-blue-800">📅 Fines de semana</p>
                      <p className="text-sm text-terrapesca-blue-600">Todo el día</p>
                      <p className="text-xs text-terrapesca-blue-500">Especialmente viernes y sábados (días de pesca)</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Preguntas frecuentes */}
            <section className="bg-white rounded-lg shadow-terrapesca p-6 border border-terrapesca-blue-100">
              <h2 className="text-2xl font-bold text-terrapesca-blue-800 mb-6">
                ❓ Preguntas Frecuentes
              </h2>
              
              <div className="space-y-4">
                <div className="border border-terrapesca-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-terrapesca-blue-800 mb-2">¿Cómo sé si alguien compró con mi código?</h3>
                  <p className="text-terrapesca-blue-600">El sistema registra automáticamente todas las ventas con tu código. Puedes ver el reporte en tiempo real en tu dashboard de promotor.</p>
                </div>

                <div className="border border-terrapesca-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-terrapesca-blue-800 mb-2">¿Cuándo recibo mis comisiones?</h3>
                  <p className="text-terrapesca-blue-600">Las comisiones se pagan semanalmente, los días viernes, por transferencia bancaria o el método que prefieras.</p>
                </div>

                <div className="border border-terrapesca-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-terrapesca-blue-800 mb-2">¿Qué pasa si mi cliente no paga?</h3>
                  <p className="text-terrapesca-blue-600">Solo recibes comisión cuando el cliente confirma su pago. Si no paga en 3 horas, el boleto se libera automáticamente y no se registra la venta.</p>
                </div>

                <div className="border border-terrapesca-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-terrapesca-blue-800 mb-2">¿Hay límite de ventas?</h3>
                  <p className="text-terrapesca-blue-600">¡No hay límite! Mientras más vendas, más ganas. Los mejores promotores pueden ganar miles de pesos al mes.</p>
                </div>

                <div className="border border-terrapesca-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-terrapesca-blue-800 mb-2">¿Puedo promocionar en cualquier red social?</h3>
                  <p className="text-terrapesca-blue-600">Sí, puedes usar cualquier plataforma: WhatsApp, Facebook, Instagram, TikTok, etc. Solo asegúrate de usar información veraz y tu enlace oficial.</p>
                </div>
              </div>
            </section>

            {/* Términos importantes */}
            <section className="bg-yellow-50 rounded-lg shadow-terrapesca p-6 border border-yellow-200">
              <h2 className="text-2xl font-bold text-yellow-800 mb-6 flex items-center">
                <AlertTriangle className="mr-3" />
                ⚠️ Términos y Condiciones Importantes
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-yellow-800 mb-3">✅ Permitido:</h3>
                  <ul className="space-y-2 text-yellow-700">
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                      Promocionar con información veraz
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                      Compartir en todas las redes sociales
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                      Usar material promocional oficial
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                      Mantener trato profesional
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-red-800 mb-3">❌ Prohibido:</h3>
                  <ul className="space-y-2 text-red-700">
                    <li className="flex items-start">
                      <X className="h-4 w-4 text-red-500 mr-2 mt-0.5" />
                      Spam o publicidad engañosa
                    </li>
                    <li className="flex items-start">
                      <X className="h-4 w-4 text-red-500 mr-2 mt-0.5" />
                      Prometer resultados garantizados
                    </li>
                    <li className="flex items-start">
                      <X className="h-4 w-4 text-red-500 mr-2 mt-0.5" />
                      Modificar precios o condiciones
                    </li>
                    <li className="flex items-start">
                      <X className="h-4 w-4 text-red-500 mr-2 mt-0.5" />
                      Usar códigos de otros promotores
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Soporte */}
            <section className="bg-gradient-to-r from-terrapesca-blue-50 to-terrapesca-blue-100 rounded-lg shadow-terrapesca p-6 border border-terrapesca-blue-200">
              <h2 className="text-2xl font-bold text-terrapesca-blue-800 mb-6 flex items-center">
                🆘 Soporte para Promotores
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-terrapesca-blue-800 mb-4">📞 Contacto Directo</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <MessageSquare className="h-5 w-5 text-terrapesca-green-600 mr-3" />
                      <div>
                        <p className="font-semibold text-terrapesca-blue-800">WhatsApp:</p>
                        <p className="text-terrapesca-blue-600">+52 668 688 9571</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <span className="font-semibold text-terrapesca-blue-800">Email:</span>
                      <span className="ml-2 text-terrapesca-blue-600">ventasweb@terrapesca.com</span>
                    </div>
                    
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-terrapesca-blue-600 mr-3" />
                      <div>
                        <p className="font-semibold text-terrapesca-blue-800">Horario:</p>
                        <p className="text-terrapesca-blue-600">Lun-Vie 9:00 AM - 6:00 PM</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-terrapesca-blue-800 mb-4">🎓 Capacitación Disponible</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center text-terrapesca-blue-600">
                      <CheckCircle className="h-4 w-4 text-terrapesca-green-500 mr-2" />
                      Sesiones de entrenamiento por WhatsApp
                    </li>
                    <li className="flex items-center text-terrapesca-blue-600">
                      <CheckCircle className="h-4 w-4 text-terrapesca-green-500 mr-2" />
                      Material promocional personalizado
                    </li>
                    <li className="flex items-center text-terrapesca-blue-600">
                      <CheckCircle className="h-4 w-4 text-terrapesca-green-500 mr-2" />
                      Estrategias de venta probadas
                    </li>
                    <li className="flex items-center text-terrapesca-blue-600">
                      <CheckCircle className="h-4 w-4 text-terrapesca-green-500 mr-2" />
                      Soporte técnico completo
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 bg-white rounded-lg p-4 border border-terrapesca-blue-300">
                <h4 className="font-semibold text-terrapesca-blue-800 mb-2">⚡ Respuesta Rápida:</h4>
                <p className="text-terrapesca-blue-700">
                  <strong>Tiempo promedio de respuesta:</strong> Menos de 2 horas en horario laboral
                </p>
              </div>
            </section>

            {/* Call to action final */}
            <section className="bg-gradient-to-r from-terrapesca-green-500 to-terrapesca-green-600 rounded-lg shadow-terrapesca p-8 text-center">
              <h2 className="text-3xl font-bold text-white mb-4">
                🚀 ¡Comienza a Ganar Dinero Hoy Mismo!
              </h2>
              <p className="text-green-100 mb-6 text-lg">
                Únete al programa de promotores de Sorteos Terrapesca y convierte tu red de contactos en ingresos reales.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <a
                  href="https://wa.me/526686889571?text=Hola,%20me%20interesa%20ser%20promotor%20de%20Sorteos%20Terrapesca.%20¿Pueden%20asignarme%20un%20código%20de%20promotor?"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white text-terrapesca-green-600 rounded-lg hover:bg-gray-100 transition-colors font-bold text-lg shadow-lg"
                >
                  <MessageSquare className="mr-3 h-6 w-6" />
                  Solicitar Código por WhatsApp
                </a>
                
                <a
                  href="mailto:ventasweb@terrapesca.com?subject=Solicitud%20de%20Código%20de%20Promotor&body=Hola,%20me%20interesa%20ser%20promotor%20de%20Sorteos%20Terrapesca.%20Por%20favor%20asígnenme%20un%20código%20de%20promotor."
                  className="inline-flex items-center justify-center px-8 py-4 bg-terrapesca-blue-600 text-white rounded-lg hover:bg-terrapesca-blue-700 transition-colors font-bold text-lg shadow-lg"
                >
                  <ExternalLink className="mr-3 h-6 w-6" />
                  Enviar Email
                </a>
              </div>
              
              <div className="text-green-100 text-sm">
                <p className="mb-2">
                  <strong>💰 Potencial de ganancias:</strong> $1,000 MXN por boleto vendido + bonos
                </p>
                <p>
                  <strong>⏰ Tiempo de activación:</strong> Menos de 24 horas
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ManualPromotoresPage;