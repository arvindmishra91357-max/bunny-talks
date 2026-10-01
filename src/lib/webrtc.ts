// ============================================================================
// WEBRTC CALLING ENGINE & REALTIME SIGNALING
// Pure peer-to-peer audio/video streaming with STUN ICE servers
// ============================================================================

export interface SignalingMessage {
  type: 
    | 'offer' 
    | 'answer' 
    | 'ice-candidate' 
    | 'call-ended' 
    | 'call-rejected'
    | 'call_request'
    | 'call_accepted'
    | 'call_rejected'
    | 'call_ended';
  callId?: string;
  senderId: string;
  targetId: string;
  sdp?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
  payload?: {
    mediaType?: 'audio' | 'video';
    conversationId?: string;
  };
}

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
};

export class WebRTCManager {
  private peerConnection: RTCPeerConnection | null = null;
  public localStream: MediaStream | null = null;
  public remoteStream: MediaStream | null = null;
  private onRemoteStreamCallback: ((stream: MediaStream) => void) | null = null;
  private onSignalSendCallback: ((signal: SignalingMessage) => void) | null = null;
  private onIceConnectionStateChange: ((state: RTCIceConnectionState) => void) | null = null;

  public isAudioMuted = false;
  public isVideoMuted = false;

  constructor(
    onRemoteStream: (stream: MediaStream) => void,
    onSignalSend: (signal: SignalingMessage) => void,
    onIceStateChange?: (state: RTCIceConnectionState) => void
  ) {
    this.onRemoteStreamCallback = onRemoteStream;
    this.onSignalSendCallback = onSignalSend;
    this.onIceConnectionStateChange = onIceStateChange || null;
  }

  async startLocalMedia(video: boolean): Promise<MediaStream> {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: video ? { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } : false,
      });
      return this.localStream;
    } catch (error) {
      console.warn('Could not get requested video/audio stream:', error);
      if (video) {
        this.localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        return this.localStream;
      }
      throw error;
    }
  }

  async initializeMedia(video: boolean): Promise<MediaStream> {
    return this.startLocalMedia(video);
  }

  private createPeerConnection(callId: string, currentUserId: string, targetUserId: string) {
    this.cleanupPeerConnection();

    this.peerConnection = new RTCPeerConnection(ICE_SERVERS);
    this.remoteStream = new MediaStream();

    if (this.onRemoteStreamCallback) {
      this.onRemoteStreamCallback(this.remoteStream);
    }

    // Add local tracks to peer connection
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        if (this.localStream && this.peerConnection) {
          this.peerConnection.addTrack(track, this.localStream);
        }
      });
    }

    // Handle remote tracks
    this.peerConnection.ontrack = (event) => {
      event.streams[0]?.getTracks().forEach((track) => {
        if (this.remoteStream && !this.remoteStream.getTracks().some(t => t.id === track.id)) {
          this.remoteStream.addTrack(track);
        }
      });
    };

    // Send ICE candidates to peer via signaling
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.onSignalSendCallback) {
        this.onSignalSendCallback({
          type: 'ice-candidate',
          callId,
          senderId: currentUserId,
          targetId: targetUserId,
          candidate: event.candidate.toJSON(),
        });
      }
    };

    this.peerConnection.oniceconnectionstatechange = () => {
      if (this.peerConnection && this.onIceConnectionStateChange) {
        this.onIceConnectionStateChange(this.peerConnection.iceConnectionState);
      }
    };
  }

  async createOffer(callId: string, currentUserId: string, targetUserId: string): Promise<RTCSessionDescriptionInit> {
    this.createPeerConnection(callId, currentUserId, targetUserId);
    if (!this.peerConnection) throw new Error('Peer connection failed to initialize');

    const offer = await this.peerConnection.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
    });
    await this.peerConnection.setLocalDescription(offer);

    return offer;
  }

  async handleOffer(
    callId: string,
    currentUserId: string,
    targetUserId: string,
    sdp: RTCSessionDescriptionInit
  ): Promise<RTCSessionDescriptionInit> {
    this.createPeerConnection(callId, currentUserId, targetUserId);
    if (!this.peerConnection) throw new Error('Peer connection failed to initialize');

    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);

    return answer;
  }

  async handleAnswer(sdp: RTCSessionDescriptionInit) {
    if (this.peerConnection) {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
    }
  }

  async handleIceCandidate(candidate: RTCIceCandidateInit) {
    if (this.peerConnection) {
      try {
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.warn('Failed to add received ICE candidate:', e);
      }
    }
  }

  async handleSignal(signal: SignalingMessage) {
    if (signal.type === 'offer' && signal.sdp && signal.callId) {
      const answer = await this.handleOffer(signal.callId, signal.targetId, signal.senderId, signal.sdp);
      if (this.onSignalSendCallback) {
        this.onSignalSendCallback({
          type: 'answer',
          callId: signal.callId,
          senderId: signal.targetId,
          targetId: signal.senderId,
          sdp: answer,
        });
      }
    } else if (signal.type === 'answer' && signal.sdp) {
      await this.handleAnswer(signal.sdp);
    } else if (signal.type === 'ice-candidate' && signal.candidate) {
      await this.handleIceCandidate(signal.candidate);
    }
  }

  toggleAudio(mute?: boolean): boolean {
    if (!this.localStream) return false;
    const audioTrack = this.localStream.getAudioTracks()[0];
    if (audioTrack) {
      this.isAudioMuted = mute !== undefined ? mute : !audioTrack.enabled;
      audioTrack.enabled = !this.isAudioMuted;
      return this.isAudioMuted;
    }
    return false;
  }

  toggleVideo(mute?: boolean): boolean {
    if (!this.localStream) return false;
    const videoTrack = this.localStream.getVideoTracks()[0];
    if (videoTrack) {
      this.isVideoMuted = mute !== undefined ? mute : !videoTrack.enabled;
      videoTrack.enabled = !this.isVideoMuted;
      return this.isVideoMuted;
    }
    return false;
  }

  async switchCamera(): Promise<boolean> {
    if (!this.localStream) return false;
    const currentVideoTrack = this.localStream.getVideoTracks()[0];
    if (!currentVideoTrack) return false;

    try {
      const currentSettings = currentVideoTrack.getSettings();
      const newFacingMode = currentSettings.facingMode === 'user' ? 'environment' : 'user';

      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { exact: newFacingMode } }
      });
      const newVideoTrack = newStream.getVideoTracks()[0];

      if (this.peerConnection) {
        const senders = this.peerConnection.getSenders();
        const videoSender = senders.find(s => s.track?.kind === 'video');
        if (videoSender) {
          videoSender.replaceTrack(newVideoTrack);
        }
      }

      currentVideoTrack.stop();
      this.localStream.removeTrack(currentVideoTrack);
      this.localStream.addTrack(newVideoTrack);
      return true;
    } catch (e) {
      console.warn('Could not switch camera:', e);
      return false;
    }
  }

  cleanupPeerConnection() {
    if (this.peerConnection) {
      this.peerConnection.ontrack = null;
      this.peerConnection.onicecandidate = null;
      this.peerConnection.close();
      this.peerConnection = null;
    }
  }

  endCall() {
    this.cleanupPeerConnection();
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }
    this.remoteStream = null;
    this.isAudioMuted = false;
    this.isVideoMuted = false;
  }
}
