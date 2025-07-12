import React from 'react';
import { Ticket } from '../utils/supabaseClient';

interface TicketCardProps {
  ticket: Ticket;
  selected: boolean;
  onSelect: (ticket: Ticket) => void;
  disabled?: boolean;
}

const TicketCard: React.FC<TicketCardProps> = ({
  ticket,
  selected,
  onSelect,
  disabled = false
}) => {
  const handleClick = () => {
    if (ticket.status === 'available' && !disabled) {
      onSelect(ticket);
    }
  };
  
  const getStatusClasses = () => {
    if (selected) {
      return 'bg-blue-500 border-blue-700 text-white shadow-md transform scale-105';
    }
    
    switch (ticket.status) {
      case 'available':
        return 'bg-white border-green-500 text-green-700 hover:bg-green-50';
      case 'reserved':
        return 'bg-gray-300 border-gray-400 text-gray-700 cursor-not-allowed';
      case 'purchased':
        return 'bg-green-500 border-green-700 text-white cursor-not-allowed';
      default:
        return 'bg-white border-gray-300';
    }
  };
  
  return (
    <div
      className={`
        border-2 rounded-lg p-2 text-center font-bold transition-all duration-200 ease-in-out
        ${getStatusClasses()}
        ${ticket.status === 'available' && !disabled ? 'cursor-pointer' : 'cursor-not-allowed'}
      `}
      onClick={handleClick}
    >
      <span className="text-lg">{ticket.number}</span>
    </div>
  );
};

export default TicketCard;