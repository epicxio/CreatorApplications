import React, { useState, useEffect, useMemo } from 'react';
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
  styled,
  Avatar,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Security as SecurityIcon,
  PersonOutline,
  StorefrontOutlined,
  StarOutline,
  WorkOutline,
  ManageAccountsOutlined,
  AdminPanelSettingsOutlined,
  ShieldOutlined,
  VisibilityOutlined,
  AddCircleOutline,
  DeleteOutline,
  EditOutlined,
} from '@mui/icons-material';
import roleService, { Role, CreateRoleData, Permission } from '../../services/roleService';
import userService, { User } from '../../services/userService';
import { permissionResources } from '../../config/permissions';
import { permissionActions } from '../../config/permissions';
import { useAuth } from '../../context/AuthContext';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  margin: theme.spacing(2),
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  color: theme.palette.text.primary,
}));

const userTypeIcons: { [key: string]: React.ReactElement } = {
    employee: <WorkOutline color="primary" />,
    creator: <StarOutline color="primary" />,
    brand: <StorefrontOutlined color="primary" />,
    accountmanager: <ManageAccountsOutlined color="primary" />,
    admin: <AdminPanelSettingsOutlined color="primary" />,
    superadmin: <ShieldOutlined color="primary" />,
};

const _permissionIcons = permissionResources.reduce((acc, resource) => {
  acc[resource.name] = <resource.IconComponent />;
  return acc;
}, {} as Record<string, React.ReactElement>);

const actionIcons: { [key: string]: React.ReactElement } = {
  Create: <AddCircleOutline color="success" />,
  View: <VisibilityOutlined color="info" />,
  Edit: <EditOutlined color="warning" />,
  Delete: <DeleteOutline color="error" />,
};

const RoleManagement: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [availablePermissions, setAvailablePermissions] = useState<Permission[]>([]);
  const [availableUserTypes, setAvailableUserTypes] = useState<string[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  const [formData, setFormData] = useState<CreateRoleData>({
    name: '',
    description: '',
    permissions: [] as string[],
    userTypes: [],
    assignedUsers: []
  });

  const { user } = useAuth();
  const _isSuperAdmin = user && (user.role?.name === 'Super Admin' || user.role?.name === 'superadmin');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [rolesData, permissionsData, userTypesData, usersData] = await Promise.all([
        roleService.getRoles(),
        roleService.getPermissions(),
        roleService.getUserTypes(),
        userService.getUsers()
      ]);
      setRoles(rolesData);
      setAvailablePermissions(permissionsData);
      setAvailableUserTypes(userTypesData);
      setUsers(usersData);
    } catch {
      setError('Failed to fetch required data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const _groupedPermissions = useMemo(() => {
    return availablePermissions.reduce((acc, permission) => {
      const resource = permission.resource || 'General';
      acc[resource] = acc[resource] || [];
      acc[resource].push(permission);
      return acc;
    }, {} as Record<string, Permission[]>);
  }, [availablePermissions]);

  const handleAddRole = () => {
    setSelectedRole(null);
    setFormData({
      name: '',
      description: '',
      permissions: [],
      userTypes: [],
      assignedUsers: []
    });
    setOpenDialog(true);
  };

  const handleEditRole = async (role: Role) => {
    // ✅ AUTOMATIC: If editing Super Admin, ensure permissions are synced first
    if (role.name === 'Super Admin') {
      try {
        // Fetching permissions will trigger auto-sync on backend
        const permissionsData = await roleService.getPermissions();
        setAvailablePermissions(permissionsData);
      } catch {
        // Sync permissions failed
      }
    }
    
    setSelectedRole(role);
    setFormData({
      name: role.name,
      description: role.description,
      permissions: role.permissions ? role.permissions.map(p => p._id) : [],
      userTypes: role.userTypes,
      assignedUsers: role.assignedUsers,
    });
    setOpenDialog(true);
  };

  const handleDeleteRole = async (roleId: string) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      try {
        await roleService.deleteRole(roleId);
        await fetchData();
      } catch {
        setError('Failed to delete role. Please try again.');
      }
    }
  };

  const handlePermissionChange = (permissionId: string) => {
    setFormData(prev => {
      const newPermissions = prev.permissions.includes(permissionId)
        ? prev.permissions.filter(id => id !== permissionId)
        : [...prev.permissions, permissionId];
      return { ...prev, permissions: newPermissions };
    });
  };

  const handleUserTypeChange = (userType: string) => {
    const newUserTypes = formData.userTypes.includes(userType)
      ? formData.userTypes.filter(ut => ut !== userType)
      : [...formData.userTypes, userType];
    setFormData({ ...formData, userTypes: newUserTypes });
  };

  const handleAssignUserChange = (userId: string) => {
    const newAssignedUsers = formData.assignedUsers.includes(userId)
      ? formData.assignedUsers.filter(id => id !== userId)
      : [...formData.assignedUsers, userId];
    setFormData({ ...formData, assignedUsers: newAssignedUsers });
  };

  const handleSaveRole = async () => {
    try {
      const payload = {
        ...formData,
        permissions: formData.permissions, // Send permission IDs directly
      };

      if (selectedRole) {
        await roleService.updateRole(selectedRole._id, payload);
      } else {
        await roleService.createRole(payload);
      }
      setOpenDialog(false);
      await fetchData();
    } catch {
      setError('Failed to save role. Please try again.');
    }
  };
  
  const usersToDisplay = users.filter(user => user.userType && formData.userTypes.includes(user.userType.name));

  function renderSimplePermissionView() {
    return (
      <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
        {permissionResources.map((mainMenu) => (
          <Box key={mainMenu.name} sx={{ mb: 3 }}>
            {/* Main Menu Header with Permission Toggles */}
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                mb: 1,
                backgroundColor: 'rgba(25, 118, 210, 0.08)',
                borderLeft: '4px solid #1976d2',
                borderRadius: '8px',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <mainMenu.IconComponent color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#1976d2' }}>
                  {mainMenu.name}
                </Typography>
                {mainMenu.path && (
                  <Typography variant="caption" sx={{ color: 'text.secondary', ml: 1 }}>
                    {mainMenu.path}
                  </Typography>
                )}
                </Box>
                {/* Main Menu Permission Toggles */}
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {permissionActions.map((action) => {
                    const perm = availablePermissions.find(
                      p => p.resource === mainMenu.name && p.action === action
                    );
                    if (perm) {
                      return (
                        <FormControlLabel
                          key={action}
                          control={
                            <Switch
                              size="small"
                              checked={formData.permissions.includes(perm._id)}
                              onChange={() => handlePermissionChange(perm._id)}
                            />
                          }
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              {actionIcons[action]}
                              <Typography variant="caption">{action}</Typography>
                            </Box>
                          }
                          labelPlacement="end"
                          sx={{
                            ml: 0,
                            mr: 1,
                            '& .MuiFormControlLabel-label': {
                              fontSize: '0.75rem',
                              color: 'text.secondary'
                            }
                          }}
                        />
                      );
                    }
                    // ✅ Don't show "Permission not defined" - permissions will be auto-created on sync
                    // Just don't render anything if permission doesn't exist yet
                    // It will appear after next sync (happens automatically on server start or permission fetch)
                    return null;
                  })}
                </Box>
              </Box>
            </Paper>

            {/* Sub Menu Items */}
            {mainMenu.children && mainMenu.children.length > 0 && (
              <Box sx={{ pl: 3 }}>
                {mainMenu.children.map((subMenu) => (
                  <Paper
                    key={subMenu.name}
                    variant="outlined"
                    sx={{
                      p: 2,
                      mb: 1,
                      backgroundColor: 'rgba(255, 255, 255, 0.02)',
                      borderLeft: '3px solid #666',
                      borderRadius: '8px',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <subMenu.IconComponent color="action" />
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                            {subMenu.name}
                          </Typography>
                          {subMenu.path && (
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              {subMenu.path}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                      {/* Permission Actions */}
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {permissionActions.map((action) => {
                          const perm = availablePermissions.find(
                            p => p.resource === subMenu.name && p.action === action
                          );
                          if (perm) {
                            return (
                              <FormControlLabel
                                key={action}
                                control={
                                  <Switch
                                    size="small"
                                    checked={formData.permissions.includes(perm._id)}
                                    onChange={() => handlePermissionChange(perm._id)}
                                  />
                                }
                                label={
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    {actionIcons[action]}
                                    <Typography variant="caption">{action}</Typography>
                                  </Box>
                                }
                                labelPlacement="end"
                                sx={{ 
                                  ml: 0, 
                                  mr: 1,
                                  '& .MuiFormControlLabel-label': {
                                    fontSize: '0.75rem',
                                    color: 'text.secondary'
                                  }
                                }}
                              />
                            );
                          }
                          // ✅ Don't show "Permission not defined" - permissions will be auto-created on sync
                          return null;
                        })}
                      </Box>
                    </Box>
                  </Paper>
                ))}
              </Box>
            )}
          </Box>
        ))}
      </Box>
    );
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <StyledPaper>
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h6">Available Roles</Typography>
          </Grid>
          <Grid item xs={12} md={6} sx={{ textAlign: 'right' }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddRole}
            >
              Add New Role
            </Button>
          </Grid>
        </Grid>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {roles.map((role) => (
          <Grid item xs={12} md={6} lg={4} key={role._id}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    <SecurityIcon />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" component="h2">
                      {role.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {role.description}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Permissions: {role.permissions?.length || 0}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Chip
                    label={role.isActive ? 'Active' : 'Inactive'}
                    color={role.isActive ? 'success' : 'default'}
                    size="small"
                  />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Edit Role">
                      <IconButton size="small" onClick={() => handleEditRole(role)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Role">
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteRole(role._id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add/Edit Role Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{selectedRole ? 'Edit Role' : 'Create New Role'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}><TextField fullWidth label="Role Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required /></Grid>
            <Grid item xs={12}><TextField fullWidth label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} multiline rows={3} required /></Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>Permissions</Typography>
              
              {/* Legend */}
              <Paper variant="outlined" sx={{ p: 2, mb: 2, backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, color: '#1976d2' }}>
                  Permission Structure
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 20, height: 20, backgroundColor: 'rgba(25, 118, 210, 0.08)', borderLeft: '4px solid #1976d2' }} />
                    <Typography variant="caption">Main Menu</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 20, height: 20, backgroundColor: 'rgba(255, 255, 255, 0.02)', borderLeft: '3px solid #666' }} />
                    <Typography variant="caption">Sub Menu</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <VisibilityOutlined color="info" sx={{ fontSize: 16 }} />
                    <Typography variant="caption">View</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AddCircleOutline color="success" sx={{ fontSize: 16 }} />
                    <Typography variant="caption">Create</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EditOutlined color="warning" sx={{ fontSize: 16 }} />
                    <Typography variant="caption">Edit</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DeleteOutline color="error" sx={{ fontSize: 16 }} />
                    <Typography variant="caption">Delete</Typography>
                  </Box>
                </Box>
              </Paper>
              
              {renderSimplePermissionView()}
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>User Types</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {availableUserTypes.map((userType) => (
                  <Paper
                    key={userType}
                    variant="outlined"
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      p: 1.5,
                      borderRadius: '8px'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      {userTypeIcons[userType.toLowerCase()] || <SecurityIcon color="primary" />}
                      <Typography>{userType.charAt(0).toUpperCase() + userType.slice(1)}</Typography>
                    </Box>
                    <Switch
                      checked={formData.userTypes.includes(userType)}
                      onChange={() => handleUserTypeChange(userType)}
                    />
                  </Paper>
                ))}
              </Box>
            </Grid>
            {formData.userTypes.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>Assign Users</Typography>
                <Box sx={{ maxHeight: 300, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 1, p: 0.5 }}>
                  {usersToDisplay.map(user => (
                    <Paper
                      key={user._id}
                      variant="outlined"
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        p: 1.5,
                        borderRadius: '8px'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        {(user.userType && userTypeIcons[user.userType.name.toLowerCase()]) || <PersonOutline color="primary" />}
                        <Box>
                          <Typography>{user.name}</Typography>
                          <Typography variant="body2" color="text.secondary">{user.email}</Typography>
                        </Box>
                      </Box>
                      <Switch
                        checked={formData.assignedUsers.includes(user._id)}
                        onChange={() => handleAssignUserChange(user._id)}
                      />
                    </Paper>
                  ))}
                </Box>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveRole} variant="contained">{selectedRole ? 'Update' : 'Create'}</Button>
        </DialogActions>
      </Dialog>
    </StyledPaper>
  );
};

export default RoleManagement; 