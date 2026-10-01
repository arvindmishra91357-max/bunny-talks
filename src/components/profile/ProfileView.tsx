import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { PresenceStatus } from '../../types';
import { 
  Camera, 
  Edit3, 
  Share2, 
  Settings, 
  Sparkles, 
  Users, 
  Zap, 
  Radio, 
  UsersRound,
  Check,
  ShieldCheck,
  Moon,
  Sun
} from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { currentUser, updatePresence } = useAuth();
  const { 
    sparks, 
    friends, 
    groups, 
    channels, 
    setIsEditProfileOpen, 
    setActiveTab,
    showToast 
  } = useChat();

  const [activeProfileTab, setActiveProfileTab] = useState<'sparks' | 'about'>('sparks');

  const mySparks = sparks.filter((s) => s.user_id === currentUser?.id);

  const presenceOptions: { id: PresenceStatus; label: string; color: string }[] = [
    { id: 'online', label: 'Online', color: 'bg-emerald-500' },
    { id: 'away', label: 'Away', color: 'bg-amber-400' },
    { id: 'dnd', label: 'DND', color: 'bg-rose-500' },
    { id: 'invisible', label: 'Ghost', color: 'bg-slate-400' },
  ];

  const handleShareProfile = () => {
    navigator.clipboard.writeText(`https://bunnytalks.app/@${currentUser?.username}`);
    showToast('Profile link copied to clipboard! 🐰', 'success');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-bunny-bg overflow-y-auto no-scrollbar pb-24 md:pb-8 p-4 md:p-6 select-none max-w-2xl mx-auto w-full">
      {/* Top Profile Card with Ambient Mesh Gradient */}
      <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-[#1f1b2c] border border-bunny-border shadow-sm relative overflow-hidden mb-5">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#ff607d]/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-[#7b5cf5]/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative flex flex-col items-center text-center">
          {/* Avatar with live status ping */}
          <div className="relative mb-3 group cursor-pointer" onClick={() => setIsEditProfileOpen(true)}>
            <div className="w-24 h-24 rounded-full overflow-hidden shadow-[0_8px_24px_rgba(124,92,252,0.18)] ring-4 ring-white dark:ring-[#201c2e]">
              <img
                src={currentUser?.avatar_url || '/assets/maya.png'}
                alt={currentUser?.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            </div>
            <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-[#201c2e] shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            <button className="absolute -bottom-1 -left-1 w-8 h-8 rounded-full bg-white dark:bg-[#201c2e] text-bunny-ink flex items-center justify-center shadow-md border border-bunny-border hover:scale-105 transition-transform">
              <Camera className="w-4 h-4" />
            </button>
          </div>

          {/* Identity */}
          <div className="flex items-center gap-1.5 mb-0.5">
            <h1 className="text-xl font-extrabold text-bunny-ink">{currentUser?.name}</h1>
            <span className="text-[#7b5cf5] text-sm" title="Verified Bunny Citizen">🐰</span>
          </div>
          <p className="text-xs text-bunny-muted font-medium">@{currentUser?.username}</p>

          {/* Mood status chip */}
          <div
            onClick={() => setIsEditProfileOpen(true)}
            className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-bunny-border/50 hover:bg-bunny-border cursor-pointer transition-colors text-xs font-semibold text-[#7b5cf5]"
          >
            <span>{currentUser?.mood_status || '✨ Designing cool things'}</span>
            <Edit3 className="w-3 h-3 text-bunny-muted" />
          </div>

          {/* Bio text */}
          <p className="mt-3 text-xs text-bunny-ink max-w-sm leading-relaxed">
            {currentUser?.bio || 'Product Designer @ Bunny. Coffee lover, pixel perfectionist, and rabbit enthusiast 🐰✨'}
          </p>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 mt-5">
            <button
              onClick={() => setIsEditProfileOpen(true)}
              className="px-4 py-2 rounded-full bg-gradient-to-r from-[#ff607d] to-[#ff7b5f] text-white text-xs font-bold shadow-[0_4px_14px_rgba(255,96,125,0.3)] hover:opacity-95 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>

            <button
              onClick={handleShareProfile}
              className="px-4 py-2 rounded-full bg-bunny-border/50 hover:bg-bunny-border text-bunny-ink text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Profile</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className="w-9 h-9 rounded-full bg-bunny-border/50 hover:bg-bunny-border text-bunny-ink flex items-center justify-center transition-all"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>

          {/* Stats Matrix */}
          <div className="grid grid-cols-4 w-full mt-6 pt-4 border-t border-bunny-border/60 gap-2">
            <div className="flex flex-col items-center">
              <span className="text-base font-extrabold text-bunny-ink">
                {currentUser?.friends_count || friends.length}
              </span>
              <span className="text-[10px] text-bunny-muted font-bold">Friends</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-base font-extrabold text-bunny-ink">
                {currentUser?.sparks_count || 1420}
              </span>
              <span className="text-[10px] text-bunny-muted font-bold">Sparks</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-base font-extrabold text-bunny-ink">
                {currentUser?.groups_count || groups.length}
              </span>
              <span className="text-[10px] text-bunny-muted font-bold">Groups</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-base font-extrabold text-bunny-ink">
                {currentUser?.channels_count || channels.length}
              </span>
              <span className="text-[10px] text-bunny-muted font-bold">Channels</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Active Presence Switcher */}
      <div className="p-4 md:p-5 rounded-3xl bg-white dark:bg-[#1f1b2c] border border-bunny-border shadow-sm mb-5">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs font-extrabold uppercase tracking-wider text-bunny-muted">
            Active Presence Status
          </span>
          <span className="text-[11px] font-bold text-emerald-500 capitalize flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            Visible to friends
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {presenceOptions.map((opt) => {
            const isCurrent = currentUser?.presence_status === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => updatePresence(opt.id)}
                className={`py-2 px-1 rounded-2xl flex flex-col items-center justify-center transition-all ${
                  isCurrent
                    ? 'bg-[#7b5cf5] text-white shadow-sm'
                    : 'bg-bunny-border/40 hover:bg-bunny-border text-bunny-muted'
                }`}
              >
                <span className={`w-2.5 h-2.5 rounded-full mb-1 ${opt.color} ${isCurrent ? 'ring-2 ring-white' : ''}`} />
                <span className="text-[11px] font-bold">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tabs: My Sparks & About */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={() => setActiveProfileTab('sparks')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
            activeProfileTab === 'sparks'
              ? 'bg-[#7b5cf5] text-white shadow-sm'
              : 'bg-white dark:bg-[#1f1b2c] text-bunny-muted border border-bunny-border/80'
          }`}
        >
          My Sparks ({mySparks.length})
        </button>
        <button
          onClick={() => setActiveProfileTab('about')}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
            activeProfileTab === 'about'
              ? 'bg-[#7b5cf5] text-white shadow-sm'
              : 'bg-white dark:bg-[#1f1b2c] text-bunny-muted border border-bunny-border/80'
          }`}
        >
          About & Safety
        </button>
      </div>

      {/* Tab Content */}
      {activeProfileTab === 'sparks' ? (
        <div className="grid grid-cols-2 gap-3">
          {mySparks.map((spark) => (
            <div
              key={spark.id}
              className="p-4 rounded-3xl bg-white dark:bg-[#1f1b2c] border border-bunny-border shadow-sm flex flex-col justify-between"
            >
              <div>
                <span className="text-xs font-bold text-[#ff607d] block mb-1">
                  {spark.mood_badge || '✨ Spark'}
                </span>
                <p className="text-xs text-bunny-ink font-semibold line-clamp-2">
                  {spark.title || spark.caption}
                </p>
              </div>
              <div className="mt-4 pt-2 border-t border-bunny-border flex items-center justify-between text-[10px] text-bunny-muted">
                <span>{spark.expires_in || '24h'}</span>
                <span className="font-bold text-[#ff607d]">❤️ {spark.reactions_count}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-5 rounded-3xl bg-white dark:bg-[#1f1b2c] border border-bunny-border shadow-sm space-y-3 text-xs">
          <div>
            <h4 className="font-bold text-bunny-ink mb-1">Account Safety & Verification</h4>
            <p className="text-bunny-muted">
              Your profile is verified on Bunny Talks network. Messages are encrypted end-to-end.
            </p>
          </div>
          <div className="pt-2 border-t border-bunny-border">
            <h4 className="font-bold text-bunny-ink mb-1">Member Since</h4>
            <p className="text-bunny-muted">January 2026</p>
          </div>
        </div>
      )}
    </div>
  );
};
