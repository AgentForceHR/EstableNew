import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';

const ETHFaucet: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const claimETH = async () => {
    if (!isConnected || !address) {
      setMessage({ type: 'error', text: 'Please connect your wallet first' });
      return;
    }

    try {
      setLoading(true);
      setMessage(null);
      setTxHash(null);

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/eth-faucet`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ walletAddress: address }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage({ type: 'error', text: data.error || 'Failed to claim ETH' });
        return;
      }

      setMessage({ type: 'success', text: data.message });
      setTxHash(data.txHash);
    } catch (error) {
      console.error('Faucet error:', error);
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-theme-card rounded-xl border border-theme-light p-6 md:p-8 shadow-theme-lg">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-theme-primary mb-2">ETH Faucet</h3>
          <p className="text-theme-tertiary text-sm">
            Get free Base Sepolia ETH for testing (0.001 ETH per day)
          </p>
        </div>
        <div className="text-4xl">🚰</div>
      </div>

      {message && (
        <div className={`mb-4 p-4 rounded-lg border ${
          message.type === 'success'
            ? 'bg-green-500/10 border-green-500/20 text-green-400'
            : message.type === 'error'
            ? 'bg-red-500/10 border-red-500/20 text-red-400'
            : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
        }`}>
          <p className="text-sm">{message.text}</p>
          {txHash && (
            <a
              href={`https://sepolia.basescan.org/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs underline mt-2 inline-block hover:opacity-80"
            >
              View transaction
            </a>
          )}
        </div>
      )}

      <div className="space-y-4">
        <div className="bg-theme-secondary p-4 rounded-lg border border-theme-light">
          <div className="text-xs text-theme-tertiary mb-2">Your Wallet</div>
          {isConnected ? (
            <div className="font-mono text-sm text-theme-primary break-all">
              {address?.slice(0, 10)}...{address?.slice(-8)}
            </div>
          ) : (
            <div className="text-sm text-theme-tertiary">Not connected</div>
          )}
        </div>

        {!isConnected ? (
          <button
            onClick={openConnectModal}
            className="w-full bg-accent-primary hover:bg-accent-hover text-white font-semibold py-3 min-h-[44px] rounded-lg transition-all shadow-theme-md"
          >
            Connect Wallet
          </button>
        ) : (
          <button
            onClick={claimETH}
            disabled={loading}
            className="w-full bg-accent-primary hover:bg-accent-hover disabled:bg-theme-secondary disabled:text-theme-tertiary text-white font-semibold py-3 min-h-[44px] rounded-lg transition-all shadow-theme-md"
          >
            {loading ? 'Claiming...' : 'Claim 0.001 ETH'}
          </button>
        )}

        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-400 mb-2 text-sm">ℹ️ Faucet Rules</h4>
          <ul className="text-xs text-theme-tertiary space-y-1">
            <li>• You can claim 0.001 ETH every 24 hours</li>
            <li>• ETH is sent on Base Sepolia testnet</li>
            <li>• Use it to pay for gas fees when testing</li>
            <li>• This ETH has no real-world value</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ETHFaucet;
