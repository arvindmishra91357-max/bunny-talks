import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Conversation, 
  Message, 
  Friend, 
  FriendRequest, 
  GroupItem, 
  ChannelItem, 
  SparkItem, 
  ActivityNotification, 
  MessageType,
  Profile,
  PrivacySettings,
  ChatPreferences
} from '../types';
import { 
  INITIAL_CONVERSATIONS, 
  INITIAL_MESSAGES, 
  INITIAL_FRIENDS, 
  INITIAL_FRIEND_REQUESTS, 
  INITIAL_GROUPS, 
  INITIAL_CHANNELS, 
  INITIAL_SPARKS, 
  INITIAL_NOTIFICATIONS,
  DEFAULT_PRIVACY,
  DEFAULT_CHAT_PREFERENCES,
  LIAM_USER
} from '../lib/mockData';
import { useAuth } from './AuthContext';
import { realtimeBus } from '../lib/realtimeBus';

export type NavTab = 
  | 'chats' 
  | 'friends' 
  | 'discover' 
  | 'groups' 
  | 'channels' 
  | 'sparks' 
  | 'activity' 
  | 'profile' 
  | 'settings' 
  | 'room';

export type FilterPill = 'all' | 'unread' | 'groups' | 'channels' | 'favorites';

export interface ToastItem {
  id: string;
  message: string;
  type?: 'info' | 'success' | 'warning';
}

interface ChatContextType {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  conversations: Conversation[];
  activeConversationId: string | null;
  activeConversation: Conversation | null;
  selectConversation: (id: string) => void;
  createDirectConversation: (targetProfile: Profile) => string;
  messages: Record<string, Message[]>;
  currentMessages: Message[];
  sendMessage: (content: string, type?: MessageType, mediaUrl?: string, metadata?: any, replyToId?: string) => Promise<void>;
  editMessage: (messageId: string, newContent: string) => void;
  deleteMessage: (messageId: string, forEveryone?: boolean) => void;
  addReaction: (messageId: string, emoji: string) => void;
  togglePinMessage: (messageId: string) => void;
  toggleStarMessage: (messageId: string) => void;
  replyingTo: Message | null;
  setReplyingTo: (msg: Message | null) => void;
  forwardingMessage: Message | null;
  setForwardingMessage: (msg: Message | null) => void;
  forwardMessageTo: (targetConvId: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filterPill: FilterPill;
  setFilterPill: (f: FilterPill) => void;
  filteredConversations: Conversation[];
  friends: Friend[];
  friendRequests: FriendRequest[];
  acceptFriendRequest: (reqId: string) => void;
  declineFriendRequest: (reqId: string) => void;
  sendFriendRequest: (targetUserId: string) => void;
  groups: GroupItem[];
  createGroup: (name: string, description: string, category: string, avatarUrl?: string) => void;
  joinGroup: (groupId: string) => void;
  leaveGroup: (groupId: string) => void;
  channels: ChannelItem[];
  createChannel: (name: string, description: string, category: string, iconEmoji: string) => void;
  subscribeChannel: (channelId: string) => void;
  unsubscribeChannel: (channelId: string) => void;
  sparks: SparkItem[];
  createSpark: (data: Partial<SparkItem>) => void;
  reactToSpark: (sparkId: string, emoji?: string) => void;
  viewingSpark: SparkItem | null;
  setViewingSpark: (spark: SparkItem | null) => void;
  notifications: ActivityNotification[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  unreadNotificationsCount: number;
  typingUsers: Record<string, string[]>;
  sendTyping: (isTyping: boolean) => void;
  isCreateSparkOpen: boolean;
  setIsCreateSparkOpen: (open: boolean) => void;
  isCreateGroupOpen: boolean;
  setIsCreateGroupOpen: (open: boolean) => void;
  isCreateChannelOpen: boolean;
  setIsCreateChannelOpen: (open: boolean) => void;
  isEditProfileOpen: boolean;
  setIsEditProfileOpen: (open: boolean) => void;
  isNewChatOpen: boolean;
  setIsNewChatOpen: (open: boolean) => void;
  lightboxMedia: { url: string; type: 'image' | 'video'; title?: string } | null;
  setLightboxMedia: (media: { url: string; type: 'image' | 'video'; title?: string } | null) => void;
  reportModalTarget: { id: string; name: string; type: string } | null;
  setReportModalTarget: (target: { id: string; name: string; type: string } | null) => void;
  isContextPanelOpen: boolean;
  setContextPanelOpen: (open: boolean) => void;
  toggleContextPanel: () => void;
  activeModal: string | null;
  modalData: any;
  openModal: (modal: string, data?: any) => void;
  closeModal: () => void;
  toasts: ToastItem[];
  showToast: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  addToast: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;
  privacySettings: PrivacySettings;
  updatePrivacySettings: (settings: Partial<PrivacySettings>) => void;
  chatPreferences: ChatPreferences;
  updateChatPreferences: (prefs: Partial<ChatPreferences>) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, allUsers } = useAuth();

  const [activeTab, setActiveTabState] = useState<NavTab>(() => {
    return (localStorage.getItem('bunny_active_tab') as NavTab) || 'chats';
  });

  const setActiveTab = (tab: NavTab) => {
    setActiveTabState(tab);
    localStorage.setItem('bunny_active_tab', tab);
  };

  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = localStorage.getItem('bunny_conversations');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_CONVERSATIONS;
  });

  const [activeConversationId, setActiveConversationId] = useState<string | null>(() => {
    return localStorage.getItem('bunny_active_conv_id') || 'conv-liam-direct';
  });

  const [messages, setMessages] = useState<Record<string, Message[]>>(() => {
    const saved = localStorage.getItem('bunny_messages');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_MESSAGES;
  });

  const [friends, setFriends] = useState<Friend[]>(() => {
    const saved = localStorage.getItem('bunny_friends');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_FRIENDS;
  });

  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>(() => {
    const saved = localStorage.getItem('bunny_friend_requests');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_FRIEND_REQUESTS;
  });

  const [groups, setGroups] = useState<GroupItem[]>(() => {
    const saved = localStorage.getItem('bunny_groups');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_GROUPS;
  });

  const [channels, setChannels] = useState<ChannelItem[]>(() => {
    const saved = localStorage.getItem('bunny_channels');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_CHANNELS;
  });

  const [sparks, setSparks] = useState<SparkItem[]>(() => {
    const saved = localStorage.getItem('bunny_sparks');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_SPARKS;
  });

  const [notifications, setNotifications] = useState<ActivityNotification[]>(() => {
    const saved = localStorage.getItem('bunny_notifications');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_NOTIFICATIONS;
  });

  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>(() => {
    const saved = localStorage.getItem('bunny_privacy_settings');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return DEFAULT_PRIVACY;
  });

  const [chatPreferences, setChatPreferences] = useState<ChatPreferences>(() => {
    const saved = localStorage.getItem('bunny_chat_preferences');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return DEFAULT_CHAT_PREFERENCES;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [filterPill, setFilterPill] = useState<FilterPill>('all');
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [forwardingMessage, setForwardingMessage] = useState<Message | null>(null);
  const [typingUsers, setTypingUsers] = useState<Record<string, string[]>>({});
  const [viewingSpark, setViewingSpark] = useState<SparkItem | null>(null);

  // Modals state
  const [isCreateSparkOpen, setIsCreateSparkOpen] = useState(false);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [isCreateChannelOpen, setIsCreateChannelOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [lightboxMedia, setLightboxMedia] = useState<{ url: string; type: 'image' | 'video'; title?: string } | null>(null);
  const [reportModalTarget, setReportModalTarget] = useState<{ id: string; name: string; type: string } | null>(null);
  const [isContextPanelOpen, setContextPanelOpen] = useState(false);
  const toggleContextPanel = () => setContextPanelOpen((prev) => !prev);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [modalData, setModalData] = useState<any>(null);

  const openModal = (modal: string, data?: any) => {
    setActiveModal(modal);
    setModalData(data || null);
  };

  const closeModal = () => {
    setActiveModal(null);
    setModalData(null);
    setIsCreateSparkOpen(false);
    setIsCreateGroupOpen(false);
    setIsCreateChannelOpen(false);
    setIsEditProfileOpen(false);
    setIsNewChatOpen(false);
    setViewingSpark(null);
    setLightboxMedia(null);
    setReportModalTarget(null);
    setForwardingMessage(null);
  };

  // Toast notifications
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const safeType: 'info' | 'success' | 'warning' = type === 'error' ? 'warning' : type;
    setToasts((prev) => [...prev, { id, message, type: safeType }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2800);
  };

  const addToast = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    showToast(message, type);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('bunny_conversations', JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem('bunny_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('bunny_friends', JSON.stringify(friends));
  }, [friends]);

  useEffect(() => {
    localStorage.setItem('bunny_friend_requests', JSON.stringify(friendRequests));
  }, [friendRequests]);

  useEffect(() => {
    localStorage.setItem('bunny_groups', JSON.stringify(groups));
  }, [groups]);

  useEffect(() => {
    localStorage.setItem('bunny_channels', JSON.stringify(channels));
  }, [channels]);

  useEffect(() => {
    localStorage.setItem('bunny_sparks', JSON.stringify(sparks));
  }, [sparks]);

  useEffect(() => {
    localStorage.setItem('bunny_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('bunny_privacy_settings', JSON.stringify(privacySettings));
  }, [privacySettings]);

  useEffect(() => {
    localStorage.setItem('bunny_chat_preferences', JSON.stringify(chatPreferences));
  }, [chatPreferences]);

  const activeConversation = conversations.find((c) => c.id === activeConversationId) || null;
  const currentMessages = activeConversationId ? messages[activeConversationId] || [] : [];

  const selectConversation = (id: string) => {
    setActiveConversationId(id);
    localStorage.setItem('bunny_active_conv_id', id);
    // Mark as read
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unread_count: 0 } : c))
    );
  };

  const createDirectConversation = (targetProfile: Profile): string => {
    if (!currentUser) return '';
    // Check if direct conversation already exists
    const existing = conversations.find(
      (c) => c.type === 'direct' && c.members.some((m) => m.user_id === targetProfile.id)
    );

    if (existing) {
      selectConversation(existing.id);
      setActiveTab('room');
      return existing.id;
    }

    const newConvId = `conv-direct-${Date.now()}`;
    const newConv: Conversation = {
      id: newConvId,
      type: 'direct',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_message_at: new Date().toISOString(),
      members: [
        { id: `m-${currentUser.id}`, conversation_id: newConvId, user_id: currentUser.id, joined_at: new Date().toISOString(), profile: currentUser },
        { id: `m-${targetProfile.id}`, conversation_id: newConvId, user_id: targetProfile.id, joined_at: new Date().toISOString(), profile: targetProfile },
      ],
      other_user: targetProfile,
      unread_count: 0,
    };

    setConversations((prev) => [newConv, ...prev]);
    setMessages((prev) => ({ ...prev, [newConvId]: [] }));
    selectConversation(newConvId);
    setActiveTab('room');
    showToast(`Started conversation with ${targetProfile.name} ✨`);
    return newConvId;
  };

  const sendMessage = async (
    content: string, 
    type: MessageType = 'text', 
    mediaUrl?: string, 
    metadata?: any,
    replyToId?: string
  ) => {
    if (!activeConversationId || !currentUser) return;

    let replySnippet: any = undefined;
    if (replyToId) {
      const repMsg = currentMessages.find((m) => m.id === replyToId);
      if (repMsg) {
        replySnippet = {
          id: repMsg.id,
          sender_name: repMsg.sender?.name || 'Someone',
          content: repMsg.content,
          message_type: repMsg.message_type,
        };
      }
    }

    const newMsg: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      conversation_id: activeConversationId,
      sender_id: currentUser.id,
      message_type: type,
      content,
      media_url: mediaUrl,
      reply_to_message_id: replyToId,
      reply_to: replySnippet,
      metadata,
      status: 'sending',
      created_at: new Date().toISOString(),
      sender: currentUser,
      reactions: [],
    };

    // 1. Optimistic append
    setMessages((prev) => ({
      ...prev,
      [activeConversationId]: [...(prev[activeConversationId] || []), newMsg],
    }));

    // Update conversation last message
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConversationId
          ? {
              ...c,
              last_message: newMsg,
              last_message_at: newMsg.created_at,
              updated_at: newMsg.created_at,
            }
          : c
      )
    );

    setReplyingTo(null);

    // 2. Transition status: sending -> sent -> delivered
    setTimeout(() => {
      setMessages((prev) => ({
        ...prev,
        [activeConversationId]: (prev[activeConversationId] || []).map((m) =>
          m.id === newMsg.id ? { ...m, status: 'sent' } : m
        ),
      }));
    }, 200);

    setTimeout(() => {
      setMessages((prev) => ({
        ...prev,
        [activeConversationId]: (prev[activeConversationId] || []).map((m) =>
          m.id === newMsg.id ? { ...m, status: 'delivered' } : m
        ),
      }));

      // Broadcast to other tabs & peers via Realtime Bus
      realtimeBus.emit({
        type: 'message:new',
        conversationId: activeConversationId,
        senderId: currentUser.id,
        data: { ...newMsg, status: 'delivered' },
        timestamp: new Date().toISOString(),
      });
    }, 600);

    // 3. Auto-reply simulation if talking to Liam Chen and Maya sends a message
    if (activeConversation?.other_user?.id === LIAM_USER.id && currentUser.id !== LIAM_USER.id) {
      setTimeout(() => {
        sendTypingSim(activeConversationId, LIAM_USER.name, true);
      }, 1200);

      setTimeout(() => {
        sendTypingSim(activeConversationId, LIAM_USER.name, false);
        const replyResponses = [
          'Loving this! The glassmorphism and coral palette look incredible 🐰✨',
          'That works for me! I am testing the new Active Sparks feed right now.',
          'Haha nice! Check out the voice message I sent earlier too.',
          'Just pushed an update to our Product Squad group. Have a look!',
          'Awesome! Let’s jump on a quick Bunny voice call in 5 minutes.',
        ];
        const randomResp = replyResponses[Math.floor(Math.random() * replyResponses.length)];
        const autoReply: Message = {
          id: `msg-liam-reply-${Date.now()}`,
          conversation_id: activeConversationId,
          sender_id: LIAM_USER.id,
          message_type: 'text',
          content: randomResp,
          status: 'read',
          created_at: new Date().toISOString(),
          sender: LIAM_USER,
        };

        setMessages((prev) => ({
          ...prev,
          [activeConversationId]: [...(prev[activeConversationId] || []), autoReply],
        }));

        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeConversationId
              ? {
                  ...c,
                  last_message: autoReply,
                  last_message_at: autoReply.created_at,
                }
              : c
          )
        );

        showToast(`New message from Liam Chen 💬`);
      }, 2600);
    }
  };

  const sendTypingSim = (convId: string, name: string, isTyping: boolean) => {
    setTypingUsers((prev) => {
      const currentList = prev[convId] || [];
      if (isTyping) {
        return { ...prev, [convId]: Array.from(new Set([...currentList, name])) };
      } else {
        return { ...prev, [convId]: currentList.filter((n) => n !== name) };
      }
    });
  };

  const sendTyping = (isTyping: boolean) => {
    if (!activeConversationId || !currentUser) return;
    realtimeBus.emit({
      type: isTyping ? 'typing:start' : 'typing:stop',
      conversationId: activeConversationId,
      senderId: currentUser.id,
      data: { name: currentUser.name },
      timestamp: new Date().toISOString(),
    });
  };

  const editMessage = (messageId: string, newContent: string) => {
    if (!activeConversationId) return;
    setMessages((prev) => ({
      ...prev,
      [activeConversationId]: (prev[activeConversationId] || []).map((m) =>
        m.id === messageId ? { ...m, content: newContent, updated_at: new Date().toISOString() } : m
      ),
    }));
    showToast('Message edited ✓');
  };

  const deleteMessage = (messageId: string, _forEveryone: boolean = true) => {
    if (!activeConversationId) return;
    setMessages((prev) => ({
      ...prev,
      [activeConversationId]: (prev[activeConversationId] || []).filter((m) => m.id !== messageId),
    }));
    showToast('Message deleted');
  };

  const addReaction = (messageId: string, emoji: string) => {
    if (!activeConversationId || !currentUser) return;

    setMessages((prev) => {
      const convMsgs = prev[activeConversationId] || [];
      const updated = convMsgs.map((m) => {
        if (m.id !== messageId) return m;
        const currentReactions = m.reactions || [];
        const existingIdx = currentReactions.findIndex(
          (r) => r.user_id === currentUser.id && r.reaction === emoji
        );

        let newReactions;
        if (existingIdx >= 0) {
          newReactions = currentReactions.filter((_, idx) => idx !== existingIdx);
        } else {
          newReactions = [
            ...currentReactions,
            {
              id: `r-${Date.now()}`,
              message_id: messageId,
              user_id: currentUser.id,
              user_name: currentUser.name,
              reaction: emoji,
              created_at: new Date().toISOString(),
            },
          ];
        }
        return { ...m, reactions: newReactions };
      });
      return { ...prev, [activeConversationId]: updated };
    });

    realtimeBus.emit({
      type: 'message:reaction',
      conversationId: activeConversationId,
      senderId: currentUser.id,
      data: { messageId, emoji },
      timestamp: new Date().toISOString(),
    });
  };

  const togglePinMessage = (messageId: string) => {
    if (!activeConversationId) return;
    setMessages((prev) => ({
      ...prev,
      [activeConversationId]: (prev[activeConversationId] || []).map((m) =>
        m.id === messageId ? { ...m, is_pinned: !m.is_pinned } : m
      ),
    }));
    showToast('Message pin toggled 📌');
  };

  const toggleStarMessage = (messageId: string) => {
    if (!activeConversationId) return;
    setMessages((prev) => ({
      ...prev,
      [activeConversationId]: (prev[activeConversationId] || []).map((m) =>
        m.id === messageId ? { ...m, is_starred: !m.is_starred } : m
      ),
    }));
    showToast('Starred message updated ⭐');
  };

  const forwardMessageTo = (targetConvId: string) => {
    if (!forwardingMessage || !currentUser) return;
    const fwdMsg: Message = {
      id: `msg-fwd-${Date.now()}`,
      conversation_id: targetConvId,
      sender_id: currentUser.id,
      message_type: forwardingMessage.message_type,
      content: forwardingMessage.content,
      media_url: forwardingMessage.media_url,
      is_forwarded: true,
      status: 'delivered',
      created_at: new Date().toISOString(),
      sender: currentUser,
    };

    setMessages((prev) => ({
      ...prev,
      [targetConvId]: [...(prev[targetConvId] || []), fwdMsg],
    }));

    setForwardingMessage(null);
    selectConversation(targetConvId);
    setActiveTab('room');
    showToast('Message forwarded successfully ✓');
  };

  // Friends & Requests
  const acceptFriendRequest = (reqId: string) => {
    const req = friendRequests.find((r) => r.id === reqId);
    if (!req || !currentUser) return;

    const newFriend: Friend = {
      id: `f-${Date.now()}`,
      user_id: currentUser.id,
      friend_profile: req.sender,
      mutual_friends_count: req.mutual_count || 3,
      status: 'online',
      activity: 'Active now',
    };

    setFriends((prev) => [newFriend, ...prev]);
    setFriendRequests((prev) => prev.filter((r) => r.id !== reqId));
    showToast(`Accepted friend request from ${req.sender.name} ✨`, 'success');
  };

  const declineFriendRequest = (reqId: string) => {
    setFriendRequests((prev) => prev.filter((r) => r.id !== reqId));
    showToast('Friend request declined');
  };

  const sendFriendRequest = (targetUserId: string) => {
    const targetUser = allUsers.find((u) => u.id === targetUserId);
    if (!targetUser) return;
    showToast(`Friend request sent to ${targetUser.name} 🐰`, 'success');
  };

  // Groups
  const createGroup = (name: string, description: string, category: string, avatarUrl?: string) => {
    if (!currentUser) return;
    const newConvId = `conv-grp-${Date.now()}`;
    const newGroup: GroupItem = {
      id: `grp-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      category: category || 'Community',
      avatar_url: avatarUrl || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=200&auto=format&fit=crop&q=80',
      members_count: 1,
      online_count: 1,
      is_joined: true,
      tag: 'NEW',
      conversation_id: newConvId,
    };

    setGroups((prev) => [newGroup, ...prev]);

    // Create group conversation
    const newConv: Conversation = {
      id: newConvId,
      type: 'group',
      title: newGroup.name,
      avatar_url: newGroup.avatar_url,
      description: newGroup.description,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_message_at: new Date().toISOString(),
      members: [{ id: `m-${currentUser.id}`, conversation_id: newConvId, user_id: currentUser.id, joined_at: new Date().toISOString(), role: 'admin', profile: currentUser }],
      unread_count: 0,
    };

    setConversations((prev) => [newConv, ...prev]);
    setMessages((prev) => ({
      ...prev,
      [newConvId]: [
        {
          id: `msg-sys-${Date.now()}`,
          conversation_id: newConvId,
          sender_id: 'system',
          message_type: 'system',
          content: `${currentUser.name} created the group “${newGroup.name}”`,
          created_at: new Date().toISOString(),
        },
      ],
    }));

    setIsCreateGroupOpen(false);
    selectConversation(newConvId);
    setActiveTab('room');
    showToast(`Created group “${newGroup.name}” 🚀`, 'success');
  };

  const joinGroup = (groupId: string) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId ? { ...g, is_joined: true, members_count: g.members_count + 1 } : g
      )
    );
    showToast('Joined group successfully! ✨', 'success');
  };

  const leaveGroup = (groupId: string) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId ? { ...g, is_joined: false, members_count: Math.max(0, g.members_count - 1) } : g
      )
    );
    showToast('Left group');
  };

  // Channels
  const createChannel = (name: string, description: string, category: string, iconEmoji: string) => {
    const newChan: ChannelItem = {
      id: `chan-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      category: category || 'General',
      icon_emoji: iconEmoji || '🐰',
      subscribers_count: 1,
      is_subscribed: true,
      new_badge: 'NEW',
    };

    setChannels((prev) => [newChan, ...prev]);
    setIsCreateChannelOpen(false);
    showToast(`Channel “${newChan.name}” created! 📢`, 'success');
  };

  const subscribeChannel = (channelId: string) => {
    setChannels((prev) =>
      prev.map((c) =>
        c.id === channelId
          ? { ...c, is_subscribed: true, subscribers_count: c.subscribers_count + 1 }
          : c
      )
    );
    showToast('Subscribed to channel 🔔', 'success');
  };

  const unsubscribeChannel = (channelId: string) => {
    setChannels((prev) =>
      prev.map((c) =>
        c.id === channelId
          ? { ...c, is_subscribed: false, subscribers_count: Math.max(0, c.subscribers_count - 1) }
          : c
      )
    );
    showToast('Unsubscribed from channel');
  };

  // Sparks
  const createSpark = (data: Partial<SparkItem>) => {
    if (!currentUser) return;
    const newSpark: SparkItem = {
      id: `spark-${Date.now()}`,
      user_id: currentUser.id,
      user_name: currentUser.name,
      user_avatar: currentUser.avatar_url,
      user_handle: `@${currentUser.username}`,
      type: data.type || 'text',
      title: data.title || 'Instant Spark',
      caption: data.caption || '',
      media_url: data.media_url,
      bg_gradient: data.bg_gradient || 'linear-gradient(135deg, #ff607d 0%, #ff7b5f 100%)',
      mood_badge: data.mood_badge || '✨ Spark',
      created_at: new Date().toISOString(),
      expires_in: '24h',
      reactions_count: 1,
      comments_count: 0,
      views_count: 1,
      reactors: [currentUser.name],
    };

    setSparks((prev) => [newSpark, ...prev]);
    setIsCreateSparkOpen(false);
    showToast('Instant Spark posted to your network! ⚡', 'success');

    realtimeBus.emit({
      type: 'spark:new',
      senderId: currentUser.id,
      data: newSpark,
      timestamp: new Date().toISOString(),
    });
  };

  const reactToSpark = (sparkId: string, emoji: string = '❤️') => {
    if (!currentUser) return;
    setSparks((prev) =>
      prev.map((s) => {
        if (s.id !== sparkId) return s;
        const already = s.has_reacted;
        return {
          ...s,
          has_reacted: !already,
          reactions_count: already ? s.reactions_count - 1 : s.reactions_count + 1,
        };
      })
    );
    showToast(`Reacted ${emoji} to Spark!`);
  };

  // Notifications
  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    showToast('All notifications marked as read ✓');
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.is_read).length;

  // Filtered conversations
  const filteredConversations = conversations.filter((conv) => {
    // 1. Pill filter
    if (filterPill === 'unread' && (!conv.unread_count || conv.unread_count === 0)) return false;
    if (filterPill === 'groups' && conv.type !== 'group') return false;
    if (filterPill === 'channels' && conv.type !== 'channel') return false;
    if (filterPill === 'favorites' && !conv.is_pinned) return false;

    // 2. Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const title = (conv.type === 'direct' ? conv.other_user?.name : conv.title) || '';
      const lastMsg = conv.last_message?.content || '';
      return title.toLowerCase().includes(q) || lastMsg.toLowerCase().includes(q);
    }
    return true;
  });

  const updatePrivacySettings = (settings: Partial<PrivacySettings>) => {
    setPrivacySettings((prev) => ({ ...prev, ...settings }));
    showToast('Privacy settings saved ✓');
  };

  const updateChatPreferences = (prefs: Partial<ChatPreferences>) => {
    setChatPreferences((prev) => ({ ...prev, ...prefs }));
    showToast('Chat preferences updated ✓');
  };

  return (
    <ChatContext.Provider
      value={{
        activeTab,
        setActiveTab,
        conversations,
        activeConversationId,
        activeConversation,
        selectConversation,
        createDirectConversation,
        messages,
        currentMessages,
        sendMessage,
        editMessage,
        deleteMessage,
        addReaction,
        togglePinMessage,
        toggleStarMessage,
        replyingTo,
        setReplyingTo,
        forwardingMessage,
        setForwardingMessage,
        forwardMessageTo,
        searchQuery,
        setSearchQuery,
        filterPill,
        setFilterPill,
        filteredConversations,
        friends,
        friendRequests,
        acceptFriendRequest,
        declineFriendRequest,
        sendFriendRequest,
        groups,
        createGroup,
        joinGroup,
        leaveGroup,
        channels,
        createChannel,
        subscribeChannel,
        unsubscribeChannel,
        sparks,
        createSpark,
        reactToSpark,
        viewingSpark,
        setViewingSpark,
        notifications,
        markNotificationRead,
        markAllNotificationsRead,
        unreadNotificationsCount,
        typingUsers,
        sendTyping,
        isCreateSparkOpen,
        setIsCreateSparkOpen,
        isCreateGroupOpen,
        setIsCreateGroupOpen,
        isCreateChannelOpen,
        setIsCreateChannelOpen,
        isEditProfileOpen,
        setIsEditProfileOpen,
        isNewChatOpen,
        setIsNewChatOpen,
        lightboxMedia,
        setLightboxMedia,
        reportModalTarget,
        setReportModalTarget,
        isContextPanelOpen,
        setContextPanelOpen,
        toggleContextPanel,
        activeModal,
        modalData,
        openModal,
        closeModal,
        toasts,
        showToast,
        addToast,
        removeToast,
        privacySettings,
        updatePrivacySettings,
        chatPreferences,
        updateChatPreferences,
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
