import React, { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { Calendar, DollarSign, Image, Hash, FileText, Plus, X, Gift, Video } from 'lucide-react';
import toast from 'react-hot-toast';

interface RaffleEditFormProps {
  raffle: {
    id: number;
    name: string;
    description: string;
    image_url: string;
    video_url?: string;
    images: string[];
    video_urls?: string[];
    price: number;
    draw_date: string;
    total_tickets: number;
    status: string;
    prize_items?: string[];
  };
  onComplete: () => void;
  onCancel: () => void;
}

const RaffleEditForm: React.FC<RaffleEditFormProps> = ({ raffle, onComplete, onCancel }) => {
  const [formData, setFormData] = useState({
    name: raffle.name,
    description: raffle.description,
    image_url: raffle.image_url,
    video_url: raffle.video_url || '',
    images: raffle.images || [],
    video_urls: raffle.video_urls || [],
    price: raffle.price,
    draw_date: raffle.draw_date.split('T')[0],
    draw_time: raffle.draw_date.split('T')[1]?.split('.')[0] || '00:00',
    total_tickets: raffle.total_tickets,
    status: raffle.status,
    prize_items: raffle.prize_items || []
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageAdd = () => {
    const url = prompt('Ingresa la URL de la imagen:');
    if (url) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, url]
      }));
    }
  };

  const handleImageRemove = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleVideoAdd = () => {
    const url = prompt('Ingresa la URL del video (YouTube, Vimeo o video directo):');
    if (url) {
      setFormData(prev => ({
        ...prev,
        video_urls: [...prev.video_urls, url]
      }));
    }
  };

  const handleVideoRemove = (index: number) => {
    setFormData(prev => ({
      ...prev,
      video_urls: prev.video_urls.filter((_, i) => i !== index)
    }));
  };

  const handlePrizeItemAdd = () => {
    const item = prompt('Ingresa un elemento del premio:');
    if (item) {
      setFormData(prev => ({
        ...prev,
        prize_items: [...prev.prize_items, item]
      }));
    }
  };

  const handlePrizeItemRemove = (index: number) => {
    setFormData(prev => ({
      ...prev,
      prize_items: prev.prize_items.filter((_, i) => i !== index)
    }));
  };

  const handlePrizeItemsTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const items = e.target.value.split('\n').filter(item => item.trim() !== '');
    setFormData(prev => ({ ...prev, prize_items: items }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (raffle.status === 'completed') {
      toast.error('No se puede editar un sorteo finalizado');
      return;
    }
    
    try {
      setLoading(true);
      
      const drawDateTime = `${formData.draw_date}T${formData.draw_time}`;
      
      const { error } = await supabase
        .from('raffles')
        .update({
          name: formData.name,
          description: formData.description,
          image_url: formData.image_url,
          video_url: formData.video_url || null,
          images: formData.images,
          video_urls: formData.video_urls,
          price: formData.price,
          draw_date: drawDateTime,
          total_tickets: formData.total_tickets,
          status: formData.status,
          prize_items: formData.prize_items
        })
        .eq('id', raffle.id);
        
      if (error) throw error;
      
      toast.success('Sorteo actualizado exitosamente');
      onComplete();
      
    } catch (error) {
      console.error('Error updating raffle:', error);
      toast.error('Error al actualizar el sorteo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">Editar Sorteo</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Estado del sorteo
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
            disabled={raffle.status === 'completed'}
          >
            <option value="draft">Borrador</option>
            <option value="active">Activo</option>
            <option value="completed">Completado</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Título del sorteo
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FileText className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="focus:ring-green-500 focus:border-green-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Descripción
          </label>
          <div className="mt-1">
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            URL de la imagen principal
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Image className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="url"
              name="image_url"
              value={formData.image_url}
              onChange={handleChange}
              className="focus:ring-green-500 focus:border-green-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            URL del video principal (opcional)
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Video className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="url"
              name="video_url"
              value={formData.video_url}
              onChange={handleChange}
              className="focus:ring-green-500 focus:border-green-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
              placeholder="https://youtube.com/watch?v=... o https://vimeo.com/..."
            />
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Soporta YouTube, Vimeo y videos directos (.mp4, .webm, etc.)
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Galería de imágenes
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
            {formData.images.map((url, index) => (
              <div key={index} className="relative">
                <img
                  src={url}
                  alt={`Imagen ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => handleImageRemove(index)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleImageAdd}
              className="flex items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50"
            >
              <Plus className="h-8 w-8 text-gray-400" />
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center">
              <Video className="h-4 w-4 mr-2" />
              Videos adicionales
            </div>
          </label>
          <div className="space-y-2 mb-4">
            {formData.video_urls.map((url, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center">
                  <Video className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-sm text-gray-700 truncate max-w-xs">{url}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleVideoRemove(index)}
                  className="p-1 text-red-500 hover:text-red-700"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleVideoAdd}
              className="flex items-center justify-center w-full p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 text-gray-500 hover:text-green-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar video
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center">
              <Gift className="h-4 w-4 mr-2" />
              Contenido del premio
            </div>
          </label>
          
          {/* Textarea para edición masiva */}
          <div className="mb-4">
            <label className="block text-xs text-gray-500 mb-2">
              Editar todos los artículos (uno por línea):
            </label>
            <textarea
              value={formData.prize_items.join('\n')}
              onChange={handlePrizeItemsTextareaChange}
              rows={15}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-sm font-mono"
              placeholder="Ingresa cada artículo en una línea separada..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Tip: Usa emojis para hacer más atractiva la lista. Líneas vacías se mantendrán como separadores.
            </p>
          </div>

          {/* Vista previa de artículos */}
          <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Vista previa:</h4>
            <div className="space-y-1">
              {formData.prize_items.map((item, index) => (
                <div key={index} className="flex items-center justify-between group">
                  <span className={`text-sm ${item.trim() === '' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {item.trim() === '' ? '(separador)' : item}
                  </span>
                  <button
                    type="button"
                    onClick={() => handlePrizeItemRemove(index)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:text-red-700 transition-opacity"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Botón para agregar artículo individual */}
          <button
            type="button"
            onClick={handlePrizeItemAdd}
            className="mt-2 flex items-center justify-center w-full p-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 text-gray-500 hover:text-green-600 text-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Agregar artículo individual
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Precio del boleto
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="1"
                step="0.01"
                className="focus:ring-green-500 focus:border-green-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Fecha del sorteo
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="date"
                name="draw_date"
                value={formData.draw_date}
                onChange={handleChange}
                required
                className="focus:ring-green-500 focus:border-green-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Hora del sorteo
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="time"
                name="draw_time"
                value={formData.draw_time}
                onChange={handleChange}
                required
                className="focus:ring-green-500 focus:border-green-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Total de boletos
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Hash className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="number"
              name="total_tickets"
              value={formData.total_tickets}
              onChange={handleChange}
              required
              min="1"
              className="focus:ring-green-500 focus:border-green-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
            />
          </div>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading || raffle.status === 'completed'}
            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
              (loading || raffle.status === 'completed') ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RaffleEditForm;