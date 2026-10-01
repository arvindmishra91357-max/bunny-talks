import React, { createContext, useContext, useEffect } from 'react';
import { realtimeBus } from '../lib/realtimeBus';
import { useAuth } from './AuthContext';

interface RealtimeContextType {
  isConnected: boolean;
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined);

export const RealtimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) return;

    // Initialize Supabase realtime channel if configured
    realtimeBus.initSupabaseRealtime(currentUser.id);
  }, [currentUser]);

  return (
    <RealtimeContext.Provider value={{ isConnected: true }}>
      {children}
    </RealtimeContext.Provider>
  );
};

export const useRealtime = () => {
  const context = useContext(RealtimeContext);
  if (!context) throw new Error('useRealtime must be used within RealtimeProvider');
  return context;
};
