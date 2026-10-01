import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { Conversation, Message, MessageReaction, MessageType } from '../types';
import { INITIAL_CONVERSATIONS, INITIAL_MESSAGES, ALL_USERS } from '../lib/mockData';
import { useAuth } from './AuthContext';
import { realtimeBus, RealtimePayload } from '../lib/realtimeBus';
import { getSupabaseClient } from '../lib/supabase';
import { playMessageSentSound, playMessageReceivedSound } from '../lib/audio';

interface SendMessageOptions {
  content: string;
  type?: MessageType;
  mediaUrl?: string;
  replyToId?: string;
  metadata?: any;
  attachments?: any[];
}

interface ChatContextType {
  conversations: Conversation[];
  activeConversationId: string | null;
  activeConversation: Conversation | null;
  messages: Message[];
  searchQuery: string;
  inChatSearchQuery: string;
  activeMainTab: 'chats' | 'contacts' | 'requests';
  setActiveConversationId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setInChatSearchQuery: (query: string) => void;
  setActiveMainTab: (tab: 'chats' | 'contacts' | 'requests') => void;
  sendMessage: (options: SendMessageOptions) => Promise<Message>;
  markConversationAsRead: (conversationId: string) => void;
  addReaction: (messageId: string, emoji: string) => void;
  deleteMessageForMe: (messageId: string) => void;
  deleteMessageForEveryone: (messageId: string) => void;
  starMessage: (messageId: string) => void;
  retryMessage: (messageId: string) => void;
  pinConversation: (conversationId: string) => void;
  muteConversation: (conversationId: string) => void;
  archiveConversation: (conversationId: string) => void;
  deleteConversationLocally: (conversationId: string) => void;
  startDirectConversation: (otherUserId: string) => Promise<string>;
  isDetailsOpen: boolean;
  setIsDetailsOpen: (open: boolean) => void;
  markConversationUnread: (conversationId: string) => void;
  forwardMessage: (message: Message, targetConversationId: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isContact } = useAuth();

  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = localStorage.getItem('nexus_conversations');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_CONVERSATIONS;
  });

  const [activeConversationId, setActiveConversationId] = useState<string | null>(() => {
    return 'conv-direct-ab';
  });

  const [messagesMap, setMessagesMap] = useState<Record<string, Message[]>>(() => {
    const saved = localStorage.getItem('nexus_messages_map');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_MESSAGES;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [inChatSearchQuery, setInChatSearchQuery] = useState('');
  const [activeMainTab, setActiveMainTab] = useState<'chats' | 'contacts' | 'requests'>('chats');
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const readReceiptDebounce = useRef<any>(null);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('nexus_conversations', JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem('nexus_messages_map', JSON.stringify(messagesMap));
  }, [messagesMap]);

  // Active conversation object
  const activeConversation = conversations.find((c) => c.id === activeConversationId) || null;
  const messages = activeConversationId ? (messagesMap[activeConversationId] || []) : [];

  // Mark conversation read
  const markConversationAsRead = useCallback((conversationId: string) => {
    if (!currentUser) return;

    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, unread_count: 0 } : c))
    );

    setMessagesMap((prev) => {
      const convMsgs = prev[conversationId] || [];
      const updated = convMsgs.map((m) => {
        if (m.sender_id !== currentUser.id && m.status !== 'read') {
          return { ...m, status: 'read' as const };
        }
        return m;
      });
      return { ...prev, [conversationId]: updated };
    });

    realtimeBus.emit({
      type: 'message:read',
      conversationId,
      senderId: currentUser.id,
      data: { conversationId, readerId: currentUser.id },
      timestamp: new Date().toISOString(),
    });

    if (readReceiptDebounce.current) clearTimeout(readReceiptDebounce.current);
    readReceiptDebounce.current = setTimeout(async () => {
      const supabase = getSupabaseClient();
      if (supabase) {
        await supabase
          .from('conversation_members')
          .update({ last_read_at: new Date().toISOString() })
          .match({ conversation_id: conversationId, user_id: currentUser.id });
      }
    }, 800);
  }, [currentUser]);

  useEffect(() => {
    if (activeConversationId) {
      markConversationAsRead(activeConversationId);
    }
  }, [activeConversationId, markConversationAsRead]);

  // Subscribe to Realtime Bus events
  useEffect(() => {
    const unsubscribe = realtimeBus.subscribe((payload: RealtimePayload) => {
      if (payload.type === 'message:new') {
        const newMsg: Message = payload.data;
        const convId = payload.conversationId || newMsg.conversation_id;

        setMessagesMap((prev) => {
          const list = prev[convId] || [];
          if (list.some((m) => m.id === newMsg.id)) return prev;
          return { ...prev, [convId]: [...list, newMsg] };
        });

        setConversations((prev) => {
          let found = false;
          const updated = prev.map((c) => {
            if (c.id === convId) {
              found = true;
              const isCurrentChat = activeConversationId === convId;
              const isMine = newMsg.sender_id === currentUser?.id;
              return {
                ...c,
                last_message: newMsg,
                last_message_at: newMsg.created_at,
                unread_count: isCurrentChat || isMine ? 0 : (c.unread_count || 0) + 1,
              };
            }
            return c;
          });

          if (!found) {
            // New conversation arrived
            const senderProfile = ALL_USERS.find((u) => u.id === newMsg.sender_id);
            const newConv: Conversation = {
              id: convId,
              type: 'direct',
              created_at: new Date().toISOString(),
              last_message_at: newMsg.created_at,
              members: [
                { id: 'm1', conversation_id: convId, user_id: currentUser?.id || '', joined_at: new Date().toISOString(), profile: currentUser || undefined },
                { id: 'm2', conversation_id: convId, user_id: newMsg.sender_id, joined_at: new Date().toISOString(), profile: senderProfile },
              ],
              other_user: senderProfile,
              last_message: newMsg,
              unread_count: 1,
            };
            return [newConv, ...prev];
          }

          return updated.sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime());
        });

        if (newMsg.sender_id !== currentUser?.id) {
          playMessageReceivedSound();
        }
      } else if (payload.type === 'message:read') {
        const { conversationId } = payload.data;
        setMessagesMap((prev) => {
          const convMsgs = prev[conversationId] || [];
          return {
            ...prev,
            [conversationId]: convMsgs.map((m) => (m.status !== 'read' ? { ...m, status: 'read' as const } : m)),
          };
        });
      } else if (payload.type === 'message:reaction') {
        const { messageId, reaction, userId } = payload.data;
        setMessagesMap((prev) => {
          const newMap = { ...prev };
          for (const cId in newMap) {
            newMap[cId] = newMap[cId].map((m) => {
              if (m.id === messageId) {
                const existing = m.reactions || [];
                const already = existing.find((r) => r.user_id === userId && r.reaction === reaction);
                let updatedReactions: MessageReaction[];
                if (already) {
                  updatedReactions = existing.filter((r) => !(r.user_id === userId && r.reaction === reaction));
                } else {
                  updatedReactions = [...existing, { id: 'r_' + Date.now(), message_id: messageId, user_id: userId, reaction, created_at: new Date().toISOString() }];
                }
                return { ...m, reactions: updatedReactions };
              }
              return m;
            });
          }
          return newMap;
        });
      } else if (payload.type === 'message:delete') {
        const { messageId, conversationId } = payload.data;
        setMessagesMap((prev) => {
          const convMsgs = prev[conversationId] || [];
          return {
            ...prev,
            [conversationId]: convMsgs.map((m) =>
              m.id === messageId ? { ...m, content: 'This message was deleted', deleted_at: new Date().toISOString(), message_type: 'system' as const } : m
            ),
          };
        });
      }
    });

    return () => unsubscribe();
  }, [activeConversationId, currentUser]);

  const sendMessage = async (options: SendMessageOptions): Promise<Message> => {
    if (!currentUser || !activeConversationId) throw new Error('No user or active conversation');

    const convId = activeConversationId;
    const stableId = 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

    const optimisticMessage: Message = {
      id: stableId,
      conversation_id: convId,
      sender_id: currentUser.id,
      message_type: options.type || 'text',
      content: options.content,
      media_url: options.mediaUrl,
      reply_to_message_id: options.replyToId,
      reply_to: options.replyToId ? messages.find((m) => m.id === options.replyToId) : undefined,
      metadata: options.metadata || {},
      status: 'sending',
      created_at: new Date().toISOString(),
      sender: currentUser,
    };

    // 1. Optimistic UI update immediately
    setMessagesMap((prev) => ({
      ...prev,
      [convId]: [...(prev[convId] || []), optimisticMessage],
    }));

    setConversations((prev) =>
      prev
        .map((c) => (c.id === convId ? { ...c, last_message: optimisticMessage, last_message_at: optimisticMessage.created_at } : c))
        .sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime())
    );

    playMessageSentSound();

    // 2. Broadcast to Realtime bus
    const confirmedMessage: Message = { ...optimisticMessage, status: 'sent' };
    realtimeBus.emit({
      type: 'message:new',
      conversationId: convId,
      senderId: currentUser.id,
      data: confirmedMessage,
      timestamp: new Date().toISOString(),
    });

    // 3. Supabase insert if configured
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('messages').insert({
          id: stableId,
          conversation_id: convId,
          sender_id: currentUser.id,
          message_type: optimisticMessage.message_type,
          content: options.content,
          media_url: options.mediaUrl,
          reply_to_message_id: options.replyToId,
          metadata: options.metadata || {},
        });
      } catch (err) {
        console.warn('Failed to insert message to Supabase:', err);
      }
    }

    // Set status to delivered
    setTimeout(() => {
      setMessagesMap((prev) => {
        const convMsgs = prev[convId] || [];
        return {
          ...prev,
          [convId]: convMsgs.map((m) => (m.id === stableId ? { ...m, status: 'delivered' } : m)),
        };
      });
    }, 350);

    return confirmedMessage;
  };

  const addReaction = (messageId: string, emoji: string) => {
    if (!currentUser || !activeConversationId) return;

    realtimeBus.emit({
      type: 'message:reaction',
      conversationId: activeConversationId,
      senderId: currentUser.id,
      data: { messageId, reaction: emoji, userId: currentUser.id },
      timestamp: new Date().toISOString(),
    });
  };

  const deleteMessageForMe = (messageId: string) => {
    if (!activeConversationId) return;
    setMessagesMap((prev) => ({
      ...prev,
      [activeConversationId]: (prev[activeConversationId] || []).filter((m) => m.id !== messageId),
    }));
  };

  const deleteMessageForEveryone = (messageId: string) => {
    if (!activeConversationId || !currentUser) return;
    realtimeBus.emit({
      type: 'message:delete',
      conversationId: activeConversationId,
      senderId: currentUser.id,
      data: { messageId, conversationId: activeConversationId },
      timestamp: new Date().toISOString(),
    });
  };

  const starMessage = (messageId: string) => {
    if (!activeConversationId) return;
    setMessagesMap((prev) => ({
      ...prev,
      [activeConversationId]: (prev[activeConversationId] || []).map((m) =>
        m.id === messageId ? { ...m, is_starred: !m.is_starred } : m
      ),
    }));
  };

  const retryMessage = (messageId: string) => {
    if (!activeConversationId) return;
    setMessagesMap((prev) => ({
      ...prev,
      [activeConversationId]: (prev[activeConversationId] || []).map((m) =>
        m.id === messageId ? { ...m, status: 'sent' } : m
      ),
    }));
  };

  const pinConversation = (conversationId: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, is_pinned: !c.is_pinned } : c))
    );
  };

  const muteConversation = (conversationId: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, is_muted: !c.is_muted } : c))
    );
  };

  const archiveConversation = (conversationId: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, is_archived: !c.is_archived } : c))
    );
  };

  const deleteConversationLocally = (conversationId: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== conversationId));
    if (activeConversationId === conversationId) {
      setActiveConversationId(null);
    }
  };

  const startDirectConversation = async (otherUserId: string): Promise<string> => {
    if (!currentUser) throw new Error('Not authenticated');

    const existing = conversations.find(
      (c) =>
        c.type === 'direct' &&
        c.members.some((m) => m.user_id === otherUserId) &&
        c.members.some((m) => m.user_id === currentUser.id)
    );

    if (existing) {
      setActiveConversationId(existing.id);
      setActiveMainTab('chats');
      return existing.id;
    }

    const otherUser = ALL_USERS.find((u) => u.id === otherUserId) || {
      id: otherUserId,
      name: 'Contact',
      username: 'user_' + otherUserId.substring(0, 5),
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUserId}`,
      is_online: true,
    };

    const newId = 'conv_' + Date.now();
    const newConv: Conversation = {
      id: newId,
      type: 'direct',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_message_at: new Date().toISOString(),
      members: [
        { id: 'm1_' + newId, conversation_id: newId, user_id: currentUser.id, joined_at: new Date().toISOString(), profile: currentUser },
        { id: 'm2_' + newId, conversation_id: newId, user_id: otherUserId, joined_at: new Date().toISOString(), profile: otherUser },
      ],
      other_user: otherUser,
      unread_count: 0,
    };

    setConversations((prev) => [newConv, ...prev]);
    setActiveConversationId(newId);
    setActiveMainTab('chats');
    return newId;
  };

  const markConversationUnread = useCallback((conversationId: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, unread_count: (c.unread_count || 0) + 1 } : c))
    );
  }, []);

  const forwardMessage = useCallback(async (message: Message, targetConversationId: string) => {
    const targetConv = conversations.find((c) => c.id === targetConversationId);
    if (!targetConv) return;
    setActiveConversationId(targetConversationId);
    await sendMessage({
      content: message.content,
      type: message.message_type || message.type || 'text',
      mediaUrl: message.media_url,
      metadata: message.metadata,
    });
  }, [conversations, sendMessage]);

  return (
    <ChatContext.Provider
      value={{
        conversations,
        activeConversationId,
        activeConversation,
        messages,
        searchQuery,
        inChatSearchQuery,
        activeMainTab,
        isDetailsOpen,
        setIsDetailsOpen,
        setActiveConversationId,
        setSearchQuery,
        setInChatSearchQuery,
        setActiveMainTab,
        sendMessage,
        markConversationAsRead,
        markConversationUnread,
        forwardMessage,
        addReaction,
        deleteMessageForMe,
        deleteMessageForEveryone,
        starMessage,
        retryMessage,
        pinConversation,
        muteConversation,
        archiveConversation,
        deleteConversationLocally,
        startDirectConversation,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within ChatProvider');
  return context;
};
