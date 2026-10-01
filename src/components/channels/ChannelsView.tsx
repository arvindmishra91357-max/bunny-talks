import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { ChannelItem } from '../../types';
import { Radio, Plus, Check, Heart, Pin, Share2 } from 'lucide-react';

export const ChannelsView: React.FC = () => {
  const { channels, subscribeChannel, unsubscribeChannel, setIsCreateChannelOpen, showToast } = useChat();

  const [selectedChannel, setSelectedChannel] = useState<ChannelItem | null>(channels[0] || null);

  const handleLikePost = (chName: string) => {
    showToast(`Liked broadcast post in ${chName} ❤️`);
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full bg-bunny-bg overflow-hidden select-none">
      {/* Channels Sidebar / List */}
      <div className="w-full md:w-80 lg:w-96 border-r border-bunny-border flex flex-col h-full bg-white/60 dark:bg-[#181524]/60 overflow-y-auto no-scrollbar p-4 md:p-5 pb-24 md:pb-6 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-bunny-muted">
              Broadcasts & Feeds
            </span>
            <h1 className="text-xl font-extrabold text-bunny-ink tracking-tight">
              Channels 📢
            </h1>
          </div>

          <button
            onClick={() => setIsCreateChannelOpen(true)}
            className="w-9 h-9 rounded-2xl bg-gradient-to-r from-[#ff607d] to-[#ff7b5f] text-white flex items-center justify-center shadow-sm active:scale-95 transition-all"
            title="Create new channel"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
          </button>
        </div>

        <div className="space-y-2">
          {channels.map((ch) => {
            const isSelected = selectedChannel?.id === ch.id;

            return (
              <div
                key={ch.id}
                onClick={() => setSelectedChannel(ch)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#ffe8ed] to-[#f0ebff] dark:from-[#2e1d2c] dark:to-[#221c38] border-[#7b5cf5]/40 shadow-sm'
                    : 'bg-white dark:bg-[#1f1b2c] border-bunny-border/80 hover:bg-bunny-border/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#ffe8ed] to-[#f0ebff] dark:from-[#2a1c27] dark:to-[#221c38] flex items-center justify-center text-xl flex-shrink-0">
                    {ch.icon_emoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <h3 className="text-xs font-bold text-bunny-ink truncate">{ch.name}</h3>
                      {ch.new_badge && (
                        <span className="px-1.5 py-0.2 rounded-full bg-[#ff607d]/15 text-[#ff607d] text-[9px] font-extrabold flex-shrink-0">
                          {ch.new_badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-bunny-muted truncate">{ch.description}</p>
                    <p className="text-[10px] text-bunny-muted mt-1 font-medium">
                      {ch.subscribers_count.toLocaleString()} subscribers
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Broadcast Feed Screen (Main area) */}
      <div className="flex-1 flex flex-col h-full bg-bunny-bg overflow-y-auto no-scrollbar p-4 md:p-6 pb-24 md:pb-8">
        {selectedChannel ? (
          <div className="max-w-2xl mx-auto w-full space-y-5">
            {/* Channel Top Header Card */}
            <div className="p-5 rounded-3xl bg-white dark:bg-[#1f1b2c] border border-bunny-border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-[#ffe8ed] to-[#f0ebff] dark:from-[#2e1d2c] dark:to-[#221c38] flex items-center justify-center text-3xl shadow-sm">
                  {selectedChannel.icon_emoji}
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-bunny-ink">{selectedChannel.name}</h2>
                  <p className="text-xs text-bunny-muted mt-0.5">{selectedChannel.description}</p>
                  <p className="text-[11px] text-emerald-500 font-semibold mt-1">
                    ● {selectedChannel.subscribers_count.toLocaleString()} active subscribers
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  onClick={() => {
                    if (selectedChannel.is_subscribed) {
                      unsubscribeChannel(selectedChannel.id);
                    } else {
                      subscribeChannel(selectedChannel.id);
                    }
                  }}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                    selectedChannel.is_subscribed
                      ? 'bg-bunny-border/60 text-bunny-ink hover:bg-bunny-border'
                      : 'bg-gradient-to-r from-[#ff607d] to-[#ff7b5f] text-white shadow-sm'
                  }`}
                >
                  {selectedChannel.is_subscribed ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Subscribed</span>
                    </>
                  ) : (
                    <span>Subscribe</span>
                  )}
                </button>
              </div>
            </div>

            {/* Pinned Broadcast Post */}
            {selectedChannel.latest_post && (
              <div className="p-5 rounded-3xl bg-white dark:bg-[#1f1b2c] border border-bunny-border shadow-sm space-y-3 relative overflow-hidden">
                <div className="flex items-center gap-1.5 text-[#ff607d] text-[10px] font-extrabold uppercase tracking-wider">
                  <Pin className="w-3.5 h-3.5 fill-[#ff607d]" />
                  <span>Pinned Broadcast Post</span>
                </div>

                <h3 className="text-sm font-extrabold text-bunny-ink">
                  {selectedChannel.latest_post.title}
                </h3>

                <p className="text-xs text-bunny-ink leading-relaxed">
                  {selectedChannel.latest_post.preview}
                </p>

                <div className="pt-3 border-t border-bunny-border flex items-center justify-between text-xs text-bunny-muted">
                  <span>{selectedChannel.latest_post.time}</span>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleLikePost(selectedChannel.name)}
                      className="flex items-center gap-1 text-bunny-muted hover:text-[#ff607d] transition-colors"
                    >
                      <Heart className="w-3.5 h-3.5 hover:fill-[#ff607d]" />
                      <span>{selectedChannel.latest_post.likes}</span>
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`https://bunnytalks.app/c/${selectedChannel.id}`);
                        showToast('Broadcast post link copied! 📢');
                      }}
                      className="flex items-center gap-1 text-bunny-muted hover:text-[#7b5cf5] transition-colors"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Share</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Previous Broadcast Story */}
            <div className="p-5 rounded-3xl bg-white dark:bg-[#1f1b2c] border border-bunny-border shadow-sm space-y-3">
              <h3 className="text-sm font-extrabold text-bunny-ink">
                Community Design Challenge: Soft UI Bunny Icons
              </h3>
              <p className="text-xs text-bunny-ink leading-relaxed">
                We are exploring gentle rounded cards, pastel ambient backdrops, and glowing online presence rings. Download the latest sample assets and give feedback.
              </p>
              <div className="rounded-2xl overflow-hidden aspect-video bg-slate-100 dark:bg-slate-800">
                <img
                  src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80"
                  alt="Broadcast banner"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="pt-2 flex items-center justify-between text-xs text-bunny-muted">
                <span>Yesterday, 4:15 PM</span>
                <span className="font-semibold text-[#ff607d]">❤️ 342 reactions</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-bunny-muted">
            Select a channel from the list to view broadcasts.
          </div>
        )}
      </div>
    </div>
  );
};
