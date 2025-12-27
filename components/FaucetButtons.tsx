import React, { useState } from "react";
import { mintTestToken } from "../lib/contracts";

export default function FaucetButtons() {
  const [loading, setLoading] = useState<string | null>(null);

  async function mint(symbol: "USDC" | "USDT" | "DAI") {
    if (!window.ethereum) {
      alert("Please install MetaMask or another Web3 wallet");
      return;
    }

    setLoading(symbol);

    try {
      await mintTestToken(symbol);
      alert(`Successfully minted 1000 test ${symbol}`);
    } catch (error: any) {
      console.error("Mint failed:", error);
      alert(error.message || `Failed to mint test ${symbol}. Please try again.`);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6 mb-8">
      <div className="flex items-start gap-4">
        <span className="text-2xl">💧</span>
        <div className="flex-1">
          <h4 className="font-semibold text-blue-400 mb-2">Test Token Faucet</h4>
          <p className="text-brand-gray text-sm mb-4">
            Get free test tokens for Base Sepolia to try the vaults
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => mint("USDC")}
              disabled={loading !== null}
              className="bg-brand-green hover:bg-brand-green/90 disabled:bg-brand-gray/20 disabled:cursor-not-allowed text-brand-dark font-semibold px-4 py-2 rounded-lg transition-all text-sm"
            >
              {loading === "USDC" ? "Minting..." : "Get test USDC"}
            </button>
            <button
              onClick={() => mint("USDT")}
              disabled={loading !== null}
              className="bg-brand-green hover:bg-brand-green/90 disabled:bg-brand-gray/20 disabled:cursor-not-allowed text-brand-dark font-semibold px-4 py-2 rounded-lg transition-all text-sm"
            >
              {loading === "USDT" ? "Minting..." : "Get test USDT"}
            </button>
            <button
              onClick={() => mint("DAI")}
              disabled={loading !== null}
              className="bg-brand-green hover:bg-brand-green/90 disabled:bg-brand-gray/20 disabled:cursor-not-allowed text-brand-dark font-semibold px-4 py-2 rounded-lg transition-all text-sm"
            >
              {loading === "DAI" ? "Minting..." : "Get test DAI"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
