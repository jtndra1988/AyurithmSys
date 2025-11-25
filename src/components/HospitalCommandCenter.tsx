
import React, { useState, useEffect } from 'react';
import { MOCK_HOSPITALS, MOCK_PATIENTS } from '../constants';
import { getHospitalOperationsAnalysis, HospitalOpsAnalysis } from '../services/geminiService';
import { 
  Building2, Users, BedDouble, Activity, AlertCircle, 
  TrendingUp, Clock, DollarSign, CalendarCheck, BrainCircuit, Gauge
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const HospitalCommandCenter: React.FC = () => {
  // Simulate logged in as Admin of KGH (H-AP-001)
  const myHospital = MOCK_HOSPITALS[0]; 
  const myPatients = MOCK_PATIENTS.filter(p => p.hospitalId === myHospital.id);
  const [opsAnalysis, setOpsAnalysis] = useState<HospitalOpsAnalysis | null>(null);

  // Metrics
  const occupancy = Math.round((myHospital.activePatients / myHospital.bedCapacity) * 100);
  const criticalPatients = myPatients.filter(p => p.triageLevel === 'Critical').length;
  
  useEffect(() => {
    const fetchAnalysis = async () => {
      const metrics = {
        occupancy: `${occupancy}%`,
        erQueue: 48,
        criticalPatients: criticalPatients,
        revenue: "4.2L"
      };
      const result = await getHospitalOperationsAnalysis(metrics);
      setOpsAnalysis(result);
    };
    fetchAnalysis();
  }, []);

  const deptData = [
    { name: 'Cardio', patients: 120 },
    { name: 'Ortho', patients: 85 },
    { name: 'Neuro', patients: 60 },
    { name: 'Gen Med', patients: 200 },
    { name: 'Pediatrics', patients: 95 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Hospital Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
           <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <Building2 className="h-8 w-8" />
           </div>
           <div>
              <h2 className="text-2xl font-bold text-slate-800">{myHospital.name}</h2>
              <p className="text-sm text-slate-500">Superintendent: {myHospital.medicalSuperintendent}</p>
           </div>
        </div>
        <div className="text-right">
           <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Facility Status</span>
           <div className="flex items-center gap-2 mt-1">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-bold text-slate-700">Operational</span>
           </div>
        </div>
      </div>

      {/* AI Operations Director */}
      <div className="bg-gradient-to-r from-indigo-900 to-blue-900 rounded-xl p-6 text-white shadow-lg border border-blue-800 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
         <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
               <div className="p-2 bg-white/10 rounded-lg border border-white/20">
                  <BrainCircuit className="h-6 w-6 text-blue-300" />
               </div>
               <div>
                  <h3 className="text-lg font-bold">AI Operations Director</h3>
                  <p className="text-xs text-blue-300">Real-time facility optimization engine</p>
               </div>
            </div>
            
            {opsAnalysis ? (
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-black/20 p-4 rounded-lg border border-white/10 flex items-center gap-4">
                     <div className="p-3 bg-blue-500/20 rounded-full">
                        <Gauge className="h-6 w-6 text-blue-400" />
                     </div>
                     <div>
                        <p className="text-xs text-blue-200 uppercase font-bold">Efficiency Score</p>
                        <p className="text-2xl font-bold">{opsAnalysis.efficiencyScore}/100</p>
                     </div>
                  </div>
                  <div className="bg-black/20 p-4 rounded-lg border border-white/10">
                     <p className="text-xs text-amber-400 uppercase font-bold mb-1 flex items-center gap-2">
                        <AlertCircle className="h-3 w-3" /> Bottleneck Alert
                     </p>
                     <p className="text-sm font-medium leading-snug">{opsAnalysis.bottleneckAlert}</p>
                  </div>
                  <div className="bg-black/20 p-4 rounded-lg border border-white/10">
                     <p className="text-xs text-emerald-400 uppercase font-bold mb-1 flex items-center gap-2">
                        <Users className="h-3 w-3" /> Staffing Action
                     </p>
                     <p className="text-sm font-medium leading-snug">{opsAnalysis.staffingRecommendation}</p>
                  </div>
               </div>
            ) : (
               <div className="flex items-center justify-center gap-2 py-4 text-blue-200 text-sm">
                  <BrainCircuit className="h-4 w-4 animate-pulse" /> Analyzing hospital workflows...
               </div>
            )}
         </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
           <div className="flex justify-between items-start">
              <div>
                 <p className="text-xs font-bold text-slate-500 uppercase">Bed Occupancy</p>
                 <h3 className="text-3xl font-bold text-slate-900 mt-2">{occupancy}%</h3>
              </div>
              <BedDouble className={`h-6 w-6 ${occupancy > 90 ? 'text-red-500' : 'text-emerald-500'}`} />
           </div>
           <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4">
              <div className={`h-1.5 rounded-full ${occupancy > 90 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{width: `${occupancy}%`}}></div>
           </div>
           <p className="text-xs text-slate-400 mt-2">{myHospital.activePatients} / {myHospital.bedCapacity} Beds</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
           <div className="flex justify-between items-start">
              <div>
                 <p className="text-xs font-bold text-slate-500 uppercase">OPD Queue</p>
                 <h3 className="text-3xl font-bold text-slate-900 mt-2">48</h3>
              </div>
              <Users className="h-6 w-6 text-blue-500" />
           </div>
           <p className="text-xs text-slate-500 mt-4 flex items-center gap-1">
             <Clock className="h-3 w-3" /> Avg Wait: <span className="font-bold text-slate-700">22 mins</span>
           </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
           <div className="flex justify-between items-start">
              <div>
                 <p className="text-xs font-bold text-slate-500 uppercase">Daily Revenue</p>
                 <h3 className="text-3xl font-bold text-slate-900 mt-2">₹4.2L</h3>
              </div>
              <DollarSign className="h-6 w-6 text-emerald-500" />
           </div>
           <p className="text-xs text-emerald-600 mt-4 font-bold">↑ 8% vs yesterday</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
           <div className="flex justify-between items-start">
              <div>
                 <p className="text-xs font-bold text-slate-500 uppercase">Critical Care</p>
                 <h3 className="text-3xl font-bold text-slate-900 mt-2">{criticalPatients}</h3>
              </div>
              <Activity className="h-6 w-6 text-red-500" />
           </div>
           <p className="text-xs text-red-600 mt-4 font-bold">Active ICU Alerts</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Department Flow Chart */}
         <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-6">Patient Load by Department</h3>
            <div className="h-64 w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={deptData}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} />
                     <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                     <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                     <Tooltip cursor={{fill: 'transparent'}} />
                     <Bar dataKey="patients" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Alerts & Tasks */}
         <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4">Urgent Actions</h3>
            <div className="space-y-3">
               <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                  <div>
                     <h4 className="text-sm font-bold text-red-800">Ventilator Maintenance</h4>
                     <p className="text-xs text-red-600">ICU Bed 04 ventilator showing error codes.</p>
                  </div>
               </div>
               <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg flex gap-3">
                  <Clock className="h-5 w-5 text-amber-600 flex-shrink-0" />
                  <div>
                     <h4 className="text-sm font-bold text-amber-800">High OPD Wait Time</h4>
                     <p className="text-xs text-amber-600">General Medicine queue ({'>'}45) mins.</p>
                  </div>
               </div>
               <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg flex gap-3">
                  <CalendarCheck className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  <div>
                     <h4 className="text-sm font-bold text-blue-800">Staff Rostering</h4>
                     <p className="text-xs text-blue-600">Night shift schedule pending approval.</p>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};
