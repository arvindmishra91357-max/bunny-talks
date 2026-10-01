import React, { useState, useMemo } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { ConversationCard } from './ConversationCard';
import { ContactsView } from '../contacts/ContactsView';
import {
  Search,
  MessageSquarePlus,
  Settings,
  X,
  Users,
  MessageSquare,
  UserCheck,
  Bell,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { ALL_USERS, USER_A, USER_B } from '../../lib/mockData';

interface SidebarProps {
  onOpenNewChat: () => void;
  onOpenProfile: () => void;
  onOpenSettings: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onOpenNewChat,
  onOpenProfile,
  onOpenSettings,
}) => {
  const {
    conversations,
    activeConversationId,
    setActiveConversationId,
    searchQuery,
    setSearchQuery,
    pinConversation,
    muteConversation,
    archiveConversation,
    deleteConversationLocally,
    markConversationUnread,
    activeMainTab,
    setActiveMainTab,
  } = useChat();

  const { currentUser, switchUser, contactRequests, contacts } = useAuth();
  const [isTestUserMenuOpen, setIsTestUserMenuOpen] = useState(false);

  // Incoming pending requests directed to the current user
  const incomingRequestsCount = useMemo(() => {
    return contactRequests.filter(
      (r) => r.receiver_id === currentUser?.id && r.status === 'pending'
    ).length;
  }, [contactRequests, currentUser?.id]);

  // Total unread messages count
  const totalUnreadCount = useMemo(() => {
    return conversations.reduce((sum, c) => sum + (c.unread_count || 0), 0);
  }, [conversations]);

  // Filter and sort conversations: Pinned first, then by last_message_at descending
  const filteredConversations = useMemo(() => {
    let result = [...conversations];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((c) => {
        const otherName = c.other_user?.display_name?.toLowerCase() || '';
        const otherUsername = c.other_user?.username?.toLowerCase() || '';
        const lastContent = c.last_message?.content?.toLowerCase() || '';
        return otherName.includes(q) || otherUsername.includes(q) || lastContent.includes(q);
      });
    }

    // Sort pinned on top, then newest last_message_at
    return result.sort((a, b) => {
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      const timeA = new Date(a.last_message_at || a.created_at || 0).getTime();
      const timeB = new Date(b.last_message_at || b.created_at || 0).getTime();
      return timeB - timeA;
    });
  }, [conversations, searchQuery]);

  return (
    <div className="flex flex-col h-full bg-slate-950 border-r border-slate-800/80 w-full select-none">
      {/* Top Header: WhatsApp-style bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          {/* User profile picture */}
          <button
            onClick={onOpenProfile}
            className="relative cursor-pointer group focus:outline-none"
            title="Profile & Settings"
          >
            <img
              src={currentUser?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.username}`}
              alt={currentUser?.name}
              className="w-9 h-9 rounded-full object-cover border border-slate-700 group-hover:border-emerald-500 transition-colors"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-950 rounded-full" />
          </button>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-white">
                Nexus
              </span>
              <span className="text-[10px] px-1.5 py-0.2 font-bold uppercase rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-2.5 h-2.5" /> Private
              </span>
            </div>
          </div>
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-1">
          {/* Rapid Test User Switcher for testing multi-user realtime messaging */}
          <div className="relative">
            <button
              onClick={() => setIsTestUserMenuOpen(!isTestUserMenuOpen)}
              className="px-2.5 py-1 text-xs rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-700/40 flex items-center gap-1 font-medium cursor-pointer transition-all"
              title="Switch user to test real-time chat between accounts"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Active:</span>
              <span className="font-bold">{currentUser?.username === 'arvind' ? 'User A (Arvind)' : 'User B (Rahul)'}</span>
            </button>

            {isTestUserMenuOpen && (
              <div className="absolute right-0 top-10 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 p-2 text-xs">
                <div className="text-[11px] font-semibold text-slate-400 px-2 py-1 uppercase tracking-wider">
                  Test User Switcher
                </div>
                {ALL_USERS.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => {
                      switchUser(user);
                      setIsTestUserMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                      currentUser?.id === user.id
                        ? 'bg-emerald-600 text-white font-medium'
                        : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <img src={user.avatar_url} className="w-7 h-7 rounded-full object-cover border border-slate-700" alt="" />
                    <div className="truncate flex-1">
                      <div className="truncate font-semibold">{user.name}</div>
                      <div className="text-[10px] opacity-75">@{user.username}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={onOpenNewChat}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
            title="Start New Chat / Add Contact"
          >
            <MessageSquarePlus className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Tabs: Chats | Contacts | Requests */}
      <div className="flex items-center border-b border-slate-800 bg-slate-950 px-2 pt-2 text-xs">
        <button
          onClick={() => setActiveMainTab('chats')}
          className={`flex-1 py-2 font-bold border-b-2 flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
            activeMainTab === 'chats'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Chats</span>
          {totalUnreadCount > 0 && (
            <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-emerald-500 text-slate-950">
              {totalUnreadCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveMainTab('contacts')}
          className={`flex-1 py-2 font-bold border-b-2 flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
            activeMainTab === 'contacts'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Contacts</span>
          <span className="text-[10px] text-slate-500">
            ({contacts.filter((c) => c.user_id === currentUser?.id).length})
          </span>
        </button>

        <button
          onClick={() => setActiveMainTab('requests')}
          className={`flex-1 py-2 font-bold border-b-2 flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
            activeMainTab === 'requests'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>Requests</span>
          {incomingRequestsCount > 0 && (
            <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-amber-500 text-slate-950 animate-pulse">
              {incomingRequestsCount}
            </span>
          )}
        </button>
      </div>

      {/* Conditionally Render: Conversations list OR Contacts/Requests view */}
      {activeMainTab === 'chats' ? (
        <>
          {/* Search Bar */}
          <div className="px-3 pt-3 pb-2">
            <div className="relative flex items-center bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all">
              <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search chats..."
                className="w-full bg-transparent px-2 py-0.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto py-2 space-y-0.5">
            {filteredConversations.length > 0 ? (
              filteredConversations.map((conv) => (
                <ConversationCard
                  key={conv.id}
                  conversation={conv}
                  isActive={conv.id === activeConversationId}
                  onClick={() => setActiveConversationId(conv.id)}
                  onPin={() => pinConversation(conv.id)}
                  onMute={() => muteConversation(conv.id)}
                  onArchive={() => archiveConversation(conv.id)}
                  onDelete={() => deleteConversationLocally(conv.id)}
                  onMarkUnread={() => markConversationUnread(conv.id)}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500">
                <MessageSquarePlus className="w-10 h-10 mb-2 opacity-30 text-emerald-400" />
                <p className="text-sm font-medium text-slate-400">No conversations yet</p>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Connect with contacts or search someone by username to start a private chat.
                </p>
                <button
                  onClick={onOpenNewChat}
                  className="mt-3 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer"
                >
                  New Chat / Add Contact
                </button>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="flex-1 overflow-hidden">
          <ContactsView />
        </div>
      )}
    </div>
  );
};
