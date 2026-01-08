import { createClient } from '@supabase/supabase-js';

// @ts-expect-error - Vite provides import.meta.env at runtime
const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL as string | undefined;
// @ts-expect-error - Vite provides import.meta.env at runtime
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY as string | undefined;

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
