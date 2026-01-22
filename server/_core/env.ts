/**
 * Protocol Guide (Manus) - Environment Configuration
 * 
 * All environment variables used by the application.
 * Variables are loaded from Netlify environment or local .env file.
 */

export const ENV = {
  // App Configuration
  appId: process.env.VITE_APP_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",

  // Authentication
  cookieSecret: process.env.JWT_SECRET ?? "",
  nextAuthSecret: process.env.NEXT_AUTH_SECRET ?? "",
  nextAuthUrl: process.env.NEXT_AUTH_URL ?? "http://localhost:3000",

  // Database (Supabase)
  databaseUrl: process.env.DATABASE_URL ?? "",
  supabaseUrl: process.env.SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY ?? "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",

  // Redis (for distributed rate limiting and caching)
  redisUrl: process.env.REDIS_URL ?? process.env.UPSTASH_REDIS_REST_URL ?? "",
  redisToken: process.env.REDIS_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN ?? "",

  // AI Services
  anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? "",
  voyageApiKey: process.env.VOYAGE_API_KEY ?? "",

  // Stripe Payments
  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? "",
  stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY ?? "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
  stripeProMonthlyPriceId: process.env.STRIPE_PRO_MONTHLY_PRICE_ID ?? "",
  stripeProAnnualPriceId: process.env.STRIPE_PRO_ANNUAL_PRICE_ID ?? "",

  // Legacy Manus OAuth (for migration)
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  // DEPRECATED: Legacy Manus Forge API - safe to remove
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  // DEPRECATED: Legacy Manus Forge API - safe to remove
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
};

/**
 * Validate required environment variables
 */
export function validateEnv(): { valid: boolean; missing: string[] } {
  const required = [
    'ANTHROPIC_API_KEY',
    'VOYAGE_API_KEY',
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'JWT_SECRET',
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Log environment status (for debugging)
 */
export function logEnvStatus(): void {
  const { valid, missing } = validateEnv();
  
  if (valid) {
    console.log('✅ All required environment variables are set');
  } else {
    console.warn('⚠️ Missing environment variables:', missing.join(', '));
  }
  
  console.log('Environment:', ENV.isProduction ? 'production' : 'development');
}
