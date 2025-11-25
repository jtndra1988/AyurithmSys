
import React, { useState, useEffect } from 'react';
import { MOCK_GENOMICS_DATA } from '../../constants';
import { GenomicRegistryEntry } from '../../types';
import { getGenomicInsights, GenomicPolicyInsight } from '../../services/geminiService';
import { Dna, Search, Filter, AlertTriangle, FileText, Activity, Download, ChevronRight, X, Microscope, BrainCircuit } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface GenomicsRegistryProps {
  onLogAction?: (action: string, resource: string, details: string) => void;
}

export const GenomicsRegistry: React.FC<GenomicsRegistryProps> = ({ onLogAction }) => {
  const [selectedEntry, setSelectedEntry] = useState<GenomicRegistryEntry | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterIndication, setFilterIndication] = useState('All');
  const [aiPolicy, setAiPolicy] = useState<GenomicPolicyInsight | null>(null);

  useEffect(() => {
    const fetchPolicy = async () => {
      // Mock stats for AI
      const stats = { highRisk: 12, sickleCell: 5, oncology: 8 };
      const result = await getGenomicInsights(stats);
      setAiPolicy(result);
    };
    fetchPolicy();
  }, []);

  const filteredData = MOCK_GENOMICS_DATA.filter(entry => {
    const matchesSearch = 
      entry.patientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      entry.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.markers.some(m => m.gene.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = filterIndication === 'All' || entry.indication === filterIndication;

    return matchesSearch && matchesFilter;
  });

  // Chart Data
  const riskData = [
    { name: 'High Risk', value: MOCK_GENOMICS_DATA.filter(d => d.riskLevel === 'HIGH').length },
    { name: 'Moderate', value: MOCK_GENOMICS_DATA.filter(d => d.riskLevel === 'MODERATE').length },
    { name: 'Low/Normal', value: MOCK_GENOMICS_DATA.filter(d => d.riskLevel === 'LOW').length },
  ];
  const RISK_COLORS = ['#ef4444', '#f59e0b', '#10b981'];

  const indicationData = [
    { name: 'Sickle Cell', value: 12 },
    { name: 'Oncology', value: 25 },
    { name: 'Pharma', value: 18 },
    { name: 'Prenatal', value: 8 },
  ];

  const handleExport = () => {
    if (onLogAction) onLogAction('EXPORT', 'Genomics Registry', 'Exported Encrypted Genomic Dataset');
    alert("Exporting Genomic Dataset (Encrypted)...");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-900 to-purple-800 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
         <div className="relative z-10 flex justify-between items-end">
            <div>
               <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
                 <Dna className="h-8 w-8 text-purple-300" /> AP State Genomics Registry
               </h2>
               <p className="text-purple-200 max-w-2xl text-sm leading-relaxed">
                 Centralized repository for population-scale genomic surveillance. Tracking hereditary disorders (Sickle Cell, Thalassemia) and Pharmacogenomic markers for Precision Medicine initiatives.
               </p>
            </div>
            <button 
               onClick={handleExport}
               className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg backdrop-blur-sm border border-white/20 flex items-center gap-2 text-sm font-medium transition-colors"
            >
               <Download className="h-4 w-4" /> Export Dataset
            </button>
         </div>
      </div>

      {/* AI Policy Advisor */}
      <div className="bg-purple-50 border border-purple-100 rounded-xl p-6">
         <div className="flex items-center gap-3 mb-4">
             <div className="p-2 bg-white rounded-lg border border-purple-100">
               <BrainCircuit className="h-5 w-5 text-purple-600" />
             </div>
             <div>
                <h3 className="font-bold text-purple-900">Precision Health Policy Advisor</h3>
                <p className="text-xs text-purple-700">AI Analysis of population genetic trends</p>
             </div>
         </div>
         {aiPolicy ? (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-white p-4 rounded-lg border border-purple-100">
                <h4 className="text-xs font-bold text-purple-500 uppercase mb-2">Strategic Policy Recommendation</h4>
                <p className="text-sm font-medium text-slate-800 leading-relaxed">{aiPolicy.policyRecommendation}</p>
             </div>
             <div className="bg-white p-4 rounded-lg border border-purple-100">
                <h4 className="text-xs font-bold text-purple-500 uppercase mb-2">Procurement & Supply Chain</h4>
                <p className="text-sm font-medium text-slate-800 leading-relaxed">{aiPolicy.procurementAdvice}</p>
             </div>
           </div>
         ) : (
           <div className="text-center text-purple-400 text-sm">Generating policy insights...</div>
         )}
      </div>

      {/* Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Genetic Risk Stratification</h3>
            <div className="flex-1 min-h-[200px]">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie
                     data={riskData}
                     innerRadius={60}
                     outerRadius={80}
                     paddingAngle={5}
                     dataKey="value"
                   >
                     {riskData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={RISK_COLORS[index % RISK_COLORS.length]} />
                     ))}
                   </Pie>
                   <Tooltip />
                 </PieChart>
               </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-2">
               {riskData.map((entry, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-600">
                     <div className="w-2 h-2 rounded-full" style={{backgroundColor: RISK_COLORS[i]}}></div>
                     {entry.name}
                  </div>
               ))}
            </div>
         </div>

         <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Sequencing by Indication (Statewide)</h3>
            <div className="h-64 w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={indicationData} layout="vertical">
                     <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                     <XAxis type="number" hide />
                     <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                     <Tooltip cursor={{fill: 'transparent'}} />
                     <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={24} />
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>
      </div>

      {/* Registry Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
         <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="relative w-full md:w-96">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
               <input 
                  type="text" 
                  placeholder="Search Gene, Patient, or ID..." 
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>
            <div className="flex gap-2 w-full md:w-auto">
               <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                  <select 
                     className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-purple-500 appearance-none"
                     value={filterIndication}
                     onChange={(e) => setFilterIndication(e.target.value)}
                  >
                     <option value="All">All Indications</option>
                     <option value="Sickle Cell Screening">Sickle Cell</option>
                     <option value="Oncology Panel">Oncology</option>
                     <option value="Pharmacogenomics Screen">Pharmacogenomics</option>
                  </select>
               </div>
            </div>
         </div>

         <table className="w-full text-left">
            <thead>
               <tr className="bg-white border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Sequence ID</th>
                  <th className="px-6 py-4">Patient Profile</th>
                  <th className="px-6 py-4">Test Indication</th>
                  <th className="px-6 py-4">Key Markers</th>
                  <th className="px-6 py-4">Risk Level</th>
                  <th className="px-6 py-4 text-right">Action</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
               {filteredData.map(entry => (
                  <tr key={entry.id} className="hover:bg-purple-50/30 transition-colors cursor-pointer group" onClick={() => setSelectedEntry(entry)}>
                     <td className="px-6 py-4">
                        <p className="font-mono text-xs font-bold text-slate-700">{entry.id}</p>
                        <p className="text-xs text-slate-500 mt-1">{entry.testDate}</p>
                     </td>
                     <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-slate-900">{entry.patientName}</p>
                        <p className="text-xs text-slate-500">{entry.age}y / {entry.gender}</p>
                     </td>
                     <td className="px-6 py-4">
                        <span className="text-sm text-slate-700 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                           {entry.indication}
                        </span>
                     </td>
                     <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                           {entry.markers.length > 0 ? entry.markers.slice(0, 2).map((m, i) => (
                              <span key={i} className="text-xs font-mono bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded border border-purple-200">
                                 {m.gene}
                              </span>
                           )) : <span className="text-xs text-slate-400 italic">No variants</span>}
                           {entry.markers.length > 2 && <span className="text-xs text-slate-500">+ {entry.markers.length - 2} more</span>}
                        </div>
                     </td>
                     <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                           entry.riskLevel === 'HIGH' ? 'bg-red-50 text-red-700 border-red-200' :
                           entry.riskLevel === 'MODERATE' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                           'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                           {entry.riskLevel}
                        </span>
                     </td>
                     <td className="px-6 py-4 text-right">
                        <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-purple-600 inline-block" />
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>

      {/* Details Slide-over */}
      {selectedEntry && (
         <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setSelectedEntry(null)}></div>
            <div className="relative w-full max-w-xl bg-white h-full shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300">
               <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="p-2 bg-purple-50 rounded-lg text-purple-700">
                        <Microscope className="h-6 w-6" />
                     </div>
                     <div>
                        <h3 className="text-lg font-bold text-slate-800">Genomic Report</h3>
                        <p className="text-xs text-slate-500 font-mono">Ref: {selectedEntry.id}</p>
                     </div>
                  </div>
                  <button onClick={() => setSelectedEntry(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500"><X className="h-5 w-5" /></button>
               </div>

               <div className="p-6 space-y-8">
                  <div className={`p-4 rounded-xl border flex gap-4 ${
                     selectedEntry.riskLevel === 'HIGH' ? 'bg-red-50 border-red-100' : 
                     selectedEntry.riskLevel === 'MODERATE' ? 'bg-amber-50 border-amber-100' : 'bg-emerald-50 border-emerald-100'
                  }`}>
                     <Activity className={`h-6 w-6 ${
                        selectedEntry.riskLevel === 'HIGH' ? 'text-red-500' : 
                        selectedEntry.riskLevel === 'MODERATE' ? 'text-amber-500' : 'text-emerald-500'
                     }`} />
                     <div>
                        <h4 className="font-bold text-sm text-slate-800">Clinical Interpretation: {selectedEntry.riskLevel} RISK</h4>
                        <p className="text-xs text-slate-600 mt-1">
                           Based on identified pathogenic variants. Genetic counseling is {selectedEntry.riskLevel === 'HIGH' ? 'strongly recommended' : 'advised'}.
                        </p>
                     </div>
                  </div>

                  <div>
                     <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Identified Variants</h4>
                     <div className="space-y-4">
                        {selectedEntry.markers.length > 0 ? selectedEntry.markers.map((marker, i) => (
                           <div key={i} className="bg-slate-50 rounded-lg border border-slate-200 p-4">
                              <div className="flex justify-between items-start mb-2">
                                 <div>
                                    <span className="text-lg font-bold text-purple-900">{marker.gene}</span>
                                    <span className="ml-2 text-sm font-mono text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">{marker.variant}</span>
                                 </div>
                                 <span className="text-xs font-bold bg-white border border-slate-200 px-2 py-1 rounded text-slate-700">
                                    {marker.significance}
                                 </span>
                              </div>
                              {marker.pharmacogenomics && (
                                 <div className="flex gap-2 mt-3 text-xs bg-blue-50 text-blue-800 p-2 rounded border border-blue-100">
                                    <FileText className="h-4 w-4 flex-shrink-0" />
                                    <span><strong>PGx Implication:</strong> {marker.pharmacogenomics}</span>
                                 </div>
                              )}
                           </div>
                        )) : (
                           <div className="text-center py-8 text-slate-500 text-sm bg-slate-50 rounded-lg border border-dashed border-slate-200">
                              No significant variants detected in this panel.
                           </div>
                        )}
                     </div>
                  </div>

                  <div className="bg-slate-900 text-slate-300 p-4 rounded-xl text-xs font-mono">
                     <p className="mb-2 text-slate-400 uppercase">Sequencing Metadata</p>
                     <div className="grid grid-cols-2 gap-y-2">
                        <span>Lab ID:</span> <span className="text-white">{selectedEntry.labId}</span>
                        <span>Date:</span> <span className="text-white">{selectedEntry.testDate}</span>
                        <span>Hospital:</span> <span className="text-white">{selectedEntry.hospitalId}</span>
                        <span>Method:</span> <span className="text-white">NGS Panel (Illumina)</span>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};
