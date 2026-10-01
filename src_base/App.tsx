import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import { RealtimeProvider } from './context/RealtimeContext';
import { CallProvider } from './context/CallContext';
import { MainLayout } from './components/layout/MainLayout';
import { AuthScreen } from './components/auth/AuthScreen';

const AppContent: React.FC = () => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <AuthScreen />;
  }

  return <MainLayout />;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ChatProvider>
          <RealtimeProvider>
            <CallProvider>
              <AppContent />
            </CallProvider>
          </RealtimeProvider>
        </ChatProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
