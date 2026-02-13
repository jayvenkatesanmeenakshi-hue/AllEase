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

const LOCAL_STORAGE_KEY = 'allease_state_v1';

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
      // If Supabase isn't setup, we simulate a successful login for the requested email
      console.warn("Supabase not configured. Simulating registration.");
      const guestUser = { id: 'guest_' + btoa(email), email };
      localStorage.setItem('allease_active_session', JSON.stringify(guestUser));
      // Reload or trigger a state update manually since we aren't using Supabase's real listener
      window.location.reload();
      return guestUser;
    }
    
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password: pass 
    });
    
    if (error) throw error;
    
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({ 
          id: data.user.id, 
          email: data.user.email, 
          state: DEFAULT_STATE 
        });
      if (profileError) console.error("Profile initialization failed:", profileError);
    }
    return data.user;
  },

  login: async (email: string, pass: string) => {
    if (!isSupabaseConfigured) {
      console.warn("Supabase not configured. Simulating login.");
      const guestUser = { id: 'guest_' + btoa(email), email };
      localStorage.setItem('allease_active_session', JSON.stringify(guestUser));
      window.location.reload();
      return guestUser;
    }
    const { data, error } = await supabase.auth.signInWithPassword({ 
      email, 
      password: pass 
    });
    if (error) throw error;
    return data.user;
  },

  logout: async () => {
    localStorage.removeItem('allease_active_session');
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    window.location.reload();
  },

  getUserState: async (userId: string): Promise<UserState> => {
    if (!isSupabaseConfigured || userId.startsWith('guest_')) {
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
    if (!isSupabaseConfigured || userId.startsWith('guest_')) {
      saveLocalState(state);
      return;
    }
    await supabase
      .from('profiles')
      .update({ state })
      .eq('id', userId);
  },

  onAuthStateChange: (callback: (user: any) => void) => {
    // Check local session first
    const localSession = localStorage.getItem('allease_active_session');
    if (localSession) {
      try {
        const user = JSON.parse(localSession);
        setTimeout(() => callback(user), 0);
      } catch (e) {
        localStorage.removeItem('allease_active_session');
      }
    }

    if (!isSupabaseConfigured) {
      if (!localSession) {
        setTimeout(() => callback(null), 0);
      }
      return { data: { subscription: { unsubscribe: () => {} } } };
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user || null);
    });

    return { data: { subscription } };
  }
};