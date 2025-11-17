import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  LinearProgress,
  Paper,
  Divider
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  School as SchoolIcon,
  Analytics as AnalyticsIcon,
  LiveTv as LiveTvIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  AccessTime as AccessTimeIcon,
  PlayArrow as PlayIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { progressService } from '../services/progressService';
import LearningAnalytics from '../components/learning/LearningAnalytics';
import LiveSessionsComponent from '../components/learning/LiveSessionsComponent';
import { useNavigate } from 'react-router-dom';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`learning-tabpanel-${index}`}
      aria-labelledby={`learning-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const LearningDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);

  // Get learning statistics
  const stats = user?._id ? progressService.getLearningStats(user._id) : {
    totalCourses: 0,
    completedCourses: 0,
    totalTimeSpent: 0,
    averageCompletionRate: 0
  };

  // Mock recent courses data
  const recentCourses = [
    {
      id: '1',
      name: 'Motion Design 101',
      progress: 75,
      lastAccessed: '2025-01-20T10:30:00Z',
      nextLesson: 'Understanding Keyframes',
      instructor: 'Sarah Chen'
    },
    {
      id: '2',
      name: 'Web Development Bootcamp',
      progress: 45,
      lastAccessed: '2025-01-19T14:20:00Z',
      nextLesson: 'CSS Styling Basics',
      instructor: 'Mike Johnson'
    },
    {
      id: '3',
      name: 'Digital Marketing Mastery',
      progress: 90,
      lastAccessed: '2025-01-18T16:45:00Z',
      nextLesson: 'Final Project',
      instructor: 'Emily Rodriguez'
    }
  ];

  // Mock upcoming live sessions
  const upcomingSessions = [
    {
      id: '1',
      title: 'Q&A Session: Motion Design',
      startTime: '2025-01-25T14:00:00Z',
      instructor: 'Sarah Chen',
      participants: 23
    },
    {
      id: '2',
      title: 'Live Coding: Web Development',
      startTime: '2025-01-28T10:00:00Z',
      instructor: 'Mike Johnson',
      participants: 67
    }
  ];

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return date.toLocaleDateString();
  };

  const handleContinueCourse = (courseId: string) => {
    navigate(`/courses/${courseId}`);
  };

  const handleJoinSession = (sessionId: string) => {
    // Navigate to live session or open meeting link
    console.log('Joining session:', sessionId);
  };

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
              Learning Dashboard
            </Typography>
            <Typography variant="h6" sx={{ 
              textAlign: 'center',
              opacity: 0.9,
              maxWidth: 600,
              mx: 'auto'
            }}>
              Track your progress, join live sessions, and continue your learning journey
            </Typography>
          </motion.div>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Quick Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                      <SchoolIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {stats.totalCourses}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Courses
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                      <CheckCircleIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {stats.completedCourses}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Completed
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                      <AccessTimeIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {formatTime(stats.totalTimeSpent)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Time Spent
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                      <TrendingUpIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {stats.averageCompletionRate}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Avg. Progress
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>

        {/* Main Content Tabs */}
        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={activeTab} onChange={handleTabChange} aria-label="learning dashboard tabs">
              <Tab
                icon={<DashboardIcon />}
                label="Overview"
                id="learning-tab-0"
                aria-controls="learning-tabpanel-0"
              />
              <Tab
                icon={<SchoolIcon />}
                label="My Courses"
                id="learning-tab-1"
                aria-controls="learning-tabpanel-1"
              />
              <Tab
                icon={<LiveTvIcon />}
                label="Live Sessions"
                id="learning-tab-2"
                aria-controls="learning-tabpanel-2"
              />
              <Tab
                icon={<AnalyticsIcon />}
                label="Analytics"
                id="learning-tab-3"
                aria-controls="learning-tabpanel-3"
              />
            </Tabs>
          </Box>

          {/* Overview Tab */}
          <TabPanel value={activeTab} index={0}>
            <Grid container spacing={3}>
              {/* Recent Courses */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Continue Learning
                </Typography>
                <List>
                  {recentCourses.map((course, index) => (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Paper sx={{ mb: 2, p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                            <SchoolIcon />
                          </Avatar>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {course.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              by {course.instructor}
                            </Typography>
                          </Box>
                          <Chip
                            label={`${course.progress}%`}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </Box>
                        
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              Progress
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {course.progress}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={course.progress}
                            sx={{
                              height: 6,
                              borderRadius: 3,
                              '& .MuiLinearProgress-bar': {
                                borderRadius: 3,
                                background: 'linear-gradient(90deg, #6C63FF 0%, #00FFC6 100%)'
                              }
                            }}
                          />
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" color="text.secondary">
                            Next: {course.nextLesson}
                          </Typography>
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<PlayIcon />}
                            onClick={() => handleContinueCourse(course.id)}
                            sx={{
                              background: 'linear-gradient(135deg, #6C63FF 0%, #00FFC6 100%)',
                              px: 2
                            }}
                          >
                            Continue
                          </Button>
                        </Box>
                      </Paper>
                    </motion.div>
                  ))}
                </List>
              </Grid>

              {/* Upcoming Sessions */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Upcoming Live Sessions
                </Typography>
                <List>
                  {upcomingSessions.map((session, index) => (
                    <motion.div
                      key={session.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Paper sx={{ mb: 2, p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <LiveTvIcon color="error" sx={{ mr: 1 }} />
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {session.title}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          by {session.instructor}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {formatDate(session.startTime)} • {session.participants} participants
                        </Typography>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleJoinSession(session.id)}
                          sx={{ textTransform: 'none' }}
                        >
                          Join Session
                        </Button>
                      </Paper>
                    </motion.div>
                  ))}
                </List>
              </Grid>
            </Grid>
          </TabPanel>

          {/* My Courses Tab */}
          <TabPanel value={activeTab} index={1}>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                All Your Courses
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate('/courses')}
                sx={{
                  background: 'linear-gradient(135deg, #6C63FF 0%, #00FFC6 100%)',
                  px: 4
                }}
              >
                Browse All Courses
              </Button>
            </Box>
          </TabPanel>

          {/* Live Sessions Tab */}
          <TabPanel value={activeTab} index={2}>
            <LiveSessionsComponent
              courseId="all"
              onJoinSession={(session) => console.log('Joining session:', session)}
            />
          </TabPanel>

          {/* Analytics Tab */}
          <TabPanel value={activeTab} index={3}>
            <LearningAnalytics />
          </TabPanel>
        </Card>
      </Container>
    </Box>
  );
};

export default LearningDashboard;
