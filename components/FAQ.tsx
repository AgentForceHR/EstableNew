import React, { useState } from 'react';

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: '¿Qué es Estable.app?',
      answer: 'Estable.app es una plataforma que te permite generar rendimientos estables en dólares digitales (USDC, USDT) mediante protocolos DeFi seguros y auditados.'
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
      answer: 'No. Hemos diseñado Estable.app para que sea simple y fácil de usar. Solo necesitas una wallet de criptomonedas como MetaMask.'
    },
    {
      question: '¿Cuál es el depósito mínimo?',
      answer: 'El depósito mínimo es de $100 USD en USDC o USDT. No hay límite máximo.'
    }
  ];

  return (
    <section id="faq" className="py-20 px-6 bg-theme-secondary">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-theme-primary">Preguntas Frecuentes</h2>
          <p className="text-theme-tertiary text-lg">
            Encuentra respuestas a las preguntas más comunes
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-theme-card rounded-xl border border-theme-light overflow-hidden hover:border-accent-primary hover:shadow-theme-lg transition-all shadow-theme-md"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-8 py-6 text-left flex justify-between items-center hover:bg-theme-secondary/50 transition-colors"
              >
                <span className="font-semibold text-lg text-theme-primary">{faq.question}</span>
                <span className="text-accent-primary text-2xl font-bold">
                  {openIndex === index ? '−' : '+'}
                </span>
              </button>

              {openIndex === index && (
                <div className="px-8 pb-6 text-theme-tertiary leading-relaxed border-t border-theme-light pt-4">
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
