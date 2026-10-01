// ============================================================================
// REAL-TIME BUS & EVENT DISPATCHER
// Handles Supabase Realtime Channels + Local BroadcastChannel fallback
// ============================================================================

import { getSupabaseClient } from './supabase';
import { SignalingMessage } from './webrtc';
import { Message, MessageReaction } from '../types';

export type RealtimeEventType = 
  | 'message:new'
  | 'message:update'
  | 'message:delete'
  | 'message:reaction'
  | 'message:read'
  | 'typing:start'
  | 'typing:stop'
  | 'presence:sync'
  | 'call:signal'
  | 'user:switch';

export interface RealtimePayload {
  type: RealtimeEventType;
  conversationId?: string;
  senderId?: string;
  targetId?: string;
  data: any;
  timestamp: string;
}

type Listener = (payload: RealtimePayload) => void;

class RealtimeBus {
  private channel: BroadcastChannel | null = null;
  private listeners: Set<Listener> = new Set();
  private supabaseChannel: any = null;

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.channel = new BroadcastChannel('nexus_realtime_bus');
      this.channel.onmessage = (event) => {
        this.notifyListeners(event.data);
      };
    }
  }

  public initSupabaseRealtime(currentUserId: string) {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    try {
      this.supabaseChannel = supabase.channel('nexus_global_room', {
        config: {
          broadcast: { self: false },
          presence: { key: currentUserId },
        },
      });

      this.supabaseChannel
        .on('broadcast', { event: 'realtime_event' }, (event: any) => {
          if (event.payload) {
            this.notifyListeners(event.payload);
          }
        })
        .subscribe();
    } catch (e) {
      console.warn('Could not initialize Supabase Realtime channel:', e);
    }
  }

  public emit(payload: RealtimePayload) {
    // 1. Notify local in-memory listeners
    this.notifyListeners(payload);

    // 2. Broadcast to other browser tabs/windows
    if (this.channel) {
      try {
        this.channel.postMessage(payload);
      } catch (e) {}
    }

    // 3. Broadcast to Supabase Realtime if connected
    if (this.supabaseChannel) {
      try {
        this.supabaseChannel.send({
          type: 'broadcast',
          event: 'realtime_event',
          payload,
        });
      } catch (e) {}
    }
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(payload: RealtimePayload) {
    this.listeners.forEach((listener) => {
      try {
        listener(payload);
      } catch (err) {
        console.error('Error in realtime listener:', err);
      }
    });
  }

  public destroy() {
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
    if (this.supabaseChannel) {
      this.supabaseChannel.unsubscribe();
      this.supabaseChannel = null;
    }
    this.listeners.clear();
  }
}

export const realtimeBus = new RealtimeBus();
