import React, { useState } from 'react';
import { authService } from '../authService';

interface AuthPageProps {
  onAuthSuccess: (email: string) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await authService.login(email, password);
      } else {
        await authService.register(email, password);
      }
      onAuthSuccess(email);
    } catch (err: any) {
      setError(err.message || "Security protocols rejected these credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-[#F8FAFC]">
      {/* Dynamic Background */}
      <div className="fixed inset-0 overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal-100/40 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-100/40 rounded-full blur-[120px] animate-pulse delay-700"></div>
      </div>

      <div className="max-w-md w-full relative">
        <div className="glass-premium p-10 md:p-14 rounded-[3.5rem] border border-white shadow-2xl overflow-hidden">
          {/* Header Accent Line */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-teal-500 to-slate-900"></div>
          
          <div className="text-center mb-12">
            <h1 className="text-6xl font-black tracking-tighter text-slate-900 mb-4 leading-none">
              All<span className="text-teal-600">Ease</span>
            </h1>
            <div className="inline-flex items-center gap-2 bg-slate-900 px-6 py-2 rounded-full border border-slate-800 shadow-xl">
              <span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></span>
              <p className="text-white font-black uppercase tracking-[0.4em] text-[10px] mono">Authentication Required</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-700 text-[11px] font-black p-5 rounded-2xl border border-red-100 text-center animate-in fade-in slide-in-from-top-2">
                <span className="block uppercase tracking-widest mb-1">Access Denied</span>
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Identification (Email)</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 px-8 py-5 rounded-[1.5rem] outline-none text-slate-900 focus:border-teal-500 focus:bg-white transition-all text-sm font-semibold shadow-inner"
                placeholder="user@allease.ai"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Security Key (Password)</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 px-8 py-5 rounded-[1.5rem] outline-none text-slate-900 focus:border-teal-500 focus:bg-white transition-all text-sm font-semibold shadow-inner"
                placeholder="••••••••"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full py-6 bg-slate-900 overflow-hidden text-white font-black uppercase tracking-[0.5em] text-[12px] rounded-[1.5rem] transition-all duration-500 active:scale-95 shadow-2xl disabled:bg-slate-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-cyan-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
              <span className="relative z-10 flex items-center justify-center gap-3">
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Verifying...
                  </>
                ) : isLogin ? 'Authorize Entry' : 'Create Optimization Profile'}
              </span>
            </button>
          </form>

          <div className="mt-14 text-center pt-10 border-t border-slate-100">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-[11px] font-black text-slate-400 hover:text-teal-600 uppercase tracking-[0.2em] transition-all flex items-center gap-3 mx-auto group"
            >
              <span className="w-2 h-0.5 bg-slate-200 group-hover:bg-teal-600 transition-all"></span>
              {isLogin ? "Request New System Access" : "Return to Identification Console"}
              <span className="w-2 h-0.5 bg-slate-200 group-hover:bg-teal-600 transition-all"></span>
            </button>
          </div>
        </div>
        
        <p className="mt-12 text-center text-[10px] text-slate-300 font-black uppercase tracking-[0.6em] mono">
          Peak Performance Infrastructure • Secure-v1.2.0
        </p>
      </div>
    </div>
  );
};

export default AuthPage;