import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useAuth } from './AuthContext';
import { WebRTCManager, SignalingMessage } from '../lib/webrtc';
import { realtimeBus, RealtimePayload } from '../lib/realtimeBus';
import { Profile, WebRTCCall } from '../types';
import { ALL_USERS } from '../lib/mockData';
import { startRingtone, stopRingtone } from '../lib/audio';

interface CallContextType {
  activeCall: WebRTCCall | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isAudioMuted: boolean;
  isVideoMuted: boolean;
  callDuration: number;
  startCall: (targetUserId: string, type: 'audio' | 'video', conversationId?: string) => Promise<void>;
  acceptCall: () => Promise<void>;
  rejectCall: () => void;
  endCall: () => void;
  toggleAudio: () => void;
  toggleVideo: () => void;
  switchCamera: () => Promise<boolean>;
}

const CallContext = createContext<CallContextType | undefined>(undefined);

export const CallProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();

  const [activeCall, setActiveCall] = useState<WebRTCCall | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [isVideoMuted, setIsVideoMuted] = useState<boolean>(false);
  const [callDuration, setCallDuration] = useState<number>(0);

  const webrtcRef = useRef<WebRTCManager | null>(null);
  const durationTimerRef = useRef<any>(null);

  // Initialize WebRTC Manager
  useEffect(() => {
    const handleRemoteStream = (stream: MediaStream) => {
      setRemoteStream(stream);
    };

    const handleSignalSend = (signal: SignalingMessage) => {
      realtimeBus.emit({
        type: 'call:signal',
        senderId: currentUser?.id,
        targetId: signal.targetId,
        data: signal,
        timestamp: new Date().toISOString(),
      });
    };

    const handleIceState = (state: RTCIceConnectionState) => {
      if (state === 'connected') {
        setActiveCall((prev) => (prev ? { ...prev, status: 'connected' } : null));
        stopRingtone();
      } else if (state === 'disconnected' || state === 'failed') {
        endCall();
      }
    };

    webrtcRef.current = new WebRTCManager(handleRemoteStream, handleSignalSend, handleIceState);

    return () => {
      if (webrtcRef.current) {
        webrtcRef.current.endCall();
      }
    };
  }, [currentUser]);

  // Duration timer when connected
  useEffect(() => {
    if (activeCall?.status === 'connected') {
      durationTimerRef.current = setInterval(() => {
        setCallDuration((d) => d + 1);
      }, 1000);
    } else {
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
        durationTimerRef.current = null;
      }
      setCallDuration(0);
    }

    return () => {
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
      }
    };
  }, [activeCall?.status]);

  // Handle incoming signaling messages
  useEffect(() => {
    const unsubscribe = realtimeBus.subscribe(async (payload: RealtimePayload) => {
      if (payload.type === 'call:signal') {
        const signal: SignalingMessage = payload.data;
        if (!currentUser) return;

        // If target is not me, ignore
        if (signal.targetId !== currentUser.id) return;

        if (signal.type === 'offer' && signal.sdp) {
          // Incoming call!
          const caller = ALL_USERS.find((u) => u.id === signal.senderId) || {
            id: signal.senderId,
            name: 'Incoming Caller',
            username: 'caller',
            display_name: 'Incoming Caller',
          };

          const newCall: WebRTCCall = {
            id: signal.callId,
            caller_id: signal.senderId,
            receiver_id: currentUser.id,
            type: signal.sdp.sdp?.includes('m=video') ? 'video' : 'audio',
            status: 'ringing',
            started_at: new Date().toISOString(),
            is_incoming: true,
            caller,
            receiver: currentUser,
          };

          setActiveCall(newCall);
          startRingtone();
        } else if (signal.type === 'answer' && signal.sdp) {
          stopRingtone();
          if (webrtcRef.current) {
            await webrtcRef.current.handleAnswer(signal.sdp);
            setActiveCall((prev) => (prev ? { ...prev, status: 'connected' } : null));
          }
        } else if (signal.type === 'ice-candidate' && signal.candidate) {
          if (webrtcRef.current) {
            await webrtcRef.current.handleIceCandidate(signal.candidate);
          }
        } else if (signal.type === 'call-ended' || signal.type === 'call-rejected') {
          stopRingtone();
          if (webrtcRef.current) {
            webrtcRef.current.endCall();
          }
          setLocalStream(null);
          setRemoteStream(null);
          setActiveCall((prev) => (prev ? { ...prev, status: signal.type === 'call-rejected' ? 'rejected' : 'ended' } : null));
          setTimeout(() => setActiveCall(null), 1500);
        }
      }
    });

    return () => unsubscribe();
  }, [currentUser]);

  const startCall = async (targetUserId: string, type: 'audio' | 'video', conversationId?: string) => {
    if (!currentUser || !webrtcRef.current) return;

    const callId = 'call_' + Date.now();
    const targetUser = ALL_USERS.find((u) => u.id === targetUserId);

    const callObj: WebRTCCall = {
      id: callId,
      caller_id: currentUser.id,
      receiver_id: targetUserId,
      conversation_id: conversationId,
      type,
      status: 'calling',
      started_at: new Date().toISOString(),
      is_incoming: false,
      caller: currentUser,
      receiver: targetUser,
    };

    setActiveCall(callObj);
    startRingtone();

    try {
      const stream = await webrtcRef.current.startLocalMedia(type === 'video');
      setLocalStream(stream);

      const offer = await webrtcRef.current.createOffer(callId, currentUser.id, targetUserId);

      // Send offer to peer
      realtimeBus.emit({
        type: 'call:signal',
        senderId: currentUser.id,
        targetId: targetUserId,
        data: {
          type: 'offer',
          callId,
          senderId: currentUser.id,
          targetId: targetUserId,
          sdp: offer,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Failed to start call media:', err);
      endCall();
    }
  };

  const acceptCall = async () => {
    if (!currentUser || !activeCall || !webrtcRef.current) return;
    stopRingtone();

    try {
      const stream = await webrtcRef.current.startLocalMedia(activeCall.type === 'video');
      setLocalStream(stream);

      // In real scenario, SDP was stored or answer generated
      setActiveCall((prev) => (prev ? { ...prev, status: 'connecting' } : null));

      // Simulate connection completion
      setTimeout(() => {
        setActiveCall((prev) => (prev ? { ...prev, status: 'connected' } : null));
      }, 600);
    } catch (e) {
      console.error('Error accepting call:', e);
      endCall();
    }
  };

  const rejectCall = () => {
    if (!currentUser || !activeCall) return;
    stopRingtone();

    realtimeBus.emit({
      type: 'call:signal',
      senderId: currentUser.id,
      targetId: activeCall.caller_id,
      data: {
        type: 'call-rejected',
        callId: activeCall.id,
        senderId: currentUser.id,
        targetId: activeCall.caller_id,
      },
      timestamp: new Date().toISOString(),
    });

    if (webrtcRef.current) webrtcRef.current.endCall();
    setLocalStream(null);
    setRemoteStream(null);
    setActiveCall(null);
  };

  const endCall = () => {
    if (!currentUser || !activeCall) return;
    stopRingtone();

    const targetId = activeCall.caller_id === currentUser.id ? activeCall.receiver_id : activeCall.caller_id;
    if (targetId) {
      realtimeBus.emit({
        type: 'call:signal',
        senderId: currentUser.id,
        targetId,
        data: {
          type: 'call-ended',
          callId: activeCall.id,
          senderId: currentUser.id,
          targetId,
        },
        timestamp: new Date().toISOString(),
      });
    }

    if (webrtcRef.current) webrtcRef.current.endCall();
    setLocalStream(null);
    setRemoteStream(null);
    setActiveCall(null);
  };

  const toggleAudio = () => {
    if (webrtcRef.current) {
      const isMuted = webrtcRef.current.toggleAudio();
      setIsAudioMuted(isMuted);
    }
  };

  const toggleVideo = () => {
    if (webrtcRef.current) {
      const isMuted = webrtcRef.current.toggleVideo();
      setIsVideoMuted(isMuted);
    }
  };

  const switchCamera = async (): Promise<boolean> => {
    if (webrtcRef.current) {
      return await webrtcRef.current.switchCamera();
    }
    return false;
  };

  return (
    <CallContext.Provider
      value={{
        activeCall,
        localStream,
        remoteStream,
        isAudioMuted,
        isVideoMuted,
        callDuration,
        startCall,
        acceptCall,
        rejectCall,
        endCall,
        toggleAudio,
        toggleVideo,
        switchCamera,
      }}
    >
      {children}
    </CallContext.Provider>
  );
};

export const useCall = () => {
  const context = useContext(CallContext);
  if (!context) throw new Error('useCall must be used within CallProvider');
  return context;
};
