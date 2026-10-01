import React, { useState } from 'react';
import { BunnyLogo } from '../common/BunnyLogo';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  Bell, 
  Sun, 
  Moon, 
  Plus, 
  Search, 
  Users, 
  UserCheck, 
  LogOut,
  ChevronDown
} from 'lucide-react';

export const AppHeader: React.FC = () => {
  const { currentUser, allUsers, switchUser, logout } = useAuth();
  const { 
    activeTab, 
    setActiveTab, 
    unreadNotificationsCount, 
    setIsNewChatOpen, 
    setIsCreateSparkOpen,
    showToast 
  } = useChat();
  const { isDark, toggleTheme } = useTheme();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <header className="h-16 px-4 md:px-6 bg-white/80 dark:bg-[#181524]/85 backdrop-blur-xl border-b border-bunny-border flex items-center justify-between sticky top-0 z-40 select-none">
      {/* Brand Logo */}
      <div className="flex items-center gap-4">
        <BunnyLogo 
          size="md" 
          onClick={() => setActiveTab('chats')} 
        />
        {/* Active view title chip for desktop */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-bunny-border/50 text-xs font-semibold text-bunny-muted capitalize">
          <span>🐰</span>
          <span>{activeTab === 'room' ? 'Conversation' : activeTab}</span>
        </div>
      </div>

      {/* Global Actions */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Quick Compose / Action button */}
        <button
          onClick={() => {
            if (activeTab === 'sparks') {
              setIsCreateSparkOpen(true);
            } else {
              setIsNewChatOpen(true);
            }
          }}
          className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#ff607d] to-[#ff7b5f] text-white text-xs font-bold shadow-[0_4px_14px_rgba(255,96,125,0.35)] hover:opacity-95 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>{activeTab === 'sparks' ? 'Post Spark' : 'New Chat'}</span>
        </button>

        {/* Global Search trigger for mobile */}
        <button
          onClick={() => {
            setActiveTab('chats');
            showToast('Search ready ⌕');
          }}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-bunny-muted hover:text-bunny-ink hover:bg-bunny-border/40 active:scale-95 transition-all"
          title="Search"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Notifications */}
        <button
          onClick={() => setActiveTab('activity')}
          className="relative w-9 h-9 rounded-xl flex items-center justify-center text-bunny-muted hover:text-bunny-ink hover:bg-bunny-border/40 active:scale-95 transition-all"
          title="Notifications & Activity"
        >
          <Bell className="w-4 h-4" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-gradient-to-r from-[#ff607d] to-[#ff7b5f] text-white text-[9px] font-extrabold flex items-center justify-center ring-2 ring-white dark:ring-[#181524]">
              {unreadNotificationsCount}
            </span>
          )}
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-bunny-muted hover:text-bunny-ink hover:bg-bunny-border/40 active:scale-95 transition-all"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#7b5cf5]" />}
        </button>

        <div className="h-6 w-px bg-bunny-border mx-0.5" />

        {/* User Profile & Demo Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2 p-1 pl-1.5 rounded-full hover:bg-bunny-border/50 border border-transparent hover:border-bunny-border transition-all"
          >
            <div className="relative">
              <img
                src={currentUser?.avatar_url || '/assets/maya.png'}
                alt={currentUser?.name || 'User'}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-[#ff607d]/40 shadow-sm"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-[#181524]" />
            </div>
            <span className="hidden md:inline-block text-xs font-bold text-bunny-ink max-w-[90px] truncate">
              {currentUser?.name || 'User'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-bunny-muted" />
          </button>

          {/* User Menu Dropdown */}
          {isUserMenuOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setIsUserMenuOpen(false)} 
              />
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-[#201c2e] border border-bunny-border shadow-[0_12px_36px_rgba(0,0,0,0.18)] p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="p-3 border-b border-bunny-border mb-1">
                  <p className="text-xs font-extrabold text-bunny-ink">{currentUser?.name}</p>
                  <p className="text-[11px] text-bunny-muted">@{currentUser?.username}</p>
                  <span className="inline-block mt-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#ff607d]/10 text-[#ff607d]">
                    {currentUser?.mood_status || '✨ Active on Bunny'}
                  </span>
                </div>

                <button
                  onClick={() => {
                    setActiveTab('profile');
                    setIsUserMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-bunny-ink hover:bg-bunny-border/50 text-left transition-colors"
                >
                  <UserCheck className="w-4 h-4 text-[#ff607d]" />
                  <span>My Profile</span>
                </button>

                {/* Quick Account Switcher for testing */}
                <div className="my-1.5 pt-1.5 border-t border-bunny-border">
                  <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-bunny-muted mb-1 flex items-center justify-between">
                    <span>Switch Test User</span>
                    <span className="text-[9px] text-[#7b5cf5]">Simulate 2 Users</span>
                  </p>
                  {allUsers.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        switchUser(u.id);
                        setIsUserMenuOpen(false);
                        showToast(`Switched active account to ${u.name} 🐰`);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs transition-colors ${
                        u.id === currentUser?.id
                          ? 'bg-[#ff607d]/10 text-[#ff607d] font-bold'
                          : 'text-bunny-muted hover:text-bunny-ink hover:bg-bunny-border/40'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <img src={u.avatar_url} className="w-5 h-5 rounded-full object-cover" />
                        <span className="truncate">{u.name}</span>
                      </div>
                      {u.id === currentUser?.id && <span className="text-[10px]">● Active</span>}
                    </button>
                  ))}
                </div>

                <div className="mt-1 pt-1 border-t border-bunny-border">
                  <button
                    onClick={() => {
                      logout();
                      setIsUserMenuOpen(false);
                      showToast('Logged out of Bunny Talks');
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-500/10 text-left transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
