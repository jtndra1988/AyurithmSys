
import React, { useState, useEffect } from 'react';
import { MOCK_BLOOD_BANK } from '../constants';
import { BloodInventory, InfrastructurePlan } from '../types';
import { getInfrastructurePlan } from '../services/geminiService';
import { 
  Droplet, Truck, AlertTriangle, Map, RefreshCw, BrainCircuit, Search, 
  ArrowRightLeft, ShieldCheck 
} from 'lucide-react';

export const BloodBank: React.FC = () => {
  const [inventory, setInventory] = useState<BloodInventory[]>(MOCK_BLOOD_BANK);
  const [filterGroup, setFilterGroup] = useState<string>('All');
  const [aiPlan, setAiPlan] = useState<InfrastructurePlan | null>(null);
  const [isTransferring, setIsTransferring] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlan = async () => {
      const data = {
        criticalShortages: inventory.filter(i => i.status === 'Critical').length,
        surplusAreas: inventory.filter(i => i.status === 'Surplus').length,
        totalUnits: inventory.reduce((acc, i) => acc + i.unitsAvailable, 0)
      };
      const result = await getInfrastructurePlan(data);
      setAiPlan(result);
    };
    fetchPlan();
  }, [inventory]);

  const handleTransfer = (id: string) => {
    setIsTransferring(id);
    setTimeout(() => {
      setInventory(prev => prev.map(item => {
        if (item.id === id) {
          return { ...item, unitsAvailable: item.unitsAvailable - 5, status: 'Adequate' }; // Simulate transfer
        }
        return item;
      }));
      setIsTransferring(null);
      alert("Transfer Order #TRF-9921 dispatched to Drone Logistics Unit.");
    }, 1500);
  };

  const filteredInventory = inventory.filter(item => 
    filterGroup === 'All' || item.bloodGroup === filterGroup
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-gradient-to-r from-red-900 to-red-800 p-8 rounded-2xl text-white shadow-xl flex justify-between items-center">
         <div>
            <h2 className="text-3xl font-bold flex items-center gap-3 mb-2">
               <Droplet className="h-8 w-8 text-red-300" /> AP "Jeevandan" Grid
            </h2>
            <p className="text-red-200 max-w-xl">
               Statewide Real-time Blood & Oxygen Network. Automated balancing between surplus and deficit districts.
            </p>
         </div>
         <div className="bg-white/10 border border-white/20 p-4 rounded-xl backdrop-blur-sm text-center">
            <p className="text-xs text-red-200 uppercase font-bold mb-1">Total State Reserve</p>
            <p className="text-3xl font-bold">{inventory.reduce((acc, i) => acc + i.unitsAvailable, 0)} Units</p>
         </div>
      </div>

      {/* AI Infrastructure AI */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
         <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
               <BrainCircuit className="h-5 w-5" />
            </div>
            <div>
               <h3 className="font-bold text-slate-800">AI Logistics Commander</h3>
               <p className="text-xs text-slate-500">Strategic resource balancing</p>
            </div>
         </div>
         
         {aiPlan ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                  <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Network Summary</h4>
                  <p className="text-sm text-slate-700">{aiPlan.planSummary}</p>
               </div>
               <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                  <h4 className="text-xs font-bold text-red-700 uppercase mb-2">Recommended Transfers</h4>
                  <ul className="space-y-1">
                     {aiPlan.resourceAllocation.map((rec, i) => (
                        <li key={i} className="text-sm text-red-800 flex items-start gap-2">
                           <ArrowRightLeft className="h-4 w-4 mt-0.5" /> {rec}
                        </li>
                     ))}
                  </ul>
               </div>
            </div>
         ) : (
            <div className="text-center py-6 text-slate-400">Optimizing supply chain...</div>
         )}
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
         <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-slate-700">Live Blood Bank Status</h3>
            <div className="flex gap-2">
               <select 
                  className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white outline-none"
                  value={filterGroup}
                  onChange={(e) => setFilterGroup(e.target.value)}
               >
                  <option value="All">All Groups</option>
                  <option value="A+">A+</option>
                  <option value="B+">B+</option>
                  <option value="O+">O+</option>
                  <option value="AB+">AB+</option>
                  <option value="O-">O- (Rare)</option>
                  <option value="AB-">AB- (Rare)</option>
               </select>
            </div>
         </div>
         <table className="w-full text-left">
            <thead>
               <tr className="bg-white border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">District / Hub</th>
                  <th className="px-6 py-4">Blood Group</th>
                  <th className="px-6 py-4">Stock Level</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
               {filteredInventory.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50">
                     <td className="px-6 py-4">
                        <p className="font-bold text-slate-900">{item.district}</p>
                        <p className="text-xs text-slate-500">{item.hospitalName}</p>
                     </td>
                     <td className="px-6 py-4">
                        <span className="bg-red-100 text-red-800 font-bold px-3 py-1 rounded-lg border border-red-200">
                           {item.bloodGroup}
                        </span>
                     </td>
                     <td className="px-6 py-4">
                        <p className="font-bold text-lg text-slate-800">{item.unitsAvailable} <span className="text-xs font-normal text-slate-500">Units</span></p>
                        <p className="text-[10px] text-slate-400">Updated: {item.lastUpdated}</p>
                     </td>
                     <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider ${
                           item.status === 'Critical' ? 'bg-red-50 text-red-700 border-red-200' : 
                           item.status === 'Low' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                           item.status === 'Surplus' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                           'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                           {item.status === 'Critical' && <AlertTriangle className="h-3 w-3" />}
                           {item.status}
                        </span>
                     </td>
                     <td className="px-6 py-4 text-right">
                        {item.status === 'Surplus' && (
                           <button 
                              onClick={() => handleTransfer(item.id)}
                              disabled={isTransferring === item.id}
                              className="bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-800 flex items-center gap-2 ml-auto disabled:opacity-50"
                           >
                              {isTransferring === item.id ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Truck className="h-3 w-3" />}
                              {isTransferring === item.id ? 'Dispatching...' : 'Transfer Out'}
                           </button>
                        )}
                        {item.status === 'Critical' && (
                           <span className="text-xs font-bold text-red-600 flex items-center justify-end gap-1">
                              <AlertTriangle className="h-3 w-3" /> Demand Raised
                           </span>
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
