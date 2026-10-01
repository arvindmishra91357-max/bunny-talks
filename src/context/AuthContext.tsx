import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile, PresenceStatus } from '../types';
import { MAYA_USER, LIAM_USER, SOPHIE_USER, NOAH_USER, CHLOE_USER } from '../lib/mockData';
import { realtimeBus } from '../lib/realtimeBus';

interface AuthContextType {
  currentUser: Profile | null;
  allUsers: Profile[];
  isOnboarded: boolean;
  loading: boolean;
  login: (identifier: string, password?: string) => Promise<boolean>;
  loginAs: (user: Profile) => void;
  register: (arg1: string, arg2?: string, arg3?: string, arg4?: string) => Promise<boolean>;
  logout: () => void;
  switchUser: (userId: string) => void;
  updateProfile: (updates: Partial<Profile>) => void;
  updatePresence: (status: PresenceStatus) => void;
  completeOnboarding: (data?: Partial<Profile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PRELOADED_PROFILES = [MAYA_USER, LIAM_USER, SOPHIE_USER, NOAH_USER, CHLOE_USER];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState<boolean>(false);

  const [currentUser, setCurrentUser] = useState<Profile | null>(() => {
    const saved = localStorage.getItem('bunny_current_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return MAYA_USER; // Default to Maya Lin for immediate rich social experience
  });

  const [allUsers, setAllUsers] = useState<Profile[]>(() => {
    const saved = localStorage.getItem('bunny_all_users');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return PRELOADED_PROFILES;
  });

  const [isOnboarded, setIsOnboarded] = useState<boolean>(() => {
    const saved = localStorage.getItem('bunny_onboarded');
    return saved !== 'false';
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('bunny_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('bunny_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('bunny_all_users', JSON.stringify(allUsers));
  }, [allUsers]);

  const login = async (identifier: string, _password?: string): Promise<boolean> => {
    const cleanId = identifier.trim().toLowerCase();
    const found = allUsers.find(
      (u) => u.username.toLowerCase() === cleanId || (u.email && u.email.toLowerCase() === cleanId) || u.name.toLowerCase().includes(cleanId)
    );

    if (found) {
      setCurrentUser(found);
      setIsOnboarded(true);
      localStorage.setItem('bunny_onboarded', 'true');
      realtimeBus.emit({
        type: 'user:switch',
        senderId: found.id,
        data: found,
        timestamp: new Date().toISOString(),
      });
      return true;
    }

    // Auto-create new user if not found
    const newUser: Profile = {
      id: `user-${Date.now()}`,
      name: identifier.includes('@') ? identifier.split('@')[0] : identifier,
      display_name: identifier.includes('@') ? identifier.split('@')[0] : identifier,
      displayName: identifier.includes('@') ? identifier.split('@')[0] : identifier,
      username: identifier.toLowerCase().replace(/[^a-z0-9_]/g, '') || `bunny_${Date.now().toString().slice(-4)}`,
      email: identifier.includes('@') ? identifier : `${identifier}@bunnytalks.com`,
      avatar_url: '/assets/bunny-icon.png',
      avatarUrl: '/assets/bunny-icon.png',
      bio: 'New to Bunny Talks! 🐰',
      mood_status: '🐰 Just hopped in',
      is_online: true,
      presence_status: 'online',
      friends_count: 0,
      sparks_count: 0,
      groups_count: 0,
      channels_count: 0,
      created_at: new Date().toISOString(),
    };

    setAllUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    setIsOnboarded(false);
    return true;
  };

  const loginAs = (user: Profile) => {
    setCurrentUser(user);
    setIsOnboarded(true);
    localStorage.setItem('bunny_onboarded', 'true');
    realtimeBus.emit({
      type: 'user:switch',
      senderId: user.id,
      data: user,
      timestamp: new Date().toISOString(),
    });
  };

  const register = async (
    arg1: string,
    arg2?: string,
    arg3?: string,
    arg4?: string
  ): Promise<boolean> => {
    let email = arg1;
    let name = arg3 || arg1;
    let username = arg4 || arg2 || `bunny_${Date.now().toString().slice(-4)}`;

    if (arg1 && arg2 && !arg3 && !arg4) {
      name = arg1;
      username = arg2;
      email = `${username}@bunnytalks.app`;
    }

    const newUser: Profile = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      display_name: name.trim(),
      displayName: name.trim(),
      username: username.trim().toLowerCase().replace(/[^a-z0-9_]/g, ''),
      email: email || `${username}@bunnytalks.com`,
      avatar_url: '/assets/bunny-icon.png',
      avatarUrl: '/assets/bunny-icon.png',
      bio: 'Ready to chat on Bunny Talks! 🐰',
      mood_status: '✨ Say hello',
      is_online: true,
      presence_status: 'online',
      friends_count: 0,
      sparks_count: 0,
      groups_count: 0,
      channels_count: 0,
      created_at: new Date().toISOString(),
    };

    setAllUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    setIsOnboarded(false);
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('bunny_current_user');
  };

  const switchUser = (userId: string) => {
    const found = allUsers.find((u) => u.id === userId);
    if (found) {
      setCurrentUser(found);
      realtimeBus.emit({
        type: 'user:switch',
        senderId: found.id,
        data: found,
        timestamp: new Date().toISOString(),
      });
    }
  };

  const updateProfile = (updates: Partial<Profile>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...updates, updated_at: new Date().toISOString() };
    setCurrentUser(updated);
    setAllUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    realtimeBus.emit({
      type: 'presence:sync',
      senderId: updated.id,
      data: updated,
      timestamp: new Date().toISOString(),
    });
  };

  const updatePresence = (status: PresenceStatus) => {
    updateProfile({
      presence_status: status,
      is_online: status === 'online' || status === 'away',
      last_seen_at: new Date().toISOString(),
    });
  };

  const completeOnboarding = (data?: Partial<Profile>) => {
    if (data) {
      updateProfile(data);
    }
    setIsOnboarded(true);
    localStorage.setItem('bunny_onboarded', 'true');
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        allUsers,
        isOnboarded,
        loading,
        login,
        loginAs,
        register,
        logout,
        switchUser,
        updateProfile,
        updatePresence,
        completeOnboarding,
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
