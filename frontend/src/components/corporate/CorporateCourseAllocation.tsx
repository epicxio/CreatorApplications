import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Tabs,
  Tab,
  styled,
  Avatar,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  PlayCircle as PlayIcon,
  Group as GroupIcon,
  Person as PersonIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Business as BusinessIcon,
  Work as WorkIcon,
} from '@mui/icons-material';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  margin: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[3],
  minHeight: '100vh',
}));

const CourseCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
  },
}));

const CourseMedia = styled(CardMedia)({
  height: 200,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
    opacity: 0.7,
  },
  '&::after': {
    content: 'attr(data-title)',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    color: 'white',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    textAlign: 'center',
    width: '80%',
    textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
  },
});

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  allocatedTo?: {
    employees: string[];
    departments: string[];
  };
}

interface Employee {
  id: string;
  name: string;
  department: string;
  position: string;
  avatar?: string;
}

interface Department {
  id: string;
  name: string;
  employeeCount: number;
  location: string;
}

interface AllocationStats {
  totalCourses: number;
  allocatedCourses: number;
  employeesEnrolled: number;
  completionRate: number;
}

interface DepartmentAllocation {
  departmentId: string;
  name: string;
  courses: Course[];
  employeeCount: number;
  progress: number;
  completionRate: number;
}

interface EmployeeAllocation {
  employeeId: string;
  name: string;
  department: string;
  position: string;
  courses: Course[];
  progress: number;
  lastActive: string;
}

// Mock data
const mockCourses: Course[] = [
  {
    id: '1',
    title: 'Advanced Mathematics for Engineers',
    description: 'Comprehensive course covering advanced mathematical concepts essential for engineering applications.',
    thumbnail: '/thumbnails/engineering-math.jpg',
    duration: '20 hours',
    level: 'advanced',
    category: 'Engineering',
    allocatedTo: {
      departments: ['DEPT1'],
      employees: ['EMP001', 'EMP003']
    }
  },
  {
    id: '2',
    title: 'Data Analytics Fundamentals',
    description: 'Master the basics of data analysis, visualization, and interpretation for business decision making.',
    thumbnail: '/thumbnails/data-analytics.jpg',
    duration: '15 hours',
    level: 'intermediate',
    category: 'Analytics',
    allocatedTo: {
      departments: ['DEPT2'],
      employees: ['EMP002']
    }
  },
  {
    id: '3',
    title: 'Financial Mathematics',
    description: 'Essential mathematical concepts for financial analysis, risk assessment, and investment strategies.',
    thumbnail: '/thumbnails/financial-math.jpg',
    duration: '18 hours',
    level: 'advanced',
    category: 'Finance',
    allocatedTo: {
      departments: ['DEPT3'],
      employees: ['EMP004']
    }
  },
  {
    id: '4',
    title: 'Machine Learning Mathematics',
    description: 'Mathematical foundations for understanding and implementing machine learning algorithms.',
    thumbnail: '/thumbnails/ml-math.jpg',
    duration: '25 hours',
    level: 'advanced',
    category: 'Engineering',
    allocatedTo: {
      departments: ['DEPT1', 'DEPT2'],
      employees: ['EMP001', 'EMP002']
    }
  },
  {
    id: '5',
    title: 'Business Statistics',
    description: 'Statistical methods and tools for business analysis and decision making.',
    thumbnail: '/thumbnails/business-stats.jpg',
    duration: '12 hours',
    level: 'intermediate',
    category: 'Analytics',
    allocatedTo: {
      departments: ['DEPT2', 'DEPT3'],
      employees: ['EMP002', 'EMP004']
    }
  },
  {
    id: '6',
    title: 'Optimization Techniques',
    description: 'Mathematical optimization methods for improving business processes and resource allocation.',
    thumbnail: '/thumbnails/optimization.jpg',
    duration: '16 hours',
    level: 'advanced',
    category: 'Engineering',
    allocatedTo: {
      departments: ['DEPT1'],
      employees: ['EMP003']
    }
  },
  {
    id: '7',
    title: 'Risk Analysis Mathematics',
    description: 'Quantitative methods for assessing and managing business risks.',
    thumbnail: '/thumbnails/risk-analysis.jpg',
    duration: '14 hours',
    level: 'intermediate',
    category: 'Finance',
    allocatedTo: {
      departments: ['DEPT3'],
      employees: ['EMP004']
    }
  },
  {
    id: '8',
    title: 'Supply Chain Mathematics',
    description: 'Mathematical models and techniques for optimizing supply chain operations.',
    thumbnail: '/thumbnails/supply-chain.jpg',
    duration: '15 hours',
    level: 'intermediate',
    category: 'Operations',
    allocatedTo: {
      departments: ['DEPT4'],
      employees: ['EMP005']
    }
  },
  {
    id: '9',
    title: 'Project Management Analytics',
    description: 'Data-driven approaches to project planning, monitoring, and control.',
    thumbnail: '/thumbnails/project-analytics.jpg',
    duration: '10 hours',
    level: 'intermediate',
    category: 'Operations',
    allocatedTo: {
      departments: ['DEPT4'],
      employees: ['EMP005']
    }
  },
  {
    id: '10',
    title: 'Mathematical Modeling for Business',
    description: 'Creating and analyzing mathematical models for business scenarios and decision making.',
    thumbnail: '/thumbnails/business-modeling.jpg',
    duration: '20 hours',
    level: 'advanced',
    category: 'Analytics',
    allocatedTo: {
      departments: ['DEPT2', 'DEPT3'],
      employees: ['EMP002', 'EMP004']
    }
  }
];

const mockEmployees: Employee[] = [
  { id: 'EMP001', name: 'John Smith', department: 'Engineering', position: 'Senior Developer', avatar: '/avatars/john.jpg' },
  { id: 'EMP002', name: 'Sarah Johnson', department: 'Analytics', position: 'Data Scientist', avatar: '/avatars/sarah.jpg' },
  { id: 'EMP003', name: 'Mike Brown', department: 'Engineering', position: 'Team Lead', avatar: '/avatars/mike.jpg' },
];

const mockDepartments: Department[] = [
  { id: 'DEPT1', name: 'Engineering', employeeCount: 25, location: 'New York' },
  { id: 'DEPT2', name: 'Analytics', employeeCount: 15, location: 'London' },
  { id: 'DEPT3', name: 'Finance', employeeCount: 20, location: 'Singapore' },
];

const mockAllocationStats: AllocationStats = {
  totalCourses: 10,
  allocatedCourses: 6,
  employeesEnrolled: 45,
  completionRate: 75,
};

const mockDepartmentAllocations: DepartmentAllocation[] = [
  {
    departmentId: 'DEPT1',
    name: 'Engineering',
    courses: mockCourses.filter(course => course.allocatedTo?.departments?.includes('DEPT1')),
    employeeCount: 25,
    progress: 80,
    completionRate: 85,
  },
  {
    departmentId: 'DEPT2',
    name: 'Analytics',
    courses: mockCourses.filter(course => course.allocatedTo?.departments?.includes('DEPT2')),
    employeeCount: 15,
    progress: 65,
    completionRate: 70,
  },
];

const mockEmployeeAllocations: EmployeeAllocation[] = [
  {
    employeeId: 'EMP001',
    name: 'John Smith',
    department: 'Engineering',
    position: 'Senior Developer',
    courses: mockCourses.filter(course => course.allocatedTo?.employees?.includes('EMP001')),
    progress: 80,
    lastActive: '2024-03-15',
  },
  {
    employeeId: 'EMP002',
    name: 'Sarah Johnson',
    department: 'Analytics',
    position: 'Data Scientist',
    courses: mockCourses.filter(course => course.allocatedTo?.employees?.includes('EMP002')),
    progress: 65,
    lastActive: '2024-03-14',
  },
  {
    employeeId: 'EMP003',
    name: 'Mike Brown',
    department: 'Engineering',
    position: 'Team Lead',
    courses: mockCourses.filter(course => course.allocatedTo?.employees?.includes('EMP003')),
    progress: 90,
    lastActive: '2024-03-15',
  },
];

const StatsCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
  },
}));

const ProgressBar = styled(Box)(({ theme }) => ({
  width: '100%',
  height: 8,
  backgroundColor: theme.palette.grey[200],
  borderRadius: 4,
  overflow: 'hidden',
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    background: 'linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)',
    transition: 'width 0.5s ease-in-out',
  },
}));

const DepartmentCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '100%',
  background: 'linear-gradient(135deg, #f6f7f9 0%, #e9ecef 100%)',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[8],
  },
}));

const EmployeeCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateX(5px)',
    boxShadow: theme.shadows[4],
  },
}));

const AllocationOverview: React.FC = () => {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Allocation Overview
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard>
            <Typography variant="h3" color="primary" gutterBottom>
              {mockAllocationStats.totalCourses}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Total Courses
            </Typography>
          </StatsCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard>
            <Typography variant="h3" color="success.main" gutterBottom>
              {mockAllocationStats.allocatedCourses}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Allocated Courses
            </Typography>
          </StatsCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard>
            <Typography variant="h3" color="info.main" gutterBottom>
              {mockAllocationStats.employeesEnrolled}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Employees Enrolled
            </Typography>
          </StatsCard>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard>
            <Typography variant="h3" color="warning.main" gutterBottom>
              {mockAllocationStats.completionRate}%
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Completion Rate
            </Typography>
          </StatsCard>
        </Grid>
      </Grid>
    </Box>
  );
};

const DepartmentAllocationView: React.FC = () => {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Department-wise Course Allocation
      </Typography>
      
      <Grid container spacing={3}>
        {mockDepartmentAllocations.map((dept) => (
          <Grid item xs={12} md={6} key={dept.departmentId}>
            <DepartmentCard>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">{dept.name}</Typography>
                <Chip
                  label={`${dept.employeeCount} Employees`}
                  color="primary"
                  variant="outlined"
                />
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Progress
                </Typography>
                <ProgressBar sx={{ '&::after': { width: `${dept.progress}%` } }} />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  {dept.progress}% Complete • {dept.completionRate}% Completion Rate
                </Typography>
              </Box>

              <Typography variant="subtitle2" gutterBottom>
                Allocated Courses:
              </Typography>
              <Grid container spacing={1}>
                {dept.courses.map((course) => (
                  <Grid item xs={12} key={course.id}>
                    <Paper
                      sx={{
                        p: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        background: 'linear-gradient(45deg, #f8f9fa 30%, #e9ecef 90%)',
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle2">{course.title}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {course.duration} • {course.level}
                        </Typography>
                      </Box>
                      <Chip
                        size="small"
                        label={course.allocatedTo?.employees?.length || 0}
                        color="primary"
                        variant="outlined"
                      />
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </DepartmentCard>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

const EmployeeAllocationView: React.FC = () => {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Employee-wise Course Allocation
      </Typography>
      
      <Grid container spacing={3}>
        {mockEmployeeAllocations.map((employee) => (
          <Grid item xs={12} key={employee.employeeId}>
            <EmployeeCard>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ mr: 2 }}>{employee.name.charAt(0)}</Avatar>
                    <Box>
                      <Typography variant="subtitle1">{employee.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {employee.department} • {employee.position}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CircularProgress
                      variant="determinate"
                      value={employee.progress}
                      size={40}
                      thickness={4}
                      sx={{ mr: 2 }}
                    />
                    <Box>
                      <Typography variant="body2">Progress</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {employee.progress}% Complete
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {employee.courses.map((course) => (
                      <Chip
                        key={course.id}
                        label={course.title}
                        size="small"
                        variant="outlined"
                        sx={{
                          background: 'linear-gradient(45deg, #f8f9fa 30%, #e9ecef 90%)',
                        }}
                      />
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </EmployeeCard>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

const CorporateCourseAllocation: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>(mockCourses);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [allocationType, setAllocationType] = useState<'employee' | 'department'>('employee');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [levelFilter, setLevelFilter] = useState<string>('all');

  const handleOpenDialog = (course: Course) => {
    setSelectedCourse(course);
    setSelectedEmployees(course.allocatedTo?.employees || []);
    setSelectedDepartments(course.allocatedTo?.departments || []);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCourse(null);
    setSelectedEmployees([]);
    setSelectedDepartments([]);
  };

  const handleAllocate = () => {
    if (!selectedCourse) return;

    const updatedCourses = courses.map(course =>
      course.id === selectedCourse.id
        ? {
            ...course,
            allocatedTo: {
              employees: allocationType === 'employee' ? selectedEmployees : course.allocatedTo?.employees || [],
              departments: allocationType === 'department' ? selectedDepartments : course.allocatedTo?.departments || [],
            },
          }
        : course
    );

    setCourses(updatedCourses);
    handleCloseDialog();
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || course.category === categoryFilter;
    const matchesLevel = levelFilter === 'all' || course.level === levelFilter;
    return matchesSearch && matchesCategory && matchesLevel;
  });

  return (
    <StyledPaper>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Corporate Course Allocation
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Allocate courses to departments or individual employees
        </Typography>
      </Box>

      <AllocationOverview />
      <DepartmentAllocationView />
      <EmployeeAllocationView />

      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="Search Courses"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <PlayIcon sx={{ mr: 1, color: 'action.active' }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                label="Category"
              >
                <MenuItem value="all">All Categories</MenuItem>
                <MenuItem value="Mathematics">Mathematics</MenuItem>
                <MenuItem value="Analytics">Analytics</MenuItem>
                <MenuItem value="Business">Business</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel>Level</InputLabel>
              <Select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                label="Level"
              >
                <MenuItem value="all">All Levels</MenuItem>
                <MenuItem value="beginner">Beginner</MenuItem>
                <MenuItem value="intermediate">Intermediate</MenuItem>
                <MenuItem value="advanced">Advanced</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      <Grid container spacing={3}>
        {filteredCourses.map((course) => (
          <Grid item xs={12} sm={6} md={4} key={course.id}>
            <CourseCard>
              <CourseMedia
                image={course.thumbnail}
                title={course.title}
                data-title={course.title}
                sx={{
                  backgroundImage: `url(${course.thumbnail}), linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)`,
                }}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography variant="h6" component="h2">
                    {course.title}
                  </Typography>
                  <Chip
                    label={course.level}
                    color={
                      course.level === 'beginner'
                        ? 'success'
                        : course.level === 'intermediate'
                        ? 'warning'
                        : 'error'
                    }
                    size="small"
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {course.description}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
                  <Typography variant="caption" color="text.secondary">
                    {course.duration}
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<EditIcon />}
                    onClick={() => handleOpenDialog(course)}
                  >
                    Allocate
                  </Button>
                </Box>
              </CardContent>
            </CourseCard>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              Allocate Course: {selectedCourse?.title}
            </Typography>
            <IconButton onClick={handleCloseDialog} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Tabs
              value={allocationType}
              onChange={(_, newValue) => setAllocationType(newValue)}
              sx={{ mb: 2 }}
            >
              <Tab
                icon={<PersonIcon />}
                label="Employee Allocation"
                value="employee"
              />
              <Tab
                icon={<BusinessIcon />}
                label="Department Allocation"
                value="department"
              />
            </Tabs>

            {allocationType === 'employee' ? (
              <FormControl fullWidth>
                <InputLabel>Select Employees</InputLabel>
                <Select
                  multiple
                  value={selectedEmployees}
                  onChange={(e) => setSelectedEmployees(e.target.value as string[])}
                  label="Select Employees"
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => {
                        const employee = mockEmployees.find(e => e.id === value);
                        return (
                          <Chip
                            key={value}
                            avatar={<Avatar src={employee?.avatar} />}
                            label={employee?.name}
                            size="small"
                          />
                        );
                      })}
                    </Box>
                  )}
                >
                  {mockEmployees.map((employee) => (
                    <MenuItem key={employee.id} value={employee.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <Avatar src={employee.avatar} sx={{ width: 24, height: 24, mr: 1 }} />
                        <Typography>{employee.name}</Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ ml: 'auto' }}
                        >
                          {employee.department}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <FormControl fullWidth>
                <InputLabel>Select Departments</InputLabel>
                <Select
                  multiple
                  value={selectedDepartments}
                  onChange={(e) => setSelectedDepartments(e.target.value as string[])}
                  label="Select Departments"
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip
                          key={value}
                          label={mockDepartments.find(d => d.id === value)?.name}
                          size="small"
                        />
                      ))}
                    </Box>
                  )}
                >
                  {mockDepartments.map((dept) => (
                    <MenuItem key={dept.id} value={dept.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <Typography>{dept.name}</Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ ml: 'auto' }}
                        >
                          {dept.employeeCount} employees
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleAllocate}
            variant="contained"
            color="primary"
            startIcon={<CheckIcon />}
          >
            Allocate
          </Button>
        </DialogActions>
      </Dialog>
    </StyledPaper>
  );
};

export default CorporateCourseAllocation; 