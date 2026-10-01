import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  PhoneCall,
  Volume2,
  VolumeX,
  RefreshCw,
  Sparkles,
  Maximize2,
  Minimize2,
  Share2,
  Grid,
  Heart,
  Smile,
  Shield,
  PhoneIncoming,
  Radio,
  Zap,
  Delete,
} from 'lucide-react';
import { 
  startRingtone, 
  stopRingtone, 
  playCallConnectedSound, 
  playCallEndedSound, 
  playDialTone, 
  playTapSound 
} from '../../lib/audio';

export type CallType = 'voice' | 'video';
export type CallStatus = 'ringing' | 'connected' | 'incoming' | 'ended';

export interface ActiveCallData {
  type: CallType;
  status: CallStatus;
  contactName: string;
  contactAvatar: string;
  contactHandle?: string;
  isIncoming?: boolean;
}

interface EnhancedCallModalProps {
  callData: ActiveCallData | null;
  currentUserAvatar?: string;
  currentUserName?: string;
  onEndCall: (durationSeconds?: number) => void;
  onAcceptCall?: () => void;
  onToggleCallType?: (newType: CallType) => void;
}

export const EnhancedCallModal: React.FC<EnhancedCallModalProps> = ({
  callData,
  currentUserAvatar = '/assets/maya.png',
  currentUserName = 'Maya Liu',
  onEndCall,
  onAcceptCall,
  onToggleCallType,
}) => {
  if (!callData) return null;

  // Local state for interactive call controls
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isKeypadOpen, setIsKeypadOpen] = useState(false);
  const [dialedDigits, setDialedDigits] = useState('');
  const [activeFilter, setActiveFilter] = useState<'none' | 'bunny' | 'glow' | 'neon' | 'retro'>('none');
  const [callDuration, setCallDuration] = useState(0);
  const [floatingEmojis, setFloatingEmojis] = useState<{ id: number; emoji: string; left: number }[]>([]);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [hasCameraStream, setHasCameraStream] = useState(false);
  const [pipPosition, setPipPosition] = useState<'top' | 'bottom'>('top');

  // Video refs for real media stream
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  // Play ringtone while ringing or incoming
  useEffect(() => {
    if (callData.status === 'ringing' || callData.status === 'incoming') {
      startRingtone();
    } else if (callData.status === 'connected') {
      stopRingtone();
      playCallConnectedSound();
    }

    return () => {
      stopRingtone();
    };
  }, [callData.status]);

  // Handle call timer when connected
  useEffect(() => {
    let timer: any = null;
    if (callData.status === 'connected') {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [callData.status]);

  // Request actual camera when video call connects
  useEffect(() => {
    let active = true;

    if (callData.type === 'video' && callData.status === 'connected' && !isVideoOff) {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia({ 
            video: { facingMode: isFrontCamera ? 'user' : 'environment', width: { ideal: 640 }, height: { ideal: 480 } }, 
            audio: true 
          })
          .then((stream) => {
            if (!active) {
              stream.getTracks().forEach((t) => t.stop());
              return;
            }
            localStreamRef.current = stream;
            if (localVideoRef.current) {
              localVideoRef.current.srcObject = stream;
            }
            setHasCameraStream(true);
          })
          .catch((err) => {
            console.warn('Real camera not available or permission denied, using simulated stream:', err);
            setHasCameraStream(false);
          });
      } else {
        setHasCameraStream(false);
      }
    } else {
      setHasCameraStream(false);
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
        localStreamRef.current = null;
      }
    }

    return () => {
      active = false;
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
        localStreamRef.current = null;
      }
    };
  }, [callData.type, callData.status, isVideoOff, isFrontCamera]);

  // Format call duration helper (e.g. 01:24)
  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Trigger floating heart / emoji reaction
  const triggerEmoji = (emoji: string) => {
    playTapSound();
    const id = Date.now() + Math.random();
    const left = 20 + Math.random() * 60;
    setFloatingEmojis((prev) => [...prev, { id, emoji, left }]);
    setTimeout(() => {
      setFloatingEmojis((prev) => prev.filter((item) => item.id !== id));
    }, 2000);
  };

  // Handle keypad digit tap
  const handleKeypadPress = (digit: string) => {
    playDialTone(digit);
    setDialedDigits((prev) => prev + digit);
  };

  // Toggle Screen Sharing
  const handleToggleScreenShare = async () => {
    playTapSound();
    try {
      if (!isScreenSharing && navigator.mediaDevices?.getDisplayMedia) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }
        setIsScreenSharing(true);
        screenStream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
        };
      } else {
        setIsScreenSharing(false);
      }
    } catch (e) {
      console.warn('Screen share toggled/fallback:', e);
      setIsScreenSharing((prev) => !prev);
    }
  };

  // Handle End Call
  const handleEndCall = () => {
    stopRingtone();
    playCallEndedSound();
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    onEndCall(callDuration);
  };

  // ============================================================================
  // 1. MINIMIZED FLOATING BUBBLE VIEW
  // (Allows user to navigate chat & feed while keeping the call live)
  // ============================================================================
  if (isMinimized) {
    return (
      <div 
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-24 right-4 z-50 p-2 rounded-3xl bg-[#1b172a]/95 backdrop-blur-xl border border-white/20 shadow-2xl text-white flex items-center gap-3 cursor-pointer hover:scale-105 active:scale-95 transition-all animate-bounce"
        style={{ animationDuration: '3s' }}
      >
        <div className="relative w-12 h-12 rounded-2xl overflow-hidden border border-[#ff607d]/50 bg-black">
          <img src={callData.contactAvatar} alt={callData.contactName} className="w-full h-full object-cover" />
          <span className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
        </div>
        <div className="pr-2">
          <p className="text-xs font-bold leading-tight">{callData.contactName}</p>
          <p className="text-[10px] text-white/70 font-mono mt-0.5">
            {callData.status === 'connected' ? formatTimer(callDuration) : 'Calling...'}
          </p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleEndCall();
          }}
          className="w-8 h-8 rounded-full bg-rose-600 hover:bg-rose-700 flex items-center justify-center text-white shadow-md"
        >
          <PhoneOff className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  // ============================================================================
  // 2. INCOMING CALL MODAL PROMPT
  // ============================================================================
  if (callData.status === 'incoming') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
        <div className="w-full max-w-sm bg-gradient-to-b from-[#241f36] to-[#161224] rounded-3xl p-6 shadow-2xl border border-white/15 text-center text-white animate-scale-up">
          <div className="relative mx-auto w-24 h-24 mb-5">
            <div className="absolute inset-0 rounded-full bg-[#ff607d]/30 animate-ping" style={{ animationDuration: '1.8s' }} />
            <img
              src={callData.contactAvatar}
              alt={callData.contactName}
              className="relative w-24 h-24 rounded-full object-cover border-4 border-[#ff607d] shadow-2xl"
            />
            <div className="absolute -bottom-1 -right-1 p-2 rounded-full bg-[#ff607d] text-white shadow-lg">
              {callData.type === 'video' ? <Video className="w-4 h-4" /> : <PhoneCall className="w-4 h-4" />}
            </div>
          </div>

          <span className="text-xs font-bold uppercase tracking-widest text-[#ff607d]">
            Incoming {callData.type === 'video' ? 'Video' : 'Voice'} Call
          </span>
          <h3 className="text-2xl font-black mt-1 text-white">{callData.contactName}</h3>
          <p className="text-xs text-white/60 mt-1">Bunny Friends Network · Tap to connect</p>

          <div className="flex items-center justify-center gap-10 mt-8">
            <button
              onClick={handleEndCall}
              className="flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className="w-16 h-16 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-xl shadow-rose-500/40 group-hover:scale-110 active:scale-90 transition-all">
                <PhoneOff className="w-7 h-7" />
              </div>
              <span className="text-xs font-bold text-rose-400">Decline</span>
            </button>

            <button
              onClick={() => {
                if (onAcceptCall) onAcceptCall();
              }}
              className="flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-xl shadow-emerald-500/40 group-hover:scale-110 active:scale-90 transition-all animate-pulse">
                <PhoneCall className="w-7 h-7" />
              </div>
              <span className="text-xs font-bold text-emerald-400">Accept</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // 3. FULL SCREEN ACTIVE CALL INTERFACE (VOICE & VIDEO)
  // ============================================================================
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-2xl p-0 sm:p-4 text-white select-none">
      <div className="relative w-full h-full sm:max-w-md sm:h-[88vh] sm:rounded-[36px] bg-[#141122] overflow-hidden flex flex-col shadow-2xl border-0 sm:border sm:border-white/10">
        
        {/* Floating Hearts / Reactions Layer */}
        <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
          {floatingEmojis.map((item) => (
            <div
              key={item.id}
              style={{ left: `${item.left}%` }}
              className="absolute bottom-28 text-3xl animate-float-up opacity-90 transition-all"
            >
              {item.emoji}
            </div>
          ))}
        </div>

        {/* Top Header Bar */}
        <div className="relative z-20 px-4 pt-6 pb-2 flex items-center justify-between bg-gradient-to-b from-black/80 via-black/40 to-transparent">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMinimized(true)}
              className="p-2 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white transition-colors"
              title="Minimize call to floating bubble"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <h4 className="text-sm font-extrabold tracking-wide">{callData.contactName}</h4>
              </div>
              <p className="text-[11px] text-white/70 font-mono mt-0.5">
                {callData.status === 'ringing' 
                  ? 'Ringing...' 
                  : `${callData.type === 'video' ? 'HD Video Call' : 'Encrypted Audio'} • ${formatTimer(callDuration)}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter Toggle for Video Mode */}
            {callData.type === 'video' && (
              <button
                onClick={() => {
                  playTapSound();
                  const filters: ('none' | 'bunny' | 'glow' | 'neon' | 'retro')[] = ['none', 'bunny', 'glow', 'neon', 'retro'];
                  const nextIdx = (filters.indexOf(activeFilter) + 1) % filters.length;
                  setActiveFilter(filters[nextIdx]);
                }}
                className={`px-2.5 py-1.5 rounded-2xl text-[11px] font-bold backdrop-blur-md flex items-center gap-1 border transition-all ${
                  activeFilter !== 'none'
                    ? 'bg-[#ff607d] border-transparent text-white shadow-md shadow-[#ff607d]/30'
                    : 'bg-white/10 border-white/10 text-white/80'
                }`}
                title="Cycle AR Filters"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="capitalize">{activeFilter === 'none' ? 'Filter' : activeFilter}</span>
              </button>
            )}

            {/* Keypad Toggle for Voice Mode */}
            {callData.type === 'voice' && (
              <button
                onClick={() => {
                  playTapSound();
                  setIsKeypadOpen(!isKeypadOpen);
                }}
                className={`p-2 rounded-2xl backdrop-blur-md transition-all ${
                  isKeypadOpen ? 'bg-[#ff607d] text-white' : 'bg-white/10 hover:bg-white/20 text-white/80'
                }`}
                title="Dialpad"
              >
                <Grid className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Center Main Stage */}
        <div className="relative flex-1 flex flex-col items-center justify-center overflow-hidden">
          
          {/* ================= VIDEO CALL VIEW ================= */}
          {callData.type === 'video' ? (
            <div className="relative w-full h-full flex items-center justify-center bg-[#0d0b17]">
              {/* Remote Video Feed (Contact) */}
              <div className="absolute inset-0 overflow-hidden">
                <img
                  src={callData.contactAvatar}
                  alt={callData.contactName}
                  className={`w-full h-full object-cover transition-transform duration-700 ${
                    activeFilter === 'glow' ? 'brightness-125 contrast-110 saturate-150' :
                    activeFilter === 'neon' ? 'hue-rotate-90 saturate-200' :
                    activeFilter === 'retro' ? 'grayscale contrast-125' : ''
                  }`}
                />
                
                {/* Simulated live breathing/talking video overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

                {/* Bunny Filter overlay */}
                {activeFilter === 'bunny' && (
                  <div className="absolute top-16 left-1/2 -translate-x-1/2 text-6xl animate-bounce pointer-events-none">
                    🐰
                  </div>
                )}
              </div>

              {/* Status Badge */}
              <div className="absolute top-4 left-4 z-20 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center gap-1.5 text-xs text-white">
                <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>1080p HD Live</span>
              </div>

              {/* Picture-in-Picture Local Self Camera */}
              <div 
                onClick={() => {
                  playTapSound();
                  setPipPosition((prev) => prev === 'top' ? 'bottom' : 'top');
                }}
                title="Tap to switch position (Top / Bottom)"
                className={`absolute ${
                  pipPosition === 'top' ? 'top-20 right-3.5' : 'bottom-36 right-3.5'
                } w-28 h-38 sm:w-32 sm:h-44 rounded-2xl overflow-hidden border-2 border-white/60 shadow-2xl z-30 bg-[#1e1a2f] transition-all duration-300 transform active:scale-95 cursor-pointer`}
              >
                {!isVideoOff ? (
                  <div className="relative w-full h-full">
                    {hasCameraStream ? (
                      <video
                        ref={localVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className={`w-full h-full object-cover ${isFrontCamera ? 'scale-x-[-1]' : ''}`}
                      />
                    ) : (
                      <div className="relative w-full h-full bg-gradient-to-tr from-[#2a1d45] via-[#362758] to-[#1c1630] flex items-center justify-center overflow-hidden">
                        <img 
                          src={currentUserAvatar || '/assets/maya.png'} 
                          alt={currentUserName}
                          className={`w-full h-full object-cover filter brightness-95 ${isFrontCamera ? 'scale-x-[-1]' : ''}`} 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                        <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-full bg-emerald-500/90 text-[8px] font-extrabold text-white flex items-center gap-1 shadow">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                          <span>LIVE</span>
                        </div>
                      </div>
                    )}
                    <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-[8px] font-bold text-white flex items-center gap-1">
                      <span>You</span>
                      <span className="opacity-70">{isFrontCamera ? '• Front' : '• Back'}</span>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full bg-[#181427] flex flex-col items-center justify-center text-white/60 p-2 text-center">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center mb-1">
                      <VideoOff className="w-4 h-4 text-rose-400" />
                    </div>
                    <span className="text-[10px] font-bold text-white">Camera Off</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* ================= VOICE CALL VIEW ================= */
            <div className="relative w-full h-full flex flex-col items-center justify-center px-6">
              {/* Concentric Ambient Audio Waves */}
              <div className="relative mb-6">
                <div className="absolute -inset-10 rounded-full bg-[#ff607d]/15 blur-2xl animate-ping" style={{ animationDuration: '3s' }} />
                <div className="absolute -inset-6 rounded-full bg-[#7b5cf5]/20 blur-xl animate-pulse" style={{ animationDuration: '2s' }} />
                
                <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full p-1 bg-gradient-to-tr from-[#ff607d] to-[#7b5cf5] shadow-2xl">
                  <img
                    src={callData.contactAvatar}
                    alt={callData.contactName}
                    className="w-full h-full rounded-full object-cover border-4 border-[#141122]"
                  />
                  {callData.status === 'connected' && (
                    <span className="absolute bottom-1 right-2 p-2 rounded-full bg-emerald-500 border-2 border-[#141122] text-white shadow-lg">
                      <Mic className="w-4 h-4" />
                    </span>
                  )}
                </div>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white text-center">
                {callData.contactName}
              </h2>
              <p className="text-xs sm:text-sm text-[#ff607d] font-semibold mt-1">
                {callData.status === 'ringing' ? 'Calling bunny friend...' : 'Voice connected with stereo sound'}
              </p>

              {/* Dynamic Equalizer Waveform Indicator */}
              <div className="flex items-center gap-1.5 mt-8 h-10">
                {[30, 75, 45, 90, 60, 100, 50, 85, 40, 70, 95, 55, 80, 35].map((h, i) => (
                  <div
                    key={i}
                    style={{ 
                      height: callData.status === 'connected' ? `${Math.max(20, (h + (i % 3) * 10))}%` : '20%',
                      animationDelay: `${i * 70}ms` 
                    }}
                    className={`w-1.5 rounded-full transition-all duration-300 ${
                      isMuted 
                        ? 'bg-white/20' 
                        : 'bg-gradient-to-t from-[#ff607d] to-[#ff8e72] animate-pulse'
                    }`}
                  />
                ))}
              </div>

              {/* In-Call Keypad Overlay (if open) */}
              {isKeypadOpen && (
                <div className="absolute inset-x-3 bottom-3 top-14 bg-[#181427]/98 backdrop-blur-2xl rounded-3xl p-4 sm:p-5 border border-white/20 flex flex-col justify-between z-40 shadow-2xl animate-scale-up">
                  <div>
                    <div className="flex items-center justify-between mb-1 px-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-white/60">Touch-Tone Dialpad</span>
                      {dialedDigits && (
                        <button
                          onClick={() => {
                            playTapSound();
                            setDialedDigits('');
                          }}
                          className="text-[10px] font-bold text-[#ff607d] hover:underline transition-colors"
                        >
                          Clear All
                        </button>
                      )}
                    </div>
                    {/* Dialed Display with Backspace button */}
                    <div className="flex items-center justify-between px-3.5 py-2 rounded-2xl bg-black/50 border border-white/15 min-h-[46px]">
                      <div className="flex-1 overflow-x-auto no-scrollbar text-center px-1">
                        <span className="text-lg sm:text-xl font-mono font-bold tracking-wider text-[#ff607d] break-all select-all">
                          {dialedDigits || '—'}
                        </span>
                      </div>
                      {dialedDigits && (
                        <button
                          onClick={() => {
                            playTapSound();
                            setDialedDigits((prev) => prev.slice(0, -1));
                          }}
                          className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white/80 transition-all cursor-pointer ml-1.5 shrink-0"
                          title="Backspace"
                        >
                          <Delete className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 3x4 Dialpad Grid */}
                  <div className="grid grid-cols-3 gap-2.5 my-2 max-w-xs mx-auto w-full">
                    {[
                      { d: '1', sub: ' ' },
                      { d: '2', sub: 'ABC' },
                      { d: '3', sub: 'DEF' },
                      { d: '4', sub: 'GHI' },
                      { d: '5', sub: 'JKL' },
                      { d: '6', sub: 'MNO' },
                      { d: '7', sub: 'PQRS' },
                      { d: '8', sub: 'TUV' },
                      { d: '9', sub: 'WXYZ' },
                      { d: '*', sub: ' ' },
                      { d: '0', sub: '+' },
                      { d: '#', sub: ' ' },
                    ].map(({ d, sub }) => (
                      <button
                        key={d}
                        onClick={() => handleKeypadPress(d)}
                        className="h-12 rounded-2xl bg-white/10 hover:bg-white/20 active:bg-[#ff607d] active:scale-95 transition-all text-white flex flex-col items-center justify-center cursor-pointer shadow-sm"
                      >
                        <span className="text-lg font-bold leading-none">{d}</span>
                        {sub.trim() && <span className="text-[8px] font-semibold text-white/50 tracking-wider leading-none mt-0.5">{sub}</span>}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setIsKeypadOpen(false)}
                    className="w-full py-2.5 rounded-xl bg-white/15 hover:bg-white/25 active:scale-98 text-xs font-bold text-white transition-all cursor-pointer"
                  >
                    Hide Keypad
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Quick Reaction Emoji Bar - Hidden when keypad is active */}
          {!isKeypadOpen && (
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/65 backdrop-blur-xl border border-white/20 shadow-2xl">
              {['❤️', '🐰', '🔥', '✨', '👏'].map((em) => (
                <button
                  key={em}
                  onClick={() => triggerEmoji(em)}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full hover:scale-125 active:scale-95 transition-transform flex items-center justify-center text-base sm:text-lg cursor-pointer"
                >
                  {em}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Call Action Control Bar */}
        <div className="relative z-20 px-4 py-3.5 bg-gradient-to-t from-black via-black/95 to-black/70 border-t border-white/10 flex items-center justify-around gap-2">
          
          {/* Mute Mic Button */}
          <button
            onClick={() => {
              playTapSound();
              setIsMuted(!isMuted);
            }}
            className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
              isMuted
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                : 'bg-white/15 hover:bg-white/25 active:bg-white/30 text-white'
            }`}
            title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Toggle Video or Upgrade to Video Call */}
          {callData.type === 'video' ? (
            <button
              onClick={() => {
                playTapSound();
                setIsVideoOff(!isVideoOff);
              }}
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
                isVideoOff
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                  : 'bg-white/15 hover:bg-white/25 active:bg-white/30 text-white'
              }`}
              title={isVideoOff ? 'Turn video on' : 'Turn video off'}
            >
              {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
            </button>
          ) : (
            <button
              onClick={() => {
                playTapSound();
                if (onToggleCallType) onToggleCallType('video');
              }}
              className="w-11 h-11 rounded-2xl bg-white/15 hover:bg-white/25 active:bg-white/30 text-white flex items-center justify-center transition-all cursor-pointer"
              title="Upgrade to Video Call"
            >
              <Video className="w-5 h-5" />
            </button>
          )}

          {/* Speakerphone Toggle for Voice, Flip Camera for Video */}
          {callData.type === 'video' ? (
            <button
              onClick={() => {
                playTapSound();
                setIsFrontCamera(!isFrontCamera);
              }}
              className="w-11 h-11 rounded-2xl bg-white/15 hover:bg-white/25 active:bg-white/30 text-white flex items-center justify-center transition-all cursor-pointer"
              title="Flip Camera (Front/Rear)"
            >
              <RefreshCw className={`w-5 h-5 transition-transform duration-500 ${isFrontCamera ? '' : 'rotate-180'}`} />
            </button>
          ) : (
            <button
              onClick={() => {
                playTapSound();
                setIsSpeakerOn(!isSpeakerOn);
              }}
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
                isSpeakerOn ? 'bg-white/25 text-white' : 'bg-white/10 text-white/60'
              }`}
              title="Toggle Speakerphone"
            >
              {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
          )}

          {/* Screen Share Toggle */}
          <button
            onClick={handleToggleScreenShare}
            className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
              isScreenSharing
                ? 'bg-[#7b5cf5] text-white shadow-lg shadow-[#7b5cf5]/30'
                : 'bg-white/15 hover:bg-white/25 active:bg-white/30 text-white'
            }`}
            title={isScreenSharing ? 'Stop sharing screen' : 'Share screen'}
          >
            <Share2 className="w-5 h-5" />
          </button>

          {/* End Call Button */}
          <button
            onClick={handleEndCall}
            className="w-12 h-12 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-rose-600/40 transition-all cursor-pointer"
            title="End Call"
          >
            <PhoneOff className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
