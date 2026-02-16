import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Chip, Button, IconButton, Menu, MenuItem, Tooltip, TextField, Select, FormControl, InputLabel, Grid, TableSortLabel, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, CircularProgress
} from '@mui/material';
import { MoreVert, Edit, Delete, Visibility, Pause, PlayArrow, FileCopy, BarChart, CheckCircle, Drafts, Public, Lock, Link as LinkIcon, People as AffiliatesIcon, ContentCopy } from '@mui/icons-material';
import { courseService } from '../../services/courseService';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '../../hooks/useToast';
import ToastNotification from '../common/ToastNotification';
import { useAuth } from '../../context/AuthContext';
import type { AffiliateCodeItem } from '../../types/course';

// Define the Course type for this table
interface Course {
  id: string;
  courseId?: string; // Course ID in format C-{creator initials}-{number}
  name: string;
  creatorId?: string | null;
  creatorName?: string | null;
  instructorUserId?: string | null;
  createdAt: string;
  type: 'Free' | 'Paid' | 'Invite Only';
  access: { mode: 'Lifetime' | 'Date-Range'; startDate?: string; endDate?: string };
  enrollments: number;
  completionRate: number;
  status: 'Draft' | 'Published' | 'Live & Selling' | 'Paused' | 'Archived';
  lastUpdated: string;
  visibility: 'Public' | 'Unlisted' | 'Private';
  certificateEnabled: boolean;
  dripEnabled: boolean;
  installmentsOn: boolean;
  affiliateActive: boolean;
  listedPrice: { INR: number; USD: number; EUR: number };
  sellingPrice: { INR: number; USD: number; EUR: number };
}

const statusColors: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info'> = {
  'Draft': 'default',
  'Published': 'primary',
  'Live & Selling': 'success',
  'Paused': 'warning',
  'Archived': 'error',
};

const visibilityIcons: Record<string, React.ReactNode> = {
  'Public': <Public fontSize="small" color="primary" />,
  'Unlisted': <LinkIcon fontSize="small" color="info" />,
  'Private': <Lock fontSize="small" color="action" />,
};

const typeColors: Record<string, 'default' | 'primary' | 'success' | 'warning'> = {
  'Free': 'success',
  'Paid': 'primary',
  'Invite Only': 'warning',
};

const accessLabel = (access: Course['access']) => {
  if (access.mode === 'Lifetime') return 'Lifetime';
  if (access.mode === 'Date-Range' && access.startDate && access.endDate) {
    return `${new Date(access.startDate).toLocaleDateString()} - ${new Date(access.endDate).toLocaleDateString()}`;
  }
  return '-';
};

const sortableColumns = [
  'courseId', 'name', 'creatorIdName', 'userId', 'createdAt', 'type', 'enrollments', 'completionRate', 'status', 'lastUpdated', 'visibility', 'features', 'listedPrice', 'sellingPrice'
];

const columnLabels: Record<string, string> = {
  courseId: 'Course ID',
  name: 'Course Name',
  creatorIdName: 'Creator ID + Name',
  userId: 'User ID',
  createdAt: 'Created Date',
  type: 'Course Type',
  access: 'Course Access',
  enrollments: 'Enrollments',
  completionRate: 'Completion Rate',
  status: 'Status',
  lastUpdated: 'Last Updated',
  visibility: 'Visibility',
  features: 'Features',
  listedPrice: 'Listed Price',
  sellingPrice: 'Selling Price',
  actions: 'Actions',
};

function getPriceValue(price: { INR: number; USD: number; EUR: number }) {
  // Sort by INR by default
  return price?.INR ?? 0;
}

const LearnLoopCourseManager: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuCourseId, setMenuCourseId] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    certificate: '',
    drip: '',
    type: '',
    search: '',
  });
  const [sortBy, setSortBy] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [affiliatesDialogOpen, setAffiliatesDialogOpen] = useState(false);
  const [affiliatesCourseId, setAffiliatesCourseId] = useState<string | null>(null);
  const [affiliatesCourseName, setAffiliatesCourseName] = useState<string>('');
  const [affiliatesList, setAffiliatesList] = useState<AffiliateCodeItem[]>([]);
  const [affiliatesLoading, setAffiliatesLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast, success, error, hideToast } = useToast();
  const { user } = useAuth();
  const isSuperAdmin = Boolean(user?.role && (typeof user.role === 'object' ? user.role?.name : user.role) === 'Super Admin');
  const tableColumns = isSuperAdmin
    ? ['courseId', 'name', 'creatorIdName', 'userId', 'createdAt', 'type', 'access', 'enrollments', 'completionRate', 'status', 'lastUpdated', 'visibility', 'features', 'actions']
    : ['courseId', 'name', 'createdAt', 'type', 'access', 'enrollments', 'completionRate', 'status', 'lastUpdated', 'visibility', 'features', 'actions'];

  const loadCourses = React.useCallback(() => {
    setLoadError(null);
    setLoading(true);
    courseService.getCourses().then((response) => {
      if (response.success && response.data) {
        setLoadError(null);
        // Map backend data to Course[] format expected by the table
        const formattedCourses: Course[] = response.data.courses.map((course: any) => {
          return {
            id: course.id,
            courseId: course.courseId || course.id, // Use courseId if available, fallback to id
            name: course.name,
            creatorId: course.creatorId ?? null,
            creatorName: course.creatorName ?? null,
            instructorUserId: course.instructorUserId ?? null,
            createdAt: course.createdAt,
            type: course.sellingPrice?.INR > 0 || course.sellingPrice?.USD > 0 ? 'Paid' : 'Free' as 'Free' | 'Paid' | 'Invite Only',
            access: { mode: 'Lifetime' as const },
            enrollments: course.enrollments || 0,
            completionRate: course.completionRate || 0,
            status: course.status as 'Draft' | 'Published' | 'Live & Selling' | 'Paused' | 'Archived',
            lastUpdated: course.lastUpdated,
            visibility: course.visibility as 'Public' | 'Unlisted' | 'Private',
            certificateEnabled: course.certificateEnabled || false,
            dripEnabled: course.dripEnabled || false,
            installmentsOn: course.installmentsOn ?? false,
            affiliateActive: course.affiliateActive ?? false,
            listedPrice: course.listedPrice || { INR: 0, USD: 0, EUR: 0 },
            sellingPrice: course.sellingPrice || { INR: 0, USD: 0, EUR: 0 }
          };
        });
        setCourses(formattedCourses);
      } else {
        setLoadError((response as any).message || 'Failed to load courses.');
        error((response as any).message || 'Failed to load courses.');
      }
    }).catch((err: any) => {
      const message = err?.code === 'ECONNABORTED' ? 'Request timed out. Check that the backend is running.' : (err?.message || 'Failed to load courses.');
      setLoadError(message);
      error(message);
    }).finally(() => setLoading(false));
  }, [error]);

  // Load courses on mount and when location changes (user navigates back)
  useEffect(() => {
    loadCourses();
  }, [loadCourses, location.pathname]);

  // Filtering logic
  const filteredCourses = courses.filter((course) => {
    if (filters.status && course.status !== filters.status) return false;
    if (filters.certificate && (filters.certificate === 'Enabled') !== course.certificateEnabled) return false;
    if (filters.drip && (filters.drip === 'Enabled') !== course.dripEnabled) return false;
    if (filters.type && course.type !== filters.type) return false;
    if (filters.search && !course.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  // Sorting logic
  const sortedCourses = [...filteredCourses].sort((a, b) => {
    if (!sortBy) return 0;
    let aValue: any = a[sortBy as keyof Course];
    let bValue: any = b[sortBy as keyof Course];
    if (sortBy === 'listedPrice') {
      aValue = getPriceValue(a.listedPrice);
      bValue = getPriceValue(b.listedPrice);
    } else if (sortBy === 'sellingPrice') {
      aValue = getPriceValue(a.sellingPrice);
      bValue = getPriceValue(b.sellingPrice);
    } else if (sortBy === 'createdAt' || sortBy === 'lastUpdated') {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    } else if (sortBy === 'courseId') {
      // Sort courseId as string (handles format like C-ABC-0001)
      aValue = (aValue || '').toString();
      bValue = (bValue || '').toString();
    } else if (sortBy === 'creatorIdName') {
      aValue = (a.creatorName || a.creatorId || '').toString().toLowerCase();
      bValue = (b.creatorName || b.creatorId || '').toString().toLowerCase();
    } else if (sortBy === 'userId') {
      aValue = (a.instructorUserId || '').toString().toLowerCase();
      bValue = (b.instructorUserId || '').toString().toLowerCase();
    } else if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  };

  // Actions menu logic
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, courseId: string) => {
    setAnchorEl(event.currentTarget);
    setMenuCourseId(courseId);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuCourseId(null);
  };

  const handleOpenAffiliates = (course: Course) => {
    setAffiliatesCourseId(course.id);
    setAffiliatesCourseName(course.name);
    setAffiliatesDialogOpen(true);
    handleMenuClose();
  };

  const handleCloseAffiliates = () => {
    setAffiliatesDialogOpen(false);
    setAffiliatesCourseId(null);
    setAffiliatesCourseName('');
    setAffiliatesList([]);
  };

  useEffect(() => {
    if (!affiliatesDialogOpen || !affiliatesCourseId) return;
    setAffiliatesLoading(true);
    courseService.getAffiliatesByCourse(affiliatesCourseId).then((r) => {
      if (r.success && r.data) setAffiliatesList(r.data);
      else setAffiliatesList([]);
    }).finally(() => setAffiliatesLoading(false));
  }, [affiliatesDialogOpen, affiliatesCourseId]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => success('Link copied to clipboard')).catch(() => error('Failed to copy'));
  };

  // Delete course handlers
  const handleDeleteClick = (course: Course) => {
    setCourseToDelete(course);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    if (!courseToDelete) return;

    setDeleting(true);
    try {
      const result = await courseService.deleteCourse(courseToDelete.id);
      
      if (result.success) {
        // Remove course from local state
        setCourses(courses.filter(c => c.id !== courseToDelete.id));
        setDeleteDialogOpen(false);
        setCourseToDelete(null);
        // Show success toast
        success('Course deleted successfully!');
      } else {
        error(result.message || 'Failed to delete course');
      }
    } catch {
      error('Failed to delete course. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setCourseToDelete(null);
  };

  // Table pagination
  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Render
  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={700} color="#6C63FF">
          LearnLoop: Course Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            color="primary"
            sx={{ borderRadius: 2, fontWeight: 600, textTransform: 'none' }}
            onClick={() => loadCourses()}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
          <Button
            variant="contained"
            color="primary"
            sx={{ borderRadius: 2, fontWeight: 600, textTransform: 'none', boxShadow: 1 }}
            onClick={() => navigate('/love/learnloop/create')}
          >
            + Create Course
          </Button>
        </Box>
      </Box>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                label="Status"
                onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="Draft">Draft</MenuItem>
                <MenuItem value="Published">Published</MenuItem>
                <MenuItem value="Live & Selling">Live & Selling</MenuItem>
                <MenuItem value="Paused">Paused</MenuItem>
                <MenuItem value="Archived">Archived</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Certificate</InputLabel>
              <Select
                value={filters.certificate}
                label="Certificate"
                onChange={e => setFilters(f => ({ ...f, certificate: e.target.value }))}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="Enabled">Enabled</MenuItem>
                <MenuItem value="Disabled">Disabled</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Drip</InputLabel>
              <Select
                value={filters.drip}
                label="Drip"
                onChange={e => setFilters(f => ({ ...f, drip: e.target.value }))}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="Enabled">Enabled</MenuItem>
                <MenuItem value="Disabled">Disabled</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Type</InputLabel>
              <Select
                value={filters.type}
                label="Type"
                onChange={e => setFilters(f => ({ ...f, type: e.target.value }))}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="Free">Free</MenuItem>
                <MenuItem value="Paid">Paid</MenuItem>
                <MenuItem value="Invite Only">Invite Only</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              size="small"
              label="Search by Course Name"
              value={filters.search}
              onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
            />
          </Grid>
        </Grid>
      </Paper>
      <TableContainer component={Paper} sx={{ borderRadius: 3,
        // Always show sort icon for all TableSortLabel
        '& .MuiTableSortLabel-root .MuiTableSortLabel-icon': {
          opacity: 1,
        },
      }}>
        <Table>
          <TableHead>
            <TableRow>
              {tableColumns.map((col) => (
                <TableCell key={col}>
                  {sortableColumns.includes(col) ? (
                    <TableSortLabel
                      active={sortBy === col}
                      direction={sortBy === col ? sortDirection : 'asc'}
                      onClick={() => handleSort(col)}
                      hideSortIcon={false}
                    >
                      {columnLabels[col]}
                    </TableSortLabel>
                  ) : (
                    columnLabels[col]
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={tableColumns.length} align="center" sx={{ py: 4 }}>
                  <CircularProgress size={24} sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Loading...
                </TableCell>
              </TableRow>
            ) : loadError ? (
              <TableRow>
                <TableCell colSpan={tableColumns.length} align="center" sx={{ py: 4 }}>
                  <Typography color="error" sx={{ mb: 1 }}>{loadError}</Typography>
                  <Button variant="outlined" size="small" onClick={() => loadCourses()}>
                    Retry
                  </Button>
                </TableCell>
              </TableRow>
            ) : filteredCourses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={tableColumns.length} align="center">No courses found.</TableCell>
              </TableRow>
            ) : (
              sortedCourses.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((course) => (
                <TableRow key={course.id} hover>
                  {tableColumns.map((col) => {
                    if (col === 'courseId') {
                      return (
                        <TableCell key={col}>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600, color: '#6C63FF', fontSize: '0.875rem' }}>
                            {course.courseId || 'N/A'}
                          </Typography>
                        </TableCell>
                      );
                    }
                    if (col === 'name') return <TableCell key={col}>{course.name}</TableCell>;
                    if (col === 'creatorIdName') {
                      const creatorId = course.creatorId || '';
                      const creatorName = course.creatorName || '';
                      const text = creatorId || creatorName ? `${creatorId}${creatorId && creatorName ? ' – ' : ''}${creatorName}`.trim() : '';
                      return <TableCell key={col}>{text || 'N/A'}</TableCell>;
                    }
                    if (col === 'userId') {
                      const text = course.instructorUserId || '';
                      return <TableCell key={col}>{text || 'N/A'}</TableCell>;
                    }
                    if (col === 'createdAt') return <TableCell key={col}>{new Date(course.createdAt).toLocaleDateString('en-GB')}</TableCell>;
                    if (col === 'type') return <TableCell key={col}><Chip label={course.type} color={typeColors[course.type]} size="small" /></TableCell>;
                    if (col === 'access') return <TableCell key={col}>{accessLabel(course.access)}</TableCell>;
                    if (col === 'enrollments') return <TableCell key={col}>{course.enrollments}</TableCell>;
                    if (col === 'completionRate') return <TableCell key={col}>{course.completionRate > 0 ? `${course.completionRate}%` : '-'}</TableCell>;
                    if (col === 'status') return <TableCell key={col}><Chip label={course.status} color={statusColors[course.status]} size="small" /></TableCell>;
                    if (col === 'lastUpdated') {
                      return (
                        <TableCell key={col}>
                          {course.lastUpdated
                            ? new Date(course.lastUpdated).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                            : '-'}
                        </TableCell>
                      );
                    }
                    if (col === 'visibility') {
                      return (
                        <TableCell key={col}>
                          <Tooltip title={course.visibility}>
                            <>{visibilityIcons[course.visibility] || <Lock fontSize="small" color="disabled" />}</>
                          </Tooltip>
                        </TableCell>
                      );
                    }
                    if (col === 'features') {
                      return (
                        <TableCell key={col}>
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Tooltip title="Certificate Enabled">
                              <Box sx={{ color: course.certificateEnabled ? 'success.main' : 'text.disabled' }}><CheckCircle fontSize="small" /></Box>
                            </Tooltip>
                            <Tooltip title="Drip Enabled">
                              <Box sx={{ color: course.dripEnabled ? 'success.main' : 'text.disabled' }}><CheckCircle fontSize="small" /></Box>
                            </Tooltip>
                            <Tooltip title="Installments On">
                              <Box sx={{ color: course.installmentsOn ? 'success.main' : 'text.disabled' }}><CheckCircle fontSize="small" /></Box>
                            </Tooltip>
                            <Tooltip title="Affiliate Active">
                              <Box sx={{ color: course.affiliateActive ? 'success.main' : 'text.disabled' }}><CheckCircle fontSize="small" /></Box>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      );
                    }
                    if (col === 'actions') {
                      return (
                        <TableCell key={col}>
                          <IconButton onClick={e => handleMenuOpen(e, course.id)}><MoreVert /></IconButton>
                          <Menu anchorEl={anchorEl} open={Boolean(anchorEl) && menuCourseId === course.id} onClose={handleMenuClose}>
                            <MenuItem onClick={() => { handleMenuClose(); navigate(`/love/learnloop/create/${course.id}`); }}><Edit fontSize="small" sx={{ mr: 1 }} />Edit</MenuItem>
                            <MenuItem onClick={() => { handleMenuClose(); navigate(`/love/learnloop/create/${course.id}?step=6`); }}><Visibility fontSize="small" sx={{ mr: 1 }} />Preview</MenuItem>
                            <MenuItem onClick={() => handleOpenAffiliates(course)}><AffiliatesIcon fontSize="small" sx={{ mr: 1 }} />Affiliates</MenuItem>
                            <MenuItem onClick={handleMenuClose}><FileCopy fontSize="small" sx={{ mr: 1 }} />Duplicate</MenuItem>
                            <MenuItem onClick={handleMenuClose}><BarChart fontSize="small" sx={{ mr: 1 }} />Analytics</MenuItem>
                            {course.status === 'Draft' || course.status === 'Paused' ? <MenuItem onClick={() => handleDeleteClick(course)}><Delete fontSize="small" sx={{ mr: 1 }} />Delete</MenuItem> : null}
                            {course.status === 'Published' ? <MenuItem onClick={handleMenuClose}><Drafts fontSize="small" sx={{ mr: 1 }} />Save as Draft</MenuItem> : null}
                            {course.status === 'Draft' ? <MenuItem onClick={handleMenuClose}><PlayArrow fontSize="small" sx={{ mr: 1 }} />Publish</MenuItem> : null}
                            {(course.status === 'Published' || course.status === 'Live & Selling') ? <MenuItem onClick={handleMenuClose}><Pause fontSize="small" sx={{ mr: 1 }} />Pause</MenuItem> : null}
                          </Menu>
                        </TableCell>
                      );
                    }
                    return <TableCell key={col} />;
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={filteredCourses.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* Affiliates Dialog (creator view) */}
      <Dialog open={affiliatesDialogOpen} onClose={handleCloseAffiliates} maxWidth="md" fullWidth>
        <DialogTitle>Affiliates — {affiliatesCourseName}</DialogTitle>
        <DialogContent>
          {affiliatesLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}><CircularProgress /></Box>
          ) : affiliatesList.length === 0 ? (
            <Typography color="text.secondary">No affiliates yet. Share your course; anyone can get an affiliate link from the course page.</Typography>
          ) : (
            <TableContainer component={Paper} variant="outlined" sx={{ mt: 1 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Code</TableCell>
                    <TableCell>Affiliate</TableCell>
                    <TableCell>Link</TableCell>
                    <TableCell align="right">Conversions</TableCell>
                    <TableCell align="right">Earnings (INR)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {affiliatesList.map((row) => (
                    <TableRow key={row.affiliateCodeId}>
                      <TableCell><Chip label={row.code} size="small" /></TableCell>
                      <TableCell>{row.affiliateName || row.displayName || row.affiliateEmail || '-'}</TableCell>
                      <TableCell>
                        <Tooltip title="Copy link">
                          <IconButton size="small" onClick={() => copyToClipboard(row.link)}><ContentCopy fontSize="small" /></IconButton>
                        </Tooltip>
                        <Typography variant="caption" sx={{ ml: 0.5, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'inline-block' }}>{row.link}</Typography>
                      </TableCell>
                      <TableCell align="right">{row.conversions}</TableCell>
                      <TableCell align="right">₹{(row.earningsByCurrency?.INR ?? 0).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAffiliates}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Delete Course?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete the course <strong>"{courseToDelete?.name}"</strong>? 
            This action cannot be undone and all course data will be permanently deleted.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary" disabled={deleting}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={16} /> : <Delete />}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast Notification */}
      <ToastNotification toast={toast} onClose={hideToast} />
    </Box>
  );
};

export default LearnLoopCourseManager; 