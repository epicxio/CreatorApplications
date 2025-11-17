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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Work as WorkIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Business as DepartmentIcon,
  Badge as EmployeeIdIcon,
} from '@mui/icons-material';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  margin: theme.spacing(2),
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
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

export const mockEmployees: Employee[] = [
  {
    id: '1',
    employeeId: 'EMP001',
    name: 'John Smith',
    email: 'john.smith@corporate.com',
    phone: '+1 234-567-8901',
    department: 'Engineering',
    position: 'Senior Developer',
    location: 'New York',
    joiningDate: '2020-01-15',
    status: 'active',
    designation: 'Director',
    roleType: 'head',
  },
  {
    id: '2',
    employeeId: 'EMP002',
    name: 'Sarah Johnson',
    email: 'sarah.j@corporate.com',
    phone: '+1 234-567-8902',
    department: 'Engineering',
    position: 'HR Business Partner',
    location: 'New York',
    joiningDate: '2020-02-20',
    status: 'active',
    designation: 'HR Business Partner',
    roleType: 'hrbp',
  },
  {
    id: '3',
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
    id: '4',
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
  {
    id: '5',
    employeeId: 'EMP005',
    name: 'David Wilson',
    email: 'david.w@corporate.com',
    phone: '+1 234-567-8905',
    department: 'Finance',
    position: 'Finance Manager',
    location: 'London',
    joiningDate: '2020-05-20',
    status: 'active',
    designation: 'Director',
    roleType: 'head',
  },
  {
    id: '6',
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
    id: '7',
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
  {
    id: '8',
    employeeId: 'EMP008',
    name: 'Lisa Martinez',
    email: 'lisa.m@corporate.com',
    phone: '+1 234-567-8908',
    department: 'Finance',
    position: 'HR Business Partner',
    location: 'London',
    joiningDate: '2020-08-30',
    status: 'active',
    designation: 'HR Business Partner',
    roleType: 'hrbp',
  },
  {
    id: '9',
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
    id: '10',
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
];

const departments = ['Engineering', 'Finance', 'HR', 'Marketing', 'Operations', 'Sales'];
const positions = ['Developer', 'Manager', 'Director', 'Analyst', 'Specialist', 'Lead'];
const locations = ['New York', 'London', 'Singapore', 'Tokyo', 'San Francisco', 'Dubai', 'Berlin', 'Sydney', 'Toronto', 'Paris'];
const courses = ['Basic Mathematics', 'Business Mathematics', 'Advanced Mathematics', 'Statistics', 'Data Analysis', 'Analytics'];

const EmployeeManagement: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState<string>('');

  const handleAddEmployee = () => {
    setSelectedEmployee(null);
    setOpenDialog(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setOpenDialog(true);
  };

  const handleDeleteEmployee = (employeeId: string) => {
    setEmployees(employees.filter(employee => employee.id !== employeeId));
  };

  const handleSaveEmployee = (employeeData: Partial<Employee>) => {
    if (selectedEmployee) {
      setEmployees(employees.map(employee =>
        employee.id === selectedEmployee.id ? { ...employee, ...employeeData } : employee
      ));
    } else {
      const newEmployee: Employee = {
        id: Math.random().toString(36).substr(2, 9),
        employeeId: `EMP${String(employees.length + 1).padStart(3, '0')}`,
        name: '',
        email: '',
        phone: '',
        department: '',
        position: '',
        location: '',
        joiningDate: new Date().toISOString().split('T')[0],
        status: 'active',
        designation: '',
        roleType: 'employee',
        ...employeeData,
      };
      setEmployees([...employees, newEmployee]);
    }
    setOpenDialog(false);
  };

  const filteredEmployees = employees.filter(employee =>
    (employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (!filterDepartment || employee.department === filterDepartment)
  );

  return (
    <Box>
      <StyledPaper>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h2">
            Employee Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddEmployee}
          >
            Add Employee
          </Button>
        </Box>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Filter by Department</InputLabel>
              <Select
                value={filterDepartment}
                label="Filter by Department"
                onChange={(e) => setFilterDepartment(e.target.value)}
              >
                <MenuItem value="">All Departments</MenuItem>
                {departments.map((dept) => (
                  <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {filteredEmployees.map((employee) => (
            <Grid item xs={12} md={6} lg={4} key={employee.id}>
              <StyledCard>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                      {employee.name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6">{employee.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {employee.position}
                      </Typography>
                    </Box>
                    <Box sx={{ ml: 'auto' }}>
                      <Tooltip title="Edit">
                        <IconButton onClick={() => handleEditEmployee(employee)} size="small">
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton onClick={() => handleDeleteEmployee(employee.id)} size="small">
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <EmployeeIdIcon sx={{ mr: 1, fontSize: 'small', color: 'text.secondary' }} />
                    <Typography variant="body2">{employee.employeeId}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <EmailIcon sx={{ mr: 1, fontSize: 'small', color: 'text.secondary' }} />
                    <Typography variant="body2">{employee.email}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <PhoneIcon sx={{ mr: 1, fontSize: 'small', color: 'text.secondary' }} />
                    <Typography variant="body2">{employee.phone}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <LocationIcon sx={{ mr: 1, fontSize: 'small', color: 'text.secondary' }} />
                    <Typography variant="body2">{employee.location}</Typography>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip
                      label={employee.status}
                      color={employee.status === 'active' ? 'success' : 'default'}
                      size="small"
                    />
                    <Chip
                      label={employee.roleType}
                      color="primary"
                      size="small"
                    />
                  </Box>
                </CardContent>
              </StyledCard>
            </Grid>
          ))}
        </Grid>
      </StyledPaper>

      <EmployeeDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onSave={handleSaveEmployee}
        employee={selectedEmployee}
      />
    </Box>
  );
};

interface EmployeeDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (employeeData: Partial<Employee>) => void;
  employee: Employee | null;
}

const EmployeeDialog: React.FC<EmployeeDialogProps> = ({
  open,
  onClose,
  onSave,
  employee,
}) => {
  const [formData, setFormData] = useState<Partial<Employee>>(
    employee || {
      name: '',
      email: '',
      phone: '',
      department: '',
      position: '',
      location: '',
      joiningDate: '',
      status: 'active',
      designation: '',
      roleType: 'employee',
    }
  );

  React.useEffect(() => {
    setFormData(employee || {
      name: '',
      email: '',
      phone: '',
      department: '',
      position: '',
      location: '',
      joiningDate: '',
      status: 'active',
      designation: '',
      roleType: 'employee',
    });
  }, [employee]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {employee ? 'Edit Employee' : 'Add New Employee'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Employee Name"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Department</InputLabel>
                <Select
                  value={formData.department || ''}
                  label="Department"
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                >
                  {departments.map((dept) => (
                    <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Position</InputLabel>
                <Select
                  value={formData.position || ''}
                  label="Position"
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                >
                  {positions.map((pos) => (
                    <MenuItem key={pos} value={pos}>{pos}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Location</InputLabel>
                <Select
                  value={formData.location || ''}
                  label="Location"
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                >
                  {locations.map((loc) => (
                    <MenuItem key={loc} value={loc}>{loc}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Joining Date"
                type="date"
                value={formData.joiningDate || ''}
                onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                required
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
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
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Designation</InputLabel>
                <Select
                  value={formData.designation || ''}
                  label="Designation"
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                >
                  <MenuItem value="Director">Director</MenuItem>
                  <MenuItem value="Manager">Manager</MenuItem>
                  <MenuItem value="Senior Developer">Senior Developer</MenuItem>
                  <MenuItem value="Developer">Developer</MenuItem>
                  <MenuItem value="Financial Analyst">Financial Analyst</MenuItem>
                  <MenuItem value="Accountant">Accountant</MenuItem>
                  <MenuItem value="Marketing Manager">Marketing Manager</MenuItem>
                  <MenuItem value="Content Specialist">Content Specialist</MenuItem>
                  <MenuItem value="HR Manager">HR Manager</MenuItem>
                  <MenuItem value="Recruitment Specialist">Recruitment Specialist</MenuItem>
                  <MenuItem value="HR Business Partner">HR Business Partner</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Role Type</InputLabel>
                <Select
                  value={formData.roleType || 'employee'}
                  label="Role Type"
                  onChange={(e) => setFormData({ ...formData, roleType: e.target.value as 'employee' | 'head' | 'hrbp' })}
                >
                  <MenuItem value="employee">Employee</MenuItem>
                  <MenuItem value="head">Department Head</MenuItem>
                  <MenuItem value="hrbp">HR Business Partner</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            {employee ? 'Save Changes' : 'Add Employee'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EmployeeManagement; 