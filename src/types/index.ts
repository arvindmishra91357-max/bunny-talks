export type PresenceStatus = 'online' | 'away' | 'dnd' | 'invisible';

export interface Profile {
  id: string;
  name: string;
  display_name?: string;
  displayName?: string;
  username: string;
  email?: string;
  avatar_url: string;
  avatarUrl?: string;
  bio?: string;
  status?: 'online' | 'offline' | 'away' | 'busy';
  mood_status?: string;
  status_message?: string;
  statusText?: string;
  bannerUrl?: string;
  website?: string;
  location?: string;
  last_seen_at?: string;
  is_online?: boolean;
  presence_status?: PresenceStatus;
  friends_count?: number;
  friendsCount?: number;
  followersCount?: number;
  followingCount?: number;
  sparks_count?: number;
  groups_count?: number;
  channels_count?: number;
  isVerified?: boolean;
  created_at?: string;
  updated_at?: string;
}

export type MessageType = 
  | 'text' 
  | 'image' 
  | 'video' 
  | 'audio' 
  | 'voice' 
  | 'document' 
  | 'system';

export type MessageState = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  user_name?: string;
  reaction: string;
  created_at: string;
}

export interface MessageAttachment {
  id: string;
  file_url: string;
  file_name: string;
  file_type: string;
  file_size?: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  message_type: MessageType;
  type?: MessageType;
  content: string;
  media_url?: string;
  reply_to_message_id?: string;
  reply_to?: {
    id: string;
    sender_name: string;
    content: string;
    message_type: MessageType;
  };
  created_at: string;
  updated_at?: string;
  deleted_at?: string;
  status?: MessageState;
  reactions?: MessageReaction[];
  attachments?: MessageAttachment[];
  is_starred?: boolean;
  is_pinned?: boolean;
  is_forwarded?: boolean;
  metadata?: {
    file_name?: string;
    file_size?: number;
    file_type?: string;
    duration?: number;
    waveform?: number[];
  };
  sender?: Profile;
}

export interface ConversationMember {
  id: string;
  conversation_id: string;
  user_id: string;
  joined_at: string;
  last_read_at?: string;
  role?: 'member' | 'admin';
  profile?: Profile;
}

export interface Conversation {
  id: string;
  type: 'direct' | 'group' | 'channel';
  title?: string;
  avatar_url?: string;
  description?: string;
  created_at: string;
  updated_at?: string;
  last_message_at: string;
  members: ConversationMember[];
  last_message?: Message;
  unread_count?: number;
  is_pinned?: boolean;
  is_muted?: boolean;
  is_archived?: boolean;
  is_e2ee?: boolean;
  other_user?: Profile;
}

export interface Friend {
  id: string;
  user_id: string;
  friend_profile: Profile;
  mutual_friends_count: number;
  status: 'online' | 'offline';
  activity?: string;
}

export interface FriendRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  sender: Profile;
  mutual_count?: number;
}

export interface GroupItem {
  id: string;
  name: string;
  description: string;
  avatar_url: string;
  cover_url?: string;
  category: string;
  members_count: number;
  online_count: number;
  is_joined: boolean;
  is_live?: boolean;
  tag?: string;
  conversation_id?: string;
}

export interface ChannelItem {
  id: string;
  name: string;
  description: string;
  icon_emoji: string;
  avatar_url?: string;
  subscribers_count: number;
  category: string;
  is_subscribed: boolean;
  new_badge?: string;
  unread_count?: number;
  latest_post?: {
    title: string;
    preview: string;
    time: string;
    likes: number;
  };
}

export interface SparkItem {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar: string;
  user_handle: string;
  type: 'photo' | 'text' | 'music';
  title?: string;
  caption: string;
  media_url?: string;
  bg_gradient?: string;
  mood_badge?: string;
  track_title?: string;
  track_artist?: string;
  created_at: string;
  expires_in?: string;
  reactions_count: number;
  comments_count: number;
  views_count: number;
  has_reacted?: boolean;
  reactors?: string[];
}

export interface ActivityNotification {
  id: string;
  type: 'friend_request' | 'reaction' | 'mention' | 'reply' | 'group_invite' | 'channel_update' | 'spark_activity' | 'system';
  title: string;
  description: string;
  time: string;
  is_read: boolean;
  avatar_url?: string;
  icon_emoji?: string;
  action_label?: string;
  action_type?: string;
  action_data?: any;
}

export interface WebRTCCall {
  id: string;
  caller_id: string;
  receiver_id: string;
  type: 'audio' | 'video';
  status: 'calling' | 'ringing' | 'connected' | 'ended' | 'declined';
  started_at?: string;
  is_incoming?: boolean;
  caller?: Profile;
  receiver?: Profile;
  conversation_id?: string;
  receiverName?: string;
  receiverAvatar?: string;
  isVideo?: boolean;
}

export interface PrivacySettings {
  last_seen_visibility: 'everyone' | 'contacts' | 'nobody';
  profile_photo_visibility: 'everyone' | 'contacts' | 'nobody';
  online_status_visibility: 'everyone' | 'contacts' | 'nobody';
  read_receipts: boolean;
  who_can_message_me: 'everyone' | 'contacts' | 'nobody';
  who_can_add_to_groups: 'everyone' | 'contacts' | 'nobody';
}

export interface ChatPreferences {
  enter_to_send: boolean;
  media_auto_download: boolean;
  sound_effects: boolean;
  message_preview: boolean;
  theme_accent: 'coral' | 'purple' | 'mint';
}
