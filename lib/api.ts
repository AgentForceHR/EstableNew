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
  total_value_locked: number;
  risk_level: string;
  is_active: boolean;
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

  setAuthToken(token: string) {
    this.authToken = token;
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
    walletAddress: string
  ) {
    if (!this.authToken) {
      throw new Error('User not authenticated');
    }

    const { txHash, shares } = await depositToVault(
      vaultAddress,
      tokenAddress,
      amount
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
}

export const api = new EstableAPI();
