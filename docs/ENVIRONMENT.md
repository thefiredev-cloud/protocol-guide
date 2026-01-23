# Environment Variable Configuration

Protocol Guide uses type-safe environment validation with Zod to ensure all required configuration is present at startup.

## Quick Start

1. Copy the example file:
   ```bash
   cp .env.example .env
   ```

2. Fill in required values (see below)

3. Start the server - validation happens automatically:
   ```bash
   pnpm dev
   ```

If any required variables are missing or invalid, you'll get helpful error messages with instructions.

## Required Environment Variables

### AI Services

#### ANTHROPIC_API_KEY (Required)
- **Format**: Must start with `sk-ant-`
- **Get from**: https://console.anthropic.com/
- **Purpose**: Claude API for protocol retrieval and RAG
- **Example**: `sk-ant-api03-...`

#### VOYAGE_API_KEY (Required)
- **Format**: Must start with `pa-`
- **Get from**: https://www.voyageai.com/
- **Purpose**: Vector embeddings for semantic search
- **Example**: `pa-...`

### Database (Supabase)

#### SUPABASE_URL (Required)
- **Format**: Valid HTTPS URL
- **Get from**: Supabase Dashboard > Settings > API
- **Example**: `https://your-project.supabase.co`

#### SUPABASE_ANON_KEY (Required)
- **Format**: JWT starting with `eyJ`
- **Purpose**: Client-side database access (public)
- **Get from**: Supabase Dashboard > Settings > API

#### SUPABASE_SERVICE_ROLE_KEY (Required)
- **Format**: JWT starting with `eyJ`
- **Purpose**: Server-side database access with admin privileges
- **Security**: NEVER expose this in client code or commit to git
- **Get from**: Supabase Dashboard > Settings > API

#### DATABASE_URL (Required)
- **Format**: `postgresql://...`
- **Purpose**: Direct Postgres connection for Drizzle ORM
- **Get from**: Supabase Dashboard > Settings > Database
- **Example**: `postgresql://postgres:password@db.project.supabase.co:5432/postgres`

### Stripe Payments

#### STRIPE_SECRET_KEY (Required)
- **Format**: `sk_test_...` or `sk_live_...`
- **Get from**: https://dashboard.stripe.com/apikeys
- **Purpose**: Server-side Stripe API access

#### STRIPE_PUBLISHABLE_KEY (Required)
- **Format**: `pk_test_...` or `pk_live_...`
- **Purpose**: Client-side Stripe API access

#### STRIPE_WEBHOOK_SECRET (Required)
- **Format**: Must start with `whsec_`
- **Get from**: Stripe Dashboard > Webhooks
- **Purpose**: Verify webhook signatures from Stripe

#### STRIPE_PRO_MONTHLY_PRICE_ID (Required)
- **Format**: Must start with `price_`
- **Purpose**: Individual Pro monthly subscription price
- **Get from**: Stripe Dashboard > Products

#### STRIPE_PRO_ANNUAL_PRICE_ID (Required)
- **Format**: Must start with `price_`
- **Purpose**: Individual Pro annual subscription price

#### Department Pricing (Optional)

These are optional unless you're offering department subscriptions:

- `STRIPE_DEPT_SMALL_MONTHLY_PRICE_ID` - Small dept (5-20 users) monthly
- `STRIPE_DEPT_SMALL_ANNUAL_PRICE_ID` - Small dept annual
- `STRIPE_DEPT_LARGE_MONTHLY_PRICE_ID` - Large dept (20+ users) monthly
- `STRIPE_DEPT_LARGE_ANNUAL_PRICE_ID` - Large dept annual

#### STRIPE_TRIAL_PERIOD_DAYS (Optional)
- **Format**: Number 0-365
- **Default**: `7`
- **Purpose**: Trial period length for new subscriptions

### Authentication

#### JWT_SECRET (Required)
- **Format**: At least 32 characters
- **Generate**: `openssl rand -base64 32`
- **Purpose**: Sign session cookies
- **Security**: Keep this secret, rotate periodically

#### NEXT_AUTH_SECRET (Required)
- **Format**: At least 32 characters
- **Generate**: `openssl rand -base64 32`
- **Purpose**: NextAuth session encryption

#### NEXT_AUTH_URL (Optional)
- **Default**: `http://localhost:3000`
- **Production**: Set to your domain (e.g., `https://protocol-guide.com`)

## Optional Environment Variables

### Redis (Recommended for Production)

Protocol Guide uses Redis for distributed rate limiting. If not configured, it falls back to in-memory rate limiting (not suitable for multi-instance deployments).

#### Option 1: Standard Redis
```bash
REDIS_URL=https://your-redis.upstash.io
REDIS_TOKEN=your_token_here
```

#### Option 2: Upstash (Alternative)
```bash
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token_here
```

**Get from**: https://console.upstash.com/

### Server Configuration

#### NODE_ENV
- **Values**: `development`, `production`, `test`
- **Default**: `development`

#### PORT
- **Format**: Number 1-65535
- **Default**: `3000`

#### LOG_LEVEL
- **Values**: `debug`, `info`, `warn`, `error`
- **Default**: `info`

#### EXPO_PORT
- **Format**: Number 1-65535
- **Purpose**: Expo Metro bundler port

### Legacy Manus (Migration Only)

These are only needed if migrating from legacy Manus system:

- `OAUTH_SERVER_URL` - Legacy OAuth server
- `OWNER_OPEN_ID` - Legacy owner ID
- `BUILT_IN_FORGE_API_URL` - DEPRECATED: Forge API URL
- `BUILT_IN_FORGE_API_KEY` - DEPRECATED: Forge API key

## Type-Safe Access

The environment validation system provides type-safe access to all variables:

```typescript
import { env } from '@/server/_core/env';

// Type-safe and guaranteed to exist
const apiKey = env.ANTHROPIC_API_KEY;
const dbUrl = env.DATABASE_URL;
const port = env.PORT; // Already parsed to number
```

## Validation at Startup

Environment validation happens automatically when the server starts. If validation fails, you'll see:

```
❌ Environment validation failed:

  ANTHROPIC_API_KEY:
    Error: ANTHROPIC_API_KEY must start with "sk-ant-"
    Help: Anthropic Claude API key - Get from: https://console.anthropic.com/

  STRIPE_SECRET_KEY:
    Error: STRIPE_SECRET_KEY is required
    Help: Stripe secret key - Get from: https://dashboard.stripe.com/apikeys

📖 See .env.example for required environment variables
```

## Environment-Specific Configuration

### Development (.env.local)
```bash
NODE_ENV=development
PORT=3000

# Use test mode Stripe keys
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Optional: Redis for testing distributed rate limiting
REDIS_URL=https://dev-redis.upstash.io
```

### Production (Netlify)

Set environment variables in Netlify Dashboard > Site Settings > Environment Variables:

1. **Build variables** (available during build):
   - `NODE_ENV=production`
   - `DATABASE_URL`
   - `SUPABASE_URL`

2. **Function variables** (available at runtime):
   - All Stripe keys
   - All API keys
   - Secrets (JWT_SECRET, etc.)

3. **Deploy contexts**:
   - Production branch: Live Stripe keys
   - Preview deploys: Test Stripe keys

## Security Best Practices

### Never Commit Secrets
```bash
# .gitignore already includes:
.env
.env.local
.env.production
```

### Rotate Secrets Regularly
- JWT secrets: Every 90 days
- API keys: When team members leave
- Database passwords: Every 6 months

### Use Separate Environments
- Development: Test API keys, local Supabase
- Staging: Test API keys, staging Supabase
- Production: Live API keys, production Supabase

### Validate at Deployment
Netlify deployment will fail if required environment variables are missing - this is intentional to prevent broken deployments.

## Troubleshooting

### "Environment validation failed"
Check that:
1. `.env` file exists
2. All required variables are set
3. Variable formats are correct (URLs, API key prefixes)

### "ANTHROPIC_API_KEY must start with sk-ant-"
Your API key format is incorrect. Get a fresh key from https://console.anthropic.com/

### "JWT_SECRET must be at least 32 characters"
Generate a secure secret:
```bash
openssl rand -base64 32
```

### "Port 3000 is busy"
The server will automatically find an available port. Check logs for actual port.

### Redis not available
This is a warning, not an error. The server will use in-memory rate limiting. For production, configure Redis.

## Checking Environment Status

```typescript
import { logEnvStatus } from '@/server/_core/env';

logEnvStatus();
```

Output:
```
✅ All required environment variables are validated
📦 Environment: production
🔌 Server port: 3000
🔐 Redis: configured
💳 Stripe: live mode
🤖 AI Services: Anthropic + Voyage AI
```

## Migration from Old System

If you have an old `.env` file without Zod validation:

1. Backup existing `.env`: `cp .env .env.backup`
2. Copy new template: `cp .env.example .env`
3. Migrate values from `.env.backup` to `.env`
4. Test startup: `pnpm dev`
5. Fix any validation errors

## Environment Variable Reference

| Variable | Required | Format | Default |
|----------|----------|--------|---------|
| ANTHROPIC_API_KEY | Yes | `sk-ant-...` | - |
| VOYAGE_API_KEY | Yes | `pa-...` | - |
| SUPABASE_URL | Yes | HTTPS URL | - |
| SUPABASE_ANON_KEY | Yes | JWT | - |
| SUPABASE_SERVICE_ROLE_KEY | Yes | JWT | - |
| DATABASE_URL | Yes | `postgresql://...` | - |
| STRIPE_SECRET_KEY | Yes | `sk_test_...` or `sk_live_...` | - |
| STRIPE_PUBLISHABLE_KEY | Yes | `pk_test_...` or `pk_live_...` | - |
| STRIPE_WEBHOOK_SECRET | Yes | `whsec_...` | - |
| STRIPE_PRO_MONTHLY_PRICE_ID | Yes | `price_...` | - |
| STRIPE_PRO_ANNUAL_PRICE_ID | Yes | `price_...` | - |
| JWT_SECRET | Yes | 32+ chars | - |
| NEXT_AUTH_SECRET | Yes | 32+ chars | - |
| NEXT_AUTH_URL | No | URL | `http://localhost:3000` |
| NODE_ENV | No | dev/prod/test | `development` |
| PORT | No | 1-65535 | `3000` |
| REDIS_URL | No | HTTPS URL | - |
| REDIS_TOKEN | No | String | - |
| LOG_LEVEL | No | debug/info/warn/error | `info` |

See `.env.example` for complete list with descriptions.
