import React, { useState } from 'react';
import { Ticket } from '../utils/supabaseClient';
import { CreditCard, MessageSquare, ArrowRight, Shield, Gift } from 'lucide-react';
import MercadoPagoPayment from './MercadoPagoPayment';
import PDFGenerator from './PDFGenerator';

interface PaymentMethodSelectorProps {
  selectedTickets: Ticket[];
  raffleInfo: {
    id: number;
    name: string;
    price: number;
    draw_date: string;
  };
  userInfo: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    state: string;
  };
  onComplete: () => void;
  onCancel: () => void;
  promoterCode?: string;
}

type PaymentMethod = 'whatsapp' | 'mercadopago';

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedTickets,
  raffleInfo,
  userInfo,
  onComplete,
  onCancel,
  promoterCode
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [showMercadoPago, setShowMercadoPago] = useState(false);
  const [showPDFGenerator, setShowPDFGenerator] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'mercadopago' | 'whatsapp'>('mercadopago');

  const totalAmount = selectedTickets.length * raffleInfo.price;

  const handleWhatsAppPayment = () => {
    const ticketNumbers = selectedTickets.map(t => t.number);
    let whatsappMessage = `¡Hola! Me gustaría confirmar la reserva de mis boletos: ${ticketNumbers.join(', ')}`;
    
    whatsappMessage += `\n\nPara el sorteo: ${raffleInfo.name}`;
    whatsappMessage += `\nTotal a pagar: $${totalAmount.toLocaleString()} MXN`;
    
    if (promoterCode) {
      whatsappMessage += `\nCódigo de promotor: ${promoterCode}`;
    }
    
    whatsappMessage += `\n\n¿Cómo puedo realizar el pago?`;
    
    const whatsappLink = `https://wa.me/526686889571?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(whatsappLink, '_blank');
    
    // Mostrar generador de PDF para WhatsApp
    setPaymentMethod('whatsapp');
    setShowPDFGenerator(true);
  };

  const handleMercadoPagoSelect = () => {
    setShowMercadoPago(true);
  };

  const handleMercadoPagoSuccess = (paymentData: any) => {
    console.log('Payment successful:', paymentData);
    // Mostrar generador de PDF para Mercado Pago
    setPaymentMethod('mercadopago');
    setShowPDFGenerator(true);
  };

  const handleMercadoPagoCancel = () => {
    setShowMercadoPago(false);
  };

  const handlePDFGenerated = (pdfBlob: Blob) => {
    // Crear enlace de descarga
    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `comprobante-sorteo-${selectedTickets.map(t => t.number).join('-')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Completar el proceso
    onComplete();
  };

  if (showPDFGenerator) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Gift className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            ¡Pago Confirmado!
          </h2>
          <p className="text-gray-600">
            {paymentMethod === 'mercadopago' 
              ? '🏆 ¡Felicidades! Por pagar con Mercado Pago, automáticamente participas en nuestro premio especial adicional.'
              : 'Tu reserva ha sido registrada. Te contactaremos por WhatsApp para coordinar el pago.'
            }
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold mb-2">Resumen de tu compra</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p>Boletos: {selectedTickets.map(t => t.number).join(', ')}</p>
            <p>Sorteo: {raffleInfo.name}</p>
            <p>Total: ${totalAmount.toLocaleString()} MXN</p>
            {paymentMethod === 'mercadopago' && (
              <p className="text-green-600 font-semibold">✨ Incluye participación en premio especial</p>
            )}
          </div>
        </div>

        <PDFGenerator
          tickets={selectedTickets}
          user={{
            id: '',
            first_name: userInfo.firstName,
            last_name: userInfo.lastName,
            phone: userInfo.phone,
            state: userInfo.state
          }}
          raffleInfo={raffleInfo}
          paymentMethod={paymentMethod}
          onGenerate={handlePDFGenerated}
        />

        <button
          onClick={onComplete}
          className="mt-4 text-gray-600 hover:text-gray-800 transition-colors"
        >
          Continuar sin descargar
        </button>
      </div>
    );
  }

  if (showMercadoPago) {
    return (
      <MercadoPagoPayment
        selectedTickets={selectedTickets}
        raffleInfo={raffleInfo}
        userInfo={userInfo}
        onSuccess={handleMercadoPagoSuccess}
        onCancel={handleMercadoPagoCancel}
        promoterCode={promoterCode}
      />
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Elige tu método de pago</h2>
      
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
      <div className="space-y-4 mb-6">
        {/* Mercado Pago */}
        <div
          className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
            selectedMethod === 'mercadopago'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
          }`}
          onClick={() => setSelectedMethod('mercadopago')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg mr-4">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Mercado Pago</h3>
                <p className="text-gray-600">Pago inmediato y seguro</p>
                <div className="flex items-center mt-1">
                  <Shield className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">Pago protegido</span>
                </div>
                {/* Premio especial badge */}
                <div className="flex items-center mt-2">
                  <Gift className="h-4 w-4 text-yellow-500 mr-1" />
                  <span className="text-sm text-yellow-600 font-semibold">🏆 Incluye premio especial</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 mb-1">Acepta:</div>
              <div className="text-xs text-gray-600">
                • Tarjetas de crédito/débito<br />
                • Transferencia bancaria<br />
                • Billeteras digitales
              </div>
            </div>
          </div>
          
          {selectedMethod === 'mercadopago' && (
            <div className="mt-4 pt-4 border-t border-blue-200">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <div className="flex items-center text-yellow-800">
                  <Gift className="h-4 w-4 mr-2" />
                  <span className="text-sm font-semibold">
                    ¡Bonus! Al pagar con Mercado Pago participas automáticamente en nuestro premio especial adicional
                  </span>
                </div>
              </div>
              <button
                onClick={handleMercadoPagoSelect}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                Pagar con Mercado Pago
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        {/* WhatsApp */}
        <div
          className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
            selectedMethod === 'whatsapp'
              ? 'border-green-500 bg-green-50'
              : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
          }`}
          onClick={() => setSelectedMethod('whatsapp')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg mr-4">
                <MessageSquare className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">WhatsApp</h3>
                <p className="text-gray-600">Coordina tu pago por WhatsApp</p>
                <div className="text-sm text-gray-500 mt-1">
                  Te contactaremos para coordinar el pago
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 mb-1">Acepta:</div>
              <div className="text-xs text-gray-600">
                • Transferencia bancaria<br />
                • Depósito en efectivo<br />
                • Otros métodos
              </div>
            </div>
          </div>
          
          {selectedMethod === 'whatsapp' && (
            <div className="mt-4 pt-4 border-t border-green-200">
              <button
                onClick={handleWhatsAppPayment}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
              >
                Continuar por WhatsApp
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Botón cancelar */}
      <div className="flex justify-center">
        <button
          onClick={onCancel}
          className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          Cancelar compra
        </button>
      </div>

      {/* Información adicional */}
      <div className="mt-6 text-center text-sm text-gray-500">
        <p>
          Al continuar, aceptas los términos y condiciones del sorteo.
          <br />
          Tus boletos serán reservados por 3 horas.
        </p>
      </div>
    </div>
  );
};

export default PaymentMethodSelector;