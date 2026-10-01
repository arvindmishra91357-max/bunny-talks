import React from 'react';
import { useChat } from '../../context/ChatContext';
import { EmptyState } from '../common/EmptyState';
import { 
  Bell, 
  CheckCheck, 
  Heart, 
  UserPlus, 
  Radio, 
  Zap, 
  UsersRound, 
  MessageSquare,
  Sparkles
} from 'lucide-react';

export const ActivityView: React.FC = () => {
  const { 
    notifications, 
    markNotificationRead, 
    markAllNotificationsRead, 
    acceptFriendRequest,
    setActiveTab, 
    showToast 
  } = useChat();

  const getIcon = (type: string, emoji?: string) => {
    if (emoji) return <span className="text-base">{emoji}</span>;
    switch (type) {
      case 'friend_request':
        return <UserPlus className="w-4 h-4 text-[#ff607d]" />;
      case 'reaction':
        return <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />;
      case 'spark_activity':
        return <Zap className="w-4 h-4 text-amber-500" />;
      case 'channel_update':
        return <Radio className="w-4 h-4 text-[#7b5cf5]" />;
      case 'group_invite':
        return <UsersRound className="w-4 h-4 text-emerald-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-bunny-muted" />;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-bunny-bg overflow-y-auto no-scrollbar pb-24 md:pb-8 p-4 md:p-6 select-none max-w-3xl mx-auto w-full">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3 mb-5">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-bunny-muted">
            Updates & History
          </span>
          <h1 className="text-xl md:text-2xl font-extrabold text-bunny-ink tracking-tight">
            Activity & Notifications 🔔
          </h1>
        </div>

        {notifications.length > 0 && (
          <button
            onClick={markAllNotificationsRead}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-bunny-border/50 hover:bg-bunny-border text-bunny-ink text-xs font-bold transition-all"
          >
            <CheckCheck className="w-3.5 h-3.5 text-[#ff607d]" />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-2.5">
        {notifications.length > 0 ? (
          notifications.map((item) => (
            <div
              key={item.id}
              onClick={() => markNotificationRead(item.id)}
              className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                !item.is_read
                  ? 'bg-gradient-to-r from-[#ffe8ed]/60 to-[#f0ebff]/60 dark:from-[#2a1b27] dark:to-[#201a35] border-[#ff607d]/30 shadow-xs'
                  : 'bg-white dark:bg-[#1f1b2c] border-bunny-border/80 hover:bg-bunny-border/30'
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="relative flex-shrink-0">
                  {item.avatar_url ? (
                    <img
                      src={item.avatar_url}
                      alt={item.title}
                      className="w-11 h-11 rounded-full object-cover ring-2 ring-white dark:ring-[#201c2e]"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#ffe8ed] to-[#f0ebff] dark:from-[#2e1d2c] dark:to-[#221c38] flex items-center justify-center">
                      {getIcon(item.type, item.icon_emoji)}
                    </div>
                  )}

                  {/* Micro badge icon */}
                  {item.avatar_url && (
                    <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white dark:bg-[#181524] shadow-sm flex items-center justify-center text-[10px]">
                      {getIcon(item.type, item.icon_emoji)}
                    </span>
                  )}
                </div>

                <div className="min-w-0">
                  <p className="text-xs text-bunny-ink leading-snug">
                    <span className="font-extrabold">{item.title} </span>
                    <span className="text-bunny-muted">{item.description}</span>
                  </p>
                  <p className="text-[10px] text-bunny-muted mt-1">{item.time}</p>
                </div>
              </div>

              {/* Action Buttons if notification has actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {item.action_type === 'accept_request' ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      acceptFriendRequest('fr-1');
                      markNotificationRead(item.id);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#ff607d] to-[#ff7b5f] text-white text-xs font-bold shadow-sm active:scale-95 transition-all"
                  >
                    Accept
                  </button>
                ) : !item.is_read ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ff607d]" />
                ) : null}
              </div>
            </div>
          ))
        ) : (
          <EmptyState
            icon="🔔"
            title="No activity yet"
            description="When people react to your messages, send friend requests, or post sparks, you will see it here."
          />
        )}
      </div>
    </div>
  );
};
