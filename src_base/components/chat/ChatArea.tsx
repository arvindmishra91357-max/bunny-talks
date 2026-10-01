import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../../context/ChatContext';
import { useRealtime } from '../../context/RealtimeContext';
import { useCall } from '../../context/CallContext';
import { MessageItem } from './MessageItem';
import { ChatInput } from './ChatInput';
import { InChatSearch } from './InChatSearch';
import {
  Phone,
  Video,
  Search,
  MoreVertical,
  ShieldCheck,
  ChevronLeft,
  ChevronDown,
  Info,
  Volume2,
} from 'lucide-react';
import { Message } from '../../types';

interface ChatAreaProps {
  onBackToConversations: () => void;
  onOpenLightbox: (url: string, type: 'image' | 'video') => void;
  onForwardMessage: (msg: Message) => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  onBackToConversations,
  onOpenLightbox,
  onForwardMessage,
}) => {
  const {
    activeConversation,
    messages,
    isDetailsOpen,
    setIsDetailsOpen,
    inChatSearchQuery,
    setInChatSearchQuery,
  } = useChat();

  const { getUserPresence, getTypingLabel } = useRealtime();
  const { startCall } = useCall();

  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [showInChatSearch, setShowInChatSearch] = useState<boolean>(false);
  const [showScrollBottom, setShowScrollBottom] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messageContainerRef = useRef<HTMLDivElement | null>(null);

  const isGroup = activeConversation?.type === 'group';
  const otherUser = activeConversation?.other_user;
  const presence = otherUser ? getUserPresence(otherUser.id) : null;
  const typingLabel = activeConversation ? getTypingLabel(activeConversation.id) : null;

  // Auto-scroll to bottom on messages update
  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  };

  useEffect(() => {
    scrollToBottom(false);
  }, [activeConversation?.id]);

  useEffect(() => {
    if (!showScrollBottom) {
      scrollToBottom(true);
    }
  }, [messages.length]);

  // Handle scroll detection for "Scroll to bottom" button
  const handleScroll = () => {
    if (!messageContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = messageContainerRef.current;
    const distanceToBottom = scrollHeight - scrollTop - clientHeight;
    setShowScrollBottom(distanceToBottom > 240);
  };

  const handleJumpToMessage = (id: string) => {
    const el = document.getElementById(`msg-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('bg-indigo-900/30', 'ring-2', 'ring-indigo-500/50');
      setTimeout(() => {
        el.classList.remove('bg-indigo-900/30', 'ring-2', 'ring-indigo-500/50');
      }, 2000);
    }
  };

  if (!activeConversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-950 text-slate-500 p-8 text-center select-none">
        <div className="w-16 h-16 rounded-2xl bg-indigo-950/40 border border-indigo-800/40 flex items-center justify-center text-indigo-400 mb-4 shadow-xl">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-200">Welcome to Nexus</h2>
        <p className="text-sm text-slate-400 max-w-sm mt-1.5">
          Select a chat from the sidebar or start a new conversation to begin real-time messaging with end-to-end security.
        </p>
      </div>
    );
  }

  const title = isGroup ? activeConversation.title : (otherUser?.name || otherUser?.display_name || 'Contact');
  const avatarUrl = isGroup
    ? activeConversation.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${activeConversation.title}`
    : otherUser?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUser?.username}`;

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 relative overflow-hidden select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between px-3 md:px-5 py-2.5 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 z-20">
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Mobile Back Button */}
          <button
            onClick={onBackToConversations}
            className="md:hidden p-1.5 -ml-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Conversation Avatar */}
          <div
            onClick={() => setIsDetailsOpen(!isDetailsOpen)}
            className="relative cursor-pointer flex-shrink-0"
          >
            <img
              src={avatarUrl}
              alt={title || ''}
              className="w-10 h-10 rounded-full object-cover bg-slate-800 border border-slate-700 shadow-sm"
            />
            {!isGroup && presence?.isOnline && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-950 rounded-full" />
            )}
          </div>

          {/* Title & Online Status */}
          <div
            onClick={() => setIsDetailsOpen(!isDetailsOpen)}
            className="cursor-pointer min-w-0"
          >
            <div className="flex items-center gap-1.5 truncate">
              <h2 className="font-bold text-sm text-slate-100 truncate">{title}</h2>
              {activeConversation.is_e2ee && (
                <span title="End-to-End Encrypted" className="flex-shrink-0 inline-flex">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                </span>
              )}
            </div>
            <div className="text-[11px] truncate">
              {typingLabel ? (
                <span className="text-indigo-400 font-semibold animate-pulse">{typingLabel}</span>
              ) : isGroup ? (
                <span className="text-slate-400">{activeConversation.members?.length || 0} members</span>
              ) : (
                <span className={presence?.isOnline ? 'text-emerald-400 font-medium' : 'text-slate-400'}>
                  {presence?.label || 'Offline'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls: Audio Call, Video Call, Search, Details */}
        <div className="flex items-center gap-1">
          {!isGroup && otherUser && (
            <>
              <button
                onClick={() => startCall(otherUser.id, 'audio', activeConversation.id)}
                className="p-2 rounded-xl text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors cursor-pointer"
                title="Start Voice Call"
              >
                <Phone className="w-4 h-4" />
              </button>

              <button
                onClick={() => startCall(otherUser.id, 'video', activeConversation.id)}
                className="p-2 rounded-xl text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors cursor-pointer"
                title="Start Video Call"
              >
                <Video className="w-4 h-4" />
              </button>
            </>
          )}

          <button
            onClick={() => setShowInChatSearch(!showInChatSearch)}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              showInChatSearch ? 'text-indigo-400 bg-slate-800' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Search Messages"
          >
            <Search className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsDetailsOpen(!isDetailsOpen)}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              isDetailsOpen ? 'text-indigo-400 bg-slate-800' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Chat Info & Media Gallery"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* In-Chat Search Bar */}
      {showInChatSearch && (
        <InChatSearch
          query={inChatSearchQuery}
          onQueryChange={setInChatSearchQuery}
          onClose={() => {
            setShowInChatSearch(false);
            setInChatSearchQuery('');
          }}
          messages={messages}
          onJumpToMessage={handleJumpToMessage}
        />
      )}

      {/* Messages Scroll Area */}
      <div
        ref={messageContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto py-3 space-y-1 chat-pattern relative"
      >
        {/* Encryption Safety Notice */}
        {activeConversation.is_e2ee && (
          <div className="flex justify-center my-3">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900/90 border border-emerald-500/20 text-emerald-400 text-[11px] shadow-sm max-w-sm text-center">
              <ShieldCheck className="w-4 h-4 flex-shrink-0" />
              <span>Messages are end-to-end encrypted. No one outside of this chat can read them.</span>
            </div>
          </div>
        )}

        {/* Message Items List */}
        {messages.map((msg) => (
          <MessageItem
            key={msg.id}
            message={msg}
            isGroup={isGroup}
            onReply={(replyMsg) => setReplyingTo(replyMsg)}
            onForward={(fwdMsg) => onForwardMessage(fwdMsg)}
            onOpenLightbox={onOpenLightbox}
            onScrollToMessage={handleJumpToMessage}
          />
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Floating Scroll to Bottom Button */}
      {showScrollBottom && (
        <button
          onClick={() => scrollToBottom(true)}
          className="absolute bottom-20 right-6 p-2.5 rounded-full bg-slate-800/95 hover:bg-slate-700 text-indigo-400 border border-slate-700 shadow-xl transition-transform active:scale-95 cursor-pointer z-20 flex items-center justify-center animate-fade-in"
          title="Scroll to latest message"
        >
          <ChevronDown className="w-5 h-5" />
        </button>
      )}

      {/* Bottom Message Input */}
      <ChatInput
        replyingTo={replyingTo}
        onCancelReply={() => setReplyingTo(null)}
        conversationId={activeConversation.id}
      />
    </div>
  );
};
