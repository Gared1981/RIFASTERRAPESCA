import React, { useState, useEffect } from 'react';
import TicketCard from './TicketCard';
import { Ticket, supabase } from '../utils/supabaseClient';
import { calculateBonus } from '../utils/whatsappUtils';

interface TicketGridProps {
  raffleId: number;
  selectedTickets: Ticket[];
  onSelectTicket: (ticket: Ticket) => void;
  maxSelection?: number;
}

const TicketGrid: React.FC<TicketGridProps> = ({
  raffleId,
  selectedTickets,
  onSelectTicket,
  maxSelection = 50
}) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState('');
  
  const bonus = calculateBonus(selectedTickets.length);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('tickets')
          .select('*')
          .eq('raffle_id', raffleId)
          .order('number', { ascending: true });
          
        if (error) throw error;
        
        setTickets(data as Ticket[]);
      } catch (err) {
        console.error('Error fetching tickets:', err);
        setError('No pudimos cargar los boletos. Intenta de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTickets();
    
    // Subscribe to realtime changes
    const subscription = supabase
      .channel('tickets-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'tickets', filter: `raffle_id=eq.${raffleId}` },
        (payload) => {
          // Update local state when tickets change in the database
          if (payload.eventType === 'UPDATE') {
            setTickets(prevTickets => 
              prevTickets.map(ticket => 
                ticket.id === payload.new.id ? { ...ticket, ...payload.new } : ticket
              )
            );
          }
        }
      )
      .subscribe();
      
    return () => {
      subscription.unsubscribe();
    };
  }, [raffleId]);
  
  const isSelected = (ticket: Ticket) => {
    return selectedTickets.some(t => t.id === ticket.id);
  };
  
  const isSelectionDisabled = (ticket: Ticket) => {
    return selectedTickets.length >= maxSelection && !isSelected(ticket);
  };
  
  const filteredTickets = searchValue
    ? tickets.filter(ticket => ticket.number.toString().includes(searchValue))
    : tickets;
    
  const ticketStats = {
    total: tickets.length,
    available: tickets.filter(t => t.status === 'available').length,
    reserved: tickets.filter(t => t.status === 'reserved').length,
    purchased: tickets.filter(t => t.status === 'purchased').length
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div className="relative">
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Buscar boleto por número..."
            className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>
        
        <div className="flex flex-wrap gap-2 text-sm">
          <div className="px-3 py-1 bg-white border border-green-500 text-green-700 rounded-md">
            Disponibles: {ticketStats.available}
          </div>
          <div className="px-3 py-1 bg-gray-300 border border-gray-400 text-gray-700 rounded-md">
            Reservados: {ticketStats.reserved}
          </div>
          <div className="px-3 py-1 bg-green-500 border border-green-700 text-white rounded-md">
            Pagados: {ticketStats.purchased}
          </div>
        </div>
      </div>
      
      {selectedTickets.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800">
            Boletos seleccionados: {selectedTickets.length}
          </h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {selectedTickets.map(ticket => (
              <span key={ticket.id} className="bg-blue-500 text-white px-2 py-1 rounded text-sm">
                {ticket.number}
              </span>
            ))}
          </div>
          {bonus && (
            <div className="mt-2 text-green-700 font-semibold">
              ¡Felicidades! Has obtenido: {bonus}
            </div>
          )}
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center py-10">{error}</div>
      ) : (
        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2 md:gap-3">
          {filteredTickets.map(ticket => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              selected={isSelected(ticket)}
              onSelect={onSelectTicket}
              disabled={isSelectionDisabled(ticket)}
            />
          ))}
        </div>
      )}
      
      {filteredTickets.length === 0 && !loading && (
        <div className="text-center py-10 text-gray-500">
          No se encontraron boletos con ese número.
        </div>
      )}
    </div>
  );
};

export default TicketGrid;