import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Bell,
  Users,
  Smile,
  Shield,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { BunnyLogo } from '../common/BunnyLogo';
import { mockUsers } from '../../lib/mockData';
import { Profile } from '../../types';

export const OnboardingWizard: React.FC = () => {
  const { currentUser, completeOnboarding, updateProfile } = useAuth();

  const [step, setStep] = useState(1);
  const totalSteps = 5;

  const [displayName, setDisplayName] = useState(currentUser?.displayName || 'Happy Bunny');
  const [username, setUsername] = useState(currentUser?.username || 'bunny_friend');
  const [bio, setBio] = useState(currentUser?.bio || 'Excited to hop around Bunny Talks! 🐰✨');
  const [avatarUrl, setAvatarUrl] = useState(
    currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'
  );
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [notificationsAllowed, setNotificationsAllowed] = useState(true);

  const avatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200',
  ];

  const handleNext = async () => {
    if (step < totalSteps) {
      setStep((prev) => prev + 1);
    } else {
      await updateProfile({
        name: displayName,
        display_name: displayName,
        username,
        bio,
        avatar_url: avatarUrl,
      });
      completeOnboarding({
        name: displayName,
        display_name: displayName,
        username,
        bio,
        avatar_url: avatarUrl,
      });
    }
  };

  const handleBack = () => {
    if (step > 1) setStep((prev) => prev - 1);
  };

  const toggleFriend = (id: string) => {
    setSelectedFriends((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-br from-bunny-surface via-bunny-bg to-bunny-surface text-bunny-text relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-bunny-coral/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-bunny-secondary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-lg mx-auto z-10">
        {/* Progress bar */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🐰</span>
            <span className="text-xs font-bold uppercase tracking-wider text-bunny-muted">
              Step {step} of {totalSteps}
            </span>
          </div>
          <div className="flex gap-1.5">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i + 1 <= step ? 'w-6 bg-bunny-coral' : 'w-2 bg-bunny-border/50'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Main Card */}
        <div className="bunny-glass rounded-3xl p-6 sm:p-8 shadow-2xl border border-bunny-border/50 backdrop-blur-xl">
          {/* STEP 1: Welcome */}
          {step === 1 && (
            <div className="text-center py-6 animate-fade-in">
              <div className="flex justify-center mb-4">
                <BunnyLogo size="lg" animate />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-bunny-text">
                Welcome to Bunny Talks!
              </h2>
              <p className="text-sm text-bunny-muted mt-2 max-w-sm mx-auto">
                A warm, friendly space for real-time messaging, spontaneous Sparks, and vibrant communities. Let's set up your profile!
              </p>
              <div className="mt-8 grid grid-cols-3 gap-3 text-left">
                <div className="p-3 rounded-2xl bg-bunny-surface/60 border border-bunny-border/40">
                  <span className="text-xl block mb-1">💬</span>
                  <h4 className="text-xs font-bold text-bunny-text">Real-Time Chat</h4>
                  <p className="text-[10px] text-bunny-muted mt-0.5">Calls, voice notes, stickers</p>
                </div>
                <div className="p-3 rounded-2xl bg-bunny-surface/60 border border-bunny-border/40">
                  <span className="text-xl block mb-1">✨</span>
                  <h4 className="text-xs font-bold text-bunny-text">Sparks</h4>
                  <p className="text-[10px] text-bunny-muted mt-0.5">Share moments & stories</p>
                </div>
                <div className="p-3 rounded-2xl bg-bunny-surface/60 border border-bunny-border/40">
                  <span className="text-xl block mb-1">🐰</span>
                  <h4 className="text-xs font-bold text-bunny-text">Burrows</h4>
                  <p className="text-[10px] text-bunny-muted mt-0.5">Channels & groups</p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Name & Username */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <h3 className="text-xl font-bold text-bunny-text">What should we call you?</h3>
                <p className="text-xs text-bunny-muted mt-1">
                  Choose your public identity on Bunny Talks.
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-bunny-muted uppercase tracking-wider block mb-1.5">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Maya Lin"
                  className="w-full px-4 py-3 rounded-2xl bg-bunny-surface border border-bunny-border/50 text-bunny-text text-sm focus:outline-none focus:ring-2 focus:ring-bunny-coral/30"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-bunny-muted uppercase tracking-wider block mb-1.5">
                  Bunny Username
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-bunny-muted text-sm font-bold">@</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    placeholder="mayalin"
                    className="w-full pl-9 pr-4 py-3 rounded-2xl bg-bunny-surface border border-bunny-border/50 text-bunny-text text-sm focus:outline-none focus:ring-2 focus:ring-bunny-coral/30 font-semibold"
                  />
                </div>
                <p className="text-[11px] text-bunny-muted mt-1">
                  Unique handle for friends to find and tag you.
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: Avatar & Bio */}
          {step === 3 && (
            <div className="space-y-4 animate-fade-in text-center">
              <div>
                <h3 className="text-xl font-bold text-bunny-text">Choose your Bunny Avatar</h3>
                <p className="text-xs text-bunny-muted mt-1">Pick a look or upload your own.</p>
              </div>

              <div className="flex justify-center my-2">
                <div className="relative w-24 h-24 rounded-full border-4 border-bunny-coral shadow-xl overflow-hidden">
                  <img src={avatarUrl} alt="Avatar preview" className="w-full h-full object-cover" />
                </div>
              </div>

              <div className="flex justify-center gap-3">
                {avatars.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setAvatarUrl(url)}
                    className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-transform hover:scale-110 ${
                      avatarUrl === url ? 'border-bunny-coral ring-2 ring-bunny-coral/30' : 'border-transparent'
                    }`}
                  >
                    <img src={url} alt={`Option ${i}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>

              <div className="text-left mt-4">
                <label className="text-xs font-bold text-bunny-muted uppercase tracking-wider block mb-1.5">
                  Bio / Status
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={2}
                  placeholder="Tell friends a bit about yourself..."
                  className="w-full px-4 py-2.5 rounded-2xl bg-bunny-surface border border-bunny-border/50 text-bunny-text text-sm focus:outline-none focus:ring-2 focus:ring-bunny-coral/30 resize-none"
                />
              </div>
            </div>
          )}

          {/* STEP 4: Connect with Friends */}
          {step === 4 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <h3 className="text-xl font-bold text-bunny-text">Hop with Friends</h3>
                <p className="text-xs text-bunny-muted mt-1">
                  Start your network! Follow these active members:
                </p>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {mockUsers.map((user: Profile) => {
                  const isSelected = selectedFriends.includes(user.id);
                  return (
                    <div
                      key={user.id}
                      onClick={() => toggleFriend(user.id)}
                      className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-bunny-coral bg-bunny-coral/5'
                          : 'border-bunny-border/40 hover:bg-bunny-surface/60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatarUrl}
                          alt={user.displayName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <h4 className="text-sm font-bold text-bunny-text">{user.displayName}</h4>
                          <p className="text-xs text-bunny-muted">@{user.username}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-bunny-coral text-white'
                            : 'bg-bunny-surface text-bunny-text border border-bunny-border/50 hover:bg-bunny-coral/10 hover:text-bunny-coral'
                        }`}
                      >
                        {isSelected ? 'Added ✓' : '+ Add'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 5: Permissions & Finish */}
          {step === 5 && (
            <div className="text-center py-4 space-y-5 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto mb-2">
                <Check className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-bunny-text">You're Ready to Hop!</h2>
              <p className="text-xs text-bunny-muted max-w-xs mx-auto">
                Notifications help you never miss a message or Spark reaction from your friends.
              </p>

              <div className="p-4 rounded-2xl bg-bunny-surface border border-bunny-border/50 flex items-center justify-between text-left">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-bunny-coral/10 text-bunny-coral">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-bunny-text">Enable Notifications</h4>
                    <p className="text-[11px] text-bunny-muted">Receive alerts for calls and messages</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={notificationsAllowed}
                  onChange={(e) => setNotificationsAllowed(e.target.checked)}
                  className="w-5 h-5 rounded accent-bunny-coral cursor-pointer"
                />
              </div>

              <div className="pt-2 text-[11px] text-bunny-muted flex items-center justify-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-bunny-coral" />
                <span>You can always change your preferences in Settings</span>
              </div>
            </div>
          )}

          {/* Bottom navigation buttons */}
          <div className="flex items-center justify-between pt-6 mt-6 border-t border-bunny-border/40">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2 rounded-xl text-xs font-bold text-bunny-muted hover:bg-bunny-surface flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            ) : (
              <div />
            )}

            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-bunny-coral to-bunny-primary text-white text-xs font-black shadow-lg shadow-bunny-coral/25 flex items-center gap-2 hover:opacity-95 transition-all active:scale-95"
            >
              <span>{step === totalSteps ? 'Hop Into App 🚀' : 'Continue'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
