
import React, { useState, useEffect } from 'react';
import { MOCK_ASSETS } from '../constants';
import { Asset } from '../types';
import { getAssetMaintenancePrediction, AssetPrediction } from '../services/geminiService';
import { 
  Settings, Wrench, CheckCircle, AlertTriangle, Search, Filter, Plus, X, 
  Calendar, DollarSign, BarChart3, Activity, BrainCircuit, ShieldAlert
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const AssetManagement: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>(MOCK_ASSETS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [aiPrediction, setAiPrediction] = useState<AssetPrediction | null>(null);

  // New Asset Form State
  const [newAsset, setNewAsset] = useState<Partial<Asset>>({
    name: '',
    type: 'Medical Equipment',
    department: 'Radiology',
    status: 'Operational',
    purchaseDate: new Date().toISOString().split('T')[0],
    serialNumber: ''
  });

  useEffect(() => {
    const fetchPrediction = async () => {
      const assetSummary = {
        total: assets.length,
        operational: assets.filter(a => a.status === 'Operational').length,
        maintenance: assets.filter(a => a.status === 'Maintenance').length
      };
      const result = await getAssetMaintenancePrediction(assetSummary);
      setAiPrediction(result);
    };
    fetchPrediction();
  }, [assets]);

  // Analytics Data
  const statusData = [
    { name: 'Operational', count: assets.filter(a => a.status === 'Operational').length },
    { name: 'Maintenance', count: assets.filter(a => a.status === 'Maintenance').length },
    { name: 'Down', count: assets.filter(a => a.status === 'Down').length },
  ];

  const handleAddAsset = () => {
    if (newAsset.name && newAsset.serialNumber) {
      const asset: Asset = {
        ...newAsset as Asset,
        id: `EQ-AP-${Math.floor(Math.random() * 10000)}`,
        lastMaintenance: 'N/A',
        nextMaintenance: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // +90 days
      };
      setAssets([asset, ...assets]);
      setShowAddModal(false);
      setNewAsset({
        name: '', type: 'Medical Equipment', department: 'Radiology', status: 'Operational', 
        purchaseDate: new Date().toISOString().split('T')[0], serialNumber: ''
      });
    }
  };

  const updateStatus = (id: string, newStatus: 'Operational' | 'Maintenance' | 'Down') => {
    setAssets(assets.map(a => a.id === id ? { ...a, status: newStatus } : a));
  };

  const filteredAssets = assets.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase()) || a.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'ALL' || a.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* AI Infrastructure Monitor */}
      <div className="bg-gradient-to-r from-slate-800 to-gray-900 rounded-xl p-6 text-white shadow-lg border border-slate-700 relative">
         <div className="flex items-center gap-3 mb-4 relative z-10">
            <div className="p-2 bg-white/10 rounded-lg border border-white/20">
               <BrainCircuit className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
               <h3 className="font-bold">AI Infrastructure Monitor</h3>
               <p className="text-xs text-slate-400">Predictive maintenance engine</p>
            </div>
         </div>
         
         {aiPrediction ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
               <div className={`p-4 rounded-lg border ${
                  aiPrediction.riskLevel === 'High' ? 'bg-red-900/20 border-red-500/30' : 
                  'bg-emerald-900/20 border-emerald-500/30'
               }`}>
                  <p className="text-xs font-bold uppercase tracking-wider mb-1">Overall Risk Level</p>
                  <p className={`text-xl font-bold ${aiPrediction.riskLevel === 'High' ? 'text-red-400' : 'text-emerald-400'}`}>
                     {aiPrediction.riskLevel}
                  </p>
               </div>
               <div className="p-4 rounded-lg border border-white/10 bg-white/5">
                  <p className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                     <ShieldAlert className="h-3 w-3 text-amber-400" /> Predicted Failures
                  </p>
                  <ul className="text-sm text-slate-300 space-y-1">
                     {aiPrediction.predictedFailures.length > 0 ? (
                        aiPrediction.predictedFailures.map((item, i) => <li key={i}>• {item}</li>)
                     ) : (
                        <li>No immediate risks detected.</li>
                     )}
                  </ul>
               </div>
               <div className="p-4 rounded-lg border border-white/10 bg-white/5">
                  <p className="text-xs font-bold uppercase tracking-wider mb-2">
                     Strategic Advice
                  </p>
                  <p className="text-sm text-slate-300 leading-relaxed">{aiPrediction.maintenanceAdvice}</p>
               </div>
            </div>
         ) : (
            <div className="text-center text-slate-400 text-sm py-4">Analyzing equipment telemetry...</div>
         )}
         <div className="absolute bottom-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl -mr-12 -mb-12"></div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
               <Settings className="h-6 w-6" />
            </div>
            <div>
               <p className="text-xs font-bold text-slate-500 uppercase">Total Assets</p>
               <h3 className="text-2xl font-bold text-slate-900">{assets.length}</h3>
            </div>
         </div>
         <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
               <Activity className="h-6 w-6" />
            </div>
            <div>
               <p className="text-xs font-bold text-slate-500 uppercase">Operational %</p>
               <h3 className="text-2xl font-bold text-slate-900">
                  {Math.round((assets.filter(a => a.status === 'Operational').length / assets.length) * 100)}%
               </h3>
            </div>
         </div>
         <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
               <Calendar className="h-6 w-6" />
            </div>
            <div>
               <p className="text-xs font-bold text-slate-500 uppercase">Due Service</p>
               <h3 className="text-2xl font-bold text-slate-900">
                  {assets.filter(a => new Date(a.nextMaintenance) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)).length}
               </h3>
            </div>
         </div>
         <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
               <DollarSign className="h-6 w-6" />
            </div>
            <div>
               <p className="text-xs font-bold text-slate-500 uppercase">Asset Value</p>
               <h3 className="text-2xl font-bold text-slate-900">₹4.2 Cr</h3>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Main List Area */}
         <div className="lg:col-span-2 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
               <div className="relative w-full md:w-96">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input 
                     type="text" 
                     placeholder="Search Assets by Name, Serial..." 
                     className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                  />
               </div>
               <div className="flex gap-2">
                  <select 
                     className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white outline-none"
                     value={filterStatus}
                     onChange={(e) => setFilterStatus(e.target.value)}
                  >
                     <option value="ALL">All Status</option>
                     <option value="Operational">Operational</option>
                     <option value="Maintenance">Maintenance</option>
                     <option value="Down">Down / Broken</option>
                  </select>
                  <button 
                     onClick={() => setShowAddModal(true)}
                     className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800 flex items-center gap-2 shadow-sm"
                  >
                     <Plus className="h-4 w-4" /> Add Asset
                  </button>
               </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
               <table className="w-full text-left">
                  <thead>
                     <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        <th className="px-6 py-4">Asset Details</th>
                        <th className="px-6 py-4">Department</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Service Due</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {filteredAssets.map(asset => (
                        <tr key={asset.id} className="hover:bg-slate-50">
                           <td className="px-6 py-4">
                              <p className="text-sm font-semibold text-slate-900">{asset.name}</p>
                              <p className="text-xs text-slate-500 font-mono">{asset.serialNumber}</p>
                           </td>
                           <td className="px-6 py-4 text-sm text-slate-700">{asset.department}</td>
                           <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                                 asset.status === 'Operational' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                 asset.status === 'Maintenance' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                 'bg-red-50 text-red-700 border-red-100'
                              }`}>
                                 <span className={`h-1.5 w-1.5 rounded-full ${
                                    asset.status === 'Operational' ? 'bg-emerald-500' :
                                    asset.status === 'Maintenance' ? 'bg-amber-500' : 'bg-red-500'
                                 }`}></span>
                                 {asset.status}
                              </span>
                           </td>
                           <td className="px-6 py-4 text-sm font-medium text-slate-700">{asset.nextMaintenance}</td>
                           <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-2">
                                 {asset.status === 'Operational' && (
                                    <>
                                       <button onClick={() => updateStatus(asset.id, 'Maintenance')} className="p-1.5 text-amber-600 hover:bg-amber-50 rounded" title="Schedule Maintenance"><Wrench className="h-4 w-4" /></button>
                                       <button onClick={() => updateStatus(asset.id, 'Down')} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Report Issue"><AlertTriangle className="h-4 w-4" /></button>
                                    </>
                                 )}
                                 {asset.status === 'Maintenance' && (
                                    <button onClick={() => updateStatus(asset.id, 'Operational')} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded" title="Mark Fixed"><CheckCircle className="h-4 w-4" /></button>
                                 )}
                                 {asset.status === 'Down' && (
                                    <button onClick={() => updateStatus(asset.id, 'Maintenance')} className="p-1.5 text-amber-600 hover:bg-amber-50 rounded" title="Send to Repair"><Wrench className="h-4 w-4" /></button>
                                 )}
                              </div>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>

         {/* Sidebar: Analytics */}
         <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
               <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-slate-500" /> Asset Health
               </h3>
               <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={statusData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                        <YAxis hide />
                        <Tooltip cursor={{fill: 'transparent'}} />
                        <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
                     </BarChart>
                  </ResponsiveContainer>
               </div>
            </div>

            <div className="bg-indigo-900 text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
               <div className="relative z-10">
                  <h3 className="font-bold text-lg mb-2">Annual Maintenance Contract</h3>
                  <p className="text-indigo-200 text-sm mb-4">Vendor: Siemens Healthineers</p>
                  <div className="flex justify-between items-end">
                     <div>
                        <p className="text-xs text-indigo-300 uppercase">Coverage Until</p>
                        <p className="font-bold">Dec 31, 2024</p>
                     </div>
                     <button className="bg-white text-indigo-900 px-3 py-1.5 rounded-lg text-xs font-bold">View Contract</button>
                  </div>
               </div>
               <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            </div>
         </div>
      </div>

      {/* Add Asset Modal */}
      {showAddModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95">
               <div className="bg-slate-900 p-4 text-white flex justify-between items-center">
                  <h3 className="font-bold flex items-center gap-2"><Settings className="h-5 w-5" /> Register New Asset</h3>
                  <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white"><X className="h-5 w-5" /></button>
               </div>
               <div className="p-6 space-y-4">
                  <div>
                     <label className="block text-sm font-semibold text-slate-700 mb-1">Asset Name</label>
                     <input 
                        type="text" 
                        className="w-full p-2 border border-slate-300 rounded-lg" 
                        placeholder="e.g. CT Scanner" 
                        value={newAsset.name} 
                        onChange={e => setNewAsset({...newAsset, name: e.target.value})}
                     />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Type</label>
                        <select 
                           className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                           value={newAsset.type} 
                           onChange={e => setNewAsset({...newAsset, type: e.target.value as any})}
                        >
                           <option value="Medical Equipment">Medical Equipment</option>
                           <option value="Infrastructure">Infrastructure</option>
                           <option value="IT">IT Hardware</option>
                        </select>
                     </div>
                     <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Department</label>
                        <select 
                           className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                           value={newAsset.department} 
                           onChange={e => setNewAsset({...newAsset, department: e.target.value})}
                        >
                           <option value="Radiology">Radiology</option>
                           <option value="ICU">ICU</option>
                           <option value="OT">Operation Theatre</option>
                           <option value="Lab">Laboratory</option>
                        </select>
                     </div>
                  </div>
                  <div>
                     <label className="block text-sm font-semibold text-slate-700 mb-1">Serial Number</label>
                     <input 
                        type="text" 
                        className="w-full p-2 border border-slate-300 rounded-lg font-mono" 
                        placeholder="SN-XXXX-YYYY" 
                        value={newAsset.serialNumber} 
                        onChange={e => setNewAsset({...newAsset, serialNumber: e.target.value})}
                     />
                  </div>
                  <div>
                     <label className="block text-sm font-semibold text-slate-700 mb-1">Purchase Date</label>
                     <input 
                        type="date" 
                        className="w-full p-2 border border-slate-300 rounded-lg" 
                        value={newAsset.purchaseDate} 
                        onChange={e => setNewAsset({...newAsset, purchaseDate: e.target.value})}
                     />
                  </div>

                  <div className="flex gap-3 pt-4">
                     <button onClick={() => setShowAddModal(false)} className="flex-1 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-lg">Cancel</button>
                     <button 
                        onClick={handleAddAsset} 
                        disabled={!newAsset.name || !newAsset.serialNumber}
                        className="flex-1 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 disabled:opacity-50"
                     >
                        Register Asset
                     </button>
                  </div>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};
