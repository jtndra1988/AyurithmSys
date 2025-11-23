
import React, { useState, useEffect } from 'react';
import { MOCK_INVOICES, MOCK_CLAIMS, STANDARD_SERVICES, MOCK_PATIENTS } from '../../constants';
import { Invoice, InsuranceClaim, BillableItem, Patient } from '../../types';
import { getRevenueAnalysis, RevenueInsight } from '../../services/geminiService';
import { 
  CreditCard, FileText, CheckCircle, Clock, Shield, Download, Plus, Search, 
  Trash2, ChevronRight, X, AlertTriangle, BrainCircuit, TrendingUp 
} from 'lucide-react';

export const Billing: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'invoices' | 'claims'>('invoices');
  const [viewMode, setViewMode] = useState<'list' | 'create'>('list');
  
  // Local state for data mutations
  const [invoices, setInvoices] = useState<Invoice[]>(MOCK_INVOICES);
  const [claims, setClaims] = useState<InsuranceClaim[]>(MOCK_CLAIMS);
  const [aiInsight, setAiInsight] = useState<RevenueInsight | null>(null);

  // --- Create Invoice State ---
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedItems, setSelectedItems] = useState<BillableItem[]>([]);
  const [invoiceType, setInvoiceType] = useState<'OPD' | 'IPD'>('OPD');

  // --- Payment Modal State ---
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('Cash');

  // --- Claim Modal State ---
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimScheme, setClaimScheme] = useState('Ayushman Bharat');
  const [policyNumber, setPolicyNumber] = useState('');

  useEffect(() => {
    const fetchInsight = async () => {
      const revenueData = {
        totalRevenue: 150000,
        pendingClaims: 5,
        rejectedClaims: 1
      };
      const result = await getRevenueAnalysis(revenueData);
      setAiInsight(result);
    };
    fetchInsight();
  }, []);

  // ---------------------------------------------------------
  // ACTION HANDLERS
  // ---------------------------------------------------------

  const addToInvoice = (item: BillableItem) => {
    setSelectedItems([...selectedItems, item]);
  };

  const removeFromInvoice = (index: number) => {
    const updated = [...selectedItems];
    updated.splice(index, 1);
    setSelectedItems(updated);
  };

  const calculateTotal = () => selectedItems.reduce((sum, item) => sum + item.cost, 0);

  const handleCreateInvoice = () => {
    if (!selectedPatient || selectedItems.length === 0) return;

    const newInvoice: Invoice = {
      id: `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      date: new Date().toISOString().split('T')[0],
      amount: calculateTotal(),
      status: 'PENDING',
      type: invoiceType,
      items: selectedItems.map(i => ({ description: i.description, cost: i.cost }))
    };

    setInvoices([newInvoice, ...invoices]);
    setViewMode('list');
    // Reset
    setSelectedPatient(null);
    setSelectedItems([]);
    setPatientSearch('');
  };

  const handleProcessPayment = () => {
    if (!currentInvoice) return;
    const updated = invoices.map(inv => 
      inv.id === currentInvoice.id 
        ? { ...inv, status: 'PAID' as const, paymentMethod: paymentMethod as any } 
        : inv
    );
    setInvoices(updated);
    setShowPaymentModal(false);
    setCurrentInvoice(null);
  };

  const handleSubmitClaim = () => {
    if (!currentInvoice) return;
    
    // 1. Create Claim
    const newClaim: InsuranceClaim = {
      id: `CLM-AP-${Math.floor(Math.random() * 10000)}`,
      invoiceId: currentInvoice.id,
      patientId: currentInvoice.patientId,
      patientName: currentInvoice.patientName,
      scheme: claimScheme as any,
      policyNumber: policyNumber,
      amount: currentInvoice.amount,
      status: 'SUBMITTED',
      submissionDate: new Date().toISOString().split('T')[0]
    };

    setClaims([newClaim, ...claims]);

    // 2. Update Invoice
    const updatedInvoices = invoices.map(inv => 
      inv.id === currentInvoice.id ? { ...inv, status: 'INSURANCE_PENDING' as const } : inv
    );
    setInvoices(updatedInvoices);

    setShowClaimModal(false);
    setCurrentInvoice(null);
    setPolicyNumber('');
  };

  // Mock TPA Actions
  const handleAdjudicateClaim = (claimId: string, decision: 'APPROVED' | 'REJECTED') => {
    // 1. Update Claim Status
    const updatedClaims = claims.map(c => 
      c.id === claimId ? { ...c, status: decision } : c
    );
    setClaims(updatedClaims);

    // 2. If Approved, mark Invoice as PAID. If Rejected, mark as PENDING (Patient to pay)
    const linkedClaim = claims.find(c => c.id === claimId);
    if (linkedClaim) {
      const updatedInvoices = invoices.map(inv => 
        inv.id === linkedClaim.invoiceId 
          ? { ...inv, status: decision === 'APPROVED' ? 'PAID' as const : 'PENDING' as const } 
          : inv
      );
      setInvoices(updatedInvoices);
    }
  };

  // ---------------------------------------------------------
  // RENDERERS
  // ---------------------------------------------------------

  const renderCreateInvoice = () => {
    const filteredPatients = MOCK_PATIENTS.filter(p => 
      p.name.toLowerCase().includes(patientSearch.toLowerCase()) || 
      p.id.toLowerCase().includes(patientSearch.toLowerCase())
    );

    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-right-8 duration-300">
         <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
            <h3 className="font-bold text-slate-800">Generate New Invoice</h3>
            <button onClick={() => setViewMode('list')} className="text-slate-500 hover:text-slate-800">Cancel</button>
         </div>
         <div className="grid grid-cols-1 lg:grid-cols-3 divide-x divide-slate-200">
            {/* Left: Configuration */}
            <div className="p-6 space-y-6 lg:col-span-2">
               {/* 1. Patient Selection */}
               <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Select Patient</label>
                  {!selectedPatient ? (
                     <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input 
                           type="text" 
                           placeholder="Search by Name or ID..." 
                           className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                           value={patientSearch}
                           onChange={e => setPatientSearch(e.target.value)}
                        />
                        {patientSearch && (
                           <div className="absolute top-full left-0 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl z-20 max-h-48 overflow-y-auto">
                              {filteredPatients.map(p => (
                                 <div 
                                    key={p.id} 
                                    onClick={() => setSelectedPatient(p)}
                                    className="px-4 py-2 hover:bg-slate-50 cursor-pointer text-sm"
                                 >
                                    <span className="font-bold text-slate-800">{p.name}</span> <span className="text-slate-500">({p.id})</span>
                                 </div>
                              ))}
                           </div>
                        )}
                     </div>
                  ) : (
                     <div className="flex justify-between items-center p-3 bg-brand-50 border border-brand-100 rounded-lg">
                        <div>
                           <p className="font-bold text-brand-900">{selectedPatient.name}</p>
                           <p className="text-xs text-brand-700">{selectedPatient.id} • {selectedPatient.gender}/{selectedPatient.age}</p>
                        </div>
                        <button onClick={() => setSelectedPatient(null)} className="text-brand-500 hover:text-brand-800"><X className="h-5 w-5" /></button>
                     </div>
                  )}
               </div>

               {/* 2. Billing Type */}
               <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Billing Type</label>
                  <div className="flex gap-4">
                     <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="invType" checked={invoiceType === 'OPD'} onChange={() => setInvoiceType('OPD')} />
                        <span className="text-sm text-slate-700">Out-Patient (OPD)</span>
                     </label>
                     <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="invType" checked={invoiceType === 'IPD'} onChange={() => setInvoiceType('IPD')} />
                        <span className="text-sm text-slate-700">In-Patient (IPD/Admission)</span>
                     </label>
                  </div>
               </div>

               {/* 3. Service Selection */}
               <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Add Services / Items</label>
                  <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto p-1">
                     {STANDARD_SERVICES.map(srv => (
                        <button 
                           key={srv.id}
                           onClick={() => addToInvoice(srv)}
                           className="text-left p-3 border border-slate-200 rounded-lg hover:border-brand-500 hover:bg-slate-50 transition-colors"
                        >
                           <p className="text-sm font-medium text-slate-800">{srv.description}</p>
                           <p className="text-xs text-slate-500">₹{srv.cost}</p>
                        </button>
                     ))}
                  </div>
               </div>
            </div>

            {/* Right: Summary */}
            <div className="p-6 bg-slate-50 flex flex-col h-full">
               <h4 className="font-bold text-slate-800 mb-4">Invoice Summary</h4>
               <div className="flex-1 overflow-y-auto space-y-2 mb-4">
                  {selectedItems.length > 0 ? selectedItems.map((item, idx) => (
                     <div key={idx} className="flex justify-between items-center text-sm p-2 bg-white border border-slate-200 rounded">
                        <span>{item.description}</span>
                        <div className="flex items-center gap-3">
                           <span className="font-mono">₹{item.cost}</span>
                           <button onClick={() => removeFromInvoice(idx)} className="text-slate-400 hover:text-red-500"><X className="h-4 w-4" /></button>
                        </div>
                     </div>
                  )) : (
                     <p className="text-sm text-slate-400 italic text-center py-10">No items added yet.</p>
                  )}
               </div>
               
               <div className="border-t border-slate-200 pt-4 space-y-4">
                  <div className="flex justify-between items-center text-lg font-bold text-slate-900">
                     <span>Total Payable</span>
                     <span>₹{calculateTotal().toLocaleString()}</span>
                  </div>
                  <button 
                     disabled={!selectedPatient || selectedItems.length === 0}
                     onClick={handleCreateInvoice}
                     className="w-full py-3 bg-brand-600 text-white font-bold rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex justify-center gap-2"
                  >
                     <CheckCircle className="h-5 w-5" /> Generate Invoice
                  </button>
               </div>
            </div>
         </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 relative">
      
      {/* AI Financial Insight Panel */}
      <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex flex-col md:flex-row gap-6">
         <div className="flex items-start gap-3">
            <div className="p-2 bg-white rounded-lg border border-emerald-200">
               <BrainCircuit className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
               <h3 className="font-bold text-emerald-900 flex items-center gap-2">
                  AI Financial Analyst 
                  {aiInsight && (
                     <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        aiInsight.trend === 'Up' ? 'bg-emerald-200 text-emerald-800' : 'bg-slate-200 text-slate-700'
                     }`}>
                        Trend: {aiInsight.trend}
                     </span>
                  )}
               </h3>
               <p className="text-xs text-emerald-700 mt-1">Automated revenue cycle optimization</p>
            </div>
         </div>
         
         {aiInsight ? (
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="bg-white/50 p-3 rounded-lg border border-emerald-100">
                  <p className="text-xs font-bold text-emerald-800 uppercase mb-1">Key Insight</p>
                  <p className="text-sm text-emerald-900 font-medium">{aiInsight.insight}</p>
               </div>
               <div className="bg-white/50 p-3 rounded-lg border border-emerald-100">
                  <p className="text-xs font-bold text-emerald-800 uppercase mb-1">Actionable Tip</p>
                  <p className="text-sm text-emerald-900 font-medium flex items-center gap-2">
                     <TrendingUp className="h-3 w-3" /> {aiInsight.actionableTip}
                  </p>
               </div>
            </div>
         ) : (
            <div className="flex-1 flex items-center justify-center text-sm text-emerald-600">
               <BrainCircuit className="h-4 w-4 animate-pulse mr-2" /> Analyzing revenue streams...
            </div>
         )}
      </div>

      <div className="flex justify-between items-center">
         <div className="flex bg-slate-100 p-1 rounded-lg">
            <button 
               onClick={() => { setActiveTab('invoices'); setViewMode('list'); }}
               className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${
                  activeTab === 'invoices' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
               }`}
            >
               Patient Invoices
            </button>
            <button 
               onClick={() => setActiveTab('claims')}
               className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${
                  activeTab === 'claims' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
               }`}
            >
               Insurance Claims
            </button>
         </div>
         {activeTab === 'invoices' && viewMode === 'list' && (
            <button 
               onClick={() => setViewMode('create')}
               className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-brand-700 flex items-center gap-2 shadow-sm"
            >
               <Plus className="h-4 w-4" /> New Invoice
            </button>
         )}
      </div>

      {activeTab === 'invoices' && viewMode === 'create' && renderCreateInvoice()}

      {activeTab === 'invoices' && viewMode === 'list' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-300">
           <table className="w-full text-left">
              <thead>
                 <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="px-6 py-4">Invoice ID</th>
                    <th className="px-6 py-4">Patient</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                 {invoices.map(inv => (
                    <tr key={inv.id} className="hover:bg-slate-50">
                       <td className="px-6 py-4 font-mono text-xs text-slate-500">{inv.id}</td>
                       <td className="px-6 py-4">
                          <p className="text-sm font-semibold text-slate-900">{inv.patientName}</p>
                          <p className="text-xs text-slate-500">{inv.patientId}</p>
                       </td>
                       <td className="px-6 py-4 text-sm text-slate-600">{inv.date}</td>
                       <td className="px-6 py-4">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                             inv.type === 'IPD' ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-blue-50 text-blue-700 border-blue-100'
                          }`}>{inv.type}</span>
                       </td>
                       <td className="px-6 py-4 font-bold text-slate-800">₹{inv.amount.toLocaleString()}</td>
                       <td className="px-6 py-4">
                          {inv.status === 'PAID' && <span className="flex items-center gap-1 text-xs font-bold text-emerald-600"><CheckCircle className="h-3.5 w-3.5" /> Paid ({inv.paymentMethod})</span>}
                          {inv.status === 'PENDING' && <span className="flex items-center gap-1 text-xs font-bold text-amber-600"><Clock className="h-3.5 w-3.5" /> Pending Payment</span>}
                          {inv.status === 'INSURANCE_PENDING' && <span className="flex items-center gap-1 text-xs font-bold text-blue-600"><Shield className="h-3.5 w-3.5" /> Insurance Claim</span>}
                       </td>
                       <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                             {inv.status === 'PENDING' && (
                                <>
                                   <button 
                                      onClick={() => { setCurrentInvoice(inv); setShowPaymentModal(true); }}
                                      className="text-xs bg-emerald-600 text-white px-2 py-1 rounded hover:bg-emerald-700"
                                   >
                                      Pay
                                   </button>
                                   <button 
                                      onClick={() => { setCurrentInvoice(inv); setShowClaimModal(true); }}
                                      className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                                   >
                                      Claim
                                   </button>
                                </>
                             )}
                             <button className="text-slate-400 hover:text-brand-600 transition-colors">
                                <Download className="h-4 w-4" />
                             </button>
                          </div>
                       </td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>
      )}

      {activeTab === 'claims' && (
         <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-300">
            <table className="w-full text-left">
               <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                     <th className="px-6 py-4">Claim ID</th>
                     <th className="px-6 py-4">Patient</th>
                     <th className="px-6 py-4">Scheme</th>
                     <th className="px-6 py-4">Amount</th>
                     <th className="px-6 py-4">Submission Date</th>
                     <th className="px-6 py-4">Status</th>
                     <th className="px-6 py-4 text-right">TPA Action (Sim)</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {claims.map(claim => (
                     <tr key={claim.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 font-mono text-xs text-slate-500">{claim.id}</td>
                        <td className="px-6 py-4">
                           <p className="text-sm font-semibold text-slate-900">{claim.patientName}</p>
                           <p className="text-xs text-slate-500">{claim.patientId}</p>
                        </td>
                        <td className="px-6 py-4">
                           <span className="flex items-center gap-1 text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                              <Shield className="h-3 w-3 text-brand-600" /> {claim.scheme}
                           </span>
                           <p className="text-[10px] text-slate-400 font-mono mt-0.5">{claim.policyNumber}</p>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-800">₹{claim.amount.toLocaleString()}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{claim.submissionDate}</td>
                        <td className="px-6 py-4">
                           <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                              claim.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                              claim.status === 'SUBMITTED' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                              'bg-red-50 text-red-700 border-red-100'
                           }`}>
                              {claim.status}
                           </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                           {claim.status === 'SUBMITTED' && (
                              <div className="flex justify-end gap-2">
                                 <button onClick={() => handleAdjudicateClaim(claim.id, 'APPROVED')} className="text-xs font-bold text-emerald-600 hover:bg-emerald-50 px-2 py-1 rounded border border-emerald-200">Approve</button>
                                 <button onClick={() => handleAdjudicateClaim(claim.id, 'REJECTED')} className="text-xs font-bold text-red-600 hover:bg-red-50 px-2 py-1 rounded border border-red-200">Reject</button>
                              </div>
                           )}
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && currentInvoice && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
               <div className="bg-emerald-600 p-4 text-white">
                  <h3 className="font-bold flex items-center gap-2"><CreditCard className="h-5 w-5" /> Collect Payment</h3>
               </div>
               <div className="p-6">
                  <div className="text-center mb-6">
                     <p className="text-sm text-slate-500 mb-1">Total Amount Due</p>
                     <p className="text-3xl font-bold text-emerald-600">₹{currentInvoice.amount.toLocaleString()}</p>
                  </div>
                  
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Payment Method</label>
                  <div className="grid grid-cols-3 gap-3 mb-6">
                     {['Cash', 'Card', 'UPI'].map(method => (
                        <button 
                           key={method}
                           onClick={() => setPaymentMethod(method)}
                           className={`py-2 text-sm font-bold rounded-lg border ${
                              paymentMethod === method ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                           }`}
                        >
                           {method}
                        </button>
                     ))}
                  </div>

                  <div className="flex gap-3">
                     <button onClick={() => setShowPaymentModal(false)} className="flex-1 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-lg">Cancel</button>
                     <button onClick={handleProcessPayment} className="flex-1 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700">Confirm Payment</button>
                  </div>
               </div>
            </div>
         </div>
      )}

      {/* Insurance Claim Modal */}
      {showClaimModal && currentInvoice && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
               <div className="bg-blue-600 p-4 text-white">
                  <h3 className="font-bold flex items-center gap-2"><Shield className="h-5 w-5" /> Submit Insurance Claim</h3>
               </div>
               <div className="p-6 space-y-4">
                  <div>
                     <label className="block text-sm font-semibold text-slate-700 mb-1">Insurance Scheme</label>
                     <select 
                        className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500"
                        value={claimScheme}
                        onChange={e => setClaimScheme(e.target.value)}
                     >
                        <option value="Ayushman Bharat">Ayushman Bharat (PM-JAY)</option>
                        <option value="Aarogyasri">Dr. YSR Aarogyasri</option>
                        <option value="EHS">Employee Health Scheme (EHS)</option>
                        <option value="Private">Private Insurance (TPA)</option>
                     </select>
                  </div>
                  
                  <div>
                     <label className="block text-sm font-semibold text-slate-700 mb-1">Policy / Card Number</label>
                     <input 
                        type="text" 
                        className="w-full p-2 border border-slate-300 rounded-lg outline-none focus:border-blue-500 font-mono"
                        placeholder="XXXX-XXXX-XXXX"
                        value={policyNumber}
                        onChange={e => setPolicyNumber(e.target.value)}
                     />
                  </div>

                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-600">
                     <div className="flex justify-between mb-1"><span>Claim Amount:</span> <span className="font-bold">₹{currentInvoice.amount.toLocaleString()}</span></div>
                     <div className="flex justify-between"><span>Patient:</span> <span>{currentInvoice.patientName}</span></div>
                  </div>

                  <div className="flex gap-3 pt-2">
                     <button onClick={() => setShowClaimModal(false)} className="flex-1 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-lg">Cancel</button>
                     <button 
                        onClick={handleSubmitClaim} 
                        disabled={!policyNumber}
                        className="flex-1 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50"
                     >
                        Submit to TPA
                     </button>
                  </div>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};
