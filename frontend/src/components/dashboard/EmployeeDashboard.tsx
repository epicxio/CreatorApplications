import React, { useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  Avatar,
  Tab,
  Tabs,
} from '@mui/material';
import {
  CalendarToday,
  Timeline,
  EmojiEvents,
  School,
  Assessment,
  WorkspacePremium,
  Speed,
  Grade,
  Timer,
  Lightbulb,
  LocalFireDepartment,
  Functions,
  Calculate,
  BarChart,
  CropSquare,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

// Styled Components
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- theme required by MUI styled API
const StyledCard = styled(Card)(({ theme }) => ({
  background: '#FFFFFF',
  borderRadius: '20px',
  boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
  overflow: 'visible',
  height: '100%',
}));

type MUIColor = 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';

interface CourseTitleProps {
  color?: MUIColor;
  children: React.ReactNode;
}

const CourseTitle = styled(Typography)<CourseTitleProps>(({ theme, color = 'primary' }) => ({
  fontSize: '24px',
  fontWeight: 600,
  color: theme.palette[color].main,
  marginBottom: '16px',
}));

const CourseDescription = styled(Typography)({
  color: '#666666',
  fontSize: '16px',
  marginBottom: '24px',
});

const ProgressLabel = styled(Typography)({
  color: '#666666',
  fontSize: '16px',
  marginBottom: '8px',
});

const StyledLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: '8px',
  borderRadius: '4px',
  backgroundColor: theme.palette.grey[100],
  '& .MuiLinearProgress-bar': {
    borderRadius: '4px',
  },
}));

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- theme required by MUI styled API
const CourseIcon = styled(Box)(({ theme }) => ({
  marginBottom: '16px',
  '& .MuiSvgIcon-root': {
    width: '40px',
    height: '40px',
  },
}));

const ProgressCard = styled(StyledCard)({
  marginBottom: '1rem',
});

const BadgeCard = styled(StyledCard)({
  display: 'flex',
  alignItems: 'center',
  padding: '1rem',
  gap: '1rem',
});

const BadgeAvatar = styled(Avatar)(({ theme }) => ({
  width: 60,
  height: 60,
  boxShadow: theme.shadows[2],
  '& .MuiSvgIcon-root': {
    width: 32,
    height: 32,
    color: theme.palette.common.white,
  },
}));

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

interface Course {
  id: number;
  title: string;
  description: string;
  progress: number;
  color: MUIColor;
  icon: React.ReactElement;
}

// Mock Data
const mockCourses: Course[] = [
  {
    id: 1,
    title: 'Calculus Fundamentals',
    description: 'Learn the basics of calculus including limits, derivatives, and integrals.',
    progress: 75,
    color: 'primary',
    icon: <Functions />,
  },
  {
    id: 2,
    title: 'Linear Algebra',
    description: 'Master matrices, vectors, and linear transformations.',
    progress: 45,
    color: 'secondary',
    icon: <Calculate />,
  },
  {
    id: 3,
    title: 'Statistics & Probability',
    description: 'Understand data analysis and probability concepts.',
    progress: 90,
    color: 'info',
    icon: <BarChart />,
  },
  {
    id: 4,
    title: 'Advanced Geometry',
    description: 'Explore complex geometric concepts and proofs.',
    progress: 30,
    color: 'warning',
    icon: <CropSquare />,
  },
];

const mockCalendarEvents = [
  {
    id: 1,
    title: 'Statistics Quiz',
    date: '2024-03-18 14:00',
    type: 'assessment',
  },
  {
    id: 2,
    title: 'Financial Math Workshop',
    date: '2024-03-21 10:00',
    type: 'workshop',
  },
  {
    id: 3,
    title: 'ML Math Group Study',
    date: '2024-03-23 15:00',
    type: 'study',
  },
];

const mockBadges = [
  {
    id: 1,
    name: 'Statistics Master',
    description: 'Completed Advanced Statistics with 90%+ score',
    icon: <WorkspacePremium />,
    date: '2024-03-01',
    color: 'primary',
  },
  {
    id: 2,
    name: 'Quick Learner',
    description: 'Completed 5 courses in record time',
    icon: <Speed />,
    date: '2024-02-15',
    color: 'secondary',
  },
  {
    id: 3,
    name: 'Perfect Score',
    description: '100% in Financial Mathematics Assessment',
    icon: <Grade />,
    date: '2024-03-10',
    color: 'success',
  },
  {
    id: 4,
    name: 'Speed Demon',
    description: 'Completed course 50% faster than average',
    icon: <Timer />,
    date: '2024-03-05',
    color: 'warning',
  },
  {
    id: 5,
    name: 'Problem Solver',
    description: 'Solved 100 complex problems',
    icon: <Lightbulb />,
    date: '2024-02-28',
    color: 'info',
  },
  {
    id: 6,
    name: 'On Fire',
    description: '7-day learning streak',
    icon: <LocalFireDepartment />,
    date: '2024-03-15',
    color: 'error',
  },
];

const mockAnalyticsData = [
  { month: 'Jan', progress: 65, assessmentScore: 72 },
  { month: 'Feb', progress: 78, assessmentScore: 80 },
  { month: 'Mar', progress: 85, assessmentScore: 88 },
];

export const EmployeeDashboard = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Your Learning Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        {mockCourses.map((course) => (
          <Grid item xs={12} md={6} key={course.id}>
            <StyledCard>
              <CardContent>
                <CourseIcon>
                  {React.cloneElement(course.icon, { color: course.color })}
                </CourseIcon>
                <CourseTitle color={course.color}>
                  {course.title}
                </CourseTitle>
                <CourseDescription>
                  {course.description}
                </CourseDescription>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <ProgressLabel>Progress</ProgressLabel>
                    <Typography color={course.color} fontWeight="bold">
                      {course.progress}%
                    </Typography>
                  </Box>
                  <StyledLinearProgress
                    variant="determinate"
                    value={course.progress}
                    color={course.color}
                  />
                </Box>
              </CardContent>
            </StyledCard>
          </Grid>
        ))}
      </Grid>

      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        sx={{ mt: 4, mb: 2 }}
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab icon={<CalendarToday />} label="Calendar" />
        <Tab icon={<Timeline />} label="Analytics" />
        <Tab icon={<EmojiEvents />} label="Achievements" />
      </Tabs>

      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          {mockCalendarEvents.map((event) => (
            <Grid item xs={12} key={event.id}>
              <ProgressCard>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      {event.type === 'assessment' ? <Assessment /> : <School />}
                    </Avatar>
                    <Box>
                      <Typography variant="h6">{event.title}</Typography>
                      <Typography color="text.secondary">
                        {new Date(event.date).toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </ProgressCard>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <StyledCard>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Learning Progress
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mockAnalyticsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <RechartsTooltip />
                      <Line
                        type="monotone"
                        dataKey="progress"
                        stroke="#FF4081"
                        name="Course Progress"
                      />
                      <Line
                        type="monotone"
                        dataKey="assessmentScore"
                        stroke="#7B1FA2"
                        name="Assessment Scores"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </StyledCard>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={3}>
          {mockBadges.map((badge) => (
            <Grid item xs={12} sm={6} md={4} key={badge.id}>
              <BadgeCard>
                <BadgeAvatar sx={{ bgcolor: `${badge.color}.main` }}>
                  {badge.icon}
                </BadgeAvatar>
                <Box>
                  <Typography variant="h6">{badge.name}</Typography>
                  <Typography color="text.secondary">{badge.description}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Earned on {new Date(badge.date).toLocaleDateString()}
                  </Typography>
                </Box>
              </BadgeCard>
            </Grid>
          ))}
        </Grid>
      </TabPanel>
    </Box>
  );
};