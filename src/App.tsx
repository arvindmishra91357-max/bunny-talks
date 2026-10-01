import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MobileAuthScreen, UserProfile, PRESET_USERS } from './components/auth/MobileAuthScreen';
import { EnhancedCallModal, ActiveCallData } from './components/call/EnhancedCallModal';
import { MobileDeviceWrapper } from './components/layout/MobileDeviceWrapper';
import { MediaLightbox } from './components/modals/MediaLightbox';
import { 
  playTapSound, 
  playLogoutSound, 
  playCallConnectedSound, 
  playCallEndedSound,
  playMessageSentSound,
  playMessageReceivedSound,
  VoiceRecorder
} from './lib/audio';
import { 
  Phone, 
  Video, 
  ArrowLeft,
  Search,
  Bell,
  User,
  Plus,
  X,
  SlidersHorizontal,
  Sparkles,
  Smile,
  Paperclip,
  Send,
  Mic,
  Trash2,
  Copy,
  CornerUpRight,
  CornerUpLeft,
  Heart,
  Check,
  CheckCheck,
  Share2,
  Compass,
  UsersRound,
  Radio,
  Headphones,
  Image as ImageIcon,
  FileText,
  Sun,
  Moon,
  Palette,
  Lock,
  Shield,
  MoreVertical,
  Volume2,
  VolumeX,
  Hand,
  LogOut,
  ChevronRight,
  Play,
  Pause,
  MessageCircle,
  Zap,
  HelpCircle,
  Clock,
  Download,
  Flame,
  Laugh,
  ThumbsUp,
  UserPlus,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  History
} from 'lucide-react';

// Navigation Screen IDs
export type ScreenId = 
  | 'home' 
  | 'calls'
  | 'friends' 
  | 'discover' 
  | 'profile' 
  | 'groups' 
  | 'channels' 
  | 'sparks' 
  | 'filters' 
  | 'room';

export type ThemePreset = 
  | 'radiant' 
  | 'neon' 
  | 'mint' 
  | 'ocean' 
  | 'cyberpunk' 
  | 'midnight' 
  | 'lavender' 
  | 'emerald';

export type ModalType = 
  | 'none' 
  | 'spark' 
  | 'group' 
  | 'channel' 
  | 'profile' 
  | 'storyView' 
  | 'liveRoom' 
  | 'account' 
  | 'notifications' 
  | 'privacy' 
  | 'help'
  | 'notifications_feed'
  | 'new_chat'
  | 'forward_message'
  | 'add_friend'
  | 'theme_picker';

export interface CallLogItem {
  id: string;
  contactName: string;
  contactAvatar: string;
  type: 'voice' | 'video';
  direction: 'outgoing' | 'incoming' | 'missed';
  time: string;
  date: string;
  durationSeconds: number;
  timestamp: number;
}

export interface MessageItem {
  id: string;
  sender: 'them' | 'me';
  text: string;
  time?: string;
  avatar?: string;
  mediaType?: 'image' | 'audio' | 'doc' | 'sticker';
  mediaUrl?: string;
  mediaName?: string;
  mediaSize?: string;
  reaction?: string;
  audioDuration?: string;
  replyToText?: string;
  isRead?: boolean;
}

export interface ChatContact {
  id: string;
  name: string;
  avatar: string;
  time: string;
  preview: string;
  type: 'unread' | 'groups' | 'general';
  badge?: number;
  isOnline?: boolean;
  isGroup?: boolean;
  membersCount?: number;
}

export interface SparkStory {
  id: string;
  user: string;
  avatar: string;
  image: string;
  caption: string;
  time: string;
  likes: number;
}

export interface GroupItem {
  id: string;
  name: string;
  icon: string;
  members: string;
  tag: string;
  desc?: string;
  isJoined?: boolean;
}

export interface ChannelItem {
  id: string;
  name: string;
  icon: string;
  desc: string;
  badge: string;
  isJoined?: boolean;
  category?: string;
}

export interface NotificationItem {
  id: string;
  avatar: string;
  text: string;
  time: string;
  unread: boolean;
  targetChat?: string;
  targetSparkIndex?: number;
  targetScreen?: ScreenId;
}

export interface FriendItem {
  id: string;
  name: string;
  username?: string;
  subtitle: string;
  avatar: string;
  isOnline?: boolean;
}

export interface FriendRequestItem {
  id: string;
  name: string;
  username?: string;
  subtitle: string;
  avatar: string;
}

// Initial Mock Data Fallbacks
const DEFAULT_CHATS: ChatContact[] = [
  {
    id: 'c-liam',
    name: 'Liam Chen',
    avatar: '/assets/alex.png',
    time: '2m ago',
    preview: 'Can you review the new Bunny prototype?',
    type: 'unread',
    badge: 2,
    isOnline: true,
  },
  {
    id: 'c-product',
    name: 'Product Squad',
    avatar: '',
    time: '18m',
    preview: 'Sophie: Let’s review at 3pm for final sprint demo!',
    type: 'groups',
    isGroup: true,
    membersCount: 12,
  },
  {
    id: 'c-sophie',
    name: 'Sophie Park',
    avatar: '/assets/maya.png',
    time: '34m',
    preview: 'Loved the new theme colors! 🎨',
    type: 'general',
    isOnline: true,
  },
  {
    id: 'c-design',
    name: 'Design Systems',
    avatar: '',
    time: '45m',
    preview: 'New radiant color palette guidelines published 🎨',
    type: 'general',
    isGroup: true,
    membersCount: 48,
  },
  {
    id: 'c-noah',
    name: 'Noah Vance',
    avatar: '/assets/alex.png',
    time: '1h',
    preview: 'Haha that bunny sticker is hilarious 😂',
    type: 'general',
    isOnline: false,
  },
  {
    id: 'c-chloe',
    name: 'Chloe & Liam',
    avatar: '/assets/maya.png',
    time: '2h',
    preview: 'Shared 3 photos from brunch 🥞☕',
    type: 'general',
    isOnline: true,
  },
];

const DEFAULT_SPARKS: SparkStory[] = [
  {
    id: 's-liam',
    user: 'Liam',
    avatar: '/assets/alex.png',
    image: '/assets/alex.png',
    caption: 'Build in public 🚀 Clean code vibes & prototype testing',
    time: '9m ago',
    likes: 24,
  },
  {
    id: 's-sophie',
    user: 'Sophie',
    avatar: '/assets/maya.png',
    image: '/assets/maya.png',
    caption: 'Coffee + conversations ☕ Cozy Monday morning at the cafe',
    time: '24m ago',
    likes: 38,
  },
  {
    id: 's-noah',
    user: 'Noah',
    avatar: '/assets/alex.png',
    image: '/assets/alex.png',
    caption: 'Weekend sketchbook ✏️ Exploring fresh Bunny social concepts',
    time: '1h ago',
    likes: 19,
  },
  {
    id: 's-chloe',
    user: 'Chloe',
    avatar: '/assets/maya.png',
    image: '/assets/maya.png',
    caption: 'Soft Sunday 🌿 Botanical gardens walk with good music',
    time: '2h ago',
    likes: 52,
  },
];

const DEFAULT_GROUPS: GroupItem[] = [
  { id: 'g1', name: 'Product Squad', icon: '🚀', members: '12 members · 3 active now', tag: 'LIVE', desc: 'Core product team brainstorming and sprint discussions.', isJoined: true },
  { id: 'g2', name: 'Designers & Bunnies', icon: '🎨', members: '48 members · 5 active now', tag: 'OPEN', desc: 'Creative folks sharing UI/UX designs, tips, and aesthetics.', isJoined: true },
  { id: 'g3', name: 'Weekend Kickback', icon: '🎧', members: '103 members · Next: Sat 7pm', tag: 'JOINED', desc: 'Chill beats, casual banter, and Friday night gaming.', isJoined: true },
  { id: 'g4', name: 'Tech & AI Innovators', icon: '⚡', members: '240 members · 18 active', tag: 'PUBLIC', desc: 'Exploring modern agentic workflows, open-source code & frameworks.', isJoined: false },
];

const DEFAULT_CHANNELS: ChannelItem[] = [
  { id: 'ch1', name: 'Design Systems', icon: '🎨', desc: '18.2k members · 1.2k online', badge: '12', isJoined: true, category: 'Design' },
  { id: 'ch2', name: 'Lo-Fi Corner', icon: '🎵', desc: '42k members · chill music & study', badge: '4', isJoined: true, category: 'Music' },
  { id: 'ch3', name: 'Bunny Developers', icon: '💻', desc: '7.8k members · web & mobile tech', badge: 'NEW', isJoined: false, category: 'Tech' },
  { id: 'ch4', name: 'Friday Night Design', icon: '🪩', desc: '9.4k members · weekly jam sessions', badge: 'HOT', isJoined: true, category: 'Design' },
  { id: 'ch5', name: 'Photography & Moods', icon: '📸', desc: '15.6k members · street & aesthetic shots', badge: 'NEW', isJoined: false, category: 'Art' },
];

const DEFAULT_MESSAGES: Record<string, MessageItem[]> = {
  'Liam Chen': [
    {
      id: '1',
      sender: 'them',
      text: 'Hey Maya! Did you get a chance to review the new Bunny prototype?',
      time: '10:40 AM',
      avatar: '/assets/alex.png',
      isRead: true,
    },
    {
      id: '2',
      sender: 'me',
      text: 'Yes! Loving the warm radiant color palette and the micro-interactions.',
      time: '10:41 AM',
      reaction: '❤️',
      isRead: true,
    },
    {
      id: '3',
      sender: 'them',
      text: 'Perfect. I also added the new Spark flow. Want to test it together?',
      time: '10:42 AM',
      avatar: '/assets/alex.png',
      isRead: true,
    },
    {
      id: '4',
      sender: 'me',
      text: 'Absolutely 🐰 Send it over!',
      time: '10:42 AM',
      reaction: '🐰',
      isRead: true,
    },
  ],
  'Product Squad': [
    {
      id: 'p1',
      sender: 'them',
      text: 'Sophie: Let’s review at 3pm for final sprint demo!',
      time: '9:30 AM',
      avatar: '/assets/maya.png',
      isRead: true,
    },
    {
      id: 'p2',
      sender: 'me',
      text: 'Sounds great, will prepare the mobile screen mocks 🚀',
      time: '9:32 AM',
      isRead: true,
    },
    {
      id: 'p3',
      sender: 'them',
      text: 'Liam: Pushed the latest build with persistent back history!',
      time: '9:35 AM',
      avatar: '/assets/alex.png',
      reaction: '🔥',
      isRead: true,
    },
  ],
  'Sophie Park': [
    {
      id: 'sp1',
      sender: 'them',
      text: 'Hey Maya, have you tested the new dark mode theme? It looks so sleek!',
      time: '11:15 AM',
      avatar: '/assets/maya.png',
      isRead: true,
    },
    {
      id: 'sp2',
      sender: 'me',
      text: 'Just tried it! The OLED contrast and radiant neon accents are gorgeous ✨',
      time: '11:18 AM',
      isRead: true,
    },
  ],
  'Design Systems': [
    {
      id: 'ds1',
      sender: 'them',
      text: 'Sophie: Check out the new Bunny Talks component tokens!',
      time: '10:15 AM',
      avatar: '/assets/maya.png',
      isRead: true,
    },
    {
      id: 'ds2',
      sender: 'them',
      text: 'Liam: Loving the high-contrast dark mode values ✨',
      time: '10:18 AM',
      avatar: '/assets/alex.png',
      isRead: true,
    },
  ],
  'Lo-Fi Corner': [
    {
      id: 'lf1',
      sender: 'them',
      text: 'Host: Welcome everyone to today chill coding session 🎧',
      time: '11:00 AM',
      isRead: true,
    },
    {
      id: 'lf2',
      sender: 'them',
      text: 'Drop your favorite focus beats in the chat below!',
      time: '11:02 AM',
      isRead: true,
    },
  ],
  'Friday Night Design': [
    {
      id: 'fnd1',
      sender: 'them',
      text: 'What is everyone building this weekend? Show us your sparks!',
      time: 'Yesterday',
      isRead: true,
    },
  ],
  'Noah Vance': [
    {
      id: 'n1',
      sender: 'them',
      text: 'Haha that bunny sticker is hilarious 😂',
      time: 'Yesterday',
      avatar: '/assets/alex.png',
      isRead: true,
    },
  ],
  'Chloe & Liam': [
    {
      id: 'c1',
      sender: 'them',
      text: 'Shared 3 photos from brunch 🥞☕',
      time: '2h ago',
      avatar: '/assets/maya.png',
      isRead: true,
    },
  ],
};

const DEFAULT_FRIENDS: FriendItem[] = [
  { id: 'f1', name: 'Liam Chen', username: 'liam', subtitle: 'Active now · Product Squad', avatar: '/assets/alex.png', isOnline: true },
  { id: 'f2', name: 'Sophie Park', username: 'sophie', subtitle: 'Active 8m ago · Design Systems', avatar: '/assets/maya.png', isOnline: true },
  { id: 'f3', name: 'Noah Vance', username: 'noah', subtitle: 'Active 1h ago', avatar: '/assets/alex.png', isOnline: false },
  { id: 'f4', name: 'Chloe & Liam', username: 'chloe', subtitle: 'Shared 3 photos from brunch', avatar: '/assets/maya.png', isOnline: true },
];

const DEFAULT_FRIEND_REQUESTS: FriendRequestItem[] = [
  { id: 'r1', name: 'Alex Rivera', username: 'alex_r', subtitle: 'Sent you a friend request', avatar: '/assets/maya.png' },
  { id: 'r2', name: 'Mia Taylor', username: 'mia_t', subtitle: '12 mutual friends', avatar: '/assets/alex.png' },
];

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    avatar: '/assets/alex.png',
    text: 'Liam Chen reacted ❤️ to your message in chat',
    time: '2m ago',
    unread: true,
    targetChat: 'Liam Chen',
  },
  {
    id: 'notif-2',
    avatar: '/assets/maya.png',
    text: 'Sophie Park shared a new Spark: Coffee + conversations ☕',
    time: '24m ago',
    unread: true,
    targetSparkIndex: 1,
  },
  {
    id: 'notif-3',
    avatar: '/assets/alex.png',
    text: 'Alex Rivera sent you a friend request',
    time: '1h ago',
    unread: true,
    targetScreen: 'friends',
  },
  {
    id: 'notif-4',
    avatar: '/assets/bunny-icon.png',
    text: 'Welcome to updated Bunny Talks! Modern aesthetics, real back history & soundscapes 🐰',
    time: '3h ago',
    unread: false,
  },
];

const DEFAULT_CALL_LOGS: CallLogItem[] = [
  {
    id: 'cl-1',
    contactName: 'Liam Chen',
    contactAvatar: '/assets/alex.png',
    type: 'video',
    direction: 'outgoing',
    time: '11:20 AM',
    date: 'Today',
    durationSeconds: 142,
    timestamp: Date.now() - 1000 * 60 * 30,
  },
  {
    id: 'cl-2',
    contactName: 'Sophie Park',
    contactAvatar: '/assets/maya.png',
    type: 'voice',
    direction: 'incoming',
    time: 'Yesterday, 6:45 PM',
    date: 'Yesterday',
    durationSeconds: 310,
    timestamp: Date.now() - 1000 * 60 * 60 * 18,
  },
  {
    id: 'cl-3',
    contactName: 'Noah Vance',
    contactAvatar: '/assets/alex.png',
    type: 'voice',
    direction: 'missed',
    time: 'Yesterday, 3:12 PM',
    date: 'Yesterday',
    durationSeconds: 0,
    timestamp: Date.now() - 1000 * 60 * 60 * 22,
  },
];

export const App: React.FC = () => {
  // ==========================================
  // 1. BACK NAVIGATION & SCREEN HISTORY STATE
  // ==========================================
  const [activeScreen, setActiveScreen] = useState<ScreenId>(() => {
    const saved = localStorage.getItem('bunny_active_screen');
    return (saved as ScreenId) || 'home';
  });

  // Track exact origin screen where chat was entered from (fixes unpredictable back navigation)
  const [chatOriginScreen, setChatOriginScreen] = useState<ScreenId>(() => {
    const saved = localStorage.getItem('bunny_chat_origin');
    return (saved as ScreenId) || 'home';
  });

  const [history, setHistory] = useState<ScreenId[]>(() => {
    try {
      const saved = localStorage.getItem('bunny_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // WhatsApp-style Persistent Call History Logs
  const [callLogs, setCallLogs] = useState<CallLogItem[]>(() => {
    try {
      const saved = localStorage.getItem('bunny_call_logs');
      return saved ? JSON.parse(saved) : DEFAULT_CALL_LOGS;
    } catch {
      return DEFAULT_CALL_LOGS;
    }
  });
  const [callsFilter, setCallsFilter] = useState<'all' | 'missed'>('all');

  // Main 5 Navigation Tabs for sequential swipe navigation
  const MAIN_NAV_TABS: ScreenId[] = useMemo(() => ['home', 'calls', 'friends', 'discover', 'profile'], []);
  const [navTransitionDir, setNavTransitionDir] = useState<'forward' | 'backward'>('forward');

  // Global Navigation Swipe Gesture Tracking (Right swipe -> Next tab, Left swipe -> Previous tab / Back)
  const navSwipeStartXRef = useRef<number>(0);
  const navSwipeStartYRef = useRef<number>(0);
  const navSwipeStartTimeRef = useRef<number>(0);
  const isNavSwipingRef = useRef<boolean>(false);
  const navSwipeTargetRef = useRef<HTMLElement | null>(null);

  // Swipe Right / Left to Reply gesture tracking
  const [swipingMsgId, setSwipingMsgId] = useState<string | null>(null);
  const [swipeOffset, setSwipeOffset] = useState<number>(0);
  const swipeStartXRef = useRef<number>(0);
  const isSwipingRef = useRef<boolean>(false);

  // Active Chat State (Persisted)
  const [activeChat, setActiveChat] = useState<{ name: string; avatar: string; isOnline?: boolean; isGroup?: boolean }>(() => {
    try {
      const saved = localStorage.getItem('bunny_active_chat');
      return saved ? JSON.parse(saved) : { name: 'Liam Chen', avatar: '/assets/alex.png', isOnline: true };
    } catch {
      return { name: 'Liam Chen', avatar: '/assets/alex.png', isOnline: true };
    }
  });

  // Dark Mode State
  const [isDark, setIsDark] = useState<boolean>(() => {
    return localStorage.getItem('bunny_theme') === 'dark';
  });

  // Theme Preset State (radiant, neon, mint, ocean)
  const [activeTheme, setActiveTheme] = useState<ThemePreset>(() => {
    const saved = localStorage.getItem('bunny_theme_preset');
    return (saved as ThemePreset) || 'radiant';
  });

  // Modals & Bottom Sheets State
  const [modalType, setModalType] = useState<ModalType>('none');
  const [isLogoutConfirm, setIsLogoutConfirm] = useState(false);
  const [forwardingMessageText, setForwardingMessageText] = useState<string | null>(null);

  // Search States
  const [chatSearch, setChatSearch] = useState('');
  const [friendSearch, setFriendSearch] = useState('');
  const [discoverSearch, setDiscoverSearch] = useState('');
  const [newChatSearch, setNewChatSearch] = useState('');
  const [newFriendInput, setNewFriendInput] = useState('');

  // Tab & Pill Filters
  const [chatPill, setChatPill] = useState<'all' | 'unread' | 'groups' | 'channels'>('all');
  const [discoverTab, setDiscoverTab] = useState<'all' | 'people' | 'groups' | 'channels'>('all');
  const [sparkPill, setSparkPill] = useState<'all' | 'friends' | 'communities'>('all');
  const [friendsTab, setFriendsTab] = useState<'all' | 'requests' | 'add'>('all');

  // Filter Switches State
  const [filterSwitches, setFilterSwitches] = useState(() => {
    try {
      const saved = localStorage.getItem('bunny_filter_switches');
      return saved ? JSON.parse(saved) : { unread: true, groups: true, channels: false, mentions: false, recent: true };
    } catch {
      return { unread: true, groups: true, channels: false, mentions: false, recent: true };
    }
  });

  // User Profile State
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('bunny_user_profile');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return PRESET_USERS[0];
  });
  const [profileName, setProfileName] = useState(currentUserProfile.name || 'Maya Liu');
  const [profileBio, setProfileBio] = useState(currentUserProfile.bio || '@maya · Always curious ✨');
  const [profileAvatar, setProfileAvatar] = useState(currentUserProfile.avatar || '/assets/maya.png');

  // Account Settings
  const [phoneNumber, setPhoneNumber] = useState(currentUserProfile.phone || '+1 (555) 392-0192');
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [tempPhoneInput, setTempPhoneInput] = useState(currentUserProfile.phone || '+1 (555) 392-0192');
  const [is2FAEnabled, setIs2FAEnabled] = useState(true);

  // Notifications & Sound Preferences
  const [notifSound, setNotifSound] = useState(true);
  const [notifPreview, setNotifPreview] = useState(true);
  const [notifSparks, setNotifSparks] = useState(true);

  // Privacy Preferences
  const [privacyOnline, setPrivacyOnline] = useState(true);
  const [privacyReceipts, setPrivacyReceipts] = useState(true);
  const [privacySparks, setPrivacySparks] = useState(true);

  // FAQ Accordion
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(0);

  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('bunny_logged_in') !== 'false';
  });

  // Call State
  const [activeCallData, setActiveCallData] = useState<ActiveCallData | null>(null);

  // Live Audio Room State
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [isLiveRoomMuted, setIsLiveRoomMuted] = useState(true);

  // In-Chat Drawers & Actions
  const [isAttachOpen, setIsAttachOpen] = useState(false);
  const [isStickersOpen, setIsStickersOpen] = useState(false);
  const [selectedMessageForAction, setSelectedMessageForAction] = useState<string | null>(null);
  const [replyingToMessage, setReplyingToMessage] = useState<MessageItem | null>(null);

  // Voice Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const recordingTimerRef = useRef<number | null>(null);
  const recorderRef = useRef<VoiceRecorder | null>(null);

  // Audio Playback State
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const audioPlayTimerRef = useRef<number | null>(null);

  // File Inputs
  const chatPhotoInputRef = useRef<HTMLInputElement>(null);
  const chatDocInputRef = useRef<HTMLInputElement>(null);
  const sparkFileInputRef = useRef<HTMLInputElement>(null);
  const profileFileInputRef = useRef<HTMLInputElement>(null);

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  // Chat Room Input & Auto Scroll
  const [roomInput, setRoomInput] = useState('');
  const [inChatSearchQuery, setInChatSearchQuery] = useState('');
  const [isChatSearchOpen, setIsChatSearchOpen] = useState(false);
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Media Lightbox State
  const [lightboxMedia, setLightboxMedia] = useState<{ url: string; type?: 'image' | 'video'; caption?: string } | null>(null);

  // Story Viewer Inputs
  const [sparkInput, setSparkInput] = useState('');
  const [sparkImageCustom, setSparkImageCustom] = useState<string | null>(null);
  const [groupNameInput, setGroupNameInput] = useState('');
  const [groupDescInput, setGroupDescInput] = useState('');
  const [channelNameInput, setChannelNameInput] = useState('');
  const [channelCategoryInput, setChannelCategoryInput] = useState('Design');
  const [activeStoryIndex, setActiveStoryIndex] = useState<number>(0);
  const [storyReplyInput, setStoryReplyInput] = useState('');
  const [isStoryPaused, setIsStoryPaused] = useState(false);

  // ==========================================
  // 2. PERSISTED DATA COLLECTIONS
  // ==========================================
  // Chats
  const [chats, setChats] = useState<ChatContact[]>(() => {
    try {
      const saved = localStorage.getItem('bunny_chats');
      return saved ? JSON.parse(saved) : DEFAULT_CHATS;
    } catch {
      return DEFAULT_CHATS;
    }
  });

  // Messages per Chat / Group / Channel
  const [roomMessages, setRoomMessages] = useState<Record<string, MessageItem[]>>(() => {
    try {
      const saved = localStorage.getItem('bunny_room_messages');
      return saved ? JSON.parse(saved) : DEFAULT_MESSAGES;
    } catch {
      return DEFAULT_MESSAGES;
    }
  });

  // Sparks
  const [sparksList, setSparksList] = useState<SparkStory[]>(() => {
    try {
      const saved = localStorage.getItem('bunny_sparks_list');
      return saved ? JSON.parse(saved) : DEFAULT_SPARKS;
    } catch {
      return DEFAULT_SPARKS;
    }
  });

  // Liked Sparks
  const [likedSparks, setLikedSparks] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('bunny_liked_sparks');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Groups
  const [groupsList, setGroupsList] = useState<GroupItem[]>(() => {
    try {
      const saved = localStorage.getItem('bunny_groups_list');
      return saved ? JSON.parse(saved) : DEFAULT_GROUPS;
    } catch {
      return DEFAULT_GROUPS;
    }
  });

  // Channels
  const [channelsList, setChannelsList] = useState<ChannelItem[]>(() => {
    try {
      const saved = localStorage.getItem('bunny_channels_list');
      return saved ? JSON.parse(saved) : DEFAULT_CHANNELS;
    } catch {
      return DEFAULT_CHANNELS;
    }
  });

  // Friends
  const [allFriends, setAllFriends] = useState<FriendItem[]>(() => {
    try {
      const saved = localStorage.getItem('bunny_all_friends');
      return saved ? JSON.parse(saved) : DEFAULT_FRIENDS;
    } catch {
      return DEFAULT_FRIENDS;
    }
  });

  // Friend Requests
  const [friendRequests, setFriendRequests] = useState<FriendRequestItem[]>(() => {
    try {
      const saved = localStorage.getItem('bunny_friend_requests');
      return saved ? JSON.parse(saved) : DEFAULT_FRIEND_REQUESTS;
    } catch {
      return DEFAULT_FRIEND_REQUESTS;
    }
  });

  // Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem('bunny_notifications');
      return saved ? JSON.parse(saved) : DEFAULT_NOTIFICATIONS;
    } catch {
      return DEFAULT_NOTIFICATIONS;
    }
  });

  // ==========================================
  // 3. STORAGE PERSISTENCE SYNC EFFECTS
  // ==========================================
  useEffect(() => {
    localStorage.setItem('bunny_chats', JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    localStorage.setItem('bunny_room_messages', JSON.stringify(roomMessages));
  }, [roomMessages]);

  useEffect(() => {
    localStorage.setItem('bunny_sparks_list', JSON.stringify(sparksList));
  }, [sparksList]);

  useEffect(() => {
    localStorage.setItem('bunny_liked_sparks', JSON.stringify(likedSparks));
  }, [likedSparks]);

  useEffect(() => {
    localStorage.setItem('bunny_groups_list', JSON.stringify(groupsList));
  }, [groupsList]);

  useEffect(() => {
    localStorage.setItem('bunny_channels_list', JSON.stringify(channelsList));
  }, [channelsList]);

  useEffect(() => {
    localStorage.setItem('bunny_all_friends', JSON.stringify(allFriends));
  }, [allFriends]);

  useEffect(() => {
    localStorage.setItem('bunny_friend_requests', JSON.stringify(friendRequests));
  }, [friendRequests]);

  useEffect(() => {
    localStorage.setItem('bunny_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('bunny_filter_switches', JSON.stringify(filterSwitches));
  }, [filterSwitches]);

  useEffect(() => {
    localStorage.setItem('bunny_active_chat', JSON.stringify(activeChat));
  }, [activeChat]);

  useEffect(() => {
    localStorage.setItem('bunny_call_logs', JSON.stringify(callLogs));
  }, [callLogs]);

  useEffect(() => {
    localStorage.setItem('bunny_chat_origin', chatOriginScreen);
  }, [chatOriginScreen]);

  // Dark Mode Class Sync
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('bunny_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('bunny_theme', 'light');
    }
  }, [isDark]);

  // Theme Preset Sync
  useEffect(() => {
    localStorage.setItem('bunny_theme_preset', activeTheme);
  }, [activeTheme]);

  // ==========================================
  // 4. BROWSER POPSTATE & HISTORY SYNC
  // ==========================================
  useEffect(() => {
    // Set initial window state
    if (!window.history.state) {
      window.history.replaceState({ screen: activeScreen, modal: 'none', chat: activeChat.name }, '', `#${activeScreen}`);
    }

    const handlePopState = (e: PopStateEvent) => {
      // 1. If a modal or sheet is open, close it cleanly
      if (modalType !== 'none') {
        setModalType('none');
        return;
      }
      if (lightboxMedia) {
        setLightboxMedia(null);
        return;
      }
      if (isLogoutConfirm) {
        setIsLogoutConfirm(false);
        return;
      }

      // 2. Seamlessly navigate to target screen from popstate state or fallback to home
      const targetScreen = (e.state?.screen as ScreenId) || 'home';
      setActiveScreen(targetScreen);
      localStorage.setItem('bunny_active_screen', targetScreen);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [modalType, lightboxMedia, isLogoutConfirm, activeChat]);

  // Story Viewer Auto-Advance
  useEffect(() => {
    let storyTimer: any;
    if (modalType === 'storyView' && !isStoryPaused) {
      storyTimer = setTimeout(() => {
        setActiveStoryIndex((prev) => {
          if (prev < sparksList.length - 1) {
            return prev + 1;
          } else {
            setModalType('none');
            return 0;
          }
        });
      }, 4500);
    }
    return () => clearTimeout(storyTimer);
  }, [modalType, activeStoryIndex, sparksList.length, isStoryPaused]);

  // Auto-scroll chat to bottom cleanly inside messages container
  useEffect(() => {
    if (activeScreen === 'room') {
      const messagesElem = document.getElementById('messages');
      if (messagesElem) {
        messagesElem.scrollTo({
          top: messagesElem.scrollHeight,
          behavior: 'smooth',
        });
      }
    }
  }, [activeScreen, roomMessages, activeChat, isOtherUserTyping]);

  // Toast Helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  };

  // Screen Navigation with History tracking, Directional Animation & Browser History Push
  const navigateTo = (screen: ScreenId, explicitDir?: 'forward' | 'backward') => {
    if (screen !== activeScreen) {
      playTapSound();
      if (explicitDir) {
        setNavTransitionDir(explicitDir);
      } else {
        const fromIdx = MAIN_NAV_TABS.indexOf(activeScreen);
        const toIdx = MAIN_NAV_TABS.indexOf(screen);
        if (fromIdx !== -1 && toIdx !== -1) {
          setNavTransitionDir(toIdx >= fromIdx ? 'forward' : 'backward');
        } else {
          setNavTransitionDir('forward');
        }
      }
      const updatedHistory = [...history, activeScreen];
      setHistory(updatedHistory);
      setActiveScreen(screen);
      localStorage.setItem('bunny_active_screen', screen);
      localStorage.setItem('bunny_history', JSON.stringify(updatedHistory));
      window.history.pushState({ screen, modal: 'none', chat: activeChat.name }, '', `#${screen}`);
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    }
  };

  // Open Modal with History State Push
  const openModal = (type: ModalType) => {
    playTapSound();
    setModalType(type);
    window.history.pushState({ screen: activeScreen, modal: type, chat: activeChat.name }, '', `#${activeScreen}-${type}`);
  };

  const closeModal = () => {
    playTapSound();
    setModalType('none');
    if (window.history.state?.modal && window.history.state.modal !== 'none') {
      window.history.back();
    }
  };

  // Universal Back Button Action (Fixed: Never randomly jumps to wrong screens)
  const goBack = () => {
    playTapSound();
    setNavTransitionDir('backward');
    if (modalType !== 'none') {
      closeModal();
      return;
    }
    if (lightboxMedia) {
      setLightboxMedia(null);
      return;
    }
    if (isLogoutConfirm) {
      setIsLogoutConfirm(false);
      return;
    }

    // If currently inside a chat room, return directly to origin screen (e.g. Home, Friends, or Discover)
    if (activeScreen === 'room') {
      const returnTarget: ScreenId = chatOriginScreen && chatOriginScreen !== 'room' ? chatOriginScreen : 'home';
      setActiveScreen(returnTarget);
      localStorage.setItem('bunny_active_screen', returnTarget);
      setHistory((prev) => prev.filter((s) => s !== 'room'));
      window.history.pushState({ screen: returnTarget, modal: 'none', chat: activeChat.name }, '', `#${returnTarget}`);
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
      return;
    }

    if (history.length > 0) {
      const prev = history[history.length - 1];
      const nextHistory = history.slice(0, -1);
      setHistory(nextHistory);
      setActiveScreen(prev);
      localStorage.setItem('bunny_active_screen', prev);
      localStorage.setItem('bunny_history', JSON.stringify(nextHistory));
      window.history.pushState({ screen: prev, modal: 'none', chat: activeChat.name }, '', `#${prev}`);
    } else {
      setActiveScreen('home');
      localStorage.setItem('bunny_active_screen', 'home');
      window.history.pushState({ screen: 'home', modal: 'none', chat: activeChat.name }, '', '#home');
    }
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  };

  // Open Chat Room (Fixed: Sets chatOriginScreen, ensures clean slate for new contacts)
  const openChatRoom = (name: string, avatar = '/assets/alex.png', isOnline = true, isGroup = false) => {
    // Record screen origin before entering room
    if (activeScreen !== 'room') {
      setChatOriginScreen(activeScreen);
      localStorage.setItem('bunny_chat_origin', activeScreen);
    }
    setActiveChat({ name, avatar, isOnline, isGroup });
    setIsAttachOpen(false);
    setIsStickersOpen(false);
    setSelectedMessageForAction(null);
    setReplyingToMessage(null);
    setIsChatSearchOpen(false);
    setInChatSearchQuery('');
    
    // For new members or newly added contacts, ensure empty chat transcript
    setRoomMessages((prev) => {
      if (!prev[name]) {
        return { ...prev, [name]: [] };
      }
      return prev;
    });

    // Mark messages in this chat as read & clear unread badges, or add new contact entry
    setChats((prev) => {
      const exists = prev.some((c) => c.name === name);
      if (!exists) {
        const newContact: ChatContact = {
          id: `c-${Date.now()}`,
          name,
          avatar,
          time: 'Just now',
          preview: 'Started new conversation 👋',
          type: 'general',
          isOnline,
          isGroup,
        };
        return [newContact, ...prev];
      }
      return prev.map((c) => (c.name === name ? { ...c, badge: undefined, type: 'general' } : c));
    });

    navigateTo('room');
  };

  // Open Story Viewer Modal
  const openStoryViewer = (index: number) => {
    setActiveStoryIndex(index);
    setStoryReplyInput('');
    setIsStoryPaused(false);
    openModal('storyView');
  };

  // Toggle Like on Spark
  const handleToggleLikeSpark = (sparkId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    playTapSound();
    const isCurrentlyLiked = !!likedSparks[sparkId];
    setLikedSparks((prev) => ({ ...prev, [sparkId]: !isCurrentlyLiked }));
    setSparksList((prev) =>
      prev.map((s) =>
        s.id === sparkId ? { ...s, likes: isCurrentlyLiked ? s.likes - 1 : s.likes + 1 } : s
      )
    );
  };

  // Cycle Interface Theme Preset (All 8 aesthetic styles)
  const handleToggleThemePreset = () => {
    playTapSound();
    const presets: ThemePreset[] = [
      'radiant', 
      'neon', 
      'mint', 
      'ocean', 
      'cyberpunk', 
      'midnight', 
      'lavender', 
      'emerald'
    ];
    const nextIdx = (presets.indexOf(activeTheme) + 1) % presets.length;
    const nextTheme = presets[nextIdx];
    setActiveTheme(nextTheme);
    const themeLabels: Record<ThemePreset, string> = {
      radiant: 'Warm Radiant 🐰',
      neon: 'Neon Violet 🔮',
      mint: 'Mint Nature 🌿',
      ocean: 'Ocean Sunset 🌅',
      cyberpunk: 'Cyberpunk Glow ⚡',
      midnight: 'Midnight Frost 🌙',
      lavender: 'Pastel Lavender 🌸',
      emerald: 'Royal Emerald 💎',
    };
    showToast(`Theme: ${themeLabels[nextTheme]}`);
  };

  // Send Message
  const handleSendMessage = (
    customText?: string, 
    mediaType?: 'image' | 'audio' | 'doc' | 'sticker', 
    mediaUrl?: string,
    mediaName?: string,
    mediaSize?: string,
    audioDuration?: string
  ) => {
    const textToSend = customText !== undefined ? customText : roomInput.trim();
    if (!textToSend && !mediaUrl && !mediaType) return;

    if (notifSound) playMessageSentSound();

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMsg: MessageItem = {
      id: Date.now().toString(),
      sender: 'me',
      text: textToSend,
      time: timeStr,
      mediaType,
      mediaUrl,
      mediaName,
      mediaSize,
      audioDuration,
      replyToText: replyingToMessage ? replyingToMessage.text : undefined,
      isRead: false,
    };

    setRoomMessages((prev) => ({
      ...prev,
      [activeChat.name]: [...(prev[activeChat.name] || []), newMsg],
    }));

    // Update or create chat list entry
    setChats((prev) => {
      const exists = prev.some((c) => c.name === activeChat.name);
      const previewText = mediaType === 'image' 
        ? '📷 Photo' 
        : mediaType === 'audio' 
        ? '🎙️ Voice note' 
        : mediaType === 'doc' 
        ? `📄 ${mediaName || 'File'}` 
        : textToSend;

      if (exists) {
        return prev.map((c) =>
          c.name === activeChat.name
            ? { ...c, preview: `You: ${previewText}`, time: 'Just now' }
            : c
        );
      } else {
        const newContact: ChatContact = {
          id: `c-${Date.now()}`,
          name: activeChat.name,
          avatar: activeChat.avatar,
          time: 'Just now',
          preview: `You: ${previewText}`,
          type: 'general',
          isOnline: activeChat.isOnline,
          isGroup: activeChat.isGroup,
        };
        return [newContact, ...prev];
      }
    });

    if (customText === undefined) {
      setRoomInput('');
    }
    setReplyingToMessage(null);
    setIsAttachOpen(false);
    setIsStickersOpen(false);

    // Simulate realistic incoming reply if chatting with a contact
    if (activeChat.name === 'Liam Chen' || activeChat.name === 'Sophie Park' || activeChat.name === 'Noah Vance' || activeChat.name === 'Product Squad') {
      setTimeout(() => {
        setIsOtherUserTyping(true);
      }, 700);

      setTimeout(() => {
        setIsOtherUserTyping(false);
        if (notifSound) playMessageReceivedSound();

        const repliesMap: Record<string, string[]> = {
          'Liam Chen': [
            'Awesome! The new design feels super snappy ✨',
            'Loving the back button support and smooth transitions 🐰',
            'Looks great! Should we hop on a quick voice call?',
            'Got it! Reviewing the prototype now 🚀',
            'Haha perfect, that feels so much cleaner!',
          ],
          'Sophie Park': [
            'Ooh this radiant theme is so dreamy! 🎨',
            'Just checked on mobile, feels silky smooth!',
            'Let’s test the video calling next 🎥',
            'Thanks Maya, loving the updates!',
          ],
          'Product Squad': [
            'Team: Looks ready for the sprint demo! 🚀',
            'Sophie: Confirmed, demo room is set up at 3pm.',
            'Liam: Checked all animations, 60fps locked!',
          ],
          'Noah Vance': [
            'Haha totally agree! 😂',
            'That bunny logo animation is so cute 🐰',
          ],
        };

        const replies = repliesMap[activeChat.name] || ['Awesome! Got your message ✨', 'Looks great! 🐰'];
        const randomReply = replies[Math.floor(Math.random() * replies.length)];

        setRoomMessages((prev) => {
          const list = prev[activeChat.name] || [];
          // Mark previous message as read
          const updated = list.map((m) => (m.sender === 'me' ? { ...m, isRead: true } : m));
          return {
            ...prev,
            [activeChat.name]: [
              ...updated,
              {
                id: (Date.now() + 1).toString(),
                sender: 'them',
                text: randomReply,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                avatar: activeChat.avatar,
                isRead: true,
              },
            ],
          };
        });
      }, 2100);
    }
  };

  // Image Upload for Chat
  const handleChatPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        handleSendMessage('Sent a photo 📸', 'image', dataUrl, file.name);
      };
      reader.readAsDataURL(file);
    }
    if (e.target) e.target.value = '';
  };

  // Document Upload for Chat
  const handleChatDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeStr = file.size > 1024 * 1024 
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
        : `${Math.round(file.size / 1024)} KB`;
      handleSendMessage(file.name, 'doc', undefined, file.name, sizeStr);
    }
    if (e.target) e.target.value = '';
  };

  // Voice Note Recording
  const startVoiceRecording = async () => {
    playTapSound();
    setIsAttachOpen(false);
    setIsRecording(true);
    setRecordingSeconds(0);

    try {
      recorderRef.current = new VoiceRecorder();
      await recorderRef.current.start();
    } catch {
      // Fallback timer simulation if microphone is blocked
    }

    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    recordingTimerRef.current = window.setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);
  };

  const finishVoiceRecording = async () => {
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    setIsRecording(false);
    const secs = Math.max(1, recordingSeconds);
    const durationStr = formatTimer(secs);

    try {
      if (recorderRef.current && recorderRef.current.isRecording) {
        const result = await recorderRef.current.stop();
        handleSendMessage(`Voice Note (${durationStr}) 🎙️`, 'audio', result.url, undefined, undefined, durationStr);
        return;
      }
    } catch {}

    handleSendMessage(`Voice Note (${durationStr}) 🎙️`, 'audio', undefined, undefined, undefined, durationStr);
  };

  const cancelVoiceRecording = () => {
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    if (recorderRef.current) recorderRef.current.cancel();
    setIsRecording(false);
    setRecordingSeconds(0);
    showToast('Recording cancelled');
  };

  // WhatsApp-style Directional Swipe to Reply Handlers:
  // Incoming message (!isMe): Swipe RIGHT to reply
  // Outgoing message (isMe): Swipe LEFT to reply
  const handleTouchStart = (msgId: string, clientX: number) => {
    swipeStartXRef.current = clientX;
    isSwipingRef.current = true;
    setSwipingMsgId(msgId);
    setSwipeOffset(0);
  };

  const handleTouchMove = (msgId: string, clientX: number, isMe: boolean) => {
    if (!isSwipingRef.current || swipingMsgId !== msgId) return;
    const deltaX = clientX - swipeStartXRef.current;
    
    if (!isMe) {
      // Incoming message: only allow swiping to the RIGHT
      if (deltaX > 4) {
        const clamped = Math.min(75, deltaX * 0.8);
        setSwipeOffset(clamped);
      } else {
        setSwipeOffset(0);
      }
    } else {
      // Outgoing message: only allow swiping to the LEFT
      if (deltaX < -4) {
        const clamped = Math.max(-75, deltaX * 0.8);
        setSwipeOffset(clamped);
      } else {
        setSwipeOffset(0);
      }
    }
  };

  const handleTouchEnd = (msg: MessageItem) => {
    if (!isSwipingRef.current) return;
    isSwipingRef.current = false;
    const isMe = msg.sender === 'me';
    
    // Incoming must be swiped right (>= 35px), Outgoing must be swiped left (<= -35px)
    const isTriggered = (!isMe && swipeOffset >= 35) || (isMe && swipeOffset <= -35);

    if (isTriggered) {
      playTapSound();
      setReplyingToMessage(msg);
      showToast(`Replying to ${isMe ? 'yourself' : activeChat.name} ↩`);
      const inputElem = document.getElementById('messageInput');
      if (inputElem) inputElem.focus();
    }
    setSwipeOffset(0);
    setTimeout(() => {
      setSwipingMsgId(null);
    }, 280);
  };

  // ============================================================
  // GLOBAL NAVIGATION SWIPE HANDLERS (TOUCH & MOUSE DRAG)
  // Right swipe (deltaX > 42): Forward (Chats -> Calls -> Friends -> Discover -> Profile)
  // Left swipe (deltaX < -42): Backward (Profile -> Discover -> Friends -> Calls -> Chats, or Back on sub-screens)
  // ============================================================
  const handleGlobalNavSwipeStart = (clientX: number, clientY: number, target: HTMLElement | null) => {
    // 1. Don't swipe if modal, lightbox, call, or logout confirmation is active
    if (modalType !== 'none' || lightboxMedia !== null || activeCallData !== null || isLogoutConfirm) {
      isNavSwipingRef.current = false;
      return;
    }

    if (!target) {
      isNavSwipingRef.current = false;
      return;
    }

    // 2. Ignore elements that have their own horizontal gestures or inputs
    if (
      target.closest(
        'input, textarea, select, button, .msg-swipe-container, .stories, .stories-compact, .filter-pills, .pills, .feed-tabs, .category-chips, .audio-player-card, .sheet, .lightbox'
      )
    ) {
      isNavSwipingRef.current = false;
      return;
    }

    navSwipeStartXRef.current = clientX;
    navSwipeStartYRef.current = clientY;
    navSwipeStartTimeRef.current = Date.now();
    navSwipeTargetRef.current = target;
    isNavSwipingRef.current = true;
  };

  const handleGlobalNavSwipeEnd = (clientX: number, clientY: number) => {
    if (!isNavSwipingRef.current) return;
    isNavSwipingRef.current = false;

    // If user was highlighting or selecting text, do not navigate
    if (window.getSelection && window.getSelection()?.toString().length) {
      return;
    }

    const deltaX = clientX - navSwipeStartXRef.current;
    const deltaY = clientY - navSwipeStartYRef.current;
    const elapsed = Date.now() - navSwipeStartTimeRef.current;

    // Must be within 800ms gesture window
    if (elapsed > 800) return;

    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    // Dominantly horizontal: at least 42px movement and 1.3x more horizontal than vertical
    if (absX < 42 || absX < absY * 1.3) return;

    // Inside chat room
    if (activeScreen === 'room') {
      // If user swiped on a message container or composer, message swipe handles it
      if (navSwipeTargetRef.current?.closest('.msg-swipe-container, .messages, .composer')) {
        return;
      }
      // Left swipe anywhere on room header or background returns to previous screen
      if (deltaX < -42) {
        goBack();
      }
      return;
    }

    // Sub-screens: groups, channels, sparks, filters -> Left swipe goes back
    const isSubScreen = ['groups', 'channels', 'sparks', 'filters'].includes(activeScreen);
    if (isSubScreen) {
      if (deltaX < -42) {
        goBack();
      }
      return;
    }

    // Main 5 navigation tabs: 'home' -> 'calls' -> 'friends' -> 'discover' -> 'profile'
    const currentIndex = MAIN_NAV_TABS.indexOf(activeScreen);
    if (currentIndex === -1) return;

    // User requirement:
    // Right swipe: chats -> call -> friends -> discover -> profile
    // Left swipe: back through tabs (profile -> discover -> friends -> calls -> chats)
    if (deltaX > 42) {
      if (currentIndex < MAIN_NAV_TABS.length - 1) {
        const nextScreen = MAIN_NAV_TABS[currentIndex + 1];
        navigateTo(nextScreen, 'forward');
      }
    } else if (deltaX < -42) {
      if (currentIndex > 0) {
        const prevScreen = MAIN_NAV_TABS[currentIndex - 1];
        navigateTo(prevScreen, 'backward');
      }
    }
  };

  // Synthesized Voice Note Audio Playback Simulation
  const handleTogglePlayAudio = (msgId: string) => {
    if (playingAudioId === msgId) {
      setPlayingAudioId(null);
      if (audioPlayTimerRef.current) clearTimeout(audioPlayTimerRef.current);
    } else {
      setPlayingAudioId(msgId);
      playTapSound();
      if (audioPlayTimerRef.current) clearTimeout(audioPlayTimerRef.current);
      audioPlayTimerRef.current = window.setTimeout(() => {
        setPlayingAudioId(null);
      }, 5000);
    }
  };

  // Message Reaction Toggle
  const handleToggleReaction = (msgId: string, emoji: string) => {
    playTapSound();
    setRoomMessages((prev) => {
      const chatList = prev[activeChat.name] || [];
      return {
        ...prev,
        [activeChat.name]: chatList.map((m) =>
          m.id === msgId ? { ...m, reaction: m.reaction === emoji ? undefined : emoji } : m
        ),
      };
    });
    setSelectedMessageForAction(null);
  };

  // Message Delete
  const handleDeleteMessage = (msgId: string) => {
    playTapSound();
    setRoomMessages((prev) => ({
      ...prev,
      [activeChat.name]: (prev[activeChat.name] || []).filter((m) => m.id !== msgId),
    }));
    setSelectedMessageForAction(null);
    showToast('Message deleted');
  };

  // Copy Message Text
  const handleCopyMessage = (text: string) => {
    navigator.clipboard?.writeText(text);
    setSelectedMessageForAction(null);
    showToast('Message copied to clipboard 📋');
  };

  // Forward Message
  const handleStartForwardMessage = (text: string) => {
    setForwardingMessageText(text);
    setSelectedMessageForAction(null);
    openModal('forward_message');
  };

  const handleExecuteForward = (targetChatName: string, targetAvatar: string) => {
    if (!forwardingMessageText) return;
    openModal('none');
    openChatRoom(targetChatName, targetAvatar);
    setTimeout(() => {
      handleSendMessage(`Forwarded: ${forwardingMessageText}`);
      showToast(`Forwarded to ${targetChatName} ✓`);
    }, 200);
  };

  // Post Spark
  const handlePostSpark = () => {
    if (!sparkInput.trim() && !sparkImageCustom) {
      showToast('Please type a caption or pick an image!');
      return;
    }
    const newSpark: SparkStory = {
      id: `s-${Date.now()}`,
      user: profileName.split(' ')[0] || 'Maya',
      avatar: profileAvatar,
      image: sparkImageCustom || profileAvatar,
      caption: sparkInput.trim() || 'Just enjoying the moment ✨',
      time: 'Just now',
      likes: 1,
    };
    setSparksList([newSpark, ...sparksList]);
    setSparkInput('');
    setSparkImageCustom(null);
    closeModal();
    showToast('Spark posted to your circle ✨');
  };

  // Handle Spark Image Upload
  const handleSparkFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSparkImageCustom(event.target?.result as string);
        showToast('Image attached to Spark 📸');
      };
      reader.readAsDataURL(file);
    }
    if (e.target) e.target.value = '';
  };

  // Handle Avatar Image Upload
  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setProfileAvatar(dataUrl);
        setCurrentUserProfile((prev) => ({ ...prev, avatar: dataUrl }));
        showToast('Avatar updated ✨');
      };
      reader.readAsDataURL(file);
    }
    if (e.target) e.target.value = '';
  };

  // Create Group
  const handleCreateGroup = () => {
    if (!groupNameInput.trim()) {
      showToast('Please enter a group name');
      return;
    }
    const newGroup: GroupItem = {
      id: `g-${Date.now()}`,
      name: groupNameInput.trim(),
      icon: '💬',
      members: '1 member · Just created',
      tag: 'NEW',
      desc: groupDescInput.trim() || 'A new space on Bunny Talks.',
      isJoined: true,
    };
    setGroupsList([newGroup, ...groupsList]);
    
    // Seed group chat
    setRoomMessages((prev) => ({
      ...prev,
      [newGroup.name]: [
        {
          id: Date.now().toString(),
          sender: 'them',
          text: `Welcome to ${newGroup.name}! Start chatting with your members. 🚀`,
          time: 'Just now',
        },
      ],
    }));

    setChats((prev) => [
      {
        id: `c-grp-${Date.now()}`,
        name: newGroup.name,
        avatar: '',
        time: 'Just now',
        preview: 'Group created 🎉',
        type: 'groups',
        isGroup: true,
        membersCount: 1,
      },
      ...prev,
    ]);

    setGroupNameInput('');
    setGroupDescInput('');
    closeModal();
    showToast(`Group "${newGroup.name}" created 🎉`);
    openChatRoom(newGroup.name, '', true, true);
  };

  // Create Channel
  const handleCreateChannel = () => {
    if (!channelNameInput.trim()) {
      showToast('Please enter a channel name');
      return;
    }
    const newChannel: ChannelItem = {
      id: `ch-${Date.now()}`,
      name: channelNameInput.trim(),
      icon: '📢',
      desc: `1 member · ${channelCategoryInput}`,
      badge: 'NEW',
      isJoined: true,
      category: channelCategoryInput,
    };
    setChannelsList([newChannel, ...channelsList]);
    setChannelNameInput('');
    closeModal();
    showToast(`Channel "${newChannel.name}" created ✨`);
  };

  // Toggle Channel Join
  const handleToggleChannelJoin = (chId: string) => {
    playTapSound();
    setChannelsList((prev) =>
      prev.map((ch) =>
        ch.id === chId ? { ...ch, isJoined: !ch.isJoined } : ch
      )
    );
    const target = channelsList.find((ch) => ch.id === chId);
    showToast(target?.isJoined ? `Left ${target.name}` : `Joined ${target?.name} ✨`);
  };

  // Call System
  const startCall = (type: 'voice' | 'video', targetName?: string, targetAvatar?: string) => {
    playTapSound();
    const name = targetName || activeChat.name;
    const avatar = targetAvatar || activeChat.avatar;
    setActiveCallData({
      type,
      status: 'ringing',
      contactName: name,
      contactAvatar: avatar,
      isIncoming: false,
    });

    // Auto-connect after 2 seconds for a realistic simulation
    setTimeout(() => {
      setActiveCallData((prev) => {
        if (prev && prev.status === 'ringing') {
          return { ...prev, status: 'connected' };
        }
        return prev;
      });
    }, 2000);
  };

  const handleEndCall = (durationSeconds?: number) => {
    const duration = durationSeconds || 0;
    if (activeCallData) {
      const isMissed = duration === 0 && activeCallData.isIncoming;
      const direction = activeCallData.isIncoming ? (isMissed ? 'missed' : 'incoming') : 'outgoing';
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      // 1. WhatsApp-style Call Log Item
      const newLog: CallLogItem = {
        id: `cl-${Date.now()}`,
        contactName: activeCallData.contactName,
        contactAvatar: activeCallData.contactAvatar,
        type: activeCallData.type,
        direction,
        time: nowStr,
        date: 'Today',
        durationSeconds: duration,
        timestamp: Date.now(),
      };
      setCallLogs((prev) => [newLog, ...prev]);

      // 2. Insert call event marker inside chat room conversation
      const durationTag = duration > 0 ? formatTimer(duration) : (isMissed ? 'Missed call' : 'Call ended');
      const callEvMsg: MessageItem = {
        id: `call-ev-${Date.now()}`,
        sender: activeCallData.isIncoming ? 'them' : 'me',
        text: `${activeCallData.type === 'video' ? '📹 Video Call' : '📞 Voice Call'} · ${durationTag}`,
        time: nowStr,
        isRead: true,
      };
      setRoomMessages((prev) => ({
        ...prev,
        [activeCallData.contactName]: [...(prev[activeCallData.contactName] || []), callEvMsg],
      }));
    }
    setActiveCallData(null);
    showToast(duration > 0 ? `Call ended (${formatTimer(duration)})` : 'Call ended');
  };

  const handleClearCallLogs = () => {
    playTapSound();
    setCallLogs([]);
    localStorage.setItem('bunny_call_logs', '[]');
    showToast('Call history cleared 🗑️');
  };

  const handleAcceptCall = () => {
    setActiveCallData((prev) => (prev ? { ...prev, status: 'connected' } : null));
  };

  const handleToggleCallType = (newType: 'voice' | 'video') => {
    setActiveCallData((prev) => (prev ? { ...prev, type: newType } : null));
  };

  const handleSimulateIncomingCall = (type: 'voice' | 'video' = 'video') => {
    playTapSound();
    setActiveCallData({
      type,
      status: 'incoming',
      contactName: 'Liam Chen',
      contactAvatar: '/assets/alex.png',
      contactHandle: '@liam',
      isIncoming: true,
    });
  };

  // Add Friend Handler (Clean Slate: Empty chat conversation guaranteed)
  const handleAddFriend = () => {
    const query = newFriendInput.trim();
    if (!query) {
      showToast('Please enter a username or name');
      return;
    }
    const newFriend = {
      id: `f-${Date.now()}`,
      name: query,
      username: query.toLowerCase().replace(/\s+/g, '_'),
      subtitle: 'New connection · Friend',
      avatar: '/assets/alex.png',
      isOnline: true,
    };
    setAllFriends([newFriend, ...allFriends]);
    
    // Explicitly guarantee 100% empty slate for new member
    setRoomMessages((prev) => ({
      ...prev,
      [query]: [],
    }));

    // Add to chats list with clean preview
    setChats((prev) => [
      {
        id: `c-${Date.now()}`,
        name: query,
        avatar: '/assets/alex.png',
        time: 'Just now',
        preview: 'New member in circle 👋',
        type: 'general',
        isOnline: true,
      },
      ...prev,
    ]);

    setNewFriendInput('');
    closeModal();
    showToast(`Added ${query} as friend ✨`);
  };

  // Login & Logout
  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUserProfile(user);
    setProfileName(user.name);
    setProfileBio(user.bio || `@${user.username} · Active on Bunny 🐰`);
    setProfileAvatar(user.avatar);
    if (user.phone) {
      setPhoneNumber(user.phone);
      setTempPhoneInput(user.phone);
    }
    setIsLoggedIn(true);
    localStorage.setItem('bunny_logged_in', 'true');
    localStorage.setItem('bunny_user_profile', JSON.stringify(user));
    playMessageReceivedSound();
    showToast(`Welcome to Bunny Talks, ${user.name}! 🐰`);
  };

  const handleConfirmLogout = () => {
    playLogoutSound();
    setIsLogoutConfirm(false);
    setIsLoggedIn(false);
    localStorage.setItem('bunny_logged_in', 'false');
    setActiveScreen('home');
    setHistory([]);
    localStorage.setItem('bunny_history', '[]');
    showToast('Logged out successfully. Hop back in anytime! 🐰');
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Filtered Chats
  const filteredChats = useMemo(() => {
    return chats.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(chatSearch.toLowerCase()) ||
        c.preview.toLowerCase().includes(chatSearch.toLowerCase());
      if (!matchesSearch) return false;
      if (chatPill === 'all') return true;
      if (chatPill === 'unread') return c.type === 'unread' || (c.badge && c.badge > 0);
      if (chatPill === 'groups') return c.isGroup || c.type === 'groups';
      if (chatPill === 'channels') return c.type === 'general';
      return true;
    });
  }, [chats, chatSearch, chatPill]);

  // Filtered Friends
  const filteredFriends = useMemo(() => {
    return allFriends.filter((f) => {
      return (
        f.name.toLowerCase().includes(friendSearch.toLowerCase()) ||
        f.subtitle.toLowerCase().includes(friendSearch.toLowerCase())
      );
    });
  }, [allFriends, friendSearch]);

  // Filtered Sparks
  const filteredSparks = useMemo(() => {
    return sparksList.filter((s) => {
      if (sparkPill === 'friends') return ['Liam', 'Sophie', 'Noah'].includes(s.user);
      if (sparkPill === 'communities') return ['Chloe'].includes(s.user);
      return true;
    });
  }, [sparksList, sparkPill]);

  // Filtered New Chat Friends
  const filteredNewChatFriends = useMemo(() => {
    return allFriends.filter((f) => {
      return f.name.toLowerCase().includes(newChatSearch.toLowerCase());
    });
  }, [allFriends, newChatSearch]);

  // Discover Screen Filtered Items
  const discoverFilteredChannels = useMemo(() => {
    if (!discoverSearch.trim()) return channelsList;
    const q = discoverSearch.toLowerCase();
    return channelsList.filter((ch) => ch.name.toLowerCase().includes(q) || ch.desc.toLowerCase().includes(q));
  }, [channelsList, discoverSearch]);

  const discoverFilteredGroups = useMemo(() => {
    if (!discoverSearch.trim()) return groupsList;
    const q = discoverSearch.toLowerCase();
    return groupsList.filter(
      (g) => g.name.toLowerCase().includes(q) || (g.tag && g.tag.toLowerCase().includes(q)) || (g.desc && g.desc.toLowerCase().includes(q))
    );
  }, [groupsList, discoverSearch]);

  const discoverFilteredPeople = useMemo(() => {
    if (!discoverSearch.trim()) return allFriends;
    const q = discoverSearch.toLowerCase();
    return allFriends.filter(
      (f) => f.name.toLowerCase().includes(q) || (f.username && f.username.toLowerCase().includes(q)) || f.subtitle.toLowerCase().includes(q)
    );
  }, [allFriends, discoverSearch]);

  const unreadNotifsCount = notifications.filter((n) => n.unread).length;
  const currentMessages = roomMessages[activeChat.name] || [];
  const displayedMessages = inChatSearchQuery.trim()
    ? currentMessages.filter((m) => m.text.toLowerCase().includes(inChatSearchQuery.toLowerCase()))
    : currentMessages;
  const activeStoryItem = sparksList[activeStoryIndex] || sparksList[0];

  // If user is logged out, render the modern mobile login screen
  if (!isLoggedIn) {
    return (
      <MobileDeviceWrapper
        isDark={isDark}
        onToggleTheme={() => setIsDark((prev) => !prev)}
        onSimulateIncomingCall={() => handleSimulateIncomingCall('video')}
      >
        <MobileAuthScreen onLogin={handleLoginSuccess} />
        <EnhancedCallModal
          callData={activeCallData}
          currentUserAvatar={profileAvatar}
          currentUserName={profileName}
          onEndCall={handleEndCall}
          onAcceptCall={handleAcceptCall}
          onToggleCallType={handleToggleCallType}
        />
        <div className={`toast ${toastMessage ? 'show' : ''}`} id="toast">
          {toastMessage}
        </div>
      </MobileDeviceWrapper>
    );
  }

  return (
    <MobileDeviceWrapper
      isDark={isDark}
      onToggleTheme={() => setIsDark((prev) => !prev)}
      onSimulateIncomingCall={() => handleSimulateIncomingCall('video')}
    >
      <div 
        className={`app ${activeTheme}`}
        onTouchStart={(e) => {
          if (e.touches && e.touches.length > 0) {
            handleGlobalNavSwipeStart(e.touches[0].clientX, e.touches[0].clientY, e.target as HTMLElement);
          }
        }}
        onTouchEnd={(e) => {
          if (e.changedTouches && e.changedTouches.length > 0) {
            handleGlobalNavSwipeEnd(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
          }
        }}
        onMouseDown={(e) => {
          if (e.button === 0) {
            handleGlobalNavSwipeStart(e.clientX, e.clientY, e.target as HTMLElement);
          }
        }}
        onMouseUp={(e) => {
          if (e.button === 0) {
            handleGlobalNavSwipeEnd(e.clientX, e.clientY);
          }
        }}
      >
        {/* Hidden File Inputs */}
        <input
          type="file"
          ref={chatPhotoInputRef}
          onChange={handleChatPhotoUpload}
          style={{ display: 'none' }}
          accept="image/*"
        />
        <input
          type="file"
          ref={chatDocInputRef}
          onChange={handleChatDocUpload}
          style={{ display: 'none' }}
          accept=".pdf,.doc,.docx,.txt,.zip"
        />
        <input
          type="file"
          ref={sparkFileInputRef}
          onChange={handleSparkFileUpload}
          style={{ display: 'none' }}
          accept="image/*"
        />
        <input
          type="file"
          ref={profileFileInputRef}
          onChange={handleAvatarFileUpload}
          style={{ display: 'none' }}
          accept="image/*"
        />

        {/* 1. TOP BRAND HEADER - Shown on Root HOME Screen */}
        {activeScreen === 'home' && (
          <header className="top select-none">
            <div className="brand" onClick={() => navigateTo('home')}>
              <img src="/assets/bunny-icon.png" alt="Bunny Talks Logo" className="shadow-sm" />
              <span className="tracking-tight">Bunny Talks</span>
            </div>
            <div className="top-actions">
              <button 
                className="icon notif-badge-container" 
                onClick={() => openModal('notifications_feed')}
                title="Notifications"
              >
                <Bell className="w-4 h-4 text-bunny-ink" />
                {unreadNotifsCount > 0 && <span className="notif-dot animate-pulse" />}
              </button>
              <button 
                className="icon" 
                onClick={() => navigateTo('profile')}
                title="My Profile"
              >
                <User className="w-4 h-4 text-bunny-ink" />
              </button>
            </div>
          </header>
        )}

        {/* 2. UNIVERSAL SUB-SCREEN HEADER WITH PROMINENT BACK BUTTON */}
        {['calls', 'friends', 'discover', 'profile', 'sparks', 'groups', 'channels', 'filters'].includes(activeScreen) && (
          <div className="subhead select-none">
            <div className="subhead-left">
              <button className="back-btn" onClick={goBack} title="Back">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <h2>
                {activeScreen === 'calls' && 'Voice & Video Calls'}
                {activeScreen === 'friends' && 'Friends & Network'}
                {activeScreen === 'discover' && 'Discover Communities'}
                {activeScreen === 'profile' && 'My Profile'}
                {activeScreen === 'sparks' && 'Active Sparks'}
                {activeScreen === 'groups' && 'Groups & Communities'}
                {activeScreen === 'channels' && 'Channels & Topics'}
                {activeScreen === 'filters' && 'Chat Feed Filters'}
              </h2>
            </div>
            <div>
              {activeScreen === 'friends' && (
                <button 
                  className="btn primary" 
                  onClick={() => openModal('add_friend')}
                >
                  <Plus className="w-3.5 h-3.5 inline mr-1" /> Add
                </button>
              )}
              {activeScreen === 'discover' && (
                <button 
                  className="icon" 
                  onClick={() => navigateTo('filters')} 
                  title="Feed Filters"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                </button>
              )}
              {activeScreen === 'profile' && (
                <button 
                  className="icon" 
                  onClick={() => setIsDark((prev) => !prev)} 
                  title="Toggle Dark Mode"
                >
                  {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
                </button>
              )}
              {activeScreen === 'sparks' && (
                <button className="btn primary" onClick={() => openModal('spark')}>
                  <Plus className="w-3.5 h-3.5 inline mr-1" /> Post
                </button>
              )}
              {activeScreen === 'groups' && (
                <button className="btn primary" onClick={() => openModal('group')}>
                  <Plus className="w-3.5 h-3.5 inline mr-1" /> Create
                </button>
              )}
              {activeScreen === 'channels' && (
                <button className="btn primary" onClick={() => openModal('channel')}>
                  <Plus className="w-3.5 h-3.5 inline mr-1" /> New
                </button>
              )}
              {activeScreen === 'filters' && (
                <button className="btn primary" onClick={() => { showToast('Filters saved'); goBack(); }}>
                  Save
                </button>
              )}
            </div>
          </div>
        )}

        {/* 3. SCREEN CONTENTS */}
        <div 
          key={activeScreen} 
          className={`screen-transition-container screen-slide-${navTransitionDir}`}
        >
          {/* ====== SCREEN 1: CHATS (HOME) ====== */}
          {activeScreen === 'home' && (() => {
          const hr = new Date().getHours();
          const greetingText = hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening';
          const greetingEmoji = hr < 12 ? '☀️' : hr < 17 ? '🌤️' : '🌙';
          const unreadChats = chats.filter(c => (c.badge && c.badge > 0) || c.type === 'unread');
          const unreadCount = unreadChats.length;

          return (
            <main className="content">
              {/* 1. TOP FIXED SEARCH & ACTION BAR */}
              <div className="home-search-row">
                <div className="search home-search-input">
                  <Search className="w-4 h-4 text-bunny-muted shrink-0" />
                  <input
                    id="search"
                    placeholder="Search chats, messages, friends..."
                    value={chatSearch}
                    onChange={(e) => setChatSearch(e.target.value)}
                  />
                  {chatSearch && (
                    <button 
                      onClick={() => setChatSearch('')} 
                      className="clear-search-btn"
                      title="Clear search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <button 
                  className="home-new-chat-btn" 
                  onClick={() => openModal('new_chat')} 
                  title="Start New Chat"
                >
                  <Plus className="w-5 h-5 stroke-[2.5]" />
                </button>
              </div>

              {/* 2. REFINED MODERN GREETING CARD */}
              <div className="greeting-card">
                <div className="greeting-card-left">
                  <div className="greeting-status-badge">
                    <span className="greeting-status-dot" />
                    <span>Circle Active · 4 Online</span>
                  </div>
                  <h1 className="greeting-title">
                    {greetingText}, {profileName.split(' ')[0]} {greetingEmoji}
                  </h1>
                  <p className="greeting-subtitle">
                    {unreadCount > 0 ? `${unreadCount} unread conversation${unreadCount > 1 ? 's' : ''} waiting` : 'All caught up with your circle!'}
                  </p>
                </div>
                <div 
                  className="greeting-avatar-wrap" 
                  onClick={() => navigateTo('profile')} 
                  title="View Profile"
                >
                  <img 
                    className="greeting-avatar" 
                    src={profileAvatar} 
                    alt={profileName} 
                  />
                  <span className="greeting-online-indicator" />
                </div>
              </div>

              {/* 3. FILTER PILLS */}
              <div className="pills">
                <button
                  className={`pill ${chatPill === 'all' ? 'active' : ''}`}
                  onClick={() => setChatPill('all')}
                >
                  All
                </button>
                <button
                  className={`pill ${chatPill === 'unread' ? 'active' : ''}`}
                  onClick={() => setChatPill('unread')}
                >
                  Unread {unreadCount > 0 && <b>{unreadCount}</b>}
                </button>
                <button
                  className={`pill ${chatPill === 'groups' ? 'active' : ''}`}
                  onClick={() => setChatPill('groups')}
                >
                  Groups
                </button>
                <button
                  className={`pill ${chatPill === 'channels' ? 'active' : ''}`}
                  onClick={() => setChatPill('channels')}
                >
                  Channels
                </button>
              </div>

              {/* 4. CONVERSATIONS SECTION */}
              <div className="section">
                <h2>Conversations</h2>
                <button 
                  className="section-action-btn" 
                  onClick={() => navigateTo('friends')}
                >
                  <UsersRound className="w-3.5 h-3.5" />
                  <span>Friends ({allFriends.length})</span>
                </button>
              </div>

            <div id="chatList">
              {filteredChats.length > 0 ? (
                filteredChats.map((chat) => (
                  <div
                    key={chat.id}
                    className="chat"
                    data-type={chat.type}
                    onClick={() => openChatRoom(chat.name, chat.avatar || '/assets/alex.png', chat.isOnline, chat.isGroup)}
                  >
                    {chat.isGroup ? (
                      <div 
                        className="avatar" 
                        style={{ 
                          display: 'grid', 
                          placeItems: 'center', 
                          background: 'linear-gradient(135deg, #eee8ff, #f9f5ff)', 
                          color: '#7b5cf5'
                        }}
                      >
                        <UsersRound className="w-5 h-5" />
                      </div>
                    ) : (
                      <div className={chat.isOnline ? 'online' : ''}>
                        <img className="avatar" src={chat.avatar} alt={chat.name} />
                      </div>
                    )}

                    <div className="chat-main">
                      <div className="chat-top">
                        <span className="chat-name">{chat.name}</span>
                        <span className="time">{chat.time}</span>
                      </div>
                      <div className="preview">{chat.preview}</div>
                    </div>

                    {chat.badge && <div className="badge">{chat.badge}</div>}
                  </div>
                ))
              ) : (
                chatPill === 'unread' ? (
                  <div className="empty" style={{ padding: '36px 16px' }}>
                    <div style={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      background: 'rgba(34, 197, 94, 0.12)',
                      color: '#16a34a',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 12px'
                    }}>
                      <Check className="w-6 h-6 stroke-[2.5]" />
                    </div>
                    <b style={{ fontSize: 15, display: 'block', marginBottom: 4 }}>All caught up!</b>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      No unread conversations right now.
                    </span>
                  </div>
                ) : chatSearch ? (
                  <div className="empty">
                    No conversations found matching "{chatSearch}"
                    <br />
                    <button 
                      className="btn primary" 
                      style={{ marginTop: 12 }} 
                      onClick={() => setChatSearch('')}
                    >
                      Clear search
                    </button>
                  </div>
                ) : (
                  <div className="empty">
                    No conversations in this section.
                    <br />
                    <button 
                      className="btn primary" 
                      style={{ marginTop: 12 }} 
                      onClick={() => openModal('new_chat')}
                    >
                      Start a new conversation
                    </button>
                  </div>
                )
              )}
            </div>
          </main>
        );
      })()}

        {/* ====== SCREEN: CALLS & CALL HISTORY (WHATSAPP-STYLE) ====== */}
        {activeScreen === 'calls' && (() => {
          const filteredCallLogs = callLogs.filter((log) => {
            if (callsFilter === 'missed') return log.direction === 'missed';
            return true;
          });

          return (
            <main className="content">
              {/* Top Filter Tabs: All vs Missed */}
              <div className="pills" style={{ marginBottom: 12 }}>
                <button
                  className={`pill ${callsFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setCallsFilter('all')}
                >
                  All Calls ({callLogs.length})
                </button>
                <button
                  className={`pill ${callsFilter === 'missed' ? 'active' : ''}`}
                  onClick={() => setCallsFilter('missed')}
                >
                  Missed ({callLogs.filter((c) => c.direction === 'missed').length})
                </button>
              </div>

              {/* Encryption Banner */}
              <div 
                className="card" 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 10, 
                  padding: '10px 14px', 
                  marginBottom: 14, 
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(6, 182, 212, 0.06))',
                  borderColor: 'rgba(16, 185, 129, 0.2)'
                }}
              >
                <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                <span style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.4 }}>
                  Your audio and video calls are <b>end-to-end encrypted</b> with low latency Opus audio &amp; HD WebRTC.
                </span>
              </div>

              <div className="section">
                <h2>Recent Calls</h2>
              </div>

              <div className="call-log-list">
                {filteredCallLogs.length > 0 ? (
                  filteredCallLogs.map((log) => {
                    const isMissed = log.direction === 'missed';
                    const isIncoming = log.direction === 'incoming';

                    return (
                      <div 
                        key={log.id} 
                        className="call-log-item"
                        onClick={() => openChatRoom(log.contactName, log.contactAvatar)}
                      >
                        <div className="call-avatar-box">
                          <img src={log.contactAvatar || '/assets/alex.png'} alt={log.contactName} />
                          <div 
                            className="call-type-badge" 
                            style={{ 
                              background: log.type === 'video' ? '#ffe4e6' : '#dcfce7', 
                              color: log.type === 'video' ? '#f43f5e' : '#10b981' 
                            }}
                          >
                            {log.type === 'video' ? <Video className="w-2.5 h-2.5" /> : <Phone className="w-2.5 h-2.5" />}
                          </div>
                        </div>

                        <div className="call-main">
                          <div className="call-name-row">
                            <span className={`call-name ${isMissed ? 'missed' : ''}`}>
                              {log.contactName}
                            </span>
                            <span style={{ fontSize: 10, color: 'var(--muted)' }}>{log.time}</span>
                          </div>
                          <div className="call-details">
                            {isMissed && (
                              <>
                                <PhoneMissed className="call-direction-icon missed" />
                                <span className="text-red-500 font-semibold">Missed call</span>
                              </>
                            )}
                            {isIncoming && (
                              <>
                                <PhoneIncoming className="call-direction-icon incoming" />
                                <span>Incoming</span>
                              </>
                            )}
                            {!isMissed && !isIncoming && (
                              <>
                                <PhoneOutgoing className="call-direction-icon outgoing" />
                                <span>Outgoing</span>
                              </>
                            )}
                            {log.durationSeconds > 0 && (
                              <span className="call-duration-tag">
                                {formatTimer(log.durationSeconds)}
                              </span>
                            )}
                            <span style={{ opacity: 0.6 }}>· {log.date}</span>
                          </div>
                        </div>

                        <div className="call-action-btns" onClick={(e) => e.stopPropagation()}>
                          <button
                            className="call-action-btn"
                            onClick={() => startCall('voice', log.contactName, log.contactAvatar)}
                            title={`Voice call ${log.contactName}`}
                          >
                            <Phone className="w-3.5 h-3.5 text-emerald-500" />
                          </button>
                          <button
                            className="call-action-btn"
                            onClick={() => startCall('video', log.contactName, log.contactAvatar)}
                            title={`Video call ${log.contactName}`}
                          >
                            <Video className="w-3.5 h-3.5 text-[#ff607d]" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="empty-chat-slate" style={{ padding: '24px 16px' }}>
                    <Phone className="w-8 h-8 text-bunny-muted mb-2" />
                    <h3 className="empty-chat-title" style={{ fontSize: 15 }}>No calls in this tab</h3>
                    <p className="empty-chat-subtitle">
                      {callsFilter === 'missed' 
                        ? 'No missed calls! All calls were answered.' 
                        : 'Start a crystal-clear voice or video call with any contact.'}
                    </p>
                    <button 
                      className="btn primary" 
                      onClick={() => navigateTo('friends')}
                    >
                      Pick a friend to call
                    </button>
                  </div>
                )}
              </div>
            </main>
          );
        })()}

        {/* ====== SCREEN 2: FRIENDS & NETWORK ====== */}
        {activeScreen === 'friends' && (
          <main className="content">
            <div className="search">
              <Search className="w-4 h-4 text-bunny-muted" />
              <input 
                placeholder="Search friends by name or bio..." 
                value={friendSearch}
                onChange={(e) => setFriendSearch(e.target.value)}
              />
            </div>

            {/* Friend Requests */}
            <div className="section">
              <h2>Friend Requests</h2>
              <span className="tag">{friendRequests.length} PENDING</span>
            </div>

            {friendRequests.length > 0 ? (
              friendRequests.map((req) => (
                <div key={req.id} className="listrow">
                  <img className="avatar" src={req.avatar} alt={req.name} />
                  <div className="grow">
                    <b>{req.name}</b>
                    <small>{req.subtitle}</small>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button 
                      className="btn light"
                      style={{ padding: '8px 10px' }}
                      onClick={() => {
                        setFriendRequests((prev) => prev.filter((r) => r.id !== req.id));
                        showToast('Request declined');
                      }}
                    >
                      Decline
                    </button>
                    <button 
                      className="btn primary" 
                      style={{ padding: '8px 12px' }}
                      onClick={() => {
                        setFriendRequests((prev) => prev.filter((r) => r.id !== req.id));
                        setAllFriends((prev: any[]) => [
                          { id: req.id, name: req.name, username: req.username || 'friend', subtitle: 'Active now', avatar: req.avatar, isOnline: true },
                          ...prev,
                        ]);
                        // Empty slate for new conversation
                        setRoomMessages((prev) => ({
                          ...prev,
                          [req.name]: [],
                        }));
                        // Add to conversations
                        setChats((prev) => [
                          {
                            id: `c-${Date.now()}`,
                            name: req.name,
                            avatar: req.avatar,
                            time: 'Just now',
                            preview: 'Connected on Bunny Talks! Say hi 👋',
                            type: 'general',
                            isOnline: true,
                          },
                          ...prev,
                        ]);
                        showToast(`${req.name} added to your circle ✨`);
                      }}
                    >
                      Accept
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty" style={{ padding: '12px 0' }}>All friend requests caught up!</div>
            )}

            {/* All Friends List */}
            <div className="section">
              <h2>All Friends ({allFriends.length})</h2>
              <button 
                className="btn light" 
                style={{ padding: '4px 10px', fontSize: 11 }}
                onClick={() => {
                  navigator.clipboard?.writeText('https://bunnytalks.app/invite/maya');
                  showToast('Invite link copied: https://bunnytalks.app/invite/maya 📋✨');
                }}
              >
                <Share2 className="w-3.5 h-3.5 inline mr-1" /> Share Invite
              </button>
            </div>

            {filteredFriends.map((f) => (
              <div key={f.id} className="listrow">
                <div className={f.isOnline ? 'online' : ''}>
                  <img className="avatar" src={f.avatar} alt={f.name} />
                </div>
                <div className="grow">
                  <b>{f.name}</b>
                  <small>{f.subtitle}</small>
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <button 
                    className="icon"
                    style={{ width: 34, height: 34, borderRadius: 12 }}
                    onClick={() => startCall('voice', f.name, f.avatar)}
                    title="Voice Call"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-500" />
                  </button>
                  <button 
                    className="icon"
                    style={{ width: 34, height: 34, borderRadius: 12 }}
                    onClick={() => startCall('video', f.name, f.avatar)}
                    title="Video Call"
                  >
                    <Video className="w-3.5 h-3.5 text-[#ff607d]" />
                  </button>
                  <button 
                    className="btn light" 
                    style={{ padding: '7px 12px' }}
                    onClick={() => openChatRoom(f.name, f.avatar, f.isOnline)}
                  >
                    Chat
                  </button>
                </div>
              </div>
            ))}
          </main>
        )}

        {/* ====== SCREEN 3: DISCOVER ====== */}
        {activeScreen === 'discover' && (
          <main className="content">
            <div className="search">
              <Search className="w-4 h-4 text-bunny-muted" />
              <input 
                placeholder="Discover communities, people, topics..." 
                value={discoverSearch}
                onChange={(e) => setDiscoverSearch(e.target.value)}
              />
            </div>

            <div className="tabs">
              <button 
                className={discoverTab === 'all' ? 'on' : ''} 
                onClick={() => setDiscoverTab('all')}
              >
                All
              </button>
              <button 
                className={discoverTab === 'people' ? 'on' : ''} 
                onClick={() => setDiscoverTab('people')}
              >
                People
              </button>
              <button 
                className={discoverTab === 'groups' ? 'on' : ''} 
                onClick={() => setDiscoverTab('groups')}
              >
                Groups
              </button>
              <button 
                className={discoverTab === 'channels' ? 'on' : ''} 
                onClick={() => setDiscoverTab('channels')}
              >
                Channels
              </button>
            </div>

            {/* TAB 1: ALL DISCOVER OVERVIEW */}
            {discoverTab === 'all' && (
              <>
                {/* COMPACT ACTIVE SPARKS IN DISCOVER */}
                <div className="compact-sparks-section" style={{ margin: '8px 0 16px' }}>
                  <div className="compact-sparks-header">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-bunny-coral" />
                      <h2 className="compact-sparks-title">Active Sparks</h2>
                    </div>
                    <button 
                      className="section-action-btn" 
                      onClick={() => navigateTo('sparks')}
                    >
                      <span>View All ({sparksList.length})</span>
                    </button>
                  </div>

                  <div className="stories-compact">
                    <div className="story-compact plus" onClick={() => openModal('spark')} title="Post a Spark">
                      <div className="story-compact-ring">
                        <Plus className="w-4 h-4 text-white stroke-[3]" />
                      </div>
                      <span>New</span>
                    </div>
                    {sparksList.map((spark, idx) => (
                      <div 
                        key={spark.id} 
                        className="story-compact" 
                        onClick={() => openStoryViewer(idx)}
                        title={`View ${spark.user}'s Spark`}
                      >
                        <div className="story-compact-ring">
                          <img src={spark.avatar} alt={spark.user} />
                        </div>
                        <span>{spark.user}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Live Hangouts Banner */}
                <div className="discover-banner">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#ff607d]/20 text-[#ff607d] text-[10px] font-extrabold mb-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff607d] animate-ping" />
                    <span>LIVE NOW</span>
                  </div>
                  <b>Live hangouts are happening now 🎧</b>
                  <p>Join an active audio room, discuss prototypes, and meet creative people.</p>
                  <button className="btn primary" onClick={() => openModal('liveRoom')}>
                    <Headphones className="w-3.5 h-3.5 inline mr-1.5" /> Join Live Stage
                  </button>
                </div>

                {/* Discover People Section */}
                <div className="section">
                  <h2>People to Connect</h2>
                  <button 
                    className="section-action-btn" 
                    onClick={() => setDiscoverTab('people')}
                  >
                    <span>See All</span>
                  </button>
                </div>

                <div className="card">
                  {discoverFilteredPeople.slice(0, 3).map((f) => (
                    <div 
                      key={f.id} 
                      className="listrow" 
                      onClick={() => openChatRoom(f.name, f.avatar, f.isOnline)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className={f.isOnline ? 'online' : ''}>
                        <img className="avatar" src={f.avatar} alt={f.name} />
                      </div>
                      <div className="grow">
                        <b>{f.name}</b>
                        <small>{f.subtitle}</small>
                      </div>
                      <button 
                        className="btn light"
                        onClick={(e) => {
                          e.stopPropagation();
                          openChatRoom(f.name, f.avatar, f.isOnline);
                        }}
                      >
                        Chat
                      </button>
                    </div>
                  ))}
                </div>

                {/* Trending Channels */}
                <div className="section">
                  <h2>Trending Channels</h2>
                  <button 
                    className="section-action-btn" 
                    onClick={() => setDiscoverTab('channels')}
                  >
                    <span>See All</span>
                  </button>
                </div>

                <div className="card">
                  {discoverFilteredChannels.slice(0, 3).map((ch) => (
                    <div 
                      key={ch.id} 
                      className="listrow"
                      onClick={() => openChatRoom(ch.name, '/assets/alex.png', true, true)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="channel-icon">{ch.icon}</div>
                      <div className="grow">
                        <b>{ch.name}</b>
                        <small>{ch.desc}</small>
                      </div>
                      {ch.isJoined ? (
                        <span className="tag" style={{ background: '#eafbf4', color: '#16a34a' }}>JOINED</span>
                      ) : (
                        <button 
                          className="btn light" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleChannelJoin(ch.id);
                          }}
                        >
                          Join
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Popular Communities */}
                <div className="section">
                  <h2>Popular Communities</h2>
                  <button 
                    className="section-action-btn" 
                    onClick={() => setDiscoverTab('groups')}
                  >
                    <span>See All</span>
                  </button>
                </div>

                <div className="card">
                  {discoverFilteredGroups.slice(0, 3).map((g) => (
                    <div 
                      key={g.id} 
                      className="listrow" 
                      onClick={() => openChatRoom(g.name, '/assets/maya.png', true, true)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="channel-icon">{g.icon}</div>
                      <div className="grow">
                        <b>{g.name}</b>
                        <small>{g.members}</small>
                      </div>
                      <span className="tag">{g.tag}</span>
                    </div>
                  ))}
                </div>

                {/* Featured Sparks */}
                <div className="section">
                  <h2>Featured Sparks</h2>
                  <button 
                    className="section-action-btn" 
                    onClick={() => navigateTo('sparks')}
                  >
                    <span>See All</span>
                  </button>
                </div>

                <div className="spark-grid">
                  {sparksList.slice(0, 2).map((spark, idx) => (
                    <div 
                      key={spark.id} 
                      className="spark" 
                      onClick={() => openStoryViewer(idx)}
                    >
                      <button 
                        className={`spark-heart-btn ${likedSparks[spark.id] ? 'liked' : ''}`}
                        onClick={(e) => handleToggleLikeSpark(spark.id, e)}
                      >
                        ❤️ {spark.likes}
                      </button>
                      <img src={spark.image} alt={spark.caption} />
                      <div className="cap">{spark.caption}</div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* TAB 2: PEOPLE DISCOVERY */}
            {discoverTab === 'people' && (
              <div style={{ marginTop: 8 }}>
                <div className="section">
                  <h2>People &amp; Creators ({discoverFilteredPeople.length})</h2>
                  <button 
                    className="section-action-btn" 
                    onClick={() => openModal('add_friend')}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Friend</span>
                  </button>
                </div>

                <div className="card">
                  {discoverFilteredPeople.length > 0 ? (
                    discoverFilteredPeople.map((f) => (
                      <div 
                        key={f.id} 
                        className="listrow" 
                        onClick={() => openChatRoom(f.name, f.avatar, f.isOnline)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className={f.isOnline ? 'online' : ''}>
                          <img className="avatar" src={f.avatar} alt={f.name} />
                        </div>
                        <div className="grow">
                          <b>{f.name}</b>
                          <small>{f.subtitle}</small>
                        </div>
                        <button 
                          className="btn light"
                          onClick={(e) => {
                            e.stopPropagation();
                            openChatRoom(f.name, f.avatar, f.isOnline);
                          }}
                        >
                          Chat
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="empty">No people found matching "{discoverSearch}"</div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: GROUPS DISCOVERY */}
            {discoverTab === 'groups' && (
              <div style={{ marginTop: 8 }}>
                <div className="section">
                  <h2>Public Communities ({discoverFilteredGroups.length})</h2>
                  <button 
                    className="section-action-btn" 
                    onClick={() => openModal('group')}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Group</span>
                  </button>
                </div>

                <div className="card">
                  {discoverFilteredGroups.length > 0 ? (
                    discoverFilteredGroups.map((g) => (
                      <div 
                        key={g.id} 
                        className="listrow" 
                        onClick={() => openChatRoom(g.name, '/assets/maya.png', true, true)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="channel-icon">{g.icon}</div>
                        <div className="grow">
                          <b>{g.name}</b>
                          <small>{g.members}</small>
                        </div>
                        <span className="tag">{g.tag}</span>
                      </div>
                    ))
                  ) : (
                    <div className="empty">No communities found matching "{discoverSearch}"</div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: CHANNELS DISCOVERY */}
            {discoverTab === 'channels' && (
              <div style={{ marginTop: 8 }}>
                <div className="section">
                  <h2>Channels &amp; Broadcasts ({discoverFilteredChannels.length})</h2>
                  <button 
                    className="section-action-btn" 
                    onClick={() => openModal('channel')}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Channel</span>
                  </button>
                </div>

                <div className="card">
                  {discoverFilteredChannels.length > 0 ? (
                    discoverFilteredChannels.map((ch) => (
                      <div 
                        key={ch.id} 
                        className="listrow"
                        onClick={() => openChatRoom(ch.name, '/assets/alex.png', true, true)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="channel-icon">{ch.icon}</div>
                        <div className="grow">
                          <b>{ch.name}</b>
                          <small>{ch.desc}</small>
                        </div>
                        {ch.isJoined ? (
                          <span className="tag" style={{ background: '#eafbf4', color: '#16a34a' }}>JOINED</span>
                        ) : (
                          <button 
                            className="btn light" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleChannelJoin(ch.id);
                            }}
                          >
                            Join
                          </button>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="empty">No channels found matching "{discoverSearch}"</div>
                  )}
                </div>
              </div>
            )}
          </main>
        )}

        {/* ====== SCREEN 4: PROFILE ====== */}
        {activeScreen === 'profile' && (
          <main className="content">
            <div className="profile-head">
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <img className="big-avatar" src={profileAvatar} alt={profileName} />
                <button
                  onClick={() => profileFileInputRef.current?.click()}
                  title="Change Photo"
                  style={{
                    position: 'absolute',
                    bottom: 2,
                    right: 2,
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: 'var(--coral)',
                    color: '#fff',
                    border: '2px solid #fff',
                    display: 'grid',
                    placeItems: 'center',
                    cursor: 'pointer',
                    fontSize: 12,
                  }}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                </button>
              </div>
              <h2 style={{ margin: '10px 0 3px', fontWeight: 800 }}>{profileName}</h2>
              <p className="muted" style={{ margin: 0, fontSize: 12 }}>{profileBio}</p>
              <button 
                className="btn primary" 
                style={{ marginTop: 12 }} 
                onClick={() => openModal('profile')}
              >
                Edit Profile
              </button>
            </div>

            {/* Stats Bar */}
            <div className="stats">
              <div className="stat" onClick={() => navigateTo('friends')} style={{ cursor: 'pointer' }}>
                <b>{240 + allFriends.length}</b>
                <span>Friends</span>
              </div>
              <div className="stat" onClick={() => navigateTo('sparks')} style={{ cursor: 'pointer' }}>
                <b>{35 + sparksList.length}</b>
                <span>Sparks</span>
              </div>
              <div className="stat" onClick={() => navigateTo('channels')} style={{ cursor: 'pointer' }}>
                <b>{channelsList.length}</b>
                <span>Channels</span>
              </div>
            </div>

            {/* Settings List */}
            <div className="card">
              <div className="setting" onClick={() => openModal('account')}>
                <div className="sicon"><Lock className="w-4 h-4" /></div>
                <span>Account &amp; Security</span>
                <ChevronRight className="w-4 h-4 text-bunny-muted" />
              </div>
              <div className="setting" onClick={() => openModal('notifications')}>
                <div className="sicon"><Bell className="w-4 h-4" /></div>
                <span>Notifications &amp; Sounds</span>
                <ChevronRight className="w-4 h-4 text-bunny-muted" />
              </div>
              <div className="setting" onClick={() => openModal('privacy')}>
                <div className="sicon"><Shield className="w-4 h-4" /></div>
                <span>Privacy &amp; Safety</span>
                <ChevronRight className="w-4 h-4 text-bunny-muted" />
              </div>
              <div className="setting" onClick={() => setIsDark((prev) => !prev)}>
                <div className="sicon">
                  {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
                </div>
                <span>Dark Mode</span>
                <div className={`switch ${isDark ? 'on' : ''}`}>
                  <i />
                </div>
              </div>
              <div className="setting" onClick={() => openModal('theme_picker')}>
                <div className="sicon"><Palette className="w-4 h-4 text-pink-500" /></div>
                <span>Interface Theme</span>
                <span className="muted text-xs font-bold" style={{ textAlign: 'right', marginRight: 4 }}>
                  {activeTheme === 'radiant' && 'Radiant 🐰'}
                  {activeTheme === 'neon' && 'Neon 🔮'}
                  {activeTheme === 'mint' && 'Mint 🌿'}
                  {activeTheme === 'ocean' && 'Ocean 🌅'}
                  {activeTheme === 'cyberpunk' && 'Cyberpunk ⚡'}
                  {activeTheme === 'midnight' && 'Midnight 🌙'}
                  {activeTheme === 'lavender' && 'Lavender 🌸'}
                  {activeTheme === 'emerald' && 'Emerald 💎'}
                </span>
                <ChevronRight className="w-4 h-4 text-bunny-muted" />
              </div>
              <div className="setting" onClick={() => openModal('help')}>
                <div className="sicon"><HelpCircle className="w-4 h-4" /></div>
                <span>Help &amp; Support</span>
                <ChevronRight className="w-4 h-4 text-bunny-muted" />
              </div>
            </div>

            <button 
              className="btn light" 
              style={{ width: '100%', marginTop: 15, color: '#ef4444' }} 
              onClick={() => setIsLogoutConfirm(true)}
            >
              <LogOut className="w-3.5 h-3.5 inline mr-1.5" /> Log Out
            </button>
          </main>
        )}

        {/* ====== SCREEN 5: GROUPS ====== */}
        {activeScreen === 'groups' && (
          <main className="content">
            <div className="grid2">
              <div className="card hero-card">
                <h3>Start a group</h3>
                <p>Bring your friends or study team together in one space.</p>
                <button className="btn primary" onClick={() => openModal('group')}>
                  <Plus className="w-3.5 h-3.5 inline mr-1" /> Create Group
                </button>
              </div>
              <div className="card">
                <h3 style={{ fontSize: 15, margin: '0 0 6px' }}>Discover Spaces</h3>
                <p style={{ fontSize: 11, color: '#777', margin: '0 0 12px' }}>
                  Explore public groups &amp; jams.
                </p>
                <button className="btn light" onClick={() => navigateTo('discover')}>
                  Explore Spaces
                </button>
              </div>
            </div>

            <div className="section">
              <h2>Your active groups ({groupsList.length})</h2>
            </div>

            {groupsList.map((g) => (
              <div 
                key={g.id} 
                className="listrow" 
                onClick={() => openChatRoom(g.name, '/assets/maya.png', true, true)}
                style={{ cursor: 'pointer' }}
              >
                <div className="channel-icon">{g.icon}</div>
                <div className="grow">
                  <b>{g.name}</b>
                  <small>{g.members}</small>
                </div>
                <span className="tag">{g.tag}</span>
              </div>
            ))}
          </main>
        )}

        {/* ====== SCREEN 6: CHANNELS ====== */}
        {activeScreen === 'channels' && (
          <main className="content">
            <div className="card">
              {channelsList.map((ch) => (
                <div 
                  key={ch.id} 
                  className="listrow" 
                  onClick={() => openChatRoom(ch.name, '/assets/alex.png', true, true)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="channel-icon">{ch.icon}</div>
                  <div className="grow">
                    <b>{ch.name}</b>
                    <small>{ch.desc}</small>
                  </div>
                  <span className="tag">{ch.badge}</span>
                </div>
              ))}
            </div>

            <div className="section">
              <h2>Joined Channels Feed</h2>
            </div>

            <div 
              className="chat" 
              onClick={() => openChatRoom('Friday Night Design', '/assets/maya.png', true, true)}
            >
              <div className="channel-icon">🪩</div>
              <div className="chat-main">
                <div className="chat-top">
                  <span className="chat-name">Friday Night Design</span>
                  <span className="time">10m</span>
                </div>
                <div className="preview">“What are you building this weekend?”</div>
              </div>
            </div>
          </main>
        )}

        {/* ====== SCREEN 7: SPARKS ====== */}
        {activeScreen === 'sparks' && (
          <main className="content">
            <div className="pills">
              <button 
                className={`pill ${sparkPill === 'all' ? 'active' : ''}`}
                onClick={() => setSparkPill('all')}
              >
                All sparks
              </button>
              <button 
                className={`pill ${sparkPill === 'friends' ? 'active' : ''}`}
                onClick={() => setSparkPill('friends')}
              >
                Friends
              </button>
              <button 
                className={`pill ${sparkPill === 'communities' ? 'active' : ''}`}
                onClick={() => setSparkPill('communities')}
              >
                Communities
              </button>
            </div>

            <div className="spark-grid" style={{ marginTop: 14 }}>
              {filteredSparks.map((spark, idx) => (
                <div 
                  key={spark.id} 
                  className="spark" 
                  onClick={() => openStoryViewer(idx)}
                >
                  <button 
                    className={`spark-heart-btn ${likedSparks[spark.id] ? 'liked' : ''}`}
                    onClick={(e) => handleToggleLikeSpark(spark.id, e)}
                    title="Like Spark"
                  >
                    ❤️ {spark.likes}
                  </button>
                  <img src={spark.image} alt={spark.caption} />
                  <div className="cap">
                    {spark.caption}
                    <br />
                    <small>{spark.time} · {spark.user}</small>
                  </div>
                </div>
              ))}
            </div>
          </main>
        )}

        {/* ====== SCREEN 8: FEED FILTERS ====== */}
        {activeScreen === 'filters' && (
          <main className="content">
            <div className="card">
              <div 
                className="setting" 
                onClick={() => setFilterSwitches((p: any) => ({ ...p, unread: !p.unread }))}
              >
                <div className="sicon"><Bell className="w-4 h-4" /></div>
                <span>Unread messages priority</span>
                <div className={`switch ${filterSwitches.unread ? 'on' : ''}`}>
                  <i />
                </div>
              </div>

              <div 
                className="setting" 
                onClick={() => setFilterSwitches((p: any) => ({ ...p, groups: !p.groups }))}
              >
                <div className="sicon"><UsersRound className="w-4 h-4" /></div>
                <span>Show group activities</span>
                <div className={`switch ${filterSwitches.groups ? 'on' : ''}`}>
                  <i />
                </div>
              </div>

              <div 
                className="setting" 
                onClick={() => setFilterSwitches((p: any) => ({ ...p, channels: !p.channels }))}
              >
                <div className="sicon"><Radio className="w-4 h-4" /></div>
                <span>Show channel broadcasts</span>
                <div className={`switch ${filterSwitches.channels ? 'on' : ''}`}>
                  <i />
                </div>
              </div>

              <div 
                className="setting" 
                onClick={() => setFilterSwitches((p: any) => ({ ...p, recent: !p.recent }))}
              >
                <div className="sicon"><Clock className="w-4 h-4" /></div>
                <span>Recent active chats first</span>
                <div className={`switch ${filterSwitches.recent ? 'on' : ''}`}>
                  <i />
                </div>
              </div>
            </div>

            <div className="section">
              <h2>Filter Preferences</h2>
            </div>

            <div className="card">
              <p style={{ fontSize: 11, color: '#777', margin: '0 0 12px' }}>
                Your custom chat view settings will automatically persist on this device.
              </p>
              <button 
                className="btn primary" 
                onClick={() => {
                  showToast('Filters saved successfully');
                  goBack();
                }}
              >
                Save filters
              </button>
            </div>
          </main>
        )}

        {/* ====== SCREEN 9: CHAT ROOM (FULL SCREEN VIEW) ====== */}
        {activeScreen === 'room' && (
          <section className="chatroom select-none">
            {/* Room Header */}
            <div className="roomhead">
              <button 
                className="room-back-btn back" 
                onClick={goBack} 
                title="Back to chats"
                id="roomBackBtn"
              >
                <ArrowLeft className="w-5 h-5 text-bunny-ink dark:text-white stroke-[2.5]" />
              </button>
              <div className={activeChat.isOnline && !activeChat.isGroup ? 'online' : ''}>
                {activeChat.isGroup ? (
                  <div 
                    className="avatar" 
                    style={{ display: 'grid', placeItems: 'center', background: '#eee8ff', color: '#7b5cf5' }}
                  >
                    <UsersRound className="w-4 h-4" />
                  </div>
                ) : (
                  <img className="avatar" src={activeChat.avatar} alt={activeChat.name} />
                )}
              </div>
              <div className="roomname">
                <b id="roomTitle">{activeChat.name}</b>
                <span>{activeChat.isGroup ? '● Group Discussion' : (activeChat.isOnline ? '● Active now' : '● Offline')}</span>
              </div>
              <button 
                className="icon room-call-btn" 
                onClick={() => startCall('voice')}
                title="Voice Call"
              >
                <Phone className="w-4 h-4 text-emerald-500 stroke-[2.2]" />
              </button>
              <button 
                className="icon room-call-btn" 
                onClick={() => startCall('video')}
                title="Video Call"
              >
                <Video className="w-4 h-4 text-[#ff607d] stroke-[2.2]" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="messages" id="messages">
              <div className="date">Today, {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</div>
              
              {displayedMessages.length === 0 ? (
                /* WARM WELCOME EMPTY SLATE FOR NEW CHATS & MEMBERS */
                <div className="empty-chat-slate">
                  <div className="empty-chat-avatar-ring">
                    {activeChat.isGroup ? (
                      <div className="avatar-placeholder flex items-center justify-center bg-purple-100 text-purple-600">
                        <UsersRound className="w-8 h-8" />
                      </div>
                    ) : (
                      <img src={activeChat.avatar || '/assets/alex.png'} alt={activeChat.name} />
                    )}
                  </div>
                  <h3 className="empty-chat-title">Say hello to {activeChat.name} 👋</h3>
                  <p className="empty-chat-subtitle">
                    This conversation is brand new and completely empty. Tap a starter below or send your first message!
                  </p>
                  <div className="empty-chat-chip-grid">
                    <button 
                      className="empty-chat-chip"
                      onClick={() => handleSendMessage('Hey! 👋')}
                    >
                      Say Hey! 👋
                    </button>
                    <button 
                      className="empty-chat-chip"
                      onClick={() => handleSendMessage('Sending good vibes! 🌊✨')}
                    >
                      Send Waves 🌊
                    </button>
                    <button 
                      className="empty-chat-chip"
                      onClick={() => handleSendMessage('Hey! How is your day going? ✨')}
                    >
                      How's your day? ✨
                    </button>
                    <button 
                      className="empty-chat-chip"
                      onClick={() => handleSendMessage("Hey, let's hop on a call when you are free! 📞")}
                    >
                      Call when free 📞
                    </button>
                  </div>
                </div>
              ) : (
                displayedMessages.map((msg) => {
                  const isSwipingThis = swipingMsgId === msg.id;
                  const isCallEvent = msg.text.includes('Video Call') || msg.text.includes('Voice Call');

                  if (isCallEvent) {
                    return (
                      <div key={msg.id} className="flex justify-center my-2 select-none">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/5 dark:bg-white/10 border border-bunny-line text-xs font-semibold text-bunny-muted shadow-sm">
                          {msg.text.includes('Video') ? (
                            <Video className="w-3.5 h-3.5 text-[#ff607d]" />
                          ) : (
                            <Phone className="w-3.5 h-3.5 text-emerald-500" />
                          )}
                          <span>{msg.text}</span>
                          <span className="text-[10px] opacity-70">· {msg.time}</span>
                        </div>
                      </div>
                    );
                  }

                  const isMe = msg.sender === 'me';

                  return (
                    <div 
                      key={msg.id} 
                      className={`msg-swipe-container ${isMe ? 'msg-outgoing' : 'msg-incoming'}`}
                      onTouchStart={(e) => handleTouchStart(msg.id, e.touches[0].clientX)}
                      onTouchMove={(e) => handleTouchMove(msg.id, e.touches[0].clientX, isMe)}
                      onTouchEnd={() => handleTouchEnd(msg)}
                      onMouseDown={(e) => handleTouchStart(msg.id, e.clientX)}
                      onMouseMove={(e) => handleTouchMove(msg.id, e.clientX, isMe)}
                      onMouseUp={() => handleTouchEnd(msg)}
                    >
                      {/* Incoming: Swipe RIGHT reveals reply indicator on Left */}
                      {!isMe && isSwipingThis && swipeOffset > 10 && (
                        <div 
                          className="msg-swipe-indicator left"
                          style={{
                            opacity: Math.min(1, swipeOffset / 30),
                            transform: `translateY(-50%) scale(${Math.min(1.2, 0.6 + swipeOffset / 50)})`,
                          }}
                        >
                          <CornerUpRight className="w-4 h-4 stroke-[2.5]" />
                        </div>
                      )}

                      {/* Outgoing: Swipe LEFT reveals reply indicator on Right */}
                      {isMe && isSwipingThis && swipeOffset < -10 && (
                        <div 
                          className="msg-swipe-indicator right"
                          style={{
                            opacity: Math.min(1, Math.abs(swipeOffset) / 30),
                            transform: `translateY(-50%) scale(${Math.min(1.2, 0.6 + Math.abs(swipeOffset) / 50)})`,
                          }}
                        >
                          <CornerUpLeft className="w-4 h-4 stroke-[2.5]" />
                        </div>
                      )}

                      <div 
                        className={`msg-swipe-inner ${!isSwipingThis ? 'spring-back' : ''}`}
                        style={{
                          transform: isSwipingThis ? `translateX(${swipeOffset}px)` : 'translateX(0px)',
                        }}
                      >
                        <div className={`msg ${msg.sender === 'me' ? 'me' : ''}`}>
                          {msg.sender === 'them' && (
                            <img className="avatar" src={msg.avatar || activeChat.avatar} alt="Avatar" />
                          )}
                          <div style={{ position: 'relative', maxWidth: '85%' }}>
                            {/* Reaction / Action popover */}
                            {selectedMessageForAction === msg.id && (
                              <div className="reaction-picker">
                                {['❤️', '🐰', '🔥', '😂', '👍', '🎉', '🥕'].map((emoji) => (
                                  <button
                                    key={emoji}
                                    className="reaction-btn"
                                    onClick={() => handleToggleReaction(msg.id, emoji)}
                                  >
                                    {emoji}
                                  </button>
                                ))}
                                <button
                                  className="reaction-btn"
                                  onClick={() => handleCopyMessage(msg.text)}
                                  title="Copy text"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  className="reaction-btn"
                                  onClick={() => {
                                    setReplyingToMessage(msg);
                                    setSelectedMessageForAction(null);
                                  }}
                                  title="Reply to message"
                                >
                                  <CornerUpRight className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  className="reaction-btn"
                                  onClick={() => handleStartForwardMessage(msg.text)}
                                  title="Forward message"
                                >
                                  <Share2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  className="reaction-btn"
                                  onClick={() => handleDeleteMessage(msg.id)}
                                  title="Delete message"
                                  style={{ color: '#ef4444' }}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}

                            <div 
                              className="bubble" 
                              onClick={() => setSelectedMessageForAction(selectedMessageForAction === msg.id ? null : msg.id)}
                              style={{ cursor: 'pointer' }}
                              title="Swipe to reply or tap for options"
                            >
                              {/* Replying To Quote */}
                              {msg.replyToText && (
                                <div className="mb-1.5 px-2 py-1 rounded-lg bg-black/5 dark:bg-white/10 border-l-2 border-bunny-coral text-[10px] text-bunny-muted truncate">
                                  ↩ {msg.replyToText}
                                </div>
                              )}

                              {/* Image Attachment with Lightbox preview */}
                              {msg.mediaType === 'image' && msg.mediaUrl && (
                                <div 
                                  className="rounded-xl overflow-hidden mb-1.5 cursor-pointer hover:opacity-95 transition-opacity"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setLightboxMedia({ url: msg.mediaUrl!, type: 'image', caption: msg.text });
                                  }}
                                >
                                  <img src={msg.mediaUrl} alt="Attached" style={{ width: '100%', maxHeight: 220, objectFit: 'cover' }} />
                                </div>
                              )}

                              {/* Document Attachment */}
                              {msg.mediaType === 'doc' && (
                                <div className="flex items-center gap-2.5 p-2 rounded-xl bg-black/5 dark:bg-white/10 mb-1.5">
                                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-500 flex items-center justify-center">
                                    <FileText className="w-4 h-4" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs font-bold truncate m-0">{msg.mediaName || msg.text}</p>
                                    <span className="text-[10px] opacity-75">{msg.mediaSize || 'PDF Document'}</span>
                                  </div>
                                </div>
                              )}

                              {/* Audio Note Attachment */}
                              {msg.mediaType === 'audio' && (
                                <div className="audio-bubble-container" style={{ margin: '4px 0' }}>
                                  <button 
                                    className="audio-play-btn"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleTogglePlayAudio(msg.id);
                                    }}
                                  >
                                    {playingAudioId === msg.id ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                                  </button>
                                  <div className="audio-wave-preview">
                                    {[12, 18, 8, 22, 15, 26, 14, 20, 10, 16, 24, 12].map((h, i) => (
                                      <span 
                                        key={i} 
                                        className={`audio-bar-static ${playingAudioId === msg.id ? 'waveform-bar' : ''}`} 
                                        style={{ height: h }} 
                                      />
                                    ))}
                                  </div>
                                  <span style={{ fontSize: 10, opacity: 0.8 }}>
                                    {playingAudioId === msg.id ? 'Playing…' : (msg.audioDuration || '0:14')}
                                  </span>
                                </div>
                              )}

                              {/* Sticker Message */}
                              {msg.mediaType === 'sticker' && (
                                <div style={{ fontSize: 38, textAlign: 'center', padding: '4px 8px' }}>
                                  {msg.text.split(' ')[0]}
                                </div>
                              )}

                              {/* Regular or media caption text */}
                              {msg.mediaType !== 'sticker' && msg.text}

                              {/* Timestamp & read receipts */}
                              <div className="flex items-center justify-end gap-1 mt-1 opacity-70 text-[9px]">
                                <span>{msg.time || '10:42 AM'}</span>
                                {msg.sender === 'me' && (
                                  msg.isRead ? (
                                    <CheckCheck className="w-3 h-3 text-cyan-400" />
                                  ) : (
                                    <Check className="w-3 h-3" />
                                  )
                                )}
                              </div>
                            </div>

                            {/* Reaction Badge */}
                            {msg.reaction && (
                              <div 
                                onClick={() => handleToggleReaction(msg.id, msg.reaction!)}
                                style={{ 
                                  display: 'inline-block', 
                                  fontSize: 12, 
                                  background: 'var(--card)', 
                                  border: '1px solid var(--line)', 
                                  borderRadius: 99, 
                                  padding: '1px 6px', 
                                  marginTop: -6, 
                                  boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                                  cursor: 'pointer'
                                }}
                                title="Remove reaction"
                              >
                                {msg.reaction}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              {/* Typing indicator */}
              {isOtherUserTyping && (
                <div className="msg">
                  <img className="avatar" src={activeChat.avatar} alt="Avatar" />
                  <div className="bubble flex items-center gap-1.5 py-2 px-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-bunny-muted animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-bunny-muted animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-bunny-muted animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* STICKERS DRAWER */}
            {isStickersOpen && (
              <div className="stickers-drawer">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)' }}>BUNNY STICKERS</span>
                  <button 
                    onClick={() => setIsStickersOpen(false)}
                    style={{ border: 0, background: 'none', cursor: 'pointer' }}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="stickers-grid">
                  {['🐰', '🥕', '💖', '🚀', '✨', '🎉', '🎧', '🌸', '🧁', '🔥', '💤', '🐾', '🌈', '🍕', '🍦', '🎈', '⚡', '☕'].map((stk) => (
                    <button 
                      key={stk} 
                      className="sticker-item" 
                      onClick={() => handleSendMessage(`${stk} Bunny Sticker`, 'sticker')}
                    >
                      {stk}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ATTACHMENT MENU */}
            {isAttachOpen && (
              <div className="attach-menu">
                <button className="attach-item" onClick={() => chatPhotoInputRef.current?.click()}>
                  <div className="attach-icon" style={{ background: '#ffe4e6', color: '#f43f5e' }}>
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <span>Photo</span>
                </button>
                <button className="attach-item" onClick={startVoiceRecording}>
                  <div className="attach-icon" style={{ background: '#ede9fe', color: '#8b5cf6' }}>
                    <Mic className="w-4 h-4" />
                  </div>
                  <span>Voice Note</span>
                </button>
                <button className="attach-item" onClick={() => chatDocInputRef.current?.click()}>
                  <div className="attach-icon" style={{ background: '#dbeafe', color: '#3b82f6' }}>
                    <FileText className="w-4 h-4" />
                  </div>
                  <span>Document</span>
                </button>
                <button className="attach-item" onClick={() => { setIsStickersOpen(true); setIsAttachOpen(false); }}>
                  <div className="attach-icon" style={{ background: '#fef3c7', color: '#f59e0b' }}>
                    <Smile className="w-4 h-4" />
                  </div>
                  <span>Stickers</span>
                </button>
              </div>
            )}

            {/* Replying Banner Above Composer */}
            {replyingToMessage && (
              <div className="px-4 py-2 bg-black/5 dark:bg-white/5 border-t border-bunny-border flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <CornerUpRight className="w-3.5 h-3.5 text-bunny-coral" />
                  <span className="text-xs text-bunny-muted truncate">
                    Replying to <b>{replyingToMessage.sender === 'me' ? 'yourself' : activeChat.name}</b>: {replyingToMessage.text}
                  </span>
                </div>
                <button onClick={() => setReplyingToMessage(null)}>
                  <X className="w-3.5 h-3.5 text-bunny-muted" />
                </button>
              </div>
            )}

            {/* COMPOSER / VOICE RECORDER */}
            <div className="composer">
              {isRecording ? (
                <div className="voice-recording-bar">
                  <div className="recording-dot" />
                  <span className="recording-timer">{formatTimer(recordingSeconds)}</span>
                  <div className="waveform-anim">
                    <div className="waveform-bar" />
                    <div className="waveform-bar" />
                    <div className="waveform-bar" />
                    <div className="waveform-bar" />
                    <div className="waveform-bar" />
                    <div className="waveform-bar" />
                  </div>
                  <button 
                    onClick={cancelVoiceRecording}
                    style={{ border: 0, background: 'none', cursor: 'pointer', color: '#888' }}
                    title="Cancel recording"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <button 
                    className="send" 
                    onClick={finishVoiceRecording} 
                    title="Send Voice Note"
                    style={{ width: 36, height: 36 }}
                  >
                    <Send className="w-4 h-4 text-white" />
                  </button>
                </div>
              ) : (
                <>
                  <button 
                    className="icon" 
                    onClick={() => {
                      setIsAttachOpen(!isAttachOpen);
                      setIsStickersOpen(false);
                    }}
                    title="Attach media or stickers"
                    style={{ background: isAttachOpen ? 'var(--coral)' : undefined, color: isAttachOpen ? '#fff' : undefined }}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <input
                    id="messageInput"
                    placeholder={`Message ${activeChat.name}...`}
                    value={roomInput}
                    onChange={(e) => setRoomInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSendMessage();
                    }}
                    autoFocus
                  />
                  {roomInput.trim() ? (
                    <button className="send" onClick={() => handleSendMessage()} title="Send message">
                      <Send className="w-4 h-4 text-white" />
                    </button>
                  ) : (
                    <button 
                      className="icon" 
                      onClick={startVoiceRecording} 
                      title="Record voice note"
                      style={{ background: '#f5f0ff', color: 'var(--purple)', border: 0 }}
                    >
                      <Mic className="w-4 h-4" />
                    </button>
                  )}
                </>
              )}
            </div>
          </section>
        )}
        </div>

        {/* 4. SOLID POLISHED BOTTOM NAVIGATION BAR (5 PILLARS: CHATS, CALLS, FRIENDS, DISCOVER, PROFILE) */}
        {['home', 'calls', 'friends', 'discover', 'profile'].includes(activeScreen) && (
          <nav className="nav select-none" aria-label="Main Navigation">
            <button
              className={`nav-btn ${activeScreen === 'home' ? 'active' : ''}`}
              onClick={() => navigateTo('home')}
              title="Chats"
            >
              <div className="nav-icon-box">
                <MessageCircle className="w-5 h-5" />
              </div>
              <span className="nav-label">Chats</span>
              {activeScreen === 'home' && <span className="nav-active-dot" />}
            </button>
            <button
              className={`nav-btn ${activeScreen === 'calls' ? 'active' : ''}`}
              onClick={() => navigateTo('calls')}
              title="Calls & Logs"
            >
              <div className="nav-icon-box" style={{ position: 'relative' }}>
                <Phone className="w-5 h-5" />
                {callLogs.some((c) => c.direction === 'missed') && (
                  <span 
                    style={{ 
                      position: 'absolute', 
                      top: -1, 
                      right: -3, 
                      width: 7, 
                      height: 7, 
                      borderRadius: '50%', 
                      background: '#ef4444' 
                    }} 
                  />
                )}
              </div>
              <span className="nav-label">Calls</span>
              {activeScreen === 'calls' && <span className="nav-active-dot" />}
            </button>
            <button
              className={`nav-btn ${activeScreen === 'friends' ? 'active' : ''}`}
              onClick={() => navigateTo('friends')}
              title="Friends"
            >
              <div className="nav-icon-box">
                <UsersRound className="w-5 h-5" />
              </div>
              <span className="nav-label">Friends</span>
              {activeScreen === 'friends' && <span className="nav-active-dot" />}
            </button>
            <button
              className={`nav-btn ${activeScreen === 'discover' ? 'active' : ''}`}
              onClick={() => navigateTo('discover')}
              title="Discover"
            >
              <div className="nav-icon-box">
                <Compass className="w-5 h-5" />
              </div>
              <span className="nav-label">Discover</span>
              {activeScreen === 'discover' && <span className="nav-active-dot" />}
            </button>
            <button
              className={`nav-btn ${activeScreen === 'profile' ? 'active' : ''}`}
              onClick={() => navigateTo('profile')}
              title="Profile"
            >
              <div className="nav-icon-box">
                <User className="w-5 h-5" />
              </div>
              <span className="nav-label">Profile</span>
              {activeScreen === 'profile' && <span className="nav-active-dot" />}
            </button>
          </nav>
        )}

        {/* 5. FLOATING ACTION BUTTON (FAB) */}
        {['home', 'calls', 'friends', 'discover', 'profile'].includes(activeScreen) && (
          <button 
            className="fab" 
            onClick={() => openModal('spark')} 
            title="Post Instant Spark"
          >
            <Sparkles className="w-5 h-5 text-white" />
          </button>
        )}

        {/* 6. ENHANCED VOICE & VIDEO CALL MODAL */}
        <EnhancedCallModal
          callData={activeCallData}
          currentUserAvatar={profileAvatar}
          currentUserName={profileName}
          onEndCall={handleEndCall}
          onAcceptCall={handleAcceptCall}
          onToggleCallType={handleToggleCallType}
        />

        {/* 7. ALL MODALS & BOTTOM SHEETS */}
        <div 
          className={`modal ${modalType !== 'none' || isLogoutConfirm ? 'show' : ''}`}
          id="modal"
          onClick={(e) => {
            if ((e.target as HTMLElement).id === 'modal') {
              closeModal();
              setIsLogoutConfirm(false);
            }
          }}
        >
          <div className="sheet">
            {/* Logout Confirmation Sheet */}
            {isLogoutConfirm && (
              <>
                <div className="modal-header">
                  <button className="modal-back-btn" onClick={() => setIsLogoutConfirm(false)}>
                    <ArrowLeft className="w-3.5 h-3.5 inline mr-1" /> Back
                  </button>
                  <h3>Sign Out</h3>
                  <button className="modal-close-icon" onClick={() => setIsLogoutConfirm(false)}>
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p>Are you sure you want to sign out of <b>{profileName}</b>?</p>
                <div className="row" style={{ marginTop: 18 }}>
                  <button 
                    className="btn light" 
                    style={{ flex: 1 }} 
                    onClick={() => setIsLogoutConfirm(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    className="btn primary" 
                    style={{ flex: 1, background: '#ef4444' }} 
                    onClick={handleConfirmLogout}
                  >
                    Log Out
                  </button>
                </div>
              </>
            )}

            {/* Create Spark Modal */}
            {modalType === 'spark' && (
              <>
                <div className="modal-header">
                  <button className="modal-back-btn" onClick={closeModal}>
                    <ArrowLeft className="w-3.5 h-3.5 inline mr-1" /> Back
                  </button>
                  <h3>Create Instant Spark ✨</h3>
                  <button className="modal-close-icon" onClick={closeModal}>
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p>Share something spontaneous with your circle.</p>
                
                {/* Custom Image Preview */}
                {sparkImageCustom && (
                  <div style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', height: 160, marginBottom: 10 }}>
                    <img src={sparkImageCustom} alt="Custom spark" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      onClick={() => setSparkImageCustom(null)}
                      style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.6)', color: '#fff', border: 0, borderRadius: '50%', width: 24, height: 24, cursor: 'pointer' }}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <textarea
                  placeholder="What’s happening on your side?"
                  value={sparkInput}
                  onChange={(e) => setSparkInput(e.target.value)}
                  autoFocus
                />

                <div style={{ display: 'flex', gap: 8, margin: '8px 0 14px' }}>
                  <button 
                    className="btn light"
                    onClick={() => sparkFileInputRef.current?.click()}
                    style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <ImageIcon className="w-4 h-4" /> Attach Photo
                  </button>
                  <button 
                    className="btn light"
                    onClick={() => {
                      setSparkImageCustom('/assets/alex.png');
                      showToast('Preset image selected');
                    }}
                  >
                    <Palette className="w-4 h-4 inline mr-1" /> Creative Preset
                  </button>
                </div>

                <div className="row">
                  <button 
                    className="btn light" 
                    style={{ flex: 1 }} 
                    onClick={closeModal}
                  >
                    Cancel
                  </button>
                  <button 
                    className="btn primary" 
                    style={{ flex: 1 }} 
                    onClick={handlePostSpark}
                  >
                    Post Spark
                  </button>
                </div>
              </>
            )}

            {/* New Chat Modal */}
            {modalType === 'new_chat' && (
              <>
                <div className="modal-header">
                  <button className="modal-back-btn" onClick={closeModal}>
                    <ArrowLeft className="w-3.5 h-3.5 inline mr-1" /> Back
                  </button>
                  <h3>New Conversation</h3>
                  <button className="modal-close-icon" onClick={closeModal}>
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p>Choose a friend to start chatting with.</p>

                <div className="search" style={{ margin: '10px 0' }}>
                  <Search className="w-4 h-4 text-bunny-muted" />
                  <input 
                    placeholder="Search contacts..." 
                    value={newChatSearch}
                    onChange={(e) => setNewChatSearch(e.target.value)}
                  />
                </div>

                <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                  {filteredNewChatFriends.map((f) => (
                    <div 
                      key={f.id} 
                      className="listrow" 
                      onClick={() => {
                        closeModal();
                        openChatRoom(f.name, f.avatar, f.isOnline);
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className={f.isOnline ? 'online' : ''}>
                        <img className="avatar" src={f.avatar} alt={f.name} />
                      </div>
                      <div className="grow">
                        <b>{f.name}</b>
                        <small>{f.subtitle}</small>
                      </div>
                      <span className="tag">START CHAT</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Add Friend Modal */}
            {modalType === 'add_friend' && (
              <>
                <div className="modal-header">
                  <button className="modal-back-btn" onClick={closeModal}>
                    <ArrowLeft className="w-3.5 h-3.5 inline mr-1" /> Back
                  </button>
                  <h3>Add a Friend 🐰</h3>
                  <button className="modal-close-icon" onClick={closeModal}>
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p>Enter a username or name to send a connection request.</p>
                <input
                  placeholder="e.g. Liam, Chloe, alex_r..."
                  value={newFriendInput}
                  onChange={(e) => setNewFriendInput(e.target.value)}
                  autoFocus
                />
                <div className="row" style={{ marginTop: 14 }}>
                  <button className="btn light" style={{ flex: 1 }} onClick={closeModal}>
                    Cancel
                  </button>
                  <button className="btn primary" style={{ flex: 1 }} onClick={handleAddFriend}>
                    Send Request
                  </button>
                </div>
              </>
            )}

            {/* Forward Message Modal */}
            {modalType === 'forward_message' && (
              <>
                <div className="modal-header">
                  <button className="modal-back-btn" onClick={closeModal}>
                    <ArrowLeft className="w-3.5 h-3.5 inline mr-1" /> Back
                  </button>
                  <h3>Forward Message</h3>
                  <button className="modal-close-icon" onClick={closeModal}>
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-bunny-muted mb-2">
                  Select a friend or group to forward this message to:
                </p>
                <div style={{ maxHeight: 280, overflowY: 'auto' }}>
                  {allFriends.map((f) => (
                    <div 
                      key={f.id}
                      className="listrow cursor-pointer"
                      onClick={() => handleExecuteForward(f.name, f.avatar)}
                    >
                      <img className="avatar" src={f.avatar} alt={f.name} />
                      <div className="grow">
                        <b>{f.name}</b>
                        <small>{f.subtitle}</small>
                      </div>
                      <span className="tag">FORWARD</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Notifications Feed Modal */}
            {modalType === 'notifications_feed' && (
              <>
                <div className="modal-header">
                  <button className="modal-back-btn" onClick={closeModal}>
                    <ArrowLeft className="w-3.5 h-3.5 inline mr-1" /> Back
                  </button>
                  <h3>Notifications</h3>
                  <button 
                    className="btn light" 
                    style={{ padding: '4px 8px', fontSize: 10 }}
                    onClick={() => {
                      setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
                      showToast('All notifications marked as read');
                    }}
                  >
                    Mark all read
                  </button>
                </div>

                <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                  {notifications.map((n) => (
                    <div 
                      key={n.id} 
                      className={`notif-row ${n.unread ? 'unread' : ''}`}
                      onClick={() => {
                        setNotifications((prev) => prev.map((item) => item.id === n.id ? { ...item, unread: false } : item));
                        closeModal();
                        if (n.targetChat) openChatRoom(n.targetChat);
                        else if (n.targetSparkIndex !== undefined) openStoryViewer(n.targetSparkIndex);
                        else if (n.targetScreen) navigateTo(n.targetScreen);
                      }}
                    >
                      <img className="notif-avatar" src={n.avatar} alt="Notif avatar" />
                      <div className="notif-content">
                        <p className="notif-text"><b>{n.text}</b></p>
                        <span className="notif-time">{n.time}</span>
                      </div>
                      {n.unread && <span className="notif-dot" style={{ position: 'static' }} />}
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Create Group Modal */}
            {modalType === 'group' && (
              <>
                <div className="modal-header">
                  <button className="modal-back-btn" onClick={closeModal}>
                    <ArrowLeft className="w-3.5 h-3.5 inline mr-1" /> Back
                  </button>
                  <h3>Create a Group</h3>
                  <button className="modal-close-icon" onClick={closeModal}>
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p>Build a private space for your friends or team.</p>
                <input
                  placeholder="Group name (e.g. Design Hackers)"
                  value={groupNameInput}
                  onChange={(e) => setGroupNameInput(e.target.value)}
                  autoFocus
                />
                <textarea
                  placeholder="Short description"
                  value={groupDescInput}
                  onChange={(e) => setGroupDescInput(e.target.value)}
                />
                <div className="row">
                  <button className="btn light" style={{ flex: 1 }} onClick={closeModal}>
                    Cancel
                  </button>
                  <button className="btn primary" style={{ flex: 1 }} onClick={handleCreateGroup}>
                    Create Group
                  </button>
                </div>
              </>
            )}

            {/* Create Channel Modal */}
            {modalType === 'channel' && (
              <>
                <div className="modal-header">
                  <button className="modal-back-btn" onClick={closeModal}>
                    <ArrowLeft className="w-3.5 h-3.5 inline mr-1" /> Back
                  </button>
                  <h3>Create a Channel</h3>
                  <button className="modal-close-icon" onClick={closeModal}>
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p>Start a topic or community broadcast channel.</p>
                <input
                  placeholder="Channel name (e.g. Photography 📸)"
                  value={channelNameInput}
                  onChange={(e) => setChannelNameInput(e.target.value)}
                  autoFocus
                />
                <input
                  placeholder="Category (e.g. Design, Tech, Music)"
                  value={channelCategoryInput}
                  onChange={(e) => setChannelCategoryInput(e.target.value)}
                />
                <div className="row">
                  <button className="btn light" style={{ flex: 1 }} onClick={closeModal}>
                    Cancel
                  </button>
                  <button className="btn primary" style={{ flex: 1 }} onClick={handleCreateChannel}>
                    Create Channel
                  </button>
                </div>
              </>
            )}

            {/* Edit Profile Modal */}
            {modalType === 'profile' && (
              <>
                <div className="modal-header">
                  <button className="modal-back-btn" onClick={closeModal}>
                    <ArrowLeft className="w-3.5 h-3.5 inline mr-1" /> Back
                  </button>
                  <h3>Edit Profile</h3>
                  <button className="modal-close-icon" onClick={closeModal}>
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p>Update your public display info and avatar.</p>
                <div style={{ display: 'flex', gap: 10, margin: '10px 0', alignItems: 'center' }}>
                  <img 
                    src="/assets/maya.png" 
                    alt="Maya" 
                    onClick={() => setProfileAvatar('/assets/maya.png')}
                    style={{ width: 44, height: 44, borderRadius: '50%', cursor: 'pointer', border: profileAvatar === '/assets/maya.png' ? '3px solid var(--coral)' : '2px solid transparent' }} 
                  />
                  <img 
                    src="/assets/alex.png" 
                    alt="Alex" 
                    onClick={() => setProfileAvatar('/assets/alex.png')}
                    style={{ width: 44, height: 44, borderRadius: '50%', cursor: 'pointer', border: profileAvatar === '/assets/alex.png' ? '3px solid var(--coral)' : '2px solid transparent' }} 
                  />
                  <img 
                    src="/assets/bunny-icon.png" 
                    alt="Bunny" 
                    onClick={() => setProfileAvatar('/assets/bunny-icon.png')}
                    style={{ width: 44, height: 44, borderRadius: '50%', cursor: 'pointer', border: profileAvatar === '/assets/bunny-icon.png' ? '3px solid var(--coral)' : '2px solid transparent' }} 
                  />
                  <button
                    className="btn light"
                    onClick={() => profileFileInputRef.current?.click()}
                    style={{ fontSize: 11 }}
                  >
                    Upload File
                  </button>
                </div>
                <input
                  placeholder="Full Name"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                />
                <input
                  placeholder="Bio / Handle"
                  value={profileBio}
                  onChange={(e) => setProfileBio(e.target.value)}
                />
                <div className="row">
                  <button className="btn light" style={{ flex: 1 }} onClick={closeModal}>
                    Cancel
                  </button>
                  <button 
                    className="btn primary" 
                    style={{ flex: 1 }} 
                    onClick={() => {
                      setCurrentUserProfile((prev) => ({ ...prev, name: profileName, bio: profileBio, avatar: profileAvatar }));
                      closeModal();
                      showToast('Profile updated ✨');
                    }}
                  >
                    Save Profile
                  </button>
                </div>
              </>
            )}

            {/* Account & Security Modal */}
            {modalType === 'account' && (
              <>
                <div className="modal-header">
                  <button className="modal-back-btn" onClick={closeModal}>
                    <ArrowLeft className="w-3.5 h-3.5 inline mr-1" /> Back
                  </button>
                  <h3>Account &amp; Security</h3>
                  <button className="modal-close-icon" onClick={closeModal}>
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p>Manage your account settings and credentials.</p>
                <div className="card" style={{ margin: '12px 0' }}>
                  <div className="listrow">
                    <div className="grow">
                      <b>Email Address</b>
                      <small>maya.liu@bunnytalks.app</small>
                    </div>
                    <span className="tag">VERIFIED</span>
                  </div>

                  <div className="listrow" style={{ flexWrap: 'wrap' }}>
                    <div className="grow">
                      <b>Phone Number</b>
                      {isEditingPhone ? (
                        <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                          <input
                            value={tempPhoneInput}
                            onChange={(e) => setTempPhoneInput(e.target.value)}
                            style={{ margin: 0, padding: '6px 10px', fontSize: 12, flex: 1 }}
                            autoFocus
                          />
                          <button 
                            className="btn primary" 
                            style={{ padding: '6px 12px' }}
                            onClick={() => {
                              setPhoneNumber(tempPhoneInput);
                              setIsEditingPhone(false);
                              showToast('Phone number updated! ✓');
                            }}
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <small>{phoneNumber}</small>
                      )}
                    </div>
                    {!isEditingPhone && (
                      <button 
                        className="btn light" 
                        onClick={() => {
                          setTempPhoneInput(phoneNumber);
                          setIsEditingPhone(true);
                        }}
                      >
                        Edit
                      </button>
                    )}
                  </div>

                  <div 
                    className="listrow" 
                    onClick={() => {
                      setIs2FAEnabled(!is2FAEnabled);
                      showToast(is2FAEnabled ? '2FA disabled' : '2FA enabled ✓');
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="grow">
                      <b>Two-Factor Auth (2FA)</b>
                      <small>{is2FAEnabled ? 'Enabled via Authenticator App' : 'Disabled (tap to enable)'}</small>
                    </div>
                    <div className={`switch ${is2FAEnabled ? 'on' : ''}`}>
                      <i />
                    </div>
                  </div>
                </div>
                <button className="btn primary" style={{ width: '100%' }} onClick={closeModal}>
                  Done
                </button>
              </>
            )}

            {/* Notifications Modal */}
            {modalType === 'notifications' && (
              <>
                <div className="modal-header">
                  <button className="modal-back-btn" onClick={closeModal}>
                    <ArrowLeft className="w-3.5 h-3.5 inline mr-1" /> Back
                  </button>
                  <h3>Notifications &amp; Sounds</h3>
                  <button className="modal-close-icon" onClick={closeModal}>
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p>Configure how Bunny Talks alerts you.</p>
                <div className="card" style={{ margin: '12px 0' }}>
                  <div 
                    className="setting"
                    onClick={() => {
                      setNotifSound(!notifSound);
                      if (!notifSound) playMessageReceivedSound();
                      showToast(notifSound ? 'Sound effects muted' : 'Sound effects active 🔔');
                    }}
                  >
                    <span>In-app sound effects</span>
                    <div className={`switch ${notifSound ? 'on' : ''}`}>
                      <i />
                    </div>
                  </div>
                  <div 
                    className="setting"
                    onClick={() => {
                      setNotifPreview(!notifPreview);
                      showToast(notifPreview ? 'Message previews hidden' : 'Message previews visible');
                    }}
                  >
                    <span>Message preview in alerts</span>
                    <div className={`switch ${notifPreview ? 'on' : ''}`}>
                      <i />
                    </div>
                  </div>
                  <div 
                    className="setting"
                    onClick={() => {
                      setNotifSparks(!notifSparks);
                      showToast(notifSparks ? 'Spark alerts disabled' : 'Spark alerts enabled ✨');
                    }}
                  >
                    <span>Spark notifications</span>
                    <div className={`switch ${notifSparks ? 'on' : ''}`}>
                      <i />
                    </div>
                  </div>
                </div>
                <button className="btn primary" style={{ width: '100%' }} onClick={closeModal}>
                  Save Preferences
                </button>
              </>
            )}

            {/* Privacy Modal */}
            {modalType === 'privacy' && (
              <>
                <div className="modal-header">
                  <button className="modal-back-btn" onClick={closeModal}>
                    <ArrowLeft className="w-3.5 h-3.5 inline mr-1" /> Back
                  </button>
                  <h3>Privacy &amp; Safety</h3>
                  <button className="modal-close-icon" onClick={closeModal}>
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p>Control who sees your activity and presence.</p>
                <div className="card" style={{ margin: '12px 0' }}>
                  <div 
                    className="setting"
                    onClick={() => {
                      setPrivacyOnline(!privacyOnline);
                      showToast(privacyOnline ? 'Online presence hidden' : 'Online presence visible');
                    }}
                  >
                    <span>Show online presence</span>
                    <div className={`switch ${privacyOnline ? 'on' : ''}`}>
                      <i />
                    </div>
                  </div>
                  <div 
                    className="setting"
                    onClick={() => {
                      setPrivacyReceipts(!privacyReceipts);
                      showToast(privacyReceipts ? 'Read receipts disabled' : 'Read receipts enabled ✓');
                    }}
                  >
                    <span>Send read receipts</span>
                    <div className={`switch ${privacyReceipts ? 'on' : ''}`}>
                      <i />
                    </div>
                  </div>
                  <div 
                    className="setting"
                    onClick={() => {
                      setPrivacySparks(!privacySparks);
                      showToast(privacySparks ? 'Sparks set to private' : 'Sparks set to public ✨');
                    }}
                  >
                    <span>Public Sparks discovery</span>
                    <div className={`switch ${privacySparks ? 'on' : ''}`}>
                      <i />
                    </div>
                  </div>
                </div>
                <button className="btn primary" style={{ width: '100%' }} onClick={closeModal}>
                  Save Privacy Settings
                </button>
              </>
            )}

            {/* Help & Support Modal */}
            {modalType === 'help' && (
              <>
                <div className="modal-header">
                  <button className="modal-back-btn" onClick={closeModal}>
                    <ArrowLeft className="w-3.5 h-3.5 inline mr-1" /> Back
                  </button>
                  <h3>Help &amp; Support</h3>
                  <button className="modal-close-icon" onClick={closeModal}>
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p>Frequently asked questions &amp; resources.</p>
                <div className="card" style={{ margin: '12px 0' }}>
                  {/* FAQ 1 */}
                  <div 
                    style={{ padding: '8px 0', borderBottom: '1px solid var(--line)', cursor: 'pointer' }}
                    onClick={() => setActiveFaqIndex(activeFaqIndex === 0 ? null : 0)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <b style={{ fontSize: 13 }}>What is Bunny Talks?</b>
                      <span>{activeFaqIndex === 0 ? '▲' : '▼'}</span>
                    </div>
                    {activeFaqIndex === 0 && (
                      <p style={{ fontSize: 11, color: 'var(--muted)', margin: '6px 0 0' }}>
                        A playful, modern social messenger designed for creative friends with voice calls, video hangouts, and instant sparks.
                      </p>
                    )}
                  </div>

                  {/* FAQ 2 */}
                  <div 
                    style={{ padding: '8px 0', borderBottom: '1px solid var(--line)', cursor: 'pointer' }}
                    onClick={() => setActiveFaqIndex(activeFaqIndex === 1 ? null : 1)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <b style={{ fontSize: 13 }}>What are Sparks?</b>
                      <span>{activeFaqIndex === 1 ? '▲' : '▼'}</span>
                    </div>
                    {activeFaqIndex === 1 && (
                      <p style={{ fontSize: 11, color: 'var(--muted)', margin: '6px 0 0' }}>
                        Spontaneous photos and micro-updates you share with your circle that stay active for 24 hours. Friends can react and reply directly!
                      </p>
                    )}
                  </div>

                  {/* FAQ 3 */}
                  <div 
                    style={{ padding: '8px 0', cursor: 'pointer' }}
                    onClick={() => setActiveFaqIndex(activeFaqIndex === 2 ? null : 2)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <b style={{ fontSize: 13 }}>How do Live Hangouts work?</b>
                      <span>{activeFaqIndex === 2 ? '▲' : '▼'}</span>
                    </div>
                    {activeFaqIndex === 2 && (
                      <p style={{ fontSize: 11, color: 'var(--muted)', margin: '6px 0 0' }}>
                        Join live audio stages, listen to chill background vibes, raise your hand to speak, and hang out with friends around shared passions.
                      </p>
                    )}
                  </div>
                </div>
                <button className="btn primary" style={{ width: '100%' }} onClick={closeModal}>
                  Close
                </button>
              </>
            )}

            {/* Live Hangouts Audio Room Modal */}
            {modalType === 'liveRoom' && (
              <div>
                <div className="modal-header">
                  <button className="modal-back-btn" onClick={closeModal}>
                    <ArrowLeft className="w-3.5 h-3.5 inline mr-1" /> Minimize
                  </button>
                  <h3>🎧 Live Audio Room</h3>
                  <button className="modal-close-icon" onClick={closeModal}>
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div style={{ textAlign: 'center', marginBottom: 12 }}>
                  <h3 style={{ margin: '0 0 4px', fontSize: 16 }}>Lo-Fi Chill &amp; Chat Hangout</h3>
                  <small style={{ color: 'var(--muted)', fontSize: 11 }}>42 listeners · Design &amp; Chill Music</small>
                </div>

                {/* Speaker Stage */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, margin: '16px 0', textAlign: 'center' }}>
                  <div>
                    <div style={{ position: 'relative', width: 54, height: 54, margin: 'auto' }}>
                      <img src="/assets/alex.png" alt="Liam" style={{ width: '100%', height: '100%', borderRadius: '50%', border: '2px solid var(--coral)' }} />
                      <span style={{ position: 'absolute', bottom: -2, right: -2, background: 'var(--mint)', color: '#fff', borderRadius: '50%', width: 16, height: 16, fontSize: 9, display: 'grid', placeItems: 'center' }}>🎙️</span>
                    </div>
                    <b style={{ fontSize: 11, display: 'block', marginTop: 4 }}>Liam</b>
                    <small style={{ fontSize: 9, color: 'var(--muted)' }}>Host</small>
                  </div>
                  <div>
                    <div style={{ position: 'relative', width: 54, height: 54, margin: 'auto' }}>
                      <img src="/assets/maya.png" alt="Sophie" style={{ width: '100%', height: '100%', borderRadius: '50%', border: '2px solid var(--purple)' }} />
                    </div>
                    <b style={{ fontSize: 11, display: 'block', marginTop: 4 }}>Sophie</b>
                    <small style={{ fontSize: 9, color: 'var(--muted)' }}>Speaker</small>
                  </div>
                  <div>
                    <div style={{ position: 'relative', width: 54, height: 54, margin: 'auto' }}>
                      <img src="/assets/alex.png" alt="Noah" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                    </div>
                    <b style={{ fontSize: 11, display: 'block', marginTop: 4 }}>Noah</b>
                    <small style={{ fontSize: 9, color: 'var(--muted)' }}>Speaker</small>
                  </div>
                  <div>
                    <div style={{ position: 'relative', width: 54, height: 54, margin: 'auto' }}>
                      <img src={profileAvatar} alt={profileName} style={{ width: '100%', height: '100%', borderRadius: '50%', border: !isLiveRoomMuted ? '2px solid var(--mint)' : 'none' }} />
                    </div>
                    <b style={{ fontSize: 11, display: 'block', marginTop: 4 }}>You</b>
                    <small style={{ fontSize: 9, color: 'var(--muted)' }}>{isLiveRoomMuted ? 'Muted' : 'Speaking'}</small>
                  </div>
                </div>

                <div className="row" style={{ marginTop: 20 }}>
                  <button 
                    className="btn light" 
                    style={{ flex: 1 }}
                    onClick={() => {
                      playTapSound();
                      setIsHandRaised(!isHandRaised);
                      showToast(isHandRaised ? 'Hand lowered' : 'Hand raised ✋');
                    }}
                  >
                    <Hand className="w-4 h-4 inline mr-1" />
                    {isHandRaised ? 'Lower Hand' : 'Raise Hand'}
                  </button>
                  <button 
                    className="btn primary" 
                    style={{ flex: 1 }}
                    onClick={() => {
                      playTapSound();
                      setIsLiveRoomMuted(!isLiveRoomMuted);
                      showToast(isLiveRoomMuted ? 'Microphone active 🎙️' : 'Microphone muted 🔇');
                    }}
                  >
                    {isLiveRoomMuted ? <Mic className="w-4 h-4 inline mr-1" /> : <Mic className="w-4 h-4 inline mr-1 line-through" />}
                    {isLiveRoomMuted ? 'Unmute' : 'Mute'}
                  </button>
                </div>

                <button 
                  className="btn light" 
                  style={{ width: '100%', marginTop: 8, color: '#ef4444' }}
                  onClick={() => {
                    closeModal();
                    showToast('Left live room');
                  }}
                >
                  Leave Room Quietly
                </button>
              </div>
            )}

            {/* Story Viewer Modal */}
            {modalType === 'storyView' && activeStoryItem && (
              <div 
                style={{ textAlign: 'center' }}
                onMouseDown={() => setIsStoryPaused(true)}
                onMouseUp={() => setIsStoryPaused(false)}
                onTouchStart={() => setIsStoryPaused(true)}
                onTouchEnd={() => setIsStoryPaused(false)}
              >
                {/* Progress bars */}
                <div className="story-progress-bar">
                  {sparksList.map((_, i) => (
                    <div 
                      key={i} 
                      className={`story-progress-segment ${i <= activeStoryIndex ? 'fill' : ''}`} 
                    />
                  ))}
                </div>

                <div className="modal-header" style={{ marginBottom: 8, borderBottom: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                    <button className="modal-back-btn" onClick={closeModal}>
                      <ArrowLeft className="w-3.5 h-3.5 inline mr-1" /> Back
                    </button>
                    <img className="avatar" src={activeStoryItem.avatar} alt={activeStoryItem.user} style={{ width: 32, height: 32 }} />
                    <div style={{ textAlign: 'left' }}>
                      <b style={{ fontSize: 13, display: 'block' }}>{activeStoryItem.user}</b>
                      <small style={{ color: 'var(--muted)', fontSize: 10 }}>{activeStoryItem.time}</small>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <button 
                      disabled={activeStoryIndex === 0}
                      onClick={() => setActiveStoryIndex((p) => Math.max(0, p - 1))}
                      style={{ border: 0, background: 'var(--card-subtle)', borderRadius: 8, width: 28, height: 28, cursor: 'pointer', opacity: activeStoryIndex === 0 ? 0.3 : 1 }}
                      title="Previous Story"
                    >
                      ‹
                    </button>
                    <button 
                      disabled={activeStoryIndex === sparksList.length - 1}
                      onClick={() => setActiveStoryIndex((p) => Math.min(sparksList.length - 1, p + 1))}
                      style={{ border: 0, background: 'var(--card-subtle)', borderRadius: 8, width: 28, height: 28, cursor: 'pointer', opacity: activeStoryIndex === sparksList.length - 1 ? 0.3 : 1 }}
                      title="Next Story"
                    >
                      ›
                    </button>
                    <button 
                      className="modal-close-icon"
                      onClick={closeModal}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div 
                  style={{ borderRadius: 18, overflow: 'hidden', height: 260, background: '#eee', marginBottom: 14, position: 'relative' }}
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    if (x < rect.width * 0.4) {
                      setActiveStoryIndex((p) => Math.max(0, p - 1));
                    } else {
                      setActiveStoryIndex((p) => Math.min(sparksList.length - 1, p + 1));
                    }
                  }}
                >
                  <img 
                    src={activeStoryItem.image} 
                    alt={activeStoryItem.user} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, margin: 0, textAlign: 'left' }}>{activeStoryItem.caption}</p>
                  <button 
                    className={`spark-heart-btn ${likedSparks[activeStoryItem.id] ? 'liked' : ''}`}
                    onClick={(e) => handleToggleLikeSpark(activeStoryItem.id, e)}
                    style={{ position: 'static' }}
                  >
                    ❤️ {activeStoryItem.likes}
                  </button>
                </div>

                {/* Reply directly inside story */}
                <div style={{ display: 'flex', gap: 6 }}>
                  <input 
                    placeholder={`Reply to ${activeStoryItem.user}…`}
                    value={storyReplyInput}
                    onChange={(e) => setStoryReplyInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && storyReplyInput.trim()) {
                        const text = storyReplyInput.trim();
                        const targetName = activeStoryItem.user === 'Liam' ? 'Liam Chen' : activeStoryItem.user;
                        closeModal();
                        openChatRoom(targetName, activeStoryItem.avatar);
                        setTimeout(() => handleSendMessage(text), 200);
                      }
                    }}
                    style={{ flex: 1, border: '1px solid var(--line)', borderRadius: 16, padding: '10px 12px', fontSize: 12, outline: 0 }}
                  />
                  <button 
                    className="btn primary"
                    onClick={() => {
                      const text = storyReplyInput.trim() || 'Loved your spark! ✨';
                      const targetName = activeStoryItem.user === 'Liam' ? 'Liam Chen' : activeStoryItem.user;
                      closeModal();
                      openChatRoom(targetName, activeStoryItem.avatar);
                      setTimeout(() => handleSendMessage(text), 200);
                    }}
                  >
                    <Send className="w-3.5 h-3.5 inline mr-1" /> Send
                  </button>
                </div>
              </div>
            )}

            {/* Theme Picker Modal (8 Aesthetic Themes) */}
            {modalType === 'theme_picker' && (
              <div>
                <div className="modal-header">
                  <button className="modal-back-btn" onClick={closeModal}>
                    <ArrowLeft className="w-3.5 h-3.5 inline mr-1" /> Back
                  </button>
                  <h3>🎨 Interface Themes</h3>
                  <button className="modal-close-icon" onClick={closeModal}>
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <p style={{ fontSize: 11, color: 'var(--muted)', margin: '0 0 12px' }}>
                  Choose from 8 curated luxury color palettes tailored for high-contrast light and OLED dark modes.
                </p>

                <div className="theme-picker-grid">
                  {[
                    {
                      id: 'radiant',
                      name: 'Warm Radiant 🐰',
                      desc: 'Signature coral & purple',
                      colors: ['#ff607d', '#ff7b5f', '#7b5cf5'],
                    },
                    {
                      id: 'neon',
                      name: 'Neon Violet 🔮',
                      desc: 'Electric magenta & violet',
                      colors: ['#d946ef', '#ec4899', '#8b5cf6'],
                    },
                    {
                      id: 'mint',
                      name: 'Mint Nature 🌿',
                      desc: 'Emerald & azure blue',
                      colors: ['#10b981', '#14b8a6', '#3b82f6'],
                    },
                    {
                      id: 'ocean',
                      name: 'Ocean Sunset 🌅',
                      desc: 'Sunset amber & indigo',
                      colors: ['#f97316', '#fb923c', '#6366f1'],
                    },
                    {
                      id: 'cyberpunk',
                      name: 'Cyberpunk Glow ⚡',
                      desc: 'Neon gold, crimson & cyan',
                      colors: ['#facc15', '#f43f5e', '#06b6d4'],
                    },
                    {
                      id: 'midnight',
                      name: 'Midnight Frost 🌙',
                      desc: 'Ice sky blue & deep slate',
                      colors: ['#38bdf8', '#818cf8', '#6366f1'],
                    },
                    {
                      id: 'lavender',
                      name: 'Pastel Lavender 🌸',
                      desc: 'Dreamy blush & lilac',
                      colors: ['#f472b6', '#c084fc', '#a855f7'],
                    },
                    {
                      id: 'emerald',
                      name: 'Royal Emerald 💎',
                      desc: 'Imperial jade & gold',
                      colors: ['#10b981', '#059669', '#d97706'],
                    },
                  ].map((theme) => {
                    const isSelected = activeTheme === theme.id;
                    return (
                      <div
                        key={theme.id}
                        className={`theme-tile ${isSelected ? 'active' : ''}`}
                        onClick={() => {
                          playTapSound();
                          setActiveTheme(theme.id as ThemePreset);
                          showToast(`Applied ${theme.name}`);
                        }}
                      >
                        <div className="theme-swatch-row">
                          {theme.colors.map((c, i) => (
                            <span key={i} className="theme-swatch" style={{ background: c }} />
                          ))}
                        </div>
                        <span className="theme-tile-name">{theme.name}</span>
                        <span className="theme-tile-desc">{theme.desc}</span>
                        {isSelected && (
                          <span style={{ position: 'absolute', top: 8, right: 8, color: 'var(--coral)', fontSize: 13, fontWeight: 900 }}>
                            ✓
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                <button 
                  className="btn primary" 
                  style={{ width: '100%', marginTop: 6 }} 
                  onClick={closeModal}
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 8. MEDIA LIGHTBOX DIALOG */}
        {lightboxMedia && (
          <MediaLightbox
            url={lightboxMedia.url}
            type={lightboxMedia.type || 'image'}
            caption={lightboxMedia.caption}
            onClose={() => setLightboxMedia(null)}
          />
        )}

        {/* 9. TOAST NOTIFICATION PILL */}
        <div className={`toast ${toastMessage ? 'show' : ''}`} id="toast">
          {toastMessage}
        </div>
      </div>
    </MobileDeviceWrapper>
  );
};

export default App;
