import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, Download, Phone, Mail, MapPin, MessageSquare, Clock, 
  CreditCard, Shield, Gift, CheckCircle, AlertTriangle, Users, 
  TrendingUp, DollarSign, Trophy, Star, Copy, ExternalLink, 
  Target, Zap, Award, BarChart3, Calendar, Smartphone, Share2,
  Eye, Heart, ThumbsUp, Send, Megaphone, Crown, Gem
} from 'lucide-react';
import Footer from '../components/Footer';
import toast from 'react-hot-toast';

const ManualPromotoresPage: React.FC = () => {
  const [copiedText, setCopiedText] = useState<string>('');

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(label);
      toast.success(`${label} copiado al portapapeles`);
      setTimeout(() => setCopiedText(''), 2000);
    } catch (error) {
      toast.error('Error al copiar');
    }
  };

  const handleDownloadPDF = () => {
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
          h3 { color: #FF6B35; margin-top: 20px; }
          .highlight { background: #FFD700; padding: 2px 6px; border-radius: 3px; font-weight: bold; }
          .contact { background: #f0f9ff; padding: 15px; border-left: 4px solid #003B73; margin: 20px 0; }
          .commission { background: #f0fdf4; padding: 15px; border-left: 4px solid #22c55e; margin: 20px 0; }
          .warning { background: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0; }
          .example { background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #003B73; color: white; }
          .level { padding: 8px 12px; border-radius: 20px; color: white; font-weight: bold; }
          .bronze { background: #CD7F32; }
          .silver { background: #C0C0C0; color: #333; }
          .gold { background: #FFD700; color: #333; }
          .diamond { background: #B9F2FF; color: #333; }
        </style>
      </head>
      <body>
        <h1>👥 MANUAL COMPLETO PARA PROMOTORES</h1>
        <h2>🎣 SORTEOS TERRAPESCA</h2>
        
        <div class="contact">
          <h3>📞 CONTACTO INMEDIATO</h3>
          <p><strong>WhatsApp:</strong> +52 668 688 9571</p>
          <p><strong>Email:</strong> ventasweb@terrapesca.com</p>
          <p><strong>Horario:</strong> Lunes a Viernes 9:00 AM - 6:00 PM</p>
        </div>

        <h2>💰 SISTEMA DE COMISIONES</h2>
        <div class="commission">
          <h3>💵 GANANCIAS GARANTIZADAS</h3>
          <ul>
            <li><strong>$1,000 MXN por cada boleto vendido</strong></li>
            <li><strong>$1,000 MXN adicionales si tu cliente gana</strong></li>
            <li><strong>Pagos semanales</strong></li>
            <li><strong>Sin límite de ventas</strong></li>
          </ul>
        </div>

        <h3>📊 EJEMPLOS DE GANANCIAS</h3>
        <table>
          <tr><th>Boletos Vendidos</th><th>Comisión Base</th><th>Si 1 Cliente Gana</th><th>Total Posible</th></tr>
          <tr><td>10</td><td>$10,000</td><td>+$1,000</td><td>$11,000</td></tr>
          <tr><td>25</td><td>$25,000</td><td>+$1,000</td><td>$26,000</td></tr>
          <tr><td>50</td><td>$50,000</td><td>+$1,000</td><td>$51,000</td></tr>
          <tr><td>100</td><td>$100,000</td><td>+$1,000</td><td>$101,000</td></tr>
        </table>

        <h2>🚀 CÓMO EMPEZAR (3 PASOS)</h2>
        <ol>
          <li><strong>Contacta:</strong> WhatsApp +52 668 688 9571</li>
          <li><strong>Recibe:</strong> Tu código único y enlace personalizado</li>
          <li><strong>Promociona:</strong> Comparte y comienza a ganar</li>
        </ol>

        <h2>📱 ESTRATEGIAS DE PROMOCIÓN</h2>
        
        <h3>💬 MENSAJES PARA WHATSAPP</h3>
        <div class="example">
          <p><strong>Mensaje 1 - Directo:</strong></p>
          <p>🎣 ¡Hola! ¿Te gustaría participar en el sorteo de equipos de pesca profesionales de Terrapesca? Solo $150 por boleto y puedes ganar increíbles premios. ¡Mira los detalles aquí! [TU_ENLACE]</p>
        </div>

        <div class="example">
          <p><strong>Mensaje 2 - Urgencia:</strong></p>
          <p>⏰ ¡ÚLTIMOS DÍAS! El sorteo de Terrapesca está por cerrar. No te quedes sin tu oportunidad de ganar equipos de pesca profesionales. ¡Compra tu boleto ahora! [TU_ENLACE]</p>
        </div>

        <h3>📱 POSTS PARA REDES SOCIALES</h3>
        <div class="example">
          <p><strong>Facebook/Instagram:</strong></p>
          <p>🎣 ¡SORTEO TERRAPESCA! 🎣<br>
          ✨ Equipos de pesca profesionales<br>
          💰 Solo $150 por boleto<br>
          🚚 Envío GRATIS a toda México<br>
          🔗 Compra aquí: [TU_ENLACE]<br>
          #SorteoTerrapesca #EquipaTuAventura #PescaDeportiva</p>
        </div>

        <h2>🏆 PROGRAMA DE INCENTIVOS</h2>
        <table>
          <tr><th>Nivel</th><th>Ventas Mensuales</th><th>Comisión Extra</th><th>Beneficios</th></tr>
          <tr><td class="level bronze">BRONCE</td><td>1-10 boletos</td><td>+$0</td><td>Comisión base</td></tr>
          <tr><td class="level silver">PLATA</td><td>11-25 boletos</td><td>+$100 por boleto</td><td>Capacitación premium</td></tr>
          <tr><td class="level gold">ORO</td><td>26-50 boletos</td><td>+$200 por boleto</td><td>Soporte prioritario</td></tr>
          <tr><td class="level diamond">DIAMANTE</td><td>51+ boletos</td><td>+$300 por boleto</td><td>Bonos especiales</td></tr>
        </table>

        <h2>📊 SEGUIMIENTO DE VENTAS</h2>
        <p>Accede a tu dashboard personal en: <strong>sorteosterrapesca.com/admin</strong></p>
        <ul>
          <li>📈 Ventas en tiempo real</li>
          <li>💰 Comisiones acumuladas</li>
          <li>📋 Lista de clientes</li>
          <li>📊 Estadísticas detalladas</li>
        </ul>

        <h2>💡 CONSEJOS PARA MAXIMIZAR VENTAS</h2>
        <ol>
          <li><strong>Horarios óptimos:</strong> 7-9 PM entre semana, 10 AM-2 PM fines de semana</li>
          <li><strong>Grupos objetivo:</strong> Pescadores, deportistas, amantes de la aventura</li>
          <li><strong>Crear urgencia:</strong> "Quedan pocos boletos", "Sorteo pronto"</li>
          <li><strong>Mostrar premios:</strong> Comparte fotos y videos de los equipos</li>
          <li><strong>Testimonios:</strong> Comparte historias de ganadores anteriores</li>
          <li><strong>Facilitar pago:</strong> Explica que aceptamos Mercado Pago</li>
        </ol>

        <h2>❓ PREGUNTAS FRECUENTES</h2>
        <h3>¿Cuándo recibo mis comisiones?</h3>
        <p>Las comisiones se pagan semanalmente los viernes, directamente a tu cuenta.</p>

        <h3>¿Hay límite en las ventas?</h3>
        <p>No hay límite. Mientras más vendas, más ganas.</p>

        <h3>¿Qué pasa si mi cliente gana?</h3>
        <p>Recibes $1,000 MXN adicionales como bonus por haber traído al ganador.</p>

        <h3>¿Puedo promocionar en redes sociales?</h3>
        <p>¡Sí! Te proporcionamos material gráfico y mensajes prediseñados.</p>

        <h2>⚠️ TÉRMINOS Y CONDICIONES</h2>
        <div class="warning">
          <h3>✅ PERMITIDO:</h3>
          <ul>
            <li>Promocionar en redes sociales personales</li>
            <li>Compartir en grupos de WhatsApp</li>
            <li>Recomendar a familiares y amigos</li>
            <li>Usar material gráfico proporcionado</li>
          </ul>

          <h3>❌ PROHIBIDO:</h3>
          <ul>
            <li>Spam masivo no solicitado</li>
            <li>Información falsa sobre premios</li>
            <li>Modificar precios sin autorización</li>
            <li>Usar logos sin permiso</li>
          </ul>
        </div>

        <h2>🆘 SOPORTE COMPLETO</h2>
        <ul>
          <li>📞 <strong>WhatsApp inmediato:</strong> +52 668 688 9571</li>
          <li>📧 <strong>Email:</strong> ventasweb@terrapesca.com</li>
          <li>⏰ <strong>Respuesta garantizada:</strong> Menos de 2 horas</li>
          <li>🎓 <strong>Capacitación:</strong> Disponible cuando la necesites</li>
        </ul>

        <div class="contact">
          <h2>🎯 ¡COMIENZA HOY MISMO!</h2>
          <p><strong>Paso 1:</strong> Envía WhatsApp a +52 668 688 9571</p>
          <p><strong>Mensaje:</strong> "Hola, quiero ser promotor de Sorteos Terrapesca"</p>
          <p><strong>Paso 2:</strong> Recibe tu código y enlace personalizado</p>
          <p><strong>Paso 3:</strong> ¡Comienza a ganar dinero!</p>
        </div>

        <p style="text-align: center; margin-top: 40px; font-size: 18px; color: #003B73;">
          <strong>💰 ¡Tu oportunidad de generar ingresos extra está aquí!</strong><br>
          🚀 ¡Únete al equipo de promotores de Terrapesca!
        </p>
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

  const whatsappMessages = [
    {
      title: "Mensaje Directo",
      text: "🎣 ¡Hola! ¿Te gustaría participar en el sorteo de equipos de pesca profesionales de Terrapesca? Solo $150 por boleto y puedes ganar increíbles premios. ¡Mira los detalles aquí! [TU_ENLACE]"
    },
    {
      title: "Mensaje con Urgencia",
      text: "⏰ ¡ÚLTIMOS DÍAS! El sorteo de Terrapesca está por cerrar. No te quedes sin tu oportunidad de ganar equipos de pesca profesionales. ¡Compra tu boleto ahora! [TU_ENLACE]"
    },
    {
      title: "Mensaje Familiar",
      text: "👨‍👩‍👧‍👦 ¡Hola familia! Les comparto esta oportunidad increíble de ganar equipos de pesca de Terrapesca. Es confiable y seguro. ¡Échale un vistazo! [TU_ENLACE]"
    },
    {
      title: "Mensaje para Grupos",
      text: "🎣 ¡Amigos pescadores! Sorteo oficial de Terrapesca con equipos profesionales. Pago seguro con Mercado Pago. ¡No se lo pierdan! [TU_ENLACE] #EquipaTuAventura"
    }
  ];

  const socialPosts = [
    {
      platform: "Facebook/Instagram",
      text: `🎣 ¡SORTEO TERRAPESCA! 🎣
✨ Equipos de pesca profesionales
💰 Solo $150 por boleto
🚚 Envío GRATIS a toda México
🔗 Compra aquí: [TU_ENLACE]
#SorteoTerrapesca #EquipaTuAventura #PescaDeportiva`
    },
    {
      platform: "TikTok",
      text: `🎣 SORTEO ÉPICO de @terrapesca 
💰 $150 = Oportunidad de ganar equipos PRO
🚚 Envío gratis a toda México
🔗 Link en bio: [TU_ENLACE]
#SorteoTerrapesca #PescaTok #EquipaTuAventura`
    },
    {
      platform: "Twitter/X",
      text: `🎣 ¡SORTEO @terrapesca! 
Equipos profesionales de pesca
💰 $150 por boleto
🚚 Envío GRATIS
🔗 [TU_ENLACE]
#SorteoTerrapesca #Pesca`
    }
  ];

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
                  👥 Manual para Promotores
                </h1>
                <p className="text-xl text-terrapesca-blue-600">
                  Guía completa para maximizar tus ganancias con Sorteos Terrapesca
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

          {/* Contacto inmediato */}
          <div className="mb-8 p-6 bg-gradient-to-r from-terrapesca-green-500 to-terrapesca-green-600 text-white rounded-xl shadow-xl">
            <div className="flex items-center mb-4">
              <Phone className="h-8 w-8 mr-3" />
              <h2 className="text-2xl font-bold">📞 CONTACTO INMEDIATO PARA PROMOTORES</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center">
                <MessageSquare className="h-6 w-6 mr-3" />
                <div>
                  <p className="font-semibold">WhatsApp Directo</p>
                  <button
                    onClick={() => copyToClipboard('+52 668 688 9571', 'Teléfono')}
                    className="text-green-100 hover:text-white transition-colors underline"
                  >
                    +52 668 688 9571 {copiedText === 'Teléfono' && '✓'}
                  </button>
                </div>
              </div>
              <div className="flex items-center">
                <Mail className="h-6 w-6 mr-3" />
                <div>
                  <p className="font-semibold">Email</p>
                  <button
                    onClick={() => copyToClipboard('ventasweb@terrapesca.com', 'Email')}
                    className="text-green-100 hover:text-white transition-colors underline"
                  >
                    ventasweb@terrapesca.com {copiedText === 'Email' && '✓'}
                  </button>
                </div>
              </div>
              <div className="flex items-center">
                <Clock className="h-6 w-6 mr-3" />
                <div>
                  <p className="font-semibold">Horario</p>
                  <p className="text-green-100">Lun-Vie 9AM-6PM</p>
                </div>
              </div>
            </div>
            <div className="mt-4 text-center">
              <a
                href="https://wa.me/526686889571?text=Hola,%20quiero%20ser%20promotor%20de%20Sorteos%20Terrapesca"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-3 bg-white text-terrapesca-green-600 rounded-lg hover:bg-gray-100 transition-colors font-bold shadow-lg"
              >
                <MessageSquare className="mr-2 h-5 w-5" />
                Enviar WhatsApp: "Quiero ser promotor"
              </a>
            </div>
          </div>

          <div className="space-y-8">
            {/* Sistema de comisiones */}
            <section className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl shadow-terrapesca p-8 border border-green-200">
              <h2 className="text-3xl font-bold text-green-800 mb-6 flex items-center">
                <DollarSign className="mr-3 h-8 w-8" />
                💰 SISTEMA DE COMISIONES
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white p-6 rounded-lg shadow-lg border border-green-300">
                  <div className="flex items-center mb-4">
                    <TrendingUp className="h-8 w-8 text-green-600 mr-3" />
                    <h3 className="text-xl font-bold text-green-800">GANANCIAS GARANTIZADAS</h3>
                  </div>
                  <ul className="space-y-3">
                    <li className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                      <span className="font-semibold">$1,000 MXN por cada boleto vendido</span>
                    </li>
                    <li className="flex items-center">
                      <Trophy className="h-5 w-5 text-yellow-600 mr-2" />
                      <span className="font-semibold">$1,000 MXN adicionales si tu cliente gana</span>
                    </li>
                    <li className="flex items-center">
                      <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                      <span className="font-semibold">Pagos semanales (viernes)</span>
                    </li>
                    <li className="flex items-center">
                      <Zap className="h-5 w-5 text-purple-600 mr-2" />
                      <span className="font-semibold">Sin límite de ventas</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-lg border border-green-300">
                  <h3 className="text-xl font-bold text-green-800 mb-4">📊 EJEMPLOS DE GANANCIAS</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="font-medium">10 boletos vendidos:</span>
                      <span className="font-bold text-green-600">$10,000 MXN</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="font-medium">25 boletos vendidos:</span>
                      <span className="font-bold text-green-600">$25,000 MXN</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="font-medium">50 boletos vendidos:</span>
                      <span className="font-bold text-green-600">$50,000 MXN</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg border border-yellow-300">
                      <span className="font-medium">+ Si 1 cliente gana:</span>
                      <span className="font-bold text-yellow-600">+$1,000 MXN</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
                <div className="flex items-center text-yellow-800">
                  <Star className="h-5 w-5 mr-2" />
                  <span className="font-semibold">
                    Ejemplo: Si vendes 30 boletos y uno de tus clientes gana, recibes $31,000 MXN ese mes
                  </span>
                </div>
              </div>
            </section>

            {/* Proceso de registro */}
            <section className="bg-white rounded-xl shadow-terrapesca p-8 border border-terrapesca-blue-100">
              <h2 className="text-3xl font-bold text-terrapesca-blue-800 mb-6 flex items-center">
                <Users className="mr-3 h-8 w-8" />
                🚀 CÓMO EMPEZAR (3 PASOS SIMPLES)
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-terrapesca-blue-50 rounded-lg border border-terrapesca-blue-200">
                  <div className="bg-terrapesca-blue-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4">
                    1
                  </div>
                  <h3 className="text-lg font-bold text-terrapesca-blue-800 mb-2">CONTACTAR</h3>
                  <p className="text-terrapesca-blue-600 mb-4">
                    Envía WhatsApp para obtener tu código único de promotor
                  </p>
                  <a
                    href="https://wa.me/526686889571?text=Hola,%20quiero%20ser%20promotor%20de%20Sorteos%20Terrapesca"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-terrapesca-blue-600 text-white rounded-lg hover:bg-terrapesca-blue-700 transition-colors"
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Contactar Ahora
                  </a>
                </div>

                <div className="text-center p-6 bg-terrapesca-orange-50 rounded-lg border border-terrapesca-orange-200">
                  <div className="bg-terrapesca-orange-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4">
                    2
                  </div>
                  <h3 className="text-lg font-bold text-terrapesca-orange-800 mb-2">RECIBIR</h3>
                  <p className="text-terrapesca-orange-600 mb-4">
                    Obtén tu enlace personalizado y material promocional
                  </p>
                  <div className="inline-flex items-center px-4 py-2 bg-terrapesca-orange-100 text-terrapesca-orange-800 rounded-lg">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Enlace Único
                  </div>
                </div>

                <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200">
                  <div className="bg-green-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-xl font-bold mx-auto mb-4">
                    3
                  </div>
                  <h3 className="text-lg font-bold text-green-800 mb-2">PROMOCIONAR</h3>
                  <p className="text-green-600 mb-4">
                    Comparte tu enlace y comienza a ganar dinero inmediatamente
                  </p>
                  <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-lg">
                    <DollarSign className="mr-2 h-4 w-4" />
                    Ganar Dinero
                  </div>
                </div>
              </div>
            </section>

            {/* Estrategias de promoción */}
            <section className="bg-white rounded-xl shadow-terrapesca p-8 border border-terrapesca-blue-100">
              <h2 className="text-3xl font-bold text-terrapesca-blue-800 mb-6 flex items-center">
                <Megaphone className="mr-3 h-8 w-8" />
                📱 ESTRATEGIAS DE PROMOCIÓN PROBADAS
              </h2>

              {/* Mensajes para WhatsApp */}
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-terrapesca-blue-700 mb-4 flex items-center">
                  <MessageSquare className="mr-2 h-6 w-6" />
                  💬 MENSAJES PREDISEÑADOS PARA WHATSAPP
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {whatsappMessages.map((message, index) => (
                    <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-green-800">{message.title}</h4>
                        <button
                          onClick={() => copyToClipboard(message.text, `Mensaje ${index + 1}`)}
                          className="p-2 text-green-600 hover:text-green-800 rounded-full hover:bg-green-100"
                          title="Copiar mensaje"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-sm text-green-700 bg-white p-3 rounded border">
                        {message.text}
                      </p>
                      {copiedText === `Mensaje ${index + 1}` && (
                        <p className="text-xs text-green-600 mt-1">✓ Copiado</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Posts para redes sociales */}
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-terrapesca-blue-700 mb-4 flex items-center">
                  <Share2 className="mr-2 h-6 w-6" />
                  📱 POSTS PARA REDES SOCIALES
                </h3>
                <div className="space-y-4">
                  {socialPosts.map((post, index) => (
                    <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-blue-800">{post.platform}</h4>
                        <button
                          onClick={() => copyToClipboard(post.text, `Post ${post.platform}`)}
                          className="p-2 text-blue-600 hover:text-blue-800 rounded-full hover:bg-blue-100"
                          title="Copiar post"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                      <pre className="text-sm text-blue-700 bg-white p-3 rounded border whitespace-pre-wrap">
                        {post.text}
                      </pre>
                      {copiedText === `Post ${post.platform}` && (
                        <p className="text-xs text-blue-600 mt-1">✓ Copiado</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Hashtags sugeridos */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                <h3 className="text-xl font-bold text-purple-800 mb-3 flex items-center">
                  <Target className="mr-2 h-5 w-5" />
                  🏷️ HASHTAGS SUGERIDOS
                </h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    '#SorteoTerrapesca', '#EquipaTuAventura', '#PescaDeportiva', 
                    '#SorteoSeguro', '#GanaConTerrapesca', '#PescaMexico',
                    '#EquiposDePesca', '#SorteoOficial', '#TerrapescaSorteo'
                  ].map((hashtag, index) => (
                    <button
                      key={index}
                      onClick={() => copyToClipboard(hashtag, `Hashtag ${hashtag}`)}
                      className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm hover:bg-purple-200 transition-colors"
                    >
                      {hashtag} {copiedText === `Hashtag ${hashtag}` && '✓'}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Programa de incentivos */}
            <section className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl shadow-terrapesca p-8 border border-yellow-200">
              <h2 className="text-3xl font-bold text-yellow-800 mb-6 flex items-center">
                <Crown className="mr-3 h-8 w-8" />
                🏆 PROGRAMA DE INCENTIVOS VIP
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-orange-400">
                  <div className="flex items-center mb-3">
                    <div className="bg-orange-400 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                      B
                    </div>
                    <h3 className="ml-2 font-bold text-orange-800">BRONCE</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">1-10 boletos/mes</p>
                  <p className="font-semibold text-orange-700">Comisión base: $1,000</p>
                  <p className="text-xs text-gray-500">Nivel inicial</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-gray-400">
                  <div className="flex items-center mb-3">
                    <div className="bg-gray-400 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                      P
                    </div>
                    <h3 className="ml-2 font-bold text-gray-700">PLATA</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">11-25 boletos/mes</p>
                  <p className="font-semibold text-gray-700">Comisión: $1,100</p>
                  <p className="text-xs text-gray-500">+Capacitación premium</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-yellow-400">
                  <div className="flex items-center mb-3">
                    <div className="bg-yellow-400 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                      O
                    </div>
                    <h3 className="ml-2 font-bold text-yellow-700">ORO</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">26-50 boletos/mes</p>
                  <p className="font-semibold text-yellow-700">Comisión: $1,200</p>
                  <p className="text-xs text-gray-500">+Soporte prioritario</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-blue-400">
                  <div className="flex items-center mb-3">
                    <div className="bg-blue-400 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                      <Gem className="h-4 w-4" />
                    </div>
                    <h3 className="ml-2 font-bold text-blue-700">DIAMANTE</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">51+ boletos/mes</p>
                  <p className="font-semibold text-blue-700">Comisión: $1,300</p>
                  <p className="text-xs text-gray-500">+Bonos especiales</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-bold text-yellow-800 mb-4">🎯 BENEFICIOS POR NIVEL</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">PLATA y superior:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Capacitación personalizada</li>
                      <li>• Material gráfico exclusivo</li>
                      <li>• Acceso a estadísticas avanzadas</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">ORO y DIAMANTE:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Soporte prioritario 24/7</li>
                      <li>• Bonos trimestrales</li>
                      <li>• Invitaciones a eventos exclusivos</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Seguimiento de ventas */}
            <section className="bg-white rounded-xl shadow-terrapesca p-8 border border-terrapesca-blue-100">
              <h2 className="text-3xl font-bold text-terrapesca-blue-800 mb-6 flex items-center">
                <BarChart3 className="mr-3 h-8 w-8" />
                📊 SEGUIMIENTO DE VENTAS EN TIEMPO REAL
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-terrapesca-blue-50 p-6 rounded-lg border border-terrapesca-blue-200">
                  <h3 className="text-xl font-bold text-terrapesca-blue-800 mb-4">🔗 TIPOS DE ENLACES</h3>
                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded border">
                      <h4 className="font-semibold text-terrapesca-blue-700">Enlace General:</h4>
                      <code className="text-sm text-gray-600">sorteosterrapesca.com/boletos?promo=TU_CODIGO</code>
                    </div>
                    <div className="bg-white p-3 rounded border">
                      <h4 className="font-semibold text-terrapesca-blue-700">Enlace Específico:</h4>
                      <code className="text-sm text-gray-600">sorteosterrapesca.com/boletos?promo=TU_CODIGO&raffle=123</code>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                  <h3 className="text-xl font-bold text-green-800 mb-4">📈 DASHBOARD PERSONAL</h3>
                  <p className="text-green-700 mb-4">
                    Accede a tu panel personal en: <strong>sorteosterrapesca.com/admin</strong>
                  </p>
                  <ul className="space-y-2 text-green-700">
                    <li className="flex items-center">
                      <Eye className="h-4 w-4 mr-2" />
                      Ventas en tiempo real
                    </li>
                    <li className="flex items-center">
                      <DollarSign className="h-4 w-4 mr-2" />
                      Comisiones acumuladas
                    </li>
                    <li className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      Lista de clientes
                    </li>
                    <li className="flex items-center">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Estadísticas detalladas
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Consejos para maximizar ventas */}
            <section className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl shadow-terrapesca p-8 border border-purple-200">
              <h2 className="text-3xl font-bold text-purple-800 mb-6 flex items-center">
                <Target className="mr-3 h-8 w-8" />
                💡 CONSEJOS PARA MAXIMIZAR VENTAS
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-lg">
                  <div className="flex items-center mb-4">
                    <Clock className="h-6 w-6 text-purple-600 mr-2" />
                    <h3 className="font-bold text-purple-800">⏰ HORARIOS ÓPTIMOS</h3>
                  </div>
                  <ul className="text-sm text-purple-700 space-y-2">
                    <li>• <strong>Entre semana:</strong> 7-9 PM</li>
                    <li>• <strong>Fines de semana:</strong> 10 AM-2 PM</li>
                    <li>• <strong>Evitar:</strong> Horas de comida</li>
                    <li>• <strong>Mejor día:</strong> Viernes y sábados</li>
                  </ul>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-lg">
                  <div className="flex items-center mb-4">
                    <Users className="h-6 w-6 text-blue-600 mr-2" />
                    <h3 className="font-bold text-blue-800">🎯 GRUPOS OBJETIVO</h3>
                  </div>
                  <ul className="text-sm text-blue-700 space-y-2">
                    <li>• Pescadores deportivos</li>
                    <li>• Amantes de la aventura</li>
                    <li>• Grupos de WhatsApp familiares</li>
                    <li>• Comunidades de pesca</li>
                  </ul>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-lg">
                  <div className="flex items-center mb-4">
                    <Zap className="h-6 w-6 text-red-600 mr-2" />
                    <h3 className="font-bold text-red-800">⚡ CREAR URGENCIA</h3>
                  </div>
                  <ul className="text-sm text-red-700 space-y-2">
                    <li>• "Quedan pocos boletos"</li>
                    <li>• "Sorteo en X días"</li>
                    <li>• "Oferta por tiempo limitado"</li>
                    <li>• "Últimas oportunidades"</li>
                  </ul>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-lg">
                  <div className="flex items-center mb-4">
                    <Gift className="h-6 w-6 text-green-600 mr-2" />
                    <h3 className="font-bold text-green-800">🎁 MOSTRAR PREMIOS</h3>
                  </div>
                  <ul className="text-sm text-green-700 space-y-2">
                    <li>• Comparte fotos de equipos</li>
                    <li>• Videos de productos</li>
                    <li>• Testimonios de ganadores</li>
                    <li>• Valor real de premios</li>
                  </ul>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-lg">
                  <div className="flex items-center mb-4">
                    <Heart className="h-6 w-6 text-pink-600 mr-2" />
                    <h3 className="font-bold text-pink-800">❤️ GENERAR CONFIANZA</h3>
                  </div>
                  <ul className="text-sm text-pink-700 space-y-2">
                    <li>• Menciona empresa establecida</li>
                    <li>• Pago seguro con Mercado Pago</li>
                    <li>• Sorteos transparentes</li>
                    <li>• Testimonios reales</li>
                  </ul>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-lg">
                  <div className="flex items-center mb-4">
                    <CreditCard className="h-6 w-6 text-indigo-600 mr-2" />
                    <h3 className="font-bold text-indigo-800">💳 FACILITAR PAGO</h3>
                  </div>
                  <ul className="text-sm text-indigo-700 space-y-2">
                    <li>• Acepta Mercado Pago</li>
                    <li>• Múltiples métodos</li>
                    <li>• Pago en cuotas</li>
                    <li>• Proceso simple</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Preguntas frecuentes */}
            <section className="bg-white rounded-xl shadow-terrapesca p-8 border border-terrapesca-blue-100">
              <h2 className="text-3xl font-bold text-terrapesca-blue-800 mb-6 flex items-center">
                <AlertTriangle className="mr-3 h-8 w-8" />
                ❓ PREGUNTAS FRECUENTES
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-terrapesca-blue-50 p-4 rounded-lg border border-terrapesca-blue-200">
                    <h3 className="font-bold text-terrapesca-blue-800 mb-2">¿Cuándo recibo mis comisiones?</h3>
                    <p className="text-terrapesca-blue-700">Las comisiones se pagan semanalmente los viernes, directamente a tu cuenta bancaria o método preferido.</p>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h3 className="font-bold text-green-800 mb-2">¿Hay límite en las ventas?</h3>
                    <p className="text-green-700">No hay límite. Mientras más vendas, más ganas. El cielo es el límite.</p>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <h3 className="font-bold text-yellow-800 mb-2">¿Qué pasa si mi cliente gana?</h3>
                    <p className="text-yellow-700">Recibes $1,000 MXN adicionales como bonus por haber traído al ganador. ¡Doble celebración!</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <h3 className="font-bold text-purple-800 mb-2">¿Puedo promocionar en redes sociales?</h3>
                    <p className="text-purple-700">¡Absolutamente! Te proporcionamos material gráfico y mensajes prediseñados para todas las plataformas.</p>
                  </div>

                  <div className="bg-pink-50 p-4 rounded-lg border border-pink-200">
                    <h3 className="font-bold text-pink-800 mb-2">¿Necesito experiencia en ventas?</h3>
                    <p className="text-pink-700">No es necesario. Te capacitamos y proporcionamos todas las herramientas para que tengas éxito.</p>
                  </div>

                  <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                    <h3 className="font-bold text-indigo-800 mb-2">¿Hay costos para ser promotor?</h3>
                    <p className="text-indigo-700">¡Completamente GRATIS! No hay costos de inscripción, mensualidades ni comisiones ocultas.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Términos y condiciones */}
            <section className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl shadow-terrapesca p-8 border border-red-200">
              <h2 className="text-3xl font-bold text-red-800 mb-6 flex items-center">
                <Shield className="mr-3 h-8 w-8" />
                ⚠️ TÉRMINOS Y CONDICIONES
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-green-500">
                  <h3 className="text-xl font-bold text-green-800 mb-4 flex items-center">
                    <CheckCircle className="mr-2 h-5 w-5" />
                    ✅ PERMITIDO
                  </h3>
                  <ul className="space-y-2 text-green-700">
                    <li className="flex items-start">
                      <ThumbsUp className="h-4 w-4 mr-2 mt-0.5 text-green-600" />
                      Promocionar en redes sociales personales
                    </li>
                    <li className="flex items-start">
                      <ThumbsUp className="h-4 w-4 mr-2 mt-0.5 text-green-600" />
                      Compartir en grupos de WhatsApp
                    </li>
                    <li className="flex items-start">
                      <ThumbsUp className="h-4 w-4 mr-2 mt-0.5 text-green-600" />
                      Recomendar a familiares y amigos
                    </li>
                    <li className="flex items-start">
                      <ThumbsUp className="h-4 w-4 mr-2 mt-0.5 text-green-600" />
                      Usar material gráfico proporcionado
                    </li>
                    <li className="flex items-start">
                      <ThumbsUp className="h-4 w-4 mr-2 mt-0.5 text-green-600" />
                      Crear contenido original promocional
                    </li>
                  </ul>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-red-500">
                  <h3 className="text-xl font-bold text-red-800 mb-4 flex items-center">
                    <AlertTriangle className="mr-2 h-5 w-5" />
                    ❌ PROHIBIDO
                  </h3>
                  <ul className="space-y-2 text-red-700">
                    <li className="flex items-start">
                      <X className="h-4 w-4 mr-2 mt-0.5 text-red-600" />
                      Spam masivo no solicitado
                    </li>
                    <li className="flex items-start">
                      <X className="h-4 w-4 mr-2 mt-0.5 text-red-600" />
                      Información falsa sobre premios
                    </li>
                    <li className="flex items-start">
                      <X className="h-4 w-4 mr-2 mt-0.5 text-red-600" />
                      Modificar precios sin autorización
                    </li>
                    <li className="flex items-start">
                      <X className="h-4 w-4 mr-2 mt-0.5 text-red-600" />
                      Usar logos sin permiso oficial
                    </li>
                    <li className="flex items-start">
                      <X className="h-4 w-4 mr-2 mt-0.5 text-red-600" />
                      Prometer garantías no autorizadas
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Soporte completo */}
            <section className="bg-white rounded-xl shadow-terrapesca p-8 border border-terrapesca-blue-100">
              <h2 className="text-3xl font-bold text-terrapesca-blue-800 mb-6 flex items-center">
                <Phone className="mr-3 h-8 w-8" />
                🆘 SOPORTE COMPLETO 24/7
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200">
                  <MessageSquare className="h-12 w-12 text-green-600 mx-auto mb-3" />
                  <h3 className="font-bold text-green-800 mb-2">WhatsApp Inmediato</h3>
                  <p className="text-green-700 text-sm mb-3">+52 668 688 9571</p>
                  <a
                    href="https://wa.me/526686889571"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    <Send className="mr-1 h-3 w-3" />
                    Contactar
                  </a>
                </div>

                <div className="text-center p-6 bg-blue-50 rounded-lg border border-blue-200">
                  <Mail className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                  <h3 className="font-bold text-blue-800 mb-2">Email</h3>
                  <p className="text-blue-700 text-sm mb-3">ventasweb@terrapesca.com</p>
                  <a
                    href="mailto:ventasweb@terrapesca.com?subject=Consulta%20Promotor&body=Hola,%20tengo%20una%20consulta%20sobre%20el%20programa%20de%20promotores"
                    className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    <Send className="mr-1 h-3 w-3" />
                    Enviar
                  </a>
                </div>

                <div className="text-center p-6 bg-yellow-50 rounded-lg border border-yellow-200">
                  <Clock className="h-12 w-12 text-yellow-600 mx-auto mb-3" />
                  <h3 className="font-bold text-yellow-800 mb-2">Respuesta Garantizada</h3>
                  <p className="text-yellow-700 text-sm">Menos de 2 horas</p>
                </div>

                <div className="text-center p-6 bg-purple-50 rounded-lg border border-purple-200">
                  <Award className="h-12 w-12 text-purple-600 mx-auto mb-3" />
                  <h3 className="font-bold text-purple-800 mb-2">Capacitación</h3>
                  <p className="text-purple-700 text-sm">Disponible cuando la necesites</p>
                </div>
              </div>
            </section>

            {/* Call to action final */}
            <section className="bg-gradient-to-r from-terrapesca-green-500 to-terrapesca-green-600 rounded-xl shadow-terrapesca p-8 text-center text-white">
              <div className="mb-6">
                <Trophy className="h-16 w-16 mx-auto mb-4 text-yellow-300" />
                <h2 className="text-4xl font-bold mb-4">
                  🎯 ¡COMIENZA HOY MISMO!
                </h2>
                <p className="text-xl text-green-100 mb-6">
                  Tu oportunidad de generar ingresos extra está aquí. Únete al equipo de promotores más exitoso de México.
                </p>
              </div>

              <div className="bg-white bg-opacity-20 rounded-lg p-6 mb-6">
                <h3 className="text-2xl font-bold mb-4">📋 PROCESO INMEDIATO</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                  <div className="bg-white bg-opacity-20 p-4 rounded-lg">
                    <h4 className="font-bold mb-2">PASO 1</h4>
                    <p className="text-sm">Envía WhatsApp a +52 668 688 9571</p>
                  </div>
                  <div className="bg-white bg-opacity-20 p-4 rounded-lg">
                    <h4 className="font-bold mb-2">PASO 2</h4>
                    <p className="text-sm">Recibe tu código y enlace personalizado</p>
                  </div>
                  <div className="bg-white bg-opacity-20 p-4 rounded-lg">
                    <h4 className="font-bold mb-2">PASO 3</h4>
                    <p className="text-sm">¡Comienza a ganar dinero inmediatamente!</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <a
                  href="https://wa.me/526686889571?text=Hola,%20quiero%20ser%20promotor%20de%20Sorteos%20Terrapesca.%20Estoy%20listo%20para%20comenzar."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-8 py-4 bg-white text-terrapesca-green-600 rounded-lg hover:bg-gray-100 transition-colors font-bold text-lg shadow-lg"
                >
                  <MessageSquare className="mr-3 h-6 w-6" />
                  💬 ENVIAR: "Quiero ser promotor"
                </a>
                
                <p className="text-green-100 text-lg">
                  💰 <strong>¡Tu primer comisión puede ser esta semana!</strong>
                </p>
                
                <div className="flex items-center justify-center space-x-4 text-sm text-green-100">
                  <span>✅ Sin costos</span>
                  <span>✅ Sin experiencia requerida</span>
                  <span>✅ Soporte completo</span>
                  <span>✅ Ganancias inmediatas</span>
                </div>
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