import React, { useEffect, useState } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  PhoneCall,
  Monitor,
  Maximize2,
  Minimize2,
  Sparkles,
} from 'lucide-react';
import { useCall } from '../../context/CallContext';

export const CallModal: React.FC = () => {
  const {
    callState,
    activeCall,
    isMuted,
    isVideoOff,
    isScreenSharing,
    localVideoRef,
    remoteVideoRef,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleVideo,
    toggleScreenShare,
  } = useCall();

  const [callDuration, setCallDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    let timer: any;
    if (callState === 'connected') {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [callState]);

  if (callState === 'idle' || !activeCall) {
    return null;
  }

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 1. Incoming Call Prompt
  if (callState === 'incoming') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
        <div className="w-full max-w-sm bg-white dark:bg-bunny-card rounded-3xl p-6 shadow-2xl border border-bunny-border/50 text-center animate-scale-up">
          <div className="relative mx-auto w-24 h-24 mb-4">
            <div className="absolute inset-0 rounded-full bg-bunny-coral/30 animate-ping" />
            <img
              src={activeCall.receiverAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
              alt={activeCall.receiverName}
              className="relative w-24 h-24 rounded-full object-cover border-4 border-bunny-coral shadow-lg"
            />
            <div className="absolute -bottom-1 -right-1 p-2 rounded-full bg-bunny-secondary text-white shadow-md">
              {activeCall.isVideo ? <Video className="w-4 h-4" /> : <PhoneCall className="w-4 h-4" />}
            </div>
          </div>

          <h3 className="text-xl font-bold text-bunny-text">{activeCall.receiverName}</h3>
          <p className="text-sm text-bunny-muted mt-1">
            Incoming {activeCall.isVideo ? 'Video' : 'Voice'} Call...
          </p>

          <div className="flex items-center justify-center gap-6 mt-8">
            <button
              onClick={rejectCall}
              className="flex flex-col items-center gap-1.5 group"
            >
              <div className="w-14 h-14 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-500/30 transition-transform group-hover:scale-105 active:scale-95">
                <PhoneOff className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-rose-500">Decline</span>
            </button>

            <button
              onClick={acceptCall}
              className="flex flex-col items-center gap-1.5 group"
            >
              <div className="w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 transition-transform group-hover:scale-105 active:scale-95">
                <PhoneCall className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-emerald-500">Accept</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Outgoing Ringing or Active Connected Call
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl transition-all ${
        isFullscreen ? 'p-0' : 'p-4 md:p-8'
      }`}
    >
      <div
        className={`relative w-full ${
          isFullscreen ? 'h-full rounded-none' : 'max-w-4xl h-[85vh] rounded-3xl'
        } bg-slate-950 text-white shadow-2xl overflow-hidden flex flex-col border border-white/10`}
      >
        {/* Call Top Header */}
        <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
            <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
            <div>
              <h4 className="text-sm font-bold text-white">{activeCall.receiverName}</h4>
              <p className="text-xs text-white/70">
                {callState === 'calling'
                  ? 'Connecting...'
                  : `${activeCall.isVideo ? 'HD Video Call' : 'Voice Call'} • ${formatTimer(callDuration)}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2.5 rounded-xl bg-black/40 backdrop-blur-md text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Video / Call Center Display */}
        <div className="relative flex-1 bg-gradient-to-b from-slate-900 to-slate-950 flex items-center justify-center overflow-hidden">
          {/* Remote Video Stream or Avatar */}
          {activeCall.isVideo && !isVideoOff ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center flex flex-col items-center">
              <div className="relative mb-6">
                <div className="absolute -inset-4 rounded-full bg-bunny-coral/20 blur-xl animate-pulse" />
                <img
                  src={activeCall.receiverAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
                  alt={activeCall.receiverName}
                  className="relative w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-bunny-coral/60 shadow-2xl"
                />
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white">
                {activeCall.receiverName}
              </h2>
              <p className="text-white/60 text-sm mt-2 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-bunny-coral" />
                {callState === 'calling' ? 'Calling bunny friends...' : 'Audio connected with end-to-end encryption'}
              </p>

              {/* Sound waves indicator */}
              <div className="flex items-center gap-1.5 mt-8 h-8">
                {[40, 70, 30, 90, 60, 100, 50, 80, 45, 65].map((h, i) => (
                  <div
                    key={i}
                    style={{ height: `${h}%` }}
                    className="w-1.5 bg-bunny-coral rounded-full animate-pulse transition-all duration-300"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Picture-in-Picture Local Video (Self) */}
          {activeCall.isVideo && (
            <div className="absolute bottom-24 right-4 md:right-8 w-36 h-48 md:w-48 md:h-64 rounded-2xl overflow-hidden bg-black/60 border-2 border-white/20 shadow-2xl z-20">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${isVideoOff ? 'hidden' : 'block'}`}
              />
              {isVideoOff && (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-white/50 text-xs">
                  <VideoOff className="w-6 h-6 mb-1 text-white/40" />
                  Camera off
                </div>
              )}
            </div>
          )}
        </div>

        {/* Call Action Bar Controls */}
        <div className="relative z-20 px-6 py-4 bg-slate-950/80 backdrop-blur-xl border-t border-white/10 flex items-center justify-center gap-4 md:gap-6">
          <button
            onClick={toggleMute}
            className={`p-3.5 md:p-4 rounded-2xl transition-all ${
              isMuted
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
            title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>

          {activeCall.isVideo && (
            <button
              onClick={toggleVideo}
              className={`p-3.5 md:p-4 rounded-2xl transition-all ${
                isVideoOff
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
              title={isVideoOff ? 'Turn camera on' : 'Turn camera off'}
            >
              {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
            </button>
          )}

          <button
            onClick={toggleScreenShare}
            className={`p-3.5 md:p-4 rounded-2xl transition-all ${
              isScreenSharing
                ? 'bg-bunny-secondary text-white shadow-lg shadow-bunny-secondary/30'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
            title={isScreenSharing ? 'Stop sharing screen' : 'Share screen'}
          >
            <Monitor className="w-6 h-6" />
          </button>

          <button
            onClick={endCall}
            className="px-6 py-3.5 md:py-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-2 font-bold shadow-xl shadow-rose-600/30 transition-all hover:scale-105 active:scale-95"
            title="End call"
          >
            <PhoneOff className="w-6 h-6" />
            <span className="hidden sm:inline">End Call</span>
          </button>
        </div>
      </div>
    </div>
  );
};
