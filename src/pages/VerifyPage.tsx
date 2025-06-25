import React, { useState } from 'react';
import { supabase, Ticket, User } from '../utils/supabaseClient';
import { Search, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Footer from '../components/Footer';

const VerifyPage: React.FC = () => {
  const [ticketNumber, setTicketNumber] = useState('');
  const [ticketInfo, setTicketInfo] = useState<(Ticket & { user?: User, raffle_name?: string }) | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!ticketNumber || isNaN(parseInt(ticketNumber))) {
      setError('Por favor, ingresa un número de boleto válido');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Query ticket information
      const { data: ticketData, error: ticketError } = await supabase
        .from('tickets')
        .select(`
          *,
          user:user_id(*),
          raffle:raffle_id(name)
        `)
        .eq('number', parseInt(ticketNumber))
        .single();
        
      if (ticketError) {
        if (ticketError.code === 'PGRST116') {
          setError('Boleto no encontrado. Verifica el número e intenta de nuevo.');
        } else {
          throw ticketError;
        }
        setTicketInfo(null);
        return;
      }
      
      // Transform the data to match our expected format
      const transformedData = {
        ...ticketData,
        user: ticketData.user,
        raffle_name: ticketData.raffle?.name
      };
      
      setTicketInfo(transformedData);
      
    } catch (err) {
      console.error('Error verifying ticket:', err);
      setError('Ocurrió un error al verificar el boleto. Intenta de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  };
  
  const getStatusColor = () => {
    if (!ticketInfo) return '';
    
    switch (ticketInfo.status) {
      case 'available':
        return 'bg-green-50 border-green-200 text-green-700';
      case 'reserved':
        return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      case 'purchased':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };
  
  const getStatusIcon = () => {
    if (!ticketInfo) return null;
    
    switch (ticketInfo.status) {
      case 'available':
        return <CheckCircle className="h-12 w-12 text-green-500" />;
      case 'reserved':
        return <AlertCircle className="h-12 w-12 text-yellow-500" />;
      case 'purchased':
        return <CheckCircle className="h-12 w-12 text-blue-500" />;
      default:
        return <XCircle className="h-12 w-12 text-gray-500" />;
    }
  };
  
  const getStatusText = () => {
    if (!ticketInfo) return '';
    
    switch (ticketInfo.status) {
      case 'available':
        return 'Disponible';
      case 'reserved':
        return 'Reservado';
      case 'purchased':
        return 'Pagado';
      default:
        return 'Desconocido';
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Verificar Boleto</h1>
            <p className="text-gray-600 max-w-lg mx-auto">
              Consulta el estado de tu boleto ingresando el número a continuación. 
              Podrás ver si está disponible, reservado o ya ha sido pagado.
            </p>
          </div>
          
          <div className="bg-white shadow overflow-hidden rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="ticketNumber" className="block text-sm font-medium text-gray-700">
                    Número de Boleto
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="ticketNumber"
                      name="ticketNumber"
                      value={ticketNumber}
                      onChange={(e) => setTicketNumber(e.target.value)}
                      className="focus:ring-green-500 focus:border-green-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                      placeholder="Ej. 12345"
                    />
                  </div>
                </div>
                
                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                      loading ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Verificando...
                      </>
                    ) : (
                      'Verificar Boleto'
                    )}
                  </button>
                </div>
              </form>
              
              {error && (
                <div className="mt-4 rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <XCircle className="h-5 w-5 text-red-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Error</h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>{error}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {ticketInfo && (
                <div className={`mt-6 border rounded-lg p-6 ${getStatusColor()}`}>
                  <div className="flex flex-col sm:flex-row items-center">
                    <div className="flex-shrink-0 mr-4 mb-4 sm:mb-0">
                      {getStatusIcon()}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold mb-2">
                        Boleto #{ticketInfo.number}
                      </h3>
                      <p className="text-sm mb-1">
                        <span className="font-semibold">Estado:</span> {getStatusText()}
                      </p>
                      <p className="text-sm mb-1">
                        <span className="font-semibold">Sorteo:</span> {ticketInfo.raffle_name || 'N/A'}
                      </p>
                      
                      {ticketInfo.status !== 'available' && ticketInfo.user && (
                        <>
                          <p className="text-sm mb-1">
                            <span className="font-semibold">Titular:</span> {ticketInfo.user.first_name} {ticketInfo.user.last_name}
                          </p>
                          {ticketInfo.reserved_at && (
                            <p className="text-sm mb-1">
                              <span className="font-semibold">Fecha de reserva:</span> {new Date(ticketInfo.reserved_at).toLocaleString()}
                            </p>
                          )}
                          {ticketInfo.purchased_at && (
                            <p className="text-sm mb-1">
                              <span className="font-semibold">Fecha de pago:</span> {new Date(ticketInfo.purchased_at).toLocaleString()}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default VerifyPage;