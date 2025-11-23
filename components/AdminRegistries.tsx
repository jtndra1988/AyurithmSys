import React from 'react';
import { MOCK_REGISTRY_DATA } from '../constants';
import { FileText, CheckCircle, Clock, AlertOctagon, Download, UploadCloud } from 'lucide-react';

export const AdminRegistries: React.FC = () => {
  return (
    <div className="space-y-6">
       <div className="bg-gradient-to-r from-blue-900 to-slate-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 h-full w-1/3 bg-white/5 skew-x-12 transform translate-x-12"></div>
          <div className="relative z-10">
             <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
               <UploadCloud className="h-8 w-8 text-blue-400" /> National Health Registries
             </h2>
             <p className="text-blue-200 max-w-2xl">
               Centralized automated reporting for Notifiable Diseases (TB, HIV, Cancer) across all state hospitals.
               Compliance with National Health Authority guidelines.
             </p>
          </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
             <div className="flex justify-between items-start mb-4">
               <div>
                  <p className="text-sm font-medium text-slate-500">Pending Submissions</p>
                  <h3 className="text-3xl font-bold text-slate-900">24</h3>
               </div>
               <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                  <Clock className="h-6 w-6" />
               </div>
             </div>
             <button className="text-sm text-brand-600 font-medium hover:underline">Review & Approve</button>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
             <div className="flex justify-between items-start mb-4">
               <div>
                  <p className="text-sm font-medium text-slate-500">Successful Reports</p>
                  <h3 className="text-3xl font-bold text-slate-900">1,892</h3>
               </div>
               <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                  <CheckCircle className="h-6 w-6" />
               </div>
             </div>
             <p className="text-xs text-slate-400">This Month</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
             <div className="flex justify-between items-start mb-4">
               <div>
                  <p className="text-sm font-medium text-slate-500">Data Quality Flags</p>
                  <h3 className="text-3xl font-bold text-slate-900">5</h3>
               </div>
               <div className="p-2 bg-red-50 rounded-lg text-red-600">
                  <AlertOctagon className="h-6 w-6" />
               </div>
             </div>
             <p className="text-xs text-red-500 font-medium">Action Required</p>
          </div>
       </div>

       <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
         <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
           <h3 className="font-bold text-slate-700">Recent Registry Transactions</h3>
           <button className="flex items-center gap-2 text-sm text-slate-600 hover:text-brand-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm">
             <Download className="h-4 w-4" /> Export Report
           </button>
         </div>
         <table className="w-full text-left">
           <thead>
             <tr className="bg-white border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
               <th className="px-6 py-4">Transaction ID</th>
               <th className="px-6 py-4">Patient</th>
               <th className="px-6 py-4">Registry Type</th>
               <th className="px-6 py-4">Submission Status</th>
               <th className="px-6 py-4">Hospital Source</th>
               <th className="px-6 py-4 text-right">Date</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-slate-100">
             {MOCK_REGISTRY_DATA.map((item) => (
               <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                 <td className="px-6 py-4 font-mono text-xs text-slate-500">{item.id}</td>
                 <td className="px-6 py-4 text-sm font-medium text-slate-900">{item.patientName} <span className="text-slate-400 font-normal">({item.patientId})</span></td>
                 <td className="px-6 py-4">
                   <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase tracking-wider">
                     {item.type}
                   </span>
                 </td>
                 <td className="px-6 py-4">
                    {item.status === 'SUBMITTED' && (
                      <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                        <CheckCircle className="h-3.5 w-3.5" /> Submitted
                      </span>
                    )}
                    {item.status === 'PENDING' && (
                      <span className="flex items-center gap-1.5 text-xs font-medium text-amber-600">
                        <Clock className="h-3.5 w-3.5" /> Pending Review
                      </span>
                    )}
                    {item.status === 'FLAGGED' && (
                      <span className="flex items-center gap-1.5 text-xs font-medium text-red-600">
                        <AlertOctagon className="h-3.5 w-3.5" /> Data Flagged
                      </span>
                    )}
                 </td>
                 <td className="px-6 py-4 text-sm text-slate-500">{item.hospitalId}</td>
                 <td className="px-6 py-4 text-right text-sm text-slate-500">{item.submissionDate}</td>
               </tr>
             ))}
           </tbody>
         </table>
       </div>
    </div>
  );
};