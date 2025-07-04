import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Download, Phone, Mail, MapPin, MessageSquare, Clock, CreditCard, Shield, Gift, CheckCircle, AlertTriangle } from 'lucide-react';
import Footer from '../components/Footer';

const ManualUsuarioPage: React.FC = () => {
  const handleDownloadPDF = () => {
    // Crear enlace de descarga del manual
    const pdfUrl = 'data:text/html;charset=utf-8,' + encodeURIComponent(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Manual de Usuario - Sorteos Terrapesca</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; }
          h1 { color: #003B73; border-bottom: 3px solid #FF6B35; padding-bottom: 10px; }
          h2 { color: #003B73; margin-top: 30px; }
          .highlight { background: #FFD700; padding: 2px 6px; border-radius: 3px; }
          .contact { background: #f0f9ff; padding: 15px; border-left: 4px solid #003B73; margin: 20px 0; }
        </style>
      </head>
      <body>
        <h1>📱 Manual del Usuario - Sorteos Terrapesca</h1>
        
        <h2>🎯 ¿Qué es Sorteos Terrapesca?</h2>
        <p>Sorteos Terrapesca es una plataforma donde puedes participar en sorteos de equipos de pesca profesionales. Compra boletos, participa y gana increíbles premios relacionados con la pesca deportiva.</p>
        
        <h2>🌐 Cómo Acceder</h2>
        <p><strong>Página Web:</strong> https://voluble-marigold-f68bd1.netlify.app</p>
        <p>Puedes acceder desde tu celular, computadora o tablet.</p>
        
        <h2>🎫 Cómo Participar en un Sorteo</h2>
        
        <h3>Paso 1: Ver Sorteos Disponibles</h3>
        <ol>
          <li>Entra a la página principal</li>
          <li>Haz clic en "Ver todos los sorteos"</li>
          <li>Explora los sorteos activos disponibles</li>
        </ol>
        
        <h3>Paso 2: Seleccionar un Sorteo</h3>
        <ol>
          <li>Haz clic en el sorteo que te interese</li>
          <li>Revisa los detalles del premio</li>
          <li>Verifica la fecha del sorteo</li>
          <li>Haz clic en "Comprar Boletos"</li>
        </ol>
        
        <h3>Paso 3: Elegir tus Boletos</h3>
        <p><strong>🎲 Opción 1: Maquinita de la Suerte (Recomendado)</strong></p>
        <ul>
          <li>Selecciona cuántos boletos quieres (1-50)</li>
          <li>Haz clic en "¡Probar mi suerte!"</li>
          <li>El sistema elegirá números aleatorios para ti</li>
        </ul>
        
        <p><strong>🎯 Opción 2: Selección Manual</strong></p>
        <ul>
          <li>Haz clic en los números que prefieras</li>
          <li>Puedes elegir hasta 50 boletos</li>
          <li>Los números seleccionados se marcan en azul</li>
        </ul>
        
        <h3>Paso 4: Completar tus Datos</h3>
        <p>Llena el formulario con:</p>
        <ul>
          <li>✅ Nombre completo</li>
          <li>✅ Número de WhatsApp (10 dígitos)</li>
          <li>✅ Correo electrónico</li>
          <li>✅ Estado donde vives</li>
          <li>✅ Acepta términos y condiciones</li>
        </ul>
        
        <p class="highlight">📍 IMPORTANTE: El sistema recordará tus datos de ubicación para futuras participaciones, facilitando el proceso de compra.</p>
        
        <h3>Paso 5: Elegir Método de Pago</h3>
        
        <p><strong>💳 Opción A: Mercado Pago (Recomendado)</strong></p>
        <p><strong>Ventajas:</strong></p>
        <ul>
          <li>✅ Pago inmediato y seguro</li>
          <li>✅ Acepta tarjetas, transferencias y billeteras digitales</li>
          <li>✅ BONUS: Participas en premio especial con envío GRATIS</li>
          <li>✅ Confirmación automática</li>
        </ul>
        
        <p><strong>📱 Opción B: WhatsApp</strong></p>
        <ul>
          <li>✅ Pago coordinado personalmente</li>
          <li>✅ Atención directa por WhatsApp</li>
          <li>✅ Múltiples opciones de pago</li>
        </ul>
        
        <h2>⏰ Sistema de Reservas</h2>
        <p>Cuando completas tus datos, tus boletos se <strong>reservan por 3 horas</strong>. Durante este tiempo, nadie más puede comprar esos números. Si no pagas en 3 horas, los boletos vuelven a estar disponibles.</p>
        
        <h2>🔍 Verificar tus Boletos</h2>
        <ol>
          <li>Ve al menú "Verificar"</li>
          <li>Escribe el número de boleto</li>
          <li>Haz clic en "Verificar Boleto"</li>
        </ol>
        
        <h2>💰 Precios y Pagos</h2>
        <p><strong>Sorteo Trolling:</strong> $150 MXN por boleto</p>
        
        <h2>🎁 Premio Especial Mercado Pago</h2>
        <p>Al pagar con Mercado Pago, automáticamente participas en un <strong>premio especial adicional</strong> con <strong>envío GRATIS</strong> a toda la República Mexicana.</p>
        
        <div class="contact">
          <h2>📞 Contacto y Soporte</h2>
          <p><strong>WhatsApp:</strong> +52 668 688 9571</p>
          <p><strong>Email:</strong> ventasweb@terrapesca.com</p>
          <p><strong>Horario:</strong> Lunes a Viernes, 9:00 AM - 6:00 PM</p>
          <p><strong>Dirección:</strong> Calle Niños Héroes 775, Colonia Bienestar, C.P. 81280, Los Mochis, Sinaloa, México</p>
        </div>
        
        <h2>🏆 Cómo se Realiza el Sorteo</h2>
        <ol>
          <li>Fecha programada se anuncia con anticipación</li>
          <li>Transmisión en vivo por redes sociales oficiales</li>
          <li>Método aleatorio verificable y transparente</li>
          <li>Anuncio del ganador en vivo durante la transmisión</li>
          <li>Contacto directo si ganas</li>
        </ol>
        
        <h2>🔒 Seguridad y Confianza</h2>
        <ul>
          <li>🔐 Conexión encriptada (SSL)</li>
          <li>🔐 Datos protegidos según ley mexicana</li>
          <li>🔐 Pagos procesados por Mercado Pago (certificado)</li>
          <li>✅ Empresa verificada con ubicación física</li>
        </ul>
        
        <p style="text-align: center; margin-top: 40px; font-size: 18px; color: #003B73;">
          <strong>¡Listo para participar!</strong><br>
          🍀 ¡Buena Suerte!
        </p>
      </body>
      </html>
    `);
    
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = 'Manual-Usuario-Sorteos-Terrapesca.html';
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
              to="/"
              className="inline-flex items-center text-terrapesca-green-600 hover:text-terrapesca-green-700 font-medium mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al inicio
            </Link>
            
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-terrapesca-blue-800 mb-2">
                  📱 Manual del Usuario
                </h1>
                <p className="text-terrapesca-blue-600">
                  Guía completa para participar en Sorteos Terrapesca
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

          {/* Enlace directo al PDF */}
          <div className="mb-8 p-6 bg-gradient-to-r from-terrapesca-orange-50 to-terrapesca-orange-100 border border-terrapesca-orange-200 rounded-lg">
            <div className="flex items-center">
              <Gift className="h-8 w-8 text-terrapesca-orange-600 mr-4" />
              <div>
                <h3 className="text-lg font-semibold text-terrapesca-orange-800 mb-1">
                  📖 Enlace Directo al Manual
                </h3>
                <p className="text-terrapesca-orange-700 mb-3">
                  Accede al manual completo en formato web optimizado para móviles
                </p>
                <a
                  href="https://voluble-marigold-f68bd1.netlify.app/manual-usuario"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-terrapesca-orange-600 text-white rounded-md hover:bg-terrapesca-orange-700 transition-colors font-medium"
                >
                  🔗 Ver Manual Completo
                </a>
              </div>
            </div>
          </div>

          {/* Contenido del manual */}
          <div className="space-y-8">
            {/* ¿Qué es Sorteos Terrapesca? */}
            <section className="bg-white rounded-lg shadow-terrapesca p-6 border border-terrapesca-blue-100">
              <h2 className="text-2xl font-bold text-terrapesca-blue-800 mb-4 flex items-center">
                🎯 ¿Qué es Sorteos Terrapesca?
              </h2>
              <p className="text-terrapesca-blue-600">
                Sorteos Terrapesca es una plataforma donde puedes participar en sorteos de equipos de pesca profesionales. 
                Compra boletos, participa y gana increíbles premios relacionados con la pesca deportiva.
              </p>
            </section>

            {/* Datos de ubicación recordados */}
            <section className="bg-blue-50 rounded-lg shadow-terrapesca p-6 border border-blue-200">
              <h2 className="text-2xl font-bold text-blue-800 mb-4 flex items-center">
                📍 Datos de Ubicación Recordados
              </h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-blue-600 mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-blue-800">Facilidad de Compra</h3>
                    <p className="text-blue-700">
                      El sistema recordará automáticamente tus datos de ubicación (nombre, teléfono, email, estado) 
                      de participaciones anteriores, facilitando futuras compras.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Shield className="h-6 w-6 text-blue-600 mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-blue-800">Seguridad de Datos</h3>
                    <p className="text-blue-700">
                      Tus datos se almacenan de forma segura en tu dispositivo y se eliminan automáticamente 
                      después de 6 meses de inactividad.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <AlertTriangle className="h-6 w-6 text-blue-600 mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-blue-800">Control Total</h3>
                    <p className="text-blue-700">
                      Siempre puedes modificar o actualizar tus datos antes de confirmar cualquier compra.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Pasos para participar */}
            <section className="bg-white rounded-lg shadow-terrapesca p-6 border border-terrapesca-blue-100">
              <h2 className="text-2xl font-bold text-terrapesca-blue-800 mb-6 flex items-center">
                🎫 Cómo Participar en un Sorteo
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-terrapesca-green-100 text-terrapesca-green-700 rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 mt-1">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold text-terrapesca-blue-800 mb-2">Ver Sorteos Disponibles</h3>
                    <ul className="text-terrapesca-blue-600 space-y-1">
                      <li>• Entra a la página principal</li>
                      <li>• Haz clic en "Ver todos los sorteos"</li>
                      <li>• Explora los sorteos activos disponibles</li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-terrapesca-green-100 text-terrapesca-green-700 rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 mt-1">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold text-terrapesca-blue-800 mb-2">Seleccionar un Sorteo</h3>
                    <ul className="text-terrapesca-blue-600 space-y-1">
                      <li>• Haz clic en el sorteo que te interese</li>
                      <li>• Revisa los detalles del premio</li>
                      <li>• Verifica la fecha del sorteo</li>
                      <li>• Haz clic en "Comprar Boletos"</li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-terrapesca-green-100 text-terrapesca-green-700 rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 mt-1">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold text-terrapesca-blue-800 mb-2">Elegir tus Boletos</h3>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-terrapesca-blue-700">🎲 Maquinita de la Suerte (Recomendado)</h4>
                        <ul className="text-terrapesca-blue-600 text-sm space-y-1 ml-4">
                          <li>• Selecciona cuántos boletos quieres (1-50)</li>
                          <li>• Haz clic en "¡Probar mi suerte!"</li>
                          <li>• El sistema elegirá números aleatorios para ti</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-terrapesca-blue-700">🎯 Selección Manual</h4>
                        <ul className="text-terrapesca-blue-600 text-sm space-y-1 ml-4">
                          <li>• Haz clic en los números que prefieras</li>
                          <li>• Puedes elegir hasta 50 boletos</li>
                          <li>• Los números seleccionados se marcan en azul</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-terrapesca-green-100 text-terrapesca-green-700 rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 mt-1">
                    4
                  </div>
                  <div>
                    <h3 className="font-semibold text-terrapesca-blue-800 mb-2">Completar tus Datos</h3>
                    <div className="bg-blue-50 p-4 rounded-lg mb-3">
                      <p className="text-blue-800 font-medium text-sm">
                        📍 Si ya participaste antes, tus datos se cargarán automáticamente
                      </p>
                    </div>
                    <ul className="text-terrapesca-blue-600 space-y-1">
                      <li>• ✅ Nombre completo</li>
                      <li>• ✅ Número de WhatsApp (10 dígitos)</li>
                      <li>• ✅ Correo electrónico</li>
                      <li>• ✅ Estado donde vives</li>
                      <li>• ✅ Acepta términos y condiciones</li>
                    </ul>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-terrapesca-green-100 text-terrapesca-green-700 rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 mt-1">
                    5
                  </div>
                  <div>
                    <h3 className="font-semibold text-terrapesca-blue-800 mb-2">Elegir Método de Pago</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <h4 className="font-medium text-green-800 mb-2">💳 Mercado Pago (Recomendado)</h4>
                        <ul className="text-green-700 text-sm space-y-1">
                          <li>• ✅ Pago inmediato y seguro</li>
                          <li>• ✅ Acepta tarjetas y transferencias</li>
                          <li>• ✅ BONUS: Premio especial + Envío GRATIS</li>
                          <li>• ✅ Confirmación automática</li>
                        </ul>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h4 className="font-medium text-blue-800 mb-2">📱 WhatsApp</h4>
                        <ul className="text-blue-700 text-sm space-y-1">
                          <li>• ✅ Pago coordinado personalmente</li>
                          <li>• ✅ Atención directa por WhatsApp</li>
                          <li>• ✅ Múltiples opciones de pago</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Sistema de reservas */}
            <section className="bg-yellow-50 rounded-lg shadow-terrapesca p-6 border border-yellow-200">
              <h2 className="text-2xl font-bold text-yellow-800 mb-4 flex items-center">
                <Clock className="mr-3" />
                ⏰ Sistema de Reservas
              </h2>
              <div className="space-y-3">
                <p className="text-yellow-700">
                  <strong>Cuando completas tus datos, tus boletos se reservan por 3 horas.</strong>
                </p>
                <ul className="text-yellow-700 space-y-2">
                  <li>• Durante este tiempo, nadie más puede comprar esos números</li>
                  <li>• Recibes confirmación automática en tu WhatsApp</li>
                  <li>• Si no pagas en 3 horas, los boletos vuelven a estar disponibles</li>
                  <li>• No hay penalización por no completar el pago</li>
                </ul>
              </div>
            </section>

            {/* Precios y pagos */}
            <section className="bg-white rounded-lg shadow-terrapesca p-6 border border-terrapesca-blue-100">
              <h2 className="text-2xl font-bold text-terrapesca-blue-800 mb-4 flex items-center">
                <CreditCard className="mr-3" />
                💰 Precios y Pagos
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-terrapesca-blue-800 mb-3">Precios Actuales</h3>
                  <div className="bg-terrapesca-green-50 p-4 rounded-lg border border-terrapesca-green-200">
                    <p className="text-terrapesca-green-800 font-bold text-lg">
                      Sorteo Trolling: $150 MXN por boleto
                    </p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-terrapesca-blue-800 mb-3">Métodos Aceptados</h3>
                  <ul className="text-terrapesca-blue-600 space-y-1">
                    <li>• 💳 Tarjetas de crédito y débito</li>
                    <li>• 🏦 Transferencia bancaria (SPEI)</li>
                    <li>• 📱 Billeteras digitales</li>
                    <li>• 🏪 Pagos en efectivo (OXXO, etc.)</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Premio especial */}
            <section className="bg-gradient-to-r from-terrapesca-orange-50 to-terrapesca-orange-100 rounded-lg shadow-terrapesca p-6 border border-terrapesca-orange-200">
              <h2 className="text-2xl font-bold text-terrapesca-orange-800 mb-4 flex items-center">
                <Gift className="mr-3" />
                🎁 Premio Especial Mercado Pago
              </h2>
              <div className="bg-white p-4 rounded-lg border border-terrapesca-orange-300">
                <p className="text-terrapesca-orange-800 font-semibold mb-2">
                  Al pagar con Mercado Pago, automáticamente participas en un premio especial adicional
                </p>
                <ul className="text-terrapesca-orange-700 space-y-1">
                  <li>• ✅ Premio extra sin costo adicional</li>
                  <li>• ✅ Envío completamente GRATIS a toda México</li>
                  <li>• ✅ Se suma a tu participación normal</li>
                  <li>• ✅ Activación automática al pagar</li>
                </ul>
              </div>
            </section>

            {/* Contacto */}
            <section className="bg-white rounded-lg shadow-terrapesca p-6 border border-terrapesca-blue-100">
              <h2 className="text-2xl font-bold text-terrapesca-blue-800 mb-6 flex items-center">
                <Phone className="mr-3" />
                📞 Contacto y Soporte
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
                  
                  <div className="flex items-center">
                    <Clock className="h-6 w-6 text-terrapesca-green-600 mr-3" />
                    <div>
                      <p className="font-semibold text-terrapesca-blue-800">Horario</p>
                      <p className="text-terrapesca-blue-600">Lun-Vie 9:00 AM - 6:00 PM</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-start">
                    <MapPin className="h-6 w-6 text-terrapesca-green-600 mr-3 mt-1" />
                    <div>
                      <p className="font-semibold text-terrapesca-blue-800">Ubicación</p>
                      <p className="text-terrapesca-blue-600">
                        Calle Niños Héroes 775<br />
                        Colonia Bienestar<br />
                        C.P. 81280<br />
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
                🎉 ¡Listo para Participar!
              </h2>
              <p className="text-green-100 mb-6">
                Ahora que conoces todo sobre Sorteos Terrapesca, estás listo para ganar increíbles premios de pesca.
              </p>
              <div className="space-y-4">
                <Link
                  to="/boletos"
                  className="inline-flex items-center px-8 py-4 bg-white text-terrapesca-green-600 rounded-lg hover:bg-gray-100 transition-colors font-bold text-lg shadow-lg"
                >
                  🎫 Comprar Boletos Ahora
                </Link>
                <p className="text-green-100 text-sm">
                  🍀 ¡Buena Suerte!
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

export default ManualUsuarioPage;