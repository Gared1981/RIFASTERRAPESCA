import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { Calendar, Users, Share2, Copy, MapIcon as WhatsappIcon, Ticket, ChevronLeft, ChevronRight, Video, ZoomIn, X, Clock, Shield, Gift } from 'lucide-react';
import Footer from '../components/Footer';
import CountdownTimer from '../components/CountdownTimer';
import VideoPlayer from '../components/VideoPlayer';
import CollapsiblePrizeList from '../components/CollapsiblePrizeList';
import toast from 'react-hot-toast';

interface PublicRaffle {
  id: number;
  name: string;
  description: string;
  image_url: string;
  video_url?: string;
  images: string[];
  video_urls?: string[];
  prize_items: string[];
  draw_date: string;
  drawn_at: string | null;
  winner_id: string | null;
  winner_first_name: string | null;
  winner_last_name: string | null;
  participant_count: number;
  total_tickets: number;
  price: number;
  slug: string;
  status: string;
}

const RafflePage: React.FC = () => {
  const { slug } = useParams();
  const [raffle, setRaffle] = useState<PublicRaffle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'images' | 'videos'>('images');
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);
  const [showGifModal, setShowGifModal] = useState(false);

  useEffect(() => {
    const fetchRaffle = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('public_raffles')
          .select('*')
          .eq('slug', slug)
          .single();

        if (error) throw error;
        setRaffle(data);
      } catch (err) {
        console.error('Error fetching raffle:', err);
        setError('No se pudo cargar el sorteo');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchRaffle();
    }
  }, [slug]);

  const handleShare = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: raffle?.name,
          text: `¡Mira este sorteo: ${raffle?.name}!`,
          url
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback to copying to clipboard
      try {
        await navigator.clipboard.writeText(url);
        toast.success('¡Enlace copiado al portapapeles!');
      } catch (err) {
        console.error('Error copying to clipboard:', err);
        toast.error('No se pudo copiar el enlace');
      }
    }
  };

  const handleWhatsAppShare = () => {
    const url = window.location.href;
    const text = encodeURIComponent(`¡Mira este sorteo: ${raffle?.name}!\n${url}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const openImageModal = (index: number) => {
    setModalImageIndex(index);
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
  };

  const openGifModal = () => {
    setShowGifModal(true);
  };

  const closeGifModal = () => {
    setShowGifModal(false);
  };

  const nextModalImage = () => {
    if (raffle && allImages.length > 0) {
      setModalImageIndex((prev) => (prev + 1) % allImages.length);
    }
  };

  const prevModalImage = () => {
    if (raffle && allImages.length > 0) {
      setModalImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
    }
  };

  // Handle keyboard navigation in modal
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!showImageModal && !showGifModal) return;
      
      if (e.key === 'Escape') {
        if (showImageModal) closeImageModal();
        if (showGifModal) closeGifModal();
      } else if (showImageModal) {
        if (e.key === 'ArrowLeft') {
          prevModalImage();
        } else if (e.key === 'ArrowRight') {
          nextModalImage();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showImageModal, showGifModal]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error || !raffle) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Sorteo no encontrado</h2>
        <p className="text-gray-600 text-center mb-4">
          El sorteo que buscas no existe o no está disponible.
        </p>
        <Link
          to="/sorteos"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
        >
          Ver todos los sorteos
        </Link>
      </div>
    );
  }

  const allImages = [raffle.image_url, ...(raffle.images || [])].filter(Boolean);
  const allVideos = [raffle.video_url, ...(raffle.video_urls || [])].filter(Boolean);
  const hasMedia = allImages.length > 0 || allVideos.length > 0;

  // Formatear fecha con zona horaria del Pacífico
  const formatDrawDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Mazatlan'
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Galería estilo Amazon */}
            <div className="space-y-4">
              {hasMedia && (
                <>
                  {/* Tabs para cambiar entre imágenes y videos */}
                  {allImages.length > 0 && allVideos.length > 0 && (
                    <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                      <button
                        onClick={() => setActiveTab('images')}
                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                          activeTab === 'images'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        Imágenes ({allImages.length})
                      </button>
                      <button
                        onClick={() => setActiveTab('videos')}
                        className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                          activeTab === 'videos'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        Videos ({allVideos.length})
                      </button>
                    </div>
                  )}

                  {/* Contenido principal */}
                  <div className="relative">
                    {activeTab === 'images' && allImages.length > 0 ? (
                      <div className="flex flex-col lg:flex-row gap-4">
                        {/* Miniaturas - Responsive */}
                        <div className="order-2 lg:order-1 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto lg:max-h-96 lg:w-20">
                          {allImages.map((image, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentImageIndex(index)}
                              className={`flex-shrink-0 w-16 h-16 lg:w-20 lg:h-20 overflow-hidden rounded-lg border-2 transition-all duration-200 ${
                                index === currentImageIndex 
                                  ? 'border-orange-500 shadow-lg' 
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <img
                                src={image}
                                alt={`Vista ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </button>
                          ))}
                        </div>

                        {/* Imagen principal - MISMO TAMAÑO QUE LA GALERÍA */}
                        <div className="order-1 lg:order-2 flex-1 relative group">
                          <div 
                            className="relative cursor-pointer bg-gray-50 rounded-lg overflow-hidden"
                            onClick={() => openImageModal(currentImageIndex)}
                          >
                            <img
                              src={allImages[currentImageIndex]}
                              alt={raffle.name}
                              className="w-full h-[400px] md:h-[500px] lg:h-[600px] object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            
                            {/* Overlay con icono de zoom */}
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="bg-white bg-opacity-90 rounded-full p-3 shadow-lg">
                                  <ZoomIn className="w-6 h-6 text-gray-800" />
                                </div>
                              </div>
                            </div>
                            
                            {/* Texto "Haz clic para ampliar" */}
                            <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              Haz clic para ampliar
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : activeTab === 'videos' && allVideos.length > 0 ? (
                      <div className="grid grid-cols-1 gap-4">
                        {allVideos.map((videoUrl, index) => (
                          <VideoPlayer
                            key={index}
                            videoUrl={videoUrl}
                            title={`${raffle.name} - Video ${index + 1}`}
                            className="h-96"
                            autoplay={index === 0}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="cursor-pointer" onClick={() => openImageModal(0)}>
                        <img
                          src={raffle.image_url}
                          alt={raffle.name}
                          className="w-full h-[400px] md:h-[500px] lg:h-[600px] object-cover rounded-lg shadow-lg hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                  </div>

                  {/* Botón para mostrar GIF del premio especial */}
                  <div className="mt-8 flex justify-center">
                    <button
                      onClick={openGifModal}
                      className="group relative bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-2xl hover:shadow-yellow-500/25 transform hover:scale-105 transition-all duration-300 border-2 border-yellow-300 hover:border-yellow-200"
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                      <span className="relative flex items-center">
                        <Gift className="mr-3 h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
                        🎁 Ver Premio Especial
                        <Gift className="ml-3 h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
                      </span>
                      {/* Efecto de brillo */}
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transform -skew-x-12 group-hover:animate-pulse transition-all duration-700"></div>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Información del sorteo */}
            <div>
              <div className="flex justify-between items-start mb-4">
                <h1 className="text-3xl font-bold text-gray-900">{raffle.name}</h1>
                <div className="flex space-x-2">
                  <button
                    onClick={handleShare}
                    className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
                    title="Compartir"
                  >
                    <Share2 className="h-5 w-5" />
                  </button>
                  <button
                    onClick={handleWhatsAppShare}
                    className="p-2 text-green-500 hover:text-green-700 rounded-full hover:bg-green-50 transition-colors"
                    title="Compartir por WhatsApp"
                  >
                    <WhatsappIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="prose max-w-none mb-6">
                <p className="whitespace-pre-line text-gray-600">{raffle.description}</p>
              </div>

              {/* Contenido del premio con componente colapsable */}
              {raffle.prize_items && raffle.prize_items.length > 0 && (
                <div className="mb-6">
                  <CollapsiblePrizeList 
                    items={raffle.prize_items}
                    maxInitialItems={10}
                  />
                </div>
              )}

              {/* Insignia de Pago Seguro - POSICIONADA ESTRATÉGICAMENTE */}
              <div className="mb-6 flex justify-center">
                <div className="relative">
                  <img
                    src="https://cdn.shopify.com/s/files/1/0205/5752/9188/files/pago-seguro-pizarronesplus-2023-768x217.png?v=1750993563"
                    alt="Pago Seguro - Mercado Pago"
                    className="h-16 md:h-20 w-auto object-contain"
                    style={{
                      filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1))',
                      maxWidth: '300px'
                    }}
                  />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-green-600 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Fecha del sorteo</p>
                      <p className="font-semibold">
                        {formatDrawDate(raffle.draw_date)}
                      </p>
                      <div className="flex items-center mt-1">
                        <Clock className="h-4 w-4 text-blue-500 mr-1" />
                        <span className="text-xs text-blue-600 font-medium">
                          Hora del Pacífico - Sinaloa
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-green-600 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Participantes</p>
                      <p className="font-semibold">{raffle.participant_count}</p>
                    </div>
                  </div>
                </div>
              </div>

              {raffle.drawn_at ? (
                <div className="bg-green-50 rounded-lg p-6 mb-6 border border-green-200">
                  <h3 className="text-lg font-semibold text-green-800 mb-2">
                    ¡Sorteo Realizado!
                  </h3>
                  <p className="text-green-700">
                    Fecha: {formatDrawDate(raffle.drawn_at)}
                  </p>
                  {raffle.winner_id && (
                    <div className="mt-2">
                      <p className="font-medium text-green-800">
                        Ganador: {raffle.winner_first_name} {raffle.winner_last_name}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <h3 className="text-lg font-semibold mb-4">Tiempo restante</h3>
                    <CountdownTimer targetDate={raffle.draw_date} />
                  </div>

                  {raffle.status === 'active' && (
                    <div className="bg-green-50 rounded-lg p-6 mb-6 border border-green-200">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-green-800">
                            Precio por boleto
                          </h3>
                          <p className="text-2xl font-bold text-green-600">
                            ${raffle.price} MXN
                          </p>
                        </div>
                        <Link
                          to={`/boletos?raffle=${raffle.id}`}
                          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 shadow-sm transition-colors"
                        >
                          <Ticket className="mr-2 h-5 w-5" />
                          Comprar Boletos
                        </Link>
                      </div>
                      <div className="text-sm text-green-700">
                        * Los boletos serán reservados por 3 horas una vez seleccionados
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="mt-6">
                <Link
                  to="/sorteos"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors"
                >
                  Ver todos los sorteos
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal del GIF del premio especial */}
      {showGifModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full">
            {/* Botón cerrar */}
            <button
              onClick={closeGifModal}
              className="absolute -top-12 right-0 z-10 text-white hover:text-gray-300 transition-colors bg-black bg-opacity-50 rounded-full p-3"
            >
              <X className="w-8 h-8" />
            </button>
            
            {/* Contenido del modal */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
              <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-white p-6 text-center">
                <h2 className="text-3xl font-bold mb-2">🎁 ¡PREMIO ESPECIAL! 🎁</h2>
                <p className="text-lg opacity-90">Envío completamente GRATIS a toda la República Mexicana</p>
              </div>
              
              <div className="p-6">
                <img
                  src="https://cdn.shopify.com/s/files/1/0205/5752/9188/files/ENVIO_GRATIS.gif?v=1750992275"
                  alt="Premio Especial - Envío Gratis"
                  className="w-full h-auto rounded-xl shadow-lg"
                  style={{ 
                    maxHeight: '70vh',
                    objectFit: 'contain'
                  }}
                />
                
                <div className="mt-6 text-center">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-green-800 mb-2">
                      ✨ Beneficio Exclusivo
                    </h3>
                    <p className="text-green-700">
                      Tu premio será enviado sin costo adicional a cualquier parte de México. 
                      ¡No importa dónde te encuentres, nosotros nos encargamos de todo!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de imagen ampliada estilo Amazon */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center p-4">
            {/* Botón cerrar */}
            <button
              onClick={closeImageModal}
              className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 transition-colors bg-black bg-opacity-50 rounded-full p-3"
            >
              <X className="w-6 h-6" />
            </button>
            
            {/* Imagen principal */}
            <div className="relative max-w-full max-h-full flex items-center justify-center">
              <img
                src={allImages[modalImageIndex]}
                alt={`${raffle.name} - Imagen ${modalImageIndex + 1}`}
                className="max-w-full max-h-[90vh] object-contain"
              />
              
              {/* Navegación */}
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={prevModalImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-800 p-3 rounded-full shadow-lg transition-all"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={nextModalImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-800 p-3 rounded-full shadow-lg transition-all"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}
            </div>
            
            {/* Información de la imagen */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-6 py-3 rounded-lg">
              <div className="text-center">
                <p className="text-sm font-medium">{raffle.name}</p>
                <p className="text-xs text-gray-300 mt-1">
                  Imagen {modalImageIndex + 1} de {allImages.length}
                </p>
              </div>
            </div>
            
            {/* Miniaturas en el modal */}
            {allImages.length > 1 && (
              <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 max-w-full">
                <div className="flex space-x-2 overflow-x-auto pb-2 px-4">
                  {allImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setModalImageIndex(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all ${
                        index === modalImageIndex 
                          ? 'ring-2 ring-white scale-110' 
                          : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`Miniatura ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
};

export default RafflePage;