import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface PointAction {
  id: string;
  wallet_address: string;
  chain_id: number;
  action_type: string;
  action_label: string;
  points: number;
  vault_name?: string;
  tx_hash?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface UserPoints {
  id: string;
  wallet_address: string;
  chain_id: number;
  total_points: number;
  level: string;
  created_at: string;
  updated_at: string;
}

export const POINT_VALUES = {
  DEPOSIT: 100,
  WITHDRAW: 50,
  FIRST_VAULT_BONUS: 200,
  FIRST_TRANSACTION_BONUS: 300,
  SHARE_X: 150,
  LIKE_X: 50,
  REPOST_X: 100,
  SHARE_FACEBOOK: 150,
  COPY_LINK: 75,
};

export const ACTION_TYPES = {
  DEPOSIT: 'deposit',
  WITHDRAW: 'withdraw',
  FIRST_VAULT: 'first_vault_bonus',
  FIRST_TRANSACTION: 'first_transaction_bonus',
  SHARE_X: 'share_x',
  LIKE_X: 'like_x',
  REPOST_X: 'repost_x',
  SHARE_FACEBOOK: 'share_facebook',
  COPY_LINK: 'copy_link',
};

export function getLevelFromPoints(points: number): string {
  if (points >= 5000) return 'Platino';
  if (points >= 2000) return 'Oro';
  if (points >= 500) return 'Plata';
  return 'Bronce';
}

export function getNextLevelInfo(points: number): { nextLevel: string; pointsNeeded: number } {
  if (points < 500) return { nextLevel: 'Plata', pointsNeeded: 500 - points };
  if (points < 2000) return { nextLevel: 'Oro', pointsNeeded: 2000 - points };
  if (points < 5000) return { nextLevel: 'Platino', pointsNeeded: 5000 - points };
  return { nextLevel: 'Máximo', pointsNeeded: 0 };
}

export async function getUserPoints(walletAddress: string, chainId: number): Promise<UserPoints | null> {
  const { data, error } = await supabase
    .from('user_points')
    .select('*')
    .eq('wallet_address', walletAddress.toLowerCase())
    .eq('chain_id', chainId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching user points:', error);
    return null;
  }

  return data;
}

export async function getPointActions(walletAddress: string, chainId: number): Promise<PointAction[]> {
  const { data, error } = await supabase
    .from('point_actions')
    .select('*')
    .eq('wallet_address', walletAddress.toLowerCase())
    .eq('chain_id', chainId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching point actions:', error);
    return [];
  }

  return data || [];
}

export async function addPoints(
  walletAddress: string,
  chainId: number,
  actionType: string,
  actionLabel: string,
  points: number,
  vaultName?: string,
  txHash?: string,
  metadata?: Record<string, any>
): Promise<{ success: boolean; totalPoints: number }> {
  try {
    const lowerWallet = walletAddress.toLowerCase();

    if (txHash) {
      const { data: existingTx } = await supabase
        .from('point_actions')
        .select('id')
        .eq('tx_hash', txHash)
        .maybeSingle();

      if (existingTx) {
        console.log('Transaction already processed');
        const userPoints = await getUserPoints(lowerWallet, chainId);
        return { success: false, totalPoints: userPoints?.total_points || 0 };
      }
    }

    const { error: actionError } = await supabase
      .from('point_actions')
      .insert({
        wallet_address: lowerWallet,
        chain_id: chainId,
        action_type: actionType,
        action_label: actionLabel,
        points: points,
        vault_name: vaultName,
        tx_hash: txHash,
        metadata: metadata,
      });

    if (actionError) {
      console.error('Error inserting point action:', actionError);
      return { success: false, totalPoints: 0 };
    }

    let userPoints = await getUserPoints(lowerWallet, chainId);
    const newTotalPoints = (userPoints?.total_points || 0) + points;
    const newLevel = getLevelFromPoints(newTotalPoints);

    if (userPoints) {
      const { error: updateError } = await supabase
        .from('user_points')
        .update({
          total_points: newTotalPoints,
          level: newLevel,
        })
        .eq('wallet_address', lowerWallet)
        .eq('chain_id', chainId);

      if (updateError) {
        console.error('Error updating user points:', updateError);
        return { success: false, totalPoints: userPoints.total_points };
      }
    } else {
      const { error: insertError } = await supabase
        .from('user_points')
        .insert({
          wallet_address: lowerWallet,
          chain_id: chainId,
          total_points: newTotalPoints,
          level: newLevel,
        });

      if (insertError) {
        console.error('Error inserting user points:', insertError);
        return { success: false, totalPoints: 0 };
      }
    }

    return { success: true, totalPoints: newTotalPoints };
  } catch (error) {
    console.error('Error in addPoints:', error);
    return { success: false, totalPoints: 0 };
  }
}

export async function hasCompletedAction(
  walletAddress: string,
  chainId: number,
  actionType: string,
  vaultName?: string
): Promise<boolean> {
  const query = supabase
    .from('point_actions')
    .select('id')
    .eq('wallet_address', walletAddress.toLowerCase())
    .eq('chain_id', chainId)
    .eq('action_type', actionType);

  if (vaultName) {
    query.eq('vault_name', vaultName);
  }

  const { data } = await query.maybeSingle();
  return !!data;
}

export async function getLeaderboard(chainId: number, limit: number = 20): Promise<UserPoints[]> {
  const { data, error } = await supabase
    .from('user_points')
    .select('*')
    .eq('chain_id', chainId)
    .order('total_points', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }

  return data || [];
}

export function formatWalletAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export async function handleVaultTransaction(
  walletAddress: string,
  chainId: number,
  vaultName: string,
  transactionType: 'deposit' | 'withdraw',
  txHash: string
): Promise<{ success: boolean; pointsEarned: number; totalPoints: number }> {
  try {
    let pointsEarned = 0;

    const isFirstTransaction = !(await hasCompletedAction(walletAddress, chainId, ACTION_TYPES.FIRST_TRANSACTION));
    if (isFirstTransaction) {
      await addPoints(
        walletAddress,
        chainId,
        ACTION_TYPES.FIRST_TRANSACTION,
        '🎉 Primera transacción en testnet',
        POINT_VALUES.FIRST_TRANSACTION_BONUS,
        undefined,
        undefined,
        { milestone: 'first_transaction' }
      );
      pointsEarned += POINT_VALUES.FIRST_TRANSACTION_BONUS;
    }

    const isFirstVault = !(await hasCompletedAction(walletAddress, chainId, ACTION_TYPES.FIRST_VAULT, vaultName));
    if (isFirstVault) {
      await addPoints(
        walletAddress,
        chainId,
        ACTION_TYPES.FIRST_VAULT,
        `🎁 Primera vez en ${vaultName}`,
        POINT_VALUES.FIRST_VAULT_BONUS,
        vaultName,
        undefined,
        { milestone: 'first_vault' }
      );
      pointsEarned += POINT_VALUES.FIRST_VAULT_BONUS;
    }

    const actionType = transactionType === 'deposit' ? ACTION_TYPES.DEPOSIT : ACTION_TYPES.WITHDRAW;
    const actionLabel = transactionType === 'deposit' ? `Depósito en ${vaultName}` : `Retiro de ${vaultName}`;
    const points = transactionType === 'deposit' ? POINT_VALUES.DEPOSIT : POINT_VALUES.WITHDRAW;

    const result = await addPoints(
      walletAddress,
      chainId,
      actionType,
      actionLabel,
      points,
      vaultName,
      txHash
    );

    pointsEarned += points;

    return {
      success: result.success,
      pointsEarned,
      totalPoints: result.totalPoints,
    };
  } catch (error) {
    console.error('Error handling vault transaction:', error);
    return { success: false, pointsEarned: 0, totalPoints: 0 };
  }
}
