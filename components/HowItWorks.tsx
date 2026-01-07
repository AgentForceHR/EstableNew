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
    <section id="como-funciona" className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-theme-secondary">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-10 sm:mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-theme-primary">¿Cómo Funciona?</h2>
          <p className="text-theme-tertiary text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-2">
            Cuatro pasos simples para comenzar a generar rendimientos estables
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="bg-theme-card p-6 sm:p-8 rounded-xl border border-theme-light h-full hover:border-accent-primary hover:shadow-theme-lg transition-all shadow-theme-md">
                <div className="text-accent-primary/40 text-4xl sm:text-5xl font-bold mb-3 sm:mb-4">{step.number}</div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-theme-primary">{step.title}</h3>
                <p className="text-sm sm:text-base text-theme-tertiary leading-relaxed">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-accent-primary/30" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
