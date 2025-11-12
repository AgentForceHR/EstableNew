import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

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

    const { data: balances, error: balancesError } = await supabase
      .from('user_balances')
      .select(`
        *,
        vaults (
          id,
          name,
          vault_contract_address,
          current_apy,
          protocol,
          risk_level
        )
      `)
      .eq('user_id', user.id)
      .gt('shares', 0);

    if (balancesError) throw balancesError;

    const { data: deposits, error: depositsError } = await supabase
      .from('user_deposits')
      .select('*')
      .eq('user_id', user.id)
      .order('deposited_at', { ascending: false })
      .limit(10);

    if (depositsError) throw depositsError;

    const { data: withdrawals, error: withdrawalsError } = await supabase
      .from('user_withdrawals')
      .select('*')
      .eq('user_id', user.id)
      .order('withdrawn_at', { ascending: false })
      .limit(10);

    if (withdrawalsError) throw withdrawalsError;

    const totalValue = balances?.reduce((sum, balance) => {
      return sum + parseFloat(balance.shares || '0');
    }, 0) || 0;

    return new Response(
      JSON.stringify({
        balances,
        deposits,
        withdrawals,
        totalValue: totalValue.toString(),
      }),
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