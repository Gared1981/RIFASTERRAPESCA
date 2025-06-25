import React, { useState, useEffect } from 'react';
import { supabase, Ticket, User, Raffle } from '../utils/supabaseClient';
import AdminTicketTable from '../components/AdminTicketTable';
import PromoterDashboard from '../components/PromoterDashboard';
import { LogOut, RefreshCw, Users, Ticket as TicketIcon, DollarSign, Clock, UserCheck } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'tickets' | 'promoters'>('tickets');
  const [stats, setStats] = useState({
    totalTickets: 0,
    available: 0,
    reserved: 0,
    purchased: 0,
    totalSales: 0
  });
  
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session check error:', error);
          toast.error('Error al verificar la sesión');
          return;
        }
        
        setIsAuthenticated(!!data.session);
        
        if (data.session) {
          fetchRaffles();
        }
      } catch (err) {
        console.error('Error checking session:', err);
        toast.error('Error al verificar la sesión');
      } finally {
        setLoading(false);
      }
    };
    
    checkSession();
    
    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setIsAuthenticated(!!session);
        if (session) {
          await fetchRaffles();
        }
      }
    );
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
  
  const fetchRaffles = async () => {
    try {
      const { data, error } = await supabase
        .from('raffles')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching raffles:', error);
        toast.error('Error al cargar los sorteos');
        return;
      }
      
      setRaffles(data as Raffle[]);
      
      // Set first raffle as selected by default
      if (data && data.length > 0 && !selectedRaffle) {
        setSelectedRaffle(data[0].id);
        fetchTickets(data[0].id);
      }
    } catch (err) {
      console.error('Error fetching raffles:', err);
      toast.error('Error al cargar los sorteos');
    }
  };
  
  const fetchTickets = async (raffleId: number) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          *,
          user:user_id(*)
        `)
        .eq('raffle_id', raffleId)
        .order('number', { ascending: true });
        
      if (error) {
        console.error('Error fetching tickets:', error);
        toast.error('Error al cargar los boletos');
        return;
      }
      
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
      
    } catch (err) {
      console.error('Error fetching tickets:', err);
      toast.error('Error al cargar los boletos');
    } finally {
      setLoading(false);
    }
  };
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Por favor ingresa tu correo y contraseña');
      return;
    }
    
    try {
      setLoginLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('Login error:', error);
        if (error.message.includes('Invalid login credentials')) {
          setError('Credenciales inválidas. Por favor verifica tu correo y contraseña.');
        } else if (error.message.includes('Failed to fetch')) {
          setError('Error de conexión. Por favor verifica tu conexión a internet.');
        } else {
          setError(`Error al iniciar sesión: ${error.message}`);
        }
        return;
      }
      
      toast.success('Inicio de sesión exitoso');
      
    } catch (err) {
      console.error('Error logging in:', err);
      setError('Error inesperado al iniciar sesión. Por favor intenta de nuevo.');
    } finally {
      setLoginLoading(false);
    }
  };
  
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Logout error:', error);
        toast.error('Error al cerrar sesión');
        return;
      }
      
      toast.success('Sesión cerrada');
      
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
  
  if (loading && !isAuthenticated) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="w-full max-w-md">
          <div className="bg-white py-8 px-6 shadow rounded-lg">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
              Panel de Administración
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
                  {error}
                </div>
              )}
              
              <div>
                <button
                  type="submit"
                  disabled={loginLoading}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
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
              </button>
            </nav>
          </div>
        </div>

        {activeTab === 'promoters' ? (
          <PromoterDashboard />
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