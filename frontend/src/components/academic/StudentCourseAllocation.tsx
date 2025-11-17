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
    students: string[];
    classes: string[];
  };
}

interface Student {
  id: string;
  name: string;
  class: string;
  avatar?: string;
  grade: string;
}

interface Class {
  id: string;
  name: string;
  studentCount: number;
  grade: string;
}

interface AllocationStats {
  totalCourses: number;
  allocatedCourses: number;
  studentsEnrolled: number;
  completionRate: number;
}

interface DepartmentAllocation {
  departmentId: string;
  name: string;
  courses: Course[];
  studentCount: number;
  progress: number;
}

interface GradeAllocation {
  grade: string;
  courses: Course[];
  studentCount: number;
  completionRate: number;
  progress: number;
}

interface StudentAllocation {
  studentId: string;
  name: string;
  grade: string;
  class: string;
  courses: Course[];
  progress: number;
  lastActive: string;
}

// Mock data
const mockCourses: Course[] = [
  {
    id: '1',
    title: 'Basic Mathematics',
    description: 'Fundamental mathematical concepts for beginners, covering arithmetic, fractions, and basic algebra.',
    thumbnail: 'https://source.unsplash.com/random/400x300/?math,basic',
    duration: '10 hours',
    level: 'beginner',
    category: 'Mathematics',
    allocatedTo: {
      students: ['ST001', 'ST003'],
      classes: ['CLASS1'],
    },
  },
  {
    id: '2',
    title: 'Algebra Fundamentals',
    description: 'Introduction to algebraic concepts, equations, and problem-solving techniques.',
    thumbnail: 'https://source.unsplash.com/random/400x300/?algebra,math',
    duration: '12 hours',
    level: 'intermediate',
    category: 'Mathematics',
    allocatedTo: {
      students: ['ST002'],
      classes: ['CLASS2'],
    },
  },
  {
    id: '3',
    title: 'Geometry Basics',
    description: 'Understanding shapes, angles, and spatial relationships in mathematics.',
    thumbnail: 'https://source.unsplash.com/random/400x300/?geometry,math',
    duration: '8 hours',
    level: 'beginner',
    category: 'Mathematics',
  },
  {
    id: '4',
    title: 'Trigonometry Essentials',
    description: 'Comprehensive study of trigonometric functions and their applications.',
    thumbnail: 'https://source.unsplash.com/random/400x300/?trigonometry,math',
    duration: '15 hours',
    level: 'intermediate',
    category: 'Mathematics',
    allocatedTo: {
      students: ['ST001', 'ST002', 'ST003'],
      classes: ['CLASS1', 'CLASS2'],
    },
  },
  {
    id: '5',
    title: 'Calculus Introduction',
    description: 'Basic concepts of differential and integral calculus for advanced students.',
    thumbnail: 'https://source.unsplash.com/random/400x300/?calculus,math',
    duration: '20 hours',
    level: 'advanced',
    category: 'Mathematics',
  },
  {
    id: '6',
    title: 'Statistics for Beginners',
    description: 'Introduction to statistical concepts, data analysis, and probability.',
    thumbnail: 'https://source.unsplash.com/random/400x300/?statistics,data',
    duration: '14 hours',
    level: 'beginner',
    category: 'Mathematics',
    allocatedTo: {
      students: ['ST001'],
      classes: ['CLASS1'],
    },
  },
  {
    id: '7',
    title: 'Mathematical Problem Solving',
    description: 'Advanced techniques for solving complex mathematical problems.',
    thumbnail: 'https://source.unsplash.com/random/400x300/?problem,solving',
    duration: '16 hours',
    level: 'advanced',
    category: 'Mathematics',
  },
  {
    id: '8',
    title: 'Number Theory Basics',
    description: 'Introduction to the properties and relationships of numbers.',
    thumbnail: 'https://source.unsplash.com/random/400x300/?numbers,math',
    duration: '12 hours',
    level: 'intermediate',
    category: 'Mathematics',
    allocatedTo: {
      students: ['ST002', 'ST003'],
      classes: ['CLASS2'],
    },
  },
  {
    id: '9',
    title: 'Mathematical Logic',
    description: 'Study of formal logic and its applications in mathematics.',
    thumbnail: 'https://source.unsplash.com/random/400x300/?logic,math',
    duration: '10 hours',
    level: 'intermediate',
    category: 'Mathematics',
  },
  {
    id: '10',
    title: 'Advanced Problem Solving',
    description: 'Mastering complex mathematical problems and developing critical thinking skills.',
    thumbnail: 'https://source.unsplash.com/random/400x300/?advanced,math',
    duration: '18 hours',
    level: 'advanced',
    category: 'Mathematics',
    allocatedTo: {
      students: ['ST001', 'ST002'],
      classes: ['CLASS1', 'CLASS2'],
    },
  },
];

const mockStudents: Student[] = [
  { id: 'ST001', name: 'Alice Johnson', class: 'Class 7A', avatar: '/avatars/alice.jpg', grade: '7' },
  { id: 'ST002', name: 'Bob Smith', class: 'Class 8B', avatar: '/avatars/bob.jpg', grade: '8' },
  { id: 'ST003', name: 'Carol Williams', class: 'Class 7A', avatar: '/avatars/carol.jpg', grade: '7' },
];

const mockClasses: Class[] = [
  { id: 'CLASS1', name: 'Class 7A', studentCount: 25, grade: '7' },
  { id: 'CLASS2', name: 'Class 8B', studentCount: 30, grade: '8' },
  { id: 'CLASS3', name: 'Class 9C', studentCount: 28, grade: '9' },
];

const mockAllocationStats: AllocationStats = {
  totalCourses: 10,
  allocatedCourses: 6,
  studentsEnrolled: 45,
  completionRate: 75,
};

const mockDepartmentAllocations: DepartmentAllocation[] = [
  {
    departmentId: 'DEPT1',
    name: 'Mathematics Department',
    courses: mockCourses.filter(course => course.allocatedTo?.classes?.includes('CLASS1')),
    studentCount: 25,
    progress: 80,
  },
  {
    departmentId: 'DEPT2',
    name: 'Science Department',
    courses: mockCourses.filter(course => course.allocatedTo?.classes?.includes('CLASS2')),
    studentCount: 30,
    progress: 65,
  },
];

const mockGradeAllocations: GradeAllocation[] = [
  {
    grade: '7',
    courses: mockCourses.filter(course => course.allocatedTo?.classes?.includes('CLASS1')),
    studentCount: 25,
    completionRate: 85,
    progress: 75,
  },
  {
    grade: '8',
    courses: mockCourses.filter(course => course.allocatedTo?.classes?.includes('CLASS2')),
    studentCount: 30,
    completionRate: 70,
    progress: 60,
  },
  {
    grade: '9',
    courses: mockCourses.filter(course => course.allocatedTo?.classes?.includes('CLASS3')),
    studentCount: 28,
    completionRate: 65,
    progress: 55,
  },
];

const mockStudentAllocations: StudentAllocation[] = [
  {
    studentId: 'ST001',
    name: 'Alice Johnson',
    grade: '7',
    class: 'Class 7A',
    courses: mockCourses.filter(course => course.allocatedTo?.students?.includes('ST001')),
    progress: 80,
    lastActive: '2024-03-15',
  },
  {
    studentId: 'ST002',
    name: 'Bob Smith',
    grade: '8',
    class: 'Class 8B',
    courses: mockCourses.filter(course => course.allocatedTo?.students?.includes('ST002')),
    progress: 65,
    lastActive: '2024-03-14',
  },
  {
    studentId: 'ST003',
    name: 'Carol Williams',
    grade: '7',
    class: 'Class 7A',
    courses: mockCourses.filter(course => course.allocatedTo?.students?.includes('ST003')),
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

const GradeCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '100%',
  background: 'linear-gradient(135deg, #f6f7f9 0%, #e9ecef 100%)',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[8],
  },
}));

const StudentCard = styled(Paper)(({ theme }) => ({
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
              {mockAllocationStats.studentsEnrolled}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Students Enrolled
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

      <Grid container spacing={3}>
        {mockDepartmentAllocations.map((dept) => (
          <Grid item xs={12} md={6} key={dept.departmentId}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">{dept.name}</Typography>
                <Chip
                  label={`${dept.studentCount} Students`}
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
                  {dept.progress}% Complete
                </Typography>
              </Box>

              <Typography variant="subtitle2" gutterBottom>
                Allocated Courses:
              </Typography>
              <Grid container spacing={2}>
                {dept.courses.map((course) => (
                  <Grid item xs={12} sm={6} key={course.id}>
                    <Paper
                      sx={{
                        p: 2,
                        display: 'flex',
                        alignItems: 'center',
                        background: 'linear-gradient(45deg, #f3f4f6 30%, #e5e7eb 90%)',
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
                        label={course.allocatedTo?.students?.length || 0}
                        color="primary"
                        variant="outlined"
                      />
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

const GradeAllocationView: React.FC = () => {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Grade-wise Course Allocation
      </Typography>
      
      <Grid container spacing={3}>
        {mockGradeAllocations.map((grade) => (
          <Grid item xs={12} md={4} key={grade.grade}>
            <GradeCard>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Grade {grade.grade}</Typography>
                <Chip
                  label={`${grade.studentCount} Students`}
                  color="primary"
                  variant="outlined"
                />
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Progress
                </Typography>
                <ProgressBar sx={{ '&::after': { width: `${grade.progress}%` } }} />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  {grade.progress}% Complete • {grade.completionRate}% Completion Rate
                </Typography>
              </Box>

              <Typography variant="subtitle2" gutterBottom>
                Allocated Courses:
              </Typography>
              <Grid container spacing={1}>
                {grade.courses.map((course) => (
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
                        label={course.allocatedTo?.students?.length || 0}
                        color="primary"
                        variant="outlined"
                      />
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </GradeCard>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

const StudentAllocationView: React.FC = () => {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Student-wise Course Allocation
      </Typography>
      
      <Grid container spacing={3}>
        {mockStudentAllocations.map((student) => (
          <Grid item xs={12} key={student.studentId}>
            <StudentCard>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ mr: 2 }}>{student.name.charAt(0)}</Avatar>
                    <Box>
                      <Typography variant="subtitle1">{student.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Grade {student.grade} • {student.class}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CircularProgress
                      variant="determinate"
                      value={student.progress}
                      size={40}
                      thickness={4}
                      sx={{ mr: 2 }}
                    />
                    <Box>
                      <Typography variant="body2">Progress</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {student.progress}% Complete
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {student.courses.map((course) => (
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
            </StudentCard>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

const StudentCourseAllocation: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>(mockCourses);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [allocationType, setAllocationType] = useState<'student' | 'class'>('student');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [levelFilter, setLevelFilter] = useState<string>('all');

  const handleOpenDialog = (course: Course) => {
    setSelectedCourse(course);
    setSelectedStudents(course.allocatedTo?.students || []);
    setSelectedClasses(course.allocatedTo?.classes || []);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCourse(null);
    setSelectedStudents([]);
    setSelectedClasses([]);
  };

  const handleAllocate = () => {
    if (!selectedCourse) return;

    const updatedCourses = courses.map(course =>
      course.id === selectedCourse.id
        ? {
            ...course,
            allocatedTo: {
              students: allocationType === 'student' ? selectedStudents : course.allocatedTo?.students || [],
              classes: allocationType === 'class' ? selectedClasses : course.allocatedTo?.classes || [],
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
          Student Course Allocation
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Allocate courses to individual students or entire classes
        </Typography>
      </Box>

      <AllocationOverview />
      <GradeAllocationView />
      <StudentAllocationView />

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
                <MenuItem value="Science">Science</MenuItem>
                <MenuItem value="Language">Language</MenuItem>
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
                label="Student Allocation"
                value="student"
              />
              <Tab
                icon={<GroupIcon />}
                label="Class Allocation"
                value="class"
              />
            </Tabs>

            {allocationType === 'student' ? (
              <FormControl fullWidth>
                <InputLabel>Select Students</InputLabel>
                <Select
                  multiple
                  value={selectedStudents}
                  onChange={(e) => setSelectedStudents(e.target.value as string[])}
                  label="Select Students"
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => {
                        const student = mockStudents.find(s => s.id === value);
                        return (
                          <Chip
                            key={value}
                            avatar={<Avatar src={student?.avatar} />}
                            label={student?.name}
                            size="small"
                          />
                        );
                      })}
                    </Box>
                  )}
                >
                  {mockStudents.map((student) => (
                    <MenuItem key={student.id} value={student.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <Avatar src={student.avatar} sx={{ width: 24, height: 24, mr: 1 }} />
                        <Typography>{student.name}</Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ ml: 'auto' }}
                        >
                          {student.class}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : (
              <FormControl fullWidth>
                <InputLabel>Select Classes</InputLabel>
                <Select
                  multiple
                  value={selectedClasses}
                  onChange={(e) => setSelectedClasses(e.target.value as string[])}
                  label="Select Classes"
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip
                          key={value}
                          label={mockClasses.find(c => c.id === value)?.name}
                          size="small"
                        />
                      ))}
                    </Box>
                  )}
                >
                  {mockClasses.map((cls) => (
                    <MenuItem key={cls.id} value={cls.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <Typography>{cls.name}</Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ ml: 'auto' }}
                        >
                          {cls.studentCount} students
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

export default StudentCourseAllocation; 