import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { Friend, Profile } from '../../types';
import { EmptyState } from '../common/EmptyState';
import { 
  Users, 
  UserPlus, 
  MessageCircle, 
  Search, 
  Share2, 
  Check, 
  X, 
  ShieldAlert,
  UserCheck
} from 'lucide-react';

export const FriendsView: React.FC = () => {
  const { 
    friends, 
    friendRequests, 
    acceptFriendRequest, 
    declineFriendRequest, 
    sendFriendRequest,
    createDirectConversation, 
    setReportModalTarget,
    showToast 
  } = useChat();

  const { allUsers, currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'suggestions'>('friends');
  const [searchQuery, setSearchQuery] = useState('');

  // Suggestions: users in allUsers who are not current user and not yet in friends list
  const friendUserIds = new Set(friends.map((f) => f.friend_profile.id));
  const suggestions = allUsers.filter(
    (u) => u.id !== currentUser?.id && !friendUserIds.has(u.id)
  );

  const filteredFriends = friends.filter((f) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      f.friend_profile.name.toLowerCase().includes(q) ||
      f.friend_profile.username.toLowerCase().includes(q)
    );
  });

  const copyInviteLink = () => {
    navigator.clipboard.writeText('https://bunnytalks.app/invite/maya');
    showToast('Invite link copied to clipboard! 🐰', 'success');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-bunny-bg overflow-y-auto no-scrollbar pb-24 md:pb-8 p-4 md:p-6 select-none">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-bunny-muted">
            Community & Network
          </span>
          <h1 className="text-xl md:text-2xl font-extrabold text-bunny-ink tracking-tight">
            Friends & People 🐰
          </h1>
        </div>

        <button
          onClick={copyInviteLink}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-[#ff607d] to-[#ff7b5f] text-white text-xs font-bold shadow-[0_4px_14px_rgba(255,96,125,0.35)] hover:opacity-95 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>＋ Invite Friend</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-bunny-muted">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search people by name or username..."
          className="w-full bg-white dark:bg-[#1f1b2c] text-bunny-ink placeholder:text-bunny-muted text-xs pl-10 pr-4 py-3 rounded-2xl border border-bunny-border focus:border-[#7b5cf5] outline-none shadow-sm transition-all"
        />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-5 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => setActiveTab('friends')}
          className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'friends'
              ? 'bg-[#7b5cf5] text-white shadow-sm'
              : 'bg-white dark:bg-[#1f1b2c] text-bunny-muted border border-bunny-border/80'
          }`}
        >
          <span>All Friends</span>
          <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">
            {friends.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'requests'
              ? 'bg-[#7b5cf5] text-white shadow-sm'
              : 'bg-white dark:bg-[#1f1b2c] text-bunny-muted border border-bunny-border/80'
          }`}
        >
          <span>Requests</span>
          {friendRequests.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-[#ff607d] text-white text-[10px] font-extrabold animate-pulse">
              {friendRequests.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('suggestions')}
          className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'suggestions'
              ? 'bg-[#7b5cf5] text-white shadow-sm'
              : 'bg-white dark:bg-[#1f1b2c] text-bunny-muted border border-bunny-border/80'
          }`}
        >
          <span>Suggestions</span>
          <span className="px-1.5 py-0.2 rounded-full bg-bunny-border text-[10px]">
            {suggestions.length}
          </span>
        </button>
      </div>

      {/* Tab: Friends List */}
      {activeTab === 'friends' && (
        <div className="space-y-2.5">
          {filteredFriends.length > 0 ? (
            filteredFriends.map((f) => (
              <div
                key={f.id}
                className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-white dark:bg-[#1f1b2c] border border-bunny-border hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative flex-shrink-0">
                    <img
                      src={f.friend_profile.avatar_url}
                      alt={f.friend_profile.name}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-white dark:ring-[#201c2e]"
                    />
                    {f.status === 'online' && (
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-[#201c2e]" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-bunny-ink truncate">
                      {f.friend_profile.name}
                    </h3>
                    <p className="text-[11px] text-bunny-muted truncate">
                      @{f.friend_profile.username} • {f.mutual_friends_count} mutual
                    </p>
                    <p className="text-[10px] text-emerald-500 font-medium truncate mt-0.5">
                      {f.activity || 'Active now'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => createDirectConversation(f.friend_profile)}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#ff607d] to-[#ff7b5f] text-white text-xs font-bold shadow-sm hover:opacity-95 active:scale-95 transition-all flex items-center gap-1.5"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Message</span>
                  </button>

                  <button
                    onClick={() => setReportModalTarget({ id: f.friend_profile.id, name: f.friend_profile.name, type: 'user' })}
                    className="p-1.5 rounded-xl text-bunny-muted hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                    title="Report"
                  >
                    <ShieldAlert className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <EmptyState
              icon="👥"
              title="No friends found"
              description="Invite people to Bunny Talks or check your friend requests."
              actionText="Invite Friends"
              onAction={copyInviteLink}
            />
          )}
        </div>
      )}

      {/* Tab: Requests */}
      {activeTab === 'requests' && (
        <div className="space-y-3">
          {friendRequests.length > 0 ? (
            friendRequests.map((req) => (
              <div
                key={req.id}
                className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-[#1f1b2c] border border-bunny-border shadow-sm"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={req.sender.avatar_url}
                    alt={req.sender.name}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-[#ff607d]/40"
                  />
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-bunny-ink truncate">
                      {req.sender.name}
                    </h3>
                    <p className="text-[11px] text-bunny-muted truncate">
                      @{req.sender.username} • {req.mutual_count || 4} mutual friends
                    </p>
                    <span className="inline-block text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-[#ffe8ed] dark:bg-[#2d1b28] text-[#ff607d] mt-1">
                      Wants to connect
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => acceptFriendRequest(req.id)}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#ff607d] to-[#ff7b5f] text-white text-xs font-bold shadow-sm active:scale-95 transition-all flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Accept</span>
                  </button>
                  <button
                    onClick={() => declineFriendRequest(req.id)}
                    className="px-3 py-1.5 rounded-xl bg-bunny-border/50 text-bunny-muted hover:text-bunny-ink text-xs font-bold transition-all"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))
          ) : (
            <EmptyState
              icon="✨"
              title="All caught up!"
              description="You have no pending friend requests."
            />
          )}
        </div>
      )}

      {/* Tab: Suggestions */}
      {activeTab === 'suggestions' && (
        <div className="space-y-2.5">
          {suggestions.length > 0 ? (
            suggestions.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-white dark:bg-[#1f1b2c] border border-bunny-border hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={user.avatar_url}
                    alt={user.name}
                    className="w-11 h-11 rounded-full object-cover"
                  />
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-bunny-ink truncate">
                      {user.name}
                    </h3>
                    <p className="text-[11px] text-bunny-muted truncate">
                      @{user.username}
                    </p>
                    <p className="text-[10px] text-bunny-muted truncate mt-0.5">
                      {user.bio || 'Suggested based on your network'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => sendFriendRequest(user.id)}
                  className="px-3 py-1.5 rounded-xl bg-bunny-border/50 hover:bg-[#7b5cf5] hover:text-white text-bunny-ink text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Connect</span>
                </button>
              </div>
            ))
          ) : (
            <EmptyState
              icon="🔍"
              title="No suggestions available"
              description="Share your invite link to find more people on Bunny Talks."
            />
          )}
        </div>
      )}
    </div>
  );
};
