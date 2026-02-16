import React from 'react';
import {
  Drawer,
  List,
  ListItemIcon,
  ListItemButton,
  Tooltip,
  Box,
  useTheme,
  styled,
  Divider,
} from '@mui/material';
import {
  Security,
  Brightness4,
  Brightness7,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { DRAWER_WIDTH } from '../../constants/layout';
import { useAuth } from '../../context/AuthContext';
import { permissionResources } from '../../config/permissions';
import { menuHierarchy } from '../../config/navigation';
import ProfileMenu from './ProfileMenu';

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  width: DRAWER_WIDTH,
  flexShrink: 0,
  whiteSpace: 'nowrap',
  '& .MuiDrawer-paper': {
    width: DRAWER_WIDTH,
    backgroundColor: theme.palette.mode === 'dark' ? '#1E1E1E' : '#FFFFFF',
    borderRight: `1px solid ${theme.palette.divider}`,
    overflowX: 'hidden',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
}));

const StyledListItem = styled(ListItemButton)(({ theme }) => ({
  minHeight: 48,
  justifyContent: 'center',
  padding: theme.spacing(1),
  margin: theme.spacing(0.5, 0.5),
  borderRadius: theme.shape.borderRadius,
  '&.Mui-selected': {
    backgroundColor: theme.palette.mode === 'dark' 
      ? 'rgba(255, 255, 255, 0.1)'
      : 'rgba(0, 0, 0, 0.05)',
    '&:hover': {
      backgroundColor: theme.palette.mode === 'dark'
        ? 'rgba(255, 255, 255, 0.15)'
        : 'rgba(0, 0, 0, 0.08)',
    },
  },
  '& .MuiListItemIcon-root': {
    minWidth: 'auto',
    color: theme.palette.primary.main,
  },
}));

export interface MenuItem {
  title: string;
  path: string;
  icon: React.ReactNode;
  resource: string;
  children?: MenuItem[];
}

interface SidebarProps {
  onThemeToggle: () => void;
  onMenuSelect: (_menu: MenuItem) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onThemeToggle, onMenuSelect }) => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  const menuItems: MenuItem[] = menuHierarchy
    .filter(item => hasPermission(item.resource, 'View'))
    .map(item => {
      const resourceInfo = permissionResources.find(p => p.name === item.resource);
      const Icon = resourceInfo ? resourceInfo.IconComponent : Security;
      
      const childrenWithIcons = item.children?.map(child => {
        const childResourceInfo = permissionResources.find(p => p.name === child.resource);
        const ChildIcon = childResourceInfo ? childResourceInfo.IconComponent : Icon;
        return { ...child, title: child.title, icon: <ChildIcon /> };
      });

      return { ...item, title: resourceInfo?.name || item.resource, icon: <Icon />, children: childrenWithIcons };
    });

  const handleMenuClick = async (item: MenuItem) => {
    // Check if we're on the course builder page and need to save before navigating
    if (location.pathname.startsWith('/love/learnloop/create')) {
      // Dispatch a custom event to trigger save before navigation
      const saveEvent = new CustomEvent('saveDraftBeforeNavigation', {
        detail: { targetPath: item.path, targetItem: item }
      });
      window.dispatchEvent(saveEvent);
      
      // Wait longer for the save to complete before navigating
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    if (item.children) {
      // If we're already on a sub-page of this parent, navigate to the first child
      // For "Love", navigate to LearnLoop (/love/learnloop)
      if (location.pathname.startsWith(item.path) && location.pathname !== item.path) {
        // Find the first child or a specific child (e.g., LearnLoop for Love)
        const targetChild = item.children.find(child => {
          // For Love, prefer LearnLoop
          if (item.path === '/love') {
            return child.path === '/love/learnloop';
          }
          // For other parents, use first child
          return true;
        }) || item.children[0];
        
        if (targetChild) {
          navigate(targetChild.path);
          return;
        }
      }
      // Otherwise, show the sub-menu
      onMenuSelect(item);
    } else {
      navigate(item.path);
    }
  };

  const isSelected = (item: MenuItem) => {
    return location.pathname.startsWith(item.path);
  };

  return (
    <StyledDrawer variant="permanent">
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <List sx={{ flexGrow: 1, pt: '64px' }}>
          {menuItems.map((item) => (
            <Tooltip key={item.title} title={item.title} placement="right">
              <StyledListItem
                onClick={() => handleMenuClick(item)}
                selected={isSelected(item)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
              </StyledListItem>
            </Tooltip>
          ))}
        </List>
        <Divider />
        <Box sx={{ p: 1 }}>
          <ProfileMenu />
          <Tooltip title="Toggle theme" placement="right">
            <StyledListItem onClick={onThemeToggle}>
              <ListItemIcon>
                {theme.palette.mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
              </ListItemIcon>
            </StyledListItem>
          </Tooltip>
        </Box>
      </Box>
    </StyledDrawer>
  );
};

export default Sidebar; 