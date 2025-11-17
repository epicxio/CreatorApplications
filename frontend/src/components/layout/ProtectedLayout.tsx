import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Box, styled } from '@mui/material';
import { Security } from '@mui/icons-material';
import Sidebar, { MenuItem } from './Sidebar';
import TopSubMenu from './TopSubMenu';
import { useTheme } from '../../contexts/ThemeContext';
import { menuHierarchy } from '../../config/navigation';
import { permissionResources } from '../../config/permissions';
import { ChatProvider } from '../../contexts/ChatContext';
import ChatWidget from '../chat/ChatWidget';
import { useAuth } from '../../context/AuthContext';

const DRAWER_WIDTH = 64;

const Main = styled('main')(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: `${DRAWER_WIDTH}px`,
}));

const ProtectedLayout: React.FC = () => {
  const { toggleTheme } = useTheme();
  const { user } = useAuth();
  const [activeMenu, setActiveMenu] = useState<MenuItem | null>(null);
  const location = useLocation();

  useEffect(() => {
    const parentMenu = menuHierarchy.find(item =>
      item.children?.some(child => location.pathname.startsWith(child.path))
    );

    if (parentMenu) {
      const resource = permissionResources.find(p => p.name === parentMenu.resource);
      const Icon = resource ? resource.IconComponent : Security;
      
      const childrenWithIcons = parentMenu.children?.map(child => {
        const childResource = permissionResources.find(p => p.name === child.resource);
        const ChildIcon = childResource ? childResource.IconComponent : Icon;
        return { ...child, title: child.title, icon: <ChildIcon /> };
      });
      
      setActiveMenu({
        ...parentMenu,
        title: resource?.name || parentMenu.resource,
        icon: <Icon />,
        children: childrenWithIcons,
      });
    } else {
      setActiveMenu(null);
    }
  }, [location]);

  const handleMenuSelect = (menu: MenuItem) => {
    setActiveMenu(menu);
  };

  return (
    <ChatProvider>
      <Box sx={{ display: 'flex' }}>
        <Sidebar onThemeToggle={toggleTheme} onMenuSelect={handleMenuSelect} />
        <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, height: '100vh' }}>
          <TopSubMenu activeMenu={activeMenu} />
          <Main sx={{ flexGrow: 1, overflow: 'auto' }}>
            <Outlet />
          </Main>
        </Box>
        
        {/* Global Chat Widget - Only show if user is authenticated */}
        {user && (
          <ChatWidget
            currentUser={{
              id: user._id,
              name: user.name,
              role: user.role?.name || 'user'
            }}
            otherUser={{
              id: 'support-1',
              name: 'Sarah Johnson',
              role: 'support'
            }}
            chatSettings={{
              canInitiate: true,
              canRespond: true,
              allowFileSharing: false,
              allowVoiceMessages: false,
              allowScheduledChats: true,
              maxDailyMessages: 50,
              requiresCourseEnrollment: false,
              requiresLessonCompletion: 0,
            }}
            onSendMessage={(message, type) => {
              console.log('Global chat message:', message, type);
            }}
            onScheduleChat={(scheduledTime) => {
              console.log('Global chat scheduled:', scheduledTime);
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

export default ProtectedLayout; 