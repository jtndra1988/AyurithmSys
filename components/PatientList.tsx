import React from 'react';
import { Patient, TriageLevel } from '../types';
import { MOCK_PATIENTS } from '../constants';
import { Search, Filter, ChevronRight } from 'lucide-react';

interface PatientListProps {
  onSelectPatient: (patient: Patient) => void;
}

export const PatientList: React.FC<PatientListProps> = ({ onSelectPatient }) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by Name, ABHA ID..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
          />
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50">
            <Filter className="h-4 w-4" />
            Filter Status
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th className="px-6 py-4">Patient</th>
              <th className="px-6 py-4">Status / Triage</th>
              <th className="px-6 py-4">Location</th>
              <th className="px-6 py-4">Vitals Summary</th>
              <th className="px-6 py-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {MOCK_PATIENTS.map((patient) => (
              <tr 
                key={patient.id} 
                className="hover:bg-slate-50 transition-colors cursor-pointer group"
                onClick={() => onSelectPatient(patient)}
              >
                <td className="px-6 py-4">
                  <div>
                    <p className="font-semibold text-slate-900">{patient.name}</p>
                    <p className="text-xs text-slate-500">{patient.age}y / {patient.gender}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                    ${patient.triageLevel === TriageLevel.CRITICAL ? 'bg-red-50 text-red-700 border-red-200' : 
                      patient.triageLevel === TriageLevel.URGENT ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                      'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                    {patient.triageLevel}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-slate-700">{patient.ward}</p>
                  {patient.isTelemedicine && <span className="text-xs text-blue-600 font-medium">Remote/Video</span>}
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-4 text-xs text-slate-600">
                    <span title="Heart Rate">HR: {patient.vitals.heartRate}</span>
                    <span title="SpO2">SpO2: {patient.vitals.spO2}%</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-brand-600 hover:bg-brand-50 p-2 rounded-full transition-colors group-hover:bg-white border border-transparent group-hover:border-slate-200">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};