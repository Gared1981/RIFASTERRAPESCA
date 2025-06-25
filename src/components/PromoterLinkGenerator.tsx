import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { Copy, ExternalLink, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Promoter {
  id: string;
  name: string;
  code: string;
  active: boolean;
}

interface Raffle {
  id: number;
  name: string;
  status: string;
}

const PromoterLinkGenerator: React.FC = () => {
  const [promoters, setPromoters] = useState<Promoter[]>([]);
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [selectedPromoter, setSelectedPromoter] = useState<string>('');
  const [selectedRaffle, setSelectedRaffle] = useState<string>('');
  const [generatedLink, setGeneratedLink] = useState<string>('');

  useEffect(() => {
    fetchPromoters();
    fetchRaffles();
  }, []);

  const fetchPromoters = async () => {
    try {
      const { data, error } = await supabase
        .from('promoters')
        .select('*')
        .eq('active', true)
        .order('name');

      if (error) throw error;
      setPromoters(data || []);
    } catch (error) {
      console.error('Error fetching promoters:', error);
      toast.error('Error al cargar los promotores');
    }
  };

  const fetchRaffles = async () => {
    try {
      const { data, error } = await supabase
        .from('raffles')
        .select('id, name, status')
        .eq('status', 'active')
        .order('name');

      if (error) throw error;
      setRaffles(data || []);
    } catch (error) {
      console.error('Error fetching raffles:', error);
      toast.error('Error al cargar los sorteos');
    }
  };

  const generateLink = () => {
    if (!selectedPromoter) {
      toast.error('Selecciona un promotor');
      return;
    }

    const baseUrl = window.location.origin;
    let link = `${baseUrl}/boletos?promo=${selectedPromoter}`;
    
    if (selectedRaffle) {
      link += `&raffle=${selectedRaffle}`;
    }

    setGeneratedLink(link);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedLink);
      toast.success('¡Enlace copiado al portapapeles!');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast.error('Error al copiar el enlace');
    }
  };

  const shareLink = async () => {
    const promoter = promoters.find(p => p.code === selectedPromoter);
    const raffle = raffles.find(r => r.id.toString() === selectedRaffle);
    
    const title = `Enlace de promotor - ${promoter?.name}`;
    const text = `Compra boletos con el código de promotor ${selectedPromoter}${raffle ? ` para el sorteo: ${raffle.name}` : ''}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url: generatedLink
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback to WhatsApp
      const whatsappText = encodeURIComponent(`${text}\n\n${generatedLink}`);
      window.open(`https://wa.me/?text=${whatsappText}`, '_blank');
    }
  };

  const openLink = () => {
    window.open(generatedLink, '_blank');
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium mb-4">Generador de Enlaces de Promotor</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Seleccionar Promotor *
          </label>
          <select
            value={selectedPromoter}
            onChange={(e) => setSelectedPromoter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
          >
            <option value="">Selecciona un promotor</option>
            {promoters.map(promoter => (
              <option key={promoter.id} value={promoter.code}>
                {promoter.code} - {promoter.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Seleccionar Sorteo (Opcional)
          </label>
          <select
            value={selectedRaffle}
            onChange={(e) => setSelectedRaffle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
          >
            <option value="">Todos los sorteos activos</option>
            {raffles.map(raffle => (
              <option key={raffle.id} value={raffle.id}>
                {raffle.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={generateLink}
          disabled={!selectedPromoter}
          className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
            selectedPromoter
              ? 'bg-green-600 hover:bg-green-700'
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          Generar Enlace
        </button>

        {generatedLink && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enlace Generado:
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={generatedLink}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
              />
              <button
                onClick={copyToClipboard}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100"
                title="Copiar enlace"
              >
                <Copy className="h-4 w-4" />
              </button>
              <button
                onClick={shareLink}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100"
                title="Compartir enlace"
              >
                <Share2 className="h-4 w-4" />
              </button>
              <button
                onClick={openLink}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100"
                title="Abrir enlace"
              >
                <ExternalLink className="h-4 w-4" />
              </button>
            </div>
            
            <div className="mt-3 text-xs text-gray-600">
              <p><strong>Instrucciones:</strong></p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Comparte este enlace con tus clientes</li>
                <li>Cuando compren boletos usando este enlace, se registrará automáticamente tu código</li>
                <li>Recibirás $1,000 MXN de comisión por cada boleto vendido</li>
                <li>Si tu boleto resulta ganador, recibirás $1,000 MXN adicionales</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PromoterLinkGenerator;