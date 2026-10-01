import React, { useState } from 'react';
import { useChat, NavTab } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { 
  MessageCircle, 
  Users, 
  Compass, 
  UsersRound, 
  Radio, 
  Zap, 
  Bell, 
  User, 
  Settings, 
  HelpCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface NavItem {
  id: NavTab;
  label: string;
  icon: React.ElementType;
  badge?: number | string;
}

export const DesktopSidebar: React.FC = () => {
  const { activeTab, setActiveTab, conversations, friendRequests, notifications } = useChat();
  const { currentUser } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const totalUnreadChats = conversations.reduce((acc, c) => acc + (c.unread_count || 0), 0);
  const totalPendingRequests = friendRequests.filter((r) => r.status === 'pending').length;
  const totalUnreadNotifications = notifications.filter((n) => !n.is_read).length;

  const primaryItems: NavItem[] = [
    { id: 'chats', label: 'Chats', icon: MessageCircle, badge: totalUnreadChats > 0 ? totalUnreadChats : undefined },
    { id: 'friends', label: 'Friends', icon: Users, badge: totalPendingRequests > 0 ? totalPendingRequests : undefined },
    { id: 'discover', label: 'Discover', icon: Compass },
    { id: 'groups', label: 'Groups', icon: UsersRound },
    { id: 'channels', label: 'Channels', icon: Radio },
    { id: 'sparks', label: 'Sparks', icon: Zap, badge: '⚡' },
    { id: 'activity', label: 'Activity', icon: Bell, badge: totalUnreadNotifications > 0 ? totalUnreadNotifications : undefined },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const secondaryItems: NavItem[] = [
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      className={`hidden md:flex flex-col bg-white/70 dark:bg-[#181524]/75 backdrop-blur-xl border-r border-bunny-border select-none transition-all duration-300 relative ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Collapse Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-5 w-6 h-6 rounded-full bg-white dark:bg-[#201c2e] border border-bunny-border shadow-md flex items-center justify-center text-bunny-muted hover:text-bunny-ink transition-transform hover:scale-105 z-30"
        title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
      >
        {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      {/* Navigation List */}
      <div className="flex-1 py-4 px-3 space-y-6 overflow-y-auto no-scrollbar">
        {/* Primary Navigation */}
        <div className="space-y-1">
          {!isCollapsed && (
            <span className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-bunny-muted">
              Main Menu
            </span>
          )}
          {primaryItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id || (item.id === 'chats' && activeTab === 'room');

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all relative group ${
                  isActive
                    ? 'bg-gradient-to-r from-[#ff607d] to-[#ff7b5f] text-white shadow-[0_4px_16px_rgba(255,96,125,0.3)]'
                    : 'text-bunny-muted hover:text-bunny-ink hover:bg-bunny-border/50'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : ''}`} />
                {!isCollapsed && <span className="flex-1 text-left truncate">{item.label}</span>}
                
                {item.badge !== undefined && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold flex items-center justify-center ${
                      isActive
                        ? 'bg-white text-[#ff607d]'
                        : 'bg-[#ff607d] text-white shadow-sm'
                    } ${isCollapsed ? 'absolute -top-1 -right-1 w-4 h-4 p-0' : ''}`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Secondary Navigation */}
        <div className="space-y-1 pt-3 border-t border-bunny-border/60">
          {!isCollapsed && (
            <span className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-bunny-muted">
              Preferences
            </span>
          )}
          {secondaryItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-[#ff607d] to-[#ff7b5f] text-white shadow-[0_4px_16px_rgba(255,96,125,0.3)]'
                    : 'text-bunny-muted hover:text-bunny-ink hover:bg-bunny-border/50'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110" />
                {!isCollapsed && <span className="flex-1 text-left truncate">{item.label}</span>}
              </button>
            );
          })}

          <button
            onClick={() => setActiveTab('settings')}
            className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-2xl text-xs font-bold text-bunny-muted hover:text-bunny-ink hover:bg-bunny-border/50 transition-all group"
            title={isCollapsed ? 'Help & Support' : undefined}
          >
            <HelpCircle className="w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110" />
            {!isCollapsed && <span className="flex-1 text-left truncate">Help & Support</span>}
          </button>
        </div>
      </div>

      {/* User Status Card at bottom */}
      {!isCollapsed ? (
        <div className="p-3 m-3 rounded-2xl bg-gradient-to-br from-[#ffe8ed]/80 to-[#f0ebff]/80 dark:from-[#2a1c27] dark:to-[#221c38] border border-bunny-border flex items-center gap-3">
          <div className="relative flex-shrink-0">
            <img
              src={currentUser?.avatar_url || '/assets/maya.png'}
              alt={currentUser?.name}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-white dark:ring-[#201c2e]"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-[#201c2e]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-bunny-ink truncate">{currentUser?.name}</p>
            <p className="text-[10px] text-bunny-muted truncate">{currentUser?.mood_status || 'Online'}</p>
          </div>
        </div>
      ) : (
        <div className="p-3 flex justify-center">
          <img
            src={currentUser?.avatar_url || '/assets/maya.png'}
            alt={currentUser?.name}
            className="w-9 h-9 rounded-full object-cover ring-2 ring-[#ff607d]/40"
          />
        </div>
      )}
    </aside>
  );
};
