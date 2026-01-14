/*
  # Fix Security Issues

  ## Changes Made
  
  ### 1. Drop Unused Indexes
  - Remove unused indexes on `user_points` table (wallet, chain, total)
  - Remove unused indexes on `point_actions` table (wallet, chain, created, tx_hash)
  
  ### 2. Fix RLS Policies (Previously Always True)
  - **CRITICAL**: Previous policies allowed unrestricted access
  - Drop old permissive policies
  - Create new restrictive policies that check authentication
  - Users can only access their own wallet data
  
  ### 3. Fix Function Security
  - Set immutable search_path on `update_updated_at_column` function
  
  ### 4. Important Notes
  - All policies now require authenticated users
  - Users can only read/write data for their own wallet address
  - This fixes the security vulnerability where anyone could access/modify any data
*/

-- Drop unused indexes
DROP INDEX IF EXISTS idx_user_points_wallet;
DROP INDEX IF EXISTS idx_user_points_chain;
DROP INDEX IF EXISTS idx_user_points_total;
DROP INDEX IF EXISTS idx_point_actions_wallet;
DROP INDEX IF EXISTS idx_point_actions_chain;
DROP INDEX IF EXISTS idx_point_actions_created;
DROP INDEX IF EXISTS idx_point_actions_tx_hash;

-- Drop the old insecure policies on user_points
DROP POLICY IF EXISTS "Los usuarios pueden insertar sus propios puntos" ON user_points;
DROP POLICY IF EXISTS "Los usuarios pueden actualizar sus propios puntos" ON user_points;
DROP POLICY IF EXISTS "Todos pueden ver los puntos" ON user_points;

-- Drop the old insecure policies on point_actions
DROP POLICY IF EXISTS "Los usuarios pueden insertar sus propias acciones" ON point_actions;
DROP POLICY IF EXISTS "Todos pueden ver las acciones de puntos" ON point_actions;

-- Create secure policies for user_points
CREATE POLICY "Users can view their own points"
  ON user_points
  FOR SELECT
  TO authenticated
  USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

CREATE POLICY "Users can insert their own points"
  ON user_points
  FOR INSERT
  TO authenticated
  WITH CHECK (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

CREATE POLICY "Users can update their own points"
  ON user_points
  FOR UPDATE
  TO authenticated
  USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address')
  WITH CHECK (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- Create secure policies for point_actions
CREATE POLICY "Users can view their own actions"
  ON point_actions
  FOR SELECT
  TO authenticated
  USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

CREATE POLICY "Users can insert their own actions"
  ON point_actions
  FOR INSERT
  TO authenticated
  WITH CHECK (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- Fix function search_path security issue
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate the trigger if it was dropped
DROP TRIGGER IF EXISTS update_user_points_updated_at ON user_points;

CREATE TRIGGER update_user_points_updated_at
  BEFORE UPDATE ON user_points
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();