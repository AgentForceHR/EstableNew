import React from 'react';

const ProtocolDetails: React.FC = () => {
  const features = [
    {
      title: 'Auditorías de Seguridad',
      description: 'Todos nuestros contratos inteligentes han sido auditados por empresas líderes en seguridad blockchain',
      icon: '🔒'
    },
    {
      title: 'No Custodia',
      description: 'Tú mantienes el control total de tus fondos. Nosotros nunca tenemos acceso a tu dinero',
      icon: '🔑'
    },
    {
      title: 'Transparencia Total',
      description: 'Todos los contratos son open source y verificables en blockchain',
      icon: '👁️'
    },
    {
      title: 'Retiros Instantáneos',
      description: 'Retira tus fondos en cualquier momento sin periodos de espera',
      icon: '⚡'
    }
  ];

  return (
    <section className="py-20 px-6 bg-theme-secondary">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-theme-primary">Seguridad y Confianza</h2>
          <p className="text-theme-tertiary text-lg max-w-2xl mx-auto">
            Tu seguridad es nuestra prioridad número uno
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-theme-card p-8 rounded-xl border border-theme-light hover:border-accent-primary hover:shadow-theme-lg transition-all shadow-theme-md">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-3 text-theme-primary">{feature.title}</h3>
              <p className="text-theme-tertiary leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-theme-card p-8 rounded-xl border border-theme-light text-center shadow-theme-lg">
          <h3 className="text-2xl font-bold mb-4 text-theme-primary">Respaldado por DeFi</h3>
          <p className="text-theme-tertiary mb-6 max-w-3xl mx-auto leading-relaxed">
            Nuestros vaults utilizan los protocolos DeFi más establecidos y seguros del ecosistema: Aave, Compound, y Curve.
            Más de $100B en TVL combinado respaldan estas plataformas.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <span className="px-6 py-3 bg-theme-secondary text-theme-secondary rounded-lg border border-theme-light shadow-theme-md font-medium">Aave</span>
            <span className="px-6 py-3 bg-theme-secondary text-theme-secondary rounded-lg border border-theme-light shadow-theme-md font-medium">Compound</span>
            <span className="px-6 py-3 bg-theme-secondary text-theme-secondary rounded-lg border border-theme-light shadow-theme-md font-medium">Curve</span>
            <span className="px-6 py-3 bg-theme-secondary text-theme-secondary rounded-lg border border-theme-light shadow-theme-md font-medium">Yearn</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProtocolDetails;
