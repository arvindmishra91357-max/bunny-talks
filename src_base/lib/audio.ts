// ============================================================================
// AUDIO UTILITIES & SYNTHESIZER
// High quality audio recording, live waveform extraction, and Web Audio SFX
// ============================================================================

export class VoiceRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private animationFrameId: number | null = null;
  private stream: MediaStream | null = null;

  public isRecording = false;
  public duration = 0;
  private timerInterval: any = null;

  async start(
    onWaveformData?: (waveform: number[]) => void,
    onDurationUpdate?: (seconds: number) => void
  ): Promise<boolean> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioChunks = [];
      this.duration = 0;
      this.isRecording = true;

      // Setup Web Audio Analyser for live waveforms
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        this.audioContext = new AudioContextClass();
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 64;
        this.source = this.audioContext.createMediaStreamSource(this.stream);
        this.source.connect(this.analyser);

        const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        const updateWaveform = () => {
          if (!this.isRecording || !this.analyser) return;
          this.analyser.getByteFrequencyData(dataArray);
          
          // Normalize 16 bars between 0.1 and 1.0
          const bars: number[] = [];
          const step = Math.floor(dataArray.length / 16) || 1;
          for (let i = 0; i < 16; i++) {
            const val = dataArray[i * step] || 0;
            bars.push(Math.max(0.15, val / 255));
          }
          if (onWaveformData) onWaveformData(bars);

          this.animationFrameId = requestAnimationFrame(updateWaveform);
        };
        updateWaveform();
      } catch (err) {
        console.warn('AudioAnalyser could not be initialized:', err);
      }

      // Determine supported mimeType
      const mimeTypes = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4'];
      let selectedMimeType = '';
      for (const mime of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mime)) {
          selectedMimeType = mime;
          break;
        }
      }

      this.mediaRecorder = selectedMimeType 
        ? new MediaRecorder(this.stream, { mimeType: selectedMimeType })
        : new MediaRecorder(this.stream);

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(100);

      this.timerInterval = setInterval(() => {
        this.duration++;
        if (onDurationUpdate) onDurationUpdate(this.duration);
      }, 1000);

      return true;
    } catch (err) {
      console.error('Failed to access microphone:', err);
      return false;
    }
  }

  stop(): Promise<{ blob: Blob; url: string; duration: number; waveform: number[] }> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || !this.isRecording) {
        return reject(new Error('Recorder not active'));
      }

      this.isRecording = false;
      clearInterval(this.timerInterval);
      if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { 
          type: this.mediaRecorder?.mimeType || 'audio/webm' 
        });
        const url = URL.createObjectURL(audioBlob);

        // Generate synthetic waveform profile for the bubble visualizer
        const finalWaveform: number[] = Array.from({ length: 28 }, () => 
          parseFloat((Math.random() * 0.75 + 0.25).toFixed(2))
        );

        this.cleanup();
        resolve({
          blob: audioBlob,
          url,
          duration: Math.max(1, this.duration),
          waveform: finalWaveform
        });
      };

      try {
        this.mediaRecorder.stop();
      } catch (e) {
        this.cleanup();
        reject(e);
      }
    });
  }

  cancel() {
    this.isRecording = false;
    clearInterval(this.timerInterval);
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
      } catch (e) {}
    }
    this.cleanup();
  }

  private cleanup() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }
  }
}

// ============================================================================
// WEB AUDIO SOUND EFFECTS
// Synthesizes pleasant crisp UI feedback without relying on external assets
// ============================================================================

let sharedAudioCtx: AudioContext | null = null;
function getAudioContext(): AudioContext {
  if (!sharedAudioCtx || sharedAudioCtx.state === 'closed') {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    sharedAudioCtx = new AudioContextClass();
  }
  if (sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume().catch(() => {});
  }
  return sharedAudioCtx;
}

export function playMessageSentSound() {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(580, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.12);
  } catch (e) {}
}

export function playMessageReceivedSound() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'sine';

    osc1.frequency.setValueAtTime(650, now);
    osc1.frequency.setValueAtTime(980, now + 0.09);

    osc2.frequency.setValueAtTime(780, now);
    osc2.frequency.setValueAtTime(1170, now + 0.09);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.28);
    osc2.stop(now + 0.28);
  } catch (e) {}
}

let ringtoneInterval: any = null;

export function startRingtone() {
  stopRingtone();
  const playPulse = () => {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(480, now + 0.2);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.8);
    } catch (e) {}
  };

  playPulse();
  ringtoneInterval = setInterval(playPulse, 2400);
}

export function stopRingtone() {
  if (ringtoneInterval) {
    clearInterval(ringtoneInterval);
    ringtoneInterval = null;
  }
}
