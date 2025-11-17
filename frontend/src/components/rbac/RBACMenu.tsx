import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  styled,
  IconButton,
  Tooltip,
  Box,
  ListItemButton,
} from '@mui/material';
import {
  ExpandLess,
  ExpandMore,
  Dashboard,
  People,
  School,
  Business,
  Assignment,
  Assessment,
  Settings,
  Group,
  PersonAdd,
  MenuBook,
  Analytics,
  SupervisorAccount,
  FamilyRestroom,
  Class,
  Home,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { menuHierarchy } from '../../config/navigation';

interface MenuItem {
  title: string;
  path: string;
  icon?: React.ReactNode;
  resource: string;
  children?: MenuItem[];
}

const StyledList = styled(List)(({ theme }) => ({
  width: '100%',
  maxWidth: 360,
  backgroundColor: 'transparent',
  padding: 0,
}));

const StyledListItem = styled(ListItem)<{ depth?: number }>(({ theme, depth = 0 }) => ({
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(0.5),
  paddingLeft: theme.spacing(2 + depth * 2),
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    transform: 'translateX(5px)',
  },
}));

const StyledListItemIcon = styled(ListItemIcon)(({ theme }) => ({
  minWidth: 40,
  color: theme.palette.primary.main,
}));

const StyledListItemButton = styled(ListItemButton)(({ theme }) => ({
  // Add any custom styles here if needed
}));

const iconMap: { [key: string]: React.ElementType } = {
  Dashboard,
  People,
  School,
  Business,
  Assignment,
  Assessment,
  Settings,
  Group,
  PersonAdd,
  MenuBook,
  Analytics,
  SupervisorAccount,
  FamilyRestroom,
  Class,
};

interface MenuItemComponentProps {
  item: MenuItem;
  open?: boolean;
  onToggle?: () => void;
}

const MenuItemComponent: React.FC<MenuItemComponentProps> = ({ item, open, onToggle }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (item.children && item.children.length > 0) {
      onToggle?.();
    } else if (item.path) {
      navigate(item.path);
    }
  };

  const IconComponent = item.icon ? item.icon : <Home />;

  return (
    <>
      <StyledListItemButton onClick={handleClick}>
        <ListItemIcon>{IconComponent}</ListItemIcon>
        <ListItemText primary={item.title} />
        {item.children && item.children.length > 0 ? (
          open ? <ExpandLess /> : <ExpandMore />
        ) : null}
      </StyledListItemButton>
      {item.children && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <List component="div" disablePadding sx={{ pl: 4 }}>
            {item.children.map((child: MenuItem) => (
              <MenuItemComponent
                key={child.path}
                item={child}
                open={true} // Sub-menus are always "open" in this simplified view
                onToggle={() => {}} // No toggle for sub-items
              />
            ))}
          </List>
        </Collapse>
      )}
    </>
  );
};

const RBACMenu: React.FC = () => {
  const { user } = useAuth();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  // Helper: recursively filter menu items by assignedScreens
  function filterMenuByAssignedScreens(menu: MenuItem[], allowedScreens: string[]): MenuItem[] {
    return menu
      .filter(item => allowedScreens.includes(item.resource))
      .map(item => {
        if (item.children) {
          const filteredChildren = filterMenuByAssignedScreens(item.children, allowedScreens);
          return { ...item, children: filteredChildren };
        }
        return item;
      })
      .filter(item => {
        // If has children, only keep if children remain after filtering
        if (item.children) {
          return item.children.length > 0;
        }
        return true;
      });
  }

  useEffect(() => {
    let allowedScreens = user?.assignedScreens && user.assignedScreens.length > 0
      ? user.assignedScreens
      : [];
    const filteredMenu = filterMenuByAssignedScreens(menuHierarchy as MenuItem[], allowedScreens);
    setMenuItems(filteredMenu);
  }, [user]);

  const handleToggle = (path: string) => {
    setOpenMenus(prev => ({ ...prev, [path]: !prev[path] }));
  };

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 360,
        bgcolor: 'background.paper',
      }}
    >
      <StyledList>
        {menuItems.map((item) => (
          <MenuItemComponent
            key={item.path}
            item={item}
            open={openMenus[item.path] || false}
            onToggle={() => handleToggle(item.path)}
          />
        ))}
      </StyledList>
    </Box>
  );
};

export default RBACMenu; 