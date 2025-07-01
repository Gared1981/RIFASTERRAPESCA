import React from 'react';
import { Shield } from 'lucide-react';

interface SecurePaymentBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showText?: boolean;
}

const SecurePaymentBadge: React.FC<SecurePaymentBadgeProps> = ({ 
  size = 'md', 
  className = '',
  showText = true 
}) => {
  const sizeClasses = {
    sm: 'h-12 md:h-14',
    md: 'h-16 md:h-20',
    lg: 'h-20 md:h-24'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      {showText && (
        <div className="flex items-center mb-2">
          <Shield className="h-4 w-4 text-terrapesca-green-600 mr-2" />
          <span className={`font-semibold text-terrapesca-blue-700 ${textSizeClasses[size]}`}>
            Pago 100% Seguro
          </span>
        </div>
      )}
      <div className="relative group">
        <img
          src="https://cdn.shopify.com/s/files/1/0205/5752/9188/files/pago-seguro-pizarronesplus-2023-768x217.png?v=1750993563"
          alt="Pago Seguro - Mercado Pago"
          className={`w-auto object-contain transition-transform duration-300 group-hover:scale-105 ${sizeClasses[size]}`}
          style={{
            filter: 'drop-shadow(0 4px 8px rgba(0, 59, 115, 0.1))',
            maxWidth: size === 'sm' ? '200px' : size === 'md' ? '250px' : '300px'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-terrapesca-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
      </div>
    </div>
  );
};

export default SecurePaymentBadge;