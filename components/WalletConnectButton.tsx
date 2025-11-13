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
                    className="bg-brand-green hover:bg-brand-green/90 text-brand-dark font-semibold px-6 py-2 rounded-lg transition-all"
                  >
                    Conectar Wallet
                  </button>
                );
              }

              if (chain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-2 rounded-lg transition-all"
                  >
                    Red Incorrecta
                  </button>
                );
              }

              return (
                <div className="flex items-center gap-2">
                  <button
                    onClick={openChainModal}
                    className="bg-brand-card hover:bg-brand-gray/10 border border-brand-gray/20 text-brand-light font-semibold px-4 py-2 rounded-lg transition-all flex items-center gap-2"
                  >
                    {chain.hasIcon && chain.iconUrl && (
                      <img
                        alt={chain.name ?? 'Chain icon'}
                        src={chain.iconUrl}
                        className="w-4 h-4"
                      />
                    )}
                    {chain.name}
                  </button>

                  <button
                    onClick={openAccountModal}
                    className="bg-brand-green hover:bg-brand-green/90 text-brand-dark font-semibold px-4 py-2 rounded-lg transition-all"
                  >
                    {account.displayName}
                    {account.displayBalance
                      ? ` (${account.displayBalance})`
                      : ''}
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
