import React from 'react';
import { Search, X } from 'lucide-react';

interface InChatSearchProps {
  query: string;
  onChange: (q: string) => void;
  onClose: () => void;
  matchesCount: number;
}

export const InChatSearch: React.FC<InChatSearchProps> = ({
  query,
  onChange,
  onClose,
  matchesCount,
}) => {
  return (
    <div className="p-2.5 px-4 bg-white/95 dark:bg-[#181524]/95 border-b border-bunny-border flex items-center justify-between gap-3 text-xs select-none backdrop-blur-md">
      <div className="flex items-center gap-2 flex-1">
        <Search className="w-4 h-4 text-bunny-muted flex-shrink-0" />
        <input
          type="text"
          autoFocus
          value={query}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search in this chat..."
          className="bg-transparent border-0 outline-none text-xs text-bunny-ink placeholder:text-bunny-muted w-full"
        />
      </div>

      <div className="flex items-center gap-2">
        <span className="text-[11px] text-bunny-muted whitespace-nowrap">
          {query ? `${matchesCount} found` : ''}
        </span>
        <button
          onClick={onClose}
          className="p-1 rounded-full text-bunny-muted hover:text-bunny-ink"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
