import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  LinearProgress,
  styled,
} from '@mui/material';
import {
  Business as BusinessIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  margin: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[3],
  minHeight: '100vh',
}));

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- theme required by MUI styled API
const StatsCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
  },
}));

const ProgressBar = styled(LinearProgress)(({ theme }) => ({
  height: 8,
  borderRadius: 4,
  backgroundColor: theme.palette.grey[200],
  '& .MuiLinearProgress-bar': {
    borderRadius: 4,
    background: 'linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)',
  },
}));

const CorporateDashboard: React.FC = () => {
  const stats = [
    {
      title: 'Total Departments',
      value: '5',
      icon: <BusinessIcon />,
      color: '#2196F3',
      progress: 100,
    },
    {
      title: 'Total Employees',
      value: '120',
      icon: <PeopleIcon />,
      color: '#4CAF50',
      progress: 85,
    },
    {
      title: 'Active Courses',
      value: '15',
      icon: <SchoolIcon />,
      color: '#FF9800',
      progress: 75,
    },
    {
      title: 'Course Allocations',
      value: '85',
      icon: <AssignmentIcon />,
      color: '#9C27B0',
      progress: 90,
    },
  ];

  const recentActivities = [
    {
      title: 'New Course Added',
      description: 'Advanced Mathematics for Engineers',
      time: '2 hours ago',
      icon: <SchoolIcon />,
    },
    {
      title: 'Department Update',
      description: 'Engineering department expanded',
      time: '5 hours ago',
      icon: <BusinessIcon />,
    },
    {
      title: 'Employee Training',
      description: '10 employees completed Data Analytics course',
      time: '1 day ago',
      icon: <PeopleIcon />,
    },
  ];

  return (
    <StyledPaper>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Corporate Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Overview of corporate activities and performance metrics
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <StatsCard>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: stat.color, mr: 2 }}>
                    {stat.icon}
                  </Avatar>
                  <Typography variant="h6" color="text.secondary">
                    {stat.title}
                  </Typography>
                </Box>
                <Typography variant="h4" component="div" gutterBottom>
                  {stat.value}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ width: '100%', mr: 1 }}>
                    <ProgressBar variant="determinate" value={stat.progress} />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {stat.progress}%
                  </Typography>
                </Box>
              </CardContent>
            </StatsCard>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader
              title="Recent Activities"
              avatar={<TrendingUpIcon />}
            />
            <CardContent>
              {recentActivities.map((activity, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: 2,
                    p: 2,
                    borderRadius: 1,
                    backgroundColor: 'background.default',
                  }}
                >
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    {activity.icon}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1">{activity.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {activity.description}
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {activity.time}
                  </Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader
              title="Quick Actions"
              avatar={<AssignmentIcon />}
            />
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 1,
                    backgroundColor: 'background.default',
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  <Typography variant="subtitle1">Allocate Courses</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Assign courses to departments or employees
                  </Typography>
                </Box>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 1,
                    backgroundColor: 'background.default',
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  <Typography variant="subtitle1">Manage Departments</Typography>
                  <Typography variant="body2" color="text.secondary">
                    View and update department information
                  </Typography>
                </Box>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 1,
                    backgroundColor: 'background.default',
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  <Typography variant="subtitle1">Employee Reports</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Generate and view employee performance reports
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </StyledPaper>
  );
};

export default CorporateDashboard; 