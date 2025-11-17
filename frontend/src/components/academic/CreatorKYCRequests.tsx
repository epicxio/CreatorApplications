import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Tooltip,
  CircularProgress,
  TextField,
  TablePagination,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Save as SaveIcon,
  Email as EmailIcon,
  Description as DescriptionIcon,
  Badge as BadgeIcon,
  CreditCard as CreditCardIcon,
  Search as SearchIcon,
  MoreHoriz as MoreHorizIcon,
  ArrowDownward as ArrowDownwardIcon,
  ArrowUpward as ArrowUpwardIcon,
  WarningAmberRounded,
} from '@mui/icons-material';
import axios from 'axios';

const PAGE_SIZE = 5;
const statusOptions = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

const columns = [
  { id: 'userId', label: 'User ID' },
  { id: 'creatorId', label: 'Creator ID' },
  { id: 'name', label: 'Name' },
  { id: 'documentType', label: 'Type' },
  { id: 'documentNumber', label: 'Number' },
  { id: 'status', label: 'Status' },
];

const getDocIcon = (type: string) => {
  if (type === 'PAN Card') return <CreditCardIcon color="primary" />;
  if (type === 'Aadhar Card') return <BadgeIcon color="primary" />;
  return <DescriptionIcon color="primary" />;
};

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const CreatorKYCRequests: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [statuses, setStatuses] = useState<{ [id: string]: 'pending' | 'approved' | 'rejected' | 'verified' }>({});
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(PAGE_SIZE);
  const [selected, setSelected] = useState<typeof requests[0] | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [draftHistory, setDraftHistory] = useState<any[]>([]);
  const [statusLoading, setStatusLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<string | null>(null);
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
  const [revokeError, setRevokeError] = useState('');
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectError, setRejectError] = useState('');

  // Fetch KYC requests from backend on mount and when statusFilter changes
  useEffect(() => {
    const token = localStorage.getItem('token');
    let url = `${BACKEND_URL}/api/kyc/admin/documents`;
    let backendStatus = statusFilter;
    if (statusFilter === 'approved') backendStatus = 'verified';
    if (backendStatus) {
      url += `?status=${backendStatus}`;
    }
    axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => {
        // Map backend data to table structure
        const data = (res.data.data || []).map((doc: any) => {
          let userId = '-';
          let creatorId = '-';
          let name = '-';
          if (doc.userId && typeof doc.userId === 'object') {
            userId = doc.userId.userId || '-';
            creatorId = doc.userId.creatorId || '-';
            name = doc.userId.name || '-';
          } else if (typeof doc.userId === 'string') {
            userId = doc.userId;
          }
          return {
            id: doc._id,
            userId,
            creatorId,
            name,
            documentType: doc.documentType === 'pan_card' ? 'PAN Card' : doc.documentType === 'aadhar_card' ? 'Aadhar Card' : 'Other Document',
            documentNumber: doc.documentNumber,
            status: doc.status,
            uploadedDate: doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : '-',
            fileUrl: `${BACKEND_URL}/api/kyc/documents/${doc._id}/download`,
            comments: doc.verificationRemarks || '',
          };
        });
        setRequests(data);
      })
      .catch(() => setRequests([]));
  }, [statusFilter]);

  // Fetch current user ID (for timeline highlighting)
  useEffect(() => {
    // Replace with your auth logic if needed
    const token = localStorage.getItem('token');
    if (token) {
      // Decode JWT or fetch user info as needed
      // For demo, leave as null
    }
  }, []);

  // Fetch draft history when modal opens
  useEffect(() => {
    if (modalOpen && selected) {
      const token = localStorage.getItem('token');
      axios.get(`${BACKEND_URL}/api/kyc/documents/${selected.id}/draft-history`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
        .then(res => setDraftHistory(res.data.data || []))
        .catch(() => setDraftHistory([]));
    }
  }, [modalOpen, selected]);

  // Filtered, sorted, and paginated data
  let filtered = requests.filter(req =>
    (String(req.userId || '').toLowerCase().includes(search.toLowerCase()) ||
      String(req.creatorId || '').toLowerCase().includes(search.toLowerCase()) ||
      String(req.name || '').toLowerCase().includes(search.toLowerCase()) ||
      String(req.documentNumber || '').toLowerCase().includes(search.toLowerCase())) &&
    (
      !statusFilter ||
      (statusFilter === 'approved'
        ? (statuses[req.id] || req.status) === 'verified'
        : (statuses[req.id] || req.status) === statusFilter)
    )
  );

  if (sortBy) {
    filtered = [...filtered].sort((a, b) => {
      let aVal = a[sortBy as keyof typeof a];
      let bVal = b[sortBy as keyof typeof b];
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }

  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleOpenModal = (req: typeof requests[0]) => {
    setSelected(req);
    setDraft(req.comments || '');
    setModalOpen(true);
  };
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelected(null);
    setDraft('');
  };
  const handlePreview = async (url: string) => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get(url.startsWith('http') ? url : `${BACKEND_URL}${url}`, {
        responseType: 'blob',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const file = new Blob([response.data], { type: response.data.type });
      const fileUrl = URL.createObjectURL(file);
      setPreviewUrl(fileUrl);
      setPreviewType(response.data.type);
      setPreviewOpen(true);
    } catch (err) {
      setPreviewUrl(null);
      setPreviewType(null);
      setPreviewOpen(true);
    }
  };
  const handleClosePreview = () => {
    setPreviewOpen(false);
    setPreviewUrl(null);
  };
  const handleSaveDraft = async () => {
    const token = localStorage.getItem('token');
    if (selected && draft.trim()) {
      await axios.post(
        `${BACKEND_URL}/api/kyc/documents/${selected.id}/draft`,
        { comment: draft },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      const res = await axios.get(
        `${BACKEND_URL}/api/kyc/documents/${selected.id}/draft-history`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setDraftHistory(res.data.data || []);
    }
  };
  const handleApprove = async () => {
    if (!selected) return;
    setStatusLoading(true);
    const token = localStorage.getItem('token');
    await axios.put(
      `${BACKEND_URL}/api/kyc/admin/documents/${selected.id}/verify`,
      {
        status: 'verified',
        remarks: draft
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    setStatuses(prev => ({ ...prev, [selected.id]: 'verified' }));
    setStatusLoading(false);
    handleCloseModal();
  };
  const handleReject = async () => {
    if (!selected) return;
    if (!draft.trim()) {
      setRejectError('Comment is required to reject this document.');
      return;
    }
    setRejectError('');
    setRejectDialogOpen(true);
  };
  const confirmReject = async () => {
    if (!selected) return;
    setStatusLoading(true);
    const token = localStorage.getItem('token');
    await axios.put(
      `${BACKEND_URL}/api/kyc/admin/documents/${selected.id}/verify`,
      {
        status: 'rejected',
        remarks: draft
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    setStatuses(prev => ({ ...prev, [selected.id]: 'rejected' }));
    setStatusLoading(false);
    setRejectDialogOpen(false);
    handleCloseModal();
  };
  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      handleCloseModal();
    }, 1000);
  };
  const handleChangePage = (_: any, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };
  const handleSort = (col: string) => {
    if (sortBy === col) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setSortDir('asc');
    }
  };
  const handleRevoke = async () => {
    if (!selected) return;
    if (!draft.trim()) {
      setRevokeError('Comment is required to revoke approval.');
      return;
    }
    setRevokeError('');
    setRevokeDialogOpen(true);
  };
  const confirmRevoke = async () => {
    if (!selected) return;
    setStatusLoading(true);
    const token = localStorage.getItem('token');
    await axios.put(
      `${BACKEND_URL}/api/kyc/admin/documents/${selected.id}/verify`,
      {
        status: 'pending',
        remarks: draft
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    setStatuses(prev => ({ ...prev, [selected.id]: 'pending' }));
    setStatusLoading(false);
    setRevokeDialogOpen(false);
    handleCloseModal();
  };

  return (
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
        Creator KYC Requests
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
        <TextField
          placeholder="Search by User ID, Creator ID, Name, or Number"
          value={search}
          onChange={e => setSearch(e.target.value)}
          sx={{ width: 350 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <FormControl sx={{ minWidth: 160 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={e => setStatusFilter(e.target.value)}
          >
            {statusOptions.map(opt => (
              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
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
            {paginated.map((req) => {
              const isVerified = (statuses[req.id] || req.status) === 'verified';
              return (
                <TableRow key={req.id} hover sx={{ transition: 'all 0.2s', '&:hover': { background: 'rgba(108,99,255,0.08)' } }}>
                  <TableCell>{req.userId}</TableCell>
                  <TableCell>{req.creatorId}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontWeight: 700 }}>
                        {req.name[0]}
                      </Avatar>
                      <Typography fontWeight={600}>{req.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Tooltip title={req.documentType}>{getDocIcon(req.documentType)}</Tooltip>
                  </TableCell>
                  <TableCell>{req.documentNumber}</TableCell>
                  <TableCell>
                    <Chip
                      label={(() => {
                        const s = statuses[req.id] || req.status;
                        if (s === 'verified') return 'approved';
                        return s;
                      })()}
                      color={(statuses[req.id] === 'verified' || req.status === 'verified') ? 'success' : (statuses[req.id] === 'rejected' || req.status === 'rejected') ? 'error' : 'warning'}
                      icon={(statuses[req.id] === 'verified' || req.status === 'verified') ? <CheckCircleIcon /> : (statuses[req.id] === 'rejected' || req.status === 'rejected') ? <CancelIcon /> : undefined}
                      sx={{ fontWeight: 700 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      color="primary"
                      size="small"
                      startIcon={<MoreHorizIcon />}
                      onClick={() => handleOpenModal(req)}
                      sx={{ borderRadius: 3, fontWeight: 700 }}
                    >
                      Actions
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={filtered.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />

      {/* Actions Modal */}
      <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>Review KYC Document</DialogTitle>
        <DialogContent>
          {selected && (
            <Box>
              {/* Timeline View */}
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700, color: 'primary.main' }}>Review Timeline</Typography>
              <Box sx={{ maxHeight: 180, overflowY: 'auto', mb: 2, p: 1, borderRadius: 2, background: 'rgba(255,255,255,0.25)', boxShadow: 1 }}>
                {draftHistory.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">No comments yet.</Typography>
                ) : (
                  draftHistory.map((entry, idx) => (
                    <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                      <Avatar sx={{ width: 28, height: 28, bgcolor: entry.reviewer && currentUserId === entry.reviewer._id ? 'secondary.main' : 'primary.main', fontSize: 16, mr: 1 }}>
                        {entry.reviewer && entry.reviewer.name ? entry.reviewer.name[0] : '?'}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{entry.reviewer && entry.reviewer.name ? entry.reviewer.name : 'Reviewer'}</Typography>
                        <Typography variant="caption" color="text.secondary">{new Date(entry.createdAt).toLocaleString()}</Typography>
                        <Typography variant="body2" sx={{ mt: 0.5 }}>{entry.comment}</Typography>
                      </Box>
                    </Box>
                  ))
                )}
              </Box>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                <b>User ID:</b> {selected.userId} &nbsp; | &nbsp; <b>Creator ID:</b> {selected.creatorId}
              </Typography>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                <b>Name:</b> {selected.name}
              </Typography>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                <b>Type:</b> {selected.documentType} &nbsp; | &nbsp; <b>Number:</b> {selected.documentNumber}
              </Typography>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                <b>Status:</b> <Chip label={((statuses[selected.id] || selected.status) === 'verified') ? 'approved' : (statuses[selected.id] || selected.status)} color={((statuses[selected.id] || selected.status) === 'verified') ? 'success' : ((statuses[selected.id] || selected.status) === 'rejected') ? 'error' : 'warning'} size="small" />
              </Typography>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                <b>Uploaded:</b> {selected.uploadedDate}
              </Typography>
              <Button
                variant="outlined"
                color="info"
                startIcon={<VisibilityIcon />}
                sx={{ mb: 2, mt: 1 }}
                onClick={() => handlePreview(selected.fileUrl)}
              >
                View Attachment
              </Button>
              <TextField
                label="Comments"
                multiline
                minRows={3}
                maxRows={6}
                fullWidth
                value={draft}
                onChange={e => setDraft(e.target.value)}
                sx={{ mb: 2, mt: 2 }}
                placeholder="Add comments..."
                disabled={statuses[selected.id] === 'verified'}
              />
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Tooltip title="Save Draft">
                  <IconButton onClick={handleSaveDraft} color="primary" disabled={statuses[selected.id] === 'verified'}>
                    <SaveIcon />
                  </IconButton>
                </Tooltip>
              </Box>
              <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<CheckCircleIcon />}
                  onClick={handleApprove}
                  sx={{ borderRadius: 3, fontWeight: 700 }}
                  disabled={statusLoading || statuses[selected.id] === 'verified'}
                >
                  Approve
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<CancelIcon />}
                  onClick={handleReject}
                  sx={{ borderRadius: 3, fontWeight: 700 }}
                  disabled={statusLoading || statuses[selected.id] === 'verified'}
                >
                  Reject
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<EmailIcon />}
                  onClick={handleSubmit}
                  sx={{ borderRadius: 3, fontWeight: 700 }}
                  disabled={loading || statuses[selected.id] === 'verified'}
                >
                  {loading ? <CircularProgress size={18} /> : 'Submit'}
                </Button>
                {(statuses[selected?.id] === 'verified' || selected?.status === 'verified') && (
                  <Button
                    variant="outlined"
                    color="warning"
                    startIcon={<WarningAmberRounded />}
                    onClick={handleRevoke}
                    sx={{
                      borderRadius: 3,
                      fontWeight: 700,
                      fontSize: 16,
                      px: 4,
                      py: 1.5,
                      height: 48,
                      ml: { xs: 0, sm: 1 },
                      boxSizing: 'border-box',
                      minWidth: 120,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    disabled={statusLoading}
                  >
                    Revoke
                  </Button>
                )}
              </Box>
              {(statuses[selected?.id] === 'verified' || selected?.status === 'verified') && revokeError && (
                <Typography color="error" variant="caption" sx={{ mt: 2, display: 'block', textAlign: 'left' }}>{revokeError}</Typography>
              )}
              {rejectError && (
                <Typography color="error" variant="caption" sx={{ mt: 2, display: 'block', textAlign: 'left' }}>{rejectError}</Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Attachment Preview Dialog */}
      <Dialog open={previewOpen} onClose={handleClosePreview} maxWidth="md" fullWidth>
        <DialogTitle>Document Preview</DialogTitle>
        <DialogContent>
          {previewUrl && previewType?.includes('pdf') ? (
            <iframe src={previewUrl} width="100%" height="500px" style={{ border: 'none' }} title="Document Preview" />
          ) : previewUrl && previewType?.startsWith('image/') ? (
            <img src={previewUrl} alt="Document Preview" style={{ maxWidth: '100%', maxHeight: 400 }} />
          ) : previewUrl ? (
            <a href={previewUrl} download target="_blank" rel="noopener noreferrer">Download Document</a>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePreview}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Revoke Confirmation Dialog */}
      <Dialog open={revokeDialogOpen} onClose={() => setRevokeDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          style: {
            borderRadius: 20,
            background: 'rgba(255,255,255,0.95)',
            boxShadow: '0 8px 32px rgba(255,193,7,0.18)',
            backdropFilter: 'blur(16px)',
            animation: 'fadeInDown 0.4s cubic-bezier(.4,2,.6,1)',
            padding: '24px 0',
            textAlign: 'center',
          }
        }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="center" gap={2}>
            <WarningAmberRounded color="warning" fontSize="large" />
            <Typography variant="h6" color="warning.main" fontWeight={700}>
              Confirm Revoke
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            Are you sure you want to revoke approval for this document?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <Button onClick={() => setRevokeDialogOpen(false)} sx={{ color: '#6C63FF', fontWeight: 700 }}>No</Button>
          <Button onClick={confirmRevoke} variant="contained" sx={{
            bgcolor: 'warning.main',
            color: 'white',
            px: 4,
            py: 1.5,
            borderRadius: 3,
            fontWeight: 700,
            fontSize: 16,
            boxShadow: 3,
            ml: 2,
            transition: 'all 0.2s',
            '&:hover': { bgcolor: 'warning.dark', transform: 'scale(1.04)' },
          }}>
            Yes, Revoke
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Confirmation Dialog */}
      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          style: {
            borderRadius: 20,
            background: 'rgba(255,255,255,0.95)',
            boxShadow: '0 8px 32px rgba(255,0,0,0.18)',
            backdropFilter: 'blur(16px)',
            animation: 'fadeInDown 0.4s cubic-bezier(.4,2,.6,1)',
            padding: '24px 0',
            textAlign: 'center',
          }
        }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="center" gap={2}>
            <CancelIcon color="error" fontSize="large" />
            <Typography variant="h6" color="error.main" fontWeight={700}>
              Confirm Reject
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            Are you sure you want to reject this document?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <Button onClick={() => setRejectDialogOpen(false)} sx={{ color: '#6C63FF', fontWeight: 700 }}>No</Button>
          <Button onClick={confirmReject} variant="contained" sx={{
            bgcolor: 'error.main',
            color: 'white',
            px: 4,
            py: 1.5,
            borderRadius: 3,
            fontWeight: 700,
            fontSize: 16,
            boxShadow: 3,
            ml: 2,
            transition: 'all 0.2s',
            '&:hover': { bgcolor: 'error.dark', transform: 'scale(1.04)' },
          }}>
            Yes, Reject
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default CreatorKYCRequests; 