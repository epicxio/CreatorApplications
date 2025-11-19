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
  Divider,
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
  IconButton,
  Grid
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  PlayArrow as PlayArrowIcon,
  Description as DescriptionIcon,
  Quiz as QuizIcon,
  AssignmentTurnedIn as AssignmentIcon,
  LiveTv as LiveTvIcon,
  AudioFile as AudioFileIcon,
  MonetizationOn as MonetizationOnIcon,
  CreditCard as CreditCardIcon,
  Receipt as ReceiptIcon,
  WaterDrop as WaterDropIcon,
  QuestionAnswer as QuestionAnswerIcon,
  Visibility as VisibilityIcon,
  Schedule as ScheduleIcon,
  LocalOffer as LocalOfferIcon,
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
import { motion, AnimatePresence } from 'framer-motion';

interface PreviewPublishStepProps {
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

const PreviewPublishStep: React.FC<PreviewPublishStepProps> = ({ courseData: propsCourseData }) => {
  console.log('PreviewPublishStep rendered with data:', propsCourseData);
  
  const [publishing, setPublishing] = React.useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = React.useState(false);
  const [savingDraft, setSavingDraft] = React.useState(false);
  
  // State for expanded modules and lessons
  const [expandedModules, setExpandedModules] = React.useState<Set<string>>(new Set());
  const [expandedLessons, setExpandedLessons] = React.useState<Set<string>>(new Set());
  
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
    dripEnabled: true,
    dripMethods: ["Time-based", "Completion-based"],
    displayOption: "Show all lessons",
    hideUnlockDate: false,
    sendCommunication: true,
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
    setPublishing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setPublishing(false);
    setShowSuccessDialog(true);
  };

  const handleSaveDraft = async () => {
    setSavingDraft(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSavingDraft(false);
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

  const formatDuration = (
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
                            {module.lessons.map((lesson, lessonIndex) => {
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

              {/* Drip Content Settings */}
              {courseData.dripEnabled && (
                <Paper sx={{ p: 3, borderRadius: 3 }}>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    ⏰ Drip Content Settings
                  </Typography>
                  <Stack spacing={1}>
                    <Typography variant="body2" color="text.secondary">
                      • Drip Methods: {courseData.dripMethods.join(', ')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      • Display Option: {courseData.displayOption}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      • Hide Unlock Date: {courseData.hideUnlockDate ? 'Yes' : 'No'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      • Send Communication: {courseData.sendCommunication ? 'Yes' : 'No'}
                    </Typography>
                  </Stack>
                </Paper>
              )}

              {/* Certificate Settings */}
              {courseData.certificateEnabled && (
                <Paper sx={{ p: 3, borderRadius: 3 }}>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    🏆 Certificate Settings
                  </Typography>
                  <Stack spacing={1}>
                    <Typography variant="body2" color="text.secondary">
                      • Certificate Title: {courseData.certificateTitle}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      • Completion Percentage: {courseData.completionPercentage}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      • Template: {courseData.template}
                    </Typography>
                  </Stack>
                </Paper>
              )}

              {/* Payment Settings */}
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  💳 Payment Settings
                </Typography>
                <Stack spacing={2}>
                  {courseData.globalPricingEnabled && (
                    <Box>
                      <Typography variant="subtitle2" fontWeight={600}>
                        Global Pricing
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        List Price: ${courseData.globalListPrice} | Actual Price: ${courseData.globalActualPrice}
                      </Typography>
                    </Box>
                  )}
                  {courseData.emiEnabled && (
                    <Box>
                      <Typography variant="subtitle2" fontWeight={600}>
                        EMI Options
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {courseData.numberOfInstallments} installments over {courseData.installmentPeriod} months
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </Paper>

              {/* Additional Settings */}
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  ⚙️ Additional Settings
                </Typography>
                <Stack spacing={2}>
                  {courseData.affiliateRewardEnabled && (
                    <Box>
                      <Typography variant="subtitle2" fontWeight={600}>
                        Affiliate Rewards
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {courseData.affiliateRewardPercentage}% commission for affiliates
                      </Typography>
                    </Box>
                  )}
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600}>
                      Watermark Removal
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {courseData.watermarkRemovalEnabled ? 'Enabled' : 'Disabled'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600}>
                      FAQs
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {courseData.faqs.length} questions added
                    </Typography>
                  </Box>
                </Stack>
              </Paper>

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
            onClick={() => setShowSuccessDialog(false)}
            sx={{
              background: 'linear-gradient(135deg, #4CAF50 0%, #45A049 100%)',
              minWidth: 120
            }}
          >
            Go to Dashboard
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PreviewPublishStep; 