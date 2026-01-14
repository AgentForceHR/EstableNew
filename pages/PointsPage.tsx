import React, { useEffect, useState } from 'react';
import { useAccount, useChainId } from 'wagmi';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PointsStats from '../components/PointsStats';
import PointsHistory from '../components/PointsHistory';
import SocialSharing from '../components/SocialSharing';
import Leaderboard from '../components/Leaderboard';
import { getUserPoints, POINT_VALUES } from '../lib/points';

const PointsPage: React.FC = () => {
  const { address } = useAccount();
  const chainId = useChainId();
  const [totalPoints, setTotalPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (address) {
      loadUserPoints();
    } else {
      setLoading(false);
    }
  }, [address, chainId]);

  const loadUserPoints = async () => {
    if (!address) return;
    setLoading(true);
    const userPoints = await getUserPoints(address, chainId);
    setTotalPoints(userPoints?.total_points || 0);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-theme-primary">
      <Header />

      <main className="flex-1 pt-20 sm:pt-24">
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-theme-primary mb-2">Sistema de Puntos</h1>
            <p className="text-theme-secondary">Gana puntos usando los vaults y compartiendo en redes sociales</p>
          </div>

          {!address ? (
            <div className="app-card p-8 sm:p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 bg-accent-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-accent-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-theme-primary mb-4">Conecta tu Wallet</h2>
                <p className="text-theme-secondary mb-6">
                  Para empezar a ganar puntos y participar en el programa de recompensas, conecta tu wallet.
                </p>
              </div>
            </div>
          ) : loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-accent-primary"></div>
              <p className="text-theme-secondary mt-4">Cargando datos...</p>
            </div>
          ) : (
            <div className="space-y-8">
              <PointsStats totalPoints={totalPoints} />

              <div className="app-card p-6 sm:p-8">
                <h2 className="text-2xl font-bold text-theme-primary mb-4">🎯 Cómo Ganar Puntos</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-theme-secondary rounded-xl border border-theme-light">
                    <h3 className="font-semibold text-theme-primary mb-2">💰 Usar los Vaults</h3>
                    <ul className="space-y-2 text-sm text-theme-tertiary">
                      <li>• Depósito: +{POINT_VALUES.DEPOSIT} puntos</li>
                      <li>• Retiro: +{POINT_VALUES.WITHDRAW} puntos</li>
                      <li>• Primera vez en cada vault: +{POINT_VALUES.FIRST_VAULT_BONUS} puntos bonus</li>
                      <li>• Primera transacción: +{POINT_VALUES.FIRST_TRANSACTION_BONUS} puntos bonus</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-theme-secondary rounded-xl border border-theme-light">
                    <h3 className="font-semibold text-theme-primary mb-2">📢 Compartir en Redes</h3>
                    <ul className="space-y-2 text-sm text-theme-tertiary">
                      <li>• Compartir en X: +{POINT_VALUES.SHARE_X} puntos</li>
                      <li>• Repost en X: +{POINT_VALUES.REPOST_X} puntos</li>
                      <li>• Like en X: +{POINT_VALUES.LIKE_X} puntos</li>
                      <li>• Compartir en Facebook: +{POINT_VALUES.SHARE_FACEBOOK} puntos</li>
                      <li>• Copiar link: +{POINT_VALUES.COPY_LINK} puntos</li>
                    </ul>
                  </div>
                </div>
              </div>

              <SocialSharing />

              <PointsHistory />

              <Leaderboard />
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PointsPage;
