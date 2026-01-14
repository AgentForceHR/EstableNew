import React, { useState, useEffect } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { addPoints, hasCompletedAction, ACTION_TYPES, POINT_VALUES } from '../lib/points';

const SHARE_POSTS = {
  X_SHORT: `Estoy probando Estable en testnet 🚀
Vaults de USDC/USDT/DAI y ganando puntos 🎯

📌 Mientras más puntos acumule, mayor prioridad/multiplicador tendré en el airdrop cuando salga el token.

👉 https://estable.app

#DeFi #Stablecoins #Testnet`,

  FACEBOOK: `Estoy participando en la testnet de Estable 🚀

✅ Vaults de stablecoins: USDC / USDT / DAI
✅ Pruebas reales de depósito y retiro
✅ Sistema de puntos por usar los vaults y compartir en redes

📌 Importante: mientras más puntos acumules, mayor prioridad/multiplicador tendrás en el airdrop cuando se lance el token.

Únete aquí: https://estable.app

#DeFi #Stablecoins #CryptoLATAM #Testnet`,

  TELEGRAM: `Probando Estable (testnet) 🚀
Vaults USDC/USDT/DAI + sistema de puntos 🎯
📌 Más puntos = mayor prioridad/multiplicador en el airdrop cuando salga el token.
https://estable.app`,

  UNIVERSAL: `Estoy usando Estable en testnet 🚀
Gano puntos usando vaults y compartiendo.
📌 Más puntos = mayor prioridad/multiplicador en el airdrop al lanzar el token.
👉 https://estable.app`
};

const SocialSharing: React.FC = () => {
  const { address } = useAccount();
  const chainId = useChainId();
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [showConfirm, setShowConfirm] = useState<Record<string, boolean>>({});
  const [copiedText, setCopiedText] = useState<string | null>(null);

  useEffect(() => {
    if (address) {
      checkCompletedActions();
    }
  }, [address, chainId]);

  const checkCompletedActions = async () => {
    if (!address) return;

    const actions = [
      ACTION_TYPES.SHARE_X,
      ACTION_TYPES.LIKE_X,
      ACTION_TYPES.REPOST_X,
      ACTION_TYPES.SHARE_FACEBOOK,
      ACTION_TYPES.COPY_LINK,
    ];

    const results: Record<string, boolean> = {};
    for (const action of actions) {
      results[action] = await hasCompletedAction(address, chainId, action);
    }
    setCompleted(results);
  };

  const handleShareX = async () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(SHARE_POSTS.X_SHORT)}`;
    window.open(url, '_blank');

    if (address && !completed[ACTION_TYPES.SHARE_X]) {
      const result = await addPoints(
        address,
        chainId,
        ACTION_TYPES.SHARE_X,
        'Compartir en X (Twitter)',
        POINT_VALUES.SHARE_X
      );
      if (result.success) {
        setCompleted({ ...completed, [ACTION_TYPES.SHARE_X]: true });
        alert(`🎉 ¡Ganaste ${POINT_VALUES.SHARE_X} puntos!`);
      }
    }
  };

  const handleShareFacebook = async () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://estable.app')}&quote=${encodeURIComponent(SHARE_POSTS.FACEBOOK)}`;
    window.open(url, '_blank');

    if (address && !completed[ACTION_TYPES.SHARE_FACEBOOK]) {
      const result = await addPoints(
        address,
        chainId,
        ACTION_TYPES.SHARE_FACEBOOK,
        'Compartir en Facebook',
        POINT_VALUES.SHARE_FACEBOOK
      );
      if (result.success) {
        setCompleted({ ...completed, [ACTION_TYPES.SHARE_FACEBOOK]: true });
        alert(`🎉 ¡Ganaste ${POINT_VALUES.SHARE_FACEBOOK} puntos!`);
      }
    }
  };

  const handleLikeX = () => {
    window.open('https://x.com/Estable_app', '_blank');
    setShowConfirm({ ...showConfirm, like: true });
  };

  const confirmLikeX = async () => {
    if (address && !completed[ACTION_TYPES.LIKE_X]) {
      const result = await addPoints(
        address,
        chainId,
        ACTION_TYPES.LIKE_X,
        'Like en X (Twitter)',
        POINT_VALUES.LIKE_X
      );
      if (result.success) {
        setCompleted({ ...completed, [ACTION_TYPES.LIKE_X]: true });
        setShowConfirm({ ...showConfirm, like: false });
        alert(`🎉 ¡Ganaste ${POINT_VALUES.LIKE_X} puntos!`);
      }
    }
  };

  const handleRepostX = () => {
    window.open('https://x.com/Estable_app', '_blank');
    setShowConfirm({ ...showConfirm, repost: true });
  };

  const confirmRepostX = async () => {
    if (address && !completed[ACTION_TYPES.REPOST_X]) {
      const result = await addPoints(
        address,
        chainId,
        ACTION_TYPES.REPOST_X,
        'Repost en X (Twitter)',
        POINT_VALUES.REPOST_X
      );
      if (result.success) {
        setCompleted({ ...completed, [ACTION_TYPES.REPOST_X]: true });
        setShowConfirm({ ...showConfirm, repost: false });
        alert(`🎉 ¡Ganaste ${POINT_VALUES.REPOST_X} puntos!`);
      }
    }
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText('https://estable.app');

    if (address && !completed[ACTION_TYPES.COPY_LINK]) {
      const result = await addPoints(
        address,
        chainId,
        ACTION_TYPES.COPY_LINK,
        'Copiar enlace para compartir',
        POINT_VALUES.COPY_LINK
      );
      if (result.success) {
        setCompleted({ ...completed, [ACTION_TYPES.COPY_LINK]: true });
        alert(`🎉 ¡Link copiado! Ganaste ${POINT_VALUES.COPY_LINK} puntos!`);
      }
    } else {
      alert('✅ Link copiado al portapapeles');
    }
  };

  const copyText = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(type);
    setTimeout(() => setCopiedText(null), 2000);
  };

  if (!address) {
    return (
      <div className="app-card p-6 sm:p-8 text-center">
        <p className="text-theme-secondary">Conecta tu wallet para ganar puntos compartiendo</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="app-card p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-theme-primary mb-4">🎯 Gana Puntos Compartiendo</h2>
        <p className="text-theme-secondary mb-6">Completa estas acciones en redes sociales para ganar puntos adicionales. Cada acción se puede completar solo una vez.</p>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-theme-secondary rounded-xl border border-theme-light">
            <div className="flex-1">
              <h3 className="font-semibold text-theme-primary">Compartir en X (Twitter)</h3>
              <p className="text-sm text-theme-tertiary">+{POINT_VALUES.SHARE_X} puntos</p>
            </div>
            <button
              onClick={handleShareX}
              disabled={completed[ACTION_TYPES.SHARE_X]}
              className={`app-button px-6 py-2 ${
                completed[ACTION_TYPES.SHARE_X]
                  ? 'bg-theme-secondary text-theme-tertiary cursor-not-allowed'
                  : 'bg-accent-primary text-white hover:bg-accent-hover'
              }`}
            >
              {completed[ACTION_TYPES.SHARE_X] ? '✅ Completado' : 'Compartir'}
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-theme-secondary rounded-xl border border-theme-light">
            <div className="flex-1">
              <h3 className="font-semibold text-theme-primary">Like en X</h3>
              <p className="text-sm text-theme-tertiary">+{POINT_VALUES.LIKE_X} puntos</p>
            </div>
            {!showConfirm.like ? (
              <button
                onClick={handleLikeX}
                disabled={completed[ACTION_TYPES.LIKE_X]}
                className={`app-button px-6 py-2 ${
                  completed[ACTION_TYPES.LIKE_X]
                    ? 'bg-theme-secondary text-theme-tertiary cursor-not-allowed'
                    : 'bg-accent-primary text-white hover:bg-accent-hover'
                }`}
              >
                {completed[ACTION_TYPES.LIKE_X] ? '✅ Completado' : 'Abrir en X'}
              </button>
            ) : (
              <button
                onClick={confirmLikeX}
                className="app-button px-6 py-2 bg-green-600 text-white hover:bg-green-700"
              >
                Confirmar Like
              </button>
            )}
          </div>

          <div className="flex items-center justify-between p-4 bg-theme-secondary rounded-xl border border-theme-light">
            <div className="flex-1">
              <h3 className="font-semibold text-theme-primary">Repost en X</h3>
              <p className="text-sm text-theme-tertiary">+{POINT_VALUES.REPOST_X} puntos</p>
            </div>
            {!showConfirm.repost ? (
              <button
                onClick={handleRepostX}
                disabled={completed[ACTION_TYPES.REPOST_X]}
                className={`app-button px-6 py-2 ${
                  completed[ACTION_TYPES.REPOST_X]
                    ? 'bg-theme-secondary text-theme-tertiary cursor-not-allowed'
                    : 'bg-accent-primary text-white hover:bg-accent-hover'
                }`}
              >
                {completed[ACTION_TYPES.REPOST_X] ? '✅ Completado' : 'Abrir en X'}
              </button>
            ) : (
              <button
                onClick={confirmRepostX}
                className="app-button px-6 py-2 bg-green-600 text-white hover:bg-green-700"
              >
                Confirmar Repost
              </button>
            )}
          </div>

          <div className="flex items-center justify-between p-4 bg-theme-secondary rounded-xl border border-theme-light">
            <div className="flex-1">
              <h3 className="font-semibold text-theme-primary">Compartir en Facebook</h3>
              <p className="text-sm text-theme-tertiary">+{POINT_VALUES.SHARE_FACEBOOK} puntos</p>
            </div>
            <button
              onClick={handleShareFacebook}
              disabled={completed[ACTION_TYPES.SHARE_FACEBOOK]}
              className={`app-button px-6 py-2 ${
                completed[ACTION_TYPES.SHARE_FACEBOOK]
                  ? 'bg-theme-secondary text-theme-tertiary cursor-not-allowed'
                  : 'bg-accent-primary text-white hover:bg-accent-hover'
              }`}
            >
              {completed[ACTION_TYPES.SHARE_FACEBOOK] ? '✅ Completado' : 'Compartir'}
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-theme-secondary rounded-xl border border-theme-light">
            <div className="flex-1">
              <h3 className="font-semibold text-theme-primary">Copiar Link</h3>
              <p className="text-sm text-theme-tertiary">+{POINT_VALUES.COPY_LINK} puntos</p>
            </div>
            <button
              onClick={handleCopyLink}
              disabled={completed[ACTION_TYPES.COPY_LINK]}
              className={`app-button px-6 py-2 ${
                completed[ACTION_TYPES.COPY_LINK]
                  ? 'bg-theme-secondary text-theme-tertiary cursor-not-allowed'
                  : 'bg-accent-primary text-white hover:bg-accent-hover'
              }`}
            >
              {completed[ACTION_TYPES.COPY_LINK] ? '✅ Completado' : 'Copiar'}
            </button>
          </div>
        </div>
      </div>

      <div className="app-card p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-theme-primary mb-4">📝 Posts Sugeridos</h2>
        <p className="text-theme-secondary mb-6">Copia estos textos para compartir en diferentes redes sociales</p>

        <div className="space-y-4">
          <div className="p-4 bg-theme-secondary rounded-xl border border-theme-light">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-theme-primary">Para X (Twitter)</h3>
              <button
                onClick={() => copyText(SHARE_POSTS.X_SHORT, 'x')}
                className="app-button px-4 py-1 text-sm bg-accent-primary text-white hover:bg-accent-hover"
              >
                {copiedText === 'x' ? '✅ Copiado' : 'Copiar'}
              </button>
            </div>
            <p className="text-sm text-theme-tertiary whitespace-pre-line">{SHARE_POSTS.X_SHORT}</p>
          </div>

          <div className="p-4 bg-theme-secondary rounded-xl border border-theme-light">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-theme-primary">Para Facebook</h3>
              <button
                onClick={() => copyText(SHARE_POSTS.FACEBOOK, 'facebook')}
                className="app-button px-4 py-1 text-sm bg-accent-primary text-white hover:bg-accent-hover"
              >
                {copiedText === 'facebook' ? '✅ Copiado' : 'Copiar'}
              </button>
            </div>
            <p className="text-sm text-theme-tertiary whitespace-pre-line">{SHARE_POSTS.FACEBOOK}</p>
          </div>

          <div className="p-4 bg-theme-secondary rounded-xl border border-theme-light">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-theme-primary">Para Telegram/WhatsApp</h3>
              <button
                onClick={() => copyText(SHARE_POSTS.TELEGRAM, 'telegram')}
                className="app-button px-4 py-1 text-sm bg-accent-primary text-white hover:bg-accent-hover"
              >
                {copiedText === 'telegram' ? '✅ Copiado' : 'Copiar'}
              </button>
            </div>
            <p className="text-sm text-theme-tertiary whitespace-pre-line">{SHARE_POSTS.TELEGRAM}</p>
          </div>

          <div className="p-4 bg-theme-secondary rounded-xl border border-theme-light">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-theme-primary">Universal</h3>
              <button
                onClick={() => copyText(SHARE_POSTS.UNIVERSAL, 'universal')}
                className="app-button px-4 py-1 text-sm bg-accent-primary text-white hover:bg-accent-hover"
              >
                {copiedText === 'universal' ? '✅ Copiado' : 'Copiar'}
              </button>
            </div>
            <p className="text-sm text-theme-tertiary whitespace-pre-line">{SHARE_POSTS.UNIVERSAL}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialSharing;
