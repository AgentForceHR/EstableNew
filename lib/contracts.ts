import { ethers } from 'ethers';

export const TREASURY_ADDRESS = '0x9017DE667f3835b3A7cb2D50013F65fC3d408BbE';

export const USDC_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
export const USDT_ADDRESS = '0xdAC17F958D2ee523a2206206994597C13D831ec7';

export const VAULT_ABI = [
  'function deposit(uint256 assets, address referrer) external returns (uint256 shares)',
  'function withdraw(uint256 shares) external returns (uint256 assets)',
  'function balanceOf(address account) external view returns (uint256)',
  'function balanceOfAssets(address user) external view returns (uint256)',
  'function convertToShares(uint256 assets) external view returns (uint256)',
  'function convertToAssets(uint256 shares) external view returns (uint256)',
  'function totalAssets() external view returns (uint256)',
  'function getCurrentAPY() external view returns (uint256)',
  'function asset() external view returns (address)',
  'function referrers(address user) external view returns (address)',
];

export const ERC20_ABI = [
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function allowance(address owner, address spender) external view returns (uint256)',
  'function balanceOf(address account) external view returns (uint256)',
  'function decimals() external view returns (uint8)',
  'function symbol() external view returns (string)',
];

export interface VaultContract {
  address: string;
  contract: ethers.Contract;
  asset: string;
  name: string;
}

export async function getProvider() {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('MetaMask not installed');
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  return provider;
}

export async function getSigner() {
  const provider = await getProvider();
  return provider.getSigner();
}

export async function connectWallet(): Promise<string> {
  const provider = await getProvider();
  const accounts = await provider.send('eth_requestAccounts', []);
  return accounts[0];
}

export async function getVaultContract(vaultAddress: string) {
  const signer = await getSigner();
  return new ethers.Contract(vaultAddress, VAULT_ABI, signer);
}

export async function getTokenContract(tokenAddress: string) {
  const signer = await getSigner();
  return new ethers.Contract(tokenAddress, ERC20_ABI, signer);
}

export async function depositToVault(
  vaultAddress: string,
  tokenAddress: string,
  amount: string,
  referrer?: string
): Promise<{ txHash: string; shares: string }> {
  const vault = await getVaultContract(vaultAddress);
  const token = await getTokenContract(tokenAddress);
  const signer = await getSigner();

  const amountBN = ethers.parseUnits(amount, 6);
  const referrerAddress = referrer || ethers.ZeroAddress;

  const allowance = await token.allowance(await signer.getAddress(), vaultAddress);
  if (allowance < amountBN) {
    const approveTx = await token.approve(vaultAddress, ethers.MaxUint256);
    await approveTx.wait();
  }

  const tx = await vault.deposit(amountBN, referrerAddress);
  const receipt = await tx.wait();

  const depositEvent = receipt.logs.find((log: any) => {
    try {
      const parsed = vault.interface.parseLog(log);
      return parsed?.name === 'Deposited';
    } catch {
      return false;
    }
  });

  let shares = '0';
  if (depositEvent) {
    const parsed = vault.interface.parseLog(depositEvent);
    shares = parsed?.args.shares.toString() || '0';
  }

  return {
    txHash: receipt.hash,
    shares,
  };
}

export async function withdrawFromVault(
  vaultAddress: string,
  shares: string
): Promise<{ txHash: string; amount: string }> {
  const vault = await getVaultContract(vaultAddress);

  const sharesBN = ethers.parseUnits(shares, 6);

  const tx = await vault.withdraw(sharesBN);
  const receipt = await tx.wait();

  const withdrawEvent = receipt.logs.find((log: any) => {
    try {
      const parsed = vault.interface.parseLog(log);
      return parsed?.name === 'Withdrawn';
    } catch {
      return false;
    }
  });

  let amount = '0';
  if (withdrawEvent) {
    const parsed = vault.interface.parseLog(withdrawEvent);
    amount = parsed?.args.assets.toString() || '0';
  }

  return {
    txHash: receipt.hash,
    amount,
  };
}

export async function getVaultBalance(vaultAddress: string, userAddress: string) {
  const vault = await getVaultContract(vaultAddress);

  const shares = await vault.balanceOf(userAddress);
  const assets = await vault.balanceOfAssets(userAddress);
  const totalAssets = await vault.totalAssets();
  const apy = await vault.getCurrentAPY();

  return {
    shares: ethers.formatUnits(shares, 6),
    assets: ethers.formatUnits(assets, 6),
    totalAssets: ethers.formatUnits(totalAssets, 6),
    apy: Number(apy) / 100,
  };
}

export async function getTokenBalance(tokenAddress: string, userAddress: string) {
  const token = await getTokenContract(tokenAddress);
  const balance = await token.balanceOf(userAddress);
  const decimals = await token.decimals();
  const symbol = await token.symbol();

  return {
    balance: ethers.formatUnits(balance, decimals),
    symbol,
    decimals: Number(decimals),
  };
}

export async function getTotalAssets(vaultAddress: string): Promise<string> {
  try {
    const vault = await getVaultContract(vaultAddress);
    const totalAssets = await vault.totalAssets();
    return ethers.formatUnits(totalAssets, 6);
  } catch (error) {
    console.error('Error fetching total assets:', error);
    return '0';
  }
}

export async function getReferrer(userAddress: string): Promise<string> {
  try {
    const vaultAddress = '0x0000000000000000000000000000000000000001';
    const vault = await getVaultContract(vaultAddress);
    const referrer = await vault.referrers(userAddress);
    return referrer;
  } catch (error) {
    console.error('Error fetching referrer:', error);
    return ethers.ZeroAddress;
  }
}

declare global {
  interface Window {
    ethereum?: any;
  }
}
