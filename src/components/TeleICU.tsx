
import React, { useState, useEffect } from 'react';
import { MOCK_TELE_ICU } from '../constants';
import { TeleICUBed } from '../types';
import { 
  Activity, Heart, Wind, Thermometer, Video, Mic, PhoneOff, 
  AlertTriangle, CheckCircle2, Wifi, WifiOff, BrainCircuit, BedDouble
} from 'lucide-react';

export const TeleICU: React.FC = () => {
  const [beds, setBeds] = useState<TeleICUBed[]>(MOCK_TELE_ICU);
  const [activeCall, setActiveCall] = useState<string | null>(null);

  // Simulate live vitals updates
  useEffect(() => {
    const interval = setInterval(() => {
      setBeds(prev => prev.map(bed => {
        if (!bed.isConnected || !bed.patientId) return bed;
        
        // Random fluctuation
        const newHr = bed.vitals.hr + Math.floor(Math.random() * 5) - 2;
        
        // Generate alerts
        const alerts = [];
        if (newHr > 100) alerts.push('Tachycardia');
        if (bed.vitals.spo2 < 90) alerts.push('Hypoxia');

        return {
          ...bed,
          vitals: { ...bed.vitals, hr: newHr },
          alerts: alerts
        };
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-slate-900 p-6 rounded-2xl text-white shadow-xl flex justify-between items-center">
         <div>
            <h2 className="text-2xl font-bold flex items-center gap-3 mb-1">
               <Activity className="h-8 w-8 text-emerald-400" /> National e-ICU Command Center
            </h2>
            <p className="text-slate-400 text-sm">
               Centralized Monitoring Hub (Hub-and-Spoke Model). Live telemetry from 50+ Remote PHCs/CHCs.
            </p>
         </div>
         <div className="flex gap-4">
            <div className="bg-white/10 px-4 py-2 rounded-lg text-center border border-white/10">
               <p className="text-xs text-slate-400 uppercase font-bold">Active Beds</p>
               <p className="text-2xl font-bold text-white">{beds.filter(b => b.patientId).length}</p>
            </div>
            <div className="bg-red-500/20 px-4 py-2 rounded-lg text-center border border-red-500/50">
               <p className="text-xs text-red-300 uppercase font-bold">Critical Alerts</p>
               <p className="text-2xl font-bold text-red-400">{beds.filter(b => b.alerts.length > 0).length}</p>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
         {beds.map(bed => (
            <div key={bed.id} className={`bg-slate-800 rounded-xl overflow-hidden border-2 transition-all ${
               bed.alerts.length > 0 ? 'border-red-500 shadow-red-900/20 shadow-lg' : 'border-slate-700'
            }`}>
               {/* Header */}
               <div className="bg-slate-900/50 p-4 flex justify-between items-center border-b border-slate-700">
                  <div>
                     <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white">{bed.hospitalName}</h3>
                        {bed.isConnected ? <Wifi className="h-3 w-3 text-emerald-500" /> : <WifiOff className="h-3 w-3 text-slate-600" />}
                     </div>
                     <p className="text-xs text-slate-400">{bed.district} • {bed.bedNumber}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${
                     bed.patientId ? 'bg-blue-900 text-blue-300' : 'bg-slate-700 text-slate-500'
                  }`}>
                     {bed.patientId ? 'Occupied' : 'Vacant'}
                  </span>
               </div>

               {/* Monitor Area */}
               <div className="p-4 relative min-h-[180px]">
                  {bed.patientId ? (
                     <div className="space-y-4">
                        <div className="flex justify-between items-start">
                           <div>
                              <p className="text-lg font-bold text-white">{bed.patientName}</p>
                              <p className="text-xs text-slate-400 font-mono">{bed.patientId}</p>
                           </div>
                           {bed.alerts.length > 0 && (
                              <div className="animate-pulse flex gap-1">
                                 {bed.alerts.map((a, i) => (
                                    <span key={i} className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">{a}</span>
                                 ))}
                              </div>
                           )}
                        </div>

                        {/* Vitals Grid */}
                        <div className="grid grid-cols-3 gap-3">
                           <div className="bg-black/40 p-2 rounded border border-slate-700/50">
                              <p className="text-[10px] text-emerald-400 font-bold uppercase mb-1">HR (bpm)</p>
                              <p className={`text-2xl font-mono font-bold ${bed.vitals.hr > 100 ? 'text-red-500' : 'text-emerald-500'}`}>
                                 {bed.vitals.hr}
                              </p>
                              <Activity className="h-4 w-4 text-emerald-500/50 mt-1" />
                           </div>
                           <div className="bg-black/40 p-2 rounded border border-slate-700/50">
                              <p className="text-[10px] text-blue-400 font-bold uppercase mb-1">SpO2 (%)</p>
                              <p className={`text-2xl font-mono font-bold ${bed.vitals.spo2 < 90 ? 'text-red-500' : 'text-blue-500'}`}>
                                 {bed.vitals.spo2}
                              </p>
                              <Wind className="h-4 w-4 text-blue-500/50 mt-1" />
                           </div>
                           <div className="bg-black/40 p-2 rounded border border-slate-700/50">
                              <p className="text-[10px] text-amber-400 font-bold uppercase mb-1">BP (mmHg)</p>
                              <p className="text-xl font-mono font-bold text-amber-500">
                                 {bed.vitals.bpSys}/{bed.vitals.bpDia}
                              </p>
                              <Heart className="h-4 w-4 text-amber-500/50 mt-1" />
                           </div>
                        </div>
                     </div>
                  ) : (
                     <div className="flex flex-col items-center justify-center h-full text-slate-600">
                        <BedDouble className="h-10 w-10 mb-2 opacity-20" />
                        <p className="text-sm">Bed Available</p>
                     </div>
                  )}
               </div>

               {/* Actions */}
               {bed.patientId && (
                  <div className="p-4 bg-slate-900/50 border-t border-slate-700 flex justify-between items-center">
                     <button className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
                        <BrainCircuit className="h-3 w-3" /> AI Analysis
                     </button>
                     
                     {activeCall === bed.id ? (
                        <button 
                           onClick={() => setActiveCall(null)}
                           className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2"
                        >
                           <PhoneOff className="h-3 w-3" /> End Call
                        </button>
                     ) : (
                        <button 
                           onClick={() => setActiveCall(bed.id)}
                           className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 animate-pulse"
                        >
                           <Video className="h-3 w-3" /> Connect
                        </button>
                     )}
                  </div>
               )}
            </div>
         ))}
      </div>
    </div>
  );
};
