import { CardContent, Typography, Box, LinearProgress, styled } from '@mui/material';
import { MotionCardComponent } from '../common/MotionComponents';

interface Course {
  id: string;
  title: string;
  progress: number;
}

interface ProgressTrackerProps {
  courses: Course[];
}

const StyledCard = styled(MotionCardComponent)`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  height: 100%;
`;

const ProgressItem = styled(Box)`
  margin: 1rem 0;
`;

const ProgressHeader = styled(Box)`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
`;

const ProgressBar = styled(LinearProgress)`
  height: 8px;
  border-radius: 4px;
`;

export const ProgressTracker = ({ courses }: ProgressTrackerProps) => {
  const totalProgress = courses.reduce((acc, course) => acc + course.progress, 0) / courses.length;

  return (
    <StyledCard whileHover={{ scale: 1.02 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Overall Progress
        </Typography>
        <ProgressItem>
          <ProgressHeader>
            <Typography variant="body2">Total Completion</Typography>
            <Typography variant="body2">{Math.round(totalProgress)}%</Typography>
          </ProgressHeader>
          <ProgressBar variant="determinate" value={totalProgress} />
        </ProgressItem>

        <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
          Course Progress
        </Typography>
        {courses.map((course) => (
          <ProgressItem key={course.id}>
            <ProgressHeader>
              <Typography variant="body2">{course.title}</Typography>
              <Typography variant="body2">{course.progress}%</Typography>
            </ProgressHeader>
            <ProgressBar variant="determinate" value={course.progress} />
          </ProgressItem>
        ))}
      </CardContent>
    </StyledCard>
  );
}; 