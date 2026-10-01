import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../../context/ChatContext';
import { VoiceRecorder } from '../../lib/audio';
import { uploadMediaFile } from '../../lib/supabase';
import { 
  Send, 
  Paperclip, 
  Smile, 
  Mic, 
  Square, 
  Trash2, 
  X, 
  Image as ImageIcon,
  Sparkles
} from 'lucide-react';

interface ChatInputProps {
  placeholder?: string;
}

const COMMON_EMOJIS = ['🐰', '✨', '❤️', '😊', '😂', '🔥', '🎉', '👍', '☕', '🎧', '🥐', '🌿', '💬', '🕹️'];

export const ChatInput: React.FC<ChatInputProps> = ({ placeholder = 'Message...' }) => {
  const { 
    sendMessage, 
    replyingTo, 
    setReplyingTo, 
    sendTyping, 
    chatPreferences,
    showToast 
  } = useChat();

  const [text, setText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [liveWaveform, setLiveWaveform] = useState<number[]>([]);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const recorderRef = useRef<VoiceRecorder | null>(null);
  const typingTimeoutRef = useRef<any>(null);

  useEffect(() => {
    if (replyingTo && inputRef.current) {
      inputRef.current.focus();
    }
  }, [replyingTo]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);

    // Send typing event
    sendTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      sendTyping(false);
    }, 2000);
  };

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setText('');
    sendTyping(false);
    await sendMessage(trimmed, 'text', undefined, undefined, replyingTo?.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      if (chatPreferences.enter_to_send) {
        e.preventDefault();
        handleSend();
      }
    }
  };

  // Voice recording handlers
  const startVoiceRecording = async () => {
    try {
      recorderRef.current = new VoiceRecorder();
      const started = await recorderRef.current.start(
        (waveform) => setLiveWaveform(waveform),
        (duration) => setRecordDuration(duration)
      );

      if (started) {
        setIsRecordingVoice(true);
        showToast('Recording voice note 🎙️');
      } else {
        showToast('Microphone access denied', 'warning');
      }
    } catch (e) {
      console.warn('Microphone error:', e);
      showToast('Microphone error', 'warning');
    }
  };

  const cancelVoiceRecording = () => {
    if (recorderRef.current) {
      recorderRef.current.cancel();
      recorderRef.current = null;
    }
    setIsRecordingVoice(false);
    setRecordDuration(0);
    setLiveWaveform([]);
    showToast('Voice note cancelled');
  };

  const finishVoiceRecording = async () => {
    if (!recorderRef.current) return;
    const result = await recorderRef.current.stop();
    setIsRecordingVoice(false);
    setRecordDuration(0);
    setLiveWaveform([]);

    if (result && result.blob) {
      const uploadRes = await uploadMediaFile('chat-audio', result.blob, `voice_${Date.now()}.webm`);
      await sendMessage('Voice message', 'voice', uploadRes.url, {
        duration: result.duration || 5,
        waveform: result.waveform || [6, 12, 18, 14, 20, 16, 10, 8],
      });
      showToast('Voice message sent! 🎙️', 'success');
    }
  };

  // Image / File attachment
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const isImg = file.type.startsWith('image/');
    showToast(`Uploading ${file.name}...`);

    const bucket = isImg ? 'chat-images' : 'chat-documents';
    const uploadRes = await uploadMediaFile(bucket, file);

    await sendMessage(
      isImg ? 'Photo attachment' : file.name,
      isImg ? 'image' : 'document',
      uploadRes.url,
      { file_name: file.name, file_size: file.size, file_type: file.type },
      replyingTo?.id
    );

    e.target.value = '';
  };

  const addEmoji = (emoji: string) => {
    setText((prev) => prev + emoji);
    setShowEmojiPicker(false);
    if (inputRef.current) inputRef.current.focus();
  };

  return (
    <div className="p-3 md:p-4 bg-white/95 dark:bg-[#181524]/95 border-t border-bunny-border select-none relative backdrop-blur-md">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*,video/*,audio/*,application/pdf"
        className="hidden"
      />

      {/* Reply Preview Bar */}
      {replyingTo && (
        <div className="flex items-center justify-between mb-2.5 px-3 py-2 rounded-2xl bg-bunny-border/50 dark:bg-white/5 border border-bunny-border text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-1 h-8 rounded-full bg-[#ff607d]" />
            <div className="min-w-0">
              <span className="font-bold text-bunny-ink block text-[11px]">
                Replying to {replyingTo.sender?.name || 'User'}
              </span>
              <p className="text-bunny-muted text-[11px] truncate">
                {replyingTo.content}
              </p>
            </div>
          </div>
          <button
            onClick={() => setReplyingTo(null)}
            className="p-1 rounded-full text-bunny-muted hover:text-bunny-ink"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Emoji Picker Popover */}
      {showEmojiPicker && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setShowEmojiPicker(false)}
          />
          <div className="absolute bottom-full mb-2 left-4 p-2.5 rounded-2xl bg-white dark:bg-[#201c2e] border border-bunny-border shadow-[0_8px_30px_rgba(0,0,0,0.15)] z-40 animate-in zoom-in-95 duration-100 flex items-center gap-1.5 flex-wrap max-w-xs">
            {COMMON_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => addEmoji(emoji)}
                className="w-8 h-8 rounded-xl hover:bg-bunny-border/50 text-base flex items-center justify-center hover:scale-115 transition-transform"
              >
                {emoji}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Composer Row */}
      {isRecordingVoice ? (
        /* Voice Recording Active View */
        <div className="flex items-center justify-between gap-3 px-3 py-1.5 rounded-2xl bg-[#ffe8ed]/90 dark:bg-[#2e1d2c]/90 border border-[#ff607d]/40">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
            <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
              Recording 0:{recordDuration < 10 ? `0${recordDuration}` : recordDuration}
            </span>
            <div className="flex items-center gap-1 h-5">
              {(liveWaveform.length > 0 ? liveWaveform : [0.2, 0.5, 0.8, 0.4, 0.7, 0.3]).map((v, i) => (
                <span
                  key={i}
                  style={{ height: `${Math.max(4, v * 20)}px` }}
                  className="w-1 bg-[#ff607d] rounded-full transition-all"
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={cancelVoiceRecording}
              className="p-2 rounded-xl text-bunny-muted hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
              title="Cancel recording"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={finishVoiceRecording}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#ff607d] to-[#ff7b5f] text-white text-xs font-bold shadow-sm hover:opacity-95 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Note</span>
            </button>
          </div>
        </div>
      ) : (
        /* Normal Composer Input */
        <div className="flex items-center gap-2">
          {/* Attachment button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-10 h-10 rounded-2xl bg-bunny-border/40 hover:bg-bunny-border flex items-center justify-center text-bunny-muted hover:text-bunny-ink transition-colors flex-shrink-0"
            title="Attach file or photo"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          {/* Emoji button */}
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="w-10 h-10 rounded-2xl bg-bunny-border/40 hover:bg-bunny-border flex items-center justify-center text-bunny-muted hover:text-[#ff607d] transition-colors flex-shrink-0"
            title="Add emoji"
          >
            <Smile className="w-4 h-4" />
          </button>

          {/* Text Input */}
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={text}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="w-full bg-bunny-surface-container-low text-bunny-ink placeholder:text-bunny-muted text-xs md:text-sm px-4 py-3 rounded-2xl border border-bunny-border focus:border-[#ff607d] focus:bg-white dark:focus:bg-[#201c2e] outline-none shadow-inner transition-all"
            />
          </div>

          {/* Mic or Send button */}
          {text.trim() ? (
            <button
              onClick={handleSend}
              className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#ff607d] to-[#ff7b5f] text-white flex items-center justify-center shadow-[0_4px_16px_rgba(255,96,125,0.4)] hover:scale-105 active:scale-95 transition-all flex-shrink-0"
              title="Send message"
            >
              <Send className="w-4 h-4 stroke-[2.5]" />
            </button>
          ) : (
            <button
              onClick={startVoiceRecording}
              className="w-11 h-11 rounded-2xl bg-bunny-border/40 hover:bg-bunny-border text-bunny-muted hover:text-[#ff607d] flex items-center justify-center transition-all active:scale-95 flex-shrink-0"
              title="Record voice note"
            >
              <Mic className="w-4 h-4 stroke-[2.5]" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
