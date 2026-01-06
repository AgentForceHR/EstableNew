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
    <section className="py-20 px-6 bg-theme-primary">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-theme-primary">Protege tu Dinero de la Inflación</h2>
          <p className="text-theme-tertiary text-lg max-w-2xl mx-auto">
            Mientras la inflación destruye el valor de tus ahorros, genera rendimientos en Base Network con Morpho Blue y Spark.fi
          </p>
          <div className="mt-4 inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-lg shadow-theme-md">
            <span className="text-blue-400 text-sm font-semibold">Morpho Blue + Spark.fi on Base</span>
          </div>
        </div>

        <div className="bg-theme-card p-8 md:p-12 rounded-xl border border-theme-light shadow-theme-lg">
          <div className="space-y-6">
            {comparison.map((item, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-32 text-left">
                  <span className={`font-semibold ${item.color === 'bg-accent-primary' ? 'text-accent-primary' : 'text-theme-secondary'}`}>
                    {item.country}
                  </span>
                </div>
                <div className="flex-1 bg-theme-secondary rounded-full h-10 overflow-hidden relative border border-theme-light shadow-theme-md">
                  <div
                    className={`${item.color} h-full flex items-center justify-end px-4 transition-all duration-1000`}
                    style={{ width: item.country === 'Estable.app' ? '100%' : '80%' }}
                  >
                    <span className="font-bold text-white">{item.inflation}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 p-6 bg-accent-primary/10 border border-accent-primary/20 rounded-lg shadow-theme-md">
            <p className="text-center text-theme-primary mb-4 font-semibold">
              💡 Ejemplo con $10,000 USD:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center p-4 bg-theme-card rounded-lg border border-theme-light">
                <p className="text-red-400 font-bold text-xl mb-1">-$14,000</p>
                <p className="text-theme-tertiary">Pérdida en Argentina (140% inflación)</p>
              </div>
              <div className="text-center p-4 bg-theme-card rounded-lg border border-theme-light">
                <p className="text-accent-primary font-bold text-xl mb-1">+$1,500</p>
                <p className="text-theme-tertiary">Ganancia con Morpho Blue + Spark.fi (15% APY)</p>
              </div>
              <div className="text-center p-4 bg-theme-card rounded-lg border border-theme-light">
                <p className="text-accent-primary font-bold text-xl mb-1">$15,500</p>
                <p className="text-theme-tertiary">Diferencia total: <strong className="text-accent-primary">+$15,500</strong></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InflationComparison;
