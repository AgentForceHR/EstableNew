import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const WalletConnectButton: React.FC = () => {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== 'loading';
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus ||
            authenticationStatus === 'authenticated');

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              style: {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    className="w-full sm:w-auto bg-accent-primary hover:bg-accent-hover text-white font-semibold px-4 sm:px-6 py-2.5 sm:py-2 rounded-lg transition-all text-sm sm:text-base shadow-theme-sm"
                  >
                    Conectar Wallet
                  </button>
                );
              }

              if (chain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white font-semibold px-4 sm:px-6 py-2.5 sm:py-2 rounded-lg transition-all text-sm sm:text-base shadow-theme-sm"
                  >
                    Red Incorrecta
                  </button>
                );
              }

              return (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={openChainModal}
                    className="bg-theme-card hover:bg-theme-secondary border border-theme-light text-theme-primary font-semibold px-3 sm:px-4 py-2 rounded-lg transition-all flex items-center justify-center gap-2 text-sm shadow-theme-sm"
                  >
                    {chain.hasIcon && chain.iconUrl && (
                      <img
                        alt={chain.name ?? 'Chain icon'}
                        src={chain.iconUrl}
                        className="w-4 h-4 flex-shrink-0"
                      />
                    )}
                    <span className="truncate">{chain.name}</span>
                  </button>

                  <button
                    onClick={openAccountModal}
                    className="bg-accent-primary hover:bg-accent-hover text-white font-semibold px-3 sm:px-4 py-2 rounded-lg transition-all text-sm shadow-theme-sm truncate"
                  >
                    <span className="block sm:inline">{account.displayName}</span>
                    {account.displayBalance && (
                      <span className="block sm:inline sm:ml-1 text-xs sm:text-sm opacity-90">
                        ({account.displayBalance})
                      </span>
                    )}
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};

export default WalletConnectButton;
