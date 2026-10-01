import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { GroupItem } from '../../types';
import { Plus, UsersRound, MessageCircle, Check, Compass } from 'lucide-react';

export const GroupsView: React.FC = () => {
  const { 
    groups, 
    joinGroup, 
    leaveGroup, 
    selectConversation, 
    setActiveTab, 
    setIsCreateGroupOpen,
    showToast 
  } = useChat();

  const [filter, setFilter] = useState<'all' | 'my' | 'discover'>('all');

  const myGroups = groups.filter((g) => g.is_joined);
  const discoverGroups = groups.filter((g) => !g.is_joined);

  const displayed = filter === 'my' ? myGroups : filter === 'discover' ? discoverGroups : groups;

  const handleOpenGroupChat = (grp: GroupItem) => {
    if (grp.conversation_id) {
      selectConversation(grp.conversation_id);
      setActiveTab('room');
    } else {
      showToast(`Joined ${grp.name} discussion! ✨`);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-bunny-bg overflow-y-auto no-scrollbar pb-24 md:pb-8 p-4 md:p-6 select-none">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-bunny-muted">
            Spaces & Gatherings
          </span>
          <h1 className="text-xl md:text-2xl font-extrabold text-bunny-ink tracking-tight">
            Groups & Communities 👥
          </h1>
        </div>

        <button
          onClick={() => setIsCreateGroupOpen(true)}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-[#ff607d] to-[#ff7b5f] text-white text-xs font-bold shadow-[0_4px_14px_rgba(255,96,125,0.35)] hover:opacity-95 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Create Group</span>
        </button>
      </div>

      {/* Hero promo cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
        <div className="p-4 rounded-3xl bg-gradient-to-br from-[#ffe8ed] to-[#f0ebff] dark:from-[#2e1d2c] dark:to-[#221c38] border border-bunny-border flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-bunny-ink mb-1">Start a community</h3>
            <p className="text-[11px] text-bunny-muted mb-3 leading-relaxed">
              Bring your friends, team, or study group together in one cozy space.
            </p>
          </div>
          <button
            onClick={() => setIsCreateGroupOpen(true)}
            className="w-full py-2 rounded-full bg-gradient-to-r from-[#ff607d] to-[#ff7b5f] text-white text-xs font-bold shadow-sm"
          >
            Create Group 🚀
          </button>
        </div>

        <div className="p-4 rounded-3xl bg-white dark:bg-[#1f1b2c] border border-bunny-border flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-bunny-ink mb-1">Find a community</h3>
            <p className="text-[11px] text-bunny-muted mb-3 leading-relaxed">
              Browse public communities on design, games, tech & beats.
            </p>
          </div>
          <button
            onClick={() => setFilter('discover')}
            className="w-full py-2 rounded-full bg-bunny-border/50 text-bunny-ink hover:bg-bunny-border text-xs font-bold"
          >
            Explore Public Groups
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-4">
        {(['all', 'my', 'discover'] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setFilter(mode)}
            className={`px-4 py-2 rounded-full text-xs font-bold capitalize transition-all ${
              filter === mode
                ? 'bg-[#7b5cf5] text-white shadow-sm'
                : 'bg-white dark:bg-[#1f1b2c] text-bunny-muted border border-bunny-border/80'
            }`}
          >
            {mode === 'all' ? 'All Groups' : mode === 'my' ? `Joined (${myGroups.length})` : 'Discover'}
          </button>
        ))}
      </div>

      {/* Group Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {displayed.map((grp) => (
          <div
            key={grp.id}
            className="p-4 rounded-3xl bg-white dark:bg-[#1f1b2c] border border-bunny-border shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <img
                  src={grp.avatar_url}
                  alt={grp.name}
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-bunny-border flex-shrink-0"
                />
                <span className="px-2 py-0.5 rounded-full bg-bunny-border/60 text-bunny-muted text-[10px] font-bold">
                  {grp.category}
                </span>
              </div>

              <div className="flex items-center gap-1.5 mb-1">
                <h3 className="text-sm font-extrabold text-bunny-ink truncate">{grp.name}</h3>
                {grp.tag && (
                  <span className="px-1.5 py-0.2 rounded-full bg-[#ff607d]/15 text-[#ff607d] text-[9px] font-extrabold">
                    {grp.tag}
                  </span>
                )}
              </div>

              <p className="text-xs text-bunny-muted line-clamp-2 leading-relaxed mb-3">
                {grp.description}
              </p>
            </div>

            <div className="pt-3 border-t border-bunny-border/60 flex items-center justify-between">
              <div className="text-[11px] text-bunny-muted">
                <span className="font-bold text-bunny-ink">{grp.members_count}</span> members •{' '}
                <span className="text-emerald-500 font-semibold">{grp.online_count} online</span>
              </div>

              <div className="flex items-center gap-2">
                {grp.is_joined ? (
                  <>
                    <button
                      onClick={() => handleOpenGroupChat(grp)}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#ff607d] to-[#ff7b5f] text-white text-xs font-bold shadow-sm active:scale-95 transition-all flex items-center gap-1.5"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Chat</span>
                    </button>
                    <button
                      onClick={() => leaveGroup(grp.id)}
                      className="px-2.5 py-1.5 rounded-xl text-[11px] text-bunny-muted hover:text-rose-500 transition-colors"
                    >
                      Leave
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => joinGroup(grp.id)}
                    className="px-4 py-1.5 rounded-xl bg-[#7b5cf5] text-white text-xs font-bold shadow-sm active:scale-95 transition-all"
                  >
                    Join Group
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
