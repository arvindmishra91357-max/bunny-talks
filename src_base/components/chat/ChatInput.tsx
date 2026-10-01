import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../../context/ChatContext';
import { useRealtime } from '../../context/RealtimeContext';
import { VoiceRecorder } from '../../lib/audio';
import { uploadMediaFile } from '../../lib/supabase';
import {
  Send,
  Paperclip,
  Smile,
  Mic,
  X,
  Image as ImageIcon,
  Film,
  FileText,
  MapPin,
  User as UserIcon,
  Trash2,
  StopCircle,
  Sparkles,
} from 'lucide-react';
import { Message } from '../../types';

interface ChatInputProps {
  replyingTo: Message | null;
  onCancelReply: () => void;
  conversationId: string;
}

const COMMON_EMOJIS = ['😊', '😂', '🔥', '❤️', '👍', '🎉', '🚀', '✨', '🙌', '💯', '😍', '👏', '🤔', '😎', '💡', '⚡'];

export const ChatInput: React.FC<ChatInputProps> = ({
  replyingTo,
  onCancelReply,
  conversationId,
}) => {
  const { sendMessage } = useChat();
  const { sendTypingStart, sendTypingStop } = useRealtime();

  const [text, setText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [waveformBars, setWaveformBars] = useState<number[]>([0.2, 0.4, 0.6, 0.3, 0.8]);
  const [isUploading, setIsUploading] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const fileTypeRef = useRef<'image' | 'video' | 'document'>('image');
  const recorderRef = useRef<VoiceRecorder | null>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [text]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setText(val);
    if (val.trim()) {
      sendTypingStart(conversationId);
    } else {
      sendTypingStop(conversationId);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendText();
    }
  };

  const handleSendText = async () => {
    if (!text.trim() || isUploading) return;
    const content = text.trim();
    setText('');
    sendTypingStop(conversationId);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    await sendMessage({
      content,
      type: 'text',
      replyToId: replyingTo?.id,
    });

    if (replyingTo) onCancelReply();
  };

  // Voice recording handlers
  const handleStartRecording = async () => {
    const recorder = new VoiceRecorder();
    recorderRef.current = recorder;
    const started = await recorder.start(
      (bars) => setWaveformBars(bars),
      (duration) => setRecordDuration(duration)
    );

    if (started) {
      setIsRecording(true);
      sendTypingStart(conversationId);
    }
  };

  const handleCancelRecording = () => {
    if (recorderRef.current) {
      recorderRef.current.cancel();
      recorderRef.current = null;
    }
    setIsRecording(false);
    setRecordDuration(0);
    sendTypingStop(conversationId);
  };

  const handleSendRecording = async () => {
    if (!recorderRef.current) return;
    try {
      setIsUploading(true);
      const { blob, duration, waveform } = await recorderRef.current.stop();
      setIsRecording(false);
      sendTypingStop(conversationId);

      // Upload audio file
      const { url } = await uploadMediaFile('chat-audio', blob, `voice_${Date.now()}.webm`);

      await sendMessage({
        content: `Voice message (0:${String(duration).padStart(2, '0')})`,
        type: 'voice',
        replyToId: replyingTo?.id,
        metadata: {
          duration,
          waveform,
        },
        attachments: [
          {
            file_url: url,
            file_type: 'audio/webm',
            file_name: `voice_${Date.now()}.webm`,
            file_size: blob.size,
          },
        ],
      });

      if (replyingTo) onCancelReply();
    } catch (e) {
      console.error('Failed to send voice note:', e);
    } finally {
      setIsUploading(false);
      setRecordDuration(0);
      recorderRef.current = null;
    }
  };

  // File Upload Handlers
  const triggerFileInput = (type: 'image' | 'video' | 'document') => {
    fileTypeRef.current = type;
    setShowAttachMenu(false);
    if (fileInputRef.current) {
      if (type === 'image') fileInputRef.current.accept = 'image/*';
      else if (type === 'video') fileInputRef.current.accept = 'video/*';
      else fileInputRef.current.accept = '*/*';
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const type = fileTypeRef.current;
      const bucket = type === 'image' ? 'chat-images' : type === 'video' ? 'chat-videos' : 'chat-documents';
      const { url } = await uploadMediaFile(bucket, file, file.name);

      await sendMessage({
        content: file.name,
        type: type as any,
        replyToId: replyingTo?.id,
        metadata: {
          file_name: file.name,
          file_size: file.size,
          file_type: file.type,
        },
        attachments: [
          {
            file_url: url,
            file_type: file.type,
            file_name: file.name,
            file_size: file.size,
          },
        ],
      });

      if (replyingTo) onCancelReply();
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleShareLocation = async () => {
    setShowAttachMenu(false);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          await sendMessage({
            content: 'Shared Location',
            type: 'location',
            replyToId: replyingTo?.id,
            metadata: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              location_name: 'Current Device Location',
            },
          });
          if (replyingTo) onCancelReply();
        },
        async () => {
          // Fallback mock coordinates
          await sendMessage({
            content: 'Shared Location',
            type: 'location',
            replyToId: replyingTo?.id,
            metadata: {
              latitude: 37.7749,
              longitude: -122.4194,
              location_name: 'San Francisco, CA',
            },
          });
          if (replyingTo) onCancelReply();
        }
      );
    }
  };

  const handleShareContact = async () => {
    setShowAttachMenu(false);
    await sendMessage({
      content: 'Contact: Rahul Sharma',
      type: 'contact',
      replyToId: replyingTo?.id,
      metadata: {
        contact_name: 'Rahul Sharma',
        contact_phone: '+91 98765 43210',
      },
    });
    if (replyingTo) onCancelReply();
  };

  return (
    <div className="relative border-t border-slate-800/80 bg-slate-950/90 backdrop-blur-md px-3 md:px-6 py-2.5">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Replying To preview banner */}
      {replyingTo && (
        <div className="flex items-center justify-between bg-slate-900/90 border border-slate-700/60 rounded-xl px-3 py-2 mb-2 text-xs animate-fade-in shadow-sm">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-1 h-7 rounded-full bg-indigo-500 flex-shrink-0" />
            <div className="truncate">
              <span className="font-semibold text-indigo-400 block truncate">
                Replying to {replyingTo.sender?.display_name || 'Message'}
              </span>
              <span className="text-slate-300 truncate block text-[11px]">
                {replyingTo.content || 'Media attachment'}
              </span>
            </div>
          </div>
          <button
            onClick={onCancelReply}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Voice Recording Mode UI */}
      {isRecording ? (
        <div className="flex items-center justify-between bg-rose-950/30 border border-rose-500/30 rounded-2xl px-4 py-2.5 animate-pulse">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
            <span className="font-mono text-sm font-semibold text-rose-300">
              0:{String(recordDuration).padStart(2, '0')}
            </span>
            <div className="flex items-center gap-1 h-5">
              {waveformBars.slice(0, 10).map((h, i) => (
                <span
                  key={i}
                  style={{ height: `${Math.max(4, h * 20)}px` }}
                  className="w-1 bg-rose-400 rounded-full transition-all duration-100"
                />
              ))}
            </div>
            <span className="text-xs text-slate-400 ml-2">Recording audio...</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCancelRecording}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer"
              title="Cancel recording"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button
              onClick={handleSendRecording}
              className="p-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white shadow-lg transition-transform active:scale-95 cursor-pointer"
              title="Send voice note"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Normal Chat Input Row */
        <div className="flex items-end gap-2">
          {/* Emoji button */}
          <div className="relative">
            <button
              onClick={() => {
                setShowEmojiPicker(!showEmojiPicker);
                setShowAttachMenu(false);
              }}
              className="p-2.5 rounded-xl text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors cursor-pointer flex-shrink-0"
              title="Emojis"
            >
              <Smile className="w-5 h-5" />
            </button>

            {/* Quick Emoji Picker Popover */}
            {showEmojiPicker && (
              <div className="absolute bottom-12 left-0 w-64 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-3 z-50 animate-scale">
                <div className="text-[11px] font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                  Quick Emojis
                </div>
                <div className="grid grid-cols-6 gap-2 text-xl">
                  {COMMON_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => {
                        setText((prev) => prev + emoji);
                        setShowEmojiPicker(false);
                      }}
                      className="p-1 hover:bg-slate-800 rounded-lg text-center cursor-pointer transition-transform hover:scale-125"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Attachment button */}
          <div className="relative">
            <button
              onClick={() => {
                setShowAttachMenu(!showAttachMenu);
                setShowEmojiPicker(false);
              }}
              className="p-2.5 rounded-xl text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors cursor-pointer flex-shrink-0"
              title="Attach media or document"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            {/* Attachment Menu Popover */}
            {showAttachMenu && (
              <div className="absolute bottom-12 left-0 w-52 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 animate-scale space-y-1">
                <button
                  onClick={() => triggerFileInput('image')}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer text-left"
                >
                  <div className="w-7 h-7 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  Photo / Image
                </button>

                <button
                  onClick={() => triggerFileInput('video')}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer text-left"
                >
                  <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                    <Film className="w-4 h-4" />
                  </div>
                  Video
                </button>

                <button
                  onClick={() => triggerFileInput('document')}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer text-left"
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  Document / File
                </button>

                <button
                  onClick={handleShareLocation}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer text-left"
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <MapPin className="w-4 h-4" />
                  </div>
                  Share Location
                </button>

                <button
                  onClick={handleShareContact}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer text-left"
                >
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  Contact Card
                </button>
              </div>
            )}
          </div>

          {/* Textarea Input */}
          <div className="flex-1 bg-slate-900/90 border border-slate-800 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 rounded-2xl px-3.5 py-2 transition-all">
            <textarea
              ref={textareaRef}
              rows={1}
              value={text}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="w-full bg-transparent resize-none text-sm text-slate-100 placeholder-slate-500 focus:outline-none max-h-32"
            />
          </div>

          {/* Mic / Send Button */}
          {text.trim() ? (
            <button
              onClick={handleSendText}
              disabled={isUploading}
              className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg transition-transform active:scale-95 cursor-pointer flex-shrink-0"
              title="Send message"
            >
              <Send className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleStartRecording}
              className="p-2.5 rounded-xl text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors cursor-pointer flex-shrink-0"
              title="Hold/tap to record voice message"
            >
              <Mic className="w-5 h-5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
