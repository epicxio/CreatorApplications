import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Pagination,
  CircularProgress,
  Alert,
  Button,
  Drawer,
  useMediaQuery,
  useTheme,
  IconButton,
  AppBar,
  Toolbar
} from '@mui/material';
import { FilterList as FilterIcon, Search as SearchIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Course, CourseFilters } from '../types/course';
import { courseService } from '../services/courseService';
import { progressService } from '../services/progressService';
import { useAuth } from '../context/AuthContext';
import CourseCard from '../components/learning/CourseCard';
import CourseFiltersComponent from '../components/learning/CourseFilters';

const CoursesPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuth();
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCourses, setTotalCourses] = useState(0);
  const [filters, setFilters] = useState<CourseFilters>({});
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [enrolledCourses, setEnrolledCourses] = useState<Set<string>>(new Set());
  const [courseProgress, setCourseProgress] = useState<Map<string, number>>(new Map());

  // Load courses
  const loadCourses = async (pageNum: number = 1, currentFilters: CourseFilters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await courseService.getCourses(currentFilters, pageNum, 12);
      
      if (response.success) {
        setCourses(response.data.courses);
        setTotalPages(Math.ceil(response.data.total / 12));
        setTotalCourses(response.data.total);
      } else {
        setError(response.message || 'Failed to load courses');
      }
    } catch (err) {
      setError('An error occurred while loading courses');
      console.error('Error loading courses:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load user's enrolled courses and progress
  const loadUserProgress = async () => {
    if (!user?._id) return;

    try {
      const allProgress = progressService.getAllProgress(user._id);
      const enrolledSet = new Set(allProgress.map(p => p.courseId));
      const progressMap = new Map(allProgress.map(p => [p.courseId, p.overallProgress]));
      
      setEnrolledCourses(enrolledSet);
      setCourseProgress(progressMap);
    } catch (error) {
      console.error('Error loading user progress:', error);
    }
  };

  // Handle enrollment
  const handleEnroll = async (courseId: string) => {
    if (!user?._id) return;

    try {
      const response = await courseService.enrollCourse(courseId, user._id);
      
      if (response.success) {
        // Update enrolled courses
        setEnrolledCourses(prev => new Set([...Array.from(prev), courseId]));
        
        // Initialize progress
        const course = courses.find(c => c.id === courseId);
        if (course) {
          progressService.initializeProgress(courseId, user._id);
          setCourseProgress(prev => new Map([...Array.from(prev), [courseId, 0]]));
        }
      } else {
        setError(response.message || 'Failed to enroll in course');
      }
    } catch (error) {
      setError('An error occurred while enrolling');
      console.error('Error enrolling:', error);
    }
  };

  // Handle continue learning
  const handleContinue = (courseId: string) => {
    // Navigate to course detail page
    window.location.href = `/courses/${courseId}`;
  };

  // Handle filter changes
  const handleFiltersChange = (newFilters: CourseFilters) => {
    setFilters(newFilters);
    setPage(1);
    loadCourses(1, newFilters);
  };

  // Clear all filters
  const handleClearFilters = () => {
    const clearedFilters: CourseFilters = {};
    setFilters(clearedFilters);
    setPage(1);
    loadCourses(1, clearedFilters);
  };

  // Handle page change
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    loadCourses(value, filters);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Load data on component mount
  useEffect(() => {
    loadCourses();
    loadUserProgress();
  }, []);

  // Load user progress when user changes
  useEffect(() => {
    if (user?._id) {
      loadUserProgress();
    }
  }, [user?._id]);

  const renderFilters = () => (
    <CourseFiltersComponent
      filters={filters}
      onFiltersChange={handleFiltersChange}
      onClearFilters={handleClearFilters}
    />
  );

  const renderCourseGrid = () => (
    <Grid container spacing={3}>
      {courses.map((course) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={course.id}>
          <CourseCard
            course={course}
            progress={courseProgress.get(course.id) || 0}
            isEnrolled={enrolledCourses.has(course.id)}
            onEnroll={handleEnroll}
            onContinue={handleContinue}
          />
        </Grid>
      ))}
    </Grid>
  );

  const renderEmptyState = () => (
    <Box sx={{ textAlign: 'center', py: 8 }}>
      <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
        No courses found
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Try adjusting your filters or search terms
      </Typography>
      <Button variant="outlined" onClick={handleClearFilters}>
        Clear Filters
      </Button>
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
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
            <Typography variant="h3" component="h1" sx={{ 
              fontWeight: 700, 
              mb: 2,
              textAlign: 'center'
            }}>
              Discover Courses
            </Typography>
            <Typography variant="h6" sx={{ 
              textAlign: 'center',
              opacity: 0.9,
              maxWidth: 600,
              mx: 'auto'
            }}>
              Learn from the best instructors and advance your skills with our comprehensive course library
            </Typography>
          </motion.div>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
          {/* Desktop Filters */}
          {!isMobile && (
            <Box sx={{ width: 300, flexShrink: 0 }}>
              {renderFilters()}
            </Box>
          )}

          {/* Mobile Filter Button */}
          {isMobile && (
            <AppBar position="fixed" color="transparent" elevation={0} sx={{ top: 'auto', bottom: 0 }}>
              <Toolbar sx={{ justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  startIcon={<FilterIcon />}
                  onClick={() => setFiltersOpen(true)}
                  sx={{
                    background: 'linear-gradient(135deg, #6C63FF 0%, #00FFC6 100%)',
                    borderRadius: 3,
                    px: 4,
                    py: 1.5
                  }}
                >
                  Filters
                </Button>
              </Toolbar>
            </AppBar>
          )}

          {/* Main Content */}
          <Box sx={{ flexGrow: 1 }}>
            {/* Results Header */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              mb: 3,
              flexWrap: 'wrap',
              gap: 2
            }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {totalCourses} courses found
              </Typography>
              
              {isMobile && (
                <IconButton
                  onClick={() => setFiltersOpen(true)}
                  sx={{ 
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': { bgcolor: 'primary.dark' }
                  }}
                >
                  <FilterIcon />
                </IconButton>
              )}
            </Box>

            {/* Loading State */}
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress size={60} />
              </Box>
            )}

            {/* Error State */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {/* Course Grid */}
            {!loading && !error && courses.length > 0 && renderCourseGrid()}

            {/* Empty State */}
            {!loading && !error && courses.length === 0 && renderEmptyState()}

            {/* Pagination */}
            {!loading && !error && totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                  sx={{
                    '& .MuiPaginationItem-root': {
                      borderRadius: 2,
                      fontWeight: 600
                    }
                  }}
                />
              </Box>
            )}
          </Box>
        </Box>
      </Container>

      {/* Mobile Filters Drawer */}
      <Drawer
        anchor="bottom"
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        PaperProps={{
          sx: {
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            maxHeight: '80vh'
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 2 
          }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Filters
            </Typography>
            <Button onClick={() => setFiltersOpen(false)}>
              Close
            </Button>
          </Box>
          {renderFilters()}
        </Box>
      </Drawer>
    </Box>
  );
};

export default CoursesPage;
