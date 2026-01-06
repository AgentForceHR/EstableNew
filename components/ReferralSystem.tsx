import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { api, Referral } from '../lib/api';

const ReferralSystem: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();

  const [referral, setReferral] = useState<Referral | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const createReferralCode = async () => {
    if (!isConnected || !address) {
      alert('Por favor conecta tu wallet primero');
      return;
    }

    try {
      setLoading(true);
      const result = await api.createReferralCode(address);
      setReferral(result);
    } catch (error) {
      console.error('Failed to create referral code:', error);
      alert('Error al crear código de referido');
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = () => {
    const link = `${window.location.origin}?ref=${referral?.referral_code}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnWhatsApp = () => {
    const message = `🇦🇷 ¿Cansado de la inflación?\n\nGenera hasta 15% APY en dólares con Estable.app 💰\n\n✅ Seguro en Base Network\n✅ Retira cuando quieras\n✅ Morpho Blue + Spark\n\nEmpieza ahora: ${window.location.origin}?ref=${referral?.referral_code}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  const shareOnTelegram = () => {
    const message = `🇦🇷 Genera hasta 15% APY en dólares con Estable.app\n\n${window.location.origin}?ref=${referral?.referral_code}`;
    window.open(`https://t.me/share/url?url=${encodeURIComponent(window.location.origin + '?ref=' + referral?.referral_code)}&text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <section className="py-20 px-6 bg-theme-secondary">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 text-theme-primary">Genera tu Código de Affiliate</h2>
          <p className="text-theme-tertiary text-lg max-w-2xl mx-auto">
            Conecta tu wallet y genera tu código único para empezar a ganar comisiones
          </p>
        </div>

        {!referral ? (
          <div className="bg-theme-card rounded-xl border border-theme-light p-8 shadow-theme-lg">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-accent-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-theme-md">
                <span className="text-4xl">🎁</span>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-theme-primary">Crea tu Código de Referido</h3>
              <p className="text-theme-tertiary">
                Comparte con tus amigos y gana comisiones automáticamente
              </p>
            </div>

            {!isConnected ? (
              <button
                onClick={openConnectModal}
                className="w-full bg-accent-primary hover:bg-accent-hover text-white font-semibold py-4 rounded-lg transition-all shadow-theme-md"
              >
                Conectar Wallet
              </button>
            ) : (
              <div>
                <div className="bg-theme-secondary p-4 rounded-lg mb-6 text-center border border-theme-light">
                  <p className="text-sm text-theme-tertiary mb-2">Wallet Conectada</p>
                  <p className="font-mono text-theme-primary">{address?.slice(0, 10)}...{address?.slice(-8)}</p>
                </div>

                <button
                  onClick={createReferralCode}
                  disabled={loading}
                  className="w-full bg-accent-primary hover:bg-accent-hover disabled:bg-theme-secondary disabled:text-theme-tertiary text-white font-semibold py-4 rounded-lg transition-all shadow-theme-md"
                >
                  {loading ? 'Creando...' : 'Generar Código de Referido'}
                </button>
              </div>
            )}

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-theme-secondary p-4 rounded-lg text-center border border-theme-light shadow-theme-md">
                <div className="text-2xl font-bold text-accent-primary mb-1">5%</div>
                <div className="text-xs text-theme-tertiary">Comisión de por vida</div>
              </div>
              <div className="bg-theme-secondary p-4 rounded-lg text-center border border-theme-light shadow-theme-md">
                <div className="text-2xl font-bold text-accent-primary mb-1">∞</div>
                <div className="text-xs text-theme-tertiary">Referidos ilimitados</div>
              </div>
              <div className="bg-theme-secondary p-4 rounded-lg text-center border border-theme-light shadow-theme-md">
                <div className="text-2xl font-bold text-accent-primary mb-1">$0</div>
                <div className="text-xs text-theme-tertiary">Sin costo de activación</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-theme-card rounded-xl border border-accent-primary/50 p-8 shadow-theme-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-theme-primary">Tu Código de Referido</h3>
              <span className="bg-accent-primary/20 text-accent-primary px-4 py-2 rounded-lg font-bold text-lg border border-accent-primary/30">
                {referral.referral_code}
              </span>
            </div>

            <div className="bg-theme-secondary p-4 rounded-lg mb-4 border border-theme-light shadow-theme-md">
              <p className="text-xs text-theme-tertiary mb-2">Tu Link de Referido</p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}?ref=${referral.referral_code}`}
                  className="flex-1 bg-transparent text-theme-primary text-sm font-mono outline-none"
                />
                <button
                  onClick={copyReferralLink}
                  className="bg-accent-primary hover:bg-accent-hover text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-theme-md"
                >
                  {copied ? '✓ Copiado' : 'Copiar'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <button
                onClick={shareOnWhatsApp}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2 shadow-theme-md"
              >
                <span>📱</span> Compartir en WhatsApp
              </button>
              <button
                onClick={shareOnTelegram}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2 shadow-theme-md"
              >
                <span>✈️</span> Compartir en Telegram
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-theme-secondary p-4 rounded-lg border border-theme-light shadow-theme-md">
                <div className="text-2xl font-bold text-accent-primary mb-1">
                  {referral.total_referrals}
                </div>
                <div className="text-xs text-theme-tertiary">Referidos Totales</div>
              </div>
              <div className="bg-theme-secondary p-4 rounded-lg border border-theme-light shadow-theme-md">
                <div className="text-2xl font-bold text-accent-primary mb-1">
                  ${referral.total_commission_earned.toFixed(2)}
                </div>
                <div className="text-xs text-theme-tertiary">Comisión Ganada</div>
              </div>
              <div className="bg-theme-secondary p-4 rounded-lg border border-theme-light shadow-theme-md">
                <div className="text-2xl font-bold text-accent-primary mb-1">
                  {referral.commission_rate_bps / 100}%
                </div>
                <div className="text-xs text-theme-tertiary">Tasa de Comisión</div>
              </div>
            </div>

            <div className="bg-accent-primary/10 border border-accent-primary/20 p-4 rounded-lg shadow-theme-md">
              <h4 className="font-semibold text-accent-primary mb-2">💡 Ejemplo de Ganancias</h4>
              <p className="text-sm text-theme-tertiary mb-2">
                Si refiere 10 personas que depositan $1,000 cada una:
              </p>
              <ul className="text-sm text-theme-tertiary space-y-1">
                <li>• Total depositado: $10,000</li>
                <li>• Rendimiento anual (12% APY): $1,200</li>
                <li>• <strong className="text-accent-primary">Tu comisión (5%): $60/año</strong></li>
              </ul>
              <p className="text-xs text-theme-tertiary mt-3">
                ¡Y esto es de por vida! Mientras tus referidos generen rendimientos, tú ganas comisiones.
              </p>
            </div>
          </div>
        )}

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-theme-card rounded-xl border border-theme-light p-6 shadow-theme-md">
            <h4 className="font-semibold mb-3 text-theme-primary">📈 Dónde Compartir</h4>
            <ul className="space-y-2 text-sm text-theme-tertiary">
              <li>• Grupos de WhatsApp de cripto en Argentina</li>
              <li>• Canales de Telegram de DeFi en Chile</li>
              <li>• Grupos de Facebook de ahorro en México</li>
              <li>• Tu red de amigos y familiares</li>
              <li>• Twitter/X con hashtags LATAM</li>
            </ul>
          </div>

          <div className="bg-theme-card rounded-xl border border-theme-light p-6 shadow-theme-md">
            <h4 className="font-semibold mb-3 text-theme-primary">🎯 Consejos para Más Referidos</h4>
            <ul className="space-y-2 text-sm text-theme-tertiary">
              <li>• Explica cómo protege contra la inflación</li>
              <li>• Menciona las bajas fees de Base Network</li>
              <li>• Destaca la seguridad de Morpho Blue</li>
              <li>• Comparte tus propios resultados</li>
              <li>• Ofrece ayuda para comenzar</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReferralSystem;
