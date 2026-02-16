import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Breadcrumbs,
  Link,
  IconButton,
  Paper,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  VolumeUp as VolumeUpIcon,
  CheckCircle as CheckIcon,
  NavigateBefore as PrevIcon,
  NavigateNext as NextIcon,
  Note as NoteIcon,
  Close as CloseIcon,
  Audiotrack as AudioTrackIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Course, Lesson, AssignmentSubmission, LessonAudioFile } from '../types/course';
import { courseService } from '../services/courseService';
import { progressService } from '../services/progressService';
import { useAuth } from '../context/AuthContext';
import QuizComponent from '../components/learning/QuizComponent';
import AssignmentComponent from '../components/learning/AssignmentComponent';
import CommentsComponent from '../components/learning/CommentsComponent';
import NotesComponent from '../components/learning/NotesComponent';
import uploadService from '../services/uploadService';

const LessonPlayerPage: React.FC = () => {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars -- setIsPlaying used in video handlers
  const [isPlaying, setIsPlaying] = useState(false);
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars -- progress value used in sidebar
  const [progress, setProgress] = useState(0);
  const [showNotes, setShowNotes] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  // Load course and lesson data
  const loadData = async () => {
    if (!courseId || !lessonId || !user?._id) return;

    try {
      setLoading(true);
      setError(null);
      
      // Load course
      const courseResponse = await courseService.getCourse(courseId);
      if (!courseResponse.success) {
        setError(courseResponse.message || 'Course not found');
        return;
      }
      
      const courseData = courseResponse.data;
      setCourse(courseData);
      
      // Find lesson
      const foundLesson = courseData.modules
        .flatMap(module => module.lessons)
        .find(l => l.id === lessonId);
      
      if (!foundLesson) {
        setError('Lesson not found');
        return;
      }
      
      setLesson(foundLesson);

      // Check if lesson is completed (from backend, with localStorage fallback)
      const progressResponse = await courseService.getProgress(courseId, user._id);
      if (progressResponse.success && progressResponse.data) {
        setIsCompleted(progressResponse.data.completedLessons?.includes(lessonId) ?? false);
        progressService.syncProgressFromApi(courseId, user._id, {
          overallProgress: progressResponse.data.overallProgress,
          completedLessons: progressResponse.data.completedLessons,
          lastAccessed: progressResponse.data.lastAccessed,
          enrolledAt: progressResponse.data.enrolledAt
        });
      } else {
        const userProgress = progressService.getCourseProgress(courseId, user._id);
        setIsCompleted(userProgress?.completedLessons.includes(lessonId) ?? false);
      }
    } catch {
      setError('An error occurred while loading the lesson');
    } finally {
      setLoading(false);
    }
  };

  // Mark lesson as completed
  const handleCompleteLesson = async () => {
    if (!courseId || !lessonId || !user?._id || !course) return;

    try {
      // Update progress in local storage
      progressService.completeLesson(courseId, lessonId, user._id, course);

      // Update progress in backend
      await courseService.completeLesson(courseId, lessonId, user._id);
      
      setIsCompleted(true);
    } catch {
      // Complete lesson failed
    }
  };

  // Handle quiz completion
  const handleQuizComplete = (passed: boolean) => {
    // Auto-complete lesson if quiz is passed
    if (passed) {
      handleCompleteLesson();
    }
  };

  // Handle assignment submission
  const handleAssignmentSubmit = (_submission: Omit<AssignmentSubmission, 'id' | 'submittedAt' | 'status'>) => {
    // Auto-complete lesson after assignment submission
    handleCompleteLesson();
  };

  // Navigate to previous lesson
  const handlePreviousLesson = () => {
    if (!course) return;
    
    const allLessons = course.modules.flatMap(module => module.lessons);
    const currentIndex = allLessons.findIndex(l => l.id === lessonId);
    
    if (currentIndex > 0) {
      const prevLesson = allLessons[currentIndex - 1];
      navigate(`/courses/${courseId}/lesson/${prevLesson.id}`);
    }
  };

  // Navigate to next lesson
  const handleNextLesson = () => {
    if (!course) return;
    
    const allLessons = course.modules.flatMap(module => module.lessons);
    const currentIndex = allLessons.findIndex(l => l.id === lessonId);
    
    if (currentIndex < allLessons.length - 1) {
      const nextLesson = allLessons[currentIndex + 1];
      navigate(`/courses/${courseId}/lesson/${nextLesson.id}`);
    }
  };

  // Get current lesson index
  const getCurrentLessonIndex = () => {
    if (!course) return { current: 0, total: 0 };
    
    const allLessons = course.modules.flatMap(module => module.lessons);
    const currentIndex = allLessons.findIndex(l => l.id === lessonId);
    
    return {
      current: currentIndex + 1,
      total: allLessons.length
    };
  };

  // Format time in MM:SS format
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle video progress tracking
  const handleVideoTimeUpdate = (event: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = event.currentTarget;
    const currentTime = video.currentTime;
    const duration = video.duration;
    
    if (duration > 0) {
      setVideoProgress(currentTime);
      setVideoDuration(duration);
      
      // Save progress to localStorage (only if more than 5 seconds watched)
      if (currentTime > 5) {
        const progressKey = `video_progress_${lessonId}`;
        localStorage.setItem(progressKey, currentTime.toString());
      }
    }
  };

  // Load saved video progress
  const loadVideoProgress = () => {
    if (lessonId) {
      const progressKey = `video_progress_${lessonId}`;
      const savedProgress = localStorage.getItem(progressKey);
      if (savedProgress) {
        const progressValue = parseFloat(savedProgress);
        setVideoProgress(progressValue);
      }
    }
  };

  // Handle jump to progress
  const handleJumpToProgress = () => {
    if (videoRef.current && videoProgress > 0) {
      videoRef.current.currentTime = videoProgress;
    }
  };

  // Render video player
  const renderVideoPlayer = () => (
    <Box>
      <Box sx={{ position: 'relative', width: '100%', height: 0, pb: '56.25%' }}>
        <Box
          ref={videoRef}
          component="video"
          controls
          autoPlay
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            borderRadius: 2,
            overflow: 'hidden'
          }}
          onEnded={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onTimeUpdate={handleVideoTimeUpdate}
          onLoadedMetadata={(e) => {
            const video = e.currentTarget;
            setVideoDuration(video.duration);
            loadVideoProgress();
          }}
          onCanPlay={(e) => {
            const video = e.currentTarget;
            if (video.duration > 0) {
              setVideoDuration(video.duration);
            }
          }}
        >
          <source src={lesson?.content.videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </Box>
      </Box>
      
      {/* Video Progress and Duration */}
      <Box sx={{ mt: 2 }}>
        
        {/* Where you left off */}
        {videoProgress > 0 && videoProgress < videoDuration && (
          <Box 
            onClick={handleJumpToProgress}
            sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              mb: 2, 
              px: 2,
              py: 1.5,
              bgcolor: 'primary.50',
              border: '1px solid',
              borderColor: 'primary.200',
              borderRadius: 1,
              cursor: 'pointer',
              '&:hover': {
                bgcolor: 'primary.100',
                borderColor: 'primary.300'
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            <Typography variant="body2" color="primary.main" sx={{ fontWeight: 600 }}>
              📍 Where you left off
            </Typography>
            <Typography variant="body2" color="primary.main" sx={{ fontWeight: 600 }}>
              {formatTime(videoProgress)} / {formatTime(videoDuration)}
            </Typography>
          </Box>
        )}
        
        {/* Video Duration */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          px: 2,
          py: 1,
          bgcolor: 'rgba(0,0,0,0.02)',
          borderRadius: 1
        }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
            Duration
          </Typography>
          <Typography variant="body2" color="text.primary" sx={{ fontWeight: 600 }}>
            {Math.floor(lesson?.duration / 60)}h {lesson?.duration % 60}m
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  const resolveMediaUrl = (url?: string | null) => {
    if (!url) return '';
    return uploadService.getFileUrl(url);
  };

  // Render text content
  const renderTextContent = () => (
    <Paper sx={{ p: 4, borderRadius: 2 }}>
      <Typography
        variant="body1"
        sx={{
          lineHeight: 1.8,
          fontSize: '1.1rem',
          whiteSpace: 'pre-line'
        }}
      >
        {lesson?.content.textContent}
      </Typography>
    </Paper>
  );

  // Render audio player
  const renderAudioPlayer = () => {
    const audioSources: LessonAudioFile[] = lesson?.content?.audioFiles && lesson.content.audioFiles.length > 0
      ? lesson.content.audioFiles
      : lesson?.content?.audioUrl
        ? [{
            url: lesson.content.audioUrl,
            name: lesson?.title || 'Audio',
            size: 0
          }]
        : [];

    const primaryAudio = audioSources[0];
    const audioUrl = primaryAudio?.url ? resolveMediaUrl(primaryAudio.url) : '';

    if (!audioUrl) {
      return (
        <Paper sx={{ p: 4, borderRadius: 2 }}>
          <Alert severity="warning">No audio file is available for this lesson.</Alert>
        </Paper>
      );
    }

    return (
      <Paper sx={{ p: 4, borderRadius: 2, textAlign: 'center' }}>
        <Box sx={{ mb: 3 }}>
          <VolumeUpIcon sx={{ fontSize: 60, color: 'primary.main' }} />
        </Box>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {lesson?.title}
        </Typography>
        <Box
          component="audio"
          controls
          sx={{ width: '100%', maxWidth: 400 }}
          onEnded={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        >
          <source src={audioUrl} type="audio/mpeg" />
          Your browser does not support the audio element.
        </Box>
        
        {/* Audio Duration */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mt: 3, 
          px: 2,
          py: 1,
          bgcolor: 'rgba(0,0,0,0.02)',
          borderRadius: 1,
          maxWidth: 400,
          mx: 'auto'
        }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
            Duration
          </Typography>
          <Typography variant="body2" color="text.primary" sx={{ fontWeight: 600 }}>
            {Math.floor((lesson?.duration || 0) / 60)}h {(lesson?.duration || 0) % 60}m
          </Typography>
        </Box>

        {audioSources.length > 0 && (
          <List sx={{ mt: 3, maxWidth: 400, mx: 'auto', textAlign: 'left' }}>
            {audioSources.map((audio, idx) => (
              <ListItem key={`${audio.url}-${idx}`} disableGutters sx={{ py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <AudioTrackIcon sx={{ color: 'primary.main' }} />
                </ListItemIcon>
                <ListItemText
                  primary={audio.name || `Audio ${idx + 1}`}
                  secondary={audio.storagePath || audio.url}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
    );
  };

  // Render quiz content
  const renderQuizContent = () => {
    if (!lesson?.content.questions || lesson.content.questions.length === 0) {
      return (
        <Paper sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Quiz: {lesson?.title}
          </Typography>
          <Alert severity="info" sx={{ mb: 3 }}>
            No quiz questions available for this lesson.
          </Alert>
        </Paper>
      );
    }

    return (
      <QuizComponent
        courseId={courseId!}
        lessonId={lessonId!}
        onComplete={handleQuizComplete}
      />
    );
  };

  // Render assignment content
  const renderAssignmentContent = () => {
    if (!lesson?.content.instructions) {
      return (
        <Paper sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Assignment: {lesson?.title}
          </Typography>
          <Alert severity="info" sx={{ mb: 3 }}>
            No assignment instructions available for this lesson.
          </Alert>
        </Paper>
      );
    }

    return (
      <AssignmentComponent
        instructions={lesson.content.instructions}
        submissionType={lesson.content.submissionType || 'text'}
        maxFileSize={lesson.content.maxFileSize}
        allowedFileTypes={lesson.content.allowedFileTypes}
        onSubmit={handleAssignmentSubmit}
        onExit={() => navigate(`/courses/${courseId}`)}
      />
    );
  };

  // Render live session content
  const renderLiveContent = () => (
    <Paper sx={{ p: 4, borderRadius: 2, textAlign: 'center' }}>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
        Live Session: {lesson?.title}
      </Typography>
      <Alert severity="info" sx={{ mb: 3 }}>
        Live session functionality will be implemented in the next phase.
      </Alert>
      <Typography variant="body1" sx={{ mb: 3 }}>
        {lesson?.content.preClassMessage}
      </Typography>
      <Button
        variant="contained"
        size="large"
        href={lesson?.content.meetingLink}
        target="_blank"
        sx={{
          background: 'linear-gradient(135deg, #6C63FF 0%, #00FFC6 100%)',
          px: 4,
          py: 1.5
        }}
      >
        Join Live Session
      </Button>
    </Paper>
  );

  // Render lesson content based on type
  const renderLessonContent = () => {
    if (!lesson) return null;

    switch (lesson.type) {
      case 'Video':
        return renderVideoPlayer();
      case 'Text':
        return renderTextContent();
      case 'Audio':
        return renderAudioPlayer();
      case 'Quiz':
        return renderQuizContent();
      case 'Assignment':
        return renderAssignmentContent();
      case 'Live':
        return renderLiveContent();
      default:
        return (
          <Alert severity="error">
            Unsupported lesson type: {lesson.type}
          </Alert>
        );
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, lessonId, user?._id]);

  // Load video progress when lesson changes
  useEffect(() => {
    if (lessonId) {
      loadVideoProgress();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error || !course || !lesson) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || 'Lesson not found'}
        </Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(`/courses/${courseId}`)}>
          Back to Course
        </Button>
      </Container>
    );
  }

  const { current, total } = getCurrentLessonIndex();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <Box sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider', py: 2 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton onClick={() => navigate(`/courses/${courseId}`)}>
                <ArrowBackIcon />
              </IconButton>
              <Box>
                <Breadcrumbs>
                  <Link
                    component="button"
                    variant="body2"
                    onClick={() => navigate('/courses')}
                    sx={{ textDecoration: 'none' }}
                  >
                    Courses
                  </Link>
                  <Link
                    component="button"
                    variant="body2"
                    onClick={() => navigate(`/courses/${courseId}`)}
                    sx={{ textDecoration: 'none' }}
                  >
                    {course.name}
                  </Link>
                  <Typography variant="body2" color="text.primary">
                    {lesson.title}
                  </Typography>
                </Breadcrumbs>
                <Typography variant="h6" sx={{ fontWeight: 600, mt: 0.5 }}>
                  {lesson.title}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" color="text.secondary">
                {current} of {total}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton
                  onClick={handlePreviousLesson}
                  disabled={current === 1}
                  size="small"
                >
                  <PrevIcon />
                </IconButton>
                <IconButton
                  onClick={handleNextLesson}
                  disabled={current === total}
                  size="small"
                >
                  <NextIcon />
                </IconButton>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={4}>
          {/* Main Content */}
          <Grid item xs={12} lg={8}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Main Content - Always Visible */}
              <Box sx={{ position: 'relative' }}>
                {/* Main Content - Always Full Width */}
                <Card sx={{ mb: 3 }}>
                  <CardContent sx={{ p: 0 }}>
                    {renderLessonContent()}
                  </CardContent>
                </Card>

                {/* Action Buttons - Integrated After Content */}
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      gap: 3,
                      flexWrap: 'wrap'
                    }}>
                      {/* Notes Actions */}
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <Button
                          variant={showNotes ? "contained" : "outlined"}
                          startIcon={<NoteIcon />}
                          onClick={() => setShowNotes(!showNotes)}
                          sx={{
                            background: showNotes ? 'linear-gradient(135deg, #6C63FF 0%, #00FFC6 100%)' : 'transparent',
                            borderColor: '#6C63FF',
                            color: showNotes ? 'white' : '#6C63FF',
                            px: 3,
                            py: 1.5,
                            fontWeight: 600,
                            borderRadius: 2,
                            '&:hover': {
                              background: showNotes ? 'linear-gradient(135deg, #5a52e5 0%, #00e6b8 100%)' : 'rgba(108, 99, 255, 0.1)',
                              borderColor: '#5a52e5'
                            }
                          }}
                        >
                          {showNotes ? 'Hide Notes' : 'Show Notes'}
                        </Button>
                        
                        <Button
                          variant="outlined"
                          startIcon={<NoteIcon />}
                          onClick={() => setShowNotes(true)}
                          sx={{
                            borderColor: '#6C63FF',
                            color: '#6C63FF',
                            px: 3,
                            py: 1.5,
                            fontWeight: 600,
                            borderRadius: 2,
                            '&:hover': {
                              borderColor: '#5a52e5',
                              backgroundColor: 'rgba(108, 99, 255, 0.1)'
                            }
                          }}
                        >
                          Take Notes
                        </Button>
                      </Box>

                      {/* Completion Action */}
                      <Box>
                        {!isCompleted ? (
                          <Button
                            variant="contained"
                            size="large"
                            startIcon={<CheckIcon />}
                            onClick={handleCompleteLesson}
                            sx={{
                              background: 'linear-gradient(135deg, #6C63FF 0%, #00FFC6 100%)',
                              px: 4,
                              py: 1.5,
                              fontWeight: 600,
                              borderRadius: 2,
                              '&:hover': {
                                background: 'linear-gradient(135deg, #5a52e5 0%, #00e6b8 100%)',
                                transform: 'translateY(-2px)'
                              },
                              transition: 'all 0.2s ease-in-out',
                              boxShadow: '0 4px 20px rgba(108, 99, 255, 0.3)'
                            }}
                          >
                            Mark as Complete
                          </Button>
                        ) : (
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 2,
                            bgcolor: 'success.50',
                            border: '1px solid',
                            borderColor: 'success.200',
                            borderRadius: 2,
                            px: 3,
                            py: 2
                          }}>
                            <CheckIcon sx={{ fontSize: 24, color: 'success.main' }} />
                            <Typography variant="body1" sx={{ color: 'success.main', fontWeight: 600 }}>
                              Lesson Completed
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>

                {/* Lesson Description - Simple Text Below Video */}
                {lesson.description && (
                  <Typography variant="body1" sx={{ 
                    lineHeight: 1.7, 
                    mb: 3, 
                    color: 'text.secondary',
                    fontSize: '0.95rem'
                  }}>
                    {lesson.description}
                  </Typography>
                )}

                {/* Comments Section - Always Visible */}
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                      Comments & Discussion
                    </Typography>
                    <CommentsComponent
                      lessonId={lessonId!}
                      onCommentAdded={() => {}}
                    />
                  </CardContent>
                </Card>

                {/* Notes Modal - Big Popup */}
                {showNotes && (
                  <Box
                    sx={{
                      position: 'fixed',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: 'rgba(0, 0, 0, 0.5)',
                      zIndex: 1300,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      p: 1
                    }}
                    onClick={() => setShowNotes(false)}
                  >
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        width: '100%',
                        maxWidth: '95vw',
                        maxHeight: '95vh',
                        overflow: 'hidden'
                      }}
                    >
                      <Card sx={{ 
                        width: '100%', 
                        height: '100%',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                        borderRadius: 3,
                        display: 'flex',
                        flexDirection: 'column'
                      }}>
                        {/* Modal Header */}
                        <Box sx={{ 
                          p: 2, 
                          borderBottom: 1, 
                          borderColor: 'divider',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          bgcolor: 'background.paper',
                          minHeight: '60px'
                        }}>
                          <Typography variant="h5" sx={{ fontWeight: 600 }}>
                            Notes
                          </Typography>
                          <IconButton
                            onClick={() => setShowNotes(false)}
                            sx={{
                              bgcolor: 'rgba(0,0,0,0.05)',
                              '&:hover': {
                                bgcolor: 'rgba(0,0,0,0.1)'
                              }
                            }}
                          >
                            <CloseIcon />
                          </IconButton>
                        </Box>
                        
                        {/* Modal Content */}
                        <Box sx={{ 
                          flex: 1, 
                          overflow: 'hidden',
                          p: 0
                        }}>
                          <NotesComponent
                            lessonId={lessonId!}
                            onNoteAdded={() => {}}
                            onNoteUpdated={() => {}}
                            onNoteDeleted={() => {}}
                          />
                        </Box>
                      </Card>
                    </motion.div>
                  </Box>
                )}
              </Box>

            </motion.div>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} lg={4}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {/* Course Progress */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Course Progress
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Overall Progress
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

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Current Lesson
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {current} of {total}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<PrevIcon />}
                      onClick={handlePreviousLesson}
                      disabled={current === 1}
                      fullWidth
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      endIcon={<NextIcon />}
                      onClick={handleNextLesson}
                      disabled={current === total}
                      fullWidth
                    >
                      Next
                    </Button>
                  </Box>
                </CardContent>
              </Card>

              {/* Course Curriculum */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Course Curriculum
                  </Typography>
                  
                  <List sx={{ p: 0 }}>
                    {course.modules?.map((module, moduleIndex) => (
                      <React.Fragment key={module.id}>
                        <ListItem sx={{ px: 0, py: 1 }}>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <Box sx={{ 
                              width: 24, 
                              height: 24, 
                              borderRadius: '50%', 
                              bgcolor: 'primary.main', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              color: 'white',
                              fontSize: '0.75rem',
                              fontWeight: 600
                            }}>
                              {moduleIndex + 1}
                            </Box>
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                {module.title}
                              </Typography>
                            }
                            secondary={
                              <Typography variant="body2" color="text.secondary">
                                {module.lessons?.length || 0} lessons
                              </Typography>
                            }
                          />
                        </ListItem>
                        
                        {module.lessons?.map((lessonItem, _lessonIndex) => (
                          <ListItem key={lessonItem.id} sx={{ px: 0, py: 0.5, pl: 4 }}>
                            <ListItemIcon sx={{ minWidth: 24 }}>
                              <Box sx={{ 
                                width: 16, 
                                height: 16, 
                                borderRadius: '50%', 
                                bgcolor: lessonItem.id === lessonId ? 'primary.main' : 'grey.300',
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center'
                              }}>
                                {lessonItem.id === lessonId && (
                                  <Box sx={{ 
                                    width: 6, 
                                    height: 6, 
                                    borderRadius: '50%', 
                                    bgcolor: 'white'
                                  }} />
                                )}
                              </Box>
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Typography 
                                  variant="body2" 
                                  sx={{ 
                                    fontWeight: lessonItem.id === lessonId ? 600 : 400,
                                    color: lessonItem.id === lessonId ? 'primary.main' : 'text.primary'
                                  }}
                                >
                                  {lessonItem.title}
                                </Typography>
                              }
                              secondary={
                                <Typography variant="caption" color="text.secondary">
                                  {Math.floor(lessonItem.duration / 60)}m {lessonItem.duration % 60}s
                                </Typography>
                              }
                            />
                          </ListItem>
                        ))}
                      </React.Fragment>
                    ))}
                  </List>
                </CardContent>
              </Card>

            </motion.div>
          </Grid>
        </Grid>
      </Container>

    </Box>
  );
};

export default LessonPlayerPage;
