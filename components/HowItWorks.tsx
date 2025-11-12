import React from 'react';

const HowItWorks: React.FC = () => {
  const steps = [
    {
      number: '01',
      title: 'Conecta tu Wallet',
      description: 'Conecta tu billetera de criptomonedas compatible (MetaMask, WalletConnect, etc.)'
    },
    {
      number: '02',
      title: 'Deposita USDC/USDT',
      description: 'Deposita tus dólares digitales en los vaults de tu elección'
    },
    {
      number: '03',
      title: 'Genera Rendimientos',
      description: 'Comienza a ganar rendimientos automáticamente en tiempo real'
    },
    {
      number: '04',
      title: 'Retira Cuando Quieras',
      description: 'Retira tus fondos en cualquier momento sin penalizaciones'
    }
  ];

  return (
    <section id="como-funciona" className="py-20 px-6 bg-brand-blue/10">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">¿Cómo Funciona?</h2>
          <p className="text-brand-gray text-lg max-w-2xl mx-auto">
            Cuatro pasos simples para comenzar a generar rendimientos estables
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="bg-brand-card p-8 rounded-xl border border-brand-gray/20 h-full hover:border-brand-green/50 transition-all">
                <div className="text-brand-green/30 text-5xl font-bold mb-4">{step.number}</div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-brand-gray">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-brand-green/30" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
