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
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  VpnKey as VpnKeyIcon,
  PersonAdd as PersonAddIcon,
  Person as PersonIcon,
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
    const userTypeName = user.userType && user.userType.name ? user.userType.name.toLowerCase() : '';
    const matchesSearch = (user.name ? user.name.toLowerCase() : '').includes(searchTerm.toLowerCase()) ||
                         (user.email ? user.email.toLowerCase() : '').includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || (user.userType && user.userType._id === typeFilter);
    return matchesSearch && matchesType;
  });
  
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
              <TableCell>Name</TableCell>
                <TableCell>User ID</TableCell>
              <TableCell>Creator ID</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Last Login</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
            {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((user) => (
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
                  <Chip label={user.status} color={user.status === 'active' ? 'success' : 'default'} size="small" />
                    </TableCell>
                    <TableCell>
                  {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Reset Password">
                    <IconButton onClick={() => handleOpenResetDialog(user)}><VpnKeyIcon /></IconButton>
                  </Tooltip>
                  <Tooltip title="Edit User">
                    <IconButton onClick={() => handleEditUser(user)}><EditIcon /></IconButton>
                  </Tooltip>
                  <Tooltip title="Delete User">
                    <IconButton onClick={() => handleDeleteUser(user._id)}><DeleteIcon /></IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
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
    </StyledPaper>
  );
};

export default UserManagement; 