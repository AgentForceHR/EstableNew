import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.39.0";
import { ethers } from "npm:ethers@6.9.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const FAUCET_AMOUNT_ETH = "0.001";
const CLAIM_COOLDOWN_HOURS = 24;
const BASE_SEPOLIA_RPC = "https://sepolia.base.org";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { walletAddress } = await req.json();

    if (!walletAddress || !ethers.isAddress(walletAddress)) {
      return new Response(
        JSON.stringify({ error: "Dirección de wallet inválida" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const faucetPrivateKey = Deno.env.get("FAUCET_PRIVATE_KEY");

    if (!faucetPrivateKey) {
      return new Response(
        JSON.stringify({ error: "Faucet no configurado" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - CLAIM_COOLDOWN_HOURS);

    const { data: recentClaims, error: claimsError } = await supabase
      .from("eth_faucet_claims")
      .select("*")
      .eq("wallet_address", walletAddress.toLowerCase())
      .gte("claimed_at", cutoffTime.toISOString())
      .order("claimed_at", { ascending: false })
      .limit(1);

    if (claimsError) {
      throw new Error(`Error de base de datos: ${claimsError.message}`);
    }

    if (recentClaims && recentClaims.length > 0) {
      const lastClaim = new Date(recentClaims[0].claimed_at);
      const nextClaimTime = new Date(lastClaim.getTime() + CLAIM_COOLDOWN_HOURS * 60 * 60 * 1000);
      const hoursLeft = Math.ceil((nextClaimTime.getTime() - Date.now()) / (60 * 60 * 1000));

      return new Response(
        JSON.stringify({
          error: `Puedes reclamar de nuevo en ${hoursLeft} hora(s)`,
          nextClaimTime: nextClaimTime.toISOString(),
        }),
        {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const provider = new ethers.JsonRpcProvider(BASE_SEPOLIA_RPC);
    const wallet = new ethers.Wallet(faucetPrivateKey, provider);

    const balance = await provider.getBalance(wallet.address);
    const amountWei = ethers.parseEther(FAUCET_AMOUNT_ETH);

    if (balance < amountWei) {
      return new Response(
        JSON.stringify({ error: "El faucet está vacío. Por favor contacta a soporte." }),
        {
          status: 503,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const tx = await wallet.sendTransaction({
      to: walletAddress,
      value: amountWei,
    });

    await tx.wait();

    const { error: insertError } = await supabase
      .from("eth_faucet_claims")
      .insert({
        wallet_address: walletAddress.toLowerCase(),
        amount_wei: amountWei.toString(),
        tx_hash: tx.hash,
        ip_address: req.headers.get("x-forwarded-for") || null,
        user_agent: req.headers.get("user-agent") || null,
      });

    if (insertError) {
      console.error("Failed to record claim:", insertError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        txHash: tx.hash,
        amount: FAUCET_AMOUNT_ETH,
        message: `Se enviaron exitosamente ${FAUCET_AMOUNT_ETH} ETH a ${walletAddress}`,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Faucet error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
