import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Stack,
  Card,
  CardContent,
  Button,
  Chip,
  IconButton,
  Grid,
  Paper,
  Slider,
  Avatar,
  Badge,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  School as SchoolIcon,
  Palette as PaletteIcon,
  Upload as UploadIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Draw as DrawIcon,
  Create as SignatureIcon,
  Star as StarIcon,
  CheckCircle as CheckCircleIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  Settings as SettingsIcon,
  Percent as PercentIcon,
  Image as ImageIcon,
  Brush as BrushIcon,
  Clear as ClearIcon,
  Undo as UndoIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { CircularProgress } from '@mui/material';
import { motion, AnimatePresence, LazyMotion, domAnimation } from 'framer-motion';
// Defer heavy PDF imports to improve loading performance
// import { 
//   certificateTemplates, 
//   downloadCertificate, 
//   CertificateData,
//   CertificateTemplate as PDFTemplate
// } from '../../utils/pdfCertificateGenerator';
import creatorLogo from '../../assets/creator-logo.png';
import sealImage from '../../assets/seal.png';
import { useAuth } from '../../context/AuthContext';

interface CertificateTemplate {
  id: string;
  name: string;
  preview: string;
  category: 'modern' | 'classic' | 'minimal' | 'premium';
  color: string;
  visualPreview: {
    background: string;
    border: string;
    pattern: string;
  };
}

interface Signature {
  id: string;
  name: string;
  designation: string;
  type: 'upload' | 'draw';
  image?: string;
  enabled: boolean;
  isDefault?: boolean;
}

interface CertificateStepProps {
  certificateEnabled: boolean;
  onCertificateEnabledChange: (enabled: boolean) => void;
  selectedTemplate: string;
  onTemplateChange: (templateId: string) => void;
  certificateTitle: string;
  onCertificateTitleChange: (title: string) => void;
  certificateDescription: string;
  onCertificateDescriptionChange: (description: string) => void;
  completionPercentage: number;
  onCompletionPercentageChange: (percentage: number) => void;
  logoFile: File | null;
  onLogoChange: (file: File | null) => void;
  applicationLogoEnabled: boolean;
  onApplicationLogoEnabledChange: (enabled: boolean) => void;
  signatures: Signature[];
  onSignaturesChange: (signatures: Signature[]) => void;
  // New props for creator logo
  creatorLogoFile: File | null;
  onCreatorLogoChange: (file: File | null) => void;
}

const SignatureCanvas: React.FC<{
  onSave: (dataUrl: string) => void;
  onCancel: () => void;
}> = ({ onSave, onCancel }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [hasDrawing, setHasDrawing] = useState(false);

  // Clear canvas when component mounts (for new signature)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas && context) {
      context.clearRect(0, 0, canvas.width, canvas.height);
      setHasDrawing(false);
    }
  }, [context]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        setContext(ctx);
      }
    }
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (canvas && context) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      context.beginPath();
      context.moveTo(x, y);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !context) return;
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      context.lineTo(x, y);
      context.stroke();
      setHasDrawing(true);
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas && context) {
      context.clearRect(0, 0, canvas.width, canvas.height);
      setHasDrawing(false);
    }
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (canvas && hasDrawing) {
      const dataUrl = canvas.toDataURL('image/png');
      onSave(dataUrl);
    }
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6" fontWeight={600}>
          Draw Your Signature
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            startIcon={<UndoIcon />}
            onClick={clearCanvas}
            variant="outlined"
          >
            Clear
          </Button>
        </Stack>
      </Stack>
      
      <Paper
        sx={{
          border: '2px dashed #e3e6f0',
          borderRadius: 2,
          p: 2,
          background: '#fafbff'
        }}
      >
        <canvas
          ref={canvasRef}
          width={600}
          height={200}
          style={{
            border: '1px solid #e3e6f0',
            borderRadius: 8,
            background: 'white',
            cursor: 'crosshair',
            width: '100%',
            height: 'auto',
            maxWidth: '600px'
          }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
      </Paper>
      
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        Click and drag to draw your signature. Use the Clear button to start over.
      </Typography>
      
      <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
        <Button
          variant="outlined"
          onClick={onCancel}
          fullWidth
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={saveSignature}
          disabled={!hasDrawing}
          fullWidth
          sx={{ background: 'linear-gradient(45deg, #6C63FF 0%, #8B5CF6 100%)' }}
        >
          Save Signature
        </Button>
      </Stack>
    </Box>
  );
};

// Error boundary for framer-motion animations
const SafeMotionDiv: React.FC<{ children: React.ReactNode; [key: string]: any }> = ({ children, ...props }) => {
  try {
    return <motion.div {...props}>{children}</motion.div>;
  } catch (error) {
    console.warn('Framer-motion animation error:', error);
    return <div style={{ opacity: 1 }}>{children}</div>;
  }
};

const CertificateStep: React.FC<CertificateStepProps> = React.memo(({
  certificateEnabled,
  onCertificateEnabledChange,
  selectedTemplate,
  onTemplateChange,
  certificateTitle,
  onCertificateTitleChange,
  certificateDescription,
  onCertificateDescriptionChange,
  completionPercentage,
  onCompletionPercentageChange,
  logoFile,
  onLogoChange,
  applicationLogoEnabled,
  onApplicationLogoEnabledChange,
  signatures,
  onSignaturesChange,
  // New props for creator logo
  creatorLogoFile,
  onCreatorLogoChange
}) => {
  const { user } = useAuth();
  const creatorName = user?.name || 'Course Instructor';
  const [activeTab, setActiveTab] = useState(0);
  const [drawSignatureOpen, setDrawSignatureOpen] = useState(false);
  const [currentSignature, setCurrentSignature] = useState<Signature | null>(null);
  const [signBelowText, setSignBelowText] = useState('has successfully completed the course');
  const [studentName] = useState('John Doe'); // This will be dynamic from enrolled student data
  const [isPreviewLoaded, setIsPreviewLoaded] = useState(false);

  // Memoize templates array to prevent recreation on every render
  const templates: CertificateTemplate[] = React.useMemo(() => [
    {
      id: '1',
      name: 'Classic Blue Certificate',
      preview: '📜',
      category: 'classic',
      color: '#1E3A8A',
      visualPreview: { background: '#FFFFFF', border: '2px solid #1E3A8A', pattern: 'classic_blue' }
    },
    {
      id: '2',
      name: 'Corporate Recognition',
      preview: '🏢',
      category: 'modern',
      color: '#2563EB',
      visualPreview: { background: '#FFFFFF', border: '2px solid #2563EB', pattern: 'corporate_recognition' }
    },
    {
      id: '3',
      name: 'Minimal Elegance',
      preview: '✨',
      category: 'minimal',
      color: '#6B7280',
      visualPreview: { background: '#FFFFFF', border: '1px solid #6B7280', pattern: 'minimal_elegance' }
    },
    {
      id: '4',
      name: 'Premium Gold',
      preview: '🏆',
      category: 'premium',
      color: '#D97706',
      visualPreview: { background: '#FFFFFF', border: '2px solid #D97706', pattern: 'premium_gold' }
    },
    {
      id: '5',
      name: 'Modern Gradient',
      preview: '🎨',
      category: 'modern',
      color: '#8B5CF6',
      visualPreview: { background: '#FFFFFF', border: '2px solid #8B5CF6', pattern: 'modern_gradient' }
    },
    {
      id: '6',
      name: 'Professional Dark',
      preview: '⚡',
      category: 'modern',
      color: '#374151',
      visualPreview: { background: '#FFFFFF', border: '2px solid #374151', pattern: 'professional_dark' }
    }
  ], []);

  // Initialize signatures immediately for better performance
  useEffect(() => {
    if (signatures.length === 0) {
      const defaultInstructorSignature: Signature = {
        id: `instructor-sig-${Date.now()}`,
        name: creatorName,
        designation: 'Creator',
        type: 'upload',
        enabled: true,
        isDefault: true
      };
      
      const defaultDeanSignature: Signature = {
        id: `dean-sig-${Date.now()}`,
        name: 'Academic Dean',
        designation: 'CEO, Content Creator App',
        type: 'upload',
        enabled: false,
        isDefault: true
      };
      
      onSignaturesChange([defaultInstructorSignature, defaultDeanSignature]);
    }
  }, [signatures.length, creatorName, onSignaturesChange]);

  // Load preview immediately for better performance
  useEffect(() => {
    setIsPreviewLoaded(true);
  }, []);

  // Optimized certificate preview rendering with lazy loading
  const renderCertificatePreview = React.useCallback((
    template: CertificateTemplate,
    displayTitle: string,
    displayDescription: string,
    scale: number = 1,
    height: string = '600px'
  ) => {
    if (!isPreviewLoaded) {
      return (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '400px',
          background: '#f8f9ff',
          borderRadius: 2
        }}>
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress size={40} sx={{ mb: 2, color: '#6C63FF' }} />
            <Typography variant="body2" color="text.secondary">
              Loading certificate preview...
            </Typography>
          </Box>
        </Box>
      );
    }

    if (template.category === 'classic') {
      return (
        <Box sx={{
          width: '100%',
          height: '100%',
          background: '#FEF7E0',
          border: '3px solid #8B4513',
          borderRadius: '6px',
          overflow: 'hidden',
          position: 'relative',
          transform: `scale(${scale})`,
          transformOrigin: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <Box sx={{
            position: 'absolute',
            top: '6px',
            left: '6px',
            right: '6px',
            bottom: '6px',
            border: '1px solid #8B4513',
            borderRadius: '3px',
            pointerEvents: 'none'
          }} />
          <Box sx={{
            position: 'relative',
            zIndex: 1,
            p: 2,
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Application Logo - Top Left */}
            {applicationLogoEnabled && (
              <Box sx={{ position: 'absolute', top: 8, left: 8, zIndex: 10 }}>
                <img
                  src={creatorLogo}
                  alt="Application Logo"
                  style={{
                    width: `${25 * scale}px`,
                    height: `${25 * scale}px`,
                    objectFit: 'contain',
                    borderRadius: '4px'
                  }}
                />
              </Box>
            )}
            {/* Course Logo - Top Right */}
            {logoFile && (
              <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 10 }}>
                <img
                  src={URL.createObjectURL(logoFile)}
                  alt="Course Logo"
                  style={{
                    width: `${35 * scale}px`,
                    height: `${35 * scale}px`,
                    objectFit: 'contain',
                    borderRadius: '4px'
                  }}
                />
              </Box>
            )}
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              {/* Creator Logo - Centered below header */}
              {creatorLogoFile && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2, mt: 1 }}>
                  <img
                    src={URL.createObjectURL(creatorLogoFile)}
                    alt="Creator Logo"
                    style={{
                      width: `${50 * scale}px`,
                      height: `${50 * scale}px`,
                      objectFit: 'contain',
                      borderRadius: '4px'
                    }}
                  />
                </Box>
              )}
              <Typography sx={{
                fontSize: `${1.2 * scale}rem`,
                fontWeight: 700,
                color: '#8B4513',
                mb: 2
              }}>
                {displayTitle}
              </Typography>
              <Box sx={{
                width: '60%',
                height: `${2 * scale}px`,
                background: '#CD7F32',
                mx: 'auto',
                mb: 2
              }} />
            </Box>
            <Box sx={{
              flex: 1,
              textAlign: 'center',
              px: 2,
              pb: 2
            }}>
              <Typography sx={{
                fontSize: `${0.8 * scale}rem`,
                color: '#8B4513',
                mb: 2
              }}>
                {displayDescription}
              </Typography>
              <Typography sx={{
                fontSize: `${1 * scale}rem`,
                fontWeight: 700,
                color: '#CD7F32',
                mb: 2
              }}>
                {studentName}
              </Typography>
              <Typography sx={{
                fontSize: `${0.7 * scale}rem`,
                color: '#8B4513',
                mb: 2
              }}>
                {signBelowText}
              </Typography>
              
              {/* Certificate Seal */}
              <Box sx={{
                position: 'absolute',
                top: '75%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 5,
                opacity: 0.6
              }}>
                <img
                  src={sealImage}
                  alt="Certificate Seal"
                  loading="lazy"
                  style={{
                    width: `${100 * scale}px`,
                    height: `${100 * scale}px`,
                    objectFit: 'contain'
                  }}
                />
              </Box>
            </Box>
            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              mt: 'auto'
            }}>
              {/* Creator Signatures */}
              {signatures.slice(0, 2).map((signature, index) => (
                <Box key={index} sx={{ textAlign: 'center', flex: 1 }}>
                  {signature?.image && (
                    <Box sx={{ mb: 1 }}>
                      <img
                        src={signature.image}
                        alt="Signature"
                        style={{
                          maxWidth: `${80 * scale}px`,
                          maxHeight: `${30 * scale}px`,
                          objectFit: 'contain'
                        }}
                      />
                    </Box>
                  )}
                  <Box sx={{
                    width: `${60 * scale}px`,
                    height: `${2 * scale}px`,
                    background: '#8B4513',
                    mx: 'auto',
                    mb: 1
                  }} />
                  <Typography sx={{
                    fontSize: `${0.6 * scale}rem`,
                    fontWeight: 600,
                    color: '#8B4513'
                  }}>
                    {signature?.name || (index === 0 ? creatorName : `Signature ${index + 1}`)}
                  </Typography>
                  <Typography sx={{
                    fontSize: `${0.5 * scale}rem`,
                    color: '#CD7F32'
                  }}>
                    {signature?.designation || (index === 0 ? 'Creator' : 'Designation')}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      );
    } else if (template.category === 'modern') {
      return (
        <Box sx={{
          width: '100%',
          height: '100%',
          background: '#F8FAFC',
          border: '3px solid #2563EB',
          borderRadius: '8px',
          overflow: 'hidden',
          position: 'relative',
          transform: `scale(${scale})`,
          transformOrigin: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <Box sx={{
            position: 'relative',
            zIndex: 1,
            p: 2,
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Application Logo - Top Left */}
            {applicationLogoEnabled && (
              <Box sx={{ position: 'absolute', top: 8, left: 8, zIndex: 10 }}>
                <img
                  src={creatorLogo}
                  alt="Application Logo"
                  style={{
                    width: `${25 * scale}px`,
                    height: `${25 * scale}px`,
                    objectFit: 'contain',
                    borderRadius: '4px'
                  }}
                />
              </Box>
            )}
            {/* Course Logo - Top Right */}
            {logoFile && (
              <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 10 }}>
                <img
                  src={URL.createObjectURL(logoFile)}
                  alt="Course Logo"
                  style={{
                    width: `${30 * scale}px`,
                    height: `${30 * scale}px`,
                    objectFit: 'contain',
                    borderRadius: '6px'
                  }}
                />
              </Box>
            )}
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Box sx={{
                width: '100%',
                height: `${6 * scale}px`,
                background: 'linear-gradient(90deg, #2563EB 0%, #3B82F6 100%)',
                mb: 2
              }} />
              {/* Creator Logo - Centered below header */}
              {creatorLogoFile && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <img
                    src={URL.createObjectURL(creatorLogoFile)}
                    alt="Creator Logo"
                    style={{
                      width: `${40 * scale}px`,
                      height: `${40 * scale}px`,
                      objectFit: 'contain',
                      borderRadius: '6px'
                    }}
                  />
                </Box>
              )}
              <Typography sx={{
                fontSize: `${1 * scale}rem`,
                fontWeight: 700,
                color: '#1F2937',
                mb: 2
              }}>
                {displayTitle}
              </Typography>
            </Box>
            <Box sx={{
              flex: 1,
              textAlign: 'center',
              px: 2,
              pb: 3
            }}>
              <Typography sx={{
                fontSize: `${0.7 * scale}rem`,
                color: '#6B7280',
                mb: 2
              }}>
                {displayDescription}
              </Typography>
              <Typography sx={{
                fontSize: `${0.9 * scale}rem`,
                fontWeight: 700,
                color: '#2563EB',
                mb: 2
              }}>
                {studentName}
              </Typography>
              <Typography sx={{
                fontSize: `${0.7 * scale}rem`,
                color: '#6B7280',
                mb: 2
              }}>
                {signBelowText}
              </Typography>
              
              {/* Certificate Seal */}
              <Box sx={{
                position: 'absolute',
                top: '75%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 5,
                opacity: 0.6
              }}>
                <img
                  src={sealImage}
                  alt="Certificate Seal"
                  style={{
                    width: `${95 * scale}px`,
                    height: `${95 * scale}px`,
                    objectFit: 'contain'
                  }}
                />
              </Box>
            </Box>
            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              mt: 'auto'
            }}>
              {signatures.slice(0, 2).map((signature, index) => (
                <Box key={index} sx={{ textAlign: 'center', flex: 1 }}>
                  {signature?.image && (
                    <Box sx={{ mb: 1 }}>
                      <img
                        src={signature.image}
                        alt="Signature"
                        style={{
                          maxWidth: `${70 * scale}px`,
                          maxHeight: `${25 * scale}px`,
                          objectFit: 'contain'
                        }}
                      />
                    </Box>
                  )}
                  <Box sx={{
                    width: `${50 * scale}px`,
                    height: `${1 * scale}px`,
                    background: '#2563EB',
                    mx: 'auto',
                    mb: 1
                  }} />
                  <Typography sx={{
                    fontSize: `${0.5 * scale}rem`,
                    fontWeight: 600,
                    color: '#1F2937'
                  }}>
                    {signature?.name || (index === 0 ? creatorName : `Signature ${index + 1}`)}
                  </Typography>
                  <Typography sx={{
                    fontSize: `${0.4 * scale}rem`,
                    color: '#2563EB'
                  }}>
                    {signature?.designation || (index === 0 ? 'Creator' : 'Designation')}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      );
    } else if (template.category === 'minimal') {
      return (
        <Box sx={{
          width: '100%',
          height: '100%',
          background: '#FFFFFF',
          border: '1px solid #6B7280',
          borderRadius: '8px',
          overflow: 'hidden',
          position: 'relative',
          transform: `scale(${scale})`,
          transformOrigin: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <Box sx={{
            position: 'relative',
            zIndex: 1,
            p: 2,
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Application Logo - Top Left */}
            {applicationLogoEnabled && (
              <Box sx={{ position: 'absolute', top: 8, left: 8, zIndex: 10 }}>
                <img
                  src={creatorLogo}
                  alt="Application Logo"
                  style={{
                    width: `${25 * scale}px`,
                    height: `${25 * scale}px`,
                    objectFit: 'contain',
                    borderRadius: '4px'
                  }}
                />
              </Box>
            )}
            {/* Course Logo - Top Right */}
            {logoFile && (
              <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 10 }}>
                <img
                  src={URL.createObjectURL(logoFile)}
                  alt="Course Logo"
                  style={{
                    width: `${30 * scale}px`,
                    height: `${30 * scale}px`,
                    objectFit: 'contain',
                    borderRadius: '4px'
                  }}
                />
              </Box>
            )}
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              {/* Creator Logo - Centered below header */}
              {creatorLogoFile && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <img
                    src={URL.createObjectURL(creatorLogoFile)}
                    alt="Creator Logo"
                    style={{
                      width: `${40 * scale}px`,
                      height: `${40 * scale}px`,
                      objectFit: 'contain',
                      borderRadius: '4px'
                    }}
                  />
                </Box>
              )}
              <Typography sx={{
                fontSize: `${1 * scale}rem`,
                fontWeight: 700,
                color: '#374151',
                mb: 2
              }}>
                {displayTitle}
              </Typography>
            </Box>
            <Box sx={{
              flex: 1,
              textAlign: 'center',
              px: 2,
              pb: 3
            }}>
              <Typography sx={{
                fontSize: `${0.7 * scale}rem`,
                color: '#6B7280',
                mb: 2
              }}>
                {displayDescription}
              </Typography>
              <Typography sx={{
                fontSize: `${0.9 * scale}rem`,
                fontWeight: 700,
                color: '#374151',
                mb: 2
              }}>
                {studentName}
              </Typography>
              <Typography sx={{
                fontSize: `${0.7 * scale}rem`,
                color: '#6B7280',
                mb: 2
              }}>
                {signBelowText}
              </Typography>
              
              {/* Certificate Seal */}
              <Box sx={{
                position: 'absolute',
                top: '75%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 5,
                opacity: 0.6
              }}>
                <img
                  src={sealImage}
                  alt="Certificate Seal"
                  style={{
                    width: `${90 * scale}px`,
                    height: `${90 * scale}px`,
                    objectFit: 'contain'
                  }}
                />
              </Box>
            </Box>
            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              mt: 'auto'
            }}>
              {signatures.slice(0, 2).map((signature, index) => (
                <Box key={index} sx={{ textAlign: 'center', flex: 1 }}>
                  {signature?.image && (
                    <Box sx={{ mb: 1 }}>
                      <img
                        src={signature.image}
                        alt="Signature"
                        style={{
                          maxWidth: `${60 * scale}px`,
                          maxHeight: `${20 * scale}px`,
                          objectFit: 'contain'
                        }}
                      />
                    </Box>
                  )}
                  <Box sx={{
                    width: `${40 * scale}px`,
                    height: `${1 * scale}px`,
                    background: '#6B7280',
                    mx: 'auto',
                    mb: 1
                  }} />
                  <Typography sx={{
                    fontSize: `${0.5 * scale}rem`,
                    fontWeight: 600,
                    color: '#374151'
                  }}>
                    {signature?.name || (index === 0 ? creatorName : `Signature ${index + 1}`)}
                  </Typography>
                  <Typography sx={{
                    fontSize: `${0.4 * scale}rem`,
                    color: '#6B7280'
                  }}>
                    {signature?.designation || (index === 0 ? 'Creator' : 'Designation')}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      );
    } else if (template.category === 'premium') {
      return (
        <Box sx={{
          width: '100%',
          height: '100%',
          background: '#FEF7E0',
          border: '2px solid #D97706',
          borderRadius: '8px',
          overflow: 'hidden',
          position: 'relative',
          transform: `scale(${scale})`,
          transformOrigin: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>
          <Box sx={{
            position: 'relative',
            zIndex: 1,
            p: 2,
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Application Logo - Top Left */}
            {applicationLogoEnabled && (
              <Box sx={{ position: 'absolute', top: 8, left: 8, zIndex: 10 }}>
                <img
                  src={creatorLogo}
                  alt="Application Logo"
                  style={{
                    width: `${25 * scale}px`,
                    height: `${25 * scale}px`,
                    objectFit: 'contain',
                    borderRadius: '4px'
                  }}
                />
              </Box>
            )}
            {/* Course Logo - Top Right */}
            {logoFile && (
              <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 10 }}>
                <img
                  src={URL.createObjectURL(logoFile)}
                  alt="Course Logo"
                  style={{
                    width: `${30 * scale}px`,
                    height: `${30 * scale}px`,
                    objectFit: 'contain',
                    borderRadius: '4px'
                  }}
                />
              </Box>
            )}
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              {/* Creator Logo - Centered below header */}
              {creatorLogoFile && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <img
                    src={URL.createObjectURL(creatorLogoFile)}
                    alt="Creator Logo"
                    style={{
                      width: `${40 * scale}px`,
                      height: `${40 * scale}px`,
                      objectFit: 'contain',
                      borderRadius: '4px'
                    }}
                  />
                </Box>
              )}
              <Typography sx={{
                fontSize: `${1.1 * scale}rem`,
                fontWeight: 700,
                color: '#92400E',
                mb: 2
              }}>
                {displayTitle}
              </Typography>
              <Box sx={{
                width: '50%',
                height: `${2 * scale}px`,
                background: '#B8860B',
                mx: 'auto',
                mb: 2
              }} />
            </Box>
            <Box sx={{
              flex: 1,
              textAlign: 'center',
              px: 2,
              pb: 3
            }}>
              <Typography sx={{
                fontSize: `${0.7 * scale}rem`,
                color: '#92400E',
                mb: 2
              }}>
                {displayDescription}
              </Typography>
              <Typography sx={{
                fontSize: `${0.9 * scale}rem`,
                fontWeight: 700,
                color: '#B8860B',
                mb: 2
              }}>
                {studentName}
              </Typography>
              <Typography sx={{
                fontSize: `${0.7 * scale}rem`,
                color: '#92400E',
                mb: 2
              }}>
                {signBelowText}
              </Typography>
              
              {/* Certificate Seal */}
              <Box sx={{
                position: 'absolute',
                top: '75%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 5,
                opacity: 0.6
              }}>
                <img
                  src={sealImage}
                  alt="Certificate Seal"
                  style={{
                    width: `${105 * scale}px`,
                    height: `${105 * scale}px`,
                    objectFit: 'contain'
                  }}
                />
              </Box>
            </Box>
            <Box sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              mt: 'auto'
            }}>
              {signatures.slice(0, 2).map((signature, index) => (
                <Box key={index} sx={{ textAlign: 'center', flex: 1 }}>
                  {signature?.image && (
                    <Box sx={{ mb: 1 }}>
                      <img
                        src={signature.image}
                        alt="Signature"
                        style={{
                          maxWidth: `${60 * scale}px`,
                          maxHeight: `${20 * scale}px`,
                          objectFit: 'contain'
                        }}
                      />
                    </Box>
                  )}
                  <Box sx={{
                    width: `${40 * scale}px`,
                    height: `${1 * scale}px`,
                    background: '#B8860B',
                    mx: 'auto',
                    mb: 1
                  }} />
                  <Typography sx={{
                    fontSize: `${0.5 * scale}rem`,
                    fontWeight: 600,
                    color: '#92400E'
                  }}>
                    {signature?.name || (index === 0 ? creatorName : `Signature ${index + 1}`)}
                  </Typography>
                  <Typography sx={{
                    fontSize: `${0.4 * scale}rem`,
                    color: '#B8860B'
                  }}>
                    {signature?.designation || (index === 0 ? 'Creator' : 'Designation')}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      );
    }
    return null;
  }, [isPreviewLoaded, studentName, creatorName, logoFile, creatorLogoFile, applicationLogoEnabled, signatures, signBelowText]);

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onLogoChange(file);
    }
  };

  const handleCreatorLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onCreatorLogoChange(file);
    }
  };

  const handleSignatureUpload = (signatureId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const updatedSignatures = signatures.map(sig => 
          sig.id === signatureId 
            ? { ...sig, type: 'upload' as const, image: dataUrl }
            : sig
        );
        onSignaturesChange(updatedSignatures);
      };
      reader.readAsDataURL(file);
    }
  };

  const addSignature = () => {
    const newSignature: Signature = {
      id: `sig-${Date.now()}`,
      name: creatorName,
      designation: 'Creator',
      type: 'upload',
      enabled: true
    };
    onSignaturesChange([...signatures, newSignature]);
  };

  const updateSignature = (id: string, updates: Partial<Signature>) => {
    const updatedSignatures = signatures.map(sig =>
      sig.id === id ? { ...sig, ...updates } : sig
    );
    onSignaturesChange(updatedSignatures);
  };

  const removeSignature = (id: string) => {
    onSignaturesChange(signatures.filter(sig => sig.id !== id));
  };

  const openDrawSignature = (signature: Signature) => {
    setCurrentSignature(signature);
    setDrawSignatureOpen(true);
  };

  const handleSaveSignature = (dataUrl: string) => {
    if (currentSignature) {
      // Find the signature by ID and update only that specific signature
      const updatedSignatures = signatures.map(sig => 
        sig.id === currentSignature.id 
          ? { ...sig, type: 'draw' as const, image: dataUrl }
          : sig
      );
      onSignaturesChange(updatedSignatures);
    }
    setDrawSignatureOpen(false);
    setCurrentSignature(null);
  };

  const handleDownloadCertificate = () => {
    const template = templates.find(t => t.id === selectedTemplate);
    if (!template) return;
    
    // Convert seal image to data URL
    const convertSealToDataURL = (): Promise<string> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = img.width;
          canvas.height = img.height;
          ctx?.drawImage(img, 0, 0);
          const dataURL = canvas.toDataURL('image/png');
          resolve(dataURL);
        };
        img.onerror = () => {
          resolve(''); // Return empty string if image fails to load
        };
        img.src = sealImage;
      });
    };

    // Convert logo files to data URLs
    const convertLogoToDataURL = (file: File): Promise<string> => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataURL = e.target?.result as string;
          resolve(dataURL);
        };
        reader.onerror = () => {
          resolve(''); // Return empty string if file fails to load
        };
        reader.readAsDataURL(file);
      });
    };
    
    // Convert all images and then download
    Promise.all([
      convertSealToDataURL(),
      logoFile ? convertLogoToDataURL(logoFile) : Promise.resolve(''),
      creatorLogoFile ? convertLogoToDataURL(creatorLogoFile) : Promise.resolve('')
    ]).then(([sealDataURL, courseLogoDataURL, creatorLogoDataURL]) => {
      // Temporarily disabled for performance optimization
      console.log('Download certificate functionality temporarily disabled for performance');
      // const certificateData: CertificateData = {
      //   studentName: studentName,
      //   courseName: certificateTitle || 'Certificate of Achievement',
      //   completionDate: new Date().toLocaleDateString(),
      //   certificateNumber: `CERT-${Date.now()}`,
      //   instructorName: signatures[0]?.name || creatorName,
      //   organizationName: signatures[1]?.name || 'Academic Dean',
      //   certificateDescription: certificateDescription || 'This is to certify that',
      //   signBelowText: signBelowText || 'has successfully completed the course',
      //   instructorSignature: signatures[0]?.image,
      //   deanSignature: signatures[1]?.image,
      //   courseLogo: courseLogoDataURL || undefined,
      //   creatorLogo: creatorLogoDataURL || undefined,
      //   applicationLogo: creatorLogo || undefined,
      //   applicationLogoEnabled: applicationLogoEnabled,
      //   sealImage: sealDataURL
      // };

      // downloadCertificate(selectedTemplate, certificateData);
    });
  };

  return (
    <LazyMotion features={domAnimation}>
      <Box sx={{ width: '100%' }}>
        <SafeMotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          key="certificate-header"
        >
        <Box sx={{
          background: 'linear-gradient(135deg, #FFD600 0%, #FF8C00 100%)',
          borderRadius: 4,
          p: 4,
          mb: 4,
          position: 'relative',
          overflow: 'hidden'
        }}>
          <Box sx={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
            borderRadius: '50%'
          }} />
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h3" fontWeight={800} color="white" gutterBottom>
                Achievement Recognition
              </Typography>
              <Typography variant="h6" color="rgba(255,255,255,0.8)" sx={{ mb: 2 }}>
                Design certificates that inspire and motivate learners
              </Typography>
              <Chip
                icon={<SchoolIcon />}
                label="Certificate Builder"
                sx={{
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  backdropFilter: 'blur(10px)'
                }}
              />
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <motion.div
                animate={{ rotate: certificateEnabled ? 360 : 0 }}
                transition={{ duration: 0.8 }}
                key="school-icon"
              >
                <SchoolIcon sx={{ fontSize: 80, color: 'white', opacity: 0.8 }} />
              </motion.div>
            </Box>
          </Stack>
        </Box>
      </SafeMotionDiv>

      <SafeMotionDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        key="certificate-content"
      >
        <Card sx={{
          background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(108, 99, 255, 0.1)',
          border: '1px solid rgba(108, 99, 255, 0.1)',
          mb: 4
        }}>
          <CardContent sx={{ p: 4 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
              <Box>
                <Typography variant="h4" fontWeight={700} color="#6C63FF" gutterBottom>
                  Certificate Configuration
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Enable and customize course completion certificates
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Switch
                  checked={certificateEnabled}
                  onChange={(e) => onCertificateEnabledChange(e.target.checked)}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#FFD600',
                      '&:hover': { backgroundColor: 'rgba(255, 214, 0, 0.08)' }
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: '#FFD600'
                    }
                  }}
                />
                <Typography variant="caption" color="text.secondary" display="block">
                  {certificateEnabled ? 'Active' : 'Inactive'}
                </Typography>
              </Box>
            </Stack>

            {certificateEnabled && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.5 }}
              >
                <Tabs
                  value={activeTab}
                  onChange={(e, newValue) => setActiveTab(newValue)}
                  variant="scrollable"
                  scrollButtons="auto"
                  sx={{
                    '& .MuiTab-root': {
                      textTransform: 'none',
                      fontWeight: 600,
                      minWidth: { xs: 'auto', sm: '120px' },
                      fontSize: { xs: '0.8rem', sm: '0.9rem' }
                    },
                    '& .Mui-selected': { color: '#6C63FF' },
                    '& .MuiTabs-indicator': { backgroundColor: '#6C63FF' }
                  }}
                >
                  <Tab label="Templates" icon={<PaletteIcon />} />
                  <Tab label="Certificate Editor" icon={<EditIcon />} />
                  <Tab label="Settings" icon={<SettingsIcon />} />
                </Tabs>

                <Box sx={{ mt: 3, overflow: 'visible' }}>
                  <AnimatePresence mode="wait">
                    {activeTab === 0 && (
                      <motion.div
                        key="templates"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Box sx={{
                          display: 'flex',
                          gap: { xs: 3, sm: 4, md: 6 },
                          minHeight: '600px',
                          flexDirection: { xs: 'column', md: 'row' },
                          mt: 2
                        }}>
                          <Box sx={{ flex: { xs: 'none', md: 1 } }}>
                            <Box sx={{ mb: 3 }}>
                              <Typography variant="h5" fontWeight={600} gutterBottom>
                                Choose Your Template
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Select from our professional certificate designs
                              </Typography>
                            </Box>
                            <Grid container spacing={3} sx={{ mb: 3 }}>
                              {templates.map((template, index) => (
                                <Grid item xs={12} sm={6} md={4} key={template.id} sx={{ mb: 2 }}>
                                  <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                  >
                                    <Paper
                                      onClick={() => onTemplateChange(template.id)}
                                      sx={{
                                        p: 3,
                                        borderRadius: 3,
                                        cursor: 'pointer',
                                        height: '100%',
                                        minHeight: 120,
                                        background: selectedTemplate === template.id
                                          ? `linear-gradient(145deg, ${template.color}15 0%, ${template.color}25 100%)`
                                          : 'linear-gradient(145deg, #ffffff 0%, #fafbff 100%)',
                                        border: selectedTemplate === template.id
                                          ? `2px solid ${template.color}`
                                          : '1px solid #e3e6f0',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                          border: `2px solid ${template.color}`,
                                          background: `linear-gradient(145deg, ${template.color}10 0%, ${template.color}20 100%)`,
                                          transform: 'translateY(-2px)',
                                          boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                                        }
                                      }}
                                    >
                                      <Stack spacing={2} alignItems="center" sx={{ width: '100%' }}>
                                        {/* Template Icon */}
                                        <Box sx={{
                                          width: 60,
                                          height: 60,
                                          borderRadius: '50%',
                                          background: `linear-gradient(135deg, ${template.color} 0%, ${template.color}80 100%)`,
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          color: 'white',
                                          fontSize: '24px',
                                          mb: 1
                                        }}>
                                          {template.preview}
                                        </Box>
                                        
                                        {/* Template Name */}
                                        <Typography
                                          variant="body2"
                                          fontWeight={600}
                                          color="text.primary"
                                          textAlign="center"
                                          sx={{ fontSize: '0.9rem', lineHeight: 1.2, mb: 1 }}
                                        >
                                          {template.name}
                                        </Typography>
                                        
                                        {/* Category Tag */}
                                        <Chip
                                          label={template.category}
                                          size="small"
                                          sx={{
                                            background: template.color,
                                            color: 'white',
                                            fontWeight: 600,
                                            fontSize: '0.6rem',
                                            height: '20px'
                                          }}
                                        />
                                      </Stack>
                                    </Paper>
                                  </motion.div>
                                </Grid>
                              ))}
                            </Grid>
                          </Box>
                          <Box sx={{ flex: { xs: 'none', md: 1 }, pl: { xs: 0, md: 3 }, mt: { xs: 3, md: 0 } }}>
                            <Box sx={{ mb: 3 }}>
                              <Typography variant="h5" fontWeight={600} gutterBottom>
                                Template Preview
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Preview your selected certificate design
                              </Typography>
                            </Box>
                            <Box sx={{
                              width: '100%',
                              height: '600px',
                              background: '#FFFFFF',
                              border: '2px solid #E5E7EB',
                              borderRadius: '8px',
                              overflow: 'hidden',
                              position: 'relative',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }}>
                              {(() => {
                                const template = templates.find(t => t.id === selectedTemplate);
                                if (!selectedTemplate || !template) {
                                  return (
                                    <Box sx={{
                                      width: '100%',
                                      height: '100%',
                                      display: 'flex',
                                      flexDirection: 'column',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      p: 4
                                    }}>
                                      <Box sx={{
                                        width: 120,
                                        height: 120,
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, #E5E7EB 0%, #D1D5DB 100%)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        mb: 3
                                      }}>
                                        <SchoolIcon sx={{ fontSize: 60, color: '#9CA3AF' }} />
                                      </Box>
                                      <Typography variant="h5" fontWeight={600} color="text.secondary" gutterBottom>
                                        Select a Template
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary" textAlign="center">
                                        Choose a certificate template from the left to see a detailed preview here
                                      </Typography>
                                    </Box>
                                  );
                                }
                                
                                const displayTitle = certificateTitle || "Certificate of Achievement";
                                const displayDescription = certificateDescription || "This is to certify that";
                                return (
                                  <Box sx={{
                                    width: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    p: 3
                                  }}>
                                    <Box sx={{
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center',
                                      mb: 3
                                    }}>
                                      <Typography variant="h4" fontWeight={700} color={template.color}>
                                        {template.name}
                                      </Typography>
                                      <Chip
                                        label={template.category}
                                        sx={{ background: template.color, color: 'white', fontWeight: 600 }}
                                      />
                                    </Box>
                                    <Box sx={{
                                      flex: 1,
                                      display: 'flex',
                                      justifyContent: 'center',
                                      alignItems: 'center',
                                      background: '#F8FAFC',
                                      borderRadius: '4px',
                                      p: 3
                                    }}>
                                                                          <Box 
                                      data-certificate-preview
                                      sx={{
                                        width: '85%',
                                        height: '85%',
                                        maxWidth: '500px',
                                        maxHeight: '400px',
                                        position: 'relative'
                                      }}
                                    >
                                      {renderCertificatePreview(template, displayTitle, displayDescription, 0.85, '400px')}
                                    </Box>
                                    </Box>
                                  </Box>
                                );
                              })()}
                            </Box>
                          </Box>
                        </Box>
                      </motion.div>
                    )}

                    {activeTab === 1 && (
                      <motion.div
                        key="certificate-editor"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Typography variant="h5" fontWeight={600} gutterBottom>
                          Certificate Editor
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                          Customize your certificate content, branding, and signatures all in one place
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', lg: 'row' } }}>
                          <Stack spacing={3} sx={{ flex: 1 }}>
                            <Paper sx={{ p: 3, borderRadius: 2 }}>
                              <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: '#6C63FF' }}>
                                📝 Content
                              </Typography>
                              <Stack spacing={2}>
                                <TextField
                                  label="Certificate Title"
                                  value={certificateTitle}
                                  onChange={(e) => onCertificateTitleChange(e.target.value)}
                                  fullWidth
                                  placeholder="e.g., Certificate of Completion"
                                  sx={{
                                    '& .MuiOutlinedInput-root': {
                                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#6C63FF' }
                                    }
                                  }}
                                />
                                <TextField
                                  label="Certificate Description"
                                  value={certificateDescription}
                                  onChange={(e) => onCertificateDescriptionChange(e.target.value)}
                                  fullWidth
                                  multiline
                                  rows={3}
                                  placeholder="e.g., This is to certify that [Name] has successfully completed the course..."
                                  sx={{
                                    '& .MuiOutlinedInput-root': {
                                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#6C63FF' }
                                    }
                                  }}
                                />
                                <TextField
                                  label="Sign Below"
                                  value={signBelowText}
                                  onChange={(e) => setSignBelowText(e.target.value)}
                                  fullWidth
                                  variant="outlined"
                                  placeholder="e.g., has successfully completed the course"
                                  sx={{
                                    '& .MuiOutlinedInput-root': {
                                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#6C63FF' }
                                    }
                                  }}
                                />
                                <Box sx={{
                                  border: '1px solid #E5E7EB',
                                  borderRadius: '4px',
                                  p: 2,
                                  backgroundColor: '#F9FAFB'
                                }}>
                                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                    Student Name
                                  </Typography>
                                  <Typography variant="body1" sx={{ color: '#6B7280', fontStyle: 'italic' }}>
                                    {studentName} (Dynamic - Will be populated from enrolled student data)
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                    This field will automatically populate with the enrolled student's name when they qualify for the certificate
                                  </Typography>
                                </Box>
                              </Stack>
                            </Paper>
                            <Paper sx={{ p: 3, borderRadius: 2 }}>
                              <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: '#6C63FF' }}>
                                🎨 Branding
                              </Typography>
                              <Stack spacing={2}>
                                <Box>
                                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                    Course Logo
                                  </Typography>
                                  <Box sx={{
                                    border: '2px dashed #E5E7EB',
                                    borderRadius: '8px',
                                    p: 3,
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    '&:hover': { borderColor: '#6C63FF', backgroundColor: '#F8FAFF' }
                                  }} onClick={() => document.getElementById('logo-upload')?.click()}>
                                    {logoFile ? (
                                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                                        <img
                                          src={URL.createObjectURL(logoFile)}
                                          alt="Course Logo"
                                          style={{
                                            width: '60px',
                                            height: '60px',
                                            objectFit: 'contain',
                                            borderRadius: '8px'
                                          }}
                                        />
                                        <Typography variant="body2" color="text.secondary">
                                          Logo uploaded successfully
                                        </Typography>
                                      </Box>
                                    ) : (
                                      <Box>
                                        <ImageIcon sx={{ fontSize: 40, color: '#9CA3AF', mb: 1 }} />
                                        <Typography variant="body2" color="text.secondary">
                                          Click to upload course logo
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                          PNG, JPG up to 10MB
                                        </Typography>
                                      </Box>
                                    )}
                                  </Box>
                                  <input
                                    id="logo-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoUpload}
                                    style={{ display: 'none' }}
                                  />
                                </Box>
                                <Box sx={{
                                  border: '1px solid #E5E7EB',
                                  borderRadius: '4px',
                                  p: 2,
                                  backgroundColor: '#F9FAFB'
                                }}>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                    <Typography variant="body2" color="text.secondary">
                                      Application Logo
                                    </Typography>
                                    <Switch
                                      checked={applicationLogoEnabled}
                                      onChange={(e) => onApplicationLogoEnabledChange(e.target.checked)}
                                      sx={{
                                        '& .MuiSwitch-switchBase.Mui-checked': {
                                          color: '#6C63FF',
                                          '&:hover': { backgroundColor: 'rgba(108, 99, 255, 0.08)' }
                                        },
                                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                          backgroundColor: '#6C63FF'
                                        }
                                      }}
                                    />
                                  </Box>
                                  <Typography variant="caption" color="text.secondary">
                                    Enable application logo in the top left corner of the certificate for brand marketing
                                  </Typography>
                                </Box>
                              </Stack>
                            </Paper>
                            <Paper sx={{ p: 3, borderRadius: 2 }}>
                              <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: '#6C63FF' }}>
                                🏢 Creator Logo
                              </Typography>
                              <Typography variant="body2" color="text.secondary" gutterBottom>
                                Upload your creator logo to display on the certificate
                              </Typography>
                              <Box sx={{ mt: 2 }}>
                                {creatorLogoFile ? (
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, border: '1px solid #e5e7eb', borderRadius: 2 }}>
                                    <img
                                      src={URL.createObjectURL(creatorLogoFile)}
                                      alt="Creator Logo"
                                      style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: '4px' }}
                                    />
                                    <Box sx={{ flex: 1 }}>
                                      <Typography variant="body2" fontWeight={500}>
                                        {creatorLogoFile.name}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        {(creatorLogoFile.size / 1024 / 1024).toFixed(2)} MB
                                      </Typography>
                                    </Box>
                                    <Button
                                      size="small"
                                      color="error"
                                      onClick={() => onCreatorLogoChange(null)}
                                    >
                                      Remove
                                    </Button>
                                  </Box>
                                ) : (
                                  <Box
                                    component="label"
                                    sx={{
                                      display: 'flex',
                                      flexDirection: 'column',
                                      alignItems: 'center',
                                      p: 4,
                                      border: '2px dashed #e5e7eb',
                                      borderRadius: 2,
                                      cursor: 'pointer',
                                      '&:hover': {
                                        borderColor: '#6C63FF',
                                        backgroundColor: '#f8f9ff'
                                      }
                                    }}
                                  >
                                    <input
                                      type="file"
                                      hidden
                                      accept="image/*"
                                      onChange={handleCreatorLogoUpload}
                                    />
                                    <UploadIcon sx={{ fontSize: 40, color: '#6b7280', mb: 2 }} />
                                    <Typography variant="body1" sx={{ mb: 1 }}>
                                      Upload Creator Logo
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      PNG, JPG up to 10MB
                                    </Typography>
                                  </Box>
                                )}
                              </Box>
                            </Paper>
                            <Paper sx={{ p: 3, borderRadius: 2 }}>
                              <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: '#6C63FF' }}>
                                ✍️ Signatures
                              </Typography>
                              <Stack spacing={2}>
                                <Box sx={{
                                  border: '2px solid #6C63FF',
                                  borderRadius: '8px',
                                  p: 2,
                                  backgroundColor: '#F0F4FF'
                                }}>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="body2" fontWeight={600} sx={{ color: '#6C63FF' }}>
                                      👨‍🏫 Course Instructor Signature
                                    </Typography>
                                    <Chip label="Required" size="small" sx={{ backgroundColor: '#6C63FF', color: 'white' }} />
                                  </Box>
                                  <Stack spacing={2}>
                                    <TextField
                                      label="Instructor Name"
                                      value={signatures[0]?.name || creatorName}
                                                                              onChange={(e) => {
                                          if (signatures[0]) {
                                            updateSignature(signatures[0].id, { name: e.target.value });
                                          } else {
                                            const instructorSignature: Signature = {
                                              id: `instructor-sig-${Date.now()}`,
                                              name: e.target.value,
                                              designation: 'Creator',
                                              type: 'upload',
                                              enabled: true,
                                              isDefault: true
                                            };
                                            onSignaturesChange([instructorSignature, ...signatures]);
                                          }
                                        }}
                                      fullWidth
                                      size="small"
                                      placeholder="e.g., Dr. John Smith"
                                    />
                                    <TextField
                                      label="Designation"
                                      value={signatures[0]?.designation || 'Creator'}
                                      onChange={(e) => {
                                        if (signatures[0]) {
                                          updateSignature(signatures[0].id, { designation: e.target.value });
                                        }
                                      }}
                                      fullWidth
                                      size="small"
                                      placeholder="e.g., Creator"
                                    />
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                      <Button
                                        variant={signatures[0]?.type === 'upload' ? 'contained' : 'outlined'}
                                        size="small"
                                        component="label"
                                        startIcon={<UploadIcon />}
                                        sx={{
                                          backgroundColor: signatures[0]?.type === 'upload' ? '#6C63FF' : 'transparent',
                                          color: signatures[0]?.type === 'upload' ? 'white' : '#6C63FF',
                                          '&:hover': {
                                            backgroundColor: signatures[0]?.type === 'upload' ? '#5A52D5' : 'rgba(108, 99, 255, 0.08)'
                                          }
                                        }}
                                      >
                                        <input
                                          type="file"
                                          hidden
                                          accept="image/*"
                                          onChange={(e) => handleSignatureUpload(signatures[0]?.id || `instructor-sig-${Date.now()}`, e)}
                                        />
                                        Upload
                                      </Button>
                                      <Button
                                        variant={signatures[0]?.type === 'draw' ? 'contained' : 'outlined'}
                                        size="small"
                                        onClick={() => {
                                          if (signatures[0]) {
                                            openDrawSignature(signatures[0]);
                                          }
                                        }}
                                        startIcon={<EditIcon />}
                                        sx={{
                                          backgroundColor: signatures[0]?.type === 'draw' ? '#6C63FF' : 'transparent',
                                          color: signatures[0]?.type === 'draw' ? 'white' : '#6C63FF',
                                          '&:hover': {
                                            backgroundColor: signatures[0]?.type === 'draw' ? '#5A52D5' : 'rgba(108, 99, 255, 0.08)'
                                          }
                                        }}
                                      >
                                        Draw
                                      </Button>
                                    </Box>
                                    {signatures[0]?.image && (
                                      <Box sx={{ mt: 1 }}>
                                        <img
                                          src={signatures[0].image}
                                          alt="Instructor Signature"
                                          style={{
                                            maxWidth: '100px',
                                            maxHeight: '40px',
                                            objectFit: 'contain',
                                            border: '1px solid #E5E7EB',
                                            borderRadius: '4px'
                                          }}
                                        />
                                      </Box>
                                    )}
                                  </Stack>
                                </Box>
                                <Box sx={{
                                  border: '1px solid #E5E7EB',
                                  borderRadius: '8px',
                                  p: 2,
                                  backgroundColor: '#F9FAFB',
                                  opacity: signatures[1]?.enabled ? 1 : 0.6
                                }}>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="body2" fontWeight={600}>
                                      👨‍💼 Academic Dean (CEO Signature)
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <Switch
                                        checked={signatures[1]?.enabled || false}
                                        onChange={(e) => {
                                          if (signatures[1]) {
                                            updateSignature(signatures[1].id, { enabled: e.target.checked });
                                          } else {
                                            const deanSignature: Signature = {
                                              id: `dean-sig-${Date.now()}`,
                                              name: 'Academic Dean',
                                              designation: 'CEO, Content Creator App',
                                              type: 'upload',
                                              enabled: e.target.checked,
                                              isDefault: true
                                            };
                                            onSignaturesChange([...signatures, deanSignature]);
                                          }
                                        }}
                                        size="small"
                                        sx={{
                                          '& .MuiSwitch-switchBase.Mui-checked': { color: '#6C63FF' },
                                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#6C63FF' }
                                        }}
                                      />
                                      <Typography variant="caption" color="text.secondary">
                                        {signatures[1]?.enabled ? 'Enabled' : 'Disabled'}
                                      </Typography>
                                    </Box>
                                  </Box>
                                  {signatures[1]?.enabled && (
                                    <Stack spacing={2}>
                                      <TextField
                                        label="Dean Name"
                                        value={signatures[1]?.name || 'Academic Dean'}
                                        onChange={(e) => {
                                          if (signatures[1]) {
                                            updateSignature(signatures[1].id, { name: e.target.value });
                                          }
                                        }}
                                        fullWidth
                                        size="small"
                                        placeholder="e.g., Academic Dean"
                                      />
                                      <TextField
                                        label="Designation"
                                        value={signatures[1]?.designation || 'CEO, Content Creator App'}
                                        onChange={(e) => {
                                          if (signatures[1]) {
                                            updateSignature(signatures[1].id, { designation: e.target.value });
                                          }
                                        }}
                                        fullWidth
                                        size="small"
                                        placeholder="e.g., CEO, Content Creator App"
                                      />
                                      <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Button
                                          variant={signatures[1]?.type === 'upload' ? 'contained' : 'outlined'}
                                          size="small"
                                          component="label"
                                          startIcon={<UploadIcon />}
                                          sx={{
                                            backgroundColor: signatures[1]?.type === 'upload' ? '#6C63FF' : 'transparent',
                                            color: signatures[1]?.type === 'upload' ? 'white' : '#6C63FF',
                                            '&:hover': {
                                              backgroundColor: signatures[1]?.type === 'upload' ? '#5A52D5' : 'rgba(108, 99, 255, 0.08)'
                                            }
                                          }}
                                        >
                                                                                  <input
                                          type="file"
                                          hidden
                                          accept="image/*"
                                          onChange={(e) => handleSignatureUpload(signatures[1]?.id || `dean-sig-${Date.now()}`, e)}
                                        />
                                          Upload
                                        </Button>
                                        <Button
                                          variant={signatures[1]?.type === 'draw' ? 'contained' : 'outlined'}
                                          size="small"
                                          onClick={() => {
                                            if (signatures[1]) {
                                              openDrawSignature(signatures[1]);
                                            }
                                          }}
                                          startIcon={<EditIcon />}
                                          sx={{
                                            backgroundColor: signatures[1]?.type === 'draw' ? '#6C63FF' : 'transparent',
                                            color: signatures[1]?.type === 'draw' ? 'white' : '#6C63FF',
                                            '&:hover': {
                                              backgroundColor: signatures[1]?.type === 'draw' ? '#5A52D5' : 'rgba(108, 99, 255, 0.08)'
                                            }
                                          }}
                                        >
                                          Draw
                                        </Button>
                                      </Box>
                                      {signatures[1]?.image && (
                                        <Box sx={{ mt: 1 }}>
                                          <img
                                            src={signatures[1].image}
                                            alt="Dean Signature"
                                            style={{
                                              maxWidth: '80px',
                                              maxHeight: '30px',
                                              objectFit: 'contain'
                                            }}
                                          />
                                        </Box>
                                      )}
                                    </Stack>
                                  )}
                                </Box>
                                {signatures.slice(2).map((signature, index) => (
                                  <Box key={signature.id} sx={{
                                    border: '1px solid #E5E7EB',
                                    borderRadius: '8px',
                                    p: 2,
                                    backgroundColor: '#F9FAFB'
                                  }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                      <Typography variant="body2" fontWeight={600}>
                                        Custom Signature {index + 1}
                                      </Typography>
                                      <IconButton
                                        size="small"
                                        onClick={() => removeSignature(signature.id)}
                                        sx={{ color: '#EF4444' }}
                                      >
                                        <DeleteIcon />
                                      </IconButton>
                                    </Box>
                                    <Stack spacing={2}>
                                      <TextField
                                        label="Name"
                                        value={signature.name}
                                        onChange={(e) => updateSignature(signature.id, { name: e.target.value })}
                                        fullWidth
                                        size="small"
                                        placeholder="e.g., Additional Signer"
                                      />
                                      <TextField
                                        label="Designation"
                                        value={signature.designation}
                                        onChange={(e) => updateSignature(signature.id, { designation: e.target.value })}
                                        fullWidth
                                        size="small"
                                        placeholder="e.g., Additional Role"
                                      />
                                      <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Button
                                          variant={signature.type === 'upload' ? 'contained' : 'outlined'}
                                          size="small"
                                          component="label"
                                          startIcon={<UploadIcon />}
                                          sx={{
                                            backgroundColor: signature.type === 'upload' ? '#6C63FF' : 'transparent',
                                            color: signature.type === 'upload' ? 'white' : '#6C63FF',
                                            '&:hover': {
                                              backgroundColor: signature.type === 'upload' ? '#5A52D5' : 'rgba(108, 99, 255, 0.08)'
                                            }
                                          }}
                                        >
                                          <input
                                            type="file"
                                            hidden
                                            accept="image/*"
                                            onChange={(e) => handleSignatureUpload(signature.id, e)}
                                          />
                                          Upload
                                        </Button>
                                        <Button
                                          variant={signature.type === 'draw' ? 'contained' : 'outlined'}
                                          size="small"
                                          onClick={() => openDrawSignature(signature)}
                                          startIcon={<EditIcon />}
                                          sx={{
                                            backgroundColor: signature.type === 'draw' ? '#6C63FF' : 'transparent',
                                            color: signature.type === 'draw' ? 'white' : '#6C63FF',
                                            '&:hover': {
                                              backgroundColor: signature.type === 'draw' ? '#5A52D5' : 'rgba(108, 99, 255, 0.08)'
                                            }
                                          }}
                                        >
                                          Draw
                                        </Button>
                                      </Box>
                                      {signature.image && (
                                        <Box sx={{ mt: 1 }}>
                                          <img
                                            src={signature.image}
                                            alt="Signature"
                                            style={{
                                              maxWidth: '80px',
                                              maxHeight: '30px',
                                              objectFit: 'contain'
                                            }}
                                          />
                                        </Box>
                                      )}
                                    </Stack>
                                  </Box>
                                ))}
                                <Button
                                  variant="outlined"
                                  onClick={addSignature}
                                  startIcon={<AddIcon />}
                                  sx={{
                                    borderColor: '#6C63FF',
                                    color: '#6C63FF',
                                    '&:hover': {
                                      borderColor: '#5A52D5',
                                      backgroundColor: 'rgba(108, 99, 255, 0.08)'
                                    }
                                  }}
                                >
                                  Add Custom Signature
                                </Button>
                              </Stack>
                            </Paper>
                          </Stack>
                          <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                              <Typography variant="h6" fontWeight={600}>
                                Certificate Preview
                              </Typography>
                              <Button
                                variant="contained"
                                startIcon={<DownloadIcon />}
                                onClick={handleDownloadCertificate}
                                size="small"
                                sx={{
                                  background: 'linear-gradient(135deg, #6C63FF 0%, #8B5CF6 100%)',
                                  color: 'white',
                                  px: 2,
                                  py: 1,
                                  borderRadius: 2,
                                  textTransform: 'none',
                                  fontWeight: 600,
                                  '&:hover': {
                                    background: 'linear-gradient(135deg, #5B52E6 0%, #7C4DF5 100%)',
                                    transform: 'translateY(-1px)',
                                    boxShadow: '0 4px 12px rgba(108, 99, 255, 0.3)'
                                  }
                                }}
                              >
                                Download
                              </Button>
                            </Box>
                            <Box sx={{
                              width: '100%',
                              height: '600px',
                              background: '#FFFFFF',
                              border: '2px solid #E5E7EB',
                              borderRadius: '8px',
                              overflow: 'hidden',
                              position: 'relative',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }}>
                              {(() => {
                                const template = templates.find(t => t.id === selectedTemplate);
                                if (!selectedTemplate || !template) return null;
                                const displayTitle = certificateTitle || "Certificate of Achievement";
                                const displayDescription = certificateDescription || "This is to certify that";
                                return (
                                  <Box sx={{
                                    width: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    p: 3
                                  }}>
                                    <Box 
                                      data-certificate-preview
                                      sx={{
                                        width: '85%',
                                        height: '85%',
                                        maxWidth: '500px',
                                        maxHeight: '400px',
                                        position: 'relative'
                                      }}
                                    >
                                      {renderCertificatePreview(template, displayTitle, displayDescription, 0.85, '400px')}
                                    </Box>
                                  </Box>
                                );
                              })()}
                            </Box>
                          </Box>
                        </Box>
                      </motion.div>
                    )}

                    {activeTab === 2 && (
                      <motion.div
                        key="settings"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Typography variant="h5" fontWeight={600} gutterBottom>
                          Certificate Settings
                        </Typography>
                        <Stack spacing={3}>
                          <Paper sx={{ p: 3, borderRadius: 3 }}>
                            <Typography variant="h6" fontWeight={600} gutterBottom>
                              <PercentIcon sx={{ mr: 1, verticalAlign: 'middle', color: '#00FFC6' }} />
                              Completion Requirements
                            </Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Minimum course completion percentage required to earn certificate
                            </Typography>
                            <Box sx={{ mt: 2 }}>
                              <Slider
                                value={completionPercentage}
                                onChange={(e, value) => onCompletionPercentageChange(value as number)}
                                min={50}
                                max={100}
                                step={5}
                                marks={[
                                  { value: 50, label: '50%' },
                                  { value: 75, label: '75%' },
                                  { value: 100, label: '100%' }
                                ]}
                                sx={{
                                  '& .MuiSlider-thumb': { backgroundColor: '#00FFC6' },
                                  '& .MuiSlider-track': { backgroundColor: '#00FFC6' },
                                  '& .MuiSlider-rail': { backgroundColor: '#e3e6f0' }
                                }}
                              />
                              <Typography variant="h4" fontWeight={700} color="#00FFC6" textAlign="center">
                                {completionPercentage}%
                              </Typography>
                            </Box>
                          </Paper>
                          
                          {/* Save Settings Button */}
                          <Stack direction="row" spacing={2} justifyContent="flex-end" mt={4}>
                            <Button
                              variant="outlined"
                              color="secondary"
                              onClick={() => {
                                // Save certificate settings
                                // This will automatically save since we're using controlled components
                              }}
                              sx={{
                                borderColor: '#6C63FF',
                                color: '#6C63FF',
                                '&:hover': {
                                  borderColor: '#5A52D5',
                                  backgroundColor: 'rgba(108, 99, 255, 0.08)'
                                }
                              }}
                            >
                              Save Settings
                            </Button>
                          </Stack>
                        </Stack>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Box>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </SafeMotionDiv>

      <Dialog
        open={drawSignatureOpen}
        onClose={() => setDrawSignatureOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={2}>
            <BrushIcon />
            <Typography variant="h6">Draw Signature</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <SignatureCanvas
            key={currentSignature?.id || 'default'}
            onSave={handleSaveSignature}
            onCancel={() => setDrawSignatureOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </Box>
      </LazyMotion>
  );
});

export default CertificateStep;