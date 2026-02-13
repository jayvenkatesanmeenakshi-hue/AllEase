
import React, { useState, useEffect } from 'react';
import { UserState, TopicStructure, EcoShift } from './types';
import { authService } from './authService';
import { isSupabaseConfigured } from './supabaseClient';
import Header from './components/Header';
import Navigation from './components/Navigation';
import MindModule from './components/modules/MindModule';
import SkillsModule from './components/modules/SkillsModule';
import EcoModule from './components/modules/EcoModule';
import AuthPage from './components/AuthPage';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userState, setUserState] = useState<UserState>({ 
    impactScore: 1, 
    moodHistory: [], 
    exploredTopics: [],
    quizHistory: [],
    ecoHistory: [],
    lastActionTimestamp: Date.now(),
    dailyActionCount: 0
  });
  const [activeTab, setActiveTab] = useState<'mind' | 'skills' | 'eco'>('eco');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
        setLoading(false);
        return;
    }

    const { data: { subscription } } = authService.onAuthStateChange((user) => {
      setCurrentUser(user);
      if (!user) {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const fetchState = async () => {
      if (currentUser && isSupabaseConfigured) {
        setLoading(true);
        const state = await authService.getUserState(currentUser.id);
        setUserState(state);
        setLoading(false);
      }
    };
    fetchState();
  }, [currentUser]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentUser && isSupabaseConfigured) {
        authService.saveUserState(currentUser.id, userState);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [userState, currentUser]);

  const incrementImpact = (percentGain: number) => {
    setUserState(prev => {
      const newScore = Math.min(100, Math.round(prev.impactScore + percentGain));
      return {
        ...prev,
        impactScore: newScore,
        lastActionTimestamp: Date.now(),
        dailyActionCount: prev.dailyActionCount + 1
      };
    });
  };

  const handleTopicExplored = (topic: TopicStructure) => {
    setUserState(prev => {
      const exists = prev.exploredTopics.find(t => t.topic.toLowerCase() === topic.topic.toLowerCase());
      if (exists) return prev;
      return {
        ...prev,
        exploredTopics: [topic, ...prev.exploredTopics].slice(0, 10)
      };
    });
    incrementImpact(1);
  };

  const handleOptimizationComplete = (shift: EcoShift) => {
    setUserState(prev => ({
      ...prev,
      ecoHistory: [shift, ...prev.ecoHistory].slice(0, 50)
    }));
    incrementImpact(3);
  };

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6">
        <div className="max-w-md w-full bg-white p-12 rounded-[3rem] border border-slate-100 shadow-2xl text-center space-y-8">
          <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
             <svg className="w-10 h-10 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/></svg>
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Setup Required</h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            AllEase requires Supabase credentials for cloud synchronization.
          </p>
          <div className="space-y-4 text-left bg-slate-50 p-6 rounded-2xl border border-slate-100">
             <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Environment keys:</p>
             <code className="block text-[11px] font-mono text-teal-700 font-bold">SUPABASE_URL</code>
             <code className="block text-[11px] font-mono text-teal-700 font-bold">SUPABASE_ANON_KEY</code>
          </div>
        </div>
      </div>
    );
  }

  if (loading && currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-[10px] font-black text-teal-800 uppercase tracking-widest">Syncing User Profile...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) return <AuthPage onAuthSuccess={() => {}} />;

  return (
    <div className="min-h-screen pb-40 bg-[#F8FAFC] text-[#1E293B] selection:bg-[#0D9488] selection:text-white">
      <div className="max-w-5xl mx-auto px-4 pt-10">
        <Header score={userState.impactScore} onLogout={() => authService.logout()} />
        
        <main className="mt-12">
          {activeTab === 'eco' && (
            <EcoModule 
              history={userState.ecoHistory}
              onComplete={handleOptimizationComplete}
            />
          )}
          {activeTab === 'mind' && (
            <MindModule 
              moodHistory={userState.moodHistory} 
              onMoodLog={(mood) => {
                const log = { id: Date.now().toString(), mood, timestamp: Date.now() };
                setUserState(prev => ({ ...prev, moodHistory: [log, ...prev.moodHistory].slice(0, 50) }));
                incrementImpact(1);
              }}
              onBreathComplete={() => incrementImpact(2)}
            />
          )}
          {activeTab === 'skills' && (
            <SkillsModule 
              onTopicExplored={handleTopicExplored}
            />
          )}
        </main>

        <Navigation activeTab={activeTab} setActiveTab={(tab: any) => setActiveTab(tab)} />

        <footer className="mt-24 text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest mono">
          AllEase Optimization Engine v1.0.2
        </footer>
      </div>
    </div>
  );
};

export default App;
