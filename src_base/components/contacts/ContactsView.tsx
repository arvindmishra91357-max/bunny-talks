import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { useRealtime } from '../../context/RealtimeContext';
import { ALL_USERS } from '../../lib/mockData';
import {
  UserPlus,
  Search,
  Check,
  X,
  MessageSquare,
  Clock,
  UserCheck,
  AlertCircle,
} from 'lucide-react';

export const ContactsView: React.FC = () => {
  const {
    currentUser,
    contacts,
    contactRequests,
    sendContactRequest,
    acceptContactRequest,
    rejectContactRequest,
    isContact,
    hasPendingRequestWith,
  } = useAuth();

  const { startDirectConversation } = useChat();
  const { getUserPresence } = useRealtime();

  const [activeSubTab, setActiveSubTab] = useState<'contacts' | 'requests' | 'search'>('contacts');
  const [searchUsername, setSearchUsername] = useState('');
  const [requestStatusMsg, setRequestStatusMsg] = useState<{ text: string; error?: boolean } | null>(null);

  // Incoming pending requests directed to the current user
  const incomingRequests = contactRequests.filter(
    (r) => r.receiver_id === currentUser?.id && r.status === 'pending'
  );

  // Outgoing pending requests sent by the current user
  const outgoingRequests = contactRequests.filter(
    (r) => r.sender_id === currentUser?.id && r.status === 'pending'
  );

  // Search by username
  const searchResults = React.useMemo(() => {
    if (!searchUsername.trim()) return [];
    const q = searchUsername.replace('@', '').toLowerCase();
    return ALL_USERS.filter(
      (u) => u.id !== currentUser?.id && u.username.toLowerCase().includes(q)
    );
  }, [searchUsername, currentUser?.id]);

  const handleSendRequest = async (username: string) => {
    setRequestStatusMsg(null);
    const result = await sendContactRequest(username);
    setRequestStatusMsg({ text: result.message, error: !result.success });
    if (result.success) {
      setTimeout(() => setRequestStatusMsg(null), 3000);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 select-none">
      {/* Sub-tab navigation: Contacts | Requests (Badge) | Add People */}
      <div className="flex items-center border-b border-slate-800 bg-slate-900/60 px-4 pt-3 pb-2 text-xs">
        <button
          onClick={() => setActiveSubTab('contacts')}
          className={`flex-1 py-1.5 font-bold rounded-lg transition-colors cursor-pointer text-center ${
            activeSubTab === 'contacts' ? 'bg-emerald-600/20 text-emerald-400' : 'text-slate-400 hover:text-white'
          }`}
        >
          Contacts ({contacts.filter((c) => c.user_id === currentUser?.id).length})
        </button>

        <button
          onClick={() => setActiveSubTab('requests')}
          className={`flex-1 py-1.5 font-bold rounded-lg transition-colors cursor-pointer text-center relative ${
            activeSubTab === 'requests' ? 'bg-emerald-600/20 text-emerald-400' : 'text-slate-400 hover:text-white'
          }`}
        >
          Requests
          {incomingRequests.length > 0 && (
            <span className="ml-1.5 px-1.5 py-0.2 text-[10px] rounded-full bg-emerald-500 text-white font-bold">
              {incomingRequests.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('search')}
          className={`flex-1 py-1.5 font-bold rounded-lg transition-colors cursor-pointer text-center flex items-center justify-center gap-1 ${
            activeSubTab === 'search' ? 'bg-emerald-600/20 text-emerald-400' : 'text-slate-400 hover:text-white'
          }`}
        >
          <UserPlus className="w-3.5 h-3.5" /> Add
        </button>
      </div>

      {/* SUB-TAB 1: ACCEPTED CONTACTS */}
      {activeSubTab === 'contacts' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
            My Contacts
          </div>

          {contacts.filter((c) => c.user_id === currentUser?.id).length > 0 ? (
            contacts
              .filter((c) => c.user_id === currentUser?.id)
              .map((contact) => {
                const partner =
                  contact.contact_profile ||
                  ALL_USERS.find((u) => u.id === contact.contact_user_id) || {
                    id: contact.contact_user_id,
                    name: 'Contact',
                    username: 'user',
                    avatar_url: '',
                  };

                const presence = getUserPresence(partner.id);

                return (
                  <div
                    key={contact.id}
                    onClick={() => startDirectConversation(partner.id)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-900 cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative flex-shrink-0">
                        <img
                          src={
                            partner.avatar_url ||
                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${partner.username}`
                          }
                          alt=""
                          className="w-11 h-11 rounded-full object-cover border border-slate-700"
                        />
                        {presence.isOnline && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-950 rounded-full" />
                        )}
                      </div>
                      <div className="truncate">
                        <div className="font-semibold text-sm text-slate-100 truncate group-hover:text-emerald-400 transition-colors">
                          {partner.name}
                        </div>
                        <div className="text-xs text-slate-400 truncate">@{partner.username}</div>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startDirectConversation(partner.id);
                      }}
                      className="p-2 rounded-xl text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors"
                      title="Open private chat"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs">
              <UserCheck className="w-10 h-10 mx-auto mb-2 opacity-30 text-emerald-400" />
              <p className="font-medium text-slate-400">No contacts yet</p>
              <p className="mt-1 text-slate-500">Search a username to send a contact request.</p>
              <button
                onClick={() => setActiveSubTab('search')}
                className="mt-3 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold cursor-pointer"
              >
                Add People
              </button>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: CONTACT REQUESTS */}
      {activeSubTab === 'requests' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {/* Incoming requests */}
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-2">
              Incoming Requests ({incomingRequests.length})
            </div>

            {incomingRequests.length > 0 ? (
              incomingRequests.map((req) => {
                const sender =
                  req.sender ||
                  ALL_USERS.find((u) => u.id === req.sender_id) || {
                    id: req.sender_id,
                    name: 'User',
                    username: 'user',
                    avatar_url: '',
                  };

                return (
                  <div
                    key={req.id}
                    className="p-3 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={
                          sender.avatar_url ||
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${sender.username}`
                        }
                        alt=""
                        className="w-10 h-10 rounded-full object-cover border border-slate-700"
                      />
                      <div className="truncate">
                        <div className="font-bold text-xs text-white truncate">{sender.name}</div>
                        <div className="text-[11px] text-slate-400">@{sender.username}</div>
                        <div className="text-[10px] text-emerald-400 font-medium mt-0.5">
                          Wants to connect with you
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => acceptContactRequest(req.id)}
                        className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-transform active:scale-95 cursor-pointer"
                        title="Accept Request"
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                      </button>
                      <button
                        onClick={() => rejectContactRequest(req.id)}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Reject Request"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-500 px-2 py-4">No incoming connection requests.</p>
            )}
          </div>

          {/* Outgoing pending requests */}
          {outgoingRequests.length > 0 && (
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-2">
                Pending Sent Requests ({outgoingRequests.length})
              </div>
              <div className="space-y-1.5">
                {outgoingRequests.map((req) => {
                  const receiver =
                    req.receiver ||
                    ALL_USERS.find((u) => u.id === req.receiver_id) || {
                      id: req.receiver_id,
                      name: 'User',
                      username: 'user',
                    };

                  return (
                    <div
                      key={req.id}
                      className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-400" />
                        <span>@{receiver.username}</span>
                      </div>
                      <span className="text-[10px] text-amber-400/80 bg-amber-400/10 px-2 py-0.5 rounded-full font-medium">
                        Waiting for approval
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 3: SEARCH USERNAME & ADD */}
      {activeSubTab === 'search' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="text-xs text-slate-400 leading-relaxed">
            Search users by exact username (e.g. <strong className="text-emerald-400">@rahul123</strong>) to send a private connection request.
          </div>

          <div className="relative flex items-center bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 focus-within:border-emerald-500">
            <Search className="w-4 h-4 text-slate-400 flex-shrink-0 mr-2" />
            <input
              type="text"
              value={searchUsername}
              onChange={(e) => setSearchUsername(e.target.value)}
              placeholder="Search @username..."
              className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
              autoFocus
            />
          </div>

          {requestStatusMsg && (
            <div
              className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                requestStatusMsg.error
                  ? 'bg-rose-950/40 border border-rose-500/30 text-rose-300'
                  : 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-300'
              }`}
            >
              {requestStatusMsg.error ? <AlertCircle className="w-4 h-4" /> : <Check className="w-4 h-4" />}
              <span>{requestStatusMsg.text}</span>
            </div>
          )}

          <div className="space-y-1.5 pt-2">
            {searchResults.map((user) => {
              const alreadyContact = isContact(user.id);
              const pending = hasPendingRequestWith(user.id);

              return (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-900 border border-slate-800"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={
                        user.avatar_url ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`
                      }
                      alt=""
                      className="w-10 h-10 rounded-full object-cover border border-slate-700"
                    />
                    <div className="truncate">
                      <div className="font-bold text-xs text-white truncate">{user.name}</div>
                      <div className="text-[11px] text-emerald-400 font-mono truncate">@{user.username}</div>
                    </div>
                  </div>

                  {alreadyContact ? (
                    <button
                      onClick={() => startDirectConversation(user.id)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 font-semibold text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" /> Message
                    </button>
                  ) : pending ? (
                    <span className="px-2.5 py-1 text-[11px] bg-slate-800 text-slate-400 rounded-lg">
                      Pending
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSendRequest(user.username)}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow-md cursor-pointer transition-transform active:scale-95"
                    >
                      <UserPlus className="w-3.5 h-3.5" /> Add
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
