import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  User, 
  Lock, 
  Bell, 
  Palette, 
  MessageSquare, 
  ShieldCheck, 
  HelpCircle,
  Sun, 
  Moon,
  Laptop,
  Check,
  LogOut,
  ChevronRight
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { 
    privacySettings, 
    updatePrivacySettings, 
    chatPreferences, 
    updateChatPreferences, 
    setIsEditProfileOpen,
    showToast 
  } = useChat();
  const { theme, setTheme, accent, setAccent } = useTheme();

  const [activeSection, setActiveSection] = useState<'appearance' | 'privacy' | 'chat' | 'account' | 'about'>('appearance');

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full bg-bunny-bg overflow-hidden select-none">
      {/* Settings Navigation Sidebar */}
      <div className="w-full md:w-64 border-r border-bunny-border flex flex-col h-full bg-white/60 dark:bg-[#181524]/60 overflow-y-auto no-scrollbar p-4 md:p-5 pb-6 flex-shrink-0">
        <h1 className="text-xl font-extrabold text-bunny-ink tracking-tight mb-4">
          Settings ⚙️
        </h1>

        <div className="space-y-1">
          {[
            { id: 'appearance', label: 'Appearance & Theme', icon: Palette },
            { id: 'privacy', label: 'Privacy & Safety', icon: Lock },
            { id: 'chat', label: 'Chat Preferences', icon: MessageSquare },
            { id: 'account', label: 'Account & Security', icon: User },
            { id: 'about', label: 'About Bunny Talks', icon: HelpCircle },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id as any)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#ff607d] to-[#ff7b5f] text-white shadow-sm'
                    : 'text-bunny-muted hover:text-bunny-ink hover:bg-bunny-border/50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>
            );
          })}
        </div>

        <div className="mt-auto pt-4 border-t border-bunny-border">
          <button
            onClick={() => {
              logout();
              showToast('Logged out of Bunny Talks');
            }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-rose-500 hover:bg-rose-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Settings Body */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-5 md:p-8 pb-24 md:pb-8">
        <div className="max-w-xl mx-auto space-y-6">
          {/* Section: Appearance */}
          {activeSection === 'appearance' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h2 className="text-base font-extrabold text-bunny-ink mb-1">Appearance</h2>
                <p className="text-xs text-bunny-muted">Customize how Bunny Talks looks on your device.</p>
              </div>

              {/* Theme Selector */}
              <div className="p-5 rounded-3xl bg-white dark:bg-[#1f1b2c] border border-bunny-border shadow-sm space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-bunny-muted">Interface Theme</h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'light', label: 'Light', icon: Sun },
                    { id: 'dark', label: 'Dark', icon: Moon },
                    { id: 'system', label: 'System', icon: Laptop },
                  ].map((t) => {
                    const Icon = t.icon;
                    const isSelected = theme === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setTheme(t.id as any)}
                        className={`p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                          isSelected
                            ? 'border-[#ff607d] bg-[#ffe8ed]/30 dark:bg-[#2e1d2c]/30 shadow-xs'
                            : 'border-bunny-border hover:bg-bunny-border/20'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${isSelected ? 'text-[#ff607d]' : 'text-bunny-muted'}`} />
                        <span className="text-xs font-bold text-bunny-ink">{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Color Accents */}
              <div className="p-5 rounded-3xl bg-white dark:bg-[#1f1b2c] border border-bunny-border shadow-sm space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-bunny-muted">Accent Palette</h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'coral', label: 'Bunny Coral', color: 'bg-[#ff607d]' },
                    { id: 'purple', label: 'Lavender Violet', color: 'bg-[#7b5cf5]' },
                    { id: 'mint', label: 'Fresh Mint', color: 'bg-[#10b981]' },
                  ].map((acc) => {
                    const isSelected = accent === acc.id;
                    return (
                      <button
                        key={acc.id}
                        onClick={() => setAccent(acc.id as any)}
                        className={`p-3 rounded-2xl border flex items-center gap-2.5 transition-all ${
                          isSelected ? 'border-[#ff607d] bg-bunny-border/30' : 'border-bunny-border'
                        }`}
                      >
                        <span className={`w-4 h-4 rounded-full ${acc.color}`} />
                        <span className="text-xs font-bold text-bunny-ink truncate">{acc.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Section: Privacy */}
          {activeSection === 'privacy' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h2 className="text-base font-extrabold text-bunny-ink mb-1">Privacy & Safety</h2>
                <p className="text-xs text-bunny-muted">Manage who can see your presence, profile, and messages.</p>
              </div>

              <div className="p-5 rounded-3xl bg-white dark:bg-[#1f1b2c] border border-bunny-border shadow-sm divide-y divide-bunny-border/60">
                <div className="py-3 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-bunny-ink">Last Seen Visibility</h4>
                    <p className="text-[11px] text-bunny-muted">Control who sees your active status</p>
                  </div>
                  <select
                    value={privacySettings.last_seen_visibility}
                    onChange={(e) => updatePrivacySettings({ last_seen_visibility: e.target.value as any })}
                    className="bg-bunny-border/50 text-xs font-semibold rounded-xl px-3 py-1.5 border border-bunny-border outline-none text-bunny-ink"
                  >
                    <option value="everyone">Everyone</option>
                    <option value="contacts">Friends only</option>
                    <option value="nobody">Nobody</option>
                  </select>
                </div>

                <div className="py-3 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-bunny-ink">Read Receipts</h4>
                    <p className="text-[11px] text-bunny-muted">Send and receive message checkmarks</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={privacySettings.read_receipts}
                    onChange={(e) => updatePrivacySettings({ read_receipts: e.target.checked })}
                    className="w-4 h-4 accent-[#ff607d] rounded"
                  />
                </div>

                <div className="py-3 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-bunny-ink">Who can message me</h4>
                    <p className="text-[11px] text-bunny-muted">Direct messaging permissions</p>
                  </div>
                  <select
                    value={privacySettings.who_can_message_me}
                    onChange={(e) => updatePrivacySettings({ who_can_message_me: e.target.value as any })}
                    className="bg-bunny-border/50 text-xs font-semibold rounded-xl px-3 py-1.5 border border-bunny-border outline-none text-bunny-ink"
                  >
                    <option value="everyone">Everyone</option>
                    <option value="contacts">Friends only</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Section: Chat Preferences */}
          {activeSection === 'chat' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h2 className="text-base font-extrabold text-bunny-ink mb-1">Chat Settings</h2>
                <p className="text-xs text-bunny-muted">Customize keyboard shortcuts and message previews.</p>
              </div>

              <div className="p-5 rounded-3xl bg-white dark:bg-[#1f1b2c] border border-bunny-border shadow-sm divide-y divide-bunny-border/60">
                <div className="py-3 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-bunny-ink">Enter to Send</h4>
                    <p className="text-[11px] text-bunny-muted">Press Enter key to send message directly</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={chatPreferences.enter_to_send}
                    onChange={(e) => updateChatPreferences({ enter_to_send: e.target.checked })}
                    className="w-4 h-4 accent-[#ff607d] rounded"
                  />
                </div>

                <div className="py-3 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-bunny-ink">Media Auto-Download</h4>
                    <p className="text-[11px] text-bunny-muted">Automatically load photos and voice notes</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={chatPreferences.media_auto_download}
                    onChange={(e) => updateChatPreferences({ media_auto_download: e.target.checked })}
                    className="w-4 h-4 accent-[#ff607d] rounded"
                  />
                </div>

                <div className="py-3 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-bunny-ink">Message Sound Effects</h4>
                    <p className="text-[11px] text-bunny-muted">Play gentle chime on send and receive</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={chatPreferences.sound_effects}
                    onChange={(e) => updateChatPreferences({ sound_effects: e.target.checked })}
                    className="w-4 h-4 accent-[#ff607d] rounded"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section: Account */}
          {activeSection === 'account' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h2 className="text-base font-extrabold text-bunny-ink mb-1">Account & Security</h2>
                <p className="text-xs text-bunny-muted">Manage your personal credentials and session security.</p>
              </div>

              <div className="p-5 rounded-3xl bg-white dark:bg-[#1f1b2c] border border-bunny-border shadow-sm space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-bunny-border">
                  <img src={currentUser?.avatar_url} className="w-12 h-12 rounded-full object-cover" />
                  <div>
                    <h3 className="text-xs font-bold text-bunny-ink">{currentUser?.name}</h3>
                    <p className="text-[11px] text-bunny-muted">{currentUser?.email || `@${currentUser?.username}`}</p>
                  </div>
                  <button
                    onClick={() => setIsEditProfileOpen(true)}
                    className="ml-auto px-3 py-1.5 rounded-xl bg-bunny-border/50 text-xs font-bold hover:bg-bunny-border text-bunny-ink"
                  >
                    Edit
                  </button>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-bunny-ink">Two-Factor Authentication</h4>
                    <p className="text-[11px] text-bunny-muted">Protect your account with biometric / 2FA</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">
                    Active
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Section: About */}
          {activeSection === 'about' && (
            <div className="space-y-6 animate-in fade-in duration-200 text-center py-4">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#ffe8ed] to-[#f0ebff] dark:from-[#2e1d2c] dark:to-[#221c38] flex items-center justify-center text-3xl mx-auto shadow-md">
                🐰
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-bunny-ink">Bunny Talks</h2>
                <p className="text-xs text-bunny-muted mt-1">Version 2.4.0 • Production Build</p>
                <p className="text-xs text-bunny-muted max-w-sm mx-auto mt-3 leading-relaxed">
                  Crafted with Bunny Glass Social UI, real-time messaging, ephemeral Sparks, WebRTC calls, and cozy community channels.
                </p>
              </div>

              <div className="pt-4 flex justify-center gap-4 text-xs font-bold text-[#7b5cf5]">
                <a href="#terms" onClick={(e) => { e.preventDefault(); showToast('Terms of Service'); }}>Terms</a>
                <span>•</span>
                <a href="#privacy" onClick={(e) => { e.preventDefault(); showToast('Privacy Policy'); }}>Privacy</a>
                <span>•</span>
                <a href="#help" onClick={(e) => { e.preventDefault(); showToast('Help Center'); }}>Help</a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
