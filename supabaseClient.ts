
import { createClient } from '@supabase/supabase-js';

// Accessing environment variables directly for strict production behavior
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

// If these are missing, createClient will throw a descriptive error for the developer
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Export a simple boolean for UI hints
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
