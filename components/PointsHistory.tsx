import React, { useEffect, useState } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { getPointActions, PointAction } from '../lib/points';

const PointsHistory: React.FC = () => {
  const { address } = useAccount();
  const chainId = useChainId();
  const [actions, setActions] = useState<PointAction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (address) {
      loadActions();
    }
  }, [address, chainId]);

  const loadActions = async () => {
    if (!address) return;
    setLoading(true);
    const data = await getPointActions(address, chainId);
    setActions(data);
    setLoading(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getActionIcon = (actionType: string) => {
    if (actionType.includes('deposit')) return '💰';
    if (actionType.includes('withdraw')) return '💸';
    if (actionType.includes('share') || actionType.includes('like') || actionType.includes('repost')) return '📢';
    if (actionType.includes('bonus') || actionType.includes('first')) return '🎁';
    return '⭐';
  };

  if (!address) {
    return (
      <div className="app-card p-6 sm:p-8 text-center">
        <p className="text-theme-secondary">Conecta tu wallet para ver tu historial de puntos</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="app-card p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-theme-primary mb-6">📊 Historial de Puntos</h2>
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-accent-primary"></div>
          <p className="text-theme-secondary mt-4">Cargando historial...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-card p-6 sm:p-8">
      <h2 className="text-2xl font-bold text-theme-primary mb-6">📊 Historial de Puntos</h2>

      {actions.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-theme-secondary mb-4">Aún no has ganado puntos</p>
          <p className="text-theme-tertiary text-sm">Usa los vaults o comparte en redes sociales para empezar a ganar puntos</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-theme-light">
                <th className="text-left py-3 px-4 text-theme-secondary font-semibold text-sm">Fecha</th>
                <th className="text-left py-3 px-4 text-theme-secondary font-semibold text-sm">Acción</th>
                <th className="text-right py-3 px-4 text-theme-secondary font-semibold text-sm">Puntos</th>
              </tr>
            </thead>
            <tbody>
              {actions.map((action) => (
                <tr key={action.id} className="border-b border-theme-light hover:bg-theme-secondary transition-colors">
                  <td className="py-4 px-4 text-theme-tertiary text-sm whitespace-nowrap">
                    {formatDate(action.created_at)}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getActionIcon(action.action_type)}</span>
                      <span className="text-theme-primary">{action.action_label}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="text-accent-primary font-bold">+{action.points}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PointsHistory;
