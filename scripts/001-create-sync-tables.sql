CREATE TABLE IF NOT EXISTS sync_profiles (
  id SERIAL PRIMARY KEY,
  sync_code VARCHAR(6) UNIQUE NOT NULL,
  state_data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sync_code ON sync_profiles(sync_code);
