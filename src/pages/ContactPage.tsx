import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, MessageSquare, Facebook, Instagram, Youtube } from 'lucide-react';
import Footer from '../components/Footer';

const ContactPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">Contacto</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-xl font-semibold mb-6">Información de Contacto</h2>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <Phone className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium">Teléfono</h3>
                    <p className="mt-1 text-gray-600">+52 668 688 9571</p>
                    <p className="mt-1 text-sm text-gray-500">
                      Lunes a Viernes: 9:00 AM - 6:00 PM
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <Mail className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium">Correo Electrónico</h3>
                    <p className="mt-1 text-gray-600">ventasweb@terrapesca.com</p>
                    <p className="mt-1 text-sm text-gray-500">
                      Te respondemos en menos de 24 horas
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <MessageSquare className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium">WhatsApp</h3>
                    <p className="mt-1 text-gray-600">+52 668 688 9571</p>
                    <p className="mt-1 text-sm text-gray-500">
                      Mensajes directos para dudas o pagos
                    </p>
                    <a
                      href="https://wa.me/526686889571"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
                    >
                      Enviar mensaje
                      <MessageSquare className="ml-2 -mr-1 h-4 w-4" />
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <MapPin className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium">Dirección</h3>
                    <p className="mt-1 text-gray-600">
                      Calle Niños Héroes 775, Colonia Bienestar<br />
                      C.P. 81280, Los Mochis, Sinaloa, México
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-10">
                <h2 className="text-xl font-semibold mb-4">Síguenos</h2>
                <div className="flex justify-center space-x-5">
                  <a
                    href="https://www.facebook.com/Terrapesca"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-green-600 transition-colors"
                  >
                    <span className="sr-only">Facebook</span>
                    <Facebook className="h-6 w-6" />
                  </a>
                  <a
                    href="https://www.instagram.com/terrapesca/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-green-600 transition-colors"
                  >
                    <span className="sr-only">Instagram</span>
                    <Instagram className="h-6 w-6" />
                  </a>
                  <a
                    href="https://www.youtube.com/@terrapesca"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-green-600 transition-colors"
                  >
                    <span className="sr-only">YouTube</span>
                    <Youtube className="h-6 w-6" />
                  </a>
                  <a
                    href="https://www.tiktok.com/@terrapesca?is_from_webapp=1&sender_device=pc"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-green-600 transition-colors"
                  >
                    <span className="sr-only">TikTok</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-6">Envíanos un Mensaje</h2>
              
              <form className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Nombre
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                    Mensaje
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  ></textarea>
                </div>
                
                <div>
                  <button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Enviar Mensaje
                  </button>
                </div>
              </form>
              
              <div className="mt-8 bg-green-50 p-6 rounded-lg">
                <h3 className="text-lg font-medium text-green-800 mb-3">
                  Preguntas frecuentes
                </h3>
                <ul className="space-y-4 text-sm">
                  <li>
                    <h4 className="font-medium text-green-700">¿Cómo funciona el sorteo?</h4>
                    <p className="text-gray-600">
                      Selecciona tus boletos, realiza el pago y espera al día del sorteo que se realizará en vivo a través de nuestras redes sociales.
                    </p>
                  </li>
                  <li>
                    <h4 className="font-medium text-green-700">¿Cómo puedo pagar mi boleto?</h4>
                    <p className="text-gray-600">
                      Aceptamos transferencias bancarias, depósitos y pagos con tarjeta. Te contactaremos por WhatsApp para coordinar el método de pago.
                    </p>
                  </li>
                  <li>
                    <h4 className="font-medium text-green-700">¿Qué pasa si gano?</h4>
                    <p className="text-gray-600">
                      Te contactaremos directamente para coordinar la entrega de tu premio. Todos los gastos de entrega están incluidos.
                    </p>
                  </li>
                </ul>
                <div className="mt-4">
                  <Link
                    to="/boletos"
                    className="text-green-700 font-medium hover:text-green-800"
                  >
                    Ver boletos disponibles →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ContactPage;