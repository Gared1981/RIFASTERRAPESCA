import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Download, Phone, Mail, MapPin, MessageSquare, Clock, CreditCard, Shield, Gift, CheckCircle, AlertTriangle, DollarSign, Users, Target, Award } from 'lucide-react';
import Footer from '../components/Footer';

const ManualPromotoresPage: React.FC = () => {
  const handleDownloadPDF = () => {
    // Crear enlace de descarga del manual
    const pdfUrl = 'data:text/html;charset=utf-8,' + encodeURIComponent(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Manual de Promotores - Sorteos Terrapesca</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; }
          h1 { color: #003B73; border-bottom: 3px solid #FF6B35; padding-bottom: 10px; }
          h2 { color: #003B73; margin-top: 30px; }
          .highlight { background: #FFD700; padding: 2px 6px; border-radius: 3px; }
          .contact { background: #f0f9ff; padding: 15px; border-left: 4px solid #003B73; margin: 20px 0; }
          .warning { background: #FFF3CD; padding: 15px; border-left: 4px solid #FFD700; margin: 20px 0; }
        </style>
      </head>
      <body>
        <h1>👨‍💼 Manual de Promotores - Sorteos Terrapesca</h1>
        
        <h2>🎯 ¿Qué es un Promotor?</h2>
        <p>Un promotor es una persona que ayuda a vender boletos de sorteos usando un código personalizado. Por cada venta, recibe comisiones y bonos especiales.</p>
        
        <h2>💰 Sistema de Comisiones del 15%</h2>
        
        <div class="warning">
          <h3>⚠️ Importante sobre Comisiones</h3>
          <p><strong>Los ejemplos mostrados son calculados con boletos de $150 MXN.</strong></p>
          <p>Las comisiones reales varían según el precio del sorteo específico.</p>
          <p>Siempre se mantiene el 15% sobre el precio real del boleto.</p>
        </div>
        
        <h3>📊 Comisiones Base (15%)</h3>
        <ul>
          <li><strong>Comisión:</strong> 15% del precio del boleto*</li>
          <li><strong>Ejemplo:</strong> Boleto $150 = $22.50 comisión*</li>
          <li><strong>Pago:</strong> Cuando cliente confirma</li>
          <li><strong>Seguimiento:</strong> Tiempo real</li>
        </ul>
        
        <h3>🏆 Bonos por Ganador</h3>
        <ul>
          <li><strong>Bono base:</strong> $2,000 MXN si tu cliente gana</li>
          <li><strong>Bono extra:</strong> +$1,000 MXN si tienes 100+ ventas</li>
          <li><strong>Total máximo:</strong> $3,000 MXN por ganador</li>
          <li><strong>Requisito:</strong> Cliente con tu código debe ganar</li>
        </ul>
        
        <h2>🎯 Ejemplos de Ganancias*</h2>
        <p><em>*Ejemplos calculados con boletos de $150 MXN. Las comisiones reales varían según el precio del sorteo.</em></p>
        
        <h3>📈 Promotor Nuevo (25 boletos)*</h3>
        <ul>
          <li>Comisiones: $337.50 MXN*</li>
          <li>Si cliente gana: +$2,000 MXN</li>
          <li><strong>Total potencial: $2,337.50*</strong></li>
        </ul>
        
        <h3>🎯 Promotor Activo (75 boletos)*</h3>
        <ul>
          <li>Comisiones: $1,012.50 MXN*</li>
          <li>Si cliente gana: +$2,000 MXN</li>
          <li><strong>Total potencial: $3,012.50*</strong></li>
        </ul>
        
        <h3>🏆 Promotor Elite (120 boletos)*</h3>
        <ul>
          <li>Comisiones: $1,620 MXN*</li>
          <li>Si cliente gana: +$3,000 MXN (incluye bono extra)</li>
          <li><strong>Total potencial: $4,620*</strong></li>
        </ul>
        
        <h2>🔗 Cómo Funciona</h2>
        <ol>
          <li>Recibes un código único (ej: JP001)</li>
          <li>Compartes tu enlace personalizado</li>
          <li>Clientes compran con tu código</li>
          <li>Recibes 15% de comisión automáticamente</li>
          <li>Si tu cliente gana, recibes bonos especiales</li>
        </ol>
        
        <h2>📱 Herramientas del Promotor</h2>
        <ul>
          <li>✅ Enlace personalizado único</li>
          <li>✅ Dashboard con estadísticas en tiempo real</li>
          <li>✅ Seguimiento de comisiones ganadas</li>
          <li>✅ Progreso hacia bono de 100 boletos</li>
          <li>✅ Historial completo de ventas</li>
        </ul>
        
        <div class="contact">
          <h2>📞 Contacto para Promotores</h2>
          <p><strong>WhatsApp:</strong> +52 668 688 9571</p>
          <p><strong>Email:</strong> ventasweb@terrapesca.com</p>
          <p><strong>Horario:</strong> Lunes a Viernes, 9:00 AM - 6:00 PM</p>
        </div>
        
        <p style="text-align: center; margin-top: 40px; font-size: 18px; color: #003B73;">
          <strong>¡Únete al equipo de promotores!</strong><br>
          💰 Gana dinero promocionando sorteos
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

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-8">
            <Link
              to="/admin"
              className="inline-flex items-center text-terrapesca-green-600 hover:text-terrapesca-green-700 font-medium mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al admin
            </Link>
            
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-terrapesca-blue-800 mb-2">
                  👨‍💼 Manual de Promotores
                </h1>
                <p className="text-terrapesca-blue-600">
                  Guía completa para promotores de Sorteos Terrapesca
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

          {/* Contenido del manual */}
          <div className="space-y-8">
            {/* ¿Qué es un Promotor? */}
            <section className="bg-white rounded-lg shadow-terrapesca p-6 border border-terrapesca-blue-100">
              <h2 className="text-2xl font-bold text-terrapesca-blue-800 mb-4 flex items-center">
                🎯 ¿Qué es un Promotor?
              </h2>
              <p className="text-terrapesca-blue-600">
                Un promotor es una persona que ayuda a vender boletos de sorteos usando un código personalizado. 
                Por cada venta, recibe comisiones del 15% y bonos especiales cuando sus clientes ganan.
              </p>
            </section>

            {/* Advertencia sobre comisiones */}
            <section className="bg-yellow-50 rounded-lg shadow-terrapesca p-6 border border-yellow-200">
              <h2 className="text-2xl font-bold text-yellow-800 mb-4 flex items-center">
                <AlertTriangle className="mr-3" />
                ⚠️ Importante: Sistema de Comisiones del 15%
              </h2>
              <div className="space-y-3">
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-yellow-600 mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-yellow-800">Comisión fija del 15%</h3>
                    <p className="text-yellow-700">
                      <strong>SIEMPRE recibes exactamente el 15% del precio del boleto</strong>, sin importar el sorteo.
                      Esta comisión es fija y garantizada.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <DollarSign className="h-6 w-6 text-yellow-600 mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-yellow-800">Los montos de ejemplo pueden variar</h3>
                    <p className="text-yellow-700">
                      Los ejemplos mostrados usan boletos de $150 MXN como referencia. Si un sorteo tiene boletos de $200 MXN, 
                      tu comisión será $30 MXN por boleto (15% de $200). Si tiene boletos de $100 MXN, será $15 MXN por boleto (15% de $100).
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Target className="h-6 w-6 text-yellow-600 mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-yellow-800">Cálculo automático y transparente</h3>
                    <p className="text-yellow-700">
                      El sistema calcula automáticamente tu comisión del 15% basándose en el precio real de cada sorteo. 
                      Puedes ver el precio específico de cada sorteo antes de promocionarlo.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Sistema de comisiones */}
            <section className="bg-white rounded-lg shadow-terrapesca p-6 border border-terrapesca-blue-100">
              <h2 className="text-2xl font-bold text-terrapesca-blue-800 mb-6 flex items-center">
                <DollarSign className="mr-3" />
                💰 Sistema de Comisiones del 15%
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h3 className="font-semibold text-green-800 mb-3 flex items-center">
                    <CheckCircle className="mr-2 h-5 w-5" />
                    📊 Comisiones Base (15%)
                  </h3>
                  <ul className="text-green-700 space-y-2">
                    <li>• <strong>Comisión fija:</strong> 15% del precio del boleto</li>
                    <li>• <strong>Ejemplo:</strong> Boleto $150 = $22.50 comisión</li>
                    <li>• <strong>Otro ejemplo:</strong> Boleto $200 = $30 comisión</li>
                    <li>• <strong>Pago:</strong> Cuando cliente confirma</li>
                    <li>• <strong>Seguimiento:</strong> Tiempo real</li>
                  </ul>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-800 mb-3 flex items-center">
                    <Award className="mr-2 h-5 w-5" />
                    🏆 Bonos por Ganador
                  </h3>
                  <ul className="text-blue-700 space-y-2">
                    <li>• <strong>Bono base:</strong> $2,000 MXN si tu cliente gana</li>
                    <li>• <strong>Bono extra:</strong> +$1,000 MXN si tienes 100+ ventas</li>
                    <li>• <strong>Total máximo:</strong> $3,000 MXN por ganador</li>
                    <li>• <strong>Requisito:</strong> Cliente con tu código debe ganar</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Ejemplos de ganancias */}
            <section className="bg-gradient-to-r from-terrapesca-green-50 to-terrapesca-blue-50 rounded-lg shadow-terrapesca p-6 border border-terrapesca-green-200">
              <h2 className="text-2xl font-bold text-terrapesca-blue-800 mb-4 flex items-center">
                <Target className="mr-3" />
                🎯 Ejemplos de Ganancias*
              </h2>
              
              <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4 mb-6">
                <p className="text-yellow-800 font-medium text-center">
                  <AlertTriangle className="inline h-4 w-4 mr-2" />
                  *Ejemplos calculados con boletos de $150 MXN. Tu comisión siempre será el 15% del precio real del sorteo.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-4 rounded-lg border border-terrapesca-green-200">
                  <h3 className="font-semibold text-terrapesca-blue-800 mb-3">📈 Promotor Nuevo (25 boletos de $150)</h3>
                  <ul className="text-terrapesca-blue-600 space-y-1">
                    <li>• Comisiones: $337.50 MXN</li>
                    <li>• Si cliente gana: +$2,000 MXN</li>
                    <li>• <strong>Total potencial: $2,337.50</strong></li>
                  </ul>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-terrapesca-green-200">
                  <h3 className="font-semibold text-terrapesca-blue-800 mb-3">🎯 Promotor Activo (75 boletos de $150)</h3>
                  <ul className="text-terrapesca-blue-600 space-y-1">
                    <li>• Comisiones: $1,012.50 MXN</li>
                    <li>• Si cliente gana: +$2,000 MXN</li>
                    <li>• <strong>Total potencial: $3,012.50</strong></li>
                  </ul>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-terrapesca-green-200">
                  <h3 className="font-semibold text-terrapesca-blue-800 mb-3">🏆 Promotor Elite (120 boletos de $150)</h3>
                  <ul className="text-terrapesca-blue-600 space-y-1">
                    <li>• Comisiones: $1,620 MXN</li>
                    <li>• Si cliente gana: +$3,000 MXN</li>
                    <li>• <strong>Total potencial: $4,620</strong></li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-terrapesca-blue-100 rounded-lg">
                <p className="text-sm text-terrapesca-blue-800 font-medium text-center">
                  💡 <strong>Recuerda:</strong> Tu comisión es SIEMPRE el 15% del precio del boleto. 
                  Los ejemplos usan $150 MXN, pero si el sorteo cuesta $200, ganarás $30 por boleto. Si cuesta $100, ganarás $15 por boleto.
                </p>
              </div>
            </section>

            {/* Cómo funciona */}
            <section className="bg-white rounded-lg shadow-terrapesca p-6 border border-terrapesca-blue-100">
              <h2 className="text-2xl font-bold text-terrapesca-blue-800 mb-6 flex items-center">
                <Users className="mr-3" />
                🔗 Cómo Funciona
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-terrapesca-green-100 text-terrapesca-green-700 rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 mt-1">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold text-terrapesca-blue-800 mb-1">Recibe tu código único</h3>
                    <p className="text-terrapesca-blue-600">El administrador te asigna un código personalizado (ej: JP001)</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-terrapesca-green-100 text-terrapesca-green-700 rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 mt-1">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold text-terrapesca-blue-800 mb-1">Comparte tu enlace personalizado</h3>
                    <p className="text-terrapesca-blue-600">Recibes un enlace único que incluye tu código automáticamente</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-terrapesca-green-100 text-terrapesca-green-700 rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 mt-1">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold text-terrapesca-blue-800 mb-1">Clientes compran con tu código</h3>
                    <p className="text-terrapesca-blue-600">Cuando usan tu enlace, su compra se registra automáticamente</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-terrapesca-green-100 text-terrapesca-green-700 rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 mt-1">
                    4
                  </div>
                  <div>
                    <h3 className="font-semibold text-terrapesca-blue-800 mb-1">Recibes 15% de comisión</h3>
                    <p className="text-terrapesca-blue-600">Se calcula automáticamente cuando el cliente paga</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-terrapesca-green-100 text-terrapesca-green-700 rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 mt-1">
                    5
                  </div>
                  <div>
                    <h3 className="font-semibold text-terrapesca-blue-800 mb-1">Bonos especiales si ganan</h3>
                    <p className="text-terrapesca-blue-600">$2,000 + $1,000 extra si tienes 100+ ventas</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Herramientas del promotor */}
            <section className="bg-white rounded-lg shadow-terrapesca p-6 border border-terrapesca-blue-100">
              <h2 className="text-2xl font-bold text-terrapesca-blue-800 mb-6 flex items-center">
                <Shield className="mr-3" />
                📱 Herramientas del Promotor
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-terrapesca-blue-800 mb-3">Dashboard Personal</h3>
                  <ul className="text-terrapesca-blue-600 space-y-2">
                    <li>• ✅ Enlace personalizado único</li>
                    <li>• ✅ Estadísticas en tiempo real</li>
                    <li>• ✅ Seguimiento de comisiones ganadas</li>
                    <li>• ✅ Progreso hacia bono de 100 boletos</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-terrapesca-blue-800 mb-3">Reportes y Análisis</h3>
                  <ul className="text-terrapesca-blue-600 space-y-2">
                    <li>• ✅ Historial completo de ventas</li>
                    <li>• ✅ Comisiones pendientes vs pagadas</li>
                    <li>• ✅ Análisis de performance</li>
                    <li>• ✅ Proyecciones de ganancias</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Contacto */}
            <section className="bg-white rounded-lg shadow-terrapesca p-6 border border-terrapesca-blue-100">
              <h2 className="text-2xl font-bold text-terrapesca-blue-800 mb-6 flex items-center">
                <Phone className="mr-3" />
                📞 Contacto para Promotores
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <MessageSquare className="h-6 w-6 text-terrapesca-green-600 mr-3" />
                    <div>
                      <p className="font-semibold text-terrapesca-blue-800">WhatsApp</p>
                      <p className="text-terrapesca-blue-600">+52 668 688 9571</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Mail className="h-6 w-6 text-terrapesca-green-600 mr-3" />
                    <div>
                      <p className="font-semibold text-terrapesca-blue-800">Email</p>
                      <p className="text-terrapesca-blue-600">ventasweb@terrapesca.com</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Clock className="h-6 w-6 text-terrapesca-green-600 mr-3" />
                    <div>
                      <p className="font-semibold text-terrapesca-blue-800">Horario</p>
                      <p className="text-terrapesca-blue-600">Lun-Vie 9:00 AM - 6:00 PM</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <MapPin className="h-6 w-6 text-terrapesca-green-600 mr-3 mt-1" />
                    <div>
                      <p className="font-semibold text-terrapesca-blue-800">Ubicación</p>
                      <p className="text-terrapesca-blue-600">
                        Los Mochis, Sinaloa, México
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Call to action */}
            <section className="bg-gradient-to-r from-terrapesca-green-500 to-terrapesca-green-600 rounded-lg shadow-terrapesca p-8 text-center">
              <h2 className="text-2xl font-bold text-white mb-4">
                🎉 ¡Únete al Equipo de Promotores!
              </h2>
              <p className="text-green-100 mb-6">
                Gana dinero promocionando sorteos de pesca. Sistema transparente, comisiones del 15% y bonos especiales.
              </p>
              <div className="space-y-4">
                <a
                  href="https://wa.me/526686889571?text=Hola,%20me%20interesa%20ser%20promotor%20de%20Sorteos%20Terrapesca.%20¿Pueden%20darme%20más%20información?"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-8 py-4 bg-white text-terrapesca-green-600 rounded-lg hover:bg-gray-100 transition-colors font-bold text-lg shadow-lg"
                >
                  <MessageSquare className="mr-2 h-5 w-5" />
                  💰 Solicitar ser Promotor
                </a>
                <p className="text-green-100 text-sm">
                  🚀 ¡Comienza a ganar hoy mismo!
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