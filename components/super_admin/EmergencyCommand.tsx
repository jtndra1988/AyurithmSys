
import React, { useState, useEffect } from 'react';
import { MOCK_AMBULANCES, MOCK_INCIDENTS } from '../../constants';
import { Ambulance, EmergencyIncident, DispatchPlan } from '../../types';
import { getDispatchAdvice } from '../../services/geminiService';
import { 
  Map, Phone, Ambulance as AmbulanceIcon, AlertTriangle, Navigation, 
  Clock, CheckCircle, BrainCircuit, Radio
} from 'lucide-react';

export const EmergencyCommand: React.FC = () => {
  const [ambulances, setAmbulances] = useState<Ambulance[]>(MOCK_AMBULANCES);
  const [incidents, setIncidents] = useState<EmergencyIncident[]>(MOCK_INCIDENTS);
  const [selectedIncident, setSelectedIncident] = useState<EmergencyIncident | null>(null);
  const [dispatchPlan, setDispatchPlan] = useState<DispatchPlan | null>(null);
  const [isDispatching, setIsDispatching] = useState(false);

  // Simulate GPS movement
  useEffect(() => {
    const interval = setInterval(() => {
      setAmbulances(prev => prev.map(amb => ({
        ...amb,
        currentLat: amb.currentLat + (Math.random() - 0.5) * 0.001,
        currentLng: amb.currentLng + (Math.random() - 0.5) * 0.001
      })));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectIncident = async (incident: EmergencyIncident) => {
    setSelectedIncident(incident);
    setDispatchPlan(null);
    
    if (incident.status === 'NEW') {
      // Auto-calc best ambulance
      const available = ambulances.filter(a => a.status === 'AVAILABLE');
      if (available.length > 0) {
        const advice = await getDispatchAdvice(incident, available);
        setDispatchPlan(advice);
      }
    }
  };

  const confirmDispatch = () => {
    if (!selectedIncident || !dispatchPlan) return;
    setIsDispatching(true);
    
    setTimeout(() => {
      // Update Ambulance Status
      setAmbulances(prev => prev.map(a => 
        a.id === dispatchPlan.recommendedAmbulanceId 
          ? { ...a, status: 'DISPATCHED', assignedIncidentId: selectedIncident.id } 
          : a
      ));
      
      // Update Incident Status
      setIncidents(prev => prev.map(i => 
        i.id === selectedIncident.id ? { ...i, status: 'ASSIGNED' } : i
      ));
      
      setIsDispatching(false);
      alert(`Unit ${dispatchPlan.recommendedAmbulanceId} dispatched to ${selectedIncident.location}`);
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-slate-900 p-6 rounded-2xl text-white shadow-xl flex justify-between items-center">
         <div>
            <h2 className="text-2xl font-bold flex items-center gap-3 mb-1">
               <Radio className="h-8 w-8 text-red-500 animate-pulse" /> 108 Emergency Command
            </h2>
            <p className="text-slate-400 text-sm">
               Statewide Emergency Response Center (ERC). Live GPS Tracking & AI Dispatch.
            </p>
         </div>
         <div className="flex gap-4">
            <div className="bg-white/10 px-4 py-2 rounded-lg text-center border border-white/10">
               <p className="text-xs text-slate-400 uppercase font-bold">Active Fleet</p>
               <p className="text-2xl font-bold text-white">{ambulances.length}</p>
            </div>
            <div className="bg-red-500/20 px-4 py-2 rounded-lg text-center border border-red-500/50">
               <p className="text-xs text-red-300 uppercase font-bold">Open Incidents</p>
               <p className="text-2xl font-bold text-red-400">{incidents.filter(i => i.status === 'NEW').length}</p>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
         
         {/* Left: Incident Feed */}
         <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-slate-700 flex justify-between">
               <span>Incoming Distress Calls</span>
               <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">Live Feed</span>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
               {incidents.map(incident => (
                  <div 
                     key={incident.id}
                     onClick={() => handleSelectIncident(incident)}
                     className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedIncident?.id === incident.id 
                           ? 'bg-slate-800 text-white border-slate-700' 
                           : 'bg-white hover:bg-slate-50 border-slate-200'
                     }`}
                  >
                     <div className="flex justify-between items-start mb-2">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${
                           incident.severity === 'Critical' ? 'bg-red-500 text-white' : 
                           incident.severity === 'High' ? 'bg-orange-500 text-white' : 'bg-yellow-500 text-white'
                        }`}>
                           {incident.type} • {incident.severity}
                        </span>
                        <span className="text-xs opacity-70 font-mono">{incident.reportedTime}</span>
                     </div>
                     <p className="font-bold text-sm mb-1">{incident.location}</p>
                     <p className="text-xs opacity-70 mb-2">{incident.district}</p>
                     <div className="flex items-center gap-2 text-xs">
                        <Phone className="h-3 w-3" /> {incident.callerPhone}
                     </div>
                     {incident.status === 'ASSIGNED' && (
                        <div className="mt-2 pt-2 border-t border-white/10 flex items-center gap-2 text-emerald-400 text-xs font-bold">
                           <CheckCircle className="h-3 w-3" /> Unit Dispatched
                        </div>
                     )}
                  </div>
               ))}
            </div>
         </div>

         {/* Center: Map Visualization (Mock) */}
         <div className="lg:col-span-2 bg-slate-800 rounded-xl shadow-lg relative overflow-hidden flex flex-col">
            {/* Map Placeholder */}
            <div className="flex-1 bg-[#1a202c] relative">
               {/* Grid Lines */}
               <div className="absolute inset-0" style={{
                  backgroundImage: 'linear-gradient(#2d3748 1px, transparent 1px), linear-gradient(90deg, #2d3748 1px, transparent 1px)',
                  backgroundSize: '40px 40px'
               }}></div>
               
               {/* Render Ambulances */}
               {ambulances.map(amb => (
                  <div 
                     key={amb.id}
                     className="absolute transition-all duration-[3000ms] ease-linear flex flex-col items-center"
                     style={{ 
                        left: `${((amb.currentLng - 78) * 15) % 100}%`, 
                        top: `${((19 - amb.currentLat) * 15) % 100}%` 
                     }}
                  >
                     <div className={`p-1.5 rounded-full shadow-lg ${
                        amb.status === 'AVAILABLE' ? 'bg-emerald-500' : 
                        amb.status === 'DISPATCHED' ? 'bg-amber-500 animate-pulse' : 'bg-blue-500'
                     }`}>
                        <AmbulanceIcon className="h-4 w-4 text-white" />
                     </div>
                     <span className="text-[10px] text-white bg-black/50 px-1 rounded mt-1 whitespace-nowrap">{amb.vehicleNumber}</span>
                  </div>
               ))}

               {/* Render Incidents */}
               {incidents.filter(i => i.status === 'NEW').map(inc => (
                  <div 
                     key={inc.id}
                     className="absolute animate-bounce"
                     style={{ 
                        left: `${((inc.lng - 78) * 15) % 100}%`, 
                        top: `${((19 - inc.lat) * 15) % 100}%` 
                     }}
                  >
                     <AlertTriangle className="h-6 w-6 text-red-500 drop-shadow-lg" />
                  </div>
               ))}
            </div>

            {/* Dispatch Control Panel */}
            {selectedIncident && selectedIncident.status === 'NEW' && (
               <div className="bg-slate-900 p-4 border-t border-slate-700 flex items-center justify-between animate-in slide-in-from-bottom-4">
                  <div className="flex items-center gap-4">
                     <div className="p-3 bg-indigo-500/20 rounded-lg border border-indigo-500/30">
                        <BrainCircuit className="h-6 w-6 text-indigo-400" />
                     </div>
                     <div>
                        <p className="text-indigo-300 text-xs font-bold uppercase">AI Recommendation</p>
                        {dispatchPlan ? (
                           <div>
                              <p className="text-white font-bold text-sm">
                                 Assign {ambulances.find(a => a.id === dispatchPlan.recommendedAmbulanceId)?.vehicleNumber}
                              </p>
                              <p className="text-slate-400 text-xs flex items-center gap-2">
                                 <Clock className="h-3 w-3" /> ETA: {dispatchPlan.estimatedEta} • {dispatchPlan.routeSummary}
                              </p>
                           </div>
                        ) : (
                           <span className="text-slate-500 text-sm">Calculating route...</span>
                        )}
                     </div>
                  </div>
                  
                  <div className="flex gap-3">
                     <button 
                        onClick={() => setSelectedIncident(null)}
                        className="px-4 py-2 text-slate-400 hover:text-white text-sm font-bold"
                     >
                        Ignore
                     </button>
                     <button 
                        onClick={confirmDispatch}
                        disabled={!dispatchPlan || isDispatching}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-bold shadow-lg flex items-center gap-2 transition-all disabled:opacity-50"
                     >
                        {isDispatching ? <Navigation className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
                        {isDispatching ? 'Dispatching...' : 'Dispatch Unit'}
                     </button>
                  </div>
               </div>
            )}
         </div>
      </div>
    </div>
  );
};
