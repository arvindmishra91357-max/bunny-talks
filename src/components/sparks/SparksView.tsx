import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { SparkItem } from '../../types';
import { ActiveSparksRail } from './ActiveSparksRail';
import { 
  Zap, 
  Plus, 
  Heart, 
  MessageCircle, 
  Headphones, 
  Sparkles, 
  Camera, 
  Type,
  Share2
} from 'lucide-react';

export const SparksView: React.FC = () => {
  const { 
    sparks, 
    reactToSpark, 
    setViewingSpark, 
    setIsCreateSparkOpen,
    showToast 
  } = useChat();

  const { currentUser } = useAuth();
  const [filter, setFilter] = useState<'all' | 'friends' | 'music' | 'gaming'>('all');

  const filteredSparks = sparks.filter((s) => {
    if (filter === 'music') return s.type === 'music';
    if (filter === 'gaming') return s.mood_badge?.includes('Gaming');
    if (filter === 'friends') return s.user_id !== currentUser?.id;
    return true;
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-bunny-bg overflow-y-auto no-scrollbar pb-24 md:pb-8 p-4 md:p-6 select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-bunny-muted">
            Spontaneous & Ephemeral
          </span>
          <h1 className="text-xl md:text-2xl font-extrabold text-bunny-ink tracking-tight">
            Active Sparks ⚡
          </h1>
        </div>

        <button
          onClick={() => setIsCreateSparkOpen(true)}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-[#ff607d] to-[#ff7b5f] text-white text-xs font-bold shadow-[0_4px_14px_rgba(255,96,125,0.35)] hover:opacity-95 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Camera className="w-3.5 h-3.5" />
          <span>Post a Spark</span>
        </button>
      </div>

      {/* Interactive Filter Chips */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            filter === 'all'
              ? 'bg-[#7b5cf5] text-white shadow-sm'
              : 'bg-white dark:bg-[#1f1b2c] text-bunny-muted border border-bunny-border/80'
          }`}
        >
          <span>All Sparks</span>
          <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">{sparks.length}</span>
        </button>

        <button
          onClick={() => setFilter('friends')}
          className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            filter === 'friends'
              ? 'bg-[#7b5cf5] text-white shadow-sm'
              : 'bg-white dark:bg-[#1f1b2c] text-bunny-muted border border-bunny-border/80'
          }`}
        >
          <span>Close Friends</span>
        </button>

        <button
          onClick={() => setFilter('music')}
          className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            filter === 'music'
              ? 'bg-[#7b5cf5] text-white shadow-sm'
              : 'bg-white dark:bg-[#1f1b2c] text-bunny-muted border border-bunny-border/80'
          }`}
        >
          <Headphones className="w-3.5 h-3.5 text-secondary" />
          <span>Listening (3)</span>
        </button>

        <button
          onClick={() => setFilter('gaming')}
          className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            filter === 'gaming'
              ? 'bg-[#7b5cf5] text-white shadow-sm'
              : 'bg-white dark:bg-[#1f1b2c] text-bunny-muted border border-bunny-border/80'
          }`}
        >
          <span>🎮 Gaming (2)</span>
        </button>
      </div>

      {/* Your Spark Creator Card */}
      <div className="p-4 md:p-5 rounded-3xl bg-white dark:bg-[#1f1b2c] border border-bunny-border shadow-sm mb-5 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-36 h-36 rounded-full bg-gradient-to-tr from-[#ff607d]/20 to-[#7b5cf5]/20 blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="relative flex-shrink-0 cursor-pointer" onClick={() => setIsCreateSparkOpen(true)}>
              <div className="w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr from-[#ff607d] via-[#7b5cf5] to-[#10b981]">
                <img
                  src={currentUser?.avatar_url || '/assets/maya.png'}
                  alt={currentUser?.name}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <button className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-r from-[#ff607d] to-[#ff7b5f] text-white flex items-center justify-center shadow-md ring-2 ring-white dark:ring-[#1f1b2c]">
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
              </button>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-extrabold text-bunny-ink">Your Spark ✨</h2>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              </div>
              <p className="text-xs text-bunny-muted mt-0.5">
                Expires in 18h • 32 friends viewed
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCreateSparkOpen(true)}
              className="px-3.5 py-1.5 rounded-full bg-bunny-border/50 hover:bg-bunny-border text-bunny-ink text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Type className="w-3.5 h-3.5 text-[#ff607d]" />
              <span>Text</span>
            </button>
            <button
              onClick={() => setIsCreateSparkOpen(true)}
              className="px-3.5 py-1.5 rounded-full bg-bunny-border/50 hover:bg-bunny-border text-bunny-ink text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Camera className="w-3.5 h-3.5 text-[#7b5cf5]" />
              <span>Photo</span>
            </button>
            <button
              onClick={() => setIsCreateSparkOpen(true)}
              className="px-3.5 py-1.5 rounded-full bg-bunny-border/50 hover:bg-bunny-border text-bunny-ink text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Headphones className="w-3.5 h-3.5 text-emerald-500" />
              <span>Music</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2-Column Sparks Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
        {filteredSparks.map((spark) => (
          <div
            key={spark.id}
            onClick={() => setViewingSpark(spark)}
            className="spark-card relative rounded-3xl overflow-hidden bg-white dark:bg-[#1f1b2c] border border-bunny-border shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between aspect-[9/13]"
          >
            {/* Background Graphic or Image */}
            {spark.media_url ? (
              <img
                src={spark.media_url}
                alt={spark.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div
                style={{ background: spark.bg_gradient || 'linear-gradient(135deg, #ff607d, #7b5cf5)' }}
                className="absolute inset-0"
              />
            )}

            {/* Gradient Overlays for readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/85" />

            {/* Top User Info */}
            <div className="relative z-10 p-3 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full p-0.5 bg-gradient-to-tr from-[#ff607d] to-[#7b5cf5] flex-shrink-0">
                <img
                  src={spark.user_avatar}
                  alt={spark.user_name}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-white truncate drop-shadow-sm">
                  {spark.user_name}
                </p>
                <p className="text-[9px] text-white/80 drop-shadow-sm">
                  {spark.expires_in || '24h'}
                </p>
              </div>
            </div>

            {/* Bottom Caption & Reactions */}
            <div className="relative z-10 p-3 text-white">
              {spark.type === 'music' && (
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[9px] font-bold mb-1.5">
                  <Headphones className="w-2.5 h-2.5" />
                  <span className="truncate max-w-[120px]">{spark.track_title}</span>
                </div>
              )}

              <p className="text-xs font-bold line-clamp-2 leading-snug drop-shadow-md">
                {spark.title || spark.caption}
              </p>

              <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/20 text-[10px]">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    reactToSpark(spark.id);
                  }}
                  className={`flex items-center gap-1 transition-transform active:scale-125 ${
                    spark.has_reacted ? 'text-[#ff607d]' : 'text-white'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${spark.has_reacted ? 'fill-[#ff607d]' : ''}`} />
                  <span>{spark.reactions_count}</span>
                </button>

                <div className="flex items-center gap-1 text-white/80">
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>{spark.comments_count}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
