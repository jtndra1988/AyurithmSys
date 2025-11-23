
import React, { useState } from 'react';
import { Patient, AIAnalysisResult, TriageLevel, GenomicMarker, RegistryEntry, VisitType, PatientStatus, Medication, LabOrder, UserRole, DrugInteractionResult, Vitals, Referral } from '../../types';
import { getClinicalAssessment, checkDrugInteractions, analyzeVitalsRisk, VitalsAnalysis } from '../../services/geminiService';
import { 
  Heart, Thermometer, Activity, Wind, Dna, BrainCircuit, AlertCircle, CheckCircle2, X, Plus, Save, Trash2, 
  AlertTriangle, RefreshCw, Beaker, FileText, ClipboardEdit, UploadCloud, ChevronRight, BedDouble, LogOut,
  Pill, TestTube2, Search, ChevronDown, ShieldAlert, Stethoscope, Clock, Syringe, Ambulance
} from 'lucide-react';
import { MOCK_MEDICINES, MOCK_LAB_TESTS, MOCK_HOSPITALS } from '../../constants';

interface PatientDetailProps {
  patient: Patient;
  onClose: () => void;
  onReportToRegistry: (entry: RegistryEntry) => void;
  onLogAction?: (action: string, resource: string, details: string) => void;
  onAdmit?: (patientId: string, ward: string) => void;
  onDischarge?: (patientId: string) => void;
  currentUserRole?: UserRole;
}

export const PatientDetail: React.FC<PatientDetailProps> = ({ 
  patient, onClose, onReportToRegistry, onLogAction, onAdmit, onDischarge, currentUserRole
}) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'CPOE' | 'AI' | 'NURSE'>('OVERVIEW');
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Local state for genomics
  const [genomicsList, setGenomicsList] = useState<GenomicMarker[]>(patient.genomics || []);
  const [showAddGenomic, setShowAddGenomic] = useState(false);
  const [dataChanged, setDataChanged] = useState(false);
  const [newMarker, setNewMarker] = useState<GenomicMarker>({ gene: '', variant: '', significance: '', pharmacogenomics: '' });
  
  // State for clinical notes
  const [clinicalNotes, setClinicalNotes] = useState('');

  // Registry Reporting State
  const [showRegistryModal, setShowRegistryModal] = useState(false);
  const [registryType, setRegistryType] = useState('TB');
  const [registryDiagnosis, setRegistryDiagnosis] = useState('');

  // Admission Modal State
  const [showAdmitModal, setShowAdmitModal] = useState(false);
  const [selectedWard, setSelectedWard] = useState('General Ward A');

  // Referral Modal State
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [referralTarget, setReferralTarget] = useState('');
  const [referralReason, setReferralReason] = useState('');

  // --- CPOE States ---
  const [medications, setMedications] = useState<Medication[]>(patient.medications || []);
  const [labOrders, setLabOrders] = useState<LabOrder[]>(patient.labOrders || []);
  
  // New Prescription Input
  const [medSearch, setMedSearch] = useState('');
  const [newMed, setNewMed] = useState<Partial<Medication>>({ dosage: '', frequency: 'OD', duration: '3 Days' });
  const [showMedDropdown, setShowMedDropdown] = useState(false);
  const [drugInteraction, setDrugInteraction] = useState<DrugInteractionResult | null>(null);
  const [checkingInteraction, setCheckingInteraction] = useState(false);

  // New Lab Order Input
  const [labSearch, setLabSearch] = useState('');
  const [showLabDropdown, setShowLabDropdown] = useState(false);

  // --- NURSE STATES ---
  const [newVitals, setNewVitals] = useState<Vitals>({ ...patient.vitals });
  const [vitalsAnalysis, setVitalsAnalysis] = useState<VitalsAnalysis | null>(null);
  const [analyzingVitals, setAnalyzingVitals] = useState(false);

  const isDoctor = currentUserRole === UserRole.DOCTOR;
  const isNurse = currentUserRole === UserRole.NURSE;

  const handleAnalyze = async () => {
    setLoading(true);
    setActiveTab('AI');
    if (onLogAction) onLogAction('ANALYSIS', `Patient ${patient.id}`, 'Invoked Gemini 2.5 AI Model');
    const result = await getClinicalAssessment({ ...patient, genomics: genomicsList }, clinicalNotes);
    setAnalysis(result);
    setLoading(false);
    setDataChanged(false);
  };

  const handleSaveMarker = () => {
    if (newMarker.gene && newMarker.variant) {
      setGenomicsList([...genomicsList, newMarker]);
      setNewMarker({ gene: '', variant: '', significance: '', pharmacogenomics: '' });
      setShowAddGenomic(false);
      setDataChanged(true);
    }
  };

  const handleDeleteMarker = (index: number) => {
    const newList = [...genomicsList];
    newList.splice(index, 1);
    setGenomicsList(newList);
    setDataChanged(true);
  };

  const handleSubmitRegistry = () => {
    const newEntry: RegistryEntry = {
      id: `REG-AP-${Math.floor(Math.random() * 10000)}`,
      patientId: patient.id,
      patientName: patient.name,
      patientAge: patient.age,
      patientGender: patient.gender,
      type: registryType as any,
      status: 'PENDING',
      submissionDate: new Date().toISOString().split('T')[0],
      hospitalId: patient.hospitalId,
      hospitalName: 'Current Hospital',
      diagnosis: registryDiagnosis || 'Clinical Diagnosis',
      icdCode: 'Pending Coding',
      state: 'Andhra Pradesh',
      district: 'Visakhapatnam',
      riskScore: patient.triageLevel === TriageLevel.CRITICAL ? 'High' : 'Medium'
    };
    onReportToRegistry(newEntry);
    setShowRegistryModal(false);
    setRegistryDiagnosis('');
  };

  const handleAdmitSubmit = () => {
    if (onAdmit) {
       onAdmit(patient.id, selectedWard);
       setShowAdmitModal(false);
       onClose(); 
    }
  };

  const handleDischargeSubmit = () => {
    if (confirm("Are you sure you want to discharge this patient? This will finalize the bill and release the bed.")) {
       if (onDischarge) {
          onDischarge(patient.id);
          onClose();
       }
    }
  };

  const handleReferralSubmit = () => {
    if (!referralTarget || !referralReason) return;
    if (onLogAction) onLogAction('REFERRAL', `Patient ${patient.id}`, `Initiated transfer to ${referralTarget}. Reason: ${referralReason}`);
    alert("Referral request sent to 108 Command Center & Receiving Hospital.");
    setShowReferralModal(false);
    onClose();
  };

  // --- CPOE Actions ---
  const handleRunInteractionCheck = async () => {
    if (!medSearch) return;
    setCheckingInteraction(true);
    const tempMeds = [...medications, { name: medSearch } as Medication];
    const result = await checkDrugInteractions(tempMeds, patient.history);
    setDrugInteraction(result);
    setCheckingInteraction(false);
  };

  const handleAddMedication = () => {
    if (medSearch && newMed.dosage) {
      const medication: Medication = {
        id: `RX-${Date.now()}`,
        name: medSearch,
        dosage: newMed.dosage || '',
        frequency: newMed.frequency || 'OD',
        duration: newMed.duration,
        status: 'PENDING_DISPENSE',
        prescribedDate: new Date().toISOString().split('T')[0]
      };
      setMedications([medication, ...medications]);
      setMedSearch('');
      setNewMed({ dosage: '', frequency: 'OD', duration: '3 Days' });
      setDrugInteraction(null); // Clear check
      if (onLogAction) onLogAction('ORDER', `Patient ${patient.id}`, `Prescribed ${medication.name}`);
    }
  };

  const handleOrderLab = () => {
    if (labSearch) {
      const order: LabOrder = {
        id: `LO-${Date.now()}`,
        testName: labSearch,
        priority: 'ROUTINE',
        status: 'ORDERED',
        orderedBy: 'Dr. Current User',
        orderDate: new Date().toISOString().split('T')[0]
      };
      setLabOrders([order, ...labOrders]);
      setLabSearch('');
      if (onLogAction) onLogAction('ORDER', `Patient ${patient.id}`, `Ordered Lab: ${order.testName}`);
    }
  };

  // --- Nurse Actions ---
  const handleAnalyzeVitals = async () => {
    setAnalyzingVitals(true);
    const result = await analyzeVitalsRisk(newVitals, patient.age);
    setVitalsAnalysis(result);
    setAnalyzingVitals(false);
  };

  const handleSaveVitals = () => {
    if(onLogAction) onLogAction('UPDATE', `Patient ${patient.id}`, `Vitals updated. Risk Score: ${vitalsAnalysis?.riskScore || 'N/A'}`);
    alert("Vitals saved to chart.");
    // In real app, update parent state
  };

  const handleAdministerMed = (medId: string) => {
    setMedications(medications.map(m => m.id === medId ? { ...m, status: 'COMPLETED' as const } : m)); // Simulated
    if(onLogAction) onLogAction('ADMINISTER', `Patient ${patient.id}`, `Medication Administered: ${medId}`);
  };

  const getTriageColor = (level: TriageLevel) => {
    switch(level) {
      case TriageLevel.CRITICAL: return 'bg-red-100 text-red-700 border-red-200 ring-red-500';
      case TriageLevel.URGENT: return 'bg-amber-100 text-amber-700 border-amber-200 ring-amber-500';
      default: return 'bg-emerald-100 text-emerald-700 border-emerald-200 ring-emerald-500';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden flex flex-col h-full animate-in fade-in zoom-in-95 duration-300">
      {/* Header */}
      <div className="bg-white px-6 py-4 border-b border-slate-100 flex justify-between items-center sticky top-0 z-10">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{patient.name}</h2>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider ${getTriageColor(patient.triageLevel)}`}>
              {patient.triageLevel}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-wider">
               {patient.visitType}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1 text-sm text-slate-500 font-medium">
            <span>{patient.age} years</span>
            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
            <span>{patient.gender}</span>
            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
            <span>ID: <span className="font-mono text-slate-600">{patient.id}</span></span>
          </div>
        </div>
        <div className="flex gap-2">
           {patient.status !== PatientStatus.ADMITTED && patient.status !== PatientStatus.DISCHARGED && !isNurse && (
              <button 
                 onClick={() => setShowAdmitModal(true)}
                 className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-full font-bold text-xs border border-purple-100 uppercase tracking-wide transition-colors"
              >
                 <BedDouble className="h-4 w-4" /> Admit
              </button>
           )}
           {patient.status === PatientStatus.ADMITTED && !isNurse && (
              <button 
                 onClick={handleDischargeSubmit}
                 className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white hover:bg-slate-700 rounded-full font-bold text-xs border border-slate-700 uppercase tracking-wide transition-colors"
              >
                 <LogOut className="h-4 w-4" /> Discharge
              </button>
           )}

           {!isNurse && (
             <>
                <button 
                  onClick={() => setShowReferralModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-full font-bold text-xs border border-amber-100 transition-colors uppercase tracking-wide"
                >
                  <Ambulance className="h-4 w-4" /> Refer
                </button>
                <button 
                  onClick={() => setShowRegistryModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-full font-bold text-xs border border-blue-100 transition-colors uppercase tracking-wide"
                >
                  <UploadCloud className="h-4 w-4" /> Report Registry
                </button>
             </>
           )}
           <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
             <X className="h-6 w-6" />
           </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200 px-6 bg-slate-50/50">
         <button 
            onClick={() => setActiveTab('OVERVIEW')}
            className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors ${
               activeTab === 'OVERVIEW' ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
         >
            Overview & Notes
         </button>
         {isNurse && (
            <button 
               onClick={() => setActiveTab('NURSE')}
               className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === 'NURSE' ? 'border-rose-600 text-rose-700' : 'border-transparent text-slate-500 hover:text-slate-700'
               }`}
            >
               Nursing & Vitals
            </button>
         )}
         {!isNurse && (
            <button 
               onClick={() => setActiveTab('CPOE')}
               className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === 'CPOE' ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-500 hover:text-slate-700'
               }`}
            >
               Orders (CPOE)
            </button>
         )}
         <button 
            onClick={() => setActiveTab('AI')}
            className={`px-4 py-3 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
               activeTab === 'AI' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
         >
            <BrainCircuit className="h-4 w-4" /> AI Insights
         </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
        
        {/* --- TAB: OVERVIEW --- */}
        {activeTab === 'OVERVIEW' && (
           <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 animate-in fade-in slide-in-from-left-4 duration-300">
              <div className="space-y-6 xl:col-span-1">
                 <section>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Activity className="h-4 w-4" /> Live Vitals
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-2 text-blue-600 mb-1">
                          <Heart className="h-3.5 w-3.5" /> <span className="text-[10px] font-bold uppercase">HR</span>
                        </div>
                        <span className="text-xl font-bold text-slate-800">{patient.vitals.heartRate}</span>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-2 text-rose-600 mb-1">
                          <Activity className="h-3.5 w-3.5" /> <span className="text-[10px] font-bold uppercase">BP</span>
                        </div>
                        <span className="text-xl font-bold text-slate-800">{patient.vitals.bpSystolic}/{patient.vitals.bpDiastolic}</span>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-2 text-amber-600 mb-1">
                          <Thermometer className="h-3.5 w-3.5" /> <span className="text-[10px] font-bold uppercase">Temp</span>
                        </div>
                        <span className="text-xl font-bold text-slate-800">{patient.vitals.temperature}°C</span>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-2 text-teal-600 mb-1">
                          <Wind className="h-3.5 w-3.5" /> <span className="text-[10px] font-bold uppercase">SpO2</span>
                        </div>
                        <span className="text-xl font-bold text-slate-800">{patient.vitals.spO2}%</span>
                      </div>
                    </div>
                 </section>

                 <section className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Beaker className="h-4 w-4" /> Clinical Summary
                    </h3>
                    <div className="space-y-4">
                       <div>
                         <span className="text-xs font-semibold text-slate-500 uppercase block mb-1">Symptoms</span>
                         <div className="flex flex-wrap gap-2">
                           {patient.symptoms.map((s, i) => (
                             <span key={i} className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs text-slate-700">{s}</span>
                           ))}
                         </div>
                       </div>
                       <div>
                         <span className="text-xs font-semibold text-slate-500 uppercase block mb-1">History</span>
                         <p className="text-sm text-slate-700 leading-relaxed">{patient.history}</p>
                       </div>
                    </div>
                 </section>
              </div>

              <div className="xl:col-span-2 h-full">
                 <div className="bg-white rounded-xl border border-slate-200 shadow-sm h-full flex flex-col">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
                       <h3 className="font-bold text-slate-700 flex items-center gap-2">
                          <ClipboardEdit className="h-5 w-5" /> Consultation Notes
                       </h3>
                       <span className="text-xs text-slate-400">Auto-saved</span>
                    </div>
                    <textarea
                       className="w-full flex-1 p-6 text-sm text-slate-700 focus:outline-none resize-none leading-relaxed"
                       placeholder="Type your clinical observations, examination findings, and assessment here..."
                       value={clinicalNotes}
                       onChange={e => { setClinicalNotes(e.target.value); setDataChanged(true); }}
                    />
                    <div className="p-4 border-t border-slate-100 flex justify-end">
                       <button onClick={handleAnalyze} className="flex items-center gap-2 text-indigo-600 text-sm font-bold hover:bg-indigo-50 px-4 py-2 rounded transition-colors">
                          <BrainCircuit className="h-4 w-4" /> Analyze with AI
                       </button>
                    </div>
                 </div>
              </div>
           </div>
        )}

        {/* --- TAB: NURSE --- */}
        {activeTab === 'NURSE' && (
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-right-4 duration-300">
              {/* Column 1: Vitals Entry */}
              <div className="space-y-6">
                 <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-6 flex items-center gap-2">
                       <Activity className="h-5 w-5 text-rose-600" /> Update Vitals
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                       <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-500 uppercase">Heart Rate</label>
                          <input type="number" className="w-full p-2 border border-slate-300 rounded-lg" value={newVitals.heartRate} onChange={e => setNewVitals({...newVitals, heartRate: Number(e.target.value)})} />
                       </div>
                       <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-500 uppercase">Blood Pressure (Sys)</label>
                          <input type="number" className="w-full p-2 border border-slate-300 rounded-lg" value={newVitals.bpSystolic} onChange={e => setNewVitals({...newVitals, bpSystolic: Number(e.target.value)})} />
                       </div>
                       <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-500 uppercase">Temperature (°C)</label>
                          <input type="number" className="w-full p-2 border border-slate-300 rounded-lg" value={newVitals.temperature} onChange={e => setNewVitals({...newVitals, temperature: Number(e.target.value)})} />
                       </div>
                       <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-500 uppercase">SpO2 (%)</label>
                          <input type="number" className="w-full p-2 border border-slate-300 rounded-lg" value={newVitals.spO2} onChange={e => setNewVitals({...newVitals, spO2: Number(e.target.value)})} />
                       </div>
                    </div>

                    <button 
                       onClick={handleAnalyzeVitals}
                       disabled={analyzingVitals}
                       className="w-full py-3 bg-indigo-50 text-indigo-700 font-bold rounded-lg hover:bg-indigo-100 border border-indigo-200 mb-4 flex items-center justify-center gap-2"
                    >
                       {analyzingVitals ? <RefreshCw className="h-4 w-4 animate-spin" /> : <BrainCircuit className="h-4 w-4" />}
                       AI Risk Analysis
                    </button>

                    {vitalsAnalysis && (
                       <div className={`p-4 rounded-lg border mb-4 animate-in zoom-in ${
                          vitalsAnalysis.riskLevel === 'Critical' || vitalsAnalysis.riskLevel === 'High' ? 'bg-red-50 border-red-200' : 
                          vitalsAnalysis.riskLevel === 'Medium' ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'
                       }`}>
                          <div className="flex justify-between items-start mb-2">
                             <h4 className="font-bold text-sm text-slate-800 uppercase">Early Warning Score</h4>
                             <span className="text-lg font-bold">{vitalsAnalysis.riskScore}</span>
                          </div>
                          <p className="text-sm font-medium mb-1">{vitalsAnalysis.alertMessage}</p>
                          <p className="text-xs text-slate-600"><strong>Action:</strong> {vitalsAnalysis.clinicalAction}</p>
                       </div>
                    )}

                    <button 
                       onClick={handleSaveVitals}
                       className="w-full py-3 bg-rose-600 text-white font-bold rounded-lg hover:bg-rose-700 shadow-sm flex items-center justify-center gap-2"
                    >
                       <Save className="h-4 w-4" /> Save to Chart
                    </button>
                 </div>
              </div>

              {/* Column 2: Medications */}
              <div className="space-y-6">
                 <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-6 flex items-center gap-2">
                       <Syringe className="h-5 w-5 text-blue-600" /> Medication Administration
                    </h3>
                    
                    <div className="space-y-4">
                       {medications.filter(m => m.status === 'ACTIVE' || m.status === 'PENDING_DISPENSE' || m.status === 'COMPLETED').map(med => (
                          <div key={med.id} className="p-4 border border-slate-200 rounded-lg bg-slate-50 flex items-center justify-between">
                             <div>
                                <p className="font-bold text-slate-900">{med.name}</p>
                                <p className="text-xs text-slate-500">{med.dosage} • {med.frequency}</p>
                             </div>
                             {med.status === 'COMPLETED' ? (
                                <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full flex items-center gap-1">
                                   <CheckCircle2 className="h-3 w-3" /> Given
                                </span>
                             ) : (
                                <button 
                                   onClick={() => handleAdministerMed(med.id)}
                                   className="text-xs font-bold bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 shadow-sm"
                                >
                                   Administer
                                </button>
                             )}
                          </div>
                       ))}
                       {medications.length === 0 && <p className="text-slate-400 text-sm text-center">No active medications.</p>}
                    </div>
                 </div>

                 <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">Nursing Notes</h3>
                    <textarea className="w-full p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm h-32 resize-none" placeholder="Shift notes, observations..." />
                 </div>
              </div>
           </div>
        )}

        {/* --- TAB: CPOE (Doctors) --- */}
        {activeTab === 'CPOE' && (
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-right-4 duration-300">
              {/* Prescription Writer */}
              <div className="space-y-6">
                 <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Pill className="h-4 w-4" /> e-Prescription Writer
                 </h3>
                 
                 <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
                    <div className="relative">
                       <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Medication</label>
                       <Search className="absolute left-3 top-9 h-4 w-4 text-slate-400" />
                       <input 
                          type="text" 
                          className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-brand-500"
                          placeholder="Search drug..."
                          value={medSearch}
                          onChange={e => { setMedSearch(e.target.value); setShowMedDropdown(true); }}
                          onBlur={() => setTimeout(() => setShowMedDropdown(false), 200)}
                       />
                       {showMedDropdown && medSearch && (
                          <div className="absolute z-20 w-full bg-white border border-slate-200 rounded-lg shadow-xl mt-1 max-h-48 overflow-y-auto">
                             {MOCK_MEDICINES.filter(m => m.toLowerCase().includes(medSearch.toLowerCase())).map(m => (
                                <div key={m} className="px-4 py-2 hover:bg-slate-50 cursor-pointer text-sm" onClick={() => setMedSearch(m)}>
                                   {m}
                                </div>
                             ))}
                          </div>
                       )}
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                       <div>
                          <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Dosage</label>
                          <input type="text" className="w-full p-2 border border-slate-300 rounded-lg" placeholder="e.g. 500mg" value={newMed.dosage} onChange={e => setNewMed({...newMed, dosage: e.target.value})} />
                       </div>
                       <div>
                          <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Freq</label>
                          <select className="w-full p-2 border border-slate-300 rounded-lg bg-white" value={newMed.frequency} onChange={e => setNewMed({...newMed, frequency: e.target.value})}>
                             <option>OD</option>
                             <option>BD</option>
                             <option>TDS</option>
                             <option>QID</option>
                             <option>SOS</option>
                          </select>
                       </div>
                       <div>
                          <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Duration</label>
                          <input type="text" className="w-full p-2 border border-slate-300 rounded-lg" placeholder="e.g. 5 Days" value={newMed.duration} onChange={e => setNewMed({...newMed, duration: e.target.value})} />
                       </div>
                    </div>

                    {/* AI Safety Check Button */}
                    <button 
                       onClick={handleRunInteractionCheck}
                       disabled={!medSearch || checkingInteraction}
                       className="w-full py-2 bg-indigo-50 text-indigo-700 font-bold rounded-lg border border-indigo-200 hover:bg-indigo-100 flex items-center justify-center gap-2 text-xs"
                    >
                       {checkingInteraction ? <RefreshCw className="h-3 w-3 animate-spin" /> : <ShieldAlert className="h-3 w-3" />}
                       AI Safety Scan
                    </button>

                    {/* AI Warning Alert */}
                    {drugInteraction && (
                       <div className={`p-3 rounded text-xs border ${
                          drugInteraction.hasInteractions ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                       }`}>
                          {drugInteraction.hasInteractions ? (
                             <>
                                <strong className="block mb-1 flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Interactions Detected:</strong>
                                <ul className="list-disc list-inside">{drugInteraction.warnings.map((w, i) => <li key={i}>{w}</li>)}</ul>
                             </>
                          ) : (
                             <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> No contraindications found.</span>
                          )}
                       </div>
                    )}

                    <button onClick={handleAddMedication} className="w-full py-3 bg-brand-600 text-white font-bold rounded-lg hover:bg-brand-700 shadow-sm flex items-center justify-center gap-2">
                       <Plus className="h-4 w-4" /> Add to Chart
                    </button>
                 </div>

                 {/* Active Meds List */}
                 <div className="space-y-2">
                    {medications.map((med) => (
                       <div key={med.id} className="flex justify-between items-center p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                          <div>
                             <p className="font-bold text-slate-800 text-sm">{med.name}</p>
                             <p className="text-xs text-slate-500">{med.dosage} • {med.frequency} • {med.duration}</p>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${
                             med.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-100'
                          }`}>{med.status}</span>
                       </div>
                    ))}
                 </div>
              </div>

              {/* Lab Orders */}
              <div className="space-y-6">
                 <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <TestTube2 className="h-4 w-4" /> Lab Orders
                 </h3>
                 
                 <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex gap-4">
                    <div className="flex-1">
                       <input 
                          list="labTests"
                          type="text" 
                          className="w-full p-2 border border-slate-300 rounded-lg text-sm"
                          placeholder="Search Test (e.g. CBC)..."
                          value={labSearch}
                          onChange={e => setLabSearch(e.target.value)}
                       />
                       <datalist id="labTests">
                          {MOCK_LAB_TESTS.map(t => <option key={t} value={t} />)}
                       </datalist>
                    </div>
                    <button onClick={handleOrderLab} className="px-4 bg-slate-800 text-white rounded-lg text-sm font-bold hover:bg-slate-700">Order</button>
                 </div>

                 <div className="space-y-2">
                    {labOrders.map(order => (
                       <div key={order.id} className="flex justify-between items-center p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                          <div>
                             <p className="font-bold text-slate-800 text-sm">{order.testName}</p>
                             <p className="text-xs text-slate-500">{order.orderDate} • {order.orderedBy}</p>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${
                             order.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                             'bg-blue-50 text-blue-700 border-blue-100'
                          }`}>{order.status.replace('_', ' ')}</span>
                       </div>
                    ))}
                 </div>
              </div>
           </div>
        )}

        {/* --- TAB: AI INSIGHTS --- */}
        {activeTab === 'AI' && (
           <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {loading && (
                 <div className="p-12 text-center">
                    <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin mx-auto mb-4" />
                    <p className="text-indigo-600 font-medium">Generating Clinical Assessment...</p>
                 </div>
              )}
              
              {analysis && !loading && (
                 <>
                    <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-xl shadow-sm">
                       <h3 className="text-indigo-900 font-bold mb-2 flex items-center gap-2">
                          <BrainCircuit className="h-5 w-5" /> AI Clinical Summary
                       </h3>
                       <p className="text-indigo-800 text-sm leading-relaxed">{analysis.summary}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                          <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Differential Diagnosis</h4>
                          <ul className="space-y-2">
                             {analysis.differentialDiagnosis.map((d, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                   <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                                   {d}
                                </li>
                             ))}
                          </ul>
                       </div>
                       <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                          <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Recommended Labs</h4>
                          <div className="flex flex-wrap gap-2">
                             {analysis.recommendedLabs.map((lab, i) => (
                                <span key={i} className="px-3 py-1 bg-slate-50 text-slate-700 border border-slate-200 rounded-full text-sm font-medium">
                                   {lab}
                                </span>
                             ))}
                          </div>
                       </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                       <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Treatment Plan Suggestion</h4>
                       <div className="prose prose-sm max-w-none text-slate-700 bg-slate-50 p-4 rounded-lg border border-slate-100">
                          {analysis.treatmentPlan}
                       </div>
                    </div>
                 </>
              )}
           </div>
        )}

      </div>

      {/* Registry Modal */}
      {showRegistryModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
              <div className="bg-blue-600 p-4 text-white flex justify-between items-center">
                 <h3 className="font-bold flex items-center gap-2"><UploadCloud className="h-5 w-5" /> Report to State Registry</h3>
                 <button onClick={() => setShowRegistryModal(false)} className="text-white/80 hover:text-white"><X className="h-5 w-5" /></button>
              </div>
              <div className="p-6 space-y-4">
                 <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Registry Type</label>
                    <select className="w-full p-2 border border-slate-300 rounded-lg bg-white" value={registryType} onChange={e => setRegistryType(e.target.value)}>
                       <option value="TB">Tuberculosis (National TE Control)</option>
                       <option value="Cancer">National Cancer Registry</option>
                       <option value="HIV">HIV / AIDS (NACO)</option>
                       <option value="Vector Borne">Vector Borne (Malaria/Dengue)</option>
                       <option value="Maternal">Maternal & Child Health</option>
                    </select>
                 </div>
                 <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Clinical Diagnosis</label>
                    <input type="text" className="w-full p-2 border border-slate-300 rounded-lg" placeholder="e.g. Pulmonary TB" value={registryDiagnosis} onChange={e => setRegistryDiagnosis(e.target.value)} />
                 </div>
                 <div className="p-3 bg-blue-50 text-blue-800 text-xs rounded border border-blue-100">
                    <strong>Note:</strong> This data will be securely transmitted to the AP State Disease Surveillance Unit as per Notifiable Disease Act.
                 </div>
                 <button onClick={handleSubmitRegistry} disabled={!registryDiagnosis} className="w-full py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50">
                    Submit Report
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Admit Modal */}
      {showAdmitModal && (
         <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95">
               <div className="bg-purple-600 p-4 text-white flex justify-between items-center">
                  <h3 className="font-bold flex items-center gap-2"><BedDouble className="h-5 w-5" /> Admit Patient</h3>
                  <button onClick={() => setShowAdmitModal(false)} className="text-white/80 hover:text-white"><X className="h-5 w-5" /></button>
               </div>
               <div className="p-6 space-y-4">
                  <div>
                     <label className="block text-sm font-semibold text-slate-700 mb-1">Select Ward / Unit</label>
                     <select className="w-full p-2 border border-slate-300 rounded-lg bg-white" value={selectedWard} onChange={e => setSelectedWard(e.target.value)}>
                        <option>General Ward A</option>
                        <option>General Ward B</option>
                        <option>ICU - Medical</option>
                        <option>ICU - Surgical</option>
                        <option>Isolation Unit</option>
                        <option>Maternity Ward</option>
                     </select>
                  </div>
                  <button onClick={handleAdmitSubmit} className="w-full py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700">
                     Confirm Admission
                  </button>
               </div>
            </div>
         </div>
      )}

      {/* Referral Modal */}
      {showReferralModal && (
         <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
               <div className="bg-amber-600 p-4 text-white flex justify-between items-center">
                  <h3 className="font-bold flex items-center gap-2"><Ambulance className="h-5 w-5" /> Refer Patient</h3>
                  <button onClick={() => setShowReferralModal(false)} className="text-white/80 hover:text-white"><X className="h-5 w-5" /></button>
               </div>
               <div className="p-6 space-y-4">
                  <div>
                     <label className="block text-sm font-semibold text-slate-700 mb-1">Target Hospital</label>
                     <select className="w-full p-2 border border-slate-300 rounded-lg bg-white" value={referralTarget} onChange={e => setReferralTarget(e.target.value)}>
                        <option value="">-- Select Facility --</option>
                        {MOCK_HOSPITALS.map(h => (
                           <option key={h.id} value={h.name}>{h.name} ({h.type})</option>
                        ))}
                     </select>
                  </div>
                  <div>
                     <label className="block text-sm font-semibold text-slate-700 mb-1">Reason for Referral</label>
                     <textarea className="w-full p-2 border border-slate-300 rounded-lg h-24 resize-none" placeholder="e.g. Requires Ventilator support / Neurosurgery..." value={referralReason} onChange={e => setReferralReason(e.target.value)} />
                  </div>
                  <div className="bg-amber-50 p-3 rounded border border-amber-100 text-xs text-amber-800">
                     <strong>Note:</strong> This will alert the 108 Ambulance Service and the State Bed Bureau automatically.
                  </div>
                  <button onClick={handleReferralSubmit} disabled={!referralTarget || !referralReason} className="w-full py-2 bg-amber-600 text-white font-bold rounded-lg hover:bg-amber-700 disabled:opacity-50">
                     Initiate Transfer
                  </button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};
