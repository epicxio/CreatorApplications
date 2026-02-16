import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Chip,
  Tooltip,
  Switch,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  styled,
  Avatar,
  Divider,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  FormGroup,
  Slider,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Email as EmailIcon,
  Sms as SmsIcon,
  NotificationsActive as PushIcon,
  Computer as InAppIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  Settings as SettingsIcon,
  History as HistoryIcon,
  Analytics as AnalyticsIcon,
  NotificationsActive as NotificationsActiveIcon,
  InfoOutlined as InfoOutlinedIcon,
  Chat as ChatIcon,
  ExpandMore as ExpandMoreIcon,
  AccessTime as AccessTimeIcon,
  Security as SecurityIcon,
  Block as BlockIcon,
} from '@mui/icons-material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import axios from 'axios';
import notificationTypeService, { NotificationType as BackendNotificationType } from '../../services/notificationTypeService';
import { NotificationVariablesInfo } from '../NotificationVariablesInfo'; // adjust path if needed

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  margin: theme.spacing(2),
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
}));

const ChannelChip = styled(Chip)<{ active: boolean }>(({ theme, active }) => ({
  margin: theme.spacing(0.5),
  backgroundColor: active ? theme.palette.primary.main : 'rgba(255, 255, 255, 0.1)',
  color: active ? theme.palette.primary.contrastText : theme.palette.text.secondary,
  '&:hover': {
    backgroundColor: active ? theme.palette.primary.dark : 'rgba(255, 255, 255, 0.2)',
  },
}));

interface NotificationType {
  id: string;
  title: string;
  messageTemplate: string;
  roles: string[];
  channels: {
    email: boolean;
    whatsapp: boolean;
    sms: boolean;
    push: boolean;
    inApp: boolean;
  };
  isActive: boolean;
  priority: 'low' | 'medium' | 'high';
  schedule?: {
    enabled: boolean;
    type: 'immediate' | 'scheduled';
    time?: string;
    days?: string[];
    date?: string;
    cron?: string;
  };
  eventType?: string;
}

interface NotificationLog {
  id: string;
  notificationType: string;
  userId: string;
  userName: string;
  role: string;
  channel: string;
  status: 'success' | 'failed' | 'pending';
  sentAt: Date;
  deliveredAt?: Date;
  errorMessage?: string;
}

// Chat Settings Interfaces
interface ChatPermissionMatrix {
  [fromRole: string]: {
    [toRole: string]: {
      canChat: boolean;
      canInitiate: boolean;
      canRespond: boolean;
      requiresCourseEnrollment?: boolean;
      requiresLessonCompletion?: number;
      maxDailyMessages?: number;
    };
  };
}

interface ChatAvailabilitySettings {
  creatorDefaultHours: {
    start: string;
    end: string;
  };
  timezone: string;
  maxDailyChats: number;
  autoArchiveDays: number;
  allowFileSharing: boolean;
  allowVoiceMessages: boolean;
  allowScheduledChats: boolean;
  globalChatWindow: {
    start: string;
    end: string;
  };
}

interface ChatRestriction {
  role: string;
  restriction: string;
  value: string | number;
  description: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`notification-tabpanel-${index}`}
      aria-labelledby={`notification-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const channelIcons = {
  email: <EmailIcon />,
  sms: <SmsIcon />,
  push: <PushIcon />,
  inApp: <InAppIcon />,
  whatsapp: <WhatsAppIcon style={{ color: '#25D366' }} />,
};

const _channelColors = {
  email: '#1976d2',
  sms: '#2e7d32',
  push: '#ed6c02',
  inApp: '#9c27b0',
  whatsapp: '#25D366',
};

const channels = ['email', 'whatsapp', 'sms', 'push', 'inApp'];

const NotificationControlCenter: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [notificationTypes, setNotificationTypes] = useState<NotificationType[]>([]);
  const [notificationTypesLoading, setNotificationTypesLoading] = useState(false);

  const [notificationLogs] = useState<NotificationLog[]>([]);

  const [_logsLoading, _setLogsLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingNotification, setEditingNotification] = useState<NotificationType | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [notificationEvents, setNotificationEvents] = useState<{ key: string; label: string }[]>([]);
  const [scanLoading, setScanLoading] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scanSuccess, setScanSuccess] = useState<string | null>(null);
  const [roles, setRoles] = useState<{ _id: string; name: string }[]>([]);
  const [templateVariables, setTemplateVariables] = useState<{ variable: string; description: string }[]>([]);
  const [emitEventType, setEmitEventType] = useState('');
  const [emitVariables, setEmitVariables] = useState<{ [key: string]: string }>({});
  const [emitVariableList, setEmitVariableList] = useState<{ variable: string; description: string }[]>([]);
  const [emitResult, setEmitResult] = useState<string | null>(null);
  const [emitLoading, setEmitLoading] = useState(false);
  const [loadingSample, setLoadingSample] = useState(false);

  // Chat Settings State
  const [chatPermissionMatrix, setChatPermissionMatrix] = useState<ChatPermissionMatrix>({
    creator: {
      learner: { canChat: true, canInitiate: true, canRespond: true, requiresCourseEnrollment: true },
      brand: { canChat: true, canInitiate: true, canRespond: true },
      admin: { canChat: true, canInitiate: true, canRespond: true },
      account_manager: { canChat: true, canInitiate: true, canRespond: true },
    },
    learner: {
      creator: { canChat: true, canInitiate: false, canRespond: true, requiresCourseEnrollment: true, requiresLessonCompletion: 2 },
      brand: { canChat: false, canInitiate: false, canRespond: false },
      admin: { canChat: true, canInitiate: false, canRespond: true },
      account_manager: { canChat: false, canInitiate: false, canRespond: false },
    },
    brand: {
      creator: { canChat: true, canInitiate: true, canRespond: true },
      learner: { canChat: false, canInitiate: false, canRespond: false },
      admin: { canChat: true, canInitiate: true, canRespond: true },
      account_manager: { canChat: true, canInitiate: true, canRespond: true },
    },
    admin: {
      creator: { canChat: true, canInitiate: true, canRespond: true },
      learner: { canChat: true, canInitiate: true, canRespond: true },
      brand: { canChat: true, canInitiate: true, canRespond: true },
      account_manager: { canChat: true, canInitiate: true, canRespond: true },
    },
    account_manager: {
      creator: { canChat: true, canInitiate: true, canRespond: true },
      learner: { canChat: true, canInitiate: true, canRespond: true },
      brand: { canChat: true, canInitiate: true, canRespond: true },
      admin: { canChat: true, canInitiate: true, canRespond: true },
    },
  });

  const [chatAvailabilitySettings, setChatAvailabilitySettings] = useState<ChatAvailabilitySettings>({
    creatorDefaultHours: { start: '09:00', end: '17:00' },
    timezone: 'UTC',
    maxDailyChats: 50,
    autoArchiveDays: 30,
    allowFileSharing: false,
    allowVoiceMessages: false,
    allowScheduledChats: true,
    globalChatWindow: { start: '08:00', end: '22:00' },
  });

  const [chatRestrictions, setChatRestrictions] = useState<ChatRestriction[]>([
    { role: 'learner', restriction: 'lesson_completion', value: 2, description: 'Must complete Lesson 2 before messaging creators' },
    { role: 'learner', restriction: 'course_enrollment', value: 'required', description: 'Must be enrolled in creator\'s course' },
    { role: 'creator', restriction: 'daily_message_limit', value: 100, description: 'Maximum 100 messages per day' },
  ]);

  const [savingChatSettings, setSavingChatSettings] = useState(false);
  const [chatSettingsSaved, setChatSettingsSaved] = useState(false);

  const defaultSchedule: {
    enabled: boolean;
    type: 'immediate' | 'scheduled';
    time?: string;
    days?: string[];
    date?: string;
    cron?: string;
  } = {
    enabled: false,
    type: 'immediate',
    time: '',
    days: [],
    date: '',
    cron: ''
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleChannelToggle = (notificationId: string, channel: string) => {
    setNotificationTypes(prev => prev.map(notification => {
      if (notification.id === notificationId) {
        return {
          ...notification,
          channels: {
            ...notification.channels,
            [channel]: !notification.channels[channel as keyof typeof notification.channels],
          },
        };
      }
      return notification;
    }));
  };

  const handleRoleToggle = (notificationId: string, role: string) => {
    setNotificationTypes(prev => prev.map(notification => {
      if (notification.id === notificationId) {
        const newRoles = notification.roles.includes(role)
          ? notification.roles.filter(r => r !== role)
          : [...notification.roles, role];
        return { ...notification, roles: newRoles };
      }
      return notification;
    }));
  };

  const handleActiveToggle = async (notificationId: string) => {
    try {
      setNotificationTypesLoading(true);
      const result = await notificationTypeService.toggleActive(notificationId);
      setNotificationTypes(prev => prev.map(notification => {
        if (notification.id === notificationId) {
          return { ...notification, isActive: result.isActive };
        }
        return notification;
      }));
    } catch {
      // Toggle failed
    } finally {
      setNotificationTypesLoading(false);
    }
  };

  const handleAddNotification = () => {
    setEditingNotification({
      id: Date.now().toString(),
      title: '',
      messageTemplate: '',
      roles: [],
      channels: { email: false, whatsapp: false, sms: false, push: false, inApp: false },
      isActive: true,
      priority: 'medium',
      schedule: { ...defaultSchedule },
      eventType: ''
    });
    setOpenDialog(true);
  };

  const handleEditNotification = (notification: NotificationType) => {
    setEditingNotification({
      ...notification,
      id: notification.id || '',
      schedule: {
        ...defaultSchedule,
        ...notification.schedule
      }
    });
    setOpenDialog(true);
  };

  const handleSaveNotification = async () => {
    if (editingNotification) {
      const schedule: NotificationType['schedule'] = {
        enabled: editingNotification.schedule?.type === 'scheduled',
        type: editingNotification.schedule?.type || 'immediate',
        time: editingNotification.schedule?.type === 'scheduled' ? editingNotification.schedule?.time : undefined,
        days: editingNotification.schedule?.type === 'scheduled' ? editingNotification.schedule?.days : undefined,
        date: editingNotification.schedule?.type === 'scheduled' ? editingNotification.schedule?.date : undefined,
        cron: editingNotification.schedule?.type === 'scheduled' ? editingNotification.schedule?.cron : undefined,
      };
      if (schedule.type === 'scheduled' && !schedule.time) {
        alert('Please select a time for scheduled notifications.');
        return;
      }
      try {
        setNotificationTypesLoading(true);
        if (editingNotification.id && notificationTypes.find(n => n.id === editingNotification.id)) {
          const updatedNotification = await notificationTypeService.update(editingNotification.id, {
            ...editingNotification,
            schedule
          });
          setNotificationTypes(prev => prev.map(n =>
            n.id === editingNotification.id ? {
              ...n,
              ...updatedNotification
            } : n
          ));
        } else {
          const newNotification = await notificationTypeService.create({
            ...editingNotification,
            schedule
          });
          setNotificationTypes(prev => [...prev, {
            id: newNotification._id || '',
            ...newNotification
          }]);
        }
        setOpenDialog(false);
        setEditingNotification(null);
      } catch {
        // Save failed
      } finally {
        setNotificationTypesLoading(false);
      }
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      setNotificationTypesLoading(true);
      await notificationTypeService.delete(notificationId);
      setNotificationTypes(prev => prev.filter(n => n.id !== notificationId));
    } catch {
      // Delete failed
      // You might want to show an error message to the user here
    } finally {
      setNotificationTypesLoading(false);
    }
  };

  const filteredNotificationTypes = notificationTypes.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || notification.roles.includes(roleFilter);
    return matchesSearch && matchesRole;
  });

  const filteredLogs = notificationLogs.filter(log => {
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    return matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircleIcon color="success" />;
      case 'failed':
        return <ErrorIcon color="error" />;
      case 'pending':
        return <ScheduleIcon color="warning" />;
      default:
        return <ViewIcon color="action" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'success';
      case 'failed':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const handleExportLogs = () => {
    const csvContent = [
      ['ID', 'Notification Type', 'User', 'Role', 'Channel', 'Status', 'Sent At', 'Delivered At', 'Error'],
      ...filteredLogs.map(log => [
        log.id,
        log.notificationType,
        log.userName,
        log.role,
        log.channel,
        log.status,
        log.sentAt.toLocaleString(),
        log.deliveredAt?.toLocaleString() || '',
        log.errorMessage || '',
      ]),
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'notification_logs.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleScanNotificationEvents = async () => {
    setScanLoading(true);
    setScanError(null);
    setScanSuccess(null);
    try {
      const res = await axios.post('/api/notifications/scan');
      if (res.data.success) {
        setNotificationEvents(res.data.events);
        let msg = 'Notification events updated!';
        if ((res.data.skipped && res.data.skipped.length > 0) || (res.data.inserted && res.data.inserted.length > 0)) {
          msg += ` Skipped duplicates: [${(res.data.skipped || []).join(', ')}]. Inserted new: [${(res.data.inserted || []).join(', ')}].`;
        }
        setScanSuccess(msg);
      } else {
        setScanError('Failed to scan notification events.');
      }
    } catch (err: any) {
      setScanError(err?.response?.data?.error || 'Error scanning notification events.');
    } finally {
      setScanLoading(false);
    }
  };

  // Chat Settings Handlers
  const handlePermissionMatrixChange = (fromRole: string, toRole: string, field: string, value: boolean | number) => {
    setChatPermissionMatrix(prev => ({
      ...prev,
      [fromRole]: {
        ...prev[fromRole],
        [toRole]: {
          ...prev[fromRole]?.[toRole],
          [field]: value,
        },
      },
    }));
  };

  const handleAvailabilitySettingsChange = (field: string, value: any) => {
    setChatAvailabilitySettings(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddRestriction = () => {
    const newRestriction: ChatRestriction = {
      role: 'learner',
      restriction: 'lesson_completion',
      value: 1,
      description: 'New restriction',
    };
    setChatRestrictions(prev => [...prev, newRestriction]);
  };

  const handleUpdateRestriction = (index: number, field: string, value: string | number) => {
    setChatRestrictions(prev => prev.map((restriction, i) => 
      i === index ? { ...restriction, [field]: value } : restriction
    ));
  };

  const handleRemoveRestriction = (index: number) => {
    setChatRestrictions(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveChatSettings = async () => {
    setSavingChatSettings(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setChatSettingsSaved(true);
      setTimeout(() => setChatSettingsSaved(false), 3000);
    } catch {
      // Save failed
    } finally {
      setSavingChatSettings(false);
    }
  };

  // Fetch notification events on mount
  useEffect(() => {
    axios.get('/api/notifications').then(res => {
      if (res.data.success) setNotificationEvents(res.data.events);
    });
  }, []);

  // Fetch roles and notification types on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch roles
        const rolesResponse = await axios.get('/api/roles');
        if (Array.isArray(rolesResponse.data)) {
          setRoles(rolesResponse.data.map((role: any) => ({ _id: role._id, name: role.name })));
        } else if (Array.isArray(rolesResponse.data.roles)) {
          setRoles(rolesResponse.data.roles.map((role: any) => ({ _id: role._id, name: role.name })));
        }

        // Fetch notification types
        setNotificationTypesLoading(true);
        const notificationTypesResponse = await notificationTypeService.getAll();
        setNotificationTypes(notificationTypesResponse.map((nt: BackendNotificationType) => ({
          id: nt._id || '',
          title: nt.title,
          messageTemplate: nt.messageTemplate,
          roles: nt.roles,
          channels: nt.channels,
          isActive: nt.isActive,
          priority: nt.priority,
          schedule: nt.schedule,
          eventType: nt.eventType
        })));
      } catch {
        // Fetch failed
      } finally {
        setNotificationTypesLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch template variables on mount
  useEffect(() => {
    axios.get('/api/notifications/template-variables').then(res => {
      if (res.data && res.data.variables) {
        setTemplateVariables(res.data.variables);
      }
    });
  }, []);

  // Fetch template variables for selected event type
  useEffect(() => {
    if (tabValue === 3 && emitEventType) {
      axios.get(`/api/notifications/template-variables?eventType=${emitEventType}`).then(res => {
        if (res.data && res.data.variables) {
          setEmitVariableList(res.data.variables);
          // Reset emitVariables with empty values
          const vars: { [key: string]: string } = {};
          res.data.variables.forEach((v: any) => { vars[v.variable] = ''; });
          setEmitVariables(vars);
        }
      });
    }
  }, [tabValue, emitEventType]);

  return (
    <StyledPaper>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            <NotificationsIcon />
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
              Notification Control Center
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage notification preferences and monitor delivery status
            </Typography>
          </Box>
        </Box>

        <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Notification Types" icon={<SettingsIcon />} iconPosition="start" />
          <Tab label="Logs & Monitoring" icon={<HistoryIcon />} iconPosition="start" />
          <Tab label="Analytics" icon={<AnalyticsIcon />} iconPosition="start" />
          <Tab label="Emit Event" icon={<NotificationsActiveIcon />} iconPosition="start" />
          <Tab label="Chat Settings" icon={<ChatIcon />} iconPosition="start" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        {/* Notification Types Management */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Search notification types..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Filter by Role</InputLabel>
              <Select
                value={roleFilter}
                label="Filter by Role"
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <MenuItem value="all">All Roles</MenuItem>
                {roles.map(role => (
                  <MenuItem key={role._id} value={role.name}>{role.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 2 }}>
            <Tooltip title="Scan for Notification Events">
              <span>
                <IconButton color="primary" sx={{ mr: 1 }} onClick={handleScanNotificationEvents} disabled={scanLoading}>
                  <RefreshIcon />
                </IconButton>
              </span>
            </Tooltip>
            {scanLoading && <CircularProgress size={20} sx={{ mr: 1 }} />}
            {!!scanSuccess && <Alert severity="success" sx={{ mr: 1 }}>{scanSuccess}</Alert>}
            {!!scanError && <Alert severity="error" sx={{ mr: 1 }}>{scanError}</Alert>}
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleAddNotification}
              disabled={notificationTypesLoading}
            >
              Add Notification Type
            </Button>
          </Box>
        </Box>
        
        {notificationTypesLoading && (
          <Box sx={{ width: '100%', mb: 2 }}>
            <LinearProgress />
          </Box>
        )}

        <Grid container spacing={3}>
          {filteredNotificationTypes.map((notification) => (
            <Grid item xs={12} md={6} lg={4} key={notification.id}>
              <Card sx={{ height: '100%', position: 'relative' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {notification.title}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleEditNotification(notification)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteNotification(notification.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {notification.messageTemplate}
                  </Typography>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Roles:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {notification.roles.map(role => (
                        <Chip
                          key={role}
                          label={role}
                          size="small"
                          variant={notification.roles.includes(role) ? 'filled' : 'outlined'}
                          color={notification.roles.includes(role) ? 'primary' : 'default'}
                          onClick={() => handleRoleToggle(notification.id, role)}
                          sx={{ cursor: 'pointer' }}
                        />
                      ))}
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Channels:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {channels.map(channel => (
                        <Tooltip key={channel} title={`Toggle ${channel} notifications`}>
                          <ChannelChip
                            icon={channelIcons[channel as keyof typeof channelIcons]}
                            label={channel}
                            active={notification.channels[channel as keyof typeof notification.channels]}
                            onClick={() => handleChannelToggle(notification.id, channel)}
                            sx={{ cursor: 'pointer' }}
                          />
                        </Tooltip>
                      ))}
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={notification.isActive}
                          onChange={() => handleActiveToggle(notification.id)}
                          size="small"
                        />
                      }
                      label="Active"
                    />
                    <Chip
                      label={notification.priority}
                      size="small"
                      color={notification.priority === 'high' ? 'error' : notification.priority === 'medium' ? 'warning' : 'default'}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {/* Logs & Monitoring */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Filter by Status</InputLabel>
              <Select
                value={statusFilter}
                label="Filter by Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="success">Success</MenuItem>
                <MenuItem value="failed">Failed</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExportLogs}
          >
            Export to CSV
          </Button>
        </Box>
        {filteredLogs.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
            <Typography variant="h6">No Notification Yet</Typography>
          </Box>
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Notification Type</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Channel</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Sent At</TableCell>
                  <TableCell>Delivered At</TableCell>
                  <TableCell>Error</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredLogs
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{log.notificationType}</TableCell>
                      <TableCell>{log.userName}</TableCell>
                      <TableCell>{log.role}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {channelIcons[log.channel as keyof typeof channelIcons]}
                          {log.channel}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getStatusIcon(log.status)}
                          <Chip
                            label={log.status}
                            size="small"
                            color={getStatusColor(log.status) as any}
                          />
                        </Box>
                      </TableCell>
                      <TableCell>{log.sentAt.toLocaleString()}</TableCell>
                      <TableCell>{log.deliveredAt?.toLocaleString() || '-'}</TableCell>
                      <TableCell>
                        {log.errorMessage && (
                          <Tooltip title={log.errorMessage}>
                            <Typography variant="body2" color="error" sx={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {log.errorMessage}
                            </Typography>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredLogs.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(event, newPage) => setPage(newPage)}
              onRowsPerPageChange={(event) => {
                setRowsPerPage(parseInt(event.target.value, 10));
                setPage(0);
              }}
            />
          </TableContainer>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        {/* Analytics */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Delivery Success Rate
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CircularProgress
                    variant="determinate"
                    value={85}
                    size={60}
                    color="success"
                  />
                  <Box>
                    <Typography variant="h4">85%</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Success Rate
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Channel Performance
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {channels.map(channel => (
                    <Box key={channel} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {channelIcons[channel as keyof typeof channelIcons]}
                        <Typography variant="body2">{channel}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={Math.random() * 100}
                          sx={{ width: 100, height: 8, borderRadius: 4 }}
                        />
                        <Typography variant="body2">
                          {Math.floor(Math.random() * 100)}%
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <Box sx={{ maxWidth: 500, mx: 'auto', mt: 4 }}>
          <Alert icon={<InfoOutlinedIcon fontSize="inherit" />} severity="info" sx={{ mb: 3 }}>
            <b>Step 1:</b> Select a notification event type to simulate.<br />
            <b>Step 2:</b> Fill in the variables for the template.<br />
            <b>Step 3:</b> Preview the notification and see who will receive it.<br />
            <b>Step 4:</b> Click <b>Send Test Notification</b> to emit the event as if it happened in the system. This is useful for testing templates and delivery.
          </Alert>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Select Event Type</InputLabel>
              <Select
                value={emitEventType}
                label="Select Event Type"
                onChange={e => setEmitEventType(e.target.value)}
              >
                {notificationEvents.map(event => (
                  <MenuItem key={event.key} value={event.key}>{event.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              size="small"
              disabled={!emitEventType || loadingSample}
              onClick={async () => {
                if (!emitEventType) return;
                setLoadingSample(true);
                try {
                  const res = await axios.get(`/api/notifications/test-data?eventType=${emitEventType}`);
                  if (res.data && res.data.context) {
                    setEmitVariables(res.data.context);
                  }
                } finally {
                  setLoadingSample(false);
                }
              }}
            >
              {loadingSample ? 'Loading...' : 'Load Sample Data'}
            </Button>
          </Box>
          {emitEventType && emitVariableList.length > 0 && (
            <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {emitVariableList.map(v => (
                <TextField
                  key={v.variable}
                  label={v.description || v.variable}
                  value={emitVariables[v.variable] || ''}
                  onChange={e => setEmitVariables({ ...emitVariables, [v.variable]: e.target.value })}
                  fullWidth
                />
              ))}
              {/* Live Preview and Target Audience */}
              <Box sx={{ mt: 2, p: 2, border: '1px solid #eee', borderRadius: 2, background: '#fafbfc' }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  <InfoOutlinedIcon sx={{ fontSize: 18, mr: 1, verticalAlign: 'middle' }} />
                  <b>Preview:</b>
                </Typography>
                {/* Find the selected notification type and render the template preview */}
                {(() => {
                  const selectedType = notificationTypes.find(nt => nt.eventType === emitEventType);
                  if (!selectedType) return <Typography color="text.secondary">No template found for this event.</Typography>;
                  let preview = selectedType.messageTemplate;
                  Object.entries(emitVariables).forEach(([key, value]) => {
                    preview = preview.replace(new RegExp(`{{${key}}}`, 'g'), value || `{${key}}`);
                  });
                  return <Typography sx={{ whiteSpace: 'pre-line', fontFamily: 'monospace', color: '#333' }}>{preview}</Typography>;
                })()}
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  <InfoOutlinedIcon sx={{ fontSize: 18, mr: 1, verticalAlign: 'middle' }} />
                  <b>Target Audience:</b>
                </Typography>
                {(() => {
                  const selectedType = notificationTypes.find(nt => nt.eventType === emitEventType);
                  if (!selectedType) return <Typography color="text.secondary">No roles/channels found for this event.</Typography>;
                  const roleNames = roles.filter(r => selectedType.roles.includes(r._id)).map(r => r.name).join(', ') || 'No roles selected';
                  const enabledChannels = Object.entries(selectedType.channels).filter(([_k, v]) => v).map(([k]) => k).join(', ') || 'No channels enabled';
                  return <Typography color="text.secondary">{roleNames} ({enabledChannels})</Typography>;
                })()}
              </Box>
              <Button
                variant="contained"
                color="primary"
                disabled={emitLoading}
                onClick={async () => {
                  setEmitLoading(true);
                  setEmitResult(null);
                  try {
                    await axios.post('/api/notifications/emit', {
                      eventType: emitEventType,
                      context: emitVariables
                    });
                    setEmitResult('Notification emitted successfully!');
                  } catch (err: any) {
                    setEmitResult(err?.response?.data?.error || 'Failed to emit notification.');
                  } finally {
                    setEmitLoading(false);
                  }
                }}
              >
                Send Test Notification
              </Button>
              {emitResult && <Alert severity={emitResult.includes('success') ? 'success' : 'error'}>{emitResult}</Alert>}
            </Box>
          )}
        </Box>
      </TabPanel>

      <TabPanel value={tabValue} index={4}>
        {/* Chat Settings */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <ChatIcon color="primary" />
            Chat System Configuration
          </Typography>
          <Alert severity="info" sx={{ mb: 3 }}>
            Configure chat permissions, availability settings, and restrictions for the platform.
          </Alert>
        </Box>

        {/* Permission Matrix */}
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SecurityIcon color="primary" />
              <Typography variant="h6">Permission Matrix</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Define which roles can chat with each other and their permissions.
            </Typography>
            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>From Role</TableCell>
                    <TableCell>To Role</TableCell>
                    <TableCell align="center">Can Chat</TableCell>
                    <TableCell align="center">Can Initiate</TableCell>
                    <TableCell align="center">Can Respond</TableCell>
                    <TableCell align="center">Course Required</TableCell>
                    <TableCell align="center">Lesson Required</TableCell>
                    <TableCell align="center">Daily Limit</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(chatPermissionMatrix).map(([fromRole, toRoles]) =>
                    Object.entries(toRoles).map(([toRole, permissions]) => (
                      <TableRow key={`${fromRole}-${toRole}`}>
                        <TableCell sx={{ fontWeight: 'bold', textTransform: 'capitalize' }}>
                          {fromRole.replace('_', ' ')}
                        </TableCell>
                        <TableCell sx={{ textTransform: 'capitalize' }}>
                          {toRole.replace('_', ' ')}
                        </TableCell>
                        <TableCell align="center">
                          <Checkbox
                            checked={permissions.canChat}
                            onChange={(e) => handlePermissionMatrixChange(fromRole, toRole, 'canChat', e.target.checked)}
                            color="primary"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Checkbox
                            checked={permissions.canInitiate}
                            onChange={(e) => handlePermissionMatrixChange(fromRole, toRole, 'canInitiate', e.target.checked)}
                            color="primary"
                            disabled={!permissions.canChat}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Checkbox
                            checked={permissions.canRespond}
                            onChange={(e) => handlePermissionMatrixChange(fromRole, toRole, 'canRespond', e.target.checked)}
                            color="primary"
                            disabled={!permissions.canChat}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Checkbox
                            checked={permissions.requiresCourseEnrollment || false}
                            onChange={(e) => handlePermissionMatrixChange(fromRole, toRole, 'requiresCourseEnrollment', e.target.checked)}
                            color="primary"
                            disabled={!permissions.canChat}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <TextField
                            size="small"
                            type="number"
                            value={permissions.requiresLessonCompletion || 0}
                            onChange={(e) => handlePermissionMatrixChange(fromRole, toRole, 'requiresLessonCompletion', parseInt(e.target.value) || 0)}
                            disabled={!permissions.canChat}
                            sx={{ width: 60 }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <TextField
                            size="small"
                            type="number"
                            value={permissions.maxDailyMessages || 0}
                            onChange={(e) => handlePermissionMatrixChange(fromRole, toRole, 'maxDailyMessages', parseInt(e.target.value) || 0)}
                            disabled={!permissions.canChat}
                            sx={{ width: 60 }}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </AccordionDetails>
        </Accordion>

        {/* Availability Settings */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccessTimeIcon color="primary" />
              <Typography variant="h6">Availability Settings</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Creator Default Hours</Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <TextField
                    label="Start Time"
                    type="time"
                    value={chatAvailabilitySettings.creatorDefaultHours.start}
                    onChange={(e) => handleAvailabilitySettingsChange('creatorDefaultHours', {
                      ...chatAvailabilitySettings.creatorDefaultHours,
                      start: e.target.value
                    })}
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    label="End Time"
                    type="time"
                    value={chatAvailabilitySettings.creatorDefaultHours.end}
                    onChange={(e) => handleAvailabilitySettingsChange('creatorDefaultHours', {
                      ...chatAvailabilitySettings.creatorDefaultHours,
                      end: e.target.value
                    })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Global Chat Window</Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <TextField
                    label="Start Time"
                    type="time"
                    value={chatAvailabilitySettings.globalChatWindow.start}
                    onChange={(e) => handleAvailabilitySettingsChange('globalChatWindow', {
                      ...chatAvailabilitySettings.globalChatWindow,
                      start: e.target.value
                    })}
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    label="End Time"
                    type="time"
                    value={chatAvailabilitySettings.globalChatWindow.end}
                    onChange={(e) => handleAvailabilitySettingsChange('globalChatWindow', {
                      ...chatAvailabilitySettings.globalChatWindow,
                      end: e.target.value
                    })}
                    InputLabelProps={{ shrink: true }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Max Daily Chats</Typography>
                <Slider
                  value={chatAvailabilitySettings.maxDailyChats}
                  onChange={(_, value) => handleAvailabilitySettingsChange('maxDailyChats', value)}
                  min={10}
                  max={200}
                  step={10}
                  marks
                  valueLabelDisplay="auto"
                />
                <Typography variant="caption" color="text.secondary">
                  Current: {chatAvailabilitySettings.maxDailyChats} chats per day
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Auto Archive (Days)</Typography>
                <Slider
                  value={chatAvailabilitySettings.autoArchiveDays}
                  onChange={(_, value) => handleAvailabilitySettingsChange('autoArchiveDays', value)}
                  min={7}
                  max={90}
                  step={7}
                  marks
                  valueLabelDisplay="auto"
                />
                <Typography variant="caption" color="text.secondary">
                  Current: {chatAvailabilitySettings.autoArchiveDays} days
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Feature Toggles</Typography>
                <FormGroup row>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={chatAvailabilitySettings.allowFileSharing}
                        onChange={(e) => handleAvailabilitySettingsChange('allowFileSharing', e.target.checked)}
                      />
                    }
                    label="Allow File Sharing"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={chatAvailabilitySettings.allowVoiceMessages}
                        onChange={(e) => handleAvailabilitySettingsChange('allowVoiceMessages', e.target.checked)}
                      />
                    }
                    label="Allow Voice Messages"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={chatAvailabilitySettings.allowScheduledChats}
                        onChange={(e) => handleAvailabilitySettingsChange('allowScheduledChats', e.target.checked)}
                      />
                    }
                    label="Allow Scheduled Chats"
                  />
                </FormGroup>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* Role Restrictions */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <BlockIcon color="primary" />
              <Typography variant="h6">Role Restrictions</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="subtitle2">
                Define specific restrictions for each role
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddRestriction}
                size="small"
              >
                Add Restriction
              </Button>
            </Box>
            {chatRestrictions.map((restriction, index) => (
              <Card key={index} sx={{ mb: 2, p: 2 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Role</InputLabel>
                      <Select
                        value={restriction.role}
                        label="Role"
                        onChange={(e) => handleUpdateRestriction(index, 'role', e.target.value)}
                      >
                        <MenuItem value="learner">Learner</MenuItem>
                        <MenuItem value="creator">Creator</MenuItem>
                        <MenuItem value="brand">Brand</MenuItem>
                        <MenuItem value="admin">Admin</MenuItem>
                        <MenuItem value="account_manager">Account Manager</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Restriction Type</InputLabel>
                      <Select
                        value={restriction.restriction}
                        label="Restriction Type"
                        onChange={(e) => handleUpdateRestriction(index, 'restriction', e.target.value)}
                      >
                        <MenuItem value="lesson_completion">Lesson Completion</MenuItem>
                        <MenuItem value="course_enrollment">Course Enrollment</MenuItem>
                        <MenuItem value="daily_message_limit">Daily Message Limit</MenuItem>
                        <MenuItem value="time_window">Time Window</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Value"
                      value={restriction.value}
                      onChange={(e) => handleUpdateRestriction(index, 'value', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Description"
                      value={restriction.description}
                      onChange={(e) => handleUpdateRestriction(index, 'description', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={1}>
                    <IconButton
                      color="error"
                      onClick={() => handleRemoveRestriction(index)}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              </Card>
            ))}
          </AccordionDetails>
        </Accordion>

        {/* Save Button */}
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          {chatSettingsSaved && (
            <Alert severity="success" sx={{ flex: 1 }}>
              Chat settings saved successfully!
            </Alert>
          )}
          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={handleSaveChatSettings}
            disabled={savingChatSettings}
          >
            {savingChatSettings ? 'Saving...' : 'Save Chat Settings'}
          </Button>
        </Box>
      </TabPanel>

      {/* Add/Edit Notification Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Notifications</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Notification Event Type</InputLabel>
                  <Select
                    value={editingNotification?.eventType || ''}
                    label="Notification Event Type"
                    onChange={(e) => {
                      if (!editingNotification) return;
                      setEditingNotification({
                        ...editingNotification,
                        id: editingNotification.id ?? '',
                        eventType: e.target.value
                      });
                    }}
                  >
                    {notificationEvents.map(event => (
                      <MenuItem key={event.key} value={event.key}>{event.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notification Title"
                  value={editingNotification?.title || ''}
                  onChange={(e) => {
                    if (!editingNotification) return;
                    setEditingNotification({
                      ...editingNotification,
                      id: editingNotification.id ?? '',
                      title: e.target.value
                    });
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Message Template
                  </Typography>
                  <NotificationVariablesInfo variables={templateVariables} />
                </Box>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label=""
                  value={editingNotification?.messageTemplate || ''}
                  onChange={(e) => {
                    if (!editingNotification) return;
                    setEditingNotification({
                      ...editingNotification,
                      id: editingNotification.id ?? '',
                      messageTemplate: e.target.value
                    });
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Select Roles:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {roles.map(role => (
                    <Chip
                      key={role._id}
                      label={role.name}
                      variant={editingNotification?.roles.includes(role._id) ? 'filled' : 'outlined'}
                      color={editingNotification?.roles.includes(role._id) ? 'primary' : 'default'}
                      onClick={() => {
                        if (!editingNotification) return;
                        const newRoles = editingNotification.roles.includes(role._id)
                          ? editingNotification.roles.filter(r => r !== role._id)
                          : [...editingNotification.roles, role._id];
                        setEditingNotification({
                          ...editingNotification,
                          id: editingNotification.id ?? '',
                          roles: newRoles
                        });
                      }}
                      sx={{ cursor: 'pointer' }}
                    />
                  ))}
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" gutterBottom>
                  Select Channels:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {channels.map(channel => (
                    <FormControlLabel
                      key={channel}
                      control={
                        <Switch
                          checked={editingNotification?.channels[channel as keyof typeof editingNotification.channels]}
                          onChange={(e) => {
                            if (!editingNotification) return;
                            setEditingNotification({
                              ...editingNotification,
                              id: editingNotification.id ?? '',
                              channels: {
                                ...editingNotification.channels,
                                [channel]: e.target.checked
                              }
                            });
                          }}
                        />
                      }
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {channelIcons[channel as keyof typeof channelIcons]}
                          {channel}
                        </Box>
                      }
                    />
                  ))}
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={editingNotification?.priority || 'medium'}
                    label="Priority"
                    onChange={(e) => {
                      if (!editingNotification) return;
                      setEditingNotification({
                        ...editingNotification,
                        id: editingNotification.id ?? '',
                        priority: e.target.value as 'low' | 'medium' | 'high'
                      });
                    }}
                  >
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={editingNotification?.isActive || false}
                      onChange={(e) => {
                        if (!editingNotification) return;
                        setEditingNotification({
                          ...editingNotification,
                          id: editingNotification.id ?? '',
                          isActive: e.target.checked
                        });
                      }}
                    />
                  }
                  label="Active"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Schedule Type</InputLabel>
                  <Select
                    value={editingNotification?.schedule?.type || 'immediate'}
                    label="Schedule Type"
                    onChange={e => {
                      if (!editingNotification) return;
                      setEditingNotification({
                        ...editingNotification,
                        id: editingNotification.id ?? '',
                        schedule: {
                          ...defaultSchedule,
                          ...editingNotification.schedule,
                          type: e.target.value as 'immediate' | 'scheduled',
                          enabled: e.target.value === 'scheduled'
                        }
                      });
                    }}
                  >
                    <MenuItem value="immediate">Immediate</MenuItem>
                    <MenuItem value="scheduled">Scheduled</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              {editingNotification?.schedule?.type === 'scheduled' && (
                <>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Time (HH:MM)"
                      type="time"
                      value={editingNotification?.schedule?.time || ''}
                      onChange={e => {
                        if (!editingNotification) return;
                        setEditingNotification({
                          ...editingNotification,
                          id: editingNotification.id ?? '',
                          schedule: {
                            ...defaultSchedule,
                            ...editingNotification.schedule,
                            time: e.target.value
                          }
                        });
                      }}
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ step: 60 }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Days of Week</InputLabel>
                      <Select
                        multiple
                        value={editingNotification?.schedule?.days || []}
                        label="Days of Week"
                        onChange={e => {
                          if (!editingNotification) return;
                          setEditingNotification({
                            ...editingNotification,
                            id: editingNotification.id ?? '',
                            schedule: {
                              ...defaultSchedule,
                              ...editingNotification.schedule,
                              days: e.target.value as string[]
                            }
                          });
                        }}
                        renderValue={selected => (selected as string[]).join(', ')}
                      >
                        {["monday","tuesday","wednesday","thursday","friday","saturday","sunday"].map(day => (
                          <MenuItem key={day} value={day}>{day.charAt(0).toUpperCase() + day.slice(1)}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Specific Date (optional)"
                      type="date"
                      value={editingNotification?.schedule?.date ? editingNotification.schedule.date.slice(0,10) : ''}
                      onChange={e => {
                        if (!editingNotification) return;
                        setEditingNotification({
                          ...editingNotification,
                          id: editingNotification.id ?? '',
                          schedule: {
                            ...defaultSchedule,
                            ...editingNotification.schedule,
                            date: e.target.value
                          }
                        });
                      }}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Cron Expression (optional)"
                      value={editingNotification?.schedule?.cron || ''}
                      onChange={e => {
                        if (!editingNotification) return;
                        setEditingNotification({
                          ...editingNotification,
                          id: editingNotification.id ?? '',
                          schedule: {
                            ...defaultSchedule,
                            ...editingNotification.schedule,
                            cron: e.target.value
                          }
                        });
                      }}
                      helperText="Advanced: e.g. 0 9 * * 1 for every Monday at 9am"
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveNotification} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </StyledPaper>
  );
};

export default NotificationControlCenter; 