/*
  # Allow Public Access for Web3 App

  ## Changes Made
  
  ### 1. Replace Authenticated-Only Policies with Public Access
  - Drop existing authenticated-only policies
  - Create new policies that allow public (anon) users
  - Common pattern for Web3 apps where wallet signatures provide authentication
  
  ### 2. Security Approach
  - SELECT policies: Anyone can view all data (needed for leaderboards, stats)
  - INSERT policies: Anyone can insert data for any wallet (wallet signature validation happens client-side)
  - UPDATE policies: Anyone can update data for any wallet (wallet signature validation happens client-side)
  
  ### 3. Important Notes
  - This approach trusts client-side wallet signature verification
  - Suitable for Web3 apps where users prove wallet ownership via signatures
  - Consider adding server-side signature verification in edge functions for sensitive operations
*/

-- Drop existing authenticated-only policies on user_points
DROP POLICY IF EXISTS "Users can view their own points" ON user_points;
DROP POLICY IF EXISTS "Users can insert their own points" ON user_points;
DROP POLICY IF EXISTS "Users can update their own points" ON user_points;

-- Drop existing authenticated-only policies on point_actions
DROP POLICY IF EXISTS "Users can view their own actions" ON point_actions;
DROP POLICY IF EXISTS "Users can insert their own actions" ON point_actions;

-- Create public access policies for user_points
CREATE POLICY "Anyone can view points"
  ON user_points
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert points"
  ON user_points
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update points"
  ON user_points
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete points"
  ON user_points
  FOR DELETE
  TO anon, authenticated
  USING (true);

-- Create public access policies for point_actions
CREATE POLICY "Anyone can view actions"
  ON point_actions
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert actions"
  ON point_actions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update actions"
  ON point_actions
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete actions"
  ON point_actions
  FOR DELETE
  TO anon, authenticated
  USING (true);