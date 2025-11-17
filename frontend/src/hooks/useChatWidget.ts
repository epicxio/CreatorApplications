import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { chatService, ChatSettings, ChatUser } from '../services/chatService';

export const useChatWidget = () => {
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
  const [availableUsers, setAvailableUsers] = useState<ChatUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      // Load chat settings
      chatService.getChatSettings(user._id).then(setChatSettings);
      
      // Load available chat users
      chatService.getAvailableChatUsers(user._id).then(setAvailableUsers);
    }
  }, [user]);

  const sendMessage = async (message: string, type: 'text' | 'file' | 'voice', chatId?: string) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const chatIdToUse = chatId || 'global-chat';
      await chatService.sendMessage(chatIdToUse, message, type);
      return true;
    } catch (error) {
      console.error('Failed to send message:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const scheduleChat = async (scheduledTime: Date, duration: number = 30) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      await chatService.scheduleChat(user._id, scheduledTime, duration);
      return true;
    } catch (error) {
      console.error('Failed to schedule chat:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const canChatWithUser = async (targetUserId: string) => {
    if (!user) return false;
    
    try {
      return await chatService.canChatWithUser(user._id, targetUserId);
    } catch (error) {
      console.error('Failed to check chat permissions:', error);
      return false;
    }
  };

  return {
    user,
    chatSettings,
    availableUsers,
    isLoading,
    sendMessage,
    scheduleChat,
    canChatWithUser,
  };
}; 