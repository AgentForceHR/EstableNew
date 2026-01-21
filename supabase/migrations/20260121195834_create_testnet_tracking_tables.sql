/*
  # Comprehensive Testnet Tracking System

  1. New Tables
    - `testnet_users`
      - `id` (uuid, primary key) - Unique identifier
      - `wallet_address` (text, unique) - User's wallet address
      - `first_seen_at` (timestamptz) - First activity timestamp
      - `last_activity_at` (timestamptz) - Most recent activity timestamp
      - `total_actions` (integer) - Total number of actions taken
      - `referrer_address` (text, nullable) - Who referred this user
      - `ip_address` (text, nullable) - IP address for analytics
      - `user_agent` (text, nullable) - User agent string
      
    - `token_mints`
      - `id` (uuid, primary key) - Unique identifier
      - `wallet_address` (text) - User's wallet address
      - `token_symbol` (text) - Token minted (USDC, USDT, DAI)
      - `amount` (text) - Amount minted (stored as string for precision)
      - `decimals` (integer) - Token decimals
      - `tx_hash` (text) - Transaction hash
      - `chain_id` (integer) - Chain ID (84532 for Base Sepolia)
      - `minted_at` (timestamptz) - When the mint occurred
      
    - `vault_transactions`
      - `id` (uuid, primary key) - Unique identifier
      - `wallet_address` (text) - User's wallet address
      - `vault_name` (text) - Name of the vault
      - `vault_address` (text) - Contract address of vault
      - `asset_symbol` (text) - Asset used (USDC, USDT, DAI)
      - `transaction_type` (text) - Type: deposit or withdraw
      - `amount` (text) - Amount transacted
      - `shares` (text, nullable) - Shares received/burned
      - `tx_hash` (text) - Transaction hash
      - `chain_id` (integer) - Chain ID
      - `referrer_address` (text, nullable) - Referrer address if deposit
      - `transacted_at` (timestamptz) - When transaction occurred
      
    - `user_points`
      - `id` (uuid, primary key) - Unique identifier
      - `wallet_address` (text) - User's wallet address
      - `chain_id` (integer) - Chain ID
      - `total_points` (integer) - Total points accumulated
      - `level` (text) - User level (Bronce, Plata, Oro, Platino)
      - `created_at` (timestamptz) - When user started earning points
      - `updated_at` (timestamptz) - Last points update
      
    - `point_actions`
      - `id` (uuid, primary key) - Unique identifier
      - `wallet_address` (text) - User's wallet address
      - `chain_id` (integer) - Chain ID
      - `action_type` (text) - Type of action
      - `action_label` (text) - Human-readable label
      - `points` (integer) - Points earned
      - `vault_name` (text, nullable) - Related vault if applicable
      - `tx_hash` (text, nullable) - Related transaction if applicable
      - `metadata` (jsonb, nullable) - Additional data
      - `created_at` (timestamptz) - When action occurred
      
    - `social_shares`
      - `id` (uuid, primary key) - Unique identifier
      - `wallet_address` (text) - User's wallet address
      - `platform` (text) - Platform (x, facebook, copy_link)
      - `action_type` (text) - Type (share, repost, like, copy)
      - `points_earned` (integer) - Points earned from this share
      - `shared_at` (timestamptz) - When the share occurred
      
    - `referrals`
      - `id` (uuid, primary key) - Unique identifier
      - `referrer_address` (text) - Referrer's wallet address
      - `referred_address` (text) - Referred user's wallet address
      - `first_transaction_at` (timestamptz, nullable) - When referred user made first transaction
      - `total_referred_volume` (text) - Total volume referred user deposited
      - `referrer_rewards` (integer) - Points earned by referrer
      - `created_at` (timestamptz) - When referral was created

  2. Security
    - Enable RLS on all tables
    - Users can view their own data
    - Public read for leaderboards and aggregated data
    - Public insert for tracking (validation in application layer)

  3. Indexes
    - Wallet address indexes for fast lookups
    - Timestamp indexes for time-based queries
    - Chain ID indexes for network filtering
    - Composite indexes for common query patterns
*/

-- Create testnet_users table
CREATE TABLE IF NOT EXISTS testnet_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text UNIQUE NOT NULL,
  first_seen_at timestamptz DEFAULT now() NOT NULL,
  last_activity_at timestamptz DEFAULT now() NOT NULL,
  total_actions integer DEFAULT 0 NOT NULL,
  referrer_address text,
  ip_address text,
  user_agent text
);

-- Create token_mints table
CREATE TABLE IF NOT EXISTS token_mints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text NOT NULL,
  token_symbol text NOT NULL,
  amount text NOT NULL,
  decimals integer NOT NULL,
  tx_hash text NOT NULL,
  chain_id integer NOT NULL,
  minted_at timestamptz DEFAULT now() NOT NULL
);

-- Create vault_transactions table
CREATE TABLE IF NOT EXISTS vault_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text NOT NULL,
  vault_name text NOT NULL,
  vault_address text NOT NULL,
  asset_symbol text NOT NULL,
  transaction_type text NOT NULL,
  amount text NOT NULL,
  shares text,
  tx_hash text NOT NULL,
  chain_id integer NOT NULL,
  referrer_address text,
  transacted_at timestamptz DEFAULT now() NOT NULL
);

-- Create user_points table
CREATE TABLE IF NOT EXISTS user_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text NOT NULL,
  chain_id integer NOT NULL,
  total_points integer DEFAULT 0 NOT NULL,
  level text DEFAULT 'Bronce' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(wallet_address, chain_id)
);

-- Create point_actions table
CREATE TABLE IF NOT EXISTS point_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text NOT NULL,
  chain_id integer NOT NULL,
  action_type text NOT NULL,
  action_label text NOT NULL,
  points integer NOT NULL,
  vault_name text,
  tx_hash text,
  metadata jsonb,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create social_shares table
CREATE TABLE IF NOT EXISTS social_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text NOT NULL,
  platform text NOT NULL,
  action_type text NOT NULL,
  points_earned integer NOT NULL,
  shared_at timestamptz DEFAULT now() NOT NULL
);

-- Create referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_address text NOT NULL,
  referred_address text NOT NULL,
  first_transaction_at timestamptz,
  total_referred_volume text DEFAULT '0' NOT NULL,
  referrer_rewards integer DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(referred_address)
);

-- Enable RLS on all tables
ALTER TABLE testnet_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_mints ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- testnet_users policies
CREATE POLICY "Anyone can view testnet users"
  ON testnet_users FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert testnet users"
  ON testnet_users FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update testnet users"
  ON testnet_users FOR UPDATE
  USING (true);

-- token_mints policies
CREATE POLICY "Anyone can view token mints"
  ON token_mints FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert token mints"
  ON token_mints FOR INSERT
  WITH CHECK (true);

-- vault_transactions policies
CREATE POLICY "Anyone can view vault transactions"
  ON vault_transactions FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert vault transactions"
  ON vault_transactions FOR INSERT
  WITH CHECK (true);

-- user_points policies
CREATE POLICY "Anyone can view user points"
  ON user_points FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert user points"
  ON user_points FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update user points"
  ON user_points FOR UPDATE
  USING (true);

-- point_actions policies
CREATE POLICY "Anyone can view point actions"
  ON point_actions FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert point actions"
  ON point_actions FOR INSERT
  WITH CHECK (true);

-- social_shares policies
CREATE POLICY "Anyone can view social shares"
  ON social_shares FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert social shares"
  ON social_shares FOR INSERT
  WITH CHECK (true);

-- referrals policies
CREATE POLICY "Anyone can view referrals"
  ON referrals FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert referrals"
  ON referrals FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update referrals"
  ON referrals FOR UPDATE
  USING (true);

-- Create indexes for testnet_users
CREATE INDEX IF NOT EXISTS idx_testnet_users_wallet ON testnet_users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_testnet_users_first_seen ON testnet_users(first_seen_at DESC);
CREATE INDEX IF NOT EXISTS idx_testnet_users_last_activity ON testnet_users(last_activity_at DESC);
CREATE INDEX IF NOT EXISTS idx_testnet_users_referrer ON testnet_users(referrer_address) WHERE referrer_address IS NOT NULL;

-- Create indexes for token_mints
CREATE INDEX IF NOT EXISTS idx_token_mints_wallet ON token_mints(wallet_address);
CREATE INDEX IF NOT EXISTS idx_token_mints_token ON token_mints(token_symbol);
CREATE INDEX IF NOT EXISTS idx_token_mints_tx ON token_mints(tx_hash);
CREATE INDEX IF NOT EXISTS idx_token_mints_time ON token_mints(minted_at DESC);
CREATE INDEX IF NOT EXISTS idx_token_mints_chain ON token_mints(chain_id);

-- Create indexes for vault_transactions
CREATE INDEX IF NOT EXISTS idx_vault_tx_wallet ON vault_transactions(wallet_address);
CREATE INDEX IF NOT EXISTS idx_vault_tx_vault ON vault_transactions(vault_name);
CREATE INDEX IF NOT EXISTS idx_vault_tx_type ON vault_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_vault_tx_hash ON vault_transactions(tx_hash);
CREATE INDEX IF NOT EXISTS idx_vault_tx_time ON vault_transactions(transacted_at DESC);
CREATE INDEX IF NOT EXISTS idx_vault_tx_chain ON vault_transactions(chain_id);
CREATE INDEX IF NOT EXISTS idx_vault_tx_referrer ON vault_transactions(referrer_address) WHERE referrer_address IS NOT NULL;

-- Create indexes for user_points
CREATE INDEX IF NOT EXISTS idx_user_points_wallet ON user_points(wallet_address);
CREATE INDEX IF NOT EXISTS idx_user_points_chain ON user_points(chain_id);
CREATE INDEX IF NOT EXISTS idx_user_points_total ON user_points(total_points DESC);
CREATE INDEX IF NOT EXISTS idx_user_points_composite ON user_points(wallet_address, chain_id);

-- Create indexes for point_actions
CREATE INDEX IF NOT EXISTS idx_point_actions_wallet ON point_actions(wallet_address);
CREATE INDEX IF NOT EXISTS idx_point_actions_type ON point_actions(action_type);
CREATE INDEX IF NOT EXISTS idx_point_actions_time ON point_actions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_point_actions_tx ON point_actions(tx_hash) WHERE tx_hash IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_point_actions_chain ON point_actions(chain_id);

-- Create indexes for social_shares
CREATE INDEX IF NOT EXISTS idx_social_shares_wallet ON social_shares(wallet_address);
CREATE INDEX IF NOT EXISTS idx_social_shares_platform ON social_shares(platform);
CREATE INDEX IF NOT EXISTS idx_social_shares_time ON social_shares(shared_at DESC);

-- Create indexes for referrals
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_address);
CREATE INDEX IF NOT EXISTS idx_referrals_referred ON referrals(referred_address);
CREATE INDEX IF NOT EXISTS idx_referrals_created ON referrals(created_at DESC);
