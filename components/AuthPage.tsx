
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
      setError(err.message || "Authentication sequence failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-[#F8FAFC]">
      <div className="max-w-md w-full relative">
        {/* Decorative Background Elements */}
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-teal-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-cyan-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-700"></div>

        <div className="relative glass-premium p-10 md:p-14 rounded-[3rem] border border-white shadow-2xl overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-teal-500 to-cyan-500"></div>
          
          <div className="text-center mb-12">
            <h1 className="text-5xl font-black tracking-tighter text-slate-900 mb-3">
              All<span className="text-teal-600">Ease</span>
            </h1>
            <div className="inline-flex items-center gap-2 bg-slate-50 px-4 py-1 rounded-full border border-slate-100">
              <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse"></span>
              <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[9px] mono">Secure Gateway</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-700 text-[11px] font-black p-4 rounded-2xl border border-red-100 text-center animate-in fade-in slide-in-from-top-2">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Identity Token (Email)</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-100 px-6 py-4 rounded-2xl outline-none text-slate-900 focus:border-teal-500 focus:bg-white transition-all text-sm font-semibold shadow-inner"
                placeholder="user@allease.ai"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Access Key (Password)</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-100 px-6 py-4 rounded-2xl outline-none text-slate-900 focus:border-teal-500 focus:bg-white transition-all text-sm font-semibold shadow-inner"
                placeholder="••••••••"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full py-5 bg-slate-900 overflow-hidden text-white font-black uppercase tracking-[0.3em] text-[11px] rounded-[1.5rem] transition-all duration-500 active:scale-95 shadow-xl disabled:bg-slate-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-cyan-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
              <span className="relative z-10">
                {loading ? 'Decrypting...' : isLogin ? 'Authorize Entry' : 'Create Profile'}
              </span>
            </button>
          </form>

          <div className="mt-12 text-center pt-8 border-t border-slate-50">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-[10px] font-black text-slate-400 hover:text-teal-600 uppercase tracking-widest transition-colors flex items-center gap-2 mx-auto group"
            >
              <span className="w-1 h-1 bg-slate-200 rounded-full group-hover:bg-teal-600 transition-colors"></span>
              {isLogin ? "Need New Optimization Profile?" : "Return to Login Console"}
              <span className="w-1 h-1 bg-slate-200 rounded-full group-hover:bg-teal-600 transition-colors"></span>
            </button>
          </div>
        </div>
        
        <p className="mt-8 text-center text-[9px] text-slate-300 font-black uppercase tracking-[0.5em] mono">
          Encryption Active • v1.1.2-PRD
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
