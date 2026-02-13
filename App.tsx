
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
    // Immediate fallback for guest mode if cloud is not active
    if (!isSupabaseConfigured) {
      setCurrentUser({ id: 'guest_user', email: 'guest@allease.ai' });
      setLoading(false);
      return;
    }

    const { data: { subscription } } = authService.onAuthStateChange((user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const fetchState = async () => {
      if (currentUser) {
        try {
          const state = await authService.getUserState(currentUser.id);
          if (state) setUserState(state);
        } catch (err) {
          console.error("Failed to load user state", err);
        }
      }
    };
    if (currentUser) fetchState();
  }, [currentUser]);

  useEffect(() => {
    if (currentUser && currentUser.id !== 'guest_user') {
      const timer = setTimeout(() => {
        authService.saveUserState(currentUser.id, userState);
      }, 2000);
      return () => clearTimeout(timer);
    }
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-[10px] font-black text-teal-800 uppercase tracking-widest">Initializing Environment...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) return <AuthPage onAuthSuccess={() => {}} />;

  return (
    <div className="min-h-screen pb-40 bg-[#F8FAFC] text-[#1E293B] selection:bg-[#0D9488] selection:text-white fade-entry">
      <div className="max-w-5xl mx-auto px-4 pt-10">
        <Header score={userState.impactScore} onLogout={() => authService.logout()} />
        
        {!isSupabaseConfigured && (
          <div className="mb-8 px-6 py-2 bg-amber-50 border border-amber-100 rounded-full w-fit mx-auto shadow-sm">
             <p className="text-[9px] font-black text-amber-700 uppercase tracking-widest flex items-center gap-2">
               <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
               Guest Mode • Session Not Synced
             </p>
          </div>
        )}

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
          AllEase Optimization Engine v1.0.9
        </footer>
      </div>
    </div>
  );
};

export default App;
