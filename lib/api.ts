import {
  depositToVault,
  withdrawFromVault,
  getVaultBalance,
  getTotalAssets,
  getReferrer
} from './contracts';

export interface Vault {
  id: string;
  name: string;
  token: string;
  token_address: string;
  vault_contract_address: string;
  protocol: string;
  current_apy: number;
  min_apy: number;
  max_apy: number;
  total_value_locked: number;
  risk_level: string;
  network: string;
  performance_fee_bps: number;
  deposit_fee_bps: number;
  withdrawal_fee_bps: number;
  is_active: boolean;
}

export interface Referral {
  referral_code: string;
  referrer_address: string;
}

export interface RevenueStats {
  performance_fee: number;
  referral_fee: number;
  deposit_fee: number;
  withdrawal_fee: number;
  mev_capture: number;
  total: number;
}

const HARDCODED_VAULTS: Vault[] = [
  {
    id: 'spark-usdc',
    name: 'Spark USDC',
    token: 'USDC',
    token_address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    vault_contract_address: '0x0000000000000000000000000000000000000001',
    protocol: 'Spark.fi',
    current_apy: 14.9,
    min_apy: 8,
    max_apy: 12,
    total_value_locked: 5200000,
    risk_level: 'low',
    network: 'base',
    performance_fee_bps: 1500,
    deposit_fee_bps: 0,
    withdrawal_fee_bps: 0,
    is_active: true
  },
  {
    id: 'steakhouse-usdt',
    name: 'Steakhouse USDT',
    token: 'USDT',
    token_address: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2',
    vault_contract_address: '0x0000000000000000000000000000000000000002',
    protocol: 'Steakhouse',
    current_apy: 16.2,
    min_apy: 10,
    max_apy: 15,
    total_value_locked: 9800000,
    risk_level: 'low',
    network: 'base',
    performance_fee_bps: 1500,
    deposit_fee_bps: 0,
    withdrawal_fee_bps: 0,
    is_active: true
  },
  {
    id: 'sdai-metamorpho',
    name: 'sDAI MetaMorpho',
    token: 'DAI',
    token_address: '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
    vault_contract_address: '0x0000000000000000000000000000000000000003',
    protocol: 'MetaMorpho',
    current_apy: 17.8,
    min_apy: 3.5,
    max_apy: 10,
    total_value_locked: 7300000,
    risk_level: 'low',
    network: 'base',
    performance_fee_bps: 1500,
    deposit_fee_bps: 0,
    withdrawal_fee_bps: 0,
    is_active: true
  }
];

export class EstableAPI {
  private referralCode: string | null = null;

  constructor() {
    const stored = localStorage.getItem('estable_referral_code');
    if (stored) {
      this.referralCode = stored;
    }
  }

  setReferralCode(code: string) {
    this.referralCode = code;
    localStorage.setItem('estable_referral_code', code);
  }

  getReferralCode(): string | null {
    return this.referralCode;
  }

  async fetchVaults(): Promise<Vault[]> {
    const vaults = [...HARDCODED_VAULTS];

    const apyData = await fetchAllVaultAPYs();

    for (const vault of vaults) {
      if (vault.token === 'USDC' && apyData.usdc !== null) {
        vault.current_apy = apyData.usdc;
      } else if (vault.token === 'USDT' && apyData.usdt !== null) {
        vault.current_apy = apyData.usdt;
      } else if (vault.token === 'DAI' && apyData.dai !== null) {
        vault.current_apy = apyData.dai;
      }
    }

    return vaults;
  }

  async deposit(
    vaultId: string,
    vaultAddress: string,
    tokenAddress: string,
    amount: string,
    walletAddress: string,
    referrer?: string
  ) {
    const { txHash, shares } = await depositToVault(
      vaultAddress,
      tokenAddress,
      amount,
      referrer
    );

    return { txHash, shares };
  }

  async withdraw(
    vaultId: string,
    vaultAddress: string,
    shares: string,
    walletAddress: string
  ) {
    const { txHash, amount } = await withdrawFromVault(vaultAddress, shares);
    return { txHash, amount };
  }

  async getBalance(vaultAddress: string, userAddress: string) {
    return getVaultBalance(vaultAddress, userAddress);
  }

  async getReferrer(userAddress: string): Promise<Referral | null> {
    try {
      const referrerAddress = await getReferrer(userAddress);
      if (referrerAddress && referrerAddress !== '0x0000000000000000000000000000000000000000') {
        return {
          referral_code: referrerAddress.slice(0, 10),
          referrer_address: referrerAddress
        };
      }
    } catch (error) {
      console.error('Failed to fetch referrer:', error);
    }
    return null;
  }

  async createReferralCode(walletAddress: string): Promise<Referral> {
    const code = walletAddress.slice(0, 10);
    this.setReferralCode(code);

    return {
      referral_code: code,
      referrer_address: walletAddress
    };
  }

  async getRevenueStats(timeframe: string = '30d'): Promise<RevenueStats> {
    return {
      performance_fee: 125000,
      referral_fee: 42000,
      deposit_fee: 8500,
      withdrawal_fee: 3200,
      mev_capture: 15000,
      total: 193700
    };
  }
}

export const api = new EstableAPI();
