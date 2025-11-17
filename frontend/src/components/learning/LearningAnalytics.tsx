import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  Paper,
  Divider,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  School as SchoolIcon,
  Timer as TimerIcon,
  CheckCircle as CheckCircleIcon,
  Star as StarIcon,
  CalendarToday as CalendarIcon,
  Bookmark as BookmarkIcon,
  Quiz as QuizIcon,
  Assignment as AssignmentIcon,
  VideoLibrary as VideoIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { progressService } from '../../services/progressService';
import { useAuth } from '../../context/AuthContext';

interface LearningAnalyticsProps {
  courseId?: string;
}

const LearningAnalytics: React.FC<LearningAnalyticsProps> = ({ courseId }) => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState({
    totalCourses: 0,
    completedCourses: 0,
    totalTimeSpent: 0,
    averageCompletionRate: 0,
    recentActivity: [] as any[],
    achievements: [] as any[],
    weeklyProgress: [] as any[],
    courseBreakdown: [] as any[]
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  // Load analytics data
  const loadAnalytics = async () => {
    if (!user?._id) return;

    try {
      setLoading(true);
      
      // Get learning statistics
      const stats = progressService.getLearningStats(user._id);
      
      // Get all progress data
      const allProgress = progressService.getAllProgress(user._id);
      
      // Calculate recent activity (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const recentActivity = allProgress
        .filter(progress => new Date(progress.lastAccessed) > sevenDaysAgo)
        .sort((a, b) => new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime())
        .slice(0, 5);

      // Mock achievements
      const achievements = [
        {
          id: '1',
          title: 'First Course Completed',
          description: 'Completed your first course',
          icon: <CheckCircleIcon />,
          earned: stats.completedCourses > 0,
          earnedAt: stats.completedCourses > 0 ? '2025-01-15' : null
        },
        {
          id: '2',
          title: 'Study Streak',
          description: 'Studied for 7 consecutive days',
          icon: <TrendingUpIcon />,
          earned: false,
          earnedAt: null
        },
        {
          id: '3',
          title: 'Quiz Master',
          description: 'Scored 100% on 5 quizzes',
          icon: <QuizIcon />,
          earned: false,
          earnedAt: null
        },
        {
          id: '4',
          title: 'Time Spent',
          description: 'Spent 50+ hours learning',
          icon: <TimerIcon />,
          earned: stats.totalTimeSpent >= 50,
          earnedAt: stats.totalTimeSpent >= 50 ? '2025-01-20' : null
        }
      ];

      // Mock weekly progress data
      const weeklyProgress = [
        { day: 'Mon', hours: 2.5, lessons: 3 },
        { day: 'Tue', hours: 1.8, lessons: 2 },
        { day: 'Wed', hours: 3.2, lessons: 4 },
        { day: 'Thu', hours: 2.1, lessons: 2 },
        { day: 'Fri', hours: 4.0, lessons: 5 },
        { day: 'Sat', hours: 1.5, lessons: 1 },
        { day: 'Sun', hours: 2.8, lessons: 3 }
      ];

      // Course breakdown
      const courseBreakdown = allProgress.map(progress => ({
        courseId: progress.courseId,
        courseName: `Course ${progress.courseId}`, // In real app, fetch course name
        progress: progress.overallProgress,
        timeSpent: progress.timeSpent,
        completedLessons: progress.completedLessons.length,
        enrolledAt: progress.enrolledAt,
        lastAccessed: progress.lastAccessed
      }));

      setAnalytics({
        totalCourses: stats.totalCourses,
        completedCourses: stats.completedCourses,
        totalTimeSpent: stats.totalTimeSpent,
        averageCompletionRate: stats.averageCompletionRate,
        recentActivity,
        achievements,
        weeklyProgress,
        courseBreakdown
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load analytics on mount
  useEffect(() => {
    loadAnalytics();
  }, [user?._id, courseId]);

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Learning Analytics
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track your learning progress and achievements
        </Typography>
      </Box>

      {/* Stats Cards */}
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
                      {analytics.totalCourses}
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
                      {analytics.completedCourses}
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
                    <TimerIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {formatTime(analytics.totalTimeSpent)}
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
                      {analytics.averageCompletionRate}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Avg. Completion
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Weekly Progress Chart */}
        <Grid item xs={12} md={8}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Weekly Learning Activity
                  </Typography>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Time Range</InputLabel>
                    <Select
                      value={timeRange}
                      onChange={(e) => setTimeRange(e.target.value)}
                      label="Time Range"
                    >
                      <MenuItem value="7d">7 Days</MenuItem>
                      <MenuItem value="30d">30 Days</MenuItem>
                      <MenuItem value="90d">90 Days</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  {analytics.weeklyProgress.map((day, index) => (
                    <Box key={day.day} sx={{ textAlign: 'center', flex: 1 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                        {day.day}
                      </Typography>
                      <Box sx={{ height: 100, display: 'flex', alignItems: 'end', justifyContent: 'center' }}>
                        <Box
                          sx={{
                            width: 20,
                            height: `${(day.hours / 4) * 100}%`,
                            bgcolor: 'primary.main',
                            borderRadius: '4px 4px 0 0',
                            minHeight: 4
                          }}
                        />
                      </Box>
                      <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                        {day.hours}h
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Achievements */}
        <Grid item xs={12} md={4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Achievements
                </Typography>
                
                <List dense>
                  {analytics.achievements.map((achievement, index) => (
                    <ListItem key={achievement.id} sx={{ px: 0 }}>
                      <ListItemIcon>
                        <Avatar
                          sx={{
                            bgcolor: achievement.earned ? 'success.main' : 'grey.300',
                            width: 32,
                            height: 32
                          }}
                        >
                          {achievement.icon}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 600,
                              color: achievement.earned ? 'text.primary' : 'text.secondary'
                            }}
                          >
                            {achievement.title}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            {achievement.description}
                          </Typography>
                        }
                      />
                      {achievement.earned && (
                        <Chip
                          label="Earned"
                          size="small"
                          color="success"
                          variant="outlined"
                        />
                      )}
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Recent Activity
                </Typography>
                
                {analytics.recentActivity.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No recent activity
                    </Typography>
                  </Box>
                ) : (
                  <List dense>
                    {analytics.recentActivity.map((activity, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemIcon>
                          <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                            <SchoolIcon />
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              Course {activity.courseId}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="caption" color="text.secondary">
                              {formatDate(activity.lastAccessed)} • {activity.overallProgress}% complete
                            </Typography>
                          }
                        />
                        <ListItemSecondaryAction>
                          <Chip
                            label={`${activity.overallProgress}%`}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Course Breakdown */}
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Course Progress
                </Typography>
                
                {analytics.courseBreakdown.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No courses enrolled
                    </Typography>
                  </Box>
                ) : (
                  <List dense>
                    {analytics.courseBreakdown.map((course, index) => (
                      <ListItem key={course.courseId} sx={{ px: 0 }}>
                        <ListItemText
                          primary={
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {course.courseName}
                            </Typography>
                          }
                          secondary={
                            <Box sx={{ mt: 1 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="caption" color="text.secondary">
                                  Progress
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {course.progress}%
                                </Typography>
                              </Box>
                              <LinearProgress
                                variant="determinate"
                                value={course.progress}
                                sx={{
                                  height: 4,
                                  borderRadius: 2,
                                  '& .MuiLinearProgress-bar': {
                                    borderRadius: 2,
                                    background: 'linear-gradient(90deg, #6C63FF 0%, #00FFC6 100%)'
                                  }
                                }}
                              />
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                                <Typography variant="caption" color="text.secondary">
                                  {course.completedLessons} lessons
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {formatTime(course.timeSpent)}
                                </Typography>
                              </Box>
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
};

export default LearningAnalytics;
