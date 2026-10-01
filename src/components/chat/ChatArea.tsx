import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { useCall } from '../../context/CallContext';
import { MessageItem } from './MessageItem';
import { ChatInput } from './ChatInput';
import { InChatSearch } from './InChatSearch';
import { EmptyState } from '../common/EmptyState';
import { 
  ArrowLeft, 
  Phone, 
  Video, 
  Search, 
  MoreVertical, 
  ShieldAlert, 
  Trash2, 
  BellOff, 
  Info
} from 'lucide-react';

export const ChatArea: React.FC = () => {
  const { 
    activeConversation, 
    currentMessages, 
    setActiveTab, 
    setReplyingTo, 
    setForwardingMessage, 
    setLightboxMedia,
    setReportModalTarget,
    typingUsers,
    showToast 
  } = useChat();

  const { currentUser } = useAuth();
  const { startCall } = useCall();

  const [inChatSearchOpen, setInChatSearchOpen] = useState(false);
  const [inChatSearchQuery, setInChatSearchQuery] = useState('');
  const [showMenu, setShowMenu] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const isDirect = activeConversation?.type === 'direct';
  const otherUser = activeConversation?.other_user;
  const isOnline = isDirect && otherUser?.is_online;
  const displayName = isDirect ? otherUser?.name || 'User' : activeConversation?.title || 'Chat';
  const avatarUrl = isDirect ? otherUser?.avatar_url || '/assets/bunny-icon.png' : activeConversation?.avatar_url || '/assets/bunny-icon.png';

  // Auto-scroll on messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages.length]);

  if (!activeConversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-bunny-bg p-6">
        <EmptyState
          icon="🐰"
          title="Select a conversation"
          description="Choose a chat from the sidebar or start a new conversation to begin messaging."
        />
      </div>
    );
  }

  // Filter messages if search is active
  const displayedMessages = inChatSearchQuery.trim()
    ? currentMessages.filter((m) =>
        m.content.toLowerCase().includes(inChatSearchQuery.toLowerCase())
      )
    : currentMessages;

  const currentTypingList = activeConversation.id
    ? typingUsers[activeConversation.id] || []
    : [];

  return (
    <div className="flex-1 flex flex-col h-full bg-bunny-bg overflow-hidden relative">
      {/* Chat Room Header */}
      <header className="h-16 px-4 md:px-5 bg-white/90 dark:bg-[#181524]/90 backdrop-blur-xl border-b border-bunny-border flex items-center justify-between sticky top-0 z-20 select-none">
        <div className="flex items-center gap-3 min-w-0">
          {/* Back button for mobile */}
          <button
            onClick={() => setActiveTab('chats')}
            className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center text-bunny-ink bg-bunny-border/40 active:scale-95 transition-all -ml-1 flex-shrink-0"
            title="Back to Chats"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          {/* Avatar with live status */}
          <div className="relative flex-shrink-0">
            <img
              src={avatarUrl}
              alt={displayName}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-white dark:ring-[#181524] shadow-sm"
            />
            {isOnline && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-[#181524] shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            )}
          </div>

          {/* Title & Status Subtitle */}
          <div className="min-w-0">
            <h2 className="text-sm font-extrabold text-bunny-ink truncate leading-tight">
              {displayName}
            </h2>
            <p className="text-[11px] text-bunny-muted truncate">
              {isDirect
                ? isOnline
                  ? '● Active now'
                  : otherUser?.last_seen_at
                  ? 'Last seen recently'
                  : 'Offline'
                : `${activeConversation.members.length} members`}
            </p>
          </div>
        </div>

        {/* Right Action Icons: Voice Call, Video Call, More */}
        <div className="flex items-center gap-1.5 md:gap-2">
          {isDirect && otherUser && (
            <>
              <button
                onClick={() => startCall(otherUser.id, 'audio', activeConversation.id)}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-bunny-muted hover:text-[#ff607d] hover:bg-[#ff607d]/10 transition-all active:scale-95"
                title="Voice Call"
              >
                <Phone className="w-4 h-4" />
              </button>

              <button
                onClick={() => startCall(otherUser.id, 'video', activeConversation.id)}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-bunny-muted hover:text-[#7b5cf5] hover:bg-[#7b5cf5]/10 transition-all active:scale-95"
                title="Video Call"
              >
                <Video className="w-4 h-4" />
              </button>
            </>
          )}

          {/* More Menu Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-bunny-muted hover:text-bunny-ink hover:bg-bunny-border/50 transition-colors"
              title="More options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white dark:bg-[#201c2e] border border-bunny-border shadow-[0_8px_30px_rgba(0,0,0,0.15)] p-1.5 z-40 animate-in zoom-in-95 duration-100">
                  <button
                    onClick={() => {
                      showToast('Notifications muted 🔕');
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-bunny-ink hover:bg-bunny-border/50 text-left transition-colors"
                  >
                    <BellOff className="w-4 h-4 text-bunny-muted" />
                    <span>Mute Chat</span>
                  </button>

                  {isDirect && otherUser && (
                    <button
                      onClick={() => {
                        setReportModalTarget({ id: otherUser.id, name: otherUser.name, type: 'user' });
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-500/10 text-left transition-colors"
                    >
                      <ShieldAlert className="w-4 h-4" />
                      <span>Report User</span>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Messages Stream Container */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-2 bg-gradient-to-b from-transparent to-bunny-surface-container/30">
        {/* Date Divider */}
        <div className="flex justify-center my-3">
          <span className="px-3 py-1 rounded-full bg-white/70 dark:bg-white/5 border border-bunny-border/60 text-bunny-muted text-[10px] font-bold shadow-xs">
            Today
          </span>
        </div>

        {/* Message Items */}
        {displayedMessages.map((msg) => (
          <MessageItem
            key={msg.id}
            message={msg}
            isGroup={activeConversation.type === 'group'}
            onReply={(m) => setReplyingTo(m)}
            onForward={(m) => setForwardingMessage(m)}
            onOpenLightbox={(url, type) => setLightboxMedia({ url, type, title: displayName })}
          />
        ))}

        {/* Live Typing Indicator */}
        {currentTypingList.length > 0 && (
          <div className="flex items-center gap-2 my-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
            <div className="px-3.5 py-2 rounded-2xl rounded-bl-sm bg-white dark:bg-[#201c2e] border border-bunny-border text-xs text-bunny-muted flex items-center gap-2 shadow-xs">
              <span className="font-semibold text-[11px] text-[#ff607d]">
                {currentTypingList.join(', ')} is typing
              </span>
              <span className="flex items-center gap-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff607d] animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff607d] animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff607d] animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Composer */}
      <ChatInput placeholder={`Message ${displayName}...`} />
    </div>
  );
};
