import React from 'react';
import { useChat, FilterPill } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { ActiveSparksRail } from '../sparks/ActiveSparksRail';
import { ConversationItem } from './ConversationItem';
import { EmptyState } from '../common/EmptyState';
import { Search, X, Sparkles, Compass, Plus, MessageSquare, UsersRound } from 'lucide-react';

export const ChatList: React.FC = () => {
  const { 
    filteredConversations, 
    activeConversationId, 
    selectConversation, 
    searchQuery, 
    setSearchQuery, 
    filterPill, 
    setFilterPill,
    setActiveTab,
    setIsNewChatOpen,
    setIsCreateSparkOpen,
    conversations
  } = useChat();

  const { currentUser } = useAuth();

  const unreadCount = conversations.reduce((acc, c) => acc + (c.unread_count || 0), 0);
  const groupCount = conversations.filter((c) => c.type === 'group').length;

  const filterOptions: { id: FilterPill; label: string; count?: number }[] = [
    { id: 'all', label: 'All' },
    { id: 'unread', label: 'Unread', count: unreadCount > 0 ? unreadCount : undefined },
    { id: 'groups', label: 'Groups', count: groupCount > 0 ? groupCount : undefined },
    { id: 'channels', label: 'Channels' },
    { id: 'favorites', label: 'Pinned' },
  ];

  const handleSelectConv = (id: string) => {
    selectConversation(id);
    setActiveTab('room');
  };

  return (
    <div className="flex flex-col h-full bg-bunny-bg overflow-y-auto no-scrollbar pb-24 md:pb-6">
      {/* Top Welcome Section */}
      <div className="p-4 md:p-5 pb-2">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-bunny-muted">
              Welcome back
            </span>
            <h1 className="text-xl md:text-2xl font-extrabold text-bunny-ink tracking-tight">
              Good morning, {currentUser?.name?.split(' ')[0] || 'Maya'} ☀️
            </h1>
          </div>
          <button
            onClick={() => setIsNewChatOpen(true)}
            className="w-10 h-10 rounded-2xl bg-gradient-to-r from-[#ff607d] to-[#ff7b5f] text-white flex items-center justify-center shadow-[0_4px_14px_rgba(255,96,125,0.35)] active:scale-95 transition-transform"
            title="Compose new message"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Search Input Bar */}
        <div className="relative mb-3">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-bunny-muted">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search chats, messages, friends..."
            className="w-full bg-white dark:bg-[#1f1b2c] text-bunny-ink placeholder:text-bunny-muted text-xs pl-10 pr-9 py-3 rounded-2xl border border-bunny-border focus:border-[#7b5cf5] outline-none shadow-sm transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-bunny-muted hover:text-bunny-ink"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {filterOptions.map((f) => {
            const isSelected = filterPill === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setFilterPill(f.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#ff607d] to-[#ff7b5f] text-white shadow-sm'
                    : 'bg-white dark:bg-[#1f1b2c] text-bunny-muted hover:text-bunny-ink border border-bunny-border/80'
                }`}
              >
                <span>{f.label}</span>
                {f.count !== undefined && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                      isSelected ? 'bg-white/25 text-white' : 'bg-[#ff607d]/15 text-[#ff607d]'
                    }`}
                  >
                    {f.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Active Sparks Rail */}
        <div className="mt-3 pt-2 border-t border-bunny-border/60">
          <ActiveSparksRail showTitle={true} />
        </div>
      </div>

      {/* Chats Section Header */}
      <div className="px-4 md:px-5 flex items-center justify-between my-2">
        <h2 className="text-xs font-extrabold uppercase tracking-wider text-bunny-muted">
          Chats ({filteredConversations.length})
        </h2>
        <button
          onClick={() => setActiveTab('friends')}
          className="section-action-btn"
        >
          <UsersRound className="w-3.5 h-3.5" />
          <span>Friends</span>
        </button>
      </div>

      {/* Conversations List */}
      <div className="px-4 md:px-5 space-y-2 flex-1">
        {filteredConversations.length > 0 ? (
          filteredConversations.map((conv) => (
            <ConversationItem
              key={conv.id}
              conversation={conv}
              isActive={conv.id === activeConversationId}
              onSelect={() => handleSelectConv(conv.id)}
            />
          ))
        ) : (
          <EmptyState
            icon="💬"
            title="No chats found"
            description={
              searchQuery
                ? `No conversation matched “${searchQuery}”.`
                : 'Start talking with someone and your chats will appear here.'
            }
            actionText="Start New Chat"
            onAction={() => setIsNewChatOpen(true)}
          />
        )}

        {/* Quick Action Promo Cards */}
        <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-4 rounded-3xl bg-gradient-to-br from-[#ffe8ed] to-[#f0ebff] dark:from-[#2e1d2c] dark:to-[#221c38] border border-bunny-border relative overflow-hidden shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1 text-[#ff607d] mb-1">
                <Sparkles className="w-4 h-4" />
                <span className="text-[10px] font-extrabold uppercase tracking-wider">Instant Sparks</span>
              </div>
              <h3 className="text-sm font-extrabold text-bunny-ink mb-1">Create a Spark</h3>
              <p className="text-[11px] text-bunny-muted mb-3 leading-relaxed">
                Share spontaneous updates with your friends.
              </p>
            </div>
            <button
              onClick={() => setIsCreateSparkOpen(true)}
              className="w-full py-2 px-3 rounded-full bg-gradient-to-r from-[#ff607d] to-[#ff7b5f] text-white text-xs font-bold shadow-sm hover:opacity-95 active:scale-95 transition-all text-center"
            >
              Post Spark ✨
            </button>
          </div>

          <div className="p-4 rounded-3xl bg-white dark:bg-[#1f1b2c] border border-bunny-border shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1 text-[#7b5cf5] mb-1">
                <Compass className="w-4 h-4" />
                <span className="text-[10px] font-extrabold uppercase tracking-wider">Communities</span>
              </div>
              <h3 className="text-sm font-extrabold text-bunny-ink mb-1">Explore Discover</h3>
              <p className="text-[11px] text-bunny-muted mb-3 leading-relaxed">
                Find public channels, live rooms & developers.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('discover')}
              className="w-full py-2 px-3 rounded-full bg-bunny-border/50 text-bunny-ink hover:bg-bunny-border text-xs font-bold transition-all text-center"
            >
              Explore Discover
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
