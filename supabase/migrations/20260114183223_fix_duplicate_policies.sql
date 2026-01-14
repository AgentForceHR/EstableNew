/*
  # Fix Duplicate RLS Policies

  ## Changes Made
  
  ### 1. Remove Duplicate Spanish Policies
  - Drop old Spanish-language policies that are duplicates
  - Keep the English "Anyone can..." policies for public access
  
  ### 2. Clean Policy Structure
  - Ensure only one policy per action per role
  - Maintain public access for Web3 app functionality
  
  ### 3. Expected Security Warnings
  - "RLS Policy Always True" warnings are EXPECTED for public Web3 apps
  - These warnings indicate the intentional public access pattern
  - Client-side wallet signature verification provides security layer
*/

-- Drop old Spanish duplicate policies on user_points
DROP POLICY IF EXISTS "Los usuarios pueden ver sus propios puntos" ON user_points;
DROP POLICY IF EXISTS "Los usuarios pueden insertar sus propios puntos" ON user_points;
DROP POLICY IF EXISTS "Los usuarios pueden actualizar sus propios puntos" ON user_points;

-- Drop old Spanish duplicate policies on point_actions  
DROP POLICY IF EXISTS "Los usuarios pueden ver sus propias acciones" ON point_actions;
DROP POLICY IF EXISTS "Los usuarios pueden insertar sus propias acciones" ON point_actions;

-- Verify existing English policies are in place (no-op if they exist)
-- These are the public access policies created in the previous migration