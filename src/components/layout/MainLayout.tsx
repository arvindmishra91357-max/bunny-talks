import React from 'react';
import { useChat } from '../../context/ChatContext';
import { AppHeader } from './AppHeader';
import { DesktopSidebar } from './DesktopSidebar';
import { MobileBottomNav } from './MobileBottomNav';
import { ContextPanel } from './ContextPanel';

// Views
import { ChatList } from '../chat/ChatList';
import { ChatArea } from '../chat/ChatArea';
import { FriendsView } from '../friends/FriendsView';
import { DiscoverView } from '../discover/DiscoverView';
import { GroupsView } from '../groups/GroupsView';
import { ChannelsView } from '../channels/ChannelsView';
import { SparksView } from '../sparks/SparksView';
import { ActivityView } from '../activity/ActivityView';
import { ProfileView } from '../profile/ProfileView';
import { SettingsView } from '../settings/SettingsView';

// Modals
import { CallModal } from '../modals/CallModal';
import { NewChatModal } from '../modals/NewChatModal';
import { CreateSparkModal } from '../modals/CreateSparkModal';
import { SparkViewerModal } from '../modals/SparkViewerModal';
import { CreateGroupModal } from '../modals/CreateGroupModal';
import { CreateChannelModal } from '../modals/CreateChannelModal';
import { ForwardModal } from '../modals/ForwardModal';
import { MediaLightbox } from '../modals/MediaLightbox';
import { ReportModal } from '../modals/ReportModal';
import { EditProfileModal } from '../profile/EditProfileModal';
import { ToastNotifications } from '../common/ToastNotifications';

export const MainLayout: React.FC = () => {
  const {
    activeTab,
    activeConversation,
    isContextPanelOpen,
    isEditProfileOpen,
    setIsEditProfileOpen,
    reportModalTarget,
    setReportModalTarget,
    lightboxMedia,
    setLightboxMedia,
  } = useChat();

  // Helper to render current main view
  const renderMainView = () => {
    switch (activeTab) {
      case 'chats':
        return (
          <div className="flex-1 flex overflow-hidden h-full">
            {/* Conversations list column (hidden on mobile if chat is active) */}
            <div
              className={`w-full md:w-80 lg:w-96 border-r border-bunny-border/50 flex-col flex-shrink-0 bg-bunny-bg ${
                activeConversation ? 'hidden md:flex' : 'flex'
              }`}
            >
              <ChatList />
            </div>

            {/* Conversation Room Chat Area (hidden on mobile if no conversation selected) */}
            <div
              className={`flex-1 flex flex-col h-full bg-bunny-surface/40 ${
                activeConversation ? 'flex' : 'hidden md:flex'
              }`}
            >
              <ChatArea />
            </div>
          </div>
        );

      case 'friends':
        return <FriendsView />;

      case 'discover':
        return <DiscoverView />;

      case 'groups':
        return <GroupsView />;

      case 'channels':
        return <ChannelsView />;

      case 'sparks':
        return <SparksView />;

      case 'activity':
        return <ActivityView />;

      case 'profile':
        return <ProfileView />;

      case 'settings':
        return <SettingsView />;

      default:
        return <div className="p-8 text-center text-bunny-muted">Unknown View</div>;
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-bunny-bg text-bunny-text select-none">
      {/* 1. Global App Header */}
      <AppHeader />

      {/* 2. Body container with Sidebar, Main content, and optional Context panel */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Navigation Desktop Sidebar */}
        <DesktopSidebar />

        {/* Central Main View */}
        <main className="flex-1 flex flex-col overflow-hidden relative min-w-0">
          {renderMainView()}
        </main>

        {/* Right Desktop Context Panel */}
        {isContextPanelOpen && <ContextPanel />}
      </div>

      {/* 3. Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* 4. Global WebRTC Audio / Video Calling Modal */}
      <CallModal />

      {/* 5. Application Dialogs & Modals */}
      <NewChatModal />
      <CreateSparkModal />
      <SparkViewerModal />
      <CreateGroupModal />
      <CreateChannelModal />
      <ForwardModal />
      <EditProfileModal isOpen={isEditProfileOpen} onClose={() => setIsEditProfileOpen(false)} />
      {reportModalTarget && (
        <ReportModal
          isOpen={Boolean(reportModalTarget)}
          onClose={() => setReportModalTarget(null)}
          targetType={(reportModalTarget.type as any) || 'message'}
          targetId={reportModalTarget.id}
          targetName={reportModalTarget.name}
        />
      )}
      {lightboxMedia && (
        <MediaLightbox
          url={lightboxMedia.url}
          type={lightboxMedia.type}
          caption={lightboxMedia.title}
          onClose={() => setLightboxMedia(null)}
        />
      )}

      {/* 6. Dynamic Toast Notifications Container */}
      <ToastNotifications />
    </div>
  );
};
