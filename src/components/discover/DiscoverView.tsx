import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Compass, 
  Search, 
  Sparkles, 
  Radio, 
  UsersRound, 
  ExternalLink, 
  Check, 
  Headphones,
  ArrowRight
} from 'lucide-react';

export const DiscoverView: React.FC = () => {
  const { 
    groups, 
    channels, 
    sparks, 
    joinGroup, 
    subscribeChannel, 
    setViewingSpark, 
    setActiveTab, 
    showToast 
  } = useChat();

  const [activeCategory, setActiveCategory] = useState<'all' | 'people' | 'groups' | 'channels'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="flex-1 flex flex-col h-full bg-bunny-bg overflow-y-auto no-scrollbar pb-24 md:pb-8 p-4 md:p-6 select-none">
      {/* Top Header */}
      <div className="mb-4">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-bunny-muted">
          Explore the Bunny Network
        </span>
        <h1 className="text-xl md:text-2xl font-extrabold text-bunny-ink tracking-tight">
          Discover & Communities 🧭
        </h1>
      </div>

      {/* Search Input */}
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-bunny-muted">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Discover communities, topics, sparks, channels..."
          className="w-full bg-white dark:bg-[#1f1b2c] text-bunny-ink placeholder:text-bunny-muted text-xs pl-10 pr-4 py-3 rounded-2xl border border-bunny-border focus:border-[#7b5cf5] outline-none shadow-sm transition-all"
        />
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 mb-5 overflow-x-auto no-scrollbar pb-1">
        {(['all', 'people', 'groups', 'channels'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-xs font-bold capitalize transition-all ${
              activeCategory === cat
                ? 'bg-[#7b5cf5] text-white shadow-sm'
                : 'bg-white dark:bg-[#1f1b2c] text-bunny-muted border border-bunny-border/80'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Live Hangouts Ambient Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-[#ffe3dc] via-[#f7ebff] to-[#eae2ff] dark:from-[#2e1d2c] dark:via-[#221c38] dark:to-[#171426] border border-bunny-border relative overflow-hidden shadow-sm mb-6">
        <div className="relative z-10 max-w-sm">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#ff607d]/15 text-[#ff607d] text-[10px] font-extrabold mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff607d] animate-ping" />
            <span>LIVE NOW</span>
          </div>
          <h3 className="text-base font-extrabold text-bunny-ink mb-1">
            Live hangouts are happening now 🎧
          </h3>
          <p className="text-xs text-bunny-muted leading-relaxed mb-4">
            Join the Bunny audio room, discuss new design prototypes, and meet people around shared interests.
          </p>
          <button
            onClick={() => showToast('Connecting to live audio hangout... 🐰', 'success')}
            className="px-4 py-2 rounded-full bg-gradient-to-r from-[#ff607d] to-[#ff7b5f] text-white text-xs font-bold shadow-[0_4px_14px_rgba(255,96,125,0.35)] active:scale-95 transition-all flex items-center gap-1.5"
          >
            <Headphones className="w-3.5 h-3.5" />
            <span>Join Live Room</span>
          </button>
        </div>
      </div>

      {/* Trending Channels Section */}
      {(activeCategory === 'all' || activeCategory === 'channels') && (
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-1.5">
              <Radio className="w-4 h-4 text-[#7b5cf5]" />
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-bunny-muted">
                Trending Channels
              </h2>
            </div>
            <button
              onClick={() => setActiveTab('channels')}
              className="section-action-btn"
            >
              <span>See All</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {channels.map((ch) => (
              <div
                key={ch.id}
                className="p-4 rounded-2xl bg-white dark:bg-[#1f1b2c] border border-bunny-border shadow-sm hover:shadow-md transition-all flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#ffe8ed] to-[#f0ebff] dark:from-[#2e1d2c] dark:to-[#221c38] flex items-center justify-center text-2xl flex-shrink-0">
                    {ch.icon_emoji}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-xs font-bold text-bunny-ink truncate">{ch.name}</h3>
                      {ch.new_badge && (
                        <span className="px-1.5 py-0.2 rounded-full bg-[#7b5cf5]/15 text-[#7b5cf5] text-[9px] font-extrabold">
                          {ch.new_badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-bunny-muted truncate">{ch.description}</p>
                    <p className="text-[10px] text-bunny-muted mt-0.5">
                      {ch.subscribers_count.toLocaleString()} subscribers
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => subscribeChannel(ch.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                    ch.is_subscribed
                      ? 'bg-bunny-border/50 text-bunny-ink'
                      : 'bg-gradient-to-r from-[#ff607d] to-[#ff7b5f] text-white shadow-sm'
                  }`}
                >
                  {ch.is_subscribed ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Joined</span>
                    </>
                  ) : (
                    <span>Join</span>
                  )}
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Popular Groups Section */}
      {(activeCategory === 'all' || activeCategory === 'groups') && (
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-1.5">
              <UsersRound className="w-4 h-4 text-[#ff607d]" />
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-bunny-muted">
                Popular Communities
              </h2>
            </div>
            <button
              onClick={() => setActiveTab('groups')}
              className="section-action-btn"
            >
              <span>See All</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {groups.map((grp) => (
              <div
                key={grp.id}
                className="p-4 rounded-2xl bg-white dark:bg-[#1f1b2c] border border-bunny-border shadow-sm hover:shadow-md transition-all flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={grp.avatar_url}
                    alt={grp.name}
                    className="w-12 h-12 rounded-2xl object-cover ring-1 ring-bunny-border flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-xs font-bold text-bunny-ink truncate">{grp.name}</h3>
                      {grp.tag && (
                        <span className="px-1.5 py-0.2 rounded-full bg-[#ff607d]/15 text-[#ff607d] text-[9px] font-extrabold">
                          {grp.tag}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-bunny-muted truncate">{grp.description}</p>
                    <p className="text-[10px] text-emerald-500 font-semibold mt-0.5">
                      ● {grp.online_count} active now
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => joinGroup(grp.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    grp.is_joined
                      ? 'bg-bunny-border/50 text-bunny-ink'
                      : 'bg-[#7b5cf5] text-white shadow-sm'
                  }`}
                >
                  {grp.is_joined ? 'Joined' : 'Join'}
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Featured Sparks */}
      {(activeCategory === 'all' || activeCategory === 'people') && (
        <section>
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-bunny-muted">
                Featured Sparks
              </h2>
            </div>
            <button
              onClick={() => setActiveTab('sparks')}
              className="section-action-btn"
            >
              <span>All Sparks</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {sparks.slice(0, 4).map((spark) => (
              <div
                key={spark.id}
                onClick={() => setViewingSpark(spark)}
                className="relative rounded-2xl overflow-hidden aspect-[9/12] shadow-sm cursor-pointer group"
              >
                <img
                  src={spark.media_url || spark.user_avatar}
                  alt={spark.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <img src={spark.user_avatar} className="w-6 h-6 rounded-full object-cover ring-1 ring-white" />
                  <span className="text-[10px] font-bold text-white drop-shadow-sm">
                    {spark.user_name}
                  </span>
                </div>

                <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
                  <p className="text-xs font-bold line-clamp-1">{spark.title || spark.caption}</p>
                  <p className="text-[10px] text-white/80 mt-0.5">{spark.mood_badge} • {spark.expires_in}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
