import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, FileText } from 'lucide-react';
import Footer from '../components/Footer';
import SecurePaymentBadge from '../components/SecurePaymentBadge';

const HomePage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section Responsive */}
      <section className="relative w-full h-screen overflow-hidden">
        {/* Background Image Container with Responsive Images */}
        <div className="absolute inset-0">
          <picture>
            {/* Mobile version */}
            <source 
              media="(max-width: 768px)" 
              srcSet="/Mobile-03.jpg" 
            />
            
            {/* Tablet version */}
            <source 
              media="(max-width: 1024px)" 
              srcSet="/tablet-02.jpg" 
            />
            
            {/* Desktop version */}
            <img
              src="https://cdn.shopify.com/s/files/1/0205/5752/9188/files/Desktop.jpg?v=1750806041"
              alt="Sorteos Terrapesca"
              className="w-full h-full object-cover object-center"
              style={{
                filter: 'brightness(1.1) contrast(1.05) saturate(1.1)',
                objectPosition: 'center center'
              }}
            />
          </picture>
          
          {/* Gradient overlay más sutil para mejor claridad */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
        </div>
        
        {/* Content Container - Responsive positioning */}
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20 md:pb-24 lg:pb-32">
            <div className="text-center">
              {/* Botones responsive con diseño premium */}
              <div className="flex flex-col space-y-4 sm:space-y-6 md:flex-row md:space-y-0 md:space-x-6 lg:space-x-8 justify-center items-center">
                <Link
                  to="/sorteos"
                  className="group relative w-full sm:w-auto inline-flex items-center justify-center px-8 sm:px-10 md:px-12 py-4 sm:py-5 md:py-6 text-base sm:text-lg md:text-xl font-bold text-white bg-gradient-to-r from-terrapesca-green-600 via-terrapesca-green-700 to-terrapesca-green-800 rounded-xl sm:rounded-2xl shadow-2xl hover:shadow-terrapesca-green-500/25 transform hover:scale-105 transition-all duration-300 border-2 border-terrapesca-green-400/50 hover:border-terrapesca-green-300 backdrop-blur-md"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  <span className="relative flex items-center">
                    <span className="text-base sm:text-lg md:text-xl font-extrabold tracking-wide">Ver todos los sorteos</span>
                    <ArrowRight className="ml-2 sm:ml-3 md:ml-4 h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 group-hover:translate-x-2 transition-transform duration-300" />
                  </span>
                  {/* Efecto de brillo */}
                  <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transform -skew-x-12 group-hover:animate-pulse transition-all duration-700"></div>
                </Link>
                
                <Link
                  to="/verificar"
                  className="group relative w-full sm:w-auto inline-flex items-center justify-center px-8 sm:px-10 md:px-12 py-4 sm:py-5 md:py-6 text-base sm:text-lg md:text-xl font-bold text-white bg-gradient-to-r from-terrapesca-blue-600 via-terrapesca-blue-700 to-terrapesca-blue-800 rounded-xl sm:rounded-2xl shadow-2xl hover:shadow-terrapesca-blue-500/25 transform hover:scale-105 transition-all duration-300 border-2 border-terrapesca-blue-400/50 hover:border-terrapesca-blue-300 backdrop-blur-md"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  <span className="relative flex items-center">
                    <CheckCircle className="mr-2 sm:mr-3 md:mr-4 h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 group-hover:scale-110 transition-transform duration-300 text-terrapesca-blue-200" />
                    <span className="text-base sm:text-lg md:text-xl font-extrabold tracking-wide">Verificar mi boleto</span>
                  </span>
                  {/* Efecto de brillo */}
                  <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transform -skew-x-12 group-hover:animate-pulse transition-all duration-700"></div>
                </Link>
              </div>
              
              {/* Indicador de scroll mejorado - solo visible en desktop */}
              <div className="hidden lg:block mt-16 xl:mt-20 animate-bounce">
                <div className="w-8 h-12 border-2 border-white/60 rounded-full mx-auto flex justify-center backdrop-blur-sm bg-white/10">
                  <div className="w-1.5 h-4 bg-white/80 rounded-full mt-2 animate-pulse"></div>
                </div>
                <p className="text-white/70 text-sm mt-2 font-medium">Desliza para ver más</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Manual Button Section - NUEVA SECCIÓN */}
      <section className="py-8 bg-gradient-to-r from-terrapesca-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Link
              to="/manual-usuario"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-terrapesca-blue-600 via-terrapesca-blue-700 to-terrapesca-blue-800 text-white rounded-xl shadow-xl hover:shadow-terrapesca-blue-500/25 transform hover:scale-105 transition-all duration-300 border-2 border-terrapesca-blue-400/50 hover:border-terrapesca-blue-300 font-bold text-lg"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <span className="relative flex items-center">
                <FileText className="mr-3 h-6 w-6" />
                📖 Manual del Usuario
              </span>
            </Link>
            <p className="mt-4 text-terrapesca-blue-600 font-medium">
              Aprende cómo participar en nuestros sorteos paso a paso
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-terrapesca-blue-800 mb-4">¿Cómo funciona?</h2>
            <p className="text-terrapesca-blue-600 max-w-3xl mx-auto">
              Participar en nuestro sorteo es muy sencillo. Sigue estos pasos y estarás más cerca de ganar.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center group">
              <div className="w-12 h-12 bg-terrapesca-green-100 text-terrapesca-green-700 rounded-full flex items-center justify-center text-xl font-bold mb-4 group-hover:scale-110 transition-transform duration-300">
                1
              </div>
              <h3 className="text-lg font-medium text-terrapesca-blue-800 mb-2">Elige tus boletos</h3>
              <p className="text-terrapesca-blue-600">
                Navega por nuestro catálogo de sorteos activos y selecciona los números que más te gusten.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center group">
              <div className="w-12 h-12 bg-terrapesca-green-100 text-terrapesca-green-700 rounded-full flex items-center justify-center text-xl font-bold mb-4 group-hover:scale-110 transition-transform duration-300">
                2
              </div>
              <h3 className="text-lg font-medium text-terrapesca-blue-800 mb-2">Reserva en línea</h3>
              <p className="text-terrapesca-blue-600">
                Completa el formulario con tus datos personales para reservar los boletos seleccionados.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center group">
              <div className="w-12 h-12 bg-terrapesca-green-100 text-terrapesca-green-700 rounded-full flex items-center justify-center text-xl font-bold mb-4 group-hover:scale-110 transition-transform duration-300">
                3
              </div>
              <h3 className="text-lg font-medium text-terrapesca-blue-800 mb-2">Realiza tu pago</h3>
              <p className="text-terrapesca-blue-600 mb-4">
                Paga directamente tus boletos con pago seguro de Mercado Pago o bien puedes realizar el proceso vía WhatsApp.
              </p>
              {/* Badge de pago seguro en el paso 3 */}
              <SecurePaymentBadge size="sm" showText={false} />
            </div>
            
            <div className="flex flex-col items-center text-center group">
              <div className="w-12 h-12 bg-terrapesca-green-100 text-terrapesca-green-700 rounded-full flex items-center justify-center text-xl font-bold mb-4 group-hover:scale-110 transition-transform duration-300">
                4
              </div>
              <h3 className="text-lg font-medium text-terrapesca-blue-800 mb-2">¡Espera el sorteo!</h3>
              <p className="text-terrapesca-blue-600">
                Una vez confirmado tu pago, solo queda esperar al día del sorteo. ¡Buena suerte!
              </p>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default HomePage;