import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, Ticket, Calendar, User, ArrowRight, Download, Share2 } from 'lucide-react';
import Footer from '../components/Footer';
import { supabase } from '../utils/supabaseClient';

interface PaymentInfo {
  id: string;
  status: string;
  amount: number;
  tickets: string[];
  raffle: string;
  date: string;
  external_reference: string;
}

const PaymentSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [paymentData, setPaymentData] = useState<PaymentInfo | null>(null);
  const [loading, setLoading] = useState(true);
  
  const paymentId = searchParams.get('payment_id');
  const status = searchParams.get('status');
  const externalReference = searchParams.get('external_reference');
  const preferenceId = searchParams.get('preference_id');

  useEffect(() => {
    const fetchPaymentData = async () => {
      try {
        setLoading(true);
        
        // Buscar información del pago en los logs
        let query = supabase.from('payment_logs').select('*');
        
        if (paymentId) {
          query = query.eq('payment_id', paymentId);
        } else if (externalReference) {
          query = query.eq('external_reference', externalReference);
        } else if (preferenceId) {
          query = query.eq('preference_id', preferenceId);
        }
        
        const { data: paymentLogs, error } = await query.order('created_at', { ascending: false }).limit(1);
        
        if (error) {
          console.error('Error fetching payment data:', error);
        }
        
        if (paymentLogs && paymentLogs.length > 0) {
          const log = paymentLogs[0];
          const metadata = log.metadata || {};
          
          // Obtener información del sorteo
          const { data: raffleData } = await supabase
            .from('raffles')
            .select('name')
            .eq('id', metadata.raffle_id)
            .single();
          
          setPaymentData({
            id: log.payment_id || log.preference_id || 'N/A',
            status: log.status || status || 'approved',
            amount: log.amount || 0,
            tickets: metadata.ticket_numbers || [],
            raffle: raffleData?.name || 'Sorteo Terrapesca',
            date: new Date(log.created_at).toLocaleDateString(),
            external_reference: log.external_reference || ''
          });
        } else {
          // Datos por defecto si no se encuentra información
          setPaymentData({
            id: paymentId || 'N/A',
            status: status || 'approved',
            amount: 0,
            tickets: [],
            raffle: 'Sorteo Terrapesca',
            date: new Date().toLocaleDateString(),
            external_reference: externalReference || ''
          });
        }
      } catch (error) {
        console.error('Error processing payment data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentData();
  }, [paymentId, status, externalReference, preferenceId]);

  const handleShare = async () => {
    const shareText = `¡Acabo de comprar boletos para ${paymentData?.raffle}! 🎟️\nBoletos: ${paymentData?.tickets.join(', ')}\n¡Deséame suerte! 🍀`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Mis boletos de sorteo',
          text: shareText,
          url: window.location.origin
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback a WhatsApp
      const whatsappText = encodeURIComponent(shareText);
      window.open(`https://wa.me/?text=${whatsappText}`, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!paymentData) {
    return (
      <div className="flex flex-col min-h-screen">
        <main className="flex-grow bg-gray-50 py-12">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              No se encontró información del pago
            </h1>
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
            >
              Volver al inicio
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const isPending = status === 'pending' || paymentData.status === 'pending';

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Header */}
            <div className={`px-6 py-8 text-center ${isPending ? 'bg-yellow-500' : 'bg-green-500'}`}>
              <CheckCircle className="h-16 w-16 text-white mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-white mb-2">
                {isPending ? '¡Pago Pendiente!' : '¡Pago Exitoso!'}
              </h1>
              <p className={isPending ? 'text-yellow-100' : 'text-green-100'}>
                {isPending 
                  ? 'Tu pago está siendo procesado' 
                  : 'Tu pago ha sido procesado correctamente'
                }
              </p>
            </div>

            {/* Payment Details */}
            <div className="px-6 py-8">
              <div className="space-y-6">
                {/* Payment Info */}
                <div className="border-b pb-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Detalles del Pago
                  </h2>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">ID de Pago:</span>
                      <p className="font-medium">{paymentData.id}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Estado:</span>
                      <p className={`font-medium ${isPending ? 'text-yellow-600' : 'text-green-600'}`}>
                        {isPending ? 'Pendiente' : 'Aprobado'}
                      </p>
                    </div>
                    {paymentData.amount > 0 && (
                      <div>
                        <span className="text-gray-500">Monto:</span>
                        <p className="font-medium">${paymentData.amount.toLocaleString()} MXN</p>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-500">Fecha:</span>
                      <p className="font-medium">{paymentData.date}</p>
                    </div>
                  </div>
                </div>

                {/* Raffle Info */}
                <div className="border-b pb-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Sorteo
                  </h2>
                  <p className="text-gray-700">{paymentData.raffle}</p>
                </div>

                {/* Tickets */}
                {paymentData.tickets.length > 0 && (
                  <div className="border-b pb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Ticket className="h-5 w-5 mr-2" />
                      Tus Boletos
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {paymentData.tickets.map((ticket: string, index: number) => (
                        <span
                          key={index}
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            isPending 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {ticket}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Next Steps */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    ¿Qué sigue?
                  </h2>
                  <div className="space-y-3 text-sm text-gray-600">
                    {isPending ? (
                      <>
                        <div className="flex items-start">
                          <div className="bg-yellow-100 rounded-full p-1 mr-3 mt-0.5">
                            <CheckCircle className="h-4 w-4 text-yellow-600" />
                          </div>
                          <p>
                            Tu pago está siendo procesado. Esto puede tomar unos minutos.
                          </p>
                        </div>
                        <div className="flex items-start">
                          <div className="bg-yellow-100 rounded-full p-1 mr-3 mt-0.5">
                            <User className="h-4 w-4 text-yellow-600" />
                          </div>
                          <p>
                            Te notificaremos por WhatsApp cuando se confirme el pago.
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-start">
                          <div className="bg-green-100 rounded-full p-1 mr-3 mt-0.5">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          </div>
                          <p>
                            Tus boletos han sido confirmados y están registrados a tu nombre.
                          </p>
                        </div>
                        <div className="flex items-start">
                          <div className="bg-green-100 rounded-full p-1 mr-3 mt-0.5">
                            <User className="h-4 w-4 text-green-600" />
                          </div>
                          <p>
                            Recibirás una confirmación por WhatsApp con todos los detalles.
                          </p>
                        </div>
                        <div className="flex items-start">
                          <div className="bg-green-100 rounded-full p-1 mr-3 mt-0.5">
                            <Calendar className="h-4 w-4 text-green-600" />
                          </div>
                          <p>
                            El sorteo se realizará en vivo a través de nuestras redes sociales.
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-8 space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    to="/verificar"
                    className="flex-1 bg-green-600 text-white text-center py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                  >
                    Verificar mis boletos
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                  <button
                    onClick={handleShare}
                    className="flex-1 border border-gray-300 text-gray-700 text-center py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    Compartir
                  </button>
                </div>
                
                <Link
                  to="/sorteos"
                  className="block text-center text-gray-600 hover:text-gray-800 py-2"
                >
                  Ver otros sorteos
                </Link>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-800 mb-2">
              ¿Tienes alguna pregunta?
            </h3>
            <p className="text-blue-700 text-sm mb-3">
              Nuestro equipo está disponible para ayudarte con cualquier duda sobre tu compra.
            </p>
            <a
              href="https://wa.me/526686889571"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
            >
              Contactar por WhatsApp
              <ArrowRight className="ml-1 h-4 w-4" />
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PaymentSuccessPage;