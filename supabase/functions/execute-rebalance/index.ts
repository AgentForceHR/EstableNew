import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

const TARGET_ALLOCATIONS = {
  'Spark USDC Vault': 4000,
  'Steakhouse USDT Vault': 3000,
  'sDAI MetaMorpho': 3000,
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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: vaults, error: vaultsError } = await supabase
      .from('vaults')
      .select('*')
      .eq('is_active', true);

    if (vaultsError) throw vaultsError;

    const totalTVL = vaults?.reduce((sum, v) => sum + parseFloat(v.total_value_locked), 0) || 0;

    const oldAllocations: Record<string, number> = {};
    const newAllocations: Record<string, number> = {};

    for (const vault of vaults || []) {
      const currentAllocation = totalTVL > 0
        ? (parseFloat(vault.total_value_locked) / totalTVL) * 10000
        : 0;
      
      oldAllocations[vault.name] = currentAllocation;
      newAllocations[vault.name] = TARGET_ALLOCATIONS[vault.name] || 0;

      const targetBps = TARGET_ALLOCATIONS[vault.name] || 0;
      const targetTVL = (totalTVL * targetBps) / 10000;

      await supabase
        .from('strategy_allocations')
        .update({
          current_allocation_bps: targetBps,
          current_tvl: targetTVL,
          last_rebalanced_at: new Date().toISOString(),
        })
        .eq('vault_id', vault.id);
    }

    const { data: rebalance, error: rebalanceError } = await supabase
      .from('rebalance_history')
      .insert({
        vault_id: vaults?.[0]?.id,
        old_allocations: oldAllocations,
        new_allocations: newAllocations,
        total_value_rebalanced: totalTVL,
        executed_by: 'auto-rebalance-cron',
      })
      .select()
      .single();

    if (rebalanceError) throw rebalanceError;

    console.log('✅ Rebalance executed successfully');
    console.log('Total TVL:', totalTVL);
    console.log('Target allocations:', TARGET_ALLOCATIONS);

    return new Response(
      JSON.stringify({
        success: true,
        rebalance,
        summary: {
          totalTVL,
          oldAllocations,
          newAllocations,
        },
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('❌ Rebalance failed:', error);
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