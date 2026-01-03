import React, { useState } from 'react';
import { UserRole } from '../../types';
import { DEMO_USERS } from '../../constants';
import { Activity, ShieldCheck, Building2, Lock, User, ArrowRight, Key, Loader2 } from 'lucide-react';

interface LoginProps {
  onLogin: (role: UserRole) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [step, setStep] = useState<'AUTH' | 'ROLE'>('AUTH');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCredentialLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Access credentials from environment variables
    const validUser = import.meta.env.VITE_USER_LOGIN;
    const validPass = import.meta.env.VITE_USER_PASSWORD;

    // Simulate Network Request
    setTimeout(() => {
      // Check against environment variables
      // Note: We compare assuming the env var exists. If not set, login might fail or behave unexpectedly.
      if (validUser && validPass && 
          username.toLowerCase() === validUser.toLowerCase() && 
          password === validPass) {
        setStep('ROLE');
      } else {
        setError('Invalid credentials. Please check your .env configuration.');
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-600/20 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[100px]"></div>
      </div>

      <div className="bg-white/10 backdrop-blur-lg border border-white/10 p-8 rounded-2xl shadow-2xl max-w-5xl w-full z-10 flex flex-col md:flex-row gap-12 items-center">
        
        {/* Left Side: Branding */}
        <div className="md:w-1/2 flex flex-col justify-center text-white p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-emerald-500/20 p-3 rounded-xl border border-emerald-500/30">
               <Building2 className="h-10 w-10 text-emerald-400" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-emerald-50">AP Health Cloud</h1>
          </div>
          <p className="text-emerald-200 font-bold mb-8 uppercase tracking-wider text-xs pl-1">
             Department of Health, Medical & Family Welfare <br/> Government of Andhra Pradesh
          </p>
          
          <h2 className="text-2xl font-semibold mb-4 text-white leading-tight">
            Unified Digital Health Infrastructure
          </h2>
          <p className="text-slate-300 mb-8 leading-relaxed text-sm">
            Connecting King George Hospital, GGH, PHCs, and CHCs across 26 Districts into a single, AI-driven Real-time Operating System.
          </p>
          
          <div className="flex gap-4 text-xs font-mono text-slate-400">
             <div className="flex items-center gap-2 px-3 py-1 bg-black/20 rounded border border-white/10">
                <ShieldCheck className="h-3 w-3 text-emerald-400" /> AES-256 Encrypted
             </div>
             <div className="flex items-center gap-2 px-3 py-1 bg-black/20 rounded border border-white/10">
                <Activity className="h-3 w-3 text-blue-400" /> 99.9% Uptime
             </div>
          </div>
        </div>

        {/* Right Side: Dynamic Form */}
        <div className="md:w-1/2 bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-md">
          
          {/* STEP 1: CREDENTIAL LOGIN */}
          {step === 'AUTH' && (
             <div className="p-8 animate-in fade-in slide-in-from-right-8 duration-300">
                <div className="text-center mb-8">
                   <h3 className="text-xl font-bold text-slate-800">Secure Portal Access</h3>
                   <p className="text-sm text-slate-500 mt-1">Please authenticate to proceed</p>
                </div>

                <form onSubmit={handleCredentialLogin} className="space-y-5">
                   <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase ml-1">Username</label>
                      <div className="relative">
                         <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                         <input 
                            type="text" 
                            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all text-sm font-medium"
                            placeholder="Enter Govt ID"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                         />
                      </div>
                   </div>
                   
                   <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase ml-1">Password</label>
                      <div className="relative">
                         <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                         <input 
                            type="password" 
                            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all text-sm font-medium"
                            placeholder="••••••••"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                         />
                      </div>
                   </div>

                   {error && (
                      <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-xs text-red-600 font-bold animate-pulse">
                         <ShieldCheck className="h-4 w-4" /> {error}
                      </div>
                   )}

                   <button 
                      type="submit" 
                      disabled={loading}
                      className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-slate-800 transition-all shadow-lg hover:shadow-slate-300/50 flex items-center justify-center gap-2"
                   >
                      {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Lock className="h-4 w-4" />}
                      {loading ? 'Verifying Credentials...' : 'Secure Login'}
                   </button>
                </form>

                <div className="mt-6 text-center">
                   <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">
                      Environment Configured
                   </p>
                </div>
             </div>
          )}

          {/* STEP 2: ROLE SELECTION */}
          {step === 'ROLE' && (
             <div className="p-6 animate-in fade-in slide-in-from-right-8 duration-300 bg-slate-50 h-full flex flex-col">
                <div className="text-center mb-6">
                   <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold mb-2">
                      <CheckCircleIcon className="h-3 w-3" /> Authenticated
                   </div>
                   <h3 className="text-lg font-bold text-slate-800">Select Workspace</h3>
                   <p className="text-xs text-slate-500">Choose a persona to simulate</p>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
                   {DEMO_USERS.map((user) => (
                      <button
                         key={user.role}
                         onClick={() => onLogin(user.role)}
                         className="w-full flex items-center gap-3 p-3 rounded-xl bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all group text-left relative overflow-hidden"
                      >
                         <div className="absolute inset-0 bg-emerald-50 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300"></div>
                         <div className="relative h-10 w-10 rounded-full bg-slate-100 group-hover:bg-white flex items-center justify-center text-slate-600 group-hover:text-emerald-600 font-bold text-sm border border-slate-200 shadow-sm shrink-0">
                            {user.name.charAt(0)}
                         </div>
                         <div className="relative flex-1 min-w-0">
                            <p className="font-bold text-slate-800 text-sm truncate">{user.label}</p>
                            <p className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider group-hover:text-emerald-700">{user.role.replace('_', ' ')}</p>
                         </div>
                         <ArrowRight className="relative h-4 w-4 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                      </button>
                   ))}
                </div>
                
                <button onClick={() => setStep('AUTH')} className="mt-4 w-full text-xs text-slate-400 hover:text-slate-600 font-medium">
                   Cancel & Logout
                </button>
             </div>
          )}

        </div>
      </div>
    </div>
  );
};

// Helper Icon
const CheckCircleIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
);