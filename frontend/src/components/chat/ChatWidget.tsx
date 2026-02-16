import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Avatar,
  Badge,
  Tooltip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  Menu,
  styled,
  keyframes,
} from '@mui/material';
import {
  Send as SendIcon,
  Minimize as MinimizeIcon,
  ChatBubbleOutline as ChatBubbleIcon,
  EmojiEmotions as EmojiIcon,
  AttachFile as AttachFileIcon,
  Mic as MicIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  KeyboardArrowUp as ArrowUpIcon,
  Settings as SettingsIcon,
  Group as GroupIcon,
  Person as PersonIcon,
  Lock as LockIcon,
  Public as PublicIcon,
  Add as AddIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

// Futuristic animations
const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const glow = keyframes`
  0% { box-shadow: 0 0 5px rgba(25, 118, 210, 0.5); }
  50% { box-shadow: 0 0 20px rgba(25, 118, 210, 0.8); }
  100% { box-shadow: 0 0 5px rgba(25, 118, 210, 0.5); }
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
  100% { transform: translateY(0px); }
`;

// Styled Components (theme required by MUI/styled API; unused in some)
/* eslint-disable @typescript-eslint/no-unused-vars */
const FloatingContainer = styled(Box)(({ theme }) => ({
  position: 'fixed',
  bottom: '20px',
  right: '20px',
  zIndex: 1000,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
}));

const MinimizedChat = styled(motion.div)(({ theme }) => ({
  width: '70px',
  height: '70px',
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  boxShadow: '0 8px 32px rgba(31, 38, 135, 0.37)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.18)',
  animation: `${float} 3s ease-in-out infinite`,
  position: 'relative',
  '&:hover': {
    animation: `${pulse} 1s ease-in-out infinite`,
    boxShadow: '0 12px 40px rgba(31, 38, 135, 0.5)',
  },
}));

const ExpandedChat = styled(motion.div)(({ theme }) => ({
  width: '329px', // Reduced by 30% from 470px
  height: '500px',
  borderRadius: '20px',
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 8px 32px rgba(31, 38, 135, 0.37)',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  animation: `${glow} 2s ease-in-out infinite`,
}));

const ChatHeader = styled(Box)(({ theme }) => ({
  padding: '16px 20px',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderRadius: '20px 20px 0 0',
}));

const ChatMessages = styled(Box)(({ theme }) => ({
  flex: 1,
  padding: '16px',
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  background: 'rgba(255, 255, 255, 0.05)',
  '&::-webkit-scrollbar': {
    width: '6px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '3px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '3px',
  },
}));

const MessageBubble = styled(motion.div)<{ isOwn: boolean }>(({ theme, isOwn }) => ({
  maxWidth: '80%',
  padding: '12px 16px',
  borderRadius: isOwn ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
  alignSelf: isOwn ? 'flex-end' : 'flex-start',
  background: isOwn 
    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    : 'rgba(255, 255, 255, 0.1)',
  color: isOwn ? 'white' : theme.palette.text.primary,
  backdropFilter: 'blur(10px)',
  border: `1px solid ${isOwn ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)'}`,
  wordWrap: 'break-word',
  position: 'relative',
}));

const ChatInput = styled(Box)(({ theme }) => ({
  padding: '16px 20px',
  background: 'rgba(255, 255, 255, 0.05)',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  borderRadius: '0 0 20px 20px',
}));

const EmojiPicker = styled(motion.div)(({ theme }) => ({
  position: 'absolute',
  bottom: '100%',
  left: "50%",
  transform: "translateX(-50%)",
  minWidth: "140px",
  maxWidth: "180px",
  marginBottom: "8px",
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '12px',
  padding: '8px',
  boxShadow: '0 8px 32px rgba(31, 38, 135, 0.37)',
  display: 'grid',
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: '4px',
  zIndex: 1001,
  overflow: "hidden",
}));

const EmojiButton = styled(Button)(({ theme }) => ({
  minWidth: '32px',
  height: '32px',
  fontSize: '16px',
  borderRadius: '8px',
  background: 'rgba(255, 255, 255, 0.1)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.2)',
    transform: 'scale(1.1)',
  },
}));
/* eslint-enable @typescript-eslint/no-unused-vars */

interface Message {
  id: string;
  text: string;
  sender: {
    id: string;
    name: string;
    role: string;
    avatar?: string;
  };
  timestamp: Date;
  type: 'text' | 'file' | 'voice';
  fileUrl?: string;
  fileName?: string;
}

interface Channel {
  id: string;
  name: string;
  description?: string;
  isPrivate: boolean;
  members: string[];
  createdBy: string;
  createdAt: Date;
}

interface _DirectMessage {
  id: string;
  participants: string[];
  lastMessage?: Message;
  unreadCount: number;
}

type ChatType = 'dm' | 'channel';

interface ChatWidgetProps {
  currentUser: {
    id: string;
    name: string;
    role: string;
    avatar?: string;
  };
  otherUser?: {
    id: string;
    name: string;
    role: string;
    avatar?: string;
  };
  currentChannel?: Channel;
  availableUsers?: Array<{
    id: string;
    name: string;
    role: string;
    avatar?: string;
  }>;
  availableChannels?: Channel[];
  chatSettings: {
    canInitiate: boolean;
    canRespond: boolean;
    allowFileSharing: boolean;
    allowVoiceMessages: boolean;
    allowScheduledChats: boolean;
    maxDailyMessages?: number;
    requiresCourseEnrollment?: boolean;
    requiresLessonCompletion?: number;
  };
  onSendMessage: (_message: string, _type: 'text' | 'file' | 'voice') => void;
  onScheduleChat?: (_scheduledTime: Date) => void;
  onCreateChannel?: (_channelData: { name: string; description: string; isPrivate: boolean }) => void;
  onJoinChannel?: (_channelId: string) => void;
  onStartDM?: (_userId: string) => void;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({
  currentUser,
  otherUser,
  currentChannel: _currentChannel,
  availableUsers: _availableUsers = [],
  availableChannels: _availableChannels = [],
  chatSettings,
  onSendMessage,
  onScheduleChat: _onScheduleChat,
  onCreateChannel,
  onJoinChannel: _onJoinChannel,
  onStartDM: _onStartDM,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [dailyMessageCount, setDailyMessageCount] = useState(0);
  const [canSendMessage, setCanSendMessage] = useState(true);
  const [restrictionMessage, setRestrictionMessage] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [botEnabled, setBotEnabled] = useState(true);
  const [botName, setBotName] = useState('Support Bot');
  const [botAvatar, setBotAvatar] = useState('🤖');
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [workingHours, setWorkingHours] = useState({ start: '09:00', end: '18:00' });
  const [responseTime, setResponseTime] = useState('Immediate');
  const [autoAway, setAutoAway] = useState(10); // minutes
  const [currentChatType, setCurrentChatType] = useState<ChatType>('dm');
  const [_showChannelList, _setShowChannelList] = useState(false);
  const [_showUserList, _setShowUserList] = useState(false);
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [newChannelData, setNewChannelData] = useState({ 
    name: '', 
    description: '', 
    isPrivate: false,
    members: [] as string[]
  });
  const [_searchTerm, _setSearchTerm] = useState('');
  const [currentView, setCurrentView] = useState<'list' | 'chat'>('list');
  const [selectedDM, setSelectedDM] = useState<string | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [moreOptionsOpen, setMoreOptionsOpen] = useState(false);
  const [moreOptionsAnchor, setMoreOptionsAnchor] = useState<null | HTMLElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Emoji list
  const emojis = ['😊', '😂', '❤️', '👍', '🎉', '🔥', '💯', '👏', '🙏', '😍', '🤔', '😅', '😎', '🤩', '😭', '😡', '😴', '🤗', '😇', '🥳', '🤠', '👻', '🤖', '👽', '💪', '🧠', '💡', '🎯', '🚀', '⭐', '🌟', '💫'];

  // Add a static list of common timezones
  const timezones = [
    'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
    'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Moscow',
    'Asia/Kolkata', 'Asia/Shanghai', 'Asia/Tokyo', 'Asia/Singapore',
    'Australia/Sydney', 'Australia/Perth', 'Pacific/Auckland',
  ];

  // Sample data for channels and users
  const sampleChannels: Channel[] = [
    {
      id: '1',
      name: 'General',
      description: 'General discussion for everyone',
      isPrivate: false,
      members: ['user1', 'user2', 'user3'],
      createdBy: 'user1',
      createdAt: new Date('2024-01-01'),
    },
    {
      id: '2',
      name: 'Course Discussion',
      description: 'Discuss course materials and assignments',
      isPrivate: false,
      members: ['user1', 'user2'],
      createdBy: 'user1',
      createdAt: new Date('2024-01-15'),
    },
    {
      id: '3',
      name: 'Study Group',
      description: 'Private study group for advanced learners',
      isPrivate: true,
      members: ['user1', 'user3'],
      createdBy: 'user3',
      createdAt: new Date('2024-02-01'),
    },
  ];

  const sampleUsers = [
    { id: 'user1', name: 'John Doe', role: 'learner', avatar: undefined },
    { id: 'user2', name: 'Jane Smith', role: 'creator', avatar: undefined },
    { id: 'user3', name: 'Mike Johnson', role: 'learner', avatar: undefined },
    { id: 'user4', name: 'Sarah Wilson', role: 'admin', avatar: undefined },
  ];

  // Sample DM conversations with last messages
  const sampleDMs = [
    {
      id: 'dm1',
      user: sampleUsers[0],
      lastMessage: 'Thanks for the help!',
      timestamp: new Date(Date.now() - 300000), // 5 minutes ago
      unreadCount: 0
    },
    {
      id: 'dm2',
      user: sampleUsers[1],
      lastMessage: 'When is the next class?',
      timestamp: new Date(Date.now() - 600000), // 10 minutes ago
      unreadCount: 2
    },
    {
      id: 'dm3',
      user: sampleUsers[2],
      lastMessage: 'Got it, thanks!',
      timestamp: new Date(Date.now() - 900000), // 15 minutes ago
      unreadCount: 0
    },
    {
      id: 'dm4',
      user: sampleUsers[3],
      lastMessage: 'Hello! How can I help you today? 👋',
      timestamp: new Date(Date.now() - 120000), // 2 minutes ago
      unreadCount: 0
    },
  ];

  // Simulate initial messages
  useEffect(() => {
    const getCurrentChatUser = () => {
      if (currentChatType === 'dm' && selectedDM) {
        const dm = sampleDMs.find(d => d.id === selectedDM);
        return dm?.user;
      }
      return otherUser;
    };

    const chatUser = getCurrentChatUser();
    
    const initialMessages: Message[] = [
      {
        id: '1',
        text: 'Hello! How can I help you today? 👋',
        sender: chatUser || otherUser,
        timestamp: new Date(Date.now() - 60000),
        type: 'text',
      },
      {
        id: '2',
        text: 'I have a question about the course content 🤔',
        sender: currentUser,
        timestamp: new Date(Date.now() - 30000),
        type: 'text',
      },
    ];
    setMessages(initialMessages);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sampleDMs is static
  }, [currentUser, otherUser, selectedDM, currentChatType]);

  // Check permissions
  useEffect(() => {
    let canSend = true;
    let message = '';

    if (messages.length === 0 && !chatSettings.canInitiate) {
      canSend = false;
      message = 'You cannot initiate conversations.';
    }

    if (chatSettings.maxDailyMessages && dailyMessageCount >= chatSettings.maxDailyMessages) {
      canSend = false;
      message = `Daily limit: ${chatSettings.maxDailyMessages} messages.`;
    }

    if (chatSettings.requiresCourseEnrollment) {
      const isEnrolled = true; // Simulate check
      if (!isEnrolled) {
        canSend = false;
        message = 'Course enrollment required.';
      }
    }

    if (chatSettings.requiresLessonCompletion && chatSettings.requiresLessonCompletion > 0) {
      const completedLessons = 1; // Simulate check
      if (completedLessons < chatSettings.requiresLessonCompletion) {
        canSend = false;
        message = `Complete ${chatSettings.requiresLessonCompletion} lessons first.`;
      }
    }

    setCanSendMessage(canSend);
    setRestrictionMessage(message);
  }, [chatSettings, dailyMessageCount, messages.length]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !canSendMessage) return;

    const message: Message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: currentUser,
      timestamp: new Date(),
      type: 'text',
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
    setDailyMessageCount(prev => prev + 1);
    onSendMessage(newMessage, 'text');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEmojiClick = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as Element;
    if (showEmojiPicker && !target.closest('.emoji-picker') && !target.closest('.emoji-button')) {
      setShowEmojiPicker(false);
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && showEmojiPicker) {
      setShowEmojiPicker(false);
    }
  };

  useEffect(() => {
    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- handlers are stable
  }, [showEmojiPicker]);

  const toggleChat = () => {
    setIsExpanded(!isExpanded);
    setShowEmojiPicker(false);
  };

  const handleSelectDM = (dmId: string) => {
    setSelectedDM(dmId);
    setSelectedChannel(null);
    setCurrentView('chat');
    setCurrentChatType('dm');
  };

  const handleSelectChannel = (channelId: string) => {
    setSelectedChannel(channelId);
    setSelectedDM(null);
    setCurrentView('chat');
    setCurrentChatType('channel');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedDM(null);
    setSelectedChannel(null);
  };

  const _getCurrentChatInfo = () => {
    if (currentChatType === 'dm' && selectedDM) {
      const dm = sampleDMs.find(d => d.id === selectedDM);
      return dm?.user;
    }
    if (currentChatType === 'channel' && selectedChannel) {
      return sampleChannels.find(c => c.id === selectedChannel);
    }
    return null;
  };

  const getCurrentChannel = () => {
    if (currentChatType === 'channel' && selectedChannel) {
      return sampleChannels.find(c => c.id === selectedChannel);
    }
    return null;
  };

  const getCurrentDMUser = () => {
    if (currentChatType === 'dm' && selectedDM) {
      const dm = sampleDMs.find(d => d.id === selectedDM);
      return dm?.user;
    }
    return null;
  };

  const handleMoreOptionsClick = (event: React.MouseEvent<HTMLElement>) => {
    setMoreOptionsAnchor(event.currentTarget);
    setMoreOptionsOpen(true);
  };

  const handleMoreOptionsClose = () => {
    setMoreOptionsOpen(false);
    setMoreOptionsAnchor(null);
  };

  const handleSettingsClick = () => {
    setSettingsOpen(true);
    handleMoreOptionsClose();
  };

  const handleScheduleChatClick = () => {
    // Handle schedule chat functionality
    handleMoreOptionsClose();
  };

  const handleCreateChannelClick = () => {
    setShowCreateChannel(true);
    handleMoreOptionsClose();
  };

  return (
    <FloatingContainer>
      <AnimatePresence>
        {isExpanded ? (
          <Box sx={{ position: 'relative' }}>
            {/* Minimize Button - Top Right */}
            <Box sx={{ 
              position: 'absolute', 
              top: -8, 
              right: -8, 
              zIndex: 1 
            }}>
              <Tooltip title="Minimize">
                <IconButton 
                  size="small" 
                  onClick={toggleChat} 
                  sx={{ 
                    background: 'rgba(255,255,255,0.9)',
                    color: '#666',
                    borderRadius: '50%',
                    width: 24,
                    height: 24,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    '&:hover': { 
                      background: 'rgba(255,255,255,1)',
                      transform: 'scale(1.1)'
                    }
                  }}
                >
                  <MinimizeIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </Tooltip>
            </Box>
            <ExpandedChat
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
            <ChatHeader>
              {/* Left Section - Chat Type Selectors or Back Button */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {currentView === 'list' ? (
                  <>
                    <Tooltip title="Direct Messages">
                      <IconButton
                        size="small"
                        onClick={() => setCurrentChatType('dm')}
                        sx={{ 
                          color: currentChatType === 'dm' ? 'white' : 'rgba(255,255,255,0.7)',
                          background: currentChatType === 'dm' ? 'rgba(255,255,255,0.2)' : 'transparent',
                          borderRadius: '50%',
                          width: 32,
                          height: 32,
                          '&:hover': { background: 'rgba(255,255,255,0.1)' }
                        }}
                      >
                        <PersonIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Channels">
                      <IconButton
                        size="small"
                        onClick={() => setCurrentChatType('channel')}
                        sx={{ 
                          color: currentChatType === 'channel' ? 'white' : 'rgba(255,255,255,0.7)',
                          background: currentChatType === 'channel' ? 'rgba(255,255,255,0.2)' : 'transparent',
                          borderRadius: '50%',
                          width: 32,
                          height: 32,
                          '&:hover': { background: 'rgba(255,255,255,0.1)' }
                        }}
                      >
                        <GroupIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Tooltip>
                  </>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Tooltip title="Back to List">
                      <IconButton
                        size="small"
                        onClick={handleBackToList}
                        sx={{ 
                          color: 'white',
                          borderRadius: '50%',
                          width: 32,
                          height: 32,
                          '&:hover': { background: 'rgba(255,255,255,0.1)' }
                        }}
                      >
                        <ArrowUpIcon sx={{ fontSize: 18, transform: 'rotate(-90deg)' }} />
                      </IconButton>
                    </Tooltip>
                    {currentChatType === 'channel' && getCurrentChannel() && (
                      <>
                        <Avatar 
                          sx={{ 
                            width: 28, 
                            height: 28,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}
                        >
                          {getCurrentChannel()?.name.charAt(0)}
                        </Avatar>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'white' }}>
                            {getCurrentChannel()?.name}
                          </Typography>
                          {getCurrentChannel()?.isPrivate ? (
                            <LockIcon sx={{ fontSize: 14, color: 'white' }} />
                          ) : (
                            <PublicIcon sx={{ fontSize: 14, color: 'white' }} />
                          )}
                        </Box>
                      </>
                    )}
                  </Box>
                )}
              </Box>

              {/* Center Section - Current Chat Info */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2, 
                flex: 1, 
                justifyContent: 'center',
                ml: 2
              }}>
                {currentView === 'list' ? (
                  <Box sx={{ width: 1 }} /> // Empty space to center the content
                ) : (
                  <>
                    {currentChatType === 'dm' && getCurrentDMUser() && (
                      <Box sx={{ width: 1 }} /> // Empty space to center the content
                    )}

                    {currentChatType === 'channel' && getCurrentChannel() && (
                      <Box sx={{ width: 1 }} /> // Empty space to center the content
                    )}
                  </>
                )}
              </Box>

              {/* Right Section - Action Buttons */}
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <Tooltip title="Search">
                  <IconButton 
                    size="small" 
                    sx={{ 
                      color: 'white',
                      borderRadius: '50%',
                      width: 28,
                      height: 28,
                      '&:hover': { background: 'rgba(255,255,255,0.1)' }
                    }}
                  >
                    <SearchIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="More Options">
                  <IconButton 
                    size="small" 
                    onClick={handleMoreOptionsClick}
                    sx={{ 
                      color: 'white',
                      borderRadius: '50%',
                      width: 28,
                      height: 28,
                      '&:hover': { background: 'rgba(255,255,255,0.1)' }
                    }}
                  >
                    <MoreVertIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>

              </Box>
            </ChatHeader>

                        <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
              {currentView === 'list' ? (
                // Conversation List View
                <Box sx={{ flex: 1, overflow: 'hidden' }}>
                  {currentChatType === 'dm' ? (
                    // DM List
                    <Box sx={{ p: 2, height: '100%', overflowY: 'auto' }}>
                      {sampleDMs.map((dm) => (
                        <Box
                          key={dm.id}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            p: 2,
                            mb: 1,
                            borderRadius: '12px',
                            cursor: 'pointer',
                            background: 'rgba(255,255,255,0.05)',
                            '&:hover': { background: 'rgba(255,255,255,0.1)' }
                          }}
                          onClick={() => handleSelectDM(dm.id)}
                        >
                          <Badge
                            overlap="circular"
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            badgeContent={
                              dm.unreadCount > 0 ? (
                                <Box sx={{ 
                                  width: 16, 
                                  height: 16, 
                                  borderRadius: '50%', 
                                  background: '#ff6b6b',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '10px',
                                  color: 'white',
                                  fontWeight: 'bold'
                                }}>
                                  {dm.unreadCount}
                                </Box>
                              ) : (
                                <CheckCircleIcon sx={{ fontSize: 12, color: '#4caf50' }} />
                              )
                            }
                          >
                            <Avatar 
                              src={dm.user.avatar}
                              sx={{ 
                                width: 48, 
                                height: 48,
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                fontSize: '18px',
                                fontWeight: 'bold'
                              }}
                            >
                              {dm.user.name.charAt(0)}
                            </Avatar>
                          </Badge>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#333' }}>
                              {dm.user.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'rgba(0,0,0,0.6)' }}>
                              {dm.timestamp.toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short'
                              }) + ' ' + dm.timestamp.toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </Typography>
                          </Box>
                          <Typography variant="body2" sx={{ 
                            color: 'rgba(0,0,0,0.8)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {dm.lastMessage}
                          </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    // Channel List
                    <Box sx={{ p: 2, height: '100%', overflowY: 'auto' }}>


                      {/* Private Channels */}
                      <Typography variant="caption" sx={{ 
                        color: 'rgba(0,0,0,0.7)', 
                        mb: 1, 
                        display: 'block',
                        fontWeight: 'bold'
                      }}>
                        🔒 Private Channels
                      </Typography>
                      {sampleChannels.filter(c => c.isPrivate).map((channel) => (
                        <Box
                          key={channel.id}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            p: 2,
                            mb: 1,
                            borderRadius: '12px',
                            cursor: 'pointer',
                            background: 'rgba(255,255,255,0.05)',
                            '&:hover': { background: 'rgba(255,255,255,0.1)' }
                          }}
                          onClick={() => handleSelectChannel(channel.id)}
                        >
                          <Avatar 
                            sx={{ 
                              width: 48, 
                              height: 48,
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              fontSize: '18px',
                              fontWeight: 'bold'
                            }}
                          >
                            {channel.name.charAt(0)}
                          </Avatar>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#333' }}>
                                {channel.name}
                              </Typography>
                              <LockIcon sx={{ fontSize: 14, color: 'rgba(0,0,0,0.7)' }} />
                            </Box>
                            <Typography variant="body2" sx={{ 
                              color: 'rgba(0,0,0,0.8)',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {channel.description}
                            </Typography>
                          </Box>
                        </Box>
                      ))}

                      {/* Public Channels */}
                      <Typography variant="caption" sx={{ 
                        color: 'rgba(0,0,0,0.7)', 
                        mb: 1, 
                        display: 'block',
                        fontWeight: 'bold',
                        mt: 2
                      }}>
                        🌐 Public Channels
                      </Typography>
                      {sampleChannels.filter(c => !c.isPrivate).map((channel) => (
                        <Box
                          key={channel.id}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            p: 2,
                            mb: 1,
                            borderRadius: '12px',
                            cursor: 'pointer',
                            background: 'rgba(255,255,255,0.05)',
                            '&:hover': { background: 'rgba(255,255,255,0.1)' }
                          }}
                          onClick={() => handleSelectChannel(channel.id)}
                        >
                          <Avatar 
                            sx={{ 
                              width: 48, 
                              height: 48,
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              fontSize: '18px',
                              fontWeight: 'bold'
                            }}
                          >
                            {channel.name.charAt(0)}
                          </Avatar>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#333' }}>
                                {channel.name}
                              </Typography>
                              <PublicIcon sx={{ fontSize: 14, color: 'rgba(0,0,0,0.7)' }} />
                            </Box>
                            <Typography variant="body2" sx={{ 
                              color: 'rgba(0,0,0,0.8)',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {channel.description}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              ) : (
                // Chat View
                <ChatMessages>
                                  {messages.map((message, index) => {
                  const isOwn = message.sender.id === currentUser.id;
                  const getCurrentChatUser = () => {
                    if (currentChatType === 'dm' && selectedDM) {
                      const dm = sampleDMs.find(d => d.id === selectedDM);
                      return dm?.user;
                    }
                    return otherUser;
                  };
                  
                  const chatUser = getCurrentChatUser();
                  
                  return (
                    <motion.div
                      key={message.id}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isOwn ? 'flex-end' : 'flex-start',
                        marginBottom: '8px',
                      }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      {!isOwn ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <Avatar 
                            src={chatUser?.avatar}
                            sx={{ 
                              width: 20, 
                              height: 20,
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              fontSize: '10px',
                              fontWeight: 'bold'
                            }}
                          >
                            {chatUser?.name.charAt(0)}
                          </Avatar>
                          <Typography variant="caption" sx={{ fontSize: '11px', opacity: 0.7 }}>
                            {chatUser?.name}
                          </Typography>
                        </Box>
                      ) : (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, justifyContent: 'flex-end' }}>
                          <Typography variant="caption" sx={{ fontSize: '11px', opacity: 0.7 }}>
                            {message.sender.name}
                          </Typography>
                          <Avatar 
                            src={message.sender.avatar}
                            sx={{ 
                              width: 20, 
                              height: 20,
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              fontSize: '10px',
                              fontWeight: 'bold'
                            }}
                          >
                            {message.sender.name.charAt(0)}
                          </Avatar>
                        </Box>
                      )}
                        <MessageBubble isOwn={isOwn}>
                          <Typography variant="body2" sx={{ fontSize: '14px' }}>
                            {message.text}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              opacity: 0.7, 
                              display: 'block', 
                              mt: 0.5,
                              fontSize: '10px'
                            }}
                          >
                            {message.timestamp.toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            }) + ' ' + message.timestamp.toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </Typography>
                        </MessageBubble>
                      </motion.div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </ChatMessages>
              )}
            </Box>

            {currentView === 'chat' && (
              <>
                {!canSendMessage && (
                  <Alert 
                    severity="warning" 
                    sx={{ 
                      mx: 2, 
                      mb: 1,
                      fontSize: '12px',
                      '& .MuiAlert-message': { fontSize: '12px' }
                    }}
                  >
                    {restrictionMessage}
                  </Alert>
                )}

                <ChatInput>
              <Box sx={{ position: 'relative', flex: 1 }}>
                <TextField
                  fullWidth
                  multiline
                  maxRows={3}
                  placeholder={canSendMessage ? "Type your message..." : "You cannot send messages"}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={!canSendMessage}
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '20px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      '&:hover': {
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                      },
                      '&.Mui-focused': {
                        border: '1px solid rgba(102, 126, 234, 0.5)',
                      },
                    },
                    '& .MuiInputBase-input': {
                      fontSize: '14px',
                      color: 'black',
                      '&::placeholder': {
                        color: 'rgba(0, 0, 0, 0.6)',
                        opacity: 1,
                      },
                    },
                  }}
                />
                <AnimatePresence>
                  {showEmojiPicker && (
                    <EmojiPicker
                      className="emoji-picker"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                    >
                      {emojis.map((emoji, index) => (
                        <EmojiButton
                          key={index}
                          onClick={() => handleEmojiClick(emoji)}
                          sx={{ fontSize: '16px' }}
                        >
                          {emoji}
                        </EmojiButton>
                      ))}
                    </EmojiPicker>
                  )}
                </AnimatePresence>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="Emoji">
                  <IconButton
                    className="emoji-button"
                    size="small"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    sx={{ 
                      color: showEmojiPicker ? '#FFA500' : '#FFD700',
                      background: showEmojiPicker ? 'rgba(255, 165, 0, 0.1)' : 'transparent',
                      borderRadius: '8px',
                      '&:hover': { 
                        color: '#FFA500',
                        background: 'rgba(255, 165, 0, 0.1)'
                      }
                    }}
                  >
                    <EmojiIcon />
                  </IconButton>
                </Tooltip>
                {chatSettings.allowFileSharing && (
                  <Tooltip title="Attach File">
                    <IconButton
                      size="small"
                      disabled={!canSendMessage}
                      sx={{ 
                        color: 'rgba(255, 255, 255, 0.7)',
                        '&:hover': { color: 'white' }
                      }}
                    >
                      <AttachFileIcon />
                    </IconButton>
                  </Tooltip>
                )}
                {chatSettings.allowVoiceMessages && (
                  <Tooltip title="Voice Message">
                    <IconButton
                      size="small"
                      disabled={!canSendMessage}
                      sx={{ 
                        color: 'rgba(255, 255, 255, 0.7)',
                        '&:hover': { color: 'white' }
                      }}
                    >
                      <MicIcon />
                    </IconButton>
                  </Tooltip>
                )}
                <IconButton
                  color="primary"
                  onClick={handleSendMessage}
                  disabled={!canSendMessage}
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                    },
                    '&:disabled': {
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: 'rgba(255, 255, 255, 0.3)',
                    },
                  }}
                >
                  <SendIcon />
                </IconButton>
              </Box>
            </ChatInput>
              </>
            )}
                      </ExpandedChat>
          </Box>
        ) : (
          <Box sx={{ position: 'relative' }}>
            <MinimizedChat
              onClick={toggleChat}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <ChatBubbleIcon sx={{ color: 'white', fontSize: 28 }} />
            </MinimizedChat>
            {messages.length > 0 && (
              <Box
                sx={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-8px',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  border: '2px solid white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  animation: `${pulse} 2s ease-in-out infinite`,
                }}
              >
                {messages.length}
              </Box>
            )}
          </Box>
        )}
      </AnimatePresence>

      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Chat Settings</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Switch checked={botEnabled} onChange={e => setBotEnabled(e.target.checked)} />
            <Typography sx={{ ml: 1 }}>Enable AI Bot</Typography>
          </Box>
          <TextField
            label="Bot Name"
            value={botName}
            onChange={e => setBotName(e.target.value)}
            fullWidth
            margin="dense"
            sx={{ mb: 2 }}
          />
          <TextField
            label="Bot Avatar (emoji or URL)"
            value={botAvatar}
            onChange={e => setBotAvatar(e.target.value)}
            fullWidth
            margin="dense"
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
            <InputLabel>Timezone</InputLabel>
            <Select
              value={timezone}
              label="Timezone"
              onChange={e => setTimezone(e.target.value)}
            >
              {timezones.map(tz => (
                <MenuItem key={tz} value={tz}>{tz}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              label="Working Start"
              type="time"
              value={workingHours.start}
              onChange={e => setWorkingHours({ ...workingHours, start: e.target.value })}
              InputLabelProps={{ shrink: true }}
              inputProps={{ step: 300 }}
              fullWidth
            />
            <TextField
              label="Working End"
              type="time"
              value={workingHours.end}
              onChange={e => setWorkingHours({ ...workingHours, end: e.target.value })}
              InputLabelProps={{ shrink: true }}
              inputProps={{ step: 300 }}
              fullWidth
            />
          </Box>
          <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
            <InputLabel>Response Time</InputLabel>
            <Select
              value={responseTime}
              label="Response Time"
              onChange={e => setResponseTime(e.target.value)}
            >
              <MenuItem value="Immediate">Immediate</MenuItem>
              <MenuItem value="Within 1 hour">Within 1 hour</MenuItem>
              <MenuItem value="Within 24 hours">Within 24 hours</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Auto-away (minutes)"
            type="number"
            value={autoAway}
            onChange={e => setAutoAway(Number(e.target.value))}
            fullWidth
            margin="dense"
            inputProps={{ min: 1, max: 120 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)} color="primary">Close</Button>
        </DialogActions>
      </Dialog>

      {/* Create Channel Dialog */}
      <Dialog open={showCreateChannel} onClose={() => setShowCreateChannel(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Channel</DialogTitle>
        <DialogContent dividers>
          <TextField
            label="Channel Name"
            value={newChannelData.name}
            onChange={(e) => setNewChannelData({ ...newChannelData, name: e.target.value })}
            fullWidth
            margin="dense"
            sx={{ mb: 2 }}
            placeholder="e.g., General Discussion"
          />
          <TextField
            label="Description"
            value={newChannelData.description}
            onChange={(e) => setNewChannelData({ ...newChannelData, description: e.target.value })}
            fullWidth
            margin="dense"
            multiline
            rows={3}
            sx={{ mb: 2 }}
            placeholder="What is this channel about?"
          />
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Switch 
              checked={newChannelData.isPrivate} 
              onChange={(e) => setNewChannelData({ ...newChannelData, isPrivate: e.target.checked })}
            />
            <Box sx={{ ml: 1 }}>
              <Typography variant="body2">Private Channel</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Only invited members can join
              </Typography>
            </Box>
          </Box>

          {/* Member Selection */}
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Add Members
          </Typography>
          <Box sx={{ maxHeight: 200, overflowY: 'auto', border: '1px solid #e0e0e0', borderRadius: 1, p: 1 }}>
            {sampleUsers.map((user) => (
              <Box
                key={user.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  p: 1,
                  borderRadius: 1,
                  cursor: 'pointer',
                  '&:hover': { background: '#f5f5f5' },
                  background: newChannelData.members.includes(user.id) ? '#e3f2fd' : 'transparent'
                }}
                onClick={() => {
                  const newMembers = newChannelData.members.includes(user.id)
                    ? newChannelData.members.filter(id => id !== user.id)
                    : [...newChannelData.members, user.id];
                  setNewChannelData({ ...newChannelData, members: newMembers });
                }}
              >
                <Avatar 
                  sx={{ 
                    width: 32, 
                    height: 32,
                    fontSize: '12px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  }}
                >
                  {user.name.charAt(0)}
                </Avatar>
                <Typography variant="body2" sx={{ flex: 1 }}>
                  {user.name}
                </Typography>
                {newChannelData.members.includes(user.id) && (
                  <CheckCircleIcon sx={{ color: '#4caf50', fontSize: 20 }} />
                )}
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreateChannel(false)}>Cancel</Button>
          <Button 
            onClick={() => {
              onCreateChannel?.(newChannelData);
              setNewChannelData({ name: '', description: '', isPrivate: false, members: [] });
              setShowCreateChannel(false);
            }}
            variant="contained"
            disabled={!newChannelData.name.trim()}
          >
            Create Channel
          </Button>
        </DialogActions>
      </Dialog>

      {/* More Options Menu */}
      <Menu
        anchorEl={moreOptionsAnchor}
        open={moreOptionsOpen}
        onClose={handleMoreOptionsClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            minWidth: '160px',
          }
        }}
      >
        <MenuItem onClick={handleSettingsClick} sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          py: 1.5,
          px: 2
        }}>
          <SettingsIcon sx={{ fontSize: 18, color: 'rgba(0,0,0,0.7)' }} />
          <Typography variant="body2">Settings</Typography>
        </MenuItem>
        {currentChatType === 'channel' && (
          <MenuItem onClick={handleCreateChannelClick} sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            py: 1.5,
            px: 2
          }}>
            <AddIcon sx={{ fontSize: 18, color: 'rgba(0,0,0,0.7)' }} />
            <Typography variant="body2">Create Channel</Typography>
          </MenuItem>
        )}
        {chatSettings.allowScheduledChats && (
          <MenuItem onClick={handleScheduleChatClick} sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            py: 1.5,
            px: 2
          }}>
            <ScheduleIcon sx={{ fontSize: 18, color: 'rgba(0,0,0,0.7)' }} />
            <Typography variant="body2">Schedule Chat</Typography>
          </MenuItem>
        )}
      </Menu>
    </FloatingContainer>
  );
};

export default ChatWidget; 