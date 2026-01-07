import React from 'react';

const InflationComparison: React.FC = () => {
  const comparison = [
    { country: 'Argentina', inflation: '140%', color: 'bg-red-500', loss: '-$14,000' },
    { country: 'Venezuela', inflation: '400%', color: 'bg-red-600', loss: '-$40,000' },
    { country: 'México', inflation: '5.5%', color: 'bg-orange-500', loss: '-$550' },
    { country: 'Colombia', inflation: '11%', color: 'bg-orange-600', loss: '-$1,100' },
    { country: 'Morpho + Spark', inflation: '+15% APY', color: 'bg-accent-primary', loss: '+$1,500' }
  ];

  return (
    <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-theme-primary">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-10 sm:mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-theme-primary px-2">Protege tu Dinero de la Inflación</h2>
          <p className="text-theme-tertiary text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-2">
            Mientras la inflación destruye el valor de tus ahorros, genera rendimientos en Base Network con Morpho Blue y Spark.fi
          </p>
          <div className="mt-3 sm:mt-4 inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-3 sm:px-4 py-2 rounded-lg shadow-theme-md">
            <span className="text-blue-400 text-xs sm:text-sm font-semibold">Morpho Blue + Spark.fi on Base</span>
          </div>
        </div>

        <div className="bg-theme-card p-4 sm:p-6 md:p-8 lg:p-12 rounded-xl border border-theme-light shadow-theme-lg">
          <div className="space-y-4 sm:space-y-6">
            {comparison.map((item, index) => (
              <div key={index} className="flex items-center gap-2 sm:gap-4">
                <div className="w-24 sm:w-32 text-left flex-shrink-0">
                  <span className={`font-semibold text-xs sm:text-sm md:text-base ${item.color === 'bg-accent-primary' ? 'text-accent-primary' : 'text-theme-secondary'}`}>
                    {item.country}
                  </span>
                </div>
                <div className="flex-1 bg-theme-secondary rounded-full h-10 sm:h-10 overflow-hidden relative border border-theme-light shadow-theme-md min-h-[44px]">
                  <div
                    className={`${item.color} h-full flex items-center justify-end px-2 sm:px-4 transition-all duration-1000`}
                    style={{ width: item.country === 'Estable.app' ? '100%' : '80%' }}
                  >
                    <span className="font-bold text-white text-xs sm:text-sm md:text-base">{item.inflation}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 sm:mt-10 md:mt-12 p-4 sm:p-6 bg-accent-primary/10 border border-accent-primary/20 rounded-lg shadow-theme-md">
            <p className="text-center text-theme-primary mb-3 sm:mb-4 font-semibold text-sm sm:text-base">
              💡 Ejemplo con $10,000 USD:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
              <div className="text-center p-3 sm:p-4 bg-theme-card rounded-lg border border-theme-light">
                <p className="text-red-400 font-bold text-lg sm:text-xl mb-1">-$14,000</p>
                <p className="text-theme-tertiary text-xs sm:text-sm">Pérdida en Argentina (140% inflación)</p>
              </div>
              <div className="text-center p-3 sm:p-4 bg-theme-card rounded-lg border border-theme-light">
                <p className="text-accent-primary font-bold text-lg sm:text-xl mb-1">+$1,500</p>
                <p className="text-theme-tertiary text-xs sm:text-sm">Ganancia con Morpho Blue + Spark.fi (15% APY)</p>
              </div>
              <div className="text-center p-3 sm:p-4 bg-theme-card rounded-lg border border-theme-light">
                <p className="text-accent-primary font-bold text-lg sm:text-xl mb-1">$15,500</p>
                <p className="text-theme-tertiary text-xs sm:text-sm">Diferencia total: <strong className="text-accent-primary">+$15,500</strong></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InflationComparison;
