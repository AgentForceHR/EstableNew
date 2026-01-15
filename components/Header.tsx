import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useChainId } from 'wagmi';
import WalletConnectButton from './WalletConnectButton';
import ThemeToggle from './ThemeToggle';

const Header: React.FC = () => {
  const location = useLocation();
  const chainId = useChainId();
  const isHomePage = location.pathname === '/';
  const isTestnet = chainId === 84532;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className="fixed top-0 left-0 right-0 bg-theme-primary/95 backdrop-blur-sm border-b border-theme-light z-50 shadow-theme-sm">
      <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 sm:space-x-3" onClick={closeMobileMenu}>
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-accent-primary rounded-lg flex items-center justify-center shadow-theme-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-lg sm:text-xl font-bold text-theme-primary">Estable.lat</span>
          </Link>

          <nav className="hidden lg:flex items-center space-x-1">
            {isHomePage ? (
              <>
                <a href="#como-funciona" className="px-4 py-2 text-theme-secondary hover:text-theme-primary hover:bg-theme-secondary rounded-lg transition-all text-sm font-medium">
                  Cómo Funciona
                </a>
                <a href="#vaults" className="px-4 py-2 text-theme-secondary hover:text-theme-primary hover:bg-theme-secondary rounded-lg transition-all text-sm font-medium">
                  Vaults
                </a>
              </>
            ) : (
              <Link to="/" className="px-4 py-2 text-theme-secondary hover:text-theme-primary hover:bg-theme-secondary rounded-lg transition-all text-sm font-medium">
                Inicio
              </Link>
            )}
            <Link to="/affiliates" className="px-4 py-2 text-theme-secondary hover:text-theme-primary hover:bg-theme-secondary rounded-lg transition-all text-sm font-medium">
              Affiliates
            </Link>
            <Link to="/points" className="px-4 py-2 text-theme-secondary hover:text-theme-primary hover:bg-theme-secondary rounded-lg transition-all text-sm font-medium flex items-center gap-1">
              <span>⭐</span> Puntos
            </Link>
            {isHomePage && (
              <a href="#faq" className="px-4 py-2 text-theme-secondary hover:text-theme-primary hover:bg-theme-secondary rounded-lg transition-all text-sm font-medium">
                FAQ
              </a>
            )}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>
            <div className="hidden sm:block">
              <WalletConnectButton />
            </div>

            <button
              onClick={toggleMobileMenu}
              className="lg:hidden p-2 rounded-lg border border-theme-light hover:bg-theme-secondary transition-all"
              aria-label="Menú"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6 text-theme-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-theme-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-theme-light pt-4 space-y-3 bg-theme-primary rounded-lg shadow-theme-lg">
            {isHomePage ? (
              <>
                <a
                  href="#como-funciona"
                  className="block px-4 py-3 text-theme-primary hover:text-accent-primary hover:bg-theme-secondary rounded-lg transition-all text-base font-semibold"
                  onClick={closeMobileMenu}
                >
                  Cómo Funciona
                </a>
                <a
                  href="#vaults"
                  className="block px-4 py-3 text-theme-primary hover:text-accent-primary hover:bg-theme-secondary rounded-lg transition-all text-base font-semibold"
                  onClick={closeMobileMenu}
                >
                  Vaults
                </a>
              </>
            ) : (
              <Link
                to="/"
                className="block px-4 py-3 text-theme-primary hover:text-accent-primary hover:bg-theme-secondary rounded-lg transition-all text-base font-semibold"
                onClick={closeMobileMenu}
              >
                Inicio
              </Link>
            )}
            <Link
              to="/affiliates"
              className="block px-4 py-3 text-theme-primary hover:text-accent-primary hover:bg-theme-secondary rounded-lg transition-all text-base font-semibold"
              onClick={closeMobileMenu}
            >
              Affiliates
            </Link>
            <Link
              to="/points"
              className="block px-4 py-3 text-theme-primary hover:text-accent-primary hover:bg-theme-secondary rounded-lg transition-all text-base font-semibold flex items-center gap-2"
              onClick={closeMobileMenu}
            >
              <span>⭐</span> Puntos
            </Link>
            {isHomePage && (
              <a
                href="#faq"
                className="block px-4 py-3 text-theme-primary hover:text-accent-primary hover:bg-theme-secondary rounded-lg transition-all text-base font-semibold"
                onClick={closeMobileMenu}
              >
                FAQ
              </a>
            )}

            <div className="pt-3 border-t border-theme-light space-y-3 bg-theme-card rounded-lg p-3">
              <div className="px-2">
                <WalletConnectButton />
              </div>
              <div className="flex justify-center pb-2">
                <ThemeToggle />
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
