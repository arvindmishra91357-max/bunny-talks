import React from 'react';
import { useRealtime } from '../../context/RealtimeContext';
import { useChat } from '../../context/ChatContext';
import { MessageSquare, X } from 'lucide-react';

export const ToastNotifications: React.FC = () => {
  const { notifications, dismissNotification } = useRealtime();
  const { setActiveConversationId } = useChat();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {notifications.map((n) => (
        <div
          key={n.id}
          onClick={() => {
            if (n.data?.conversationId) {
              setActiveConversationId(n.data.conversationId);
            }
            dismissNotification(n.id);
          }}
          className="pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl bg-slate-900/95 border border-indigo-500/40 text-white shadow-2xl backdrop-blur-xl cursor-pointer hover:border-indigo-400 transition-all transform hover:-translate-y-0.5 animate-slide-in-right"
        >
          <div className="w-8 h-8 rounded-full bg-indigo-600/30 text-indigo-400 flex items-center justify-center flex-shrink-0 mt-0.5">
            <MessageSquare className="w-4 h-4" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="font-bold text-xs text-indigo-300 truncate">{n.title}</div>
            <div className="text-xs text-slate-300 truncate mt-0.5">{n.body}</div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              dismissNotification(n.id);
            }}
            className="p-1 rounded-full text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
