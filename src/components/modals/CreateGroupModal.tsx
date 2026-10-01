import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { X, UsersRound, Send } from 'lucide-react';

const CATEGORIES = ['Design & UI/UX', 'Product & Tech', 'Social & Leisure', 'Music & Beats', 'Gaming'];

export const CreateGroupModal: React.FC = () => {
  const { isCreateGroupOpen, setIsCreateGroupOpen, createGroup } = useChat();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);

  if (!isCreateGroupOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    createGroup(name, description, category);
    setName('');
    setDescription('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-[#201c2e] border border-bunny-border shadow-[0_20px_60px_rgba(0,0,0,0.3)] p-6 select-none">
        <div className="flex items-center justify-between pb-4 border-b border-bunny-border">
          <div className="flex items-center gap-2">
            <span className="text-xl">👥</span>
            <h3 className="text-sm font-extrabold text-bunny-ink">Create a Community Group</h3>
          </div>
          <button
            onClick={() => setIsCreateGroupOpen(false)}
            className="p-1.5 rounded-full text-bunny-muted hover:text-bunny-ink hover:bg-bunny-border/50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="text-[11px] font-bold text-bunny-muted uppercase tracking-wider block mb-1.5">
              Group Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Design Systems & Bunnies"
              className="w-full bg-bunny-border/30 text-xs px-3.5 py-2.5 rounded-xl border border-bunny-border outline-none text-bunny-ink placeholder:text-bunny-muted focus:border-[#7b5cf5]"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-bunny-muted uppercase tracking-wider block mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-bunny-border/30 text-xs px-3.5 py-2.5 rounded-xl border border-bunny-border outline-none text-bunny-ink"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-bunny-muted uppercase tracking-wider block mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell others what this group is about..."
              rows={3}
              className="w-full bg-bunny-border/30 text-xs px-3.5 py-2.5 rounded-xl border border-bunny-border outline-none text-bunny-ink placeholder:text-bunny-muted resize-none focus:border-[#7b5cf5]"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsCreateGroupOpen(false)}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-bunny-border/50 text-bunny-ink hover:bg-bunny-border"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#ff607d] to-[#ff7b5f] text-white shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <UsersRound className="w-3.5 h-3.5" />
              <span>Create Group</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
