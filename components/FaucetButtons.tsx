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
    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 md:p-6 mb-6 md:mb-8">
      <div className="flex items-start gap-3 md:gap-4">
        <span className="text-xl md:text-2xl">💧</span>
        <div className="flex-1">
          <h4 className="font-semibold text-blue-400 mb-2 text-sm md:text-base">Faucet de Tokens de Prueba</h4>
          <p className="text-brand-gray text-xs md:text-sm mb-3 md:mb-4">
            Obtén tokens de prueba gratis para Base Sepolia y prueba los vaults
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap gap-2 md:gap-3">
            <button
              onClick={() => mint("USDC")}
              disabled={loading !== null}
              className="bg-brand-green hover:bg-brand-green/90 disabled:bg-brand-gray/20 disabled:cursor-not-allowed text-brand-dark font-semibold px-3 md:px-4 py-2 min-h-[44px] rounded-lg transition-all text-xs md:text-sm"
            >
              {loading === "USDC" ? "Minteando..." : "Obtener USDC de prueba"}
            </button>
            <button
              onClick={() => mint("USDT")}
              disabled={loading !== null}
              className="bg-brand-green hover:bg-brand-green/90 disabled:bg-brand-gray/20 disabled:cursor-not-allowed text-brand-dark font-semibold px-3 md:px-4 py-2 min-h-[44px] rounded-lg transition-all text-xs md:text-sm"
            >
              {loading === "USDT" ? "Minteando..." : "Obtener USDT de prueba"}
            </button>
            <button
              onClick={() => mint("DAI")}
              disabled={loading !== null}
              className="bg-brand-green hover:bg-brand-green/90 disabled:bg-brand-gray/20 disabled:cursor-not-allowed text-brand-dark font-semibold px-3 md:px-4 py-2 min-h-[44px] rounded-lg transition-all text-xs md:text-sm"
            >
              {loading === "DAI" ? "Minteando..." : "Obtener DAI de prueba"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
