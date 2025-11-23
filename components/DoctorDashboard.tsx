
import React, { useState, useEffect } from 'react';
import { MOCK_PATIENTS } from '../constants';
import { Patient, TriageLevel, VisitType, PatientStatus } from '../types';
import { getDoctorDailyBriefing, DoctorBriefing } from '../services/geminiService';
import { 
  Users, Activity, Clock, AlertTriangle, ClipboardList, Stethoscope, 
  ChevronRight, FileText, TestTube2, BedDouble, BrainCircuit
} from 'lucide-react';

export const DoctorDashboard: React.FC = () => {
  // Mock filtering for the logged-in doctor (Dr. Srinivas Rao)
  const myOPDPatients = MOCK_PATIENTS.filter(p => p.visitType === VisitType.OPD && p.status !== PatientStatus.DISCHARGED);
  const myIPDPatients = MOCK_PATIENTS.filter(p => p.visitType === VisitType.IPD && p.status === PatientStatus.ADMITTED);
  const criticalPatients = MOCK_PATIENTS.filter(p => p.triageLevel === TriageLevel.CRITICAL || p.triageLevel === TriageLevel.URGENT);
  
  const todayAppointments = 24;
  const completedAppointments = 8;

  const [aiBriefing, setAiBriefing] = useState<DoctorBriefing | null>(null);

  useEffect(() => {
    const fetchBriefing = async () => {
      const result = await getDoctorDailyBriefing("Dr. Srinivas Rao", myOPDPatients, myIPDPatients);
      setAiBriefing(result);
    };
    fetchBriefing();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Welcome & Status */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
         <div>
            <h2 className="text-2xl font-bold text-slate-800">Dr. Srinivas Rao</h2>
            <p className="text-sm text-slate-500">Senior Consultant • Cardiology • King George Hospital</p>
         </div>
         <div className="flex gap-3">
            <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-bold text-sm border border-blue-100 flex items-center gap-2">
               <Clock className="h-4 w-4" /> On Duty: 09:00 - 17:00
            </div>
            <div className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg font-bold text-sm border border-emerald-100 flex items-center gap-2">
               <Stethoscope className="h-4 w-4" /> OPD Room 104
            </div>
         </div>
      </div>

      {/* AI Clinical Assistant */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-xl p-6 text-white shadow-xl border border-purple-800 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
         <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
               <div className="p-2 bg-white/10 rounded-lg border border-white/20">
                  <BrainCircuit className="h-6 w-6 text-purple-300" />
               </div>
               <div>
                  <h3 className="text-lg font-bold">AI Clinical Assistant</h3>
                  <p className="text-xs text-purple-200">Personalized rounds & schedule optimization</p>
               </div>
            </div>
            
            {aiBriefing ? (
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-black/20 p-4 rounded-lg border border-white/10">
                     <p className="text-xs text-amber-300 uppercase font-bold mb-2 flex items-center gap-2">
                        <AlertTriangle className="h-3 w-3" /> Priorities
                     </p>
                     <ul className="text-sm space-y-1">
                        {aiBriefing.priorities.map((p, i) => (
                           <li key={i} className="flex items-start gap-2">
                              <span className="mt-1.5 w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                              {p}
                           </li>
                        ))}
                     </ul>
                  </div>
                  <div className="bg-black/20 p-4 rounded-lg border border-white/10">
                     <p className="text-xs text-red-300 uppercase font-bold mb-2 flex items-center gap-2">
                        <Activity className="h-3 w-3" /> Risk Alerts
                     </p>
                     {aiBriefing.riskAlerts.length > 0 ? (
                        <ul className="text-sm space-y-1">
                           {aiBriefing.riskAlerts.map((r, i) => (
                              <li key={i} className="flex items-start gap-2">
                                 <span className="mt-1.5 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                                 {r}
                              </li>
                           ))}
                        </ul>
                     ) : <p className="text-sm text-slate-300">No critical stability alerts.</p>}
                  </div>
                  <div className="bg-black/20 p-4 rounded-lg border border-white/10">
                     <p className="text-xs text-blue-300 uppercase font-bold mb-2 flex items-center gap-2">
                        <Clock className="h-3 w-3" /> Schedule Advice
                     </p>
                     <p className="text-sm text-slate-200 leading-relaxed">{aiBriefing.scheduleOptimization}</p>
                  </div>
               </div>
            ) : (
               <div className="flex items-center justify-center gap-2 py-4 text-purple-200 text-sm">
                  <BrainCircuit className="h-4 w-4 animate-pulse" /> Analysing patient load...
               </div>
            )}
         </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start">
               <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">OPD Appointments</p>
                  <h3 className="text-2xl font-bold text-slate-900 mt-1">{completedAppointments} / {todayAppointments}</h3>
               </div>
               <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Users className="h-5 w-5" /></div>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3">
               <div className="bg-blue-500 h-1.5 rounded-full" style={{width: `${(completedAppointments/todayAppointments)*100}%`}}></div>
            </div>
         </div>

         <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start">
               <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">Inpatient Rounds</p>
                  <h3 className="text-2xl font-bold text-slate-900 mt-1">{myIPDPatients.length}</h3>
               </div>
               <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><BedDouble className="h-5 w-5" /></div>
            </div>
            <p className="text-xs text-slate-400 mt-2">3 Discharges Pending</p>
         </div>

         <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start">
               <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">Critical Flags</p>
                  <h3 className="text-2xl font-bold text-slate-900 mt-1">{criticalPatients.length}</h3>
               </div>
               <div className="p-2 bg-red-100 text-red-600 rounded-lg"><AlertTriangle className="h-5 w-5" /></div>
            </div>
            <p className="text-xs text-red-600 font-bold mt-2 animate-pulse">Action Required</p>
         </div>

         <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start">
               <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">Pending Labs</p>
                  <h3 className="text-2xl font-bold text-slate-900 mt-1">12</h3>
               </div>
               <div className="p-2 bg-amber-100 text-amber-600 rounded-lg"><TestTube2 className="h-5 w-5" /></div>
            </div>
            <p className="text-xs text-slate-400 mt-2">Review Results</p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Left Col: Active Queues */}
         <div className="lg:col-span-2 space-y-6">
            
            {/* Critical Watchlist */}
            <div className="bg-white rounded-xl border border-red-100 shadow-sm overflow-hidden">
               <div className="px-6 py-4 bg-red-50 border-b border-red-100 flex justify-between items-center">
                  <h3 className="font-bold text-red-800 flex items-center gap-2">
                     <Activity className="h-5 w-5" /> High Risk Watchlist (AI Detected)
                  </h3>
                  <span className="text-xs font-bold bg-white text-red-600 px-2 py-1 rounded border border-red-100">
                     {criticalPatients.length} Patients
                  </span>
               </div>
               <div className="divide-y divide-slate-100">
                  {criticalPatients.map(p => (
                     <div key={p.id} className="p-4 hover:bg-red-50/30 transition-colors flex items-center justify-between group cursor-pointer">
                        <div className="flex items-start gap-3">
                           <div className="mt-1 w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                           <div>
                              <p className="font-bold text-slate-800">{p.name}</p>
                              <p className="text-xs text-slate-500">{p.age}y / {p.gender} • {p.ward}</p>
                              <div className="flex gap-2 mt-1">
                                 {p.symptoms.slice(0, 2).map((s, i) => (
                                    <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{s}</span>
                                 ))}
                              </div>
                           </div>
                        </div>
                        <div className="text-right">
                           <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded uppercase">{p.triageLevel}</span>
                           <button className="block mt-2 text-xs text-blue-600 hover:underline">View Vitals</button>
                        </div>
                     </div>
                  ))}
               </div>
            </div>

            {/* Upcoming Schedule */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
               <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2">
                     <ClipboardList className="h-5 w-5 text-slate-500" /> OPD Queue
                  </h3>
                  <button className="text-xs font-bold text-blue-600 hover:underline">View All</button>
               </div>
               <div className="divide-y divide-slate-100">
                  {myOPDPatients.length > 0 ? myOPDPatients.slice(0, 5).map(p => (
                     <div key={p.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between cursor-pointer">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm">
                              {p.tokenNumber?.split('-')[1] || '#'}
                           </div>
                           <div>
                              <p className="font-semibold text-slate-900">{p.name}</p>
                              <p className="text-xs text-slate-500">{p.age}y / {p.gender} • ID: {p.id}</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-4">
                           <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">
                              {p.visitType}
                           </span>
                           <ChevronRight className="h-4 w-4 text-slate-400" />
                        </div>
                     </div>
                  )) : (
                     <div className="p-8 text-center text-slate-400 text-sm">No active OPD patients.</div>
                  )}
               </div>
            </div>
         </div>

         {/* Right Col: Quick Actions & Labs */}
         <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-6 text-white shadow-lg">
               <h3 className="font-bold text-lg mb-1">My Rounds</h3>
               <p className="text-blue-200 text-sm mb-6">You have {myIPDPatients.length} patients in ICU & General Wards.</p>
               <button className="w-full bg-white text-blue-700 font-bold py-3 rounded-lg hover:bg-blue-50 transition-colors shadow-sm flex items-center justify-center gap-2">
                  Start Ward Rounds <ChevronRight className="h-4 w-4" />
               </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
               <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
                  <h3 className="font-bold text-sm text-slate-700">Pending Lab Reviews</h3>
               </div>
               <div className="divide-y divide-slate-100">
                  {[1, 2, 3].map((_, i) => (
                     <div key={i} className="p-3 hover:bg-slate-50 flex items-start gap-3 cursor-pointer">
                        <FileText className="h-4 w-4 text-slate-400 mt-1" />
                        <div>
                           <p className="text-sm font-semibold text-slate-800">Lipid Profile - S. Rao</p>
                           <p className="text-xs text-slate-500">Result available • 20 mins ago</p>
                        </div>
                     </div>
                  ))}
               </div>
               <button className="w-full py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 transition-colors">
                  View All Reports
               </button>
            </div>
         </div>
      </div>
    </div>
  );
};
