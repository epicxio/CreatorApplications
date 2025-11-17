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
    departments: string[];
    employees: string[];
  };
}

interface Department {
  id: string;
  name: string;
  employeeCount: number;
}

interface Employee {
  id: string;
  name: string;
  department: string;
  avatar?: string;
}

// Mock data
const mockCourses: Course[] = [
  {
    id: '1',
    title: 'Advanced Mathematics for Engineers',
    description: 'Comprehensive course covering advanced mathematical concepts for engineering applications.',
    thumbnail: 'https://source.unsplash.com/random/400x300/?engineering,math',
    duration: '12 hours',
    level: 'advanced',
    category: 'Engineering',
    allocatedTo: {
      departments: ['Engineering'],
      employees: ['EMP001', 'EMP003'],
    },
  },
  {
    id: '2',
    title: 'Data Science Fundamentals',
    description: 'Introduction to data science concepts and tools for beginners.',
    thumbnail: 'https://source.unsplash.com/random/400x300/?data,science',
    duration: '8 hours',
    level: 'beginner',
    category: 'Data Science',
  },
  {
    id: '3',
    title: 'Machine Learning for Business',
    description: 'Practical applications of machine learning in business scenarios.',
    thumbnail: 'https://source.unsplash.com/random/400x300/?machine,learning',
    duration: '10 hours',
    level: 'intermediate',
    category: 'Business',
    allocatedTo: {
      departments: ['Business'],
      employees: ['EMP002'],
    },
  },
  {
    id: '4',
    title: 'Financial Mathematics',
    description: 'Essential mathematical concepts for financial analysis and modeling.',
    thumbnail: 'https://source.unsplash.com/random/400x300/?finance,math',
    duration: '15 hours',
    level: 'intermediate',
    category: 'Finance',
    allocatedTo: {
      departments: ['Finance'],
      employees: ['EMP004'],
    },
  },
  {
    id: '5',
    title: 'Statistics for Data Analysis',
    description: 'Comprehensive guide to statistical methods and their applications.',
    thumbnail: 'https://source.unsplash.com/random/400x300/?statistics,data',
    duration: '14 hours',
    level: 'intermediate',
    category: 'Data Science',
  },
  {
    id: '6',
    title: 'Linear Algebra for Machine Learning',
    description: 'Core linear algebra concepts essential for understanding ML algorithms.',
    thumbnail: 'https://source.unsplash.com/random/400x300/?algebra,math',
    duration: '16 hours',
    level: 'advanced',
    category: 'Engineering',
  },
  {
    id: '7',
    title: 'Business Analytics',
    description: 'Data-driven decision making for business professionals.',
    thumbnail: 'https://source.unsplash.com/random/400x300/?business,analytics',
    duration: '9 hours',
    level: 'intermediate',
    category: 'Business',
  },
  {
    id: '8',
    title: 'Python for Data Science',
    description: 'Hands-on Python programming for data analysis and visualization.',
    thumbnail: 'https://source.unsplash.com/random/400x300/?python,programming',
    duration: '11 hours',
    level: 'beginner',
    category: 'Data Science',
  },
  {
    id: '9',
    title: 'Optimization Techniques',
    description: 'Mathematical optimization methods for engineering problems.',
    thumbnail: 'https://source.unsplash.com/random/400x300/?optimization,math',
    duration: '13 hours',
    level: 'advanced',
    category: 'Engineering',
  },
  {
    id: '10',
    title: 'Financial Risk Analysis',
    description: 'Advanced techniques for analyzing and managing financial risks.',
    thumbnail: 'https://source.unsplash.com/random/400x300/?finance,risk',
    duration: '12 hours',
    level: 'advanced',
    category: 'Finance',
  },
];

const mockDepartments: Department[] = [
  { id: '1', name: 'Engineering', employeeCount: 25 },
  { id: '2', name: 'Business', employeeCount: 15 },
  { id: '3', name: 'Data Science', employeeCount: 10 },
];

const mockEmployees: Employee[] = [
  { id: 'EMP001', name: 'John Smith', department: 'Engineering', avatar: '/avatars/john.jpg' },
  { id: 'EMP002', name: 'Sarah Johnson', department: 'Business', avatar: '/avatars/sarah.jpg' },
  { id: 'EMP003', name: 'Michael Brown', department: 'Engineering', avatar: '/avatars/michael.jpg' },
];

const CourseAllocation: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>(mockCourses);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [allocationType, setAllocationType] = useState<'department' | 'employee'>('department');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [levelFilter, setLevelFilter] = useState<string>('all');

  const handleOpenDialog = (course: Course) => {
    setSelectedCourse(course);
    setSelectedDepartments(course.allocatedTo?.departments || []);
    setSelectedEmployees(course.allocatedTo?.employees || []);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCourse(null);
    setSelectedDepartments([]);
    setSelectedEmployees([]);
  };

  const handleAllocate = () => {
    if (!selectedCourse) return;

    const updatedCourses = courses.map(course =>
      course.id === selectedCourse.id
        ? {
            ...course,
            allocatedTo: {
              departments: allocationType === 'department' ? selectedDepartments : course.allocatedTo?.departments || [],
              employees: allocationType === 'employee' ? selectedEmployees : course.allocatedTo?.employees || [],
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
          Course Allocation
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Allocate video courses to departments or individual employees
        </Typography>
      </Box>

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
                <MenuItem value="Engineering">Engineering</MenuItem>
                <MenuItem value="Data Science">Data Science</MenuItem>
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
                icon={<GroupIcon />}
                label="Department Allocation"
                value="department"
              />
              <Tab
                icon={<PersonIcon />}
                label="Employee Allocation"
                value="employee"
              />
            </Tabs>

            {allocationType === 'department' ? (
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
            ) : (
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
                  {mockEmployees.map((emp) => (
                    <MenuItem key={emp.id} value={emp.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <Avatar src={emp.avatar} sx={{ width: 24, height: 24, mr: 1 }} />
                        <Typography>{emp.name}</Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ ml: 'auto' }}
                        >
                          {emp.department}
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

export default CourseAllocation; 