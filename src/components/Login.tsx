
import React from 'react';
import { UserRole } from '../types';
import { DEMO_USERS } from '../constants';
import { Activity, ShieldCheck, Building2 } from 'lucide-react';

interface LoginProps {
  onLogin: (role: UserRole) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-600/20 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[100px]"></div>
      </div>

      <div className="bg-white/10 backdrop-blur-lg border border-white/10 p-8 rounded-2xl shadow-2xl max-w-4xl w-full z-10 flex flex-col md:flex-row gap-8">
        
        {/* Left Side: Branding */}
        <div className="md:w-1/2 flex flex-col justify-center text-white p-4">
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="h-10 w-10 text-emerald-400" />
            <h1 className="text-3xl font-bold tracking-tight text-emerald-50">AP Health Cloud</h1>
          </div>
          <p className="text-emerald-200 font-semibold mb-6 uppercase tracking-wider text-sm">
             Department of Health, Medical & Family Welfare <br/> Government of Andhra Pradesh
          </p>
          
          <h2 className="text-2xl font-semibold mb-4 text-white">Statewide AI-Driven Hospital Operating System</h2>
          <p className="text-slate-300 mb-6 leading-relaxed">
            Unified digital infrastructure for KGH, GGH, PHCs, and CHCs across 26 Districts.
          </p>
          <div className="flex items-center gap-2 text-xs text-slate-400 uppercase tracking-widest font-semibold">
            <ShieldCheck className="h-4 w-4" />
            Secure State Government Portal
          </div>
        </div>

        {/* Right Side: Role Selection */}
        <div className="md:w-1/2 bg-white rounded-xl p-6 shadow-xl">
          <h3 className="text-xl font-bold text-slate-800 mb-6 text-center">Select User Persona</h3>
          <div className="grid grid-cols-1 gap-3">
            {DEMO_USERS.map((user) => (
              <button
                key={user.role}
                onClick={() => onLogin(user.role)}
                className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 transition-all group text-left"
              >
                <div className="h-10 w-10 rounded-full bg-slate-100 group-hover:bg-emerald-100 flex items-center justify-center text-slate-600 group-hover:text-emerald-600 font-bold text-sm">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-slate-900 group-hover:text-emerald-700">{user.role.replace('_', ' ')}</p>
                  <p className="text-xs text-slate-500">{user.name}</p>
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">{user.label}</p>
                </div>
              </button>
            ))}
          </div>
          <div className="mt-6 text-center">
            <p className="text-xs text-slate-400">
              Demo Version 1.2 | For Presentation Only
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
