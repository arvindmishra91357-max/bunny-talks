import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { Message } from '../../types';
import { X, Share2, Check, Search } from 'lucide-react';

interface ForwardModalProps {
  message: Message;
  onClose: () => void;
}

export const ForwardModal: React.FC<ForwardModalProps> = ({ message, onClose }) => {
  const { conversations, forwardMessage } = useChat();

  const [selectedConvIds, setSelectedConvIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');

  const filteredConversations = conversations.filter((c) => {
    const title = c.other_user?.name || c.other_user?.display_name || c.title || 'Chat';
    return title.toLowerCase().includes(search.toLowerCase());
  });

  const toggleSelect = (id: string) => {
    setSelectedConvIds((prev) =>
      prev.includes(id) ? prev.filter((cId) => cId !== id) : [...prev, id]
    );
  };

  const handleSend = async () => {
    if (selectedConvIds.length === 0) return;
    for (const id of selectedConvIds) {
      await forwardMessage(message, id);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in select-none">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base text-slate-100">Forward Message</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message snippet preview */}
        <div className="px-5 py-3 bg-slate-950/60 border-b border-slate-800 text-xs text-slate-300 italic truncate">
          "{message.content || 'Media message'}"
        </div>

        {/* Search */}
        <div className="p-3 border-b border-slate-800">
          <div className="relative flex items-center bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-1.5 focus-within:border-emerald-500">
            <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations..."
              className="w-full bg-transparent px-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {filteredConversations.map((c) => {
            const isSelected = selectedConvIds.includes(c.id);
            const title = c.other_user?.name || c.other_user?.display_name || c.title || 'Direct Chat';
            const avatarUrl =
              c.other_user?.avatar_url ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.other_user?.username || c.id}`;

            return (
              <div
                key={c.id}
                onClick={() => toggleSelect(c.id)}
                className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-colors ${
                  isSelected ? 'bg-emerald-600/20 border border-emerald-500/30' : 'hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <img src={avatarUrl} alt="" className="w-9 h-9 rounded-full object-cover border border-slate-700" />
                  <span className="font-semibold text-xs text-slate-100">{title}</span>
                </div>

                <div
                  className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                    isSelected
                      ? 'bg-emerald-600 border-emerald-500 text-white'
                      : 'border-slate-600'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            {selectedConvIds.length} {selectedConvIds.length === 1 ? 'chat' : 'chats'} selected
          </span>
          <button
            onClick={handleSend}
            disabled={selectedConvIds.length === 0}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-lg"
          >
            Forward
          </button>
        </div>
      </div>
    </div>
  );
};
