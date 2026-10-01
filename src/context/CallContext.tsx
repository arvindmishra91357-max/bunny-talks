import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useAuth } from './AuthContext';
import { WebRTCManager, SignalingMessage } from '../lib/webrtc';
import { realtimeBus, RealtimePayload } from '../lib/realtimeBus';
import { WebRTCCall } from '../types';
import { ALL_PROFILES } from '../lib/mockData';
import { startRingtone, stopRingtone } from '../lib/audio';

export type CallState = 'idle' | 'calling' | 'incoming' | 'connected' | 'ended';

interface CallContextType {
  activeCall: WebRTCCall | null;
  callState: CallState;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isAudioMuted: boolean;
  isVideoMuted: boolean;
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  callDuration: number;
  localVideoRef: React.RefObject<HTMLVideoElement | null>;
  remoteVideoRef: React.RefObject<HTMLVideoElement | null>;
  startCall: (targetUserId: string, type: 'audio' | 'video' | boolean, conversationId?: string) => Promise<void>;
  acceptCall: () => Promise<void>;
  rejectCall: () => void;
  endCall: () => void;
  toggleAudio: () => void;
  toggleMute: () => void;
  toggleVideo: () => void;
  toggleScreenShare: () => Promise<void>;
  switchCamera: () => Promise<boolean>;
}

const CallContext = createContext<CallContextType | undefined>(undefined);

export const CallProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, allUsers } = useAuth();

  const [activeCall, setActiveCall] = useState<WebRTCCall | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [isVideoMuted, setIsVideoMuted] = useState<boolean>(false);
  const [isScreenSharing, setIsScreenSharing] = useState<boolean>(false);
  const [callDuration, setCallDuration] = useState<number>(0);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const webrtcRef = useRef<WebRTCManager | null>(null);
  const durationTimerRef = useRef<any>(null);

  // Derive callState from activeCall
  const callState: CallState = !activeCall
    ? 'idle'
    : activeCall.status === 'ringing'
    ? activeCall.is_incoming
      ? 'incoming'
      : 'calling'
    : (activeCall.status as CallState);

  // Sync streams to video elements
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

  useEffect(() => {
    const handleRemoteStream = (stream: MediaStream) => {
      setRemoteStream(stream);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
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

  useEffect(() => {
    const unsubscribe = realtimeBus.subscribe(async (payload: RealtimePayload) => {
      if (payload.type === 'call:signal') {
        const signal: SignalingMessage = payload.data;
        if (!currentUser) return;
        if (signal.targetId !== currentUser.id) return;

        if (signal.type === 'call_request') {
          const caller = (allUsers.length > 0 ? allUsers : ALL_PROFILES).find((u) => u.id === signal.senderId);
          const isVideo = signal.payload?.mediaType === 'video';
          setActiveCall({
            id: `call-${Date.now()}`,
            caller_id: signal.senderId,
            receiver_id: currentUser.id,
            type: isVideo ? 'video' : 'audio',
            status: 'ringing',
            conversation_id: signal.payload?.conversationId,
            is_incoming: true,
            caller,
            receiver: currentUser,
            receiverName: caller?.display_name || caller?.name || 'Bunny Friend',
            receiverAvatar: caller?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
            isVideo,
          });
          startRingtone();
        } else if (signal.type === 'call_accepted') {
          stopRingtone();
          setActiveCall((prev) => (prev ? { ...prev, status: 'connected' } : null));
        } else if (signal.type === 'call_rejected' || signal.type === 'call_ended') {
          stopRingtone();
          endCall();
        } else if (webrtcRef.current) {
          await webrtcRef.current.handleSignal(signal);
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [currentUser, allUsers]);

  const startCall = async (
    targetUserId: string,
    typeOrVideo: 'audio' | 'video' | boolean = 'audio',
    conversationId?: string
  ) => {
    if (!currentUser || !webrtcRef.current) return;
    const isVideo = typeOrVideo === 'video' || typeOrVideo === true;
    const receiver = (allUsers.length > 0 ? allUsers : ALL_PROFILES).find((u) => u.id === targetUserId);

    setActiveCall({
      id: `call-${Date.now()}`,
      caller_id: currentUser.id,
      receiver_id: targetUserId,
      type: isVideo ? 'video' : 'audio',
      status: 'calling',
      conversation_id: conversationId,
      is_incoming: false,
      caller: currentUser,
      receiver,
      receiverName: receiver?.display_name || receiver?.name || 'Bunny Friend',
      receiverAvatar: receiver?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
      isVideo,
    });

    try {
      const stream = await webrtcRef.current.initializeMedia(isVideo);
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      realtimeBus.emit({
        type: 'call:signal',
        senderId: currentUser.id,
        targetId: targetUserId,
        data: {
          type: 'call_request',
          senderId: currentUser.id,
          targetId: targetUserId,
          payload: { mediaType: isVideo ? 'video' : 'audio', conversationId },
        },
        timestamp: new Date().toISOString(),
      });

      // Simulation timeout: if peer does not answer in 3 seconds in demo, auto-connect for delightful preview
      setTimeout(() => {
        setActiveCall((prev) => {
          if (prev && prev.status === 'calling') {
            return { ...prev, status: 'connected' };
          }
          return prev;
        });
      }, 3000);
    } catch (e) {
      console.warn('Could not acquire media devices, continuing in demo mode:', e);
      setTimeout(() => {
        setActiveCall((prev) => (prev ? { ...prev, status: 'connected' } : null));
      }, 1000);
    }
  };

  const acceptCall = async () => {
    if (!activeCall || !webrtcRef.current || !currentUser) return;
    stopRingtone();

    try {
      const stream = await webrtcRef.current.initializeMedia(activeCall.isVideo || activeCall.type === 'video');
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (e) {
      console.warn('Simulated audio/video on accept:', e);
    }

    setActiveCall((prev) => (prev ? { ...prev, status: 'connected' } : null));

    realtimeBus.emit({
      type: 'call:signal',
      senderId: currentUser.id,
      targetId: activeCall.caller_id,
      data: {
        type: 'call_accepted',
        senderId: currentUser.id,
        targetId: activeCall.caller_id,
      },
      timestamp: new Date().toISOString(),
    });
  };

  const rejectCall = () => {
    if (!activeCall || !currentUser) return;
    stopRingtone();

    realtimeBus.emit({
      type: 'call:signal',
      senderId: currentUser.id,
      targetId: activeCall.caller_id,
      data: {
        type: 'call_rejected',
        senderId: currentUser.id,
        targetId: activeCall.caller_id,
      },
      timestamp: new Date().toISOString(),
    });

    endCall();
  };

  const endCall = () => {
    stopRingtone();
    if (webrtcRef.current) {
      webrtcRef.current.endCall();
    }
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }
    setRemoteStream(null);
    setActiveCall(null);
    setIsAudioMuted(false);
    setIsVideoMuted(false);
    setIsScreenSharing(false);
  };

  const toggleAudio = () => {
    if (webrtcRef.current) {
      const muted = webrtcRef.current.toggleAudio();
      setIsAudioMuted(muted);
    }
  };

  const toggleVideo = () => {
    if (webrtcRef.current) {
      const muted = webrtcRef.current.toggleVideo();
      setIsVideoMuted(muted);
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        setLocalStream(screenStream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }
        setIsScreenSharing(true);
        screenStream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          webrtcRef.current?.startLocalMedia(true).then((stream) => {
            setLocalStream(stream);
          });
        };
      } else {
        const stream = await webrtcRef.current?.startLocalMedia(true);
        if (stream) setLocalStream(stream);
        setIsScreenSharing(false);
      }
    } catch (e) {
      console.warn('Screen share toggled:', e);
      setIsScreenSharing((prev) => !prev);
    }
  };

  const switchCamera = async () => {
    if (webrtcRef.current) {
      return await webrtcRef.current.switchCamera();
    }
    return false;
  };

  return (
    <CallContext.Provider
      value={{
        activeCall,
        callState,
        localStream,
        remoteStream,
        isAudioMuted,
        isVideoMuted,
        isMuted: isAudioMuted,
        isVideoOff: isVideoMuted,
        isScreenSharing,
        callDuration,
        localVideoRef,
        remoteVideoRef,
        startCall,
        acceptCall,
        rejectCall,
        endCall,
        toggleAudio,
        toggleMute: toggleAudio,
        toggleVideo,
        toggleScreenShare,
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
