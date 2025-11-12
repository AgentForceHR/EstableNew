import {
  getVaults,
  recordDeposit,
  recordWithdrawal,
  getUserPortfolio
} from './supabase';
import {
  depositToVault,
  withdrawFromVault,
  getVaultBalance,
  connectWallet
} from './contracts';

export interface Vault {
  id: string;
  name: string;
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
  id: string;
  referral_code: string;
  total_referrals: number;
  total_commission_earned: number;
  commission_rate_bps: number;
}

export interface RevenueStats {
  performance_fee: number;
  referral_fee: number;
  deposit_fee: number;
  withdrawal_fee: number;
  mev_capture: number;
  total: number;
}

export interface UserBalance {
  vault_id: string;
  shares: string;
  wallet_address: string;
  vaults: Vault;
}

export interface Portfolio {
  balances: UserBalance[];
  deposits: any[];
  withdrawals: any[];
  totalValue: string;
}

export class EstableAPI {
  private authToken: string | null = null;
  private referralCode: string | null = null;

  setAuthToken(token: string) {
    this.authToken = token;
  }

  setReferralCode(code: string) {
    this.referralCode = code;
  }

  getReferralCode(): string | null {
    return this.referralCode;
  }

  async fetchVaults(): Promise<Vault[]> {
    const response = await getVaults();
    return response.vaults;
  }

  async deposit(
    vaultId: string,
    vaultAddress: string,
    tokenAddress: string,
    amount: string,
    walletAddress: string,
    referrer?: string
  ) {
    if (!this.authToken) {
      throw new Error('User not authenticated');
    }

    const { txHash, shares } = await depositToVault(
      vaultAddress,
      tokenAddress,
      amount,
      referrer
    );

    await recordDeposit(
      vaultId,
      walletAddress,
      amount,
      shares,
      txHash,
      this.authToken
    );

    return { txHash, shares };
  }

  async withdraw(
    vaultId: string,
    vaultAddress: string,
    shares: string,
    walletAddress: string
  ) {
    if (!this.authToken) {
      throw new Error('User not authenticated');
    }

    const { txHash, amount } = await withdrawFromVault(vaultAddress, shares);

    await recordWithdrawal(
      vaultId,
      walletAddress,
      shares,
      amount,
      txHash,
      this.authToken
    );

    return { txHash, amount };
  }

  async getPortfolio(): Promise<Portfolio> {
    if (!this.authToken) {
      throw new Error('User not authenticated');
    }

    return getUserPortfolio(this.authToken);
  }

  async getBalance(vaultAddress: string, userAddress: string) {
    return getVaultBalance(vaultAddress, userAddress);
  }

  async connect(): Promise<string> {
    return connectWallet();
  }

  async createReferralCode(walletAddress: string): Promise<Referral> {
    if (!this.authToken) {
      throw new Error('User not authenticated');
    }

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const response = await fetch(`${supabaseUrl}/functions/v1/create-referral-code`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ wallet_address: walletAddress }),
    });

    if (!response.ok) {
      throw new Error('Failed to create referral code');
    }

    const data = await response.json();
    return data.referral;
  }

  async getRevenueStats(timeframe: string = '30d'): Promise<RevenueStats> {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    const response = await fetch(
      `${supabaseUrl}/functions/v1/track-revenue?timeframe=${timeframe}`,
      {
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch revenue stats');
    }

    const data = await response.json();
    return data.summary;
  }

  async trackRevenue(
    vaultId: string,
    revenueType: string,
    amount: string,
    transactionHash?: string,
    userId?: string,
    referralCode?: string
  ) {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    const response = await fetch(`${supabaseUrl}/functions/v1/track-revenue`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        vault_id: vaultId,
        revenue_type: revenueType,
        amount,
        transaction_hash: transactionHash,
        user_id: userId,
        referral_code: referralCode,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to track revenue');
    }

    return response.json();
  }
}

export const api = new EstableAPI();
