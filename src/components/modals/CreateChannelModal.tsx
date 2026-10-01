import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { X, Radio } from 'lucide-react';

const EMOJI_OPTIONS = ['📢', '🎨', '🎵', '💻', '🪩', '🕹️', '🌿', '☕', '🚀', '🐰'];

export const CreateChannelModal: React.FC = () => {
  const { isCreateChannelOpen, setIsCreateChannelOpen, createChannel } = useChat();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Design');
  const [iconEmoji, setIconEmoji] = useState(EMOJI_OPTIONS[0]);

  if (!isCreateChannelOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    createChannel(name, description, category, iconEmoji);
    setName('');
    setDescription('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-[#201c2e] border border-bunny-border shadow-[0_20px_60px_rgba(0,0,0,0.3)] p-6 select-none">
        <div className="flex items-center justify-between pb-4 border-b border-bunny-border">
          <div className="flex items-center gap-2">
            <span className="text-xl">📢</span>
            <h3 className="text-sm font-extrabold text-bunny-ink">Create a Channel</h3>
          </div>
          <button
            onClick={() => setIsCreateChannelOpen(false)}
            className="p-1.5 rounded-full text-bunny-muted hover:text-bunny-ink hover:bg-bunny-border/50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="text-[11px] font-bold text-bunny-muted uppercase tracking-wider block mb-1.5">
              Channel Icon
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  type="button"
                  key={emoji}
                  onClick={() => setIconEmoji(emoji)}
                  className={`w-9 h-9 rounded-xl border flex items-center justify-center text-lg transition-transform ${
                    iconEmoji === emoji ? 'border-[#7b5cf5] bg-[#7b5cf5]/15 scale-110' : 'border-bunny-border'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-bunny-muted uppercase tracking-wider block mb-1.5">
              Channel Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Design Systems & Co"
              className="w-full bg-bunny-border/30 text-xs px-3.5 py-2.5 rounded-xl border border-bunny-border outline-none text-bunny-ink placeholder:text-bunny-muted focus:border-[#7b5cf5]"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-bunny-muted uppercase tracking-wider block mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What will you broadcast in this channel?"
              rows={3}
              className="w-full bg-bunny-border/30 text-xs px-3.5 py-2.5 rounded-xl border border-bunny-border outline-none text-bunny-ink placeholder:text-bunny-muted resize-none focus:border-[#7b5cf5]"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsCreateChannelOpen(false)}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-bunny-border/50 text-bunny-ink hover:bg-bunny-border"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-[#7b5cf5] text-white shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Launch Channel</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
