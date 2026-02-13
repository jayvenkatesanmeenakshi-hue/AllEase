
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

const LOCAL_STORAGE_KEY = 'allease_guest_state';

const getLocalState = (): UserState => {
  const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!saved) return DEFAULT_STATE;
  try {
    return JSON.parse(saved);
  } catch {
    return DEFAULT_STATE;
  }
};

const saveLocalState = (state: UserState) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
};

export const authService = {
  register: async (email: string, pass: string) => {
    if (!isSupabaseConfigured) {
      console.warn("Supabase not configured. Using Guest Session.");
      return { id: 'guest_user', email: 'guest@allease.ai' };
    }
    
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password: pass 
    });
    
    if (error) throw error;
    
    if (data.user) {
      // Initialize the user profile with the default optimization state
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({ 
          id: data.user.id, 
          email: data.user.email, 
          state: DEFAULT_STATE 
        });
      if (profileError) console.error("Profile creation error:", profileError);
    }
    return data.user;
  },

  login: async (email: string, pass: string) => {
    if (!isSupabaseConfigured) {
      return { id: 'guest_user', email: 'guest@allease.ai' };
    }
    const { data, error } = await supabase.auth.signInWithPassword({ 
      email, 
      password: pass 
    });
    if (error) throw error;
    return data.user;
  },

  logout: async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    } else {
      window.location.reload(); 
    }
  },

  getUserState: async (userId: string): Promise<UserState> => {
    if (!isSupabaseConfigured || userId === 'guest_user') {
      return getLocalState();
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('state')
      .eq('id', userId)
      .single();
    
    if (error || !data) return DEFAULT_STATE;
    return data.state as UserState;
  },

  saveUserState: async (userId: string, state: UserState) => {
    if (!isSupabaseConfigured || userId === 'guest_user') {
      saveLocalState(state);
      return;
    }
    const { error } = await supabase
      .from('profiles')
      .update({ state })
      .eq('id', userId);
    if (error) console.error("Error saving state:", error);
  },

  onAuthStateChange: (callback: (user: any) => void) => {
    if (!isSupabaseConfigured) {
        setTimeout(() => callback({ id: 'guest_user', email: 'guest@allease.ai' }), 0);
        return { data: { subscription: { unsubscribe: () => {} } } };
    }
    return supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user || null);
    });
  }
};
