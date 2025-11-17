import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Tooltip,
  Grid,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: theme.shape.borderRadius,
}));

interface Teacher {
  id: string;
  name: string;
  email: string;
  subjects: string[];
  grades: string[];
  status: 'active' | 'inactive';
  specialization: string;
  assignedStudents: number;
  joinDate: string;
}

const mockTeachers: Teacher[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@school.com',
    subjects: ['Mathematics', 'Physics'],
    grades: ['9th', '10th'],
    status: 'active',
    specialization: 'Advanced Mathematics',
    assignedStudents: 45,
    joinDate: '2023-09-01',
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@school.com',
    subjects: ['Mathematics', 'Chemistry'],
    grades: ['11th', '12th'],
    status: 'active',
    specialization: 'Calculus',
    assignedStudents: 38,
    joinDate: '2023-08-15',
  },
];

const availableSubjects = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'Computer Science',
];

const availableGrades = [
  '6th',
  '7th',
  '8th',
  '9th',
  '10th',
  '11th',
  '12th',
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

const TeacherManagement: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>(mockTeachers);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [showInactive, setShowInactive] = useState(false);

  const handleAdd = () => {
    setSelectedTeacher(null);
    setOpenDialog(true);
  };

  const handleEdit = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setOpenDialog(true);
  };

  const handleDelete = (id: string) => {
    const confirm = window.confirm('Are you sure you want to delete this teacher?');
    if (!confirm) return;
    setTeachers(teachers.filter(t => t.id !== id));
  };

  const handleSave = () => {
    // TODO: Implement save functionality
    setOpenDialog(false);
  };

  const handleSendInvite = (email: string) => {
    console.log('Sending invite to:', email);
    // TODO: Implement email invitation functionality
  };

  const filteredTeachers = teachers.filter(
    teacher => showInactive || teacher.status === 'active'
  );

  return (
    <Box sx={{ p: 3 }}>
      <StyledPaper>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SchoolIcon /> Teacher Management
              </Typography>
              <Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={showInactive}
                      onChange={(e) => setShowInactive(e.target.checked)}
                    />
                  }
                  label="Show Inactive"
                  sx={{ mr: 2 }}
                />
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAdd}
                >
                  Add Teacher
                </Button>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Subjects</TableCell>
                    <TableCell>Grades</TableCell>
                    <TableCell>Specialization</TableCell>
                    <TableCell>Students</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredTeachers.map((teacher) => (
                    <TableRow key={teacher.id}>
                      <TableCell>{teacher.name}</TableCell>
                      <TableCell>{teacher.email}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {teacher.subjects.map((subject) => (
                            <Chip
                              key={subject}
                              label={subject}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {teacher.grades.map((grade) => (
                            <Chip
                              key={grade}
                              label={grade}
                              size="small"
                              color="secondary"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell>{teacher.specialization}</TableCell>
                      <TableCell>{teacher.assignedStudents}</TableCell>
                      <TableCell>
                        <Chip
                          label={teacher.status}
                          color={teacher.status === 'active' ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Edit">
                          <IconButton onClick={() => handleEdit(teacher)} size="small">
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton onClick={() => handleDelete(teacher.id)} size="small">
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Send Invite">
                          <IconButton onClick={() => handleSendInvite(teacher.email)} size="small">
                            <EmailIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>

        {/* Add/Edit Dialog */}
        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {selectedTeacher ? 'Edit Teacher' : 'Add New Teacher'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Name"
                    fullWidth
                    required
                    defaultValue={selectedTeacher?.name}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Email"
                    type="email"
                    fullWidth
                    required
                    defaultValue={selectedTeacher?.email}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Subjects</InputLabel>
                    <Select
                      multiple
                      label="Subjects"
                      defaultValue={selectedTeacher?.subjects || []}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {(selected as string[]).map((value) => (
                            <Chip key={value} label={value} size="small" />
                          ))}
                        </Box>
                      )}
                    >
                      {availableSubjects.map((subject) => (
                        <MenuItem key={subject} value={subject}>
                          {subject}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Grades</InputLabel>
                    <Select
                      multiple
                      label="Grades"
                      defaultValue={selectedTeacher?.grades || []}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {(selected as string[]).map((value) => (
                            <Chip key={value} label={value} size="small" />
                          ))}
                        </Box>
                      )}
                    >
                      {availableGrades.map((grade) => (
                        <MenuItem key={grade} value={grade}>
                          {grade}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Specialization"
                    fullWidth
                    required
                    defaultValue={selectedTeacher?.specialization}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Status</InputLabel>
                    <Select
                      label="Status"
                      defaultValue={selectedTeacher?.status || 'active'}
                    >
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
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

export default TeacherManagement; 