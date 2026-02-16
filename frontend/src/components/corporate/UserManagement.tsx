import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid,
  styled,
  Tooltip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Popover,
  Menu,
  ListItemIcon,
  ListItemText,
  TableSortLabel,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  VpnKey as VpnKeyIcon,
  PersonAdd as PersonAddIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Block as BlockIcon,
  PlayCircleOutline as ReactivateIcon,
  InfoOutlined as InfoOutlinedIcon,
  ReportProblemOutlined as ReportIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import userService, { User, CreateUserData, UpdateUserData } from '../../services/userService';
import userTypeService, { UserType } from '../../services/userTypeService';
import roleService, { Role } from '../../services/roleService';
import { FuturisticNotification, NotificationType } from '../common/FuturisticNotification';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  margin: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[3],
  minHeight: '100vh',
}));

const MAX_REASON_PREVIEW = 18;

const ReasonTrigger = styled(Box)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(0.75, 1.25),
  borderRadius: 10,
  border: '1px solid rgba(211, 47, 47, 0.35)',
  background: 'linear-gradient(135deg, rgba(211, 47, 47, 0.06), rgba(211, 47, 47, 0.02))',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  maxWidth: '100%',
  minWidth: 0,
  overflow: 'hidden',
  '&:hover': {
    borderColor: 'rgba(211, 47, 47, 0.6)',
    background: 'linear-gradient(135deg, rgba(211, 47, 47, 0.1), rgba(211, 47, 47, 0.04))',
    boxShadow: '0 2px 12px rgba(211, 47, 47, 0.12)',
  },
}));

const ReasonPopoverPaper = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(145deg, rgba(28, 28, 32, 0.97), rgba(18, 18, 22, 0.98))',
  backdropFilter: 'blur(16px)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: 16,
  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.35)',
  padding: theme.spacing(2),
  minWidth: 280,
  maxWidth: 360,
  color: '#e8e8e8',
}));

const EmptyReasonCell = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.disabled,
  fontStyle: 'italic',
  fontSize: '0.8125rem',
}));

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [userTypes, setUserTypes] = useState<UserType[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<Partial<CreateUserData | UpdateUserData>>({});
  
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ open: boolean, message: string, title: string, type: NotificationType }>({ open: false, message: '', title: '', type: 'info' });
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [suspendUserSelected, setSuspendUserSelected] = useState<User | null>(null);
  const [suspendReason, setSuspendReason] = useState('');
  const [suspendLoading, setSuspendLoading] = useState(false);
  const [reactivateDialogOpen, setReactivateDialogOpen] = useState(false);
  const [reactivateUserSelected, setReactivateUserSelected] = useState<User | null>(null);
  const [reactivateReason, setReactivateReason] = useState('');
  const [reactivateLoading, setReactivateLoading] = useState(false);
  const [reasonPopoverAnchor, setReasonPopoverAnchor] = useState<HTMLElement | null>(null);
  const [reasonPopoverUser, setReasonPopoverUser] = useState<User | null>(null);
  const [actionMenuAnchor, setActionMenuAnchor] = useState<HTMLElement | null>(null);
  const [actionMenuUser, setActionMenuUser] = useState<User | null>(null);
  const [orderBy, setOrderBy] = useState<string>('name');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [usersData, userTypesData, rolesData] = await Promise.all([
        userService.getUsers(),
        userTypeService.getUserTypes(),
        roleService.getRoles(),
      ]);
      setUsers(usersData);
      setUserTypes(userTypesData);
      setRoles(rolesData);
    } catch (err) {
      setError('Failed to fetch data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    setFormData({ name: '', email: '', password: '', userType: '', role: '' });
    setOpenDialog(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setFormData({ 
      name: user.name, 
      email: user.email, 
      userType: user.userType._id,
      role: user.role?._id || ''
    });
    setOpenDialog(true);
  };
  
  const handleDeleteUser = async (userId: string) => {
    const userToDelete = users.find(user => user._id === userId);
    if (userToDelete && userToDelete.status === 'deleted') {
      setNotification({
        open: true,
        title: 'Action Denied',
        message: 'This user is already deleted and cannot be deleted again.',
        type: 'warning',
      });
      return;
    }

    if (window.confirm('Are you sure you want to deactivate this user? This is a soft delete.')) {
      try {
        await userService.deleteUser(userId);
        await fetchData();
        setNotification({
          open: true,
          title: 'Success',
          message: 'User has been successfully deactivated.',
          type: 'success',
        });
      } catch (err) {
        setError('Failed to delete user.');
      }
    }
  };

  const handleSaveUser = async () => {
    try {
      if (selectedUser) {
        await userService.updateUser(selectedUser._id, formData as UpdateUserData);
      } else {
        await userService.createUser(formData as CreateUserData);
      }
      setOpenDialog(false);
      await fetchData();
    } catch (err) {
      setError('Failed to save user.');
    }
  };

  const handleApproveUser = async (userId: string) => {
    try {
      setActionLoading(userId);
      await userService.approveUser(userId);
      await fetchData();
      setNotification({ open: true, title: 'Success', message: 'Creator approved. Status is now active.', type: 'success' });
    } catch (err) {
      setNotification({ open: true, title: 'Error', message: 'Failed to approve user.', type: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to reject this creator? Their status will be set to rejected.')) return;
    try {
      setActionLoading(userId);
      await userService.rejectUser(userId);
      await fetchData();
      setNotification({
        open: true,
        title: 'Rejected',
        message: 'Creator has been rejected. Status is now rejected.',
        type: 'error',
      });
    } catch (err) {
      setNotification({ open: true, title: 'Error', message: 'Failed to reject user.', type: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleOpenSuspendDialog = (user: User) => {
    setSuspendUserSelected(user);
    setSuspendReason('');
    setSuspendDialogOpen(true);
  };

  const handleCloseSuspendDialog = () => {
    setSuspendDialogOpen(false);
    setSuspendUserSelected(null);
    setSuspendReason('');
  };

  const handleConfirmSuspend = async () => {
    if (!suspendUserSelected || !suspendReason.trim()) {
      setNotification({ open: true, title: 'Required', message: 'Please enter a reason for suspension.', type: 'warning' });
      return;
    }
    try {
      setSuspendLoading(true);
      await userService.suspendUser(suspendUserSelected._id, suspendReason.trim());
      handleCloseSuspendDialog();
      await fetchData();
      setNotification({
        open: true,
        title: 'Suspended',
        message: 'User has been suspended. They will not be able to login until reactivated.',
        type: 'error',
      });
    } catch (err: any) {
      setNotification({
        open: true,
        title: 'Error',
        message: err.response?.data?.message || 'Failed to suspend user.',
        type: 'error',
      });
    } finally {
      setSuspendLoading(false);
    }
  };

  const handleOpenReactivateDialog = (user: User) => {
    setReactivateUserSelected(user);
    setReactivateReason('');
    setReactivateDialogOpen(true);
  };

  const handleCloseReactivateDialog = () => {
    setReactivateDialogOpen(false);
    setReactivateUserSelected(null);
    setReactivateReason('');
  };

  const handleConfirmReactivate = async () => {
    if (!reactivateUserSelected || !reactivateReason.trim()) return;
    try {
      setReactivateLoading(true);
      await userService.unsuspendUser(reactivateUserSelected._id, reactivateReason.trim());
      await fetchData();
      setNotification({
        open: true,
        title: 'Success',
        message: 'User has been reactivated. They can login again.',
        type: 'success',
      });
      handleCloseReactivateDialog();
    } catch (err) {
      setNotification({ open: true, title: 'Error', message: (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to reactivate user.', type: 'error' });
    } finally {
      setReactivateLoading(false);
    }
  };

  const handleOpenResetDialog = (user: User) => {
    setSelectedUser(user);
    setResetDialogOpen(true);
  };

  const handleCloseResetDialog = () => {
    setResetDialogOpen(false);
    setSelectedUser(null);
    setResetting(false);
    setTempPassword(null);
  };

  const handleConfirmReset = async () => {
    if (!selectedUser) return;
    setResetting(true);
    try {
      const result = await userService.resetPassword(selectedUser._id);
      setTempPassword(result.temporaryPassword);
    } catch (err) {
      setError('Failed to reset password.');
    } finally {
      setResetting(false);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => setPage(newPage);

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = (user.name ? user.name.toLowerCase() : '').includes(searchTerm.toLowerCase()) ||
                         (user.email ? user.email.toLowerCase() : '').includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || (user.userType && user.userType._id === typeFilter);
    return matchesSearch && matchesType;
  });

  const getComparator = (key: string): (a: User, b: User) => number => {
    return (_a, _b) => {
      let aVal: string | number;
      let bVal: string | number;
      switch (key) {
        case 'name': aVal = (_a.name || '').toLowerCase(); bVal = (_b.name || '').toLowerCase(); break;
        case 'userId': aVal = (_a.userId || '').toLowerCase(); bVal = (_b.userId || '').toLowerCase(); break;
        case 'type': aVal = (_a.userType?.name || '').toLowerCase(); bVal = (_b.userType?.name || '').toLowerCase(); break;
        case 'role': aVal = (_a.role?.name || '').toLowerCase(); bVal = (_b.role?.name || '').toLowerCase(); break;
        case 'status': aVal = (_a.status || '').toLowerCase(); bVal = (_b.status || '').toLowerCase(); break;
        case 'lastLogin':
          aVal = _a.lastLogin ? new Date(_a.lastLogin).getTime() : 0;
          bVal = _b.lastLogin ? new Date(_b.lastLogin).getTime() : 0;
          break;
        default: aVal = (_a.name || '').toLowerCase(); bVal = (_b.name || '').toLowerCase();
      }
      const mult = order === 'asc' ? 1 : -1;
      if (aVal < bVal) return -1 * mult;
      if (aVal > bVal) return 1 * mult;
      return 0;
    };
  };

  const sortedUsers = [...filteredUsers].sort(getComparator(orderBy));

  const handleRequestSort = (property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleCloseActionMenu = () => {
    setActionMenuAnchor(null);
    setActionMenuUser(null);
  };
  
  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <StyledPaper>
      <FuturisticNotification
        open={notification.open}
        onClose={() => setNotification({ ...notification, open: false })}
        title={notification.title}
        message={notification.message}
        type={notification.type}
      />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1">User Management</Typography>
        <Button variant="contained" startIcon={<PersonAddIcon />} onClick={handleAddUser}>
          Add User
        </Button>
        </Box>
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                label="Search Users"
                variant="outlined"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Grid>
          <Grid item xs={12} sm={4}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>User Type</InputLabel>
                <Select
                  value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as string)}
                  label="User Type"
                >
                  <MenuItem value="all">All Users</MenuItem>
                {userTypes.map(type => <MenuItem key={type._id} value={type._id}>{type.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>

      <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sortDirection={orderBy === 'name' ? order : false}>
                  <TableSortLabel active={orderBy === 'name'} direction={orderBy === 'name' ? order : 'asc'} onClick={() => handleRequestSort('name')} hideSortIcon={false} sx={{ '& .MuiTableSortLabel-icon': { opacity: 1 } }}>
                    Name
                  </TableSortLabel>
                </TableCell>
                <TableCell sortDirection={orderBy === 'userId' ? order : false}>
                  <TableSortLabel active={orderBy === 'userId'} direction={orderBy === 'userId' ? order : 'asc'} onClick={() => handleRequestSort('userId')} hideSortIcon={false} sx={{ '& .MuiTableSortLabel-icon': { opacity: 1 } }}>
                    User ID
                  </TableSortLabel>
                </TableCell>
              <TableCell>Creator ID</TableCell>
                <TableCell sortDirection={orderBy === 'type' ? order : false}>
                  <TableSortLabel active={orderBy === 'type'} direction={orderBy === 'type' ? order : 'asc'} onClick={() => handleRequestSort('type')} hideSortIcon={false} sx={{ '& .MuiTableSortLabel-icon': { opacity: 1 } }}>
                    Type
                  </TableSortLabel>
                </TableCell>
                <TableCell sortDirection={orderBy === 'role' ? order : false}>
                  <TableSortLabel active={orderBy === 'role'} direction={orderBy === 'role' ? order : 'asc'} onClick={() => handleRequestSort('role')} hideSortIcon={false} sx={{ '& .MuiTableSortLabel-icon': { opacity: 1 } }}>
                    Role
                  </TableSortLabel>
                </TableCell>
                <TableCell sortDirection={orderBy === 'status' ? order : false}>
                  <TableSortLabel active={orderBy === 'status'} direction={orderBy === 'status' ? order : 'asc'} onClick={() => handleRequestSort('status')} hideSortIcon={false} sx={{ '& .MuiTableSortLabel-icon': { opacity: 1 } }}>
                    Status
                  </TableSortLabel>
                </TableCell>
                <TableCell>Reason</TableCell>
                <TableCell sortDirection={orderBy === 'lastLogin' ? order : false}>
                  <TableSortLabel active={orderBy === 'lastLogin'} direction={orderBy === 'lastLogin' ? order : 'asc'} onClick={() => handleRequestSort('lastLogin')} hideSortIcon={false} sx={{ '& .MuiTableSortLabel-icon': { opacity: 1 } }}>
                    Last Login
                  </TableSortLabel>
                </TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
            {sortedUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((user) => (
              <TableRow key={user._id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ mr: 2, bgcolor: user.userType && user.userType.color ? `${user.userType.color}.main` : 'primary.main' }}>
                      {user.name ? user.name.charAt(0) : '?'}
                        </Avatar>
                        <Box>
                      <Typography variant="body1">{user.name || 'Unknown User'}</Typography>
                      <Typography variant="body2" color="text.secondary">{user.email || 'No email'}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                <TableCell>{user.userId}</TableCell>
                <TableCell>{user.creatorId || 'N/A'}</TableCell>
                    <TableCell>
                  <Chip label={user.userType && user.userType.name ? user.userType.name : 'Unknown'} size="small" sx={{ 
                      backgroundColor: user.userType && user.userType.color ? `${user.userType.color}.light` : 'default',
                      color: user.userType && user.userType.color ? `${user.userType.color}.dark` : 'inherit'
                  }} />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.role && user.role.name ? user.role.name : 'No Role'}
                        size="small"
                        color="default"
                      />
                    </TableCell>
                    <TableCell>
                  <Chip
                        label={user.status}
                        size="small"
                        color={
                          user.status === 'active' ? 'success' :
                          user.status === 'pending' ? 'warning' :
                          user.status === 'rejected' ? 'error' :
                          user.status === 'suspended' ? 'error' :
                          user.status === 'deleted' ? 'default' : 'default'
                        }
                      />
                    </TableCell>
                    <TableCell sx={{ width: 160, maxWidth: 160, minWidth: 120, overflow: 'hidden' }}>
                      {(user.suspendedReason || user.reactivatedReason) ? (
                        <>
                          <ReasonTrigger
                            onClick={(e) => {
                              setReasonPopoverAnchor(e.currentTarget);
                              setReasonPopoverUser(user);
                            }}
                            role="button"
                            aria-label="View suspension and reactivation details"
                          >
                            <ReportIcon sx={{ fontSize: 18, color: 'rgba(211, 47, 47, 0.9)' }} />
                            <Typography variant="body2" noWrap sx={{ flex: 1, minWidth: 0, fontSize: '0.8125rem' }}>
                              {(user.suspendedReason || user.reactivatedReason || '').length > MAX_REASON_PREVIEW
                                ? `${(user.suspendedReason || user.reactivatedReason || '').slice(0, MAX_REASON_PREVIEW).trim()}…`
                                : (user.suspendedReason || user.reactivatedReason || '')}
                            </Typography>
                            <InfoOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                          </ReasonTrigger>
                        </>
                      ) : (
                        <Tooltip title="No suspension reason on file (e.g. user was reactivated before this was stored)" arrow>
                          <EmptyReasonCell>—</EmptyReasonCell>
                        </Tooltip>
                      )}
                    </TableCell>
                    <TableCell>
                  {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Actions">
                        <IconButton
                          size="small"
                          onClick={(e) => { e.stopPropagation(); setActionMenuAnchor(e.currentTarget); setActionMenuUser(user); }}
                          aria-label="Open actions menu"
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Popover
          open={Boolean(reasonPopoverAnchor)}
          anchorEl={reasonPopoverAnchor}
          onClose={() => { setReasonPopoverAnchor(null); setReasonPopoverUser(null); }}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          slotProps={{ paper: { sx: { borderRadius: 2, overflow: 'visible', bgcolor: 'transparent', boxShadow: 'none' } } }}
        >
          <ReasonPopoverPaper>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <ReportIcon sx={{ color: 'rgba(244, 67, 54, 0.95)', fontSize: 22 }} />
              <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.95)', fontWeight: 600 }}>
                Suspension &amp; reactivation
              </Typography>
            </Box>
            <Box sx={{ '& > section': { mb: 2 } }}>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Suspended by</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(232,232,232,0.95)', mb: 0.5 }}>
                {reasonPopoverUser?.suspendedBy && typeof reasonPopoverUser.suspendedBy === 'object'
                  ? `${reasonPopoverUser.suspendedBy.name} (${reasonPopoverUser.suspendedBy.email})`
                  : '—'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Suspension date &amp; time</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(232,232,232,0.95)', mb: 1 }}>
                {reasonPopoverUser?.suspendedAt ? new Date(reasonPopoverUser.suspendedAt).toLocaleString() : '—'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Suspension reason</Typography>
              <Typography variant="body2" sx={{ color: 'rgba(232,232,232,0.95)', lineHeight: 1.6, whiteSpace: 'pre-wrap', mb: 2 }}>
                {reasonPopoverUser?.suspendedReason ?? '—'}
              </Typography>
              {(reasonPopoverUser?.reactivatedAt || reasonPopoverUser?.reactivatedReason) && (
                <>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Reactivated by</Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(232,232,232,0.95)', mb: 0.5 }}>
                    {reasonPopoverUser?.reactivatedBy && typeof reasonPopoverUser.reactivatedBy === 'object'
                      ? `${reasonPopoverUser.reactivatedBy.name} (${reasonPopoverUser.reactivatedBy.email})`
                      : '—'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Reactivation date &amp; time</Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(232,232,232,0.95)', mb: 1 }}>
                    {reasonPopoverUser?.reactivatedAt ? new Date(reasonPopoverUser.reactivatedAt).toLocaleString() : '—'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Reactivation reason</Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(232,232,232,0.95)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                    {reasonPopoverUser?.reactivatedReason ?? '—'}
                  </Typography>
                </>
              )}
            </Box>
          </ReasonPopoverPaper>
        </Popover>
        <Menu
          anchorEl={actionMenuAnchor}
          open={Boolean(actionMenuAnchor)}
          onClose={handleCloseActionMenu}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          slotProps={{ paper: { sx: { minWidth: 180 } } }}
        >
          {actionMenuUser?.status === 'pending' && (
            <>
              <MenuItem onClick={() => { handleApproveUser(actionMenuUser!._id); handleCloseActionMenu(); }} disabled={actionLoading === actionMenuUser?._id}>
                <ListItemIcon><CheckCircleIcon fontSize="small" color="success" /></ListItemIcon>
                <ListItemText>Approve Creator</ListItemText>
              </MenuItem>
              <MenuItem onClick={() => { handleRejectUser(actionMenuUser!._id); handleCloseActionMenu(); }} disabled={actionLoading === actionMenuUser?._id}>
                <ListItemIcon><CancelIcon fontSize="small" color="error" /></ListItemIcon>
                <ListItemText>Reject Creator</ListItemText>
              </MenuItem>
            </>
          )}
          {actionMenuUser?.status === 'suspended' && (
            <MenuItem onClick={() => { handleOpenReactivateDialog(actionMenuUser!); handleCloseActionMenu(); }}>
              <ListItemIcon><ReactivateIcon fontSize="small" color="success" /></ListItemIcon>
              <ListItemText>Reactivate User</ListItemText>
            </MenuItem>
          )}
          {actionMenuUser && actionMenuUser.status !== 'suspended' && actionMenuUser.role?.name !== 'Super Admin' && (
            <MenuItem onClick={() => { handleOpenSuspendDialog(actionMenuUser); handleCloseActionMenu(); }}>
              <ListItemIcon><BlockIcon fontSize="small" color="warning" /></ListItemIcon>
              <ListItemText>Suspend User</ListItemText>
            </MenuItem>
          )}
          <MenuItem onClick={() => { if (actionMenuUser) handleOpenResetDialog(actionMenuUser); handleCloseActionMenu(); }}>
            <ListItemIcon><VpnKeyIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Reset Password</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => { if (actionMenuUser) handleEditUser(actionMenuUser); handleCloseActionMenu(); }}>
            <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Edit User</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => { if (actionMenuUser) handleDeleteUser(actionMenuUser._id); handleCloseActionMenu(); }} sx={{ color: 'error.main' }}>
            <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
            <ListItemText>Delete User</ListItemText>
          </MenuItem>
        </Menu>
        <TablePagination
        rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={filteredUsers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      
      {/* Add/Edit User Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedUser ? 'Edit User' : 'Add New User'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            fullWidth
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            value={formData.email || ''}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          {!selectedUser && (
            <TextField
              margin="dense"
              label="Password"
              type="password"
              fullWidth
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          )}
          <FormControl fullWidth margin="dense">
            <InputLabel>User Type</InputLabel>
            <Select
              value={formData.userType || ''}
              onChange={(e) => setFormData({ ...formData, userType: e.target.value })}
              label="User Type"
            >
              {userTypes.map(type => <MenuItem key={type._id} value={type._id}>{type.name}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense">
            <InputLabel>Role</InputLabel>
            <Select
              value={formData.role || ''}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              label="Role"
            >
              {roles.map(role => <MenuItem key={role._id} value={role._id}>{role.name}</MenuItem>)}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveUser} variant="contained">{selectedUser ? 'Update' : 'Create'}</Button>
        </DialogActions>
      </Dialog>
      
      {/* Reset Password Dialog */}
      <Dialog open={resetDialogOpen} onClose={handleCloseResetDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Reset Password for {selectedUser?.name}</DialogTitle>
        <DialogContent>
          {resetting ? (
            <CircularProgress />
          ) : tempPassword ? (
            <Alert severity="success">
              Password has been reset. The temporary password is: <strong>{tempPassword}</strong>
            </Alert>
          ) : (
            <Typography>Are you sure you want to reset the password for this user? A temporary password will be generated.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseResetDialog}>Close</Button>
          {!tempPassword && <Button onClick={handleConfirmReset} variant="contained" disabled={resetting}>Reset Password</Button>}
        </DialogActions>
      </Dialog>

      {/* Suspend User Dialog */}
      <Dialog open={suspendDialogOpen} onClose={handleCloseSuspendDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Suspend User{suspendUserSelected ? `: ${suspendUserSelected.name}` : ''}</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }} color="text.secondary">
            The user will not be able to login until you reactivate them. Super Admin cannot be suspended.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Reason for suspension (required)"
            fullWidth
            multiline
            minRows={3}
            value={suspendReason}
            onChange={(e) => setSuspendReason(e.target.value)}
            placeholder="e.g. Unwarranted activity, policy violation..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSuspendDialog}>Cancel</Button>
          <Button onClick={handleConfirmSuspend} variant="contained" color="error" disabled={suspendLoading || !suspendReason.trim()}>
            {suspendLoading ? <CircularProgress size={24} /> : 'Suspend'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reactivate User Dialog */}
      <Dialog open={reactivateDialogOpen} onClose={handleCloseReactivateDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Reactivate User{reactivateUserSelected ? `: ${reactivateUserSelected.name}` : ''}</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }} color="text.secondary">
            The user will be able to login again. Please provide a reason for reactivation.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Reason for reactivation (required)"
            fullWidth
            multiline
            minRows={3}
            value={reactivateReason}
            onChange={(e) => setReactivateReason(e.target.value)}
            placeholder="e.g. Issue resolved, reinstated after review..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseReactivateDialog}>Cancel</Button>
          <Button onClick={handleConfirmReactivate} variant="contained" color="success" disabled={reactivateLoading || !reactivateReason.trim()}>
            {reactivateLoading ? <CircularProgress size={24} /> : 'Reactivate'}
          </Button>
        </DialogActions>
      </Dialog>
    </StyledPaper>
  );
};

export default UserManagement; 