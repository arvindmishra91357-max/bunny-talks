import React, { useState, useMemo } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { useCall } from '../../context/CallContext';
import {
  X,
  Phone,
  Video,
  ShieldCheck,
  UserX,
  Trash2,
  Image as ImageIcon,
  FileText,
  Volume2,
  Link as LinkIcon,
  Download,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';

interface ChatDetailsProps {
  onClose: () => void;
  onOpenReport: (id: string, type: 'user' | 'group') => void;
  onOpenLightbox: (url: string, type: 'image' | 'video') => void;
}

export const ChatDetails: React.FC<ChatDetailsProps> = ({
  onClose,
  onOpenReport,
  onOpenLightbox,
}) => {
  const { activeConversation, messages, deleteConversationLocally } = useChat();
  const { currentUser, blockedUsers, blockContact, unblockContact } = useAuth();
  const { startCall } = useCall();

  const [activeMediaTab, setActiveMediaTab] = useState<'media' | 'docs' | 'audio' | 'links'>('media');

  if (!activeConversation) return null;

  const otherUser = activeConversation.other_user;
  const isBlocked = blockedUsers.some((b) => b.blocked_user_id === otherUser?.id);

  // Filter shared media items
  const mediaItems = useMemo(() => {
    return messages.filter(
      (m) =>
        (m.message_type === 'image' || m.message_type === 'video' || m.type === 'image' || m.type === 'video') &&
        !m.deleted_at
    );
  }, [messages]);

  const docItems = useMemo(() => {
    return messages.filter(
      (m) => (m.message_type === 'document' || m.type === 'document') && !m.deleted_at
    );
  }, [messages]);

  const audioItems = useMemo(() => {
    return messages.filter(
      (m) =>
        (m.message_type === 'voice' || m.message_type === 'audio' || m.type === 'voice' || m.type === 'audio') &&
        !m.deleted_at
    );
  }, [messages]);

  const linkItems = useMemo(() => {
    return messages.filter((m) => m.content.includes('http://') || m.content.includes('https://'));
  }, [messages]);

  const title = otherUser?.name || otherUser?.display_name || 'Contact Details';
  const avatarUrl =
    otherUser?.avatar_url ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUser?.username || 'contact'}`;

  const handleToggleBlock = async () => {
    if (!otherUser) return;
    if (isBlocked) {
      await unblockContact(otherUser.id);
    } else {
      if (confirm(`Block ${title}? They won't be able to message you.`)) {
        await blockContact(otherUser.id);
      }
    }
  };

  const handleClearChat = () => {
    if (confirm('Clear messages in this conversation?')) {
      deleteConversationLocally(activeConversation.id);
      onClose();
    }
  };

  return (
    <div className="w-full md:w-80 lg:w-96 h-full bg-slate-950 border-l border-slate-800/80 flex flex-col select-none overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/80 bg-slate-950/80">
        <h3 className="font-semibold text-sm text-slate-100">Contact Info</h3>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Profile Card */}
      <div className="p-5 flex flex-col items-center border-b border-slate-800/60 text-center">
        <img
          src={avatarUrl}
          alt={title}
          className="w-20 h-20 rounded-full object-cover bg-slate-800 border-2 border-emerald-500/30 shadow-md mb-3"
        />
        <h2 className="text-base font-bold text-slate-100">{title}</h2>
        {otherUser && (
          <p className="text-xs text-emerald-400 font-mono">@{otherUser.username}</p>
        )}
        <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
          {otherUser?.bio || 'Hey there! I am using Nexus.'}
        </p>

        {/* Quick Action Icons: Audio, Video */}
        {otherUser && (
          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={() => startCall(otherUser.id, 'audio', activeConversation.id)}
              className="flex flex-col items-center gap-1 p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 text-slate-300 hover:text-emerald-400 transition-colors cursor-pointer w-20"
            >
              <Phone className="w-4 h-4" />
              <span className="text-[10px] font-semibold">Audio</span>
            </button>
            <button
              onClick={() => startCall(otherUser.id, 'video', activeConversation.id)}
              className="flex flex-col items-center gap-1 p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 text-slate-300 hover:text-emerald-400 transition-colors cursor-pointer w-20"
            >
              <Video className="w-4 h-4" />
              <span className="text-[10px] font-semibold">Video</span>
            </button>
          </div>
        )}

        {/* E2EE Safety Number */}
        <div className="mt-4 p-2.5 rounded-xl bg-slate-900 border border-emerald-500/20 text-left w-full">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>End-to-End Encryption</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            Messages and calls are end-to-end encrypted. No one outside of this chat can read or listen to them.
          </p>
        </div>
      </div>

      {/* Shared Media Section */}
      <div className="p-4 border-b border-slate-800/60 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-3 text-xs">
          <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px]">
            Shared Media
          </span>
          <span className="text-slate-500">
            {mediaItems.length + docItems.length + audioItems.length}
          </span>
        </div>

        {/* Media Tabs */}
        <div className="flex border-b border-slate-800 text-[11px] mb-3">
          <button
            onClick={() => setActiveMediaTab('media')}
            className={`flex-1 pb-1.5 font-semibold border-b-2 transition-colors cursor-pointer flex items-center justify-center gap-1 ${
              activeMediaTab === 'media'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ImageIcon className="w-3 h-3" /> Media ({mediaItems.length})
          </button>
          <button
            onClick={() => setActiveMediaTab('docs')}
            className={`flex-1 pb-1.5 font-semibold border-b-2 transition-colors cursor-pointer flex items-center justify-center gap-1 ${
              activeMediaTab === 'docs'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3 h-3" /> Docs ({docItems.length})
          </button>
          <button
            onClick={() => setActiveMediaTab('audio')}
            className={`flex-1 pb-1.5 font-semibold border-b-2 transition-colors cursor-pointer flex items-center justify-center gap-1 ${
              activeMediaTab === 'audio'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Volume2 className="w-3 h-3" /> Audio ({audioItems.length})
          </button>
        </div>

        {/* Media Tab Contents */}
        <div className="flex-1 overflow-y-auto">
          {activeMediaTab === 'media' && (
            <div className="grid grid-cols-3 gap-1.5">
              {mediaItems.map((m) => {
                const url = m.media_url || m.attachments?.[0]?.file_url;
                if (!url) return null;
                const isVideo = m.message_type === 'video' || m.type === 'video';
                return (
                  <div
                    key={m.id}
                    onClick={() => onOpenLightbox(url, isVideo ? 'video' : 'image')}
                    className="aspect-square bg-slate-900 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity relative group"
                  >
                    {isVideo ? (
                      <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-300">
                        <Video className="w-5 h-5" />
                      </div>
                    ) : (
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                );
              })}
              {mediaItems.length === 0 && (
                <div className="col-span-3 text-center py-6 text-[11px] text-slate-500">
                  No photos or videos shared yet
                </div>
              )}
            </div>
          )}

          {activeMediaTab === 'docs' && (
            <div className="space-y-1.5">
              {docItems.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span className="truncate text-slate-200">{m.metadata?.file_name || 'Document.pdf'}</span>
                  </div>
                  <a
                    href={m.media_url || m.attachments?.[0]?.file_url || '#'}
                    download
                    className="text-slate-400 hover:text-white p-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
              {docItems.length === 0 && (
                <div className="text-center py-6 text-[11px] text-slate-500">No documents shared yet</div>
              )}
            </div>
          )}

          {activeMediaTab === 'audio' && (
            <div className="space-y-1.5">
              {audioItems.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-slate-300">Voice Note ({m.metadata?.duration || 8}s)</span>
                  </div>
                  <span className="text-[10px] text-slate-500">
                    {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
              {audioItems.length === 0 && (
                <div className="text-center py-6 text-[11px] text-slate-500">No voice messages shared yet</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Privacy / Danger Actions */}
      <div className="p-4 space-y-2 mt-auto">
        <button
          onClick={handleToggleBlock}
          className={`w-full py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer ${
            isBlocked
              ? 'bg-slate-800 border-slate-700 text-white'
              : 'border-rose-500/30 text-rose-400 hover:bg-rose-950/20'
          }`}
        >
          <UserX className="w-4 h-4" />
          <span>{isBlocked ? 'Unblock Contact' : 'Block Contact'}</span>
        </button>

        <button
          onClick={handleClearChat}
          className="w-full py-2.5 px-3 rounded-xl border border-slate-800 text-slate-400 hover:text-rose-400 hover:bg-slate-900 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
          <span>Clear Conversation</span>
        </button>
      </div>
    </div>
  );
};
