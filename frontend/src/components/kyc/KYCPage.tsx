import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepButton,
  StepLabel,
  StepContent,
  Divider,
  Avatar,
  List,
  Tooltip,
  LinearProgress,
  styled,
  alpha,
} from '@mui/material';
import api from '../../services/api';
import {
  CloudUpload as CloudUploadIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  VerifiedUser as VerifiedUserIcon,
  CreditCard as CreditCardIcon,
  Badge as BadgeIcon,
  Description as DescriptionIcon,
  Save as SaveIcon,
} from '@mui/icons-material';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  margin: theme.spacing(2),
  backgroundColor: alpha(theme.palette.background.paper, 0.8),
  backdropFilter: 'blur(20px)',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  borderRadius: 16,
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
}));

const UploadArea = styled(Box)(({ theme }) => ({
  border: `2px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
  borderRadius: 12,
  padding: theme.spacing(4),
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  backgroundColor: alpha(theme.palette.primary.main, 0.02),
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
    transform: 'translateY(-2px)',
  },
}));

const DocumentCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
  },
}));

const getKycApiBase = () => api.defaults.baseURL || `${window.location.origin}/api`;

interface KYCDocument {
  id: string;
  type: 'pan' | 'aadhar' | 'other';
  name: string;
  number: string;
  fileName: string;
  fileUrl: string;
  uploadDate: Date;
  status: 'pending' | 'verified' | 'rejected';
  remarks?: string;
}

interface KYCFormData {
  panCard: {
    name: string;
    number: string;
    file: File | null;
  };
  aadharCard: {
    number: string;
    file: File | null;
  };
  otherDocuments: Array<{
    type: string;
    number: string;
    file: File | null;
  }>;
}

const KYCPage: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState<KYCDocument[]>([]);
  const [formData, setFormData] = useState<KYCFormData>({
    panCard: { name: '', number: '', file: null },
    aadharCard: { number: '', file: null },
    otherDocuments: [],
  });
  const [previewDialog, setPreviewDialog] = useState<{ open: boolean; document: KYCDocument | null }>({
    open: false,
    document: null,
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    document: KYCDocument | null;
    name: string;
    number: string;
    file: File | null;
    previewUrl: string | null;
    loading: boolean;
    error: string | null;
  }>({
    open: false,
    document: null,
    name: '',
    number: '',
    file: null,
    previewUrl: null,
    loading: false,
    error: null,
  });
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    document: KYCDocument | null;
    loading: boolean;
    error: string | null;
  }>({
    open: false,
    document: null,
    loading: false,
    error: null,
  });
  const [editPreviewUrl, setEditPreviewUrl] = useState<string | null>(null);
  const [editSuccessDialog, setEditSuccessDialog] = useState({ open: false, message: '' });
  const [loadError, setLoadError] = useState<string | null>(null);
  const [aadharUploadSuccess, setAadharUploadSuccess] = useState(false);
  const [panUploadSuccess, setPanUploadSuccess] = useState(false);
  const [otherUploadSuccess, setOtherUploadSuccess] = useState(false);
  const [otherDocFile, setOtherDocFile] = useState<File | null>(null);
  const [otherDocName, setOtherDocName] = useState('');
  const [otherDocNumber, setOtherDocNumber] = useState('');
  const [goToPanAfterDelete, setGoToPanAfterDelete] = useState(false);
  const [goToAadharAfterDelete, setGoToAadharAfterDelete] = useState(false);

  const steps = [
    {
      label: 'PAN Card',
      description: 'Upload your PAN Card details (Mandatory)',
      icon: <CreditCardIcon />,
    },
    {
      label: 'Aadhar Card',
      description: 'Upload your Aadhar Card details',
      icon: <BadgeIcon />,
    },
    {
      label: 'Other Documents',
      description: 'Upload additional government documents',
      icon: <DescriptionIcon />,
    },
    {
      label: 'Review',
      description: 'Review all documents',
      icon: <VerifiedUserIcon />,
    },
  ];

  useEffect(() => {
    loadKYCDocuments();
  }, []);

  useEffect(() => {
    if (editDialog.open && editDialog.document && !editDialog.file) {
      let cancelled = false;
      const fetchPreview = async () => {
        try {
          const token = localStorage.getItem('token');
          if (!editDialog.document) return;
          const response = await fetch(editDialog.document.fileUrl, {
            headers: {
              'Authorization': token ? `Bearer ${token}` : ''
            }
          });
          if (!response.ok) throw new Error('Failed to fetch document');
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          if (!cancelled) setEditPreviewUrl(url);
        } catch (error) {
          if (!cancelled) setEditPreviewUrl('');
        }
      };
      fetchPreview();
      return () => {
        cancelled = true;
        if (editPreviewUrl) URL.revokeObjectURL(editPreviewUrl);
        setEditPreviewUrl(null);
      };
    } else if (!editDialog.open) {
      if (editPreviewUrl) URL.revokeObjectURL(editPreviewUrl);
      setEditPreviewUrl(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editDialog.open, editDialog.document, editDialog.file]);

  useEffect(() => {
    if (editSuccessDialog.open) {
      const timer = setTimeout(() => setEditSuccessDialog({ open: false, message: '' }), 2000);
      return () => clearTimeout(timer);
    }
  }, [editSuccessDialog.open]);

  const loadKYCDocuments = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const token = localStorage.getItem('token');
      const baseUrl = getKycApiBase();
      const response = await fetch(`${baseUrl}/kyc/profile`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.message || 'Failed to load KYC profile');
      // Map backend documents to KYCDocument[]
      const docs: KYCDocument[] = (result.data.documents || []).map((doc: any) => ({
        id: doc._id,
        type: doc.documentType === 'pan_card' ? 'pan' : doc.documentType === 'aadhar_card' ? 'aadhar' : 'other',
        name: doc.documentName,
        number: doc.documentNumber,
        fileName: doc.fileName,
        fileUrl: `${baseUrl}/kyc/documents/${doc._id}/download`,
        uploadDate: new Date(doc.createdAt),
        status: doc.status,
        remarks: doc.verificationRemarks || '',
      }));
      setDocuments(docs);
    } catch (error) {
      setLoadError((error as any).message || 'Failed to load KYC documents');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (type: 'pan' | 'aadhar' | 'other', file: File) => {
    if (type === 'pan') {
      setFormData(prev => ({
        ...prev,
        panCard: { ...prev.panCard, file },
      }));
    } else if (type === 'aadhar') {
      setFormData(prev => ({
        ...prev,
        aadharCard: { ...prev.aadharCard, file },
      }));
    }
  };

  const handleEditDocument = (docId: string) => {
    const doc = documents.find(d => d.id === docId);
    if (!doc) return;
    setEditDialog({
      open: true,
      document: doc,
      name: doc.name,
      number: doc.number,
      file: null,
      previewUrl: null,
      loading: false,
      error: null,
    });
  };

  const handleDeleteDocument = (docId: string) => {
    const doc = documents.find(d => d.id === docId);
    if (!doc) return;
    setDeleteDialog({ open: true, document: doc, loading: false, error: null });
  };

  const handlePreviewDocument = async (document: KYCDocument) => {
    setPreviewDialog({ open: true, document });
    setPreviewUrl(null);
    try {
      const baseUrl = getKycApiBase();
      const downloadUrl = `${baseUrl}/kyc/documents/${document.id}/download`;
      const response = await api.get<Blob>(downloadUrl, { responseType: 'blob' });
      const blob = response.data instanceof Blob ? response.data : new Blob([response.data]);
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
    } catch {
      setPreviewUrl('');
    }
  };

  const handleClosePreview = () => {
    setPreviewDialog({ open: false, document: null });
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircleIcon color="success" />;
      case 'pending':
        return <WarningIcon color="warning" />;
      case 'rejected':
        return <WarningIcon color="error" />;
      default:
        return <WarningIcon color="action" />;
    }
  };

  // Helper functions to check document status
  const isDocStepDisabled = (type: 'pan' | 'aadhar' | 'other') => {
    if (type === 'other') {
      return false; // Never disable "Other Documents" step
    }
    const doc = documents.find(d => d.type === type);
    if (!doc) return false;
    return doc.status === 'pending' || doc.status === 'verified';
  };

  const renderPANCardStep = () => {
    if (isDocStepDisabled('pan')) return null;
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
          PAN Card Details (Mandatory)
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Full Name as per PAN Card"
              value={formData.panCard.name}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                panCard: { ...prev.panCard, name: e.target.value }
              }))}
              required
              sx={{ mb: 2 }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="PAN Number"
              value={formData.panCard.number}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                panCard: { ...prev.panCard, number: e.target.value.toUpperCase() }
              }))}
              required
              inputProps={{ maxLength: 10 }}
              sx={{ mb: 2 }}
            />
          </Grid>
          <Grid item xs={12}>
            <UploadArea
              onClick={() => document.getElementById('pan-upload')?.click()}
            >
              <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Upload PAN Card
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Click to upload or drag and drop your PAN card image/PDF
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Supported formats: JPG, PNG, PDF (Max 5MB)
              </Typography>
              <input
                id="pan-upload"
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload('pan', file);
                }}
                disabled={loading}
              />
            </UploadArea>
            {formData.panCard.file && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                <Typography variant="body2" color="success.contrastText">
                  ✓ {formData.panCard.file.name} selected
                </Typography>
              </Box>
            )}
            <Box sx={{ mt: 2, textAlign: 'right' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={uploadPan}
                disabled={loading || !formData.panCard.name || !formData.panCard.number || !formData.panCard.file}
              >
                Submit
              </Button>
            </Box>
            {panUploadSuccess && (
              <Alert severity="success" sx={{ mt: 2 }}>
                PAN Card uploaded successfully!
              </Alert>
            )}
          </Grid>
        </Grid>
      </Box>
    );
  };

  const uploadPan = async () => {
    if (!formData.panCard.file || !formData.panCard.name || !formData.panCard.number) return;
    setLoading(true);
    try {
      const formDataObj = new FormData();
      formDataObj.append('documentType', 'pan_card');
      formDataObj.append('documentName', formData.panCard.name);
      formDataObj.append('documentNumber', formData.panCard.number);
      formDataObj.append('document', formData.panCard.file);
      const token = localStorage.getItem('token');
      const response = await fetch(`${getKycApiBase()}/kyc/upload`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: formDataObj
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Upload failed');
      await loadKYCDocuments();
      setFormData(prev => ({ ...prev, panCard: { name: '', number: '', file: null } }));
      setPanUploadSuccess(true);
      setTimeout(() => setPanUploadSuccess(false), 2000);
      // After PAN upload, if Aadhar Card is missing or goToAadharAfterDelete is true, set the flag (navigation will happen in useEffect)
      const updatedDocs = await (async () => {
        const token = localStorage.getItem('token');
        const profileBase = getKycApiBase();
        const response = await fetch(`${profileBase}/kyc/profile`, {
          headers: {
            'Authorization': token ? `Bearer ${token}` : ''
          }
        });
        const result = await response.json();
        if (!result.success) return documents;
        return (result.data.documents || []).map((doc: any) => ({
          id: doc._id,
          type: doc.documentType === 'pan_card' ? 'pan' : doc.documentType === 'aadhar_card' ? 'aadhar' : 'other',
          name: doc.documentName,
          number: doc.documentNumber,
          fileName: doc.fileName,
          fileUrl: `${profileBase}/kyc/documents/${doc._id}/download`,
          uploadDate: new Date(doc.createdAt),
          status: doc.status,
          remarks: doc.verificationRemarks || '',
        }));
      })();
      const hasAadhar = updatedDocs.some((d: any) => d.type === 'aadhar');
      if (goToAadharAfterDelete || !hasAadhar) {
        setGoToAadharAfterDelete(true);
      } else {
        goToFirstIncompleteStep();
      }
    } catch (error) {
      alert('Error uploading PAN: ' + ((error as any).message || error));
    } finally {
      setLoading(false);
    }
  };

  const uploadAadhar = async () => {
    if (!formData.aadharCard.file || !formData.aadharCard.number) return;
    setLoading(true);
    try {
      const formDataObj = new FormData();
      formDataObj.append('documentType', 'aadhar_card');
      formDataObj.append('documentName', 'Aadhar Card');
      formDataObj.append('documentNumber', formData.aadharCard.number);
      formDataObj.append('document', formData.aadharCard.file);
      const token = localStorage.getItem('token');
      const response = await fetch(`${getKycApiBase()}/kyc/upload`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: formDataObj
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Upload failed');
      await loadKYCDocuments();
      setFormData(prev => ({ ...prev, aadharCard: { number: '', file: null } }));
      setAadharUploadSuccess(true);
      setTimeout(() => setAadharUploadSuccess(false), 2000);
      // After Aadhar upload, check if Other Documents are required
      const otherDocs = documents.filter(d => d.type === 'other');
      const maxOtherDocs = 3;
      if (otherDocs.length < maxOtherDocs) {
        const otherStepIdx = visibleSteps.findIndex(s => s.label === 'Other Documents');
        if (otherStepIdx !== -1) setActiveStep(otherStepIdx);
      } else {
        const reviewStepIdx = visibleSteps.findIndex(s => s.label === 'Review');
        if (reviewStepIdx !== -1) setActiveStep(reviewStepIdx);
      }
    } catch (error) {
      alert('Error uploading Aadhar: ' + ((error as any).message || error));
    } finally {
      setLoading(false);
    }
  };

  const uploadOtherDocument = async (file: File, name: string, number: string) => {
    if (!file || !name.trim() || !number.trim()) return;
    setLoading(true);
    try {
      const formDataObj = new FormData();
      formDataObj.append('documentType', 'other');
      formDataObj.append('documentName', name);
      formDataObj.append('documentNumber', number);
      formDataObj.append('document', file);
      const token = localStorage.getItem('token');
      const response = await fetch(`${getKycApiBase()}/kyc/upload`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: formDataObj
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Upload failed');
      await loadKYCDocuments();
      setOtherUploadSuccess(true);
      setTimeout(() => setOtherUploadSuccess(false), 2000);
      setOtherDocFile(null);
      setOtherDocName('');
      setOtherDocNumber('');
      // After Other Document upload, go to Review step
      const reviewStepIdx = visibleSteps.findIndex(s => s.label === 'Review');
      if (reviewStepIdx !== -1) setActiveStep(reviewStepIdx);
    } catch (error) {
      alert('Error uploading document: ' + ((error as any).message || error));
    } finally {
      setLoading(false);
    }
  };

  const renderAadharCardStep = () => {
    if (isDocStepDisabled('aadhar')) return null;
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
          Aadhar Card Details
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Aadhar Number"
              value={formData.aadharCard.number}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                aadharCard: { ...prev.aadharCard, number: e.target.value }
              }))}
              inputProps={{ maxLength: 12 }}
              sx={{ mb: 2 }}
            />
          </Grid>
          <Grid item xs={12}>
            <UploadArea
              onClick={() => document.getElementById('aadhar-upload')?.click()}
            >
              <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Upload Aadhar Card
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Click to upload or drag and drop your Aadhar card image/PDF
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Supported formats: JPG, PNG, PDF (Max 5MB)
              </Typography>
              <input
                id="aadhar-upload"
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload('aadhar', file);
                }}
                disabled={loading}
              />
            </UploadArea>
            {formData.aadharCard.file && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                <Typography variant="body2" color="success.contrastText">
                  ✓ {formData.aadharCard.file.name} selected
                </Typography>
              </Box>
            )}
            <Box sx={{ mt: 2, textAlign: 'right' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={uploadAadhar}
                disabled={loading || !formData.aadharCard.number || !formData.aadharCard.file}
              >
                Submit
              </Button>
            </Box>
            {aadharUploadSuccess && (
              <Box sx={{ mt: 2 }}>
                <Alert severity="success">
                  Aadhar Card uploaded successfully!
                </Alert>
              </Box>
            )}
          </Grid>
        </Grid>
      </Box>
    );
  };

  const renderOtherDocumentsStep = () => {
    if (isDocStepDisabled('other')) return null;
    const otherDocs = documents.filter(d => d.type === 'other');
    const maxOtherDocs = 3;
    const canUploadMore = otherDocs.length < maxOtherDocs;
    const reviewStepIdx = visibleSteps.findIndex(s => s.label === 'Review');
    const goToReview = () => {
      if (reviewStepIdx !== -1) setActiveStep(reviewStepIdx);
    };
    const hasOtherDocs = otherDocs.length > 0;
    return (
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          <Box>
            <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
              Additional Government Documents
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Upload any additional government-issued identification documents (optional). You can skip and come back anytime.
            </Typography>
          </Box>
          <Button
            variant="outlined"
            color="primary"
            onClick={goToReview}
            sx={{ flexShrink: 0 }}
          >
            {hasOtherDocs ? 'Go to Review' : 'Skip and go to Review'}
          </Button>
        </Box>
        {canUploadMore ? (
          <>
            <UploadArea
              onClick={() => document.getElementById('other-upload')?.click()}
            >
              <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Upload Additional Documents
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Click to upload or drag and drop additional documents
              </Typography>
              <input
                id="other-upload"
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                style={{ display: 'none' }}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setOtherDocFile(file);
                    setOtherDocName(file.name);
                    setOtherDocNumber('');
                  }
                }}
                disabled={loading}
              />
            </UploadArea>
            {otherDocFile && (
              <Box sx={{ mt: 2 }}>
                <TextField
                  label="Document Name"
                  value={otherDocName}
                  onChange={e => setOtherDocName(e.target.value)}
                  fullWidth
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="Document Number"
                  value={otherDocNumber}
                  onChange={e => setOtherDocNumber(e.target.value)}
                  fullWidth
                  required
                  sx={{ mb: 2 }}
                />
                <Box sx={{ mt: 2, textAlign: 'right' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => uploadOtherDocument(otherDocFile, otherDocName, otherDocNumber)}
                    disabled={loading || !otherDocFile || !otherDocName.trim() || !otherDocNumber.trim()}
                  >
                    Submit
                  </Button>
                </Box>
              </Box>
            )}
          </>
        ) : (
          <Alert severity="info" sx={{ mt: 2 }}>
            You have uploaded the maximum of 3 documents.
          </Alert>
        )}
        {otherUploadSuccess && (
          <Alert severity="success" sx={{ mt: 2 }}>
            Document uploaded successfully!
          </Alert>
        )}
        <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider', display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={goToReview}
          >
            Continue to Review
          </Button>
        </Box>
      </Box>
    );
  };

  const renderReviewStep = () => {
    const panDoc = documents.find(d => d.type === 'pan');
    const aadharDoc = documents.find(d => d.type === 'aadhar');
    const otherDocs = documents.filter(d => d.type === 'other');
    const maxOtherDocs = 3;
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', fontWeight: 600 }}>
          Review Your KYC Documents
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                PAN Card Details
              </Typography>
              <Typography variant="body2">Name: {panDoc ? panDoc.name : '-'}</Typography>
              <Typography variant="body2">Number: {panDoc ? panDoc.number : '-'}</Typography>
              <Typography variant="body2">
                File: {panDoc && panDoc.fileName ? (
                  <a href={panDoc.fileUrl} target="_blank" rel="noopener noreferrer">{panDoc.fileName}</a>
                ) : 'Not uploaded'}
              </Typography>
              <Typography variant="body2">Status: {panDoc ? panDoc.status : '-'}</Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Aadhar Card Details
              </Typography>
              <Typography variant="body2">Number: {aadharDoc ? aadharDoc.number : '-'}</Typography>
              <Typography variant="body2">
                File: {aadharDoc && aadharDoc.fileName ? (
                  <a href={aadharDoc.fileUrl} target="_blank" rel="noopener noreferrer">{aadharDoc.fileName}</a>
                ) : 'Not uploaded'}
              </Typography>
              <Typography variant="body2">Status: {aadharDoc ? aadharDoc.status : '-'}</Typography>
            </Card>
          </Grid>
          {otherDocs.length > 0 && (
            <Grid item xs={12}>
              <Card sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Other Documents
                </Typography>
                {otherDocs.map((doc, idx) => (
                  <Box key={doc.id || idx} sx={{ mb: 2 }}>
                    <Typography variant="body2">Name: {doc.name}</Typography>
                    <Typography variant="body2">Number: {doc.number}</Typography>
                    <Typography variant="body2">
                      File: {doc.fileName ? (
                        <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">{doc.fileName}</a>
                      ) : 'Not uploaded'}
                    </Typography>
                    <Typography variant="body2">Status: {doc.status}</Typography>
                    {idx !== otherDocs.length - 1 && <Divider sx={{ my: 1 }} />}
                  </Box>
                ))}
              </Card>
            </Grid>
          )}
        </Grid>
        {otherDocs.length < maxOtherDocs && (
          <Box sx={{ mt: 3 }}>
            <Button variant="text" color="primary" onClick={() => {
              // Go to Other Documents step
              const idx = visibleSteps.findIndex(s => s.label === 'Other Documents');
              if (idx !== -1) setActiveStep(idx);
            }}>
              + Upload More Other Documents
            </Button>
          </Box>
        )}
      </Box>
    );
  };

  // Place this after all render*Step functions
  const visibleSteps: Array<{ label: string; description: string; icon: JSX.Element; render: () => JSX.Element }> = [
    !isDocStepDisabled('pan') ? { ...steps[0], icon: steps[0].icon as JSX.Element, render: renderPANCardStep } : null,
    !isDocStepDisabled('aadhar') ? { ...steps[1], icon: steps[1].icon as JSX.Element, render: renderAadharCardStep } : null,
    !isDocStepDisabled('other') ? { ...steps[2], icon: steps[2].icon as JSX.Element, render: renderOtherDocumentsStep } : null,
    { ...steps[3], icon: steps[3].icon as JSX.Element, render: renderReviewStep },
  ].filter((step): step is { label: string; description: string; icon: JSX.Element; render: () => JSX.Element } => step !== null);

  useEffect(() => {
    if (activeStep >= visibleSteps.length) {
      setActiveStep(visibleSteps.length - 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only adjust when steps length changes
  }, [visibleSteps.length]);

  // Helper: Find first incomplete step index (final logic)
  const getFirstIncompleteStepIndex = (docs: KYCDocument[] = documents) => {
    // PAN required
    if (!docs.find(d => d.type === 'pan')) return visibleSteps.findIndex(s => s.label === 'PAN Card');
    // Aadhar required
    if (!docs.find(d => d.type === 'aadhar')) return visibleSteps.findIndex(s => s.label === 'Aadhar Card');
    // Other: If at least 1 uploaded, always consider complete
    const otherDocs = docs.filter(d => d.type === 'other');
    if (otherDocs.length === 0) return visibleSteps.findIndex(s => s.label === 'Other Documents');
    // Otherwise, go to review
    return visibleSteps.findIndex(s => s.label === 'Review');
  };

  // On mount, always set to Review if at least 1 other doc is uploaded
  useEffect(() => {
    const stored = localStorage.getItem('kycActiveStep');
    const otherDocs = documents.filter(d => d.type === 'other');
    if (otherDocs.length > 0) {
      // Always go to Review if at least 1 other doc
      setActiveStep(visibleSteps.findIndex(s => s.label === 'Review'));
    } else if (stored !== null && !isNaN(Number(stored))) {
      setActiveStep(Number(stored));
    } else {
      setActiveStep(getFirstIncompleteStepIndex());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- getFirstIncompleteStepIndex is stable for this effect
  }, [documents.length, visibleSteps.length]);

  // Persist activeStep in localStorage
  useEffect(() => {
    localStorage.setItem('kycActiveStep', String(activeStep));
  }, [activeStep]);

  // After loading documents, always ensure stepper is on a valid step
  useEffect(() => {
    setActiveStep(prev => {
      if (prev >= visibleSteps.length) {
        return getFirstIncompleteStepIndex();
      }
      return prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- getFirstIncompleteStepIndex is derived from documents/visibleSteps
  }, [visibleSteps.length, documents.length]);

  // After upload, go to first incomplete step
  const goToFirstIncompleteStep = (docs?: KYCDocument[]) => {
    setActiveStep(getFirstIncompleteStepIndex(docs));
  };

  // Add this useEffect after visibleSteps is defined
  useEffect(() => {
    if (goToPanAfterDelete) {
      const panStepIdx = visibleSteps.findIndex(s => s.label === 'PAN Card');
      const panDoc = documents.find(d => d.type === 'pan');
      if (panStepIdx !== -1 && !panDoc) {
        setActiveStep(panStepIdx);
        setGoToPanAfterDelete(false);
      }
    }
    if (goToAadharAfterDelete) {
      const aadharStepIdx = visibleSteps.findIndex(s => s.label === 'Aadhar Card');
      const aadharDoc = documents.find(d => d.type === 'aadhar');
      if (aadharStepIdx !== -1 && !aadharDoc) {
        setActiveStep(aadharStepIdx);
        setGoToAadharAfterDelete(false);
      }
    }
  }, [goToPanAfterDelete, goToAadharAfterDelete, visibleSteps, documents]);

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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            <VerifiedUserIcon />
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
              KYC Verification
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Complete your Know Your Customer verification to access all features
            </Typography>
          </Box>
        </Box>
        
        {/* Progress Indicator */}
        <LinearProgress 
          variant="determinate" 
          value={(documents.filter(d => d.status === 'verified').length / Math.max(documents.length, 1)) * 100}
          sx={{ height: 8, borderRadius: 4, mb: 2 }}
        />
        <Typography variant="body2" color="text.secondary">
          {documents.filter(d => d.status === 'verified').length} of {documents.length} documents verified
        </Typography>
      </Box>

      {loadError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {loadError}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* KYC Form Stepper */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <CardContent sx={{ p: 0 }}>
              <Stepper activeStep={activeStep} orientation="vertical" nonLinear>
                {visibleSteps.map((step, index) => (
                  <Step key={step.label}>
                    <StepButton onClick={() => setActiveStep(index)}>
                      <StepLabel
                        StepIconComponent={() => (
                          <Avatar sx={{ bgcolor: activeStep === index ? 'primary.main' : 'grey.300' }}>
                            {step.icon}
                          </Avatar>
                        )}
                      >
                        <Typography variant="h6">{step.label}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {step.description}
                        </Typography>
                      </StepLabel>
                    </StepButton>
                    <StepContent>{step.render()}</StepContent>
                  </Step>
                ))}
              </Stepper>
            </CardContent>
          </Card>
        </Grid>

        {/* Uploaded Documents */}
        <Grid item xs={12} lg={4}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Uploaded Documents
          </Typography>
          <List>
            {documents.map((doc) => (
              <DocumentCard key={doc.id} sx={{ mb: 2 }}>
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    {doc.type === 'pan' && <CreditCardIcon color="primary" />}
                    {doc.type === 'aadhar' && <BadgeIcon color="primary" />}
                    {doc.type === 'other' && <DescriptionIcon color="primary" />}
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {doc.type === 'pan' ? 'PAN Card' : doc.type === 'aadhar' ? 'Aadhar Card' : 'Other Document'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {doc.number}
                      </Typography>
                    </Box>
                    {getStatusIcon(doc.status)}
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Chip
                      label={doc.status}
                      color={getStatusColor(doc.status) as any}
                      size="small"
                    />
                    <Typography variant="caption" color="text.secondary">
                      {doc.uploadDate.toLocaleDateString()}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Preview">
                      <IconButton
                        size="small"
                        onClick={() => handlePreviewDocument(doc)}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => handleEditDocument(doc.id)}
                        disabled={doc.status === 'verified'}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteDocument(doc.id)}
                        disabled={doc.status === 'verified'}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </CardContent>
              </DocumentCard>
            ))}
          </List>
          
          {documents.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <VerifiedUserIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
              <Typography variant="body2" color="text.secondary">
                No documents uploaded yet
              </Typography>
            </Box>
          )}
        </Grid>
      </Grid>

      {/* Document Preview Dialog */}
      <Dialog
        open={previewDialog.open}
        onClose={handleClosePreview}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Document Preview - {previewDialog.document?.type === 'pan' ? 'PAN Card' : 
            previewDialog.document?.type === 'aadhar' ? 'Aadhar Card' : 'Other Document'}
        </DialogTitle>
        <DialogContent>
          {previewDialog.document && (
            <Box>
              <Typography variant="body1" gutterBottom>
                <strong>Name:</strong> {previewDialog.document.name}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Number:</strong> {previewDialog.document.number}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>File:</strong> {previewDialog.document.fileName}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Upload Date:</strong> {previewDialog.document.uploadDate.toLocaleDateString()}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                <Typography component="span" variant="body1"><strong>Status:</strong></Typography>
                <Chip
                  label={previewDialog.document.status}
                  color={getStatusColor(previewDialog.document.status) as any}
                  size="small"
                />
              </Box>
              {previewDialog.document.status === 'rejected' && previewDialog.document.remarks && (
                <Box sx={{ mb: 2 }}>
                  <Alert severity="error" sx={{ fontWeight: 600 }}>
                    <strong>Rejection Reason:</strong> {previewDialog.document.remarks}
                  </Alert>
                </Box>
              )}
              <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1, textAlign: 'center' }}>
                {previewUrl === null && (
                  <Typography variant="body2" color="text.secondary">
                    Loading preview...
                  </Typography>
                )}
                {previewUrl === '' && (
                  <Typography variant="body2" color="error">
                    Unable to load preview. Please try again.
                  </Typography>
                )}
                {previewUrl && previewUrl !== '' && previewDialog.document && (() => {
                  const fileName = previewDialog.document.fileName.toLowerCase();
                  if (fileName.endsWith('.pdf')) {
                    return (
                      <iframe
                        src={previewUrl}
                        width="100%"
                        height="500px"
                        style={{ border: 'none' }}
                        title="Document Preview"
                      />
                    );
                  }
                  if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || fileName.endsWith('.png')) {
                    return (
                      <img
                        src={previewUrl}
                        alt="Document Preview"
                        style={{ maxWidth: '100%', maxHeight: 400 }}
                      />
                    );
                  }
                  return (
                    <Typography variant="body2" color="error">
                      Unsupported file type for preview.
                    </Typography>
                  );
                })()}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePreview}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Document Dialog */}
      <Dialog
        open={editDialog.open}
        onClose={() => {
          if (editDialog.previewUrl) URL.revokeObjectURL(editDialog.previewUrl);
          setEditDialog({ ...editDialog, open: false, file: null, previewUrl: null, error: null });
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          style: {
            borderRadius: 20,
            background: 'rgba(255,255,255,0.85)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            backdropFilter: 'blur(16px)',
          }
        }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <EditIcon color="primary" />
            Edit Document
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2}>
            <TextField
              label="Full Name"
              value={editDialog.name}
              onChange={e => setEditDialog(ed => ({ ...ed, name: e.target.value }))}
              fullWidth
              required
            />
            <TextField
              label="Document Number"
              value={editDialog.number}
              onChange={e => setEditDialog(ed => ({ ...ed, number: e.target.value.toUpperCase() }))}
              fullWidth
              required
            />
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Replace File (optional)
              </Typography>
              <UploadArea
                sx={{ minHeight: 120 }}
                onClick={() => document.getElementById('edit-upload')?.click()}
              >
                <CloudUploadIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Drag & drop or click to upload new file (PDF, JPG, PNG, max 5MB)
                </Typography>
                <input
                  id="edit-upload"
                  type="file"
                  accept='.pdf,.jpg,.jpeg,.png'
                  style={{ display: 'none' }}
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (editDialog.previewUrl) URL.revokeObjectURL(editDialog.previewUrl);
                      const url = URL.createObjectURL(file);
                      setEditDialog(ed => ({
                        ...ed,
                        file,
                        previewUrl: url,
                      }));
                    }
                  }}
                />
              </UploadArea>
              {(editDialog.previewUrl || editPreviewUrl) && (
                <Box mt={2} textAlign="center">
                  {editDialog.previewUrl ? (
                    editDialog.file?.name.toLowerCase().endsWith('.pdf') ? (
                      <iframe src={editDialog.previewUrl} width="100%" height="200px" style={{ border: 'none' }} title="Edit document preview" />
                    ) : (
                      <img src={editDialog.previewUrl} alt="Preview" style={{ maxWidth: 200, maxHeight: 200 }} />
                    )
                  ) : (
                    editDialog.document ? (
                      editDialog.document.fileName.toLowerCase().endsWith('.pdf') ? (
                        <iframe src={editPreviewUrl || ''} width="100%" height="200px" style={{ border: 'none' }} title="Edit document file preview" />
                      ) : (
                        <img src={editPreviewUrl || ''} alt="Preview" style={{ maxWidth: 200, maxHeight: 200 }} />
                      )
                    ) : null
                  )}
                </Box>
              )}
            </Box>
            {editDialog.error && (
              <Alert severity="error">{editDialog.error}</Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              if (editDialog.previewUrl) URL.revokeObjectURL(editDialog.previewUrl);
              setEditDialog({ ...editDialog, open: false, file: null, previewUrl: null, error: null });
            }}
            disabled={editDialog.loading}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            disabled={
              editDialog.loading ||
              !editDialog.name.trim() ||
              !editDialog.number.trim()
            }
            onClick={async () => {
              setEditDialog(ed => ({ ...ed, loading: true, error: null }));
              try {
                const formDataObj = new FormData();
                formDataObj.append('documentName', editDialog.name);
                formDataObj.append('documentNumber', editDialog.number);
                if (editDialog.file) formDataObj.append('document', editDialog.file);
                const token = localStorage.getItem('token');
                const response = await fetch(
                  `${getKycApiBase()}/kyc/documents/${editDialog.document?.id}`,
                  {
                    method: 'PUT',
                    headers: {
                      'Authorization': token ? `Bearer ${token}` : ''
                    },
                    body: formDataObj,
                  }
                );
                const result = await response.json();
                if (!response.ok) throw new Error(result.message || 'Update failed');
                // Refresh document list
                await loadKYCDocuments();
                if (editDialog.previewUrl) URL.revokeObjectURL(editDialog.previewUrl);
                setEditDialog(ed => ({ ...ed, open: false, file: null, previewUrl: null, loading: false, error: null }));
                setEditSuccessDialog({ open: true, message: 'Document updated successfully!' });
              } catch (error: any) {
                setEditDialog(ed => ({ ...ed, loading: false, error: error.message || 'Update failed' }));
              }
            }}
          >
            {editDialog.loading ? <CircularProgress size={20} /> : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Document Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ ...deleteDialog, open: false, error: null })}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          style: {
            borderRadius: 20,
            background: 'rgba(255,255,255,0.95)',
            boxShadow: '0 8px 32px rgba(255,0,0,0.18)',
            backdropFilter: 'blur(12px)',
            animation: 'fadeInDown 0.4s cubic-bezier(.4,2,.6,1)',
          }
        }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <DeleteIcon color="error" fontSize="large" />
            <Typography variant="h6" color="error" fontWeight={700}>
              Delete Document
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            Are you sure you want to delete <b>{deleteDialog.document?.name}</b> ({deleteDialog.document?.number})?
            <br />
            This action cannot be undone.
          </Typography>
          {deleteDialog.error && (
            <Alert severity="error">{deleteDialog.error}</Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialog({ ...deleteDialog, open: false, error: null })}
            disabled={deleteDialog.loading}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            disabled={deleteDialog.loading}
            onClick={async () => {
              setDeleteDialog(dd => ({ ...dd, loading: true, error: null }));
              try {
                const token = localStorage.getItem('token');
                const response = await fetch(
                  `${getKycApiBase()}/kyc/documents/${deleteDialog.document?.id}`,
                  {
                    method: 'DELETE',
                    headers: {
                      'Authorization': token ? `Bearer ${token}` : ''
                    }
                  }
                );
                const result = await response.json();
                if (!response.ok) throw new Error(result.message || 'Delete failed');
                await loadKYCDocuments();
                setDeleteDialog({ open: false, document: null, loading: false, error: null });
                // Always go to PAN Card step if PAN is deleted
                if (deleteDialog.document?.type === 'pan') {
                  setGoToPanAfterDelete(true);
                } else if (deleteDialog.document?.type === 'aadhar') {
                  // If PAN Card is present, go to Aadhar step; else go to PAN step and then Aadhar
                  const panDoc = documents.find(d => d.type === 'pan');
                  if (panDoc) {
                    setGoToAadharAfterDelete(true);
                  } else {
                    // If PAN Card is missing, always go to PAN first, then Aadhar
                    setGoToPanAfterDelete(true);
                    setGoToAadharAfterDelete(true);
                  }
                } else {
                  goToFirstIncompleteStep();
                }
              } catch (error: any) {
                setDeleteDialog(dd => ({ ...dd, loading: false, error: error.message || 'Delete failed' }));
              }
            }}
          >
            {deleteDialog.loading ? <CircularProgress size={20} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Success Dialog */}
      <Dialog
        open={editSuccessDialog.open}
        onClose={() => setEditSuccessDialog({ open: false, message: '' })}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          style: {
            borderRadius: 20,
            background: 'rgba(255,255,255,0.95)',
            boxShadow: '0 8px 32px rgba(0,200,0,0.18)',
            backdropFilter: 'blur(12px)',
            animation: 'fadeInDown 0.4s cubic-bezier(.4,2,.6,1)',
          }
        }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <CheckCircleIcon color="success" fontSize="large" />
            <Typography variant="h6" color="success.main" fontWeight={700}>
              Success
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            {editSuccessDialog.message}
          </Typography>
        </DialogContent>
      </Dialog>
    </StyledPaper>
  );
};

export default KYCPage; 