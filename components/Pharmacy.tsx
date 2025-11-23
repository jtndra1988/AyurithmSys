import React from 'react';
import { MOCK_INVENTORY, MOCK_PATIENTS } from '../constants';
import { Search, AlertTriangle, CheckCircle, Package } from 'lucide-react';

export const Pharmacy: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Prescription Queue */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Package className="h-5 w-5 text-brand-600" /> Pending Dispensations
          </h3>
          <div className="space-y-4">
            {MOCK_PATIENTS.filter(p => p.medications && p.medications.length > 0).map(patient => (
              <div key={patient.id} className="border border-slate-100 rounded-lg p-4 hover:border-brand-200 transition-colors">
                <div className="flex justify-between items-start mb-2">
                   <div>
                      <h4 className="font-semibold text-slate-900">{patient.name}</h4>
                      <p className="text-xs text-slate-500">ID: {patient.id}</p>
                   </div>
                   <span className="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-full font-bold">Pending</span>
                </div>
                <div className="space-y-2 mt-3">
                  {patient.medications?.map(med => (
                    <div key={med.id} className="flex justify-between items-center text-sm bg-slate-50 p-2 rounded">
                       <span className="font-medium text-slate-700">{med.name}</span>
                       <span className="text-slate-500">{med.dosage} • {med.frequency}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex gap-2">
                   <button className="flex-1 bg-brand-600 hover:bg-brand-700 text-white text-sm py-2 rounded-lg transition-colors font-medium">
                     Dispense All
                   </button>
                   <button className="px-3 py-2 bg-red-50 text-red-600 rounded-lg border border-red-100 hover:bg-red-100">
                     <AlertTriangle className="h-4 w-4" />
                   </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Inventory View */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex justify-between items-center mb-4">
             <h3 className="text-lg font-bold text-slate-800">Live Inventory</h3>
             <div className="relative">
               <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
               <input type="text" placeholder="Search drugs..." className="pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg" />
             </div>
          </div>
          
          <table className="w-full text-left text-sm">
             <thead>
               <tr className="bg-slate-50 text-slate-500 border-b border-slate-200">
                 <th className="px-4 py-3 font-medium">Drug Name</th>
                 <th className="px-4 py-3 font-medium">Batch</th>
                 <th className="px-4 py-3 font-medium">Expiry</th>
                 <th className="px-4 py-3 font-medium text-right">Stock</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-100">
               {MOCK_INVENTORY.map(item => (
                 <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-700">{item.name}</td>
                    <td className="px-4 py-3 text-slate-500 font-mono text-xs">{item.batchNo}</td>
                    <td className="px-4 py-3 text-slate-500">{item.expiryDate}</td>
                    <td className={`px-4 py-3 text-right font-bold ${item.stock < 100 ? 'text-red-600' : 'text-emerald-600'}`}>
                      {item.stock} {item.unit}
                    </td>
                 </tr>
               ))}
             </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};