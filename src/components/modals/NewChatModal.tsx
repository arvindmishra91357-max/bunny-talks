import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { X, Search, MessageSquarePlus, UserCheck } from 'lucide-react';

export const NewChatModal: React.FC = () => {
  const { isNewChatOpen, setIsNewChatOpen, createDirectConversation } = useChat();
  const { allUsers, currentUser } = useAuth();

  const [query, setQuery] = useState('');

  if (!isNewChatOpen) return null;

  const selectableUsers = allUsers.filter(
    (u) =>
      u.id !== currentUser?.id &&
      (u.name.toLowerCase().includes(query.toLowerCase()) ||
        u.username.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-[#201c2e] border border-bunny-border shadow-[0_20px_60px_rgba(0,0,0,0.3)] p-6 select-none max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-bunny-border flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xl">💬</span>
            <h3 className="text-sm font-extrabold text-bunny-ink">Start a Conversation</h3>
          </div>
          <button
            onClick={() => setIsNewChatOpen(false)}
            className="p-1.5 rounded-full text-bunny-muted hover:text-bunny-ink hover:bg-bunny-border/50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="relative my-3 flex-shrink-0">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-bunny-muted" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a name or username..."
            className="w-full bg-bunny-border/30 text-xs pl-9 pr-3 py-2.5 rounded-xl border border-bunny-border outline-none text-bunny-ink placeholder:text-bunny-muted focus:border-[#ff607d]"
          />
        </div>

        {/* User list */}
        <div className="flex-1 overflow-y-auto space-y-2 no-scrollbar py-1">
          {selectableUsers.map((user) => (
            <div
              key={user.id}
              onClick={() => {
                createDirectConversation(user);
                setIsNewChatOpen(false);
              }}
              className="p-3 rounded-2xl border border-bunny-border hover:border-[#ff607d]/50 hover:bg-[#ffe8ed]/30 dark:hover:bg-[#2e1d2c]/30 cursor-pointer flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={user.avatar_url}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover ring-1 ring-bunny-border"
                  />
                  {user.is_online && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-[#201c2e]" />
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-bunny-ink">{user.name}</h4>
                  <p className="text-[11px] text-bunny-muted">@{user.username}</p>
                </div>
              </div>

              <span className="section-action-btn" style={{ padding: '4px 10px', fontSize: '11px' }}>Chat</span>
            </div>
          ))}

          {selectableUsers.length === 0 && (
            <p className="text-xs text-center text-bunny-muted py-6">
              No contacts found for “{query}”.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
