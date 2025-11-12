import React, { useEffect, useState } from 'react';
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
    <section className="pt-32 pb-20 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center animate-fade-in-up">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-full mb-6">
            <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
            <span className="text-blue-400 text-sm font-semibold">Powered by Morpho Blue + Spark.fi on Base</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Rendimientos Estables en
            <span className="block text-brand-green mt-2">Dólares Digitales</span>
          </h1>

          <p className="text-xl text-brand-gray max-w-2xl mx-auto mb-8">
            Genera hasta {stats.maxAPY}% APY con USDC, USDT y DAI en Morpho Blue y Spark.fi.
            Protege tus ahorros de la inflación en LATAM con DeFi seguro y auditado.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <button
              onClick={scrollToVaults}
              className="bg-brand-green hover:bg-brand-green/90 text-brand-dark font-semibold px-8 py-4 rounded-lg text-lg transition-all"
            >
              Comenzar Ahora
            </button>
            <a
              href="#como-funciona"
              className="border-2 border-brand-gray hover:border-brand-light text-brand-light font-semibold px-8 py-4 rounded-lg text-lg transition-all"
            >
              Cómo Funciona
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="bg-brand-card p-6 rounded-xl border border-brand-gray/20 hover:border-brand-green/50 transition-all">
              <div className="text-3xl font-bold text-brand-green mb-2">Hasta {stats.maxAPY}% APY</div>
              <div className="text-brand-gray">Rendimiento anual en dólares</div>
              <div className="text-xs text-brand-gray mt-2">
                Spark.fi USDC: 8-12% | Steakhouse USDT: 10-15%
              </div>
            </div>
            <div className="bg-brand-card p-6 rounded-xl border border-brand-gray/20 hover:border-brand-green/50 transition-all">
              <div className="text-3xl font-bold text-brand-green mb-2">{formatTVL(stats.totalTVL)}</div>
              <div className="text-brand-gray">Total Value Locked</div>
              <div className="text-xs text-brand-gray mt-2">
                Morpho Blue + Spark.fi integrations
              </div>
            </div>
            <div className="bg-brand-card p-6 rounded-xl border border-brand-gray/20 hover:border-brand-green/50 transition-all">
              <div className="text-3xl font-bold text-brand-green mb-2">Base L2</div>
              <div className="text-brand-gray">Network de bajas fees</div>
              <div className="text-xs text-brand-gray mt-2">
                Transacciones rápidas y económicas
              </div>
            </div>
          </div>

          <div className="mt-12 bg-gradient-to-r from-brand-green/10 to-blue-500/10 border border-brand-green/20 p-6 rounded-xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🎁</span>
                <div className="text-left">
                  <p className="font-semibold">Programa de Referidos</p>
                  <p className="text-sm text-brand-gray">Gana 5% de comisión por cada usuario que refiera</p>
                </div>
              </div>
              <a
                href="#referrals"
                className="bg-brand-green hover:bg-brand-green/90 text-brand-dark font-semibold px-6 py-3 rounded-lg transition-all whitespace-nowrap"
              >
                Crear Código
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
