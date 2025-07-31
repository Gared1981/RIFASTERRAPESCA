import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { Users, DollarSign, Trophy, TrendingUp, Plus, Edit, Trash2, Copy, ExternalLink, Percent, Calculator, Target, Award } from 'lucide-react';
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
  total_commission_earned: number;
  pending_commission: number;
  average_ticket_price: number;
  active_raffles_count: number;
  total_raffles_participated: number;
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
  const totalCommissionEarned = promoters.reduce((sum, p) => sum + (p.total_commission_earned || 0), 0);
  const totalPendingCommission = promoters.reduce((sum, p) => sum + (p.pending_commission || 0), 0);
  const activePromoters = promoters.filter(p => p.active).length;
  const averageCommissionPerPromoter = activePromoters > 0 ? totalCommissionEarned / activePromoters : 0;
  const promotersNear100 = promoters.filter(p => p.total_sales >= 80 && p.total_sales < 100).length;
  const promotersOver100 = promoters.filter(p => p.total_sales >= 100).length;

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
                <Calculator className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Comisiones Pagadas (15%)
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    ${totalCommissionEarned.toLocaleString()} MXN
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
                <DollarSign className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Comisiones Pendientes (15%)
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    ${totalPendingCommission.toLocaleString()} MXN
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
                <Target className="h-6 w-6 text-purple-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Cerca del Bono Extra
                  </dt>
                  <dd className="text-lg font-medium text-purple-600">
                    {promotersNear100} promotores (80-99)
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
                <Award className="h-6 w-6 text-yellow-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Con Bono Extra Activo
                  </dt>
                  <dd className="text-lg font-medium text-yellow-600">
                    {promotersOver100} promotores (100+)
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
          <div className="flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Lista de Promotores - Sistema de Comisiones 15%
            </h3>
            <div className="text-sm text-gray-500">
              <Percent className="inline h-4 w-4 mr-1" />
              Comisión: 15% por boleto vendido
            </div>
          </div>
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
                  Boletos Vendidos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Comisiones Ganadas
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Comisiones Pendientes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progreso a 100
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
                        <div className="text-xs text-gray-500">
                          Miembro desde: {new Date(promoter.created_at).toLocaleDateString()}
                        </div>
                        {(promoter.total_commission_earned || 0) > 5000 && (
                          <div className="flex items-center text-xs text-green-600">
                            <Award className="h-3 w-3 mr-1" />
                            Top Performer
                          </div>
                        )}
                        {promoter.total_sales >= 100 && (
                          <div className="flex items-center text-xs text-purple-600">
                            <Target className="h-3 w-3 mr-1" />
                            Bono Extra Calificado
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
                    <div className="flex flex-col">
                      <span className="font-medium">{promoter.confirmed_sales || 0} confirmados</span>
                      <span className="text-xs text-gray-500">{promoter.pending_sales || 0} pendientes</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex flex-col">
                      <span className="font-medium text-green-600">
                        ${(promoter.total_commission_earned || 0).toLocaleString()} MXN
                      </span>
                      <span className="text-xs text-gray-500">
                        {promoter.confirmed_sales || 0} boletos × 15%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex flex-col">
                      <span className="font-medium text-yellow-600">
                        ${(promoter.pending_commission || 0).toLocaleString()} MXN
                      </span>
                      <span className="text-xs text-gray-500">
                        {promoter.pending_sales || 0} boletos reservados
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex flex-col">
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                        <div 
                          className={`h-2 rounded-full ${
                            promoter.total_sales >= 100 
                              ? 'bg-purple-600' 
                              : promoter.total_sales >= 80 
                                ? 'bg-yellow-500' 
                                : 'bg-blue-500'
                          }`}
                          style={{ 
                            width: `${Math.min((promoter.total_sales / 100) * 100, 100)}%` 
                          }}
                        ></div>
                      </div>
                      <span className={`text-xs font-medium ${
                        promoter.total_sales >= 100 
                          ? 'text-purple-600' 
                          : promoter.total_sales >= 80 
                            ? 'text-yellow-600' 
                            : 'text-blue-600'
                      }`}>
                        {promoter.total_sales}/100 boletos
                      </span>
                      {promoter.total_sales >= 100 && (
                        <span className="text-xs text-purple-600 font-bold">
                          ✨ Bono Extra Activo
                        </span>
                      )}
                    </div>
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
                        className="inline-flex items-center px-2 py-1 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        title="Copiar enlace"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => openPromoterLink(promoter.code)}
                        className="inline-flex items-center px-2 py-1 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        title="Abrir enlace"
                      >
                        <ExternalLink className="h-3 w-3" />
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

      {/* Commission Calculation Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start">
          <Calculator className="h-6 w-6 text-blue-600 mr-3 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-blue-800 mb-2">
              💰 Sistema de Comisiones del 15% + Bonos Especiales
            </h3>
            <div className="space-y-2 text-sm text-blue-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-blue-800 mb-2">📊 Comisiones Base (15%)</h4>
                  <ul className="space-y-1">
                    <li><strong>• Comisión:</strong> 15% del precio del boleto</li>
                    <li><strong>• Ejemplo:</strong> Boleto $150 = $22.50 comisión</li>
                    <li><strong>• Pago:</strong> Cuando cliente confirma</li>
                    <li><strong>• Seguimiento:</strong> Tiempo real</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-800 mb-2">🏆 Bonos por Ganador</h4>
                  <ul className="space-y-1">
                    <li><strong>• Bono base:</strong> $2,000 MXN si tu cliente gana</li>
                    <li><strong>• Bono extra:</strong> +$1,000 MXN si tienes 100+ ventas</li>
                    <li><strong>• Total máximo:</strong> $3,000 MXN por ganador</li>
                    <li><strong>• Requisito:</strong> Cliente con tu código debe ganar</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bonus System Info */}
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-start">
          <Award className="h-6 w-6 text-yellow-600 mr-3 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">
              🎯 Ejemplos de Ganancias Reales
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-white p-3 rounded-lg border border-yellow-200">
                <h4 className="font-semibold text-yellow-800 mb-2">📈 Promotor Nuevo (25 boletos)</h4>
                <ul className="text-yellow-700 space-y-1">
                  <li>• Comisiones: $337.50 MXN</li>
                  <li>• Si cliente gana: +$2,000 MXN</li>
                  <li>• <strong>Total potencial: $2,337.50</strong></li>
                </ul>
              </div>
              <div className="bg-white p-3 rounded-lg border border-yellow-200">
                <h4 className="font-semibold text-yellow-800 mb-2">🎯 Promotor Activo (75 boletos)</h4>
                <ul className="text-yellow-700 space-y-1">
                  <li>• Comisiones: $1,012.50 MXN</li>
                  <li>• Si cliente gana: +$2,000 MXN</li>
                  <li>• <strong>Total potencial: $3,012.50</strong></li>
                </ul>
              </div>
              <div className="bg-white p-3 rounded-lg border border-yellow-200">
                <h4 className="font-semibold text-yellow-800 mb-2">🏆 Promotor Elite (120 boletos)</h4>
                <ul className="text-yellow-700 space-y-1">
                  <li>• Comisiones: $1,620 MXN</li>
                  <li>• Si cliente gana: +$3,000 MXN</li>
                  <li>• <strong>Total potencial: $4,620</strong></li>
                </ul>
              </div>
            </div>
            <div className="mt-4 p-3 bg-yellow-100 rounded-lg">
              <p className="text-sm text-yellow-800 font-medium text-center">
                💡 <strong>Tip:</strong> Alcanza 100 boletos vendidos para desbloquear el bono extra de $1,000 MXN por cada cliente ganador
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromoterDashboard;