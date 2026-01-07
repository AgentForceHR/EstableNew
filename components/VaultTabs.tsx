import React, { useState } from 'react';

type Country = 'chile' | 'mexico' | 'argentina';

interface VaultData {
  country: string;
  flag: string;
  token: string;
  tokenSymbol: string;
  apy: string;
  tvl: string;
  protocol: string;
  description: string;
}

const vaultData: Record<Country, VaultData> = {
  chile: {
    country: 'Chile',
    flag: '🇨🇱',
    token: 'USDC',
    tokenSymbol: '💵',
    apy: '14.9%',
    tvl: '$5.2M',
    protocol: 'Spark.fi',
    description: 'Vault optimizado para usuarios chilenos con USDC'
  },
  mexico: {
    country: 'México',
    flag: '🇲🇽',
    token: 'USDT',
    tokenSymbol: '💵',
    apy: '16.2%',
    tvl: '$9.8M',
    protocol: 'Steakhouse USDT',
    description: 'Vault optimizado para usuarios mexicanos con USDT'
  },
  argentina: {
    country: 'Argentina',
    flag: '🇦🇷',
    token: 'DAI',
    tokenSymbol: '💰',
    apy: '17.8%',
    tvl: '$7.3M',
    protocol: 'sDAI MetaMorpho',
    description: 'Vault optimizado para usuarios argentinos con DAI'
  }
};

const VaultTabs: React.FC = () => {
  const [activeCountry, setActiveCountry] = useState<Country>('chile');
  const activeVault = vaultData[activeCountry];

  return (
    <section className="py-12 md:py-20 px-4 md:px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3 md:mb-4">Vaults por País</h2>
          <p className="text-brand-gray text-sm md:text-lg max-w-2xl mx-auto px-2">
            Selecciona tu país para ver el vault optimizado con los mejores rendimientos
          </p>
        </div>

        <div className="flex justify-center mb-6 md:mb-8 border-b border-white/10 overflow-x-auto">
          <div className="flex gap-4 md:gap-8 min-w-max px-2">
            <button
              onClick={() => setActiveCountry('chile')}
              className={`pb-3 md:pb-4 px-4 md:px-6 text-base md:text-lg font-semibold transition-all relative min-h-[44px] ${
                activeCountry === 'chile'
                  ? 'text-brand-green'
                  : 'text-brand-gray hover:text-brand-light'
              }`}
            >
              <span className="text-2xl md:text-3xl block mb-1 md:mb-2">🇨🇱</span>
              Chile
              {activeCountry === 'chile' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-green"></div>
              )}
            </button>

            <button
              onClick={() => setActiveCountry('mexico')}
              className={`pb-3 md:pb-4 px-4 md:px-6 text-base md:text-lg font-semibold transition-all relative min-h-[44px] ${
                activeCountry === 'mexico'
                  ? 'text-brand-green'
                  : 'text-brand-gray hover:text-brand-light'
              }`}
            >
              <span className="text-2xl md:text-3xl block mb-1 md:mb-2">🇲🇽</span>
              México
              {activeCountry === 'mexico' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-green"></div>
              )}
            </button>

            <button
              onClick={() => setActiveCountry('argentina')}
              className={`pb-3 md:pb-4 px-4 md:px-6 text-base md:text-lg font-semibold transition-all relative min-h-[44px] ${
                activeCountry === 'argentina'
                  ? 'text-brand-green'
                  : 'text-brand-gray hover:text-brand-light'
              }`}
            >
              <span className="text-2xl md:text-3xl block mb-1 md:mb-2">🇦🇷</span>
              Argentina
              {activeCountry === 'argentina' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-green"></div>
              )}
            </button>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-4 md:p-6 rounded-2xl hover:border-brand-green/50 transition-all">
            <div className="flex flex-col sm:flex-row items-start justify-between mb-4 md:mb-6 gap-4">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-brand-green/20 rounded-full flex items-center justify-center text-2xl md:text-3xl">
                  {activeVault.tokenSymbol}
                </div>
                <div>
                  <h3 className="text-lg md:text-2xl font-bold flex items-center gap-2">
                    <span className="text-2xl md:text-3xl">{activeVault.flag}</span>
                    {activeVault.country} {activeVault.token}
                  </h3>
                  <p className="text-brand-gray text-xs md:text-sm">{activeVault.protocol}</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs md:text-sm bg-brand-green/20 text-brand-green whitespace-nowrap">
                Bajo Riesgo
              </span>
            </div>

            <p className="text-brand-gray text-sm md:text-base mb-4 md:mb-6">{activeVault.description}</p>

            <div className="grid grid-cols-2 gap-3 md:gap-4 mb-4 md:mb-6">
              <div className="bg-brand-dark/50 p-3 md:p-4 rounded-xl">
                <div className="text-xs md:text-sm text-brand-gray mb-1">APY Actual</div>
                <div className="text-2xl md:text-3xl font-bold text-brand-green">{activeVault.apy}</div>
              </div>
              <div className="bg-brand-dark/50 p-3 md:p-4 rounded-xl">
                <div className="text-xs md:text-sm text-brand-gray mb-1">Valor Total Bloqueado</div>
                <div className="text-2xl md:text-3xl font-bold text-brand-light">{activeVault.tvl}</div>
              </div>
            </div>

            <div className="bg-brand-dark/50 p-3 md:p-4 rounded-xl mb-4 md:mb-6">
              <div className="flex items-center justify-between text-xs md:text-sm mb-2">
                <span className="text-brand-gray">Red</span>
                <span className="font-semibold">Base Network</span>
              </div>
              <div className="flex items-center justify-between text-xs md:text-sm mb-2">
                <span className="text-brand-gray">Comisión de Rendimiento</span>
                <span className="font-semibold">15%</span>
              </div>
              <div className="flex items-center justify-between text-xs md:text-sm">
                <span className="text-brand-gray">Depósito Mínimo</span>
                <span className="font-semibold">$100 USD</span>
              </div>
            </div>

            <button className="w-full bg-brand-green hover:bg-brand-green/90 text-brand-dark font-semibold py-3 md:py-4 min-h-[44px] rounded-xl transition-all text-base md:text-lg">
              Depositar {activeVault.token}
            </button>

            <div className="mt-4 flex items-center gap-2 text-xs text-brand-gray justify-center">
              <span>🔒</span>
              <span>Protegido por Morpho Blue en Base Network</span>
            </div>
          </div>

          <div className="mt-6 md:mt-8 bg-white/5 backdrop-blur-xl border border-white/10 p-4 md:p-6 rounded-2xl">
            <div className="flex items-start gap-3">
              <span className="text-xl md:text-2xl">💡</span>
              <div>
                <h4 className="font-semibold text-brand-green mb-2 text-sm md:text-base">¿Por qué este vault?</h4>
                <ul className="text-xs md:text-sm text-brand-gray space-y-2">
                  {activeCountry === 'chile' && (
                    <>
                      <li>• USDC es la stablecoin más líquida en Chile</li>
                      <li>• Integración directa con exchanges chilenos</li>
                      <li>• Spark.fi ofrece los mejores rendimientos en USDC</li>
                    </>
                  )}
                  {activeCountry === 'mexico' && (
                    <>
                      <li>• USDT es la stablecoin preferida en México</li>
                      <li>• Mayor volumen de trading en pesos mexicanos</li>
                      <li>• Steakhouse optimiza rendimientos institucionales</li>
                    </>
                  )}
                  {activeCountry === 'argentina' && (
                    <>
                      <li>• DAI popular por su descentralización</li>
                      <li>• Mejor opción ante restricciones cambiarias</li>
                      <li>• sDAI ofrece rendimientos del DSR + Morpho</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VaultTabs;
