import React from 'react';
import { Link } from 'react-router-dom';
import Vaults from '../components/Vaults';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FaucetButtons from '../components/FaucetButtons';
import ETHFaucet from '../components/ETHFaucet';

const TestnetPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-theme-primary font-sans">
      <Header />
      <main>
        <section className="py-20 px-6">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-theme-tertiary hover:text-accent-primary transition-colors mb-6"
              >
                <span>←</span>
                <span>Volver al Inicio</span>
              </Link>
              <h1 className="text-5xl font-bold mb-4 text-theme-primary">Base Sepolia Testnet</h1>
              <p className="text-theme-tertiary text-lg max-w-2xl mx-auto mb-6">
                Prueba nuestros vaults en testnet con tokens de prueba gratuitos. Prueba toda la funcionalidad antes de usar mainnet.
              </p>
              <a
                href="https://x.com/Estable_app"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-accent-primary hover:bg-accent-hover text-white font-semibold rounded-lg transition-all shadow-theme-md hover:shadow-theme-lg"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span>Contáctanos en X</span>
              </a>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
              <ETHFaucet />
              <FaucetButtons />
            </div>
          </div>
        </section>
        <Vaults />
      </main>
      <Footer />
    </div>
  );
};

export default TestnetPage;
