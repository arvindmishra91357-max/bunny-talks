import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getStoredConfig, saveStoredConfig, isSupabaseConfigured, getSupabaseClient } from '../../lib/supabase';
import {
  X,
  User,
  Shield,
  Database,
  UserX,
  Save,
  Camera,
  Check,
  AlertCircle,
  LogOut,
  KeyRound,
  Bell,
  Palette,
  Info,
} from 'lucide-react';

interface ProfileModalProps {
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ onClose }) => {
  const {
    currentUser,
    privacySettings,
    blockedUsers,
    updateProfile,
    updatePrivacySettings,
    unblockUser,
    logout,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'profile' | 'privacy' | 'security' | 'blocked' | 'backend'>('profile');

  // Profile form state
  const [name, setName] = useState(currentUser?.name || '');
  const [username, setUsername] = useState(currentUser?.username || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatar_url || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Password change state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordNotice, setPasswordNotice] = useState<{ text: string; error?: boolean } | null>(null);

  // Privacy form state
  const [privacy, setPrivacy] = useState(privacySettings);
  const [privacySuccess, setPrivacySuccess] = useState(false);

  // Backend config form state
  const currentConfig = getStoredConfig();
  const [supabaseUrl, setSupabaseUrl] = useState(currentConfig.url);
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(currentConfig.key);
  const [backendSaved, setBackendSaved] = useState(false);

  const handleSaveProfile = async () => {
    const cleanUser = username.trim().toLowerCase();
    if (!cleanUser || cleanUser.length < 3 || cleanUser.length > 30 || !/^[a-zA-Z0-9_]+$/.test(cleanUser)) {
      alert('Username must be 3-30 characters long and contain only letters, numbers, and underscores.');
      return;
    }

    setIsSavingProfile(true);
    await updateProfile({
      name: name.trim(),
      username: cleanUser,
      bio: bio.trim(),
      avatar_url: avatarUrl.trim(),
    });
    setIsSavingProfile(false);
    setProfileSuccess(true);
    setTimeout(() => setProfileSuccess(false), 2000);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordNotice(null);

    if (newPassword.length < 6) {
      setPasswordNotice({ text: 'Password must be at least 6 characters long.', error: true });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordNotice({ text: 'Passwords do not match.', error: true });
      return;
    }

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) {
          setPasswordNotice({ text: error.message, error: true });
          return;
        }
      } catch (err: any) {
        setPasswordNotice({ text: err.message || 'Failed to update password', error: true });
        return;
      }
    }

    setPasswordNotice({ text: 'Password updated successfully!', error: false });
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleSavePrivacy = async () => {
    await updatePrivacySettings(privacy);
    setPrivacySuccess(true);
    setTimeout(() => setPrivacySuccess(false), 2000);
  };

  const handleSaveBackendConfig = () => {
    saveStoredConfig(supabaseUrl, supabaseAnonKey);
    setBackendSaved(true);
    setTimeout(() => {
      setBackendSaved(false);
      window.location.reload();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in select-none">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base text-slate-100">Settings & Profile</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b border-slate-800 text-xs px-4 bg-slate-950/40 overflow-x-auto">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3 px-3 font-semibold border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-colors ${
              activeTab === 'profile' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-4 h-4" /> Profile
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`py-3 px-3 font-semibold border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-colors ${
              activeTab === 'privacy' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-4 h-4" /> Privacy
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`py-3 px-3 font-semibold border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-colors ${
              activeTab === 'security' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <KeyRound className="w-4 h-4" /> Password
          </button>
          <button
            onClick={() => setActiveTab('blocked')}
            className={`py-3 px-3 font-semibold border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-colors ${
              activeTab === 'blocked' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserX className="w-4 h-4" /> Blocked ({blockedUsers.length})
          </button>
          <button
            onClick={() => setActiveTab('backend')}
            className={`py-3 px-3 font-semibold border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-colors ${
              activeTab === 'backend' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-4 h-4" /> Supabase
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* TAB 1: PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              {/* Avatar + Info */}
              <div className="flex items-center gap-5 pb-4 border-b border-slate-800">
                <div className="relative group cursor-pointer">
                  <img
                    src={avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`}
                    alt=""
                    className="w-20 h-20 rounded-full object-cover border-2 border-emerald-500 shadow-md"
                  />
                  <div
                    onClick={() => {
                      const seed = Math.random().toString(36).substring(7);
                      setAvatarUrl(`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`);
                    }}
                    className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-[10px]"
                    title="Click to generate random avatar"
                  >
                    <Camera className="w-5 h-5 mb-0.5" />
                    <span>Change</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-base font-bold text-slate-100">{currentUser?.name}</div>
                  <div className="text-xs text-emerald-400 font-mono">@{currentUser?.username}</div>
                  <div className="text-xs text-slate-400">{currentUser?.email}</div>
                </div>
              </div>

              {/* Form fields */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Username (unique)</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase())}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email</label>
                <input
                  type="text"
                  value={currentUser?.email || ''}
                  disabled
                  className="w-full bg-slate-800/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-400 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">About / Status</label>
                <input
                  type="text"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Hey there! I am using Nexus."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  onClick={() => {
                    logout();
                    onClose();
                  }}
                  className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>

                <button
                  onClick={handleSaveProfile}
                  disabled={isSavingProfile}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg transition-transform active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  {profileSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                  {profileSuccess ? 'Saved!' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: PRIVACY */}
          {activeTab === 'privacy' && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Last Seen & Online</label>
                <select
                  value={privacy.last_seen_visibility}
                  onChange={(e) => setPrivacy({ ...privacy, last_seen_visibility: e.target.value as any })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="everyone">Everyone</option>
                  <option value="contacts">My Contacts</option>
                  <option value="nobody">Nobody</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Profile Photo Visibility</label>
                <select
                  value={privacy.profile_photo_visibility}
                  onChange={(e) => setPrivacy({ ...privacy, profile_photo_visibility: e.target.value as any })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="everyone">Everyone</option>
                  <option value="contacts">My Contacts</option>
                  <option value="nobody">Nobody</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800 border border-slate-700">
                <div>
                  <div className="font-semibold text-slate-200">Read Receipts</div>
                  <div className="text-[11px] text-slate-400">If turned off, you won't send or receive read receipts (blue ticks)</div>
                </div>
                <input
                  type="checkbox"
                  checked={privacy.read_receipts}
                  onChange={(e) => setPrivacy({ ...privacy, read_receipts: e.target.checked })}
                  className="w-4 h-4 accent-emerald-500 rounded"
                />
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  onClick={handleSavePrivacy}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg transition-transform active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  {privacySuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                  {privacySuccess ? 'Privacy Updated' : 'Update Privacy Settings'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: SECURITY / CHANGE PASSWORD */}
          {activeTab === 'security' && (
            <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
              <div className="text-slate-400 text-[11px] leading-relaxed">
                Update your account password for secure private messaging access.
              </div>

              {passwordNotice && (
                <div
                  className={`p-2.5 rounded-xl flex items-center gap-2 ${
                    passwordNotice.error
                      ? 'bg-rose-950/40 border border-rose-500/30 text-rose-300'
                      : 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-300'
                  }`}
                >
                  {passwordNotice.error ? <AlertCircle className="w-4 h-4 flex-shrink-0" /> : <Check className="w-4 h-4 flex-shrink-0" />}
                  <span>{passwordNotice.text}</span>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-300 mb-1">New Password (minimum 6 chars)</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg cursor-pointer"
                >
                  Update Password
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: BLOCKED USERS */}
          {activeTab === 'blocked' && (
            <div className="space-y-3">
              <div className="text-slate-400 text-xs mb-2">
                Blocked contacts cannot send messages to you or initiate conversations.
              </div>
              {blockedUsers.length > 0 ? (
                blockedUsers.map((b) => (
                  <div key={b.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs">
                    <div>
                      <div className="font-semibold text-slate-200">
                        {b.blocked_profile?.name || 'Blocked User'}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Blocked on {new Date(b.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <button
                      onClick={() => unblockUser(b.blocked_user_id)}
                      className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold cursor-pointer"
                    >
                      Unblock
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-xs text-slate-500">
                  You haven't blocked any contacts.
                </div>
              )}
            </div>
          )}

          {/* TAB 5: SUPABASE CONFIG */}
          {activeTab === 'backend' && (
            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300">
                <div className="font-bold flex items-center gap-1.5 mb-1 text-white">
                  <Database className="w-4 h-4 text-emerald-400" />
                  Supabase Backend Configuration
                </div>
                <p className="text-[11px] leading-relaxed text-slate-300">
                  Nexus uses Supabase Auth, PostgreSQL with Row Level Security, Realtime channels, and Storage buckets (avatars, chat-media, chat-documents, chat-audio).
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Supabase Project URL</label>
                <input
                  type="text"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  placeholder="https://your-project.supabase.co"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Supabase Anon Public Key</label>
                <input
                  type="password"
                  value={supabaseAnonKey}
                  onChange={(e) => setSupabaseAnonKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="text-[11px] text-slate-400">
                  Status:{' '}
                  {isSupabaseConfigured() ? (
                    <span className="text-emerald-400 font-semibold">Live Supabase Connected</span>
                  ) : (
                    <span className="text-amber-400 font-medium">Local Realtime Demo Mode</span>
                  )}
                </div>

                <button
                  onClick={handleSaveBackendConfig}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg transition-transform active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  {backendSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                  {backendSaved ? 'Connecting...' : 'Save & Connect'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
