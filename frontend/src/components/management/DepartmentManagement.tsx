import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Business as BusinessIcon,
  SupervisorAccount as SupervisorIcon,
  Group as GroupIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: theme.shape.borderRadius,
}));

interface Department {
  id: string;
  name: string;
  description: string;
  headId?: string;
  employeeCount: number;
  status: 'active' | 'inactive';
}

interface DepartmentHead {
  id: string;
  name: string;
  email: string;
  departmentId: string;
  status: 'active' | 'inactive';
}

interface Employee {
  id: string;
  name: string;
  email: string;
  departmentId: string;
  role: string;
  status: 'active' | 'inactive';
}

const mockDepartments: Department[] = [
  {
    id: '1',
    name: 'Finance',
    description: 'Financial planning and analysis',
    headId: '1',
    employeeCount: 15,
    status: 'active',
  },
  {
    id: '2',
    name: 'Engineering',
    description: 'Software development and infrastructure',
    headId: '2',
    employeeCount: 30,
    status: 'active',
  },
];

const mockDepartmentHeads: DepartmentHead[] = [
  {
    id: '1',
    name: 'John Manager',
    email: 'john.manager@company.com',
    departmentId: '1',
    status: 'active',
  },
  {
    id: '2',
    name: 'Jane Leader',
    email: 'jane.leader@company.com',
    departmentId: '2',
    status: 'active',
  },
];

const mockEmployees: Employee[] = [
  {
    id: '1',
    name: 'Alice Employee',
    email: 'alice@company.com',
    departmentId: '1',
    role: 'Financial Analyst',
    status: 'active',
  },
  {
    id: '2',
    name: 'Bob Worker',
    email: 'bob@company.com',
    departmentId: '2',
    role: 'Software Engineer',
    status: 'active',
  },
];

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

const DepartmentManagement: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [departments, setDepartments] = useState<Department[]>(mockDepartments);
  const [departmentHeads, setDepartmentHeads] = useState<DepartmentHead[]>(mockDepartmentHeads);
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState<'department' | 'head' | 'employee'>('department');
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleAdd = (type: 'department' | 'head' | 'employee') => {
    setDialogType(type);
    setSelectedItem(null);
    setOpenDialog(true);
  };

  const handleEdit = (item: any, type: 'department' | 'head' | 'employee') => {
    setDialogType(type);
    setSelectedItem(item);
    setOpenDialog(true);
  };

  const handleDelete = (id: string, type: 'department' | 'head' | 'employee') => {
    const confirm = window.confirm(`Are you sure you want to delete this ${type}?`);
    if (!confirm) return;

    switch (type) {
      case 'department':
        setDepartments(departments.filter(d => d.id !== id));
        break;
      case 'head':
        setDepartmentHeads(departmentHeads.filter(h => h.id !== id));
        break;
      case 'employee':
        setEmployees(employees.filter(e => e.id !== id));
        break;
    }
  };

  const handleSave = () => {
    // TODO: Implement save functionality
    setOpenDialog(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      <StyledPaper>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab 
              icon={<BusinessIcon />} 
              iconPosition="start" 
              label="Departments" 
            />
            <Tab 
              icon={<SupervisorIcon />} 
              iconPosition="start" 
              label="Department Heads" 
            />
            <Tab 
              icon={<GroupIcon />} 
              iconPosition="start" 
              label="Brand Management" 
            />
          </Tabs>
        </Box>

        {/* Departments Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Departments</Typography>
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
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {departments.map((department) => (
                  <TableRow key={department.id}>
                    <TableCell>{department.name}</TableCell>
                    <TableCell>{department.description}</TableCell>
                    <TableCell>
                      {departmentHeads.find(h => h.id === department.headId)?.name || 'Not Assigned'}
                    </TableCell>
                    <TableCell>{department.employeeCount}</TableCell>
                    <TableCell>
                      <Tooltip title="Edit">
                        <IconButton onClick={() => handleEdit(department, 'department')}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton onClick={() => handleDelete(department.id, 'department')}>
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

        {/* Department Heads Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Department Heads</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleAdd('head')}
            >
              Add Department Head
            </Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {departmentHeads.map((head) => (
                  <TableRow key={head.id}>
                    <TableCell>{head.name}</TableCell>
                    <TableCell>{head.email}</TableCell>
                    <TableCell>
                      {departments.find(d => d.id === head.departmentId)?.name}
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Edit">
                        <IconButton onClick={() => handleEdit(head, 'head')}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton onClick={() => handleDelete(head.id, 'head')}>
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

        {/* Brand Management Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Corporate Employees</Typography>
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
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {employees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell>{employee.name}</TableCell>
                    <TableCell>{employee.email}</TableCell>
                    <TableCell>
                      {departments.find(d => d.id === employee.departmentId)?.name}
                    </TableCell>
                    <TableCell>{employee.role}</TableCell>
                    <TableCell>
                      <Tooltip title="Edit">
                        <IconButton onClick={() => handleEdit(employee, 'employee')}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton onClick={() => handleDelete(employee.id, 'employee')}>
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

        {/* Add/Edit Dialog */}
        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {selectedItem ? `Edit ${dialogType}` : `Add New ${dialogType}`}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              {dialogType === 'department' && (
                <>
                  <TextField
                    label="Department Name"
                    required
                    defaultValue={selectedItem?.name}
                  />
                  <TextField
                    label="Description"
                    multiline
                    rows={3}
                    defaultValue={selectedItem?.description}
                  />
                </>
              )}
              {dialogType === 'head' && (
                <>
                  <TextField
                    label="Name"
                    required
                    defaultValue={selectedItem?.name}
                  />
                  <TextField
                    label="Email"
                    type="email"
                    required
                    defaultValue={selectedItem?.email}
                  />
                  <FormControl fullWidth>
                    <InputLabel>Department</InputLabel>
                    <Select
                      label="Department"
                      defaultValue={selectedItem?.departmentId}
                    >
                      {departments.map((dept) => (
                        <MenuItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </>
              )}
              {dialogType === 'employee' && (
                <>
                  <TextField
                    label="Name"
                    required
                    defaultValue={selectedItem?.name}
                  />
                  <TextField
                    label="Email"
                    type="email"
                    required
                    defaultValue={selectedItem?.email}
                  />
                  <FormControl fullWidth>
                    <InputLabel>Department</InputLabel>
                    <Select
                      label="Department"
                      defaultValue={selectedItem?.departmentId}
                    >
                      {departments.map((dept) => (
                        <MenuItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    label="Role"
                    required
                    defaultValue={selectedItem?.role}
                  />
                </>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleSave}>Save</Button>
          </DialogActions>
        </Dialog>
      </StyledPaper>
    </Box>
  );
};

export default DepartmentManagement; 