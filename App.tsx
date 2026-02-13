
import React, { useState, useEffect } from 'react';
import { UserState, TopicStructure, EcoShift } from './types';
import { authService } from './authService';
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
      if (currentUser) {
        setLoading(true);
        const state = await authService.getUserState(currentUser.id);
        setUserState(state);
        setLoading(false);
      }
    };
    fetchState();
  }, [currentUser]);

  // Debounced save to Supabase
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentUser) {
        authService.saveUserState(currentUser.id, userState);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [userState, currentUser]);

  const incrementEcoImpact = (percentGain: number) => {
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
    incrementEcoImpact(1);
  };

  const handleEcoComplete = (shift: EcoShift) => {
    setUserState(prev => ({
      ...prev,
      ecoHistory: [shift, ...prev.ecoHistory].slice(0, 50)
    }));
    incrementEcoImpact(3);
  };

  if (loading && currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-50">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">Syncing Eco-Profile...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) return <AuthPage onAuthSuccess={() => {}} />;

  return (
    <div className="min-h-screen pb-40 bg-[#F9FAFB] text-[#064E3B] selection:bg-[#10B981] selection:text-white">
      <div className="max-w-5xl mx-auto px-4 pt-10">
        <Header score={userState.impactScore} onLogout={() => authService.logout()} />
        
        <main className="mt-12">
          {activeTab === 'eco' && (
            <EcoModule 
              history={userState.ecoHistory}
              onComplete={handleEcoComplete}
            />
          )}
          {activeTab === 'mind' && (
            <MindModule 
              moodHistory={userState.moodHistory} 
              onMoodLog={(mood) => {
                const log = { id: Date.now().toString(), mood, timestamp: Date.now() };
                setUserState(prev => ({ ...prev, moodHistory: [log, ...prev.moodHistory].slice(0, 50) }));
                incrementEcoImpact(1);
              }}
              onBreathComplete={() => incrementEcoImpact(2)}
            />
          )}
          {activeTab === 'skills' && (
            <SkillsModule 
              onTopicExplored={handleTopicExplored}
            />
          )}
        </main>

        <Navigation activeTab={activeTab} setActiveTab={(tab: any) => setActiveTab(tab)} />

        <footer className="mt-24 text-center text-[10px] text-emerald-700/40 font-bold uppercase tracking-widest mono">
          EcoHabit AI | Sustainability Protocol Active
        </footer>
      </div>
    </div>
  );
};

export default App;
