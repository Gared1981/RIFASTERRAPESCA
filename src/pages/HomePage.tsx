import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Trophy, CheckCircle, Clock, Users, Ticket } from 'lucide-react';
import Footer from '../components/Footer';
import CountdownTimer from '../components/CountdownTimer';
import { supabase } from '../utils/supabaseClient';

interface PublicRaffle {
  id: number;
  name: string;
  description: string;
  image_url: string;
  draw_date: string;
  price: number;
  participant_count: number;
  tickets_sold: number;
  max_tickets: number;
  status: string;
  slug: string;
}

const HomePage: React.FC = () => {
  const [activeRaffles, setActiveRaffles] = useState<PublicRaffle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActiveRaffles = async () => {
      try {
        const { data, error } = await supabase
          .from('public_raffles')
          .select('*')
          .eq('status', 'active')
          .order('draw_date', { ascending: true });

        if (error) throw error;
        setActiveRaffles(data || []);
      } catch (err) {
        console.error('Error fetching raffles:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveRaffles();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section Responsive con mejor posicionamiento */}
      <section className="relative w-full h-screen overflow-hidden">
        {/* Background Image Container con mejor object-position */}
        <div className="absolute inset-0">
          <picture>
            {/* Mobile version - centrado en la parte superior */}
            <source 
              media="(max-width: 768px)" 
              srcSet="/Mobile-03.jpg" 
            />
            
            {/* Tablet version - posición ajustada */}
            <source 
              media="(max-width: 1024px)" 
              srcSet="/tablet-02.jpg" 
            />
            
            {/* Desktop version con mejor posicionamiento */}
            <img
              src="https://cdn.shopify.com/s/files/1/0205/5752/9188/files/Desktop.jpg?v=1750806041"
              alt="Sorteos Terrapesca"
              className="w-full h-full object-cover"
              style={{
                filter: 'brightness(1.1) contrast(1.05) saturate(1.1)',
                objectPosition: 'center 35%' // Movido hacia arriba para mostrar mejor las letras
              }}
            />
          </picture>
          
          {/* Gradient overlay optimizado para mejor legibilidad */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10"></div>
        </div>
        
        {/* Content Container - Mejor posicionamiento responsive */}
        <div className="relative z-10 h-full flex items-end justify-center pb-20 sm:pb-24 md:pb-28 lg:pb-32">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              {/* Botones responsive con mejor contraste - CENTRADOS EN MÓVIL */}
              <div className="flex flex-col items-center space-y-4 sm:space-y-6 md:flex-row md:space-y-0 md:space-x-6 lg:space-x-8 md:justify-center">
                <Link
                  to="/sorteos"
                  className="group relative w-full max-w-sm sm:w-auto inline-flex items-center justify-center px-8 sm:px-10 md:px-12 py-4 sm:py-5 md:py-6 text-base sm:text-lg md:text-xl font-bold text-white bg-gradient-to-r from-green-600 via-green-700 to-green-800 rounded-xl sm:rounded-2xl shadow-2xl hover:shadow-green-500/25 transform hover:scale-105 transition-all duration-300 border-2 border-green-400/50 hover:border-green-300 backdrop-blur-md"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  <span className="relative flex items-center">
                    <Trophy className="mr-2 sm:mr-3 md:mr-4 h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 group-hover:rotate-12 transition-transform duration-300 text-yellow-300" />
                    <span className="text-base sm:text-lg md:text-xl font-extrabold tracking-wide">Ver todos los sorteos</span>
                    <ArrowRight className="ml-2 sm:ml-3 md:ml-4 h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 group-hover:translate-x-2 transition-transform duration-300" />
                  </span>
                  {/* Efecto de brillo */}
                  <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transform -skew-x-12 group-hover:animate-pulse transition-all duration-700"></div>
                </Link>
                
                <Link
                  to="/verificar"
                  className="group relative w-full max-w-sm sm:w-auto inline-flex items-center justify-center px-8 sm:px-10 md:px-12 py-4 sm:py-5 md:py-6 text-base sm:text-lg md:text-xl font-bold text-white bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 rounded-xl sm:rounded-2xl shadow-2xl hover:shadow-blue-500/25 transform hover:scale-105 transition-all duration-300 border-2 border-blue-400/50 hover:border-blue-300 backdrop-blur-md"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  <span className="relative flex items-center">
                    <CheckCircle className="mr-2 sm:mr-3 md:mr-4 h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 group-hover:scale-110 transition-transform duration-300 text-blue-200" />
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

      {/* Active Raffles Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Sorteos Activos</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Participa en nuestros sorteos activos y no pierdas la oportunidad de ganar increíbles premios.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
          ) : activeRaffles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {activeRaffles.map((raffle) => (
                <div key={raffle.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="relative">
                    <img
                      src={raffle.image_url}
                      alt={raffle.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-0 right-0 m-2">
                      <div className="bg-green-500 text-white px-3 py-1 text-sm rounded-full font-semibold shadow-lg">
                        ${raffle.price} MXN
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{raffle.name}</h3>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-2" />
                        Sorteo: {new Date(raffle.draw_date).toLocaleDateString()}
                      </div>
                      {/* QUITADO: participantes y boletos vendidos */}
                    </div>

                    <Link
                      to={`/sorteo/${raffle.slug}`}
                      className="block w-full text-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                    >
                      Participar ahora
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500">
              No hay sorteos activos en este momento.
            </div>
          )}

          {activeRaffles.length > 0 && (
            <div className="text-center mt-8">
              <Link
                to="/sorteos"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                Ver todos los sorteos
                <ArrowRight className="ml-2" size={18} />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">¿Cómo funciona?</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Participar en nuestro sorteo es muy sencillo. Sigue estos pasos y estarás más cerca de ganar.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xl font-bold mb-4">
                1
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Elige tus boletos</h3>
              <p className="text-gray-600">
                Navega por nuestro catálogo de sorteos activos y selecciona los números que más te gusten.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xl font-bold mb-4">
                2
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Reserva en línea</h3>
              <p className="text-gray-600">
                Completa el formulario con tus datos personales para reservar los boletos seleccionados.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xl font-bold mb-4">
                3
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Realiza tu pago</h3>
              <p className="text-gray-600">
                Paga directamente tus boletos con pago seguro de Mercado Pago o bien puedes realizar el proceso vía WhatsApp.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xl font-bold mb-4">
                4
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">¡Espera el sorteo!</h3>
              <p className="text-gray-600">
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