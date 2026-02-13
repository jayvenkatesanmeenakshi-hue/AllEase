
import React, { useState, useMemo } from 'react';
import { EcoShift, ActivityGuide } from '../../types';
import { getActivityGuide } from '../../geminiService';
import InputArea from '../InputArea';
import HistoryList from '../HistoryList';

interface EcoModuleProps {
  history: EcoShift[];
  onComplete: (shift: EcoShift) => void;
}

const EcoModule: React.FC<EcoModuleProps> = ({ history, onComplete }) => {
  const [loading, setLoading] = useState(false);
  const [currentGuide, setCurrentGuide] = useState<ActivityGuide | null>(null);
  const [activeActivity, setActiveActivity] = useState('');
  const [verifiedSubSteps, setVerifiedSubSteps] = useState<Set<string>>(new Set());

  const handleSuggest = async (activity: string) => {
    setLoading(true);
    setActiveActivity(activity);
    setVerifiedSubSteps(new Set());
    try {
      const guide = await getActivityGuide(activity);
      setCurrentGuide(guide);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSubStep = (id: string) => {
    setVerifiedSubSteps(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const totalSubSteps = useMemo(() => {
    if (!currentGuide) return 0;
    return currentGuide.steps.reduce((acc, step) => acc + step.subSteps.length, 0);
  }, [currentGuide]);

  const progress = useMemo(() => {
    if (totalSubSteps === 0) return 0;
    return (verifiedSubSteps.size / totalSubSteps) * 100;
  }, [verifiedSubSteps, totalSubSteps]);

  const commitActivity = () => {
    if (!currentGuide || progress < 100) return;
    onComplete({
      id: Math.random().toString(36).substr(2, 6).toUpperCase(),
      activity: activeActivity,
      shift: "HABIT_VERIFIED",
      personalWin: "Sustainability Quotient Increased",
      ecoWin: "Effective Resource Deployment",
      timestamp: Date.now()
    });
    setCurrentGuide(null);
  };

  return (
    <div className="space-y-20 fade-entry max-w-5xl mx-auto pb-24">
      <section className="bg-white p-16 rounded-[4rem] shadow-sm border border-emerald-50">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="max-w-xl">
            <h2 className="text-5xl font-black tracking-tighter mb-4 text-emerald-950 uppercase leading-none">Habit Lab</h2>
            <p className="text-emerald-800/40 text-[11px] font-black uppercase tracking-[0.5em] border-l-4 border-emerald-500 pl-6 py-1">Tactical Eco-Efficiency Protocols</p>
          </div>
          <div className="hidden lg:flex items-center gap-2 bg-emerald-50/20 px-6 py-3 rounded-2xl border border-emerald-50">
             <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-500/50"></div>
             <span className="text-[10px] font-black text-emerald-800/40 uppercase tracking-widest mono">Eco-Engine Online</span>
          </div>
        </div>
        <InputArea onSuggest={handleSuggest} isLoading={loading} />
      </section>

      {currentGuide && (
        <div className="animate-in slide-in-from-bottom-16 duration-700 space-y-20">
          <div className="bg-white p-16 md:p-24 rounded-[5rem] shadow-3xl border border-emerald-50 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-20 opacity-[0.02] pointer-events-none">
              <svg className="w-96 h-96" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L1 21h22L12 2zm0 3.45l8.27 14.3H3.73L12 5.45zM11 16h2v2h-2v-2zm0-5h2v4h-2v-4z"/></svg>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-20">
              <div>
                <h3 className="text-7xl font-black tracking-tighter text-emerald-950 mb-8 uppercase leading-none">{activeActivity}</h3>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-3 bg-emerald-50/50 border border-emerald-100 px-6 py-2.5 rounded-2xl">
                    <span className="text-lg">🌱</span>
                    <span className="text-[11px] font-black text-emerald-800 uppercase tracking-widest">Eco Growth</span>
                  </div>
                  <div className="flex items-center gap-3 bg-lime-50/50 border border-lime-100 px-6 py-2.5 rounded-2xl">
                    <span className="text-lg">♻️</span>
                    <span className="text-[11px] font-black text-lime-800 uppercase tracking-widest">Sustainability Verified</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setCurrentGuide(null)} className="group flex items-center gap-3 text-slate-400 hover:text-red-600 transition-all font-black uppercase text-[11px] tracking-widest bg-slate-50 px-10 py-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl active:scale-95">
                <svg className="w-5 h-5 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"/></svg>
                Abort Protocol
              </button>
            </div>

            <div className="mb-24 p-12 bg-emerald-50/20 rounded-[4rem] border border-emerald-50 shadow-inner">
              <div className="flex justify-between items-end mb-8 px-4">
                <span className="text-[12px] font-black text-emerald-800/40 uppercase tracking-[0.4em]">Protocol Habit Sync</span>
                <span className="text-4xl font-black text-emerald-950 tracking-tighter mono">{Math.round(progress)}<span className="text-xl text-emerald-200 ml-1">%</span></span>
              </div>
              <div className="h-6 w-full bg-emerald-100/50 rounded-full overflow-hidden p-1.5 border border-emerald-200/30">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-lime-500 rounded-full transition-all duration-1000 shadow-xl"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="space-y-40 mb-20">
              {currentGuide.steps.map((step) => (
                <div key={step.stepNumber} className="group">
                  <div className="grid lg:grid-cols-[1fr_550px] gap-24 items-start">
                    <div className="space-y-16">
                      <div className="flex gap-10 items-start">
                        <span className="text-9xl font-black text-emerald-50 group-hover:text-emerald-600/20 transition-all leading-none mt-[-20px]">{step.stepNumber}</span>
                        <div>
                          <h4 className="text-4xl font-black text-emerald-950 tracking-tight uppercase mb-6 leading-tight border-b-8 border-emerald-50 pb-4 inline-block">{step.instruction}</h4>
                          <p className="text-emerald-800/70 text-xl font-semibold leading-relaxed italic max-w-lg">{step.detail}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-5">
                        <div className="flex items-center gap-4 mb-8 px-2">
                          <h5 className="text-[11px] font-black text-emerald-800/30 uppercase tracking-[0.4em]">Validation Requirements</h5>
                          <div className="h-[1px] flex-1 bg-emerald-50"></div>
                        </div>
                        {step.subSteps.map((sub) => (
                          <div 
                            key={sub.id} 
                            onClick={() => toggleSubStep(sub.id)}
                            className={`flex items-start gap-8 p-10 rounded-[3rem] cursor-pointer transition-all duration-500 border ${
                              verifiedSubSteps.has(sub.id) 
                                ? 'bg-emerald-50 border-emerald-200 shadow-inner' 
                                : 'bg-white border-emerald-50 hover:border-emerald-200 hover:shadow-2xl hover:shadow-emerald-100/30'
                            }`}
                          >
                            <div className={`mt-1.5 w-8 h-8 rounded-2xl border-2 flex items-center justify-center transition-all duration-500 ${
                              verifiedSubSteps.has(sub.id) ? 'bg-emerald-600 border-emerald-600 shadow-xl rotate-[360deg]' : 'border-emerald-300 bg-emerald-50 group-hover:border-emerald-300'
                            }`}>
                              {verifiedSubSteps.has(sub.id) && <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="5" d="M5 13l4 4L19 7"/></svg>}
                            </div>
                            <div>
                              <span className={`text-lg font-black uppercase tracking-tight block mb-2 ${verifiedSubSteps.has(sub.id) ? 'text-emerald-900' : 'text-emerald-950'}`}>
                                {sub.label}
                              </span>
                              <p className="text-sm text-emerald-800/40 font-bold leading-relaxed">{sub.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="relative sticky top-24">
                      {step.visual ? (
                        <div className="aspect-[4/3] w-full rounded-[4rem] border border-emerald-100 overflow-hidden shadow-4xl group-hover:shadow-emerald-100/50 transition-all duration-700">
                          <img src={step.visual} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt={step.instruction} />
                          <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 via-transparent to-transparent p-12 flex flex-col justify-end">
                            <span className="mono text-[12px] font-black text-white uppercase tracking-[0.6em] mb-4 opacity-70">Sustainability Node {step.stepNumber}</span>
                            <div className="h-1 w-24 bg-emerald-500 rounded-full"></div>
                          </div>
                        </div>
                      ) : (
                        <div className="aspect-[4/3] w-full bg-emerald-50/50 rounded-[4rem] border-4 border-dashed border-emerald-100 flex items-center justify-center p-12 text-center">
                          <div>
                            <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin mx-auto mb-8"></div>
                            <p className="text-[12px] font-black text-emerald-800/40 uppercase tracking-[0.5em] animate-pulse">Growing Visualization Node...</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={commitActivity}
              disabled={progress < 100}
              className={`w-full py-12 font-black text-3xl tracking-tighter rounded-[3.5rem] transition-all duration-500 shadow-2xl ${
                progress === 100 
                  ? 'bg-emerald-950 text-white hover:bg-black hover:shadow-emerald-500/20 active:scale-[0.98]' 
                  : 'bg-emerald-50 text-emerald-300 cursor-not-allowed border border-emerald-100'
              }`}
            >
              {progress === 100 ? 'DEPLOY HABIT TO ECOSYSTEM' : 'VALIDATE ALL NODES FOR DEPLOYMENT'}
            </button>
          </div>
        </div>
      )}

      <section>
        <div className="flex items-center gap-8 mb-16 px-6">
          <h2 className="text-3xl font-black tracking-tighter text-emerald-950 uppercase leading-none">Sustainability Archives</h2>
          <div className="h-[1px] flex-1 bg-emerald-50"></div>
          <span className="text-[10px] font-black text-emerald-800/20 uppercase tracking-widest mono">ECO_DB: 1.0.4</span>
        </div>
        <HistoryList history={history} />
      </section>
    </div>
  );
};

export default EcoModule;
