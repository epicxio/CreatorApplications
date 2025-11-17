import { CardContent, Typography, styled, Box } from '@mui/material';
import { MotionCardComponent } from '../common/MotionComponents';

interface Course {
  id: string;
  title: string;
  description: string;
  progress: number;
  image: string;
  color: string;
}

interface CourseCardProps {
  course: Course;
}

const StyledCard = styled(MotionCardComponent)`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  overflow: hidden;
  height: 100%;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  }
`;

const CourseImage = styled('img')`
  width: 100%;
  height: 160px;
  object-fit: cover;
  border-bottom: 2px solid ${props => props.color};
`;

const ProgressBarContainer = styled(Box)`
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
  margin-top: 16px;
  position: relative;
`;

const ProgressBarFill = styled(Box)<{ value: number; color: string }>`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: ${props => props.value}%;
  background: ${props => props.color};
  border-radius: 4px;
  transition: width 0.3s ease;
`;

export const CourseCard = ({ course }: CourseCardProps) => {
  return (
    <StyledCard
      whileHover={{ scale: 1.02 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <CourseImage src={course.image} alt={course.title} color={course.color} />
      <CardContent>
        <Typography 
          variant="h6" 
          gutterBottom 
          sx={{ 
            color: course.color,
            fontWeight: 'bold',
          }}
        >
          {course.title}
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ 
            mb: 2,
            color: 'text.secondary',
            minHeight: '40px',
          }}
        >
          {course.description}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography 
            variant="body2" 
            sx={{ 
              color: course.color,
              fontWeight: 'medium',
            }}
          >
            Progress
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: course.color,
              fontWeight: 'bold',
            }}
          >
            {course.progress}%
          </Typography>
        </Box>
        <ProgressBarContainer>
          <ProgressBarFill value={course.progress} color={course.color} />
        </ProgressBarContainer>
      </CardContent>
    </StyledCard>
  );
}; 