
import React, { useState } from 'react';
import { Patient, PatientStatus, VisitType, TriageLevel } from '../types';
import { getDischargeReadiness, DischargeReadiness } from '../services/geminiService';
import { 
  BedDouble, Activity, Clock, FileText, CheckCircle2, AlertTriangle, 
  ChevronRight, User, Calendar, Stethoscope, Thermometer, BrainCircuit, LogOut, RefreshCw
} from 'lucide-react';

interface InpatientRoundsProps {
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
  onLogAction?: (action: string, resource: string, details: string) => void;
}

export const InpatientRounds: React.FC<InpatientRoundsProps> = ({ patients, onSelectPatient, onLogAction }) => {
  const [selectedWard, setSelectedWard] = useState<string>('All');
  const [aiPrediction, setAiPrediction] = useState<{id: string, data: DischargeReadiness} | null>(null);
  const [predictingId, setPredictingId] = useState<string | null>(null);

  // Filter for active IPD patients
  const ipdPatients = patients.filter(p => 
    (p.visitType === VisitType.IPD || p.visitType === VisitType.EMERGENCY) && 
    p.status === PatientStatus.ADMITTED
  );

  // Extract unique wards
  const wards = ['All', ...Array.from(new Set(ipdPatients.map(p => p.ward || 'Unassigned'))).sort()];

  const filteredPatients = selectedWard === 'All' 
    ? ipdPatients 
    : ipdPatients.filter(p => p.ward === selectedWard);

  // Sort by Triage Level (Critical first)
  filteredPatients.sort((a, b) => {
    const priority = { [TriageLevel.CRITICAL]: 0, [TriageLevel.URGENT]: 1, [TriageLevel.STANDARD]: 2 };
    return priority[a.triageLevel] - priority[b.triageLevel];
  });

  const calculateLOS = (admissionDate: string) => {
    const start = new Date(admissionDate);
    const now = new Date();
    const diff = now.getTime() - start.getTime();
    return Math.ceil(diff / (1000 * 3600 * 24)); 
  };

  const handlePredictDischarge = async (e: React.MouseEvent, patient: Patient) => {
    e.stopPropagation();
    setPredictingId(patient.id);
    const result = await getDischargeReadiness(patient);
    setAiPrediction({ id: patient.id, data: result });
    setPredictingId(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Rounds Header */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm gap-4">
        <div>
           <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
              <Stethoscope className="h-6 w-6 text-purple-600" /> Daily Rounds
           </h2>
           <p className="text-sm text-slate-500 mt-1">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
           </p>
        </div>
        
        <div className="flex gap-4 text-sm">
           <div className="px-4 py-2 bg-purple-50 text-purple-700 rounded-lg border border-purple-100">
              <span className="block font-bold text-xl">{ipdPatients.length}</span>
              <span className="text-xs uppercase tracking-wider">Total Patients</span>
           </div>
           <div className="px-4 py-2 bg-red-50 text-red-700 rounded-lg border border-red-100">
              <span className="block font-bold text-xl">{ipdPatients.filter(p => p.triageLevel === TriageLevel.CRITICAL).length}</span>
              <span className="text-xs uppercase tracking-wider">Critical Care</span>
           </div>
           <div className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100">
              <span className="block font-bold text-xl">{ipdPatients.filter(p => calculateLOS(p.admissionDate) > 5).length}</span>
              <span className="text-xs uppercase tracking-wider">Long Stay (>5d)</span>
           </div>
        </div>
      </div>

      {/* Ward Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
         {wards.map(ward => (
            <button
               key={ward}
               onClick={() => setSelectedWard(ward)}
               className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors border ${
                  selectedWard === ward 
                    ? 'bg-slate-800 text-white border-slate-800' 
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
               }`}
            >
               {ward}
            </button>
         ))}
      </div>

      {/* Patient Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
         {filteredPatients.length > 0 ? filteredPatients.map(patient => (
            <div 
               key={patient.id} 
               onClick={() => onSelectPatient(patient)}
               className={`bg-white rounded-xl border transition-all hover:shadow-md cursor-pointer group relative overflow-hidden flex flex-col ${
                  patient.triageLevel === TriageLevel.CRITICAL ? 'border-l-4 border-l-red-500' : 
                  patient.triageLevel === TriageLevel.URGENT ? 'border-l-4 border-l-amber-500' : 'border-slate-200'
               }`}
            >
               {/* Quick Status Strip */}
               <div className="absolute top-0 right-0 p-2">
                  {patient.triageLevel === TriageLevel.CRITICAL && (
                     <span className="flex items-center gap-1 text-[10px] font-bold bg-red-100 text-red-700 px-2 py-1 rounded-full uppercase tracking-wide">
                        <Activity className="h-3 w-3 animate-pulse" /> Critical
                     </span>
                  )}
               </div>

               <div className="p-5 flex-1">
                  <div className="flex justify-between items-start mb-3">
                     <div>
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-purple-700 transition-colors">{patient.name}</h3>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                           <span className="flex items-center gap-1"><User className="h-3 w-3" /> {patient.age}y / {patient.gender}</span>
                           <span>•</span>
                           <span className="font-mono text-slate-400">{patient.id}</span>
                        </div>
                     </div>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 mb-4">
                     <div className="flex items-center gap-2 mb-2">
                        <BedDouble className="h-4 w-4 text-slate-400" />
                        <span className="text-sm font-semibold text-slate-700">{patient.ward}</span>
                     </div>
                     <div className="flex justify-between items-center text-xs">
                        <div className="text-slate-500">
                           <span className="block uppercase text-[10px] font-bold text-slate-400">Admitted</span>
                           <span className="font-mono">{patient.admissionDate}</span>
                        </div>
                        <div className="text-right">
                           <span className="block uppercase text-[10px] font-bold text-slate-400">LOS</span>
                           <span className="font-bold text-slate-800">{calculateLOS(patient.admissionDate)} Days</span>
                        </div>
                     </div>
                  </div>

                  {/* Vitals Snapshot */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                     <div className="text-center p-2 bg-blue-50 rounded border border-blue-100">
                        <span className="block text-[10px] font-bold text-blue-400 uppercase">HR</span>
                        <span className="text-sm font-bold text-blue-700">{patient.vitals.heartRate}</span>
                     </div>
                     <div className="text-center p-2 bg-teal-50 rounded border border-teal-100">
                        <span className="block text-[10px] font-bold text-teal-400 uppercase">SpO2</span>
                        <span className={`text-sm font-bold ${patient.vitals.spO2 < 95 ? 'text-red-600' : 'text-teal-700'}`}>
                           {patient.vitals.spO2}%
                        </span>
                     </div>
                     <div className="text-center p-2 bg-orange-50 rounded border border-orange-100">
                        <span className="block text-[10px] font-bold text-orange-400 uppercase">Temp</span>
                        <span className={`text-sm font-bold ${patient.vitals.temperature > 37.5 ? 'text-red-600' : 'text-orange-700'}`}>
                           {patient.vitals.temperature}
                        </span>
                     </div>
                  </div>
                  
                  {/* AI Prediction Area */}
                  {aiPrediction?.id === patient.id && (
                     <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-lg mb-4 animate-in zoom-in duration-300">
                        <div className="flex justify-between items-center mb-2">
                           <h4 className="text-xs font-bold text-indigo-800 flex items-center gap-1">
                              <BrainCircuit className="h-3 w-3" /> Discharge Readiness
                           </h4>
                           <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                              aiPrediction.data.status === 'Ready' ? 'bg-emerald-200 text-emerald-800' : 'bg-amber-200 text-amber-800'
                           }`}>{aiPrediction.data.score}%</span>
                        </div>
                        <div className="text-xs text-indigo-700 space-y-1">
                           <p><strong>Est. Discharge:</strong> {aiPrediction.data.estimatedDischargeDate}</p>
                           {aiPrediction.data.missingCriteria.length > 0 && (
                              <div className="mt-1">
                                 <p className="text-[10px] uppercase text-indigo-400 font-bold">Pending:</p>
                                 <ul className="list-disc list-inside pl-1 text-[10px]">
                                    {aiPrediction.data.missingCriteria.map((c, i) => <li key={i}>{c}</li>)}
                                 </ul>
                              </div>
                           )}
                        </div>
                     </div>
                  )}
               </div>

               <div className="flex items-center justify-between p-4 border-t border-slate-100 bg-slate-50/50 mt-auto">
                  <button 
                     onClick={(e) => handlePredictDischarge(e, patient)}
                     disabled={predictingId === patient.id}
                     className="text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1 border border-indigo-200"
                  >
                     {predictingId === patient.id ? <RefreshCw className="h-3 w-3 animate-spin" /> : <BrainCircuit className="h-3 w-3" />}
                     {predictingId === patient.id ? 'Analyzing' : 'AI Discharge Check'}
                  </button>
                  <button className="text-purple-600 hover:text-purple-800 text-xs font-bold flex items-center gap-1">
                     Open Chart <ChevronRight className="h-3 w-3" />
                  </button>
               </div>
            </div>
         )) : (
            <div className="col-span-full text-center py-12 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-300">
               <BedDouble className="h-8 w-8 mx-auto mb-3 opacity-50" />
               <p>No patients found in {selectedWard}.</p>
            </div>
         )}
      </div>
    </div>
  );
};
