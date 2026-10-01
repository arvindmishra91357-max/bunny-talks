import React, { useState, useRef } from 'react';
import { Message } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import {
  Check,
  CheckCheck,
  Clock,
  CornerUpLeft,
  Smile,
  Copy,
  Share2,
  Trash2,
  Star,
  Pin,
  Play,
  Pause,
  Download,
  MoreVertical,
  FileText
} from 'lucide-react';

interface MessageItemProps {
  message: Message;
  isGroup: boolean;
  onReply: (msg: Message) => void;
  onForward: (msg: Message) => void;
  onOpenLightbox: (url: string, type: 'image' | 'video') => void;
}

const REACTION_EMOJIS = ['❤️', '😂', '👍', '😮', '🔥', '🐰', '✨'];

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  isGroup,
  onReply,
  onForward,
  onOpenLightbox,
}) => {
  const { currentUser } = useAuth();
  const { addReaction, deleteMessage, togglePinMessage, toggleStarMessage, showToast } = useChat();

  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const isMine = message.sender_id === currentUser?.id;
  const isDeleted = Boolean(message.deleted_at);

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
    try {
      return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    showToast('Copied to clipboard ✓');
    setShowActionMenu(false);
  };

  const toggleAudioPlayback = () => {
    if (!audioRef.current) {
      if (message.media_url) {
        audioRef.current = new Audio(message.media_url);
        audioRef.current.ontimeupdate = () => {
          if (audioRef.current) {
            setAudioProgress(
              (audioRef.current.currentTime / (audioRef.current.duration || 14)) * 100
            );
          }
        };
        audioRef.current.onended = () => {
          setIsPlayingAudio(false);
          setAudioProgress(0);
        };
      }
    }

    if (audioRef.current) {
      if (isPlayingAudio) {
        audioRef.current.pause();
        setIsPlayingAudio(false);
      } else {
        audioRef.current.play().catch(() => {});
        setIsPlayingAudio(true);
      }
    }
  };

  if (message.message_type === 'system') {
    return (
      <div className="flex justify-center my-3">
        <span className="px-3 py-1 rounded-full bg-bunny-border/50 text-bunny-muted text-[11px] font-semibold">
          {message.content}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`group flex items-end gap-2.5 my-2.5 max-w-[85%] md:max-w-[75%] transition-all ${
        isMine ? 'ml-auto flex-row-reverse' : 'mr-auto'
      }`}
    >
      {/* Sender Avatar for incoming group messages */}
      {!isMine && isGroup && (
        <img
          src={message.sender?.avatar_url || '/assets/alex.png'}
          alt={message.sender?.name || 'Sender'}
          className="w-7 h-7 rounded-full object-cover mb-1 ring-1 ring-bunny-border flex-shrink-0"
        />
      )}

      <div className="relative group/bubble flex flex-col">
        {/* Reply Quote Banner */}
        {message.reply_to && (
          <div
            className={`mb-1 p-2 rounded-xl text-[11px] border-l-3 ${
              isMine
                ? 'bg-black/10 border-white text-white/90'
                : 'bg-bunny-border/50 border-[#ff607d] text-bunny-muted'
            }`}
          >
            <span className="font-bold block text-[10px] opacity-80">
              {message.reply_to.sender_name}
            </span>
            <p className="truncate line-clamp-1">{message.reply_to.content}</p>
          </div>
        )}

        {/* Message Bubble Body */}
        <div
          className={`p-3.5 relative overflow-hidden transition-all ${
            isMine
              ? 'bg-gradient-to-tr from-[#ff607d] to-[#ff7b5f] text-white rounded-[22px] rounded-br-sm shadow-[0_4px_16px_rgba(255,96,125,0.28)]'
              : 'bg-white/95 dark:bg-[#201c2e]/95 border border-bunny-border shadow-[0_3px_12px_rgba(0,0,0,0.04)] text-bunny-ink rounded-[22px] rounded-bl-sm'
          }`}
        >
          {/* Sender Name in group */}
          {!isMine && isGroup && (
            <p className="text-[10px] font-extrabold text-[#7b5cf5] mb-1">
              {message.sender?.name}
            </p>
          )}

          {/* Voice Message Player */}
          {message.message_type === 'voice' ? (
            <div className="flex items-center gap-3 min-w-[200px] py-1">
              <button
                onClick={toggleAudioPlayback}
                className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm transition-transform active:scale-90 ${
                  isMine
                    ? 'bg-white text-[#ff607d]'
                    : 'bg-gradient-to-r from-[#ff607d] to-[#ff7b5f] text-white'
                }`}
              >
                {isPlayingAudio ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                )}
              </button>

              <div className="flex-1 flex flex-col gap-1">
                {/* Visualizer wave bars */}
                <div className="flex items-center gap-0.5 h-6">
                  {(message.metadata?.waveform || [4, 8, 12, 16, 20, 14, 18, 10, 14, 8, 4, 12, 18, 8]).map((h, i) => {
                    const isPlayed = (i / 14) * 100 <= audioProgress;
                    return (
                      <span
                        key={i}
                        style={{ height: `${Math.max(4, h)}px` }}
                        className={`w-1 rounded-full transition-all ${
                          isPlayed
                            ? isMine
                              ? 'bg-white'
                              : 'bg-[#ff607d]'
                            : isMine
                            ? 'bg-white/40'
                            : 'bg-bunny-border'
                        }`}
                      />
                    );
                  })}
                </div>
                <div className="flex justify-between items-center text-[10px] opacity-75">
                  <span>{isPlayingAudio ? 'Playing...' : 'Voice Note'}</span>
                  <span>0:{message.metadata?.duration || 14}</span>
                </div>
              </div>
            </div>
          ) : message.message_type === 'image' && message.media_url ? (
            /* Image Message */
            <div className="space-y-1.5">
              <div
                onClick={() => onOpenLightbox(message.media_url!, 'image')}
                className="rounded-xl overflow-hidden cursor-pointer max-w-xs max-h-64 shadow-inner"
              >
                <img
                  src={message.media_url}
                  alt="Attachment"
                  className="w-full h-full object-cover hover:scale-102 transition-transform duration-200"
                />
              </div>
              {message.content && (
                <p className="text-xs leading-relaxed mt-1">{message.content}</p>
              )}
            </div>
          ) : (
            /* Normal Text Message */
            <p className="text-xs md:text-[13px] leading-relaxed break-words whitespace-pre-wrap">
              {message.content}
            </p>
          )}

          {/* Time & Read Receipts */}
          <div
            className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
              isMine ? 'text-white/80' : 'text-bunny-muted'
            }`}
          >
            {message.is_pinned && <Pin className="w-2.5 h-2.5 fill-current" />}
            {message.is_starred && <Star className="w-2.5 h-2.5 fill-current text-amber-300" />}
            <span>{formatTime(message.created_at)}</span>

            {isMine && (
              <span className="ml-0.5">
                {message.status === 'read' ? (
                  <CheckCheck className="w-3 h-3 text-white" />
                ) : message.status === 'delivered' ? (
                  <CheckCheck className="w-3 h-3 text-white/70" />
                ) : message.status === 'sent' ? (
                  <Check className="w-3 h-3 text-white/70" />
                ) : (
                  <Clock className="w-3 h-3 text-white/50 animate-spin" />
                )}
              </span>
            )}
          </div>
        </div>

        {/* Reaction Badges on Bubble */}
        {groupedReactions.length > 0 && (
          <div
            className={`flex items-center gap-1 mt-1 flex-wrap ${
              isMine ? 'justify-end' : 'justify-start'
            }`}
          >
            {groupedReactions.map((r) => (
              <button
                key={r.emoji}
                onClick={() => addReaction(message.id, r.emoji)}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border transition-all active:scale-95 shadow-sm ${
                  r.reactedByMe
                    ? 'bg-[#ffe8ed] dark:bg-[#321c29] border-[#ff607d]/50 text-[#ff607d]'
                    : 'bg-white dark:bg-[#201c2e] border-bunny-border text-bunny-ink'
                }`}
              >
                <span>{r.emoji}</span>
                {r.count > 1 && <span>{r.count}</span>}
              </button>
            ))}
          </div>
        )}

        {/* Hover Action Toolbar */}
        <div
          className={`absolute top-0 opacity-0 group-hover:opacity-100 transition-opacity z-20 flex items-center gap-1 p-1 rounded-full bg-white/95 dark:bg-[#242035]/95 shadow-[0_4px_16px_rgba(0,0,0,0.12)] border border-bunny-border backdrop-blur-md ${
            isMine ? '-left-24' : '-right-24'
          }`}
        >
          {/* Reaction Picker Trigger */}
          <div className="relative">
            <button
              onClick={() => setShowReactionPicker(!showReactionPicker)}
              className="p-1 rounded-full hover:bg-bunny-border/60 text-bunny-muted hover:text-[#ff607d] transition-colors"
              title="React"
            >
              <Smile className="w-3.5 h-3.5" />
            </button>

            {showReactionPicker && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setShowReactionPicker(false)}
                />
                <div className="absolute bottom-full mb-1 left-0 flex items-center gap-1 p-1.5 rounded-full bg-white dark:bg-[#201c2e] border border-bunny-border shadow-lg z-40 animate-in zoom-in-95 duration-100">
                  {REACTION_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => {
                        addReaction(message.id, emoji);
                        setShowReactionPicker(false);
                      }}
                      className="w-7 h-7 flex items-center justify-center text-sm hover:scale-125 transition-transform"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <button
            onClick={() => onReply(message)}
            className="p-1 rounded-full hover:bg-bunny-border/60 text-bunny-muted hover:text-[#7b5cf5] transition-colors"
            title="Reply"
          >
            <CornerUpLeft className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onForward(message)}
            className="p-1 rounded-full hover:bg-bunny-border/60 text-bunny-muted hover:text-bunny-ink transition-colors"
            title="Forward"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleCopy}
            className="p-1 rounded-full hover:bg-bunny-border/60 text-bunny-muted hover:text-bunny-ink transition-colors"
            title="Copy Text"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => toggleStarMessage(message.id)}
            className="p-1 rounded-full hover:bg-bunny-border/60 text-bunny-muted hover:text-amber-500 transition-colors"
            title="Star Message"
          >
            <Star className="w-3.5 h-3.5" />
          </button>

          {isMine && (
            <button
              onClick={() => deleteMessage(message.id)}
              className="p-1 rounded-full hover:bg-rose-500/10 text-bunny-muted hover:text-rose-500 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
