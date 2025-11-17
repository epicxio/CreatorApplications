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
  MenuItem,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: theme.shape.borderRadius,
}));

interface Student {
  id: string;
  name: string;
  grade: string;
  parentId?: string;
  status: 'active' | 'inactive';
}

const mockStudents: Student[] = [
  {
    id: '1',
    name: 'Student One',
    grade: 'Grade 5',
    parentId: '1',
    status: 'active',
  },
  {
    id: '2',
    name: 'Student Two',
    grade: 'Grade 6',
    parentId: '1',
    status: 'active',
  },
  {
    id: '3',
    name: 'Student Three',
    grade: 'Grade 7',
    parentId: '2',
    status: 'active',
  },
  {
    id: '4',
    name: 'Student Four',
    grade: 'Grade 8',
    parentId: undefined,
    status: 'active',
  },
];

const grades = [
  'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5',
  'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10',
  'Grade 11', 'Grade 12'
];

const StudentManagement: React.FC = () => {
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    grade: '',
  });

  const handleAdd = () => {
    setSelectedStudent(null);
    setFormData({ name: '', grade: '' });
    setOpenDialog(true);
  };

  const handleEdit = (student: Student) => {
    setSelectedStudent(student);
    setFormData({
      name: student.name,
      grade: student.grade,
    });
    setOpenDialog(true);
  };

  const handleDelete = (id: string) => {
    const confirm = window.confirm('Are you sure you want to delete this student?');
    if (!confirm) return;

    setStudents(students.filter(s => s.id !== id));
  };

  const handleSave = () => {
    if (selectedStudent) {
      // Edit existing student
      setStudents(students.map(student =>
        student.id === selectedStudent.id
          ? { ...student, ...formData }
          : student
      ));
    } else {
      // Add new student
      const newStudent: Student = {
        id: String(Date.now()),
        name: formData.name,
        grade: formData.grade,
        status: 'active',
      };
      setStudents([...students, newStudent]);
    }
    setOpenDialog(false);
  };

  const handleInputChange = (field: keyof typeof formData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <StyledPaper>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h2">
            Students
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAdd}
          >
            Add Student
          </Button>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Grade</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.grade}</TableCell>
                  <TableCell>
                    <Tooltip title="Edit">
                      <IconButton onClick={() => handleEdit(student)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton onClick={() => handleDelete(student.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </StyledPaper>

      {/* Add/Edit Student Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedStudent ? 'Edit Student' : 'Add New Student'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Name"
              required
              value={formData.name}
              onChange={handleInputChange('name')}
            />
            <TextField
              select
              label="Grade"
              required
              value={formData.grade}
              onChange={handleInputChange('grade')}
            >
              {grades.map((grade) => (
                <MenuItem key={grade} value={grade}>
                  {grade}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!formData.name || !formData.grade}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudentManagement; 