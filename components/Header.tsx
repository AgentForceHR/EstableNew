import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 bg-brand-dark/95 backdrop-blur-sm border-b border-brand-gray/20 z-50">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-brand-green rounded-lg flex items-center justify-center">
            <span className="text-brand-dark font-bold text-lg">E</span>
          </div>
          <span className="text-xl font-bold text-brand-light">Estable.app</span>
        </div>

        <nav className="hidden md:flex items-center space-x-8">
          <a href="#como-funciona" className="text-brand-gray hover:text-brand-light transition-colors">
            Cómo Funciona
          </a>
          <a href="#vaults" className="text-brand-gray hover:text-brand-light transition-colors">
            Vaults
          </a>
          <a href="#referrals" className="text-brand-gray hover:text-brand-light transition-colors">
            Referidos
          </a>
          <a href="#faq" className="text-brand-gray hover:text-brand-light transition-colors">
            FAQ
          </a>
        </nav>

        <a href="#vaults" className="bg-brand-green hover:bg-brand-green/90 text-brand-dark font-semibold px-6 py-2 rounded-lg transition-all">
          Comenzar
        </a>
      </div>
    </header>
  );
};

export default Header;
