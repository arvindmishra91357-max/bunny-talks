import React from 'react';
import { Conversation } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useRealtime } from '../../context/RealtimeContext';
import { Pin, VolumeX, ShieldCheck, Check, CheckCheck } from 'lucide-react';

interface ConversationCardProps {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
  onPin: () => void;
  onMute: () => void;
  onArchive: () => void;
  onDelete: () => void;
  onMarkUnread: () => void;
}

export const ConversationCard: React.FC<ConversationCardProps> = ({
  conversation,
  isActive,
  onClick,
  onPin,
  onMute,
  onArchive,
  onDelete,
  onMarkUnread,
}) => {
  const { currentUser } = useAuth();
  const { getUserPresence, getTypingLabel } = useRealtime();

  const isGroup = conversation.type === 'group';
  const otherUser = conversation.other_user;
  const presence = otherUser ? getUserPresence(otherUser.id) : null;
  const isOnline = isGroup ? false : presence?.isOnline;

  const typingLabel = getTypingLabel(conversation.id);

  // Format time
  const formatTime = (isoString?: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    const isThisWeek = now.getTime() - date.getTime() < 86400000 * 6;
    if (isThisWeek) {
      return date.toLocaleDateString([], { weekday: 'short' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const displayName = isGroup
    ? conversation.title || 'Group Chat'
    : otherUser?.display_name || 'Direct Message';

  const avatarUrl = isGroup
    ? conversation.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${conversation.title}`
    : otherUser?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUser?.username}`;

  const lastMsg = conversation.last_message;
  const isLastMsgMine = lastMsg?.sender_id === currentUser?.id;

  const renderLastMessageSnippet = () => {
    if (typingLabel) {
      return (
        <span className="text-indigo-400 font-medium animate-pulse flex items-center gap-1">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping"></span>
          {typingLabel}
        </span>
      );
    }

    if (!lastMsg) {
      return <span className="text-slate-400 italic">No messages yet</span>;
    }

    if (lastMsg.deleted_at) {
      return <span className="italic text-slate-500">This message was deleted</span>;
    }

    let prefix = '';
    if (isGroup && !isLastMsgMine && lastMsg.sender) {
      prefix = `${(lastMsg.sender.name || lastMsg.sender.display_name || 'User').split(' ')[0]}: `;
    }

    let contentSnippet = lastMsg.content;
    if (lastMsg.type === 'voice') contentSnippet = '🎤 Voice message';
    else if (lastMsg.type === 'image') contentSnippet = '📷 Photo';
    else if (lastMsg.type === 'video') contentSnippet = '🎥 Video';
    else if (lastMsg.type === 'document') contentSnippet = '📄 Document';
    else if (lastMsg.type === 'location') contentSnippet = '📍 Location';
    else if (lastMsg.type === 'contact') contentSnippet = '👤 Contact';

    return (
      <span className="truncate flex items-center gap-1">
        {isLastMsgMine && (
          <span className="flex-shrink-0 inline-flex">
            {lastMsg.status === 'read' ? (
              <CheckCheck className="w-3.5 h-3.5 text-cyan-400" />
            ) : lastMsg.status === 'delivered' ? (
              <CheckCheck className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <Check className="w-3.5 h-3.5 text-slate-500" />
            )}
          </span>
        )}
        <span className="truncate">{prefix}{contentSnippet}</span>
      </span>
    );
  };

  return (
    <div
      onClick={onClick}
      className={`group relative flex items-center gap-3 px-3 py-2.5 mx-2 rounded-xl cursor-pointer transition-all duration-200 select-none ${
        isActive
          ? 'bg-slate-800/90 text-white border border-emerald-500/30 shadow-sm'
          : 'hover:bg-slate-900/80 text-slate-300'
      }`}
    >
      {/* Avatar with status indicator */}
      <div className="relative flex-shrink-0">
        <img
          src={avatarUrl}
          alt={displayName}
          className="w-12 h-12 rounded-full object-cover bg-slate-800 border border-slate-700/50 shadow-inner"
        />
        {isOnline && (
          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full shadow-sm" />
        )}
      </div>

      {/* Center Details */}
      <div className="flex-1 min-w-0 pr-1">
        <div className="flex items-center justify-between mb-0.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <h3 className={`font-semibold text-sm truncate ${isActive ? 'text-white' : 'text-slate-100'}`}>
              {displayName}
            </h3>
            {conversation.is_e2ee && (
              <span title="End-to-End Encrypted" className="flex-shrink-0 inline-flex">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-400 whitespace-nowrap ml-2">
            {formatTime(conversation.last_message_at || conversation.created_at)}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="min-w-0 flex-1 mr-2">{renderLastMessageSnippet()}</div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {conversation.is_muted && <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
            {conversation.is_pinned && <Pin className="w-3.5 h-3.5 text-emerald-400 rotate-45" />}
            {Boolean(conversation.unread_count && conversation.unread_count > 0) && (
              <span className="px-1.5 py-0.5 min-w-[18px] text-center text-[10px] font-bold text-slate-950 bg-emerald-500 rounded-full shadow-md animate-scale">
                {conversation.unread_count}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
