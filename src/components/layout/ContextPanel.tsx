import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { useCall } from '../../context/CallContext';
import { 
  Phone, 
  Video, 
  Bell, 
  ShieldAlert, 
  ChevronRight,
  ChevronLeft,
  Zap,
  Radio
} from 'lucide-react';

export const ContextPanel: React.FC = () => {
  const { 
    activeTab, 
    activeConversation, 
    sparks, 
    channels, 
    setActiveTab, 
    setViewingSpark, 
    setReportModalTarget,
    showToast 
  } = useChat();
  const { startCall } = useCall();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // If collapsed or on small screens
  if (isCollapsed) {
    return (
      <div className="hidden xl:flex flex-col items-center py-4 px-2 border-l border-bunny-border bg-white/40 dark:bg-[#181524]/40 select-none">
        <button
          onClick={() => setIsCollapsed(false)}
          className="w-8 h-8 rounded-full bg-white dark:bg-[#201c2e] border border-bunny-border shadow-sm flex items-center justify-center text-bunny-muted hover:text-bunny-ink transition-transform hover:scale-105"
          title="Expand Details Panel"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Content for Active Conversation
  if ((activeTab === 'chats' || activeTab === 'room') && activeConversation) {
    const isDirect = activeConversation.type === 'direct';
    const otherUser = activeConversation.other_user;

    return (
      <aside className="hidden xl:flex flex-col w-80 border-l border-bunny-border bg-white/70 dark:bg-[#181524]/75 backdrop-blur-xl select-none overflow-y-auto no-scrollbar relative">
        {/* Collapse toggle */}
        <button
          onClick={() => setIsCollapsed(true)}
          className="absolute right-3 top-4 w-7 h-7 rounded-full bg-white dark:bg-[#201c2e] border border-bunny-border shadow-sm flex items-center justify-center text-bunny-muted hover:text-bunny-ink transition-transform hover:scale-105 z-10"
          title="Collapse Panel"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Profile Card Header */}
        <div className="p-6 text-center border-b border-bunny-border relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-tr from-[#ff607d]/20 to-[#7b5cf5]/20 blur-xl pointer-events-none" />
          
          <div className="relative inline-block mx-auto mb-3">
            <img
              src={isDirect ? otherUser?.avatar_url : activeConversation.avatar_url || '/assets/bunny-icon.png'}
              alt="Avatar"
              className="w-20 h-20 rounded-full object-cover ring-4 ring-white dark:ring-[#201c2e] shadow-[0_8px_20px_rgba(0,0,0,0.12)]"
            />
            {isDirect && otherUser?.is_online && (
              <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-[#201c2e]" />
            )}
          </div>

          <h3 className="text-sm font-extrabold text-bunny-ink truncate">
            {isDirect ? otherUser?.name : activeConversation.title}
          </h3>
          <p className="text-xs text-bunny-muted mt-0.5">
            {isDirect ? `@${otherUser?.username}` : `${activeConversation.members.length} members`}
          </p>

          {isDirect && otherUser?.mood_status && (
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ff607d]/10 text-[#ff607d] text-[11px] font-semibold">
              <span>{otherUser.mood_status}</span>
            </div>
          )}

          {/* Quick Call Actions */}
          {isDirect && otherUser && (
            <div className="flex items-center justify-center gap-3 mt-4">
              <button
                onClick={() => startCall(otherUser.id, 'audio', activeConversation.id)}
                className="w-10 h-10 rounded-2xl bg-white dark:bg-[#242033] border border-bunny-border flex items-center justify-center text-bunny-ink shadow-sm hover:text-[#ff607d] hover:border-[#ff607d]/40 transition-all active:scale-95"
                title="Voice Call"
              >
                <Phone className="w-4 h-4" />
              </button>
              <button
                onClick={() => startCall(otherUser.id, 'video', activeConversation.id)}
                className="w-10 h-10 rounded-2xl bg-white dark:bg-[#242033] border border-bunny-border flex items-center justify-center text-bunny-ink shadow-sm hover:text-[#7b5cf5] hover:border-[#7b5cf5]/40 transition-all active:scale-95"
                title="Video Call"
              >
                <Video className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Bio / Description */}
        <div className="p-4 border-b border-bunny-border">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-bunny-muted mb-1.5">
            About
          </p>
          <p className="text-xs text-bunny-ink leading-relaxed">
            {isDirect ? otherUser?.bio || 'Loving chats on Bunny Talks! 🐰' : activeConversation.description || 'Bunny group chat'}
          </p>
        </div>

        {/* Shared Media Section */}
        <div className="p-4 border-b border-bunny-border">
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-bunny-muted">
              Shared Media
            </p>
            <span className="text-[10px] font-bold text-[#7b5cf5] cursor-pointer hover:underline">
              View All
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-sm cursor-pointer hover:opacity-90 transition-opacity">
              <img src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=300&auto=format&fit=crop&q=80" className="w-full h-full object-cover" />
            </div>
            <div className="aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-sm cursor-pointer hover:opacity-90 transition-opacity">
              <img src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=300&auto=format&fit=crop&q=80" className="w-full h-full object-cover" />
            </div>
            <div className="aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-sm cursor-pointer hover:opacity-90 transition-opacity">
              <img src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&auto=format&fit=crop&q=80" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        {/* Privacy & Moderation options */}
        <div className="p-4 space-y-1">
          <button
            onClick={() => showToast('Mute notifications toggled 🔕')}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-bunny-muted hover:text-bunny-ink hover:bg-bunny-border/50 transition-colors"
          >
            <Bell className="w-4 h-4" />
            <span>Mute Notifications</span>
          </button>
          <button
            onClick={() => {
              if (isDirect && otherUser) {
                setReportModalTarget({ id: otherUser.id, name: otherUser.name, type: 'user' });
              }
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition-colors"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Report or Block</span>
          </button>
        </div>
      </aside>
    );
  }

  // Default Context Panel: Trending Sparks & Recommended Communities
  return (
    <aside className="hidden xl:flex flex-col w-80 border-l border-bunny-border bg-white/70 dark:bg-[#181524]/75 backdrop-blur-xl select-none p-5 space-y-6 overflow-y-auto no-scrollbar relative">
      {/* Collapse toggle */}
      <button
        onClick={() => setIsCollapsed(true)}
        className="absolute right-3 top-4 w-7 h-7 rounded-full bg-white dark:bg-[#201c2e] border border-bunny-border shadow-sm flex items-center justify-center text-bunny-muted hover:text-bunny-ink transition-transform hover:scale-105 z-10"
        title="Collapse Panel"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Featured Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-[#ffe8ed] to-[#f0ebff] dark:from-[#2e1d2c] dark:to-[#221c38] border border-bunny-border relative overflow-hidden shadow-sm">
        <span className="text-xl">🐰</span>
        <h4 className="text-xs font-extrabold text-bunny-ink mt-2">Welcome to Bunny Talks</h4>
        <p className="text-[11px] text-bunny-muted mt-1 leading-relaxed">
          Real-time conversations, instant Sparks, and cozy communities.
        </p>
      </div>

      {/* Trending Sparks */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-[#ff607d]" />
            <h4 className="text-xs font-extrabold text-bunny-ink">Active Sparks</h4>
          </div>
          <button 
            onClick={() => setActiveTab('sparks')}
            className="text-[10px] font-bold text-[#7b5cf5] hover:underline"
          >
            View all
          </button>
        </div>

        <div className="space-y-2.5">
          {sparks.slice(0, 3).map((spark) => (
            <div
              key={spark.id}
              onClick={() => setViewingSpark(spark)}
              className="p-2.5 rounded-2xl bg-white dark:bg-[#201c2e] border border-bunny-border hover:shadow-md transition-all cursor-pointer flex items-center gap-3"
            >
              <img
                src={spark.media_url || spark.user_avatar}
                alt={spark.title}
                className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-bunny-ink truncate">{spark.title || spark.caption}</p>
                <p className="text-[10px] text-bunny-muted truncate">{spark.user_name} • {spark.expires_in || '24h'}</p>
                <span className="inline-block text-[9px] font-extrabold text-[#ff607d] mt-0.5">
                  ❤️ {spark.reactions_count} reactions
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Channels */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <Radio className="w-4 h-4 text-[#7b5cf5]" />
            <h4 className="text-xs font-extrabold text-bunny-ink">Trending Channels</h4>
          </div>
          <button 
            onClick={() => setActiveTab('channels')}
            className="text-[10px] font-bold text-[#7b5cf5] hover:underline"
          >
            Explore
          </button>
        </div>

        <div className="space-y-2">
          {channels.slice(0, 3).map((ch) => (
            <div
              key={ch.id}
              onClick={() => setActiveTab('channels')}
              className="p-2.5 rounded-2xl bg-white dark:bg-[#201c2e] border border-bunny-border hover:border-[#7b5cf5]/40 transition-all cursor-pointer flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#ffe8ed] to-[#f0ebff] dark:from-[#2a1c27] dark:to-[#221c38] flex items-center justify-center text-lg flex-shrink-0">
                {ch.icon_emoji}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-bunny-ink truncate">{ch.name}</p>
                <p className="text-[10px] text-bunny-muted truncate">{ch.subscribers_count.toLocaleString()} members</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};
