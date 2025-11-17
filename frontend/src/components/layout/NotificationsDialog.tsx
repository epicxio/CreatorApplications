import React, { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';
import api from '../../services/api'; // or your axios instance

interface NotificationsDialogProps {
  open: boolean;
  onClose: () => void;
  setUnreadCount?: (count: number) => void;
}

const NotificationsDialog: React.FC<NotificationsDialogProps> = ({ open, onClose, setUnreadCount }) => {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (open) {
      api.get('/notifications/in-app').then(res => {
        if (res.data && Array.isArray(res.data.notifications)) {
          setNotifications(res.data.notifications);
        }
      });
    }
  }, [open]);

  const handleReadAll = () => {
    api.post('/notifications/mark-all-read').then(() => {
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      if (typeof setUnreadCount === 'function') setUnreadCount(0);
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingRight: 1
        }}
      >
        <span>Notifications</span>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            size="small"
            variant="outlined"
            sx={{ fontSize: 12, minWidth: 0, padding: '2px 8px' }}
            onClick={handleReadAll}
          >
            Read All
          </Button>
          <IconButton aria-label="close" onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        {notifications.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#888', marginTop: 32 }}>No notifications</div>
        ) : (
          notifications.map((notif, idx) => (
            <div key={notif._id || idx} style={{
              margin: '16px 0',
              padding: 16,
              borderRadius: 12,
              background: '#fff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              opacity: notif.read ? 0.5 : 1
            }}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>{notif.title}</div>
              <div style={{ marginBottom: 4 }}>{notif.message}</div>
              <div style={{ fontSize: 12, color: '#888' }}>{new Date(notif.createdAt).toLocaleString()}</div>
            </div>
          ))
        )}
      </DialogContent>
    </Dialog>
  );
};

export default NotificationsDialog;