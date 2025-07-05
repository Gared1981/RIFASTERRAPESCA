import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { Users, DollarSign, Trophy, TrendingUp, Plus, Edit, Trash2, Copy, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

interface Promoter {
  id: string;
  name: string;
  code: string;
  total_sales: number;
  accumulated_bonus: number;
  extra_prize: boolean;
  active: boolean;
  tickets_sold: number;
  confirmed_sales: number;
  created_at: string;
  updated_at: string;
}

interface PromoterFormData {
  name: string;
  code: string;
}

const PromoterDashboard: React.FC = () => {
  const [promoters, setPromoters] = useState<Promoter[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPromoter, setEditingPromoter] = useState<Promoter | null>(null);
  const [formData, setFormData] = useState<PromoterFormData>({ name: '', code: '' });

  useEffect(() => {
    fetchPromoters();
  }, []);

  const fetchPromoters = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('promoter_stats')
        .select('*')
        .order('total_sales', { ascending: false });

      if (error) throw error;
      setPromoters(data || []);
    } catch (error) {
      console.error('Error fetching promoters:', error);
      toast.error('Error al cargar los promotores');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingPromoter) {
        // Update existing promoter
        const { error } = await supabase
          .from('promoters')
          .update({
            name: formData.name,
            code: formData.code.toUpperCase()
          })
          .eq('id', editingPromoter.id);

        if (error) throw error;
        toast.success('Promotor actualizado exitosamente');
      } else {
        // Create new promoter
        const { error } = await supabase
          .from('promoters')
          .insert({
            name: formData.name,
            code: formData.code.toUpperCase()
          });

        if (error) throw error;
        toast.success('Promotor creado exitosamente');
      }

      setFormData({ name: '', code: '' });
      setShowForm(false);
      setEditingPromoter(null);
      fetchPromoters();
    } catch (error: any) {
      console.error('Error saving promoter:', error);
      if (error.code === '23505') {
        toast.error('El código del promotor ya existe');
      } else {
        toast.error('Error al guardar el promotor');
      }
    }
  };

  const handleEdit = (promoter: Promoter) => {
    setEditingPromoter(promoter);
    setFormData({ name: promoter.name, code: promoter.code });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este promotor?')) return;

    try {
      const { error } = await supabase
        .from('promoters')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Promotor eliminado exitosamente');
      fetchPromoters();
    } catch (error) {
      console.error('Error deleting promoter:', error);
      toast.error('Error al eliminar el promotor');
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('promoters')
        .update({ active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      toast.success(`Promotor ${!currentStatus ? 'activado' : 'desactivado'} exitosamente`);
      fetchPromoters();
    } catch (error) {
      console.error('Error toggling promoter status:', error);
      toast.error('Error al cambiar el estado del promotor');
    }
  };

  const copyPromoterLink = async (promoterCode: string) => {
    try {
      const baseUrl = window.location.origin;
      const link = `${baseUrl}/boletos?promo=${promoterCode}`;
      await navigator.clipboard.writeText(link);
      toast.success('¡Enlace copiado al portapapeles!');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast.error('Error al copiar el enlace');
    }
  };

  const openPromoterLink = (promoterCode: string) => {
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/boletos?promo=${promoterCode}`;
    window.open(link, '_blank');
  };

  const totalSales = promoters.reduce((sum, p) => sum + p.total_sales, 0);
  const totalBonus = promoters.reduce((sum, p) => sum + p.accumulated_bonus, 0);
  const activePromoters = promoters.filter(p => p.active).length;

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard de Promotores</h2>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingPromoter(null);
            setFormData({ name: '', code: '' });
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Promotor
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Promotores Activos
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {activePromoters}
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
                <TrendingUp className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Ventas
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {totalSales}
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
                    Total Bonos
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    ${totalBonus.toLocaleString()} MXN
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
                <Trophy className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Premios Extra
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {promoters.filter(p => p.extra_prize).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Promoter Form */}
      {showForm && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium mb-4">
            {editingPromoter ? 'Editar Promotor' : 'Nuevo Promotor'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nombre
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Código
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  required
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                  placeholder="Ej: JP001"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingPromoter(null);
                  setFormData({ name: '', code: '' });
                }}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
              >
                {editingPromoter ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Promoters Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Lista de Promotores
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Promotor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Código
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ventas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bonos Acumulados
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Enlace Personalizado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {promoters.map((promoter) => (
                <tr key={promoter.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {promoter.name}
                        </div>
                        {promoter.extra_prize && (
                          <div className="flex items-center text-xs text-yellow-600">
                            <Trophy className="h-3 w-3 mr-1" />
                            Premio Extra
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                      {promoter.code}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {promoter.total_sales}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${promoter.accumulated_bonus.toLocaleString()} MXN
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleActive(promoter.id, promoter.active)}
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        promoter.active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {promoter.active ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => copyPromoterLink(promoter.code)}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        title="Copiar enlace"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copiar
                      </button>
                      <button
                        onClick={() => openPromoterLink(promoter.code)}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        title="Abrir enlace"
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Abrir
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(promoter)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(promoter.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PromoterDashboard;