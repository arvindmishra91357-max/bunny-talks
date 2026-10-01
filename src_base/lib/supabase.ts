import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Retrieve configuration from env or local override
export function getStoredConfig() {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  const localUrl = localStorage.getItem('nexus_supabase_url') || '';
  const localKey = localStorage.getItem('nexus_supabase_anon_key') || '';

  const url = (localUrl || envUrl).trim();
  const key = (localKey || envKey).trim();

  const isConfigured = Boolean(
    url && 
    key && 
    url.startsWith('https://') && 
    !url.includes('your-project') &&
    key.length > 20
  );

  return { url, key, isConfigured };
}

export function saveStoredConfig(url: string, key: string) {
  if (url) localStorage.setItem('nexus_supabase_url', url.trim());
  else localStorage.removeItem('nexus_supabase_url');

  if (key) localStorage.setItem('nexus_supabase_anon_key', key.trim());
  else localStorage.removeItem('nexus_supabase_anon_key');
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const { url, key, isConfigured } = getStoredConfig();
  if (!isConfigured) return null;

  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storage: window.localStorage,
        },
        realtime: {
          params: {
            eventsPerSecond: 20,
          },
        },
      });
    } catch (e) {
      console.error('Failed to initialize Supabase client:', e);
      return null;
    }
  }

  return supabaseInstance;
}

export const isSupabaseConfigured = () => getStoredConfig().isConfigured;

// Storage upload helper
export async function uploadMediaFile(
  bucket: 'avatars' | 'chat-images' | 'chat-videos' | 'chat-audio' | 'chat-documents',
  file: File | Blob,
  fileName?: string
): Promise<{ url: string; path: string; error?: string }> {
  const supabase = getSupabaseClient();
  const ext = file instanceof File ? file.name.split('.').pop() || 'dat' : 'dat';
  const name = fileName || `${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${ext}`;
  const path = `uploads/${name}`;

  if (!supabase) {
    // Demo mode: create local object URL
    const url = URL.createObjectURL(file);
    return { url, path };
  }

  try {
    const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });

    if (error) {
      console.warn('Supabase storage upload error, falling back to local Blob URL:', error);
      return { url: URL.createObjectURL(file), path };
    }

    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
    return { url: publicUrlData.publicUrl, path: data.path };
  } catch (err: any) {
    console.error('Storage upload exception:', err);
    return { url: URL.createObjectURL(file), path };
  }
}
