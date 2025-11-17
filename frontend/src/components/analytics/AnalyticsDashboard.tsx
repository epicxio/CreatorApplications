import React, { useState } from 'react';
import {
  Box,
  Paper,
  Grid,
  Typography,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  TrendingUp,
  People,
  School,
  Assessment,
  Timer,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';

const StyledCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(10px)',
  borderRadius: theme.shape.borderRadius,
  border: '1px solid rgba(255, 255, 255, 0.1)',
}));

const StatCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(10px)',
  borderRadius: theme.shape.borderRadius,
  border: '1px solid rgba(255, 255, 255, 0.1)',
  height: '100%',
}));

interface ChartDataPoint {
  month: string;
  mathematics: number;
  physics: number;
  chemistry: number;
}

interface EnrollmentDataPoint {
  name: string;
  students: number;
}

interface TeacherPerformanceDataPoint {
  name: string;
  value: number;
}

interface StudentProgressDataPoint {
  month: string;
  progress: number;
}

interface PieChartLabelProps {
  name: string;
  percent: number;
}

// Mock data
const studentPerformanceData: ChartDataPoint[] = [
  { month: 'Jan', mathematics: 85, physics: 78, chemistry: 82 },
  { month: 'Feb', mathematics: 88, physics: 82, chemistry: 85 },
  { month: 'Mar', mathematics: 90, physics: 85, chemistry: 88 },
  { month: 'Apr', mathematics: 92, physics: 88, chemistry: 90 },
  { month: 'May', mathematics: 95, physics: 90, chemistry: 92 },
];

const enrollmentData: EnrollmentDataPoint[] = [
  { name: 'Mathematics', students: 450 },
  { name: 'Physics', students: 300 },
  { name: 'Chemistry', students: 280 },
  { name: 'Biology', students: 250 },
  { name: 'Computer Science', students: 350 },
];

const teacherPerformanceData: TeacherPerformanceDataPoint[] = [
  { name: 'Assignments Completed', value: 85 },
  { name: 'Student Engagement', value: 92 },
  { name: 'Course Completion', value: 78 },
  { name: 'Student Satisfaction', value: 88 },
];

const studentProgressData: StudentProgressDataPoint[] = [
  { month: 'Jan', progress: 30 },
  { month: 'Feb', progress: 45 },
  { month: 'Mar', progress: 60 },
  { month: 'Apr', progress: 75 },
  { month: 'May', progress: 90 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index}>
    {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
  </div>
);

const AnalyticsDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState('month');
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const renderPieChartLabel = ({ name, percent }: PieChartLabelProps) => {
    return `${name} ${(percent * 100).toFixed(0)}%`;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* Header */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h4">Analytics Dashboard</Typography>
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Time Range</InputLabel>
              <Select
                value={timeRange}
                label="Time Range"
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <MenuItem value="week">Last Week</MenuItem>
                <MenuItem value="month">Last Month</MenuItem>
                <MenuItem value="quarter">Last Quarter</MenuItem>
                <MenuItem value="year">Last Year</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Grid>

        {/* Quick Stats */}
        <Grid item xs={12} md={3}>
          <StatCard>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <People color="primary" />
                <Typography variant="h6">Total Students</Typography>
              </Box>
              <Typography variant="h4" sx={{ mt: 2 }}>1,234</Typography>
              <Typography variant="body2" color="success.main" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <TrendingUp fontSize="small" />
                +15% from last month
              </Typography>
            </CardContent>
          </StatCard>
        </Grid>

        <Grid item xs={12} md={3}>
          <StatCard>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <School color="primary" />
                <Typography variant="h6">Active Teachers</Typography>
              </Box>
              <Typography variant="h4" sx={{ mt: 2 }}>85</Typography>
              <Typography variant="body2" color="success.main" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <TrendingUp fontSize="small" />
                +5% from last month
              </Typography>
            </CardContent>
          </StatCard>
        </Grid>

        <Grid item xs={12} md={3}>
          <StatCard>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Assessment color="primary" />
                <Typography variant="h6">Course Completion</Typography>
              </Box>
              <Typography variant="h4" sx={{ mt: 2 }}>87%</Typography>
              <Typography variant="body2" color="success.main" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <TrendingUp fontSize="small" />
                +8% from last month
              </Typography>
            </CardContent>
          </StatCard>
        </Grid>

        <Grid item xs={12} md={3}>
          <StatCard>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Timer color="primary" />
                <Typography variant="h6">Avg. Study Time</Typography>
              </Box>
              <Typography variant="h4" sx={{ mt: 2 }}>4.5h</Typography>
              <Typography variant="body2" color="success.main" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <TrendingUp fontSize="small" />
                +12% from last month
              </Typography>
            </CardContent>
          </StatCard>
        </Grid>

        {/* Charts */}
        <Grid item xs={12}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="Performance Analytics" />
              <Tab label="Enrollment Analytics" />
              <Tab label="Teacher Analytics" />
            </Tabs>
          </Box>
        </Grid>

        {/* Performance Analytics */}
        {tabValue === 0 && (
          <>
            <Grid item xs={12} md={8}>
              <StyledCard>
                <CardHeader
                  title="Student Performance Trends"
                  action={
                    <IconButton>
                      <MoreVertIcon />
                    </IconButton>
                  }
                />
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={studentPerformanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="mathematics" stroke="#8884d8" />
                      <Line type="monotone" dataKey="physics" stroke="#82ca9d" />
                      <Line type="monotone" dataKey="chemistry" stroke="#ffc658" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </StyledCard>
            </Grid>

            <Grid item xs={12} md={4}>
              <StyledCard>
                <CardHeader
                  title="Student Progress"
                  action={
                    <IconButton>
                      <MoreVertIcon />
                    </IconButton>
                  }
                />
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={studentProgressData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="progress" stroke="#8884d8" fill="#8884d8" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </StyledCard>
            </Grid>
          </>
        )}

        {/* Enrollment Analytics */}
        {tabValue === 1 && (
          <>
            <Grid item xs={12} md={6}>
              <StyledCard>
                <CardHeader
                  title="Course Enrollment Distribution"
                  action={
                    <IconButton>
                      <MoreVertIcon />
                    </IconButton>
                  }
                />
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={enrollmentData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="students" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </StyledCard>
            </Grid>

            <Grid item xs={12} md={6}>
              <StyledCard>
                <CardHeader
                  title="Subject Distribution"
                  action={
                    <IconButton>
                      <MoreVertIcon />
                    </IconButton>
                  }
                />
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={enrollmentData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="students"
                        label={renderPieChartLabel}
                      >
                        {enrollmentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </StyledCard>
            </Grid>
          </>
        )}

        {/* Teacher Analytics */}
        {tabValue === 2 && (
          <>
            <Grid item xs={12} md={6}>
              <StyledCard>
                <CardHeader
                  title="Teacher Performance Metrics"
                  action={
                    <IconButton>
                      <MoreVertIcon />
                    </IconButton>
                  }
                />
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={teacherPerformanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </StyledCard>
            </Grid>

            <Grid item xs={12} md={6}>
              <StyledCard>
                <CardHeader
                  title="Teacher Effectiveness"
                  action={
                    <IconButton>
                      <MoreVertIcon />
                    </IconButton>
                  }
                />
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={teacherPerformanceData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </StyledCard>
            </Grid>
          </>
        )}
      </Grid>
    </Box>
  );
};

export default AnalyticsDashboard; 