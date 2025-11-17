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
  Paper,
  IconButton,
  Tooltip
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
  BookmarkBorder as BookmarkBorderIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Course } from '../types/course';
import { courseService } from '../services/courseService';
import { progressService } from '../services/progressService';
import { useAuth } from '../context/AuthContext';
import CurriculumAccordion from '../components/learning/CurriculumAccordion';

const CourseDetailPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [isBookmarked, setIsBookmarked] = useState(false);

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
      console.error('Error loading course:', err);
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
      } else {
        setIsEnrolled(false);
        setProgress(0);
        setCompletedLessons([]);
      }
    } catch (error) {
      console.error('Error loading user progress:', error);
    }
  };

  // Handle enrollment
  const handleEnroll = async () => {
    if (!courseId || !user?._id) return;

    try {
      const response = await courseService.enrollCourse(courseId, user._id);
      
      if (response.success) {
        setIsEnrolled(true);
        setProgress(0);
        setCompletedLessons([]);
        
        // Initialize progress in local storage
        if (course) {
          progressService.initializeProgress(courseId, user._id);
        }
      } else {
        setError(response.message || 'Failed to enroll in course');
      }
    } catch (error) {
      setError('An error occurred while enrolling');
      console.error('Error enrolling:', error);
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
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      // TODO: Show toast notification
    }
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

  // Load data on component mount
  useEffect(() => {
    loadCourse();
    loadUserProgress();
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
                      Enroll Now - {formatPrice(course.sellingPrice)}
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
                </List>

                <Divider sx={{ my: 2 }} />

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
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default CourseDetailPage;
