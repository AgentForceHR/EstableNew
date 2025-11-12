import React, { useState } from 'react';
import { api, Referral } from '../lib/api';

const ReferralSystem: React.FC = () => {
  const [referral, setReferral] = useState<Referral | null>(null);
  const [walletAddress, setWalletAddress] = useState('');
  const [walletConnected, setWalletConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const connectWallet = async () => {
    try {
      const address = await api.connect();
      setWalletAddress(address);
      setWalletConnected(true);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      alert('Por favor instala MetaMask para continuar');
    }
  };

  const createReferralCode = async () => {
    if (!walletConnected) {
      alert('Por favor conecta tu wallet primero');
      return;
    }

    try {
      setLoading(true);
      const result = await api.createReferralCode(walletAddress);
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
    <section id="referrals" className="py-20 px-6 bg-brand-blue/10">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Programa de Referidos</h2>
          <p className="text-brand-gray text-lg max-w-2xl mx-auto">
            Gana 5% de comisión de por vida en todos los rendimientos generados por tus referidos
          </p>
        </div>

        {!referral ? (
          <div className="bg-brand-card rounded-xl border border-brand-gray/20 p-8">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-brand-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">🎁</span>
              </div>
              <h3 className="text-2xl font-bold mb-3">Crea tu Código de Referido</h3>
              <p className="text-brand-gray">
                Comparte con tus amigos y gana comisiones automáticamente
              </p>
            </div>

            {!walletConnected ? (
              <button
                onClick={connectWallet}
                className="w-full bg-brand-green hover:bg-brand-green/90 text-brand-dark font-semibold py-4 rounded-lg transition-all"
              >
                Conectar Wallet
              </button>
            ) : (
              <div>
                <div className="bg-brand-dark p-4 rounded-lg mb-6 text-center">
                  <p className="text-sm text-brand-gray mb-2">Wallet Conectada</p>
                  <p className="font-mono">{walletAddress.slice(0, 10)}...{walletAddress.slice(-8)}</p>
                </div>

                <button
                  onClick={createReferralCode}
                  disabled={loading}
                  className="w-full bg-brand-green hover:bg-brand-green/90 disabled:bg-brand-gray/20 text-brand-dark font-semibold py-4 rounded-lg transition-all"
                >
                  {loading ? 'Creando...' : 'Generar Código de Referido'}
                </button>
              </div>
            )}

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-brand-dark p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-brand-green mb-1">5%</div>
                <div className="text-xs text-brand-gray">Comisión de por vida</div>
              </div>
              <div className="bg-brand-dark p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-brand-green mb-1">∞</div>
                <div className="text-xs text-brand-gray">Referidos ilimitados</div>
              </div>
              <div className="bg-brand-dark p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-brand-green mb-1">$0</div>
                <div className="text-xs text-brand-gray">Sin costo de activación</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-brand-card rounded-xl border border-brand-green/50 p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold">Tu Código de Referido</h3>
              <span className="bg-brand-green/20 text-brand-green px-4 py-2 rounded-lg font-bold text-lg">
                {referral.referral_code}
              </span>
            </div>

            <div className="bg-brand-dark p-4 rounded-lg mb-4">
              <p className="text-xs text-brand-gray mb-2">Tu Link de Referido</p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}?ref=${referral.referral_code}`}
                  className="flex-1 bg-transparent text-brand-light text-sm font-mono outline-none"
                />
                <button
                  onClick={copyReferralLink}
                  className="bg-brand-green hover:bg-brand-green/90 text-brand-dark px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                >
                  {copied ? '✓ Copiado' : 'Copiar'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <button
                onClick={shareOnWhatsApp}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <span>📱</span> Compartir en WhatsApp
              </button>
              <button
                onClick={shareOnTelegram}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <span>✈️</span> Compartir en Telegram
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-brand-dark p-4 rounded-lg">
                <div className="text-2xl font-bold text-brand-green mb-1">
                  {referral.total_referrals}
                </div>
                <div className="text-xs text-brand-gray">Referidos Totales</div>
              </div>
              <div className="bg-brand-dark p-4 rounded-lg">
                <div className="text-2xl font-bold text-brand-green mb-1">
                  ${referral.total_commission_earned.toFixed(2)}
                </div>
                <div className="text-xs text-brand-gray">Comisión Ganada</div>
              </div>
              <div className="bg-brand-dark p-4 rounded-lg">
                <div className="text-2xl font-bold text-brand-green mb-1">
                  {referral.commission_rate_bps / 100}%
                </div>
                <div className="text-xs text-brand-gray">Tasa de Comisión</div>
              </div>
            </div>

            <div className="bg-brand-green/10 border border-brand-green/20 p-4 rounded-lg">
              <h4 className="font-semibold text-brand-green mb-2">💡 Ejemplo de Ganancias</h4>
              <p className="text-sm text-brand-gray mb-2">
                Si refiere 10 personas que depositan $1,000 cada una:
              </p>
              <ul className="text-sm text-brand-gray space-y-1">
                <li>• Total depositado: $10,000</li>
                <li>• Rendimiento anual (12% APY): $1,200</li>
                <li>• <strong className="text-brand-green">Tu comisión (5%): $60/año</strong></li>
              </ul>
              <p className="text-xs text-brand-gray mt-3">
                ¡Y esto es de por vida! Mientras tus referidos generen rendimientos, tú ganas comisiones.
              </p>
            </div>
          </div>
        )}

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-brand-card rounded-xl border border-brand-gray/20 p-6">
            <h4 className="font-semibold mb-3">📈 Dónde Compartir</h4>
            <ul className="space-y-2 text-sm text-brand-gray">
              <li>• Grupos de WhatsApp de cripto en Argentina</li>
              <li>• Canales de Telegram de DeFi en Chile</li>
              <li>• Grupos de Facebook de ahorro en México</li>
              <li>• Tu red de amigos y familiares</li>
              <li>• Twitter/X con hashtags LATAM</li>
            </ul>
          </div>

          <div className="bg-brand-card rounded-xl border border-brand-gray/20 p-6">
            <h4 className="font-semibold mb-3">🎯 Consejos para Más Referidos</h4>
            <ul className="space-y-2 text-sm text-brand-gray">
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
