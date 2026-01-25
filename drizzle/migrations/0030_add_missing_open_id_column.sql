-- Migration: Add missing open_id column to users table
-- This column was in the Drizzle schema but never created in production
-- For existing users, we'll use supabase_id as the open_id value

-- Step 1: Add column as nullable first
ALTER TABLE users ADD COLUMN IF NOT EXISTS open_id VARCHAR(64);

-- Step 2: Backfill existing users with their supabase_id
UPDATE users SET open_id = supabase_id WHERE open_id IS NULL AND supabase_id IS NOT NULL;

-- Step 3: For any remaining nulls, use a generated UUID
UPDATE users SET open_id = gen_random_uuid()::text WHERE open_id IS NULL;

-- Step 4: Make the column NOT NULL
ALTER TABLE users ALTER COLUMN open_id SET NOT NULL;

-- Step 5: Add unique index
CREATE UNIQUE INDEX IF NOT EXISTS users_open_id_unique ON users(open_id);
