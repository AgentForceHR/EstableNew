import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface WithdrawalRequest {
  vault_id: string;
  wallet_address: string;
  shares_burned: string;
  amount_received: string;
  transaction_hash: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const withdrawalData: WithdrawalRequest = await req.json();

    const { data: withdrawal, error: withdrawalError } = await supabase
      .from('user_withdrawals')
      .insert({
        user_id: user.id,
        vault_id: withdrawalData.vault_id,
        wallet_address: withdrawalData.wallet_address.toLowerCase(),
        shares_burned: withdrawalData.shares_burned,
        amount_received: withdrawalData.amount_received,
        transaction_hash: withdrawalData.transaction_hash,
      })
      .select()
      .single();

    if (withdrawalError) throw withdrawalError;

    const { data: currentBalance } = await supabase
      .from('user_balances')
      .select('shares')
      .eq('user_id', user.id)
      .eq('vault_id', withdrawalData.vault_id)
      .eq('wallet_address', withdrawalData.wallet_address.toLowerCase())
      .single();

    if (currentBalance) {
      const newShares = Math.max(0, parseFloat(currentBalance.shares) - parseFloat(withdrawalData.shares_burned));
      
      const { error: balanceError } = await supabase
        .from('user_balances')
        .update({
          shares: newShares.toString(),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .eq('vault_id', withdrawalData.vault_id)
        .eq('wallet_address', withdrawalData.wallet_address.toLowerCase());

      if (balanceError) throw balanceError;
    }

    return new Response(
      JSON.stringify({ success: true, withdrawal }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});