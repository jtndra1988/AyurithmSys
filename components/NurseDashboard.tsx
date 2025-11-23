
import React, { useState, useEffect } from 'react';
import { Patient, PatientStatus, VisitType, TriageLevel } from '../types';
import { getNurseShiftHandover, NurseHandover } from '../services/geminiService';
import { 
  HeartPulse, ClipboardList, CheckCircle2, Clock, BedDouble, AlertTriangle, 
  BrainCircuit, ChevronRight, Syringe, Activity, FileText 
} from 'lucide-react';

interface NurseDashboardProps {
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
}

export const NurseDashboard: React.FC<NurseDashboardProps> = ({ patients, onSelectPatient }) => {
  // Filter for Admitted Patients (Nurse's Ward)
  const wardPatients = patients.filter(p => p.status === PatientStatus.ADMITTED);
  
  const [handover, setHandover] = useState<NurseHandover | null>(null);
  
  // Mock Task Generation based on time
  const getTasksDue = (patient: Patient) => {
    const tasks = [];
    // Simulate Meds due
    if (patient.medications && patient.medications.length > 0) {
      tasks.push({ type: 'MED', desc: 'Administer PM Meds', urgent: false });
    }
    // Simulate Vitals due for critical/urgent
    if (patient.triageLevel === TriageLevel.CRITICAL) {
      tasks.push({ type: 'VITALS', desc: 'Hourly Vitals Check', urgent: true });
    }
    return tasks;
  };

  useEffect(() => {
    const fetchHandover = async () => {
      const result = await getNurseShiftHandover(wardPatients);
      setHandover(result);
    };
    if(wardPatients.length > 0) fetchHandover();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
               <BedDouble className="h-6 w-6" />
            </div>
            <div>
               <p className="text-xs font-bold text-slate-500 uppercase">Ward Occupancy</p>
               <h3 className="text-2xl font-bold text-slate-900">{wardPatients.length} <span className="text-sm text-slate-400 font-normal">/ 40</span></h3>
            </div>
         </div>
         <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-red-50 text-red-600 rounded-lg">
               <Activity className="h-6 w-6" />
            </div>
            <div>
               <p className="text-xs font-bold text-slate-500 uppercase">Critical Watch</p>
               <h3 className="text-2xl font-bold text-slate-900">
                  {wardPatients.filter(p => p.triageLevel === TriageLevel.CRITICAL).length}
               </h3>
            </div>
         </div>
         <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
               <Syringe className="h-6 w-6" />
            </div>
            <div>
               <p className="text-xs font-bold text-slate-500 uppercase">Meds Due</p>
               <h3 className="text-2xl font-bold text-slate-900">
                  {wardPatients.reduce((acc, p) => acc + (p.medications?.length || 0), 0)}
               </h3>
            </div>
         </div>
         <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
               <ClipboardList className="h-6 w-6" />
            </div>
            <div>
               <p className="text-xs font-bold text-slate-500 uppercase">Discharges</p>
               <h3 className="text-2xl font-bold text-slate-900">
                  {patients.filter(p => p.status === PatientStatus.DISCHARGED && p.dischargeDate === new Date().toISOString().split('T')[0]).length}
               </h3>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         
         {/* AI Handover Panel */}
         <div className="lg:col-span-1 space-y-6">
            <div className="bg-gradient-to-b from-indigo-900 to-slate-900 text-white p-6 rounded-xl shadow-lg border border-indigo-800 relative overflow-hidden">
               <div className="flex items-center gap-3 mb-4 relative z-10">
                  <div className="p-2 bg-white/10 rounded-lg border border-white/20">
                     <BrainCircuit className="h-6 w-6 text-indigo-300" />
                  </div>
                  <div>
                     <h3 className="font-bold">AI Shift Handover</h3>
                     <p className="text-xs text-indigo-300">Summary for Incoming Nurse</p>
                  </div>
               </div>
               
               {handover ? (
                  <div className="space-y-4 relative z-10">
                     <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                        <p className="text-sm leading-relaxed text-slate-200">{handover.shiftSummary}</p>
                     </div>
                     <div>
                        <p className="text-xs font-bold text-amber-400 uppercase mb-2 flex items-center gap-2">
                           <AlertTriangle className="h-3 w-3" /> Critical Attention
                        </p>
                        <ul className="space-y-1 text-sm">
                           {handover.criticalPatients.map((p, i) => (
                              <li key={i} className="flex items-start gap-2">
                                 <span className="mt-1.5 w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                                 {p}
                              </li>
                           ))}
                        </ul>
                     </div>
                     <div>
                        <p className="text-xs font-bold text-blue-400 uppercase mb-2 flex items-center gap-2">
                           <ClipboardList className="h-3 w-3" /> Pending Tasks
                        </p>
                        <ul className="space-y-1 text-sm">
                           {handover.pendingTasks.map((t, i) => (
                              <li key={i} className="flex items-start gap-2">
                                 <span className="mt-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                                 {t}
                              </li>
                           ))}
                        </ul>
                     </div>
                  </div>
               ) : (
                  <div className="text-center py-8 text-slate-400 text-sm">Generating handover report...</div>
               )}
               <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
            </div>
         </div>

         {/* Ward Patient List */}
         <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
               <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <HeartPulse className="h-5 w-5 text-red-500" /> Active Ward List
               </h3>
               <span className="text-xs text-slate-500 font-medium">{new Date().toLocaleDateString()}</span>
            </div>
            
            <div className="divide-y divide-slate-100 overflow-y-auto max-h-[600px]">
               {wardPatients.length > 0 ? wardPatients.map(patient => {
                  const tasks = getTasksDue(patient);
                  return (
                     <div key={patient.id} className="p-4 hover:bg-slate-50 transition-colors cursor-pointer group" onClick={() => onSelectPatient(patient)}>
                        <div className="flex justify-between items-start">
                           <div className="flex items-start gap-4">
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white shadow-sm ${
                                 patient.triageLevel === TriageLevel.CRITICAL ? 'bg-red-500' : 
                                 patient.triageLevel === TriageLevel.URGENT ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}>
                                 {patient.name.charAt(0)}
                              </div>
                              <div>
                                 <h4 className="font-bold text-slate-900 flex items-center gap-2">
                                    {patient.name} 
                                    <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{patient.ward}</span>
                                 </h4>
                                 <p className="text-sm text-slate-500">{patient.age}y / {patient.gender} • ID: {patient.id}</p>
                                 <p className="text-xs text-slate-400 mt-1 truncate max-w-xs">{patient.history}</p>
                              </div>
                           </div>
                           
                           <div className="text-right">
                              <div className="flex flex-col items-end gap-2">
                                 {tasks.map((t, i) => (
                                    <span key={i} className={`text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 ${
                                       t.urgent ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-blue-50 text-blue-700 border border-blue-100'
                                    }`}>
                                       {t.urgent ? <AlertTriangle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                                       {t.desc}
                                    </span>
                                 ))}
                                 <button className="text-xs font-bold text-slate-400 group-hover:text-brand-600 flex items-center gap-1 mt-1">
                                    Open Chart <ChevronRight className="h-3 w-3" />
                                 </button>
                              </div>
                           </div>
                        </div>
                     </div>
                  );
               }) : (
                  <div className="p-12 text-center text-slate-400">
                     <BedDouble className="h-12 w-12 mx-auto mb-3 opacity-20" />
                     <p>No active patients in ward.</p>
                  </div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
};
