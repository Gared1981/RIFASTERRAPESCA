import React, { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { Calendar, Image, DollarSign, Hash, FileText, Plus, X, Gift, Video } from 'lucide-react';
import toast from 'react-hot-toast';

interface RaffleFormProps {
  onComplete: () => void;
  onCancel: () => void;
}

const RaffleForm: React.FC<RaffleFormProps> = ({ onComplete, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '',
    video_url: '',
    price: '',
    draw_date: '',
    draw_time: '',
    total_tickets: '',
    status: 'draft',
    images: [] as string[],
    video_urls: [] as string[],
    prize_items: [] as string[]
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const drawDateTime = `${formData.draw_date}T${formData.draw_time}`;
      
      // Insert new raffle
      const { data: raffleData, error: raffleError } = await supabase
        .from('raffles')
        .insert({
          name: formData.name,
          description: formData.description,
          image_url: formData.image_url,
          video_url: formData.video_url || null,
          price: parseFloat(formData.price),
          draw_date: drawDateTime,
          total_tickets: parseInt(formData.total_tickets),
          status: formData.status,
          images: formData.images,
          video_urls: formData.video_urls,
          prize_items: formData.prize_items
        })
        .select()
        .single();
        
      if (raffleError) throw raffleError;
      
      // Generate tickets for the raffle (4-digit numbers)
      const tickets = Array.from(
        { length: parseInt(formData.total_tickets) }, 
        (_, i) => ({
          number: 1001 + i,
          status: 'available',
          raffle_id: raffleData.id
        })
      );
      
      const { error: ticketsError } = await supabase
        .from('tickets')
        .insert(tickets);
        
      if (ticketsError) throw ticketsError;
      
      toast.success('Sorteo creado exitosamente');
      onComplete();
      
    } catch (error) {
      console.error('Error creating raffle:', error);
      toast.error('Error al crear el sorteo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">Nuevo Sorteo</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Estado inicial
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
          >
            <option value="draft">Borrador</option>
            <option value="active">Activo</option>
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
              placeholder="Ej: Gran Sorteo Verano 2025"
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
              placeholder="Describe los detalles del premio y condiciones importantes"
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
              placeholder="https://ejemplo.com/imagen.jpg"
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
          <div className="space-y-2 mb-4">
            {formData.prize_items.map((item, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                <span className="text-sm text-gray-700">{item}</span>
                <button
                  type="button"
                  onClick={() => handlePrizeItemRemove(index)}
                  className="p-1 text-red-500 hover:text-red-700"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handlePrizeItemAdd}
              className="flex items-center justify-center w-full p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 text-gray-500 hover:text-green-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar elemento del premio
            </button>
          </div>
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
                placeholder="0.00"
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
              max="8999"
              className="focus:ring-green-500 focus:border-green-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
              placeholder="100"
            />
            <p className="mt-1 text-sm text-gray-500">
              Los números de boleto serán generados automáticamente desde 1001 hasta {formData.total_tickets ? (1000 + parseInt(formData.total_tickets)) : '9999'}
            </p>
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
            disabled={loading}
            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
              loading ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Creando...' : 'Crear Sorteo'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RaffleForm;