import React from 'react';
import { getLevelFromPoints, getNextLevelInfo } from '../lib/points';

interface PointsStatsProps {
  totalPoints: number;
}

const PointsStats: React.FC<PointsStatsProps> = ({ totalPoints }) => {
  const level = getLevelFromPoints(totalPoints);
  const { nextLevel, pointsNeeded } = getNextLevelInfo(totalPoints);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Platino':
        return 'from-gray-300 to-gray-500';
      case 'Oro':
        return 'from-yellow-300 to-yellow-600';
      case 'Plata':
        return 'from-gray-200 to-gray-400';
      default:
        return 'from-orange-400 to-orange-600';
    }
  };

  const getProgressPercentage = () => {
    if (totalPoints >= 5000) return 100;
    if (totalPoints >= 2000) return ((totalPoints - 2000) / 3000) * 100;
    if (totalPoints >= 500) return ((totalPoints - 500) / 1500) * 100;
    return (totalPoints / 500) * 100;
  };

  return (
    <div className="app-card p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br ${getLevelColor(level)} flex items-center justify-center shadow-theme-lg`}>
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
          <div>
            <h3 className="text-2xl sm:text-3xl font-bold text-theme-primary">{totalPoints.toLocaleString()}</h3>
            <p className="text-theme-tertiary text-sm">Puntos Totales</p>
          </div>
        </div>

        <div className="text-center">
          <div className={`inline-block px-6 py-3 rounded-full bg-gradient-to-r ${getLevelColor(level)} shadow-theme-md`}>
            <span className="text-white font-bold text-lg">{level}</span>
          </div>
        </div>
      </div>

      {nextLevel !== 'Máximo' && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-theme-secondary font-medium">Progreso a {nextLevel}</span>
            <span className="text-sm text-theme-tertiary">{pointsNeeded} puntos restantes</span>
          </div>
          <div className="w-full h-3 bg-theme-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-accent-primary to-accent-secondary transition-all duration-500"
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-accent-primary/10 border border-accent-primary/20 rounded-xl">
        <p className="text-sm text-theme-primary text-center">
          📌 <strong>Importante:</strong> Mientras más puntos acumules, mayor será tu prioridad/multiplicador en el airdrop cuando se lance el token.
        </p>
      </div>
    </div>
  );
};

export default PointsStats;
