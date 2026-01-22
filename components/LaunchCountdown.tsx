import React, { useState, useEffect } from 'react';

const LaunchCountdown: React.FC = () => {
  const launchDate = new Date('2026-01-29T00:00:00').getTime();

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = launchDate - now;

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [launchDate]);

  return (
    <div className="py-12 bg-gradient-to-r from-accent-primary/10 via-theme-primary to-accent-primary/10 border-y border-theme-border">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-accent-primary"></div>
          <span className="text-accent-primary font-semibold text-sm uppercase tracking-wider">
            Launching Soon
          </span>
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-accent-primary"></div>
        </div>

        <h2 className="text-2xl md:text-3xl font-bold text-theme-primary mb-8">
          Mainnet Goes Live In
        </h2>

        <div className="grid grid-cols-4 gap-4 md:gap-6 max-w-2xl mx-auto">
          <div className="bg-theme-secondary rounded-lg p-4 md:p-6 shadow-theme-md border border-theme-border">
            <div className="text-3xl md:text-4xl font-bold text-accent-primary mb-1">
              {String(timeLeft.days).padStart(2, '0')}
            </div>
            <div className="text-xs md:text-sm text-theme-tertiary uppercase tracking-wide">
              Days
            </div>
          </div>

          <div className="bg-theme-secondary rounded-lg p-4 md:p-6 shadow-theme-md border border-theme-border">
            <div className="text-3xl md:text-4xl font-bold text-accent-primary mb-1">
              {String(timeLeft.hours).padStart(2, '0')}
            </div>
            <div className="text-xs md:text-sm text-theme-tertiary uppercase tracking-wide">
              Hours
            </div>
          </div>

          <div className="bg-theme-secondary rounded-lg p-4 md:p-6 shadow-theme-md border border-theme-border">
            <div className="text-3xl md:text-4xl font-bold text-accent-primary mb-1">
              {String(timeLeft.minutes).padStart(2, '0')}
            </div>
            <div className="text-xs md:text-sm text-theme-tertiary uppercase tracking-wide">
              Minutes
            </div>
          </div>

          <div className="bg-theme-secondary rounded-lg p-4 md:p-6 shadow-theme-md border border-theme-border">
            <div className="text-3xl md:text-4xl font-bold text-accent-primary mb-1">
              {String(timeLeft.seconds).padStart(2, '0')}
            </div>
            <div className="text-xs md:text-sm text-theme-tertiary uppercase tracking-wide">
              Seconds
            </div>
          </div>
        </div>

        <p className="mt-6 text-theme-tertiary text-sm">
          Be ready for our mainnet launch on Base
        </p>
      </div>
    </div>
  );
};

export default LaunchCountdown;
