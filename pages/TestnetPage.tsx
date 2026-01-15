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
              <p className="text-theme-tertiary text-lg max-w-2xl mx-auto">
                Prueba nuestros vaults en testnet con tokens de prueba gratuitos. Prueba toda la funcionalidad antes de usar mainnet.
              </p>
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
