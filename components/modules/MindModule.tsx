
import React, { useState, useEffect } from 'react';
import { MoodLog } from '../../types';
import { getSupportiveContent } from '../../geminiService';

interface MindModuleProps {
  moodHistory: MoodLog[];
  onMoodLog: (mood: string) => void;
  onBreathComplete: () => void;
}

const MindModule: React.FC<MindModuleProps> = ({ moodHistory, onMoodLog, onBreathComplete }) => {
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale' | 'Pause'>('Inhale');
  const [timer, setTimer] = useState(0);
  const [supportContent, setSupportContent] = useState<{ text: string; visual: string } | null>(null);
  const [loadingSupport, setLoadingSupport] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isBreathing) {
      interval = setInterval(() => {
        setTimer(t => {
          if (t >= 30) { 
            setIsBreathing(false);
            onBreathComplete();
            return 0;
          }
          const cycle = t % 16;
          if (cycle < 4) setBreathPhase('Inhale');
          else if (cycle < 8) setBreathPhase('Hold');
          else if (cycle < 12) setBreathPhase('Exhale');
          else setBreathPhase('Pause');
          return t + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isBreathing, onBreathComplete]);

  const moods = [
    { label: 'Prime', icon: '🎯', desc: 'Ready for peak output' },
    { label: 'Steady', icon: '🌊', desc: 'Consistent & balanced' },
    { label: 'Serene', icon: '⚖️', desc: 'Quiet & focused' },
    { label: 'Drained', icon: '☁️', desc: 'Recovery prioritized' },
    { label: 'Locked', icon: '⚡', desc: 'Intense flow state' },
  ];

  const handleMoodSelect = async (moodLabel: string, icon: string) => {
    setLoadingSupport(true);
    setSupportContent(null);
    onMoodLog(icon);
    try {
      const content = await getSupportiveContent(moodLabel);
      setSupportContent(content);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSupport(false);
    }
  };

  return (
    <div className="space-y-24 fade-entry max-w-5xl mx-auto pb-24">
      {/* Pacer: Central Visual reset */}
      <section className="bg-white p-16 md:p-24 text-center rounded-[4rem] border border-slate-100 shadow-xl shadow-slate-200/20 relative overflow-hidden">
        <div className="absolute top-12 left-1/2 -translate-x-1/2 flex items-center gap-3">
          <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-ping"></span>
          <span className="text-[11px] text-slate-400 font-black uppercase tracking-[0.5em]">Neural Focus Protocol</span>
        </div>
        
        {isBreathing ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <div className="relative w-80 h-80 flex items-center justify-center">
              <div className="absolute inset-0 border-8 border-slate-50 rounded-full"></div>
              <div 
                className={`absolute inset-8 bg-teal-50/50 border-4 border-teal-500 rounded-full transition-all duration-1000 ease-in-out ${
                  breathPhase === 'Inhale' ? 'scale-125 opacity-100' : 
                  breathPhase === 'Exhale' ? 'scale-50 opacity-40' : 
                  breathPhase === 'Hold' ? 'scale-125 opacity-100 border-dashed' : 'scale-50 opacity-40'
                }`}
              ></div>
              <div className="relative z-10 flex flex-col items-center">
                <span className="text-4xl font-black text-slate-900 tracking-tighter uppercase mb-2">
                  {breathPhase}
                </span>
                <p className="mono text-sm text-teal-600 font-black tracking-[0.2em]">{30 - timer} SECS</p>
              </div>
            </div>
            <div className="mt-24 w-96 h-2.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100 shadow-inner p-1">
              <div 
                className="h-full bg-teal-600 rounded-full transition-all duration-1000 ease-linear shadow-lg"
                style={{ width: `${(timer / 30) * 100}%` }}
              ></div>
            </div>
          </div>
        ) : (
          <div className="py-28 flex flex-col items-center">
            <h2 className="text-7xl font-black tracking-tighter mb-12 hero-text uppercase leading-none max-w-2xl mx-auto">Sync Your Biological Clock</h2>
            <button 
              onClick={() => setIsBreathing(true)}
              className="group flex items-center gap-6 px-20 py-8 text-sm font-black text-white bg-slate-900 hover:bg-teal-600 uppercase tracking-[0.3em] rounded-[2.5rem] transition-all duration-500 shadow-2xl hover:shadow-teal-200/50 active:scale-95"
            >
              <svg className="w-6 h-6 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
              Start Reset
            </button>
          </div>
        )}
      </section>

      {/* Mood Entry: Visually rich interaction */}
      <section className="bg-white p-20 rounded-[4rem] border border-slate-100 shadow-xl shadow-slate-200/20">
        <div className="text-center mb-16">
          <h3 className="text-[12px] font-black uppercase tracking-[0.5em] text-slate-400 mb-4">Support Unit Interface</h3>
          <p className="text-2xl font-bold text-slate-800 tracking-tight">How is the environment affecting you?</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-8 mb-16">
          {moods.map((m) => (
            <button 
              key={m.label} 
              onClick={() => handleMoodSelect(m.label, m.icon)} 
              className="group flex flex-col items-center gap-8 p-10 bg-slate-50/50 hover:bg-white rounded-[3rem] border border-transparent hover:border-teal-100 transition-all duration-500 active:scale-95 hover:shadow-2xl hover:shadow-teal-100/50"
            >
              <div className="w-24 h-24 bg-white border border-slate-100 rounded-[2.5rem] flex items-center justify-center text-5xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-md">
                {m.icon}
              </div>
              <div className="text-center">
                <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest block mb-2">{m.label}</span>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">{m.desc}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Support Unit Response View */}
        {(loadingSupport || supportContent) && (
          <div className="mt-20 p-12 md:p-16 bg-slate-50 border border-slate-200/60 rounded-[4rem] animate-in slide-in-from-bottom-12 duration-700 shadow-inner">
            {loadingSupport ? (
              <div className="flex flex-col items-center py-24 space-y-8">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 border-4 border-slate-200 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.5em] animate-pulse">Syncing Serene Environment Assets...</p>
              </div>
            ) : (
              <div className="space-y-16">
                <div className="flex items-center gap-6">
                  <div className="h-0.5 w-16 bg-teal-600"></div>
                  <h4 className="text-[12px] font-black uppercase tracking-[0.5em] text-teal-600">AllEase Support Reflection</h4>
                </div>
                <div className="grid lg:grid-cols-[1fr_450px] gap-20 items-center">
                  <div className="space-y-8">
                    <p className="text-4xl text-slate-900 font-black italic border-l-[12px] border-teal-100 pl-12 py-6 leading-tight tracking-tight">
                      "{supportContent?.text}"
                    </p>
                    <div className="flex items-center gap-4 text-slate-400">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                      <span className="text-[10px] font-black uppercase tracking-widest">Autonomous Support Validation Complete</span>
                    </div>
                  </div>
                  {supportContent?.visual && (
                    <div className="group relative aspect-[4/5] lg:aspect-square w-full rounded-[3.5rem] overflow-hidden border border-slate-200 shadow-3xl">
                      <img src={supportContent.visual} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt="Serene Real-world Environment" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-10 flex items-end">
                        <span className="text-[10px] text-white font-black uppercase tracking-[0.4em] mono">Environment Data Ref: {Math.random().toString(16).slice(2,8)}</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex justify-between items-center pt-10 border-t border-slate-200/50">
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mono">Support Unit #4429 // Real-time Feed</span>
                  <button 
                    onClick={() => setSupportContent(null)}
                    className="text-[11px] font-black text-slate-400 hover:text-red-600 uppercase tracking-widest px-10 py-4 bg-white border border-slate-100 hover:bg-red-50 rounded-2xl transition-all shadow-sm hover:shadow-md"
                  >
                    Release Feed
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Archived States: Decorative historical Grid */}
      {moodHistory.length > 0 && (
        <section className="bg-white p-20 rounded-[4rem] border border-slate-100 shadow-xl shadow-slate-200/10">
          <div className="flex items-center justify-between mb-16 px-4">
            <h3 className="text-[12px] font-black uppercase tracking-[0.5em] text-slate-400">Neural Log Archive</h3>
            <div className="h-[1px] flex-1 bg-slate-100 ml-12"></div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8">
            {moodHistory.slice(0, 12).map((log) => (
              <div 
                key={log.id} 
                className="group bg-slate-50/50 border border-slate-100 p-8 rounded-[2.5rem] flex flex-col items-center gap-6 hover:border-teal-200 hover:bg-white transition-all duration-500 shadow-sm hover:shadow-xl"
              >
                <span className="text-4xl group-hover:scale-110 transition-transform">{log.mood}</span>
                <div className="text-center">
                  <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.3em] mb-2">Sync Time</p>
                  <p className="text-[11px] text-slate-900 font-bold mono bg-slate-100 px-3 py-1 rounded-full group-hover:bg-teal-50 transition-colors">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default MindModule;
