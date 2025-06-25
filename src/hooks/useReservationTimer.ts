import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

/**
 * Custom hook to handle ticket reservation timing
 * @param ticketIds Array of ticket IDs that are currently reserved
 * @param reservationTimeMinutes Time in minutes before reservation expires
 * @returns Object with time remaining and function to clear reservation
 */
export function useReservationTimer(ticketIds: number[], reservationTimeMinutes = 180) {
  const [timeRemaining, setTimeRemaining] = useState<number>(reservationTimeMinutes * 60);
  const [isActive, setIsActive] = useState<boolean>(ticketIds.length > 0);

  // Format time as MM:SS
  const formattedTime = () => {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Release tickets if time expires
  const releaseTickets = async () => {
    if (ticketIds.length === 0) return;
    
    try {
      const { error } = await supabase
        .from('tickets')
        .update({ 
          status: 'available',
          user_id: null,
          reserved_at: null
        })
        .in('id', ticketIds);
      
      if (error) throw error;
      setIsActive(false);
    } catch (error) {
      console.error('Error releasing tickets:', error);
    }
  };

  useEffect(() => {
    // Start timer when tickets are reserved
    if (ticketIds.length > 0) {
      setIsActive(true);
      setTimeRemaining(reservationTimeMinutes * 60);
    } else {
      setIsActive(false);
    }
  }, [ticketIds, reservationTimeMinutes]);

  useEffect(() => {
    let interval: number | undefined;
    
    if (isActive && timeRemaining > 0) {
      interval = window.setInterval(() => {
        setTimeRemaining((time) => time - 1);
      }, 1000);
    } else if (timeRemaining === 0) {
      releaseTickets();
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeRemaining]);

  return {
    timeRemaining,
    formattedTime: formattedTime(),
    isActive,
    releaseTickets
  };
}