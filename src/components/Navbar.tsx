import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Home, User, LogIn } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();
  
  const toggleMenu = () => setIsOpen(!isOpen);
  
  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error('❌ Error checking auth in Navbar:', error);
          setIsAdmin(false);
          return;
        }
        setIsAdmin(!!data.session);
        console.log('🔐 Navbar auth check:', !!data.session);
      } catch (err) {
        console.error('❌ Exception in Navbar auth check:', err);
        setIsAdmin(false);
      }
    };
    
    checkAuth();
    
    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔄 Auth state change in Navbar:', event, !!session);
      setIsAdmin(!!session);
    });
    
    return () => {
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);
  
  const publicLinks = [
    { path: '/', label: 'Inicio', icon: <Home size={20} /> },
    { path: '/contacto', label: 'Contacto', icon: <User size={20} /> },
  ];
  
  const adminLink = { path: '/admin', label: 'Administración', icon: <LogIn size={20} /> };
  
  // Combine links based on auth status
  const navLinks = isAdmin ? [...publicLinks, adminLink] : publicLinks;
  
  const isActive = (path: string) => location.pathname === path;
  
  // Filter links based on admin status
  const filteredLinks = navLinks.filter(link => !link.adminOnly || isAdmin);

  return (
    <nav className="bg-primary shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center h-24 relative">
          <div className="absolute left-0">
            <Link to="/" className="flex-shrink-0">
              <img 
                src="https://cdn.shopify.com/s/files/1/0205/5752/9188/files/Logo-Terrapesca-01_205270e5-d546-4e33-a8d1-db0a91f1e554.png?v=1700262873"
                alt="Terrapesca"
                className="h-20 w-auto"
              />
            </Link>
          </div>
          
          {/* Desktop menu */}
          <div className="hidden md:block mx-auto">
            <div className="flex items-center space-x-6">  
              {filteredLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`block px-6 py-4 rounded-lg text-lg font-semibold flex items-center space-x-3 transition-colors ${
                    isActive(link.path)
                      ? link.path === '/' 
                        ? 'bg-red-500 text-white shadow-lg'
                        : 'bg-secondary text-white shadow-lg'
                      : link.path === '/'
                        ? 'text-white hover:bg-red-400'
                        : 'text-white hover:bg-primary-light'
                  }`}
                  title={link.label}
                >
                  {link.icon}
                  {link.path !== '/admin' && <span className="ml-2">{link.label}</span>}
                </Link>
              ))}
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden absolute right-0">
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
          <div className="px-4 pt-3 pb-4 flex flex-col space-y-2">
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