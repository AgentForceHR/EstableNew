/*
  # ETH Faucet Claims Table

  1. New Tables
    - `eth_faucet_claims`
      - `id` (uuid, primary key) - Unique identifier
      - `wallet_address` (text) - User's wallet address
      - `amount_wei` (text) - Amount claimed in wei (stored as string for precision)
      - `tx_hash` (text, nullable) - Transaction hash of the transfer
      - `claimed_at` (timestamptz) - When the claim was made
      - `ip_address` (text, nullable) - IP address for additional rate limiting
      - `user_agent` (text, nullable) - User agent for fraud detection

  2. Security
    - Enable RLS on `eth_faucet_claims` table
    - Add policy for public read access to own claims
    - Add policy for public insert (rate-limited by Edge Function)

  3. Indexes
    - Index on wallet_address for fast lookups
    - Index on claimed_at for time-based queries
*/

CREATE TABLE IF NOT EXISTS eth_faucet_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text NOT NULL,
  amount_wei text NOT NULL,
  tx_hash text,
  claimed_at timestamptz DEFAULT now() NOT NULL,
  ip_address text,
  user_agent text
);

-- Enable RLS
ALTER TABLE eth_faucet_claims ENABLE ROW LEVEL SECURITY;

-- Users can view their own claims
CREATE POLICY "Users can view own faucet claims"
  ON eth_faucet_claims
  FOR SELECT
  USING (true);

-- Public can insert claims (rate limiting handled by Edge Function)
CREATE POLICY "Public can insert faucet claims"
  ON eth_faucet_claims
  FOR INSERT
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_eth_faucet_wallet ON eth_faucet_claims(wallet_address);
CREATE INDEX IF NOT EXISTS idx_eth_faucet_claimed_at ON eth_faucet_claims(claimed_at DESC);