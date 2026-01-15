import { ethers } from "ethers";
import testnetDeployments from "../deployments/base-sepolia.json";
import mainnetDeployments from "../deployments/base-mainnet.json";

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
const BASE_MAINNET_CHAIN_ID = 8453;

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

function getDeployments(chainId: number) {
  if (chainId === BASE_MAINNET_CHAIN_ID) {
    return mainnetDeployments;
  } else if (chainId === BASE_SEPOLIA_CHAIN_ID) {
    return testnetDeployments;
  }
  throw new Error(`Unsupported network. Please switch to Base Mainnet (${BASE_MAINNET_CHAIN_ID}) or Base Sepolia (${BASE_SEPOLIA_CHAIN_ID})`);
}

export async function checkChain() {
  const chainId = await getChainId();
  if (chainId !== BASE_SEPOLIA_CHAIN_ID && chainId !== BASE_MAINNET_CHAIN_ID) {
    throw new Error(`Please switch to Base Mainnet (${BASE_MAINNET_CHAIN_ID}) or Base Sepolia (${BASE_SEPOLIA_CHAIN_ID})`);
  }
}

export async function getVaults() {
  const chainId = await getChainId();
  const deployments = getDeployments(chainId);
  return (deployments as any).stableVaults;
}

export async function getTokens() {
  const chainId = await getChainId();
  const deployments = getDeployments(chainId);
  return (deployments as any).tokens;
}

export async function mintTestToken(symbol: "USDC" | "USDT" | "DAI") {
  await checkChain();
  const chainId = await getChainId();

  if (chainId !== BASE_SEPOLIA_CHAIN_ID) {
    throw new Error("Faucet is only available on Base Sepolia testnet");
  }

  const tokens = await getTokens();
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
