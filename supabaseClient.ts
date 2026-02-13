
import { createClient } from '@supabase/supabase-js';

// Access variables via process.env. Vite's 'define' config will replace these at build/dev time.
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// Check if variables are present and not empty
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

/**
 * We initialize the client with fallback strings if the environment variables are missing.
 * This prevents @supabase/supabase-js from throwing a "supabaseUrl is required" error 
 * immediately on page load, allowing the React application to mount and display 
 * a professional "Configuration Fault" UI instead of a blank white screen.
 */
const clientUrl = supabaseUrl || 'https://placeholder.supabase.co';
const clientKey = supabaseAnonKey || 'placeholder-key';

export const supabase = createClient(clientUrl, clientKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
