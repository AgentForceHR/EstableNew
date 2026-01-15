import React, { useState } from "react";
import { mintTestToken } from "../lib/contracts";

export default function FaucetButtons() {
  const [loading, setLoading] = useState<string | null>(null);

  async function mint(symbol: "USDC" | "USDT" | "DAI") {
    if (!window.ethereum) {
      alert("Por favor instala MetaMask u otra wallet Web3");
      return;
    }

    setLoading(symbol);

    try {
      await mintTestToken(symbol);
      alert(`Se minteron exitosamente 1000 ${symbol} de prueba`);
    } catch (error: any) {
      console.error("Mint failed:", error);
      alert(error.message || `Falló al mintear ${symbol} de prueba. Por favor intenta de nuevo.`);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="bg-theme-card rounded-xl border border-theme-light p-6 md:p-8 shadow-theme-lg">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-theme-primary mb-2">Faucet de Tokens</h3>
          <p className="text-theme-tertiary text-sm">
            Obtén tokens de prueba gratis para Base Sepolia (1000 tokens por clic)
          </p>
        </div>
        <div className="text-4xl">💧</div>
      </div>

      <div className="space-y-3">
        <button
          onClick={() => mint("USDC")}
          disabled={loading !== null}
          className="w-full bg-accent-primary hover:bg-accent-hover disabled:bg-theme-secondary disabled:text-theme-tertiary text-white font-semibold py-3 min-h-[44px] rounded-lg transition-all shadow-theme-md"
        >
          {loading === "USDC" ? "Minteando..." : "Obtener 1000 USDC"}
        </button>
        <button
          onClick={() => mint("USDT")}
          disabled={loading !== null}
          className="w-full bg-accent-primary hover:bg-accent-hover disabled:bg-theme-secondary disabled:text-theme-tertiary text-white font-semibold py-3 min-h-[44px] rounded-lg transition-all shadow-theme-md"
        >
          {loading === "USDT" ? "Minteando..." : "Obtener 1000 USDT"}
        </button>
        <button
          onClick={() => mint("DAI")}
          disabled={loading !== null}
          className="w-full bg-accent-primary hover:bg-accent-hover disabled:bg-theme-secondary disabled:text-theme-tertiary text-white font-semibold py-3 min-h-[44px] rounded-lg transition-all shadow-theme-md"
        >
          {loading === "DAI" ? "Minteando..." : "Obtener 1000 DAI"}
        </button>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg mt-4">
        <h4 className="font-semibold text-blue-400 mb-2 text-sm">ℹ️ Sobre los Tokens</h4>
        <ul className="text-xs text-theme-tertiary space-y-1">
          <li>• Tokens de prueba para Base Sepolia testnet</li>
          <li>• Puedes mintear cuantas veces necesites</li>
          <li>• Usa estos tokens para probar los vaults</li>
          <li>• Estos tokens no tienen valor real</li>
        </ul>
      </div>
    </div>
  );
}
