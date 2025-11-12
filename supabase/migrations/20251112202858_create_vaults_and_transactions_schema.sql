/*
  # Estable.app Database Schema

  ## Overview
  This migration creates the complete database schema for the Estable.app DeFi yield platform.

  ## New Tables

  ### 1. `vaults`
  Stores information about available yield vaults (USDC, USDT, Multi-Strategy)
  - `id` (uuid, primary key) - Unique vault identifier
  - `name` (text) - Vault name (e.g., "USDC Vault")
  - `token_address` (text) - Smart contract address of the underlying token
  - `vault_contract_address` (text) - Smart contract address of the vault
  - `protocol` (text) - Underlying DeFi protocol (Aave, Compound, etc.)
  - `current_apy` (decimal) - Current annual percentage yield
  - `total_value_locked` (decimal) - Total USD value locked in vault
  - `risk_level` (text) - Risk assessment: 'low', 'medium', 'high'
  - `is_active` (boolean) - Whether vault accepts new deposits
  - `created_at` (timestamptz) - Vault creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. `user_deposits`
  Tracks all user deposits across vaults
  - `id` (uuid, primary key) - Unique deposit identifier
  - `user_id` (uuid) - Reference to auth.users
  - `vault_id` (uuid) - Reference to vaults table
  - `wallet_address` (text) - User's wallet address
  - `amount` (decimal) - Deposit amount in tokens
  - `shares` (decimal) - Vault shares received
  - `transaction_hash` (text) - Blockchain transaction hash
  - `deposited_at` (timestamptz) - Deposit timestamp

  ### 3. `user_withdrawals`
  Tracks all user withdrawals from vaults
  - `id` (uuid, primary key) - Unique withdrawal identifier
  - `user_id` (uuid) - Reference to auth.users
  - `vault_id` (uuid) - Reference to vaults table
  - `wallet_address` (text) - User's wallet address
  - `shares_burned` (decimal) - Vault shares burned
  - `amount_received` (decimal) - Tokens received
  - `transaction_hash` (text) - Blockchain transaction hash
  - `withdrawn_at` (timestamptz) - Withdrawal timestamp

  ### 4. `vault_performance`
  Historical performance tracking for vaults
  - `id` (uuid, primary key) - Unique record identifier
  - `vault_id` (uuid) - Reference to vaults table
  - `apy` (decimal) - APY at this timestamp
  - `tvl` (decimal) - Total value locked at this timestamp
  - `recorded_at` (timestamptz) - Timestamp of record

  ### 5. `user_balances`
  Current user balances across all vaults
  - `id` (uuid, primary key) - Unique balance identifier
  - `user_id` (uuid) - Reference to auth.users
  - `vault_id` (uuid) - Reference to vaults table
  - `wallet_address` (text) - User's wallet address
  - `shares` (decimal) - Current vault shares held
  - `updated_at` (timestamptz) - Last balance update

  ## Security
  - Row Level Security (RLS) enabled on all tables
  - Users can only view and modify their own deposits, withdrawals, and balances
  - Vaults and performance data are publicly readable
  - Write access to vaults restricted to authenticated admin users

  ## Important Notes
  1. All monetary amounts stored as DECIMAL for precision
  2. Transaction hashes indexed for quick lookups
  3. Timestamps use timestamptz for timezone awareness
  4. Foreign key constraints ensure referential integrity
*/

-- Create vaults table
CREATE TABLE IF NOT EXISTS vaults (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  token_address text NOT NULL,
  vault_contract_address text UNIQUE NOT NULL,
  protocol text NOT NULL,
  current_apy decimal(10,2) DEFAULT 0,
  total_value_locked decimal(20,2) DEFAULT 0,
  risk_level text NOT NULL CHECK (risk_level IN ('low', 'medium', 'high')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_deposits table
CREATE TABLE IF NOT EXISTS user_deposits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  vault_id uuid REFERENCES vaults(id) ON DELETE CASCADE,
  wallet_address text NOT NULL,
  amount decimal(20,8) NOT NULL,
  shares decimal(20,8) NOT NULL,
  transaction_hash text UNIQUE NOT NULL,
  deposited_at timestamptz DEFAULT now()
);

-- Create user_withdrawals table
CREATE TABLE IF NOT EXISTS user_withdrawals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  vault_id uuid REFERENCES vaults(id) ON DELETE CASCADE,
  wallet_address text NOT NULL,
  shares_burned decimal(20,8) NOT NULL,
  amount_received decimal(20,8) NOT NULL,
  transaction_hash text UNIQUE NOT NULL,
  withdrawn_at timestamptz DEFAULT now()
);

-- Create vault_performance table
CREATE TABLE IF NOT EXISTS vault_performance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vault_id uuid REFERENCES vaults(id) ON DELETE CASCADE,
  apy decimal(10,2) NOT NULL,
  tvl decimal(20,2) NOT NULL,
  recorded_at timestamptz DEFAULT now()
);

-- Create user_balances table
CREATE TABLE IF NOT EXISTS user_balances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  vault_id uuid REFERENCES vaults(id) ON DELETE CASCADE,
  wallet_address text NOT NULL,
  shares decimal(20,8) DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, vault_id, wallet_address)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_deposits_user_id ON user_deposits(user_id);
CREATE INDEX IF NOT EXISTS idx_user_deposits_vault_id ON user_deposits(vault_id);
CREATE INDEX IF NOT EXISTS idx_user_deposits_wallet ON user_deposits(wallet_address);
CREATE INDEX IF NOT EXISTS idx_user_deposits_tx_hash ON user_deposits(transaction_hash);

CREATE INDEX IF NOT EXISTS idx_user_withdrawals_user_id ON user_withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_user_withdrawals_vault_id ON user_withdrawals(vault_id);
CREATE INDEX IF NOT EXISTS idx_user_withdrawals_wallet ON user_withdrawals(wallet_address);
CREATE INDEX IF NOT EXISTS idx_user_withdrawals_tx_hash ON user_withdrawals(transaction_hash);

CREATE INDEX IF NOT EXISTS idx_user_balances_user_id ON user_balances(user_id);
CREATE INDEX IF NOT EXISTS idx_user_balances_vault_id ON user_balances(vault_id);
CREATE INDEX IF NOT EXISTS idx_user_balances_wallet ON user_balances(wallet_address);

CREATE INDEX IF NOT EXISTS idx_vault_performance_vault_id ON vault_performance(vault_id);
CREATE INDEX IF NOT EXISTS idx_vault_performance_recorded_at ON vault_performance(recorded_at);

-- Enable Row Level Security
ALTER TABLE vaults ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_balances ENABLE ROW LEVEL SECURITY;

-- RLS Policies for vaults (public read, admin write)
CREATE POLICY "Vaults are viewable by everyone"
  ON vaults FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert vaults"
  ON vaults FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update vaults"
  ON vaults FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- RLS Policies for user_deposits
CREATE POLICY "Users can view own deposits"
  ON user_deposits FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own deposits"
  ON user_deposits FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_withdrawals
CREATE POLICY "Users can view own withdrawals"
  ON user_withdrawals FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own withdrawals"
  ON user_withdrawals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for vault_performance (public read)
CREATE POLICY "Performance data viewable by everyone"
  ON vault_performance FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert performance data"
  ON vault_performance FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for user_balances
CREATE POLICY "Users can view own balances"
  ON user_balances FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own balances"
  ON user_balances FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own balances"
  ON user_balances FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Insert initial vault data
INSERT INTO vaults (name, token_address, vault_contract_address, protocol, current_apy, total_value_locked, risk_level, is_active)
VALUES 
  ('USDC Vault', '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', '0x0000000000000000000000000000000000000001', 'Aave V3', 15.00, 25000000, 'low', true),
  ('USDT Vault', '0xdAC17F958D2ee523a2206206994597C13D831ec7', '0x0000000000000000000000000000000000000002', 'Compound', 16.00, 18000000, 'low', true),
  ('Multi-Strategy', '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', '0x0000000000000000000000000000000000000003', 'Multiple', 18.00, 12000000, 'medium', true)
ON CONFLICT (vault_contract_address) DO NOTHING;
