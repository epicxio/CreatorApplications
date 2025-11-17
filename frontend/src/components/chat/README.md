# Chat System Documentation

## Overview
The chat system is now integrated as a global service throughout the application. It provides a floating chat widget that appears on all authenticated pages.

## Current Structure

### Files:
- `ChatWidget.tsx` - The main floating chat widget component
- `README.md` - This documentation file

### Services:
- `chatService.ts` - API service for chat operations
- `ChatContext.tsx` - Global chat state management
- `useChatWidget.ts` - Custom hook for chat functionality

## Features

### Chat Widget Features:
- **Floating Design**: Appears as a small AI icon in the bottom-right corner
- **Expandable**: Click to expand into full chat interface
- **Futuristic UI**: Glassmorphism design with animations
- **Emoji Support**: Built-in emoji picker with 32 popular emojis
- **Role-Based Permissions**: Adapts based on user role and settings
- **File Sharing**: When enabled, allows file attachments
- **Voice Messages**: When enabled, supports voice recording
- **Scheduled Chats**: Ability to schedule future chat sessions

### Global Integration:
- **Automatic Display**: Shows on all authenticated pages
- **User-Aware**: Only displays for logged-in users
- **Dynamic Settings**: Loads chat settings based on user role
- **Support Chat**: Default chat with support team

## Usage

### For Developers:

#### 1. The chat widget is automatically available on all pages
```typescript
// No additional imports needed - it's in GlobalLayout
```

#### 2. Using the chat hook in components:
```typescript
import { useChatWidget } from '../../hooks/useChatWidget';

const MyComponent = () => {
  const { user, chatSettings, sendMessage, scheduleChat } = useChatWidget();
  
  const handleSendMessage = async () => {
    const success = await sendMessage('Hello!', 'text');
    if (success) {
      console.log('Message sent successfully');
    }
  };
  
  return (
    <div>
      {/* Your component content */}
    </div>
  );
};
```

#### 3. Checking chat permissions:
```typescript
const { canChatWithUser } = useChatWidget();

const checkPermission = async (targetUserId: string) => {
  const canChat = await canChatWithUser(targetUserId);
  if (canChat) {
    // Enable chat functionality
  }
};
```

### For Users:

#### How to Use the Chat Widget:
1. **Minimized State**: Look for the AI icon in the bottom-right corner
2. **Expand**: Click the AI icon to open the chat interface
3. **Send Messages**: Type your message and click send or press Enter
4. **Emojis**: Click the emoji button to add emojis to your messages
5. **Schedule Chat**: Use the schedule button to book future chat sessions
6. **Minimize**: Click the minimize button to collapse the chat

#### Chat Features by Role:
- **Learners**: Can chat with creators of enrolled courses
- **Creators**: Can chat with learners and support team
- **Brands**: Can chat with creators and support team
- **Admins**: Full chat access with all users
- **Support Team**: Available for all users

## Configuration

### Chat Settings (Managed by Super Admin):
- **Permission Matrix**: Who can chat with whom
- **Time-Based Availability**: When creators are available
- **Role Restrictions**: Lesson completion requirements, daily limits
- **Feature Toggles**: File sharing, voice messages, scheduling

### Default Settings:
```typescript
{
  canInitiate: false,
  canRespond: true,
  allowFileSharing: false,
  allowVoiceMessages: false,
  allowScheduledChats: true,
  maxDailyMessages: 10,
  requiresCourseEnrollment: true,
  requiresLessonCompletion: 2,
}
```

## API Endpoints

The chat system expects these backend endpoints:

### GET `/api/chat/settings/:userId`
Returns chat settings for a user

### POST `/api/chat/:chatId/messages`
Send a message to a chat

### GET `/api/chat/:chatId/messages`
Get chat history

### POST `/api/chat/schedule`
Schedule a chat session

### GET `/api/chat/users/:userId/available`
Get available chat users for a user

### GET `/api/chat/permissions/:userId/:targetUserId`
Check if user can chat with target user

## Styling

The chat widget uses:
- **Material-UI**: For components and theming
- **Framer Motion**: For animations and transitions
- **Glassmorphism**: For the futuristic design
- **Responsive Design**: Adapts to different screen sizes

## Troubleshooting

### Chat Widget Not Visible:
1. Check if user is authenticated
2. Verify chat settings are loaded
3. Check browser console for errors

### Messages Not Sending:
1. Verify API endpoints are working
2. Check network connectivity
3. Ensure user has chat permissions

### Performance Issues:
1. Chat widget is optimized for minimal performance impact
2. Uses lazy loading for chat history
3. Implements proper cleanup on unmount

## Future Enhancements

- Real-time messaging with WebSocket
- File upload functionality
- Voice message recording
- Chat history persistence
- Advanced scheduling features
- Multi-language support 