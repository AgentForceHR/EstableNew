import React, { useState } from 'react';

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: '¿Qué es Estable.lat?',
      answer: 'Estable.lat es una plataforma que te permite generar rendimientos estables en dólares digitales (USDC, USDT) mediante protocolos DeFi seguros y auditados.'
    },
    {
      question: '¿Es seguro depositar mi dinero?',
      answer: 'Sí. Utilizamos protocolos DeFi establecidos como Aave y Compound que han sido auditados múltiples veces. Además, nunca tenemos custodia de tus fondos - tú mantienes el control total.'
    },
    {
      question: '¿Cuánto puedo ganar?',
      answer: 'Los rendimientos varían según el vault que elijas, con APYs entre 15% y 18%. Los rendimientos se generan automáticamente y son compuestos.'
    },
    {
      question: '¿Cuándo puedo retirar mi dinero?',
      answer: 'Puedes retirar tus fondos en cualquier momento sin penalizaciones. Los retiros son procesados inmediatamente en blockchain.'
    },
    {
      question: '¿Necesito conocimientos técnicos?',
      answer: 'No. Hemos diseñado Estable.lat para que sea simple y fácil de usar. Solo necesitas una wallet de criptomonedas como MetaMask.'
    },
    {
      question: '¿Cuál es el depósito mínimo?',
      answer: 'El depósito mínimo es de $100 USD en USDC o USDT. No hay límite máximo.'
    }
  ];

  return (
    <section id="faq" className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-theme-secondary">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-10 sm:mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-theme-primary">Preguntas Frecuentes</h2>
          <p className="text-theme-tertiary text-sm sm:text-base md:text-lg px-2">
            Encuentra respuestas a las preguntas más comunes
          </p>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-theme-card rounded-xl border border-theme-light overflow-hidden hover:border-accent-primary hover:shadow-theme-lg transition-all shadow-theme-md"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 text-left flex justify-between items-center hover:bg-theme-secondary/50 transition-colors min-h-[44px]"
              >
                <span className="font-semibold text-sm sm:text-base md:text-lg text-theme-primary pr-4">{faq.question}</span>
                <span className="text-accent-primary text-xl sm:text-2xl font-bold flex-shrink-0">
                  {openIndex === index ? '−' : '+'}
                </span>
              </button>

              {openIndex === index && (
                <div className="px-4 sm:px-6 md:px-8 pb-4 sm:pb-5 md:pb-6 text-theme-tertiary leading-relaxed border-t border-theme-light pt-3 sm:pt-4 text-sm sm:text-base">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
