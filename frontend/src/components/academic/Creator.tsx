import React, { useState, useEffect } from 'react';
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
  Avatar,
  InputAdornment,
  Tooltip as MuiTooltip,
  Switch,
  FormControlLabel,
  Dialog as MUIDialog,
  DialogActions as MUIDialogActions,
  DialogContent as MUIDialogContent,
  TablePagination,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Instagram as InstagramIcon,
  Facebook as FacebookIcon,
  YouTube as YouTubeIcon,
  Email as EmailIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Block as BlockIcon,
  Image as ImageIcon,
  Visibility as VisibilityIcon,
  Phone as PhoneIcon,
  Lock as LockIcon,
  ArrowDownward as ArrowDownwardIcon,
  ArrowUpward as ArrowUpwardIcon,
  MoreHoriz as MoreHorizIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import CreatorKYCRequests from './CreatorKYCRequests';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  margin: theme.spacing(2),
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
}));

interface Creator {
  _id?: string;
  id: string;
  creatorId?: string;
  name: string;
  email: string;
  profilePic: string;
  bio: string;
  instagram: string;
  facebook: string;
  youtube: string;
  status: 'active' | 'inactive' | 'pending' | 'rejected';
  username: string;
  phoneNumber: string;
  socialMedia?: {
    instagram?: string;
    facebook?: string;
    youtube?: string;
  };
}

const columns = [
  { id: 'creatorId', label: 'Creator ID' },
  { id: 'name', label: 'Name' },
  { id: 'email', label: 'Email' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'facebook', label: 'Facebook' },
  { id: 'youtube', label: 'YouTube' },
  { id: 'status', label: 'Status' },
];

const grades = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
const sections = ['A', 'B', 'C', 'D'];

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export const Creator: React.FC = () => {
  const { user } = useAuth();
  const [creators, setCreators] = useState<Creator[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [pendingCreators, setPendingCreators] = useState<Creator[]>([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [pendingError, setPendingError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [creatorToDelete, setCreatorToDelete] = useState<Creator | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const navigate = useNavigate();

  const roleName = typeof user?.role === 'string'
    ? user.role
    : typeof user?.role?.name === 'string'
    ? user.role.name
    : '';

  useEffect(() => {
    if (!BACKEND_URL) {
      console.error('REACT_APP_BACKEND_URL is not set in the environment variables.');
      return;
    }
    axios.get(`${BACKEND_URL}/api/users/creators`)
      .then(res => {
        console.log('Creators data:', res.data);
        setCreators(res.data);
      })
      .catch(err => console.error('Failed to fetch creators:', err));
  }, []);

  useEffect(() => {
    console.log('Pending creators effect running. roleName:', roleName);
    if (roleName.replace(/\s/g, '').toLowerCase() === 'superadmin') {
      setPendingLoading(true);
      axios.get(`${BACKEND_URL}/api/users/creators/pending`)
        .then(res => {
          console.log('Pending creators API response:', res.data);
          setPendingCreators(res.data);
        })
        .catch(err => {
          console.error('Error fetching pending creators:', err);
          setPendingError('Failed to fetch pending creators');
        })
        .finally(() => setPendingLoading(false));
    }
  }, [user, roleName]);

  const handleAddCreator = () => {
    setSelectedCreator(null);
    setOpenDialog(true);
  };

  const handleEditCreator = (creator: Creator) => {
    setSelectedCreator(creator);
    setOpenDialog(true);
  };

  const handleDeleteCreator = (creatorId: string) => {
    const creator = creators.find(c => c.id === creatorId || c._id === creatorId);
    setCreatorToDelete(creator || null);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteCreator = async () => {
    if (creatorToDelete && creatorToDelete._id) {
      await axios.delete(`${BACKEND_URL}/api/users/${creatorToDelete._id}`);
      // Fetch the updated list from the backend
      const res = await axios.get(`${BACKEND_URL}/api/users/creators`);
      setCreators(res.data);
      setDeleteDialogOpen(false);
      setCreatorToDelete(null);
    }
  };

  const handleSaveCreator = async (creatorData: Partial<Creator & { username: string; phoneNumber: string; password: string }>) => {
    setFormError(null);
    try {
      if (selectedCreator && selectedCreator._id) {
        // Edit existing creator
        await axios.put(`${BACKEND_URL}/api/users/${selectedCreator._id}`, {
          ...creatorData,
          socialMedia: {
            instagram: creatorData.instagram,
            facebook: creatorData.facebook,
            youtube: creatorData.youtube,
          },
        });
        // Re-fetch creators from backend
        const res = await axios.get(`${BACKEND_URL}/api/users/creators`);
        setCreators(res.data);
      } else {
        // Add new creator as admin: use /api/users, status: 'active'
        // Fetch creator userType id
        const userTypeRes = await axios.get(`${BACKEND_URL}/api/user-types`);
        const creatorType = userTypeRes.data.find((t: any) => t.name === 'creator');
        if (!creatorType) throw new Error('Creator user type not found');
        await axios.post(`${BACKEND_URL}/api/users`, {
          ...creatorData,
          status: 'active',
          userType: creatorType._id,
          socialMedia: {
            instagram: creatorData.instagram,
            facebook: creatorData.facebook,
            youtube: creatorData.youtube,
          },
        });
        // Re-fetch creators from backend
        const res = await axios.get(`${BACKEND_URL}/api/users/creators`);
        setCreators(res.data);
      }
      setOpenDialog(false);
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.message) {
        setFormError(err.response.data.message);
      } else {
        setFormError('An error occurred. Please try again.');
      }
    }
  };

  const handleApprove = async (id: string) => {
    await axios.post(`${BACKEND_URL}/api/users/${id}/approve`);
    setPendingCreators(pendingCreators.filter(c => c._id !== id));
  };

  const handleReject = async (id: string) => {
    await axios.post(`${BACKEND_URL}/api/users/${id}/reject`);
    setPendingCreators(pendingCreators.filter(c => c._id !== id));
  };

  const handleSort = (col: string) => {
    if (sortBy === col) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setSortDir('asc');
    }
  };

  const handleChangePage = (_: any, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const filteredCreators = creators.filter(creator => {
    const matchesSearch = creator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      creator.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (creator.creatorId && creator.creatorId.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  // Sort filtered creators
  let sortedCreators = [...filteredCreators];
  if (sortBy) {
    sortedCreators.sort((a, b) => {
      const aVal = a[sortBy as keyof typeof a];
      const bVal = b[sortBy as keyof typeof b];
      
      // Handle undefined values
      if (aVal === undefined && bVal === undefined) return 0;
      if (aVal === undefined) return sortDir === 'asc' ? 1 : -1;
      if (bVal === undefined) return sortDir === 'asc' ? -1 : 1;
      
      // Convert to strings for comparison
      const aStr = String(aVal || '').toLowerCase();
      const bStr = String(bVal || '').toLowerCase();
      
      if (aStr < bStr) return sortDir === 'asc' ? -1 : 1;
      if (aStr > bStr) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }

  const paginatedCreators = sortedCreators.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box>
      <Paper
        sx={{
          mt: 4,
          p: 3,
          borderRadius: 5,
          background: 'rgba(255,255,255,0.15)',
          boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
          backdropFilter: 'blur(16px)',
          border: '1.5px solid rgba(255,255,255,0.18)',
          overflow: 'hidden',
          position: 'relative',
        }}
        elevation={6}
      >
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, letterSpacing: 1 }}>
          Creator Management
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
          <TextField
            placeholder="Search by Creator ID, Name, or Email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ width: 350 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddCreator}
            sx={{ borderRadius: 3, fontWeight: 700 }}
          >
            Add Creator
          </Button>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                {columns.map(col => (
                  <TableCell
                    key={col.id}
                    onClick={() => handleSort(col.id)}
                    sx={{ cursor: 'pointer', userSelect: 'none', fontWeight: 700 }}
                  >
                    {col.label}
                    {sortBy === col.id ? (
                      sortDir === 'asc' ? <ArrowUpwardIcon fontSize="small" sx={{ ml: 0.5 }} /> : <ArrowDownwardIcon fontSize="small" sx={{ ml: 0.5 }} />
                    ) : null}
                  </TableCell>
                ))}
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedCreators.map((creator) => (
                <TableRow key={creator._id || creator.id} hover sx={{ transition: 'all 0.2s', '&:hover': { background: 'rgba(108,99,255,0.08)' } }}>
                  <TableCell>{creator.creatorId || '-'}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {creator.profilePic ? (
                        <img
                          src={creator.profilePic}
                          alt={creator.name}
                          style={{ width: '32px', height: '32px', borderRadius: '50%' }}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = '';
                          }}
                        />
                      ) : (
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontWeight: 700 }}>
                          {creator.name.split(' ').map(n => n[0]).join('')}
                        </Avatar>
                      )}
                      <Typography fontWeight={600}>{creator.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{creator.email}</TableCell>
                  <TableCell>
                    <Tooltip title={creator.socialMedia?.instagram || creator.instagram || 'No Instagram'}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <InstagramIcon sx={{ color: '#E1306C', fontSize: 20 }} />
                        <Typography variant="body2" sx={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {creator.socialMedia?.instagram || creator.instagram || '-'}
                        </Typography>
                      </Box>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Tooltip title={creator.socialMedia?.facebook || creator.facebook || 'No Facebook'}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <FacebookIcon sx={{ color: '#1877F3', fontSize: 20 }} />
                        <Typography variant="body2" sx={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {creator.socialMedia?.facebook || creator.facebook || '-'}
                        </Typography>
                      </Box>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Tooltip title={creator.socialMedia?.youtube || creator.youtube || 'No YouTube'}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <YouTubeIcon sx={{ color: '#FF0000', fontSize: 20 }} />
                        <Typography variant="body2" sx={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {creator.socialMedia?.youtube || creator.youtube || '-'}
                        </Typography>
                      </Box>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={creator.status}
                      color={creator.status === 'active' ? 'success' : creator.status === 'pending' ? 'warning' : 'error'}
                      size="small"
                      sx={{ fontWeight: 700 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="View Details">
                        <IconButton 
                          onClick={() => {
                            const creatorId = creator._id || creator.id;
                            console.log('Navigating to creator:', creatorId, 'Creator object:', creator);
                            navigate(`/creators/${creatorId}`);
                          }} 
                          size="small" 
                          color="info"
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Creator">
                        <IconButton onClick={() => handleEditCreator(creator)} size="small" color="primary">
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Creator">
                        <IconButton onClick={() => handleDeleteCreator(creator.id)} size="small" color="error">
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          component="div"
          count={filteredCreators.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Paper>

      {(user && roleName.replace(/\s/g, '').toLowerCase() === 'superadmin') && (
        <Paper
          sx={{
            mt: 4,
            p: 3,
            borderRadius: 5,
            background: 'rgba(255,255,255,0.15)',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
            backdropFilter: 'blur(16px)',
            border: '1.5px solid rgba(255,255,255,0.18)',
            overflow: 'hidden',
            position: 'relative',
          }}
          elevation={6}
        >
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, letterSpacing: 1 }}>
            Pending Creator Requests
          </Typography>
          {pendingLoading ? (
            <Typography>Loading...</Typography>
          ) : pendingError ? (
            <Typography color="error">{pendingError}</Typography>
          ) : pendingCreators.length === 0 ? (
            <Typography>No pending requests.</Typography>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Instagram</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Facebook</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>YouTube</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pendingCreators.map((creator) => (
                    <TableRow key={creator._id} hover sx={{ transition: 'all 0.2s', '&:hover': { background: 'rgba(108,99,255,0.08)' } }}>
                      <TableCell>{creator.name}</TableCell>
                      <TableCell>{creator.email}</TableCell>
                      <TableCell>{creator.socialMedia?.instagram || creator.instagram || ''}</TableCell>
                      <TableCell>{creator.socialMedia?.facebook || creator.facebook || ''}</TableCell>
                      <TableCell>{creator.socialMedia?.youtube || creator.youtube || ''}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button 
                            color="success" 
                            variant="contained" 
                            size="small" 
                            onClick={() => handleApprove(creator._id!)}
                            sx={{ borderRadius: 3, fontWeight: 700 }}
                          >
                            Approve
                          </Button>
                          <Button 
                            color="error" 
                            variant="contained" 
                            size="small" 
                            onClick={() => handleReject(creator._id!)}
                            sx={{ borderRadius: 3, fontWeight: 700 }}
                          >
                            Reject
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      )}

      <MUIDialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
        <MUIDialogContent>
          <Typography variant="h6" align="center" sx={{ mb: 2 }}>
            Are you sure you want to delete this creator?
          </Typography>
          <Typography align="center" sx={{ mb: 2 }}>
            This action will soft delete the creator and can be undone by an admin.
          </Typography>
          <MUIDialogActions sx={{ justifyContent: 'center' }}>
            <Button onClick={() => setDeleteDialogOpen(false)} color="inherit">Cancel</Button>
            <Button onClick={confirmDeleteCreator} color="error" variant="contained">Delete</Button>
          </MUIDialogActions>
        </MUIDialogContent>
      </MUIDialog>

      <CreatorDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onSave={handleSaveCreator}
        creator={selectedCreator}
      />

      {/* Show form error above the form */}
      {formError && (
        <Typography color="error" sx={{ mb: 2, textAlign: 'center' }}>
          {formError}
        </Typography>
      )}
    </Box>
  );
};

interface CreatorDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (creatorData: Partial<Creator & { username: string; phoneNumber: string; password: string }>) => void;
  creator: Creator | null;
}

const CreatorDialog: React.FC<CreatorDialogProps> = ({
  open,
  onClose,
  onSave,
  creator,
}) => {
  const [formData, setFormData] = useState<Partial<Creator & { username: string; phoneNumber: string; password: string }>>(
    creator || {
      name: '',
      email: '',
      profilePic: '',
      bio: '',
      instagram: '',
      facebook: '',
      youtube: '',
      status: 'active',
      username: '',
      phoneNumber: '',
      password: '',
    }
  );
  const [imgHover, setImgHover] = useState(false);
  const [instagramConnected, setInstagramConnected] = useState(false);
  const [facebookConnected, setFacebookConnected] = useState(false);
  const [youtubeConnected, setYouTubeConnected] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [dialogError, setDialogError] = useState('');

  React.useEffect(() => {
    setFormData({
      name: creator?.name || '',
      email: creator?.email || '',
      profilePic: creator?.profilePic || '',
      bio: creator?.bio || '',
      instagram: creator?.socialMedia?.instagram || creator?.instagram || '',
      facebook: creator?.socialMedia?.facebook || creator?.facebook || '',
      youtube: creator?.socialMedia?.youtube || creator?.youtube || '',
      status: creator?.status || 'active',
      username: creator?.username || (creator?.email ? creator.email.split('@')[0] : ''),
      phoneNumber: creator?.phoneNumber || '',
      password: '', // Always blank for edit
    });
    setUsernameError('');
    setPhoneError('');
  }, [creator]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Only block submission if there are actual errors
    if (usernameError || phoneError) {
      setDialogError('Please fix the errors before submitting.');
      return;
    }
    setDialogError('');
    onSave(formData);
  };

  // Uniqueness checks: only set error if taken, do not block form submission while pending
  const handleUsernameBlur = async () => {
    if (!formData.username) return;
    try {
      const res = await fetch(`/api/users/check-username?username=${encodeURIComponent(formData.username)}`);
      if (!res.ok) {
        setUsernameError('Could not validate username (server error)');
        return;
      }
      const data = await res.json();
      if (data.taken) {
        setUsernameError('Username is already taken');
      } else {
        setUsernameError('');
      }
    } catch (err) {
      setUsernameError('Could not validate username (network error)');
    }
  };

  const handlePhoneBlur = async () => {
    if (!formData.phoneNumber) return;
    try {
      const res = await fetch(`/api/users/check-phone?phoneNumber=${encodeURIComponent(formData.phoneNumber)}`);
      if (!res.ok) {
        setPhoneError('Could not validate phone number (server error)');
        return;
      }
      const data = await res.json();
      if (data.taken) {
        setPhoneError('Phone number is already registered');
      } else {
        setPhoneError('');
      }
    } catch (err) {
      setPhoneError('Could not validate phone number (network error)');
    }
  };

  // Image upload handler (mock, just sets URL for now)
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setFormData({ ...formData, profilePic: url });
    }
  };

  const toggleStatus = () => {
    setFormData({
      ...formData,
      status: formData.status === 'active' ? 'inactive' : 'active',
    });
  };

  const handleConnectInstagram = () => {
    if (!creator || !creator._id) return;
    window.open(`${process.env.REACT_APP_BACKEND_URL}/auth/instagram?creatorId=${creator._id}`, '_blank');
  };

  const handleConnectFacebook = () => {
    // In real app, open OAuth flow
    window.open(`/auth/facebook?creatorId=${creator ? creator.id : 'new'}`, '_blank');
    // For demo, set as connected
    setFacebookConnected(true);
  };

  const handleConnectYouTube = () => {
    // In real app, open OAuth flow
    window.open(`/auth/youtube?creatorId=${creator ? creator.id : 'new'}`, '_blank');
    // For demo, set as connected
    setYouTubeConnected(true);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            p: 4,
            background: 'rgba(255,255,255,0.08)',
            borderRadius: 4,
            boxShadow: 3,
            minWidth: 400,
          }}
        >
          {/* Profile Image Upload/Preview */}
          <Box sx={{ position: 'relative', mb: 3 }}>
            <MuiTooltip title="Change profile picture" arrow>
              <Box
                sx={{ cursor: 'pointer', position: 'relative' }}
                onMouseEnter={() => setImgHover(true)}
                onMouseLeave={() => setImgHover(false)}
              >
                <Avatar
                  src={formData.profilePic || ''}
                  sx={{ width: 96, height: 96, boxShadow: 3, border: '3px solid #6C63FF', transition: '0.2s' }}
                >
                  {!formData.profilePic && <ImageIcon fontSize="large" color="disabled" />}
                </Avatar>
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="creator-profile-upload"
                  onChange={handleImageChange}
                />
                <label htmlFor="creator-profile-upload">
                  <IconButton
                    component="span"
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      background: '#fff',
                      boxShadow: 2,
                      opacity: imgHover ? 1 : 0.7,
                      transition: 'opacity 0.2s',
                    }}
                  >
                    <EditIcon color="primary" />
                  </IconButton>
                </label>
              </Box>
            </MuiTooltip>
          </Box>

          {/* Inputs with Icons */}
          <Grid container spacing={2} sx={{ width: '100%' }}>
            <Grid item xs={12} sm={6}>
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
            <Grid item xs={12} sm={6}>
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
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                placeholder="Username"
                value={formData.username || ''}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                onBlur={handleUsernameBlur}
                required
                error={!!usernameError}
                helperText={usernameError}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                placeholder="Phone Number"
                value={formData.phoneNumber || ''}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                onBlur={handlePhoneBlur}
                required
                error={!!phoneError}
                helperText={phoneError}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            {/* Password field: Only show for new creators */}
            {!creator && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  placeholder="Password"
                  type="password"
                  value={formData.password || ''}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            )}
            <Grid item xs={12} sm={12}>
              <TextField
                fullWidth
                placeholder="Bio"
                value={formData.bio || ''}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                multiline
                minRows={2}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EditIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                placeholder="Instagram"
                value={formData.instagram || ''}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <InstagramIcon sx={{ color: '#E1306C' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                placeholder="Facebook"
                value={formData.facebook || ''}
                onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FacebookIcon sx={{ color: '#1877F3' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                placeholder="YouTube"
                value={formData.youtube || ''}
                onChange={(e) => setFormData({ ...formData, youtube: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <YouTubeIcon sx={{ color: '#FF0000' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
          {/* Connect buttons only in edit mode */}
          {creator && (
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mt: 3, mb: 1 }}>
              <Button
                variant="outlined"
                startIcon={<InstagramIcon sx={{ color: '#E1306C' }} />}
                onClick={handleConnectInstagram}
              >
                Connect Instagram
              </Button>
              <Button
                variant="outlined"
                startIcon={<FacebookIcon sx={{ color: '#1877F3' }} />}
                onClick={handleConnectFacebook}
              >
                Connect Facebook
              </Button>
              <Button
                variant="outlined"
                startIcon={<YouTubeIcon sx={{ color: '#FF0000' }} />}
                onClick={handleConnectYouTube}
              >
                Connect YouTube
              </Button>
            </Box>
          )}

          {/* Add Button */}
          <Button
            type="submit"
            variant="contained"
            startIcon={<AddIcon />}
            sx={{
              mt: 3,
              borderRadius: 8,
              px: 4,
              py: 1.5,
              fontWeight: 600,
              fontSize: '1.1rem',
              boxShadow: 4,
              background: 'linear-gradient(90deg, #6C63FF 0%, #5A52D9 100%)',
              color: '#fff',
              transition: 'all 0.2s',
              '&:hover': {
                background: 'linear-gradient(90deg, #5A52D9 0%, #6C63FF 100%)',
                transform: 'translateY(-2px) scale(1.03)',
                boxShadow: 6,
              },
            }}
            disabled={
              !formData.name ||
              !formData.email ||
              !formData.username ||
              !formData.phoneNumber ||
              (!creator && !formData.password) || // Only require password if adding new
              !!usernameError ||
              !!phoneError
            }
          >
            {creator ? 'Save Changes' : 'Add Creator'}
          </Button>
          <Button onClick={onClose} sx={{ mt: 2, color: '#6C63FF' }}>
            Cancel
          </Button>

          {/* Show creatorId in read-only mode */}
          {creator && creator.creatorId && (
            <TextField
              fullWidth
              label="Creator ID"
              value={creator.creatorId}
              InputProps={{ readOnly: true }}
              sx={{ mb: 2 }}
            />
          )}

          {dialogError && (
            <Typography color="error" sx={{ mb: 2, textAlign: 'center' }}>
              {dialogError}
            </Typography>
          )}
        </Box>
      </form>
    </Dialog>
  );
};

export default function CreatorManagementWithKYC() {
  return (
    <>
      <Creator />
      <CreatorKYCRequests />
    </>
  );
} 