import React, { useEffect, useRef } from 'react';
import { useCall } from '../../context/CallContext';
import {
  Phone,
  PhoneOff,
  Video,
  VideoOff,
  Mic,
  MicOff,
  SwitchCamera,
  ShieldCheck,
} from 'lucide-react';

export const CallModal: React.FC = () => {
  const {
    activeCall,
    localStream,
    remoteStream,
    isAudioMuted,
    isVideoMuted,
    callDuration,
    acceptCall,
    rejectCall,
    endCall,
    toggleAudio,
    toggleVideo,
    switchCamera,
  } = useCall();

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  // Attach streams to video elements
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  if (!activeCall) return null;

  const isIncoming = activeCall.is_incoming && activeCall.status === 'ringing';
  const isVideo = activeCall.type === 'video';
  const peer = isIncoming ? activeCall.caller : activeCall.receiver;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-between p-6 select-none animate-fade-in">
      {/* Top Header */}
      <div className="w-full flex items-center justify-between text-xs text-slate-400 z-20">
        <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-900/80 rounded-full border border-slate-800">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>WebRTC P2P Direct Call</span>
        </div>
        <div className="font-mono text-xs px-3 py-1 bg-slate-900/80 rounded-full border border-slate-800 text-slate-300">
          {activeCall.status === 'connected' ? formatDuration(callDuration) : activeCall.status.toUpperCase()}
        </div>
      </div>

      {/* Center Video / Audio Avatar View */}
      <div className="relative w-full max-w-4xl flex-1 flex items-center justify-center my-4 overflow-hidden rounded-3xl bg-slate-900 border border-slate-800/80 shadow-2xl">
        {/* Remote Video */}
        {isVideo && activeCall.status === 'connected' ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          /* Audio Call Avatar / Ringing Screen */
          <div className="flex flex-col items-center text-center p-8">
            <div className="relative mb-6">
              <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 animate-ring-pulse">
                <img
                  src={peer?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${peer?.username}`}
                  alt=""
                  className="w-full h-full object-cover rounded-full bg-slate-800"
                />
              </div>
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">{peer?.display_name || 'Contact'}</h2>
            <p className="text-sm text-indigo-400 font-medium mt-1">@{peer?.username || 'user'}</p>
            <p className="text-sm text-slate-400 mt-3 animate-pulse">
              {activeCall.status === 'calling' && 'Calling...'}
              {activeCall.status === 'ringing' && (isIncoming ? 'Incoming call...' : 'Ringing...')}
              {activeCall.status === 'connecting' && 'Establishing secure P2P media stream...'}
              {activeCall.status === 'connected' && 'Call in progress'}
            </p>
          </div>
        )}

        {/* Local Video Picture-in-Picture */}
        {isVideo && localStream && !isVideoMuted && (
          <div className="absolute top-4 right-4 w-32 md:w-44 aspect-video rounded-2xl overflow-hidden border-2 border-indigo-500/50 shadow-2xl bg-black z-30">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover -scale-x-100"
            />
          </div>
        )}
      </div>

      {/* Bottom Controls Bar */}
      <div className="w-full max-w-md flex items-center justify-center gap-5 z-20 pb-4">
        {isIncoming ? (
          /* Incoming Call Accept / Decline buttons */
          <>
            <button
              onClick={rejectCall}
              className="flex flex-col items-center gap-1 group cursor-pointer"
            >
              <div className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg transition-transform active:scale-95">
                <PhoneOff className="w-7 h-7" />
              </div>
              <span className="text-xs text-rose-400 font-medium">Decline</span>
            </button>

            <button
              onClick={acceptCall}
              className="flex flex-col items-center gap-1 group cursor-pointer"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-lg transition-transform active:scale-95 animate-bounce">
                <Phone className="w-7 h-7" />
              </div>
              <span className="text-xs text-emerald-400 font-medium">Accept</span>
            </button>
          </>
        ) : (
          /* Active Call Controls */
          <>
            <button
              onClick={toggleAudio}
              className={`p-4 rounded-2xl transition-all cursor-pointer shadow-lg ${
                isAudioMuted ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
              }`}
              title={isAudioMuted ? 'Unmute microphone' : 'Mute microphone'}
            >
              {isAudioMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>

            {isVideo && (
              <>
                <button
                  onClick={toggleVideo}
                  className={`p-4 rounded-2xl transition-all cursor-pointer shadow-lg ${
                    isVideoMuted ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                  }`}
                  title={isVideoMuted ? 'Turn on camera' : 'Turn off camera'}
                >
                  {isVideoMuted ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
                </button>

                <button
                  onClick={switchCamera}
                  className="p-4 rounded-2xl bg-slate-800 text-slate-200 hover:bg-slate-700 transition-all cursor-pointer shadow-lg"
                  title="Switch camera"
                >
                  <SwitchCamera className="w-6 h-6" />
                </button>
              </>
            )}

            <button
              onClick={endCall}
              className="p-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white shadow-xl transition-transform active:scale-95 cursor-pointer"
              title="End call"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};
