import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Ticket, CheckSquare, Home, User, LogIn, Gift } from 'lucide-react';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  
  const toggleMenu = () => setIsOpen(!isOpen);
  
  const navLinks = [
    { path: '/', label: 'Inicio', icon: <Home size={20} /> },
    { path: '/boletos', label: 'Boletos', icon: <Ticket size={20} /> },
    { path: '/verificar', label: 'Verificar', icon: <CheckSquare size={20} /> },
    { path: '/contacto', label: 'Contacto', icon: <User size={20} /> },
    { path: '/admin', label: 'Admin', icon: <LogIn size={20} /> },
    { path: '/admin/sorteos', label: 'Sorteos', icon: <Gift size={20} /> },
  ];
  
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-primary shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
              <img 
                src="https://cdn.shopify.com/s/files/1/0205/5752/9188/files/Logo-Terrapesca-01_205270e5-d546-4e33-a8d1-db0a91f1e554.png?v=1700262873"
                alt="Terrapesca"
                className="h-20 w-auto"
              />
            </Link>
          </div>
          
          {/* Desktop menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-6">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-6 py-3 rounded-lg text-lg font-semibold flex items-center space-x-2 transition-all transform hover:scale-105 ${
                    isActive(link.path)
                      ? 'bg-secondary text-white shadow-lg'
                      : 'text-white hover:bg-primary-light hover:shadow-md'
                  }`}
                >
                  {link.icon}
                  <span className="ml-2">{link.label}</span>
                </Link>
              ))}
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-3 rounded-lg text-white hover:text-white hover:bg-primary-light focus:outline-none"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <X size={32} /> : <Menu size={32} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-primary-dark">
          <div className="px-4 pt-3 pb-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`block px-6 py-4 rounded-lg text-lg font-semibold flex items-center space-x-3 transition-colors ${
                  isActive(link.path)
                    ? 'bg-secondary text-white shadow-lg'
                    : 'text-white hover:bg-primary-light'
                }`}
                onClick={() => setIsOpen(false)}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;