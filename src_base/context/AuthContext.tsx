import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Profile, Contact, ContactRequest, BlockedUser, PrivacySettings } from '../types';
import { USER_A, USER_B, ALL_USERS, INITIAL_CONTACTS, INITIAL_CONTACT_REQUESTS, DEFAULT_PRIVACY } from '../lib/mockData';
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';
import { realtimeBus } from '../lib/realtimeBus';

interface AuthContextType {
  currentUser: Profile | null;
  contacts: Contact[];
  contactRequests: ContactRequest[];
  blockedUsers: BlockedUser[];
  privacySettings: PrivacySettings;
  isLoading: boolean;
  isConfigured: boolean;
  login: (emailOrUsername: string, password?: string) => Promise<boolean>;
  signup: (name: string, username: string, email: string, password?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  updatePrivacySettings: (updates: Partial<PrivacySettings>) => Promise<void>;
  sendContactRequest: (targetUsername: string) => Promise<{ success: boolean; message: string }>;
  acceptContactRequest: (requestId: string) => Promise<void>;
  rejectContactRequest: (requestId: string) => Promise<void>;
  blockContact: (userId: string) => Promise<void>;
  unblockContact: (userId: string) => Promise<void>;
  blockUser: (userId: string) => Promise<void>;
  unblockUser: (userId: string) => Promise<void>;
  switchUser: (user: Profile) => void;
  isContact: (userId: string) => boolean;
  hasPendingRequestWith: (userId: string) => boolean;
  forgotPassword: (email: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<Profile | null>(() => {
    const saved = localStorage.getItem('nexus_current_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return USER_A; // Default to User A for testing
  });

  const [contacts, setContacts] = useState<Contact[]>(() => {
    const saved = localStorage.getItem('nexus_contacts');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_CONTACTS;
  });

  const [contactRequests, setContactRequests] = useState<ContactRequest[]>(() => {
    const saved = localStorage.getItem('nexus_contact_requests');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_CONTACT_REQUESTS;
  });

  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>(() => {
    const saved = localStorage.getItem('nexus_blocked_users');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>(() => {
    const saved = localStorage.getItem('nexus_privacy_settings');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return DEFAULT_PRIVACY;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isConfigured, setIsConfigured] = useState(isSupabaseConfigured());

  // Save to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('nexus_current_user', JSON.stringify(currentUser));
      realtimeBus.initSupabaseRealtime(currentUser.id);
    } else {
      localStorage.removeItem('nexus_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('nexus_contacts', JSON.stringify(contacts));
  }, [contacts]);

  useEffect(() => {
    localStorage.setItem('nexus_contact_requests', JSON.stringify(contactRequests));
  }, [contactRequests]);

  useEffect(() => {
    localStorage.setItem('nexus_blocked_users', JSON.stringify(blockedUsers));
  }, [blockedUsers]);

  useEffect(() => {
    localStorage.setItem('nexus_privacy_settings', JSON.stringify(privacySettings));
  }, [privacySettings]);

  // Supabase Auth listener
  useEffect(() => {
    const supabase = getSupabaseClient();
    setIsConfigured(isSupabaseConfigured());

    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
            .then(({ data }) => {
              if (data) setCurrentUser(data);
            });
        }
      });
    }
  }, []);

  const login = async (emailOrUsername: string, password?: string): Promise<boolean> => {
    setIsLoading(true);
    const supabase = getSupabaseClient();

    if (supabase && password && emailOrUsername.includes('@')) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailOrUsername,
        password,
      });
      setIsLoading(false);
      if (error) {
        alert(error.message);
        return false;
      }
      return true;
    }

    // Demo Mode login: match user
    const q = emailOrUsername.toLowerCase();
    const found = ALL_USERS.find(
      (u) => u.username.toLowerCase() === q || (u.email && u.email.toLowerCase() === q)
    );

    const userToLogin = found || {
      id: 'usr_' + Date.now(),
      name: emailOrUsername.split('@')[0],
      username: emailOrUsername.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase(),
      email: emailOrUsername.includes('@') ? emailOrUsername : `${emailOrUsername}@nexus.chat`,
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${emailOrUsername}`,
      is_online: true,
      last_seen_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    setCurrentUser(userToLogin);
    setIsLoading(false);
    return true;
  };

  const signup = async (
    name: string,
    username: string,
    email: string,
    password?: string
  ): Promise<boolean> => {
    setIsLoading(true);
    const cleanUser = username.trim().toLowerCase().replace(/[^a-zA-Z0-9_]/g, '');

    const supabase = getSupabaseClient();
    if (supabase && password) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name.trim(),
            username: cleanUser,
            avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanUser}`,
          },
        },
      });
      setIsLoading(false);
      if (error) {
        alert(error.message);
        return false;
      }
      return true;
    }

    // Demo Mode signup
    const newUser: Profile = {
      id: 'usr_' + Date.now(),
      name: name.trim(),
      username: cleanUser,
      email: email.trim(),
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanUser}`,
      is_online: true,
      last_seen_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    setCurrentUser(newUser);
    setIsLoading(false);
    return true;
  };

  const forgotPassword = async (email: string) => {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) {
        alert(error.message);
        return false;
      }
    }
    return true;
  };

  const logout = async () => {
    const supabase = getSupabaseClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    setCurrentUser(null);
    localStorage.removeItem('nexus_current_user');
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...updates, updated_at: new Date().toISOString() };
    setCurrentUser(updated);

    const supabase = getSupabaseClient();
    if (supabase) {
      await supabase.from('profiles').update(updates).eq('id', currentUser.id);
    }
  };

  const updatePrivacySettings = async (updates: Partial<PrivacySettings>) => {
    const updated = { ...privacySettings, ...updates };
    setPrivacySettings(updated);
  };

  // CONTACT REQUEST SYSTEM (Requirement 5)
  const isContact = useCallback((userId: string) => {
    if (!currentUser) return false;
    return contacts.some(
      (c) =>
        (c.user_id === currentUser.id && c.contact_user_id === userId) ||
        (c.user_id === userId && c.contact_user_id === currentUser.id)
    );
  }, [contacts, currentUser]);

  const hasPendingRequestWith = useCallback((userId: string) => {
    if (!currentUser) return false;
    return contactRequests.some(
      (cr) =>
        cr.status === 'pending' &&
        ((cr.sender_id === currentUser.id && cr.receiver_id === userId) ||
         (cr.sender_id === userId && cr.receiver_id === currentUser.id))
    );
  }, [contactRequests, currentUser]);

  const sendContactRequest = async (targetUsername: string): Promise<{ success: boolean; message: string }> => {
    if (!currentUser) return { success: false, message: 'Not logged in' };
    const clean = targetUsername.replace('@', '').trim().toLowerCase();

    // Check target user
    const targetUser = ALL_USERS.find((u) => u.username.toLowerCase() === clean);
    if (!targetUser) {
      return { success: false, message: `User @${clean} not found` };
    }

    if (targetUser.id === currentUser.id) {
      return { success: false, message: 'You cannot add yourself' };
    }

    if (isContact(targetUser.id)) {
      return { success: false, message: `@${clean} is already in your contacts` };
    }

    if (hasPendingRequestWith(targetUser.id)) {
      return { success: false, message: 'A contact request is already pending' };
    }

    const newRequest: ContactRequest = {
      id: 'req_' + Date.now(),
      sender_id: currentUser.id,
      receiver_id: targetUser.id,
      status: 'pending',
      created_at: new Date().toISOString(),
      sender: currentUser,
      receiver: targetUser,
    };

    setContactRequests((prev) => [newRequest, ...prev]);

    // Emit over Realtime bus so other tab/user receives request live
    realtimeBus.emit({
      type: 'message:new',
      senderId: currentUser.id,
      targetId: targetUser.id,
      data: newRequest,
      timestamp: new Date().toISOString(),
    });

    const supabase = getSupabaseClient();
    if (supabase) {
      await supabase.from('contact_requests').insert({
        sender_id: currentUser.id,
        receiver_id: targetUser.id,
        status: 'pending',
      });
    }

    return { success: true, message: `Contact request sent to @${targetUser.username}!` };
  };

  const acceptContactRequest = async (requestId: string) => {
    if (!currentUser) return;
    const req = contactRequests.find((r) => r.id === requestId);
    if (!req) return;

    // Update request to accepted
    setContactRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'accepted' as const } : r))
    );

    const partnerId = req.sender_id === currentUser.id ? req.receiver_id : req.sender_id;
    const partnerProfile = ALL_USERS.find((u) => u.id === partnerId) || req.sender || req.receiver;

    // Create mutual contacts entry
    const newContact1: Contact = {
      id: 'ct_' + Date.now(),
      user_id: currentUser.id,
      contact_user_id: partnerId,
      created_at: new Date().toISOString(),
      contact_profile: partnerProfile,
    };

    const newContact2: Contact = {
      id: 'ct_' + (Date.now() + 1),
      user_id: partnerId,
      contact_user_id: currentUser.id,
      created_at: new Date().toISOString(),
      contact_profile: currentUser,
    };

    setContacts((prev) => [...prev, newContact1, newContact2]);

    const supabase = getSupabaseClient();
    if (supabase) {
      await supabase.from('contact_requests').update({ status: 'accepted' }).eq('id', requestId);
      await supabase.from('contacts').insert([
        { user_id: currentUser.id, contact_user_id: partnerId },
        { user_id: partnerId, contact_user_id: currentUser.id },
      ]);
    }
  };

  const rejectContactRequest = async (requestId: string) => {
    setContactRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'rejected' as const } : r))
    );

    const supabase = getSupabaseClient();
    if (supabase) {
      await supabase.from('contact_requests').update({ status: 'rejected' }).eq('id', requestId);
    }
  };

  const blockContact = async (userId: string) => {
    if (!currentUser) return;
    const target = ALL_USERS.find((u) => u.id === userId);
    const newBlocked: BlockedUser = {
      id: 'blk_' + Date.now(),
      blocker_id: currentUser.id,
      blocked_user_id: userId,
      created_at: new Date().toISOString(),
      blocked_profile: target,
    };
    setBlockedUsers((prev) => [...prev, newBlocked]);

    const supabase = getSupabaseClient();
    if (supabase) {
      await supabase.from('blocked_users').insert({
        blocker_id: currentUser.id,
        blocked_user_id: userId,
      });
    }
  };

  const unblockContact = async (userId: string) => {
    setBlockedUsers((prev) => prev.filter((b) => b.blocked_user_id !== userId));

    const supabase = getSupabaseClient();
    if (supabase && currentUser) {
      await supabase.from('blocked_users').delete().match({
        blocker_id: currentUser.id,
        blocked_user_id: userId,
      });
    }
  };

  const switchUser = (user: Profile) => {
    setCurrentUser(user);
    realtimeBus.emit({
      type: 'user:switch',
      data: user,
      timestamp: new Date().toISOString(),
    });
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        contacts,
        contactRequests,
        blockedUsers,
        privacySettings,
        isLoading,
        isConfigured,
        login,
        signup,
        logout,
        updateProfile,
        updatePrivacySettings,
        sendContactRequest,
        acceptContactRequest,
        rejectContactRequest,
        blockContact,
        unblockContact,
        blockUser: blockContact,
        unblockUser: unblockContact,
        switchUser,
        isContact,
        hasPendingRequestWith,
        forgotPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
