import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { X, Send, Search } from 'lucide-react';

export const ForwardModal: React.FC = () => {
  const { forwardingMessage, setForwardingMessage, conversations, forwardMessageTo } = useChat();
  const [search, setSearch] = useState('');

  if (!forwardingMessage) return null;

  const filtered = conversations.filter((c) => {
    const title = c.type === 'direct' ? c.other_user?.name : c.title;
    return title?.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-3xl bg-white dark:bg-[#201c2e] border border-bunny-border shadow-[0_20px_60px_rgba(0,0,0,0.3)] p-5 select-none max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-bunny-border">
          <h3 className="text-sm font-extrabold text-bunny-ink">Forward Message</h3>
          <button
            onClick={() => setForwardingMessage(null)}
            className="p-1 rounded-full text-bunny-muted hover:text-bunny-ink"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message snippet preview */}
        <div className="my-3 p-2.5 rounded-xl bg-bunny-border/40 text-xs text-bunny-muted line-clamp-2 italic border-l-2 border-[#ff607d]">
          “{forwardingMessage.content}”
        </div>

        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search chats to forward..."
          className="w-full bg-bunny-border/30 text-xs px-3 py-2 rounded-xl border border-bunny-border outline-none text-bunny-ink placeholder:text-bunny-muted mb-3"
        />

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto space-y-2 no-scrollbar">
          {filtered.map((conv) => {
            const name = conv.type === 'direct' ? conv.other_user?.name : conv.title;
            const avatar = conv.type === 'direct' ? conv.other_user?.avatar_url : conv.avatar_url;

            return (
              <div
                key={conv.id}
                onClick={() => forwardMessageTo(conv.id)}
                className="p-2.5 rounded-xl border border-bunny-border hover:bg-[#ffe8ed]/30 dark:hover:bg-[#2e1d2c]/30 cursor-pointer flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-2.5">
                  <img src={avatar || '/assets/bunny-icon.png'} className="w-8 h-8 rounded-full object-cover" />
                  <span className="text-xs font-bold text-bunny-ink">{name}</span>
                </div>
                <Send className="w-3.5 h-3.5 text-[#ff607d]" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
