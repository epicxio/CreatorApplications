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
  School as SchoolIcon,
  Person as PersonIcon,
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

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  grade?: string;
  status: 'active' | 'inactive';
  subjects?: string[];
  children?: string[];
  class?: string;
}

const mockStudents: User[] = [
  {
    id: '1',
    name: 'John Student',
    email: 'john@school.com',
    role: 'student',
    grade: '10th',
    status: 'active',
    class: 'A',
  },
];

const mockTeachers: User[] = [
  {
    id: '1',
    name: 'Sarah Teacher',
    email: 'sarah@school.com',
    role: 'teacher',
    status: 'active',
    subjects: ['Mathematics', 'Physics'],
    grade: '10th',
  },
];

const mockParents: User[] = [
  {
    id: '1',
    name: 'Mike Parent',
    email: 'mike@example.com',
    role: 'parent',
    status: 'active',
    children: ['John Student', 'Jane Student'],
  },
];

const UserTable: React.FC<{
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
  onInvite: (email: string) => void;
  type: 'student' | 'teacher' | 'parent';
}> = ({ users, onEdit, onDelete, onInvite, type }) => (
  <TableContainer>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Name</TableCell>
          <TableCell>Email</TableCell>
          {type === 'student' && <TableCell>Grade/Class</TableCell>}
          {type === 'teacher' && <TableCell>Subjects</TableCell>}
          {type === 'parent' && <TableCell>Children</TableCell>}
          <TableCell>Status</TableCell>
          <TableCell>Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>{user.name}</TableCell>
            <TableCell>{user.email}</TableCell>
            {type === 'student' && (
              <TableCell>{`${user.grade} - ${user.class}`}</TableCell>
            )}
            {type === 'teacher' && (
              <TableCell>
                {user.subjects?.map((subject) => (
                  <Chip key={subject} label={subject} size="small" sx={{ mr: 0.5 }} />
                ))}
              </TableCell>
            )}
            {type === 'parent' && (
              <TableCell>
                {user.children?.map((child) => (
                  <Chip key={child} label={child} size="small" sx={{ mr: 0.5 }} />
                ))}
              </TableCell>
            )}
            <TableCell>
              <Chip
                label={user.status}
                color={user.status === 'active' ? 'success' : 'error'}
                size="small"
              />
            </TableCell>
            <TableCell>
              <Tooltip title="Edit">
                <IconButton size="small" onClick={() => onEdit(user)}>
                  <EditIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete">
                <IconButton size="small" onClick={() => onDelete(user.id)}>
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Send Invite">
                <IconButton size="small" onClick={() => onInvite(user.email)}>
                  <EmailIcon />
                </IconButton>
              </Tooltip>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

const SchoolManagement: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [students, setStudents] = useState<User[]>(mockStudents);
  const [teachers, setTeachers] = useState<User[]>(mockTeachers);
  const [parents, setParents] = useState<User[]>(mockParents);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userType, setUserType] = useState<'student' | 'teacher' | 'parent'>('student');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleAdd = (type: 'student' | 'teacher' | 'parent') => {
    setUserType(type);
    setSelectedUser(null);
    setOpenDialog(true);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setUserType(user.role as 'student' | 'teacher' | 'parent');
    setOpenDialog(true);
  };

  const handleDelete = (id: string) => {
    const confirm = window.confirm('Are you sure you want to delete this user?');
    if (!confirm) return;

    switch (userType) {
      case 'student':
        setStudents(students.filter(s => s.id !== id));
        break;
      case 'teacher':
        setTeachers(teachers.filter(t => t.id !== id));
        break;
      case 'parent':
        setParents(parents.filter(p => p.id !== id));
        break;
    }
  };

  const handleInvite = (email: string) => {
    console.log('Sending invite to:', email);
  };

  return (
    <StyledPaper elevation={3}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab icon={<SchoolIcon />} label="Students" />
          <Tab icon={<PersonIcon />} label="Teachers" />
          <Tab icon={<GroupIcon />} label="Parents" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h6">Creator Management</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleAdd('student')}
          >
            Add Student
          </Button>
        </Box>
        <UserTable
          users={students}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onInvite={handleInvite}
          type="student"
        />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h6">Teacher Management</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleAdd('teacher')}
          >
            Add Teacher
          </Button>
        </Box>
        <UserTable
          users={teachers}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onInvite={handleInvite}
          type="teacher"
        />
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h6">Parent Management</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleAdd('parent')}
          >
            Add Parent
          </Button>
        </Box>
        <UserTable
          users={parents}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onInvite={handleInvite}
          type="parent"
        />
      </TabPanel>

      <UserDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        user={selectedUser}
        type={userType}
        onSave={(userData) => {
          // Handle save logic here
          setOpenDialog(false);
        }}
      />
    </StyledPaper>
  );
};

interface UserDialogProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
  type: 'student' | 'teacher' | 'parent';
  onSave: (userData: Partial<User>) => void;
}

const UserDialog: React.FC<UserDialogProps> = ({
  open,
  onClose,
  user,
  type,
  onSave,
}) => {
  const [userData, setUserData] = useState<Partial<User>>(user || {});

  React.useEffect(() => {
    setUserData(user || {});
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(userData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {user ? `Edit ${type}` : `Add New ${type}`}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Name"
              value={userData.name || ''}
              onChange={(e) => setUserData({ ...userData, name: e.target.value })}
              required
            />
            <TextField
              label="Email"
              type="email"
              value={userData.email || ''}
              onChange={(e) => setUserData({ ...userData, email: e.target.value })}
              required
            />
            {type === 'student' && (
              <>
                <FormControl required>
                  <InputLabel>Grade</InputLabel>
                  <Select
                    value={userData.grade || ''}
                    label="Grade"
                    onChange={(e) => setUserData({ ...userData, grade: e.target.value })}
                  >
                    {['9th', '10th', '11th', '12th'].map((grade) => (
                      <MenuItem key={grade} value={grade}>{grade}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  label="Class"
                  value={userData.class || ''}
                  onChange={(e) => setUserData({ ...userData, class: e.target.value })}
                />
              </>
            )}
            {type === 'teacher' && (
              <FormControl required>
                <InputLabel>Subjects</InputLabel>
                <Select
                  multiple
                  value={userData.subjects || []}
                  label="Subjects"
                  onChange={(e) => setUserData({
                    ...userData,
                    subjects: typeof e.target.value === 'string' ? [e.target.value] : e.target.value,
                  })}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} />
                      ))}
                    </Box>
                  )}
                >
                  {['Mathematics', 'Physics', 'Chemistry', 'Biology'].map((subject) => (
                    <MenuItem key={subject} value={subject}>{subject}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            {type === 'parent' && (
              <FormControl required>
                <InputLabel>Children</InputLabel>
                <Select
                  multiple
                  value={userData.children || []}
                  label="Children"
                  onChange={(e) => setUserData({
                    ...userData,
                    children: typeof e.target.value === 'string' ? [e.target.value] : e.target.value,
                  })}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} />
                      ))}
                    </Box>
                  )}
                >
                  {mockStudents.map((student) => (
                    <MenuItem key={student.id} value={student.name}>{student.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">Save</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default SchoolManagement; 