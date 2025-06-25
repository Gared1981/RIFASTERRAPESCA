import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Ticket, supabase, Raffle } from '../utils/supabaseClient';
import TicketGrid from '../components/TicketGrid';
import PromoterTicketForm from '../components/PromoterTicketForm';
import LuckyMachine from '../components/LuckyMachine';
import Footer from '../components/Footer';
import { useReservationTimer } from '../hooks/useReservationTimer';
import { Info, AlertTriangle, Tag, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const TicketsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [selectedTickets, setSelectedTickets] = useState<Ticket[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [activeRaffles, setActiveRaffles] = useState<Raffle[]>([]);
  const [selectedRaffle, setSelectedRaffle] = useState<Raffle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get promoter code from URL parameters
  const promoterCode = searchParams.get('promo') || searchParams.get('promoter');
  const raffleId = searchParams.get('raffle');
  
  // Get reservation timer for UI feedback
  const reservedTicketIds = selectedTickets.map(t => t.id);
  const { formattedTime, isActive } = useReservationTimer(reservedTicketIds);
  
  useEffect(() => {
    const fetchRaffles = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all active raffles
        const { data: rafflesData, error: rafflesError } = await supabase
          .from('raffles')
          .select('*')
          .eq('status', 'active')
          .order('created_at', { ascending: false });
          
        if (rafflesError) {
          console.error('Supabase error:', rafflesError);
          throw new Error(rafflesError.message);
        }
        
        if (!rafflesData || rafflesData.length === 0) {
          throw new Error('No active raffles found');
        }
        
        setActiveRaffles(rafflesData);
        
        // If raffle ID is specified in URL, select that raffle
        if (raffleId) {
          const specificRaffle = rafflesData.find(r => r.id === parseInt(raffleId));
          if (specificRaffle) {
            setSelectedRaffle(specificRaffle);
          } else {
            // If specified raffle not found, select first active raffle
            setSelectedRaffle(rafflesData[0]);
          }
        }
        // If no raffle specified, don't select any (user must choose)
        
      } catch (err) {
        console.error('Error fetching raffles:', err);
        setError(err instanceof Error ? err.message : 'An error occurred while fetching raffles');
        setActiveRaffles([]);
        setSelectedRaffle(null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRaffles();
  }, [raffleId]);
  
  const handleSelectTicket = (ticket: Ticket) => {
    // If ticket is already selected, remove it
    if (selectedTickets.some(t => t.id === ticket.id)) {
      setSelectedTickets(prev => prev.filter(t => t.id !== ticket.id));
      return;
    }
    
    // Otherwise, add it to selection
    setSelectedTickets(prev => [...prev, ticket]);
  };
  
  const handleRandomSelection = (tickets: Ticket[]) => {
    setSelectedTickets(tickets);
  };
  
  const handleSubmitForm = () => {
    // Reset selections after form submission
    setSelectedTickets([]);
    setShowForm(false);
  };

  const handleRaffleSelection = (raffle: Raffle) => {
    setSelectedRaffle(raffle);
    setSelectedTickets([]); // Clear selected tickets when changing raffle
    setShowForm(false); // Close form if open
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }
  
  if (error || activeRaffles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <AlertTriangle className="text-red-500 mb-4" size={48} />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
        <p className="text-gray-600 text-center max-w-md mb-4">
          {error || 'No hay sorteos activos disponibles en este momento.'}
        </p>
        <Link
          to="/sorteos"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Ver todos los sorteos
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Raffle Selection Section */}
          {!selectedRaffle ? (
            <div className="mb-8">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Selecciona un Sorteo
                </h1>
                <p className="text-gray-600">
                  Elige el sorteo en el que deseas participar para ver los boletos disponibles
                </p>
              </div>

              {promoterCode && (
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <Tag className="h-5 w-5 text-blue-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-700">
                        <strong>Código de promotor activo:</strong> {promoterCode}
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        Tu compra será registrada para este promotor y recibirá su comisión correspondiente.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeRaffles.map((raffle) => (
                  <div
                    key={raffle.id}
                    className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer transform hover:scale-105 transition-all duration-300 hover:shadow-xl"
                    onClick={() => handleRaffleSelection(raffle)}
                  >
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
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {raffle.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <span>Sorteo: {new Date(raffle.draw_date).toLocaleDateString()}</span>
                      </div>

                      <button className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors font-medium">
                        Seleccionar este sorteo
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Selected Raffle Header */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => setSelectedRaffle(null)}
                    className="inline-flex items-center text-green-600 hover:text-green-700 font-medium"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Cambiar sorteo
                  </button>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <img
                      src={selectedRaffle.image_url}
                      alt={selectedRaffle.name}
                      className="w-full md:w-32 h-32 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                        {selectedRaffle.name}
                      </h1>
                      <p className="text-gray-600 mb-2">
                        {selectedRaffle.description}
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <span>Sorteo: {new Date(selectedRaffle.draw_date).toLocaleDateString()}</span>
                        <span className="font-semibold text-green-600">
                          Precio: ${selectedRaffle.price.toLocaleString()} MXN
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {promoterCode && (
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <Tag className="h-5 w-5 text-blue-400" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-blue-700">
                          <strong>Código de promotor activo:</strong> {promoterCode}
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                          Tu compra será registrada para este promotor y recibirá su comisión correspondiente.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {isActive && (
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <Info className="h-5 w-5 text-blue-400" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-blue-700">
                          Tiempo restante para completar tu reserva: <strong>{formattedTime}</strong>
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Tickets Section */}
              {showForm ? (
                <PromoterTicketForm
                  selectedTickets={selectedTickets}
                  raffleInfo={{
                    id: selectedRaffle.id,
                    name: selectedRaffle.name,
                    price: selectedRaffle.price
                  }}
                  onComplete={handleSubmitForm}
                  onCancel={() => setShowForm(false)}
                  promoterCode={promoterCode || undefined}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="md:col-span-3">
                    <TicketGrid
                      raffleId={selectedRaffle.id}
                      selectedTickets={selectedTickets}
                      onSelectTicket={handleSelectTicket}
                    />
                  </div>
                  
                  <div className="space-y-6">
                    <LuckyMachine
                      raffleId={selectedRaffle.id}
                      onTicketsSelected={handleRandomSelection}
                    />
                    
                    {selectedTickets.length > 0 && (
                      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                        <h3 className="text-lg font-semibold mb-3">Resumen de selección</h3>
                        <p className="mb-2">
                          <span className="font-medium">Boletos seleccionados:</span> {selectedTickets.length}
                        </p>
                        <p className="mb-4">
                          <span className="font-medium">Total a pagar:</span> ${(selectedTickets.length * selectedRaffle.price).toLocaleString()} MXN
                        </p>
                        {promoterCode && (
                          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center text-green-700">
                              <Tag className="h-4 w-4 mr-2" />
                              <span className="font-medium">Código: {promoterCode}</span>
                            </div>
                            <p className="text-xs text-green-600 mt-1">
                              Comisión del promotor: ${(selectedTickets.length * 1000).toLocaleString()} MXN
                            </p>
                          </div>
                        )}
                        <button
                          onClick={() => setShowForm(true)}
                          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          Continuar con la reserva
                        </button>
                      </div>
                    )}
                    
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <Info className="h-5 w-5 text-yellow-400" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-yellow-700">
                            Los boletos serán reservados por 3 horas una vez completado el formulario. 
                            Si no se realiza el pago en ese tiempo, volverán a estar disponibles.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default TicketsPage;