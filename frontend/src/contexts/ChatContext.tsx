import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ChatUser {
  id: string;
  name: string;
  role: string;
  avatar?: string;
}

interface ChatSettings {
  canInitiate: boolean;
  canRespond: boolean;
  allowFileSharing: boolean;
  allowVoiceMessages: boolean;
  allowScheduledChats: boolean;
  maxDailyMessages?: number;
  requiresCourseEnrollment?: boolean;
  requiresLessonCompletion?: number;
}

interface ChatContextType {
  currentUser: ChatUser | null;
  otherUser: ChatUser | null;
  chatSettings: ChatSettings;
  isChatEnabled: boolean;
  setCurrentUser: (_user: ChatUser) => void;
  setOtherUser: (_user: ChatUser) => void;
  setChatSettings: (_settings: ChatSettings) => void;
  setIsChatEnabled: (_enabled: boolean) => void;
  handleSendMessage: (_message: string, _type: 'text' | 'file' | 'voice') => void;
  handleScheduleChat: (_scheduledTime: Date) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<ChatUser | null>(null);
  const [otherUser, setOtherUser] = useState<ChatUser | null>(null);
  const [isChatEnabled, setIsChatEnabled] = useState(false);
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

  const handleSendMessage = (_message: string, _type: 'text' | 'file' | 'voice') => {
    // TODO: Implement actual message sending logic
  };

  const handleScheduleChat = (_scheduledTime: Date) => {
    // TODO: Implement actual chat scheduling logic
  };

  const value: ChatContextType = {
    currentUser,
    otherUser,
    chatSettings,
    isChatEnabled,
    setCurrentUser,
    setOtherUser,
    setChatSettings,
    setIsChatEnabled,
    handleSendMessage,
    handleScheduleChat,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}; 