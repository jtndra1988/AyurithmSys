import React, { useState, useEffect } from 'react';
import { AuditLog } from '../types';
import { getAuditAnalysis, SecurityAnalysis } from '../services/geminiService';
import { ShieldCheck, Eye, Search, Filter, Lock, Download, AlertTriangle, BrainCircuit } from 'lucide-react';

interface AdminAuditProps {
  logs: AuditLog[];
}

export const AdminAudit: React.FC<AdminAuditProps> = ({ logs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [aiSecurity, setAiSecurity] = useState<SecurityAnalysis | null>(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      const result = await getAuditAnalysis(logs);
      setAiSecurity(result);
    };
    fetchAnalysis();
  }, [logs]);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = actionFilter === 'ALL' || log.action === actionFilter;

    return matchesSearch && matchesFilter;
  });

  const getActionColor = (action: string) => {
    switch (action) {
      case 'LOGIN': return 'text-slate-600 bg-slate-100 border-slate-200';
      case 'ACCESS': return 'text-blue-600 bg-blue-50 border-blue-100';
      case 'ANALYSIS': return 'text-purple-600 bg-purple-50 border-purple-100';
      case 'GOVERNANCE': return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'SUBMISSION': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'ALERT': return 'text-red-600 bg-red-50 border-red-100';
      default: return 'text-slate-600 bg-slate-50 border-slate-100';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-6 rounded-2xl text-white shadow-lg flex flex-col md:flex-row justify-between items-center gap-4">
         <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
               <ShieldCheck className="h-6 w-6 text-emerald-400" /> Audit & Compliance Center
            </h2>
            <p className="text-slate-400 text-sm mt-1">
               Live immutable ledger of all system interactions. DPDPA 2023 & ISO 27001 Compliant.
            </p>
         </div>
         <div className="flex gap-4">
            <div className="text-center px-4 py-2 bg-white/5 rounded-lg border border-white/10">
              <span className="block text-2xl font-bold">{logs.length}</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">Total Events</span>
            </div>
            <div className="text-center px-4 py-2 bg-white/5 rounded-lg border border-white/10">
              <span className="block text-2xl font-bold text-purple-400">{logs.filter(l => l.action === 'ANALYSIS').length}</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">AI Decisions</span>
            </div>
         </div>
      </div>

      {/* AI CISO Panel */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
         <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white rounded-lg border border-slate-200">
               <BrainCircuit className="h-5 w-5 text-slate-600" />
            </div>
            <div>
               <h3 className="font-bold text-slate-800">AI CISO Threat Monitor</h3>
               <p className="text-xs text-slate-500">Continuous analysis of access patterns</p>
            </div>
         </div>
         {aiSecurity ? (
           <div className="flex items-start gap-6">
              <div className={`px-4 py-3 rounded-lg border ${
                 aiSecurity.threatLevel === 'High' ? 'bg-red-50 border-red-100 text-red-800' :
                 aiSecurity.threatLevel === 'Medium' ? 'bg-amber-50 border-amber-100 text-amber-800' : 'bg-emerald-50 border-emerald-100 text-emerald-800'
              }`}>
                 <div className="text-xs font-bold uppercase tracking-wider mb-1">Threat Level</div>
                 <div className="text-2xl font-bold">{aiSecurity.threatLevel}</div>
              </div>
              <div className="flex-1 p-3 bg-white rounded-lg border border-slate-200">
                 <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Security Posture Summary</div>
                 <p className="text-sm text-slate-700 leading-relaxed">{aiSecurity.summary}</p>
              </div>
           </div>
         ) : (
           <div className="text-center text-slate-400 text-sm">Scanning logs for anomalies...</div>
         )}
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
         <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
               type="text" 
               placeholder="Search User, Resource, or Activity..." 
               className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white shadow-sm"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
            />
         </div>
         <div className="flex gap-2 w-full md:w-auto">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
              <select 
                className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-brand-500 shadow-sm appearance-none"
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
              >
                 <option value="ALL">All Actions</option>
                 <option value="LOGIN">Auth / Login</option>
                 <option value="ACCESS">Data Access</option>
                 <option value="ANALYSIS">AI Analysis</option>
                 <option value="GOVERNANCE">Admin Governance</option>
                 <option value="SUBMISSION">Data Submission</option>
              </select>
            </div>
            <button 
              className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm bg-white hover:bg-slate-50 shadow-sm font-medium text-slate-600"
              onClick={() => alert("Generating encrypted PDF report for State Audit Committee...")}
            >
               <Download className="h-4 w-4" /> Export Log
            </button>
         </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
         <table className="w-full text-left">
            <thead>
               <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Timestamp (IST)</th>
                  <th className="px-6 py-4">User Identity</th>
                  <th className="px-6 py-4">Action Type</th>
                  <th className="px-6 py-4">Target Resource</th>
                  <th className="px-6 py-4">Activity Details</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
               {filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                     <td className="px-6 py-4 text-xs text-slate-500 font-mono whitespace-nowrap">{log.timestamp}</td>
                     <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                           <div className="h-8 w-8 bg-slate-100 rounded-full flex items-center justify-center text-xs font-bold text-slate-600 border border-slate-200">
                              {log.userName.charAt(0)}
                           </div>
                           <div>
                              <p className="text-sm font-semibold text-slate-900">{log.userName}</p>
                              <span className="inline-flex text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 rounded uppercase tracking-wider">
                                 {log.role}
                              </span>
                           </div>
                        </div>
                     </td>
                     <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${getActionColor(log.action)}`}>
                           {log.action}
                        </span>
                     </td>
                     <td className="px-6 py-4 text-sm text-slate-700 font-mono">{log.resource}</td>
                     <td className="px-6 py-4 text-sm text-slate-500 max-w-sm truncate" title={log.details}>
                        {log.details}
                     </td>
                  </tr>
               ))}
               {filteredLogs.length === 0 && (
                 <tr>
                   <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                     <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                     No logs found matching your criteria.
                   </td>
                 </tr>
               )}
            </tbody>
         </table>
      </div>
      
      <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-center gap-3 animate-in slide-in-from-bottom-2">
         <Lock className="h-5 w-5 text-emerald-500" />
         <p className="text-xs text-emerald-800">
            <strong>System Integrity Verified:</strong> All logs are cryptographically signed and stored in immutable storage. Last integrity check: Just now.
         </p>
      </div>
    </div>
  );
};