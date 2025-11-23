import React, { useState } from 'react';
import { Patient, AIAnalysisResult, TriageLevel, GenomicMarker } from '../types';
import { getClinicalAssessment } from '../services/geminiService';
import { 
  Heart, 
  Thermometer, 
  Activity, 
  Wind, 
  Dna, 
  BrainCircuit, 
  AlertCircle,
  CheckCircle2,
  X,
  Plus,
  Save,
  Trash2,
  AlertTriangle,
  RefreshCw,
  Beaker,
  FileText,
  ClipboardEdit
} from 'lucide-react';

interface PatientDetailProps {
  patient: Patient;
  onClose: () => void;
}

export const PatientDetail: React.FC<PatientDetailProps> = ({ patient, onClose }) => {
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Local state for genomics to allow adding new markers
  const [genomicsList, setGenomicsList] = useState<GenomicMarker[]>(patient.genomics || []);
  const [showAddGenomic, setShowAddGenomic] = useState(false);
  const [dataChanged, setDataChanged] = useState(false); // Track if data changed since last analysis
  const [newMarker, setNewMarker] = useState<GenomicMarker>({
    gene: '',
    variant: '',
    significance: '',
    pharmacogenomics: ''
  });
  
  // State for clinical notes
  const [clinicalNotes, setClinicalNotes] = useState('');

  const handleAnalyze = async () => {
    setLoading(true);
    // Include the locally added genomics and notes in the analysis
    const patientData = { ...patient, genomics: genomicsList };
    const result = await getClinicalAssessment(patientData, clinicalNotes);
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

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setClinicalNotes(e.target.value);
    setDataChanged(true);
  };

  const getTriageColor = (level: TriageLevel) => {
    switch(level) {
      case TriageLevel.CRITICAL: return 'bg-red-100 text-red-700 border-red-200 ring-red-500';
      case TriageLevel.URGENT: return 'bg-amber-100 text-amber-700 border-amber-200 ring-amber-500';
      default: return 'bg-emerald-100 text-emerald-700 border-emerald-200 ring-emerald-500';
    }
  };

  const getSignificanceStyles = (sig: string) => {
    const s = sig.toLowerCase();
    if (s.includes('high') || s.includes('poor') || s.includes('risk') || s.includes('critical')) {
      return { bg: 'bg-red-50', border: 'border-red-100', text: 'text-red-800', badge: 'bg-red-100 text-red-700' };
    }
    if (s.includes('moderate') || s.includes('intermediate') || s.includes('reduced')) {
      return { bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-800', badge: 'bg-amber-100 text-amber-700' };
    }
    return { bg: 'bg-slate-50', border: 'border-slate-100', text: 'text-slate-700', badge: 'bg-slate-100 text-slate-600' };
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
          </div>
          <div className="flex items-center gap-3 mt-1 text-sm text-slate-500 font-medium">
            <span>{patient.age} years</span>
            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
            <span>{patient.gender}</span>
            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
            <span>ID: <span className="font-mono text-slate-600">{patient.id}</span></span>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
          <X className="h-6 w-6" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Left Column: Vitals & History */}
          <div className="space-y-8">
            <section>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Activity className="h-4 w-4" /> Live Vitals
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 hover:border-blue-200 transition-colors">
                  <div className="flex items-center gap-2 text-blue-600 mb-2">
                    <Heart className="h-4 w-4" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Heart Rate</span>
                  </div>
                  <span className="text-2xl font-bold text-slate-800">{patient.vitals.heartRate} <span className="text-sm font-normal text-slate-400">bpm</span></span>
                </div>
                <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-100 hover:border-rose-200 transition-colors">
                  <div className="flex items-center gap-2 text-rose-600 mb-2">
                    <Activity className="h-4 w-4" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">BP</span>
                  </div>
                  <span className="text-2xl font-bold text-slate-800">{patient.vitals.bpSystolic}/{patient.vitals.bpDiastolic}</span>
                </div>
                <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100 hover:border-amber-200 transition-colors">
                  <div className="flex items-center gap-2 text-amber-600 mb-2">
                    <Thermometer className="h-4 w-4" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Temp</span>
                  </div>
                  <span className="text-2xl font-bold text-slate-800">{patient.vitals.temperature}°C</span>
                </div>
                <div className="bg-teal-50/50 p-4 rounded-xl border border-teal-100 hover:border-teal-200 transition-colors">
                  <div className="flex items-center gap-2 text-teal-600 mb-2">
                    <Wind className="h-4 w-4" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">SpO2</span>
                  </div>
                  <span className="text-2xl font-bold text-slate-800">{patient.vitals.spO2}%</span>
                </div>
              </div>
            </section>

            <section>
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                 <Beaker className="h-4 w-4" /> Clinical Context
               </h3>
               <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase block mb-1">Presenting Symptoms</span>
                    <div className="flex flex-wrap gap-2">
                      {patient.symptoms.map((s, i) => (
                        <span key={i} className="px-2.5 py-1 bg-white border border-slate-200 rounded text-sm text-slate-700 shadow-sm">{s}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase block mb-1">Medical History</span>
                    <p className="text-sm text-slate-700 leading-relaxed bg-white border border-slate-200 p-3 rounded-lg shadow-sm">{patient.history}</p>
                  </div>
               </div>
            </section>

            {/* Doctor's Notes Section */}
            <section>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <ClipboardEdit className="h-4 w-4" /> Doctor's Clinical Notes
              </h3>
              <div className="relative">
                <textarea
                  className="w-full h-32 p-3 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow resize-none placeholder:text-slate-400"
                  placeholder="Enter clinical observations, notes from physical exam, or specific questions for the AI analysis..."
                  value={clinicalNotes}
                  onChange={handleNotesChange}
                />
                <div className="absolute bottom-3 right-3 text-[10px] text-slate-400 pointer-events-none">
                  AI will consider this context
                </div>
              </div>
            </section>

            {/* Genomics Section */}
            <section className="bg-white rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-purple-600 uppercase tracking-wider flex items-center gap-2">
                  <Dna className="h-4 w-4" /> Genomic Profile
                </h3>
                <button 
                  onClick={() => setShowAddGenomic(!showAddGenomic)}
                  className={`text-xs flex items-center gap-1 px-3 py-1.5 rounded-md transition-all font-medium ${
                    showAddGenomic 
                      ? 'bg-slate-100 text-slate-600' 
                      : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-100'
                  }`}
                >
                  {showAddGenomic ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                  {showAddGenomic ? 'Cancel' : 'Add Marker'}
                </button>
              </div>

              {/* Add Genomic Marker Form */}
              {showAddGenomic && (
                <div className="mb-6 p-4 bg-purple-50/50 border border-purple-100 rounded-xl animate-in slide-in-from-top-2 duration-300">
                  <h4 className="text-sm font-bold text-purple-900 mb-3">Add New Genomic Variant</h4>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="group">
                      <label className="block text-[10px] font-bold text-purple-400 uppercase tracking-wider mb-1">Gene</label>
                      <input 
                        type="text" 
                        placeholder="e.g. CYP2C19"
                        className="w-full text-sm border-slate-200 rounded-lg p-2 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all placeholder:text-slate-400"
                        value={newMarker.gene}
                        onChange={e => setNewMarker({...newMarker, gene: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-purple-400 uppercase tracking-wider mb-1">Variant</label>
                      <input 
                        type="text" 
                        placeholder="e.g. *2/*3"
                        className="w-full text-sm border-slate-200 rounded-lg p-2 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all placeholder:text-slate-400"
                        value={newMarker.variant}
                        onChange={e => setNewMarker({...newMarker, variant: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="block text-[10px] font-bold text-purple-400 uppercase tracking-wider mb-1">Significance</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Poor Metabolizer, High Risk"
                      className="w-full text-sm border-slate-200 rounded-lg p-2 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all placeholder:text-slate-400"
                      value={newMarker.significance}
                      onChange={e => setNewMarker({...newMarker, significance: e.target.value})}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-[10px] font-bold text-purple-400 uppercase tracking-wider mb-1">Pharmacogenomics</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Reduced metabolism of Clopidogrel"
                      className="w-full text-sm border-slate-200 rounded-lg p-2 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all placeholder:text-slate-400"
                      value={newMarker.pharmacogenomics}
                      onChange={e => setNewMarker({...newMarker, pharmacogenomics: e.target.value})}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={handleSaveMarker}
                      className="text-xs px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 shadow-sm shadow-purple-200 flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!newMarker.gene || !newMarker.variant}
                    >
                      <Save className="h-3.5 w-3.5" /> Save Marker
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {genomicsList.length === 0 ? (
                   <div className="p-6 bg-slate-50 border border-slate-200 border-dashed rounded-xl text-center">
                     <Dna className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                     <p className="text-sm text-slate-500 font-medium">No genomic markers recorded</p>
                     <p className="text-xs text-slate-400 mt-1">Add data to enhance AI precision</p>
                   </div>
                ) : (
                  genomicsList.map((g, idx) => {
                    const styles = getSignificanceStyles(g.significance);
                    return (
                      <div key={idx} className={`p-4 ${styles.bg} border ${styles.border} rounded-xl group relative transition-all hover:shadow-sm`}>
                         <button 
                            onClick={() => handleDeleteMarker(idx)}
                            className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity p-1"
                         >
                            <Trash2 className="h-3.5 w-3.5" />
                         </button>
                         <div className="flex items-start justify-between mb-2">
                           <div className="flex items-center gap-2">
                             <span className="font-bold text-slate-800 text-base">{g.gene}</span>
                             <span className="text-xs bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded font-mono">{g.variant}</span>
                           </div>
                         </div>
                         <div className="flex items-center gap-2 mb-2">
                           <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${styles.badge}`}>
                             {g.significance}
                           </span>
                         </div>
                         {g.pharmacogenomics && (
                           <div className="flex gap-2 mt-3 pt-3 border-t border-slate-200/50">
                             <AlertTriangle className={`h-3.5 w-3.5 ${styles.text} mt-0.5 flex-shrink-0`} />
                             <p className={`text-xs ${styles.text} leading-relaxed`}>{g.pharmacogenomics}</p>
                           </div>
                         )}
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          </div>

          {/* Right Column: AI Analysis */}
          <div className="xl:col-span-2 flex flex-col h-full">
            <div className="bg-slate-900 rounded-2xl p-1 shadow-lg mb-6 flex-shrink-0">
              <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl p-5 text-white flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <BrainCircuit className="h-5 w-5 text-indigo-200" />
                    AI Clinical Decision Support
                  </h3>
                  <p className="text-indigo-100 text-xs mt-1 opacity-90">Powered by Gemini 2.5 Medical Model</p>
                </div>
                <button 
                  onClick={handleAnalyze}
                  disabled={loading}
                  className={`px-5 py-2.5 rounded-lg font-semibold text-sm transition-all flex items-center gap-2 shadow-lg ${
                    loading 
                      ? 'bg-white/20 text-white/50 cursor-not-allowed' 
                      : dataChanged 
                        ? 'bg-amber-400 text-amber-900 hover:bg-amber-300 animate-pulse' 
                        : 'bg-white text-indigo-600 hover:bg-indigo-50'
                  }`}
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" /> Analyzing...
                    </>
                  ) : (
                    <>
                      <BrainCircuit className="h-4 w-4" /> 
                      {dataChanged ? 'Update Analysis' : 'Run Analysis'}
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-1">
              {!analysis ? (
                <div className="h-full border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 p-8 text-center bg-slate-50/50">
                  <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                     <BrainCircuit className="h-10 w-10 text-indigo-200" />
                  </div>
                  <p className="font-medium text-slate-600">No Analysis Generated</p>
                  <p className="text-sm mt-1 max-w-sm mx-auto">Click "Run Analysis" to generate real-time diagnostic insights, treatment plans, and risk assessments based on the patient's current vitals and genomic profile.</p>
                </div>
              ) : (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {/* Summary */}
                  <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-100 rounded-bl-full -mr-4 -mt-4 opacity-50"></div>
                    <h4 className="text-indigo-900 font-bold mb-3 text-sm uppercase tracking-wide flex items-center gap-2">
                      <FileText className="h-4 w-4" /> Clinical Summary
                    </h4>
                    <p className="text-indigo-900 leading-relaxed text-base relative z-10 font-medium">{analysis.summary}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Differential */}
                    <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                      <h4 className="text-slate-800 font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-wider border-b border-slate-100 pb-2">
                        <Activity className="h-4 w-4 text-rose-500" /> Differential Diagnosis
                      </h4>
                      <ul className="space-y-3">
                        {analysis.differentialDiagnosis.map((dx, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                            <span className="bg-rose-100 text-rose-700 text-xs font-bold px-2 py-0.5 rounded flex-shrink-0 mt-0.5">{i + 1}</span>
                            <span className="font-medium">{dx}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Plan */}
                    <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                      <h4 className="text-slate-800 font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-wider border-b border-slate-100 pb-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Recommended Plan
                      </h4>
                      <div className="text-sm text-slate-600 space-y-4">
                        <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-100">
                           <p className="text-emerald-900 leading-relaxed">{analysis.treatmentPlan}</p>
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1 mb-2">
                            <Beaker className="h-3 w-3" /> Labs Ordered
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {analysis.recommendedLabs.map((lab, i) => (
                              <span key={i} className="bg-white text-slate-700 text-xs px-3 py-1.5 rounded-full border border-slate-200 font-medium shadow-sm">{lab}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Risk Alert */}
                  <div className={`border-l-4 p-5 rounded-r-2xl shadow-sm flex items-start gap-4 transition-colors ${
                     analysis.riskAssessment.toLowerCase().includes('high') 
                     ? 'bg-red-50 border-red-500' 
                     : 'bg-amber-50 border-amber-400'
                  }`}>
                    <div className={`p-2 rounded-full flex-shrink-0 ${
                       analysis.riskAssessment.toLowerCase().includes('high') ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                    }`}>
                      <AlertCircle className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className={`font-bold text-sm uppercase tracking-wide mb-1 ${
                         analysis.riskAssessment.toLowerCase().includes('high') ? 'text-red-900' : 'text-amber-900'
                      }`}>
                        Risk Assessment
                      </h4>
                      <p className={`text-sm leading-relaxed ${
                         analysis.riskAssessment.toLowerCase().includes('high') ? 'text-red-800' : 'text-amber-800'
                      }`}>
                        {analysis.riskAssessment}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};