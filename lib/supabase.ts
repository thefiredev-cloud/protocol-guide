import { createClient } from '@supabase/supabase-js';

// Support both Vite (browser) and Node.js (scripts) environments
const viteEnv = typeof import.meta !== 'undefined' ? (import.meta as any).env : undefined;
const nodeEnv = typeof process !== 'undefined' ? process.env : undefined;

const supabaseUrl = viteEnv?.VITE_SUPABASE_URL || nodeEnv?.VITE_SUPABASE_URL || nodeEnv?.SUPABASE_URL;
const supabaseAnonKey = viteEnv?.VITE_SUPABASE_ANON_KEY || nodeEnv?.VITE_SUPABASE_ANON_KEY || nodeEnv?.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not configured. Running in offline mode.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey);
};
