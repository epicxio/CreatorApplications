import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Checkbox,
  Button,
  styled,
  Chip,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon,
  Create as CreateIcon,
  Visibility as VisibilityIcon,
  AddCircleOutline,
  DeleteOutline,
  EditOutlined,
} from '@mui/icons-material';
import { permissionResources, PermissionResource } from '../../config/permissions';
import { UserRole, Permission } from '../../types/rbac';
import { useAuth } from '../../context/AuthContext';

const StyledPaper = styled(Paper)(({ theme }) => ({
  margin: theme.spacing(2),
  padding: theme.spacing(2),
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
}));

const ActionChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  '&.active': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
  },
}));

const actionIcons: { [key: string]: React.ReactElement } = {
  view: <VisibilityIcon color="info" />,
  create: <AddCircleOutline color="success" />,
  edit: <EditOutlined color="warning" />,
  delete: <DeleteOutline color="error" />,
  assign: <CreateIcon color="primary" />,
};

interface PermissionState {
  [menuPath: string]: {
    [role in UserRole]?: {
      view: boolean;
      edit: boolean;
      create: boolean;
      delete: boolean;
      assign: boolean;
    };
  };
}

const PermissionManager: React.FC = () => {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<PermissionState>({});
  const [selectedRole, setSelectedRole] = useState<UserRole>('school_admin');
  const [isDirty, setIsDirty] = React.useState(false);

  useEffect(() => {
    // Initialize permissions from menu items
    const initialPermissions: PermissionState = {};
    const fillPermissions = (resources: PermissionResource[], parentPath = '') => {
      resources.forEach(resource => {
        const currentPath = parentPath ? `${parentPath}/${resource.name}` : resource.name;
        initialPermissions[currentPath] = {
          school_admin: { view: false, edit: false, create: false, delete: false, assign: false },
          corporate_admin: { view: false, edit: false, create: false, delete: false, assign: false },
          department_head: { view: false, edit: false, create: false, delete: false, assign: false },
          hrbp: { view: false, edit: false, create: false, delete: false, assign: false },
          teacher: { view: false, edit: false, create: false, delete: false, assign: false },
          parent: { view: false, edit: false, create: false, delete: false, assign: false },
          student: { view: false, edit: false, create: false, delete: false, assign: false },
          employee: { view: false, edit: false, create: false, delete: false, assign: false },
        };
        if (resource.children && resource.children.length > 0) {
          fillPermissions(resource.children, currentPath);
        }
      });
    };
    fillPermissions(permissionResources);
    setPermissions(initialPermissions);
  }, []);

  const handlePermissionChange = (
    menuPath: string,
    role: UserRole,
    action: Permission,
    checked: boolean
  ) => {
    setPermissions((prev) => ({
      ...prev,
      [menuPath]: {
        ...prev[menuPath],
        [role]: {
          ...prev[menuPath]?.[role],
          [action]: checked,
        },
      },
    }));
    setIsDirty(true);
  };

  const handleSave = async () => {
    try {
      // TODO: Implement API call to save permissions
      console.log('Saving permissions:', permissions);
      setIsDirty(false);
    } catch (error) {
      console.error('Error saving permissions:', error);
    }
  };

  const handleReset = () => {
    // TODO: Implement reset functionality
    setIsDirty(false);
  };

  function renderSimplePermissionView() {
    return (
      <Box sx={{ maxHeight: 500, overflow: 'auto' }}>
        {permissionResources.map((mainMenu) => (
          <Box key={mainMenu.name} sx={{ mb: 3 }}>
            {/* Main Menu Header */}
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
            </Paper>

            {/* Sub Menu Items */}
            {mainMenu.children && mainMenu.children.length > 0 ? (
              <Box sx={{ pl: 3 }}>
                {mainMenu.children.map((subMenu) => {
                  const menuPath = `${mainMenu.name}/${subMenu.name}`;
                  return (
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
                          {(['view', 'edit', 'create', 'delete', 'assign'] as Permission[]).map((action) => (
                            <FormControlLabel
                              key={action}
                              control={
                                <Switch
                                  size="small"
                                  checked={permissions[menuPath]?.[selectedRole]?.[action] || false}
                                  onChange={(e) => handlePermissionChange(menuPath, selectedRole, action, e.target.checked)}
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
                          ))}
                        </Box>
                      </Box>
                    </Paper>
                  );
                })}
              </Box>
            ) : (
              // If no children, show permissions directly for main menu
              <Box sx={{ pl: 3 }}>
                <Paper
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
                      <mainMenu.IconComponent color="action" />
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                          {mainMenu.name}
                        </Typography>
                        {mainMenu.path && (
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {mainMenu.path}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    
                    {/* Permission Actions */}
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {(['view', 'edit', 'create', 'delete', 'assign'] as Permission[]).map((action) => (
                        <FormControlLabel
                          key={action}
                          control={
                            <Switch
                              size="small"
                              checked={permissions[mainMenu.name]?.[selectedRole]?.[action] || false}
                              onChange={(e) => handlePermissionChange(mainMenu.name, selectedRole, action, e.target.checked)}
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
                      ))}
                    </Box>
                  </Box>
                </Paper>
              </Box>
            )}
          </Box>
        ))}
      </Box>
    );
  }

  return (
    <StyledPaper>
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6">Permissions</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Select Role</InputLabel>
            <Select
              value={selectedRole}
              label="Select Role"
              onChange={(e) => setSelectedRole(e.target.value as UserRole)}
            >
              <MenuItem value="school_admin">School Admin</MenuItem>
              <MenuItem value="corporate_admin">Corporate Admin</MenuItem>
              <MenuItem value="department_head">Department Head</MenuItem>
              <MenuItem value="hrbp">HRBP</MenuItem>
              <MenuItem value="teacher">Teacher</MenuItem>
              <MenuItem value="parent">Parent</MenuItem>
              <MenuItem value="student">Student</MenuItem>
              <MenuItem value="employee">Employee</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={!isDirty}
            sx={{ mr: 1 }}
          >
            Save
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<RefreshIcon />}
            onClick={handleReset}
            disabled={!isDirty}
          >
            Reset
          </Button>
        </Box>
      </Box>
      
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
            <VisibilityIcon color="info" sx={{ fontSize: 16 }} />
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CreateIcon color="primary" sx={{ fontSize: 16 }} />
            <Typography variant="caption">Assign</Typography>
          </Box>
        </Box>
      </Paper>
      
      {renderSimplePermissionView()}
    </StyledPaper>
  );
};

export default PermissionManager; 