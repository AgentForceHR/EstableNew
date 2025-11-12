import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getVaults() {
  const response = await fetch(`${supabaseUrl}/functions/v1/get-vaults`, {
    headers: {
      'Authorization': `Bearer ${supabaseAnonKey}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch vaults');
  }

  return response.json();
}

export async function recordDeposit(
  vault_id: string,
  wallet_address: string,
  amount: string,
  shares: string,
  transaction_hash: string,
  authToken: string
) {
  const response = await fetch(`${supabaseUrl}/functions/v1/record-deposit`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      vault_id,
      wallet_address,
      amount,
      shares,
      transaction_hash,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to record deposit');
  }

  return response.json();
}

export async function recordWithdrawal(
  vault_id: string,
  wallet_address: string,
  shares_burned: string,
  amount_received: string,
  transaction_hash: string,
  authToken: string
) {
  const response = await fetch(`${supabaseUrl}/functions/v1/record-withdrawal`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      vault_id,
      wallet_address,
      shares_burned,
      amount_received,
      transaction_hash,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to record withdrawal');
  }

  return response.json();
}

export async function getUserPortfolio(authToken: string) {
  const response = await fetch(`${supabaseUrl}/functions/v1/get-user-portfolio`, {
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch portfolio');
  }

  return response.json();
}
