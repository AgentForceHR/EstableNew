import React from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import HowItWorks from '../components/HowItWorks';
import ProtocolDetails from '../components/ProtocolDetails';
import InflationComparison from '../components/InflationComparison';
import FAQ from '../components/FAQ';
import Footer from '../components/Footer';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-theme-primary">
      <Header />
      <main>
        <Hero />
        <HowItWorks />
        <ProtocolDetails />
        <InflationComparison />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
