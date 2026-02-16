import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  LinearProgress,
  Alert,
  CircularProgress,
  Breadcrumbs,
  Link,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Radio,
  RadioGroup,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  PlayArrow as PlayIcon,
  Star as StarIcon,
  AccessTime as TimeIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  CheckCircle as CheckIcon,
  Share as ShareIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  CardMembership as CertificateIcon,
  Download as DownloadIcon,
  ExpandMore as ExpandMoreIcon,
  QuestionAnswer as QuestionAnswerIcon,
  ContentCopy as ContentCopyIcon,
  MonetizationOn as MonetizationOnIcon,
  WaterDrop as WaterDropIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Course } from '../types/course';
import { courseService } from '../services/courseService';
import { progressService } from '../services/progressService';
import { useAuth } from '../context/AuthContext';
import CurriculumAccordion from '../components/learning/CurriculumAccordion';
import { generateCertificateBlob, fillCertificateTemplateFromUrl } from '../utils/pdfCertificateGenerator';

const STORAGE_KEY_AFFILIATE_REF = 'course_affiliate_ref';

const CourseDetailPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [certificateUrl, setCertificateUrl] = useState<string | null>(null);
  const [certificateIssuedAt, setCertificateIssuedAt] = useState<string | null>(null);
  const [certificateEarnedAt, setCertificateEarnedAt] = useState<string | null>(null);
  const [certificateLoading, setCertificateLoading] = useState(false);
  const [certificateError, setCertificateError] = useState<string | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutCurrency] = useState('INR');
  /** Affiliate ref from ?ref=CODE; persisted per course for checkout */
  const [affiliateRefCode, setAffiliateRefCode] = useState<string | null>(null);
  /** Affiliate link for current user (when they click "Get my affiliate link") */
  const [affiliateLink, setAffiliateLink] = useState<string | null>(null);
  const [affiliateLinkLoading, setAffiliateLinkLoading] = useState(false);

  // Capture ?ref= from URL and persist for checkout (affiliate attribution)
  useEffect(() => {
    const refFromUrl = searchParams.get('ref');
    if (refFromUrl && refFromUrl.trim()) {
      const code = refFromUrl.trim();
      setAffiliateRefCode(code);
      if (courseId) {
        try {
          const key = `${STORAGE_KEY_AFFILIATE_REF}_${courseId}`;
          sessionStorage.setItem(key, code);
        } catch {
          // ignore
        }
      }
    } else if (courseId) {
      try {
        const key = `${STORAGE_KEY_AFFILIATE_REF}_${courseId}`;
        const stored = sessionStorage.getItem(key);
        if (stored) setAffiliateRefCode(stored);
      } catch {
        // ignore
      }
    }
  }, [courseId, searchParams]);

  // Load course details
  const loadCourse = async () => {
    if (!courseId) return;

    try {
      setLoading(true);
      setError(null);
      
      const response = await courseService.getCourse(courseId);
      
      if (response.success) {
        setCourse(response.data);
      } else {
        setError(response.message || 'Course not found');
      }
    } catch (err) {
      setError('An error occurred while loading the course');
    } finally {
      setLoading(false);
    }
  };

  // Load user progress
  const loadUserProgress = async () => {
    if (!courseId || !user?._id) return;

    try {
      const response = await courseService.getProgress(courseId, user._id);
      
      if (response.success) {
        setIsEnrolled(true);
        setProgress(response.data.overallProgress);
        setCompletedLessons(response.data.completedLessons);
        setCertificateUrl(response.data.certificateUrl ?? null);
        setCertificateIssuedAt(response.data.certificateIssuedAt ?? null);
        setCertificateEarnedAt(response.data.certificateEarnedAt ?? null);
        progressService.syncProgressFromApi(courseId, user._id, {
          overallProgress: response.data.overallProgress,
          completedLessons: response.data.completedLessons,
          lastAccessed: response.data.lastAccessed,
          enrolledAt: response.data.enrolledAt
        });
      } else {
        setIsEnrolled(false);
        setProgress(0);
        setCompletedLessons([]);
        setCertificateUrl(null);
        setCertificateIssuedAt(null);
        setCertificateEarnedAt(null);
      }
    } catch {
      // Progress load failed
    }
  };

  // Handle enrollment (free: direct enroll; paid: open checkout)
  const handleEnroll = async () => {
    if (!courseId || !user?._id || !course) return;

    if (isPaidCourse) {
      setSelectedPaymentMethod(enabledPaymentMethodsList[0] || 'Credit/Debit Cards');
      setCheckoutOpen(true);
      return;
    }

    try {
      const response = await courseService.enrollCourse(courseId, user._id);
      if (response.success) {
        setIsEnrolled(true);
        setProgress(0);
        setCompletedLessons([]);
        setCertificateUrl(null);
        setCertificateIssuedAt(null);
        setCertificateEarnedAt(null);
        progressService.initializeProgress(courseId, user._id);
      } else {
        setError(response.message || 'Failed to enroll in course');
      }
    } catch {
      setError('An error occurred while enrolling');
    }
  };

  const handlePay = async () => {
    if (!courseId || !selectedPaymentMethod) return;
    setCheckoutLoading(true);
    setError(null);
    try {
      const response = await courseService.placeOrder(courseId, selectedPaymentMethod, checkoutCurrency, affiliateRefCode ?? undefined);
      if (response.success) {
        setCheckoutOpen(false);
        setIsEnrolled(true);
        setProgress(0);
        setCompletedLessons([]);
        setCertificateUrl(null);
        setCertificateIssuedAt(null);
        setCertificateEarnedAt(null);
        setAffiliateRefCode(null);
        try {
          sessionStorage.removeItem(`${STORAGE_KEY_AFFILIATE_REF}_${courseId}`);
        } catch {
          // ignore
        }
        if (course) progressService.initializeProgress(courseId, user!._id);
        loadUserProgress();
      } else {
        setError(response.message || 'Payment failed');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Handle lesson click
  const handleLessonClick = (lesson: any) => {
    if (!isEnrolled) {
      setError('Please enroll in the course to access lessons');
      return;
    }
    
    navigate(`/courses/${courseId}/lesson/${lesson.id}`);
  };

  // Handle continue learning
  const handleContinueLearning = () => {
    if (!course) return;
    
    const nextLesson = progressService.getNextLesson(courseId!, user?._id!, course);
    if (nextLesson) {
      navigate(`/courses/${courseId}/lesson/${nextLesson.id}`);
    }
  };

  // Handle bookmark toggle
  const handleBookmarkToggle = () => {
    setIsBookmarked(!isBookmarked);
    // TODO: Implement bookmark functionality
  };

  // Handle share
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: course?.name,
          text: course?.description,
          url: window.location.href
        });
      } catch {
        // Share failed
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      // TODO: Show toast notification
    }
  };

  // Certificate: get or download
  const handleGetCertificate = async () => {
    if (!courseId || !course || !user?._id) return;
    setCertificateLoading(true);
    setCertificateError(null);
    try {
      const threshold = course.certificateCompletionPercentage ?? 100;
      let earnedAt = certificateEarnedAt;
      if (!earnedAt && progress >= threshold) {
        const progressRes = await courseService.getProgress(courseId, user._id);
        if (progressRes.success && progressRes.data.certificateEarnedAt) {
          earnedAt = progressRes.data.certificateEarnedAt;
        }
      }
      const templateId = course.certificateTemplate || '1';
      const completionDateStr = earnedAt
        ? new Date(earnedAt).toISOString().split('T')[0]
        : (certificateIssuedAt ? new Date(certificateIssuedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
      const certificateData = {
        studentName: user.name || 'Learner',
        courseName: course.name,
        completionDate: completionDateStr,
        certificateNumber: `CERT-${course.id}-${user._id}-${Date.now()}`,
        instructorName: course.instructor?.name,
        certificateDescription: course.certificateDescription || 'This is to certify that',
        signBelowText: 'has successfully completed the course',
        instructorSignature: course.certificateSignatures?.[0]?.image,
        deanSignature: course.certificateSignatures?.[1]?.image,
        applicationLogo: course.certificateApplicationLogo,
        creatorLogo: course.certificateCreatorLogo
      };
      const blob = course.certificateTemplatePdfUrl
        ? await fillCertificateTemplateFromUrl(course.certificateTemplatePdfUrl, certificateData)
        : generateCertificateBlob(templateId, certificateData);
      const result = await courseService.uploadCertificate(courseId, blob);
      if (result.success && result.certificateUrl) {
        setCertificateUrl(result.certificateUrl);
        setCertificateIssuedAt(new Date().toISOString());
        window.open(result.certificateUrl, '_blank');
        loadUserProgress();
      } else {
        setCertificateError(result.message || 'Failed to issue certificate. Please try again.');
      }
    } catch {
      setCertificateError('Failed to generate or upload certificate. Please try again.');
    } finally {
      setCertificateLoading(false);
    }
  };

  const handleDownloadCertificate = () => {
    if (certificateUrl) window.open(certificateUrl, '_blank');
  };

  // Format duration
  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  // Format price
  const formatPrice = (price: { [currency: string]: number }): string => {
    const currency = 'INR';
    const amount = price[currency] || Object.values(price)[0] || 0;
    return `₹${amount}`;
  };

  const isPaidCourse = useMemo(() => {
    if (!course) return false;
    const sp = course.sellingPrice || {};
    return (sp.INR ?? 0) > 0 || (sp.USD ?? 0) > 0 || (sp.EUR ?? 0) > 0 || (sp.GBP ?? 0) > 0;
  }, [course]);

  // Enabled payment methods for learner (creator-configured) for a given currency
  const enabledPaymentMethodsList = useMemo(() => {
    if (!course?.paymentMethods || typeof course.paymentMethods !== 'object') {
      return ['Credit/Debit Cards', 'UPI', 'Buy Now Pay Later'];
    }
    const pm = course.paymentMethods as Record<string, { [key: string]: boolean }>;
    const universal = (pm.universal && typeof pm.universal === 'object' ? pm.universal : {}) as { [key: string]: boolean };
    const perCurrency = (pm[checkoutCurrency] || pm.INR || pm.USD || {}) as { [key: string]: boolean };
    const set = new Set<string>();
    Object.entries(universal).forEach(([k, v]) => { if (v) set.add(k); });
    Object.entries(perCurrency).forEach(([k, v]) => { if (v) set.add(k); });
    const list = Array.from(set);
    return list.length > 0 ? list : ['Credit/Debit Cards', 'UPI', 'Buy Now Pay Later'];
  }, [course, checkoutCurrency]);

  useEffect(() => {
    if (checkoutOpen && enabledPaymentMethodsList.length > 0 && !selectedPaymentMethod) {
      setSelectedPaymentMethod(enabledPaymentMethodsList[0]);
    }
  }, [checkoutOpen, enabledPaymentMethodsList, selectedPaymentMethod]);

  // Load data on component mount
  useEffect(() => {
    loadCourse();
    loadUserProgress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, user?._id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error || !course) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || 'Course not found'}
        </Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/courses')}>
          Back to Courses
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Breadcrumbs */}
      <Container maxWidth="lg" sx={{ pt: 2 }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link
            component="button"
            variant="body2"
            onClick={() => navigate('/courses')}
            sx={{ textDecoration: 'none' }}
          >
            Courses
          </Link>
          <Typography variant="body2" color="text.primary">
            {course.name}
          </Typography>
        </Breadcrumbs>
      </Container>

      {/* Course Header */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #6C63FF 0%, #00FFC6 100%)',
        color: 'white',
        py: 6
      }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
              {/* Course Cover */}
              <Box sx={{ flexShrink: 0 }}>
                <Card
                  sx={{
                    width: 200,
                    height: 150,
                    borderRadius: 2,
                    overflow: 'hidden',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
                  }}
                >
                  <Box
                    component="img"
                    src={course.coverImage || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop'}
                    alt={course.name}
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </Card>
              </Box>

              {/* Course Info */}
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography variant="h3" component="h1" sx={{ 
                      fontWeight: 700, 
                      mb: 1,
                      wordBreak: 'break-word'
                    }}>
                      {course.name}
                    </Typography>
                    {course.subtitle && (
                      <Typography variant="h6" sx={{ 
                        opacity: 0.9,
                        mb: 2,
                        wordBreak: 'break-word'
                      }}>
                        {course.subtitle}
                      </Typography>
                    )}
                  </Box>

                  {/* Action Buttons */}
                  <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
                    <Tooltip title="Share">
                      <IconButton onClick={handleShare} sx={{ color: 'white' }}>
                        <ShareIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={isBookmarked ? "Remove from bookmarks" : "Add to bookmarks"}>
                      <IconButton onClick={handleBookmarkToggle} sx={{ color: 'white' }}>
                        {isBookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                {/* Course Stats */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TimeIcon />
                    <Typography variant="body1">
                      {formatDuration(course.duration)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PeopleIcon />
                    <Typography variant="body1">
                      {course.enrollments} students
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SchoolIcon />
                    <Typography variant="body1">
                      {course.level}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <StarIcon />
                    <Typography variant="body1">
                      {course.completionRate}% completion rate
                    </Typography>
                  </Box>
                </Box>

                {/* Tags */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                  {course.tags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      variant="outlined"
                      sx={{
                        color: 'white',
                        borderColor: 'rgba(255,255,255,0.3)',
                        '&:hover': {
                          borderColor: 'white',
                          bgcolor: 'rgba(255,255,255,0.1)'
                        }
                      }}
                    />
                  ))}
                </Box>

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  {isEnrolled ? (
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<PlayIcon />}
                      onClick={handleContinueLearning}
                      sx={{
                        bgcolor: 'white',
                        color: 'primary.main',
                        fontWeight: 600,
                        px: 4,
                        py: 1.5,
                        '&:hover': {
                          bgcolor: 'rgba(255,255,255,0.9)'
                        }
                      }}
                    >
                      {progress > 0 ? 'Continue Learning' : 'Start Course'}
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      size="large"
                      onClick={handleEnroll}
                      sx={{
                        bgcolor: 'white',
                        color: 'primary.main',
                        fontWeight: 600,
                        px: 4,
                        py: 1.5,
                        '&:hover': {
                          bgcolor: 'rgba(255,255,255,0.9)'
                        }
                      }}
                    >
                      {isPaidCourse ? `Buy Now - ${formatPrice(course.sellingPrice)}` : `Enroll Now - Free`}
                    </Button>
                  )}
                </Box>
              </Box>
            </Box>
          </motion.div>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={4}>
          {/* Main Content */}
          <Grid item xs={12} lg={8}>
            {/* Course Description */}
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                  About This Course
                </Typography>
                <Typography variant="body1" sx={{ lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                  {course.description}
                </Typography>
              </CardContent>
            </Card>

            {/* FAQs (creator-defined, shown to learners) */}
            {course.faqs && course.faqs.length > 0 && (
              <Card sx={{ mb: 4 }}>
                <CardContent>
                  <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <QuestionAnswerIcon color="primary" />
                    Frequently Asked Questions
                  </Typography>
                  {course.faqs.map((faq, index) => (
                    <Accordion key={index} disableGutters sx={{ boxShadow: 'none', '&:before': { display: 'none' }, borderBottom: index < course.faqs!.length - 1 ? '1px solid' : 'none', borderColor: 'divider' }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {faq.question}
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                          {faq.answer}
                        </Typography>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Instructor */}
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                  Instructor
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar
                    src={course.instructor.avatar}
                    alt={course.instructor.name}
                    sx={{ width: 60, height: 60 }}
                  />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {course.instructor.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Course Instructor
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Curriculum */}
            <Card>
              <CardContent>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                  Course Curriculum
                </Typography>
                <CurriculumAccordion
                  modules={course.modules}
                  completedLessons={completedLessons}
                  onLessonClick={handleLessonClick}
                  isEnrolled={isEnrolled}
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} lg={4}>
            {/* Course Info Card */}
            <Card sx={{ mb: 3, position: 'sticky', top: 20 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Course Details
                </Typography>
                
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <TimeIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Duration"
                      secondary={formatDuration(course.duration)}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <SchoolIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Level"
                      secondary={course.level}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <PeopleIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Students"
                      secondary={course.enrollments.toLocaleString()}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Certificate"
                      secondary={course.certificateEnabled ? 'Included' : 'Not available'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <WaterDropIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Watermark"
                      secondary={course.watermarkRemovalEnabled ? 'Removed (clean content)' : 'On videos & documents'}
                    />
                  </ListItem>
                </List>

                <Divider sx={{ my: 2 }} />

                {/* Earn as affiliate (when program is on and user is logged in) */}
                {user && course.affiliateActive && (
                  <>
                    <Box sx={{ mb: 2, p: 1.5, bgcolor: 'action.hover', borderRadius: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <MonetizationOnIcon fontSize="small" color="primary" />
                        Earn as affiliate
                      </Typography>
                      {affiliateLink ? (
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">Your link:</Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                            <Typography variant="body2" sx={{ wordBreak: 'break-all', flex: 1 }}>{affiliateLink}</Typography>
                            <IconButton size="small" onClick={() => { navigator.clipboard.writeText(affiliateLink); }} title="Copy"><ContentCopyIcon fontSize="small" /></IconButton>
                          </Box>
                        </Box>
                      ) : (
                        <Button
                          size="small"
                          variant="outlined"
                          fullWidth
                          disabled={affiliateLinkLoading}
                          onClick={async () => {
                            if (!courseId) return;
                            setAffiliateLinkLoading(true);
                            try {
                              const res = await courseService.createAffiliateCode(courseId);
                              if (res.success && res.data?.link) setAffiliateLink(res.data.link);
                            } finally {
                              setAffiliateLinkLoading(false);
                            }
                          }}
                        >
                          {affiliateLinkLoading ? 'Getting link...' : 'Get my affiliate link'}
                        </Button>
                      )}
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                        <Link component="button" variant="caption" onClick={() => navigate('/affiliate')} sx={{ cursor: 'pointer' }}>
                          View all my affiliate links
                        </Link>
                      </Typography>
                    </Box>
                    <Divider sx={{ my: 2 }} />
                  </>
                )}

                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
                    {formatPrice(course.sellingPrice)}
                  </Typography>
                  {course.listedPrice && course.listedPrice !== course.sellingPrice && (
                    <Typography variant="body2" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                      {formatPrice(course.listedPrice)}
                    </Typography>
                  )}
                </Box>

                {isEnrolled && progress > 0 && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Progress
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {progress}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={progress}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: 'rgba(0,0,0,0.1)',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 4,
                            background: 'linear-gradient(90deg, #6C63FF 0%, #00FFC6 100%)'
                          }
                        }}
                      />
                    </Box>
                  </>
                )}

                {isEnrolled && course.certificateEnabled && progress >= (course.certificateCompletionPercentage ?? 100) && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <CertificateIcon fontSize="small" color="primary" />
                        Certificate
                      </Typography>
                      {certificateError && (
                        <Alert severity="error" sx={{ mb: 1 }} onClose={() => setCertificateError(null)}>
                          {certificateError}
                        </Alert>
                      )}
                      {certificateUrl ? (
                        <Box>
                          {certificateIssuedAt && (
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                              Issued on {new Date(certificateIssuedAt).toLocaleDateString()}
                            </Typography>
                          )}
                          <Button
                            fullWidth
                            variant="outlined"
                            size="small"
                            startIcon={<DownloadIcon />}
                            onClick={handleDownloadCertificate}
                            data-testid="download-certificate"
                          >
                            Download certificate
                          </Button>
                        </Box>
                      ) : (
                        <Button
                          fullWidth
                          variant="contained"
                          size="small"
                          startIcon={<CertificateIcon />}
                          onClick={handleGetCertificate}
                          disabled={certificateLoading}
                          data-testid="get-certificate"
                        >
                          {certificateLoading ? 'Issuing...' : 'Get your certificate'}
                        </Button>
                      )}
                    </Box>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Checkout modal (paid courses): show creator-configured payment methods, Pay records order and enrolls */}
      <Dialog open={checkoutOpen} onClose={() => !checkoutLoading && setCheckoutOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Complete payment</DialogTitle>
        <DialogContent>
          {course && (
            <Box sx={{ pt: 1 }}>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {course.name}
              </Typography>
              <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
                {formatPrice(course.sellingPrice)}
              </Typography>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                Select payment method
              </Typography>
              <RadioGroup
                value={selectedPaymentMethod}
                onChange={(e) => setSelectedPaymentMethod(e.target.value)}
              >
                {enabledPaymentMethodsList.map((method) => (
                  <FormControlLabel
                    key={method}
                    value={method}
                    control={<Radio />}
                    label={method}
                  />
                ))}
              </RadioGroup>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCheckoutOpen(false)} disabled={checkoutLoading}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handlePay} disabled={checkoutLoading || !selectedPaymentMethod}>
            {checkoutLoading ? 'Processing...' : 'Pay'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CourseDetailPage;
