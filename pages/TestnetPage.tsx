import React from 'react';
import { Link } from 'react-router-dom';
import Vaults from '../components/Vaults';
import Header from '../components/Header';
import Footer from '../components/Footer';

const TestnetPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-brand-dark font-sans">
      <Header />
      <main>
        <section className="py-20 px-6">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-brand-gray hover:text-brand-light transition-colors mb-6"
              >
                <span>←</span>
                <span>Back to Home</span>
              </Link>
              <h1 className="text-5xl font-bold mb-4">Base Sepolia Testnet</h1>
              <p className="text-brand-gray text-lg max-w-2xl mx-auto">
                Try our vaults on the testnet with free test tokens. Test all functionality before using mainnet.
              </p>
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
