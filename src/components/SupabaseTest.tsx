import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('❌ Variables de entorno no definidas: Verifica tu archivo .env');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function SupabaseTest() {
  const [data, setData] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error } = await supabase
          .from('your_table_name') // 🔁 cambia esto por el nombre real de tu tabla
          .select('*');

        if (error) {
          console.error('🛑 Error al obtener datos:', error.message);
          setError(error.message);
        } else {
          console.log('✅ Datos recibidos:', data);
          setData(data);
        }
      } catch (err: any) {
        console.error('🚨 Error de conexión:', err.message || err);
        setError('No se pudo conectar con Supabase.');
      }
    };

    fetchData();
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Test de conexión a Supabase</h2>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {data ? (
        <pre>{JSON.stringify(data, null, 2)}</pre>
      ) : (
        <p>Cargando datos...</p>
      )}
    </div>
  );
}
