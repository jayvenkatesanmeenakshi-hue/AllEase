
import { UserState } from './types';
import { supabase } from './supabaseClient';

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
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password: pass 
    });
    
    if (error) throw error;
    
    if (data.user) {
      // Ensure the user exists in our profiles table immediately
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({ 
          id: data.user.id, 
          email: data.user.email, 
          state: DEFAULT_STATE 
        });
      if (profileError) console.error("Database sync failed:", profileError);
    }
    return data.user;
  },

  login: async (email: string, pass: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ 
      email, 
      password: pass 
    });
    if (error) throw error;
    return data.user;
  },

  logout: async () => {
    await supabase.auth.signOut();
    // Force a clean state reset
    window.location.href = '/';
  },

  getUserState: async (userId: string): Promise<UserState> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('state')
      .eq('id', userId)
      .single();
    
    if (error || !data) return DEFAULT_STATE;
    return data.state as UserState;
  },

  saveUserState: async (userId: string, state: UserState) => {
    await supabase
      .from('profiles')
      .update({ state })
      .eq('id', userId);
  },

  onAuthStateChange: (callback: (user: any) => void) => {
    return supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user || null);
    });
  }
};
