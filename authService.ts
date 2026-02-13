
import { UserState } from './types';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const DEFAULT_STATE: UserState = {
  impactScore: 1,
  moodHistory: [],
  exploredTopics: [],
  quizHistory: [],
  ecoHistory: [],
  lastActionTimestamp: Date.now(),
  dailyActionCount: 0
};

export const authService = {
  register: async (email: string, pass: string) => {
    if (!isSupabaseConfigured) throw new Error("Supabase is not configured.");
    const { data, error } = await supabase.auth.signUp({ email, password: pass });
    if (error) throw error;
    
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({ id: data.user.id, email: data.user.email, state: DEFAULT_STATE });
      if (profileError) console.error("Profile creation error:", profileError);
    }
    return data.user;
  },

  login: async (email: string, pass: string) => {
    if (!isSupabaseConfigured) throw new Error("Supabase is not configured.");
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) throw error;
    return data.user;
  },

  logout: async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
  },

  getUserState: async (userId: string): Promise<UserState> => {
    if (!isSupabaseConfigured) return DEFAULT_STATE;
    const { data, error } = await supabase
      .from('profiles')
      .select('state')
      .eq('id', userId)
      .single();
    
    if (error || !data) return DEFAULT_STATE;
    return data.state as UserState;
  },

  saveUserState: async (userId: string, state: UserState) => {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase
      .from('profiles')
      .update({ state })
      .eq('id', userId);
    if (error) console.error("Error saving state:", error);
  },

  onAuthStateChange: (callback: (user: any) => void) => {
    if (!isSupabaseConfigured) {
        // Return a mock subscription if not configured
        return { data: { subscription: { unsubscribe: () => {} } } };
    }
    return supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user || null);
    });
  }
};
