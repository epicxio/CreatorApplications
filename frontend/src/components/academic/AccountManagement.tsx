import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid,
  styled,
  Autocomplete,
  Card,
  CardContent,
  Tooltip,
  Avatar,
  Divider,
  Badge,
  Switch,
  FormControlLabel,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Link as LinkIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  CheckCircle as CheckCircleIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Image as ImageIcon,
  Work as WorkIcon,
  Home as HomeIcon,
} from '@mui/icons-material';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  margin: theme.spacing(2),
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
}));

const StyledCard = styled(Card)(({ theme }) => ({
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
  },
}));

interface AccountManager {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  occupation: string;
  linkedCreators: Creator[];
  linkedBrands: Brand[];
  status: 'active' | 'inactive';
}

interface Creator {
  id: string;
  name: string;
  grade: string;
  section: string;
  rollNumber: string;
}

interface Brand {
  id: string;
  name: string;
  logo: string;
}

// Mock data for demonstration
const mockCreators: Creator[] = [
  {
    id: '1',
    name: 'John Doe',
    grade: '10',
    section: 'A',
    rollNumber: '1001',
  },
  {
    id: '2',
    name: 'Jane Smith',
    grade: '9',
    section: 'B',
    rollNumber: '1002',
  },
];

const mockBrands: Brand[] = [
  {
    id: '1',
    name: 'Brand A',
    logo: 'https://via.placeholder.com/50',
  },
  {
    id: '2',
    name: 'Brand B',
    logo: 'https://via.placeholder.com/50',
  },
];

const mockAccountManagers: AccountManager[] = [
  {
    id: '1',
    name: 'Mike Doe',
    email: 'mike.doe@example.com',
    phone: '123-456-7890',
    address: '123 Main St, City',
    occupation: 'Engineer',
    linkedCreators: [mockCreators[0]],
    linkedBrands: [mockBrands[0]],
    status: 'active',
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    phone: '234-567-8901',
    address: '456 Oak Ave, Town',
    occupation: 'Doctor',
    linkedCreators: [mockCreators[1]],
    linkedBrands: [mockBrands[1]],
    status: 'active',
  },
  {
    id: '3',
    name: 'Robert Williams',
    email: 'robert.w@example.com',
    phone: '345-678-9012',
    address: '789 Pine Rd, Village',
    occupation: 'Teacher',
    linkedCreators: [],
    linkedBrands: [],
    status: 'active',
  },
  {
    id: '4',
    name: 'Emily Brown',
    email: 'emily.b@example.com',
    phone: '456-789-0123',
    address: '321 Elm St, City',
    occupation: 'Lawyer',
    linkedCreators: [],
    linkedBrands: [],
    status: 'active',
  },
  {
    id: '5',
    name: 'David Miller',
    email: 'david.m@example.com',
    phone: '567-890-1234',
    address: '654 Maple Dr, Town',
    occupation: 'Architect',
    linkedCreators: [],
    linkedBrands: [],
    status: 'active',
  },
  {
    id: '6',
    name: 'Jennifer Davis',
    email: 'jennifer.d@example.com',
    phone: '678-901-2345',
    address: '987 Cedar Ln, Village',
    occupation: 'Accountant',
    linkedCreators: [],
    linkedBrands: [],
    status: 'active',
  },
  {
    id: '7',
    name: 'Michael Wilson',
    email: 'michael.w@example.com',
    phone: '789-012-3456',
    address: '147 Birch St, City',
    occupation: 'Software Developer',
    linkedCreators: [],
    linkedBrands: [],
    status: 'active',
  },
  {
    id: '8',
    name: 'Lisa Anderson',
    email: 'lisa.a@example.com',
    phone: '890-123-4567',
    address: '258 Spruce Ave, Town',
    occupation: 'Marketing Manager',
    linkedCreators: [],
    linkedBrands: [],
    status: 'active',
  },
  {
    id: '9',
    name: 'James Taylor',
    email: 'james.t@example.com',
    phone: '901-234-5678',
    address: '369 Willow Rd, Village',
    occupation: 'Business Analyst',
    linkedCreators: [],
    linkedBrands: [],
    status: 'active',
  },
  {
    id: '10',
    name: 'Patricia Moore',
    email: 'patricia.m@example.com',
    phone: '012-345-6789',
    address: '741 Oak St, City',
    occupation: 'HR Manager',
    linkedCreators: [],
    linkedBrands: [],
    status: 'active',
  }
];

export const AccountManagement: React.FC = () => {
  const [accountManagers, setAccountManagers] = useState<AccountManager[]>(mockAccountManagers);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAccountManager, setSelectedAccountManager] = useState<AccountManager | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleAddAccountManager = () => {
    setSelectedAccountManager(null);
    setOpenDialog(true);
  };

  const handleEditAccountManager = (accountManager: AccountManager) => {
    setSelectedAccountManager(accountManager);
    setOpenDialog(true);
  };

  const handleDeleteAccountManager = (accountManagerId: string) => {
    setAccountManagers(accountManagers.filter(manager => manager.id !== accountManagerId));
  };

  const handleSaveAccountManager = (accountManagerData: Partial<AccountManager>) => {
    if (selectedAccountManager) {
      setAccountManagers(accountManagers.map(manager =>
        manager.id === selectedAccountManager.id ? { ...manager, ...accountManagerData } : manager
      ));
    } else {
      const newManager: AccountManager = {
        id: Math.random().toString(36).substr(2, 9),
        name: '',
        email: '',
        phone: '',
        address: '',
        occupation: '',
        linkedCreators: [],
        linkedBrands: [],
        status: 'active',
        ...accountManagerData,
      };
      setAccountManagers([...accountManagers, newManager]);
    }
    setOpenDialog(false);
  };

  const filteredAccountManagers = accountManagers.filter(manager =>
    manager.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    manager.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    manager.linkedCreators.some(creator => 
      creator.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <Box>
      <StyledPaper>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h2">
            Account Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddAccountManager}
          >
            Add Account Manager
          </Button>
        </Box>

        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search account managers or creators..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
          sx={{ mb: 3 }}
        />

        <Grid container spacing={3}>
          {filteredAccountManagers.map((manager) => (
            <Grid item xs={12} md={6} lg={4} key={manager.id}>
              <StyledCard>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                      {manager.name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6">{manager.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {manager.occupation}
                      </Typography>
                    </Box>
                    <Box sx={{ ml: 'auto' }}>
                      <Tooltip title="Edit">
                        <IconButton onClick={() => handleEditAccountManager(manager)} size="small">
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton onClick={() => handleDeleteAccountManager(manager.id)} size="small">
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <EmailIcon sx={{ mr: 1, fontSize: 'small', color: 'text.secondary' }} />
                    <Typography variant="body2">{manager.email}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PhoneIcon sx={{ mr: 1, fontSize: 'small', color: 'text.secondary' }} />
                    <Typography variant="body2">{manager.phone}</Typography>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Linked Creators
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {manager.linkedCreators.map((creator) => (
                      <Chip
                        key={creator.id}
                        icon={<SchoolIcon />}
                        label={`${creator.name} (Grade ${creator.grade}-${creator.section}, Roll: ${creator.rollNumber})`}
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>

                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip
                      label={manager.status}
                      color={manager.status === 'active' ? 'success' : 'default'}
                      size="small"
                    />
                    <Badge
                      badgeContent={manager.linkedCreators.length}
                      color="primary"
                      sx={{ '& .MuiBadge-badge': { fontSize: '0.8rem' } }}
                    >
                      <LinkIcon color="action" />
                    </Badge>
                  </Box>
                </CardContent>
              </StyledCard>
            </Grid>
          ))}
        </Grid>
      </StyledPaper>

      <AccountManagerDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onSave={handleSaveAccountManager}
        accountManager={selectedAccountManager}
        availableCreators={mockCreators}
        availableBrands={mockBrands}
      />
    </Box>
  );
};

interface AccountManagerDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (accountManagerData: Partial<AccountManager>) => void;
  accountManager: AccountManager | null;
  availableCreators: Creator[];
  availableBrands: Brand[];
}

const AccountManagerDialog: React.FC<AccountManagerDialogProps> = ({
  open,
  onClose,
  onSave,
  accountManager,
  availableCreators,
  availableBrands,
}) => {
  const [formData, setFormData] = useState<Partial<AccountManager>>(
    accountManager || {
      name: '',
      email: '',
      phone: '',
      address: '',
      occupation: '',
      linkedCreators: [],
      linkedBrands: [],
      status: 'active',
    }
  );
  const [avatar, setAvatar] = useState<string | null>(null);

  React.useEffect(() => {
    setFormData(accountManager || {
      name: '',
      email: '',
      phone: '',
      address: '',
      occupation: '',
      linkedCreators: [],
      linkedBrands: [],
      status: 'active',
    });
    setAvatar(null);
  }, [accountManager]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => setAvatar(ev.target?.result as string);
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 700, fontSize: 22, letterSpacing: 1 }}>
          {accountManager ? 'Edit Account Manager' : 'Add New Account Manager'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="avatar-upload"
              type="file"
              onChange={handleAvatarChange}
            />
            <label htmlFor="avatar-upload">
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={
                  <IconButton component="span" sx={{ bgcolor: 'white', p: 0.5 }}>
                    <EditIcon fontSize="small" color="primary" />
                  </IconButton>
                }
              >
                <Avatar
                  src={avatar || ''}
                  sx={{ width: 80, height: 80, boxShadow: 3, cursor: 'pointer', bgcolor: 'primary.main' }}
                >
                  <PersonIcon fontSize="large" />
                </Avatar>
              </Badge>
            </label>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Name"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Phone"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Occupation"
                value={formData.occupation || ''}
                onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <WorkIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                placeholder="Address"
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
                multiline
                rows={2}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <HomeIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Autocomplete
                multiple
                options={availableCreators}
                getOptionLabel={(option) => option.name}
                value={formData.linkedCreators || []}
                onChange={(_, newValue) => setFormData({ ...formData, linkedCreators: newValue })}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Link Creators"
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment position="start">
                          <SchoolIcon color="primary" />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      avatar={<Avatar>{option.name.charAt(0)}</Avatar>}
                      label={option.name}
                      {...getTagProps({ index })}
                    />
                  ))
                }
              />
            </Grid>
            <Grid item xs={12}>
              <Autocomplete
                multiple
                options={availableBrands}
                getOptionLabel={(option) => option.name}
                value={formData.linkedBrands || []}
                onChange={(_, newValue) => setFormData({ ...formData, linkedBrands: newValue })}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Link Brands"
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <InputAdornment position="start">
                          <ImageIcon color="primary" />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      avatar={<Avatar src={option.logo}>{option.name.charAt(0)}</Avatar>}
                      label={option.name}
                      {...getTagProps({ index })}
                    />
                  ))
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.status === 'active'}
                    onChange={(_, checked) => setFormData({ ...formData, status: checked ? 'active' : 'inactive' })}
                    color="primary"
                  />
                }
                label={
                  <Chip
                    icon={formData.status === 'active' ? <CheckCircleIcon /> : <DeleteIcon />}
                    label={formData.status === 'active' ? 'Active' : 'Inactive'}
                    color={formData.status === 'active' ? 'success' : 'default'}
                    size="small"
                  />
                }
                labelPlacement="end"
                sx={{ ml: 1 }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <Button onClick={onClose} sx={{ color: 'text.secondary' }}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              px: 4,
              py: 1.5,
              borderRadius: 3,
              fontWeight: 700,
              fontSize: 16,
              boxShadow: 3,
              transition: 'all 0.2s',
              '&:hover': { bgcolor: 'primary.dark', transform: 'scale(1.04)' },
            }}
          >
            {accountManager ? 'Save Changes' : 'Add Account Manager'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AccountManagement; 