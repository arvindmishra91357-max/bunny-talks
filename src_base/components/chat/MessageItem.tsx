import React, { useState, useRef } from 'react';
import { Message, MessageReaction } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import {
  Check,
  CheckCheck,
  Clock,
  AlertCircle,
  CornerUpLeft,
  Smile,
  Copy,
  Share2,
  Trash2,
  Star,
  Download,
  Play,
  Pause,
  MapPin,
  UserCheck,
  ExternalLink,
  ShieldCheck,
  FileText,
  RotateCw,
} from 'lucide-react';

interface MessageItemProps {
  message: Message;
  isGroup: boolean;
  onReply: (msg: Message) => void;
  onForward: (msg: Message) => void;
  onOpenLightbox: (url: string, type: 'image' | 'video') => void;
  onScrollToMessage: (id: string) => void;
}

const REACTION_EMOJIS = ['❤️', '😂', '👍', '😮', '😢', '🔥', '👏', '🎉'];

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  isGroup,
  onReply,
  onForward,
  onOpenLightbox,
  onScrollToMessage,
}) => {
  const { currentUser } = useAuth();
  const { addReaction, deleteMessageForMe, deleteMessageForEveryone, starMessage, retryMessage } = useChat();

  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const isMine = message.sender_id === currentUser?.id;
  const isDeleted = Boolean(message.deleted_at);

  // Group reactions by emoji
  const groupedReactions = React.useMemo(() => {
    if (!message.reactions) return [];
    const counts: Record<string, { count: number; reactedByMe: boolean }> = {};
    message.reactions.forEach((r) => {
      if (!counts[r.reaction]) counts[r.reaction] = { count: 0, reactedByMe: false };
      counts[r.reaction].count++;
      if (r.user_id === currentUser?.id) counts[r.reaction].reactedByMe = true;
    });
    return Object.entries(counts).map(([emoji, data]) => ({
      emoji,
      count: data.count,
      reactedByMe: data.reactedByMe,
    }));
  }, [message.reactions, currentUser?.id]);

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setShowActionMenu(false);
  };

  const handleAudioPlayToggle = () => {
    if (!audioRef.current) return;
    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current.play().then(() => setIsPlayingAudio(true)).catch(() => {});
    }
  };

  // Render System Messages
  if (message.type === 'system' || isDeleted) {
    return (
      <div id={`msg-${message.id}`} className="flex justify-center my-3 transition-colors duration-500">
        <span className="text-[11px] text-slate-400 bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700/50 shadow-sm flex items-center gap-1.5 italic">
          {message.content}
          <span className="text-[9px] not-italic text-slate-500 ml-1">{formatTime(message.created_at)}</span>
        </span>
      </div>
    );
  }

  return (
    <div
      id={`msg-${message.id}`}
      className={`group relative flex gap-2 my-2 px-3 md:px-6 transition-all duration-300 ${
        isMine ? 'justify-end' : 'justify-start'
      }`}
    >
      {/* Sender Avatar for Group chat */}
      {isGroup && !isMine && (
        <img
          src={message.sender?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${message.sender?.username}`}
          alt={message.sender?.display_name}
          className="w-7 h-7 rounded-full object-cover self-end mb-1 border border-slate-700"
          title={message.sender?.display_name}
        />
      )}

      {/* Bubble Container */}
      <div className={`relative max-w-[85%] sm:max-w-[70%] md:max-w-[62%] flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
        {/* Forwarded Header */}
        {message.is_forwarded && (
          <span className="text-[10px] text-slate-400 flex items-center gap-1 mb-0.5 ml-1 italic">
            <Share2 className="w-3 h-3 text-slate-400" /> Forwarded
          </span>
        )}

        {/* Sender Name in Group */}
        {isGroup && !isMine && message.sender && (
          <span className="text-[11px] font-semibold text-indigo-400 mb-0.5 ml-1">
            {message.sender.display_name}
          </span>
        )}

        {/* Main Bubble */}
        <div
          className={`relative px-3.5 py-2 rounded-2xl shadow-sm text-sm break-words transition-all duration-200 ${
            isMine
              ? 'glass-bubble-mine rounded-br-xs'
              : 'glass-bubble-theirs rounded-bl-xs'
          }`}
        >
          {/* Reply Quote Preview */}
          {message.reply_to && (
            <div
              onClick={() => onScrollToMessage(message.reply_to!.id)}
              className={`mb-2 p-2 rounded-lg text-xs cursor-pointer border-l-3 transition-colors ${
                isMine
                  ? 'bg-black/20 border-white/60 hover:bg-black/30'
                  : 'bg-slate-800/80 border-indigo-500 hover:bg-slate-800'
              }`}
            >
              <div className="font-semibold text-[11px] text-indigo-300">
                {message.reply_to.sender?.display_name || 'Replied message'}
              </div>
              <div className="truncate text-slate-300 text-[11px]">
                {message.reply_to.content || 'Media message'}
              </div>
            </div>
          )}

          {/* MESSAGE CONTENT ACCORDING TO TYPE */}

          {/* 1. TEXT */}
          {message.type === 'text' && (
            <div className="whitespace-pre-wrap leading-relaxed">
              {message.content}
            </div>
          )}

          {/* 2. IMAGE */}
          {message.type === 'image' && (
            <div className="space-y-1.5">
              {message.attachments?.map((att) => (
                <div
                  key={att.id}
                  onClick={() => onOpenLightbox(att.file_url, 'image')}
                  className="rounded-xl overflow-hidden cursor-pointer max-w-sm max-h-80 border border-black/10 group/img relative"
                >
                  <img
                    src={att.file_url}
                    alt={att.file_name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover/img:scale-102"
                    loading="lazy"
                  />
                </div>
              ))}
              {message.content && <p className="mt-1 leading-relaxed">{message.content}</p>}
            </div>
          )}

          {/* 3. VIDEO */}
          {message.type === 'video' && (
            <div className="space-y-1.5">
              {message.attachments?.map((att) => (
                <div key={att.id} className="rounded-xl overflow-hidden max-w-sm bg-black">
                  <video
                    src={att.file_url}
                    controls
                    className="w-full max-h-72 rounded-xl object-contain"
                  />
                </div>
              ))}
              {message.content && <p className="mt-1">{message.content}</p>}
            </div>
          )}

          {/* 4. VOICE / AUDIO */}
          {(message.type === 'voice' || message.type === 'audio') && (
            <div className="flex items-center gap-3 py-1 min-w-[220px]">
              <button
                onClick={handleAudioPlayToggle}
                className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors flex-shrink-0 cursor-pointer shadow-sm"
              >
                {isPlayingAudio ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
              </button>

              <div className="flex-1 flex flex-col justify-center">
                {/* Visualizer Waveform Bars */}
                <div className="flex items-center gap-0.5 h-6">
                  {(message.metadata?.waveform || [0.3, 0.6, 0.9, 0.4, 0.8, 0.5, 0.7, 0.3, 0.9, 0.6, 0.4, 0.8, 0.5, 0.7, 0.3, 0.6]).map((h, i) => (
                    <span
                      key={i}
                      style={{ height: `${Math.max(4, h * 24)}px` }}
                      className={`w-1 rounded-full transition-all duration-150 ${
                        isPlayingAudio && (i / 16) <= (audioProgress / 100)
                          ? 'bg-white'
                          : isMine ? 'bg-white/40' : 'bg-indigo-400/50'
                      }`}
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between text-[10px] opacity-80 mt-0.5">
                  <span>0:{String(message.metadata?.duration || 8).padStart(2, '0')}</span>
                  <span className="text-[9px] uppercase font-bold tracking-wider">Voice Note</span>
                </div>
              </div>

              {/* Hidden audio element */}
              <audio
                ref={audioRef}
                src={message.attachments?.[0]?.file_url || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'}
                onEnded={() => {
                  setIsPlayingAudio(false);
                  setAudioProgress(0);
                }}
                onTimeUpdate={(e) => {
                  const target = e.currentTarget;
                  if (target.duration) {
                    setAudioProgress((target.currentTime / target.duration) * 100);
                  }
                }}
              />
            </div>
          )}

          {/* 5. DOCUMENT */}
          {message.type === 'document' && (
            <div className="flex items-center gap-3 p-2 bg-black/10 rounded-xl max-w-sm">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-xs truncate">
                  {message.metadata?.file_name || 'Document.pdf'}
                </div>
                <div className="text-[10px] opacity-75">
                  {message.metadata?.file_size ? `${(message.metadata.file_size / 1024).toFixed(1)} KB` : 'PDF Document'}
                </div>
              </div>
              <a
                href={message.attachments?.[0]?.file_url || '#'}
                download={message.metadata?.file_name || 'file'}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white transition-colors"
                title="Download file"
              >
                <Download className="w-4 h-4" />
              </a>
            </div>
          )}

          {/* 6. LOCATION */}
          {message.type === 'location' && (
            <div className="rounded-xl overflow-hidden bg-slate-900 border border-slate-700/60 max-w-xs">
              <div className="h-28 bg-gradient-to-tr from-slate-800 to-indigo-950 flex items-center justify-center relative">
                <div className="animate-bounce">
                  <MapPin className="w-8 h-8 text-rose-500 fill-rose-500/30" />
                </div>
                <span className="absolute bottom-2 left-2 text-[10px] bg-black/60 px-2 py-0.5 rounded text-white backdrop-blur-sm">
                  Live Location
                </span>
              </div>
              <div className="p-2.5">
                <div className="font-semibold text-xs text-white">
                  {message.metadata?.location_name || 'Current Shared Location'}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {message.metadata?.latitude?.toFixed(4)}, {message.metadata?.longitude?.toFixed(4)}
                </div>
                <a
                  href={`https://maps.google.com/?q=${message.metadata?.latitude || 37.7749},${message.metadata?.longitude || -122.4194}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300"
                >
                  Open in Google Maps <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}

          {/* 7. CONTACT */}
          {message.type === 'contact' && (
            <div className="flex items-center gap-3 p-2.5 bg-black/10 rounded-xl min-w-[200px]">
              <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white">
                <UserCheck className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <div className="font-semibold text-xs text-white">{message.metadata?.contact_name || 'Contact'}</div>
                <div className="text-[11px] opacity-75">{message.metadata?.contact_phone || '+1 (555) 019-2834'}</div>
              </div>
            </div>
          )}

          {/* Footer Metadata: Timestamp + Read Receipt */}
          <div className={`flex items-center justify-end gap-1 mt-1 text-[10px] select-none ${isMine ? 'text-indigo-100/80' : 'text-slate-400'}`}>
            {message.is_starred && <Star className="w-3 h-3 text-amber-300 fill-amber-300 mr-0.5" />}
            <span>{formatTime(message.created_at)}</span>

            {isMine && (
              <span className="ml-0.5 inline-flex items-center">
                {message.status === 'sending' && <Clock className="w-3 h-3 animate-spin opacity-70" />}
                {message.status === 'sent' && <Check className="w-3 h-3 text-slate-300" />}
                {message.status === 'delivered' && <CheckCheck className="w-3.5 h-3.5 text-slate-300" />}
                {message.status === 'read' && <CheckCheck className="w-3.5 h-3.5 text-cyan-300" />}
                {message.status === 'failed' && (
                  <button
                    onClick={() => retryMessage(message.id)}
                    className="flex items-center gap-1 text-rose-400 hover:text-rose-300"
                    title="Failed to send. Click to retry"
                  >
                    <AlertCircle className="w-3.5 h-3.5" />
                    <RotateCw className="w-3 h-3" />
                  </button>
                )}
              </span>
            )}
          </div>
        </div>

        {/* Reactions Display Strip */}
        {groupedReactions.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1 px-1">
            {groupedReactions.map(({ emoji, count, reactedByMe }) => (
              <button
                key={emoji}
                onClick={() => addReaction(message.id, emoji)}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border shadow-xs transition-transform active:scale-95 cursor-pointer ${
                  reactedByMe
                    ? 'bg-indigo-600/30 border-indigo-500/50 text-white'
                    : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span>{emoji}</span>
                {count > 1 && <span className="text-[10px]">{count}</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Hover Action Toolbar */}
      <div
        className={`absolute top-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-xl px-1.5 py-0.5 shadow-xl z-10 ${
          isMine ? 'right-full mr-2' : 'left-full ml-2'
        }`}
      >
        <button
          onClick={() => setShowReactionPicker(!showReactionPicker)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors cursor-pointer"
          title="React"
        >
          <Smile className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => onReply(message)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors cursor-pointer"
          title="Reply"
        >
          <CornerUpLeft className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => onForward(message)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors cursor-pointer"
          title="Forward"
        >
          <Share2 className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => starMessage(message.id)}
          className={`p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer ${
            message.is_starred ? 'text-amber-400' : 'text-slate-400 hover:text-amber-400'
          }`}
          title="Star"
        >
          <Star className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={handleCopy}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          title="Copy"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>

        {isMine ? (
          <button
            onClick={() => deleteMessageForEveryone(message.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
            title="Delete for everyone"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            onClick={() => deleteMessageForMe(message.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
            title="Delete for me"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Floating Reaction Picker */}
      {showReactionPicker && (
        <div
          className={`absolute -top-10 flex items-center gap-1 bg-slate-900 border border-slate-700 px-2 py-1 rounded-full shadow-2xl z-30 animate-fade-in ${
            isMine ? 'right-0' : 'left-0'
          }`}
        >
          {REACTION_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                addReaction(message.id, emoji);
                setShowReactionPicker(false);
              }}
              className="hover:scale-125 transition-transform text-base p-1 cursor-pointer"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
