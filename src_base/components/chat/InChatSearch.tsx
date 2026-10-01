import React, { useMemo } from 'react';
import { Search, X, ChevronUp, ChevronDown } from 'lucide-react';
import { Message } from '../../types';

interface InChatSearchProps {
  query: string;
  onQueryChange: (q: string) => void;
  onClose: () => void;
  messages: Message[];
  onJumpToMessage: (id: string) => void;
}

export const InChatSearch: React.FC<InChatSearchProps> = ({
  query,
  onQueryChange,
  onClose,
  messages,
  onJumpToMessage,
}) => {
  const matches = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return messages.filter(
      (m) =>
        m.content.toLowerCase().includes(q) ||
        (m.sender?.name || m.sender?.display_name || '').toLowerCase().includes(q)
    );
  }, [query, messages]);

  const [currentIndex, setCurrentIndex] = React.useState(0);

  const handleNext = () => {
    if (matches.length === 0) return;
    const next = (currentIndex + 1) % matches.length;
    setCurrentIndex(next);
    onJumpToMessage(matches[next].id);
  };

  const handlePrev = () => {
    if (matches.length === 0) return;
    const prev = (currentIndex - 1 + matches.length) % matches.length;
    setCurrentIndex(prev);
    onJumpToMessage(matches[prev].id);
  };

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs shadow-md animate-fade-in">
      <div className="flex items-center gap-2 flex-1 max-w-md">
        <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            onQueryChange(e.target.value);
            setCurrentIndex(0);
          }}
          placeholder="Search within this chat..."
          className="w-full bg-transparent text-slate-200 placeholder-slate-500 focus:outline-none"
          autoFocus
        />
      </div>

      <div className="flex items-center gap-2">
        {query.trim() && (
          <span className="text-slate-400 text-[11px]">
            {matches.length > 0 ? `${currentIndex + 1} of ${matches.length}` : '0 results'}
          </span>
        )}

        <button
          onClick={handlePrev}
          disabled={matches.length === 0}
          className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
        >
          <ChevronUp className="w-4 h-4" />
        </button>

        <button
          onClick={handleNext}
          disabled={matches.length === 0}
          className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
        >
          <ChevronDown className="w-4 h-4" />
        </button>

        <button
          onClick={onClose}
          className="p-1 rounded text-slate-400 hover:text-white cursor-pointer ml-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
