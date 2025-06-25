import React from 'react';
import { Link } from 'react-router-dom';
import { XCircle, ArrowLeft, RefreshCw, MessageSquare } from 'lucide-react';
import Footer from '../components/Footer';

const PaymentFailurePage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-red-500 px-6 py-8 text-center">
              <XCircle className="h-16 w-16 text-white mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-white mb-2">
                Pago No Procesado
              </h1>
              <p className="text-red-100">
                Hubo un problema al procesar tu pago
              </p>
            </div>

            {/* Content */}
            <div className="px-6 py-8">
              <div className="text-center mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  ¿Qué pasó?
                </h2>
                <p className="text-gray-600 mb-6">
                  Tu pago no pudo ser procesado. Esto puede deberse a varios motivos como 
                  fondos insuficientes, problemas con la tarjeta, o una interrupción en la conexión.
                </p>
              </div>

              {/* Possible Reasons */}
              <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Posibles causas:
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    Fondos insuficientes en la cuenta o tarjeta
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    Datos de la tarjeta incorrectos o vencida
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    Límites de transacción excedidos
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    Problemas temporales con el banco o procesador
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">•</span>
                    Interrupción en la conexión a internet
                  </li>
                </ul>
              </div>

              {/* Actions */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">
                  ¿Qué puedes hacer?
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Link
                    to="/boletos"
                    className="flex items-center justify-center bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Intentar de nuevo
                  </Link>
                  
                  <a
                    href="https://wa.me/526686889571?text=Hola,%20tuve%20problemas%20con%20el%20pago%20de%20mis%20boletos.%20¿Pueden%20ayudarme?"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Contactar soporte
                  </a>
                </div>

                <Link
                  to="/"
                  className="flex items-center justify-center text-gray-600 hover:text-gray-800 py-2"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Volver al inicio
                </Link>
              </div>
            </div>
          </div>

          {/* Help Section */}
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="font-semibold text-yellow-800 mb-2">
              💡 Consejos para un pago exitoso
            </h3>
            <ul className="text-yellow-700 text-sm space-y-1">
              <li>• Verifica que tu tarjeta tenga fondos suficientes</li>
              <li>• Asegúrate de que los datos de la tarjeta sean correctos</li>
              <li>• Usa una conexión a internet estable</li>
              <li>• Si el problema persiste, intenta con otro método de pago</li>
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PaymentFailurePage;