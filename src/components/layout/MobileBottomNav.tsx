import React from 'react';
import { useChat, NavTab } from '../../context/ChatContext';
import { 
  MessageCircle, 
  Users, 
  Zap, 
  Compass, 
  User, 
  Plus 
} from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const { activeTab, setActiveTab, conversations, friendRequests, setIsCreateSparkOpen } = useChat();

  const totalUnreadChats = conversations.reduce((acc, c) => acc + (c.unread_count || 0), 0);
  const totalPendingRequests = friendRequests.filter((r) => r.status === 'pending').length;

  const navItems: { id: NavTab; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'chats', label: 'Chats', icon: MessageCircle, badge: totalUnreadChats > 0 ? totalUnreadChats : undefined },
    { id: 'friends', label: 'Friends', icon: Users, badge: totalPendingRequests > 0 ? totalPendingRequests : undefined },
    { id: 'sparks', label: 'Sparks', icon: Zap },
    { id: 'discover', label: 'Discover', icon: Compass },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <>
      {/* Floating Action Button (FAB) for quick Spark / Compose */}
      <button
        onClick={() => setIsCreateSparkOpen(true)}
        className="md:hidden fixed right-5 bottom-[88px] w-13 h-13 rounded-2xl bg-gradient-to-tr from-[#ff607d] to-[#ff7b5f] text-white flex items-center justify-center shadow-[0_10px_25px_rgba(255,96,125,0.45)] hover:scale-105 active:scale-95 transition-all z-40"
        title="Post Instant Spark"
      >
        <span className="text-xl">✦</span>
      </button>

      {/* Mobile Glass Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[72px] bg-white/90 dark:bg-[#151322]/90 backdrop-blur-2xl border-t border-bunny-border flex items-center justify-around px-2 z-40 select-none pb-safe">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id || (item.id === 'chats' && activeTab === 'room');

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1 transition-all relative ${
                isActive ? 'text-[#ff607d]' : 'text-bunny-muted hover:text-bunny-ink'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 stroke-[2.5]' : ''}`} />
                {item.badge !== undefined && (
                  <span className="absolute -top-1 -right-2 px-1 min-w-[16px] h-4 rounded-full bg-[#ff607d] text-white text-[9px] font-extrabold flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-1 font-semibold ${isActive ? 'font-bold' : ''}`}>
                {item.label}
              </span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff607d] mt-0.5 animate-pulse" />
              )}
            </button>
          );
        })}
      </nav>
    </>
  );
};
