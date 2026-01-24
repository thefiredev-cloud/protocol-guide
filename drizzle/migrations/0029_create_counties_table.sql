-- Create counties table (missing from initial PostgreSQL setup)
-- This table was never created because early Drizzle migrations were MySQL syntax
CREATE TABLE IF NOT EXISTS counties (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  state VARCHAR(64) NOT NULL,
  uses_state_protocols BOOLEAN NOT NULL DEFAULT false,
  protocol_version VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Add index for state lookups
CREATE INDEX IF NOT EXISTS idx_counties_state ON counties(state);

-- Add comment
COMMENT ON TABLE counties IS 'US counties for protocol coverage tracking';
