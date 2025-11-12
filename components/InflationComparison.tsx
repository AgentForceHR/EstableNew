import React from 'react';

const InflationComparison: React.FC = () => {
  const comparison = [
    { country: 'Argentina', inflation: '140%', color: 'bg-red-500' },
    { country: 'Venezuela', inflation: '400%', color: 'bg-red-600' },
    { country: 'México', inflation: '5.5%', color: 'bg-orange-500' },
    { country: 'Colombia', inflation: '11%', color: 'bg-orange-600' },
    { country: 'Estable.app', inflation: '+18% APY', color: 'bg-brand-green' }
  ];

  return (
    <section className="py-20 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Protege tu Dinero de la Inflación</h2>
          <p className="text-brand-gray text-lg max-w-2xl mx-auto">
            Mientras la inflación destruye el valor de tus ahorros, genera rendimientos con Estable.app
          </p>
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
            <p className="text-center text-brand-light">
              💡 <strong>Ejemplo:</strong> Si tienes $10,000 USD en Argentina, en un año perderás $14,000 en poder adquisitivo.
              Con Estable.app, generarías <strong className="text-brand-green">$1,800 USD</strong> adicionales.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InflationComparison;
