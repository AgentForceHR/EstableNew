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

const STORAGE_KEYS = {
  USER_POINTS: 'estable_user_points',
  POINT_ACTIONS: 'estable_point_actions',
};

function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function getUserPointsKey(walletAddress: string, chainId: number): string {
  return `${walletAddress.toLowerCase()}_${chainId}`;
}

function getAllUserPoints(): Record<string, UserPoints> {
  const stored = localStorage.getItem(STORAGE_KEYS.USER_POINTS);
  return stored ? JSON.parse(stored) : {};
}

function saveAllUserPoints(points: Record<string, UserPoints>): void {
  localStorage.setItem(STORAGE_KEYS.USER_POINTS, JSON.stringify(points));
}

function getAllPointActions(): PointAction[] {
  const stored = localStorage.getItem(STORAGE_KEYS.POINT_ACTIONS);
  return stored ? JSON.parse(stored) : [];
}

function saveAllPointActions(actions: PointAction[]): void {
  localStorage.setItem(STORAGE_KEYS.POINT_ACTIONS, JSON.stringify(actions));
}

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
  const allPoints = getAllUserPoints();
  const key = getUserPointsKey(walletAddress, chainId);
  return allPoints[key] || null;
}

export async function getPointActions(walletAddress: string, chainId: number): Promise<PointAction[]> {
  const allActions = getAllPointActions();
  return allActions
    .filter(action =>
      action.wallet_address.toLowerCase() === walletAddress.toLowerCase() &&
      action.chain_id === chainId
    )
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
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
      const allActions = getAllPointActions();
      const existingTx = allActions.find(action => action.tx_hash === txHash);

      if (existingTx) {
        console.log('Transaction already processed');
        const userPoints = await getUserPoints(lowerWallet, chainId);
        return { success: false, totalPoints: userPoints?.total_points || 0 };
      }
    }

    const newAction: PointAction = {
      id: generateId(),
      wallet_address: lowerWallet,
      chain_id: chainId,
      action_type: actionType,
      action_label: actionLabel,
      points: points,
      vault_name: vaultName,
      tx_hash: txHash,
      metadata: metadata,
      created_at: new Date().toISOString(),
    };

    const allActions = getAllPointActions();
    allActions.push(newAction);
    saveAllPointActions(allActions);

    let userPoints = await getUserPoints(lowerWallet, chainId);
    const newTotalPoints = (userPoints?.total_points || 0) + points;
    const newLevel = getLevelFromPoints(newTotalPoints);
    const now = new Date().toISOString();

    const allUserPoints = getAllUserPoints();
    const key = getUserPointsKey(lowerWallet, chainId);

    if (userPoints) {
      allUserPoints[key] = {
        ...userPoints,
        total_points: newTotalPoints,
        level: newLevel,
        updated_at: now,
      };
    } else {
      allUserPoints[key] = {
        id: generateId(),
        wallet_address: lowerWallet,
        chain_id: chainId,
        total_points: newTotalPoints,
        level: newLevel,
        created_at: now,
        updated_at: now,
      };
    }

    saveAllUserPoints(allUserPoints);

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
  const allActions = getAllPointActions();
  return allActions.some(action =>
    action.wallet_address.toLowerCase() === walletAddress.toLowerCase() &&
    action.chain_id === chainId &&
    action.action_type === actionType &&
    (!vaultName || action.vault_name === vaultName)
  );
}

export async function getLeaderboard(chainId: number, limit: number = 20): Promise<UserPoints[]> {
  const allPoints = getAllUserPoints();
  return Object.values(allPoints)
    .filter(points => points.chain_id === chainId)
    .sort((a, b) => b.total_points - a.total_points)
    .slice(0, limit);
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
