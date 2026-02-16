import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  Paper,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider
} from '@mui/material';
import {
  LiveTv as LiveIcon,
  VideoCall as VideoCallIcon,
  People as PeopleIcon,
  AccessTime as AccessTimeIcon,
  CalendarToday as CalendarIcon,
  Download as DownloadIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  PlayArrow as PlayIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { LiveSession } from '../../types/course';

interface LiveSessionsComponentProps {
  courseId: string;
  onJoinSession?: (_session: LiveSession) => void;
}

const LiveSessionsComponent: React.FC<LiveSessionsComponentProps> = ({
  courseId,
  onJoinSession
}) => {
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<LiveSession | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [bookmarkedSessions, setBookmarkedSessions] = useState<Set<string>>(new Set());

  // Mock live sessions data
  const mockSessions: LiveSession[] = [
    {
      id: '1',
      lessonId: 'lesson-5',
      title: 'Q&A Session: Motion Design Fundamentals',
      description: 'Join us for a live Q&A session where you can ask questions about motion design concepts, get feedback on your projects, and learn advanced techniques.',
      startDateTime: '2025-01-25T14:00:00Z',
      endDateTime: '2025-01-25T15:00:00Z',
      meetingLink: 'https://meet.google.com/abc-defg-hij',
      meetingPlatform: 'Google Meet',
      maxParticipants: 50,
      currentParticipants: 23,
      status: 'scheduled',
      preClassMessage: 'Please prepare your questions about easing and timing!',
      postClassMessage: 'Thank you for joining! The recording will be available in 24 hours.',
      resources: [
        {
          id: '1',
          name: 'Motion Design Cheat Sheet',
          type: 'document',
          url: '/resources/motion-design-cheat-sheet.pdf',
          size: 1024000,
          downloadCount: 45
        },
        {
          id: '2',
          name: 'Sample Project Files',
          type: 'archive',
          url: '/resources/sample-projects.zip',
          size: 5120000,
          downloadCount: 23
        }
      ]
    },
    {
      id: '2',
      lessonId: 'lesson-8',
      title: 'Live Coding Session: Web Development',
      description: 'Watch me build a real-world project from scratch. We\'ll cover HTML, CSS, JavaScript, and best practices for responsive design.',
      startDateTime: '2025-01-28T10:00:00Z',
      endDateTime: '2025-01-28T12:00:00Z',
      meetingLink: 'https://zoom.us/j/123456789',
      meetingPlatform: 'Zoom',
      maxParticipants: 100,
      currentParticipants: 67,
      status: 'scheduled',
      preClassMessage: 'Make sure you have your code editor ready!',
      postClassMessage: 'Great session! The code is available in the resources section.',
      resources: [
        {
          id: '3',
          name: 'Starter Code',
          type: 'archive',
          url: '/resources/starter-code.zip',
          size: 2048000,
          downloadCount: 34
        }
      ]
    },
    {
      id: '3',
      lessonId: 'lesson-12',
      title: 'Marketing Strategy Workshop',
      description: 'Interactive workshop on digital marketing strategies. Bring your business ideas and we\'ll help you create a marketing plan.',
      startDateTime: '2025-01-30T16:00:00Z',
      endDateTime: '2025-01-30T18:00:00Z',
      meetingLink: 'https://teams.microsoft.com/l/meetup-join/...',
      meetingPlatform: 'Microsoft Teams',
      maxParticipants: 30,
      currentParticipants: 15,
      status: 'scheduled',
      preClassMessage: 'Please prepare a brief description of your business or project.',
      postClassMessage: 'Excellent work everyone! Your marketing plans look great.',
      resources: [
        {
          id: '4',
          name: 'Marketing Plan Template',
          type: 'document',
          url: '/resources/marketing-plan-template.docx',
          size: 512000,
          downloadCount: 28
        },
        {
          id: '5',
          name: 'Industry Research Data',
          type: 'document',
          url: '/resources/industry-research.pdf',
          size: 2048000,
          downloadCount: 19
        }
      ]
    }
  ];

  // Load sessions
  const loadSessions = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSessions(mockSessions);
    } catch {
      // Sessions failed to load
    } finally {
      setLoading(false);
    }
  };

  // Handle join session
  const handleJoinSession = (session: LiveSession) => {
    if (session.status === 'live' || session.status === 'scheduled') {
      window.open(session.meetingLink, '_blank');
      onJoinSession?.(session);
    }
  };

  // Handle bookmark toggle
  const handleBookmarkToggle = (sessionId: string) => {
    setBookmarkedSessions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sessionId)) {
        newSet.delete(sessionId);
      } else {
        newSet.add(sessionId);
      }
      return newSet;
    });
  };

  // Handle view details
  const handleViewDetails = (session: LiveSession) => {
    setSelectedSession(session);
    setShowDetails(true);
  };

  // Format date and time
  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Get session status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live':
        return 'error';
      case 'scheduled':
        return 'primary';
      case 'ended':
        return 'default';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  // Get session status text
  const getStatusText = (status: string) => {
    switch (status) {
      case 'live':
        return 'Live Now';
      case 'scheduled':
        return 'Scheduled';
      case 'ended':
        return 'Ended';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  // Check if session is starting soon
  const isStartingSoon = (session: LiveSession) => {
    const now = new Date();
    const startTime = new Date(session.startDateTime);
    const diffInMinutes = (startTime.getTime() - now.getTime()) / (1000 * 60);
    return diffInMinutes > 0 && diffInMinutes <= 30;
  };

  // Load sessions on mount
  useEffect(() => {
    loadSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- courseId is the trigger
  }, [courseId]);

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography>Loading live sessions...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Live Sessions
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Join interactive live sessions with instructors and fellow learners
        </Typography>
      </Box>

      {/* Sessions Grid */}
      <Grid container spacing={3}>
        {sessions.map((session, index) => (
          <Grid item xs={12} md={6} lg={4} key={session.id}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  '&:hover': {
                    boxShadow: 6
                  }
                }}
              >
                {/* Status Badge */}
                <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 1 }}>
                  <Chip
                    label={getStatusText(session.status)}
                    color={getStatusColor(session.status)}
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                </Box>

                {/* Bookmark Button */}
                <Box sx={{ position: 'absolute', top: 16, left: 16, zIndex: 1 }}>
                  <IconButton
                    size="small"
                    onClick={() => handleBookmarkToggle(session.id)}
                    sx={{
                      bgcolor: 'background.paper',
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                  >
                    {bookmarkedSessions.has(session.id) ? (
                      <BookmarkIcon color="primary" />
                    ) : (
                      <BookmarkBorderIcon />
                    )}
                  </IconButton>
                </Box>

                <CardContent sx={{ flexGrow: 1, pt: 3 }}>
                  {/* Session Icon */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                      <LiveIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {session.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {session.meetingPlatform}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Description */}
                  <Typography
                    variant="body2"
                    sx={{
                      mb: 2,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      lineHeight: 1.5
                    }}
                  >
                    {session.description}
                  </Typography>

                  {/* Session Details */}
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CalendarIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {formatDateTime(session.startDateTime)}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <AccessTimeIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {Math.floor((new Date(session.endDateTime).getTime() - new Date(session.startDateTime).getTime()) / (1000 * 60))} minutes
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <PeopleIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {session.currentParticipants}/{session.maxParticipants} participants
                      </Typography>
                    </Box>
                  </Box>

                  {/* Resources */}
                  {session.resources.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                        Resources ({session.resources.length})
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {session.resources.slice(0, 2).map(resource => (
                          <Chip
                            key={resource.id}
                            label={resource.name}
                            size="small"
                            variant="outlined"
                            icon={<DownloadIcon />}
                            sx={{ fontSize: '0.75rem' }}
                          />
                        ))}
                        {session.resources.length > 2 && (
                          <Chip
                            label={`+${session.resources.length - 2}`}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.75rem' }}
                          />
                        )}
                      </Box>
                    </Box>
                  )}

                  {/* Starting Soon Alert */}
                  {isStartingSoon(session) && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      Starting in {Math.floor((new Date(session.startDateTime).getTime() - new Date().getTime()) / (1000 * 60))} minutes!
                    </Alert>
                  )}
                </CardContent>

                {/* Actions */}
                <Box sx={{ p: 2, pt: 0 }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleViewDetails(session)}
                      fullWidth
                    >
                      View Details
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleJoinSession(session)}
                      disabled={session.status === 'ended' || session.status === 'cancelled'}
                      startIcon={session.status === 'live' ? <PlayIcon /> : <VideoCallIcon />}
                      sx={{
                        background: session.status === 'live' 
                          ? 'linear-gradient(135deg, #f44336 0%, #ff5722 100%)'
                          : 'linear-gradient(135deg, #6C63FF 0%, #00FFC6 100%)',
                        '&:hover': {
                          background: session.status === 'live'
                            ? 'linear-gradient(135deg, #d32f2f 0%, #f4511e 100%)'
                            : 'linear-gradient(135deg, #5a52e5 0%, #00e6b8 100%)'
                        }
                      }}
                    >
                      {session.status === 'live' ? 'Join Now' : 'Join Session'}
                    </Button>
                  </Box>
                </Box>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Session Details Dialog */}
      <Dialog open={showDetails} onClose={() => setShowDetails(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <LiveIcon color="primary" />
            {selectedSession?.title}
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedSession && (
            <Box>
              <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
                {selectedSession.description}
              </Typography>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Session Details
              </Typography>
              
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <CalendarIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Date & Time"
                    secondary={formatDateTime(selectedSession.startDateTime)}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <AccessTimeIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Duration"
                    secondary={`${Math.floor((new Date(selectedSession.endDateTime).getTime() - new Date(selectedSession.startDateTime).getTime()) / (1000 * 60))} minutes`}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <PeopleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Participants"
                    secondary={`${selectedSession.currentParticipants}/${selectedSession.maxParticipants}`}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <VideoCallIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Platform"
                    secondary={selectedSession.meetingPlatform}
                  />
                </ListItem>
              </List>

              {selectedSession.preClassMessage && (
                <>
                  <Divider sx={{ my: 3 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Pre-Class Message
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: 'info.50' }}>
                    <Typography variant="body2">
                      {selectedSession.preClassMessage}
                    </Typography>
                  </Paper>
                </>
              )}

              {selectedSession.resources.length > 0 && (
                <>
                  <Divider sx={{ my: 3 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Resources
                  </Typography>
                  <List dense>
                    {selectedSession.resources.map(resource => (
                      <ListItem key={resource.id}>
                        <ListItemIcon>
                          <DownloadIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={resource.name}
                          secondary={`${(resource.size / 1024 / 1024).toFixed(1)} MB • ${resource.downloadCount} downloads`}
                        />
                        <ListItemSecondaryAction>
                          <Button
                            size="small"
                            startIcon={<DownloadIcon />}
                            onClick={() => window.open(resource.url, '_blank')}
                          >
                            Download
                          </Button>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDetails(false)}>
            Close
          </Button>
          <Button
            variant="contained"
            onClick={() => selectedSession && handleJoinSession(selectedSession)}
            disabled={selectedSession?.status === 'ended' || selectedSession?.status === 'cancelled'}
            sx={{
              background: 'linear-gradient(135deg, #6C63FF 0%, #00FFC6 100%)'
            }}
          >
            Join Session
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LiveSessionsComponent;
