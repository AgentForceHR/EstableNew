import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';

const Hero: React.FC = () => {
  const [stats, setStats] = useState({
    maxAPY: 15,
    totalTVL: 0,
    userCount: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const vaults = await api.fetchVaults();
      const maxAPY = Math.max(...vaults.map(v => v.max_apy));
      const totalTVL = vaults.reduce((sum, v) => sum + v.total_value_locked, 0);

      setStats({
        maxAPY: Math.round(maxAPY),
        totalTVL,
        userCount: 0
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const formatTVL = (tvl: number) => {
    if (tvl >= 1000000) {
      return `$${(tvl / 1000000).toFixed(1)}M`;
    }
    if (tvl >= 1000) {
      return `$${(tvl / 1000).toFixed(0)}K`;
    }
    return 'Lanzamiento';
  };

  const scrollToVaults = () => {
    document.getElementById('vaults')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="pt-24 sm:pt-32 pb-12 sm:pb-20 px-4 sm:px-6 bg-gradient-to-b from-theme-secondary to-theme-primary">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center animate-fade-in-up">
          <div className="inline-flex items-center gap-2 bg-accent-primary/10 border border-accent-primary/30 px-3 sm:px-5 py-2 sm:py-2.5 rounded-full mb-6 sm:mb-8">
            <svg className="w-4 h-4 text-accent-primary" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-accent-primary text-xs sm:text-sm font-semibold">Seguro y Auditado · Morpho Blue + Spark.fi</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight text-theme-primary">
            Rendimientos Seguros
            <span className="block text-accent-primary mt-2">en Dólares Digitales</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-theme-secondary max-w-3xl mx-auto mb-8 sm:mb-10 leading-relaxed px-2">
            Proteja sus ahorros de la inflación con rendimientos estables de hasta <strong className="text-theme-primary">{stats.maxAPY}% APY</strong> en USDC, USDT y DAI.
            Solución confiable para inversores en LATAM.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-12 sm:mb-16">
            <button
              onClick={scrollToVaults}
              className="w-full sm:w-auto bg-accent-primary hover:bg-accent-hover text-white font-semibold px-8 sm:px-10 py-3 sm:py-4 rounded-lg text-base sm:text-lg transition-all shadow-theme-md hover:shadow-theme-lg min-h-[44px]"
            >
              Comenzar Ahora
            </button>
            <a
              href="#como-funciona"
              className="w-full sm:w-auto border-2 border-theme-medium text-theme-primary hover:bg-theme-secondary font-semibold px-8 sm:px-10 py-3 sm:py-4 rounded-lg text-base sm:text-lg transition-all min-h-[44px]"
            >
              Más Información
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-theme-card p-6 sm:p-8 rounded-2xl border border-theme-light hover:border-accent-primary/50 transition-all shadow-theme-md hover:shadow-theme-lg">
              <div className="text-3xl sm:text-4xl font-bold text-accent-primary mb-2">Hasta {stats.maxAPY}%</div>
              <div className="text-base sm:text-lg text-theme-secondary font-medium mb-1">Rendimiento Anual</div>
              <div className="text-sm text-theme-tertiary">
                En dólares digitales estables
              </div>
            </div>
            <div className="bg-theme-card p-6 sm:p-8 rounded-2xl border border-theme-light hover:border-accent-primary/50 transition-all shadow-theme-md hover:shadow-theme-lg">
              <div className="text-3xl sm:text-4xl font-bold text-accent-primary mb-2">{formatTVL(stats.totalTVL)}</div>
              <div className="text-base sm:text-lg text-theme-secondary font-medium mb-1">Valor Custodiado</div>
              <div className="text-sm text-theme-tertiary">
                En vaults auditadas
              </div>
            </div>
            <div className="bg-theme-card p-6 sm:p-8 rounded-2xl border border-theme-light hover:border-accent-primary/50 transition-all shadow-theme-md hover:shadow-theme-lg">
              <div className="text-3xl sm:text-4xl font-bold text-accent-primary mb-2">Base L2</div>
              <div className="text-base sm:text-lg text-theme-secondary font-medium mb-1">Red Ethereum</div>
              <div className="text-sm text-theme-tertiary">
                Transacciones económicas y rápidas
              </div>
            </div>
          </div>

          <div className="mt-8 sm:mt-12 bg-theme-card border border-accent-primary/20 p-4 sm:p-6 rounded-2xl shadow-theme-md">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 sm:gap-4 text-center md:text-left">
                <div className="w-12 h-12 bg-accent-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-theme-primary text-sm sm:text-base">Pruebe en Testnet</p>
                  <p className="text-sm text-theme-secondary">Experimente todas las funciones sin riesgo</p>
                </div>
              </div>
              <Link
                to="/testnet"
                className="w-full md:w-auto bg-accent-primary hover:bg-accent-hover text-white font-semibold px-6 py-3 rounded-lg transition-all whitespace-nowrap min-h-[44px] flex items-center justify-center"
              >
                Ir a Testnet
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
