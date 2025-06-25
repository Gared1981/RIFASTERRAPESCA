import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Facebook, Instagram, Youtube, Home, Ticket, CheckSquare, User } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-primary text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <img 
              src="https://cdn.shopify.com/s/files/1/0205/5752/9188/files/Logo-Terrapesca-01_205270e5-d546-4e33-a8d1-db0a91f1e554.png?v=1700262873"
              alt="Terrapesca"
              className="h-16 w-auto mb-6"
            />
            <p className="text-accent mb-4">
              Más allá de cualquier ganancia económica, nuestra prioridad es fortalecer el bienestar, la credibilidad y el posicionamiento de nuestra marca entre quienes nos acompañan día a día.
            </p>
            <div className="flex justify-center space-x-4">
              <a href="https://www.facebook.com/Terrapesca" target="_blank" rel="noopener noreferrer" className="text-accent hover:text-white transition-colors">
                <Facebook size={24} />
                <span className="sr-only">Facebook</span>
              </a>
              <a href="https://www.instagram.com/terrapesca/" target="_blank" rel="noopener noreferrer" className="text-accent hover:text-white transition-colors">
                <Instagram size={24} />
                <span className="sr-only">Instagram</span>
              </a>
              <a href="https://www.youtube.com/@terrapesca" target="_blank" rel="noopener noreferrer" className="text-accent hover:text-white transition-colors">
                <Youtube size={24} />
                <span className="sr-only">YouTube</span>
              </a>
              <a href="https://www.tiktok.com/@terrapesca?is_from_webapp=1&sender_device=pc" target="_blank" rel="noopener noreferrer" className="text-accent hover:text-white transition-colors">
                <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
                <span className="sr-only">TikTok</span>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-4">Enlaces rápidos</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-accent hover:text-white transition-colors flex items-center">
                  <Home size={18} className="mr-2" />
                  Inicio
                </Link>
              </li>
              <li>
                <Link to="/boletos" className="text-accent hover:text-white transition-colors flex items-center">
                  <Ticket size={18} className="mr-2" />
                  Boletos
                </Link>
              </li>
              <li>
                <Link to="/verificar" className="text-accent hover:text-white transition-colors flex items-center">
                  <CheckSquare size={18} className="mr-2" />
                  Verificar Boleto
                </Link>
              </li>
              <li>
                <Link to="/contacto" className="text-accent hover:text-white transition-colors flex items-center">
                  <User size={18} className="mr-2" />
                  Contacto
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-4">Contacto</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin className="flex-shrink-0 mt-1 mr-3 text-secondary" size={20} />
                <span className="text-accent">Calle Niños Héroes 775, Colonia Bienestar, C.P. 81280, Los Mochis, Sinaloa, México</span>
              </li>
              <li className="flex items-center">
                <Phone className="flex-shrink-0 mr-3 text-secondary" size={20} />
                <span className="text-accent">+52 668 688 9571</span>
              </li>
              <li className="flex items-center">
                <Mail className="flex-shrink-0 mr-3 text-secondary" size={20} />
                <span className="text-accent">ventasweb@terrapesca.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-primary-light text-center text-sm text-accent">
          <p>© {new Date().getFullYear()} Sorteos Terrapesca. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;