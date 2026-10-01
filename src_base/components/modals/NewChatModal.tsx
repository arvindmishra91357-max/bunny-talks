import React, { useState, useEffect } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { useRealtime } from '../../context/RealtimeContext';
import { ALL_USERS } from '../../lib/mockData';
import { getSupabaseClient } from '../../lib/supabase';
import { Profile } from '../../types';
import {
  Search,
  X,
  UserPlus,
  MessageSquare,
  Clock,
  Check,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';

interface NewChatModalProps {
  onClose: () => void;
}

export const NewChatModal: React.FC<NewChatModalProps> = ({ onClose }) => {
  const { startDirectConversation } = useChat();
  const {
    currentUser,
    isContact,
    hasPendingRequestWith,
    sendContactRequest,
    acceptContactRequest,
    rejectContactRequest,
    contactRequests,
  } = useAuth();
  const { getUserPresence } = useRealtime();

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [actionNotice, setActionNotice] = useState<{ text: string; error?: boolean } | null>(null);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 250);
    return () => clearTimeout(handler);
  }, [search]);

  // Execute search (query Supabase profiles table if configured, or ALL_USERS in demo)
  useEffect(() => {
    const runSearch = async () => {
      if (!debouncedSearch.trim()) {
        setSearchResults(ALL_USERS.filter((u) => u.id !== currentUser?.id));
        return;
      }

      setIsSearching(true);
      const cleanQ = debouncedSearch.replace('@', '').toLowerCase();
      const supabase = getSupabaseClient();

      if (supabase) {
        try {
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .or(`username.ilike.%${cleanQ}%,name.ilike.%${cleanQ}%`)
            .neq('id', currentUser?.id)
            .limit(15);

          if (data && data.length > 0) {
            setSearchResults(data);
            setIsSearching(false);
            return;
          }
        } catch (e) {
          console.warn('Supabase profile search error:', e);
        }
      }

      // Local search fallback
      const filtered = ALL_USERS.filter(
        (u) =>
          u.id !== currentUser?.id &&
          (u.username.toLowerCase().includes(cleanQ) || u.name.toLowerCase().includes(cleanQ))
      );
      setSearchResults(filtered);
      setIsSearching(false);
    };

    runSearch();
  }, [debouncedSearch, currentUser?.id]);

  const handleAddContact = async (username: string) => {
    setActionNotice(null);
    const result = await sendContactRequest(username);
    setActionNotice({ text: result.message, error: !result.success });
    if (result.success) {
      setTimeout(() => setActionNotice(null), 3000);
    }
  };

  const handleMessage = async (userId: string) => {
    await startDirectConversation(userId);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in select-none">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base text-slate-100">Add Contact / New Chat</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice Info Banner */}
        <div className="px-5 py-2.5 bg-emerald-950/30 border-b border-emerald-500/20 text-xs text-emerald-300/90 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>Private messaging requires accepted contact connection.</span>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b border-slate-800">
          <div className="relative flex items-center bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 focus-within:border-emerald-500">
            <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by @username (e.g. @rahul123)..."
              className="w-full bg-transparent px-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
              autoFocus
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-slate-400 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Action feedback notice */}
        {actionNotice && (
          <div
            className={`mx-4 mt-3 p-2.5 rounded-xl text-xs flex items-center gap-2 ${
              actionNotice.error
                ? 'bg-rose-950/40 border border-rose-500/30 text-rose-300'
                : 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-300'
            }`}
          >
            {actionNotice.error ? <AlertCircle className="w-4 h-4 flex-shrink-0" /> : <Check className="w-4 h-4 flex-shrink-0" />}
            <span>{actionNotice.text}</span>
          </div>
        )}

        {/* Users List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1 mb-1">
            People
          </div>

          {searchResults.length > 0 ? (
            searchResults.map((user) => {
              const presence = getUserPresence(user.id);
              const connected = isContact(user.id);
              const pending = hasPendingRequestWith(user.id);

              // Check if user has an incoming request from this person
              const incoming = contactRequests.find(
                (r) => r.sender_id === user.id && r.receiver_id === currentUser?.id && r.status === 'pending'
              );

              return (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative flex-shrink-0">
                      <img
                        src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                        alt=""
                        className="w-11 h-11 rounded-full object-cover border border-slate-700"
                      />
                      {presence.isOnline && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full" />
                      )}
                    </div>
                    <div className="truncate">
                      <div className="font-bold text-xs text-white truncate">{user.name}</div>
                      <div className="text-[11px] text-emerald-400 font-mono truncate">@{user.username}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                        {presence.isOnline ? '🟢 Online' : presence.label}
                      </div>
                    </div>
                  </div>

                  {/* Actions depending on relationship state */}
                  <div className="flex-shrink-0 ml-2">
                    {connected ? (
                      <button
                        onClick={() => handleMessage(user.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-transform active:scale-95"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Message</span>
                      </button>
                    ) : incoming ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => acceptContactRequest(incoming.id)}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer shadow-sm"
                          title="Accept"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => rejectContactRequest(incoming.id)}
                          className="px-2 py-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400 text-xs cursor-pointer"
                          title="Reject"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : pending ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 text-amber-400/80 text-[11px] font-medium border border-slate-700">
                        <Clock className="w-3 h-3 text-amber-400" /> Pending
                      </span>
                    ) : (
                      <button
                        onClick={() => handleAddContact(user.username)}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-transform active:scale-95"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-10 text-xs text-slate-500">
              {isSearching ? 'Searching...' : 'No users found'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
