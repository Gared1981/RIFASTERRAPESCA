import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { Calendar, Users, ArrowRight, DollarSign } from 'lucide-react';
import Footer from '../components/Footer';

interface PublicRaffle {
  id: number;
  name: string;
  description: string;
  image_url: string;
  draw_date: string;
  drawn_at: string | null;
  winner_id: string | null;
  winner_first_name: string | null;
  winner_last_name: string | null;
  participant_count: number;
  total_tickets: number;
  price: number;
  slug: string;
}

const RafflesListPage: React.FC = () => {
  const [raffles, setRaffles] = useState<PublicRaffle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRaffles = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('public_raffles')
          .select('*')
          .order('draw_date', { ascending: true });

        if (error) throw error;
        setRaffles(data || []);
      } catch (err) {
        console.error('Error fetching raffles:', err);
        setError('No se pudieron cargar los sorteos');
      } finally {
        setLoading(false);
      }
    };

    fetchRaffles();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
        <p className="text-gray-600 text-center">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Sorteos</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {raffles.map((raffle) => (
              <Link
                key={raffle.id}
                to={`/sorteo/${raffle.slug}`}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="relative">
                  <img
                    src={raffle.image_url}
                    alt={raffle.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-0 right-0 m-2 flex flex-col gap-2">
                    <div className="bg-green-500 text-white px-3 py-1 text-sm rounded-full font-semibold shadow-lg">
                      ${raffle.price} MXN
                    </div>
                    {raffle.drawn_at && (
                      <div className="bg-blue-500 text-white px-2 py-1 text-sm rounded">
                        Finalizado
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    {raffle.name}
                  </h2>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(raffle.draw_date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {raffle.participant_count} participantes
                    </div>
                  </div>

                  <p className="text-gray-600 line-clamp-2 mb-4">
                    {raffle.description}
                  </p>

                  <div className="flex items-center text-green-600 font-medium">
                    Ver detalles
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RafflesListPage;