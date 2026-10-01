import React from 'react';
import { Conversation } from '../../types';
import { Pin, BellOff, Check, CheckCheck, Mic, Image, FileText } from 'lucide-react';

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onSelect: () => void;
}

export const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  isActive,
  onSelect,
}) => {
  const isDirect = conversation.type === 'direct';
  const otherUser = conversation.other_user;
  const displayName = isDirect ? otherUser?.name || 'User' : conversation.title || 'Group';
  const avatarUrl = isDirect ? otherUser?.avatar_url || '/assets/bunny-icon.png' : conversation.avatar_url || '/assets/bunny-icon.png';
  const isOnline = isDirect && otherUser?.is_online;
  const lastMsg = conversation.last_message;

  // Format relative timestamp
  const formatTime = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      const diffMs = Date.now() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'now';
      if (diffMins < 60) return `${diffMins}m`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h`;
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  const renderMessagePreview = () => {
    if (!lastMsg) {
      return (
        <span className="text-bunny-muted italic text-[11px]">
          No messages yet. Say hello! 🐰
        </span>
      );
    }

    if (lastMsg.message_type === 'voice') {
      return (
        <span className="flex items-center gap-1 text-[11px] text-bunny-muted">
          <Mic className="w-3 h-3 text-[#ff607d]" />
          <span>Voice message ({lastMsg.metadata?.duration || 14}s)</span>
        </span>
      );
    }

    if (lastMsg.message_type === 'image') {
      return (
        <span className="flex items-center gap-1 text-[11px] text-bunny-muted">
          <Image className="w-3 h-3 text-[#7b5cf5]" />
          <span>Photo attachment</span>
        </span>
      );
    }

    if (lastMsg.message_type === 'document') {
      return (
        <span className="flex items-center gap-1 text-[11px] text-bunny-muted">
          <FileText className="w-3 h-3 text-amber-500" />
          <span>Document</span>
        </span>
      );
    }

    return (
      <span className="truncate text-[11px] text-bunny-muted font-medium">
        {lastMsg.content}
      </span>
    );
  };

  return (
    <div
      onClick={onSelect}
      className={`flex items-center gap-3.5 p-3 rounded-2xl cursor-pointer transition-all border ${
        isActive
          ? 'bg-gradient-to-r from-[#ffe8ed]/90 to-[#f0ebff]/90 dark:from-[#2e1c2b] dark:to-[#221c38] border-[#ff607d]/40 shadow-sm'
          : 'bg-white/80 dark:bg-[#1f1b2c]/80 border-bunny-border/70 hover:bg-white dark:hover:bg-[#252035] hover:border-bunny-border'
      }`}
    >
      {/* Avatar Container with Online Indicator */}
      <div className="relative flex-shrink-0">
        <img
          src={avatarUrl}
          alt={displayName}
          className="w-12 h-12 rounded-full object-cover ring-2 ring-white dark:ring-[#201c2e] shadow-sm"
        />
        {isOnline && (
          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-[#201c2e] shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
        )}
      </div>

      {/* Main Details */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-1 mb-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <h4 className="text-xs font-bold text-bunny-ink truncate">
              {displayName}
            </h4>
            {conversation.is_pinned && (
              <Pin className="w-3 h-3 text-[#ff607d] fill-[#ff607d] flex-shrink-0" />
            )}
            {conversation.is_muted && (
              <BellOff className="w-3 h-3 text-bunny-muted flex-shrink-0" />
            )}
          </div>
          <span className="text-[10px] text-bunny-muted whitespace-nowrap flex-shrink-0">
            {formatTime(conversation.last_message_at)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 min-w-0">
            {lastMsg?.status === 'read' && (
              <CheckCheck className="w-3.5 h-3.5 text-[#ff607d] flex-shrink-0" />
            )}
            {lastMsg?.status === 'delivered' && (
              <CheckCheck className="w-3.5 h-3.5 text-bunny-muted flex-shrink-0" />
            )}
            {lastMsg?.status === 'sent' && (
              <Check className="w-3.5 h-3.5 text-bunny-muted flex-shrink-0" />
            )}
            {renderMessagePreview()}
          </div>

          {conversation.unread_count && conversation.unread_count > 0 ? (
            <span className="min-w-[18px] h-[18px] px-1.5 rounded-full bg-gradient-to-r from-[#ff607d] to-[#ff7b5f] text-white text-[9px] font-extrabold flex items-center justify-center shadow-[0_2px_8px_rgba(255,96,125,0.4)] flex-shrink-0">
              {conversation.unread_count}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
};
