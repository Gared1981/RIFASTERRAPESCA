import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { Plus, Edit, Trash2, Eye, Users, Bug, BugOff, RefreshCw, AlertCircle } from 'lucide-react';
import RaffleForm from '../components/RaffleForm';
import RaffleEditForm from '../components/RaffleEditForm';
import PromoterLinkGenerator from '../components/PromoterLinkGenerator';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const RafflesPage = () => {
  const [raffles, setRaffles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRaffle, setEditingRaffle] = useState(null);
  const [showLinkGenerator, setShowLinkGenerator] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('checking');
  
  useEffect(() => {
    checkAuthentication();
    fetchRaffles();
    
    // Set up real-time subscription for raffle changes
    const subscription = supabase
      .channel('raffles-admin')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'raffles' },
        (payload) => {
          console.log('🔄 Raffle change detected:', payload);
          // Refresh raffles when any raffle changes
          setTimeout(() => {
            fetchRaffles();
          }, 1000);
        }
      )
      .subscribe((status) => {
        console.log('📡 Subscription status:', status);
        setConnectionStatus(status);
      });
      
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkAuthentication = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      const authenticated = !!session;
      setIsAuthenticated(authenticated);
      
      if (debugMode) {
        console.log('🔐 Authentication Status:', {
          authenticated,
          user_id: session?.user?.id,
          session: !!session,
          error: error?.message
        });
        
        // Verificar permisos usando la función de la base de datos
        const { data: permissionsData, error: permissionsError } = await supabase
          .rpc('check_raffle_permissions');
          
        if (permissionsError) {
          console.error('❌ Error checking permissions:', permissionsError);
        } else {
          console.log('✅ Permissions check:', permissionsData);
        }
      }
      
      return authenticated;
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  };
  
  const fetchRaffles = async () => {
    try {
      setLoading(true);
      
      // Force fresh data by adding timestamp
      const { data, error } = await supabase
        .from('raffles')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('❌ Error fetching raffles:', error);
        throw error;
      }
      
      setRaffles(data || []);
      
      if (debugMode) {
        console.log('📊 Raffles fetched:', data?.length || 0, data);
      }
    } catch (error) {
      console.error('Error fetching raffles:', error);
      toast.error('Error al cargar los sorteos');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (raffleId, newStatus) => {
    if (!isAuthenticated) {
      toast.error('Debes estar autenticado para realizar esta acción');
      return;
    }

    try {
      setRefreshing(true);
      
      if (debugMode) {
        console.log('🔄 Attempting status change:', { raffleId, newStatus });
      }

      // Método 1: Actualización directa
      const { data: directUpdate, error: directError } = await supabase
        .from('raffles')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', raffleId)
        .select();
        
      if (directError) {
        console.error('❌ Direct update failed:', directError);
        
        // Método 2: Usar función de administrador
        console.log('🔄 Trying admin update function...');
        const { data: adminResult, error: adminError } = await supabase
          .rpc('admin_update_raffle', {
            raffle_id: raffleId,
            update_data: { status: newStatus }
          });
          
        if (adminError) {
          console.error('❌ Admin update failed:', adminError);
          throw adminError;
        }
        
        console.log('✅ Admin update result:', adminResult);
        
        if (!adminResult.success) {
          throw new Error(adminResult.error || 'Admin update failed');
        }
      } else {
        console.log('✅ Direct update successful:', directUpdate);
      }
      
      toast.success(`Estado cambiado a ${newStatus}`);
      
      // Force refresh after a short delay
      setTimeout(() => {
        fetchRaffles();
      }, 1000);
      
    } catch (error) {
      console.error('Error updating raffle status:', error);
      toast.error(`Error al cambiar el estado: ${error.message}`);
    } finally {
      setRefreshing(false);
    }
  };
  
  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este sorteo?')) return;
    
    try {
      const { error } = await supabase
        .from('raffles')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast.success('Sorteo eliminado');
      fetchRaffles();
    } catch (error) {
      console.error('Error deleting raffle:', error);
      toast.error('Error al eliminar el sorteo');
    }
  };

  const handleEdit = (raffle: any) => {
    if (raffle.status === 'completed') {
      toast.error('No se puede editar un sorteo finalizado');
      return;
    }
    setEditingRaffle(raffle);
  };

  const handleCopyLink = async (slug: string) => {
    try {
      // Limpiar el slug de guiones extra
      const cleanSlug = slug?.replace(/-+$/, '') || '';
      const url = `${window.location.origin}/sorteo/${cleanSlug}`;
      await navigator.clipboard.writeText(url);
      toast.success('Enlace copiado al portapapeles');
    } catch (error) {
      console.error('Error copying link:', error);
      toast.error('Error al copiar el enlace');
    }
  };

  const forceRefresh = async () => {
    setRefreshing(true);
    await fetchRaffles();
    setRefreshing(false);
    toast.success('Datos actualizados');
  };

  const toggleDebugMode = () => {
    setDebugMode(!debugMode);
    toast.success(`Modo debug ${!debugMode ? 'activado' : 'desactivado'}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Finalizado';
      case 'active': return 'Activo';
      case 'draft': return 'Borrador';
      default: return status;
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Sorteos</h1>
        <div className="flex space-x-2">
          <button
            onClick={forceRefresh}
            disabled={refreshing}
            className={`inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 ${
              refreshing ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
          <button
            onClick={toggleDebugMode}
            className={`inline-flex items-center px-3 py-2 border rounded-md shadow-sm text-sm font-medium ${
              debugMode 
                ? 'border-red-300 text-red-700 bg-red-50 hover:bg-red-100' 
                : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
            }`}
          >
            {debugMode ? <BugOff className="h-4 w-4 mr-2" /> : <Bug className="h-4 w-4 mr-2" />}
            Debug {debugMode ? 'ON' : 'OFF'}
          </button>
          <button
            onClick={() => setShowLinkGenerator(!showLinkGenerator)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Users className="h-5 w-5 mr-2" />
            Enlaces de Promotor
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Nuevo Sorteo
          </button>
        </div>
      </div>

      {/* Status indicators */}
      <div className="mb-4 flex items-center space-x-4 text-sm">
        <div className={`flex items-center ${isAuthenticated ? 'text-green-600' : 'text-red-600'}`}>
          <div className={`w-2 h-2 rounded-full mr-2 ${isAuthenticated ? 'bg-green-500' : 'bg-red-500'}`}></div>
          {isAuthenticated ? 'Autenticado' : 'No autenticado'}
        </div>
        <div className={`flex items-center ${connectionStatus === 'SUBSCRIBED' ? 'text-green-600' : 'text-yellow-600'}`}>
          <div className={`w-2 h-2 rounded-full mr-2 ${connectionStatus === 'SUBSCRIBED' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
          Tiempo real: {connectionStatus}
        </div>
      </div>

      {debugMode && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="text-sm font-medium text-yellow-800 mb-2">🐛 Modo Debug Activo</h3>
          <div className="text-xs text-yellow-700">
            <p>• Estado de autenticación: {isAuthenticated ? '✅ Autenticado' : '❌ No autenticado'}</p>
            <p>• Conexión tiempo real: {connectionStatus}</p>
            <p>• Revisa la consola del navegador para logs detallados</p>
            <p>• Los cambios de estado mostrarán información de debugging</p>
            <p>• Total de sorteos cargados: {raffles.length}</p>
            <p>• Última actualización: {new Date().toLocaleTimeString()}</p>
          </div>
        </div>
      )}

      {!isAuthenticated && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Sesión no válida</h3>
              <p className="text-sm text-red-700 mt-1">
                Necesitas iniciar sesión para editar sorteos. 
                <Link to="/admin" className="underline ml-1">Ir a login</Link>
              </p>
            </div>
          </div>
        </div>
      )}

      {showLinkGenerator && (
        <div className="mb-6">
          <PromoterLinkGenerator />
        </div>
      )}
      
      {showForm ? (
        <RaffleForm
          onComplete={() => {
            setShowForm(false);
            fetchRaffles();
          }}
          onCancel={() => setShowForm(false)}
        />
      ) : editingRaffle ? (
        <RaffleEditForm
          raffle={editingRaffle}
          onComplete={() => {
            setEditingRaffle(null);
            fetchRaffles();
          }}
          onCancel={() => setEditingRaffle(null)}
        />
      ) : loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {raffles.map((raffle: any) => (
              <li key={raffle.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <img
                          className="h-12 w-12 rounded-lg object-cover"
                          src={raffle.image_url}
                          alt={raffle.name}
                        />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900">
                          {raffle.name}
                        </h3>
                        <div className="flex items-center mt-1">
                          <span className="text-sm text-gray-500">
                            Sorteo: {new Date(raffle.draw_date).toLocaleDateString()}
                          </span>
                          <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getStatusColor(raffle.status)}`}>
                            {getStatusText(raffle.status)}
                          </span>
                          <span className="ml-2 text-xs text-gray-400">
                            ${raffle.price} MXN
                          </span>
                        </div>
                        {debugMode && (
                          <div className="text-xs text-gray-400 mt-1">
                            ID: {raffle.id} | Slug: {raffle.slug} | Actualizado: {new Date(raffle.updated_at).toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      {/* Dropdown para cambiar estado */}
                      <select
                        value={raffle.status}
                        onChange={(e) => handleStatusChange(raffle.id, e.target.value)}
                        disabled={raffle.status === 'completed' || refreshing}
                        className={`text-sm border border-gray-300 rounded-md px-2 py-1 ${
                          raffle.status === 'completed' || refreshing ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
                        }`}
                      >
                        <option value="draft">Borrador</option>
                        <option value="active">Activo</option>
                        <option value="completed">Finalizado</option>
                      </select>
                      
                      <div className="flex space-x-2">
                        <Link
                          to={`/sorteo/${raffle.slug?.replace(/-+$/, '') || raffle.id}`}
                          target="_blank"
                          className="inline-flex items-center p-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleCopyLink(raffle.slug)}
                          className="inline-flex items-center p-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleEdit(raffle)}
                          disabled={raffle.status === 'completed'}
                          className={`inline-flex items-center p-2 border border-gray-300 rounded-md text-sm font-medium ${
                            raffle.status === 'completed'
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'text-gray-700 bg-white hover:bg-gray-50'
                          }`}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(raffle.id)}
                          className="inline-flex items-center p-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          
          {raffles.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No hay sorteos disponibles</p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-5 w-5 mr-2" />
                Crear primer sorteo
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RafflesPage;