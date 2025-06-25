import React, { useState, useRef, useEffect } from 'react';
import { supabase, Ticket } from '../utils/supabaseClient';
import { Check, RefreshCcw, Dice1 as Dice } from 'lucide-react';

interface LuckyMachineProps {
  raffleId: number;
  onTicketsSelected: (tickets: Ticket[]) => void;
}

const LuckyMachine: React.FC<LuckyMachineProps> = ({ raffleId, onTicketsSelected }) => {
  const [quantity, setQuantity] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [displayNumbers, setDisplayNumbers] = useState<string[]>(['0000']);
  const spinTimeout = useRef<NodeJS.Timeout>();
  
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0 && value <= 100) {
      setQuantity(value);
      setDisplayNumbers(Array(value).fill('0000'));
    }
  };
  
  const generateRandomNumber = () => {
    return Math.floor(Math.random() * 8999 + 1001).toString();
  };
  
  const animateNumbers = () => {
    if (!isSpinning) return;
    
    setDisplayNumbers(prev => 
      prev.map(() => generateRandomNumber())
    );
    
    spinTimeout.current = setTimeout(animateNumbers, 50);
  };
  
  useEffect(() => {
    return () => {
      if (spinTimeout.current) {
        clearTimeout(spinTimeout.current);
      }
    };
  }, []);
  
  const handleRandomSelection = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setIsSpinning(true);
      
      // Start animation
      animateNumbers();
      
      // Get available tickets for this raffle
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('raffle_id', raffleId)
        .eq('status', 'available');
        
      if (error) throw error;
      
      if (!data || data.length === 0) {
        setError('No hay boletos disponibles para seleccionar.');
        return;
      }
      
      // Select random tickets
      const shuffled = [...data].sort(() => 0.5 - Math.random());
      const randomTickets = shuffled.slice(0, Math.min(quantity, shuffled.length));
      
      // Animate for at least 2 seconds
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Stop animation and show final numbers
      setIsSpinning(false);
      if (spinTimeout.current) {
        clearTimeout(spinTimeout.current);
      }
      
      setDisplayNumbers(randomTickets.map(t => t.number.toString()));
      
      // Pass selected tickets to parent
      onTicketsSelected(randomTickets as Ticket[]);
      
    } catch (err) {
      console.error('Error selecting random tickets:', err);
      setError('Ocurrió un error al seleccionar boletos. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
      setIsSpinning(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="bg-green-500 rounded-full p-2 mr-3">
            <Dice className="text-white h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-green-800">Maquinita de la Suerte</h3>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-inner mb-6">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              ¿Cuántos boletos quieres?
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={quantity}
              onChange={handleQuantityChange}
              className="w-20 px-3 py-2 border-2 border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-center font-bold text-green-700"
            />
          </div>

          <div className={`grid grid-cols-2 sm:grid-cols-3 gap-3 ${isSpinning ? 'animate-pulse' : ''}`}>
            {displayNumbers.map((number, index) => (
              <div
                key={index}
                className={`bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 flex items-center justify-center transform transition-all duration-300 ${
                  isSpinning ? 'scale-105 shadow-lg' : ''
                }`}
              >
                <span className={`text-xl font-mono font-bold text-white ${
                  isSpinning ? 'animate-bounce' : ''
                }`}>
                  {number}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <button
        onClick={handleRandomSelection}
        disabled={isLoading || isSpinning}
        className={`w-full flex items-center justify-center py-3 px-6 rounded-lg text-white font-medium transition-all duration-300 ${
          isLoading || isSpinning
            ? 'bg-yellow-500 animate-pulse cursor-not-allowed'
            : 'bg-green-500 hover:bg-green-600 transform hover:-translate-y-1'
        } shadow-lg`}
      >
        {isLoading || isSpinning ? (
          <>
            <RefreshCcw className="animate-spin mr-2 h-5 w-5" />
            Girando la ruleta...
          </>
        ) : (
          <>
            <Dice className="mr-2 h-5 w-5" />
            ¡Probar mi suerte!
          </>
        )}
      </button>
    </div>
  );
};

export default LuckyMachine;