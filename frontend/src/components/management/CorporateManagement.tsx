import React, { useState } from 'react';
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Typography,
  styled,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  Business as BusinessIcon,
  Group as GroupIcon,
} from '@mui/icons-material';

const StyledPaper = styled(Paper)(({ theme }) => ({
  margin: theme.spacing(2),
  padding: theme.spacing(2),
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
}));

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`management-tabpanel-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

interface Department {
  id: string;
  name: string;
  description: string;
  head?: string;
  employeeCount: number;
  courses: string[];
}

interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  status: 'active' | 'inactive';
  courses: string[];
}

const mockDepartments: Department[] = [
  {
    id: '1',
    name: 'Engineering',
    description: 'Software and Hardware Engineering',
    head: 'John Doe',
    employeeCount: 50,
    courses: ['Advanced Mathematics', 'Data Structures'],
  },
  {
    id: '2',
    name: 'Finance',
    description: 'Financial Planning and Analysis',
    head: 'Jane Smith',
    employeeCount: 30,
    courses: ['Financial Mathematics', 'Statistics'],
  },
];

const mockEmployees: Employee[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@company.com',
    department: 'Engineering',
    role: 'Department Head',
    status: 'active',
    courses: ['Advanced Mathematics'],
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@company.com',
    department: 'Finance',
    role: 'HRBP',
    status: 'active',
    courses: ['Financial Mathematics'],
  },
];

const CorporateManagement: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [departments, setDepartments] = useState<Department[]>(mockDepartments);
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState<'department' | 'employee'>('department');
  const [selectedItem, setSelectedItem] = useState<Department | Employee | null>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleAdd = (type: 'department' | 'employee') => {
    setDialogType(type);
    setSelectedItem(null);
    setOpenDialog(true);
  };

  const handleEdit = (item: Department | Employee, type: 'department' | 'employee') => {
    setDialogType(type);
    setSelectedItem(item);
    setOpenDialog(true);
  };

  const handleDelete = (id: string, type: 'department' | 'employee') => {
    const confirm = window.confirm(`Are you sure you want to delete this ${type}?`);
    if (!confirm) return;

    if (type === 'department') {
      setDepartments(departments.filter(d => d.id !== id));
    } else {
      setEmployees(employees.filter(e => e.id !== id));
    }
  };

  const handleInvite = (email: string) => {
    console.log('Sending invite to:', email);
  };

  return (
    <StyledPaper elevation={3}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab icon={<BusinessIcon />} label="Departments" />
          <Tab icon={<GroupIcon />} label="Employees" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h6">Department Management</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleAdd('department')}
          >
            Add Department
          </Button>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Head</TableCell>
                <TableCell>Employees</TableCell>
                <TableCell>Courses</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {departments.map((dept) => (
                <TableRow key={dept.id}>
                  <TableCell>{dept.name}</TableCell>
                  <TableCell>{dept.description}</TableCell>
                  <TableCell>{dept.head}</TableCell>
                  <TableCell>{dept.employeeCount}</TableCell>
                  <TableCell>
                    {dept.courses.map((course) => (
                      <Chip key={course} label={course} size="small" sx={{ mr: 0.5 }} />
                    ))}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(dept, 'department')}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(dept.id, 'department')}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h6">Employee Management</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleAdd('employee')}
          >
            Add Employee
          </Button>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Courses</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {employees.map((emp) => (
                <TableRow key={emp.id}>
                  <TableCell>{emp.name}</TableCell>
                  <TableCell>{emp.email}</TableCell>
                  <TableCell>{emp.department}</TableCell>
                  <TableCell>
                    <Chip
                      label={emp.role}
                      color={emp.role === 'Department Head' ? 'primary' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {emp.courses.map((course) => (
                      <Chip key={course} label={course} size="small" sx={{ mr: 0.5 }} />
                    ))}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={emp.status}
                      color={emp.status === 'active' ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(emp, 'employee')}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(emp.id, 'employee')}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Send Invite">
                      <IconButton
                        size="small"
                        onClick={() => handleInvite(emp.email)}
                      >
                        <EmailIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedItem
            ? `Edit ${dialogType === 'department' ? 'Department' : 'Employee'}`
            : `Add New ${dialogType === 'department' ? 'Department' : 'Employee'}`}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            {dialogType === 'department' ? (
              <>
                <TextField
                  label="Department Name"
                  required
                />
                <TextField
                  label="Description"
                  multiline
                  rows={2}
                  required
                />
                <FormControl>
                  <InputLabel>Department Head</InputLabel>
                  <Select label="Department Head">
                    {employees
                      .filter(emp => emp.role === 'Department Head')
                      .map(emp => (
                        <MenuItem key={emp.id} value={emp.id}>
                          {emp.name}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
                <FormControl>
                  <InputLabel>Assigned Courses</InputLabel>
                  <Select
                    multiple
                    label="Assigned Courses"
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {(selected as string[]).map((value) => (
                          <Chip key={value} label={value} />
                        ))}
                      </Box>
                    )}
                  >
                    {['Advanced Mathematics', 'Financial Mathematics', 'Statistics'].map((course) => (
                      <MenuItem key={course} value={course}>
                        {course}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </>
            ) : (
              <>
                <TextField
                  label="Name"
                  required
                />
                <TextField
                  label="Email"
                  type="email"
                  required
                />
                <FormControl required>
                  <InputLabel>Department</InputLabel>
                  <Select label="Department">
                    {departments.map(dept => (
                      <MenuItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl required>
                  <InputLabel>Role</InputLabel>
                  <Select label="Role">
                    <MenuItem value="Department Head">Department Head</MenuItem>
                    <MenuItem value="HRBP">HRBP</MenuItem>
                    <MenuItem value="Employee">Employee</MenuItem>
                  </Select>
                </FormControl>
                <FormControl>
                  <InputLabel>Assigned Courses</InputLabel>
                  <Select
                    multiple
                    label="Assigned Courses"
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {(selected as string[]).map((value) => (
                          <Chip key={value} label={value} />
                        ))}
                      </Box>
                    )}
                  >
                    {['Advanced Mathematics', 'Financial Mathematics', 'Statistics'].map((course) => (
                      <MenuItem key={course} value={course}>
                        {course}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </StyledPaper>
  );
};

export default CorporateManagement; 