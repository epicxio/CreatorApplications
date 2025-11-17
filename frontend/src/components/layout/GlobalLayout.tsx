import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { Navbar } from '../common/Navbar';
import { ChatProvider } from '../../contexts/ChatContext';
import ChatWidget from '../chat/ChatWidget';
import { chatService, ChatSettings, ChatUser } from '../../services/chatService';
import { useAuth } from '../../context/AuthContext';

interface GlobalLayoutProps {
  children: React.ReactNode;
}

export const GlobalLayout: React.FC<GlobalLayoutProps> = ({ children }) => {
  const { user } = useAuth();
  const [chatSettings, setChatSettings] = useState<ChatSettings>({
    canInitiate: false,
    canRespond: true,
    allowFileSharing: false,
    allowVoiceMessages: false,
    allowScheduledChats: true,
    maxDailyMessages: 10,
    requiresCourseEnrollment: true,
    requiresLessonCompletion: 2,
  });

  useEffect(() => {
    if (user) {
      // Load chat settings for the current user
      chatService.getChatSettings(user._id).then(setChatSettings);
    }
  }, [user]);

  const currentUser: ChatUser = user ? {
    id: user._id,
    name: user.name,
    role: user.role?.name || 'user',
  } : {
    id: '1',
    name: 'Guest User',
    role: 'learner'
  };

  const supportUser: ChatUser = {
    id: 'support-1',
    name: 'Sarah Johnson',
    role: 'support'
  };

  return (
    <ChatProvider>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <Box
          component="main"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minHeight: '90vh',
            pt: 2,
            backgroundColor: 'background.default',
            width: '100%',
            mt: '64px', // Space for navbar
          }}
        >
          {children}
        </Box>
        
        {/* Global Chat Widget - Only show if user is authenticated */}
        {user && (
          <ChatWidget
            currentUser={currentUser}
            otherUser={supportUser}
            chatSettings={chatSettings}
            onSendMessage={async (message, type) => {
              try {
                await chatService.sendMessage('global-chat', message, type);
                console.log('Message sent successfully');
              } catch (error) {
                console.error('Failed to send message:', error);
              }
            }}
            onScheduleChat={async (scheduledTime) => {
              try {
                await chatService.scheduleChat(user._id, scheduledTime);
                console.log('Chat scheduled successfully');
              } catch (error) {
                console.error('Failed to schedule chat:', error);
              }
            }}
            onCreateChannel={(channelData) => {
              console.log('Create channel:', channelData);
            }}
            onJoinChannel={(channelId) => {
              console.log('Join channel:', channelId);
            }}
            onStartDM={(userId) => {
              console.log('Start DM with:', userId);
            }}
          />
        )}
      </Box>
    </ChatProvider>
  );
};

export default GlobalLayout;