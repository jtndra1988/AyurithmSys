import React, { useState, useRef, useEffect } from 'react';
import { Video, Mic, MicOff, VideoOff, PhoneOff, MessageSquare, FileText, Phone, Loader2 } from 'lucide-react';
import { getTelemedicineSummary } from '../services/geminiService';

export const Telemedicine: React.FC = () => {
  const [summary, setSummary] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [callStatus, setCallStatus] = useState<'idle' | 'calling' | 'connected' | 'ended'>('idle');
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  const localVideoRef = useRef<HTMLVideoElement>(null);

  const mockTranscript = `
    Doctor: Good morning, Sarah. I see you've had a fever for 2 days.
    Patient: Yes doctor, it was 102 last night. I also have this rash on my arms.
    Doctor: Okay, let me look at the rash. It looks like a viral exanthem. Any joint pain?
    Patient: My knees hurt a lot, honestly.
    Doctor: I suspect it might be Dengue or Chikungunya given the season. I'm ordering a CBC and NS1 antigen test.
    Patient: Okay, should I take anything?
    Doctor: Take Paracetamol 650mg for fever. Stay hydrated. Isolate until we get reports.
  `;

  useEffect(() => {
    // Cleanup stream on component unmount
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [localStream]);

  const startCall = async () => {
    try {
      setCallStatus('calling');
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      setLocalStream(stream);
      setIsAudioEnabled(true);
      setIsVideoEnabled(true);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Simulate connection delay
      setTimeout(() => {
        setCallStatus('connected');
      }, 2000);

    } catch (error) {
      console.error("Error accessing media devices:", error);
      alert("Unable to access camera or microphone. Please ensure you have granted permissions.");
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
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Video Area */}
      <div className="lg:col-span-2 bg-black rounded-2xl relative overflow-hidden flex items-center justify-center shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10 pointer-events-none"></div>
        
        {/* Remote Patient Video (Simulated) */}
        {callStatus === 'connected' ? (
          <img 
            src="https://picsum.photos/800/600" 
            alt="Patient Video" 
            className="w-full h-full object-cover opacity-90 animate-in fade-in duration-1000"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900 text-slate-400">
             {callStatus === 'idle' && (
                <div className="text-center">
                  <div className="bg-slate-800 p-4 rounded-full inline-block mb-4">
                    <Video className="h-8 w-8 text-slate-400" />
                  </div>
                  <p className="text-lg font-medium">Ready to start consultation</p>
                </div>
             )}
             {callStatus === 'calling' && (
               <div className="flex flex-col items-center gap-3">
                 <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
                 <p className="text-indigo-400 font-medium">Establishing secure connection...</p>
               </div>
             )}
             {callStatus === 'ended' && (
               <div className="text-center">
                  <p className="text-lg font-medium text-slate-300">Consultation Ended</p>
                  <p className="text-sm text-slate-500 mt-2">Summary is being generated...</p>
               </div>
             )}
          </div>
        )}
        
        {/* Doctor PIP (Local Stream) */}
        {(callStatus === 'connected' || callStatus === 'calling') && (
          <div className="absolute top-6 right-6 w-48 h-36 bg-slate-800 rounded-lg border-2 border-slate-700 overflow-hidden shadow-lg z-20 group">
            <video 
              ref={localVideoRef}
              autoPlay 
              muted 
              playsInline
              className={`w-full h-full object-cover transform scale-x-[-1] ${!isVideoEnabled ? 'hidden' : ''}`}
            />
            {!isVideoEnabled && (
              <div className="w-full h-full flex items-center justify-center bg-slate-800">
                <VideoOff className="h-8 w-8 text-slate-500" />
              </div>
            )}
            <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-0.5 rounded text-[10px] text-white font-medium">
              You {isAudioEnabled ? '' : '(Muted)'}
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 z-30">
          {callStatus === 'idle' || callStatus === 'ended' ? (
             <button 
               onClick={startCall}
               className="flex items-center gap-3 bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-full font-bold shadow-lg shadow-emerald-500/30 transition-all hover:scale-105"
             >
               <Phone className="h-5 w-5" />
               Start Consultation
             </button>
          ) : (
            <>
              <button 
                onClick={toggleAudio}
                className={`p-4 rounded-full backdrop-blur-md transition-all ${
                  isAudioEnabled 
                    ? 'bg-slate-800/80 text-white hover:bg-slate-700' 
                    : 'bg-red-500/90 text-white hover:bg-red-600'
                }`}
              >
                {isAudioEnabled ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
              </button>
              
              <button 
                onClick={toggleVideo}
                className={`p-4 rounded-full backdrop-blur-md transition-all ${
                  isVideoEnabled 
                    ? 'bg-slate-800/80 text-white hover:bg-slate-700' 
                    : 'bg-red-500/90 text-white hover:bg-red-600'
                }`}
              >
                {isVideoEnabled ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
              </button>

              <button 
                onClick={endCall}
                className="p-4 bg-red-600 text-white rounded-full hover:bg-red-700 shadow-lg shadow-red-900/50 hover:scale-110 transition-transform"
              >
                <PhoneOff className="h-6 w-6" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Sidebar: Notes & AI */}
      <div className="flex flex-col gap-6 h-full">
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
          <div className="bg-slate-50 p-4 border-b border-slate-200 font-bold text-slate-700 flex items-center gap-2">
            <MessageSquare className="h-4 w-4" /> Live Transcript (Auto-generated)
          </div>
          <div className="flex-1 p-4 overflow-y-auto text-sm space-y-3 font-mono text-slate-600 bg-slate-50/50">
            {callStatus === 'connected' ? (
              mockTranscript.split('\n').map((line, i) => (
                <p key={i} className="animate-in slide-in-from-left-2 fade-in duration-500" style={{animationDelay: `${i * 1000}ms`}}>{line}</p>
              ))
            ) : (
               <div className="flex flex-col items-center justify-center h-full text-slate-400 text-center p-4">
                 <p>Transcript will appear here during the call.</p>
               </div>
            )}
          </div>
        </div>

        <div className="bg-indigo-50 rounded-xl shadow-sm border border-indigo-100 flex flex-col p-4 flex-1">
          <div className="font-bold text-indigo-900 flex items-center gap-2 mb-3">
            <FileText className="h-4 w-4" /> AI Consultation Summary
          </div>
          {isSummarizing ? (
            <div className="flex flex-col items-center justify-center flex-1 text-indigo-500 gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-sm font-medium">Generating Clinical SOAP Note...</span>
            </div>
          ) : summary ? (
            <div className="text-sm text-indigo-800 overflow-y-auto flex-1 whitespace-pre-wrap leading-relaxed bg-white/50 p-3 rounded-lg border border-indigo-100/50">
              {summary}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-indigo-300 text-sm text-center px-4">
              <p>End the call to automatically generate a SOAP note summary using Gemini AI.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};