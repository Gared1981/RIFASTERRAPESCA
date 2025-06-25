import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import TicketsPage from './pages/TicketsPage';
import VerifyPage from './pages/VerifyPage';
import ContactPage from './pages/ContactPage';
import AdminPage from './pages/AdminPage';
import RafflesPage from './pages/RafflesPage';
import RafflePage from './pages/RafflePage';
import RafflesListPage from './pages/RafflesListPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentFailurePage from './pages/PaymentFailurePage';

function App() {
  return (
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
            <Route path="/admin/sorteos" element={<RafflesPage />} />
            <Route path="/sorteos" element={<RafflesListPage />} />
            <Route path="/sorteo/:slug" element={<RafflePage />} />
            <Route path="/payment/success" element={<PaymentSuccessPage />} />
            <Route path="/payment/failure" element={<PaymentFailurePage />} />
            <Route path="/payment/pending" element={<PaymentSuccessPage />} />
          </Routes>
        </div>
        <Toaster position="top-right" />
      </div>
    </Router>
  );
}

export default App;