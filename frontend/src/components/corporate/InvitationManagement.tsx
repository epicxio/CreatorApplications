import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  styled,
  Tooltip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  Email as EmailIcon,
  WhatsApp as WhatsAppIcon,
  Send as SendIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  margin: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[3],
  minHeight: '100vh',
}));

const InvitationDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: theme.spacing(2),
    padding: theme.spacing(2),
    maxWidth: '500px',
  },
}));

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'pending' | 'sent' | 'accepted';
  lastInviteDate?: string;
}

// Mock data for demonstration
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    email: 'alice.j@student.com',
    phone: '+1 234-567-8901',
    status: 'pending',
  },
  {
    id: '2',
    name: 'John Smith',
    email: 'john.smith@corporate.com',
    phone: '+1 234-567-8902',
    status: 'sent',
    lastInviteDate: '2024-03-15',
  },
  {
    id: '3',
    name: 'Bob Wilson',
    email: 'bob.w@student.com',
    phone: '+1 234-567-8903',
    status: 'accepted',
    lastInviteDate: '2024-03-14',
  },
  {
    id: '4',
    name: 'Sarah Johnson',
    email: 'sarah.j@corporate.com',
    phone: '+1 234-567-8904',
    status: 'pending',
  },
  {
    id: '5',
    name: 'Michael Brown',
    email: 'michael.b@corporate.com',
    phone: '+1 234-567-8905',
    status: 'sent',
    lastInviteDate: '2024-03-15',
  },
  {
    id: '6',
    name: 'Emily Davis',
    email: 'emily.d@student.com',
    phone: '+1 234-567-8906',
    status: 'pending',
  },
  {
    id: '7',
    name: 'David Wilson',
    email: 'david.w@corporate.com',
    phone: '+1 234-567-8907',
    status: 'accepted',
    lastInviteDate: '2024-03-13',
  },
  {
    id: '8',
    name: 'Carol Taylor',
    email: 'carol.t@student.com',
    phone: '+1 234-567-8908',
    status: 'sent',
    lastInviteDate: '2024-03-15',
  },
  {
    id: '9',
    name: 'James Anderson',
    email: 'james.a@corporate.com',
    phone: '+1 234-567-8909',
    status: 'pending',
  },
  {
    id: '10',
    name: 'Eve Miller',
    email: 'eve.m@student.com',
    phone: '+1 234-567-8910',
    status: 'accepted',
    lastInviteDate: '2024-03-12',
  },
];

const InvitationManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [inviteType, setInviteType] = useState<'email' | 'whatsapp' | null>(null);
  const [sending, setSending] = useState(false);
  const [customMessage, setCustomMessage] = useState('');

  const handleOpenDialog = (user: User, type: 'email' | 'whatsapp') => {
    setSelectedUser(user);
    setInviteType(type);
    setOpenDialog(true);
    setCustomMessage('');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
    setInviteType(null);
    setCustomMessage('');
  };

  const handleSendInvite = () => {
    if (!selectedUser) return;

    setSending(true);
    // Simulate API call
    setTimeout(() => {
      setUsers(users.map(user =>
        user.id === selectedUser.id
          ? { ...user, status: 'sent', lastInviteDate: new Date().toISOString().split('T')[0] }
          : user
      ));
      setSending(false);
      handleCloseDialog();
    }, 1500);
  };

  const getStatusChip = (status: User['status']) => {
    switch (status) {
      case 'pending':
        return <Chip label="Not Invited" color="default" size="small" />;
      case 'sent':
        return <Chip label="Invite Sent" color="primary" size="small" />;
      case 'accepted':
        return <Chip label="Accepted" color="success" size="small" />;
      default:
        return null;
    }
  };

  return (
    <StyledPaper>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Invitation Management
        </Typography>
      </Box>

      <List>
        {users.map((user) => (
          <React.Fragment key={user.id}>
            <ListItem>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  {user.name.charAt(0)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={user.name}
                secondary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      {user.email}
                    </Typography>
                    {user.lastInviteDate && (
                      <Typography variant="caption" color="text.secondary">
                        • Last invited: {user.lastInviteDate}
                      </Typography>
                    )}
                  </Box>
                }
              />
              <ListItemSecondaryAction sx={{ display: 'flex', gap: 1 }}>
                {getStatusChip(user.status)}
                <Tooltip title="Send Email Invite">
                  <IconButton
                    onClick={() => handleOpenDialog(user, 'email')}
                    disabled={user.status === 'accepted'}
                    color="primary"
                  >
                    <EmailIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Send WhatsApp Invite">
                  <IconButton
                    onClick={() => handleOpenDialog(user, 'whatsapp')}
                    disabled={user.status === 'accepted'}
                    color="success"
                  >
                    <WhatsAppIcon />
                  </IconButton>
                </Tooltip>
              </ListItemSecondaryAction>
            </ListItem>
            <Divider variant="inset" component="li" />
          </React.Fragment>
        ))}
      </List>

      <InvitationDialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              Send {inviteType === 'email' ? 'Email' : 'WhatsApp'} Invitation
            </Typography>
            <IconButton onClick={handleCloseDialog} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Recipient Details:
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                  {selectedUser.name.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="body1">{selectedUser.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {inviteType === 'email' ? selectedUser.email : selectedUser.phone}
                  </Typography>
                </Box>
              </Box>

              <Typography variant="subtitle1" gutterBottom>
                Invitation Template:
              </Typography>
              <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1, mb: 2 }}>
                <Typography variant="body2" paragraph>
                  Dear {selectedUser.name},
                </Typography>
                <Typography variant="body2" paragraph>
                  Welcome to the Math Education Platform! We're excited to have you on board.
                </Typography>
                <Typography variant="body2" paragraph>
                  Your login credentials are:
                </Typography>
                <Typography variant="body2" component="div" sx={{ pl: 2 }}>
                  <div>Username: {selectedUser.email}</div>
                  <div>Password: [Temporary Password]</div>
                </Typography>
                <Typography variant="body2" paragraph sx={{ mt: 2 }}>
                  Please log in and change your password immediately.
                </Typography>
                <Typography variant="body2">
                  Best regards,
                </Typography>
                <Typography variant="body2">
                  Math Education Platform Team
                </Typography>
              </Box>

              <TextField
                fullWidth
                multiline
                rows={4}
                label="Custom Message (Optional)"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Add any additional information or instructions..."
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSendInvite}
            variant="contained"
            color="primary"
            disabled={sending}
            startIcon={sending ? <CircularProgress size={20} /> : <SendIcon />}
          >
            {sending ? 'Sending...' : 'Send Invitation'}
          </Button>
        </DialogActions>
      </InvitationDialog>
    </StyledPaper>
  );
};

export default InvitationManagement; 