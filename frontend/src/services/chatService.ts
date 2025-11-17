import api from './api';

export interface ChatMessage {
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

export interface ChatSettings {
  canInitiate: boolean;
  canRespond: boolean;
  allowFileSharing: boolean;
  allowVoiceMessages: boolean;
  allowScheduledChats: boolean;
  maxDailyMessages?: number;
  requiresCourseEnrollment?: boolean;
  requiresLessonCompletion?: number;
}

export interface ChatUser {
  id: string;
  name: string;
  role: string;
  avatar?: string;
}

class ChatService {
  // Get chat settings for a user
  async getChatSettings(userId: string): Promise<ChatSettings> {
    try {
      const response = await api.get(`/chat/settings/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching chat settings:', error);
      // Return default settings
      return {
        canInitiate: false,
        canRespond: true,
        allowFileSharing: false,
        allowVoiceMessages: false,
        allowScheduledChats: true,
        maxDailyMessages: 10,
        requiresCourseEnrollment: true,
        requiresLessonCompletion: 2,
      };
    }
  }

  // Send a message
  async sendMessage(chatId: string, message: string, type: 'text' | 'file' | 'voice'): Promise<ChatMessage> {
    try {
      const response = await api.post(`/chat/${chatId}/messages`, {
        text: message,
        type,
      });
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  // Get chat history
  async getChatHistory(chatId: string): Promise<ChatMessage[]> {
    try {
      const response = await api.get(`/chat/${chatId}/messages`);
      return response.data;
    } catch (error) {
      console.error('Error fetching chat history:', error);
      return [];
    }
  }

  // Schedule a chat
  async scheduleChat(userId: string, scheduledTime: Date, duration: number = 30): Promise<void> {
    try {
      await api.post('/chat/schedule', {
        userId,
        scheduledTime,
        duration,
      });
    } catch (error) {
      console.error('Error scheduling chat:', error);
      throw error;
    }
  }

  // Get available chat users for current user
  async getAvailableChatUsers(currentUserId: string): Promise<ChatUser[]> {
    try {
      const response = await api.get(`/chat/users/${currentUserId}/available`);
      return response.data;
    } catch (error) {
      console.error('Error fetching available chat users:', error);
      return [];
    }
  }

  // Check if user can chat with another user
  async canChatWithUser(currentUserId: string, targetUserId: string): Promise<boolean> {
    try {
      const response = await api.get(`/chat/permissions/${currentUserId}/${targetUserId}`);
      return response.data.canChat;
    } catch (error) {
      console.error('Error checking chat permissions:', error);
      return false;
    }
  }
}

export const chatService = new ChatService(); 