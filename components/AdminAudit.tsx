import React from 'react';
import { MOCK_AUDIT_LOGS } from '../constants';
import { ShieldCheck, Eye, Search, Filter, Lock } from 'lucide-react';

export const AdminAudit: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
               <ShieldCheck className="h-6 w-6 text-brand-600" /> Compliance & Audit Logs
            </h2>
            <p className="text-slate-500 text-sm mt-1">
               Immutable record of all system access, AI decisions, and data modifications. DPDPA 2023 Compliant.
            </p>
         </div>
         <div className="flex gap-2">
            <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
               <input type="text" placeholder="Search logs..." className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm bg-white hover:bg-slate-50">
               <Filter className="h-4 w-4" /> Filter
            </button>
         </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
         <table className="w-full text-left">
            <thead>
               <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4">Resource</th>
                  <th className="px-6 py-4">Details</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
               {MOCK_AUDIT_LOGS.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50">
                     <td className="px-6 py-4 text-sm text-slate-500 font-mono">{log.timestamp}</td>
                     <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                           <div className="h-6 w-6 bg-slate-200 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-600">
                              {log.userName.charAt(0)}
                           </div>
                           <span className="text-sm font-medium text-slate-900">{log.userName}</span>
                        </div>
                     </td>
                     <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 uppercase">
                           {log.role}
                        </span>
                     </td>
                     <td className="px-6 py-4">
                        <span className={`text-xs font-bold uppercase tracking-wider ${
                           log.action === 'ANALYSIS' ? 'text-purple-600' :
                           log.action === 'ACCESS' ? 'text-blue-600' :
                           log.action === 'DISPENSE' ? 'text-emerald-600' : 'text-slate-600'
                        }`}>
                           {log.action}
                        </span>
                     </td>
                     <td className="px-6 py-4 text-sm text-slate-700 font-mono">{log.resource}</td>
                     <td className="px-6 py-4 text-sm text-slate-500 truncate max-w-xs" title={log.details}>
                        {log.details}
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>
      
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center gap-3">
         <Lock className="h-5 w-5 text-slate-400" />
         <p className="text-xs text-slate-500">
            <strong>Security Notice:</strong> All logs are encrypted (AES-256) and stored on immutable storage compliant with Govt of India data residency laws.
         </p>
      </div>
    </div>
  );
};