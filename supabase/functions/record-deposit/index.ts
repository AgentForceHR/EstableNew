import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface DepositRequest {
  vault_id: string;
  wallet_address: string;
  amount: string;
  shares: string;
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

    const depositData: DepositRequest = await req.json();

    const { data: deposit, error: depositError } = await supabase
      .from('user_deposits')
      .insert({
        user_id: user.id,
        vault_id: depositData.vault_id,
        wallet_address: depositData.wallet_address.toLowerCase(),
        amount: depositData.amount,
        shares: depositData.shares,
        transaction_hash: depositData.transaction_hash,
      })
      .select()
      .single();

    if (depositError) throw depositError;

    const { error: balanceError } = await supabase
      .from('user_balances')
      .upsert({
        user_id: user.id,
        vault_id: depositData.vault_id,
        wallet_address: depositData.wallet_address.toLowerCase(),
        shares: depositData.shares,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,vault_id,wallet_address',
      });

    if (balanceError) throw balanceError;

    return new Response(
      JSON.stringify({ success: true, deposit }),
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