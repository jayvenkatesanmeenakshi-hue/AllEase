
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Defensive check for process environment in browser contexts
const getEnvVar = (key: string): string | undefined => {
  try {
    if (typeof process !== 'undefined' && process.env) {
      return process.env[key];
    }
  } catch (e) {
    // Fail silently
  }
  return undefined;
};

const supabaseUrl = getEnvVar('SUPABASE_URL');
const supabaseAnonKey = getEnvVar('SUPABASE_ANON_KEY');

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient = isSupabaseConfigured 
  ? createClient(supabaseUrl!, supabaseAnonKey!) 
  : null as any;
