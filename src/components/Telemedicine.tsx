
import React, { useState, useRef, useEffect } from 'react';
import { MOCK_PATIENTS } from '../constants';
import { Patient } from '../types';
import { 
  Video, Mic, MicOff, VideoOff, PhoneOff, MessageSquare, FileText, Phone, Loader2, 
  Calendar, Clock, User, ChevronRight, History, AlertCircle, FileClock, ArrowLeft, CheckCircle2
} from 'lucide-react';
import { getTelemedicineSummary } from '../services/geminiService';

// Mock Schedule linked to existing patients
const APPOINTMENT_QUEUE = [
  { 
    id: 'APT-101', 
    time: '09:00 AM', 
    patientId: 'P-AP-1025', 
    type: 'Follow-up', 
    reason: 'Dengue Fever Monitoring',
    status: 'WAITING'
  },
  { 
    id: 'APT-102', 
    time: '09:30 AM', 
    patientId: 'P-AP-1024', 
    type: 'New Consult', 
    reason: 'Chest Pain Evaluation',
    status: 'WAITING'
  },
  { 
    id: 'APT-103', 
    time: '10:00 AM', 
    patientId: 'P-AP-1026', 
    type: 'Report Review', 
    reason: 'Post-TB Medication Review',
    status: 'COMPLETED'
  },
];

// Mock Medical History for Demo
const MOCK_HISTORY = [
  { date: '2023-09-12', type: 'OPD', diagnosis: 'Viral Pyrexia', doctor: 'Dr. V. Reddy', notes: 'Prescribed Paracetamol. Recovered in 3 days.' },
  { date: '2023-06-15', type: 'Lab', diagnosis: 'Routine Blood Work', doctor: 'Pathology', notes: 'HbA1c: 5.8% (Normal)' },
  { date: '2022-11-20', type: 'Emergency', diagnosis: 'Acute Gastritis', doctor: 'Dr. K. Rao', notes: 'Admitted for observation overnight.' }
];

export const Telemedicine: React.FC = () => {
  const [viewMode, setViewMode] = useState<'QUEUE' | 'CALL'>('QUEUE');
  const [activeAppointment, setActiveAppointment] = useState<any>(null);
  const [activePatient, setActivePatient] = useState<Patient | null>(null);

  // Video Call States
  const [summary, setSummary] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [callStatus, setCallStatus] = useState<'idle' | 'calling' | 'connected' | 'ended'>('idle');
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  const localVideoRef = useRef<HTMLVideoElement>(null);

  const mockTranscript = `
    Doctor: Good morning, ${activePatient?.name || 'Patient'}. I see you are joining for ${activeAppointment?.reason || 'consultation'}.
    Patient: Yes doctor, I've been feeling a bit better but still have some fatigue.
    Doctor: I see from your history you were treated for ${activePatient?.history || 'issues'} recently.
    Patient: Correct.
    Doctor: Let's review your latest vitals. Your SpO2 looks stable.
    Patient: That's good to hear.
    Doctor: I'll prescribe some supplements for the fatigue.
  `;

  useEffect(() => {
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [localStream]);

  const handleStartConsult = (appointment: any) => {
    const patient = MOCK_PATIENTS.find(p => p.id === appointment.patientId);
    if (patient) {
      setActiveAppointment(appointment);
      setActivePatient(patient);
      setViewMode('CALL');
      setCallStatus('idle');
      setSummary('');
    }
  };

  const startCall = async () => {
    try {
      setCallStatus('calling');
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      setTimeout(() => {
        setCallStatus('connected');
      }, 1500);

    } catch (error) {
      console.error("Error:", error);
      alert("Camera/Mic access denied.");
      setCallStatus('idle');
    }
  };

  const endCall = async () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    setCallStatus('ended');
    setIsSummarizing(true);
    const result = await getTelemedicineSummary(mockTranscript);
    setSummary(result);
    setIsSummarizing(false);
  };

  const toggleAudio = () => {
    if (localStream) {
      const track = localStream.getAudioTracks()[0];
      if (track) {
        track.enabled = !track.enabled;
        setIsAudioEnabled(track.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const track = localStream.getVideoTracks()[0];
      if (track) {
        track.enabled = !track.enabled;
        setIsVideoEnabled(track.enabled);
      }
    }
  };

  const handleBackToQueue = () => {
    if (callStatus === 'connected') {
      if (!confirm("End active call and return to queue?")) return;
      endCall();
    }
    setViewMode('QUEUE');
    setActiveAppointment(null);
    setActivePatient(null);
  };

  // --- QUEUE VIEW ---
  if (viewMode === 'QUEUE') {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex justify-between items-end bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
           <div>
              <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                 <Video className="h-6 w-6 text-purple-600" /> Telemedicine Clinic
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                 Dr. Srinivas Rao • {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
           </div>
           <div className="text-right">
              <div className="text-3xl font-bold text-purple-600">{APPOINTMENT_QUEUE.filter(a => a.status === 'WAITING').length}</div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Waiting</div>
           </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
           <table className="w-full text-left">
              <thead>
                 <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="px-6 py-4">Time</th>
                    <th className="px-6 py-4">Patient Profile</th>
                    <th className="px-6 py-4">Appointment Type</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                 {APPOINTMENT_QUEUE.map(apt => {
                    const patient = MOCK_PATIENTS.find(p => p.id === apt.patientId);
                    return (
                       <tr key={apt.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                             <div className="flex items-center gap-2 text-slate-700 font-mono font-medium">
                                <Clock className="h-4 w-4 text-slate-400" /> {apt.time}
                             </div>
                          </td>
                          <td className="px-6 py-4">
                             {patient ? (
                                <div>
                                   <p className="font-bold text-slate-900">{patient.name}</p>
                                   <p className="text-xs text-slate-500">{patient.age}y / {patient.gender} • {patient.id}</p>
                                </div>
                             ) : (
                                <span className="text-red-500">Patient Data Error</span>
                             )}
                          </td>
                          <td className="px-6 py-4">
                             <p className="text-sm font-medium text-slate-800">{apt.type}</p>
                             <p className="text-xs text-slate-500">{apt.reason}</p>
                          </td>
                          <td className="px-6 py-4">
                             {apt.status === 'WAITING' ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                                   <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span> Waiting
                                </span>
                             ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200">
                                   <CheckCircle2 className="h-3 w-3" /> Completed
                                </span>
                             )}
                          </td>
                          <td className="px-6 py-4 text-right">
                             {apt.status === 'WAITING' ? (
                                <button 
                                   onClick={() => handleStartConsult(apt)}
                                   className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm font-bold rounded-lg hover:bg-purple-700 shadow-sm shadow-purple-200 transition-all active:scale-95"
                                >
                                   <Video className="h-4 w-4" /> Start Consult
                                </button>
                             ) : (
                                <button disabled className="text-slate-400 text-sm font-medium cursor-not-allowed">View Summary</button>
                             )}
                          </td>
                       </tr>
                    );
                 })}
              </tbody>
           </table>
        </div>
      </div>
    );
  }

  // --- CALL ROOM VIEW ---
  return (
    <div className="h-[calc(100vh-140px)] flex flex-col gap-4 animate-in slide-in-from-right duration-300">
      
      {/* Top Bar */}
      <div className="bg-white px-6 py-3 rounded-xl border border-slate-200 flex justify-between items-center shadow-sm">
         <div className="flex items-center gap-4">
            <button onClick={handleBackToQueue} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
               <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
               <h3 className="font-bold text-slate-800">{activePatient?.name}</h3>
               <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><User className="h-3 w-3" /> {activePatient?.age}y / {activePatient?.gender}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {activeAppointment?.time}</span>
                  <span>•</span>
                  <span className="font-mono text-slate-400">{activePatient?.id}</span>
               </div>
            </div>
         </div>
         <div className="flex items-center gap-3">
            <div className="px-3 py-1 bg-slate-100 rounded border border-slate-200 text-xs font-medium text-slate-600">
               Reason: {activeAppointment?.reason}
            </div>
            <span className={`w-2 h-2 rounded-full ${callStatus === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></span>
            <span className="text-xs font-bold text-slate-500 uppercase">{callStatus === 'connected' ? 'Live' : callStatus}</span>
         </div>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
         
         {/* LEFT: Patient History Sidebar */}
         <div className="col-span-3 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-100">
               <h4 className="font-bold text-slate-700 text-sm flex items-center gap-2">
                  <History className="h-4 w-4 text-slate-500" /> Clinical Profile
               </h4>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
               <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-400 uppercase">Known Conditions</p>
                  <div className="flex flex-wrap gap-2">
                     {activePatient?.history.split(',').map((h, i) => (
                        <span key={i} className="px-2 py-1 bg-orange-50 text-orange-700 border border-orange-100 rounded text-xs font-medium">
                           {h.trim()}
                        </span>
                     ))}
                  </div>
               </div>

               <div className="space-y-3">
                  <p className="text-xs font-bold text-slate-400 uppercase">Past Encounters</p>
                  <div className="relative border-l-2 border-slate-100 ml-1 space-y-4 pl-4">
                     {MOCK_HISTORY.map((hist, i) => (
                        <div key={i} className="relative">
                           <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-slate-300 border-2 border-white"></span>
                           <p className="text-xs text-slate-400 font-mono mb-0.5">{hist.date}</p>
                           <p className="text-sm font-bold text-slate-700">{hist.diagnosis}</p>
                           <p className="text-xs text-slate-500 mt-1">{hist.notes}</p>
                           <p className="text-[10px] text-slate-400 mt-1">By {hist.doctor} • {hist.type}</p>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
         </div>

         {/* CENTER: Video Area */}
         <div className="col-span-6 bg-black rounded-xl relative overflow-hidden shadow-xl flex flex-col">
            <div className="flex-1 relative flex items-center justify-center">
               {/* Remote Video Placeholder */}
               {callStatus === 'connected' ? (
                  <img src="https://picsum.photos/800/600" alt="Patient" className="w-full h-full object-cover opacity-90" />
               ) : (
                  <div className="text-center">
                     {callStatus === 'idle' && (
                        <>
                           <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                              <User className="h-10 w-10 text-slate-500" />
                           </div>
                           <p className="text-slate-400 font-medium">Patient is in waiting room</p>
                        </>
                     )}
                     {callStatus === 'calling' && (
                        <div className="flex flex-col items-center gap-3">
                           <Loader2 className="h-10 w-10 animate-spin text-purple-500" />
                           <p className="text-purple-400">Connecting Secure Line...</p>
                        </div>
                     )}
                     {callStatus === 'ended' && <p className="text-slate-400">Call Ended</p>}
                  </div>
               )}

               {/* Self View (PIP) */}
               {(callStatus === 'connected' || callStatus === 'calling') && (
                  <div className="absolute top-4 right-4 w-32 h-24 bg-slate-800 rounded border border-slate-600 overflow-hidden shadow-lg">
                     <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover transform scale-x-[-1]" />
                  </div>
               )}
            </div>

            {/* Controls Bar */}
            <div className="h-20 bg-slate-900 flex items-center justify-center gap-6">
               {callStatus === 'idle' || callStatus === 'ended' ? (
                  <button 
                     onClick={startCall} 
                     className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 shadow-lg hover:scale-105 transition-all"
                  >
                     <Phone className="h-5 w-5" /> Start Consultation
                  </button>
               ) : (
                  <>
                     <button onClick={toggleAudio} className={`p-3 rounded-full ${isAudioEnabled ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-red-500 hover:bg-red-600 text-white'}`}>
                        {isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
                     </button>
                     <button onClick={endCall} className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold shadow-lg">
                        End Call
                     </button>
                     <button onClick={toggleVideo} className={`p-3 rounded-full ${isVideoEnabled ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-red-500 hover:bg-red-600 text-white'}`}>
                        {isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
                     </button>
                  </>
               )}
            </div>
         </div>

         {/* RIGHT: AI & Notes */}
         <div className="col-span-3 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
            <div className="flex-1 bg-slate-50 flex flex-col min-h-0">
               <div className="p-3 border-b border-slate-200 font-bold text-xs text-slate-500 uppercase flex items-center gap-2 bg-white">
                  <MessageSquare className="h-3 w-3" /> Live Transcript
               </div>
               <div className="flex-1 p-4 overflow-y-auto text-xs space-y-3 font-mono text-slate-600">
                  {callStatus === 'connected' ? (
                     mockTranscript.split('\n').map((line, i) => (
                        <p key={i} className="animate-in slide-in-from-left-2 fade-in">{line}</p>
                     ))
                  ) : (
                     <div className="text-center py-10 text-slate-400 italic">Waiting for audio stream...</div>
                  )}
               </div>
            </div>
            
            <div className="h-1/2 border-t border-slate-200 flex flex-col bg-indigo-50/50">
               <div className="p-3 border-b border-indigo-100 font-bold text-xs text-indigo-800 uppercase flex items-center gap-2 bg-indigo-50">
                  <FileText className="h-3 w-3" /> AI Clinical Note
               </div>
               <div className="flex-1 p-4 overflow-y-auto">
                  {isSummarizing ? (
                     <div className="flex flex-col items-center justify-center h-full gap-2 text-indigo-500">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span className="text-xs font-medium">Generating SOAP Note...</span>
                     </div>
                  ) : summary ? (
                     <div className="text-xs text-indigo-900 whitespace-pre-wrap leading-relaxed font-medium">
                        {summary}
                     </div>
                  ) : (
                     <div className="text-center h-full flex items-center justify-center text-indigo-300 text-xs">
                        Note will auto-generate after call.
                     </div>
                  )}
               </div>
            </div>
         </div>

      </div>
    </div>
  );
};
    