import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import VaultTabs from './components/VaultTabs';
import Vaults from './components/Vaults';
import ReferralSystem from './components/ReferralSystem';
import ProtocolDetails from './components/ProtocolDetails';
import InflationComparison from './components/InflationComparison';
import FAQ from './components/FAQ';
import Footer from './components/Footer';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-brand-dark font-sans">
      <Header />
      <main>
        <Hero />
        <VaultTabs />
        <HowItWorks />
        <Vaults />
        <ReferralSystem />
        <ProtocolDetails />
        <InflationComparison />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
};

export default App;