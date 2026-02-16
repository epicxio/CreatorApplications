import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import { ContentCopy, MonetizationOn, ArrowBack, ShoppingCart } from '@mui/icons-material';
import { courseService } from '../services/courseService';
import type { AffiliateCodeItem } from '../types/course';
import { useToast } from '../hooks/useToast';
import ToastNotification from '../components/common/ToastNotification';

const MyAffiliateCodesPage: React.FC = () => {
  const [list, setList] = useState<AffiliateCodeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast, success, error: showError, hideToast } = useToast();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    courseService.getMyAffiliateCodes().then((res) => {
      if (cancelled) return;
      if (res.success && res.data) setList(res.data);
      else setError(res.message || 'Failed to load');
    }).catch(() => {
      if (!cancelled) setError('Failed to load affiliate codes');
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  const copyLink = (text: string) => {
    navigator.clipboard.writeText(text).then(() => success('Link copied to clipboard')).catch(() => showError('Failed to copy'));
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} size="small">
            Back
          </Button>
          <Typography variant="h4" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <MonetizationOn color="primary" />
            My Affiliate Codes
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Share your links; when someone buys the course, you earn a commission. Get more links from any course page that has affiliate program enabled.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : list.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary" gutterBottom>
              You don&apos;t have any affiliate codes yet.
            </Typography>
            <Button
              variant="contained"
              startIcon={<ShoppingCart />}
              onClick={() => navigate('/courses')}
              sx={{ mt: 2 }}
            >
              Browse courses to get your link
            </Button>
          </Paper>
        ) : (
          <>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Course</TableCell>
                    <TableCell>Code</TableCell>
                    <TableCell>Link</TableCell>
                    <TableCell align="right">Commission</TableCell>
                    <TableCell align="right">Conversions</TableCell>
                    <TableCell align="right">Earnings (INR)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {list.map((row) => (
                    <TableRow key={row.affiliateCodeId}>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>{row.courseName || '—'}</Typography>
                      </TableCell>
                      <TableCell><Chip label={row.code} size="small" /></TableCell>
                      <TableCell>
                        <Tooltip title="Copy link">
                          <IconButton size="small" onClick={() => copyLink(row.link)}><ContentCopy fontSize="small" /></IconButton>
                        </Tooltip>
                        <Typography component="span" variant="caption" sx={{ ml: 0.5, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'inline-block' }}>{row.link}</Typography>
                      </TableCell>
                      <TableCell align="right">{row.affiliateRewardPercentage ?? 0}%</TableCell>
                      <TableCell align="right">{row.conversions}</TableCell>
                      <TableCell align="right">₹{(row.earningsByCurrency?.INR ?? 0).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Box sx={{ mt: 2 }}>
              <Button variant="outlined" startIcon={<ShoppingCart />} onClick={() => navigate('/courses')}>
                Get link for another course
              </Button>
            </Box>
          </>
        )}
      </Container>
      <ToastNotification toast={toast} onClose={hideToast} />
    </Box>
  );
};

export default MyAffiliateCodesPage;
