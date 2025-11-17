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
  Autocomplete,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Link as LinkIcon,
  LinkOff as LinkOffIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: theme.shape.borderRadius,
}));

interface Parent {
  id: string;
  name: string;
  email: string;
  phone: string;
  children: string[];
  status: 'active' | 'inactive';
}

interface Student {
  id: string;
  name: string;
  grade: string;
  parentId?: string;
  status: 'active' | 'inactive';
}

const mockParents: Parent[] = [
  {
    id: '1',
    name: 'John Parent',
    email: 'john.parent@email.com',
    phone: '+1234567890',
    children: ['1', '2'],
    status: 'active',
  },
  {
    id: '2',
    name: 'Jane Parent',
    email: 'jane.parent@email.com',
    phone: '+0987654321',
    children: ['3'],
    status: 'active',
  },
];

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

const ParentStudentManagement: React.FC = () => {
  const [parents, setParents] = useState<Parent[]>(mockParents);
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState<'parent' | 'student' | 'link'>('parent');
  const [selectedItem, setSelectedItem] = useState<Parent | Student | null>(null);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [selectedParent, setSelectedParent] = useState<Parent | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const handleAdd = (type: 'parent' | 'student') => {
    setDialogType(type);
    setSelectedItem(null);
    setOpenDialog(true);
  };

  const handleEdit = (item: Parent | Student, type: 'parent' | 'student') => {
    setDialogType(type);
    setSelectedItem(item);
    setOpenDialog(true);
  };

  const handleDelete = (id: string, type: 'parent' | 'student') => {
    const confirm = window.confirm(`Are you sure you want to delete this ${type}?`);
    if (!confirm) return;

    if (type === 'parent') {
      setParents(parents.filter(p => p.id !== id));
      // Remove parent reference from students
      setStudents(students.map(s => 
        s.parentId === id ? { ...s, parentId: undefined } : s
      ));
    } else {
      setStudents(students.filter(s => s.id !== id));
      // Remove student reference from parents
      setParents(parents.map(p => ({
        ...p,
        children: p.children.filter(c => c !== id)
      })));
    }
  };

  const handleLink = (student: Student) => {
    setDialogType('link');
    setSelectedItem(student);
    setOpenDialog(true);
  };

  const handleLinkSubmit = (studentId: string, parentId: string) => {
    setStudents(students.map(s => 
      s.id === studentId ? { ...s, parentId } : s
    ));
    setParents(parents.map(p => 
      p.id === parentId 
        ? { ...p, children: [...p.children, studentId] }
        : p
    ));
    setOpenDialog(false);
  };

  const handleOpenLinkDialog = (parent: Parent) => {
    setSelectedParent(parent);
    setLinkDialogOpen(true);
  };

  const handleCloseLinkDialog = () => {
    setLinkDialogOpen(false);
    setSelectedParent(null);
    setSelectedStudent(null);
  };

  const handleLinkStudent = () => {
    if (selectedParent && selectedStudent) {
      const updatedParents = parents.map(parent => {
        if (parent.id === selectedParent.id) {
          return {
            ...parent,
            children: [...parent.children, selectedStudent.id],
          };
        }
        return parent;
      });
      setParents(updatedParents);
      handleCloseLinkDialog();
    }
  };

  const handleUnlinkStudent = (parentId: string, studentId: string) => {
    const updatedParents = parents.map(parent => {
      if (parent.id === parentId) {
        return {
          ...parent,
          children: parent.children.filter(id => id !== studentId),
        };
      }
      return parent;
    });
    setParents(updatedParents);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* Parents Section */}
        <Grid item xs={12} md={6}>
          <StyledPaper>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" component="h2">
                Parents
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleAdd('parent')}
              >
                Add Parent
              </Button>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Children</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {parents.map((parent) => (
                    <TableRow key={parent.id}>
                      <TableCell>{parent.name}</TableCell>
                      <TableCell>{parent.email}</TableCell>
                      <TableCell>
                        {parent.children.map((childId) => {
                          const child = students.find(s => s.id === childId);
                          return child ? (
                            <Chip
                              key={childId}
                              label={`${child.name} (${child.grade})`}
                              onDelete={() => handleUnlinkStudent(parent.id, childId)}
                              deleteIcon={<LinkOffIcon />}
                              sx={{ m: 0.5 }}
                            />
                          ) : null;
                        })}
                      </TableCell>
                      <TableCell>
                        <Tooltip title="Link Student">
                          <IconButton onClick={() => handleOpenLinkDialog(parent)}>
                            <LinkIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton onClick={() => handleEdit(parent, 'parent')}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton onClick={() => handleDelete(parent.id, 'parent')}>
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
        </Grid>

        {/* Students Section */}
        <Grid item xs={12} md={6}>
          <StyledPaper>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" component="h2">
                Students
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleAdd('student')}
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
                          <IconButton onClick={() => handleEdit(student, 'student')}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton onClick={() => handleDelete(student.id, 'student')}>
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
        </Grid>
      </Grid>

      {/* Link Student Dialog */}
      <Dialog open={linkDialogOpen} onClose={handleCloseLinkDialog}>
        <DialogTitle>Link Student to Parent</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Parent: {selectedParent?.name}
            </Typography>
            <Autocomplete
              options={students.filter(student => !selectedParent?.children.includes(student.id))}
              getOptionLabel={(option) => `${option.name} (${option.grade})`}
              value={selectedStudent}
              onChange={(_, newValue) => setSelectedStudent(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Student"
                  fullWidth
                  margin="normal"
                />
              )}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseLinkDialog}>Cancel</Button>
          <Button
            onClick={handleLinkStudent}
            variant="contained"
            disabled={!selectedStudent}
          >
            Link
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedItem
            ? dialogType === 'link'
              ? 'Link Student to Parent'
              : `Edit ${dialogType === 'parent' ? 'Parent' : 'Student'}`
            : `Add New ${dialogType === 'parent' ? 'Parent' : 'Student'}`}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            {dialogType === 'link' ? (
              <FormControl required>
                <InputLabel>Select Parent</InputLabel>
                <Select
                  label="Select Parent"
                  onChange={(e) => {
                    if (selectedItem) {
                      handleLinkSubmit(selectedItem.id, e.target.value as string);
                    }
                  }}
                >
                  {parents.map(parent => (
                    <MenuItem key={parent.id} value={parent.id}>
                      {parent.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : dialogType === 'parent' ? (
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
                <TextField
                  label="Phone"
                  required
                />
              </>
            ) : (
              <>
                <TextField
                  label="Name"
                  required
                />
                <TextField
                  label="Grade"
                  required
                />
              </>
            )}
          </Box>
        </DialogContent>
        {dialogType !== 'link' && (
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button variant="contained">Save</Button>
          </DialogActions>
        )}
      </Dialog>
    </Box>
  );
};

export default ParentStudentManagement; 