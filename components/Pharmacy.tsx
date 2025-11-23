
import React, { useState, useEffect } from 'react';
import { MOCK_INVENTORY, MOCK_PATIENTS } from '../constants';
import { InventoryItem, Patient, DrugInteractionResult, Medication } from '../types';
import { checkDrugInteractions, getInventoryOptimization, InventoryInsight, getDrugInfo } from '../services/geminiService';
import { 
  Search, AlertTriangle, CheckCircle, Package, Pill, BrainCircuit, 
  ChevronRight, RefreshCw, X, ShoppingCart, Activity, TrendingDown, 
  History, Plus, Truck, MessageSquare, Send
} from 'lucide-react';

type PharmacyTab = 'DISPENSE' | 'INVENTORY' | 'HISTORY';

interface DispenseRecord {
  id: string;
  patientName: string;
  patientId: string;
  drugName: string;
  quantity: number;
  timestamp: string;
}

export const Pharmacy: React.FC = () => {
  // Local State representing Database
  const [activeTab, setActiveTab] = useState<PharmacyTab>('DISPENSE');
  const [inventory, setInventory] = useState<InventoryItem[]>(MOCK_INVENTORY);
  const [patients, setPatients] = useState<Patient[]>(MOCK_PATIENTS);
  const [dispenseHistory, setDispenseHistory] = useState<DispenseRecord[]>([]);
  
  // Dispensing Workflow States
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [interactionResult, setInteractionResult] = useState<DrugInteractionResult | null>(null);
  const [isCheckingAI, setIsCheckingAI] = useState(false);
  const [dispenseSuccess, setDispenseSuccess] = useState(false);
  
  // AI Insights & Assistant
  const [aiSupplyChain, setAiSupplyChain] = useState<InventoryInsight | null>(null);
  const [drugQuery, setDrugQuery] = useState('');
  const [drugAnswer, setDrugAnswer] = useState('');
  const [isQueryingDrug, setIsQueryingDrug] = useState(false);

  // Inventory Mgmt States
  const [showAddStockModal, setShowAddStockModal] = useState(false);
  const [newStock, setNewStock] = useState<Partial<InventoryItem>>({ name: '', batchNo: '', stock: 0, expiryDate: '' });

  // Filter patients who have meds to dispense
  const queue = patients.filter(p => p.medications && p.medications.some(m => m.status === 'ACTIVE' || m.status === 'PENDING_DISPENSE'));

  useEffect(() => {
    const fetchSupplyChain = async () => {
      const result = await getInventoryOptimization(inventory);
      setAiSupplyChain(result);
    };
    fetchSupplyChain();
  }, [inventory]);

  // --- Handlers ---

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setInteractionResult(null);
    setDispenseSuccess(false);
  };

  const runSafetyCheck = async () => {
    if (!selectedPatient || !selectedPatient.medications) return;
    setIsCheckingAI(true);
    const result = await checkDrugInteractions(selectedPatient.medications, selectedPatient.history);
    setInteractionResult(result);
    setIsCheckingAI(false);
  };

  const handleAskDrugInfo = async () => {
    if (!drugQuery) return;
    setIsQueryingDrug(true);
    const result = await getDrugInfo(drugQuery);
    setDrugAnswer(result);
    setIsQueryingDrug(false);
  };

  const handleDispense = () => {
    if (!selectedPatient || !selectedPatient.medications) return;

    const updatedInventory = [...inventory];
    const newHistoryRecords: DispenseRecord[] = [];

    selectedPatient.medications.forEach(med => {
      if (med.status === 'PENDING_DISPENSE' || med.status === 'ACTIVE') {
        // Fuzzy match for demo
        const itemIndex = updatedInventory.findIndex(i => med.name.includes(i.name.split(' ')[0]));
        if (itemIndex > -1) {
          const qty = 10; // Simulated quantity
          updatedInventory[itemIndex] = {
            ...updatedInventory[itemIndex],
            stock: Math.max(0, updatedInventory[itemIndex].stock - qty)
          };
          
          newHistoryRecords.push({
            id: `DISP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            patientName: selectedPatient.name,
            patientId: selectedPatient.id,
            drugName: med.name,
            quantity: qty,
            timestamp: new Date().toLocaleString()
          });
        }
      }
    });

    setInventory(updatedInventory);
    setDispenseHistory([...newHistoryRecords, ...dispenseHistory]);
    
    // Mark patient meds as dispensed (simulated local update)
    const updatedPatients = patients.map(p => 
      p.id === selectedPatient.id 
        ? { ...p, medications: p.medications?.map(m => ({ ...m, status: 'COMPLETED' as const })) } 
        : p
    );
    setPatients(updatedPatients);

    setDispenseSuccess(true);
    setTimeout(() => {
       setSelectedPatient(null);
       setDispenseSuccess(false);
    }, 2000);
  };

  const handleAddStock = () => {
    if (newStock.name && newStock.stock) {
      const item: InventoryItem = {
        id: `INV-${Date.now()}`,
        name: newStock.name,
        batchNo: newStock.batchNo || `B${Date.now()}`,
        expiryDate: newStock.expiryDate || '2025-12-31',
        stock: Number(newStock.stock),
        unit: 'Units',
        hospitalId: 'H-AP-001'
      };
      setInventory([item, ...inventory]);
      setShowAddStockModal(false);
      setNewStock({ name: '', batchNo: '', stock: 0, expiryDate: '' });
    }
  };

  // --- Renderers ---

  const renderInventoryTable = () => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-300">
       <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div className="relative w-64">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
             <input type="text" placeholder="Search inventory..." className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500" />
          </div>
          <button 
             onClick={() => setShowAddStockModal(true)}
             className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-brand-700 flex items-center gap-2 shadow-sm"
          >
             <Plus className="h-4 w-4" /> Add Stock
          </button>
       </div>
       <table className="w-full text-left text-sm">
          <thead>
             <tr className="bg-white text-slate-500 border-b border-slate-100">
                <th className="px-6 py-3 font-semibold">Drug Name</th>
                <th className="px-6 py-3 font-semibold">Batch No</th>
                <th className="px-6 py-3 font-semibold">Expiry</th>
                <th className="px-6 py-3 font-semibold text-right">Stock Level</th>
                <th className="px-6 py-3 font-semibold text-right">Action</th>
             </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
             {inventory.map(item => (
                <tr key={item.id} className="hover:bg-slate-50">
                   <td className="px-6 py-3 font-bold text-slate-700">{item.name}</td>
                   <td className="px-6 py-3 font-mono text-xs text-slate-500">{item.batchNo}</td>
                   <td className={`px-6 py-3 ${new Date(item.expiryDate) < new Date('2024-06-01') ? 'text-red-600 font-bold' : 'text-slate-600'}`}>
                      {item.expiryDate}
                   </td>
                   <td className="px-6 py-3 text-right">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                         item.stock < 500 ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
                      }`}>
                         {item.stock} {item.unit}
                      </span>
                   </td>
                   <td className="px-6 py-3 text-right">
                      <button className="text-blue-600 hover:text-blue-800 text-xs font-medium">Adjust</button>
                   </td>
                </tr>
             ))}
          </tbody>
       </table>
    </div>
  );

  const renderHistory = () => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-300">
       <div className="p-4 border-b border-slate-200 bg-slate-50">
          <h3 className="font-bold text-slate-700 flex items-center gap-2">
             <History className="h-5 w-5 text-slate-500" /> Dispensing Logs
          </h3>
       </div>
       {dispenseHistory.length > 0 ? (
          <table className="w-full text-left text-sm">
             <thead>
                <tr className="bg-white text-slate-500 border-b border-slate-100">
                   <th className="px-6 py-3 font-semibold">Timestamp</th>
                   <th className="px-6 py-3 font-semibold">Patient</th>
                   <th className="px-6 py-3 font-semibold">Drug Dispensed</th>
                   <th className="px-6 py-3 font-semibold">Qty</th>
                   <th className="px-6 py-3 font-semibold text-right">Status</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-slate-100">
                {dispenseHistory.map(record => (
                   <tr key={record.id} className="hover:bg-slate-50">
                      <td className="px-6 py-3 font-mono text-xs text-slate-500">{record.timestamp}</td>
                      <td className="px-6 py-3 font-medium text-slate-900">
                         {record.patientName} <span className="text-xs text-slate-400 block">{record.patientId}</span>
                      </td>
                      <td className="px-6 py-3 text-slate-700">{record.drugName}</td>
                      <td className="px-6 py-3 text-slate-700">{record.quantity}</td>
                      <td className="px-6 py-3 text-right">
                         <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded flex items-center gap-1 w-fit ml-auto">
                            <CheckCircle className="h-3 w-3" /> Completed
                         </span>
                      </td>
                   </tr>
                ))}
             </tbody>
          </table>
       ) : (
          <div className="p-12 text-center text-slate-400">No dispensing records yet.</div>
       )}
    </div>
  );

  return (
    <div className="space-y-6 h-full flex flex-col animate-in fade-in duration-300">
      
      {/* KPI Header */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Package className="h-5 w-5" /></div>
            <div>
               <p className="text-xs text-slate-500 uppercase font-bold">Pending Queue</p>
               <h3 className="text-xl font-bold text-slate-800">{queue.length}</h3>
            </div>
         </div>
         <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="p-2 bg-red-50 text-red-600 rounded-lg"><AlertTriangle className="h-5 w-5" /></div>
            <div>
               <p className="text-xs text-slate-500 uppercase font-bold">Low Stock Alerts</p>
               <h3 className="text-xl font-bold text-slate-800">{inventory.filter(i => i.stock < 500).length}</h3>
            </div>
         </div>
         <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Activity className="h-5 w-5" /></div>
            <div>
               <p className="text-xs text-slate-500 uppercase font-bold">Expiring Soon</p>
               <h3 className="text-xl font-bold text-slate-800">{inventory.filter(i => new Date(i.expiryDate) < new Date('2024-01-01')).length}</h3>
            </div>
         </div>
         <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><ShoppingCart className="h-5 w-5" /></div>
            <div>
               <p className="text-xs text-slate-500 uppercase font-bold">Dispensed Today</p>
               <h3 className="text-xl font-bold text-slate-800">{dispenseHistory.length}</h3>
            </div>
         </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Left Column: Navigation & AI */}
        <div className="lg:col-span-3 flex flex-col gap-6">
           
           {/* Navigation Tabs */}
           <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="flex flex-col p-2 space-y-1">
                 <button 
                    onClick={() => setActiveTab('DISPENSE')}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-bold ${
                       activeTab === 'DISPENSE' ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                 >
                    <Pill className="h-5 w-5" /> Dispensing Queue
                 </button>
                 <button 
                    onClick={() => setActiveTab('INVENTORY')}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-bold ${
                       activeTab === 'INVENTORY' ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                 >
                    <Package className="h-5 w-5" /> Inventory Mgmt
                 </button>
                 <button 
                    onClick={() => setActiveTab('HISTORY')}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-bold ${
                       activeTab === 'HISTORY' ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                 >
                    <History className="h-5 w-5" /> Dispense Logs
                 </button>
              </div>
           </div>

           {/* AI Drug Assistant */}
           <div className="bg-indigo-900 text-white rounded-xl p-4 shadow-lg flex-1 flex flex-col relative overflow-hidden">
              <div className="relative z-10 flex items-center gap-2 mb-4">
                 <div className="p-2 bg-white/10 rounded-lg"><MessageSquare className="h-5 w-5 text-indigo-300" /></div>
                 <h3 className="font-bold text-sm">AI Drug Assistant</h3>
              </div>
              
              <div className="flex-1 overflow-y-auto mb-4 bg-black/20 rounded-lg p-3 text-xs space-y-3">
                 {drugAnswer ? (
                    <p className="leading-relaxed text-indigo-100">{drugAnswer}</p>
                 ) : (
                    <p className="text-indigo-400 italic">Ask me about drug interactions, side effects, or dosage...</p>
                 )}
              </div>

              <div className="relative z-10">
                 <div className="flex gap-2">
                    <input 
                       type="text" 
                       className="w-full bg-white/10 border border-indigo-500/50 rounded-lg px-3 py-2 text-xs text-white placeholder-indigo-400 focus:outline-none focus:border-indigo-400"
                       placeholder="e.g. Side effects of Metformin"
                       value={drugQuery}
                       onChange={e => setDrugQuery(e.target.value)}
                       onKeyDown={e => e.key === 'Enter' && handleAskDrugInfo()}
                    />
                    <button 
                       onClick={handleAskDrugInfo}
                       disabled={isQueryingDrug}
                       className="p-2 bg-indigo-500 hover:bg-indigo-400 rounded-lg text-white disabled:opacity-50"
                    >
                       {isQueryingDrug ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </button>
                 </div>
              </div>
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl -mr-8 -mb-8"></div>
           </div>

           {/* Supply Chain Alert */}
           {aiSupplyChain && (
              <div className="bg-blue-50 rounded-xl border border-blue-100 p-4">
                 <h3 className="text-xs font-bold text-blue-900 flex items-center gap-2 mb-2">
                    <TrendingDown className="h-4 w-4" /> Stockout Risk
                 </h3>
                 <div className="flex flex-wrap gap-1">
                    {aiSupplyChain.stockoutRisk.length > 0 ? (
                       aiSupplyChain.stockoutRisk.slice(0,3).map((d, i) => (
                          <span key={i} className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold">{d}</span>
                       ))
                    ) : <span className="text-[10px] text-slate-500">Healthy</span>}
                 </div>
              </div>
           )}
        </div>

        {/* Right Column: Workspaces */}
        <div className="lg:col-span-9 h-full overflow-hidden flex flex-col">
           
           {activeTab === 'INVENTORY' && renderInventoryTable()}
           {activeTab === 'HISTORY' && renderHistory()}

           {activeTab === 'DISPENSE' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
                 
                 {/* Queue List */}
                 <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden h-full">
                    <div className="p-4 border-b border-slate-100 bg-slate-50">
                       <h3 className="font-bold text-slate-800 text-sm">Pending Prescriptions</h3>
                    </div>
                    <div className="overflow-y-auto flex-1 p-2 space-y-2">
                       {queue.length > 0 ? queue.map(p => (
                          <div 
                            key={p.id} 
                            onClick={() => handleSelectPatient(p)}
                            className={`p-3 rounded-lg border cursor-pointer transition-all ${
                               selectedPatient?.id === p.id 
                                 ? 'bg-brand-50 border-brand-200 ring-1 ring-brand-300' 
                                 : 'bg-white border-slate-100 hover:border-brand-200 hover:bg-slate-50'
                            }`}
                          >
                             <div className="flex justify-between items-start">
                                <div>
                                   <h4 className="font-semibold text-sm text-slate-900">{p.name}</h4>
                                   <p className="text-xs text-slate-500">ID: {p.id}</p>
                                </div>
                                <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                                   {p.medications?.filter(m => m.status !== 'COMPLETED').length} Items
                                </span>
                             </div>
                          </div>
                       )) : (
                          <div className="p-8 text-center text-slate-400 text-sm">Queue empty.</div>
                       )}
                    </div>
                 </div>

                 {/* Workbench */}
                 <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden">
                    {selectedPatient ? (
                       <div className="flex flex-col h-full">
                          <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50">
                             <div>
                                <h2 className="text-xl font-bold text-slate-800">{selectedPatient.name}</h2>
                                <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                                   {selectedPatient.age}y / {selectedPatient.gender} • <span className="font-mono">{selectedPatient.id}</span>
                                </p>
                             </div>
                             <button onClick={() => setSelectedPatient(null)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400">
                                <X className="h-5 w-5" />
                             </button>
                          </div>

                          <div className="flex-1 overflow-y-auto p-6 space-y-6">
                             {/* Meds */}
                             <div>
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Rx Details</h3>
                                <div className="space-y-2">
                                   {selectedPatient.medications?.filter(m => m.status !== 'DISCONTINUED').map((med, idx) => {
                                      const stockItem = inventory.find(i => med.name.includes(i.name.split(' ')[0]));
                                      const isDispensed = med.status === 'COMPLETED';
                                      return (
                                         <div key={idx} className={`flex items-center justify-between p-3 border rounded-lg ${isDispensed ? 'bg-emerald-50 border-emerald-100' : 'bg-white border-slate-200'}`}>
                                            <div className="flex items-center gap-3">
                                               <div className={`h-8 w-8 rounded-full flex items-center justify-center ${isDispensed ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                                                  {isDispensed ? <CheckCircle className="h-4 w-4" /> : <Pill className="h-4 w-4" />}
                                               </div>
                                               <div>
                                                  <p className="font-bold text-sm text-slate-900">{med.name}</p>
                                                  <p className="text-xs text-slate-500">{med.dosage} • {med.frequency}</p>
                                               </div>
                                            </div>
                                            <div className="text-right">
                                               {isDispensed ? (
                                                  <span className="text-xs font-bold text-emerald-600">Dispensed</span>
                                               ) : (
                                                  stockItem ? (
                                                     <span className={`text-xs font-mono font-bold ${stockItem.stock > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                                        Stock: {stockItem.stock}
                                                     </span>
                                                  ) : <span className="text-xs font-bold text-red-500">Not in Stock</span>
                                               )}
                                            </div>
                                         </div>
                                      );
                                   })}
                                </div>
                             </div>

                             {/* AI Check */}
                             <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                                <div className="flex justify-between items-center mb-3">
                                   <h3 className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-2">
                                      <BrainCircuit className="h-4 w-4" /> AI Interaction Scan
                                   </h3>
                                   {!interactionResult && (
                                      <button 
                                         onClick={runSafetyCheck}
                                         disabled={isCheckingAI}
                                         className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                                      >
                                         {isCheckingAI ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Activity className="h-3 w-3" />}
                                         Scan
                                      </button>
                                   )}
                                </div>
                                {interactionResult && (
                                   <div className={`p-3 rounded border text-xs ${interactionResult.hasInteractions ? 'bg-red-50 border-red-200 text-red-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'}`}>
                                      {interactionResult.hasInteractions ? (
                                         <>
                                            <strong>Warning:</strong> {interactionResult.warnings.join(', ')}
                                            <p className="mt-1"><em>Rec: {interactionResult.recommendation}</em></p>
                                         </>
                                      ) : "No contraindications found."}
                                   </div>
                                )}
                             </div>
                          </div>

                          <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
                             {dispenseSuccess ? (
                                <div className="flex items-center gap-2 text-emerald-600 font-bold animate-in zoom-in">
                                   <CheckCircle className="h-5 w-5" /> Dispensed Successfully
                                </div>
                             ) : (
                                <button 
                                   onClick={handleDispense}
                                   className="px-6 py-3 bg-brand-600 text-white font-bold rounded-lg hover:bg-brand-700 shadow-lg flex items-center gap-2"
                                >
                                   Confirm Dispense <ChevronRight className="h-4 w-4" />
                                </button>
                             )}
                          </div>
                       </div>
                    ) : (
                       <div className="flex flex-col items-center justify-center h-full text-slate-400">
                          <Pill className="h-12 w-12 mb-3 opacity-20" />
                          <p className="text-sm">Select a patient to begin dispensing.</p>
                       </div>
                    )}
                 </div>
              </div>
           )}
        </div>
      </div>

      {/* Add Stock Modal */}
      {showAddStockModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
               <div className="bg-slate-900 p-4 text-white flex justify-between items-center">
                  <h3 className="font-bold flex items-center gap-2"><Truck className="h-5 w-5" /> Receive Goods (GRN)</h3>
                  <button onClick={() => setShowAddStockModal(false)}><X className="h-5 w-5 text-slate-400 hover:text-white" /></button>
               </div>
               <div className="p-6 space-y-4">
                  <div>
                     <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Drug Name</label>
                     <input type="text" className="w-full p-2 border rounded" placeholder="e.g. Paracetamol 650mg" value={newStock.name} onChange={e => setNewStock({...newStock, name: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Batch No</label>
                        <input type="text" className="w-full p-2 border rounded" placeholder="B-XXXX" value={newStock.batchNo} onChange={e => setNewStock({...newStock, batchNo: e.target.value})} />
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Expiry</label>
                        <input type="date" className="w-full p-2 border rounded" value={newStock.expiryDate} onChange={e => setNewStock({...newStock, expiryDate: e.target.value})} />
                     </div>
                  </div>
                  <div>
                     <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Quantity Added</label>
                     <input type="number" className="w-full p-2 border rounded" placeholder="0" value={newStock.stock || ''} onChange={e => setNewStock({...newStock, stock: Number(e.target.value)})} />
                  </div>
                  <button onClick={handleAddStock} className="w-full py-3 bg-brand-600 text-white font-bold rounded-lg hover:bg-brand-700">Update Inventory</button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};
