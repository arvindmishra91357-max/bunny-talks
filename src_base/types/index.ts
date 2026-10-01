export type MessageType = 
  | 'text' 
  | 'image' 
  | 'video' 
  | 'audio' 
  | 'voice' 
  | 'document' 
  | 'location'
  | 'contact'
  | 'system';

export type MessageState = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export type ContactRequestStatus = 'pending' | 'accepted' | 'rejected';

export interface Profile {
  id: string;
  name: string;
  display_name?: string; // alias for name
  username: string;
  email?: string;
  avatar_url?: string;
  bio?: string;
  status_message?: string;
  last_seen_at?: string;
  is_online?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ContactRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: ContactRequestStatus;
  created_at: string;
  updated_at?: string;
  sender?: Profile;
  receiver?: Profile;
}

export interface Contact {
  id: string;
  user_id: string;
  contact_user_id: string;
  created_at: string;
  contact_profile?: Profile;
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

export interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
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
  type?: MessageType; // alias for message_type
  content: string;
  media_url?: string;
  reply_to_message_id?: string;
  reply_to?: Message;
  created_at: string;
  updated_at?: string;
  deleted_at?: string;
  status?: MessageState;
  reactions?: MessageReaction[];
  attachments?: MessageAttachment[];
  is_starred?: boolean;
  is_forwarded?: boolean;
  metadata?: {
    file_name?: string;
    file_size?: number;
    file_type?: string;
    duration?: number;
    waveform?: number[];
    latitude?: number;
    longitude?: number;
    location_name?: string;
    contact_name?: string;
    contact_phone?: string;
  };
  sender?: Profile;
}

export interface Conversation {
  id: string;
  type: 'direct' | 'group';
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

export interface BlockedUser {
  id: string;
  blocker_id: string;
  blocked_user_id: string;
  created_at: string;
  blocked_profile?: Profile;
}

export interface PrivacySettings {
  last_seen_visibility: 'everyone' | 'contacts' | 'nobody';
  profile_photo_visibility: 'everyone' | 'contacts' | 'nobody';
  read_receipts: boolean;
  read_receipts_enabled?: boolean;
  online_status_visibility?: 'everyone' | 'contacts' | 'nobody';
  who_can_message_me?: 'everyone' | 'contacts' | 'nobody';
  who_can_add_to_groups?: 'everyone' | 'contacts' | 'nobody';
}

export interface NotificationItem {
  id: string;
  user_id?: string;
  type: 'message' | 'contact_request' | 'request_accepted' | 'system';
  title: string;
  body: string;
  avatar_url?: string;
  conversation_id?: string;
  created_at: string;
  is_read?: boolean;
  data?: any;
}

export interface WebRTCCall {
  id: string;
  caller_id: string;
  receiver_id: string;
  type: 'audio' | 'video';
  status: 'calling' | 'ringing' | 'connected' | 'connecting' | 'ended' | 'declined' | 'rejected';
  conversation_id?: string;
  started_at?: string;
  is_incoming?: boolean;
  caller?: Profile;
  receiver?: Profile;
}

export interface StatusStory {
  id: string;
  user_id: string;
  media_url: string;
  caption?: string;
  created_at: string;
  expires_at: string;
  viewers?: string[];
  user?: Profile;
}
