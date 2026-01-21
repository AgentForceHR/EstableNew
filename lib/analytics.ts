import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface TestnetUser {
  id: string;
  wallet_address: string;
  first_seen_at: string;
  last_activity_at: string;
  total_actions: number;
  referrer_address?: string;
  ip_address?: string;
  user_agent?: string;
}

export interface TokenMint {
  id: string;
  wallet_address: string;
  token_symbol: string;
  amount: string;
  decimals: number;
  tx_hash: string;
  chain_id: number;
  minted_at: string;
}

export interface VaultTransaction {
  id: string;
  wallet_address: string;
  vault_name: string;
  vault_address: string;
  asset_symbol: string;
  transaction_type: string;
  amount: string;
  shares?: string;
  tx_hash: string;
  chain_id: number;
  referrer_address?: string;
  transacted_at: string;
}

export interface AnalyticsSummary {
  totalUsers: number;
  totalMints: number;
  totalDeposits: number;
  totalWithdrawals: number;
  totalVaultVolume: string;
  totalPoints: number;
  activeUsersLast24h: number;
  activeUsersLast7d: number;
}

// Track user activity
export async function trackUser(
  walletAddress: string,
  referrerAddress?: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  try {
    // Try to update existing user
    const { data: existingUser } = await supabase
      .from('testnet_users')
      .select('id, total_actions')
      .eq('wallet_address', walletAddress.toLowerCase())
      .maybeSingle();

    if (existingUser) {
      await supabase
        .from('testnet_users')
        .update({
          last_activity_at: new Date().toISOString(),
          total_actions: existingUser.total_actions + 1,
        })
        .eq('id', existingUser.id);
    } else {
      // Create new user
      await supabase.from('testnet_users').insert({
        wallet_address: walletAddress.toLowerCase(),
        referrer_address: referrerAddress?.toLowerCase(),
        ip_address: ipAddress,
        user_agent: userAgent,
        total_actions: 1,
      });
    }
  } catch (error) {
    console.error('Error tracking user:', error);
  }
}

// Track token mint
export async function trackTokenMint(
  walletAddress: string,
  tokenSymbol: string,
  amount: string,
  decimals: number,
  txHash: string,
  chainId: number
): Promise<void> {
  try {
    await supabase.from('token_mints').insert({
      wallet_address: walletAddress.toLowerCase(),
      token_symbol: tokenSymbol,
      amount,
      decimals,
      tx_hash: txHash,
      chain_id: chainId,
    });
    await trackUser(walletAddress);
  } catch (error) {
    console.error('Error tracking token mint:', error);
  }
}

// Track vault transaction
export async function trackVaultTransaction(
  walletAddress: string,
  vaultName: string,
  vaultAddress: string,
  assetSymbol: string,
  transactionType: 'deposit' | 'withdraw',
  amount: string,
  shares: string | undefined,
  txHash: string,
  chainId: number,
  referrerAddress?: string
): Promise<void> {
  try {
    await supabase.from('vault_transactions').insert({
      wallet_address: walletAddress.toLowerCase(),
      vault_name: vaultName,
      vault_address: vaultAddress.toLowerCase(),
      asset_symbol: assetSymbol,
      transaction_type: transactionType,
      amount,
      shares,
      tx_hash: txHash,
      chain_id: chainId,
      referrer_address: referrerAddress?.toLowerCase(),
    });
    await trackUser(walletAddress);
  } catch (error) {
    console.error('Error tracking vault transaction:', error);
  }
}

// Track social share
export async function trackSocialShare(
  walletAddress: string,
  platform: string,
  actionType: string,
  pointsEarned: number
): Promise<void> {
  try {
    await supabase.from('social_shares').insert({
      wallet_address: walletAddress.toLowerCase(),
      platform,
      action_type: actionType,
      points_earned: pointsEarned,
    });
    await trackUser(walletAddress);
  } catch (error) {
    console.error('Error tracking social share:', error);
  }
}

// Get all testnet users
export async function getAllTestnetUsers(): Promise<TestnetUser[]> {
  const { data, error } = await supabase
    .from('testnet_users')
    .select('*')
    .order('first_seen_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

// Get token mints for a user
export async function getUserTokenMints(walletAddress: string): Promise<TokenMint[]> {
  const { data, error } = await supabase
    .from('token_mints')
    .select('*')
    .eq('wallet_address', walletAddress.toLowerCase())
    .order('minted_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

// Get vault transactions for a user
export async function getUserVaultTransactions(walletAddress: string): Promise<VaultTransaction[]> {
  const { data, error } = await supabase
    .from('vault_transactions')
    .select('*')
    .eq('wallet_address', walletAddress.toLowerCase())
    .order('transacted_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

// Get all vault transactions
export async function getAllVaultTransactions(): Promise<VaultTransaction[]> {
  const { data, error } = await supabase
    .from('vault_transactions')
    .select('*')
    .order('transacted_at', { ascending: false })
    .limit(100);

  if (error) throw error;
  return data || [];
}

// Get all token mints
export async function getAllTokenMints(): Promise<TokenMint[]> {
  const { data, error } = await supabase
    .from('token_mints')
    .select('*')
    .order('minted_at', { ascending: false })
    .limit(100);

  if (error) throw error;
  return data || [];
}

// Get analytics summary
export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  try {
    // Total users
    const { count: totalUsers } = await supabase
      .from('testnet_users')
      .select('*', { count: 'exact', head: true });

    // Total mints
    const { count: totalMints } = await supabase
      .from('token_mints')
      .select('*', { count: 'exact', head: true });

    // Total deposits
    const { count: totalDeposits } = await supabase
      .from('vault_transactions')
      .select('*', { count: 'exact', head: true })
      .eq('transaction_type', 'deposit');

    // Total withdrawals
    const { count: totalWithdrawals } = await supabase
      .from('vault_transactions')
      .select('*', { count: 'exact', head: true })
      .eq('transaction_type', 'withdraw');

    // Total vault volume (sum of deposits)
    const { data: volumeData } = await supabase
      .from('vault_transactions')
      .select('amount')
      .eq('transaction_type', 'deposit');

    let totalVaultVolume = '0';
    if (volumeData && volumeData.length > 0) {
      const sum = volumeData.reduce((acc, tx) => acc + parseFloat(tx.amount || '0'), 0);
      totalVaultVolume = sum.toFixed(2);
    }

    // Total points
    const { data: pointsData } = await supabase
      .from('user_points')
      .select('total_points');

    const totalPoints = pointsData?.reduce((acc, p) => acc + p.total_points, 0) || 0;

    // Active users last 24h
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count: activeUsersLast24h } = await supabase
      .from('testnet_users')
      .select('*', { count: 'exact', head: true })
      .gte('last_activity_at', yesterday);

    // Active users last 7d
    const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { count: activeUsersLast7d } = await supabase
      .from('testnet_users')
      .select('*', { count: 'exact', head: true })
      .gte('last_activity_at', lastWeek);

    return {
      totalUsers: totalUsers || 0,
      totalMints: totalMints || 0,
      totalDeposits: totalDeposits || 0,
      totalWithdrawals: totalWithdrawals || 0,
      totalVaultVolume,
      totalPoints,
      activeUsersLast24h: activeUsersLast24h || 0,
      activeUsersLast7d: activeUsersLast7d || 0,
    };
  } catch (error) {
    console.error('Error getting analytics summary:', error);
    return {
      totalUsers: 0,
      totalMints: 0,
      totalDeposits: 0,
      totalWithdrawals: 0,
      totalVaultVolume: '0',
      totalPoints: 0,
      activeUsersLast24h: 0,
      activeUsersLast7d: 0,
    };
  }
}

// Get user activity by day (last 30 days)
export async function getUserActivityByDay(): Promise<Array<{ date: string; users: number }>> {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('testnet_users')
      .select('first_seen_at')
      .gte('first_seen_at', thirtyDaysAgo)
      .order('first_seen_at', { ascending: true });

    if (error) throw error;

    // Group by day
    const dayMap = new Map<string, number>();
    data?.forEach((user) => {
      const date = new Date(user.first_seen_at).toISOString().split('T')[0];
      dayMap.set(date, (dayMap.get(date) || 0) + 1);
    });

    return Array.from(dayMap.entries()).map(([date, users]) => ({ date, users }));
  } catch (error) {
    console.error('Error getting user activity by day:', error);
    return [];
  }
}

// Get top users by vault volume
export async function getTopUsersByVolume(limit: number = 10): Promise<Array<{ wallet_address: string; total_volume: string; transaction_count: number }>> {
  try {
    const { data, error } = await supabase
      .from('vault_transactions')
      .select('wallet_address, amount')
      .eq('transaction_type', 'deposit');

    if (error) throw error;

    // Aggregate by wallet
    const walletMap = new Map<string, { total: number; count: number }>();
    data?.forEach((tx) => {
      const wallet = tx.wallet_address;
      const amount = parseFloat(tx.amount || '0');
      const current = walletMap.get(wallet) || { total: 0, count: 0 };
      walletMap.set(wallet, {
        total: current.total + amount,
        count: current.count + 1,
      });
    });

    // Sort and limit
    return Array.from(walletMap.entries())
      .map(([wallet_address, { total, count }]) => ({
        wallet_address,
        total_volume: total.toFixed(2),
        transaction_count: count,
      }))
      .sort((a, b) => parseFloat(b.total_volume) - parseFloat(a.total_volume))
      .slice(0, limit);
  } catch (error) {
    console.error('Error getting top users by volume:', error);
    return [];
  }
}
