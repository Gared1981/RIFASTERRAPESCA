import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Gift, Package } from 'lucide-react';

interface CollapsiblePrizeListProps {
  items: string[];
  title?: string;
  maxInitialItems?: number;
  className?: string;
}

const CollapsiblePrizeList: React.FC<CollapsiblePrizeListProps> = ({
  items,
  title = "¿Qué incluye el premio?",
  maxInitialItems = 8,
  className = ""
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Filtrar items vacíos para el conteo
  const nonEmptyItems = items.filter(item => item.trim() !== '');
  const shouldShowToggle = nonEmptyItems.length > maxInitialItems;
  
  // Determinar qué items mostrar
  const visibleItems = isExpanded ? items : items.slice(0, maxInitialItems);
  const hiddenItemsCount = nonEmptyItems.length - maxInitialItems;

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-100 ${className}`}>
      <div className="flex items-center mb-4">
        <Gift className="h-6 w-6 text-green-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      
      <div className="space-y-2">
        {visibleItems.map((item, index) => {
          // Si el item está vacío, renderizar un separador
          if (item.trim() === '') {
            return <div key={index} className="h-2"></div>;
          }
          
          // Determinar si es un título principal (empieza con emoji y está en mayúsculas)
          const isMainTitle = /^[🎯🌊💡🐠🐟⚡🧲🛸🔱🌀🐬🛶💰🎣🏆🎁⭐🔥💎🌟]/.test(item) && 
                             !item.startsWith('•') && 
                             (item.length > 10 && item.slice(2, 12).toUpperCase() === item.slice(2, 12));
          
          // Determinar si es un sub-item (empieza con •)
          const isSubItem = item.startsWith('•');
          
          return (
            <div 
              key={index} 
              className={`flex items-start transition-all duration-200 ${
                isMainTitle 
                  ? 'font-bold text-green-800 text-base mt-3 first:mt-0' 
                  : isSubItem 
                    ? 'text-gray-700 text-sm ml-4' 
                    : 'text-gray-700'
              }`}
            >
              {isMainTitle && (
                <Package className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
              )}
              <span className="leading-relaxed">{item}</span>
            </div>
          );
        })}
      </div>
      
      {shouldShowToggle && (
        <div className="mt-6 pt-4 border-t border-green-200">
          <button
            onClick={toggleExpanded}
            className="w-full flex items-center justify-center px-4 py-3 bg-white border border-green-300 rounded-lg text-green-700 font-medium hover:bg-green-50 hover:border-green-400 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-5 w-5 mr-2" />
                Ver menos
              </>
            ) : (
              <>
                <ChevronDown className="h-5 w-5 mr-2" />
                Ver {hiddenItemsCount} artículos más
              </>
            )}
          </button>
          
          {!isExpanded && (
            <div className="mt-2 text-center">
              <span className="text-xs text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200">
                +{hiddenItemsCount} artículos adicionales
              </span>
            </div>
          )}
        </div>
      )}
      
      {/* Contador total de artículos */}
      <div className="mt-4 pt-3 border-t border-green-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Total de artículos:</span>
          <span className="font-semibold text-green-700">{nonEmptyItems.length}</span>
        </div>
      </div>
    </div>
  );
};

export default CollapsiblePrizeList;