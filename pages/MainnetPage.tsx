import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Vaults from '../components/Vaults';

const MainnetPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-theme-primary font-sans">
      <Header />
      <main>
        <section className="py-20 px-6">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h1 className="text-5xl font-bold mb-4 text-theme-primary">Base Network Vaults</h1>
              <p className="text-theme-tertiary text-lg max-w-2xl mx-auto">
                Genera rendimientos estables con stablecoins en la red Base usando Morpho Blue y Spark.fi
              </p>
              <div className="mt-6 inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-4 py-2 rounded-lg">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span className="text-green-400 text-sm font-semibold">Base Mainnet - Producción</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-theme-card border border-theme-light rounded-xl p-6">
                <div className="text-3xl mb-3">🔒</div>
                <h3 className="text-xl font-bold mb-2">Seguro</h3>
                <p className="text-theme-tertiary text-sm">
                  Contratos auditados con timelock de 48 horas para máxima seguridad
                </p>
              </div>
              <div className="bg-theme-card border border-theme-light rounded-xl p-6">
                <div className="text-3xl mb-3">📈</div>
                <h3 className="text-xl font-bold mb-2">Optimizado</h3>
                <p className="text-theme-tertiary text-sm">
                  Rebalanceo automático entre Morpho Blue y Spark.fi para maximizar rendimientos
                </p>
              </div>
              <div className="bg-theme-card border border-theme-light rounded-xl p-6">
                <div className="text-3xl mb-3">💰</div>
                <h3 className="text-xl font-bold mb-2">Rendimientos</h3>
                <p className="text-theme-tertiary text-sm">
                  Hasta 15% APY en stablecoins con gestión profesional
                </p>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6 mb-12">
              <div className="flex items-start gap-4">
                <span className="text-2xl">ℹ️</span>
                <div>
                  <h4 className="font-semibold text-blue-400 mb-2">Red Base Mainnet</h4>
                  <p className="text-theme-tertiary text-sm mb-3">
                    Estás utilizando la red Base Mainnet. Asegúrate de tener tokens reales (USDC, USDT, DAI) para depositar en los vaults.
                  </p>
                  <p className="text-theme-tertiary text-sm">
                    Para probar sin riesgo, visita nuestra <Link to="/testnet" className="text-accent-primary hover:underline">página de testnet</Link>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <Vaults />
      </main>
      <Footer />
    </div>
  );
};

export default MainnetPage;
