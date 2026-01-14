import React, { useEffect, useState } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { getLeaderboard, formatWalletAddress, UserPoints } from '../lib/points';

const Leaderboard: React.FC = () => {
  const { address } = useAccount();
  const chainId = useChainId();
  const [leaderboard, setLeaderboard] = useState<UserPoints[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState<number | null>(null);

  useEffect(() => {
    loadLeaderboard();
  }, [chainId]);

  const loadLeaderboard = async () => {
    setLoading(true);
    const data = await getLeaderboard(chainId, 20);
    setLeaderboard(data);

    if (address) {
      const rank = data.findIndex(
        (u) => u.wallet_address.toLowerCase() === address.toLowerCase()
      );
      setUserRank(rank >= 0 ? rank + 1 : null);
    }

    setLoading(false);
  };

  const getMedalIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `${rank}`;
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Platino':
        return 'text-gray-400';
      case 'Oro':
        return 'text-yellow-500';
      case 'Plata':
        return 'text-gray-400';
      default:
        return 'text-orange-500';
    }
  };

  if (loading) {
    return (
      <div className="app-card p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-theme-primary mb-6">🏆 Tabla de Clasificación</h2>
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-accent-primary"></div>
          <p className="text-theme-secondary mt-4">Cargando ranking...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-card p-6 sm:p-8">
      <h2 className="text-2xl font-bold text-theme-primary mb-2">🏆 Tabla de Clasificación</h2>
      <p className="text-theme-tertiary text-sm mb-6">Top 20 usuarios con más puntos en testnet</p>

      {userRank && (
        <div className="mb-6 p-4 bg-accent-primary/10 border border-accent-primary/20 rounded-xl">
          <p className="text-theme-primary text-center">
            <strong>Tu posición:</strong> #{userRank}
          </p>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-theme-light">
              <th className="text-left py-3 px-4 text-theme-secondary font-semibold text-sm">Rank</th>
              <th className="text-left py-3 px-4 text-theme-secondary font-semibold text-sm">Wallet</th>
              <th className="text-left py-3 px-4 text-theme-secondary font-semibold text-sm">Nivel</th>
              <th className="text-right py-3 px-4 text-theme-secondary font-semibold text-sm">Puntos</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-8 text-theme-tertiary">
                  No hay datos aún. ¡Sé el primero en ganar puntos!
                </td>
              </tr>
            ) : (
              leaderboard.map((user, index) => {
                const rank = index + 1;
                const isCurrentUser = address && user.wallet_address.toLowerCase() === address.toLowerCase();
                return (
                  <tr
                    key={user.id}
                    className={`border-b border-theme-light hover:bg-theme-secondary transition-colors ${
                      isCurrentUser ? 'bg-accent-primary/5' : ''
                    }`}
                  >
                    <td className="py-4 px-4">
                      <span className="text-lg font-bold text-theme-primary">
                        {getMedalIcon(rank)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`text-theme-primary ${isCurrentUser ? 'font-bold' : ''}`}>
                        {formatWalletAddress(user.wallet_address)}
                        {isCurrentUser && <span className="ml-2 text-accent-primary">(Tú)</span>}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`font-semibold ${getLevelColor(user.level)}`}>
                        {user.level}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="text-theme-primary font-bold">
                        {user.total_points.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 p-4 bg-theme-secondary rounded-xl border border-theme-light">
        <p className="text-xs text-theme-tertiary text-center">
          ⚠️ Los puntos son una métrica de participación. No garantizan un monto específico de airdrop.
        </p>
      </div>
    </div>
  );
};

export default Leaderboard;
