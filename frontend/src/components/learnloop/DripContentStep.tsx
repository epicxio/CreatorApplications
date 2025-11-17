import React, { useState } from 'react';
import {
  Box,
  Typography,
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Stack,
  Card,
  CardContent,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Grid,
  Paper,
  Divider,
  LinearProgress
} from '@mui/material';
import {
  Timeline as TimelineIcon,
  Schedule as ScheduleIcon,
  CalendarToday as CalendarIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Email as EmailIcon,
  PlayArrow as PlayArrowIcon,
  Info as InfoIcon,
  TrendingUp as TrendingUpIcon,
  AccessTime as AccessTimeIcon,
  Event as EventIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

interface DripMethod {
  id: string;
  method: 'immediate' | 'days' | 'date';
  action?: string | number;
}

const DripContentStep: React.FC = React.memo(() => {
  // Drip Content state
  const [dripEnabled, setDripEnabled] = useState(false);
  const [dripMethods, setDripMethods] = useState<DripMethod[]>([
    {
      id: 'Introduction',
      method: 'immediate',
      action: undefined
    },
    {
      id: 'Core Concepts',
      method: 'days',
      action: 7
    },
    {
      id: 'Advanced Topics',
      method: 'date',
      action: ''
    }
  ]);
  const [displayOption, setDisplayOption] = useState<'title' | 'titleAndLessons' | 'hide'>('titleAndLessons');
  const [hideUnlockDate, setHideUnlockDate] = useState(false);
  const [sendCommunication, setSendCommunication] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');

  // Memoize expensive computations
  const methodIcons = React.useMemo(() => ({
    immediate: <TrendingUpIcon />,
    days: <ScheduleIcon />,
    date: <CalendarIcon />,
    default: <TimelineIcon />
  }), []);

  const methodColors = React.useMemo(() => ({
    immediate: '#00FFC6',
    days: '#FFD600',
    date: '#FF6B6B',
    default: '#6C63FF'
  }), []);

  const handleDripMethodChange = React.useCallback((moduleId: string, method: 'immediate' | 'days' | 'date') => {
    const updatedMethods = dripMethods.map(m => 
      m.id === moduleId 
        ? { ...m, method, action: method === 'immediate' ? undefined : method === 'days' ? 1 : '' }
        : m
    );
    setDripMethods(updatedMethods);
  }, [dripMethods]);

  const handleActionChange = React.useCallback((moduleId: string, action: string | number) => {
    const updatedMethods = dripMethods.map(m => 
      m.id === moduleId ? { ...m, action } : m
    );
    setDripMethods(updatedMethods);
  }, [dripMethods]);

  const getMethodIcon = React.useCallback((method: string) => {
    return methodIcons[method as keyof typeof methodIcons] || methodIcons.default;
  }, [methodIcons]);

  const getMethodColor = React.useCallback((method: string) => {
    return methodColors[method as keyof typeof methodColors] || methodColors.default;
  }, [methodColors]);

  return (
    <Box sx={{ width: '100%' }}>
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Box sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 3,
          p: 3,
          mb: 3,
          position: 'relative',
          overflow: 'hidden'
        }}>
          <Box sx={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
            borderRadius: '50%'
          }} />
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h3" fontWeight={800} color="white" gutterBottom>
                Content Release Strategy
              </Typography>
              <Typography variant="h6" color="rgba(255,255,255,0.8)" sx={{ mb: 2 }}>
                Master the art of progressive learning
              </Typography>
              <Chip 
                icon={<TimelineIcon />} 
                label="Drip Learning Engine" 
                sx={{ 
                  background: 'rgba(255,255,255,0.2)', 
                  color: 'white',
                  backdropFilter: 'blur(10px)'
                }} 
              />
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <motion.div
                animate={{ rotate: dripEnabled ? 360 : 0 }}
                transition={{ duration: 0.8 }}
              >
                <TimelineIcon sx={{ fontSize: 80, color: 'white', opacity: 0.8 }} />
              </motion.div>
            </Box>
          </Stack>
        </Box>
      </motion.div>

      {/* Main Control Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card sx={{ 
          background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
          borderRadius: 2,
          boxShadow: '0 4px 16px rgba(108, 99, 255, 0.08)',
          border: '1px solid rgba(108, 99, 255, 0.1)',
          mb: 3
        }}>
          <CardContent sx={{ p: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Box>
                <Typography variant="h4" fontWeight={700} color="#6C63FF" gutterBottom>
                  Progressive Content Release
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Unlock learning modules strategically to maximize engagement
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Switch
                  checked={dripEnabled}
                  onChange={(e) => setDripEnabled(e.target.checked)}
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#00FFC6',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 255, 198, 0.08)',
                      },
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: '#00FFC6',
                    },
                  }}
                />
                <Typography variant="caption" color="text.secondary" display="block">
                  {dripEnabled ? 'Active' : 'Inactive'}
                </Typography>
              </Box>
            </Stack>

            {dripEnabled && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.5 }}
              >
                <Grid container spacing={2}>
                  {dripMethods.map((dripMethod, index) => (
                    <Grid item xs={12} md={4} key={dripMethod.id}>
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                      >
                        <Paper sx={{ 
                          p: 2.5, 
                          borderRadius: 2,
                          background: 'linear-gradient(145deg, #ffffff 0%, #fafbff 100%)',
                          border: `1px solid ${getMethodColor(dripMethod.method)}30`,
                          position: 'relative',
                          overflow: 'hidden',
                          height: '100%',
                          minHeight: 200
                        }}>
                          <Box sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: 3,
                            background: `linear-gradient(90deg, ${getMethodColor(dripMethod.method)} 0%, ${getMethodColor(dripMethod.method)}80 100%)`
                          }} />
                          
                          <Stack spacing={2}>
                            <Stack direction="row" alignItems="center" spacing={1.5}>
                              <Box sx={{ 
                                color: getMethodColor(dripMethod.method),
                                display: 'flex',
                                alignItems: 'center'
                              }}>
                                {getMethodIcon(dripMethod.method)}
                              </Box>
                              <Typography variant="subtitle1" fontWeight={600}>
                                Module {index + 1}: {dripMethod.id}
                              </Typography>
                            </Stack>

                            <FormControl fullWidth size="small">
                              <InputLabel>Release Strategy</InputLabel>
                              <Select
                                value={dripMethod.method}
                                onChange={(e) => handleDripMethodChange(dripMethod.id, e.target.value as 'immediate' | 'days' | 'date')}
                                label="Release Strategy"
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                      borderColor: getMethodColor(dripMethod.method),
                                    },
                                  },
                                }}
                              >
                                <MenuItem value="immediate">
                                  <Stack direction="row" spacing={1} alignItems="center">
                                    <TrendingUpIcon sx={{ color: '#00FFC6' }} />
                                    <Typography variant="body2">Instant Access</Typography>
                                  </Stack>
                                </MenuItem>
                                <MenuItem value="days">
                                  <Stack direction="row" spacing={1} alignItems="center">
                                    <ScheduleIcon sx={{ color: '#FFD600' }} />
                                    <Typography variant="body2">Time-Based Release</Typography>
                                  </Stack>
                                </MenuItem>
                                <MenuItem value="date">
                                  <Stack direction="row" spacing={1} alignItems="center">
                                    <CalendarIcon sx={{ color: '#FF6B6B' }} />
                                    <Typography variant="body2">Date-Based Release</Typography>
                                  </Stack>
                                </MenuItem>
                              </Select>
                            </FormControl>

                            {dripMethod.method !== 'immediate' && (
                              <Box>
                                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                                  {dripMethod.method === 'days' ? 'Days After Enrollment' : 'Release Date & Time'}
                                </Typography>
                                <TextField
                                  type={dripMethod.method === 'days' ? 'number' : 'datetime-local'}
                                  value={dripMethod.action || ''}
                                  onChange={(e) => handleActionChange(dripMethod.id, dripMethod.method === 'days' ? parseInt(e.target.value) || 1 : e.target.value)}
                                  fullWidth
                                  size="small"
                                  placeholder={dripMethod.method === 'days' ? 'Enter number of days' : 'Select date and time'}
                                  InputProps={{
                                    endAdornment: dripMethod.method === 'days' ? 
                                      <ScheduleIcon sx={{ color: 'text.secondary', fontSize: 20 }} /> :
                                      <CalendarIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                                  }}
                                  sx={{
                                    '& .MuiOutlinedInput-root': {
                                      height: 48,
                                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: getMethodColor(dripMethod.method),
                                        borderWidth: 2,
                                      },
                                    },
                                    '& .MuiInputBase-input': {
                                      fontSize: '0.875rem',
                                    }
                                  }}
                                />
                              </Box>
                            )}
                          </Stack>
                        </Paper>
                      </motion.div>
                    </Grid>
                  ))}
                </Grid>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Display Options */}
      {dripEnabled && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card sx={{ 
            background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
            borderRadius: 2,
            boxShadow: '0 4px 16px rgba(108, 99, 255, 0.08)',
            border: '1px solid rgba(108, 99, 255, 0.1)',
            mb: 3
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} color="#6C63FF" gutterBottom>
                <VisibilityIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Content Visibility Strategy
              </Typography>
              
              <Grid container spacing={2} sx={{ mt: 1.5 }}>
                {[
                  { value: 'title', label: 'Module Titles Only', icon: <InfoIcon />, color: '#6C63FF' },
                  { value: 'titleAndLessons', label: 'Full Module Preview', icon: <VisibilityIcon />, color: '#00FFC6' },
                  { value: 'hide', label: 'Complete Hide', icon: <VisibilityOffIcon />, color: '#FF6B6B' }
                ].map((option) => (
                  <Grid item xs={12} md={4} key={option.value}>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Paper
                        onClick={() => setDisplayOption(option.value as any)}
                        sx={{
                          p: 3,
                          borderRadius: 3,
                          cursor: 'pointer',
                          background: displayOption === option.value 
                            ? `linear-gradient(145deg, ${option.color}15 0%, ${option.color}25 100%)`
                            : 'linear-gradient(145deg, #ffffff 0%, #fafbff 100%)',
                          border: displayOption === option.value 
                            ? `2px solid ${option.color}`
                            : '2px solid transparent',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            border: `2px solid ${option.color}`,
                            background: `linear-gradient(145deg, ${option.color}10 0%, ${option.color}20 100%)`,
                          }
                        }}
                      >
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Box sx={{ color: option.color }}>
                            {option.icon}
                          </Box>
                          <Typography variant="body1" fontWeight={500}>
                            {option.label}
                          </Typography>
                        </Stack>
                      </Paper>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Advanced Settings */}
      {dripEnabled && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Card sx={{ 
            background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(108, 99, 255, 0.1)',
            border: '1px solid rgba(108, 99, 255, 0.1)'
          }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" fontWeight={700} color="#6C63FF" gutterBottom>
                Advanced Configuration
              </Typography>
              
              <Stack spacing={3}>
                <Paper sx={{ 
                  p: 3, 
                  borderRadius: 3,
                  background: 'linear-gradient(145deg, #ffffff 0%, #fafbff 100%)',
                  border: '1px solid #e3e6f0'
                }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        <VisibilityOffIcon sx={{ mr: 1, verticalAlign: 'middle', color: '#FF6B6B' }} />
                        Hide Release Timelines
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Conceal unlock dates from learners for enhanced suspense
                      </Typography>
                    </Box>
                    <Switch
                      checked={hideUnlockDate}
                                                      onChange={(e) => setHideUnlockDate(e.target.checked)}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: '#FF6B6B',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 107, 107, 0.08)',
                          },
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: '#FF6B6B',
                        },
                      }}
                    />
                  </Stack>
                </Paper>

                <Paper sx={{ 
                  p: 3, 
                  borderRadius: 3,
                  background: 'linear-gradient(145deg, #ffffff 0%, #fafbff 100%)',
                  border: '1px solid #e3e6f0'
                }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        <EmailIcon sx={{ mr: 1, verticalAlign: 'middle', color: '#00FFC6' }} />
                        Automated Notifications
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Send email alerts when new content becomes available
                      </Typography>
                      <Chip 
                        label="Email Communication" 
                        size="small" 
                        sx={{ mt: 1, background: '#00FFC620', color: '#00FFC6' }} 
                      />
                    </Box>
                    <Switch
                      checked={sendCommunication}
                                                      onChange={(e) => setSendCommunication(e.target.checked)}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: '#00FFC6',
                          '&:hover': {
                            backgroundColor: 'rgba(0, 255, 198, 0.08)',
                          },
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: '#00FFC6',
                        },
                      }}
                    />
                  </Stack>
                </Paper>
              </Stack>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </Box>
  );
});

export default DripContentStep; 