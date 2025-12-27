import React, { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { getVaults, approveToken, deposit, withdraw, getTokenBalance, getVaultBalance } from '../lib/contracts';
import FaucetButtons from './FaucetButtons';

interface VaultData {
  id: string;
  name: string;
  assetSymbol: string;
  assetAddress: string;
  vaultAddress: string;
  decimals: number;
}

const Vaults: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();

  const [vaults, setVaults] = useState<VaultData[]>([]);
  const [selectedVault, setSelectedVault] = useState<VaultData | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawShares, setWithdrawShares] = useState('');
  const [mode, setMode] = useState<'deposit' | 'withdraw'>('deposit');
  const [processing, setProcessing] = useState(false);
  const [userBalances, setUserBalances] = useState<Record<string, { token: string; shares: string }>>({});

  useEffect(() => {
    loadVaults();
  }, []);

  useEffect(() => {
    if (address && vaults.length > 0) {
      loadBalances();
    }
  }, [address, vaults]);

  const loadVaults = () => {
    const data = getVaults();
    setVaults(data);
  };

  const loadBalances = async () => {
    if (!address) return;

    const balances: Record<string, { token: string; shares: string }> = {};

    for (const vault of vaults) {
      try {
        const tokenBalance = await getTokenBalance(vault.assetAddress, address);
        const vaultBalance = await getVaultBalance(vault.vaultAddress, address);
        balances[vault.id] = {
          token: tokenBalance,
          shares: vaultBalance
        };
      } catch (error) {
        console.error(`Failed to load balance for ${vault.id}:`, error);
        balances[vault.id] = { token: '0', shares: '0' };
      }
    }

    setUserBalances(balances);
  };

  const handleDeposit = async () => {
    if (!selectedVault || !depositAmount || !isConnected || !address) {
      alert('Please connect your wallet and enter an amount');
      return;
    }

    const amount = parseFloat(depositAmount);
    if (amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    setProcessing(true);

    try {
      await approveToken(
        selectedVault.assetAddress,
        selectedVault.vaultAddress,
        depositAmount,
        selectedVault.decimals
      );

      await deposit(
        selectedVault.vaultAddress,
        selectedVault.assetAddress,
        depositAmount,
        selectedVault.decimals
      );

      alert('Deposit successful!');
      setDepositAmount('');
      setSelectedVault(null);
      loadBalances();
    } catch (error: any) {
      console.error('Deposit failed:', error);
      alert(error.message || 'Deposit failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleWithdraw = async () => {
    if (!selectedVault || !withdrawShares || !isConnected || !address) {
      alert('Please connect your wallet and enter shares amount');
      return;
    }

    const shares = parseFloat(withdrawShares);
    if (shares <= 0) {
      alert('Please enter a valid shares amount');
      return;
    }

    setProcessing(true);

    try {
      await withdraw(selectedVault.vaultAddress, withdrawShares);

      alert('Withdrawal successful!');
      setWithdrawShares('');
      setSelectedVault(null);
      loadBalances();
    } catch (error: any) {
      console.error('Withdrawal failed:', error);
      alert(error.message || 'Withdrawal failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <section id="vaults" className="py-20 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Vaults Disponibles</h2>
          <p className="text-brand-gray text-lg max-w-2xl mx-auto">
            Vaults optimizados usando Morpho Blue y Spark.fi en Base Network
          </p>
          <div className="mt-4 inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-lg">
            <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
            <span className="text-blue-400 text-sm font-semibold">Base Sepolia Testnet</span>
          </div>
        </div>

        <FaucetButtons />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {vaults.map((vault) => (
            <div
              key={vault.id}
              className="bg-brand-card rounded-xl border border-brand-gray/20 p-8 hover:border-brand-green/50 transition-all"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold mb-1">{vault.name}</h3>
                  <span className="text-xs text-brand-gray">{vault.assetSymbol}</span>
                </div>
                <span className="px-3 py-1 rounded-full text-sm bg-brand-green/20 text-brand-green">
                  Test
                </span>
              </div>

              <div className="space-y-4 mb-8">
                {address && userBalances[vault.id] && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-brand-gray">Your Balance</span>
                      <span className="font-semibold">{parseFloat(userBalances[vault.id].token).toFixed(2)} {vault.assetSymbol}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-brand-gray">Your Shares</span>
                      <span className="font-semibold">{parseFloat(userBalances[vault.id].shares).toFixed(4)}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between">
                  <span className="text-brand-gray">Asset</span>
                  <span className="font-semibold">{vault.assetSymbol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-gray">Network</span>
                  <span className="font-semibold">Base Sepolia</span>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => {
                    setSelectedVault(vault);
                    setMode('deposit');
                  }}
                  className="w-full bg-brand-green hover:bg-brand-green/90 text-brand-dark font-semibold py-3 rounded-lg transition-all"
                >
                  Deposit
                </button>
                <button
                  onClick={() => {
                    setSelectedVault(vault);
                    setMode('withdraw');
                  }}
                  className="w-full bg-brand-gray/20 hover:bg-brand-gray/30 text-brand-light font-semibold py-3 rounded-lg transition-all"
                >
                  Withdraw
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-brand-green/10 border border-brand-green/20 p-6 rounded-xl">
          <div className="flex items-start gap-4">
            <span className="text-3xl">💡</span>
            <div>
              <h4 className="font-semibold text-brand-green mb-2">Rebalanceo Automático</h4>
              <p className="text-brand-gray text-sm">
                Los fondos se rebalancean automáticamente cada semana: 40% Spark.fi USDC, 30% Steakhouse USDT, 30% sDAI para maximizar rendimientos con Morpho Blue.
              </p>
            </div>
          </div>
        </div>
      </div>

      {selectedVault && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6">
          <div className="bg-brand-card rounded-xl border border-brand-gray/20 p-8 max-w-md w-full">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-2xl font-bold">{selectedVault.name}</h3>
              <button
                onClick={() => {
                  setSelectedVault(null);
                  setDepositAmount('');
                  setWithdrawShares('');
                }}
                className="text-brand-gray hover:text-brand-light"
              >
                ✕
              </button>
            </div>

            {!isConnected ? (
              <div className="text-center py-8">
                <p className="text-brand-gray mb-6">
                  Conecta tu wallet para continuar
                </p>
                <button
                  onClick={openConnectModal}
                  className="bg-brand-green hover:bg-brand-green/90 text-brand-dark font-semibold px-8 py-3 rounded-lg transition-all"
                >
                  Conectar Wallet
                </button>
              </div>
            ) : (
              <div>
                <div className="mb-6">
                  <label className="block text-sm text-brand-gray mb-2">
                    Wallet Conectada
                  </label>
                  <div className="bg-brand-dark px-4 py-2 rounded-lg text-sm">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </div>
                </div>

                {mode === 'deposit' ? (
                  <>
                    <div className="mb-6">
                      <label className="block text-sm text-brand-gray mb-2">
                        Amount to Deposit ({selectedVault.assetSymbol})
                      </label>
                      <input
                        type="number"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        placeholder="0.0"
                        className="w-full bg-brand-dark border border-brand-gray/20 rounded-lg px-4 py-3 text-brand-light focus:border-brand-green focus:outline-none"
                      />
                      {userBalances[selectedVault.id] && (
                        <p className="text-xs text-brand-gray mt-2">
                          Available: {parseFloat(userBalances[selectedVault.id].token).toFixed(2)} {selectedVault.assetSymbol}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={handleDeposit}
                      disabled={!depositAmount || parseFloat(depositAmount) <= 0 || processing}
                      className="w-full bg-brand-green hover:bg-brand-green/90 disabled:bg-brand-gray/20 disabled:cursor-not-allowed text-brand-dark font-semibold py-3 rounded-lg transition-all"
                    >
                      {processing ? 'Processing...' : `Deposit ${depositAmount || ''}`}
                    </button>
                  </>
                ) : (
                  <>
                    <div className="mb-6">
                      <label className="block text-sm text-brand-gray mb-2">
                        Shares to Withdraw
                      </label>
                      <input
                        type="number"
                        value={withdrawShares}
                        onChange={(e) => setWithdrawShares(e.target.value)}
                        placeholder="0.0"
                        className="w-full bg-brand-dark border border-brand-gray/20 rounded-lg px-4 py-3 text-brand-light focus:border-brand-green focus:outline-none"
                      />
                      {userBalances[selectedVault.id] && (
                        <p className="text-xs text-brand-gray mt-2">
                          Available: {parseFloat(userBalances[selectedVault.id].shares).toFixed(4)} shares
                        </p>
                      )}
                    </div>

                    <button
                      onClick={handleWithdraw}
                      disabled={!withdrawShares || parseFloat(withdrawShares) <= 0 || processing}
                      className="w-full bg-brand-green hover:bg-brand-green/90 disabled:bg-brand-gray/20 disabled:cursor-not-allowed text-brand-dark font-semibold py-3 rounded-lg transition-all"
                    >
                      {processing ? 'Processing...' : `Withdraw ${withdrawShares || ''}`}
                    </button>
                  </>
                )}

                <p className="text-xs text-brand-gray text-center mt-4">
                  Shares use 18 decimals
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default Vaults;
