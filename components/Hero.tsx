import React from 'react';

const Hero: React.FC = () => {
  return (
    <section className="pt-32 pb-20 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center animate-fade-in-up">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Rendimientos Estables
            <span className="block text-brand-green mt-2">Hasta 18% APY</span>
          </h1>

          <p className="text-xl text-brand-gray max-w-2xl mx-auto mb-8">
            Genera rendimientos en dólares digitales (USDC, USDT) y protege tus ahorros de la inflación en LATAM
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <button className="bg-brand-green hover:bg-brand-green/90 text-brand-dark font-semibold px-8 py-4 rounded-lg text-lg transition-all">
              Comenzar Ahora
            </button>
            <button className="border-2 border-brand-gray hover:border-brand-light text-brand-light font-semibold px-8 py-4 rounded-lg text-lg transition-all">
              Ver Demo
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="bg-brand-card p-6 rounded-xl border border-brand-gray/20">
              <div className="text-3xl font-bold text-brand-green mb-2">18% APY</div>
              <div className="text-brand-gray">Rendimiento anual</div>
            </div>
            <div className="bg-brand-card p-6 rounded-xl border border-brand-gray/20">
              <div className="text-3xl font-bold text-brand-green mb-2">$50M+</div>
              <div className="text-brand-gray">En activos seguros</div>
            </div>
            <div className="bg-brand-card p-6 rounded-xl border border-brand-gray/20">
              <div className="text-3xl font-bold text-brand-green mb-2">10K+</div>
              <div className="text-brand-gray">Usuarios activos</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
