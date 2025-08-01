import React, { useState, useEffect } from 'react';
import { supabase, Ticket, User, Raffle } from '../utils/supabaseClient';
import AdminTicketTable from '../components/AdminTicketTable';
import PromoterDashboard from '../components/PromoterDashboard';
import RafflesPage from './RafflesPage';
import { LogOut, RefreshCw, Users, Ticket as TicketIcon, DollarSign, Clock, UserCheck, Gift } from 'lucide-react';
import toast from 'react-hot-toast';
import CountdownTimer from '../components/CountdownTimer';

const AdminPage: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [tickets, setTickets] = useState<Array<Ticket & { user?: User }>>([]);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loginLoading, setLoginLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [selectedRaffle, setSelectedRaffle] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'tickets' | 'promoters' | 'raffles'>('tickets');
  const [raffleAnalytics, setRaffleAnalytics] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalTickets: 0,
    available: 0,
    reserved: 0,
    purchased: 0,
    totalSales: 0
  });
  
  useEffect(() => {
    const checkSession = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Session check error:', error);
          toast.error('Error al verificar la sesión');
          setIsAuthenticated(false);
          return;
        }
        
        setIsAuthenticated(!!data.session);
        console.log('🔐 Admin session check:', !!data.session, data.session?.user?.email);
        
        if (data.session) {
          try {
            await fetchRaffles();
            await fetchRaffleAnalytics();
          } catch (fetchError) {
            console.error('❌ Error fetching raffles after auth:', fetchError);
            toast.error('Error al cargar los sorteos');
          }
        }
      } catch (err) {
        console.error('❌ Exception checking session:', err);
        toast.error('Error al verificar la sesión');
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    
    checkSession();
    
    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔄 Admin auth state change:', event, session?.user?.email);
        setIsAuthenticated(!!session);
        if (session) {
          fetchRaffles().catch(err => {
            console.error('❌ Error fetching raffles on auth change:', err);
          });
          fetchRaffleAnalytics().catch(err => {
            console.error('❌ Error fetching analytics on auth change:', err);
          });
        }
      }
    );
    
    return () => {
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);
  
  const fetchRaffles = async () => {
    try {
      console.log('📊 Fetching raffles...');
      const { data, error } = await supabase
        .from('raffles')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('❌ Error fetching raffles:', error);
        toast.error('Error al cargar los sorteos');
        return;
      }
      
      console.log('✅ Raffles fetched successfully:', data?.length || 0);
      setRaffles(data as Raffle[]);
      
      // Set first raffle as selected by default
      if (data && data.length > 0 && !selectedRaffle) {
        setSelectedRaffle(data[0].id);
        try {
          await fetchTickets(data[0].id);
        } catch (ticketError) {
          console.error('❌ Error fetching tickets for first raffle:', ticketError);
        }
      }
    } catch (err) {
      console.error('❌ Exception fetching raffles:', err);
      toast.error('Error al cargar los sorteos');
    }
  };
  
  const fetchRaffleAnalytics = async () => {
    try {
      console.log('📊 Fetching raffle analytics...');
      const { data, error } = await supabase
        .from('raffle_analytics')
        .select('*')
        .order('total_revenue', { ascending: false });
        
      if (error) {
        console.error('❌ Error fetching analytics:', error);
        return;
      }
      
      console.log('✅ Analytics fetched successfully:', data?.length || 0);
      setRaffleAnalytics(data || []);
    } catch (err) {
      console.error('❌ Exception fetching analytics:', err);
    }
  };
  
  const fetchTickets = async (raffleId: number) => {
    try {
      setLoading(true);
      console.log('🎫 Fetching tickets for raffle:', raffleId);
      
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          *,
          user:user_id(*)
        `)
        .eq('raffle_id', raffleId)
        .order('number', { ascending: true });
        
      if (error) {
        console.error('❌ Error fetching tickets:', error);
        toast.error('Error al cargar los boletos');
        return;
      }
      
      console.log('✅ Tickets fetched successfully:', data?.length || 0);
      setTickets(data as Array<Ticket & { user?: User }>);
      
      // Calculate stats
      const ticketStats = {
        totalTickets: data.length,
        available: data.filter(t => t.status === 'available').length,
        reserved: data.filter(t => t.status === 'reserved').length,
        purchased: data.filter(t => t.status === 'purchased').length,
        totalSales: 0
      };
      
      // Get raffle price to calculate sales
      const { data: raffleData, error: raffleError } = await supabase
        .from('raffles')
        .select('price')
        .eq('id', raffleId)
        .single();
        
      if (raffleError) {
        console.error('Error fetching raffle price:', raffleError);
      } else if (raffleData) {
        ticketStats.totalSales = ticketStats.purchased * raffleData.price;
      }
      
      setStats(ticketStats);
      
    } catch (error: any) {
      console.error('Error fetching tickets:', error);
      toast.error('Error al cargar los boletos');
    } finally {
      setLoading(false);
    }
  };
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Default admin credentials
    const adminEmail = email || 'admin@terrapesca.com';
    const adminPassword = password || 'Terrapesca2025!';
    
    if (!adminEmail) {
      toast.error('Por favor ingresa tu correo');
      return;
    }
    
    try {
      setLoginLoading(true);
      setError(null);
      
      console.log('Attempting login with:', adminEmail);
      
      const { error } = await supabase.auth.signInWithPassword({
        email: adminEmail,
        password: adminPassword
      });
      
      if (error) {
        console.error('Login error:', error);
        console.log('Login error details:', error.message);
        if (error.message.includes('Invalid login credentials')) {
          setError('Credenciales inválidas. Intenta con admin@terrapesca.com y Terrapesca2025!');
        } else if (error.message.includes('Failed to fetch')) {
          setError('Error de conexión. Por favor verifica tu conexión a internet.');
        } else {
          setError(`Error al iniciar sesión: ${error.message}`);
        }
        return;
      }
      
      toast.success('Inicio de sesión exitoso');
      console.log('Login successful');
      
    } catch (err) {
      console.error('Error logging in:', err);
      setError('Error inesperado al iniciar sesión. Por favor intenta de nuevo.');
    } finally {
      setLoginLoading(false);
    }
  };
  
  const handleLogout = async () => {
    try {
      console.log('Attempting logout');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Logout error:', error);
        toast.error('Error al cerrar sesión');
        return;
      }
      
      toast.success('Sesión cerrada');
      console.log('Logout successful');
      
    } catch (err) {
      console.error('Error logging out:', err);
      toast.error('Error al cerrar sesión');
    }
  };
  
  const handleRaffleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const raffleId = parseInt(e.target.value);
    setSelectedRaffle(raffleId);
    if (activeTab === 'tickets') {
      fetchTickets(raffleId);
    }
  };
  
  const refreshData = async () => {
    if (selectedRaffle && activeTab === 'tickets') {
      await fetchTickets(selectedRaffle);
      toast.success('Datos actualizados');
    }
  };
  
  const handleCleanupExpiredTickets = async () => {
    try {
      const { data, error } = await supabase.rpc('admin_cleanup_expired_tickets');
      
      if (error) {
        console.error('Error cleaning up tickets:', error);
        toast.error('Error al limpiar boletos expirados');
        return;
      }
      
      if (data.released_count > 0) {
        toast.success(`${data.released_count} boletos expirados liberados`);
        // Refresh data after cleanup
        if (selectedRaffle && activeTab === 'tickets') {
          await fetchTickets(selectedRaffle);
        }
      } else {
        toast.info('No hay boletos expirados para liberar');
      }
      
      console.log('Cleanup result:', data);
    } catch (error) {
      console.error('Error during cleanup:', error);
      toast.error('Error al ejecutar limpieza');
    }
  };
  
  const handleRegenerateTickets = async () => {
    if (!selectedRaffle) {
      toast.error('Selecciona un sorteo primero');
      return;
    }
    
    if (!confirm('¿Estás seguro de regenerar todos los boletos para este sorteo? Esto eliminará TODAS las reservas y ventas existentes.\n\nEsta operación es IRREVERSIBLE.')) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Get raffle info
      const { data: raffleData, error: raffleError } = await supabase
        .from('raffles')
        .select('total_tickets, name, status')
        .eq('id', selectedRaffle)
        .single();
        
      if (raffleError) throw raffleError;
      
      if (!raffleData.total_tickets || raffleData.total_tickets <= 0) {
        toast.error('Este sorteo no tiene boletos configurados');
        return;
      }
      
      console.log(`🗑️ Starting FORCED ticket regeneration for raffle ${selectedRaffle} (${raffleData.name}) with ${raffleData.total_tickets} tickets...`);
      
      // NUEVO MÉTODO: Usar función SQL especializada para eliminación forzada
      console.log('🔥 Using specialized SQL function for forced deletion...');
      
      // Primero, intentar con función SQL especializada
      const { data: sqlResult, error: sqlError } = await supabase
        .rpc('sql', {
          query: `
            -- Desactivar restricciones temporalmente
            SET session_replication_role = replica;
            
            -- Limpiar referencias en payment_logs
            UPDATE payment_logs 
            SET ticket_ids = NULL 
            WHERE ticket_ids && (
              SELECT ARRAY_AGG(id) 
              FROM tickets 
              WHERE raffle_id = ${selectedRaffle}
            );
            
            -- Eliminar todos los boletos de este sorteo
            DELETE FROM tickets WHERE raffle_id = ${selectedRaffle};
            
            -- Reactivar restricciones
            SET session_replication_role = DEFAULT;
            
            -- Verificar eliminación
            SELECT COUNT(*) as remaining_tickets FROM tickets WHERE raffle_id = ${selectedRaffle};
          `
        });
        
      if (sqlError) {
        console.error('❌ SQL deletion failed, trying alternative method:', sqlError);
        
        // Método alternativo: Eliminar en lotes muy pequeños
        console.log('🔄 Trying batch deletion method...');
        
        let remainingTickets = 1;
        let attempts = 0;
        const maxAttempts = 50;
        
        while (remainingTickets > 0 && attempts < maxAttempts) {
          // Eliminar en lotes de 100
          const { data: batchIds, error: batchSelectError } = await supabase
            .from('tickets')
            .select('id')
            .eq('raffle_id', selectedRaffle)
            .limit(100);
            
          if (batchSelectError) {
            console.error('❌ Error selecting batch for deletion:', batchSelectError);
            break;
          }
          
          if (!batchIds || batchIds.length === 0) {
            remainingTickets = 0;
            break;
          }
          
          // Eliminar este lote
          const { error: batchDeleteError } = await supabase
            .from('tickets')
            .delete()
            .in('id', batchIds.map(t => t.id));
            
          if (batchDeleteError) {
            console.error('❌ Error deleting batch:', batchDeleteError);
            throw new Error(`Error al eliminar lote de boletos: ${batchDeleteError.message}`);
          }
          
          attempts++;
          console.log(`🗑️ Deleted batch ${attempts}, ${batchIds.length} tickets`);
          
          // Verificar cuántos quedan
          const { count: currentCount, error: countError } = await supabase
            .from('tickets')
            .select('*', { count: 'exact', head: true })
            .eq('raffle_id', selectedRaffle);
            
          if (countError) {
            console.error('❌ Error counting remaining tickets:', countError);
            break;
          }
          
          remainingTickets = currentCount || 0;
          console.log(`📊 Remaining tickets: ${remainingTickets}`);
          
          // Pequeña pausa entre lotes
          if (remainingTickets > 0) {
            await new Promise(resolve => setTimeout(resolve, 200));
          }
        }
        
        if (remainingTickets > 0) {
          throw new Error(`No se pudieron eliminar todos los boletos después de ${attempts} intentos. Quedan ${remainingTickets} boletos.`);
        }
      } else {
        console.log('✅ SQL deletion successful');
      }
      
      // Pausa más corta
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verificación final de eliminación
      const { count: existingCount, error: countError } = await supabase
        .from('tickets')
        .select('*', { count: 'exact', head: true })
        .eq('raffle_id', selectedRaffle);
        
      if (countError) {
        console.error('❌ Error verifying deletion:', countError);
        throw new Error(`Error al verificar eliminación: ${countError.message}`);
      }
      
      if (existingCount && existingCount > 0) {
        throw new Error(`FALLO EN ELIMINACIÓN: Aún quedan ${existingCount} boletos. Intenta de nuevo.`);
      }
      
      console.log(`✅ DELETION VERIFIED: 0 tickets remaining`);
      
      // Generación masiva usando SQL directo
      console.log(`🎫 GENERATING ${raffleData.total_tickets} new tickets using optimized SQL...`);
      
      // Método 1: Inserción masiva SQL (más rápido para grandes cantidades)
      if (raffleData.total_tickets >= 1000) {
        console.log('🚀 Using SQL bulk insert for large quantity...');
        
        const { error: bulkInsertError } = await supabase
          .rpc('sql', {
            query: `
              INSERT INTO tickets (number, status, raffle_id)
              SELECT 
                LPAD(generate_series::TEXT, 4, '0'),
                'available',
                ${selectedRaffle}
              FROM generate_series(0, ${raffleData.total_tickets - 1})
            `
          });
          
        if (bulkInsertError) {
          console.error('❌ SQL bulk insert failed:', bulkInsertError);
          throw new Error(`Error en inserción masiva SQL: ${bulkInsertError.message}`);
        }
        
        console.log(`✅ SQL bulk insert completed for ${raffleData.total_tickets} tickets`);
      } else {
        // Método 2: Inserción por lotes para cantidades menores
        console.log('📦 Using batch insert for smaller quantity...');
        
        const batchSize = 200;
        let totalInserted = 0;
      
        for (let i = 0; i < raffleData.total_tickets; i += batchSize) {
          const batchStart = i;
          const batchEnd = Math.min(i + batchSize - 1, raffleData.total_tickets - 1);
          const batchCount = batchEnd - batchStart + 1;
          
          console.log(`📦 Inserting batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(raffleData.total_tickets / batchSize)} (tickets ${batchStart}-${batchEnd})...`);
          
          const tickets = Array.from(
            { length: batchCount }, 
            (_, idx) => ({
              number: (batchStart + idx).toString().padStart(4, '0'),
              status: 'available' as const,
              raffle_id: selectedRaffle
            })
          );
          
          const { error: batchError } = await supabase
            .from('tickets')
            .insert(tickets);
            
          if (batchError) {
            console.error('❌ Error inserting batch:', batchError);
            throw new Error(`Error al crear boletos (lote ${Math.floor(i / batchSize) + 1}): ${batchError.message}`);
          }
          
          totalInserted += batchCount;
          console.log(`✅ Batch ${Math.floor(i / batchSize) + 1} inserted successfully (${totalInserted}/${raffleData.total_tickets})`);
          
          // Pausa más corta
          if (i + batchSize < raffleData.total_tickets) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
      }
      
      // Pausa antes de verificación final
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verificación final
      const { count: finalCount, error: finalError } = await supabase
        .from('tickets')
        .select('*', { count: 'exact', head: true })
        .eq('raffle_id', selectedRaffle);
        
      if (finalError) {
        console.error('❌ Error in final verification:', finalError);
        throw new Error(`Error en verificación final: ${finalError.message}`);
      }
      
      if (finalCount !== raffleData.total_tickets) {
        throw new Error(`VERIFICACIÓN FALLIDA: Se esperaban ${raffleData.total_tickets} boletos pero se encontraron ${finalCount}`);
      }
      
      console.log(`✅ REGENERATION COMPLETED: ${finalCount} tickets for raffle ${selectedRaffle} (${raffleData.name})`);
      toast.success(`✅ ${raffleData.total_tickets} boletos regenerados exitosamente para "${raffleData.name}"`);
      
      // Refresh tickets
      await fetchTickets(selectedRaffle);
      
    } catch (error: any) {
      console.error('Error regenerating tickets:', error);
      toast.error(`Error al regenerar boletos: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // NUEVA FUNCIÓN: Regeneración específica para sorteo Trolling
  const handleRegenerateTrollingTickets = async () => {
    if (!confirm('¿Regenerar específicamente el sorteo de Trolling con 2000 boletos?\n\nEsto eliminará TODAS las reservas existentes del sorteo Trolling.')) {
      return;
    }
    
    try {
      setLoading(true);
      
      console.log('🎣 Starting Trolling raffle regeneration...');
      
      // Usar la función SQL especializada
      const { data: result, error } = await supabase
        .rpc('sql', {
          query: `
            -- Buscar sorteo de Trolling
            DO $$
            DECLARE
              trolling_id INTEGER;
              old_count BIGINT;
              new_count BIGINT;
            BEGIN
              -- Encontrar sorteo de Trolling
              SELECT id INTO trolling_id
              FROM raffles 
              WHERE LOWER(name) LIKE '%trolling%' 
              ORDER BY created_at DESC 
              LIMIT 1;
              
              IF trolling_id IS NULL THEN
                RAISE EXCEPTION 'No se encontró sorteo de Trolling';
              END IF;
              
              -- Contar boletos existentes
              SELECT COUNT(*) INTO old_count FROM tickets WHERE raffle_id = trolling_id;
              
              -- Actualizar configuración del sorteo
              UPDATE raffles 
              SET total_tickets = 2000, updated_at = NOW()
              WHERE id = trolling_id;
              
              -- Limpiar referencias en payment_logs
              UPDATE payment_logs 
              SET ticket_ids = NULL 
              WHERE ticket_ids && (
                SELECT ARRAY_AGG(id) FROM tickets WHERE raffle_id = trolling_id
              );
              
              -- ELIMINACIÓN FORZADA
              DELETE FROM tickets WHERE raffle_id = trolling_id;
              
              -- Verificar eliminación
              SELECT COUNT(*) INTO new_count FROM tickets WHERE raffle_id = trolling_id;
              
              IF new_count > 0 THEN
                RAISE EXCEPTION 'No se pudieron eliminar todos los boletos. Quedan: %', new_count;
              END IF;
              
              -- GENERACIÓN MASIVA
              INSERT INTO tickets (number, status, raffle_id)
              SELECT 
                LPAD(generate_series::TEXT, 4, '0'),
                'available',
                trolling_id
              FROM generate_series(0, 1999);
              
              -- Verificación final
              SELECT COUNT(*) INTO new_count FROM tickets WHERE raffle_id = trolling_id;
              
              IF new_count != 2000 THEN
                RAISE EXCEPTION 'Error en generación. Se crearon % boletos en lugar de 2000', new_count;
              END IF;
              
              RAISE NOTICE 'ÉXITO: Sorteo Trolling configurado con 2000 boletos (0000-1999)';
            END $$;
          `
        });
        
      if (error) {
        console.error('❌ Trolling regeneration failed:', error);
        throw new Error(`Error en regeneración de Trolling: ${error.message}`);
      }
      
      console.log('✅ Trolling regeneration completed successfully');
      toast.success('✅ Sorteo de Trolling configurado con 2000 boletos (0000-1999)');
      
      // Buscar el sorteo de Trolling y seleccionarlo
      const { data: trollingRaffle, error: trollingError } = await supabase
        .from('raffles')
        .select('id, name')
        .ilike('name', '%trolling%')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
        
      if (trollingError) {
        console.error('❌ Error finding Trolling raffle:', trollingError);
      } else if (trollingRaffle) {
        setSelectedRaffle(trollingRaffle.id);
        await fetchTickets(trollingRaffle.id);
        toast.success(`Sorteo "${trollingRaffle.name}" seleccionado y actualizado`);
      }
      
    } catch (error: any) {
      console.error('Error in Trolling regeneration:', error);
      toast.error(`Error al configurar sorteo Trolling: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleRegenerateAllTickets = async () => {
    if (!confirm('¿Estás seguro de regenerar TODOS los boletos para TODOS los sorteos? Esto eliminará todas las reservas existentes.')) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Get all raffles with their ticket requirements
      const { data: allRaffles, error: rafflesError } = await supabase
        .from('raffles')
        .select('id, name, total_tickets')
        .not('total_tickets', 'is', null)
        .gt('total_tickets', 0);
        
      if (rafflesError) throw rafflesError;
      
      if (!allRaffles || allRaffles.length === 0) {
        toast.info('No se encontraron sorteos que necesiten regeneración de boletos');
        return;
      }
      
      let totalTicketsCreated = 0;
      let successfulRaffles = 0;
      let failedRaffles = 0;
      
      for (const raffle of allRaffles) {
        try {
          console.log(`🗑️ Processing raffle: ${raffle.name} (${raffle.total_tickets} tickets)`);
          
          // Use SQL method for each raffle
          const { error: raffleError } = await supabase
            .rpc('sql', {
              query: `
                -- Limpiar referencias en payment_logs para este sorteo
                UPDATE payment_logs 
                SET ticket_ids = NULL 
                WHERE ticket_ids && (
                  SELECT ARRAY_AGG(id) FROM tickets WHERE raffle_id = ${raffle.id}
                );
                
                -- Eliminar boletos existentes
                DELETE FROM tickets WHERE raffle_id = ${raffle.id};
                
                -- Generar nuevos boletos
                INSERT INTO tickets (number, status, raffle_id)
                SELECT 
                  LPAD(generate_series::TEXT, 4, '0'),
                  'available',
                  ${raffle.id}
                FROM generate_series(0, ${raffle.total_tickets - 1});
              `
            });
            
          if (raffleError) {
            console.error(`❌ Error processing raffle ${raffle.name}:`, raffleError);
            failedRaffles++;
          } else {
            totalTicketsCreated += raffle.total_tickets;
            successfulRaffles++;
            console.log(`✅ Successfully processed raffle: ${raffle.name} (${raffle.total_tickets} tickets)`);
          }
          
          // Pausa entre sorteos
          await new Promise(resolve => setTimeout(resolve, 500));
          
        } catch (raffleError) {
          console.error(`❌ Exception processing raffle ${raffle.name}:`, raffleError);
          failedRaffles++;
        }
      }
      
      // Show results
      if (successfulRaffles > 0) {
        toast.success(`Regenerados ${totalTicketsCreated} boletos para ${successfulRaffles} sorteos exitosos`);
      }
      
      if (failedRaffles > 0) {
        toast.error(`${failedRaffles} sorteos fallaron en la regeneración`);
      }
      
      // Refresh current raffle tickets if one is selected
      if (selectedRaffle && activeTab === 'tickets') {
        await fetchTickets(selectedRaffle);
      }
      
    } catch (error) {
      console.error('Error regenerating all tickets:', error);
      toast.error(`Error al regenerar todos los boletos: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading && !isAuthenticated) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        <p className="mt-4 text-gray-600">Verificando sesión...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="w-full max-w-md">
          <div className="bg-white py-8 px-6 shadow rounded-lg">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
              Acceso al Panel de Administración
            </h2>
            
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Correo Electrónico
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Contraseña
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
                />
              </div>
              
              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                  <p>{error}</p>
                </div>
              )}
              
              <div>
                <button
                  type="submit"
                  disabled={loginLoading}
                  className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                    loginLoading ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {loginLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Iniciando sesión...
                    </>
                  ) : (
                    'Iniciar Sesión'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  const selectedRaffleData = raffles.find(r => r.id === selectedRaffle);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
          <button
            onClick={handleLogout}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar Sesión
          </button>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('tickets')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'tickets'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <TicketIcon className="inline-block mr-2 h-4 w-4" />
                Gestión de Boletos
              </button>
              <button
                onClick={() => setActiveTab('promoters')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'promoters'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <UserCheck className="inline-block mr-2 h-4 w-4" />
                Promotores
                <a
                  href="/manual-promotores"
                  target="_blank"
                  className="ml-2 text-xs text-blue-600 hover:text-blue-800 underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  📖 Manual
                </a>
              </button>
              <button
                onClick={() => setActiveTab('raffles')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'raffles'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Gift className="inline-block mr-2 h-4 w-4" />
                Gestión de Sorteos
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'analytics'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <DollarSign className="inline-block mr-2 h-4 w-4" />
                Análisis de Ganancias
              </button>
            </nav>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={handleCleanupExpiredTickets}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Clock className="mr-2 h-4 w-4" />
              Limpiar Expirados
            </button>
            <button
              onClick={handleRegenerateTrollingTickets}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              {loading ? 'Configurando 2000 boletos...' : '🎣 Configurar Trolling (2000 boletos)'}
            </button>
            <button
              onClick={handleRegenerateTickets}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-orange-300 text-sm font-medium rounded-md text-orange-700 bg-orange-50 hover:bg-orange-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Regenerar Boletos
            </button>
            <button
              onClick={handleRegenerateAllTickets}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Regenerar TODOS los Boletos
            </button>
          </div>
        </div>

        {activeTab === 'promoters' ? (
          <PromoterDashboard />
        ) : activeTab === 'raffles' ? (
          <RafflesPage />
        ) : activeTab === 'analytics' ? (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Análisis de Ganancias por Sorteo</h2>
              
              {raffleAnalytics.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Sorteo
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Boletos Vendidos
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ingresos Totales
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Comisiones Pagadas (15%)
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ganancia Neta
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Margen %
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estado
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {raffleAnalytics.map((raffle) => (
                        <tr key={raffle.raffle_id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {raffle.raffle_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {raffle.raffle_id}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex flex-col">
                              <span className="font-medium">{raffle.tickets_sold}</span>
                              <span className="text-xs text-gray-500">
                                de {raffle.total_tickets} disponibles
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex flex-col">
                              <span className="font-medium text-green-600">
                                ${raffle.total_revenue?.toLocaleString()} MXN
                              </span>
                              <span className="text-xs text-gray-500">
                                ${raffle.ticket_price} × {raffle.tickets_sold}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex flex-col">
                              <span className="font-medium text-orange-600">
                                ${raffle.total_commissions?.toLocaleString()} MXN
                              </span>
                              <span className="text-xs text-gray-500">
                                15% de comisiones de promotores
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex flex-col">
                              <span className="font-medium text-blue-600">
                                ${raffle.net_profit?.toLocaleString()} MXN
                              </span>
                              <span className="text-xs text-gray-500">
                                Después de comisiones
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              raffle.profit_margin >= 80 
                                ? 'bg-green-100 text-green-800'
                                : raffle.profit_margin >= 70
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                            }`}>
                              {raffle.profit_margin?.toFixed(1)}%
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              raffle.raffle_status === 'completed'
                                ? 'bg-gray-100 text-gray-800'
                                : raffle.raffle_status === 'active'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {raffle.raffle_status === 'completed' ? 'Finalizado' : 
                               raffle.raffle_status === 'active' ? 'Activo' : 'Borrador'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No hay datos de análisis</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Los datos aparecerán cuando haya sorteos con ventas.
                  </p>
                </div>
              )}
              
              {/* Resumen general */}
              {raffleAnalytics.length > 0 && (
                <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-sm font-medium text-green-800">💰 Ingresos Totales</div>
                    <div className="text-2xl font-bold text-green-600">
                      ${raffleAnalytics.reduce((sum, r) => sum + (r.total_revenue || 0), 0).toLocaleString()} MXN
                    </div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="text-sm font-medium text-orange-800">🎯 Comisiones Pagadas (15%)</div>
                    <div className="text-2xl font-bold text-orange-600">
                      ${raffleAnalytics.reduce((sum, r) => sum + (r.total_commissions || 0), 0).toLocaleString()} MXN
                    </div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-sm font-medium text-blue-800">💎 Ganancia Neta</div>
                    <div className="text-2xl font-bold text-blue-600">
                      ${raffleAnalytics.reduce((sum, r) => sum + (r.net_profit || 0), 0).toLocaleString()} MXN
                    </div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-sm font-medium text-purple-800">🎫 Boletos Vendidos</div>
                    <div className="text-2xl font-bold text-purple-600">
                      {raffleAnalytics.reduce((sum, r) => sum + (r.tickets_sold || 0), 0).toLocaleString()}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <label htmlFor="raffle-select" className="block text-sm font-medium text-gray-700 mb-1">
                  Seleccionar Sorteo
                </label>
                <select
                  id="raffle-select"
                  value={selectedRaffle || ''}
                  onChange={handleRaffleChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                >
                  {raffles.map(raffle => (
                    <option key={raffle.id} value={raffle.id}>
                      {raffle.name} ({new Date(raffle.draw_date).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              </div>
              
              <button
                onClick={refreshData}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Actualizar Datos
              </button>
            </div>

            {selectedRaffleData && (
              <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
                <div className="flex items-center mb-4">
                  <Clock className="h-6 w-6 text-green-600 mr-2" />
                  <h2 className="text-xl font-semibold">Tiempo restante para el sorteo</h2>
                </div>
                <CountdownTimer targetDate={selectedRaffleData.draw_date} />
              </div>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <TicketIcon className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Total de Boletos
                        </dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">
                            {stats.totalTickets}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Users className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Boletos Reservados
                        </dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">
                            {stats.reserved}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <TicketIcon className="h-6 w-6 text-green-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Boletos Pagados
                        </dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">
                            {stats.purchased}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <DollarSign className="h-6 w-6 text-green-400" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Total de Ventas
                        </dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">
                            ${stats.totalSales.toLocaleString()} MXN
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
              </div>
            ) : (
              <AdminTicketTable tickets={tickets} onRefresh={refreshData} />
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default AdminPage;