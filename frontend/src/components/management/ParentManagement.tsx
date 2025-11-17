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
  Chip,
  Tooltip,
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

const ParentManagement: React.FC = () => {
  const [parents, setParents] = useState<Parent[]>(mockParents);
  const [students] = useState<Student[]>(mockStudents);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedParent, setSelectedParent] = useState<Parent | null>(null);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const handleAdd = () => {
    setSelectedParent(null);
    setOpenDialog(true);
  };

  const handleEdit = (parent: Parent) => {
    setSelectedParent(parent);
    setOpenDialog(true);
  };

  const handleDelete = (id: string) => {
    const confirm = window.confirm('Are you sure you want to delete this parent?');
    if (!confirm) return;

    setParents(parents.filter(p => p.id !== id));
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
      <StyledPaper>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h2">
            Parents
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAdd}
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
                      <IconButton onClick={() => handleEdit(parent)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton onClick={() => handleDelete(parent.id)}>
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

      {/* Add/Edit Parent Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedParent ? 'Edit Parent' : 'Add New Parent'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Name"
              required
              defaultValue={selectedParent?.name}
            />
            <TextField
              label="Email"
              type="email"
              required
              defaultValue={selectedParent?.email}
            />
            <TextField
              label="Phone"
              required
              defaultValue={selectedParent?.phone}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ParentManagement; 