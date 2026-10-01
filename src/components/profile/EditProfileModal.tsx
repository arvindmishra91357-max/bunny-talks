import React, { useState } from 'react';
import { X, Camera, Sparkles, Check, Smile } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, updateProfile } = useAuth();
  const { addToast } = useChat();

  const [displayName, setDisplayName] = useState(currentUser?.display_name || currentUser?.name || '');
  const [username, setUsername] = useState(currentUser?.username || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [statusText, setStatusText] = useState(currentUser?.mood_status || currentUser?.status_message || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatar_url || '');
  const [bannerUrl, setBannerUrl] = useState(currentUser?.bannerUrl || '');
  const [location, setLocation] = useState(currentUser?.location || '');
  const [website, setWebsite] = useState(currentUser?.website || '');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen || !currentUser) return null;

  const presetAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
  ];

  const moodPresets = [
    '🥕 Munching on carrots',
    '✨ Coding Bunny Talks',
    '🎧 Listening to chill hops',
    '🚀 Building communities',
    '😴 Napping in the burrow',
    '⚡ Available to chat',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({
        name: displayName,
        display_name: displayName,
        username,
        bio,
        mood_status: statusText,
        status_message: statusText,
        avatar_url: avatarUrl,
        bannerUrl,
        location,
        website,
      });
      addToast('Profile updated successfully! 🐰', 'success');
      onClose();
    } catch {
      addToast('Failed to update profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-profile-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-bunny-card rounded-3xl shadow-2xl border border-bunny-border/50 overflow-hidden flex flex-col max-h-[90vh] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-bunny-border/40">
          <div className="flex items-center gap-2">
            <span className="text-xl">🐰</span>
            <h2 id="edit-profile-title" className="text-lg font-bold text-bunny-text">
              Edit Bunny Profile
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-bunny-surface text-bunny-muted hover:text-bunny-text transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Banner & Avatar preview */}
          <div>
            <label className="text-xs font-bold text-bunny-muted uppercase tracking-wider block mb-2">
              Profile Media
            </label>
            <div className="relative h-28 rounded-2xl overflow-hidden bg-gradient-to-r from-bunny-coral/20 to-bunny-secondary/20 border border-bunny-border/50">
              {bannerUrl && (
                <img src={bannerUrl} alt="Cover banner" className="w-full h-full object-cover" />
              )}
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <span className="text-xs text-white bg-black/50 px-3 py-1.5 rounded-xl font-medium">
                  Banner Image URL below
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 -mt-10 px-4">
              <div className="relative w-20 h-20 rounded-full border-4 border-white dark:border-bunny-card shadow-lg overflow-hidden bg-bunny-surface">
                <img
                  src={avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity"
                  title="Change avatar"
                >
                  <Camera className="w-5 h-5" />
                </button>
              </div>

              {/* Preset avatar options */}
              <div className="flex items-center gap-2 pt-8">
                {presetAvatars.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setAvatarUrl(url)}
                    className={`w-8 h-8 rounded-full overflow-hidden border-2 transition-transform hover:scale-110 ${
                      avatarUrl === url ? 'border-bunny-coral ring-2 ring-bunny-coral/30' : 'border-transparent'
                    }`}
                  >
                    <img src={url} alt={`Preset ${i}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Display Name & Username */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-bunny-muted uppercase tracking-wider block mb-1.5">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-2xl bg-bunny-surface border border-bunny-border/50 text-bunny-text text-sm focus:outline-none focus:ring-2 focus:ring-bunny-coral/30"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-bunny-muted uppercase tracking-wider block mb-1.5">
                Username
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-bunny-muted text-sm font-semibold">@</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  required
                  className="w-full pl-8 pr-4 py-2.5 rounded-2xl bg-bunny-surface border border-bunny-border/50 text-bunny-text text-sm focus:outline-none focus:ring-2 focus:ring-bunny-coral/30 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Mood / Status Text */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-bunny-muted uppercase tracking-wider flex items-center gap-1.5">
                <Smile className="w-3.5 h-3.5 text-bunny-coral" />
                Mood / Status Status
              </label>
            </div>
            <input
              type="text"
              value={statusText}
              onChange={(e) => setStatusText(e.target.value)}
              placeholder="What are you up to?"
              className="w-full px-4 py-2.5 rounded-2xl bg-bunny-surface border border-bunny-border/50 text-bunny-text text-sm focus:outline-none focus:ring-2 focus:ring-bunny-coral/30 mb-2"
            />
            {/* Quick status chips */}
            <div className="flex flex-wrap gap-1.5">
              {moodPresets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setStatusText(preset)}
                  className="text-xs px-2.5 py-1 rounded-full bg-bunny-surface hover:bg-bunny-coral/10 hover:text-bunny-coral border border-bunny-border/40 text-bunny-muted transition-colors"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="text-xs font-bold text-bunny-muted uppercase tracking-wider block mb-1.5">
              Bunny Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="Tell the burrow about yourself..."
              className="w-full px-4 py-2.5 rounded-2xl bg-bunny-surface border border-bunny-border/50 text-bunny-text text-sm focus:outline-none focus:ring-2 focus:ring-bunny-coral/30 resize-none"
            />
          </div>

          {/* Location & Website */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-bunny-muted uppercase tracking-wider block mb-1.5">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Tokyo, JP / San Francisco"
                className="w-full px-4 py-2.5 rounded-2xl bg-bunny-surface border border-bunny-border/50 text-bunny-text text-sm focus:outline-none focus:ring-2 focus:ring-bunny-coral/30"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-bunny-muted uppercase tracking-wider block mb-1.5">
                Website
              </label>
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://bunnytalks.app"
                className="w-full px-4 py-2.5 rounded-2xl bg-bunny-surface border border-bunny-border/50 text-bunny-text text-sm focus:outline-none focus:ring-2 focus:ring-bunny-coral/30"
              />
            </div>
          </div>

          {/* Avatar & Banner URLs */}
          <div className="space-y-3 pt-2 border-t border-bunny-border/30">
            <div>
              <label className="text-xs font-medium text-bunny-muted block mb-1">
                Custom Avatar Image URL
              </label>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3.5 py-2 rounded-xl bg-bunny-surface border border-bunny-border/50 text-bunny-text text-xs focus:outline-none focus:ring-2 focus:ring-bunny-coral/30"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-bunny-muted block mb-1">
                Custom Banner Image URL
              </label>
              <input
                type="url"
                value={bannerUrl}
                onChange={(e) => setBannerUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3.5 py-2 rounded-xl bg-bunny-surface border border-bunny-border/50 text-bunny-text text-xs focus:outline-none focus:ring-2 focus:ring-bunny-coral/30"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-bunny-border/40">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl text-sm font-semibold text-bunny-muted hover:bg-bunny-surface transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-2xl text-sm font-bold bg-bunny-coral hover:opacity-95 text-white shadow-lg shadow-bunny-coral/25 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
