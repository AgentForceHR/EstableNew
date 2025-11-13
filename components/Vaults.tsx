import React, { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { api, Vault } from '../lib/api';

const Vaults: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();

  const [vaults, setVaults] = useState<Vault[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVault, setSelectedVault] = useState<Vault | null>(null);
  const [depositAmount, setDepositAmount] = useState('');

  useEffect(() => {
    loadVaults();
    checkReferralCode();
  }, []);

  const loadVaults = async () => {
    try {
      const data = await api.fetchVaults();
      setVaults(data);
    } catch (error) {
      console.error('Failed to load vaults:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkReferralCode = () => {
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get('ref');
    if (refCode) {
      api.setReferralCode(refCode);
      console.log('Referral code set:', refCode);
    }
  };

  const handleDeposit = async () => {
    if (!selectedVault || !depositAmount || !isConnected || !address) {
      alert('Por favor conecta tu wallet y ingresa un monto');
      return;
    }

    const amount = parseFloat(depositAmount);
    if (amount < 100) {
      alert('El depósito mínimo es $100 USD');
      return;
    }

    try {
      const referralCode = api.getReferralCode();

      await api.deposit(
        selectedVault.id,
        selectedVault.vault_contract_address,
        selectedVault.token_address,
        depositAmount,
        address,
        referralCode || undefined
      );

      alert('¡Depósito exitoso! 🎉');
      setDepositAmount('');
      setSelectedVault(null);
      loadVaults();
    } catch (error) {
      console.error('Deposit failed:', error);
      alert('Error al depositar. Por favor intenta de nuevo.');
    }
  };

  const formatAPY = (vault: Vault) => {
    if (vault.min_apy === vault.max_apy) {
      return `${vault.current_apy}%`;
    }
    return `${vault.min_apy}-${vault.max_apy}%`;
  };

  const formatTVL = (tvl: number) => {
    if (!tvl || isNaN(tvl) || !isFinite(tvl)) {
      return '$0';
    }

    if (tvl >= 1e9) {
      return `$${(tvl / 1e9).toFixed(2)}B`;
    }
    if (tvl >= 1e6) {
      return `$${(tvl / 1e6).toFixed(1)}M`;
    }
    if (tvl >= 1e3) {
      return `$${(tvl / 1e3).toFixed(0)}K`;
    }
    return `$${tvl.toFixed(0)}`;
  };

  if (loading) {
    return (
      <section id="vaults" className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Vaults Disponibles</h2>
            <p className="text-brand-gray text-lg">Cargando vaults...</p>
          </div>
        </div>
      </section>
    );
  }

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
            <span className="text-blue-400 text-sm font-semibold">Morpho Blue + Spark.fi on Base</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {vaults.map((vault) => (
            <div
              key={vault.id}
              className="bg-brand-card rounded-xl border border-brand-gray/20 p-8 hover:border-brand-green/50 transition-all"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold mb-1">{vault.name}</h3>
                  <span className="text-xs text-brand-gray">{vault.protocol}</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  vault.risk_level === 'low' ? 'bg-brand-green/20 text-brand-green' : 'bg-yellow-500/20 text-yellow-500'
                }`}>
                  {vault.risk_level === 'low' ? 'Bajo' : 'Medio'}
                </span>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between">
                  <span className="text-brand-gray">APY</span>
                  <span className="text-brand-green font-bold text-xl">{formatAPY(vault)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-gray">TVL</span>
                  <span className="font-semibold">{formatTVL(vault.total_value_locked)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-gray">Red</span>
                  <span className="font-semibold capitalize">{vault.network}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-gray text-sm">Fee</span>
                  <span className="text-brand-gray text-sm">{vault.performance_fee_bps / 100}%</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedVault(vault)}
                className="w-full bg-brand-green hover:bg-brand-green/90 text-brand-dark font-semibold py-3 rounded-lg transition-all"
              >
                Depositar
              </button>
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
                onClick={() => setSelectedVault(null)}
                className="text-brand-gray hover:text-brand-light"
              >
                ✕
              </button>
            </div>

            {!isConnected ? (
              <div className="text-center py-8">
                <p className="text-brand-gray mb-6">
                  Conecta tu wallet para depositar
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

                <div className="mb-6">
                  <label className="block text-sm text-brand-gray mb-2">
                    Monto a Depositar (USD)
                  </label>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="Mínimo $100"
                    className="w-full bg-brand-dark border border-brand-gray/20 rounded-lg px-4 py-3 text-brand-light focus:border-brand-green focus:outline-none"
                  />
                </div>

                <div className="bg-brand-dark p-4 rounded-lg mb-6 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-brand-gray">APY Estimado</span>
                    <span className="text-brand-green font-semibold">{formatAPY(selectedVault)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-gray">Performance Fee</span>
                    <span>{selectedVault.performance_fee_bps / 100}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-gray">Red</span>
                    <span className="capitalize">{selectedVault.network}</span>
                  </div>
                </div>

                {api.getReferralCode() && (
                  <div className="bg-brand-green/10 border border-brand-green/20 p-3 rounded-lg mb-6 text-sm">
                    <span className="text-brand-green">🎉 Código de referido aplicado</span>
                  </div>
                )}

                <button
                  onClick={handleDeposit}
                  disabled={!depositAmount || parseFloat(depositAmount) < 100}
                  className="w-full bg-brand-green hover:bg-brand-green/90 disabled:bg-brand-gray/20 disabled:cursor-not-allowed text-brand-dark font-semibold py-3 rounded-lg transition-all"
                >
                  Depositar {depositAmount ? `$${depositAmount}` : ''}
                </button>

                <p className="text-xs text-brand-gray text-center mt-4">
                  Al depositar aceptas los términos y condiciones
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
