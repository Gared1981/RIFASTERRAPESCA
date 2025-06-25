import React, { useState, useEffect } from 'react';
import { Ticket, supabase } from '../utils/supabaseClient';
import { Tag, Gift } from 'lucide-react';
import PaymentMethodSelector from './PaymentMethodSelector';
import toast from 'react-hot-toast';

interface PromoterTicketFormProps {
  selectedTickets: Ticket[];
  raffleInfo: {
    id: number;
    name: string;
    price: number;
  };
  onComplete: () => void;
  onCancel: () => void;
  promoterCode?: string;
}

interface Promoter {
  id: string;
  name: string;
  code: string;
  active: boolean;
}

const PromoterTicketForm: React.FC<PromoterTicketFormProps> = ({
  selectedTickets,
  raffleInfo,
  onComplete,
  onCancel,
  promoterCode: initialPromoterCode
}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    state: '',
    agree: false
  });
  const [loading, setLoading] = useState(false);
  const [selectedPromoter, setSelectedPromoter] = useState<Promoter | null>(null);
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);

  useEffect(() => {
    // Si hay código de promotor inicial, buscar información del promotor
    const fetchPromoterInfo = async () => {
      if (initialPromoterCode) {
        try {
          const { data, error } = await supabase
            .from('promoters')
            .select('*')
            .eq('code', initialPromoterCode)
            .eq('active', true)
            .single();

          if (error) {
            console.error('Error fetching promoter:', error);
            return;
          }

          setSelectedPromoter(data);
        } catch (error) {
          console.error('Error fetching promoter info:', error);
        }
      }
    };

    fetchPromoterInfo();
  }, [initialPromoterCode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const registerSaleWithPromoter = async (ticketIds: number[], promoterCode: string) => {
    try {
      // Register each ticket sale with the promoter
      for (const ticketId of ticketIds) {
        const { data, error } = await supabase.rpc('register_ticket_sale', {
          p_ticket_id: ticketId,
          p_promoter_code: promoterCode
        });

        if (error) throw error;
        
        const result = data as { success: boolean; error?: string };
        if (!result.success) {
          throw new Error(result.error || 'Failed to register sale');
        }
      }
    } catch (error) {
      console.error('Error registering sales with promoter:', error);
      // Don't throw here - we still want the ticket reservation to succeed
      toast.error('Boletos reservados, pero hubo un error al registrar las ventas del promotor');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedTickets.length === 0) {
      toast.error('Debes seleccionar al menos un boleto');
      return;
    }
    
    if (!formData.agree) {
      toast.error('Debes aceptar los términos y condiciones');
      return;
    }

    if (!formData.email) {
      toast.error('El correo electrónico es requerido para procesar el pago');
      return;
    }
    
    try {
      setLoading(true);
      
      // Create or update user
      const { data: userData, error: userError } = await supabase
        .from('users')
        .upsert({
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          state: formData.state
        })
        .select('id')
        .single();
        
      if (userError) throw userError;
      
      // Reserve tickets for the user
      const ticketIds = selectedTickets.map(t => t.id);
      const { error: ticketError } = await supabase
        .from('tickets')
        .update({ 
          status: 'reserved',
          user_id: userData.id,
          reserved_at: new Date().toISOString(),
          promoter_code: initialPromoterCode || null
        })
        .in('id', ticketIds);
        
      if (ticketError) throw ticketError;

      // If promoter code is provided, register the sales
      if (initialPromoterCode && selectedPromoter) {
        await registerSaleWithPromoter(ticketIds, initialPromoterCode);
      }
      
      toast.success('¡Boletos reservados con éxito!');
      
      // Show payment methods
      setShowPaymentMethods(true);
      
    } catch (error) {
      console.error('Error reserving tickets:', error);
      toast.error('Hubo un error al reservar tus boletos. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentComplete = () => {
    onComplete();
  };

  const handlePaymentCancel = () => {
    setShowPaymentMethods(false);
  };
  
  const totalAmount = selectedTickets.length * raffleInfo.price;
  const bonusAmount = initialPromoterCode ? selectedTickets.length * 1000 : 0;

  if (showPaymentMethods) {
    return (
      <PaymentMethodSelector
        selectedTickets={selectedTickets}
        raffleInfo={raffleInfo}
        userInfo={{
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          email: formData.email
        }}
        onComplete={handlePaymentComplete}
        onCancel={handlePaymentCancel}
        promoterCode={initialPromoterCode}
      />
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-green-700 mb-6">Completa tu reserva</h2>
      
      <div className="mb-6 bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Resumen de compra</h3>
        <p>Boletos seleccionados: <strong>{selectedTickets.length}</strong></p>
        <div className="flex flex-wrap gap-1 my-2">
          {selectedTickets.map(ticket => (
            <span key={ticket.id} className="bg-green-100 text-green-800 px-2 py-1 rounded-md text-sm">
              {ticket.number}
            </span>
          ))}
        </div>
        <p className="text-lg font-bold mt-2">
          Total a pagar: ${totalAmount.toLocaleString()} MXN
        </p>
        
        {selectedPromoter && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center text-blue-700">
              <Gift className="h-4 w-4 mr-2" />
              <span className="font-semibold">Promotor: {selectedPromoter.name}</span>
            </div>
            <p className="text-sm text-blue-600 mt-1">
              Código: {selectedPromoter.code}
            </p>
            <p className="text-xs text-blue-500 mt-1">
              El promotor recibirá ${bonusAmount.toLocaleString()} MXN en bonos por esta venta
            </p>
          </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
            Nombre
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
            Apellidos
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            WhatsApp (10 dígitos)
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            pattern="[0-9]{10}"
            placeholder="Ej. 9991234567"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Se te contactará por WhatsApp para confirmar el pago.
          </p>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Correo Electrónico
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="ejemplo@correo.com"
          />
          <p className="text-xs text-gray-500 mt-1">
            Necesario para procesar el pago con Mercado Pago.
          </p>
        </div>
        
        <div>
          <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
            Estado
          </label>
          <select
            id="state"
            name="state"
            value={formData.state}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">Selecciona un estado</option>
            <option value="Aguascalientes">Aguascalientes</option>
            <option value="Baja California">Baja California</option>
            <option value="Baja California Sur">Baja California Sur</option>
            <option value="Campeche">Campeche</option>
            <option value="Chiapas">Chiapas</option>
            <option value="Chihuahua">Chihuahua</option>
            <option value="Ciudad de México">Ciudad de México</option>
            <option value="Coahuila">Coahuila</option>
            <option value="Colima">Colima</option>
            <option value="Durango">Durango</option>
            <option value="Estado de México">Estado de México</option>
            <option value="Guanajuato">Guanajuato</option>
            <option value="Guerrero">Guerrero</option>
            <option value="Hidalgo">Hidalgo</option>
            <option value="Jalisco">Jalisco</option>
            <option value="Michoacán">Michoacán</option>
            <option value="Morelos">Morelos</option>
            <option value="Nayarit">Nayarit</option>
            <option value="Nuevo León">Nuevo León</option>
            <option value="Oaxaca">Oaxaca</option>
            <option value="Puebla">Puebla</option>
            <option value="Querétaro">Querétaro</option>
            <option value="Quintana Roo">Quintana Roo</option>
            <option value="San Luis Potosí">San Luis Potosí</option>
            <option value="Sinaloa">Sinaloa</option>
            <option value="Sonora">Sonora</option>
            <option value="Tabasco">Tabasco</option>
            <option value="Tamaulipas">Tamaulipas</option>
            <option value="Tlaxcala">Tlaxcala</option>
            <option value="Veracruz">Veracruz</option>
            <option value="Yucatán">Yucatán</option>
            <option value="Zacatecas">Zacatecas</option>
          </select>
        </div>
        
        <div className="flex items-start">
          <input
            type="checkbox"
            id="agree"
            name="agree"
            checked={formData.agree}
            onChange={handleChange}
            required
            className="mt-1 h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
          />
          <label htmlFor="agree" className="ml-2 block text-sm text-gray-700">
            Acepto los términos y condiciones del sorteo y confirmo que soy mayor de edad.
          </label>
        </div>
        
        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none ${
              loading ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Procesando...
              </span>
            ) : (
              'Continuar al Pago'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PromoterTicketForm;