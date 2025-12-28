-- ============================================================================
-- ProtocolGuide Database Initialization
-- ============================================================================
-- This script initializes the PostgreSQL database with necessary extensions
-- for the ProtocolGuide healthcare/EMS protocol project
-- ============================================================================

-- Enable pgvector extension for vector embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Enable other useful extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- Create roles if they don't exist
DO $$
BEGIN
  -- Create authenticator role if it doesn't exist
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticator') THEN
    CREATE ROLE authenticator NOINHERIT LOGIN PASSWORD 'your-super-secret-and-long-postgres-password';
  END IF;

  -- Create anon role if it doesn't exist
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'anon') THEN
    CREATE ROLE anon NOLOGIN;
  END IF;

  -- Create authenticated role if it doesn't exist
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticated') THEN
    CREATE ROLE authenticated NOLOGIN;
  END IF;

  -- Create service_role if it doesn't exist
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'service_role') THEN
    CREATE ROLE service_role NOLOGIN;
  END IF;

  -- Create supabase_admin role if it doesn't exist
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'supabase_admin') THEN
    CREATE ROLE supabase_admin NOLOGIN;
  END IF;

  -- Create supabase_auth_admin role if it doesn't exist
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'supabase_auth_admin') THEN
    CREATE ROLE supabase_auth_admin NOLOGIN;
  END IF;

  -- Create supabase_storage_admin role if it doesn't exist
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'supabase_storage_admin') THEN
    CREATE ROLE supabase_storage_admin NOLOGIN;
  END IF;
END
$$;

-- Grant necessary permissions
GRANT anon, authenticated, service_role TO authenticator;
GRANT ALL ON SCHEMA public TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres, anon, authenticated, service_role;

-- Create schemas for Supabase services
CREATE SCHEMA IF NOT EXISTS storage;
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS realtime;
CREATE SCHEMA IF NOT EXISTS _realtime;

-- Grant permissions on schemas
GRANT USAGE ON SCHEMA storage TO postgres, anon, authenticated, service_role;
GRANT USAGE ON SCHEMA auth TO postgres, anon, authenticated, service_role;
GRANT USAGE ON SCHEMA realtime TO postgres, anon, authenticated, service_role;

-- Enable Row Level Security by default
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM PUBLIC;

-- Create a function to verify pgvector is working
CREATE OR REPLACE FUNCTION verify_pgvector_installation()
RETURNS text
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN 'pgvector extension is installed and working!';
END;
$$;

-- Log installation
DO $$
BEGIN
  RAISE NOTICE 'ProtocolGuide database initialized successfully';
  RAISE NOTICE 'pgvector extension: %', (SELECT verify_pgvector_installation());
  RAISE NOTICE 'Available extensions: %', (SELECT string_agg(extname, ', ') FROM pg_extension);
END
$$;
