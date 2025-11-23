
import React, { useState } from 'react';
import { MOCK_REGISTRY_DATA, REGISTRY_TRENDS } from '../constants';
import { RegistryEntry } from '../types';
import { 
  FileText, CheckCircle, Clock, AlertOctagon, Download, UploadCloud, 
  Search, Filter, Eye, X, Check, FileWarning, BarChart2, Map 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  BarChart, Bar, Legend 
} from 'recharts';

export const AdminRegistries: React.FC = () => {
  const [filterType, setFilterType] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedEntry, setSelectedEntry] = useState<RegistryEntry | null>(null);
  
  // Filtering Logic
  const filteredData = MOCK_REGISTRY_DATA.filter(entry => {
    const matchesType = filterType === 'All' || entry.type === filterType;
    const matchesStatus = filterStatus === 'All' || entry.status === filterStatus;
    const matchesSearch = 
      entry.patientName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      entry.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.hospitalName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesStatus && matchesSearch;
  });

  // Action Handlers
  const handleApprove = (id: string) => {
    alert(`Submission ${id} has been formally APPROVED and committed to the National Registry.`);
    setSelectedEntry(null);
  };

  const handleFlag = (id: string) => {
    alert(`Submission ${id} has been FLAGGED for audit. Hospital Superintendent notified.`);
    setSelectedEntry(null);
  };

  const handleExport = () => {
    alert("Downloading National Registry Report (CSV) ...");
  };

  return (
    <div className="space-y-6">
       {/* Hero Section */}
       <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 h-full w-1/3 bg-white/5 skew-x-12 transform translate-x-12"></div>
          <div className="relative z-10 flex justify-between items-end">
             <div>
                <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
                  <UploadCloud className="h-8 w-8 text-blue-400" /> National Health Registries
                </h2>
                <p className="text-blue-200 max-w-2xl text-sm leading-relaxed">
                  Real-time centralized surveillance system for Notifiable Diseases (TB, HIV, Vector Borne, Cancer). 
                  Ensures compliance with National Health Authority guidelines and automated reporting from all networked facilities.
                </p>
             </div>
             <button 
                onClick={handleExport}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg backdrop-blur-sm border border-white/20 flex items-center gap-2 text-sm font-medium transition-colors"
             >
                <Download className="h-4 w-4" /> Export Annual Report
             </button>
          </div>
       </div>

       {/* Key Metrics */}
       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
             <div className="flex justify-between items-start mb-2">
               <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Submissions</p>
               <FileText className="h-5 w-5 text-blue-500" />
             </div>
             <div>
               <h3 className="text-3xl font-bold text-slate-900">{MOCK_REGISTRY_DATA.length}</h3>
               <p className="text-xs text-slate-400 mt-1">Across all categories</p>
             </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
             <div className="flex justify-between items-start mb-2">
               <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Review</p>
               <Clock className="h-5 w-5 text-amber-500" />
             </div>
             <div>
               <h3 className="text-3xl font-bold text-slate-900">
                  {MOCK_REGISTRY_DATA.filter(d => d.status === 'PENDING').length}
               </h3>
               <p className="text-xs text-amber-600 mt-1 font-medium">Requires Action</p>
             </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
             <div className="flex justify-between items-start mb-2">
               <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Flagged / Audit</p>
               <AlertOctagon className="h-5 w-5 text-red-500" />
             </div>
             <div>
               <h3 className="text-3xl font-bold text-slate-900">
                  {MOCK_REGISTRY_DATA.filter(d => d.status === 'FLAGGED').length}
               </h3>
               <p className="text-xs text-red-600 mt-1 font-medium">Data Quality Issues</p>
             </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between bg-gradient-to-br from-indigo-50 to-white">
             <div className="flex justify-between items-start mb-2">
               <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider">Top Condition</p>
               <BarChart2 className="h-5 w-5 text-indigo-500" />
             </div>
             <div>
               <h3 className="text-2xl font-bold text-indigo-900">Tuberculosis</h3>
               <p className="text-xs text-indigo-600 mt-1 font-medium">Highest Reporting Volume</p>
             </div>
          </div>
       </div>

       {/* Visualization Section */}
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
             <h3 className="text-lg font-bold text-slate-800 mb-6">Disease Reporting Trends (YTD)</h3>
             <div className="h-72 w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={REGISTRY_TRENDS}>
                   <defs>
                     <linearGradient id="colorTb" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.1}/>
                       <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                     </linearGradient>
                     <linearGradient id="colorVector" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                       <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} />
                   <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                   <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                   <RechartsTooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                   <Area type="monotone" dataKey="TB" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorTb)" strokeWidth={2} />
                   <Area type="monotone" dataKey="Vector" stroke="#ef4444" fillOpacity={1} fill="url(#colorVector)" strokeWidth={2} name="Vector Borne" />
                   <Area type="monotone" dataKey="Cancer" stroke="#8b5cf6" fill="none" strokeWidth={2} />
                 </AreaChart>
               </ResponsiveContainer>
             </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
             <h3 className="text-lg font-bold text-slate-800 mb-6">Regional Distribution</h3>
             <div className="h-72 w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart layout="vertical" data={[
                    { name: 'Delhi', value: 450 },
                    { name: 'Uttar Pradesh', value: 380 },
                    { name: 'Maharashtra', value: 320 },
                    { name: 'Bihar', value: 290 },
                    { name: 'Karnataka', value: 210 },
                 ]}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                    <RechartsTooltip cursor={{fill: 'transparent'}} />
                    <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
                 </BarChart>
               </ResponsiveContainer>
             </div>
             <div className="flex items-center justify-center gap-2 mt-4 text-xs text-slate-500">
               <Map className="h-3 w-3" /> Data aggregated from State Health Missions
             </div>
          </div>
       </div>

       {/* Detailed Registry Table Section */}
       <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
         {/* Table Toolbar */}
         <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="relative w-full md:w-96">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
               <input 
                  type="text" 
                  placeholder="Search by ID, Patient Name, or Hospital..." 
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
               />
            </div>
            <div className="flex gap-2 w-full md:w-auto">
               <select 
                  className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-brand-500"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
               >
                  <option value="All">All Registries</option>
                  <option value="TB">Tuberculosis (TB)</option>
                  <option value="HIV">HIV / AIDS</option>
                  <option value="Cancer">Cancer</option>
                  <option value="Vector Borne">Vector Borne</option>
                  <option value="Maternal">Maternal & Child</option>
               </select>
               <select 
                  className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-brand-500"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
               >
                  <option value="All">All Statuses</option>
                  <option value="SUBMITTED">Submitted</option>
                  <option value="PENDING">Pending Review</option>
                  <option value="FLAGGED">Flagged</option>
               </select>
            </div>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="bg-white border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                     <th className="px-6 py-4">ID & Date</th>
                     <th className="px-6 py-4">Patient Info</th>
                     <th className="px-6 py-4">Registry Type</th>
                     <th className="px-6 py-4">Diagnosis (ICD)</th>
                     <th className="px-6 py-4">Status</th>
                     <th className="px-6 py-4">Reporting Facility</th>
                     <th className="px-6 py-4 text-right">Action</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {filteredData.length > 0 ? filteredData.map((item) => (
                     <tr key={item.id} className="hover:bg-slate-50 transition-colors cursor-pointer group" onClick={() => setSelectedEntry(item)}>
                        <td className="px-6 py-4">
                           <p className="font-mono text-xs font-bold text-slate-700">{item.id}</p>
                           <p className="text-xs text-slate-500 mt-1">{item.submissionDate}</p>
                        </td>
                        <td className="px-6 py-4">
                           <p className="text-sm font-semibold text-slate-900">{item.patientName}</p>
                           <p className="text-xs text-slate-500">{item.patientAge}y / {item.patientGender}</p>
                        </td>
                        <td className="px-6 py-4">
                           <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${
                              item.type === 'TB' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                              item.type === 'Cancer' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                              item.type === 'HIV' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                              'bg-blue-50 text-blue-700 border-blue-100'
                           }`}>
                              {item.type}
                           </span>
                        </td>
                        <td className="px-6 py-4">
                           <p className="text-sm text-slate-700 truncate max-w-[150px]" title={item.diagnosis}>{item.diagnosis}</p>
                           <p className="text-xs font-mono text-slate-500 bg-slate-100 inline-block px-1 rounded mt-1">{item.icdCode}</p>
                        </td>
                        <td className="px-6 py-4">
                           {item.status === 'SUBMITTED' && (
                              <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full w-fit">
                                 <CheckCircle className="h-3.5 w-3.5" /> Verified
                              </span>
                           )}
                           {item.status === 'PENDING' && (
                              <span className="flex items-center gap-1.5 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full w-fit">
                                 <Clock className="h-3.5 w-3.5" /> Pending
                              </span>
                           )}
                           {item.status === 'FLAGGED' && (
                              <span className="flex items-center gap-1.5 text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full w-fit">
                                 <AlertOctagon className="h-3.5 w-3.5" /> Flagged
                              </span>
                           )}
                        </td>
                        <td className="px-6 py-4">
                           <p className="text-sm text-slate-700">{item.hospitalName}</p>
                           <p className="text-xs text-slate-500">{item.district}, {item.state}</p>
                        </td>
                        <td className="px-6 py-4 text-right">
                           <button className="text-brand-600 hover:text-brand-800 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                              Inspect
                           </button>
                        </td>
                     </tr>
                  )) : (
                     <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                           No registry entries found matching your filters.
                        </td>
                     </tr>
                  )}
               </tbody>
            </table>
         </div>
       </div>

       {/* Detailed Inspector Modal (Slide-over) */}
       {selectedEntry && (
          <div className="fixed inset-0 z-50 flex justify-end">
             {/* Backdrop */}
             <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setSelectedEntry(null)}></div>
             
             {/* Slide-over Panel */}
             <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300">
                <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                   <div>
                      <h3 className="text-lg font-bold text-slate-800">Registry Case File</h3>
                      <p className="text-xs text-slate-500 font-mono">ID: {selectedEntry.id} • Submitted: {selectedEntry.submissionDate}</p>
                   </div>
                   <button onClick={() => setSelectedEntry(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500"><X className="h-5 w-5" /></button>
                </div>

                <div className="p-6 space-y-8">
                   {/* Status Banner */}
                   <div className={`p-4 rounded-xl flex items-start gap-3 ${
                      selectedEntry.status === 'FLAGGED' ? 'bg-red-50 border border-red-100' : 
                      selectedEntry.status === 'PENDING' ? 'bg-amber-50 border border-amber-100' : 'bg-emerald-50 border border-emerald-100'
                   }`}>
                      {selectedEntry.status === 'FLAGGED' ? <AlertOctagon className="h-5 w-5 text-red-600 mt-0.5" /> : 
                       selectedEntry.status === 'PENDING' ? <Clock className="h-5 w-5 text-amber-600 mt-0.5" /> : <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5" />}
                      <div>
                         <h4 className={`font-bold text-sm ${
                            selectedEntry.status === 'FLAGGED' ? 'text-red-800' : 
                            selectedEntry.status === 'PENDING' ? 'text-amber-800' : 'text-emerald-800'
                         }`}>
                            Status: {selectedEntry.status}
                         </h4>
                         <p className={`text-xs mt-1 ${
                            selectedEntry.status === 'FLAGGED' ? 'text-red-700' : 
                            selectedEntry.status === 'PENDING' ? 'text-amber-700' : 'text-emerald-700'
                         }`}>
                            {selectedEntry.status === 'FLAGGED' ? 'This entry has been flagged due to data inconsistencies. Audit required.' : 
                             selectedEntry.status === 'PENDING' ? 'Awaiting final verification by District Nodal Officer.' : 'Verified and committed to National Database.'}
                         </p>
                      </div>
                   </div>

                   {/* Patient Details */}
                   <section>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Patient Demographics</h4>
                      <div className="grid grid-cols-2 gap-6">
                         <div>
                            <p className="text-xs text-slate-500 mb-1">Full Name</p>
                            <p className="font-semibold text-slate-900">{selectedEntry.patientName}</p>
                         </div>
                         <div>
                            <p className="text-xs text-slate-500 mb-1">Patient ID (Local)</p>
                            <p className="font-mono text-slate-900">{selectedEntry.patientId}</p>
                         </div>
                         <div>
                            <p className="text-xs text-slate-500 mb-1">Age / Gender</p>
                            <p className="font-semibold text-slate-900">{selectedEntry.patientAge} Years / {selectedEntry.patientGender}</p>
                         </div>
                         <div>
                            <p className="text-xs text-slate-500 mb-1">Risk Score (AI)</p>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                               selectedEntry.riskScore === 'Critical' || selectedEntry.riskScore === 'High' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
                            }`}>
                               {selectedEntry.riskScore || 'N/A'}
                            </span>
                         </div>
                      </div>
                   </section>

                   {/* Clinical Data */}
                   <section>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Clinical Information</h4>
                      <div className="space-y-4">
                         <div className="grid grid-cols-2 gap-6">
                            <div>
                               <p className="text-xs text-slate-500 mb-1">Disease Registry</p>
                               <p className="font-bold text-slate-800">{selectedEntry.type}</p>
                            </div>
                            <div>
                               <p className="text-xs text-slate-500 mb-1">ICD-10 Code</p>
                               <p className="font-mono bg-slate-100 px-2 py-0.5 rounded inline-block text-slate-800">{selectedEntry.icdCode}</p>
                            </div>
                         </div>
                         <div>
                            <p className="text-xs text-slate-500 mb-1">Primary Diagnosis</p>
                            <p className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-sm font-medium text-slate-800">
                               {selectedEntry.diagnosis}
                            </p>
                         </div>
                      </div>
                   </section>

                   {/* Source Info */}
                   <section>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Reporting Source</h4>
                      <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                         <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-white rounded-lg border border-slate-200">
                               <UploadCloud className="h-5 w-5 text-brand-600" />
                            </div>
                            <div>
                               <p className="font-bold text-slate-800">{selectedEntry.hospitalName}</p>
                               <p className="text-xs text-slate-500">ID: {selectedEntry.hospitalId}</p>
                            </div>
                         </div>
                         <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                               <span className="text-slate-500">District:</span> <span className="font-medium text-slate-700">{selectedEntry.district}</span>
                            </div>
                            <div>
                               <span className="text-slate-500">State:</span> <span className="font-medium text-slate-700">{selectedEntry.state}</span>
                            </div>
                         </div>
                      </div>
                   </section>
                </div>

                {/* Footer Actions */}
                <div className="sticky bottom-0 bg-white border-t border-slate-200 p-6 flex justify-end gap-3">
                   {selectedEntry.status !== 'FLAGGED' && (
                      <button 
                         onClick={() => handleFlag(selectedEntry.id)}
                         className="px-4 py-2 border border-red-200 text-red-700 bg-red-50 rounded-lg hover:bg-red-100 font-medium text-sm flex items-center gap-2 transition-colors"
                      >
                         <FileWarning className="h-4 w-4" /> Flag for Audit
                      </button>
                   )}
                   {selectedEntry.status !== 'SUBMITTED' && (
                      <button 
                         onClick={() => handleApprove(selectedEntry.id)}
                         className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-bold text-sm flex items-center gap-2 shadow-sm transition-colors"
                      >
                         <Check className="h-4 w-4" /> Approve Submission
                      </button>
                   )}
                   {selectedEntry.status === 'SUBMITTED' && (
                      <button disabled className="px-6 py-2 bg-slate-100 text-slate-400 rounded-lg font-bold text-sm flex items-center gap-2 cursor-not-allowed">
                         <CheckCircle className="h-4 w-4" /> Approved
                      </button>
                   )}
                </div>
             </div>
          </div>
       )}
    </div>
  );
};
