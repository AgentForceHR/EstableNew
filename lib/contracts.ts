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
  "function decimals() view returns (uint8)"
];

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

export function getVaults() {
  return (deployments as any).stableVaults;
}

export async function approveToken(
  token: string,
  spender: string,
  amount: string,
  decimals: number
) {
  const signer = await getSigner();
  const c = new ethers.Contract(token, ERC20_ABI, signer);
  const parsed = ethers.parseUnits(amount, decimals);
  const tx = await c.approve(spender, parsed);
  await tx.wait();
}

export async function deposit(
  vault: string,
  token: string,
  amount: string,
  decimals: number
) {
  const signer = await getSigner();
  const parsed = ethers.parseUnits(amount, decimals);
  const v = new ethers.Contract(vault, VAULT_ABI, signer);
  const tx = await v.deposit(parsed, ethers.ZeroAddress);
  await tx.wait();
}

export async function withdraw(vault: string, shares: string) {
  const signer = await getSigner();
  const parsed = ethers.parseUnits(shares, 18);
  const v = new ethers.Contract(vault, VAULT_ABI, signer);
  const tx = await v.withdraw(parsed);
  await tx.wait();
}
