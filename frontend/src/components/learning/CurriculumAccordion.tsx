import React, { useState } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  Chip,
  IconButton,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  PlayArrow as PlayIcon,
  CheckCircle as CheckIcon,
  Lock as LockIcon,
  VideoFile as VideoIcon,
  TextSnippet as TextIcon,
  Headphones as AudioIcon,
  Quiz as QuizIcon,
  Assignment as AssignmentIcon,
  LiveTv as LiveIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { Module, Lesson } from '../../types/course';

interface CurriculumAccordionProps {
  modules: Module[];
  completedLessons: string[];
  currentLessonId?: string;
  onLessonClick: (_lesson: Lesson) => void;
  isEnrolled: boolean;
}

const CurriculumAccordion: React.FC<CurriculumAccordionProps> = ({
  modules,
  completedLessons,
  currentLessonId,
  onLessonClick,
  isEnrolled
}) => {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  const handleModuleToggle = (moduleId: string) => {
    setExpandedModules(prev => {
      const newSet = new Set(prev);
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId);
      } else {
        newSet.add(moduleId);
      }
      return newSet;
    });
  };

  const getLessonIcon = (lesson: Lesson) => {
    const iconProps = { fontSize: 'small' as const };
    
    switch (lesson.type) {
      case 'Video':
        return <VideoIcon {...iconProps} color="primary" />;
      case 'Text':
        return <TextIcon {...iconProps} color="info" />;
      case 'Audio':
        return <AudioIcon {...iconProps} color="secondary" />;
      case 'Quiz':
        return <QuizIcon {...iconProps} color="warning" />;
      case 'Assignment':
        return <AssignmentIcon {...iconProps} color="error" />;
      case 'Live':
        return <LiveIcon {...iconProps} color="success" />;
      default:
        return <PlayIcon {...iconProps} />;
    }
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const isLessonCompleted = (lessonId: string) => {
    return completedLessons.includes(lessonId);
  };

  const isLessonLocked = (lesson: Lesson) => {
    return !lesson.isUnlocked || (!isEnrolled && lesson.type !== 'Video');
  };

  const getModuleProgress = (module: Module) => {
    const completedInModule = module.lessons.filter(lesson => 
      isLessonCompleted(lesson.id)
    ).length;
    return Math.round((completedInModule / module.lessons.length) * 100);
  };

  const getOverallProgress = () => {
    const totalLessons = modules.reduce((total, module) => total + module.lessons.length, 0);
    const completedTotal = completedLessons.length;
    return totalLessons > 0 ? Math.round((completedTotal / totalLessons) * 100) : 0;
  };

  return (
    <Box>
      {/* Overall Progress */}
      <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Course Progress
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {getOverallProgress()}% Complete
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={getOverallProgress()}
          sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: 'rgba(0,0,0,0.1)',
            '& .MuiLinearProgress-bar': {
              borderRadius: 4,
              background: 'linear-gradient(90deg, #6C63FF 0%, #00FFC6 100%)'
            }
          }}
        />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {completedLessons.length} of {modules.reduce((total, module) => total + module.lessons.length, 0)} lessons completed
        </Typography>
      </Box>

      {/* Modules */}
      {modules.map((module, moduleIndex) => {
        const isExpanded = expandedModules.has(module.id);
        const moduleProgress = getModuleProgress(module);
        const _hasUnlockedLessons = module.lessons.some(lesson => lesson.isUnlocked);

        return (
          <motion.div
            key={module.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: moduleIndex * 0.1 }}
          >
            <Accordion
              expanded={isExpanded}
              onChange={() => handleModuleToggle(module.id)}
              sx={{
                mb: 1,
                borderRadius: 2,
                '&:before': { display: 'none' },
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                '&.Mui-expanded': {
                  margin: '0 0 8px 0'
                }
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  bgcolor: isExpanded ? 'primary.50' : 'background.paper',
                  borderRadius: isExpanded ? '8px 8px 0 0' : '8px',
                  '&.Mui-expanded': {
                    minHeight: 56,
                    '& .MuiAccordionSummary-content': {
                      margin: '12px 0'
                    }
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {module.title}
                    </Typography>
                    {module.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {module.description}
                      </Typography>
                    )}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        {module.lessons.length} lessons
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formatDuration(module.lessons.reduce((total, lesson) => total + lesson.duration, 0))}
                      </Typography>
                      <Chip
                        label={`${moduleProgress}%`}
                        size="small"
                        color={moduleProgress === 100 ? 'success' : 'primary'}
                        variant={moduleProgress === 100 ? 'filled' : 'outlined'}
                      />
                    </Box>
                  </Box>
                </Box>
              </AccordionSummary>

              <AccordionDetails sx={{ p: 0 }}>
                <List sx={{ py: 0 }}>
                  {module.lessons.map((lesson, lessonIndex) => {
                    const isCompleted = isLessonCompleted(lesson.id);
                    const isCurrent = currentLessonId === lesson.id;
                    const isLocked = isLessonLocked(lesson);

                    return (
                      <motion.div
                        key={lesson.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: lessonIndex * 0.05 }}
                      >
                        <ListItem
                          button
                          onClick={() => !isLocked && onLessonClick(lesson)}
                          disabled={isLocked}
                          sx={{
                            py: 1.5,
                            px: 2,
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                            bgcolor: isCurrent ? 'primary.50' : 'transparent',
                            '&:hover': {
                              bgcolor: isLocked ? 'transparent' : 'action.hover'
                            },
                            '&.Mui-disabled': {
                              opacity: 0.6
                            }
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            {isCompleted ? (
                              <CheckIcon color="success" />
                            ) : isLocked ? (
                              <LockIcon color="disabled" />
                            ) : (
                              getLessonIcon(lesson)
                            )}
                          </ListItemIcon>

                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography
                                  variant="body1"
                                  sx={{
                                    fontWeight: isCurrent ? 600 : 400,
                                    color: isLocked ? 'text.disabled' : 'text.primary'
                                  }}
                                >
                                  {lesson.title}
                                </Typography>
                                {isCurrent && (
                                  <Chip
                                    label="Current"
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                  />
                                )}
                              </Box>
                            }
                            secondary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
                                <Typography variant="body2" color="text.secondary">
                                  {formatDuration(lesson.duration)}
                                </Typography>
                                <Chip
                                  label={lesson.type}
                                  size="small"
                                  variant="outlined"
                                  color={
                                    lesson.type === 'Video' ? 'primary' :
                                    lesson.type === 'Text' ? 'info' :
                                    lesson.type === 'Audio' ? 'secondary' :
                                    lesson.type === 'Quiz' ? 'warning' :
                                    lesson.type === 'Assignment' ? 'error' :
                                    'success'
                                  }
                                />
                                {lesson.description && (
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{
                                      display: '-webkit-box',
                                      WebkitLineClamp: 1,
                                      WebkitBoxOrient: 'vertical',
                                      overflow: 'hidden',
                                      flexGrow: 1
                                    }}
                                  >
                                    {lesson.description}
                                  </Typography>
                                )}
                              </Box>
                            }
                          />

                          <ListItemSecondaryAction>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {!isLocked && (
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onLessonClick(lesson);
                                  }}
                                  sx={{
                                    color: 'primary.main',
                                    '&:hover': {
                                      bgcolor: 'primary.50'
                                    }
                                  }}
                                >
                                  <PlayIcon fontSize="small" />
                                </IconButton>
                              )}
                            </Box>
                          </ListItemSecondaryAction>
                        </ListItem>
                      </motion.div>
                    );
                  })}
                </List>
              </AccordionDetails>
            </Accordion>
          </motion.div>
        );
      })}
    </Box>
  );
};

export default CurriculumAccordion;
