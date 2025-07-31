import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ErrorBoundary } from 'react-error-boundary';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import TicketsPage from './pages/TicketsPage';
import VerifyPage from './pages/VerifyPage';
import ContactPage from './pages/ContactPage';
import AdminPage from './pages/AdminPage';
import RafflePage from './pages/RafflePage';
import RafflesListPage from './pages/RafflesListPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentFailurePage from './pages/PaymentFailurePage';
import ManualUsuarioPage from './pages/ManualUsuarioPage';
import ManualPromotoresPage from './pages/ManualPromotoresPage';

function ErrorFallback({error, resetErrorBoundary}: {error: Error, resetErrorBoundary: () => void}) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <div className="text-red-500 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          ¡Oops! Algo salió mal
        </h2>
        <p className="text-gray-600 mb-6">
          Ha ocurrido un error inesperado. Por favor, intenta recargar la página.
        </p>
        <div className="space-y-3">
          <button
            onClick={resetErrorBoundary}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Intentar de nuevo
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Ir al inicio
          </button>
        </div>
        <details className="mt-4 text-left">
          <summary className="text-sm text-gray-500 cursor-pointer">Detalles técnicos</summary>
          <pre className="text-xs text-gray-400 mt-2 bg-gray-50 p-2 rounded overflow-auto">
            {error.message}
          </pre>
        </details>
      </div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Router>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Navbar />
          <div className="flex-grow">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/boletos" element={<TicketsPage />} />
              <Route path="/verificar" element={<VerifyPage />} />
              <Route path="/contacto" element={<ContactPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/sorteos" element={<RafflesListPage />} />
              <Route path="/sorteo/:slug" element={<RafflePage />} />
              <Route path="/payment/success" element={<PaymentSuccessPage />} />
              <Route path="/payment/failure" element={<PaymentFailurePage />} />
              <Route path="/payment/pending" element={<PaymentSuccessPage />} />
              <Route path="/manual-usuario" element={<ManualUsuarioPage />} />
              <Route path="/manual-promotores" element={<ManualPromotoresPage />} />
            </Routes>
          </div>
          <Toaster position="top-right" />
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;