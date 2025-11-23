import React from 'react';
import { MOCK_PATIENTS } from '../constants';
import { Search, TestTube2, CheckCircle2, Clock } from 'lucide-react';

export const LabRadiology: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full">
       <div className="p-6 border-b border-slate-200 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <TestTube2 className="h-5 w-5 text-purple-600" /> Laboratory Information System (LIS)
          </h3>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200">History</button>
            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 shadow-sm shadow-purple-200">Add Test</button>
          </div>
       </div>
       
       <div className="p-0 overflow-auto">
         <table className="w-full text-left">
            <thead>
               <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Sample ID</th>
                  <th className="px-6 py-4">Patient</th>
                  <th className="px-6 py-4">Test Name</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Action</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
               {MOCK_PATIENTS.flatMap(p => p.labResults.map(l => ({ ...l, patientName: p.name, patientId: p.id }))).map((lab) => (
                  <tr key={`${lab.patientId}-${lab.id}`} className="hover:bg-slate-50">
                     <td className="px-6 py-4 font-mono text-xs text-slate-500">#{lab.id}</td>
                     <td className="px-6 py-4">
                        <p className="font-semibold text-sm text-slate-900">{lab.patientName}</p>
                        <p className="text-xs text-slate-500">{lab.patientId}</p>
                     </td>
                     <td className="px-6 py-4 text-sm font-medium text-slate-700">{lab.testName}</td>
                     <td className="px-6 py-4">
                        {lab.status === 'COMPLETED' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                             <CheckCircle2 className="h-3 w-3" /> Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                             <Clock className="h-3 w-3" /> Pending
                          </span>
                        )}
                     </td>
                     <td className="px-6 py-4 text-sm text-slate-500">{lab.date}</td>
                     <td className="px-6 py-4 text-right">
                        {lab.status === 'PENDING' ? (
                          <button className="text-sm font-medium text-purple-600 hover:text-purple-800 hover:underline">
                            Enter Result
                          </button>
                        ) : (
                           <span className="font-mono text-sm text-slate-700">{lab.value} {lab.unit}</span>
                        )}
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>
       </div>
    </div>
  );
};