import React, { useState, useEffect } from 'react';
import { UserState, TopicStructure, EcoShift } from './types';
import { authService } from './authService';
import { isSupabaseConfigured } from './supabaseClient';
import Header from './components/Header';
import Navigation from './components/Navigation';
import AuthPage from './components/AuthPage';

import MindModule from './components/modules/MindModule';
import SkillsModule from './components/modules/SkillsModule';
import EcoModule from './components/modules/EcoModule';

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
    let mounted = true;

    // Strict Auth Synchronization
    const { data: { subscription } } = authService.onAuthStateChange((user) => {
      if (mounted) {
        setCurrentUser(user);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  // Persistent User State Synchronization
  useEffect(() => {
    const fetchState = async () => {
      if (currentUser) {
        try {
          const state = await authService.getUserState(currentUser.id);
          if (state) setUserState(state);
        } catch (err) {
          console.error("Failed to load persistent user state", err);
        }
      }
    };
    fetchState();
  }, [currentUser]);

  const incrementImpact = (percentGain: number) => {
    setUserState(prev => {
      const newScore = Math.min(100, Math.round(prev.impactScore + percentGain));
      const newState = {
        ...prev,
        impactScore: newScore,
        lastActionTimestamp: Date.now(),
        dailyActionCount: prev.dailyActionCount + 1
      };
      
      if (currentUser) {
        authService.saveUserState(currentUser.id, newState);
      }
      
      return newState;
    });
  };

  const handleTopicExplored = (topic: TopicStructure) => {
    setUserState(prev => {
      const exists = prev.exploredTopics.find(t => t.topic.toLowerCase() === topic.topic.toLowerCase());
      if (exists) return prev;
      const newState = {
        ...prev,
        exploredTopics: [topic, ...prev.exploredTopics].slice(0, 10)
      };
      if (currentUser) authService.saveUserState(currentUser.id, newState);
      return newState;
    });
    incrementImpact(1);
  };

  const handleOptimizationComplete = (shift: EcoShift) => {
    setUserState(prev => {
      const newState = {
        ...prev,
        ecoHistory: [shift, ...prev.ecoHistory].slice(0, 50)
      };
      if (currentUser) authService.saveUserState(currentUser.id, newState);
      return newState;
    });
    incrementImpact(3);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="text-center space-y-6">
          <div className="w-16 h-16 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto shadow-xl"></div>
          <p className="text-[10px] font-black text-teal-800 uppercase tracking-[0.5em] mono animate-pulse">Initializing Secure Context...</p>
        </div>
      </div>
    );
  }

  // ENFORCED LOGIN GATE - ABSOLUTELY NO ENTRY WITHOUT USER
  if (!currentUser) {
    return <AuthPage onAuthSuccess={(email) => console.log(`Session authorized for: ${email}`)} />;
  }

  return (
    <div className="min-h-screen pb-40 bg-[#F8FAFC] text-[#1E293B] selection:bg-[#0D9488] selection:text-white fade-entry">
      <div className="max-w-5xl mx-auto px-4 pt-10">
        <Header score={userState.impactScore} onLogout={() => authService.logout()} />
        
        {!isSupabaseConfigured && (
          <div className="mb-8 px-8 py-3 bg-amber-50 border border-amber-100 rounded-full w-fit mx-auto shadow-sm">
             <p className="text-[10px] font-black text-amber-700 uppercase tracking-[0.3em] flex items-center gap-3">
               <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
               Local Sandbox Mode • Database Emulation Active
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
                setUserState(prev => {
                  const newState = { ...prev, moodHistory: [log, ...prev.moodHistory].slice(0, 50) };
                  if (currentUser) authService.saveUserState(currentUser.id, newState);
                  return newState;
                });
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

        <footer className="mt-24 text-center text-[11px] text-slate-300 font-black uppercase tracking-[0.5em] mono pb-12">
          AllEase Optimization Cloud • Active User: {currentUser.email}
        </footer>
      </div>
    </div>
  );
};

export default App;