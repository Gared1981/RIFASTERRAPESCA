import React, { useState, useEffect } from 'react';
import { Ticket } from '../utils/supabaseClient';
import { CreditCard, Smartphone, Building, Shield, ArrowLeft, CheckCircle, AlertCircle, Clock, RefreshCw, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

interface MercadoPagoPaymentProps {
  selectedTickets: Ticket[];
  raffleInfo: {
    id: number;
    name: string;
    price: number;
  };
  userInfo: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
  };
  onSuccess: (paymentData: any) => void;
  onCancel: () => void;
  promoterCode?: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  available: boolean;
}

const MercadoPagoPayment: React.FC<MercadoPagoPaymentProps> = ({
  selectedTickets,
  raffleInfo,
  userInfo,
  onSuccess,
  onCancel,
  promoterCode
}) => {
  const [loading, setLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string>('credit_card');
  const [paymentStatus, setPaymentStatus] = useState<'selecting' | 'processing' | 'success' | 'error'>('selecting');
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [diagnosticInfo, setDiagnosticInfo] = useState<any>(null);

  const totalAmount = selectedTickets.length * raffleInfo.price;

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'credit_card',
      name: 'Tarjeta de Crédito',
      icon: <CreditCard className="h-6 w-6" />,
      description: 'Visa, Mastercard, American Express - Hasta 12 cuotas',
      available: true
    },
    {
      id: 'debit_card',
      name: 'Tarjeta de Débito',
      icon: <CreditCard className="h-6 w-6" />,
      description: 'Pago inmediato desde tu cuenta bancaria',
      available: true
    },
    {
      id: 'bank_transfer',
      name: 'Transferencia Bancaria',
      icon: <Building className="h-6 w-6" />,
      description: 'SPEI - Transferencia inmediata entre bancos',
      available: true
    },
    {
      id: 'digital_wallet',
      name: 'Billetera Digital',
      icon: <Smartphone className="h-6 w-6" />,
      description: 'Mercado Pago, OXXO, otros métodos digitales',
      available: true
    }
  ];

  const validateUserData = () => {
    const errors = [];
    
    if (!userInfo.firstName.trim()) errors.push('Nombre es requerido');
    if (!userInfo.lastName.trim()) errors.push('Apellidos son requeridos');
    if (!userInfo.email.trim() || !userInfo.email.includes('@')) errors.push('Email válido es requerido');
    
    const cleanPhone = userInfo.phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) errors.push('Teléfono debe tener al menos 10 dígitos');
    
    return errors;
  };

  const createPaymentPreference = async () => {
    try {
      setLoading(true);
      setPaymentStatus('processing');
      setError(null);
      setDiagnosticInfo(null);

      // Validar datos del usuario
      const validationErrors = validateUserData();
      if (validationErrors.length > 0) {
        throw new Error(`Datos inválidos: ${validationErrors.join(', ')}`);
      }

      // Limpiar número de teléfono
      const cleanPhone = userInfo.phone.replace(/\D/g, '');

      // Crear preferencia de pago
      const preferenceData = {
        items: [
          {
            title: `${raffleInfo.name} - ${selectedTickets.length} boleto(s)`,
            description: `Boletos: ${selectedTickets.map(t => t.number).join(', ')}`,
            quantity: 1,
            unit_price: totalAmount,
            currency_id: 'MXN'
          }
        ],
        payer: {
          name: userInfo.firstName.trim(),
          surname: userInfo.lastName.trim(),
          email: userInfo.email.trim().toLowerCase(),
          phone: {
            area_code: '52',
            number: cleanPhone
          }
        },
        external_reference: `raffle_${raffleInfo.id}_${Date.now()}_tickets_${selectedTickets.map(t => t.id).join('_')}`,
        metadata: {
          raffle_id: raffleInfo.id,
          ticket_ids: selectedTickets.map(t => t.id),
          promoter_code: promoterCode || null,
          user_phone: userInfo.phone,
          user_email: userInfo.email,
          ticket_numbers: selectedTickets.map(t => t.number)
        }
      };

      console.log('🚀 Creating payment preference...', preferenceData);

      // Llamar a la función de Supabase Edge Function con timeout extendido
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 segundos timeout

      try {
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-payment-preference`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'User-Agent': 'SorteosTermapesca/1.0 (Web)',
            'X-Client-Info': 'sorteos-terrapesca-web'
          },
          body: JSON.stringify(preferenceData),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        const responseData = await response.json();
        console.log('📥 API Response:', responseData);

        if (!response.ok) {
          console.error('❌ API Error Response:', responseData);
          
          // Guardar información de diagnóstico
          setDiagnosticInfo(responseData.diagnostic);
          
          // Proporcionar mensajes de error más específicos
          if (response.status === 401) {
            throw new Error('Error de autenticación con Mercado Pago. Verifica las credenciales.');
          } else if (response.status === 400) {
            throw new Error(responseData.error || 'Datos de pago inválidos. Verifica la información.');
          } else if (response.status >= 500) {
            throw new Error('Error del servidor de Mercado Pago. Intenta de nuevo en unos minutos.');
          } else {
            throw new Error(responseData.error || `Error HTTP ${response.status}: ${responseData.details || 'Error desconocido'}`);
          }
        }

        const preference = responseData;
        console.log('✅ Preference created:', preference);
        
        // Redirigir a Mercado Pago
        if (preference.init_point) {
          // Mostrar mensaje de redirección
          toast.success('Redirigiendo a Mercado Pago...');
          
          // Pequeña pausa para que el usuario vea el mensaje
          setTimeout(() => {
            window.location.href = preference.init_point;
          }, 1000);
        } else {
          throw new Error('No se recibió el enlace de pago de Mercado Pago');
        }

      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        
        if (fetchError.name === 'AbortError') {
          throw new Error('Tiempo de espera agotado. Verifica tu conexión a internet.');
        }
        throw fetchError;
      }

    } catch (error: any) {
      console.error('💥 Error creating payment preference:', error);
      setPaymentStatus('error');
      
      // Mensajes de error más amigables
      let errorMessage = error.message;
      
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        errorMessage = 'Error de conexión. Verifica tu internet e intenta de nuevo.';
      } else if (error.message.includes('timeout') || error.message.includes('Tiempo de espera')) {
        errorMessage = 'La conexión tardó demasiado. Intenta de nuevo.';
      } else if (error.message.includes('credentials') || error.message.includes('autenticación')) {
        errorMessage = 'Error de configuración de pagos. Contacta al soporte.';
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
  };

  const handleProceedToPayment = () => {
    setRetryCount(prev => prev + 1);
    createPaymentPreference();
  };

  const handleRetry = () => {
    setPaymentStatus('selecting');
    setError(null);
    setDiagnosticInfo(null);
  };

  const handleFallbackToWhatsApp = () => {
    const ticketNumbers = selectedTickets.map(t => t.number);
    let whatsappMessage = `¡Hola! Tuve problemas con el pago en línea. Me gustaría confirmar la reserva de mis boletos: ${ticketNumbers.join(', ')}`;
    
    whatsappMessage += `\n\nPara el sorteo: ${raffleInfo.name}`;
    whatsappMessage += `\nTotal a pagar: $${totalAmount.toLocaleString()} MXN`;
    
    if (promoterCode) {
      whatsappMessage += `\nCódigo de promotor: ${promoterCode}`;
    }
    
    whatsappMessage += `\n\n¿Pueden ayudarme a completar el pago?`;
    
    const whatsappLink = `https://wa.me/526686889571?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(whatsappLink, '_blank');
    onCancel(); // Cerrar el modal de pago
  };

  if (paymentStatus === 'processing') {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto mb-4"></div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Procesando pago...
        </h3>
        <p className="text-gray-600 mb-4">
          Te estamos redirigiendo a Mercado Pago para completar tu pago de forma segura.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-center text-blue-700">
            <Clock className="h-5 w-5 mr-2" />
            <span className="text-sm">Esto puede tomar unos segundos...</span>
          </div>
        </div>
        
        {retryCount > 0 && (
          <div className="mt-4 text-xs text-gray-500">
            Intento {retryCount} de 3
          </div>
        )}
      </div>
    );
  }

  if (paymentStatus === 'error') {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto text-center">
        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-red-800 mb-2">
          Error en el pago
        </h3>
        <p className="text-gray-600 mb-4">
          {error || 'Hubo un problema al procesar tu pago. Por favor, intenta de nuevo.'}
        </p>
        
        {/* Información de diagnóstico */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4 text-left">
          <h4 className="font-semibold text-gray-800 mb-2">Posibles soluciones:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Verifica tu conexión a internet</li>
            <li>• Intenta de nuevo en unos minutos</li>
            <li>• Usa otro navegador o dispositivo</li>
            <li>• Contacta soporte si el problema persiste</li>
          </ul>
          
          {diagnosticInfo && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <h5 className="text-xs font-medium text-gray-700 mb-1">Información técnica:</h5>
              <p className="text-xs text-gray-500">
                Error: {diagnosticInfo.error}<br />
                Hora: {new Date(diagnosticInfo.timestamp).toLocaleString()}
              </p>
            </div>
          )}
        </div>
        
        <div className="flex flex-col space-y-3">
          <div className="flex space-x-3">
            <button
              onClick={onCancel}
              className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancelar
            </button>
            {retryCount < 3 && (
              <button
                onClick={handleRetry}
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Reintentar
              </button>
            )}
          </div>
          
          {/* Opción de WhatsApp siempre disponible */}
          <button
            onClick={handleFallbackToWhatsApp}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Continuar por WhatsApp
          </button>
          
          {retryCount >= 3 && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                Múltiples intentos fallidos. Te recomendamos usar WhatsApp para coordinar tu pago.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <div className="flex items-center mb-6">
        <button
          onClick={onCancel}
          className="mr-4 p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="text-2xl font-bold text-gray-900">Pagar con Mercado Pago</h2>
      </div>

      {/* Resumen de compra */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">Resumen de tu compra</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Sorteo:</span>
            <span className="font-medium">{raffleInfo.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Boletos:</span>
            <span className="font-medium">{selectedTickets.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Números:</span>
            <span className="font-medium text-sm">
              {selectedTickets.map(t => t.number).join(', ')}
            </span>
          </div>
          {promoterCode && (
            <div className="flex justify-between">
              <span className="text-gray-600">Código promotor:</span>
              <span className="font-medium text-green-600">{promoterCode}</span>
            </div>
          )}
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between text-lg font-bold">
              <span>Total a pagar:</span>
              <span className="text-green-600">${totalAmount.toLocaleString()} MXN</span>
            </div>
          </div>
        </div>
      </div>

      {/* Métodos de pago */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">Selecciona tu método de pago</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {paymentMethods.map((method) => (
            <button
              key={method.id}
              onClick={() => handlePaymentMethodSelect(method.id)}
              disabled={!method.available}
              className={`p-4 border-2 rounded-lg text-left transition-all ${
                selectedMethod === method.id
                  ? 'border-blue-500 bg-blue-50'
                  : method.available
                  ? 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-50'
              }`}
            >
              <div className="flex items-start">
                <div className={`mr-3 ${selectedMethod === method.id ? 'text-blue-600' : 'text-gray-400'}`}>
                  {method.icon}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{method.name}</h4>
                  <p className="text-sm text-gray-500">{method.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Información de seguridad */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <Shield className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-800">Pago 100% seguro</h4>
            <p className="text-sm text-blue-700 mt-1">
              Tu información está protegida con encriptación SSL. Mercado Pago es una plataforma 
              certificada y confiable para procesar pagos en línea en México.
            </p>
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex flex-col space-y-3">
        <div className="flex space-x-4">
          <button
            onClick={onCancel}
            className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleProceedToPayment}
            disabled={loading || !selectedMethod}
            className={`flex-1 py-3 px-4 rounded-lg text-white font-medium transition-colors ${
              loading || !selectedMethod
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Procesando...' : 'Pagar con Mercado Pago'}
          </button>
        </div>
        
        {/* Opción alternativa de WhatsApp */}
        <button
          onClick={handleFallbackToWhatsApp}
          className="w-full py-2 px-4 text-green-600 hover:text-green-800 transition-colors text-sm"
        >
          ¿Problemas con el pago? Usar WhatsApp en su lugar
        </button>
      </div>

      {/* Términos y condiciones */}
      <div className="mt-4 text-xs text-gray-500 text-center">
        Al continuar, aceptas los{' '}
        <a href="#" className="text-blue-600 hover:underline">
          términos y condiciones
        </a>{' '}
        del sorteo y las{' '}
        <a href="https://www.mercadopago.com.mx/ayuda/terminos-y-condiciones_299" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
          políticas de privacidad
        </a>{' '}
        de Mercado Pago.
      </div>
    </div>
  );
};

export default MercadoPagoPayment;