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
    <section className="py-20 px-6 bg-brand-blue/10">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Seguridad y Confianza</h2>
          <p className="text-brand-gray text-lg max-w-2xl mx-auto">
            Tu seguridad es nuestra prioridad número uno
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-brand-card p-8 rounded-xl border border-brand-gray/20 hover:border-brand-green/50 transition-all">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-brand-gray">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-brand-card p-8 rounded-xl border border-brand-gray/20 text-center">
          <h3 className="text-2xl font-bold mb-4">Respaldado por DeFi</h3>
          <p className="text-brand-gray mb-6 max-w-3xl mx-auto">
            Nuestros vaults utilizan los protocolos DeFi más establecidos y seguros del ecosistema: Aave, Compound, y Curve.
            Más de $100B en TVL combinado respaldan estas plataformas.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-brand-gray">
            <span className="px-6 py-2 bg-brand-dark rounded-lg">Aave</span>
            <span className="px-6 py-2 bg-brand-dark rounded-lg">Compound</span>
            <span className="px-6 py-2 bg-brand-dark rounded-lg">Curve</span>
            <span className="px-6 py-2 bg-brand-dark rounded-lg">Yearn</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProtocolDetails;
