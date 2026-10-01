import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { realtimeBus, RealtimePayload } from '../lib/realtimeBus';
import { NotificationItem, Profile } from '../types';
import { ALL_USERS } from '../lib/mockData';

interface TypingUser {
  userId: string;
  username: string;
  displayName: string;
  conversationId: string;
  timestamp: number;
}

interface UserPresenceMap {
  [userId: string]: {
    isOnline: boolean;
    lastSeenAt: string;
  };
}

interface RealtimeContextType {
  onlineUsers: Record<string, boolean>;
  getUserPresence: (userId: string) => { isOnline: boolean; label: string };
  getTypingLabel: (conversationId: string) => string | null;
  sendTypingStart: (conversationId: string) => void;
  sendTypingStop: (conversationId: string) => void;
  notifications: NotificationItem[];
  dismissNotification: (id: string) => void;
  isOnline: boolean;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

export const RealtimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, privacySettings } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<Record<string, boolean>>({
    '00000000-0000-0000-0000-000000000001': true,
    '00000000-0000-0000-0000-000000000002': true,
    '00000000-0000-0000-0000-000000000004': true,
  });

  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isNetworkOnline, setIsNetworkOnline] = useState<boolean>(navigator.onLine);

  const typingTimeouts = useRef<Record<string, any>>({});
  const lastTypingSent = useRef<Record<string, number>>({});

  // Monitor network connection state
  useEffect(() => {
    const handleOnline = () => {
      setIsNetworkOnline(true);
      if (currentUser) {
        realtimeBus.emit({
          type: 'presence:sync',
          senderId: currentUser.id,
          data: { userId: currentUser.id, isOnline: true, lastSeenAt: new Date().toISOString() },
          timestamp: new Date().toISOString(),
        });
      }
    };

    const handleOffline = () => {
      setIsNetworkOnline(false);
      if (currentUser) {
        realtimeBus.emit({
          type: 'presence:sync',
          senderId: currentUser.id,
          data: { userId: currentUser.id, isOnline: false, lastSeenAt: new Date().toISOString() },
          timestamp: new Date().toISOString(),
        });
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [currentUser]);

  // Request browser Notification permission if supported
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  // Listen to realtime events
  useEffect(() => {
    const unsubscribe = realtimeBus.subscribe((payload: RealtimePayload) => {
      if (payload.type === 'typing:start') {
        const { userId, username, displayName, conversationId } = payload.data;
        if (userId === currentUser?.id) return;

        setTypingUsers((prev) => {
          const filtered = prev.filter((t) => !(t.userId === userId && t.conversationId === conversationId));
          return [...filtered, { userId, username, displayName, conversationId, timestamp: Date.now() }];
        });

        // Auto remove typing indicator after 3 seconds timeout
        const key = `${userId}_${conversationId}`;
        if (typingTimeouts.current[key]) clearTimeout(typingTimeouts.current[key]);
        typingTimeouts.current[key] = setTimeout(() => {
          setTypingUsers((prev) => prev.filter((t) => !(t.userId === userId && t.conversationId === conversationId)));
        }, 3000);
      } else if (payload.type === 'typing:stop') {
        const { userId, conversationId } = payload.data;
        setTypingUsers((prev) => prev.filter((t) => !(t.userId === userId && t.conversationId === conversationId)));
      } else if (payload.type === 'presence:sync') {
        const { userId, isOnline } = payload.data;
        setOnlineUsers((prev) => ({ ...prev, [userId]: isOnline }));
      } else if (payload.type === 'message:new') {
        const msg = payload.data;
        if (msg.sender_id !== currentUser?.id) {
          // Show in-app banner notification
          const senderProfile = ALL_USERS.find((u) => u.id === msg.sender_id) || msg.sender;
          const notif: NotificationItem = {
            id: 'notif_' + Date.now(),
            user_id: currentUser?.id || '',
            type: 'message',
            title: senderProfile?.display_name || 'New Message',
            body: msg.type === 'text' ? msg.content : `Sent a ${msg.type}`,
            data: { conversationId: msg.conversation_id },
            is_read: false,
            created_at: new Date().toISOString(),
          };

          setNotifications((prev) => [notif, ...prev.slice(0, 4)]);

          // Show browser system notification if tab is backgrounded
          if (document.hidden && 'Notification' in window && Notification.permission === 'granted') {
            try {
              new Notification(notif.title, {
                body: notif.body,
                icon: '/favicon.svg',
              });
            } catch (e) {}
          }

          // Auto clear toast after 5s
          setTimeout(() => {
            setNotifications((prev) => prev.filter((n) => n.id !== notif.id));
          }, 5000);
        }
      }
    });

    return () => unsubscribe();
  }, [currentUser]);

  const sendTypingStart = useCallback((conversationId: string) => {
    if (!currentUser) return;
    const now = Date.now();
    const last = lastTypingSent.current[conversationId] || 0;
    if (now - last > 2000) {
      lastTypingSent.current[conversationId] = now;
      realtimeBus.emit({
        type: 'typing:start',
        conversationId,
        senderId: currentUser.id,
        data: {
          userId: currentUser.id,
          username: currentUser.username,
          displayName: currentUser.name || currentUser.display_name || currentUser.username,
          conversationId,
        },
        timestamp: new Date().toISOString(),
      });
    }
  }, [currentUser]);

  const sendTypingStop = useCallback((conversationId: string) => {
    if (!currentUser) return;
    lastTypingSent.current[conversationId] = 0;
    realtimeBus.emit({
      type: 'typing:stop',
      conversationId,
      senderId: currentUser.id,
      data: { userId: currentUser.id, conversationId },
      timestamp: new Date().toISOString(),
    });
  }, [currentUser]);

  const getTypingLabel = useCallback((conversationId: string): string | null => {
    const typingInConv = typingUsers.filter((t) => t.conversationId === conversationId);
    if (typingInConv.length === 0) return null;

    if (typingInConv.length === 1) {
      return `${typingInConv[0].displayName} is typing...`;
    }
    if (typingInConv.length === 2) {
      return `${typingInConv[0].displayName} and ${typingInConv[1].displayName} are typing...`;
    }
    return `${typingInConv[0].displayName} and ${typingInConv.length - 1} others are typing...`;
  }, [typingUsers]);

  const getUserPresence = useCallback((userId: string): { isOnline: boolean; label: string } => {
    const isOnline = Boolean(onlineUsers[userId]);
    if (isOnline) {
      return { isOnline: true, label: 'Online' };
    }

    const user = ALL_USERS.find((u) => u.id === userId);
    if (!user || !user.last_seen_at) {
      return { isOnline: false, label: 'Offline' };
    }

    const lastSeen = new Date(user.last_seen_at);
    const diffMins = Math.floor((Date.now() - lastSeen.getTime()) / (1000 * 60));

    if (diffMins < 5) return { isOnline: false, label: 'Last seen recently' };
    if (diffMins < 60) return { isOnline: false, label: `Last seen ${diffMins}m ago` };
    
    const timeStr = lastSeen.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return { isOnline: false, label: `Last seen at ${timeStr}` };
  }, [onlineUsers]);

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <RealtimeContext.Provider
      value={{
        onlineUsers,
        getUserPresence,
        getTypingLabel,
        sendTypingStart,
        sendTypingStop,
        notifications,
        dismissNotification,
        isOnline: isNetworkOnline,
      }}
    >
      {children}
    </RealtimeContext.Provider>
  );
};

export const useRealtime = () => {
  const context = useContext(RealtimeContext);
  if (!context) throw new Error('useRealtime must be used within RealtimeProvider');
  return context;
};
