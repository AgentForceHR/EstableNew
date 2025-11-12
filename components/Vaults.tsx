import React from 'react';

const Vaults: React.FC = () => {
  const vaults = [
    {
      name: 'USDC Vault',
      apy: '15%',
      tvl: '$25M',
      risk: 'Bajo',
      protocol: 'Aave V3'
    },
    {
      name: 'USDT Vault',
      apy: '16%',
      tvl: '$18M',
      risk: 'Bajo',
      protocol: 'Compound'
    },
    {
      name: 'Multi-Strategy',
      apy: '18%',
      tvl: '$12M',
      risk: 'Medio',
      protocol: 'Múltiples'
    }
  ];

  return (
    <section id="vaults" className="py-20 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Vaults Disponibles</h2>
          <p className="text-brand-gray text-lg max-w-2xl mx-auto">
            Elige el vault que mejor se adapte a tu perfil de riesgo
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {vaults.map((vault, index) => (
            <div key={index} className="bg-brand-card rounded-xl border border-brand-gray/20 p-8 hover:border-brand-green/50 transition-all">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-2xl font-bold">{vault.name}</h3>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  vault.risk === 'Bajo' ? 'bg-brand-green/20 text-brand-green' : 'bg-yellow-500/20 text-yellow-500'
                }`}>
                  {vault.risk}
                </span>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between">
                  <span className="text-brand-gray">APY</span>
                  <span className="text-brand-green font-bold text-xl">{vault.apy}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-gray">TVL</span>
                  <span className="font-semibold">{vault.tvl}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-gray">Protocolo</span>
                  <span className="font-semibold">{vault.protocol}</span>
                </div>
              </div>

              <button className="w-full bg-brand-green hover:bg-brand-green/90 text-brand-dark font-semibold py-3 rounded-lg transition-all">
                Depositar
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Vaults;
