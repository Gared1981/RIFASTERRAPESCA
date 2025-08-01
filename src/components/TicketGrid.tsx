import React, { useState, useEffect } from 'react';
import TicketCard from './TicketCard';
import { Ticket, supabase } from '../utils/supabaseClient';

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
  const [retryCount, setRetryCount] = useState(0);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      console.log('🎫 Fetching tickets for raffle:', raffleId);
      
      // Ejecutar limpieza automática antes de obtener boletos
      try {
        await supabase.rpc('auto_cleanup_tickets');
        console.log('🧹 Auto cleanup completed');
      } catch (cleanupError) {
        console.warn('⚠️ Auto cleanup failed:', cleanupError);
        // Continue even if cleanup fails
      }
      
      // Fetch available tickets after cleanup
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('raffle_id', raffleId)
        .eq('status', 'available')
        .order('number', { ascending: true });
        
      if (error) throw error;
      
      console.log('✅ Available tickets fetched:', data?.length || 0);
      console.log('📊 Sample tickets:', data?.slice(0, 5));
      setTickets(data as Ticket[]);
      
      // If no tickets found, try to regenerate them
      if (!data || data.length === 0) {
        console.log('🔄 No tickets found, checking if raffle needs ticket generation...');
        try {
          // Get raffle info to see if it should have tickets
          const { data: raffleData, error: raffleError } = await supabase
            .from('raffles')
            .select('total_tickets, name')
            .eq('id', raffleId)
            .single();
            
          if (raffleError) {
            console.error('Error fetching raffle info:', raffleError);
            setError('Error al verificar información del sorteo');
            return;
          }
          
          if (!raffleData || !raffleData.total_tickets || raffleData.total_tickets <= 0) {
            setError('Este sorteo no tiene boletos configurados');
            return;
          }
          
          // Try to auto-generate tickets using direct SQL
          try {
            // Generate tickets directly
            const tickets = Array.from(
              { length: raffleData.total_tickets }, 
              (_, i) => ({
                number: i.toString().padStart(4, '0'),
                status: 'available',
                raffle_id: raffleId
              })
            );
            
            const { error: insertError } = await supabase
              .from('tickets')
              .insert(tickets);
              
            if (insertError) {
              console.error('❌ Auto-generation failed:', insertError);
              setError(`Este sorteo debería tener ${raffleData.total_tickets} boletos pero no se encontraron. Error al generar automáticamente: ${insertError.message}`);
            } else {
              console.log('✅ Auto-generated tickets:', raffleData.total_tickets);
              // Retry fetching tickets
              setTimeout(() => {
                fetchTickets();
              }, 1000);
              return;
            }
          } catch (autoGenError) {
            console.error('❌ Exception during auto-generation:', autoGenError);
            setError(`Este sorteo debería tener ${raffleData.total_tickets} boletos pero no se encontraron. Por favor, contacta al administrador para regenerar los boletos.`);
          }
        } catch (raffleCheckError) {
          console.error('Error checking raffle info:', raffleCheckError);
          setError('Error al verificar la configuración del sorteo');
        }
      }
    } catch (err: any) {
      console.error('❌ Error fetching tickets:', err);
      setRetryCount(prev => prev + 1);
      if (retryCount < 3) {
        setTimeout(() => fetchTickets(), 2000);
      } else {
        setError('Error al cargar los boletos. Por favor, recarga la página.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    
    fetchTickets();
    
    // Subscribe to realtime changes
    const subscription = supabase
      .channel('tickets-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'tickets', filter: `raffle_id=eq.${raffleId}` },
        (payload) => {
          // Refresh tickets when any ticket changes
          console.log('🔄 Ticket change detected, refreshing...', payload);
          fetchTickets();
        }
      )
      .subscribe();
      
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [raffleId]);

  // Auto-cleanup expired tickets every 30 seconds
  useEffect(() => {
    const cleanupInterval = setInterval(async () => {
      try {
        const { data, error } = await supabase.rpc('auto_cleanup_tickets');
        if (error) {
          console.error('❌ Error during auto cleanup:', error);
        } else if (data > 0) {
          console.log(`🧹 Auto-released ${data} expired tickets`);
          // Refresh tickets if any were released
          fetchTickets();
        }
      } catch (error: any) {
        console.error('❌ Exception during auto cleanup:', error);
      }
    }, 60000); // 60 seconds (más frecuente)

    return () => clearInterval(cleanupInterval);
  }, []);
  
  const isSelected = (ticket: Ticket) => {
    return selectedTickets.some(t => t.id === ticket.id);
  };
  
  const isSelectionDisabled = (ticket: Ticket) => {
    return selectedTickets.length >= maxSelection && !isSelected(ticket);
  };
  
  const filteredTickets = searchValue
    ? tickets.filter(ticket => ticket.number.includes(searchValue))
    : tickets;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-center md:items-center gap-4">
        <div className="relative">
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Buscar boleto por número..."
            className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
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
          {searchValue ? 'No se encontraron boletos con ese número.' : 'No hay boletos disponibles en este momento.'}
        </div>
      )}
    </div>
  );
};

export default TicketGrid;