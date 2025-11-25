
import React, { useState } from 'react';
import { Patient, TriageLevel, VisitType, PatientStatus, Vitals } from '../types';
import { UserPlus, AlertCircle, Stethoscope, Save, Ticket, Users, Activity, X } from 'lucide-react';

interface FrontDeskProps {
  onRegister: (patient: Patient) => void;
}

export const FrontDesk: React.FC<FrontDeskProps> = ({ onRegister }) => {
  const [mode, setMode] = useState<'OPD' | 'EMERGENCY'>('OPD');
  const [registrationSuccess, setRegistrationSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<Patient>>({
    name: '',
    age: 0,
    gender: 'Male',
    abhaId: '',
    symptoms: [],
    history: '',
    ward: '',
    triageLevel: TriageLevel.STANDARD,
    isTelemedicine: false,
    hospitalId: 'H-AP-001'
  });

  const [vitals, setVitals] = useState<Vitals>({
    heartRate: 0,
    bpSystolic: 0,
    bpDiastolic: 0,
    temperature: 0,
    spO2: 0,
    respRate: 0
  });

  const [tempSymptom, setTempSymptom] = useState('');
  const [specialty, setSpecialty] = useState('General Medicine');

  // Simple rule-based Triage AI for Emergency
  const calculateTriage = () => {
    if (vitals.spO2 > 0 && vitals.spO2 < 90) return TriageLevel.CRITICAL;
    if (vitals.heartRate > 120 || vitals.heartRate < 40) return TriageLevel.CRITICAL;
    if (vitals.bpSystolic > 180 || vitals.bpSystolic < 90) return TriageLevel.CRITICAL;
    if (vitals.temperature > 39.5) return TriageLevel.URGENT;
    return TriageLevel.STANDARD;
  };

  const handleRegister = () => {
    if (!formData.name || !formData.age) return;

    // AI Triage Check for Emergency
    const calculatedTriage = mode === 'EMERGENCY' ? calculateTriage() : TriageLevel.STANDARD;

    const newPatient: Patient = {
      ...formData as Patient,
      id: `P-AP-${Math.floor(Math.random() * 100000)}`,
      admissionDate: new Date().toISOString().split('T')[0],
      vitals: vitals,
      labResults: [],
      medications: [],
      symptoms: formData.symptoms || [],
      visitType: mode === 'EMERGENCY' ? VisitType.EMERGENCY : VisitType.OPD,
      status: mode === 'EMERGENCY' ? PatientStatus.TRIAGED : PatientStatus.REGISTERED,
      triageLevel: calculatedTriage,
      tokenNumber: mode === 'OPD' ? `OPD-${Math.floor(Math.random() * 100)}` : undefined,
      ward: mode === 'EMERGENCY' ? 'Casualty Triage' : 'Waiting Area',
    };

    onRegister(newPatient);
    
    // Show Success & Reset
    setRegistrationSuccess(newPatient.tokenNumber || 'Emergency Admitted');
    setTimeout(() => setRegistrationSuccess(null), 3000);

    setFormData({
      name: '', age: 0, gender: 'Male', abhaId: '', symptoms: [], history: '', 
      ward: '', triageLevel: TriageLevel.STANDARD, isTelemedicine: false, hospitalId: 'H-AP-001'
    });
    setVitals({ heartRate: 0, bpSystolic: 0, bpDiastolic: 0, temperature: 0, spO2: 0, respRate: 0 });
  };

  const handleAddSymptom = () => {
    if (tempSymptom) {
      setFormData(prev => ({ ...prev, symptoms: [...(prev.symptoms || []), tempSymptom] }));
      setTempSymptom('');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Mode Switcher */}
      <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto mb-8">
        <button 
          onClick={() => setMode('OPD')}
          className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
            mode === 'OPD' 
              ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md transform scale-105' 
              : 'border-slate-200 bg-white text-slate-500 hover:border-blue-200'
          }`}
        >
          <Ticket className="h-6 w-6" />
          <span className="font-bold">OPD Registration</span>
        </button>
        <button 
          onClick={() => setMode('EMERGENCY')}
          className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
            mode === 'EMERGENCY' 
              ? 'border-red-500 bg-red-50 text-red-700 shadow-md transform scale-105' 
              : 'border-slate-200 bg-white text-slate-500 hover:border-red-200'
          }`}
        >
          <AlertCircle className="h-6 w-6" />
          <span className="font-bold">Emergency / Casualty</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden max-w-5xl mx-auto">
        {/* Header */}
        <div className={`px-8 py-6 border-b flex justify-between items-center ${
           mode === 'EMERGENCY' ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-100'
        }`}>
          <div>
            <h2 className={`text-xl font-bold flex items-center gap-2 ${
               mode === 'EMERGENCY' ? 'text-red-700' : 'text-slate-800'
            }`}>
              {mode === 'EMERGENCY' ? <Activity className="h-6 w-6" /> : <UserPlus className="h-6 w-6" />}
              {mode === 'EMERGENCY' ? 'Emergency Intake & Triage' : 'New Patient Registration'}
            </h2>
            <p className="text-sm opacity-70 mt-1">
               {mode === 'EMERGENCY' ? 'Fast-track registration for critical trauma/acute cases.' : 'Standard token generation for outpatient consultation.'}
            </p>
          </div>
          {registrationSuccess && (
             <div className="bg-green-100 text-green-800 px-6 py-2 rounded-full font-bold animate-in fade-in slide-in-from-top-4 shadow-sm border border-green-200 flex items-center gap-2">
                <Ticket className="h-4 w-4" /> Token Generated: {registrationSuccess}
             </div>
          )}
        </div>

        <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
           
           {/* Column 1: Demographics */}
           <div className="lg:col-span-2 space-y-6">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">Patient Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                    <input type="text" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" placeholder="e.g. Rahul Kumar" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                 </div>
                 <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Age <span className="text-red-500">*</span></label>
                    <input type="number" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" value={formData.age || ''} onChange={e => setFormData({...formData, age: Number(e.target.value)})} />
                 </div>
                 <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Gender</label>
                    <select className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value as any})}>
                       <option value="Male">Male</option>
                       <option value="Female">Female</option>
                       <option value="Other">Other</option>
                    </select>
                 </div>
                 <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-1">ABHA ID (Health ID)</label>
                    <input type="text" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none font-mono" placeholder="91-XXXX-XXXX-XXXX" value={formData.abhaId} onChange={e => setFormData({...formData, abhaId: e.target.value})} />
                 </div>
              </div>

              <div className="pt-4">
                 <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2 mb-4">Clinical Context</h3>
                 <div className="mb-4">
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Primary Complaints / Symptoms</label>
                    <div className="flex gap-2 mb-2">
                       <input type="text" className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm" placeholder="Add symptom (e.g. Chest Pain)..." value={tempSymptom} onChange={e => setTempSymptom(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddSymptom()} />
                       <button onClick={handleAddSymptom} className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-200">Add</button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                       {formData.symptoms?.map((s, i) => (
                          <span key={i} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-100 flex items-center gap-1">
                             {s} <button onClick={() => setFormData({...formData, symptoms: formData.symptoms?.filter((_, idx) => idx !== i)})}><X className="h-3 w-3 hover:text-red-500" /></button>
                          </span>
                       ))}
                    </div>
                 </div>

                 {mode === 'OPD' && (
                    <div>
                       <label className="block text-sm font-semibold text-slate-700 mb-1">Department / Specialty</label>
                       <select className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white" value={specialty} onChange={e => setSpecialty(e.target.value)}>
                          <option value="General Medicine">General Medicine</option>
                          <option value="Cardiology">Cardiology</option>
                          <option value="Orthopedics">Orthopedics</option>
                          <option value="Pediatrics">Pediatrics</option>
                          <option value="Gynecology">Gynecology</option>
                          <option value="Dermatology">Dermatology</option>
                       </select>
                    </div>
                 )}
              </div>
           </div>

           {/* Column 2: Vitals & Triage (Critical for Emergency) */}
           <div className={`rounded-xl p-6 ${mode === 'EMERGENCY' ? 'bg-red-50 border border-red-100' : 'bg-slate-50 border border-slate-100'}`}>
              <h3 className={`text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2 ${
                 mode === 'EMERGENCY' ? 'text-red-700' : 'text-slate-500'
              }`}>
                 <Stethoscope className="h-4 w-4" /> Vitals & Triage
              </h3>
              
              <div className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="text-xs font-bold text-slate-500 uppercase">Heart Rate</label>
                       <div className="flex items-center gap-2">
                          <input type="number" className="w-full p-2 border border-slate-300 rounded-lg text-sm" placeholder="bpm" value={vitals.heartRate || ''} onChange={e => setVitals({...vitals, heartRate: Number(e.target.value)})} />
                       </div>
                    </div>
                    <div>
                       <label className="text-xs font-bold text-slate-500 uppercase">SpO2 (%)</label>
                       <input type="number" className="w-full p-2 border border-slate-300 rounded-lg text-sm" placeholder="%" value={vitals.spO2 || ''} onChange={e => setVitals({...vitals, spO2: Number(e.target.value)})} />
                    </div>
                    <div>
                       <label className="text-xs font-bold text-slate-500 uppercase">BP (Sys)</label>
                       <input type="number" className="w-full p-2 border border-slate-300 rounded-lg text-sm" placeholder="mmHg" value={vitals.bpSystolic || ''} onChange={e => setVitals({...vitals, bpSystolic: Number(e.target.value)})} />
                    </div>
                    <div>
                       <label className="text-xs font-bold text-slate-500 uppercase">Temp (°C)</label>
                       <input type="number" className="w-full p-2 border border-slate-300 rounded-lg text-sm" placeholder="°C" value={vitals.temperature || ''} onChange={e => setVitals({...vitals, temperature: Number(e.target.value)})} />
                    </div>
                 </div>

                 {mode === 'EMERGENCY' && (
                    <div className="mt-6 pt-6 border-t border-red-200">
                       <label className="block text-xs font-bold text-red-700 uppercase mb-2">AI Estimated Triage Score</label>
                       <div className={`p-3 rounded-lg text-center font-bold border-2 ${
                          calculateTriage() === TriageLevel.CRITICAL ? 'bg-red-100 text-red-800 border-red-300' :
                          calculateTriage() === TriageLevel.URGENT ? 'bg-amber-100 text-amber-800 border-amber-300' :
                          'bg-emerald-100 text-emerald-800 border-emerald-300'
                       }`}>
                          {calculateTriage()}
                       </div>
                       <p className="text-xs text-red-600 mt-2 text-center">
                          Based on entered vitals. Verify manually.
                       </p>
                    </div>
                 )}
              </div>
           </div>
        </div>

        {/* Footer Actions */}
        <div className="px-8 py-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-4">
           <button className="px-6 py-3 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors">Clear Form</button>
           <button 
              onClick={handleRegister}
              disabled={!formData.name || !formData.age}
              className={`px-8 py-3 text-white font-bold rounded-lg shadow-lg flex items-center gap-2 transform active:scale-95 transition-all ${
                 mode === 'EMERGENCY' 
                   ? 'bg-red-600 hover:bg-red-700 shadow-red-200' 
                   : 'bg-brand-600 hover:bg-brand-700 shadow-brand-200'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
           >
              {mode === 'EMERGENCY' ? <Activity className="h-5 w-5" /> : <Save className="h-5 w-5" />}
              {mode === 'EMERGENCY' ? 'Admit to Casualty' : 'Generate Token'}
           </button>
        </div>
      </div>
    </div>
  );
};
