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
  styled,
  Avatar,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Security as SecurityIcon,
  ExpandMore as ExpandMoreIcon,
  WorkOutline,
  StarOutline,
  StorefrontOutlined,
  ManageAccountsOutlined,
  AdminPanelSettingsOutlined,
  ShieldOutlined,
  PersonOutline,
  ArticleOutlined,
  CampaignOutlined,
  AnalyticsOutlined,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import userTypeService, { UserType, CreateUserTypeData } from '../../services/userTypeService';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  margin: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[3],
  minHeight: '100vh',
}));

const PermissionChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  background: 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(10px)',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.9)',
  },
}));

const iconOptions = [
  { value: 'WorkOutline', label: 'Work', icon: <WorkOutline /> },
  { value: 'StarOutline', label: 'Star', icon: <StarOutline /> },
  { value: 'StorefrontOutlined', label: 'Store', icon: <StorefrontOutlined /> },
  { value: 'ManageAccountsOutlined', label: 'Manage', icon: <ManageAccountsOutlined /> },
  { value: 'AdminPanelSettingsOutlined', label: 'Admin', icon: <AdminPanelSettingsOutlined /> },
  { value: 'ShieldOutlined', label: 'Shield', icon: <ShieldOutlined /> },
  { value: 'PersonOutline', label: 'Person', icon: <PersonOutline /> },
  { value: 'Settings', label: 'Settings', icon: <SettingsIcon /> },
];

const colorOptions = [
  { value: 'primary', label: 'Primary' },
  { value: 'secondary', label: 'Secondary' },
  { value: 'success', label: 'Success' },
  { value: 'info', label: 'Info' },
  { value: 'warning', label: 'Warning' },
  { value: 'error', label: 'Error' },
];

const permissionIcons: { [key: string]: React.ReactElement } = {
  user: <PersonOutline color="primary" />,
  role: <SecurityIcon color="primary" />,
  content: <ArticleOutlined color="primary" />,
  campaign: <CampaignOutlined color="primary" />,
  brand: <StorefrontOutlined color="primary" />,
  creator: <StarOutline color="primary" />,
  analytics: <AnalyticsOutlined color="primary" />,
  system: <SettingsIcon color="primary" />,
};

const getIconComponent = (iconName: string) => {
  const iconMap: { [key: string]: React.ReactElement } = {
    WorkOutline: <WorkOutline />,
    StarOutline: <StarOutline />,
    StorefrontOutlined: <StorefrontOutlined />,
    ManageAccountsOutlined: <ManageAccountsOutlined />,
    AdminPanelSettingsOutlined: <AdminPanelSettingsOutlined />,
    ShieldOutlined: <ShieldOutlined />,
    PersonOutline: <PersonOutline />,
    Settings: <SettingsIcon />,
  };
  return iconMap[iconName] || <PersonOutline />;
};

const UserTypeManagement: React.FC = () => {
  const [userTypes, setUserTypes] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUserType, setSelectedUserType] = useState<UserType | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  // Form state for create/edit
  const [formData, setFormData] = useState<Omit<CreateUserTypeData, 'permissions'>>({
    name: '',
    description: '',
    icon: 'PersonOutline',
    color: 'primary',
  });

  // Available permissions for selection (will be moved to Permission Management)
  // const availablePermissions = [
  // ...
  // ];

  useEffect(() => {
    fetchUserTypes();
  }, []);

  const fetchUserTypes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userTypeService.getUserTypes();
      setUserTypes(data);
    } catch (err) {
      setError('Failed to fetch user types. Please try again.');
      console.error('Error fetching user types:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUserType = () => {
    setSelectedUserType(null);
    setFormData({
      name: '',
      description: '',
      icon: 'PersonOutline',
      color: 'primary',
    });
    setOpenDialog(true);
  };

  const handleEditUserType = (userType: UserType) => {
    setSelectedUserType(userType);
    setFormData({
      name: userType.name,
      description: userType.description,
      icon: userType.icon,
      color: userType.color,
    });
    setOpenDialog(true);
  };

  const handleDeleteUserType = async (userTypeId: string) => {
    if (window.confirm('Are you sure you want to delete this user type?')) {
      try {
        await userTypeService.deleteUserType(userTypeId);
        await fetchUserTypes();
      } catch (err) {
        setError('Failed to delete user type. Please try again.');
        console.error('Error deleting user type:', err);
      }
    }
  };

  const handleSaveUserType = async () => {
    try {
      if (selectedUserType) {
        await userTypeService.updateUserType(selectedUserType._id, formData);
      } else {
        await userTypeService.createUserType(formData);
      }
      setOpenDialog(false);
      await fetchUserTypes();
    } catch (err) {
      setError('Failed to save user type. Please try again.');
      console.error('Error saving user type:', err);
    }
  };

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
        <Typography variant="h4" component="h1" gutterBottom>
          User Type Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage user types and their associated permissions
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h6">Available User Types</Typography>
          </Grid>
          <Grid item xs={12} md={6} sx={{ textAlign: 'right' }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddUserType}
            >
              Add New User Type
            </Button>
          </Grid>
        </Grid>
      </Box>

      <Grid container spacing={3}>
        {userTypes.map((userType) => (
          <Grid item xs={12} md={6} lg={4} key={userType._id}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: `${userType.color}.main`, mr: 2 }}>
                    {getIconComponent(userType.icon)}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" component="h2">
                      {userType.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {userType.description}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Chip
                    label={userType.isActive ? 'Active' : 'Inactive'}
                    color={userType.isActive ? 'success' : 'default'}
                    size="small"
                  />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Edit User Type">
                      <IconButton size="small" onClick={() => handleEditUserType(userType)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete User Type">
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteUserType(userType._id)}
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

      {/* Add/Edit User Type Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{selectedUserType ? 'Edit User Type' : 'Create New User Type'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField 
                fullWidth 
                label="User Type Name" 
                value={formData.name} 
                onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                required 
              />
            </Grid>
            <Grid item xs={12}>
              <TextField 
                fullWidth 
                label="Description" 
                value={formData.description} 
                onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                multiline 
                rows={3} 
                required 
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Icon</InputLabel>
                <Select
                  value={formData.icon}
                  label="Icon"
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                >
                  {iconOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {option.icon}
                        {option.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Color</InputLabel>
                <Select
                  value={formData.color}
                  label="Color"
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                >
                  {colorOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveUserType} variant="contained">{selectedUserType ? 'Update' : 'Create'}</Button>
        </DialogActions>
      </Dialog>
    </StyledPaper>
  );
};

export default UserTypeManagement; 