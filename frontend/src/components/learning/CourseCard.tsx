import React from 'react';
import { Card, CardContent, CardMedia, Typography, Box, Chip, Button, LinearProgress } from '@mui/material';
import { motion } from 'framer-motion';
import { Course } from '../../types/course';
import { useNavigate } from 'react-router-dom';

interface CourseCardProps {
  course: Course;
  progress?: number;
  isEnrolled?: boolean;
  onEnroll?: (courseId: string) => void;
  onContinue?: (courseId: string) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({
  course,
  progress = 0,
  isEnrolled = false,
  onEnroll,
  onContinue
}) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/courses/${course.id}`);
  };

  const handleEnrollClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEnroll?.(course.id);
  };

  const handleContinueClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onContinue?.(course.id);
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatPrice = (price: { [currency: string]: number }): string => {
    const currency = 'INR'; // Default currency
    const amount = price[currency] || Object.values(price)[0] || 0;
    return `₹${amount}`;
  };

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          cursor: 'pointer',
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
          }
        }}
        onClick={handleCardClick}
      >
        {/* Cover Image */}
        <CardMedia
          component="img"
          height="200"
          image={course.coverImage || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=200&fit=crop'}
          alt={course.name}
          sx={{
            objectFit: 'cover',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          }}
        />

        <CardContent sx={{ flexGrow: 1, p: 3 }}>
          {/* Course Info */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" component="h3" sx={{ 
              fontWeight: 600, 
              mb: 1,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              lineHeight: 1.3
            }}>
              {course.name}
            </Typography>
            
            {course.subtitle && (
              <Typography variant="body2" color="text.secondary" sx={{ 
                mb: 1,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {course.subtitle}
              </Typography>
            )}

            <Typography variant="body2" color="text.secondary" sx={{ 
              mb: 2,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              lineHeight: 1.4
            }}>
              {course.description}
            </Typography>
          </Box>

          {/* Instructor */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box
              component="img"
              src={course.instructor.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'}
              alt={course.instructor.name}
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                mr: 1.5,
                objectFit: 'cover'
              }}
            />
            <Typography variant="body2" color="text.secondary">
              by {course.instructor.name}
            </Typography>
          </Box>

          {/* Tags */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
            {course.tags.slice(0, 3).map((tag, index) => (
              <Chip
                key={index}
                label={tag}
                size="small"
                variant="outlined"
                sx={{
                  fontSize: '0.75rem',
                  height: 24,
                  '& .MuiChip-label': {
                    px: 1
                  }
                }}
              />
            ))}
            {course.tags.length > 3 && (
              <Chip
                label={`+${course.tags.length - 3}`}
                size="small"
                variant="outlined"
                sx={{
                  fontSize: '0.75rem',
                  height: 24,
                  '& .MuiChip-label': {
                    px: 1
                  }
                }}
              />
            )}
          </Box>

          {/* Course Stats */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" color="text.secondary">
                {formatDuration(course.duration)}
              </Typography>
              <Chip
                label={course.level}
                size="small"
                color={course.level === 'Beginner' ? 'success' : course.level === 'Intermediate' ? 'warning' : 'error'}
                sx={{ fontSize: '0.75rem', height: 20 }}
              />
            </Box>
            <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
              {formatPrice(course.sellingPrice)}
            </Typography>
          </Box>

          {/* Progress Bar (if enrolled) */}
          {isEnrolled && progress > 0 && (
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
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
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: 'rgba(0,0,0,0.1)',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 3,
                    background: 'linear-gradient(90deg, #6C63FF 0%, #00FFC6 100%)'
                  }
                }}
              />
            </Box>
          )}

          {/* Action Button */}
          <Button
            variant={isEnrolled ? "contained" : "outlined"}
            fullWidth
            onClick={isEnrolled ? handleContinueClick : handleEnrollClick}
            sx={{
              borderRadius: 2,
              py: 1.5,
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '0.95rem',
              background: isEnrolled 
                ? 'linear-gradient(135deg, #6C63FF 0%, #00FFC6 100%)'
                : 'transparent',
              borderColor: '#6C63FF',
              color: isEnrolled ? 'white' : '#6C63FF',
              '&:hover': {
                background: isEnrolled 
                  ? 'linear-gradient(135deg, #5a52e5 0%, #00e6b8 100%)'
                  : 'rgba(108, 99, 255, 0.1)',
                borderColor: '#5a52e5'
              }
            }}
          >
            {isEnrolled ? 'Continue Learning' : 'Enroll Now'}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CourseCard;
