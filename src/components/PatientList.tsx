
import React, { useState, useEffect } from 'react';
import { Patient, TriageLevel, VisitType, PatientStatus } from '../types';
import { Search, Filter, ChevronRight, Users, BedDouble, AlertCircle, Clock, BrainCircuit, RefreshCw, AlertTriangle, TrendingUp } from 'lucide-react';
import { getQueueAnalysis, QueueAnalysis } from '../services/geminiService';

interface PatientListProps {
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
  onLogAction?: (action: string, resource: string, details: string) => void;
}

export const PatientList: React.FC<PatientListProps> = ({ patients, onSelectPatient, onLogAction }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'OPD' | 'IPD' | 'EMERGENCY'>('ALL');
  const [aiQueueAnalysis, setAiQueueAnalysis] = useState<QueueAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    // Auto-run analysis on mount or when patient list changes significantly
    if (patients.length > 0 && !aiQueueAnalysis) {
      runQueueAnalysis();
    }
  }, [patients]);

  const runQueueAnalysis = async () => {
    setIsAnalyzing(true);
    const result = await getQueueAnalysis(patients);
    setAiQueueAnalysis(result);
    setIsAnalyzing(false);
    if (onLogAction) onLogAction('ANALYSIS', 'Clinical Queue', 'Ran AI Triage Master optimization');
  };

  const handleSelect = (patient: Patient) => {
    onSelectPatient(patient);
  };

  const filteredPatients = patients.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.abhaId.includes(searchTerm);
    const matchesTab = activeTab === 'ALL' || p.visitType === activeTab;
    return matchesSearch && matchesTab;
  });

  // Counts for tabs
  const countOPD = patients.filter(p => p.visitType === VisitType.OPD).length;
  const countIPD = patients.filter(p => p.visitType === VisitType.IPD).length;
  const countEmergency = patients.filter(p => p.visitType === VisitType.EMERGENCY).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* AI Triage Master Panel */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-xl p-6 text-white shadow-lg border border-purple-700 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
         <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/10 rounded-lg border border-white/20">
                     <BrainCircuit className="h-6 w-6 text-purple-300" />
                  </div>
                  <div>
                     <h3 className="text-lg font-bold">AI Triage Master</h3>
                     <p className="text-xs text-purple-200">Real-time queue optimization & risk detection</p>
                  </div>
               </div>
               <button 
                  onClick={runQueueAnalysis}
                  disabled={isAnalyzing}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold backdrop-blur-sm border border-white/20 flex items-center gap-2 transition-colors disabled:opacity-50"
               >
                  {isAnalyzing ? <RefreshCw className="h-3 w-3 animate-spin" /> : <TrendingUp className="h-3 w-3" />}
                  {isAnalyzing ? 'Scanning Queue...' : 'Refresh Analysis'}
               </button>
            </div>

            {aiQueueAnalysis ? (
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-black/20 p-4 rounded-lg border border-white/10 flex items-center gap-4">
                     <div className={`p-3 rounded-full ${
                        aiQueueAnalysis.efficiencyScore > 80 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                     }`}>
                        <Clock className="h-6 w-6" />
                     </div>
                     <div>
                        <p className="text-xs text-purple-200 uppercase font-bold">Queue Efficiency</p>
                        <p className="text-2xl font-bold">{aiQueueAnalysis.efficiencyScore}/100</p>
                     </div>
                  </div>
                  
                  <div className="bg-black/20 p-4 rounded-lg border border-white/10">
                     <p className="text-xs text-red-300 uppercase font-bold mb-2 flex items-center gap-2">
                        <AlertTriangle className="h-3 w-3" /> Hidden Risks Detected
                     </p>
                     {aiQueueAnalysis.criticalAlerts.length > 0 ? (
                        <ul className="text-sm space-y-1 text-white font-medium">
                           {aiQueueAnalysis.criticalAlerts.slice(0, 2).map((alert, i) => (
                              <li key={i} className="flex items-start gap-2">
                                 <span className="mt-1.5 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                                 {alert}
                              </li>
                           ))}
                        </ul>
                     ) : (
                        <p className="text-sm text-emerald-300 flex items-center gap-2">
                           <Clock className="h-4 w-4" /> No critical anomalies found.
                        </p>
                     )}
                  </div>

                  <div className="bg-black/20 p-4 rounded-lg border border-white/10">
                     <p className="text-xs text-blue-300 uppercase font-bold mb-2 flex items-center gap-2">
                        <Users className="h-3 w-3" /> Queue Optimization
                     </p>
                     <p className="text-sm text-slate-200 leading-snug mb-2">
                        {aiQueueAnalysis.resourceAdvice}
                     </p>
                     {aiQueueAnalysis.reorderingSuggestions.length > 0 && (
                        <div className="text-xs text-blue-200 bg-blue-500/10 px-2 py-1 rounded">
                           <strong>Tip:</strong> {aiQueueAnalysis.reorderingSuggestions[0]}
                        </div>
                     )}
                  </div>
               </div>
            ) : (
               <div className="text-center text-purple-300 text-sm py-4">
                  Initializing queue analysis engine...
               </div>
            )}
         </div>
      </div>

      {/* Workflow Tabs */}
      <div className="grid grid-cols-4 gap-4">
        <button 
           onClick={() => setActiveTab('ALL')}
           className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
             activeTab === 'ALL' ? 'bg-slate-800 text-white border-slate-800 shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
           }`}
        >
           <Users className="h-5 w-5" />
           <span className="text-xs font-bold uppercase tracking-wider">All Patients</span>
           <span className="text-lg font-bold">{patients.length}</span>
        </button>
        <button 
           onClick={() => setActiveTab('OPD')}
           className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
             activeTab === 'OPD' ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:bg-blue-50'
           }`}
        >
           <Clock className="h-5 w-5" />
           <span className="text-xs font-bold uppercase tracking-wider">OPD Queue</span>
           <span className="text-lg font-bold">{countOPD}</span>
        </button>
        <button 
           onClick={() => setActiveTab('IPD')}
           className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
             activeTab === 'IPD' ? 'bg-purple-600 text-white border-purple-600 shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:bg-purple-50'
           }`}
        >
           <BedDouble className="h-5 w-5" />
           <span className="text-xs font-bold uppercase tracking-wider">Admitted (IPD)</span>
           <span className="text-lg font-bold">{countIPD}</span>
        </button>
        <button 
           onClick={() => setActiveTab('EMERGENCY')}
           className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
             activeTab === 'EMERGENCY' ? 'bg-red-600 text-white border-red-600 shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:bg-red-50'
           }`}
        >
           <AlertCircle className="h-5 w-5" />
           <span className="text-xs font-bold uppercase tracking-wider">Emergency</span>
           <span className="text-lg font-bold">{countEmergency}</span>
        </button>
      </div>

      <div className="flex justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by Name, ABHA ID..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 font-medium">
            <Filter className="h-4 w-4" /> Filter
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th className="px-6 py-4">Patient Profile</th>
              <th className="px-6 py-4">Visit Status</th>
              <th className="px-6 py-4">Location / Token</th>
              <th className="px-6 py-4">Clinical Priority</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredPatients.length > 0 ? filteredPatients.map((patient) => (
              <tr 
                key={patient.id} 
                className="hover:bg-slate-50 transition-colors cursor-pointer group relative"
                onClick={() => handleSelect(patient)}
              >
                <td className="px-6 py-4">
                  <div className="relative">
                     {/* AI Flag Indicator */}
                     {aiQueueAnalysis?.criticalAlerts.some(alert => alert.includes(patient.name)) && (
                        <span className="absolute -left-3 top-1 w-2 h-2 bg-purple-500 rounded-full animate-pulse" title="AI Flagged for Review"></span>
                     )}
                     <p className="font-semibold text-slate-900">{patient.name}</p>
                     <p className="text-xs text-slate-500">{patient.age}y / {patient.gender}</p>
                     <p className="text-[10px] text-slate-400 font-mono mt-0.5">{patient.abhaId}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wide
                    ${patient.visitType === VisitType.EMERGENCY ? 'bg-red-50 text-red-700 border-red-200' : 
                      patient.visitType === VisitType.IPD ? 'bg-purple-50 text-purple-700 border-purple-200' : 
                      'bg-blue-50 text-blue-700 border-blue-200'}`}>
                    {patient.visitType}
                  </span>
                  <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase ml-1">{patient.status}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-slate-700 font-medium">{patient.ward}</p>
                  {patient.tokenNumber && <span className="text-xs font-mono text-slate-500 bg-slate-100 px-1 rounded border border-slate-200 mt-1 inline-block">{patient.tokenNumber}</span>}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                     <span className={`h-2.5 w-2.5 rounded-full ${
                        patient.triageLevel === TriageLevel.CRITICAL ? 'bg-red-500 animate-pulse' : 
                        patient.triageLevel === TriageLevel.URGENT ? 'bg-amber-500' : 'bg-emerald-500'
                     }`}></span>
                     <span className="text-xs font-medium text-slate-600">{patient.triageLevel}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-brand-600 hover:bg-brand-50 p-2 rounded-full transition-colors group-hover:bg-white border border-transparent group-hover:border-slate-200 shadow-sm">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                 <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    No patients found in this queue.
                 </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
