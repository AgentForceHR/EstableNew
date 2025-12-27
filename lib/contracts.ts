import { ethers } from "ethers";
import deployments from "../deployments/base-sepolia.json";

declare global {
  interface Window {
    ethereum?: any;
  }
}

const VAULT_ABI = [
  "function deposit(uint256 assets, address referrer) returns (uint256)",
  "function withdraw(uint256 shares) returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function totalAssets() view returns (uint256)"
];

const ERC20_ABI = [
  "function approve(address spender, uint256 amount)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)"
];

const FAUCET_ABI = [
  "function mintFaucet(uint256 amount)"
];

const BASE_SEPOLIA_CHAIN_ID = 84532;

function getProvider() {
  if (!window.ethereum) throw new Error("Wallet not found");
  return new ethers.BrowserProvider(window.ethereum);
}

export async function getSigner() {
  const provider = getProvider();
  return provider.getSigner();
}

export async function getChainId() {
  const provider = getProvider();
  const net = await provider.getNetwork();
  return Number(net.chainId);
}

export async function checkChain() {
  const chainId = await getChainId();
  if (chainId !== BASE_SEPOLIA_CHAIN_ID) {
    throw new Error(`Please switch to Base Sepolia network (chainId: ${BASE_SEPOLIA_CHAIN_ID})`);
  }
}

export function getVaults() {
  return (deployments as any).stableVaults;
}

export function getTokens() {
  return (deployments as any).tokens;
}

export async function mintTestToken(symbol: "USDC" | "USDT" | "DAI") {
  await checkChain();
  const tokens = getTokens();
  const token = tokens[symbol];

  const signer = await getSigner();
  const contract = new ethers.Contract(token.address, FAUCET_ABI, signer);
  const amount = ethers.parseUnits("1000", token.decimals);

  const tx = await contract.mintFaucet(amount);
  await tx.wait();

  return tx.hash;
}

export async function getTokenBalance(tokenAddress: string, userAddress: string) {
  const provider = getProvider();
  const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
  const balance = await contract.balanceOf(userAddress);
  const decimals = await contract.decimals();
  return ethers.formatUnits(balance, decimals);
}

export async function getVaultBalance(vaultAddress: string, userAddress: string) {
  const provider = getProvider();
  const contract = new ethers.Contract(vaultAddress, VAULT_ABI, provider);
  const balance = await contract.balanceOf(userAddress);
  return ethers.formatUnits(balance, 18);
}

export async function approveToken(
  token: string,
  spender: string,
  amount: string,
  decimals: number
) {
  await checkChain();
  const signer = await getSigner();
  const c = new ethers.Contract(token, ERC20_ABI, signer);
  const parsed = ethers.parseUnits(amount, decimals);
  const tx = await c.approve(spender, parsed);
  await tx.wait();
  return tx.hash;
}

export async function deposit(
  vault: string,
  token: string,
  amount: string,
  decimals: number
) {
  await checkChain();
  const signer = await getSigner();
  const parsed = ethers.parseUnits(amount, decimals);
  const v = new ethers.Contract(vault, VAULT_ABI, signer);
  const tx = await v.deposit(parsed, ethers.ZeroAddress);
  await tx.wait();
  return tx.hash;
}

export async function withdraw(vault: string, shares: string) {
  await checkChain();
  const signer = await getSigner();
  const parsed = ethers.parseUnits(shares, 18);
  const v = new ethers.Contract(vault, VAULT_ABI, signer);
  const tx = await v.withdraw(parsed);
  await tx.wait();
  return tx.hash;
}
