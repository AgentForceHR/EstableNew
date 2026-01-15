import React, { useEffect, useState, useCallback } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { getVaults, approveToken, deposit, withdraw, getTokenBalance, getVaultBalance } from '../lib/contracts';
import { handleVaultTransaction } from '../lib/points';
import { ethers } from 'ethers';

interface VaultData {
  id: string;
  name: string;
  assetSymbol: string;
  assetAddress: string;
  vaultAddress: string;
  decimals: number;
}

interface UserVaultData {
  token: string;
  shares: string;
  value: string;
  depositedAmount: string;
  yieldEarned: string;
}

interface DepositRecord {
  amount: number;
  timestamp: number;
}

const APY = 0.15;

const Vaults: React.FC = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { openConnectModal } = useConnectModal();

  const [vaults, setVaults] = useState<VaultData[]>([]);
  const [selectedVault, setSelectedVault] = useState<VaultData | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawShares, setWithdrawShares] = useState('');
  const [mode, setMode] = useState<'deposit' | 'withdraw'>('deposit');
  const [processing, setProcessing] = useState(false);
  const [userBalances, setUserBalances] = useState<Record<string, UserVaultData>>({});
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    loadVaults();
    const timeInterval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timeInterval);
  }, []);

  useEffect(() => {
    if (address && vaults.length > 0) {
      loadBalances();
      const interval = setInterval(() => {
        loadBalances();
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [address, vaults.length, currentTime]);

  const loadVaults = async () => {
    try {
      const data = await getVaults();
      setVaults(data);
    } catch (error) {
      console.error('Failed to load vaults:', error);
    }
  };

  const calculateYieldForDeposits = (deposits: DepositRecord[], currentTime: number): { totalDeposited: number; totalYield: number } => {
    let totalDeposited = 0;
    let totalYield = 0;

    deposits.forEach(deposit => {
      const timeElapsed = currentTime - deposit.timestamp;
      const daysElapsed = timeElapsed / (1000 * 60 * 60 * 24);
      const yearsElapsed = daysElapsed / 365;

      const currentValue = deposit.amount * Math.pow(1 + APY, yearsElapsed);
      const yieldEarned = currentValue - deposit.amount;

      totalDeposited += deposit.amount;
      totalYield += yieldEarned;
    });

    return { totalDeposited, totalYield };
  };

  const getDepositRecords = (vaultId: string): DepositRecord[] => {
    if (!address) return [];
    const key = `${address}-${vaultId}-deposits`;
    const data = localStorage.getItem(key);
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  };

  const saveDepositRecords = (vaultId: string, deposits: DepositRecord[]) => {
    if (!address) return;
    const key = `${address}-${vaultId}-deposits`;
    localStorage.setItem(key, JSON.stringify(deposits));
  };

  const loadBalances = useCallback(async () => {
    if (!address) return;

    const balances: Record<string, UserVaultData> = {};

    for (const vault of vaults) {
      try {
        const tokenBalance = await getTokenBalance(vault.assetAddress, address);
        const vaultBalance = await getVaultBalance(vault.vaultAddress, address);

        const deposits = getDepositRecords(vault.id);
        const { totalDeposited, totalYield } = calculateYieldForDeposits(deposits, currentTime);

        balances[vault.id] = {
          token: tokenBalance,
          shares: vaultBalance,
          value: (totalDeposited + totalYield).toString(),
          depositedAmount: totalDeposited.toString(),
          yieldEarned: totalYield.toString()
        };
      } catch (error) {
        console.error(`Failed to load balance for ${vault.id}:`, error);
        balances[vault.id] = { token: '0', shares: '0', value: '0', depositedAmount: '0', yieldEarned: '0' };
      }
    }

    setUserBalances(balances);
  }, [address, vaults, currentTime]);

  const handleDeposit = async () => {
    if (!selectedVault || !depositAmount || !isConnected || !address) {
      alert('Por favor conecta tu wallet e ingresa una cantidad');
      return;
    }

    const amount = parseFloat(depositAmount);
    if (amount <= 0) {
      alert('Por favor ingresa una cantidad válida');
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

      const tx = await deposit(
        selectedVault.vaultAddress,
        selectedVault.assetAddress,
        depositAmount,
        selectedVault.decimals
      );

      const deposits = getDepositRecords(selectedVault.id);
      deposits.push({
        amount: amount,
        timestamp: Date.now()
      });
      saveDepositRecords(selectedVault.id, deposits);

      if (tx && tx.hash && address) {
        const pointsResult = await handleVaultTransaction(
          address,
          chainId,
          selectedVault.name,
          'deposit',
          tx.hash
        );

        if (pointsResult.success && pointsResult.pointsEarned > 0) {
          alert(`¡Depósito exitoso! 🎉 Ganaste ${pointsResult.pointsEarned} puntos`);
        } else {
          alert('¡Depósito exitoso!');
        }
      } else {
        alert('¡Depósito exitoso!');
      }

      setDepositAmount('');
      setSelectedVault(null);
      await loadBalances();
    } catch (error: any) {
      console.error('Deposit failed:', error);
      alert(error.message || 'Depósito fallido. Por favor intenta de nuevo.');
    } finally {
      setProcessing(false);
    }
  };

  const handleWithdraw = async () => {
    if (!selectedVault || !withdrawShares || !isConnected || !address) {
      alert('Por favor conecta tu wallet e ingresa la cantidad de shares');
      return;
    }

    const shares = parseFloat(withdrawShares);
    if (shares <= 0) {
      alert('Por favor ingresa una cantidad válida de shares');
      return;
    }

    setProcessing(true);

    try {
      const tx = await withdraw(selectedVault.vaultAddress, withdrawShares);

      const deposits = getDepositRecords(selectedVault.id);
      const totalShares = parseFloat(userBalances[selectedVault.id]?.shares || '0');
      const withdrawPercent = shares / totalShares;

      const newDeposits = deposits.map(d => ({
        ...d,
        amount: d.amount * (1 - withdrawPercent)
      })).filter(d => d.amount > 0.0001);

      saveDepositRecords(selectedVault.id, newDeposits);

      if (tx && tx.hash && address) {
        const pointsResult = await handleVaultTransaction(
          address,
          chainId,
          selectedVault.name,
          'withdraw',
          tx.hash
        );

        if (pointsResult.success && pointsResult.pointsEarned > 0) {
          alert(`¡Retiro exitoso! 🎉 Ganaste ${pointsResult.pointsEarned} puntos`);
        } else {
          alert('¡Retiro exitoso!');
        }
      } else {
        alert('¡Retiro exitoso!');
      }

      setWithdrawShares('');
      setSelectedVault(null);
      await loadBalances();
    } catch (error: any) {
      console.error('Withdrawal failed:', error);
      alert(error.message || 'Retiro fallido. Por favor intenta de nuevo.');
    } finally {
      setProcessing(false);
    }
  };

  const calculateTotalDeposited = () => {
    if (!address) return 0;
    return vaults.reduce((sum, vault) => {
      const balance = userBalances[vault.id];
      return sum + parseFloat(balance?.depositedAmount || '0');
    }, 0);
  };

  const calculateTotalValue = () => {
    if (!address) return 0;
    return vaults.reduce((sum, vault) => {
      const balance = userBalances[vault.id];
      return sum + parseFloat(balance?.value || '0');
    }, 0);
  };

  const calculateTotalYield = () => {
    if (!address) return 0;
    return vaults.reduce((sum, vault) => {
      const balance = userBalances[vault.id];
      return sum + parseFloat(balance?.yieldEarned || '0');
    }, 0);
  };

  const getOldestDepositTime = () => {
    if (!address) return Date.now();
    let oldest = Date.now();
    vaults.forEach(vault => {
      const deposits = getDepositRecords(vault.id);
      deposits.forEach(d => {
        if (d.timestamp < oldest) oldest = d.timestamp;
      });
    });
    return oldest;
  };

  const calculateProgress = () => {
    const deposited = calculateTotalDeposited();
    if (deposited === 0) return 0;
    const yieldEarned = calculateTotalYield();
    const targetYield = deposited * APY;
    return Math.min((yieldEarned / targetYield) * 100, 100);
  };

  const getDaysElapsed = () => {
    const oldest = getOldestDepositTime();
    const elapsed = currentTime - oldest;
    return elapsed / (1000 * 60 * 60 * 24);
  };

  return (
    <section id="vaults" className="py-12 md:py-20 px-4 md:px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-8 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-3 md:mb-4">Vaults Disponibles</h2>
          <p className="text-brand-gray text-sm md:text-lg max-w-2xl mx-auto px-2">
            Vaults optimizados usando Morpho Blue y Spark.fi en Base Network
          </p>
          <div className="mt-4 inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-lg">
            <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
            <span className="text-blue-400 text-sm font-semibold">Base Sepolia Testnet</span>
          </div>
        </div>

        {address && calculateTotalValue() > 0 && (
          <div className="bg-gradient-to-r from-brand-green/10 to-blue-500/10 border border-brand-green/20 rounded-xl p-4 md:p-8 mb-6 md:mb-8">
            <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Tu Portafolio</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
              <div>
                <div className="text-sm text-brand-gray mb-2">Total Depositado</div>
                <div className="text-2xl md:text-3xl font-bold">${calculateTotalDeposited().toFixed(2)}</div>
              </div>
              <div>
                <div className="text-sm text-brand-gray mb-2">Valor Actual</div>
                <div className="text-2xl md:text-3xl font-bold text-brand-green">${calculateTotalValue().toFixed(2)}</div>
              </div>
              <div>
                <div className="text-sm text-brand-gray mb-2">Rendimiento Total Ganado</div>
                <div className="text-2xl md:text-3xl font-bold text-brand-green">
                  ${calculateTotalYield().toFixed(4)}
                  {calculateTotalYield() > 0 && calculateTotalDeposited() > 0 && (
                    <span className="text-xs md:text-sm ml-2">
                      (+{((calculateTotalYield() / calculateTotalDeposited()) * 100).toFixed(2)}%)
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-brand-dark/50 rounded-lg p-4 md:p-6">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-brand-gray">Progreso APY (Meta Anual 15%)</span>
                <span className="text-sm font-semibold text-brand-green">{calculateProgress().toFixed(2)}%</span>
              </div>
              <div className="w-full bg-brand-gray/20 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-brand-green to-blue-500 h-full transition-all duration-1000 rounded-full"
                  style={{ width: `${calculateProgress()}%` }}
                ></div>
              </div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-3 gap-2 sm:gap-0">
                <span className="text-xs text-brand-gray">
                  {getDaysElapsed().toFixed(1)} días ganando
                </span>
                <span className="text-xs text-brand-gray">
                  Meta: ${(calculateTotalDeposited() * APY).toFixed(2)} / año
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 mb-8 md:mb-12">
          {vaults.map((vault) => {
            const hasDeposits = address && userBalances[vault.id] && parseFloat(userBalances[vault.id].depositedAmount) > 0;
            const vaultYield = hasDeposits ? parseFloat(userBalances[vault.id].yieldEarned) : 0;
            const vaultDeposited = hasDeposits ? parseFloat(userBalances[vault.id].depositedAmount) : 0;
            const vaultProgress = vaultDeposited > 0 ? Math.min((vaultYield / (vaultDeposited * APY)) * 100, 100) : 0;

            return (
              <div
                key={vault.id}
                className="bg-brand-card rounded-xl border border-brand-gray/20 p-4 md:p-8 hover:border-brand-green/50 transition-all"
              >
                <div className="flex justify-between items-start mb-4 md:mb-6">
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold mb-1">{vault.name}</h3>
                    <span className="text-xs text-brand-gray">{vault.assetSymbol}</span>
                  </div>
                  <span className="px-2 md:px-3 py-1 rounded-full text-xs md:text-sm bg-brand-green/20 text-brand-green whitespace-nowrap">
                    15% APY
                  </span>
                </div>

                <div className="space-y-4 mb-8">
                  {hasDeposits ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-brand-gray">Depositado</span>
                        <span className="font-semibold">{vaultDeposited.toFixed(2)} {vault.assetSymbol}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-brand-gray">Valor Actual</span>
                        <span className="font-semibold text-brand-green">{parseFloat(userBalances[vault.id].value).toFixed(2)} {vault.assetSymbol}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-brand-gray">Rendimiento Ganado</span>
                        <span className="font-semibold text-brand-green">
                          +{vaultYield.toFixed(4)} {vault.assetSymbol}
                        </span>
                      </div>
                      <div className="pt-2">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs text-brand-gray">Progreso APY</span>
                          <span className="text-xs font-semibold text-brand-green">{vaultProgress.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-brand-gray/20 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-brand-green h-full transition-all duration-1000 rounded-full"
                            style={{ width: `${vaultProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    </>
                  ) : address && userBalances[vault.id] ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-brand-gray">Balance Wallet</span>
                        <span className="font-semibold">{parseFloat(userBalances[vault.id].token).toFixed(2)} {vault.assetSymbol}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-brand-gray">Activo</span>
                        <span className="font-semibold">{vault.assetSymbol}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-brand-gray">Red</span>
                        <span className="font-semibold">Base Sepolia</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span className="text-brand-gray">Activo</span>
                        <span className="font-semibold">{vault.assetSymbol}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-brand-gray">Red</span>
                        <span className="font-semibold">Base Sepolia</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setSelectedVault(vault);
                      setMode('deposit');
                    }}
                    className="w-full bg-brand-green hover:bg-brand-green/90 text-brand-dark font-semibold py-3 md:py-3 min-h-[44px] rounded-lg transition-all text-sm md:text-base"
                  >
                    Depositar
                  </button>
                  <button
                    onClick={() => {
                      setSelectedVault(vault);
                      setMode('withdraw');
                    }}
                    className="w-full bg-brand-gray/20 hover:bg-brand-gray/30 text-brand-light font-semibold py-3 md:py-3 min-h-[44px] rounded-lg transition-all text-sm md:text-base"
                  >
                    Retirar
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-brand-green/10 border border-brand-green/20 p-4 md:p-6 rounded-xl">
          <div className="flex items-start gap-3 md:gap-4">
            <span className="text-2xl md:text-3xl">💡</span>
            <div>
              <h4 className="font-semibold text-brand-green mb-2 text-sm md:text-base">Rebalanceo Automático</h4>
              <p className="text-brand-gray text-sm">
                Los fondos se rebalancean automáticamente cada semana: 40% Spark.fi USDC, 30% Steakhouse USDT, 30% sDAI para maximizar rendimientos con Morpho Blue. Todos los vaults generan 15% APY.
              </p>
            </div>
          </div>
        </div>
      </div>

      {selectedVault && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 md:p-6">
          <div className="bg-brand-card rounded-xl border border-brand-gray/20 p-4 md:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4 md:mb-6">
              <h3 className="text-xl md:text-2xl font-bold">{selectedVault.name}</h3>
              <button
                onClick={() => {
                  setSelectedVault(null);
                  setDepositAmount('');
                  setWithdrawShares('');
                }}
                className="text-brand-gray hover:text-brand-light text-2xl min-w-[44px] min-h-[44px] flex items-center justify-center -mr-2 -mt-2"
              >
                ✕
              </button>
            </div>

            {!isConnected ? (
              <div className="text-center py-6 md:py-8">
                <p className="text-brand-gray mb-6 text-sm md:text-base">
                  Conecta tu wallet para continuar
                </p>
                <button
                  onClick={openConnectModal}
                  className="bg-brand-green hover:bg-brand-green/90 text-brand-dark font-semibold px-6 md:px-8 py-3 min-h-[44px] rounded-lg transition-all text-sm md:text-base"
                >
                  Conectar Wallet
                </button>
              </div>
            ) : (
              <div>
                <div className="mb-4 md:mb-6">
                  <label className="block text-sm text-brand-gray mb-2">
                    Wallet Conectada
                  </label>
                  <div className="bg-brand-dark px-4 py-3 min-h-[44px] rounded-lg text-sm break-all">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </div>
                </div>

                {mode === 'deposit' ? (
                  <>
                    <div className="mb-4 md:mb-6">
                      <label className="block text-sm text-brand-gray mb-2">
                        Cantidad a Depositar ({selectedVault.assetSymbol})
                      </label>
                      <input
                        type="number"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        placeholder="0.0"
                        className="w-full bg-brand-dark border border-brand-gray/20 rounded-lg px-4 py-3 min-h-[44px] text-brand-light text-sm md:text-base focus:border-brand-green focus:outline-none"
                      />
                      {userBalances[selectedVault.id] && (
                        <p className="text-xs text-brand-gray mt-2">
                          Disponible: {parseFloat(userBalances[selectedVault.id].token).toFixed(2)} {selectedVault.assetSymbol}
                        </p>
                      )}
                    </div>

                    <div className="mb-4 md:mb-6 bg-brand-green/10 border border-brand-green/20 rounded-lg p-4">
                      <div className="text-sm text-brand-gray mb-1">Rendimiento Anual Esperado</div>
                      <div className="text-base md:text-lg font-bold text-brand-green">
                        {depositAmount && parseFloat(depositAmount) > 0
                          ? `+${(parseFloat(depositAmount) * APY).toFixed(2)} ${selectedVault.assetSymbol}`
                          : '0.00'} (15% APY)
                      </div>
                    </div>

                    <button
                      onClick={handleDeposit}
                      disabled={!depositAmount || parseFloat(depositAmount) <= 0 || processing}
                      className="w-full bg-brand-green hover:bg-brand-green/90 disabled:bg-brand-gray/20 disabled:cursor-not-allowed text-brand-dark font-semibold py-3 min-h-[44px] rounded-lg transition-all text-sm md:text-base"
                    >
                      {processing ? 'Procesando...' : `Depositar ${depositAmount || ''}`}
                    </button>
                  </>
                ) : (
                  <>
                    <div className="mb-4 md:mb-6">
                      <label className="block text-sm text-brand-gray mb-2">
                        Shares a Retirar
                      </label>
                      <input
                        type="number"
                        value={withdrawShares}
                        onChange={(e) => setWithdrawShares(e.target.value)}
                        placeholder="0.0"
                        className="w-full bg-brand-dark border border-brand-gray/20 rounded-lg px-4 py-3 min-h-[44px] text-brand-light text-sm md:text-base focus:border-brand-green focus:outline-none"
                      />
                      {userBalances[selectedVault.id] && (
                        <p className="text-xs text-brand-gray mt-2">
                          Disponible: {parseFloat(userBalances[selectedVault.id].shares).toFixed(4)} shares
                        </p>
                      )}
                    </div>

                    <button
                      onClick={handleWithdraw}
                      disabled={!withdrawShares || parseFloat(withdrawShares) <= 0 || processing}
                      className="w-full bg-brand-green hover:bg-brand-green/90 disabled:bg-brand-gray/20 disabled:cursor-not-allowed text-brand-dark font-semibold py-3 min-h-[44px] rounded-lg transition-all text-sm md:text-base"
                    >
                      {processing ? 'Procesando...' : `Retirar ${withdrawShares || ''}`}
                    </button>
                  </>
                )}

                <p className="text-xs text-brand-gray text-center mt-4">
                  Los shares usan 18 decimales
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
