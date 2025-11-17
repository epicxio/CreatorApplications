import React, { useState, useEffect } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Divider,
  Box,
  Typography,
  useTheme,
  Dialog,
  DialogContent,
  styled,
  Badge,
  Button
} from '@mui/material';
import {
  AccountCircle,
  Logout,
  Settings,
  Person,
  Close as CloseIcon,
  Notifications as NotificationsIcon,
  FiberManualRecord,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  InfoOutlined,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import FuturisticProfile from '../profile/FuturisticProfile';
import { User } from '../../services/userService';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  },
}));

// Define Notification type for backend notifications
interface Notification {
  _id: string;
  title: string;
  message: string;
  eventType: string;
  read: boolean;
  delivered: boolean;
  scheduledAt?: string;
  sentAt?: string;
  channels: string[];
  meta?: any;
  createdAt: string;
}

const ProfileMenu: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { user: authUser, logout, updateUser } = useAuth();
  const user = authUser;
  const theme = useTheme();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Add a function to fetch notifications
  const fetchNotifications = () => {
    setLoadingNotifications(true);
    api.get('/notifications/in-app')
      .then(res => {
        setNotifications(res.data.notifications || []);
        const unread = (res.data.notifications || []).filter((n: any) => !n.read).length;
        setUnreadCount(unread);
        console.log('[ProfileMenu] In-app notifications:', res.data.notifications);
      })
      .catch(() => {
        setNotifications([]);
        setUnreadCount(0);
      })
      .finally(() => setLoadingNotifications(false));
  };

  // When opening the notifications dialog, fetch notifications immediately
  const handleOpenNotifications = () => {
    setNotificationsOpen(true);
    fetchNotifications();
    // Mark all as read when opening notifications
    api.post('/notifications/mark-all-read').then(() => {
      setUnreadCount(0);
    });
  };

  // Add this function if not present
  const handleReadAllNotifications = () => {
    api.post('/notifications/mark-all-read').then(() => {
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    });
  };

  // Fetch unread notification count when menu mounts or user changes
  useEffect(() => {
    // Replace with your actual API endpoint for unread notifications
    api.get('/notifications/in-app').then(res => {
      if (res.data && Array.isArray(res.data.notifications)) {
        const unread = res.data.notifications.filter((n: any) => !n.read).length;
        setUnreadCount(unread);
      }
    });
  }, [authUser?._id]);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    logout();
  };

  const handleProfile = () => {
    handleClose();
    setProfileOpen(true);
  };

  const handleSettings = () => {
    handleClose();
    // Navigate to settings page
  };

  const handleProfileClose = () => {
    setProfileOpen(false);
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
      <IconButton
        onClick={handleMenu}
        size="large"
        edge="end"
        color="inherit"
        aria-label="account of current user"
        aria-controls="profile-menu"
        aria-haspopup="true"
      >
        <Badge
          color="error"
          variant={unreadCount > 0 ? "dot" : undefined}
          overlap="circular"
          invisible={unreadCount === 0}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
          <Avatar 
            alt={user?.name || ''}
            src={user?.profileImage || ''}
            sx={{ width: 40, height: 40 }}
          />
        </Badge>
      </IconButton>
      <Menu
        id="menu-appbar"
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        sx={{ ml: 1 }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {user?.name || 'User'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.email}
          </Typography>
        </Box>
        <Divider />
        <MenuItem onClick={handleProfile}>
          <ListItemIcon>
            <Person fontSize="small" />
          </ListItemIcon>
          <ListItemText>Profile</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleOpenNotifications}>
          <ListItemIcon>
            <NotificationsIcon color="primary" fontSize="small" />
          </ListItemIcon>
          <ListItemText>Notifications</ListItemText>
          {unreadCount > 0 && <FiberManualRecord color="warning" sx={{ fontSize: 14, ml: 1 }} />}
        </MenuItem>
        <MenuItem onClick={handleSettings}>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          <ListItemText>Settings</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          <ListItemText>Logout</ListItemText>
        </MenuItem>
      </Menu>

      <StyledDialog
        open={profileOpen}
        onClose={handleProfileClose}
        fullWidth
        maxWidth="lg"
      >
        <DialogContent sx={{ position: 'relative', p: 0 }}>
          <IconButton 
            onClick={handleProfileClose} 
            sx={{ position: 'absolute', top: 8, right: 8, color: 'white', zIndex: 1 }}
          >
            <CloseIcon />
          </IconButton>
          {user ? (
            (typeof user.role === "object" ? user.role?.name : user.role) === "Creator"
              ? <FuturisticProfile user={user} onUpdateUser={updateUser} />
              : <FuturisticProfile user={user} onUpdateUser={updateUser} hideCategoriesSection={true} />
          ) : (
            <Box sx={{ p: 6, textAlign: 'center', color: '#fff', minWidth: 400 }}>
              <Typography variant="h5" fontWeight={700} gutterBottom>
                Profile not available
              </Typography>
              <Typography variant="body1">
                This profile view is only available for valid accounts.
              </Typography>
            </Box>
          )}
        </DialogContent>
      </StyledDialog>

      <StyledDialog
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogContent sx={{
          p: 0,
          background: 'linear-gradient(135deg, #f8fafc 80%, #e9eefa 100%)',
          borderRadius: 5,
          minHeight: 420,
          maxHeight: 600,
          overflowY: 'auto',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.10)',
          backdropFilter: 'blur(16px)',
          position: 'relative',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 3, pb: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#6C63FF', letterSpacing: 1 }}>
              Notifications
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                size="small"
                variant="outlined"
                sx={{ fontSize: 12, minWidth: 0, padding: '2px 8px' }}
                onClick={handleReadAllNotifications}
              >
                Read All
              </Button>
            <IconButton onClick={() => setNotificationsOpen(false)}>
              <CloseIcon />
            </IconButton>
            </Box>
          </Box>
          <Divider />
          <Box sx={{ p: 3, pt: 2 }}>
            {loadingNotifications ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <NotificationsIcon sx={{ fontSize: 64, color: '#6C63FF', mb: 2, opacity: 0.3 }} />
                <Typography variant="h6" color="text.secondary">Loading notifications...</Typography>
              </Box>
            ) : notifications.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <NotificationsIcon sx={{ fontSize: 64, color: '#6C63FF', mb: 2, opacity: 0.3 }} />
                <Typography variant="h6" color="text.secondary">No Notification Yet</Typography>
              </Box>
            ) : (
              notifications.map((n, idx) => (
                <motion.div
                  key={n._id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.08, type: 'spring', stiffness: 120 }}
                  style={{ width: '100%' }}
                >
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 2,
                    mb: 3,
                    p: 2.5,
                    borderRadius: 3,
                    background: !n.read ? 'linear-gradient(90deg, #fff 80%, #f3f6fa 100%)' : '#f8fafc',
                    boxShadow: !n.read ? '0 2px 12px 0 rgba(108,99,255,0.06)' : 'none',
                    borderLeft: !n.read ? '4px solid #6C63FF' : '4px solid #e9eefa',
                    transition: 'background 0.2s',
                  }}>
                    <Box sx={{ mt: 0.5 }}><NotificationsIcon color={n.read ? 'disabled' : 'warning'} /></Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: !n.read ? '#6C63FF' : '#222' }}>{n.title}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>{n.message}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(n.createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                    </Box>
                    {!n.read && <FiberManualRecord color="warning" sx={{ fontSize: 16, mt: 0.5 }} />}
                  </Box>
                </motion.div>
              ))
            )}
          </Box>
        </DialogContent>
      </StyledDialog>
    </Box>
  );
};

export default ProfileMenu; 