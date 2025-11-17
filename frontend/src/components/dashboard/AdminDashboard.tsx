import { Box, Typography, Paper, Grid, styled, LinearProgress, Avatar, AvatarGroup, Tooltip, IconButton } from '@mui/material';
import { motion } from 'framer-motion';
import {
  People,
  School,
  Business,
  Person,
  LibraryBooks,
  Timeline,
  TrendingUp,
  PersonAdd,
  Email
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const DashboardContainer = styled(Box)`
  padding: 2rem;
`;

const StatsCard = styled(Paper)`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 1.5rem;
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }
`;

const MotionStatsCard = motion(StatsCard);

const MetricValue = styled(Typography)`
  font-size: 2.5rem;
  font-weight: bold;
  background: linear-gradient(45deg, #FF4081, #7B1FA2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 1rem 0;
`;

const ProgressBar = styled(LinearProgress)`
  height: 8px;
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.1);
  margin: 0.5rem 0;

  .MuiLinearProgress-bar {
    background: linear-gradient(45deg, #FF4081, #7B1FA2);
  }
`;

const UserAvatar = styled(Avatar)`
  width: 40px;
  height: 40px;
  border: 2px solid #FF4081;
`;

const ActionButton = styled(IconButton)`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(5px);
  margin-left: 0.5rem;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

export const AdminDashboard = () => {
  const { user } = useAuth();
  const isSchoolAdmin = user?.role?.name === 'school_admin';

  // Mock data - would come from API in real application
  const mockData = {
    totalUsers: 156,
    activeUsers: 89,
    pendingRegistrations: 12,
    totalCourses: isSchoolAdmin ? 24 : 18,
    courseEngagement: 76,
    usersByRole: {
      students: isSchoolAdmin ? 120 : 0,
      teachers: isSchoolAdmin ? 15 : 0,
      parents: isSchoolAdmin ? 21 : 0,
      employees: isSchoolAdmin ? 0 : 156,
    },
    recentUsers: [
      { name: 'John D.', status: 'active' },
      { name: 'Sarah M.', status: 'pending' },
      { name: 'Mike R.', status: 'active' },
      { name: 'Emma W.', status: 'pending' },
    ],
  };

  return (
    <DashboardContainer>
      <Typography
        variant="h4"
        component={motion.h4}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        sx={{ mb: 4, fontWeight: 'bold' }}
      >
        {isSchoolAdmin ? 'School Administration' : 'Corporate Administration'}
      </Typography>

      <Grid container spacing={3}>
        {/* User Statistics */}
        <Grid item xs={12} md={6} lg={3}>
          <MotionStatsCard
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="h6" color="text.secondary">Total Users</Typography>
                <MetricValue>{mockData.totalUsers}</MetricValue>
              </Box>
              <People sx={{ fontSize: 40, color: '#FF4081' }} />
            </Box>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Active Users: {mockData.activeUsers}
              </Typography>
              <ProgressBar
                variant="determinate"
                value={(mockData.activeUsers / mockData.totalUsers) * 100}
              />
            </Box>
          </MotionStatsCard>
        </Grid>

        {/* Role Distribution */}
        <Grid item xs={12} md={6} lg={3}>
          <MotionStatsCard
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Typography variant="h6" color="text.secondary">User Roles</Typography>
              {isSchoolAdmin ? <School sx={{ fontSize: 40, color: '#7B1FA2' }} /> : 
                             <Business sx={{ fontSize: 40, color: '#7B1FA2' }} />}
            </Box>
            <Box sx={{ mt: 2 }}>
              {isSchoolAdmin ? (
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Students</Typography>
                    <Typography variant="body2" color="text.secondary">{mockData.usersByRole.students}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Teachers</Typography>
                    <Typography variant="body2" color="text.secondary">{mockData.usersByRole.teachers}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Parents</Typography>
                    <Typography variant="body2" color="text.secondary">{mockData.usersByRole.parents}</Typography>
                  </Box>
                </>
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Employees</Typography>
                  <Typography variant="body2" color="text.secondary">{mockData.usersByRole.employees}</Typography>
                </Box>
              )}
            </Box>
          </MotionStatsCard>
        </Grid>

        {/* Course Statistics */}
        <Grid item xs={12} md={6} lg={3}>
          <MotionStatsCard
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="h6" color="text.secondary">Total Courses</Typography>
                <MetricValue>{mockData.totalCourses}</MetricValue>
              </Box>
              <LibraryBooks sx={{ fontSize: 40, color: '#00BCD4' }} />
            </Box>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Course Engagement
              </Typography>
              <ProgressBar
                variant="determinate"
                value={mockData.courseEngagement}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {mockData.courseEngagement}% Active Participation
              </Typography>
            </Box>
          </MotionStatsCard>
        </Grid>

        {/* Pending Registrations */}
        <Grid item xs={12} md={6} lg={3}>
          <MotionStatsCard
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="h6" color="text.secondary">Pending Users</Typography>
                <MetricValue>{mockData.pendingRegistrations}</MetricValue>
              </Box>
              <Timeline sx={{ fontSize: 40, color: '#FFC107' }} />
            </Box>
            <Box sx={{ mt: 2 }}>
              <AvatarGroup max={4} sx={{ justifyContent: 'flex-start' }}>
                {mockData.recentUsers.map((user, index) => (
                  <Tooltip key={index} title={`${user.name} (${user.status})`}>
                    <UserAvatar>{user.name.charAt(0)}</UserAvatar>
                  </Tooltip>
                ))}
              </AvatarGroup>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <ActionButton size="small">
                  <PersonAdd />
                </ActionButton>
                <ActionButton size="small">
                  <Email />
                </ActionButton>
              </Box>
            </Box>
          </MotionStatsCard>
        </Grid>

        {/* Additional metrics could be added here */}
      </Grid>
    </DashboardContainer>
  );
}; 