import React from 'react';

const InflationComparison: React.FC = () => {
  const comparison = [
    { country: 'Argentina', inflation: '140%', color: 'bg-red-500', loss: '-$14,000' },
    { country: 'Venezuela', inflation: '400%', color: 'bg-red-600', loss: '-$40,000' },
    { country: 'México', inflation: '5.5%', color: 'bg-orange-500', loss: '-$550' },
    { country: 'Colombia', inflation: '11%', color: 'bg-orange-600', loss: '-$1,100' },
    { country: 'Morpho Base', inflation: '+15% APY', color: 'bg-brand-green', loss: '+$1,500' }
  ];

  return (
    <section className="py-20 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Protege tu Dinero de la Inflación</h2>
          <p className="text-brand-gray text-lg max-w-2xl mx-auto">
            Mientras la inflación destruye el valor de tus ahorros, genera rendimientos en Base Network con Morpho Blue
          </p>
          <div className="mt-4 inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-lg">
            <span className="text-blue-400 text-sm font-semibold">Vaults optimizados en Base L2</span>
          </div>
        </div>

        <div className="bg-brand-card p-8 md:p-12 rounded-xl border border-brand-gray/20">
          <div className="space-y-6">
            {comparison.map((item, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-32 text-left">
                  <span className={`font-semibold ${item.color === 'bg-brand-green' ? 'text-brand-green' : 'text-brand-light'}`}>
                    {item.country}
                  </span>
                </div>
                <div className="flex-1 bg-brand-dark rounded-full h-10 overflow-hidden relative">
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

          <div className="mt-12 p-6 bg-brand-green/10 border border-brand-green/20 rounded-lg">
            <p className="text-center text-brand-light mb-4">
              💡 <strong>Ejemplo con $10,000 USD:</strong>
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <p className="text-red-400 font-bold text-xl">-$14,000</p>
                <p className="text-brand-gray">Pérdida en Argentina (140% inflación)</p>
              </div>
              <div className="text-center">
                <p className="text-brand-green font-bold text-xl">+$1,500</p>
                <p className="text-brand-gray">Ganancia con Morpho Blue (15% APY)</p>
              </div>
              <div className="text-center">
                <p className="text-brand-green font-bold text-xl">$15,500</p>
                <p className="text-brand-gray">Diferencia total: <strong>+$15,500</strong></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InflationComparison;
