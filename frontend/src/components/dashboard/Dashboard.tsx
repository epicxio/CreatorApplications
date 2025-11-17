import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Email as EmailIcon,
  WhatsApp as WhatsAppIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Work as WorkIcon,
  AccessTime as AccessTimeIcon,
  Login as LoginIcon,
  Logout as LogoutIcon,
  VpnKey as VpnKeyIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { CourseCard } from './CourseCard';
import { ProgressTracker } from './ProgressTracker';
import { AdminDashboard } from './AdminDashboard';
import { UserDashboard } from './UserDashboard'; // We'll create this next if it doesn't exist

// Import course images
import calculusImage from '../../assets/courses/calculus.svg';
import algebraImage from '../../assets/courses/algebra.svg';
import statisticsImage from '../../assets/courses/statistics.svg';

const mockCourses = [
  {
    id: '1',
    title: 'Introduction to Calculus',
    description: 'Learn the fundamentals of calculus',
    progress: 75,
    image: calculusImage,
    color: '#FF4081', // Pink from our theme
  },
  {
    id: '2',
    title: 'Linear Algebra',
    description: 'Master vectors, matrices, and linear transformations',
    progress: 30,
    image: algebraImage,
    color: '#7B1FA2', // Purple from our theme
  },
  {
    id: '3',
    title: 'Statistics',
    description: 'Understand probability and data analysis',
    progress: 10,
    image: statisticsImage,
    color: '#00BCD4', // Teal to complement our theme
  },
];

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  margin: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[3],
  minHeight: '100vh',
  maxWidth: '1600px',
  marginLeft: 'auto',
  marginRight: 'auto',
  width: '100%',
}));

export const Dashboard = () => {
  const { user } = useAuth();
  const isAdmin = user?.role?.name === 'school_admin' || user?.role?.name === 'corporate_admin';

  return isAdmin ? <AdminDashboard /> : <UserDashboard />;
}; 