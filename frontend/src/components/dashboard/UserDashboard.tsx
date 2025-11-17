import { Box, Typography, Grid } from '@mui/material';
import { motion } from 'framer-motion';
import { CourseCard } from './CourseCard';
import { ProgressTracker } from './ProgressTracker';

// Mock course data
const mockCourses = [
  {
    id: '1',
    title: 'Calculus Fundamentals',
    description: 'Learn the basics of calculus including limits, derivatives, and integrals.',
    progress: 75,
    image: '/assets/courses/calculus.svg',
    color: '#FF4081'
  },
  {
    id: '2',
    title: 'Linear Algebra',
    description: 'Master matrices, vectors, and linear transformations.',
    progress: 45,
    image: '/assets/courses/algebra.svg',
    color: '#7B1FA2'
  },
  {
    id: '3',
    title: 'Statistics & Probability',
    description: 'Understand data analysis and probability concepts.',
    progress: 90,
    image: '/assets/courses/statistics.svg',
    color: '#00BCD4'
  },
  {
    id: '4',
    title: 'Advanced Geometry',
    description: 'Explore complex geometric concepts and proofs.',
    progress: 30,
    image: '/assets/courses/geometry.svg',
    color: '#FFC107'
  }
];

export const UserDashboard = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography
        variant="h4"
        component={motion.h4}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        sx={{
          mb: 4,
          color: '#FF4081',
          fontWeight: 'bold',
        }}
      >
        Your Learning Dashboard
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Grid container spacing={3}>
            {mockCourses.map((course) => (
              <Grid item xs={12} sm={6} md={6} key={course.id}>
                <CourseCard course={course} />
              </Grid>
            ))}
          </Grid>
        </Grid>

        <Grid item xs={12} md={4}>
          <ProgressTracker courses={mockCourses} />
        </Grid>
      </Grid>
    </Box>
  );
}; 