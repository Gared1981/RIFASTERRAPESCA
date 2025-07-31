import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
  targetDate: string;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(targetDate) - +new Date();
      
      if (difference > 0) {
        setIsExpired(false);
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      } else {
        setIsExpired(true);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (isExpired) {
    return (
      <div className="text-center p-6 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-lg font-semibold text-red-800 mb-2">
          🏁 ¡Sorteo Finalizado!
        </h3>
        <p className="text-red-600">
          El tiempo para este sorteo ha terminado.
        </p>
      </div>
    );
  }

  return (
    <div className="flex gap-4 text-center">
      <div className="bg-white w-24 h-24 rounded-lg shadow-lg flex flex-col justify-center items-center transform transition-all hover:scale-105">
        <span className="text-3xl font-bold text-green-700 animate-pulse">
          {timeLeft.days}
        </span>
        <span className="text-sm text-gray-500">Días</span>
      </div>
      <div className="bg-white w-24 h-24 rounded-lg shadow-lg flex flex-col justify-center items-center transform transition-all hover:scale-105">
        <span className="text-3xl font-bold text-green-700 animate-pulse">
          {timeLeft.hours.toString().padStart(2, '0')}
        </span>
        <span className="text-sm text-gray-500">Horas</span>
      </div>
      <div className="bg-white w-24 h-24 rounded-lg shadow-lg flex flex-col justify-center items-center transform transition-all hover:scale-105">
        <span className="text-3xl font-bold text-green-700 animate-pulse">
          {timeLeft.minutes.toString().padStart(2, '0')}
        </span>
        <span className="text-sm text-gray-500">Minutos</span>
      </div>
      <div className="bg-white w-24 h-24 rounded-lg shadow-lg flex flex-col justify-center items-center transform transition-all hover:scale-105">
        <span className="text-3xl font-bold text-green-700 animate-pulse">
          {timeLeft.seconds.toString().padStart(2, '0')}
        </span>
        <span className="text-sm text-gray-500">Segundos</span>
      </div>
    </div>
  );
};

export default CountdownTimer;