import React, { useState, Suspense, Component, ReactNode } from 'react';
import { Box, Container, Typography, Paper, Tooltip, Button, Stack, TextField, MenuItem, Chip, InputLabel, Select, FormControl, OutlinedInput, CircularProgress } from '@mui/material';
import { styled } from '@mui/system';
import { CheckCircle, RadioButtonUnchecked, ArrowForward, ArrowBack, Visibility as VisibilityIcon, Save as SaveIcon } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { courseService } from '../../services/courseService';
import { generateCertificateBlob, type CertificateData } from '../../utils/pdfCertificateGenerator';
import { compressDataUrlImage } from '../../utils/imageCompression';
import sealImageAsset from '../../assets/seal.png';
import CurriculumStep from './CurriculumStep';
// import DripContentStep from './DripContentStep';
// import CertificateStep from './CertificateStep';
import PreviewPublishStep from './PreviewPublishStep';
import { useToast } from '../../hooks/useToast';
import ToastNotification from '../common/ToastNotification';
import { DripMethod } from './DripContentStep';
import type { PaymentDetailsPayload, PaymentDetailsInitialData, PaymentDetailsStepRef } from './PaymentDetailsStep';
import type { AdditionalDetailsStepRef, AdditionalDetailsInitialData, AdditionalDetailsPayload } from './AdditionalDetailsStep';

// Lazy load heavy components
const DripContentStep = React.lazy(() => import('./DripContentStep'));
const CertificateStep = React.lazy(() => import('./CertificateStep'));
const PaymentDetailsStep = React.lazy(() => import('./PaymentDetailsStep'));
const AdditionalDetailsStep = React.lazy(() => import('./AdditionalDetailsStep'));

/** Load the seal image asset and return as data URL for PDF generation (so the actual seal shows instead of a fallback circle). */
function getSealDataUrl(): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve('');
          return;
        }
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } catch {
        resolve('');
      }
    };
    img.onerror = () => resolve('');
    img.src = typeof sealImageAsset === 'string' ? sealImageAsset : (sealImageAsset as { default?: string })?.default ?? '';
  });
}

const steps = [
  'Course Details',
  'Curriculum',
  'Drip Content',
  'Certificate',
  'Payment Details',
  'Additional Details',
  'Preview & Publish',
];

const GlassPanel = styled(Paper)(({ theme }) => ({
  background: 'rgba(255,255,255,0.15)',
  backdropFilter: 'blur(16px)',
  borderRadius: 24,
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.10)',
  border: '1px solid rgba(255,255,255,0.2)',
  padding: theme.spacing(4),
  marginTop: theme.spacing(4),
  minHeight: 220,
  position: 'relative',
}));

const StepperRail = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: '50%',
  right: 60,
  transform: 'translateY(-50%)',
  zIndex: 10,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(3),
  userSelect: 'none',
  // Remove any border or background that could look like a vertical line
  border: 'none',
  background: 'transparent',
}));

const StepOrb = styled(motion.div)<{ active: boolean; completed: boolean }>(
  ({ active, completed }) => ({
    width: active ? 64 : 36,
    height: active ? 64 : 36,
    borderRadius: '50%',
    background: active
      ? 'radial-gradient(circle, #00FFC6 0%, #6C63FF 100%)'
      : completed
      ? 'linear-gradient(135deg, #00FFC6 0%, #6C63FF 100%)'
      : 'rgba(255,255,255,0.12)',
    boxShadow: active
      ? '0 0 32px 12px #00FFC6, 0 2px 16px 0 #6C63FF44'
      : completed
      ? '0 0 12px 2px #00FFC6'
      : '0 2px 8px 0 #6C63FF22',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: active ? '#fff' : completed ? '#fff' : '#6C63FF',
    border: active ? '3px solid #00FFC6' : '2px solid #6C63FF',
    cursor: 'pointer',
    transition: 'all 0.25s cubic-bezier(.4,2,.6,1)',
    position: 'relative',
  })
);

const StepLabelBox = styled(Box)(({ theme }) => ({
  marginLeft: 64,
  marginBottom: theme.spacing(2),
  minHeight: 40,
  display: 'flex',
  alignItems: 'center',
}));

// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars -- theme required by styled API
const FloatingLabel = styled(motion.div)(({ theme }) => ({
  position: 'absolute',
  right: 80,
  top: '50%',
  transform: 'translateY(-50%)',
  background: '#fff',
  color: '#6C63FF',
  fontWeight: 700,
  fontSize: 18,
  borderRadius: 12,
  boxShadow: '0 2px 12px #00FFC633',
  padding: '6px 18px',
  pointerEvents: 'none',
  zIndex: 20,
}));



const categories = ['Business', 'Technology', 'Design', 'Marketing', 'Personal Development', 'Health', 'Other'];
const levels = ['Beginner', 'Intermediate', 'Advanced'];
const languages = ['English', 'Hindi', 'Spanish', 'French', 'German', 'Other'];
const visibilities = ['Public', 'Unlisted', 'Private'];
const allTags = ['AI', 'Web', 'Startup', 'Productivity', 'Coding', 'Art', 'Finance', 'Growth'];



// Add custom animated spinner component
// Error boundary component
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_error: any) {
    return { hasError: true };
  }

  componentDidCatch(_error: Error, _errorInfo: React.ErrorInfo) {
    // Error logged by ErrorBoundary for debugging
  }

  render() {
    if (this.state.hasError) {
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
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Something went wrong
            </Typography>
            <Button 
              variant="outlined" 
              onClick={() => window.location.reload()}
              sx={{ mt: 2 }}
            >
              Reload Page
            </Button>
          </Box>
        </Box>
      );
    }

    return this.props.children;
  }
}

const AnimatedSpinner = () => (
  <motion.div
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ scale: [0.8, 1.1, 1], rotate: [0, 360], opacity: 1, boxShadow: [
      '0 0 0px 0px #00FFC6',
      '0 0 32px 12px #00FFC6',
      '0 0 0px 0px #00FFC6',
    ] }}
    transition={{
      duration: 1.2,
      repeat: Infinity,
      repeatType: 'loop',
      ease: 'easeInOut',
      times: [0, 0.5, 1],
    }}
    style={{
      width: 90,
      height: 90,
      borderRadius: '50%',
      background: 'conic-gradient(from 90deg at 50% 50%, #6C63FF, #00FFC6, #00F5FF, #6C63FF)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 0 32px 12px #00FFC6',
      position: 'relative',
    }}
  >
    <motion.div
      animate={{
        scale: [1, 1.15, 1],
        opacity: [0.7, 1, 0.7],
        filter: [
          'blur(0px)',
          'blur(2px)',
          'blur(0px)'
        ]
      }}
      transition={{
        duration: 1.2,
        repeat: Infinity,
        repeatType: 'loop',
        ease: 'easeInOut',
        times: [0, 0.5, 1],
      }}
      style={{
        width: 60,
        height: 60,
        borderRadius: '50%',
        background: 'radial-gradient(circle, #fff 0%, #00FFC6 60%, transparent 100%)',
        position: 'absolute',
        top: 15,
        left: 15,
        zIndex: 1,
        opacity: 0.7,
      }}
    />
    <motion.div
      animate={{
        scale: [1, 1.08, 1],
        opacity: [1, 0.8, 1],
      }}
      transition={{
        duration: 1.2,
        repeat: Infinity,
        repeatType: 'loop',
        ease: 'easeInOut',
        times: [0, 0.5, 1],
      }}
      style={{
        width: 32,
        height: 32,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #6C63FF 0%, #00FFC6 100%)',
        boxShadow: '0 0 16px 4px #00FFC6',
        zIndex: 2,
      }}
    />
  </motion.div>
);

// Helper function to convert Date to datetime-local format (YYYY-MM-DDTHH:mm)
const formatDateForInput = (date: Date | string): string => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  // Get local date components
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const CourseBuilderPage: React.FC = React.memo(() => {
  const { courseId: urlCourseId } = useParams<{ courseId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeStep, setActiveStep] = React.useState(0);
  const [loadingStep, setLoadingStep] = React.useState(false);
  const [loadingCourse, setLoadingCourse] = React.useState(false);
  const [isSavingBeforeLeave, setIsSavingBeforeLeave] = React.useState(false);
  const hasUnsavedChanges = React.useRef(false);
  
  // Check if we're in preview-only mode (coming from course manager)
  const searchParams = React.useMemo(() => new URLSearchParams(location.search), [location.search]);
  const isPreviewMode = searchParams.get('step') === '6' && urlCourseId;



  // Course Details state
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [cover, setCover] = useState<string | null>(null);
  const [, setCoverFile] = useState<File | null>(null);
  const [category, setCategory] = useState('');
  const [level, setLevel] = useState('');
  const [language, setLanguage] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [visibility, setVisibility] = useState('Public');
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [saving, setSaving] = useState(false);
  const [savingPaymentSettings, setSavingPaymentSettings] = useState(false);

  // Curriculum state (Step 1)
  const [modules, setModules] = useState<Array<{
    id: string;
    title: string;
    description?: string;
    lessons: Array<{
      id: string;
      title: string;
      type: string;
      description?: string;
      duration?: number;
      order?: number;
      [key: string]: any;
    }>;
    [key: string]: any;
  }>>([]);

  // Drip Content state (Step 2) - Declared early for use in buildDraftPayload
  const [dripEnabled, setDripEnabled] = useState(false);
  const dripEnabledRef = React.useRef(dripEnabled);
  const [dripMethods, setDripMethods] = useState<DripMethod[]>([]);
  const [dripDisplayOption, setDripDisplayOption] = useState<'title' | 'titleAndLessons' | 'hide'>('titleAndLessons');
  const dripDisplayOptionRef = React.useRef(dripDisplayOption);
  const [dripHideUnlockDate, setDripHideUnlockDate] = useState(false);
  const dripHideUnlockDateRef = React.useRef(dripHideUnlockDate);
  const [dripSendCommunication, setDripSendCommunication] = useState(false);
  const dripSendCommunicationRef = React.useRef(dripSendCommunication);

  // Certificate state (Step 3) - declared early so buildDraftPayload can use it
  const [certificateEnabled, setCertificateEnabled] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('1');
  const [certificateTitle, setCertificateTitle] = useState('Certificate of Completion');
  const [certificateDescription, setCertificateDescription] = useState('This is to certify that [Name] has successfully completed the course');
  const [completionPercentage, setCompletionPercentage] = useState(100);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [certificateApplicationLogoUrl, setCertificateApplicationLogoUrl] = useState<string | null>(null);
  const [applicationLogoEnabled, setApplicationLogoEnabled] = useState(true);
  const [signatures, setSignatures] = useState<Array<{
    id: string;
    name: string;
    designation: string;
    type: 'upload' | 'draw';
    image?: string;
    enabled: boolean;
    isDefault?: boolean;
  }>>([]);
  const [creatorLogoFile, setCreatorLogoFile] = useState<File | null>(null);
  const [certificateCreatorLogoUrl, setCertificateCreatorLogoUrl] = useState<string | null>(null);
  const [templatePdfFile, setTemplatePdfFile] = useState<File | null>(null);
  const [certificateTemplatePdfUrl, setCertificateTemplatePdfUrl] = useState<string | null>(null);
  const [certificatePreviewKey, setCertificatePreviewKey] = useState<number>(0);

  // Payment Details (Step 4) - initial data for hydration when course loads; last-known for draft when not on step 4
  const [paymentDetailsInitialData, setPaymentDetailsInitialData] = useState<PaymentDetailsInitialData | null>(null);
  const [paymentDetailsForDraft, setPaymentDetailsForDraft] = useState<PaymentDetailsPayload | null>(null);
  const paymentDetailsStepRef = React.useRef<PaymentDetailsStepRef | null>(null);

  // Additional Details (Step 5) - same pattern as Step 4
  const [additionalDetailsInitialData, setAdditionalDetailsInitialData] = useState<AdditionalDetailsInitialData | null>(null);
  const [additionalDetailsForDraft, setAdditionalDetailsForDraft] = useState<AdditionalDetailsPayload | null>(null);
  const additionalDetailsStepRef = React.useRef<AdditionalDetailsStepRef | null>(null);
  const [savingAdditionalSettings, setSavingAdditionalSettings] = useState(false);

  // Update refs whenever state changes
  React.useEffect(() => {
    dripEnabledRef.current = dripEnabled;
  }, [dripEnabled]);

  React.useEffect(() => {
    dripDisplayOptionRef.current = dripDisplayOption;
  }, [dripDisplayOption]);

  React.useEffect(() => {
    dripHideUnlockDateRef.current = dripHideUnlockDate;
  }, [dripHideUnlockDate]);

  React.useEffect(() => {
    dripSendCommunicationRef.current = dripSendCommunication;
  }, [dripSendCommunication]);

  // Wrapper functions to handle drip content changes with immediate ref updates
  const handleDripEnabledChange = React.useCallback((enabled: boolean) => {
    setDripEnabled(enabled);
    dripEnabledRef.current = enabled; // Update ref immediately
  }, []);

  const handleDripDisplayOptionChange = React.useCallback((option: 'title' | 'titleAndLessons' | 'hide') => {
    setDripDisplayOption(option);
    dripDisplayOptionRef.current = option; // Update ref immediately
  }, []);

  const handleDripHideUnlockDateChange = React.useCallback((hide: boolean) => {
    setDripHideUnlockDate(hide);
    dripHideUnlockDateRef.current = hide; // Update ref immediately
  }, []);

  const handleDripSendCommunicationChange = React.useCallback((send: boolean) => {
    setDripSendCommunication(send);
    dripSendCommunicationRef.current = send; // Update ref immediately
  }, []);

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        if (activeStep < steps.length - 1) setActiveStep((s) => s + 1);
      } else if (e.key === 'ArrowLeft') {
        if (activeStep > 0) setActiveStep((s) => s - 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeStep]);

  // Cover image preview
  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCoverFile(e.target.files[0]);
      setCover(URL.createObjectURL(e.target.files[0]));
    }
  };

  // Validation
  const validate = () => {
    const newErrors: { [k: string]: string } = {};
    if (!title.trim()) newErrors.title = 'Course title is required.';
    if (!category) newErrors.category = 'Category is required.';
    if (!level) newErrors.level = 'Level is required.';
    if (!language) newErrors.language = 'Language is required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Auto-save functionality
  const [autoSaveEnabled] = React.useState(true);
  const [lastSaved, setLastSaved] = React.useState<Date | null>(null);



  // Course ID state for tracking draft
  const [courseId, setCourseId] = React.useState<string | null>(urlCourseId || null);
  
  // Toast notification
  const { toast, success, error, hideToast } = useToast();

  // Validation function to check if preview is possible
  const canPreview = React.useCallback((): boolean => {
    // Check if at least 1 module exists
    const hasModule = modules && modules.length > 0 && 
      modules.some(m => m.title && m.title.trim() !== '');
    
    // Check if at least 1 lesson exists
    const hasLesson = modules && modules.some(m => 
      m.lessons && m.lessons.length > 0 && 
      m.lessons.some(l => l.title && l.title.trim() !== '')
    );
    
    return hasModule && hasLesson;
  }, [modules]);

  // Handle preview button click
  const handlePreviewClick = React.useCallback(() => {
    if (canPreview()) {
      setActiveStep(6); // Navigate to Preview & Publish step
    } else {
      error('Please save at least one module with one lesson to preview the course.');
    }
  }, [canPreview, error]);

  // Load existing course data when editing
  React.useEffect(() => {
    const loadCourse = async () => {
      if (!urlCourseId) {
        // Check for step parameter in URL for new courses
        const searchParams = new URLSearchParams(location.search);
        const stepParam = searchParams.get('step');
        if (stepParam) {
          const stepIndex = parseInt(stepParam, 10);
          if (!isNaN(stepIndex) && stepIndex >= 0 && stepIndex < steps.length) {
            setActiveStep(stepIndex);
          }
        }
        return; // No course ID in URL, creating new course
      }
      
      setLoadingCourse(true);
      try {
        const response = await courseService.getCourse(urlCourseId);
        if (response.success && response.data) {
          const course = response.data;
          
          // Populate form fields with course data
          // If values are "NA", set to empty string so form shows no selection
          setTitle(course.name || '');
          setSubtitle(course.subtitle || '');
          setDescription(course.description || '');
          setCategory((course.category === 'NA' || !course.category) ? '' : course.category);
          setLevel((course.level === 'NA' || !course.level) ? '' : course.level);
          setLanguage((course.language === 'NA' || !course.language) ? '' : course.language);
          setTags(course.tags || []);
          setVisibility(course.visibility || 'Public');
          
          // Set cover image if available
          if (course.coverImage) {
            setCover(course.coverImage);
          }
          
          // Set courseId state - use formatted courseId if available, otherwise use MongoDB _id
          setCourseId(course.courseId || course.id);
          
          // Load drip content settings
          if (course.dripEnabled !== undefined) {
            setDripEnabled(course.dripEnabled);
          }
          if (course.dripMethods && Array.isArray(course.dripMethods)) {
            // Map backend dripMethods to frontend format
            const mappedDripMethods = course.dripMethods.map((dm: any) => ({
              id: dm.moduleId, // Use moduleId as id
              method: dm.method,
              action: dm.method === 'date' && dm.action
                ? new Date(dm.action).toISOString().slice(0, 16) // Convert to datetime-local format
                : dm.action // number for days, undefined for immediate
            }));
            setDripMethods(mappedDripMethods);
          }
          if (course.dripDisplayOption) {
            setDripDisplayOption(course.dripDisplayOption);
          }
          if (course.dripHideUnlockDate !== undefined) {
            setDripHideUnlockDate(course.dripHideUnlockDate);
          }
          if (course.dripSendCommunication !== undefined) {
            setDripSendCommunication(course.dripSendCommunication);
          }
          
          // Check for step parameter in URL and navigate to that step after course loads
          const searchParams = new URLSearchParams(location.search);
          const stepParam = searchParams.get('step');
          if (stepParam) {
            const stepIndex = parseInt(stepParam, 10);
            if (!isNaN(stepIndex) && stepIndex >= 0 && stepIndex < steps.length) {
              setActiveStep(stepIndex);
            }
          }
          
          // Set certificate settings if available
          if (course.certificateEnabled !== undefined) {
            setCertificateEnabled(course.certificateEnabled);
          }
          if (course.certificateTemplate) {
            setSelectedTemplate(course.certificateTemplate);
          }
          if (course.certificateTitle) {
            setCertificateTitle(course.certificateTitle);
          }
          if (course.certificateDescription) {
            setCertificateDescription(course.certificateDescription);
          }
          if (course.certificateCompletionPercentage !== undefined && course.certificateCompletionPercentage !== null) {
            setCompletionPercentage(course.certificateCompletionPercentage);
          }
          if (course.certificateApplicationLogoEnabled !== undefined) {
            setApplicationLogoEnabled(course.certificateApplicationLogoEnabled);
          }
          if (course.certificateApplicationLogo) {
            setCertificateApplicationLogoUrl(course.certificateApplicationLogo);
          }
          if (course.certificateSignatures && Array.isArray(course.certificateSignatures)) {
            setSignatures(course.certificateSignatures.map((sig: any, idx: number) => ({
              id: sig._id || `sig-${idx}`,
              name: sig.name || '',
              designation: sig.designation || '',
              type: (sig.type === 'draw' || sig.type === 'upload' ? sig.type : 'upload') as 'upload' | 'draw',
              image: sig.image,
              enabled: sig.enabled !== false,
              isDefault: sig.isDefault || false
            })));
          }
          if (course.certificateCreatorLogo) {
            setCertificateCreatorLogoUrl(course.certificateCreatorLogo);
          }
          if (course.certificateTemplatePdfUrl) {
            setCertificateTemplatePdfUrl(course.certificateTemplatePdfUrl);
          }

          // Payment Details (Step 4) - include enabledCurrencies so currency toggles persist
          const listedPrice = course.listedPrice || { INR: 0, USD: 0, EUR: 0, GBP: 0 };
          const sellingPrice = course.sellingPrice || { INR: 0, USD: 0, EUR: 0, GBP: 0 };
          const defaultEnabledCurrencies = { INR: true, USD: true, EUR: true, GBP: true };
          const enabledCurrencies = (course.enabledCurrencies && typeof course.enabledCurrencies === 'object')
            ? { ...defaultEnabledCurrencies, ...course.enabledCurrencies }
            : defaultEnabledCurrencies;
          setPaymentDetailsInitialData({
            listedPrice: { INR: listedPrice.INR ?? 0, USD: listedPrice.USD ?? 0, EUR: listedPrice.EUR ?? 0, GBP: listedPrice.GBP ?? 0 },
            sellingPrice: { INR: sellingPrice.INR ?? 0, USD: sellingPrice.USD ?? 0, EUR: sellingPrice.EUR ?? 0, GBP: sellingPrice.GBP ?? 0 },
            globalPricingEnabled: course.globalPricingEnabled !== false,
            currencySpecificPricingEnabled: !!course.currencySpecificPricingEnabled,
            enabledCurrencies,
            installmentsOn: !!course.installmentsOn,
            installmentPeriod: course.installmentPeriod ?? 30,
            numberOfInstallments: course.numberOfInstallments ?? 3,
            bufferTime: course.bufferTime ?? 7,
            paymentMethods: (course.paymentMethods && typeof course.paymentMethods === 'object') ? { ...course.paymentMethods } : {},
            requirePaymentBeforeAccess: course.requirePaymentBeforeAccess !== false,
            sendPaymentReceipts: course.sendPaymentReceipts !== false,
            enableAutomaticInvoicing: !!course.enableAutomaticInvoicing
          });
          setPaymentDetailsForDraft({
            listedPrice: { INR: listedPrice.INR ?? 0, USD: listedPrice.USD ?? 0, EUR: listedPrice.EUR ?? 0, GBP: listedPrice.GBP ?? 0 },
            sellingPrice: { INR: sellingPrice.INR ?? 0, USD: sellingPrice.USD ?? 0, EUR: sellingPrice.EUR ?? 0, GBP: sellingPrice.GBP ?? 0 },
            globalPricingEnabled: course.globalPricingEnabled !== false,
            currencySpecificPricingEnabled: !!course.currencySpecificPricingEnabled,
            enabledCurrencies,
            installmentsOn: !!course.installmentsOn,
            installmentPeriod: course.installmentPeriod ?? 30,
            numberOfInstallments: course.numberOfInstallments ?? 3,
            bufferTime: course.bufferTime ?? 7,
            paymentMethods: (course.paymentMethods && typeof course.paymentMethods === 'object') ? { ...course.paymentMethods } : {},
            requirePaymentBeforeAccess: course.requirePaymentBeforeAccess !== false,
            sendPaymentReceipts: course.sendPaymentReceipts !== false,
            enableAutomaticInvoicing: !!course.enableAutomaticInvoicing
          });

          // Additional Details (Step 5)
          const courseFaqs = course.faqs && Array.isArray(course.faqs) ? course.faqs : [];
          const additionalInitial: AdditionalDetailsInitialData = {
            faqs: courseFaqs,
            affiliateRewardEnabled: !!course.affiliateActive,
            affiliateRewardPercentage: course.affiliateRewardPercentage != null ? String(course.affiliateRewardPercentage) : '10',
            watermarkRemovalEnabled: !!course.watermarkRemovalEnabled
          };
          setAdditionalDetailsInitialData(additionalInitial);
          setAdditionalDetailsForDraft({
            faqs: courseFaqs,
            affiliateActive: !!course.affiliateActive,
            affiliateRewardPercentage: typeof course.affiliateRewardPercentage === 'number' ? course.affiliateRewardPercentage : 10,
            watermarkRemovalEnabled: !!course.watermarkRemovalEnabled
          });
          
          // Load modules/curriculum if available
          if (course.modules && Array.isArray(course.modules)) {
            // Map backend modules to frontend format
            const mappedModules = course.modules.map((module: any, index: number) => ({
              id: module._id || module.id || `module-${index}`,
              title: module.title || '',
              description: module.description || '',
              lessons: (module.lessons || []).map((lesson: any, lessonIndex: number) => {
                // Extract pre/post class messages from content
                const content = lesson.content || {};
                
                // Extract video and thumbnail from content for Video lessons
                let videos: any[] | undefined = undefined;
                if (lesson.type === 'Video' && content.videoUrl) {
                  videos = [{
                    video: {
                      url: content.videoUrl,
                      name: content.videoUrl.split('/').pop() || 'Video',
                      size: 0
                    },
                    thumbnail: content.thumbnailUrl ? {
                      url: content.thumbnailUrl,
                      name: content.thumbnailUrl.split('/').pop() || 'Thumbnail'
                    } : null
                  }];
                }
                
                // Extract audio from content for Audio lessons
                let audioFiles: any[] | undefined = undefined;
                if (lesson.type === 'Audio') {
                  if (content.audioFiles && Array.isArray(content.audioFiles) && content.audioFiles.length > 0) {
                    audioFiles = content.audioFiles.map((audio: any) => ({
                      url: audio.url,
                      name: audio.name || (audio.url ? audio.url.split('/').pop() : 'Audio') || 'Audio',
                      size: audio.size || 0,
                      storagePath: audio.storagePath || audio.path
                    }));
                  } else if (content.audioUrl) {
                    audioFiles = [{
                      url: content.audioUrl,
                      name: content.audioUrl.split('/').pop() || 'Audio',
                      size: 0
                    }];
                  }
                }
                
                return {
                  id: lesson._id || lesson.id || `lesson-${index}-${lessonIndex}`,
                  title: lesson.title || '',
                  type: lesson.type || 'Video',
                  // For Text lessons, use textContent from content as description
                  description: lesson.type === 'Text' && content.textContent 
                    ? content.textContent 
                    : lesson.description || '',
                  duration: lesson.duration || 0,
                  order: lesson.order !== undefined ? lesson.order : lessonIndex + 1,
                  content: content,
                  resources: lesson.resources || [],
                  isUnlocked: lesson.isUnlocked !== undefined ? lesson.isUnlocked : true,
                  unlockDate: lesson.unlockDate || null,
                  // Extract pre/post class messages from content for display
                  preClassMessage: content.preClassMessage || '',
                  postClassMessage: content.postClassMessage || '',
                  // Extract videos if it's a Video lesson
                  videos: videos,
                  // Extract audio files if it's an Audio lesson
                  audioFiles: audioFiles,
                  // Extract live fields if it's a Live lesson
                  liveFields: lesson.type === 'Live' ? {
                    startDateTime: content.startDateTime ? formatDateForInput(content.startDateTime) : '',
                    duration: content.startDateTime && content.endDateTime 
                      ? Math.round((new Date(content.endDateTime).getTime() - new Date(content.startDateTime).getTime()) / 60000).toString()
                      : '',
                    meetingLink: content.meetingPlatform || '',
                    customLink: content.meetingLink || '',
                    documents: []
                  } : undefined,
                  // Extract assignment fields if it's an Assignment lesson
                  assignmentFields: lesson.type === 'Assignment' && (content.instructions || content.submissionType) ? {
                    instructions: content.instructions || '',
                    submissionType: (content.submissionType || 'both') as 'text' | 'file' | 'both',
                    maxFileSize: content.maxFileSize || 10,
                    allowedFileTypes: content.allowedFileTypes || []
                  } : undefined,
                  // Extract quiz questions if it's a Quiz lesson
                  quizQuestions: lesson.type === 'Quiz' && content.questions && Array.isArray(content.questions) && content.questions.length > 0
                    ? content.questions.map((q: any, qIdx: number) => {
                        // Determine question type: if correctAnswer is array, it's multiple choice
                        const isMultipleChoice = Array.isArray(q.correctAnswer);
                        const questionType = q.type === 'multiple-choice' 
                          ? (isMultipleChoice ? 'multiple' : 'single')
                          : q.type;
                        
                        return {
                          id: `q-${qIdx + 1}`,
                          question: q.question || '',
                          type: questionType,
                          options: (q.options || []).map((opt: string, optIdx: number) => ({
                            id: `opt-${optIdx + 1}`,
                            text: opt,
                            isCorrect: Array.isArray(q.correctAnswer) 
                              ? q.correctAnswer.includes(opt)
                              : q.correctAnswer === opt
                          })),
                          points: q.points || 10,
                          explanation: q.explanation || undefined
                        };
                      })
                    : undefined
                };
              })
            }));
            setModules(mappedModules);
          }
          
          success('Course loaded successfully!');
        } else {
          error(response.message || 'Failed to load course');
        }
      } catch {
        error('Failed to load course. Please try again.');
      } finally {
        setLoadingCourse(false);
      }
    };

    loadCourse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlCourseId]); // Only run when urlCourseId changes

  type ResourceType = 'document' | 'image' | 'video' | 'audio' | 'archive' | 'other';

  const getResourceType = React.useCallback((fileName: string): ResourceType => {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';

    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext)) {
      return 'image';
    }
    if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'].includes(ext)) {
      return 'video';
    }
    if (['mp3', 'wav', 'ogg', 'aac', 'm4a', 'flac', 'wma'].includes(ext)) {
      return 'audio';
    }
    if (['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf', 'odt', 'ods', 'odp'].includes(ext)) {
      return 'document';
    }
    if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(ext)) {
      return 'archive';
    }
    return 'other';
  }, []);

  const buildDraftPayload = React.useCallback((overridePayment?: PaymentDetailsPayload | null, overrideAdditional?: AdditionalDetailsPayload | null) => {
    const preparedModules = modules && modules.length > 0
      ? modules
          .filter(module => module.title && module.title.trim() !== '')
          .map((module, moduleIndex) => ({
            title: module.title,
            description: module.description || '',
            order: module.order !== undefined ? module.order : moduleIndex + 1,
            lessons: (module.lessons || [])
              .filter(lesson => lesson.title && lesson.title.trim() !== '')
              .map((lesson, lessonIndex) => {
                const lessonData: any = lesson;
                const content: any = { ...(lesson.content || {}) };

                if (lessonData.preClassMessage) {
                  content.preClassMessage = lessonData.preClassMessage;
                }
                if (lessonData.postClassMessage) {
                  content.postClassMessage = lessonData.postClassMessage;
                }

                if (lesson.type === 'Video' && lessonData.videos && lessonData.videos.length > 0) {
                  const firstVideo = lessonData.videos[0];
                  if (firstVideo.video?.url) {
                    content.videoUrl = firstVideo.video.url;
                  }
                  if (firstVideo.thumbnail?.url) {
                    content.thumbnailUrl = firstVideo.thumbnail.url;
                  }
                }

                if (lesson.type === 'Text') {
                  if (lessonData.description && lessonData.description.trim() !== '') {
                    content.textContent = lessonData.description;
                  }
                }

                if (lesson.type === 'Assignment' && lessonData.assignmentFields) {
                  const assignmentFields = lessonData.assignmentFields;
                  if (assignmentFields.instructions) {
                    content.instructions = assignmentFields.instructions;
                  }
                  if (assignmentFields.submissionType) {
                    content.submissionType = assignmentFields.submissionType;
                  }
                  if (assignmentFields.maxFileSize !== undefined && assignmentFields.maxFileSize !== null) {
                    content.maxFileSize = parseInt(assignmentFields.maxFileSize.toString(), 10) || 10;
                  }
                  if (assignmentFields.allowedFileTypes && Array.isArray(assignmentFields.allowedFileTypes)) {
                    content.allowedFileTypes = assignmentFields.allowedFileTypes.filter((t: string) => t && t.trim() !== '');
                  }
                }

                if (lesson.type === 'Audio' && lessonData.audioFiles && lessonData.audioFiles.length > 0) {
                  const mappedAudioFiles = lessonData.audioFiles
                    .filter((audio: any) => audio && audio.url)
                    .map((audio: any) => ({
                      url: audio.url,
                      name: audio.name || (audio.url?.split('/').pop() || 'Audio'),
                      size: audio.size || 0,
                      storagePath: audio.storagePath || audio.path
                    }));

                  if (mappedAudioFiles.length > 0) {
                    content.audioFiles = mappedAudioFiles;
                    content.audioUrl = mappedAudioFiles[0].url;
                  }
                }

                if (lesson.type === 'Live' && lessonData.liveFields) {
                  content.meetingLink = lessonData.liveFields.customLink || '';
                  content.meetingPlatform = lessonData.liveFields.meetingLink || 'Custom Link';
                  if (lessonData.liveFields.startDateTime) {
                    content.startDateTime = new Date(lessonData.liveFields.startDateTime);
                  }
                  if (lessonData.liveFields.duration) {
                    const duration = parseInt(lessonData.liveFields.duration, 10) || 0;
                    if (content.startDateTime) {
                      content.endDateTime = new Date(new Date(content.startDateTime).getTime() + duration * 60000);
                    }
                  }
                }

                if (lesson.type === 'Quiz' && lessonData.quizQuestions && Array.isArray(lessonData.quizQuestions) && lessonData.quizQuestions.length > 0) {
                  content.questions = lessonData.quizQuestions
                    .filter((q: any) => q && q.question && q.question.trim() !== '')
                    .map((q: any) => {
                      const options = q.options?.filter((opt: any) => opt && opt.text && opt.text.trim() !== '') || [];
                      const optionTexts = options.map((opt: any) => opt.text.trim());

                      let correctAnswer: string | string[] = '';
                      if (q.type === 'single') {
                        const correctOption = options.find((opt: any) => opt.isCorrect);
                        correctAnswer = correctOption ? correctOption.text.trim() : (optionTexts[0] || '');
                      } else if (q.type === 'multiple') {
                        correctAnswer = options
                          .filter((opt: any) => opt.isCorrect)
                          .map((opt: any) => opt.text.trim());
                        if ((correctAnswer as string[]).length === 0 && optionTexts.length > 0) {
                          correctAnswer = [optionTexts[0]];
                        }
                      }

                      return {
                        question: q.question.trim(),
                        type: q.type === 'single' ? 'multiple-choice' : q.type === 'multiple' ? 'multiple-choice' : 'text',
                        options: optionTexts,
                        correctAnswer,
                        points: q.points || 10,
                        explanation: q.explanation ? q.explanation.trim() : undefined
                      };
                    });

                  if (lessonData.timeLimit) {
                    content.timeLimit = parseInt(lessonData.timeLimit, 10) || 30;
                  }
                  if (lessonData.passingScore) {
                    content.passingScore = parseInt(lessonData.passingScore, 10) || 70;
                  }
                }

                return {
                  title: lesson.title,
                  description: lesson.description || '',
                  type: lesson.type || 'Video',
                  duration: lesson.duration || 0,
                  order: lesson.order !== undefined ? lesson.order : lessonIndex + 1,
                  isUnlocked: lesson.isUnlocked !== undefined ? lesson.isUnlocked : true,
                  content,
                  resources: (lesson.resources || []).map((resource: any) => ({
                    name: resource.name || resource.originalName || 'Untitled',
                    type: resource.type || getResourceType(resource.name || resource.originalName || ''),
                    url: resource.url || resource.path || '',
                    size: resource.size || 0,
                    downloadCount: resource.downloadCount || 0
                  }))
                };
              })
          }))
      : [];

    return {
      name: title || 'Untitled course',
      subtitle: subtitle || '',
      description: description || (title ? `Course: ${title}` : 'Course description will be added later'),
      category: category || 'NA',
      level: (level || 'NA') as 'Beginner' | 'Intermediate' | 'Advanced' | 'NA',
      language: language || 'NA',
      tags: tags || [],
      visibility: (visibility || 'Public') as 'Public' | 'Unlisted' | 'Private',
      coverImage: cover || null,
      modules: preparedModules,
      // Drip Content - Use ref to ensure we get the latest value
      dripEnabled: (() => {
        const currentValue = dripEnabledRef.current;
        return currentValue || false;
      })(),
      dripMethods: dripEnabledRef.current && dripMethods.length > 0 ? dripMethods.map(method => ({
        moduleId: method.id,
        method: method.method,
        action: method.method === 'date' && method.action 
          ? new Date(method.action as string).toISOString()
          : method.action, // number for days, undefined for immediate
        unlockDate: method.method === 'date' && method.action
          ? new Date(method.action as string)
          : undefined
      })) : [],
      dripDisplayOption: (() => {
        const currentValue = dripDisplayOptionRef.current;
        return currentValue || 'titleAndLessons';
      })(),
      dripHideUnlockDate: (() => {
        const currentValue = dripHideUnlockDateRef.current;
        return currentValue || false;
      })(),
      dripSendCommunication: (() => {
        const currentValue = dripSendCommunicationRef.current;
        return currentValue || false;
      })(),
      // Step 3: Certificate
      certificateEnabled: certificateEnabled ?? false,
      certificateTemplate: selectedTemplate || '1',
      certificateTitle: certificateTitle || 'Certificate of Completion',
      certificateDescription: certificateDescription || 'This is to certify that [Name] has successfully completed the course',
      certificateCompletionPercentage: completionPercentage ?? 100,
      certificateApplicationLogoEnabled: applicationLogoEnabled ?? true,
      certificateApplicationLogo: certificateApplicationLogoUrl || undefined,
      certificateSignatures: (signatures || []).map((sig) => ({
        name: sig.name || '',
        designation: sig.designation || '',
        type: sig.type || 'upload',
        image: sig.image || undefined,
        enabled: sig.enabled !== false,
        isDefault: sig.isDefault || false
      })),
      certificateCreatorLogo: certificateCreatorLogoUrl || undefined,
      status: 'Draft' as const,
      // Step 4: Payment Details
      ...(overridePayment ?? paymentDetailsForDraft ? {
        listedPrice: (overridePayment ?? paymentDetailsForDraft)!.listedPrice,
        sellingPrice: (overridePayment ?? paymentDetailsForDraft)!.sellingPrice,
        globalPricingEnabled: (overridePayment ?? paymentDetailsForDraft)!.globalPricingEnabled,
        currencySpecificPricingEnabled: (overridePayment ?? paymentDetailsForDraft)!.currencySpecificPricingEnabled,
        enabledCurrencies: (overridePayment ?? paymentDetailsForDraft)!.enabledCurrencies,
        installmentsOn: (overridePayment ?? paymentDetailsForDraft)!.installmentsOn,
        installmentPeriod: (overridePayment ?? paymentDetailsForDraft)!.installmentPeriod,
        numberOfInstallments: (overridePayment ?? paymentDetailsForDraft)!.numberOfInstallments,
        bufferTime: (overridePayment ?? paymentDetailsForDraft)!.bufferTime,
        paymentMethods: (overridePayment ?? paymentDetailsForDraft)!.paymentMethods,
        requirePaymentBeforeAccess: (overridePayment ?? paymentDetailsForDraft)!.requirePaymentBeforeAccess,
        sendPaymentReceipts: (overridePayment ?? paymentDetailsForDraft)!.sendPaymentReceipts,
        enableAutomaticInvoicing: (overridePayment ?? paymentDetailsForDraft)!.enableAutomaticInvoicing
      } : {}),
      // Step 5: Additional Details (always send explicit values so backend persists affiliate/watermark)
      ...(overrideAdditional ?? additionalDetailsForDraft
        ? {
            faqs: (overrideAdditional ?? additionalDetailsForDraft)!.faqs,
            affiliateActive: Boolean((overrideAdditional ?? additionalDetailsForDraft)!.affiliateActive),
            affiliateRewardPercentage: Number((overrideAdditional ?? additionalDetailsForDraft)!.affiliateRewardPercentage) || 0,
            watermarkRemovalEnabled: Boolean((overrideAdditional ?? additionalDetailsForDraft)!.watermarkRemovalEnabled)
          }
        : {}
      )
    };
  }, [modules, title, subtitle, description, category, level, language, tags, visibility, cover, getResourceType, dripMethods, certificateEnabled, selectedTemplate, certificateTitle, certificateDescription, completionPercentage, applicationLogoEnabled, signatures, certificateCreatorLogoUrl, certificateApplicationLogoUrl, paymentDetailsForDraft, additionalDetailsForDraft]);

  const logDraftSummary = React.useCallback((_mode: 'manual' | 'auto', _payload: any) => {
    // Optional: log draft summary in development only
  }, []);

  // Save draft function (reusable for auto-save and before navigation)
  const saveDraftBeforeLeave = React.useCallback(async (silent: boolean = false): Promise<boolean> => {
    const hasModules = modules && modules.length > 0 && modules.some(m => m.title && m.title.trim() !== '');
    const hasLessons = modules && modules.some(m => m.lessons && m.lessons.length > 0);
    if (!title && !subtitle && !description && !category && !hasModules && !hasLessons) {
      return true;
    }

    try {
      if (!silent) {
        setIsSavingBeforeLeave(true);
      }

      const paymentFromStep = paymentDetailsStepRef.current?.getPaymentDetails?.();
      if (paymentFromStep) setPaymentDetailsForDraft(paymentFromStep);
      const additionalFromStep = additionalDetailsStepRef.current?.getAdditionalDetails?.();
      if (additionalFromStep) setAdditionalDetailsForDraft(additionalFromStep);
      const draftData = buildDraftPayload(paymentFromStep ?? undefined, additionalFromStep ?? undefined);
      logDraftSummary('auto', draftData);

      const result = await courseService.saveDraft(courseId, draftData as any);

      if (result.success && result.data) {
        if (!courseId && result.data._id) {
          // Use formatted courseId if available, otherwise use MongoDB _id
          setCourseId(result.data.courseId || result.data._id);
        } else if (courseId && result.data.courseId && result.data.courseId !== courseId) {
          // Update courseId if it was just generated
          setCourseId(result.data.courseId);
        }
        setLastSaved(new Date());
        hasUnsavedChanges.current = false;
        if (!silent) {
          success('Draft saved successfully!');
        }
        return true;
      }

      if (!silent) {
        error(result.message || 'Failed to save draft');
      }
      return false;
    } catch {
      if (!silent) {
        error('Failed to save draft before leaving');
      }
      return false;
    } finally {
      if (!silent) {
        setIsSavingBeforeLeave(false);
      }
    }
  }, [modules, title, subtitle, description, category, buildDraftPayload, logDraftSummary, courseId, setLastSaved, success, error]);

  // Auto-save function
  const handleAutoSave = async () => {
    // Only auto-save if there's at least a title, or modules/lessons
    const hasModules = modules && modules.length > 0 && modules.some(m => m.title && m.title.trim() !== '');
    const hasLessons = modules && modules.some(m => m.lessons && m.lessons.length > 0);
    if (title || subtitle || description || category || hasModules || hasLessons) {
      await saveDraftBeforeLeave(true);
    }
  };

  // Save payment settings only (pushes payment data to backend/collections)
  const handleSavePaymentSettings = React.useCallback(async () => {
    const paymentFromStep = paymentDetailsStepRef.current?.getPaymentDetails?.();
    if (!paymentFromStep) {
      error('Unable to read payment settings. Please try again.');
      return;
    }
    setPaymentDetailsForDraft(paymentFromStep);
    const additionalFromStep = additionalDetailsStepRef.current?.getAdditionalDetails?.();
    const draftData = buildDraftPayload(paymentFromStep, additionalFromStep ?? undefined);
    setSavingPaymentSettings(true);
    try {
      const result = await courseService.saveDraft(courseId, draftData as any);
      if (result.success) {
        if (result.data && (result.data.courseId || result.data._id) && !courseId) {
          setCourseId(result.data.courseId || result.data._id);
        }
        setLastSaved(new Date());
        hasUnsavedChanges.current = false;
        setPaymentDetailsInitialData({ ...paymentFromStep });
        success('Payment settings saved successfully!');
      } else {
        error(result.message || 'Failed to save payment settings');
      }
    } catch {
      error('Failed to save payment settings');
    } finally {
      setSavingPaymentSettings(false);
    }
  }, [buildDraftPayload, courseId, success, error]);

  const handleSaveAdditionalSettings = React.useCallback(async () => {
    const additionalFromStep = additionalDetailsStepRef.current?.getAdditionalDetails?.();
    if (!additionalFromStep) {
      error('Unable to read additional details. Please try again.');
      return;
    }
    setAdditionalDetailsForDraft(additionalFromStep);
    const paymentFromStep = paymentDetailsStepRef.current?.getPaymentDetails?.();
    const draftData = buildDraftPayload(paymentFromStep ?? undefined, additionalFromStep);
    setSavingAdditionalSettings(true);
    try {
      const result = await courseService.saveDraft(courseId, draftData as any);
      if (result.success) {
        if (result.data && (result.data.courseId || result.data._id) && !courseId) {
          setCourseId(result.data.courseId || result.data._id);
        }
        setLastSaved(new Date());
        hasUnsavedChanges.current = false;
        setAdditionalDetailsInitialData({
          faqs: additionalFromStep.faqs,
          affiliateRewardEnabled: additionalFromStep.affiliateActive,
          affiliateRewardPercentage: String(additionalFromStep.affiliateRewardPercentage),
          watermarkRemovalEnabled: additionalFromStep.watermarkRemovalEnabled
        });
        success('Additional settings saved successfully!');
      } else {
        error(result.message || 'Failed to save additional settings');
      }
    } catch {
      error('Failed to save additional settings');
    } finally {
      setSavingAdditionalSettings(false);
    }
  }, [buildDraftPayload, courseId, success, error]);

  // Save as draft function. Returns true if save succeeded (for use before publish).
  const handleSaveDraft = async (): Promise<boolean> => {
    if (saving) {
      return false;
    }

    setSaving(true);
    try {
      const paymentFromStep = paymentDetailsStepRef.current?.getPaymentDetails?.();
      if (paymentFromStep) setPaymentDetailsForDraft(paymentFromStep);
      const additionalFromStep = additionalDetailsStepRef.current?.getAdditionalDetails?.();
      if (additionalFromStep) setAdditionalDetailsForDraft(additionalFromStep);
      const draftData = buildDraftPayload(paymentFromStep ?? undefined, additionalFromStep ?? undefined);
      logDraftSummary('manual', draftData);

      const result = await courseService.saveDraft(courseId, draftData as any);

      if (result.success) {
        if (result.data && result.data._id && !courseId) {
          // Use formatted courseId if available, otherwise use MongoDB _id
          setCourseId(result.data.courseId || result.data._id);
        } else if (courseId && result.data && result.data.courseId && result.data.courseId !== courseId) {
          // Update courseId if it was just generated
          setCourseId(result.data.courseId);
        }
        setLastSaved(new Date());
        hasUnsavedChanges.current = false;
        // Keep payment initial data in sync so returning to step 4 shows saved payment
        if (paymentFromStep) {
          setPaymentDetailsInitialData({ ...paymentFromStep });
        }
        success('Draft saved successfully!');
        return true;
      } else {
        error(result.message || 'Failed to save draft');
        return false;
      }
    } catch {
      error('Failed to save draft');
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Publish: save draft first (so Step 5 data like affiliate is persisted) then publish
  const handlePublish = React.useCallback(async () => {
    const saved = await handleSaveDraft();
    if (!saved) throw new Error('Draft save failed');
    const id = courseId;
    if (!id) {
      error('Course ID missing. Save draft first.');
      throw new Error('Course ID missing');
    }
    const result = await courseService.publishCourse(id, 'Live & Selling');
    if (!result.success) {
      error(result.message || 'Failed to publish course');
      throw new Error(result.message || 'Failed to publish course');
    }
    // Success toast and dialog are shown by PreviewPublishStep
  }, [courseId, error]);

  // Map Certificate step template id (1-6) to PDF generator template id (1-4)
  const pdfTemplateId = React.useMemo(() => {
    const id = selectedTemplate || '1';
    if (id === '1' || id === '2') return id;
    if (id === '3') return '4'; // Minimal Elegance -> Minimalist Clean
    if (id === '4') return '3'; // Premium Gold
    return '2'; // 5, 6 -> Modern Corporate
  }, [selectedTemplate]);

  // Build certificate data from current config (templates + editor + settings) for PDF generation
  const buildCertificateDataForTemplate = React.useCallback((): CertificateData => {
    const instructor = signatures?.[0];
    const dean = signatures?.[1];
    return {
      studentName: 'Student Name',
      courseName: title || 'Course Name',
      completionDate: new Date().toISOString().split('T')[0],
      certificateNumber: `TEMPLATE-${Date.now()}`,
      instructorName: instructor?.name || 'Instructor',
      organizationName: dean?.enabled ? dean.name : undefined,
      certificateDescription: certificateDescription || 'This is to certify that [Name] has successfully completed the course',
      signBelowText: 'has successfully completed the course',
      instructorSignature: instructor?.enabled && instructor?.image ? instructor.image : undefined,
      deanSignature: dean?.enabled && dean?.image ? dean.image : undefined,
      applicationLogo: applicationLogoEnabled ? certificateApplicationLogoUrl ?? undefined : undefined,
      applicationLogoEnabled: applicationLogoEnabled ?? true,
      courseLogo: certificateApplicationLogoUrl ?? undefined,
      creatorLogo: certificateCreatorLogoUrl ?? undefined
    };
  }, [title, certificateDescription, applicationLogoEnabled, certificateApplicationLogoUrl, certificateCreatorLogoUrl, signatures]);

  // Save certificate settings: generate PDF from config (templates + editor + settings) and upload, or upload custom PDF if user selected one. No local file required for the main flow.
  const handleSaveCertificateSettings = React.useCallback(async () => {
    if (!courseId) {
      error('Save draft first to get a course ID, then you can save certificate settings.');
      return;
    }
    try {
      if (templatePdfFile) {
        const result = await courseService.uploadCertificateTemplate(courseId, templatePdfFile);
        if (result.success && result.certificateTemplatePdfUrl) {
          setCertificateTemplatePdfUrl(result.certificateTemplatePdfUrl);
          setTemplatePdfFile(null);
          setCertificatePreviewKey((k) => k + 1);
          success('Custom certificate template saved.');
        } else {
          error(result.message || 'Failed to upload certificate template.');
          return;
        }
      } else {
        // Generate PDF from current config (Templates + Editor + Settings) and upload
        let applicationLogoUrl = certificateApplicationLogoUrl;
        if (logoFile && !applicationLogoUrl) {
          applicationLogoUrl = await new Promise<string | null>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(logoFile);
          });
        }
        let creatorLogoUrl = certificateCreatorLogoUrl;
        if (creatorLogoFile && !creatorLogoUrl) {
          creatorLogoUrl = await new Promise<string | null>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(creatorLogoFile);
          });
        }
        const baseData = buildCertificateDataForTemplate();
        // Load seal image so PDF shows actual seal/badge instead of fallback circle
        const sealDataUrl = await getSealDataUrl();
        // Compress logos only; leave signatures uncompressed (PNG) so they don't render as black bars
        const [compressedApp, compressedCourse, compressedCreator] = await Promise.all([
          applicationLogoEnabled && applicationLogoUrl && applicationLogoUrl.startsWith('data:')
            ? compressDataUrlImage(applicationLogoUrl)
            : Promise.resolve(undefined),
          applicationLogoUrl?.startsWith('data:') ? compressDataUrlImage(applicationLogoUrl) : Promise.resolve(undefined),
          creatorLogoUrl?.startsWith('data:') ? compressDataUrlImage(creatorLogoUrl) : Promise.resolve(undefined)
        ]);
        const data: CertificateData = {
          ...baseData,
          applicationLogo: applicationLogoEnabled && (compressedApp ?? applicationLogoUrl) ? (compressedApp ?? applicationLogoUrl) : undefined,
          courseLogo: compressedCourse ?? applicationLogoUrl ?? undefined,
          creatorLogo: compressedCreator ?? creatorLogoUrl ?? undefined,
          sealImage: sealDataUrl || undefined
          // instructorSignature and deanSignature left as-is from baseData (PNG, no compression)
        };
        const blob = generateCertificateBlob(pdfTemplateId, data);
        const file = new File([blob], 'certificate-template.pdf', { type: 'application/pdf' });
        const result = await courseService.uploadCertificateTemplate(courseId, file);
        if (result.success && result.certificateTemplatePdfUrl) {
          setCertificateTemplatePdfUrl(result.certificateTemplatePdfUrl);
          setCertificatePreviewKey((k) => k + 1);
          success('Certificate generated from your design and saved.');
        } else {
          error(result.message || 'Failed to save certificate template.');
          return;
        }
      }
    } catch (err) {
      error('Failed to generate or save certificate. Please try again.');
      return;
    }
    await saveDraftBeforeLeave(false);
  }, [courseId, templatePdfFile, pdfTemplateId, buildCertificateDataForTemplate, applicationLogoEnabled, certificateApplicationLogoUrl, certificateCreatorLogoUrl, logoFile, creatorLogoFile, success, error, saveDraftBeforeLeave]);

  // When user selects a new application/course logo file, store both File and data URL (for draft payload)
  const handleLogoChange = React.useCallback((file: File | null) => {
    setLogoFile(file);
    if (!file) {
      setCertificateApplicationLogoUrl(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setCertificateApplicationLogoUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  // When user selects a new creator logo file, store both File and data URL (for draft payload)
  const handleCreatorLogoChange = React.useCallback((file: File | null) => {
    setCreatorLogoFile(file);
    if (!file) {
      setCertificateCreatorLogoUrl(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setCertificateCreatorLogoUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  // Course data state for auto-save
  const courseData = React.useMemo(() => ({
    // Step 0: Course Details
    title,
    subtitle,
    description,
    category,
    level,
    language,
    tags,
    visibility,
    cover,
    
    // Step 1: Curriculum
    modules,
    
    // Step 3: Certificate
    certificateEnabled,
    selectedTemplate,
    certificateTitle,
    certificateDescription,
    completionPercentage,
    applicationLogoEnabled,
    signatures,
    creatorLogoFile,
    
    // Step 4: Payment Details (will be added by PaymentDetailsStep)
    // Step 5: Additional Details (will be added by AdditionalDetailsStep)
    // Step 6: Preview & Publish (will be added by PreviewPublishStep)
  }), [
    title, subtitle, description, category, level, language, tags, visibility, cover,
    modules,
    certificateEnabled, selectedTemplate, certificateTitle, certificateDescription, 
    completionPercentage, applicationLogoEnabled, signatures, creatorLogoFile
  ]);

  // Sync drip methods with modules
  React.useEffect(() => {
    if (!dripEnabled || !modules || modules.length === 0) {
      // If drip is disabled or no modules, clear drip methods
      if (dripMethods.length > 0) {
        setDripMethods([]);
      }
      return;
    }

    const moduleIds = modules.map(m => m.id);
    const currentDripMethodIds = dripMethods.map(dm => dm.id);

    // Add drip methods for new modules
    const newModules = modules.filter(m => !currentDripMethodIds.includes(m.id));
    if (newModules.length > 0) {
      setDripMethods(prevMethods => {
        const newDripMethods = newModules.map((module) => {
          const moduleIndex = modules.indexOf(module);
          return {
            id: module.id,
            method: (moduleIndex === 0 ? 'immediate' : 'days') as 'immediate' | 'days' | 'date',
            action: moduleIndex === 0 ? undefined : 7
          };
        });
        return [...prevMethods, ...newDripMethods];
      });
    }

    // Remove drip methods for deleted modules
    const removedDripMethods = dripMethods.filter(dm => !moduleIds.includes(dm.id));
    if (removedDripMethods.length > 0) {
      setDripMethods(prevMethods => prevMethods.filter(dm => moduleIds.includes(dm.id)));
    }
  // Only depend on modules and dripEnabled, not dripMethods to avoid infinite loop
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modules, dripEnabled]);

  // Track unsaved changes
  React.useEffect(() => {
    if (title || subtitle || description || category || (modules && modules.length > 0)) {
      hasUnsavedChanges.current = true;
    }
  }, [title, subtitle, description, category, level, language, tags, visibility, cover, modules, dripEnabled, dripMethods, dripDisplayOption, dripHideUnlockDate, dripSendCommunication]);

  // Auto-save every 10 seconds
  React.useEffect(() => {
    if (!autoSaveEnabled) return;
    
    const autoSaveInterval = setInterval(() => {
      handleAutoSave();
    }, 10000); // 10 seconds
    
    return () => clearInterval(autoSaveInterval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSaveEnabled, courseData]);

  // Save draft before page unload (browser navigation)
  React.useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges.current) {
        // Save synchronously if possible, or show warning
        e.preventDefault();
        e.returnValue = ''; // Chrome requires returnValue to be set
        // Try to save (this will be async, but we at least attempt it)
        saveDraftBeforeLeave(true);
        return ''; // For older browsers
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [saveDraftBeforeLeave]);

  // Save draft before component unmounts (React Router navigation)
  React.useEffect(() => {
    return () => {
      // Save draft when component is about to unmount
      if (hasUnsavedChanges.current) {
        // Use sendBeacon or synchronous save if possible
        saveDraftBeforeLeave(true).catch(() => {});
      }
    };
  }, [saveDraftBeforeLeave]);

  // Listen for navigation events from Sidebar and save before navigating
  React.useEffect(() => {
    const handleSaveBeforeNavigation = () => {
      // Only save if there are actual changes (at least a title)
      if (title || subtitle || description || category) {
        setIsSavingBeforeLeave(true);
        saveDraftBeforeLeave(true)
          .then((success) => {
            if (success) {
              return new Promise<boolean>(resolve => setTimeout(() => resolve(true), 500));
            }
            return false;
          })
          .catch(() => false)
          .finally(() => {
            setIsSavingBeforeLeave(false);
          });
      }
    };

    window.addEventListener('saveDraftBeforeNavigation', handleSaveBeforeNavigation);
    return () => {
      window.removeEventListener('saveDraftBeforeNavigation', handleSaveBeforeNavigation);
    };
  }, [saveDraftBeforeLeave, title, subtitle, description, category]);

  // Stepper click handler with loading simulation (capture step 5 data when leaving)
  const handleStepClick = (idx: number) => {
    if (activeStep === idx) return;
    if (activeStep === 5) {
      const additional = additionalDetailsStepRef.current?.getAdditionalDetails?.();
      if (additional) setAdditionalDetailsForDraft(additional);
    }
    setLoadingStep(true);
    setTimeout(() => {
      setActiveStep(idx);
      setLoadingStep(false);
    }, 100); // Reduced to 100ms for faster loading
  };

  // Preload adjacent steps for faster navigation
  React.useEffect(() => {
    const preloadAdjacentSteps = () => {
      // Preload current step + next step for smoother navigation
      const stepsToPreload = [activeStep, activeStep + 1].filter(
        step => step >= 0 && step < steps.length
      );
      
      // Preload heavy components for current and next steps
      if (stepsToPreload.includes(2)) {
        import('./DripContentStep').catch(() => {});
      }
      if (stepsToPreload.includes(3)) {
        import('./CertificateStep').catch(() => {});
      }
      if (stepsToPreload.includes(4)) {
        import('./PaymentDetailsStep').catch(() => {});
      }
      if (stepsToPreload.includes(5)) {
        import('./AdditionalDetailsStep').catch(() => {});
      }
    };

    // Preload immediately for faster loading
    preloadAdjacentSteps();
  }, [activeStep]);

  // Aggressive preloading: Preload Certificate step when on Drip Content step
  React.useEffect(() => {
    if (activeStep === 2) {
      import('./CertificateStep').catch(() => {});
    }
  }, [activeStep]);

  // If in preview mode, render only the PreviewPublishStep
  if (isPreviewMode && activeStep === 6) {
    // Show loading while course is being loaded
    if (loadingCourse || !courseId) {
      return (
        <Box sx={{ minHeight: '100vh', width: '100%', p: 0, m: 0, overflow: 'hidden', bgcolor: '#f8f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <AnimatedSpinner />
        </Box>
      );
    }
    
    return (
      <Box sx={{ minHeight: '100vh', width: '100%', p: 0, m: 0, overflow: 'hidden', bgcolor: '#f8f9ff' }}>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/love/learnloop')}
            sx={{ mb: 2 }}
          >
            Back to Course Management
          </Button>
          <PreviewPublishStep 
            courseId={courseId}
            onSaveDraft={handleSaveDraft}
            onPublish={handlePublish}
            courseData={{
              title,
              subtitle,
              description,
              category,
              level,
              language,
              tags,
              visibility,
              coverImage: cover,
              modules: modules,
              dripEnabled,
              dripMethods,
              dripDisplayOption,
              dripHideUnlockDate,
              dripSendCommunication
            }}
          />
        </Container>
        <ToastNotification toast={toast} onClose={hideToast} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', width: '100%', p: 0, m: 0, overflow: 'hidden' }}>
      {(loadingStep || loadingCourse) && (
        <Box sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100vh',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(255,255,255,0.18)',
          backdropFilter: 'blur(2px)',
        }}>
          <AnimatedSpinner />
        </Box>
      )}
      {isSavingBeforeLeave && (
        <Box sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100vh',
          zIndex: 2001,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(255,255,255,0.9)',
          backdropFilter: 'blur(4px)',
        }}>
          <CircularProgress size={60} sx={{ mb: 2, color: '#6C63FF' }} />
          <Typography variant="h6" color="text.primary" sx={{ fontWeight: 600 }}>
            Saving your draft...
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Please wait while we save your progress
          </Typography>
        </Box>
      )}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeStep}
          initial={{ opacity: 0, x: 80 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -80 }}
          transition={{ duration: 0.6, ease: [0.4, 0.2, 0.6, 1] }}
          style={{ 
            minHeight: '100vh', 
            width: '100%', 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            background: '#ffffff', 
            zIndex: 0, 
            overflow: 'hidden',
            maxWidth: '100%'
          }}
        >
          <Container maxWidth="lg" sx={{ 
            py: 6, 
            position: 'relative', 
            minHeight: '100vh', 
            overflow: 'hidden',
            maxWidth: '100%',
            width: '100%'
          }}>
            <StepperRail>
              {steps.map((label, idx) => (
                <React.Fragment key={label}>
                  <Tooltip title={label} placement="right" arrow>
                    <StepOrb
                      active={activeStep === idx}
                      completed={idx < activeStep}
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleStepClick(idx)}
                      tabIndex={0}
                      aria-label={label}
                      style={{ pointerEvents: loadingStep ? 'none' : 'auto', opacity: loadingStep ? 0.5 : 1 }}
                    >
                      {idx < activeStep ? (
                        <CheckCircle fontSize="large" />
                      ) : (
                        <RadioButtonUnchecked fontSize={activeStep === idx ? 'large' : 'medium'} />
                      )}
                      {activeStep === idx && (
                        <motion.div
                          layoutId="active-glow"
                          animate={{
                            boxShadow: [
                              '0 0 32px 12px #00FFC6, 0 2px 16px 0 #6C63FF44',
                              '0 0 48px 18px #00FFC6, 0 2px 16px 0 #6C63FF44',
                              '0 0 32px 12px #00FFC6, 0 2px 16px 0 #6C63FF44',
                            ],
                          }}
                          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                          style={{
                            position: 'absolute',
                            top: -18,
                            left: -18,
                            width: 100,
                            height: 100,
                            borderRadius: '50%',
                            background:
                              'radial-gradient(circle, #00FFC6 0%, #6C63FF 60%, transparent 100%)',
                            opacity: 0.18,
                            zIndex: 0,
                          }}
                        />
                      )}
                      {activeStep === idx && (
                        <FloatingLabel
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.4 }}
                        >
                          {label}
                        </FloatingLabel>
                      )}
                    </StepOrb>
                  </Tooltip>
                </React.Fragment>
              ))}
            </StepperRail>
            <StepLabelBox>
              <Typography
                variant="h4"
                fontWeight={700}
                color="#6C63FF"
                mb={2}
                sx={{
                  textShadow: '0 2px 16px #00FFC644',
                  letterSpacing: 1,
                  fontSize: { xs: 24, md: 32 },
                }}
              >
                {steps[activeStep]}
                {courseId && title && (
                  <Box component="span" sx={{ ml: 2, fontSize: { xs: 18, md: 24 }, fontWeight: 600, color: '#334155' }}>
                    - {courseId} - {title}
                  </Box>
                )}
              </Typography>
            </StepLabelBox>
            <GlassPanel sx={{ width: '100%', minHeight: 220, position: 'relative', boxSizing: 'border-box', marginTop: 0, overflow: 'hidden' }}>
              <Box sx={{ 
                mb: 2, 
                p: 2, 
                bgcolor: 'rgba(108, 99, 255, 0.1)', 
                borderRadius: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <Typography variant="body2" color="text.secondary">
                  Current Step: {activeStep} - {steps[activeStep]}
                  {courseId && title && (
                    <Box component="span" sx={{ ml: 1, fontWeight: 600, color: '#334155' }}>
                      - {courseId} - {title}
                    </Box>
                  )}
                </Typography>
                
                {/* Preview Button - Show on Step 0 and Step 1 */}
                {(activeStep === 0 || activeStep === 1) && (
                  <Tooltip 
                    title={canPreview() 
                      ? "Preview your course" 
                      : "Save at least one module with one lesson to preview"
                    }
                    arrow
                  >
                    <span>
                      <Button
                        variant="outlined"
                        startIcon={<VisibilityIcon />}
                        onClick={handlePreviewClick}
                        disabled={!canPreview()}
                        sx={{
                          borderColor: canPreview() ? '#6C63FF' : 'rgba(255,255,255,0.3)',
                          color: canPreview() ? '#6C63FF' : 'rgba(255,255,255,0.5)',
                          '&:hover': {
                            borderColor: canPreview() ? '#00FFC6' : 'rgba(255,255,255,0.3)',
                            bgcolor: canPreview() ? 'rgba(0, 255, 198, 0.1)' : 'transparent',
                          }
                        }}
                      >
                        Preview
                      </Button>
                    </span>
                  </Tooltip>
                )}
              </Box>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -40 }}
                  transition={{ duration: 0.5 }}
                  style={{ overflow: 'hidden' }}
                >
                  {activeStep === 0 ? (
                    <Box component="form" noValidate autoComplete="off" sx={{ width: '100%' }}>
                      <Stack spacing={3}>
                        <TextField
                          label="Course Title"
                          value={title}
                          onChange={e => setTitle(e.target.value)}
                          required
                          error={!!errors.title}
                          helperText={errors.title}
                          fullWidth
                        />
                        <TextField
                          label="Subtitle"
                          value={subtitle}
                          onChange={e => setSubtitle(e.target.value)}
                          fullWidth
                        />
                        <TextField
                          label="Description"
                          value={description}
                          onChange={e => setDescription(e.target.value)}
                          multiline
                          minRows={3}
                          fullWidth
                        />
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="center">
                          <Box>
                            <Button variant="outlined" component="label">
                              Upload Cover Image
                              <input type="file" accept="image/*" hidden onChange={handleCoverChange} />
                            </Button>
                            {cover && (
                              <Box mt={1}>
                                <img src={cover} alt="cover preview" style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 8, boxShadow: '0 2px 8px #00FFC622' }} />
                              </Box>
                            )}
                          </Box>
                          <FormControl sx={{ minWidth: 180 }} error={!!errors.category}>
                            <InputLabel>Category *</InputLabel>
                            <Select
                              value={category}
                              onChange={e => setCategory(e.target.value)}
                              label="Category *"
                              required
                            >
                              {categories.map(cat => (
                                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                              ))}
                            </Select>
                            {errors.category && <Typography color="error" variant="caption">{errors.category}</Typography>}
                          </FormControl>
                          <FormControl sx={{ minWidth: 160 }} error={!!errors.level}>
                            <InputLabel>Level *</InputLabel>
                            <Select
                              value={level}
                              onChange={e => setLevel(e.target.value)}
                              label="Level *"
                              required
                            >
                              {levels.map(lvl => (
                                <MenuItem key={lvl} value={lvl}>{lvl}</MenuItem>
                              ))}
                            </Select>
                            {errors.level && <Typography color="error" variant="caption">{errors.level}</Typography>}
                          </FormControl>
                          <FormControl sx={{ minWidth: 160 }} error={!!errors.language}>
                            <InputLabel>Language *</InputLabel>
                            <Select
                              value={language}
                              onChange={e => setLanguage(e.target.value)}
                              label="Language *"
                              required
                            >
                              {languages.map(lang => (
                                <MenuItem key={lang} value={lang}>{lang}</MenuItem>
                              ))}
                            </Select>
                            {errors.language && <Typography color="error" variant="caption">{errors.language}</Typography>}
                          </FormControl>
                        </Stack>
                        <FormControl fullWidth>
                          <InputLabel>Tags</InputLabel>
                          <Select
                            multiple
                            value={tags}
                            onChange={e => setTags(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value as string[])}
                            input={<OutlinedInput label="Tags" />}
                            renderValue={(selected) => (
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {(selected as string[]).map((value) => (
                                  <Chip key={value} label={value} />
                                ))}
                              </Box>
                            )}
                          >
                            {allTags.map(tag => (
                              <MenuItem key={tag} value={tag}>{tag}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <FormControl sx={{ minWidth: 180 }}>
                          <InputLabel>Visibility</InputLabel>
                          <Select
                            value={visibility}
                            onChange={e => setVisibility(e.target.value)}
                            label="Visibility"
                          >
                            {visibilities.map(vis => (
                              <MenuItem key={vis} value={vis}>{vis}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Stack>
                    </Box>
                  ) : activeStep === 1 ? (
                    <CurriculumStep modules={modules} setModules={setModules} courseId={courseId} />
                  ) : activeStep === 2 ? (
                    <Suspense fallback={<CircularProgress />}>
                      <DripContentStep
                        dripEnabled={dripEnabled}
                        onDripEnabledChange={handleDripEnabledChange}
                        dripMethods={dripMethods}
                        onDripMethodsChange={setDripMethods}
                        displayOption={dripDisplayOption}
                        onDisplayOptionChange={handleDripDisplayOptionChange}
                        hideUnlockDate={dripHideUnlockDate}
                        onHideUnlockDateChange={handleDripHideUnlockDateChange}
                        sendCommunication={dripSendCommunication}
                        onSendCommunicationChange={handleDripSendCommunicationChange}
                        modules={modules}
                      />
                    </Suspense>
                  ) : activeStep === 3 ? (
                    <Suspense fallback={
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        minHeight: '400px',
                        background: 'linear-gradient(145deg, #f8f9ff 0%, #ffffff 100%)',
                        borderRadius: 2,
                        p: 4
                      }}>
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <CircularProgress size={50} sx={{ mb: 2, color: '#6C63FF' }} />
                          <Typography variant="h6" color="#6C63FF" gutterBottom fontWeight={600}>
                            Loading Certificate Builder
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Preparing certificate templates and settings...
                          </Typography>
                        </motion.div>
                      </Box>
                    }>
                    <ErrorBoundary>
                    <CertificateStep
                      certificateEnabled={certificateEnabled}
                      onCertificateEnabledChange={setCertificateEnabled}
                      selectedTemplate={selectedTemplate}
                      onTemplateChange={setSelectedTemplate}
                      certificateTitle={certificateTitle}
                      onCertificateTitleChange={setCertificateTitle}
                      certificateDescription={certificateDescription}
                      onCertificateDescriptionChange={setCertificateDescription}
                      completionPercentage={completionPercentage}
                      onCompletionPercentageChange={setCompletionPercentage}
                      logoFile={logoFile}
                      applicationLogoUrl={certificateApplicationLogoUrl}
                      onLogoChange={handleLogoChange}
                      applicationLogoEnabled={applicationLogoEnabled}
                      onApplicationLogoEnabledChange={setApplicationLogoEnabled}
                      signatures={signatures}
                      onSignaturesChange={setSignatures}
                      creatorLogoFile={creatorLogoFile}
                      creatorLogoUrl={certificateCreatorLogoUrl}
                      onCreatorLogoChange={handleCreatorLogoChange}
                      courseId={courseId}
                      templatePdfFile={templatePdfFile}
                      onTemplatePdfFileChange={setTemplatePdfFile}
                      certificateTemplatePdfUrl={certificateTemplatePdfUrl}
                      certificatePreviewKey={certificatePreviewKey}
                      onSaveSettings={handleSaveCertificateSettings}
                    />
                    </ErrorBoundary>
                    </Suspense>
                  ) : activeStep === 4 ? (
                    <Suspense fallback={<CircularProgress />}>
                    <PaymentDetailsStep
                      initialData={paymentDetailsInitialData}
                      paymentDetailsRef={paymentDetailsStepRef}
                    />
                    </Suspense>
                  ) : activeStep === 5 ? (
                    <Suspense fallback={<CircularProgress />}>
                      <AdditionalDetailsStep
                        lastSaved={lastSaved}
                        initialData={additionalDetailsInitialData}
                        additionalDetailsRef={additionalDetailsStepRef}
                      />
                    </Suspense>
                  ) : activeStep === 6 ? (
                    <PreviewPublishStep 
                        courseId={courseId}
                        onSaveDraft={handleSaveDraft}
                        onPublish={handlePublish}
                        courseData={{
                          title,
                          subtitle,
                          description,
                          category,
                          level,
                          language,
                          tags,
                          visibility,
                          coverImage: cover,
                          modules: modules,
                          dripEnabled,
                          dripMethods,
                          dripDisplayOption,
                          dripHideUnlockDate,
                          dripSendCommunication
                        }}
                      />
                  ) : (
                    <Typography variant="body1" color="text.secondary">
                      [Futuristic {steps[activeStep]} UI coming soon...]
                    </Typography>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Auto-save indicator */}
              {lastSaved && (
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  mt: 2,
                  p: 1,
                  bgcolor: 'rgba(76, 175, 80, 0.1)',
                  borderRadius: 1,
                  border: '1px solid rgba(76, 175, 80, 0.2)'
                }}>
                  <Typography variant="caption" color="success.main">
                    💾 Last saved: {lastSaved.toLocaleTimeString()}
                  </Typography>
                </Box>
              )}

              <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center" mt={4}>
                {/* Left side - Back button */}
                <Button
                  variant="outlined"
                  color="secondary"
                  startIcon={<ArrowBack />}
                  disabled={activeStep === 0}
                  onClick={() => setActiveStep((s) => Math.max(0, s - 1))}
                  sx={{ minWidth: 120 }}
                >
                  Back
                </Button>

                {/* Center - Save Draft and Save Payment Settings (step 4 only) */}
                <Stack direction="row" spacing={2} alignItems="center">
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={handleSaveDraft}
                    disabled={saving}
                    sx={{ 
                      minWidth: 120,
                      borderColor: '#6C63FF',
                      color: '#6C63FF',
                      '&:hover': {
                        borderColor: '#5A52D5',
                        backgroundColor: 'rgba(108, 99, 255, 0.08)'
                      }
                    }}
                  >
                    {saving ? 'Saving...' : 'Save Draft'}
                  </Button>
                  {activeStep === 4 && (
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={savingPaymentSettings ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
                      onClick={handleSavePaymentSettings}
                      disabled={savingPaymentSettings}
                      sx={{ minWidth: 160, boxShadow: '0 2px 12px #00FFC633' }}
                    >
                      {savingPaymentSettings ? 'Saving...' : 'Save Payment Settings'}
                    </Button>
                  )}
                  {activeStep === 5 && (
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={savingAdditionalSettings ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
                      onClick={handleSaveAdditionalSettings}
                      disabled={savingAdditionalSettings}
                      sx={{ minWidth: 180, boxShadow: '0 2px 12px #00FFC633' }}
                    >
                      {savingAdditionalSettings ? 'Saving...' : 'Save Additional Settings'}
                    </Button>
                  )}
                </Stack>

                {/* Right side - Next button */}
                <Button
                  variant="contained"
                  color="primary"
                  endIcon={<ArrowForward />}
                  disabled={activeStep === steps.length - 1}
                  onClick={() => {
                    if (activeStep === 0) {
                      if (validate()) {
                        setActiveStep((s) => Math.min(steps.length - 1, s + 1));
                      }
                    } else {
                      if (activeStep === 5) {
                        const additional = additionalDetailsStepRef.current?.getAdditionalDetails?.();
                        if (additional) setAdditionalDetailsForDraft(additional);
                      }
                      setActiveStep((s) => Math.min(steps.length - 1, s + 1));
                    }
                  }}
                  sx={{ minWidth: 120, boxShadow: '0 2px 12px #00FFC633' }}
                >
                  Next
                </Button>
              </Stack>
            </GlassPanel>
          </Container>
        </motion.div>
      </AnimatePresence>

      {/* Toast Notification */}
      <ToastNotification toast={toast} onClose={hideToast} />
    </Box>
  );
});

export default CourseBuilderPage; 