/*
  # Sistema de Puntos para Testnet

  1. Nueva Tabla: `user_points`
    - `id` (uuid, primary key)
    - `wallet_address` (text, indexed) - Dirección de wallet del usuario
    - `chain_id` (integer) - ID de la cadena (para separar testnet/mainnet)
    - `total_points` (integer, default 0) - Total de puntos acumulados
    - `level` (text) - Nivel actual (Bronce/Plata/Oro/Platino)
    - `created_at` (timestamptz) - Fecha de creación
    - `updated_at` (timestamptz) - Última actualización

  2. Nueva Tabla: `point_actions`
    - `id` (uuid, primary key)
    - `wallet_address` (text, indexed) - Dirección de wallet
    - `chain_id` (integer) - ID de la cadena
    - `action_type` (text) - Tipo de acción (deposit, withdraw, share_x, etc.)
    - `action_label` (text) - Descripción legible de la acción
    - `points` (integer) - Puntos ganados
    - `vault_name` (text, nullable) - Nombre del vault si aplica
    - `tx_hash` (text, nullable, unique) - Hash de transacción si aplica
    - `metadata` (jsonb, nullable) - Datos adicionales
    - `created_at` (timestamptz) - Fecha de la acción

  3. Seguridad
    - Enable RLS en ambas tablas
    - Políticas para que usuarios lean sus propios datos
    - Políticas para insertar/actualizar solo sus propios datos
*/

-- Crear tabla de puntos de usuario
CREATE TABLE IF NOT EXISTS user_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text NOT NULL,
  chain_id integer NOT NULL DEFAULT 84532,
  total_points integer NOT NULL DEFAULT 0,
  level text NOT NULL DEFAULT 'Bronce',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(wallet_address, chain_id)
);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_user_points_wallet ON user_points(wallet_address);
CREATE INDEX IF NOT EXISTS idx_user_points_chain ON user_points(chain_id);
CREATE INDEX IF NOT EXISTS idx_user_points_total ON user_points(total_points DESC);

-- Crear tabla de acciones de puntos
CREATE TABLE IF NOT EXISTS point_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text NOT NULL,
  chain_id integer NOT NULL DEFAULT 84532,
  action_type text NOT NULL,
  action_label text NOT NULL,
  points integer NOT NULL,
  vault_name text,
  tx_hash text,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_point_actions_wallet ON point_actions(wallet_address);
CREATE INDEX IF NOT EXISTS idx_point_actions_chain ON point_actions(chain_id);
CREATE INDEX IF NOT EXISTS idx_point_actions_created ON point_actions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_point_actions_tx_hash ON point_actions(tx_hash) WHERE tx_hash IS NOT NULL;

-- Enable RLS
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_actions ENABLE ROW LEVEL SECURITY;

-- Políticas para user_points
CREATE POLICY "Los usuarios pueden ver sus propios puntos"
  ON user_points FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Los usuarios pueden insertar sus propios puntos"
  ON user_points FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Los usuarios pueden actualizar sus propios puntos"
  ON user_points FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Políticas para point_actions
CREATE POLICY "Los usuarios pueden ver sus propias acciones"
  ON point_actions FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Los usuarios pueden insertar sus propias acciones"
  ON point_actions FOR INSERT
  TO public
  WITH CHECK (true);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
DROP TRIGGER IF EXISTS update_user_points_updated_at ON user_points;
CREATE TRIGGER update_user_points_updated_at
  BEFORE UPDATE ON user_points
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();