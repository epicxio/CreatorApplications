import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Button,
  Paper,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  AlertTitle,
  Collapse,
  IconButton
} from '@mui/material';
import {
  PlayArrow as PlayArrowIcon,
  Description as DescriptionIcon,
  Quiz as QuizIcon,
  AssignmentTurnedIn as AssignmentIcon,
  LiveTv as LiveTvIcon,
  AudioFile as AudioFileIcon,
  Visibility as VisibilityIcon,
  Language as LanguageIcon,
  School as SchoolIcon,
  Category as CategoryIcon,
  Publish as PublishIcon,
  Save as SaveIcon,
  Celebration as CelebrationIcon,
  Rocket as RocketIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  AccessTime as AccessTimeIcon,
  AttachFile as AttachFileIcon,
  VideoLibrary as VideoLibraryIcon,
  Image as ImageIcon,
  InsertDriveFile as InsertDriveFileIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { courseService } from '../../services/courseService';
import type { Course, PublishSnapshot } from '../../types/course';
import { useToast } from '../../hooks/useToast';
import ToastNotification from '../common/ToastNotification';

/** Settings loaded from collections (API) for the four preview boxes */
interface SettingsFromApi {
  drip: {
    dripEnabled: boolean;
    dripMethods: string[];
    dripDisplayOption: string;
    dripHideUnlockDate: boolean;
    dripSendCommunication: boolean;
  };
  certificate: {
    certificateEnabled: boolean;
    certificateTitle: string;
    certificateDescription: string;
    certificateCompletionPercentage: number;
    certificateTemplate: string;
  };
  payment: {
    listedPrice: { [currency: string]: number };
    sellingPrice: { [currency: string]: number };
    globalPricingEnabled: boolean;
    currencySpecificPricingEnabled: boolean;
    enabledCurrencies: { [key: string]: boolean };
    installmentsOn: boolean;
    installmentPeriod: number;
    numberOfInstallments: number;
    bufferTime: number;
  };
  additional: {
    affiliateActive: boolean;
    affiliateRewardPercentage: number;
    watermarkRemovalEnabled: boolean;
    faqs: Array<{ question: string; answer: string }>;
  };
  publishHistory?: Array<{ version: number; publishedAt: string; snapshot?: PublishSnapshot }>;
}

function mapCourseToSettings(course: Course): SettingsFromApi {
  const dripMethods = (course.dripMethods || []).map((dm) => {
    if (dm.method === 'immediate') return 'Instant Access';
    if (dm.method === 'days') return `Time-Based (${dm.action ?? 0} days)`;
    if (dm.method === 'date') return `Date-Based (${dm.action ? new Date(dm.action as string).toLocaleDateString() : 'Not set'})`;
    return String(dm.method);
  });
  return {
    drip: {
      dripEnabled: course.dripEnabled ?? false,
      dripMethods,
      dripDisplayOption: course.dripDisplayOption ?? 'titleAndLessons',
      dripHideUnlockDate: course.dripHideUnlockDate ?? false,
      dripSendCommunication: course.dripSendCommunication ?? false
    },
    certificate: {
      certificateEnabled: course.certificateEnabled ?? false,
      certificateTitle: course.certificateTitle ?? 'Certificate of Completion',
      certificateDescription: course.certificateDescription ?? '',
      certificateCompletionPercentage: course.certificateCompletionPercentage ?? 100,
      certificateTemplate: course.certificateTemplate ?? '1'
    },
    payment: {
      listedPrice: course.listedPrice ?? { INR: 0, USD: 0, EUR: 0, GBP: 0 },
      sellingPrice: course.sellingPrice ?? { INR: 0, USD: 0, EUR: 0, GBP: 0 },
      globalPricingEnabled: course.globalPricingEnabled ?? true,
      currencySpecificPricingEnabled: course.currencySpecificPricingEnabled ?? false,
      enabledCurrencies: course.enabledCurrencies ?? { INR: true, USD: true, EUR: true, GBP: true },
      installmentsOn: course.installmentsOn ?? false,
      installmentPeriod: course.installmentPeriod ?? 30,
      numberOfInstallments: course.numberOfInstallments ?? 3,
      bufferTime: course.bufferTime ?? 7
    },
    additional: {
      affiliateActive: course.affiliateActive ?? false,
      affiliateRewardPercentage: course.affiliateRewardPercentage ?? 0,
      watermarkRemovalEnabled: course.watermarkRemovalEnabled ?? false,
      faqs: course.faqs ?? []
    },
    publishHistory: course.publishHistory ?? []
  };
}

/** Compare previous snapshot with current; returns list of human-readable changes (current vs previous only). */
function getDiffFromPrevious(
  prev: PublishSnapshot | null | undefined,
  current: PublishSnapshot | null | undefined
): string[] {
  const changes: string[] = [];
  if (!current) return changes;
  if (!prev) return ['First published version.'];

  const dPrev = prev.details;
  const dCur = current.details;
  if (dPrev && dCur) {
    if (dPrev.name !== dCur.name) changes.push(`Title: "${dPrev.name}" → "${dCur.name}"`);
    if (dPrev.subtitle !== dCur.subtitle) changes.push(`Subtitle: "${dPrev.subtitle || '-'}" → "${dCur.subtitle || '-'}"`);
    if (dPrev.category !== dCur.category) changes.push(`Category: ${dPrev.category} → ${dCur.category}`);
    if (dPrev.level !== dCur.level) changes.push(`Level: ${dPrev.level} → ${dCur.level}`);
  }

  const cPrev = prev.curriculum;
  const cCur = current.curriculum;
  if (cPrev && cCur) {
    if (cPrev.moduleCount !== cCur.moduleCount) changes.push(`Modules: ${cPrev.moduleCount} → ${cCur.moduleCount}`);
    else if (cCur.modules?.length) {
      cCur.modules.forEach((m, i) => {
        const p = cPrev.modules?.[i];
        if (p && (p.title !== m.title || p.lessonCount !== m.lessonCount)) {
          changes.push(`Module ${i + 1}: "${p.title}" (${p.lessonCount} lessons) → "${m.title}" (${m.lessonCount} lessons)`);
        }
      });
    }
  }

  const dripPrev = prev.drip;
  const dripCur = current.drip;
  if (dripPrev && dripCur) {
    if (dripPrev.dripEnabled !== dripCur.dripEnabled) changes.push(`Drip: ${dripPrev.dripEnabled ? 'On' : 'Off'} → ${dripCur.dripEnabled ? 'On' : 'Off'}`);
    if (dripPrev.dripMethodCount !== dripCur.dripMethodCount) changes.push(`Drip rules: ${dripPrev.dripMethodCount} → ${dripCur.dripMethodCount}`);
  }

  const certPrev = prev.certificate;
  const certCur = current.certificate;
  if (certPrev && certCur) {
    if (certPrev.certificateEnabled !== certCur.certificateEnabled) changes.push(`Certificate: ${certPrev.certificateEnabled ? 'On' : 'Off'} → ${certCur.certificateEnabled ? 'On' : 'Off'}`);
    if (certPrev.certificateTitle !== certCur.certificateTitle) changes.push(`Certificate title: "${certPrev.certificateTitle}" → "${certCur.certificateTitle}"`);
  }

  const payPrev = prev.payment;
  const payCur = current.payment;
  if (payPrev && payCur) {
    if (payPrev.sellingPriceINR !== payCur.sellingPriceINR) changes.push(`Selling price (INR): ${payPrev.sellingPriceINR} → ${payCur.sellingPriceINR}`);
    if (payPrev.sellingPriceUSD !== payCur.sellingPriceUSD) changes.push(`Selling price (USD): ${payPrev.sellingPriceUSD} → ${payCur.sellingPriceUSD}`);
    if (payPrev.installmentsOn !== payCur.installmentsOn) changes.push(`Installments: ${payPrev.installmentsOn ? 'On' : 'Off'} → ${payCur.installmentsOn ? 'On' : 'Off'}`);
  }

  const addPrev = prev.additional;
  const addCur = current.additional;
  if (addPrev && addCur) {
    if (addPrev.affiliateActive !== addCur.affiliateActive) changes.push(`Affiliate: ${addPrev.affiliateActive ? 'On' : 'Off'} → ${addCur.affiliateActive ? 'On' : 'Off'}`);
    if (addPrev.affiliateRewardPercentage !== addCur.affiliateRewardPercentage) changes.push(`Affiliate reward %: ${addPrev.affiliateRewardPercentage} → ${addCur.affiliateRewardPercentage}`);
    if (addPrev.watermarkRemovalEnabled !== addCur.watermarkRemovalEnabled) changes.push(`Watermark removal: ${addPrev.watermarkRemovalEnabled ? 'On' : 'Off'} → ${addCur.watermarkRemovalEnabled ? 'On' : 'Off'}`);
    if (addPrev.faqsCount !== addCur.faqsCount) changes.push(`FAQs: ${addPrev.faqsCount} → ${addCur.faqsCount} questions`);
  }

  if (changes.length === 0) return ['No changes from previous version.'];
  return changes;
}

/** Format snapshot for "what was saved" display (section labels + key values). */
function formatSnapshotSummary(snap: PublishSnapshot | null | undefined): { section: string; lines: string[] }[] {
  if (!snap) return [];
  const out: { section: string; lines: string[] }[] = [];
  if (snap.details) {
    out.push({
      section: 'Course details',
      lines: [
        `Title: ${snap.details.name || '-'}`,
        `Category: ${snap.details.category || '-'}, Level: ${snap.details.level || '-'}`,
        `Language: ${snap.details.language || '-'}`
      ]
    });
  }
  if (snap.curriculum) {
    out.push({
      section: 'Curriculum',
      lines: [
        `Modules: ${snap.curriculum.moduleCount}`,
        ...(snap.curriculum.modules || []).map((m, i) => `  ${i + 1}. ${m.title} (${m.lessonCount} lessons)`)
      ]
    });
  }
  if (snap.drip) {
    out.push({
      section: 'Drip',
      lines: [
        `Enabled: ${snap.drip.dripEnabled ? 'Yes' : 'No'}`,
        snap.drip.dripEnabled ? `Rules: ${snap.drip.dripMethodCount}` : []
      ].flat()
    });
  }
  if (snap.certificate) {
    out.push({
      section: 'Certificate',
      lines: [
        `Enabled: ${snap.certificate.certificateEnabled ? 'Yes' : 'No'}`,
        snap.certificate.certificateTitle ? `Title: ${snap.certificate.certificateTitle}` : []
      ].flat()
    });
  }
  if (snap.payment) {
    out.push({
      section: 'Payment',
      lines: [
        `INR: ₹${snap.payment.sellingPriceINR} (list ₹${snap.payment.listedPriceINR})`,
        `USD: $${snap.payment.sellingPriceUSD} (list $${snap.payment.listedPriceUSD})`,
        `Installments: ${snap.payment.installmentsOn ? 'On' : 'Off'}`
      ]
    });
  }
  if (snap.additional) {
    out.push({
      section: 'Additional',
      lines: [
        `Affiliate: ${snap.additional.affiliateActive ? 'On' : 'Off'}${snap.additional.affiliateActive ? ` (${snap.additional.affiliateRewardPercentage}%)` : ''}`,
        `Watermark removal: ${snap.additional.watermarkRemovalEnabled ? 'On' : 'Off'}`,
        `FAQs: ${snap.additional.faqsCount} questions`
      ]
    });
  }
  return out;
}

function VersionHistoryEntry({
  version,
  publishedAt,
  summary,
  diffLines,
  isFirstVersion,
  hasSnapshot
}: {
  version: number;
  publishedAt: string;
  summary: { section: string; lines: string[] }[];
  diffLines: string[];
  isFirstVersion: boolean;
  hasSnapshot: boolean;
}) {
  const [expanded, setExpanded] = React.useState(false);
  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 2,
        overflow: 'hidden',
        border: '1px solid rgba(108, 99, 255, 0.2)',
        bgcolor: 'rgba(108, 99, 255, 0.04)'
      }}
    >
      <Box
        onClick={() => setExpanded((e) => !e)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          py: 1.5,
          px: 2,
          cursor: 'pointer',
          '&:hover': { bgcolor: 'rgba(108, 99, 255, 0.08)' }
        }}
      >
        <Typography variant="subtitle2" fontWeight={600}>
          Version {version}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" color="text.secondary">
            {new Date(publishedAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
          </Typography>
          <IconButton size="small" aria-label={expanded ? 'Collapse' : 'Expand'}>
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
      </Box>
      <Collapse in={expanded}>
        <Box sx={{ px: 2, pb: 2, pt: 0 }}>
          {hasSnapshot ? (
            <>
              <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                What was saved
              </Typography>
              <Stack spacing={1} sx={{ mb: 2 }}>
                {summary.map(({ section, lines }) => (
                  <Box key={section}>
                    <Typography variant="caption" fontWeight={600} color="primary.main">{section}</Typography>
                    <List dense disablePadding sx={{ pl: 1 }}>
                      {lines.filter(Boolean).map((line, i) => (
                        <ListItem key={i} disablePadding sx={{ py: 0, minHeight: 24 }}>
                          <ListItemText primary={line} primaryTypographyProps={{ variant: 'caption' }} />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                ))}
              </Stack>
              <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                {isFirstVersion ? 'First version' : `What changed from Version ${version - 1}`}
              </Typography>
              <List dense disablePadding sx={{ pl: 1 }}>
                {diffLines.map((line, i) => (
                  <ListItem key={i} disablePadding sx={{ py: 0, minHeight: 24 }}>
                    <ListItemIcon sx={{ minWidth: 24 }}>
                      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'primary.main' }} />
                    </ListItemIcon>
                    <ListItemText primary={line} primaryTypographyProps={{ variant: 'caption' }} />
                  </ListItem>
                ))}
              </List>
            </>
          ) : (
            <Typography variant="caption" color="text.secondary">
              No snapshot saved for this version (published before snapshot was enabled).
            </Typography>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
}

interface PreviewPublishStepProps {
  courseId?: string | null;
  /** When provided, Step 6 "Save as Draft" calls this (parent builds full draft payload and saves). */
  onSaveDraft?: () => Promise<void | boolean>;
  /** When provided, Step 6 "Publish Course" calls this. Otherwise step calls courseService.publishCourse(courseId). */
  onPublish?: () => Promise<void>;
  courseData?: {
    // Course Details
    title?: string;
    subtitle?: string;
    description?: string;
    category?: string;
    level?: string;
    language?: string;
    tags?: string[];
    visibility?: string;
    coverImage?: string;
    
    // Curriculum
    modules?: Array<{
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
        resources?: Array<{
          name: string;
          type: string;
          url: string;
          size?: number;
        }>;
        content?: any;
        videos?: any[];
        audioFiles?: any[];
        quizQuestions?: any[];
        liveFields?: any;
        assignmentFields?: any;
      }>;
    }>;
    
    // Drip Content
    dripEnabled?: boolean;
    dripMethods?: Array<{
      id: string;
      method: 'immediate' | 'days' | 'date';
      action?: string | number;
    }>;
    dripDisplayOption?: 'title' | 'titleAndLessons' | 'hide';
    dripHideUnlockDate?: boolean;
    dripSendCommunication?: boolean;
  };
}

interface CoursePreviewData {
  // Course Details
  title: string;
  subtitle: string;
  description: string;
  category: string;
  level: string;
  language: string;
  tags: string[];
  visibility: string;
  coverImage?: string;

  // Curriculum
  modules: Array<{
    id: string;
    title: string;
    lessons: Array<{
      id: string;
      title: string;
      type: string;
    }>;
  }>;

  // Drip Content
  dripEnabled: boolean;
  dripMethods: string[];
  displayOption: string;
  hideUnlockDate: boolean;
  sendCommunication: boolean;

  // Certificate
  certificateEnabled: boolean;
  certificateTitle: string;
  certificateDescription: string;
  completionPercentage: number;
  template: string;

  // Payment Details
  globalPricingEnabled: boolean;
  currencySpecificPricingEnabled: boolean;
  globalListPrice: string;
  globalActualPrice: string;
  currencyListPrices: { [key: string]: string };
  currencyActualPrices: { [key: string]: string };
  emiEnabled: boolean;
  installmentPeriod: number;
  numberOfInstallments: number;
  bufferTime: number;

  // Additional Details
  affiliateRewardEnabled: boolean;
  affiliateRewardPercentage: string;
  watermarkRemovalEnabled: boolean;
  faqs: Array<{
    id: number;
    question: string;
    answer: string;
  }>;
}

const PreviewPublishStep: React.FC<PreviewPublishStepProps> = ({ courseId, courseData: propsCourseData, onSaveDraft, onPublish }) => {
  const navigate = useNavigate();
  const [publishing, setPublishing] = React.useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = React.useState(false);
  const [savingDraft, setSavingDraft] = React.useState(false);
  /** Settings loaded from collections (API) for Drip, Certificate, Payment, Additional boxes */
  const [settingsFromApi, setSettingsFromApi] = React.useState<SettingsFromApi | null>(null);
  const [loadingSettings, setLoadingSettings] = React.useState(false);
  const { success, error: showError, toast, hideToast } = useToast();
  
  // State for expanded modules and lessons
  const [expandedModules, setExpandedModules] = React.useState<Set<string>>(new Set());
  const [expandedLessons, setExpandedLessons] = React.useState<Set<string>>(new Set());

  // Fetch course from backend when courseId is present so the four boxes show actual data from collections
  React.useEffect(() => {
    if (!courseId || !courseId.trim()) {
      setSettingsFromApi(null);
      return;
    }
    let cancelled = false;
    setLoadingSettings(true);
    setSettingsFromApi(null);
    courseService.getCourse(courseId).then((res) => {
      if (cancelled) return;
      if (res.success && res.data) {
        setSettingsFromApi(mapCourseToSettings(res.data));
      }
    }).finally(() => {
      if (!cancelled) setLoadingSettings(false);
    });
    return () => { cancelled = true; };
  }, [courseId]);
  
  // Toggle module expansion
  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };
  
  // Toggle lesson expansion
  const toggleLesson = (lessonId: string) => {
    const newExpanded = new Set(expandedLessons);
    if (newExpanded.has(lessonId)) {
      newExpanded.delete(lessonId);
    } else {
      newExpanded.add(lessonId);
    }
    setExpandedLessons(newExpanded);
  };

  // Use real data if provided, otherwise use mock data for other steps
  const courseData: CoursePreviewData = {
    title: propsCourseData?.title || "Complete Web Development Course",
    subtitle: propsCourseData?.subtitle || "Learn HTML, CSS, JavaScript and React from scratch",
    description: propsCourseData?.description || "A comprehensive course covering all aspects of modern web development...",
    category: propsCourseData?.category || "Technology",
    level: propsCourseData?.level || "Beginner",
    language: propsCourseData?.language || "English",
    tags: propsCourseData?.tags || ["Web Development", "JavaScript", "React"],
    visibility: propsCourseData?.visibility || "Public",
    coverImage: propsCourseData?.coverImage,
    modules: propsCourseData?.modules || [
      {
        id: "module-1",
        title: "Introduction to Web Development",
        lessons: [
          { id: "lesson-1", title: "Welcome to the Course", type: "Video" },
          { id: "lesson-2", title: "Setting Up Your Environment", type: "Text" },
          { id: "lesson-3", title: "HTML Basics Quiz", type: "Quiz" }
        ]
      },
      {
        id: "module-2",
        title: "HTML Fundamentals",
        lessons: [
          { id: "lesson-4", title: "HTML Structure", type: "Video" },
          { id: "lesson-5", title: "HTML Assignment", type: "Assignment" }
        ]
      }
    ],
    dripEnabled: propsCourseData?.dripEnabled || false,
    dripMethods: propsCourseData?.dripMethods 
      ? propsCourseData.dripMethods.map((dm: any) => {
          const methodNames: { [key: string]: string } = {
            immediate: 'Instant Access',
            days: `Time-Based (${dm.action || 0} days)`,
            date: `Date-Based (${dm.action ? new Date(dm.action).toLocaleDateString() : 'Not set'})`
          };
          return methodNames[dm.method] || dm.method;
        })
      : [],
    displayOption: propsCourseData?.dripDisplayOption || 'titleAndLessons',
    hideUnlockDate: propsCourseData?.dripHideUnlockDate || false,
    sendCommunication: propsCourseData?.dripSendCommunication || false,
    certificateEnabled: true,
    certificateTitle: "Web Development Certificate",
    certificateDescription: "Certificate of completion for web development course",
    completionPercentage: 80,
    template: "Modern",
    globalPricingEnabled: true,
    currencySpecificPricingEnabled: false,
    globalListPrice: "15",
    globalActualPrice: "10",
    currencyListPrices: { "USD": "15", "INR": "1200" },
    currencyActualPrices: { "USD": "10", "INR": "750" },
    emiEnabled: true,
    installmentPeriod: 3,
    numberOfInstallments: 2,
    bufferTime: 7,
    affiliateRewardEnabled: true,
    affiliateRewardPercentage: "10",
    watermarkRemovalEnabled: false,
    faqs: [
      { id: 1, question: "What will I learn in this course?", answer: "You will learn complete web development from basics to advanced concepts." },
      { id: 2, question: "Do I need any prior experience?", answer: "No prior experience is required. This course is designed for beginners." }
    ]
  };

  const handlePublish = async () => {
    if (!courseId || !courseId.trim()) {
      showError('Save as draft first to get a course ID, then publish.');
      return;
    }
    setPublishing(true);
    try {
      if (onPublish) {
        await onPublish();
      } else {
        const result = await courseService.publishCourse(courseId, 'Live & Selling');
        if (!result.success) {
          showError(result.message || 'Failed to publish course');
          return;
        }
      }
      success('Course published successfully!');
      setShowSuccessDialog(true);
      // Refetch course so version history shows the new publish
      if (courseId) {
        courseService.getCourse(courseId).then((res) => {
          if (res.success && res.data) {
            setSettingsFromApi(mapCourseToSettings(res.data));
          }
        });
      }
    } catch {
      showError('Failed to publish course');
    } finally {
      setPublishing(false);
    }
  };

  const handleSaveDraft = async () => {
    if (onSaveDraft) {
      setSavingDraft(true);
      try {
        await onSaveDraft();
        success('Draft saved successfully!');
      } catch {
        showError('Failed to save draft');
      } finally {
        setSavingDraft(false);
      }
      return;
    }
    showError('Save as draft is not available from this view. Use the Save Draft button in the builder.');
  };

  const getLessonTypeIcon = (type: string) => {
    const icons: { [key: string]: JSX.Element } = {
      Video: <PlayArrowIcon sx={{ color: '#6C63FF' }} />,
      Text: <DescriptionIcon sx={{ color: '#00BFFF' }} />,
      Quiz: <QuizIcon sx={{ color: '#FFD600' }} />,
      Assignment: <AssignmentIcon sx={{ color: '#00FFC6' }} />,
      Live: <LiveTvIcon sx={{ color: '#FF6B6B' }} />,
      Audio: <AudioFileIcon sx={{ color: '#FF8C00' }} />
    };
    return icons[type] || <DescriptionIcon />;
  };

  const _formatDuration = (
    value?: number | string | null,
    options: { verbose?: boolean } = {}
  ): string | null => {
    if (value === undefined || value === null || value === '') {
      return null;
    }
    const minutes = typeof value === 'string' ? parseInt(value, 10) : value;
    if (!minutes || Number.isNaN(minutes) || minutes <= 0) {
      return null;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (options.verbose) {
      if (hours > 0 && remainingMinutes > 0) {
        return `${hours} hour${hours === 1 ? '' : 's'} ${remainingMinutes} minute${remainingMinutes === 1 ? '' : 's'}`;
      }
      if (hours > 0) {
        return `${hours} hour${hours === 1 ? '' : 's'}`;
      }
      return `${remainingMinutes} minute${remainingMinutes === 1 ? '' : 's'}`;
    }
    if (hours > 0 && remainingMinutes > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    if (hours > 0) {
      return `${hours}h`;
    }
    return `${remainingMinutes}m`;
  };

  return (
    <Box sx={{ 
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ flexShrink: 0 }}
      >
        <Box sx={{
          background: 'linear-gradient(135deg, #6C63FF 0%, #00FFC6 100%)',
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
                Preview & Publish
              </Typography>
              <Typography variant="h6" color="rgba(255,255,255,0.8)" sx={{ mb: 2 }}>
                Review your course settings and publish to make it live
              </Typography>
              <Chip
                icon={<PublishIcon />}
                label="Ready to Launch"
                sx={{
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  backdropFilter: 'blur(10px)'
                }}
              />
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <RocketIcon sx={{ fontSize: 80, color: 'white', opacity: 0.8 }} />
              </motion.div>
            </Box>
          </Stack>
        </Box>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        style={{ 
          flex: 1,
          overflow: 'auto',
          overflowX: 'hidden'
        }}
      >
        <Card sx={{
          background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(108, 99, 255, 0.1)',
          border: '1px solid rgba(108, 99, 255, 0.1)',
          mb: 4,
          height: '100%'
        }}>
          <CardContent sx={{ p: 4, height: '100%' }}>
            <Stack spacing={4}>
              
              {/* Course Overview */}
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  📚 Course Overview
                </Typography>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="h5" fontWeight={700} color="#6C63FF">
                      {courseData.title}
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                      {courseData.subtitle}
                    </Typography>
                  </Box>
                  {courseId && (
                    <Box>
                      <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                        Course ID:
                      </Typography>
                      <Chip 
                        label={courseId} 
                        sx={{ 
                          bgcolor: 'rgba(108, 99, 255, 0.1)',
                          color: '#6C63FF',
                          fontWeight: 600,
                          fontFamily: 'monospace'
                        }} 
                      />
                    </Box>
                  )}
                  <Stack direction="row" spacing={2} flexWrap="wrap">
                    <Chip icon={<CategoryIcon />} label={courseData.category} color="primary" />
                    <Chip icon={<SchoolIcon />} label={courseData.level} color="secondary" />
                    <Chip icon={<LanguageIcon />} label={courseData.language} />
                    <Chip icon={<VisibilityIcon />} label={courseData.visibility} />
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    {courseData.description}
                  </Typography>
                </Stack>
              </Paper>

              {/* Curriculum Preview */}
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  📖 Curriculum ({courseData.modules.length} modules, {courseData.modules.reduce((acc, mod) => acc + mod.lessons.length, 0)} lessons)
                </Typography>
                <List>
                  {courseData.modules.map((module, modIndex) => {
                    const isModuleExpanded = expandedModules.has(module.id);
                    // Get full module data from props
                    const fullModuleData = propsCourseData?.modules?.find(m => m.id === module.id);
                    return (
                      <Box key={module.id} sx={{ mb: 2 }}>
                        <ListItem 
                          sx={{ 
                            pl: 0, 
                            cursor: 'pointer',
                            '&:hover': { bgcolor: 'rgba(108, 99, 255, 0.05)' },
                            borderRadius: 1
                          }}
                          onClick={() => toggleModule(module.id)}
                        >
                          <ListItemIcon>
                            <Typography variant="h6" color="#6C63FF" fontWeight={600}>
                              {modIndex + 1}
                            </Typography>
                          </ListItemIcon>
                          <ListItemText
                            primary={module.title}
                            secondary={
                              <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                                <Typography variant="body2" color="text.secondary">
                                  {module.lessons.length} lessons
                                </Typography>
                                {fullModuleData?.description && (
                                  <>
                                    <Typography variant="body2" color="text.secondary">•</Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ 
                                      overflow: 'hidden', 
                                      textOverflow: 'ellipsis', 
                                      whiteSpace: 'nowrap',
                                      maxWidth: 300
                                    }}>
                                      {fullModuleData.description}
                                    </Typography>
                                  </>
                                )}
                              </Stack>
                            }
                          />
                          <IconButton size="small" onClick={(e) => { e.stopPropagation(); toggleModule(module.id); }}>
                            {isModuleExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                          </IconButton>
                        </ListItem>
                        <Collapse in={isModuleExpanded} timeout="auto" unmountOnExit>
                          <List sx={{ pl: 4, mt: 1 }}>
                            {module.lessons.map((lesson, _lessonIndex) => {
                              const isLessonExpanded = expandedLessons.has(lesson.id);
                              const lessonData = fullModuleData?.lessons?.find(l => l.id === lesson.id);
                              return (
                                <Box key={lesson.id} sx={{ mb: 1.5 }}>
                                  <ListItem 
                                    sx={{ 
                                      pl: 0,
                                      cursor: 'pointer',
                                      '&:hover': { bgcolor: 'rgba(108, 99, 255, 0.03)' },
                                      borderRadius: 1,
                                      border: '1px solid rgba(108, 99, 255, 0.1)',
                                      mb: 1
                                    }}
                                    onClick={() => toggleLesson(lesson.id)}
                                  >
                                    <ListItemIcon>
                                      {getLessonTypeIcon(lesson.type)}
                                    </ListItemIcon>
                                    <ListItemText
                                      primary={
                                        <Stack direction="row" spacing={1} alignItems="center">
                                          <Typography variant="subtitle2" fontWeight={600}>
                                            {lesson.title}
                                          </Typography>
                                          <Chip 
                                            label={lesson.type} 
                                            size="small" 
                                            sx={{ 
                                              height: 20, 
                                              fontSize: '0.7rem',
                                              bgcolor: lesson.type === 'Video' ? 'rgba(108, 99, 255, 0.1)' :
                                                       lesson.type === 'Quiz' ? 'rgba(255, 214, 0, 0.1)' :
                                                       lesson.type === 'Audio' ? 'rgba(255, 140, 0, 0.1)' :
                                                       lesson.type === 'Text' ? 'rgba(0, 191, 255, 0.1)' :
                                                       'rgba(0, 255, 198, 0.1)',
                                              color: lesson.type === 'Video' ? '#6C63FF' :
                                                     lesson.type === 'Quiz' ? '#FFD600' :
                                                     lesson.type === 'Audio' ? '#FF8C00' :
                                                     lesson.type === 'Text' ? '#00BFFF' :
                                                     '#00FFC6'
                                            }}
                                          />
                                        </Stack>
                                      }
                                      secondary={
                                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                                          {lessonData?.duration !== undefined && 
                                           lessonData?.duration !== null &&
                                           Number(lessonData.duration) !== 0 &&
                                           Number(lessonData.duration) > 0 && (
                                            <>
                                              <AccessTimeIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                              <Typography variant="caption" color="text.secondary">
                                                {Math.floor(Number(lessonData.duration) / 60)}h {Number(lessonData.duration) % 60}m
                                              </Typography>
                                            </>
                                          )}
                                          {lessonData?.resources && lessonData.resources.length > 0 && (
                                            <>
                                              <AttachFileIcon sx={{ fontSize: 14, color: 'text.secondary', ml: 1 }} />
                                              <Typography variant="caption" color="text.secondary">
                                                {lessonData.resources.length} resource{lessonData.resources.length > 1 ? 's' : ''}
                                              </Typography>
                                            </>
                                          )}
                                        </Stack>
                                      }
                                    />
                                    <IconButton 
                                      size="small" 
                                      onClick={(e) => { e.stopPropagation(); toggleLesson(lesson.id); }}
                                    >
                                      {isLessonExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                    </IconButton>
                                  </ListItem>
                                  <Collapse in={isLessonExpanded} timeout="auto" unmountOnExit>
                                    <Box sx={{ pl: 6, pr: 2, pt: 1, pb: 2, bgcolor: 'rgba(0,0,0,0.02)', borderRadius: 1 }}>
                                      <Stack spacing={2}>
                                        {/* Lesson Description */}
                                        {lessonData?.description && 
                                         String(lessonData.description).trim() !== '' &&
                                         String(lessonData.description).trim() !== '0' && (
                                          <Box>
                                            <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                              Description:
                                            </Typography>
                                            <Typography variant="body2" color="text.primary">
                                              {String(lessonData.description).trim()}
                                            </Typography>
                                          </Box>
                                        )}
                                        
                                        {/* Lesson Duration */}
                                        {lessonData?.duration !== undefined && 
                                         lessonData?.duration !== null &&
                                         Number(lessonData.duration) !== 0 &&
                                         Number(lessonData.duration) > 0 && (
                                          <Box>
                                            <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                              Duration:
                                            </Typography>
                                            <Typography variant="body2" color="text.primary">
                                              {Math.floor(Number(lessonData.duration) / 60)} hour(s) {Number(lessonData.duration) % 60} minute(s)
                                            </Typography>
                                          </Box>
                                        )}
                                        
                                        {/* Video Content */}
                                        {lesson.type === 'Video' && lessonData?.videos && lessonData.videos.length > 0 && (
                                          <Box>
                                            <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                              Video Files:
                                            </Typography>
                                            <Stack spacing={0.5}>
                                              {lessonData.videos.map((video: any, idx: number) => (
                                                <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                  <VideoLibraryIcon sx={{ fontSize: 16, color: '#6C63FF' }} />
                                                  <Typography variant="body2" color="text.primary">
                                                    {video.video?.name || `Video ${idx + 1}`}
                                                  </Typography>
                                                  {video.thumbnail && (
                                                    <>
                                                      <ImageIcon sx={{ fontSize: 16, color: '#00BFFF', ml: 1 }} />
                                                      <Typography variant="body2" color="text.secondary" fontSize="0.75rem">
                                                        Thumbnail
                                                      </Typography>
                                                    </>
                                                  )}
                                                </Box>
                                              ))}
                                            </Stack>
                                          </Box>
                                        )}
                                        
                                        {/* Audio Content */}
                                        {lesson.type === 'Audio' && lessonData?.audioFiles && lessonData.audioFiles.length > 0 && (
                                          <Box>
                                            <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                              Audio Files:
                                            </Typography>
                                            <Stack spacing={0.5}>
                                              {lessonData.audioFiles.map((audio: any, idx: number) => (
                                                <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                  <AudioFileIcon sx={{ fontSize: 16, color: '#FF8C00' }} />
                                                  <Typography variant="body2" color="text.primary">
                                                    {audio.name || `Audio ${idx + 1}`}
                                                  </Typography>
                                                  {audio.size && (
                                                    <Typography variant="caption" color="text.secondary">
                                                      ({(audio.size / 1024 / 1024).toFixed(2)} MB)
                                                    </Typography>
                                                  )}
                                                </Box>
                                              ))}
                                            </Stack>
                                          </Box>
                                        )}
                                        
                                        {/* Quiz Content */}
                                        {lesson.type === 'Quiz' && lessonData?.quizQuestions && lessonData.quizQuestions.length > 0 && (
                                          <Box>
                                            <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                              Quiz Questions:
                                            </Typography>
                                            <Typography variant="body2" color="text.primary">
                                              {lessonData.quizQuestions.length} question{lessonData.quizQuestions.length > 1 ? 's' : ''}
                                            </Typography>
                                            {lessonData.content?.timeLimit && 
                                             lessonData.content.timeLimit !== '0' && 
                                             Number(lessonData.content.timeLimit) > 0 && (
                                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                                Time Limit: {lessonData.content.timeLimit} minutes
                                              </Typography>
                                            )}
                                            {lessonData.content?.passingScore && 
                                             lessonData.content.passingScore !== '0' && 
                                             Number(lessonData.content.passingScore) > 0 && (
                                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                                Passing Score: {lessonData.content.passingScore}%
                                              </Typography>
                                            )}
                                          </Box>
                                        )}
                                        
                                        {/* Text Content */}
                                        {lesson.type === 'Text' && lessonData?.content?.textContent && (
                                          <Box>
                                            <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                              Text Content:
                                            </Typography>
                                            <Typography variant="body2" color="text.primary" sx={{ 
                                              maxHeight: 100, 
                                              overflow: 'auto',
                                              whiteSpace: 'pre-wrap'
                                            }}>
                                              {lessonData.content.textContent.substring(0, 200)}
                                              {lessonData.content.textContent.length > 200 && '...'}
                                            </Typography>
                                          </Box>
                                        )}
                                        
                                        {/* Assignment Content */}
                                        {lesson.type === 'Assignment' && (lessonData?.content?.instructions || lessonData?.assignmentFields) && (
                                          <Box>
                                            <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                              Assignment Details:
                                            </Typography>
                                            <Stack spacing={1}>
                                              {(lessonData.content?.instructions || lessonData.assignmentFields?.instructions) && (
                                                <Box>
                                                  <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                                    Instructions:
                                                  </Typography>
                                                  <Typography variant="body2" color="text.primary" sx={{ 
                                                    maxHeight: 150, 
                                                    overflow: 'auto',
                                                    whiteSpace: 'pre-wrap',
                                                    bgcolor: 'rgba(0, 255, 198, 0.05)',
                                                    p: 1,
                                                    borderRadius: 1
                                                  }}>
                                                    {lessonData.content?.instructions || lessonData.assignmentFields?.instructions}
                                                  </Typography>
                                                </Box>
                                              )}
                                              {(lessonData.content?.submissionType || lessonData.assignmentFields?.submissionType) && (
                                                <Box>
                                                  <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                                    Submission Type:
                                                  </Typography>
                                                  <Chip 
                                                    label={
                                                      (lessonData.content?.submissionType || lessonData.assignmentFields?.submissionType) === 'text' ? 'Text Only' :
                                                      (lessonData.content?.submissionType || lessonData.assignmentFields?.submissionType) === 'file' ? 'File Only' :
                                                      'Text & File'
                                                    }
                                                    size="small"
                                                    sx={{ 
                                                      bgcolor: 'rgba(0, 255, 198, 0.1)',
                                                      color: '#00FFC6'
                                                    }}
                                                  />
                                                </Box>
                                              )}
                                              {((lessonData.content?.submissionType === 'file' || lessonData.content?.submissionType === 'both' || 
                                                 lessonData.assignmentFields?.submissionType === 'file' || lessonData.assignmentFields?.submissionType === 'both') &&
                                                (lessonData.content?.maxFileSize || lessonData.assignmentFields?.maxFileSize)) && (
                                                <Box>
                                                  <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                                    Max File Size:
                                                  </Typography>
                                                  <Typography variant="body2" color="text.primary">
                                                    {lessonData.content?.maxFileSize || lessonData.assignmentFields?.maxFileSize} MB
                                                  </Typography>
                                                </Box>
                                              )}
                                              {((lessonData.content?.submissionType === 'file' || lessonData.content?.submissionType === 'both' ||
                                                 lessonData.assignmentFields?.submissionType === 'file' || lessonData.assignmentFields?.submissionType === 'both') &&
                                                (lessonData.content?.allowedFileTypes || lessonData.assignmentFields?.allowedFileTypes) &&
                                                (lessonData.content?.allowedFileTypes?.length > 0 || lessonData.assignmentFields?.allowedFileTypes?.length > 0)) && (
                                                <Box>
                                                  <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                                    Allowed File Types:
                                                  </Typography>
                                                  <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ gap: 0.5 }}>
                                                    {(lessonData.content?.allowedFileTypes || lessonData.assignmentFields?.allowedFileTypes || []).map((fileType: string, idx: number) => (
                                                      <Chip
                                                        key={idx}
                                                        label={fileType}
                                                        size="small"
                                                        sx={{
                                                          bgcolor: 'rgba(0, 255, 198, 0.1)',
                                                          color: '#00FFC6',
                                                          fontSize: '0.7rem'
                                                        }}
                                                      />
                                                    ))}
                                                  </Stack>
                                                </Box>
                                              )}
                                            </Stack>
                                          </Box>
                                        )}
                                        
                                        {/* Live Lesson Content */}
                                        {lesson.type === 'Live' && (lessonData?.content?.startDateTime || lessonData?.liveFields) && (
                                          <Box>
                                            <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                              Live Session Details:
                                            </Typography>
                                            <Stack spacing={1}>
                                              {(lessonData.content?.startDateTime || lessonData.liveFields?.startDateTime) && (
                                                <Box>
                                                  <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                                    Start Date & Time:
                                                  </Typography>
                                                  <Typography variant="body2" color="text.primary">
                                                    {lessonData.content?.startDateTime 
                                                      ? new Date(lessonData.content.startDateTime).toLocaleString()
                                                      : lessonData.liveFields?.startDateTime
                                                        ? new Date(lessonData.liveFields.startDateTime).toLocaleString()
                                                        : 'Not set'}
                                                  </Typography>
                                                </Box>
                                              )}
                                              {(lessonData.content?.endDateTime || (lessonData.liveFields?.startDateTime && lessonData.liveFields?.duration)) && (
                                                <Box>
                                                  <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                                    End Date & Time:
                                                  </Typography>
                                                  <Typography variant="body2" color="text.primary">
                                                    {lessonData.content?.endDateTime 
                                                      ? new Date(lessonData.content.endDateTime).toLocaleString()
                                                      : lessonData.liveFields?.startDateTime && lessonData.liveFields?.duration
                                                        ? new Date(new Date(lessonData.liveFields.startDateTime).getTime() + parseInt(lessonData.liveFields.duration) * 60000).toLocaleString()
                                                        : 'Not set'}
                                                  </Typography>
                                                </Box>
                                              )}
                                              {lessonData.liveFields?.duration && 
                                               lessonData.liveFields.duration !== '0' && 
                                               Number(lessonData.liveFields.duration) > 0 && (
                                                <Box>
                                                  <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                                    Duration:
                                                  </Typography>
                                                  <Typography variant="body2" color="text.primary">
                                                    {lessonData.liveFields.duration} minutes
                                                  </Typography>
                                                </Box>
                                              )}
                                              {(lessonData.content?.meetingPlatform || lessonData.liveFields?.meetingLink) && (
                                                <Box>
                                                  <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                                    Meeting Platform:
                                                  </Typography>
                                                  <Chip
                                                    label={lessonData.content?.meetingPlatform || lessonData.liveFields?.meetingLink || 'Custom Link'}
                                                    size="small"
                                                    icon={<LiveTvIcon sx={{ fontSize: 16 }} />}
                                                    sx={{
                                                      bgcolor: 'rgba(255, 107, 107, 0.1)',
                                                      color: '#FF6B6B'
                                                    }}
                                                  />
                                                </Box>
                                              )}
                                              {(lessonData.content?.meetingLink || lessonData.liveFields?.customLink) && (
                                                <Box>
                                                  <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                                    Meeting Link:
                                                  </Typography>
                                                  <Typography 
                                                    variant="body2" 
                                                    color="primary"
                                                    sx={{
                                                      wordBreak: 'break-all',
                                                      textDecoration: 'underline',
                                                      cursor: 'pointer',
                                                      '&:hover': {
                                                        color: '#FF6B6B'
                                                      }
                                                    }}
                                                    onClick={() => {
                                                      const link = lessonData.content?.meetingLink || lessonData.liveFields?.customLink;
                                                      if (link) {
                                                        window.open(link.startsWith('http') ? link : `https://${link}`, '_blank');
                                                      }
                                                    }}
                                                  >
                                                    {lessonData.content?.meetingLink || lessonData.liveFields?.customLink}
                                                  </Typography>
                                                </Box>
                                              )}
                                            </Stack>
                                          </Box>
                                        )}
                                        
                                        {/* Resources */}
                                        {lessonData?.resources && lessonData.resources.length > 0 && (
                                          <Box>
                                            <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                              Resources ({lessonData.resources.length}):
                                            </Typography>
                                            <Stack spacing={0.5}>
                                              {lessonData.resources.map((resource: any, idx: number) => (
                                                <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                  {resource.type === 'image' ? (
                                                    <ImageIcon sx={{ fontSize: 16, color: '#00BFFF' }} />
                                                  ) : resource.type === 'video' ? (
                                                    <VideoLibraryIcon sx={{ fontSize: 16, color: '#6C63FF' }} />
                                                  ) : resource.type === 'audio' ? (
                                                    <AudioFileIcon sx={{ fontSize: 16, color: '#FF8C00' }} />
                                                  ) : (
                                                    <InsertDriveFileIcon sx={{ fontSize: 16, color: '#666' }} />
                                                  )}
                                                  <Typography variant="body2" color="text.primary">
                                                    {resource.name}
                                                  </Typography>
                                                  {resource.size && (
                                                    <Typography variant="caption" color="text.secondary">
                                                      ({(resource.size / 1024).toFixed(2)} KB)
                                                    </Typography>
                                                  )}
                                                </Box>
                                              ))}
                                            </Stack>
                                          </Box>
                                        )}
                                        
                                        {/* Pre/Post Class Messages */}
                                        {(lessonData?.content?.preClassMessage || lessonData?.content?.postClassMessage) && (
                                          <Box>
                                            {lessonData.content.preClassMessage && (
                                              <Box sx={{ mb: 1 }}>
                                                <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                                  Pre-Class Message:
                                                </Typography>
                                                <Typography variant="body2" color="text.primary">
                                                  {lessonData.content.preClassMessage}
                                                </Typography>
                                              </Box>
                                            )}
                                            {lessonData.content.postClassMessage && (
                                              <Box>
                                                <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                                                  Post-Class Message:
                                                </Typography>
                                                <Typography variant="body2" color="text.primary">
                                                  {lessonData.content.postClassMessage}
                                                </Typography>
                                              </Box>
                                            )}
                                          </Box>
                                        )}
                                      </Stack>
                                    </Box>
                                  </Collapse>
                                </Box>
                              );
                            })}
                          </List>
                        </Collapse>
                      </Box>
                    );
                  })}
                </List>
              </Paper>

              {/* Drip Content Settings — from collections */}
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  ⏰ Drip Content Settings
                </Typography>
                {loadingSettings && courseId ? (
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <CircularProgress size={20} />
                    <Typography variant="body2" color="text.secondary">Loading from course…</Typography>
                  </Stack>
                ) : (() => {
                  const drip = settingsFromApi?.drip ?? {
                    dripEnabled: courseData.dripEnabled,
                    dripMethods: courseData.dripMethods,
                    dripDisplayOption: courseData.displayOption,
                    dripHideUnlockDate: courseData.hideUnlockDate,
                    dripSendCommunication: courseData.sendCommunication
                  };
                  return (
                    <Stack spacing={1}>
                      <Typography variant="body2" color="text.secondary">
                        • Drip Enabled: {drip.dripEnabled ? 'Yes' : 'No'}
                      </Typography>
                      {drip.dripEnabled && (
                        <>
                          <Typography variant="body2" color="text.secondary">
                            • Drip Methods: {drip.dripMethods.length ? drip.dripMethods.join(', ') : 'None'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            • Display Option: {drip.dripDisplayOption}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            • Hide Unlock Date: {drip.dripHideUnlockDate ? 'Yes' : 'No'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            • Send Communication: {drip.dripSendCommunication ? 'Yes' : 'No'}
                          </Typography>
                        </>
                      )}
                    </Stack>
                  );
                })()}
              </Paper>

              {/* Certificate Settings — from collections */}
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  🏆 Certificate Settings
                </Typography>
                {loadingSettings && courseId ? (
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <CircularProgress size={20} />
                    <Typography variant="body2" color="text.secondary">Loading from course…</Typography>
                  </Stack>
                ) : (() => {
                  const cert = settingsFromApi?.certificate ?? {
                    certificateEnabled: courseData.certificateEnabled,
                    certificateTitle: courseData.certificateTitle,
                    certificateDescription: courseData.certificateDescription,
                    certificateCompletionPercentage: courseData.completionPercentage,
                    certificateTemplate: courseData.template
                  };
                  return (
                    <Stack spacing={1}>
                      <Typography variant="body2" color="text.secondary">
                        • Certificate Enabled: {cert.certificateEnabled ? 'Yes' : 'No'}
                      </Typography>
                      {cert.certificateEnabled && (
                        <>
                          <Typography variant="body2" color="text.secondary">
                            • Certificate Title: {cert.certificateTitle}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            • Completion Percentage: {cert.certificateCompletionPercentage}%
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            • Template: {cert.certificateTemplate}
                          </Typography>
                        </>
                      )}
                    </Stack>
                  );
                })()}
              </Paper>

              {/* Payment Settings — from collections */}
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  💳 Payment Settings
                </Typography>
                {loadingSettings && courseId ? (
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <CircularProgress size={20} />
                    <Typography variant="body2" color="text.secondary">Loading from course…</Typography>
                  </Stack>
                ) : (() => {
                  const pay = settingsFromApi?.payment ?? {
                    listedPrice: { INR: parseFloat(courseData.globalListPrice || '0') || 0, USD: 0, EUR: 0, GBP: 0 },
                    sellingPrice: { INR: parseFloat(courseData.globalActualPrice || '0') || 0, USD: 0, EUR: 0, GBP: 0 },
                    globalPricingEnabled: courseData.globalPricingEnabled,
                    currencySpecificPricingEnabled: courseData.currencySpecificPricingEnabled,
                    enabledCurrencies: {} as { [key: string]: boolean },
                    installmentsOn: courseData.emiEnabled,
                    installmentPeriod: courseData.installmentPeriod,
                    numberOfInstallments: courseData.numberOfInstallments,
                    bufferTime: courseData.bufferTime
                  };
                  const currencies = Object.entries(pay.enabledCurrencies || {}).filter(([, v]) => v).map(([k]) => k);
                  const activeCurrencies = currencies.length ? currencies : ['INR', 'USD', 'EUR', 'GBP'];
                  const sym: Record<string, string> = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };
                  return (
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600}>
                          Pricing Mode
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {pay.globalPricingEnabled ? 'Global pricing' : 'Currency-specific pricing'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600}>
                          Prices (from collections)
                        </Typography>
                        <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                          {activeCurrencies.map((cur) => (
                            <Typography key={cur} variant="body2" color="text.secondary">
                              {cur}: List {sym[cur] || cur}{pay.listedPrice[cur] ?? 0} → Sell {sym[cur] || cur}{pay.sellingPrice[cur] ?? 0}
                            </Typography>
                          ))}
                        </Stack>
                      </Box>
                      {pay.installmentsOn && (
                        <Box>
                          <Typography variant="subtitle2" fontWeight={600}>
                            EMI / Installments
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {pay.numberOfInstallments} installments, every {pay.installmentPeriod} days, buffer {pay.bufferTime} days
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  );
                })()}
              </Paper>

              {/* Additional Settings — from collections */}
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  ⚙️ Additional Settings
                </Typography>
                {loadingSettings && courseId ? (
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <CircularProgress size={20} />
                    <Typography variant="body2" color="text.secondary">Loading from course…</Typography>
                  </Stack>
                ) : (() => {
                  const add = settingsFromApi?.additional ?? {
                    affiliateActive: courseData.affiliateRewardEnabled,
                    affiliateRewardPercentage: parseFloat(courseData.affiliateRewardPercentage || '0') || 0,
                    watermarkRemovalEnabled: courseData.watermarkRemovalEnabled,
                    faqs: courseData.faqs.map((f) => ({ question: f.question, answer: f.answer }))
                  };
                  return (
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600}>
                          Affiliate Rewards
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {add.affiliateActive ? `${add.affiliateRewardPercentage}% commission for affiliates` : 'Disabled'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600}>
                          Watermark Removal
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {add.watermarkRemovalEnabled ? 'Enabled' : 'Disabled'}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600}>
                          FAQs
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {add.faqs.length} questions added
                        </Typography>
                      </Box>
                    </Stack>
                  );
                })()}
              </Paper>

              {/* Version history — what was saved + diff from previous (above Ready to Launch) */}
              {settingsFromApi?.publishHistory && settingsFromApi.publishHistory.length > 0 && (() => {
                const sorted = [...settingsFromApi.publishHistory]
                  .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
                return (
                  <Paper sx={{ p: 3, borderRadius: 3, bgcolor: 'rgba(108, 99, 255, 0.05)' }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      📋 Version history
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Changes go live for learners after each publish. For each version: what was saved and what changed from the previous version.
                    </Typography>
                    <Stack spacing={1.5}>
                      {sorted.map((entry, sortedIndex) => {
                        const prevEntry = sorted[sortedIndex + 1] ?? null; // previous version (older)
                        const diffLines = getDiffFromPrevious(prevEntry?.snapshot, entry.snapshot);
                        const summary = formatSnapshotSummary(entry.snapshot);
                        const hasSnapshot = summary.length > 0;
                        return (
                          <VersionHistoryEntry
                            key={`v${entry.version}-${entry.publishedAt}`}
                            version={entry.version}
                            publishedAt={entry.publishedAt}
                            summary={summary}
                            diffLines={diffLines}
                            isFirstVersion={!prevEntry}
                            hasSnapshot={hasSnapshot}
                          />
                        );
                      })}
                    </Stack>
                  </Paper>
                );
              })()}

              {/* Action Buttons */}
              <Paper sx={{ p: 3, borderRadius: 3, bgcolor: 'rgba(108, 99, 255, 0.05)' }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  🚀 Ready to Launch?
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Review all settings above and choose to publish your course or save as draft.
                </Typography>
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="outlined"
                    startIcon={<SaveIcon />}
                    onClick={handleSaveDraft}
                    disabled={savingDraft}
                    sx={{ minWidth: 150 }}
                  >
                    {savingDraft ? <CircularProgress size={20} /> : 'Save as Draft'}
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<PublishIcon />}
                    onClick={handlePublish}
                    disabled={publishing}
                    sx={{
                      minWidth: 150,
                      background: 'linear-gradient(135deg, #6C63FF 0%, #00FFC6 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5A52D5 0%, #00E6B8 100%)'
                      }
                    }}
                  >
                    {publishing ? <CircularProgress size={20} color="inherit" /> : 'Publish Course'}
                  </Button>
                </Stack>
              </Paper>

            </Stack>
          </CardContent>
        </Card>
      </motion.div>

      {/* Success Dialog */}
      <Dialog
        open={showSuccessDialog}
        onClose={() => setShowSuccessDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent sx={{ textAlign: 'center', py: 4 }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Box sx={{ mb: 3 }}>
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 0.6, repeat: 3 }}
              >
                <CelebrationIcon sx={{ fontSize: 80, color: '#4CAF50' }} />
              </motion.div>
            </Box>
            <Typography variant="h4" fontWeight={700} color="#4CAF50" gutterBottom>
              🎉 Course Published Successfully!
            </Typography>
            {courseId && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                  Course ID:
                </Typography>
                <Chip 
                  label={courseId} 
                  sx={{ 
                    bgcolor: 'rgba(76, 175, 80, 0.1)',
                    color: '#4CAF50',
                    fontWeight: 600,
                    fontFamily: 'monospace'
                  }} 
                />
              </Box>
            )}
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Your course is now live and available to students worldwide. 
              You can manage it from your dashboard.
            </Typography>
            <Alert severity="success" sx={{ mb: 2 }}>
              <AlertTitle>What's Next?</AlertTitle>
              • Share your course link with potential students<br/>
              • Monitor your course analytics<br/>
              • Respond to student questions and feedback<br/>
              • Update content as needed
            </Alert>
          </motion.div>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button
            variant="contained"
            onClick={() => {
              setShowSuccessDialog(false);
              navigate('/love/learnloop');
            }}
            sx={{
              background: 'linear-gradient(135deg, #4CAF50 0%, #45A049 100%)',
              minWidth: 120
            }}
          >
            Go to Dashboard
          </Button>
        </DialogActions>
      </Dialog>

      <ToastNotification toast={toast} onClose={hideToast} />
    </Box>
  );
};

export default PreviewPublishStep; 