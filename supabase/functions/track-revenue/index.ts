import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface RevenueData {
  vault_id: string;
  revenue_type: string;
  amount: string;
  transaction_hash?: string;
  user_id?: string;
  referral_code?: string;
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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (req.method === 'POST') {
      const revenueData: RevenueData = await req.json();

      const { data: revenue, error } = await supabase
        .from('revenue_tracking')
        .insert({
          vault_id: revenueData.vault_id,
          revenue_type: revenueData.revenue_type,
          amount: revenueData.amount,
          transaction_hash: revenueData.transaction_hash,
          user_id: revenueData.user_id,
          referral_code: revenueData.referral_code,
        })
        .select()
        .single();

      if (error) throw error;

      if (revenueData.referral_code && revenueData.revenue_type === 'referral_fee') {
        await supabase
          .from('referrals')
          .update({
            total_commission_earned: supabase.raw('total_commission_earned + ?', [revenueData.amount]),
          })
          .eq('referral_code', revenueData.referral_code);
      }

      return new Response(
        JSON.stringify({ revenue }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    if (req.method === 'GET') {
      const url = new URL(req.url);
      const timeframe = url.searchParams.get('timeframe') || '30d';

      let startDate = new Date();
      switch (timeframe) {
        case '7d':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(startDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(startDate.getDate() - 90);
          break;
        default:
          startDate.setDate(startDate.getDate() - 30);
      }

      const { data: revenueData, error } = await supabase
        .from('revenue_tracking')
        .select('revenue_type, amount, recorded_at')
        .gte('recorded_at', startDate.toISOString())
        .order('recorded_at', { ascending: false });

      if (error) throw error;

      const summary = {
        performance_fee: 0,
        referral_fee: 0,
        deposit_fee: 0,
        withdrawal_fee: 0,
        mev_capture: 0,
        total: 0,
      };

      revenueData?.forEach((item) => {
        const amount = parseFloat(item.amount);
        summary[item.revenue_type] = (summary[item.revenue_type] || 0) + amount;
        summary.total += amount;
      });

      return new Response(
        JSON.stringify({ summary, details: revenueData }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    throw new Error('Method not allowed');
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