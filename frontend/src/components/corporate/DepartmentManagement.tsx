import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid,
  styled,
  Card,
  CardContent,
  Tooltip,
  Avatar,
  Divider,
  Badge,
  Autocomplete,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Business as DepartmentIcon,
  SupervisorAccount as HeadIcon,
  Group as EmployeeIcon,
  Person as HRBPIcon,
} from '@mui/icons-material';
import { mockEmployees } from './EmployeeManagement';
import GlobalLayout from '../layout/GlobalLayout';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  margin: theme.spacing(2),
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  maxWidth: '1600px',
  marginLeft: 'auto',
  marginRight: 'auto',
  width: '100%',
}));

const StyledCard = styled(Card)(({ theme }) => ({
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
  },
  height: '100%',
}));

interface Employee {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  location: string;
  joiningDate: string;
  status: 'active' | 'inactive';
  designation: string;
  roleType: 'employee' | 'head' | 'hrbp';
}

interface DepartmentHead {
  id: string;
  name: string;
  email: string;
  position: string;
}

interface HRBP {
  id: string;
  name: string;
  email: string;
  position: string;
}

interface Department {
  id: string;
  name: string;
  description: string;
  head: DepartmentHead | null;
  hrbp: HRBP | null;
  employees: Employee[];
  status: 'active' | 'inactive';
}

// Mock data for demonstration
const mockDepartments: Department[] = [
  {
    id: '1',
    name: 'Engineering',
    description: 'Software development and technical operations',
    head: {
      id: 'h1',
      name: 'John Smith',
      email: 'john.smith@corporate.com',
      position: 'Engineering Director',
    },
    hrbp: {
      id: 'hr1',
      name: 'Sarah Johnson',
      email: 'sarah.j@corporate.com',
      position: 'HR Business Partner',
    },
    employees: [
      {
        id: 'e1',
        employeeId: 'EMP003',
        name: 'Michael Brown',
        email: 'michael.b@corporate.com',
        phone: '+1 234-567-8903',
        department: 'Engineering',
        position: 'Senior Developer',
        location: 'New York',
        joiningDate: '2020-03-10',
        status: 'active',
        designation: 'Senior Developer',
        roleType: 'employee',
      },
      {
        id: 'e2',
        employeeId: 'EMP004',
        name: 'Emily Davis',
        email: 'emily.d@corporate.com',
        phone: '+1 234-567-8904',
        department: 'Engineering',
        position: 'Software Engineer',
        location: 'New York',
        joiningDate: '2020-04-15',
        status: 'active',
        designation: 'Software Engineer',
        roleType: 'employee',
      },
    ],
    status: 'active',
  },
  {
    id: '2',
    name: 'Finance',
    description: 'Financial operations and accounting',
    head: {
      id: 'h2',
      name: 'David Wilson',
      email: 'david.w@corporate.com',
      position: 'Finance Director',
    },
    hrbp: {
      id: 'hr2',
      name: 'Lisa Martinez',
      email: 'lisa.m@corporate.com',
      position: 'HR Business Partner',
    },
    employees: [
      {
        id: 'e3',
        employeeId: 'EMP006',
        name: 'Jennifer Taylor',
        email: 'jennifer.t@corporate.com',
        phone: '+1 234-567-8906',
        department: 'Finance',
        position: 'Financial Analyst',
        location: 'London',
        joiningDate: '2020-06-18',
        status: 'active',
        designation: 'Financial Analyst',
        roleType: 'employee',
      },
      {
        id: 'e4',
        employeeId: 'EMP007',
        name: 'Robert Anderson',
        email: 'robert.a@corporate.com',
        phone: '+1 234-567-8907',
        department: 'Finance',
        position: 'Accountant',
        location: 'London',
        joiningDate: '2020-07-22',
        status: 'active',
        designation: 'Accountant',
        roleType: 'employee',
      },
    ],
    status: 'active',
  },
  {
    id: '3',
    name: 'Marketing',
    description: 'Marketing and communications',
    head: {
      id: 'h3',
      name: 'James Thompson',
      email: 'james.t@corporate.com',
      position: 'Marketing Director',
    },
    hrbp: {
      id: 'hr3',
      name: 'Patricia White',
      email: 'patricia.w@corporate.com',
      position: 'HR Business Partner',
    },
    employees: [
      {
        id: 'e5',
        employeeId: 'EMP009',
        name: 'William Clark',
        email: 'william.c@corporate.com',
        phone: '+1 234-567-8909',
        department: 'Marketing',
        position: 'Marketing Manager',
        location: 'Singapore',
        joiningDate: '2020-09-14',
        status: 'active',
        designation: 'Manager',
        roleType: 'employee',
      },
      {
        id: 'e6',
        employeeId: 'EMP010',
        name: 'Elizabeth Hall',
        email: 'elizabeth.h@corporate.com',
        phone: '+1 234-567-8910',
        department: 'Marketing',
        position: 'Content Specialist',
        location: 'Singapore',
        joiningDate: '2020-10-25',
        status: 'active',
        designation: 'Content Specialist',
        roleType: 'employee',
      },
    ],
    status: 'active',
  },
  {
    id: '4',
    name: 'Human Resources',
    description: 'HR operations and employee relations',
    head: {
      id: 'h4',
      name: 'Thomas Lee',
      email: 'thomas.l@corporate.com',
      position: 'HR Director',
    },
    hrbp: {
      id: 'hr4',
      name: 'Margaret Scott',
      email: 'margaret.s@corporate.com',
      position: 'HR Business Partner',
    },
    employees: [
      {
        id: 'e7',
        employeeId: 'EMP011',
        name: 'Daniel Young',
        email: 'daniel.y@corporate.com',
        phone: '+1 234-567-8911',
        department: 'Human Resources',
        position: 'HR Manager',
        location: 'Tokyo',
        joiningDate: '2020-11-30',
        status: 'active',
        designation: 'HR Manager',
        roleType: 'employee',
      },
      {
        id: 'e8',
        employeeId: 'EMP012',
        name: 'Jessica King',
        email: 'jessica.k@corporate.com',
        phone: '+1 234-567-8912',
        department: 'Human Resources',
        position: 'Recruitment Specialist',
        location: 'Tokyo',
        joiningDate: '2020-12-15',
        status: 'active',
        designation: 'Recruitment Specialist',
        roleType: 'employee',
      },
    ],
    status: 'active',
  },
  {
    id: '5',
    name: 'Operations',
    description: 'Business operations and logistics',
    head: {
      id: 'h5',
      name: 'Richard Allen',
      email: 'richard.a@corporate.com',
      position: 'Operations Director',
    },
    hrbp: {
      id: 'hr5',
      name: 'Susan Baker',
      email: 'susan.b@corporate.com',
      position: 'HR Business Partner',
    },
    employees: [
      {
        id: 'e9',
        employeeId: 'EMP013',
        name: 'Charles Wright',
        email: 'charles.w@corporate.com',
        phone: '+1 234-567-8913',
        department: 'Operations',
        position: 'Operations Manager',
        location: 'San Francisco',
        joiningDate: '2021-01-20',
        status: 'active',
        designation: 'Operations Manager',
        roleType: 'employee',
      },
      {
        id: 'e10',
        employeeId: 'EMP014',
        name: 'Karen Green',
        email: 'karen.g@corporate.com',
        phone: '+1 234-567-8914',
        department: 'Operations',
        position: 'Logistics Coordinator',
        location: 'San Francisco',
        joiningDate: '2021-02-10',
        status: 'active',
        designation: 'Logistics Coordinator',
        roleType: 'employee',
      },
    ],
    status: 'active',
  },
  {
    id: '6',
    name: 'Sales',
    description: 'Sales operations and customer acquisition',
    head: {
      id: 'h6',
      name: 'Christopher Harris',
      email: 'christopher.h@corporate.com',
      position: 'Sales Director',
    },
    hrbp: {
      id: 'hr6',
      name: 'Nancy Adams',
      email: 'nancy.a@corporate.com',
      position: 'HR Business Partner',
    },
    employees: [
      {
        id: 'e11',
        employeeId: 'EMP015',
        name: 'Matthew Turner',
        email: 'matthew.t@corporate.com',
        phone: '+1 234-567-8915',
        department: 'Sales',
        position: 'Sales Manager',
        location: 'Dubai',
        joiningDate: '2021-03-05',
        status: 'active',
        designation: 'Sales Manager',
        roleType: 'employee',
      },
      {
        id: 'e12',
        employeeId: 'EMP016',
        name: 'Laura Parker',
        email: 'laura.p@corporate.com',
        phone: '+1 234-567-8916',
        department: 'Sales',
        position: 'Account Executive',
        location: 'Dubai',
        joiningDate: '2021-04-12',
        status: 'active',
        designation: 'Account Executive',
        roleType: 'employee',
      },
    ],
    status: 'active',
  },
  {
    id: '7',
    name: 'Product Management',
    description: 'Product strategy and development',
    head: {
      id: 'h7',
      name: 'Andrew Cooper',
      email: 'andrew.c@corporate.com',
      position: 'Product Director',
    },
    hrbp: {
      id: 'hr7',
      name: 'Rebecca Evans',
      email: 'rebecca.e@corporate.com',
      position: 'HR Business Partner',
    },
    employees: [
      {
        id: 'e13',
        employeeId: 'EMP017',
        name: 'Kevin Mitchell',
        email: 'kevin.m@corporate.com',
        phone: '+1 234-567-8917',
        department: 'Product Management',
        position: 'Product Manager',
        location: 'Berlin',
        joiningDate: '2021-05-18',
        status: 'active',
        designation: 'Product Manager',
        roleType: 'employee',
      },
      {
        id: 'e14',
        employeeId: 'EMP018',
        name: 'Amanda Foster',
        email: 'amanda.f@corporate.com',
        phone: '+1 234-567-8918',
        department: 'Product Management',
        position: 'Product Owner',
        location: 'Berlin',
        joiningDate: '2021-06-22',
        status: 'active',
        designation: 'Product Owner',
        roleType: 'employee',
      },
    ],
    status: 'active',
  },
  {
    id: '8',
    name: 'Customer Success',
    description: 'Customer support and success management',
    head: {
      id: 'h8',
      name: 'Steven Rogers',
      email: 'steven.r@corporate.com',
      position: 'Customer Success Director',
    },
    hrbp: {
      id: 'hr8',
      name: 'Michelle Stewart',
      email: 'michelle.s@corporate.com',
      position: 'HR Business Partner',
    },
    employees: [
      {
        id: 'e15',
        employeeId: 'EMP019',
        name: 'Brian Carter',
        email: 'brian.c@corporate.com',
        phone: '+1 234-567-8919',
        department: 'Customer Success',
        position: 'Customer Success Manager',
        location: 'Sydney',
        joiningDate: '2021-07-30',
        status: 'active',
        designation: 'Customer Success Manager',
        roleType: 'employee',
      },
      {
        id: 'e16',
        employeeId: 'EMP020',
        name: 'Rachel Bennett',
        email: 'rachel.b@corporate.com',
        phone: '+1 234-567-8920',
        department: 'Customer Success',
        position: 'Support Specialist',
        location: 'Sydney',
        joiningDate: '2021-08-15',
        status: 'active',
        designation: 'Support Specialist',
        roleType: 'employee',
      },
    ],
    status: 'active',
  },
  {
    id: '9',
    name: 'Research & Development',
    description: 'Innovation and technology research',
    head: {
      id: 'h9',
      name: 'Edward Hughes',
      email: 'edward.h@corporate.com',
      position: 'R&D Director',
    },
    hrbp: {
      id: 'hr9',
      name: 'Victoria Reed',
      email: 'victoria.r@corporate.com',
      position: 'HR Business Partner',
    },
    employees: [
      {
        id: 'e17',
        employeeId: 'EMP021',
        name: 'Patrick Morgan',
        email: 'patrick.m@corporate.com',
        phone: '+1 234-567-8921',
        department: 'Research & Development',
        position: 'Research Scientist',
        location: 'Toronto',
        joiningDate: '2021-09-20',
        status: 'active',
        designation: 'Research Scientist',
        roleType: 'employee',
      },
      {
        id: 'e18',
        employeeId: 'EMP022',
        name: 'Samantha Ward',
        email: 'samantha.w@corporate.com',
        phone: '+1 234-567-8922',
        department: 'Research & Development',
        position: 'Development Engineer',
        location: 'Toronto',
        joiningDate: '2021-10-05',
        status: 'active',
        designation: 'Development Engineer',
        roleType: 'employee',
      },
    ],
    status: 'active',
  },
  {
    id: '10',
    name: 'Quality Assurance',
    description: 'Quality control and testing',
    head: {
      id: 'h10',
      name: 'George Peterson',
      email: 'george.p@corporate.com',
      position: 'QA Director',
    },
    hrbp: {
      id: 'hr10',
      name: 'Cynthia Cook',
      email: 'cynthia.c@corporate.com',
      position: 'HR Business Partner',
    },
    employees: [
      {
        id: 'e19',
        employeeId: 'EMP023',
        name: 'Timothy Bailey',
        email: 'timothy.b@corporate.com',
        phone: '+1 234-567-8923',
        department: 'Quality Assurance',
        position: 'QA Manager',
        location: 'Paris',
        joiningDate: '2021-11-15',
        status: 'active',
        designation: 'QA Manager',
        roleType: 'employee',
      },
      {
        id: 'e20',
        employeeId: 'EMP024',
        name: 'Nicole Murphy',
        email: 'nicole.m@corporate.com',
        phone: '+1 234-567-8924',
        department: 'Quality Assurance',
        position: 'Test Engineer',
        location: 'Paris',
        joiningDate: '2021-12-01',
        status: 'active',
        designation: 'Test Engineer',
        roleType: 'employee',
      },
    ],
    status: 'active',
  },
];

const DepartmentManagement = () => {
  const [departments, setDepartments] = useState<Department[]>(mockDepartments);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [headFilter, setHeadFilter] = useState<string>('');
  const [hrbpFilter, setHrbpFilter] = useState<string>('');

  const handleAddDepartment = () => {
    setSelectedDepartment(null);
    setOpenDialog(true);
  };

  const handleEditDepartment = (department: Department) => {
    setSelectedDepartment(department);
    setOpenDialog(true);
  };

  const handleDeleteDepartment = (departmentId: string) => {
    setDepartments(departments.filter(department => department.id !== departmentId));
  };

  const handleSaveDepartment = (departmentData: Partial<Department>) => {
    if (selectedDepartment) {
      setDepartments(departments.map(department =>
        department.id === selectedDepartment.id ? { ...department, ...departmentData } : department
      ));
    } else {
      const newDepartment: Department = {
        id: Math.random().toString(36).substr(2, 9),
        name: '',
        description: '',
        head: null,
        hrbp: null,
        employees: [],
        status: 'active',
        ...departmentData,
      };
      setDepartments([...departments, newDepartment]);
    }
    setOpenDialog(false);
  };

  const filteredDepartments = departments.filter(department => {
    const matchesSearch = 
      department.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      department.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || department.status === statusFilter;
    
    const matchesHead = !headFilter || 
      (department.head && department.head.name.toLowerCase().includes(headFilter.toLowerCase()));
    
    const matchesHRBP = !hrbpFilter || 
      (department.hrbp && department.hrbp.name.toLowerCase().includes(hrbpFilter.toLowerCase()));

    return matchesSearch && matchesStatus && matchesHead && matchesHRBP;
  });

  return (
    <GlobalLayout>
      <Box>
        <StyledPaper>
          <Box sx={{ maxWidth: '1400px', mx: 'auto', width: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" component="h2">
                Department Management
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddDepartment}
              >
                Add Department
              </Button>
            </Box>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Search departments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                    label="Status"
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Filter by Department Head..."
                  value={headFilter}
                  onChange={(e) => setHeadFilter(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Filter by HRBP..."
                  value={hrbpFilter}
                  onChange={(e) => setHrbpFilter(e.target.value)}
                />
              </Grid>
            </Grid>

            <Grid container spacing={3}>
              {filteredDepartments.map((department) => (
                <Grid item xs={12} sm={6} lg={4} key={department.id}>
                  <StyledCard>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                          {department.name.charAt(0)}
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="h6">{department.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {department.description}
                          </Typography>
                        </Box>
                        <Box>
                          <Tooltip title="Edit">
                            <IconButton onClick={() => handleEditDepartment(department)} size="small">
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton onClick={() => handleDeleteDepartment(department.id)} size="small">
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>

                      <Divider sx={{ my: 2 }} />

                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <HeadIcon sx={{ mr: 1, fontSize: 'small', color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {department.head ? department.head.name : 'No Head Assigned'}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <HRBPIcon sx={{ mr: 1, fontSize: 'small', color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {department.hrbp ? department.hrbp.name : 'No HRBP Assigned'}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <EmployeeIcon sx={{ mr: 1, fontSize: 'small', color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {department.employees.length} Employees
                        </Typography>
                      </Box>

                      <Box sx={{ mt: 2 }}>
                        <Chip
                          label={department.status}
                          color={department.status === 'active' ? 'success' : 'error'}
                          size="small"
                        />
                      </Box>
                    </CardContent>
                  </StyledCard>
                </Grid>
              ))}
            </Grid>
          </Box>
        </StyledPaper>

        <DepartmentDialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          onSave={handleSaveDepartment}
          department={selectedDepartment}
        />
      </Box>
    </GlobalLayout>
  );
};

interface DepartmentDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (departmentData: Partial<Department>) => void;
  department: Department | null;
}

const DepartmentDialog: React.FC<DepartmentDialogProps> = ({
  open,
  onClose,
  onSave,
  department,
}) => {
  const [formData, setFormData] = useState<Partial<Department>>(
    department || {
      name: '',
      description: '',
      head: null,
      hrbp: null,
      employees: [],
      status: 'active',
    }
  );

  // Get all employees who are department heads
  const potentialHeads = mockEmployees.filter((emp: Employee) => emp.roleType === 'head');
  
  // Get all employees who are HRBPs
  const potentialHRBPs = mockEmployees.filter((emp: Employee) => emp.roleType === 'hrbp');

  React.useEffect(() => {
    setFormData(department || {
      name: '',
      description: '',
      head: null,
      hrbp: null,
      employees: [],
      status: 'active',
    });
  }, [department]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {department ? 'Edit Department' : 'Add New Department'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Department Name"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Department Head</InputLabel>
                <Select
                  value={formData.head?.id || ''}
                  label="Department Head"
                  onChange={(e) => {
                    const selectedHead = potentialHeads.find((head: Employee) => head.id === e.target.value);
                    if (selectedHead) {
                      setFormData({
                        ...formData,
                        head: {
                          id: selectedHead.id,
                          name: selectedHead.name,
                          email: selectedHead.email,
                          position: selectedHead.position,
                        },
                      });
                    }
                  }}
                >
                  <MenuItem value="">Select Department Head</MenuItem>
                  {potentialHeads.map((head: Employee) => (
                    <MenuItem key={head.id} value={head.id}>
                      {head.name} ({head.department})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>HR Business Partner</InputLabel>
                <Select
                  value={formData.hrbp?.id || ''}
                  label="HR Business Partner"
                  onChange={(e) => {
                    const selectedHRBP = potentialHRBPs.find((hrbp: Employee) => hrbp.id === e.target.value);
                    if (selectedHRBP) {
                      setFormData({
                        ...formData,
                        hrbp: {
                          id: selectedHRBP.id,
                          name: selectedHRBP.name,
                          email: selectedHRBP.email,
                          position: selectedHRBP.position,
                        },
                      });
                    }
                  }}
                >
                  <MenuItem value="">Select HRBP</MenuItem>
                  {potentialHRBPs.map((hrbp: Employee) => (
                    <MenuItem key={hrbp.id} value={hrbp.id}>
                      {hrbp.name} ({hrbp.department})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status || 'active'}
                  label="Status"
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            {department ? 'Save Changes' : 'Add Department'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default DepartmentManagement; 