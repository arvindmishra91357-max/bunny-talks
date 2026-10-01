import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { useRealtime } from '../../context/RealtimeContext';
import { Sidebar } from '../sidebar/Sidebar';
import { ChatArea } from '../chat/ChatArea';
import { ChatDetails } from '../details/ChatDetails';
import { CallModal } from '../modals/CallModal';
import { NewChatModal } from '../modals/NewChatModal';
import { ForwardModal } from '../modals/ForwardModal';
import { ProfileModal } from '../modals/ProfileModal';
import { ReportModal } from '../modals/ReportModal';
import { MediaLightbox } from '../modals/MediaLightbox';
import { ToastNotifications } from '../common/ToastNotifications';
import { Message } from '../../types';
import { WifiOff } from 'lucide-react';

export const MainLayout: React.FC = () => {
  const { activeConversationId, setActiveConversationId, isDetailsOpen, setIsDetailsOpen } = useChat();
  const { currentUser } = useAuth();
  const { isOnline } = useRealtime();

  // Modals state
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [forwardingMessage, setForwardingMessage] = useState<Message | null>(null);
  const [reportingTarget, setReportingTarget] = useState<{ id: string; type: 'user' | 'group' } | null>(null);
  const [lightboxMedia, setLightboxMedia] = useState<{ url: string; type: 'image' | 'video' } | null>(null);

  // Mobile navigation: whether to show ChatArea on mobile
  const showMobileChat = Boolean(activeConversationId);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 font-sans text-slate-100">
      {/* Offline Alert Banner */}
      {!isOnline && (
        <div className="bg-amber-600 text-white text-xs font-semibold py-1.5 px-4 flex items-center justify-center gap-2 z-40 shadow-sm animate-pulse">
          <WifiOff className="w-4 h-4" />
          <span>You are offline. Reconnecting to Supabase Realtime...</span>
        </div>
      )}

      {/* Main 2-Column WhatsApp Web Style Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* COLUMN 1: SIDEBAR (Chats List / Contacts / Requests) */}
        <div
          className={`${
            showMobileChat ? 'hidden md:flex' : 'flex'
          } w-full md:w-80 lg:w-96 flex-shrink-0 h-full`}
        >
          <Sidebar
            onOpenNewChat={() => setIsNewChatOpen(true)}
            onOpenProfile={() => setIsProfileOpen(true)}
            onOpenSettings={() => setIsProfileOpen(true)}
          />
        </div>

        {/* COLUMN 2: ACTIVE 1-TO-1 CHAT AREA */}
        <div
          className={`${
            !showMobileChat ? 'hidden md:flex' : 'flex'
          } flex-1 flex flex-col h-full overflow-hidden`}
        >
          <ChatArea
            onBackToConversations={() => setActiveConversationId(null)}
            onOpenLightbox={(url, type) => setLightboxMedia({ url, type })}
            onForwardMessage={(msg) => setForwardingMessage(msg)}
          />
        </div>

        {/* COLUMN 3: CHAT DETAILS DRAWER */}
        {isDetailsOpen && (
          <div className="fixed md:static inset-y-0 right-0 z-40 md:z-auto h-full shadow-2xl md:shadow-none animate-slide-in-right">
            <ChatDetails
              onClose={() => setIsDetailsOpen(false)}
              onOpenReport={(id, type) => setReportingTarget({ id, type })}
              onOpenLightbox={(url, type) => setLightboxMedia({ url, type })}
            />
          </div>
        )}
      </div>

      {/* Floating In-App Notifications Toast */}
      <ToastNotifications />

      {/* WebRTC Video/Audio Call Overlay Modal */}
      <CallModal />

      {/* New Chat / Add Contact Modal */}
      {isNewChatOpen && (
        <NewChatModal onClose={() => setIsNewChatOpen(false)} />
      )}

      {/* Forward Message Modal */}
      {forwardingMessage && (
        <ForwardModal
          message={forwardingMessage}
          onClose={() => setForwardingMessage(null)}
        />
      )}

      {/* Profile & Settings Modal */}
      {isProfileOpen && (
        <ProfileModal onClose={() => setIsProfileOpen(false)} />
      )}

      {/* Report Modal */}
      {reportingTarget && (
        <ReportModal
          targetId={reportingTarget.id}
          type={reportingTarget.type}
          onClose={() => setReportingTarget(null)}
        />
      )}

      {/* Fullscreen Media Lightbox */}
      {lightboxMedia && (
        <MediaLightbox
          url={lightboxMedia.url}
          type={lightboxMedia.type}
          onClose={() => setLightboxMedia(null)}
        />
      )}
    </div>
  );
};
