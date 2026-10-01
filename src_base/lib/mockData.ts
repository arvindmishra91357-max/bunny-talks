import { Profile, Conversation, Message, Contact, ContactRequest, PrivacySettings } from '../types';

export const USER_A: Profile = {
  id: '00000000-0000-0000-0000-000000000001',
  name: 'Arvind Patel',
  username: 'arvind',
  email: 'arvind@nexus.chat',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  bio: 'Hey there! I am using Nexus.',
  is_online: true,
  last_seen_at: new Date().toISOString(),
  created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
};

export const USER_B: Profile = {
  id: '00000000-0000-0000-0000-000000000002',
  name: 'Rahul Sharma',
  username: 'rahul123',
  email: 'rahul@nexus.chat',
  avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  bio: 'Available for private chat.',
  is_online: true,
  last_seen_at: new Date().toISOString(),
  created_at: new Date(Date.now() - 86400000 * 20).toISOString(),
};

export const USER_C: Profile = {
  id: '00000000-0000-0000-0000-000000000003',
  name: 'Priya Nair',
  username: 'priya_n',
  email: 'priya@nexus.chat',
  avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
  bio: 'Busy at work.',
  is_online: false,
  last_seen_at: new Date(Date.now() - 1000 * 60 * 18).toISOString(), // 18m ago
  created_at: new Date(Date.now() - 86400000 * 15).toISOString(),
};

export const USER_D: Profile = {
  id: '00000000-0000-0000-0000-000000000004',
  name: 'Aman Gupta',
  username: 'aman_g',
  email: 'aman@nexus.chat',
  avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
  bio: 'Online',
  is_online: true,
  last_seen_at: new Date().toISOString(),
  created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
};

export const ALL_USERS: Profile[] = [USER_A, USER_B, USER_C, USER_D];

export const DEFAULT_PRIVACY: PrivacySettings = {
  last_seen_visibility: 'everyone',
  profile_photo_visibility: 'everyone',
  read_receipts: true,
};

// Initial Accepted Contacts
export const INITIAL_CONTACTS: Contact[] = [
  {
    id: 'ct-1',
    user_id: USER_A.id,
    contact_user_id: USER_B.id,
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    contact_profile: USER_B,
  },
  {
    id: 'ct-2',
    user_id: USER_B.id,
    contact_user_id: USER_A.id,
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    contact_profile: USER_A,
  },
];

// Initial Contact Requests
export const INITIAL_CONTACT_REQUESTS: ContactRequest[] = [
  {
    id: 'cr-1',
    sender_id: USER_D.id,
    receiver_id: USER_A.id,
    status: 'pending',
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    sender: USER_D,
    receiver: USER_A,
  },
];

// Initial 1-to-1 Private Conversations only
export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-direct-ab',
    type: 'direct',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date().toISOString(),
    last_message_at: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    is_pinned: true,
    members: [
      { id: 'mem-1', conversation_id: 'conv-direct-ab', user_id: USER_A.id, joined_at: new Date().toISOString(), profile: USER_A },
      { id: 'mem-2', conversation_id: 'conv-direct-ab', user_id: USER_B.id, joined_at: new Date().toISOString(), profile: USER_B },
    ],
    other_user: USER_B,
    unread_count: 0,
  },
];

// Initial Messages
export const INITIAL_MESSAGES: Record<string, Message[]> = {
  'conv-direct-ab': [
    {
      id: 'msg-1',
      conversation_id: 'conv-direct-ab',
      sender_id: USER_B.id,
      message_type: 'text',
      content: 'Hello bro',
      created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      status: 'read',
      sender: USER_B,
      reactions: [{ id: 'r1', message_id: 'msg-1', user_id: USER_A.id, reaction: '👍', created_at: new Date().toISOString() }],
    },
    {
      id: 'msg-2',
      conversation_id: 'conv-direct-ab',
      sender_id: USER_A.id,
      message_type: 'text',
      content: 'Hi Rahul! Just set up our clean 1-to-1 private chat.',
      created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
      status: 'read',
      sender: USER_A,
    },
    {
      id: 'msg-3',
      conversation_id: 'conv-direct-ab',
      sender_id: USER_A.id,
      message_type: 'voice',
      content: 'Voice message (0:06)',
      metadata: {
        duration: 6,
        waveform: [0.2, 0.5, 0.8, 0.4, 0.9, 0.7, 0.5, 0.3, 0.8, 0.6, 0.3, 0.7],
      },
      created_at: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
      status: 'read',
      sender: USER_A,
    },
    {
      id: 'msg-4',
      conversation_id: 'conv-direct-ab',
      sender_id: USER_B.id,
      message_type: 'text',
      content: 'Audio sounds super crisp! Real-time typing indicators and ticks are working perfectly too.',
      created_at: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
      status: 'read',
      sender: USER_B,
    },
  ],
};
