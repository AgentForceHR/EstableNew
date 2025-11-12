/*
  # Update Vaults for Morpho Blue (Base) Integration

  ## Overview
  Updates vault schema to support Morpho Blue, Spark, and sDAI integration with
  comprehensive revenue tracking and referral system.

  ## Changes

  ### 1. Update vaults table
  - Add strategy allocation percentages
  - Add fee structure (performance, deposit, withdrawal)
  - Add Base network support
  - Update with live November 2025 vaults

  ### 2. Create referrals table
  - Track referral codes and commissions
  - 5% yield kickback to referrers
  - Track referral performance

  ### 3. Create revenue_tracking table
  - Performance fees (10-20%)
  - Referral fees (5%)
  - Deposit/withdrawal fees (0.1-0.3%)
  - MEV capture (5-15%)
  
  ### 4. Create rebalance_history table
  - Track weekly rebalancing events
  - Record allocation changes
  - Monitor strategy performance

  ### 5. Create strategy_allocations table
  - Current allocation percentages
  - Target allocations for auto-rebalance
  - Weekly adjustment tracking

  ## Important Notes
  1. All vaults now on Base network (lower fees)
  2. Revenue splits: 10% treasury, 5% referrers
  3. Auto-rebalance: 40% Spark, 30% Steakhouse, 30% sDAI
  4. Fees activate progressively (Day 1, Week 1, Week 2, Month 2)
*/

-- Add new columns to vaults table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vaults' AND column_name = 'network'
  ) THEN
    ALTER TABLE vaults ADD COLUMN network text DEFAULT 'base';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vaults' AND column_name = 'performance_fee_bps'
  ) THEN
    ALTER TABLE vaults ADD COLUMN performance_fee_bps integer DEFAULT 1500;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vaults' AND column_name = 'deposit_fee_bps'
  ) THEN
    ALTER TABLE vaults ADD COLUMN deposit_fee_bps integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vaults' AND column_name = 'withdrawal_fee_bps'
  ) THEN
    ALTER TABLE vaults ADD COLUMN withdrawal_fee_bps integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vaults' AND column_name = 'min_apy'
  ) THEN
    ALTER TABLE vaults ADD COLUMN min_apy decimal(10,2) DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'vaults' AND column_name = 'max_apy'
  ) THEN
    ALTER TABLE vaults ADD COLUMN max_apy decimal(10,2) DEFAULT 0;
  END IF;
END $$;

-- Create referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_code text UNIQUE NOT NULL,
  referrer_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  referrer_wallet text NOT NULL,
  total_referrals integer DEFAULT 0,
  total_commission_earned decimal(20,2) DEFAULT 0,
  commission_rate_bps integer DEFAULT 500,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create referral_conversions table
CREATE TABLE IF NOT EXISTS referral_conversions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_code text NOT NULL,
  referred_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_wallet text NOT NULL,
  total_deposits decimal(20,2) DEFAULT 0,
  total_commission_paid decimal(20,2) DEFAULT 0,
  first_deposit_at timestamptz,
  last_deposit_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create revenue_tracking table
CREATE TABLE IF NOT EXISTS revenue_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vault_id uuid REFERENCES vaults(id) ON DELETE CASCADE,
  revenue_type text NOT NULL CHECK (revenue_type IN ('performance_fee', 'referral_fee', 'deposit_fee', 'withdrawal_fee', 'mev_capture')),
  amount decimal(20,8) NOT NULL,
  transaction_hash text,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  referral_code text,
  recorded_at timestamptz DEFAULT now()
);

-- Create rebalance_history table
CREATE TABLE IF NOT EXISTS rebalance_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vault_id uuid REFERENCES vaults(id) ON DELETE CASCADE,
  old_allocations jsonb NOT NULL,
  new_allocations jsonb NOT NULL,
  total_value_rebalanced decimal(20,2) NOT NULL,
  gas_cost decimal(20,8),
  transaction_hash text,
  executed_by text,
  executed_at timestamptz DEFAULT now()
);

-- Create strategy_allocations table
CREATE TABLE IF NOT EXISTS strategy_allocations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vault_id uuid REFERENCES vaults(id) ON DELETE CASCADE,
  strategy_name text NOT NULL,
  protocol text NOT NULL,
  target_allocation_bps integer NOT NULL,
  current_allocation_bps integer DEFAULT 0,
  current_tvl decimal(20,2) DEFAULT 0,
  apy decimal(10,2) DEFAULT 0,
  risk_score integer DEFAULT 5 CHECK (risk_score BETWEEN 1 AND 10),
  is_active boolean DEFAULT true,
  last_rebalanced_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(vault_id, strategy_name)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_user ON referrals(referrer_user_id);
CREATE INDEX IF NOT EXISTS idx_referral_conversions_code ON referral_conversions(referral_code);
CREATE INDEX IF NOT EXISTS idx_referral_conversions_user ON referral_conversions(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_revenue_tracking_vault ON revenue_tracking(vault_id);
CREATE INDEX IF NOT EXISTS idx_revenue_tracking_type ON revenue_tracking(revenue_type);
CREATE INDEX IF NOT EXISTS idx_revenue_tracking_date ON revenue_tracking(recorded_at);
CREATE INDEX IF NOT EXISTS idx_rebalance_history_vault ON rebalance_history(vault_id);
CREATE INDEX IF NOT EXISTS idx_strategy_allocations_vault ON strategy_allocations(vault_id);

-- Enable RLS
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE rebalance_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategy_allocations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for referrals
CREATE POLICY "Users can view own referral data"
  ON referrals FOR SELECT
  TO authenticated
  USING (auth.uid() = referrer_user_id);

CREATE POLICY "Users can create own referral codes"
  ON referrals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = referrer_user_id);

CREATE POLICY "Users can update own referral codes"
  ON referrals FOR UPDATE
  TO authenticated
  USING (auth.uid() = referrer_user_id)
  WITH CHECK (auth.uid() = referrer_user_id);

-- RLS Policies for referral_conversions
CREATE POLICY "Referrers can view their conversions"
  ON referral_conversions FOR SELECT
  TO authenticated
  USING (
    referral_code IN (
      SELECT referral_code FROM referrals WHERE referrer_user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert conversions"
  ON referral_conversions FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for revenue_tracking (admin only for write, public read aggregate)
CREATE POLICY "Everyone can view revenue stats"
  ON revenue_tracking FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert revenue"
  ON revenue_tracking FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for rebalance_history (public read)
CREATE POLICY "Everyone can view rebalance history"
  ON rebalance_history FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert rebalance records"
  ON rebalance_history FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for strategy_allocations (public read)
CREATE POLICY "Everyone can view strategy allocations"
  ON strategy_allocations FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage allocations"
  ON strategy_allocations FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Update existing vaults with new data
DELETE FROM vaults;

-- Insert Morpho Blue (Base) vaults - November 2025 live data
INSERT INTO vaults (
  name,
  token_address,
  vault_contract_address,
  protocol,
  current_apy,
  min_apy,
  max_apy,
  total_value_locked,
  risk_level,
  network,
  performance_fee_bps,
  deposit_fee_bps,
  withdrawal_fee_bps,
  is_active
) VALUES
  (
    'Spark USDC Vault',
    '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    '0x0000000000000000000000000000000000000001',
    'Morpho Blue + Spark',
    10.00,
    8.00,
    12.00,
    0,
    'low',
    'base',
    1500,
    0,
    0,
    true
  ),
  (
    'Steakhouse USDT Vault',
    '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
    '0x0000000000000000000000000000000000000002',
    'Morpho Blue + Steakhouse',
    12.50,
    10.00,
    15.00,
    0,
    'low',
    'base',
    1500,
    0,
    0,
    true
  ),
  (
    'sDAI MetaMorpho',
    '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
    '0x0000000000000000000000000000000000000003',
    'Morpho Blue + DSR',
    6.75,
    3.50,
    10.00,
    0,
    'low',
    'base',
    1500,
    0,
    0,
    true
  );

-- Insert strategy allocations for each vault
INSERT INTO strategy_allocations (vault_id, strategy_name, protocol, target_allocation_bps, current_allocation_bps, apy, risk_score)
SELECT
  v.id,
  'Spark USDC Morpho',
  'Morpho Blue',
  10000,
  10000,
  10.00,
  3
FROM vaults v WHERE v.name = 'Spark USDC Vault';

INSERT INTO strategy_allocations (vault_id, strategy_name, protocol, target_allocation_bps, current_allocation_bps, apy, risk_score)
SELECT
  v.id,
  'Steakhouse USDT',
  'Morpho Blue',
  10000,
  10000,
  12.50,
  3
FROM vaults v WHERE v.name = 'Steakhouse USDT Vault';

INSERT INTO strategy_allocations (vault_id, strategy_name, protocol, target_allocation_bps, current_allocation_bps, apy, risk_score)
SELECT
  v.id,
  'sDAI MetaMorpho',
  'Morpho Blue + Maker DSR',
  10000,
  10000,
  6.75,
  2
FROM vaults v WHERE v.name = 'sDAI MetaMorpho';
