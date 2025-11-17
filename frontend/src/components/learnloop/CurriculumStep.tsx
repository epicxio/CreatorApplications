import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Paper, IconButton, Tooltip, Button, Stack, TextField, MenuItem, Chip, InputLabel, Select, FormControl, OutlinedInput, CircularProgress } from '@mui/material';
import { styled } from '@mui/system';
import { CheckCircle, RadioButtonUnchecked, ArrowForward, ArrowBack, ArrowUpward, ArrowDownward } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import VideocamIcon from '@mui/icons-material/Videocam';
import DescriptionIcon from '@mui/icons-material/Description';
import QuizIcon from '@mui/icons-material/Quiz';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import LiveTvIcon from '@mui/icons-material/LiveTv';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import LinkIcon from '@mui/icons-material/Link';
import InputAdornment from '@mui/material/InputAdornment';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import AudioFileIcon from '@mui/icons-material/AudioFile';
import SvgIcon from '@mui/material/SvgIcon';
import QuizQuestionEditor from './QuizQuestionEditor';
import uploadService from '../../services/uploadService';
import { useToast } from '../../hooks/useToast';

interface QuizQuestion {
  id: string;
  question: string;
  type: 'single' | 'multiple';
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
}

const initialModules = [
  {
    id: 'module-1',
    title: 'Introduction',
    lessons: [
      { id: 'lesson-1', title: 'Welcome', type: 'Video' },
      { id: 'lesson-2', title: 'Course Overview', type: 'Text' },
    ],
  },
];

// Change lessonTypes to include Live and Audio
const lessonTypes = ['Video', 'Text', 'Quiz', 'Assignment', 'Live', 'Audio'];

// Helper for icon mapping
const lessonTypeIcons: { [key: string]: JSX.Element } = {
  Video: <VideocamIcon sx={{ color: '#6C63FF' }} />, 
  Text: <DescriptionIcon sx={{ color: '#00BFFF' }} />, 
  Quiz: <QuizIcon sx={{ color: '#FFD600' }} />, 
  Assignment: <AssignmentTurnedInIcon sx={{ color: '#00FFC6' }} />, 
  Live: <LiveTvIcon sx={{ color: '#FF6B6B' }} />,
  Audio: <AudioFileIcon sx={{ color: '#FF8C00' }} />
};

// Helper for meeting link icon and label
const meetingLinkMeta: {
  [key: string]: { icon: JSX.Element; label: string; placeholder: string }
} = {
  'Google Meet': {
    icon: <SvgIcon sx={{ color: '#34A853' }}><path d="M21 6.5v11c0 .83-.67 1.5-1.5 1.5h-15C3.67 19 3 18.33 3 17.5v-11C3 5.67 3.67 5 4.5 5h15c.83 0 1.5.67 1.5 1.5z"/><path d="M17 10.5V7H7v10h10v-3.5l2.5 2.5v-7l-2.5 2.5z"/></SvgIcon>,
    label: 'Google Meet Link',
    placeholder: 'https://meet.google.com/...'
  },
  'Zoom': {
    icon: <SvgIcon sx={{ color: '#2D8CFF' }}><circle cx="12" cy="12" r="10" /><ellipse cx="12" cy="12" rx="6" ry="4" fill="#fff" /></SvgIcon>,
    label: 'Zoom Link',
    placeholder: 'https://zoom.us/j/...'
  },
  'Webex': {
    icon: <SvgIcon sx={{ color: '#00B1E3' }}><circle cx="12" cy="12" r="10" /><ellipse cx="12" cy="12" rx="6" ry="4" fill="#fff" /></SvgIcon>,
    label: 'Webex Link',
    placeholder: 'https://webex.com/meet/...'
  },
  'Custom Link': {
    icon: <LinkIcon color="primary" />,
    label: 'Paste Meeting Link',
    placeholder: 'https://your-meeting-link.com'
  }
};

const allowedMeetingKeys = ['Google Meet', 'Zoom', 'Webex', 'Custom Link'] as const;
type MeetingKey = typeof allowedMeetingKeys[number];

interface CurriculumStepProps {
  modules?: Array<{
    id: string;
    title: string;
    description?: string;
    lessons: Array<{
      id: string;
      title: string;
      type: string;
      description?: string;
      duration?: number;
      order?: number;
      [key: string]: any;
    }>;
    [key: string]: any;
  }>;
  setModules?: React.Dispatch<React.SetStateAction<Array<{
    id: string;
    title: string;
    description?: string;
    lessons: Array<{
      id: string;
      title: string;
      type: string;
      description?: string;
      duration?: number;
      order?: number;
      [key: string]: any;
    }>;
    [key: string]: any;
  }>>>;
}

const CurriculumStep: React.FC<CurriculumStepProps> = ({ modules: propModules, setModules: propSetModules }) => {
  // Use props if provided, otherwise use local state
  const [localModules, setLocalModules] = useState(initialModules);
  const modules = propModules !== undefined ? propModules : localModules;
  const setModules = propSetModules !== undefined ? propSetModules : setLocalModules;
  const { success, error: showError } = useToast();
  
  // Upload state
  const [uploading, setUploading] = useState<{ [key: string]: boolean }>({});
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [newModuleTitle, setNewModuleTitle] = useState('');
  // Per-module new lesson input state
  const [newLessonInputs, setNewLessonInputs] = useState<{ [moduleId: string]: { title: string, type: string } }>({});
  // 1. Add new state for lesson description, resources, and video file per module (for add) and per lesson (for edit)
  // Changed: Store file URLs instead of File objects after upload
  const [newLessonDescriptions, setNewLessonDescriptions] = useState<{ [moduleId: string]: string }>({});
  const [newLessonResources, setNewLessonResources] = useState<{ [moduleId: string]: Array<{ url: string, name: string, size: number }> }>({});
  const [newLessonVideoPairs, setNewLessonVideoPairs] = useState<{ [moduleId: string]: { video: { url: string, name: string, size: number }, thumbnail: { url: string, name: string } | null }[] }>({});
  const [newLessonAudioFiles, setNewLessonAudioFiles] = useState<{ [moduleId: string]: Array<{ url: string; name: string; size: number; storagePath?: string }> }>({});
  // 1. Add a new state: const [lessonThumbnails, setLessonThumbnails] = useState<{ [lessonKey: string]: File | null }>({});
  const [lessonThumbnails, setLessonThumbnails] = useState<{ [lessonKey: string]: (File | null)[] }>({});
  // 1. Add state for videoPreviews
  const [videoPreviews, setVideoPreviews] = useState<{ [lessonKey: string]: string | null }>({});

  // Add new state for Live lesson fields and pre/post class message
  const [newLessonPreClassMessages, setNewLessonPreClassMessages] = useState<{ [moduleId: string]: string }>({});
  const [newLessonPostClassMessages, setNewLessonPostClassMessages] = useState<{ [moduleId: string]: string }>({});
  // Change the type for newLessonLiveFields state to include customLink
  const [newLessonLiveFields, setNewLessonLiveFields] = useState<{
    [moduleId: string]: {
      startDateTime: string;
      duration: string;
      meetingLink: string;
      documents: File[];
      customLink?: string;
    }
  }>({});
  
  // Add state for Assignment lesson fields
  const [newLessonAssignmentFields, setNewLessonAssignmentFields] = useState<{
    [moduleId: string]: {
      instructions: string;
      submissionType: 'text' | 'file' | 'both';
      maxFileSize: number;
      allowedFileTypes: string[];
    }
  }>({});

  // 1. Remove all inline add/edit forms from the left column. Only show structure, add buttons, and reorder controls.
  // 2. Move all add/edit forms and details to the right column, shown when a module or lesson is selected for add/edit.
  // 3. Add state for selectedModuleId and selectedLessonId to control what is shown in the right panel.
  // 4. When Add or Edit is clicked, set the selectedModuleId or selectedLessonId and show the form in the right panel.
  // 5. When nothing is selected, show a helpful empty state in the right panel.
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  // 1. Add a new state: const [addLessonModuleId, setAddLessonModuleId] = useState<string | null>(null);
  const [addLessonModuleId, setAddLessonModuleId] = useState<string | null>(null);

  // Add move up/down functions for modules and lessons
  const moveModule = (from: number, to: number) => {
    if (to < 0 || to >= modules.length) return;
    const updated = [...modules];
    const [removed] = updated.splice(from, 1);
    updated.splice(to, 0, removed);
    setModules(updated);
  };
  const moveLesson = (modIdx: number, from: number, to: number) => {
    const lessons = modules[modIdx].lessons;
    if (to < 0 || to >= lessons.length) return;
    const updatedLessons = [...lessons];
    const [removed] = updatedLessons.splice(from, 1);
    updatedLessons.splice(to, 0, removed);
    setModules(modules.map((m, i) => i === modIdx ? { ...m, lessons: updatedLessons } : m));
  };

  // Add module
  const handleAddModule = () => {
    if (!newModuleTitle.trim()) return;
    setModules([
      ...modules,
      { id: `module-${Date.now()}`, title: newModuleTitle, lessons: [] },
    ]);
    setNewModuleTitle('');
  };
  // Edit module
  const handleEditModule = (id: string, title: string) => {
    setModules(modules.map(m => (m.id === id ? { ...m, title } : m)));
    setEditingModuleId(null);
  };
  // Delete module
  const handleDeleteModule = (id: string) => {
    setModules(modules.filter(m => m.id !== id));
  };
  // Add lesson - Updated to include all lesson fields
  const handleAddLesson = (modId: string) => {
    const mod = modules.find(m => m.id === modId);
    if (!mod) return;
    const input = newLessonInputs[mod.id] || { title: '', type: lessonTypes[0] };
    if (!input.title.trim()) return;
    const lessonOrder = mod.lessons.length + 1;
    
    // Get all lesson data from form state
    const description = newLessonDescriptions[mod.id] || '';
    const preClassMessage = newLessonPreClassMessages[mod.id] || '';
    const postClassMessage = newLessonPostClassMessages[mod.id] || '';
    const resources = newLessonResources[mod.id] || [];
    const videos = newLessonVideoPairs[mod.id] || [];
    const audioFiles = newLessonAudioFiles[mod.id] || [];
    const liveFields = newLessonLiveFields[mod.id];
    const quizQuestions = input.type === 'Quiz' ? newQuizQuestions : undefined;
    
    // Calculate duration from videos/audio if available
    let duration = 0;
    if (input.type === 'Video' && videos.length > 0) {
      // For now, set a default duration. In production, you'd extract duration from video metadata
      duration = 30; // Default 30 minutes per video
    } else if (input.type === 'Audio' && audioFiles.length > 0) {
      duration = 20; // Default 20 minutes per audio
    } else if (input.type === 'Live' && liveFields?.duration) {
      duration = parseInt(liveFields.duration) || 0;
    }
    
    const newLesson: any = { 
      id: `lesson-${Date.now()}`, 
      title: input.title, 
      type: input.type,
      description: description,
      duration: duration,
      order: lessonOrder,
      content: {}, // Will be populated based on lesson type
      resources: resources,
      isUnlocked: true,
      preClassMessage: preClassMessage,
      postClassMessage: postClassMessage
    };
    
    // Add type-specific data
    if (input.type === 'Video' && videos.length > 0) {
      newLesson.videos = videos;
    }
    if (input.type === 'Audio' && audioFiles.length > 0) {
      newLesson.audioFiles = audioFiles;
    }
    if (input.type === 'Quiz' && quizQuestions) {
      newLesson.quizQuestions = quizQuestions;
    }
    if (input.type === 'Live' && liveFields) {
      newLesson.liveFields = liveFields;
    }
    if (input.type === 'Assignment') {
      const assignmentFields = newLessonAssignmentFields[mod.id];
      if (assignmentFields) {
        newLesson.assignmentFields = assignmentFields;
      }
    }
    
    setModules(modules.map((m, i) =>
      i === modules.findIndex(mod => mod.id === modId) ? { ...m, lessons: [...m.lessons, newLesson] } : m
    ));
    
    // Reset form state after adding
    setNewLessonInputs(inputs => ({ ...inputs, [mod.id]: { title: '', type: lessonTypes[0] } }));
    setNewLessonDescriptions(descs => ({ ...descs, [mod.id]: '' }));
    setNewLessonPreClassMessages(msgs => ({ ...msgs, [mod.id]: '' }));
    setNewLessonPostClassMessages(msgs => ({ ...msgs, [mod.id]: '' }));
    setNewLessonResources(res => ({ ...res, [mod.id]: [] }));
    setNewLessonVideoPairs(pairs => ({ ...pairs, [mod.id]: [] }));
    setNewLessonAudioFiles(files => ({ ...files, [mod.id]: [] }));
    setNewLessonLiveFields(fields => ({ ...fields, [mod.id]: { startDateTime: '', duration: '', meetingLink: '', documents: [] } }));
    setNewLessonAssignmentFields(fields => ({ ...fields, [mod.id]: { instructions: '', submissionType: 'both', maxFileSize: 10, allowedFileTypes: [] } }));
    setNewQuizQuestions([{
      id: 'q-1',
      question: '',
      type: 'single',
      options: [
        { id: 'opt-1', text: 'Option 1', isCorrect: false },
        { id: 'opt-2', text: 'Option 2', isCorrect: true }
      ],
    }]);
    // Close the form after adding - this is now handled in the button onClick, but keeping here as backup
    // setAddLessonModuleId(null); // Reset after adding
  };
  // Edit lesson - Updated to handle all lesson fields
  const handleEditLesson = (modIdx: number, lessonId: string, lessonData: {
    title: string;
    type: string;
    description?: string;
    preClassMessage?: string;
    postClassMessage?: string;
    resources?: Array<{ url: string, name: string, size: number }>;
    videos?: { video: { url: string, name: string, size: number }, thumbnail: { url: string, name: string } | null }[];
    audioFiles?: Array<{ url: string, name: string, size: number, storagePath?: string }>;
    quizQuestions?: QuizQuestion[];
    liveFields?: {
      startDateTime: string;
      duration: string;
      meetingLink: string;
      customLink?: string;
      documents: File[];
    };
    assignmentFields?: {
      instructions: string;
      submissionType: 'text' | 'file' | 'both';
      maxFileSize: number;
      allowedFileTypes: string[];
    };
  }) => {
    setModules(modules.map((m, i) =>
      i === modIdx
        ? { 
            ...m, 
            lessons: m.lessons.map(l => 
              l.id === lessonId 
                ? { 
                    ...l, 
                    title: lessonData.title, 
                    type: lessonData.type,
                    description: lessonData.description || (l as any).description,
                    preClassMessage: lessonData.preClassMessage,
                    postClassMessage: lessonData.postClassMessage,
                    resources: lessonData.resources || (l as any).resources,
                    videos: lessonData.videos || (l as any).videos,
                    audioFiles: lessonData.audioFiles || (l as any).audioFiles,
                    quizQuestions: lessonData.quizQuestions || (l as any).quizQuestions,
                    liveFields: lessonData.liveFields || (l as any).liveFields,
                    assignmentFields: lessonData.assignmentFields || (l as any).assignmentFields
                  } 
                : l
            ) 
          } 
        : m
    ));
    setEditingLessonId(null);
  };
  // Delete lesson
  const handleDeleteLesson = (modIdx: number, lessonId: string) => {
    setModules(modules.map((m, i) =>
      i === modIdx ? { ...m, lessons: m.lessons.filter(l => l.id !== lessonId) } : m
    ));
  };

  // Load existing lesson data when editing
  useEffect(() => {
    if (selectedLessonId) {
      const lesson = modules.flatMap(m => m.lessons).find(l => l.id === selectedLessonId);
      if (lesson) {
        // Initialize form fields with existing lesson data
        if (!newLessonInputs[selectedLessonId]) {
          setNewLessonInputs(inputs => ({
            ...inputs,
            [selectedLessonId]: { title: lesson.title || '', type: lesson.type || lessonTypes[0] }
          }));
        }
        if (!newLessonDescriptions[selectedLessonId] && (lesson as any).description) {
          setNewLessonDescriptions(descs => ({ ...descs, [selectedLessonId]: (lesson as any).description || '' }));
        }
        if (!newLessonPreClassMessages[selectedLessonId] && (lesson as any).preClassMessage) {
          setNewLessonPreClassMessages(msgs => ({ ...msgs, [selectedLessonId]: (lesson as any).preClassMessage || '' }));
        }
        if (!newLessonPostClassMessages[selectedLessonId] && (lesson as any).postClassMessage) {
          setNewLessonPostClassMessages(msgs => ({ ...msgs, [selectedLessonId]: (lesson as any).postClassMessage || '' }));
        }
        if (!newLessonResources[selectedLessonId] && (lesson as any).resources) {
          setNewLessonResources(res => ({ ...res, [selectedLessonId]: (lesson as any).resources || [] }));
        }
        if (!newLessonVideoPairs[selectedLessonId] && (lesson as any).videos) {
          setNewLessonVideoPairs(pairs => ({ ...pairs, [selectedLessonId]: (lesson as any).videos || [] }));
        }
        if (!newLessonAudioFiles[selectedLessonId] && (lesson as any).audioFiles) {
          setNewLessonAudioFiles(files => ({ ...files, [selectedLessonId]: (lesson as any).audioFiles || [] }));
        }
        if (!newLessonLiveFields[selectedLessonId] && (lesson as any).liveFields) {
          const liveFields = (lesson as any).liveFields;
          setNewLessonLiveFields(fields => ({ 
            ...fields, 
            [selectedLessonId]: {
              startDateTime: liveFields.startDateTime || '',
              duration: liveFields.duration || '',
              meetingLink: liveFields.meetingLink || '',
              customLink: liveFields.customLink || '',
              documents: liveFields.documents || []
            }
          }));
        }
        if (lesson.type === 'Quiz' && (lesson as any).quizQuestions && !editQuizQuestions.length) {
          setEditQuizQuestions((lesson as any).quizQuestions || [{
            id: 'q-1',
            question: '',
            type: 'single',
            options: [
              { id: 'opt-1', text: 'Option 1', isCorrect: false },
              { id: 'opt-2', text: 'Option 2', isCorrect: true }
            ],
          }]);
        }
        if (lesson.type === 'Assignment' && (lesson as any).assignmentFields) {
          setEditAssignmentFields((lesson as any).assignmentFields || {
            instructions: '',
            submissionType: 'both',
            maxFileSize: 10,
            allowedFileTypes: []
          });
        } else if (lesson.type === 'Assignment' && !editAssignmentFields) {
          setEditAssignmentFields({
            instructions: '',
            submissionType: 'both',
            maxFileSize: 10,
            allowedFileTypes: []
          });
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLessonId, modules]);

  let lessonInput: { title?: string; type?: string } | undefined = undefined;
  let lessonDescription: string = '';
  let lessonResources: Array<{ url: string, name: string, size: number }> = [];
  let lessonVideos: { video: { url: string, name: string, size: number }, thumbnail: { url: string, name: string } | null }[] = [];
  let lessonPreClassMessage: string = '';
  let lessonPostClassMessage: string = '';
  let lessonAudioFiles: Array<{ url: string, name: string, size: number, storagePath?: string }> = [];
  let lessonLiveFields: {
    startDateTime: string;
    duration: string;
    meetingLink: string;
    customLink?: string;
    documents: File[];
  } | undefined = undefined;
  
  if (selectedLessonId) {
    lessonInput = newLessonInputs[selectedLessonId];
    lessonDescription = newLessonDescriptions[selectedLessonId] || '';
    lessonResources = newLessonResources[selectedLessonId] || [];
    lessonVideos = newLessonVideoPairs[selectedLessonId] || [];
    lessonPreClassMessage = newLessonPreClassMessages[selectedLessonId] || '';
    lessonPostClassMessage = newLessonPostClassMessages[selectedLessonId] || '';
    lessonAudioFiles = newLessonAudioFiles[selectedLessonId] || [];
    lessonLiveFields = newLessonLiveFields[selectedLessonId];
  }

  // Add state for resource upload errors
  const [resourceUploadErrors, setResourceUploadErrors] = useState<{ [key: string]: string }>({});

  // Add state for quiz questions in the add lesson form
  const [newQuizQuestions, setNewQuizQuestions] = useState<QuizQuestion[]>([{
    id: 'q-1',
    question: '',
    type: 'single',
    options: [
      { id: 'opt-1', text: 'Option 1', isCorrect: false },
      { id: 'opt-2', text: 'Option 2', isCorrect: true }
    ],
  }]);

  useEffect(() => {
    if (!addLessonModuleId) return;
    if (newLessonInputs[addLessonModuleId]?.type === 'Quiz' && (!newQuizQuestions || newQuizQuestions.length === 0)) {
      setNewQuizQuestions([{
        id: 'q-1',
        question: '',
        type: 'single',
        options: [
          { id: 'opt-1', text: 'Option 1', isCorrect: false },
          { id: 'opt-2', text: 'Option 2', isCorrect: true }
        ],
      }]);
    }
  }, [addLessonModuleId, addLessonModuleId ? newLessonInputs[addLessonModuleId]?.type : undefined]);

  // Add state for quiz questions in the edit lesson form
  const [editAssignmentFields, setEditAssignmentFields] = useState<{
    instructions: string;
    submissionType: 'text' | 'file' | 'both';
    maxFileSize: number;
    allowedFileTypes: string[];
  } | null>(null);
  
  const [editQuizQuestions, setEditQuizQuestions] = useState<QuizQuestion[]>([{
    id: 'q-1',
    question: '',
    type: 'single',
    options: [
      { id: 'opt-1', text: 'Option 1', isCorrect: false },
      { id: 'opt-2', text: 'Option 2', isCorrect: true }
    ],
  }]);

  // Render the curriculum builder UI
  return (
    <Box sx={{ display: 'flex', gap: 3 }}>
      {/* Left Panel: Modules and Lessons List */}
      {/* LEFT COLUMN: Only structure, add/reorder, and edit buttons */}
      <Box sx={{ flex: 1 }}>
        <Typography variant="h5" fontWeight={700} color="#6C63FF" mb={2}>
          Curriculum Builder
        </Typography>
        {modules.map((mod, modIdx) => (
          <Paper key={mod.id} sx={{ mb: 3, p: 2, borderRadius: 3, boxShadow: 2, background: '#fff' }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box sx={{ color: '#6C63FF' }}>
                <RadioButtonUnchecked />
              </Box>
              <Typography variant="h6" sx={{ flex: 1 }}>{mod.title}</Typography>
              <IconButton size="small" onClick={() => moveModule(modIdx, modIdx - 1)} disabled={modIdx === 0}><ArrowUpward /></IconButton>
              <IconButton size="small" onClick={() => moveModule(modIdx, modIdx + 1)} disabled={modIdx === modules.length - 1}><ArrowDownward /></IconButton>
              <Button size="small" onClick={() => { setSelectedModuleId(mod.id); setSelectedLessonId(null); }}>Edit</Button>
              <Button size="small" color="error" onClick={() => handleDeleteModule(mod.id)}>Delete</Button>
            </Stack>
            {/* Lessons List */}
            <Box sx={{ paddingLeft: 4, paddingTop: 2 }}>
              {mod.lessons.map((lesson, lessonIdx) => (
                <Paper key={lesson.id} sx={{ mb: 2, p: 1.5, borderRadius: 2, background: '#f8fafc', display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ color: '#00FFC6', mr: 2 }}>
                    <RadioButtonUnchecked />
                  </Box>
                  <Typography sx={{ flex: 1 }}>{lesson.title} <Chip label={lesson.type} size="small" sx={{ ml: 1 }} /></Typography>
                  <IconButton size="small" onClick={() => moveLesson(modIdx, lessonIdx, lessonIdx - 1)} disabled={lessonIdx === 0}><ArrowUpward /></IconButton>
                  <IconButton size="small" onClick={() => moveLesson(modIdx, lessonIdx, lessonIdx + 1)} disabled={lessonIdx === mod.lessons.length - 1}><ArrowDownward /></IconButton>
                  <Button size="small" onClick={() => { setSelectedLessonId(lesson.id); setSelectedModuleId(null); }}>Edit</Button>
                  <Button size="small" color="error" onClick={() => handleDeleteLesson(modIdx, lesson.id)}>Delete</Button>
                </Paper>
              ))}
              {/* Add Lesson Button */}
              <Button size="small" variant="outlined" onClick={() => { setAddLessonModuleId(mod.id); setSelectedModuleId(null); setSelectedLessonId(null); }} sx={{ mt: 1 }}>
                Add Lesson
              </Button>
            </Box>
          </Paper>
        ))}
        {/* Add Module Button */}
        <Button size="small" variant="contained" onClick={() => { setSelectedModuleId('new'); setSelectedLessonId(null); }}>
          Add Module
        </Button>
      </Box>

      {/* Right Panel: Lesson Details */}
      <Box sx={{ flex: 1, minWidth: 300 }}>
        {addLessonModuleId ? (
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 2, background: '#fff' }}>
            <Typography variant="h6" fontWeight={700} color="#6C63FF" mb={2}>
              Add New Lesson to {modules.find(mod => mod.id === addLessonModuleId)?.title}
            </Typography>
            <Stack spacing={2}>
              {/* Type Tabs/Buttons */}
              <FormControl size="small" sx={{ minWidth: 100 }}>
                <InputLabel id="lesson-type-label">Lesson Type</InputLabel>
                <Select
                  labelId="lesson-type-label"
                  label="Lesson Type"
                  value={newLessonInputs[addLessonModuleId]?.type || lessonTypes[0]}
                  onChange={e => setNewLessonInputs(inputs => ({ ...inputs, [addLessonModuleId]: { ...(inputs[addLessonModuleId] || { title: '', type: lessonTypes[0] }), type: e.target.value } }))}
                >
                  {lessonTypes.map(type => (
                    <MenuItem key={type} value={type}>
                      <ListItemIcon>{lessonTypeIcons[type]}</ListItemIcon>
                      <ListItemText primary={type} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {/* Title */}
              <TextField
                label="Title"
                value={newLessonInputs[addLessonModuleId]?.title || ''}
                onChange={e => setNewLessonInputs(inputs => ({ ...inputs, [addLessonModuleId]: { ...(inputs[addLessonModuleId] || { type: lessonTypes[0] }), title: e.target.value } }))}
                size="small"
                autoFocus
                sx={{ mr: 1 }}
              />
              {/* Description */}
              <TextField
                size="small"
                label="Description"
                value={newLessonDescriptions[addLessonModuleId] || ''}
                onChange={e => setNewLessonDescriptions(descs => ({ ...descs, [addLessonModuleId]: e.target.value }))}
                sx={{ width: '100%' }}
                multiline
                minRows={2}
              />
              {/* Pre/Post Class Messages */}
              {['Video', 'Text', 'Quiz', 'Assignment', 'Live', 'Audio'].includes(newLessonInputs[addLessonModuleId]?.type || '') && (
                <>
                  <TextField
                    size="small"
                    label="Pre Class Message"
                    value={newLessonPreClassMessages[addLessonModuleId] || ''}
                    onChange={e => setNewLessonPreClassMessages(msgs => ({ ...msgs, [addLessonModuleId]: e.target.value }))}
                    sx={{ width: '100%' }}
                    multiline
                    minRows={1}
                  />
                  <TextField
                    size="small"
                    label="Post Class Message"
                    value={newLessonPostClassMessages[addLessonModuleId] || ''}
                    onChange={e => setNewLessonPostClassMessages(msgs => ({ ...msgs, [addLessonModuleId]: e.target.value }))}
                    sx={{ width: '100%' }}
                    multiline
                    minRows={1}
                  />
                </>
              )}
              {/* Quiz Question Editor */}
              {newLessonInputs[addLessonModuleId]?.type === 'Quiz' && (
                <QuizQuestionEditor value={newQuizQuestions} onChange={setNewQuizQuestions} />
              )}
              {/* Assignment Fields */}
              {newLessonInputs[addLessonModuleId]?.type === 'Assignment' && (
                <Stack spacing={2}>
                  <TextField
                    size="small"
                    label="Instructions"
                    value={newLessonAssignmentFields[addLessonModuleId]?.instructions || ''}
                    onChange={e => setNewLessonAssignmentFields(fields => ({
                      ...fields,
                      [addLessonModuleId]: {
                        ...(fields[addLessonModuleId] || {
                          submissionType: 'both',
                          maxFileSize: 10,
                          allowedFileTypes: []
                        }),
                        instructions: e.target.value
                      }
                    }))}
                    sx={{ width: '100%' }}
                    multiline
                    minRows={3}
                    placeholder="Enter assignment instructions for students..."
                  />
                  <FormControl size="small" sx={{ minWidth: 200 }}>
                    <InputLabel>Submission Type</InputLabel>
                    <Select
                      value={newLessonAssignmentFields[addLessonModuleId]?.submissionType || 'both'}
                      label="Submission Type"
                      onChange={e => setNewLessonAssignmentFields(fields => ({
                        ...fields,
                        [addLessonModuleId]: {
                          ...(fields[addLessonModuleId] || {
                            instructions: '',
                            maxFileSize: 10,
                            allowedFileTypes: []
                          }),
                          submissionType: e.target.value as 'text' | 'file' | 'both'
                        }
                      }))}
                    >
                      <MenuItem value="text">Text Only</MenuItem>
                      <MenuItem value="file">File Only</MenuItem>
                      <MenuItem value="both">Text & File</MenuItem>
                    </Select>
                  </FormControl>
                  {(newLessonAssignmentFields[addLessonModuleId]?.submissionType === 'file' || 
                    newLessonAssignmentFields[addLessonModuleId]?.submissionType === 'both') && (
                    <>
                      <TextField
                        size="small"
                        label="Max File Size (MB)"
                        type="number"
                        value={newLessonAssignmentFields[addLessonModuleId]?.maxFileSize || 10}
                        onChange={e => setNewLessonAssignmentFields(fields => ({
                          ...fields,
                          [addLessonModuleId]: {
                            ...(fields[addLessonModuleId] || {
                              instructions: '',
                              submissionType: 'both',
                              allowedFileTypes: []
                            }),
                            maxFileSize: parseInt(e.target.value) || 10
                          }
                        }))}
                        inputProps={{ min: 1, max: 100 }}
                        sx={{ width: '100%' }}
                      />
                      <TextField
                        size="small"
                        label="Allowed File Types (comma-separated, e.g., .pdf,.doc,.docx)"
                        value={(newLessonAssignmentFields[addLessonModuleId]?.allowedFileTypes || []).join(',')}
                        onChange={e => setNewLessonAssignmentFields(fields => ({
                          ...fields,
                          [addLessonModuleId]: {
                            ...(fields[addLessonModuleId] || {
                              instructions: '',
                              submissionType: 'both',
                              maxFileSize: 10
                            }),
                            allowedFileTypes: e.target.value.split(',').map(t => t.trim()).filter(t => t)
                          }
                        }))}
                        placeholder=".pdf, .doc, .docx, .txt"
                        sx={{ width: '100%' }}
                        helperText="Enter file extensions separated by commas (e.g., .pdf, .doc, .docx)"
                      />
                    </>
                  )}
                </Stack>
              )}
              {/* Resource Upload */}
              <Box>
                <Button
                  variant="outlined"
                  component="label"
                  size="small"
                  sx={{ mr: 1 }}
                  disabled={(newLessonResources[addLessonModuleId]?.length || 0) >= 10 || uploading[`resource-${addLessonModuleId}`]}
                  startIcon={uploading[`resource-${addLessonModuleId}`] ? <CircularProgress size={16} /> : null}
                >
                  {uploading[`resource-${addLessonModuleId}`] ? 'Uploading...' : 'Upload Resources'}
                  <input
                    type="file"
                    multiple
                    hidden
                    accept=".pdf,.doc,.docx,.ppt,.pptx,image/*"
                    disabled={uploading[`resource-${addLessonModuleId}`]}
                    onChange={async (e) => {
                      const files = Array.from(e.target.files || []);
                      const prevFiles = newLessonResources[addLessonModuleId] || [];
                      
                      if (prevFiles.length + files.length > 10) {
                        setResourceUploadErrors(errs => ({ ...errs, [addLessonModuleId]: 'Cannot upload more than 10 resources.' }));
                        e.target.value = '';
                        return;
                      }
                      
                      setUploading(upload => ({ ...upload, [`resource-${addLessonModuleId}`]: true }));
                      setResourceUploadErrors(errs => ({ ...errs, [addLessonModuleId]: '' })); // Clear previous errors
                      
                      try {
                        const uploadedFiles: Array<{ url: string, name: string, size: number }> = [];
                        const errors: string[] = [];
                        
                        for (const file of files) {
                          if (file.size > 10 * 1024 * 1024) {
                            errors.push(`File ${file.name} exceeds 10MB.`);
                            continue;
                          }
                          
                          try {
                            const response = await uploadService.uploadResource(file);
                            if (response.success && response.data) {
                              const fileData = Array.isArray(response.data) ? response.data[0] : response.data;
                              uploadedFiles.push({
                                url: fileData.url,
                                name: fileData.originalName,
                                size: fileData.size
                              });
                            }
                          } catch (fileError: any) {
                            errors.push(`Failed to upload ${file.name}: ${fileError.response?.data?.message || fileError.message}`);
                          }
                        }
                        
                        // Update resources state with uploaded files
                        if (uploadedFiles.length > 0) {
                          setNewLessonResources(res => ({
                            ...res,
                            [addLessonModuleId]: [...prevFiles, ...uploadedFiles]
                          }));
                          success(`${uploadedFiles.length} resource file(s) uploaded successfully!`);
                        }
                        
                        // Show errors if any
                        if (errors.length > 0) {
                          setResourceUploadErrors(errs => ({ ...errs, [addLessonModuleId]: errors.join(' ') }));
                          if (uploadedFiles.length === 0) {
                            showError(errors.join(' '));
                          }
                        }
                      } catch (err: any) {
                        const errorMsg = err.response?.data?.message || 'Failed to upload resource files';
                        setResourceUploadErrors(errs => ({ ...errs, [addLessonModuleId]: errorMsg }));
                        showError(errorMsg);
                      } finally {
                        setUploading(upload => ({ ...upload, [`resource-${addLessonModuleId}`]: false }));
                        e.target.value = '';
                      }
                    }}
                  />
                </Button>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, mt: 1 }}>
                  Max 10 files. Only PDF, PPT, DOC, DOCX, and images. Max size 10MB each.
                </Typography>
                {resourceUploadErrors[addLessonModuleId] && (
                  <Typography color="error" variant="caption" sx={{ display: 'block', mb: 1 }}>
                    {resourceUploadErrors[addLessonModuleId]}
                  </Typography>
                )}
                {/* Show uploaded resources */}
                {(newLessonResources[addLessonModuleId] || []).length > 0 && (
                  <Box sx={{ mt: 1, mb: 1 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                      Uploaded Files ({newLessonResources[addLessonModuleId]?.length || 0}):
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
                      {(newLessonResources[addLessonModuleId] || []).map((file, idx) => (
                        <Chip
                          key={file.url + idx}
                          label={file.name}
                          color="success"
                          size="small"
                          onDelete={() => setNewLessonResources(res => ({
                            ...res,
                            [addLessonModuleId]: res[addLessonModuleId].filter((_, i) => i !== idx)
                          }))}
                          sx={{ 
                            maxWidth: 200,
                            '& .MuiChip-label': {
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }
                          }}
                        />
                      ))}
                    </Stack>
                  </Box>
                )}
              </Box>
              {/* Video Upload (if type is Video) */}
              {(newLessonInputs[addLessonModuleId]?.type === 'Video') && (
                <>
                  {/* Show video-thumbnail pairs */}
                  {(newLessonVideoPairs[addLessonModuleId] || []).map((pair, idx) => (
                    <Box key={pair.video.name + idx} sx={{ mt: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                      {/* Video Section */}
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                          Video:
                        </Typography>
                        <Chip
                          label={pair.video.name}
                          color="primary"
                          sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}
                          onDelete={() => setNewLessonVideoPairs(pairs => ({
                            ...pairs,
                            [addLessonModuleId]: (pairs[addLessonModuleId] || []).filter((_, i) => i !== idx)
                          }))}
                        />
                        {pair.video?.url && (
                          <Box sx={{ mt: 1 }}>
                            <video
                              src={uploadService.getFileUrl(pair.video.url)}
                              controls
                              style={{ maxWidth: 300, maxHeight: 200, borderRadius: 6, border: '1px solid #eee' }}
                              onError={(e) => {
                                console.error('Error loading video:', pair.video.url);
                                (e.target as HTMLVideoElement).style.display = 'none';
                              }}
                            />
                          </Box>
                        )}
                      </Box>
                      
                      {/* Thumbnail Section */}
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                          Thumbnail:
                        </Typography>
                        {pair.thumbnail && pair.thumbnail.url ? (
                          <Box>
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                              <Chip
                                label={pair.thumbnail.name}
                                color="success"
                                size="small"
                                sx={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis' }}
                                onDelete={() => setNewLessonVideoPairs(pairs => ({
                                  ...pairs,
                                  [addLessonModuleId]: (pairs[addLessonModuleId] || []).map((p, i) => i === idx ? { ...p, thumbnail: null } : p)
                                }))}
                              />
                            </Stack>
                            <Box
                              sx={{
                                width: 150,
                                height: 100,
                                border: '1px solid #e0e0e0',
                                borderRadius: 1,
                                overflow: 'hidden',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: '#f5f5f5'
                              }}
                            >
                              <img
                                src={uploadService.getFileUrl(pair.thumbnail.url)}
                                alt="Thumbnail Preview"
                                style={{ 
                                  maxWidth: '100%', 
                                  maxHeight: '100%', 
                                  objectFit: 'cover',
                                  width: '100%',
                                  height: '100%'
                                }}
                                onError={(e) => {
                                  console.error('Error loading thumbnail:', pair.thumbnail?.url);
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            </Box>
                          </Box>
                        ) : (
                          <Button
                            variant="outlined"
                            component="label"
                            size="small"
                            sx={{ minWidth: 120 }}
                          >
                            {uploading[`thumbnail-${addLessonModuleId}-${idx}`] ? 'Uploading...' : 'Upload Thumbnail'}
                            <input
                              type="file"
                              hidden
                              accept="image/*"
                              disabled={uploading[`thumbnail-${addLessonModuleId}-${idx}`]}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                
                                setUploading(upload => ({ ...upload, [`thumbnail-${addLessonModuleId}-${idx}`]: true }));
                                
                                (async () => {
                                  try {
                                    const response = await uploadService.uploadThumbnail(file);
                                    if (response.success && response.data) {
                                      const fileData = Array.isArray(response.data) ? response.data[0] : response.data;
                                      setNewLessonVideoPairs(pairs => ({
                                        ...pairs,
                                        [addLessonModuleId]: (pairs[addLessonModuleId] || []).map((p, i) => {
                                          return i === idx ? { ...p, thumbnail: { url: fileData.url, name: fileData.originalName } } : p;
                                        })
                                      }));
                                      success('Thumbnail uploaded successfully!');
                                    }
                                  } catch (error: any) {
                                    showError(error.response?.data?.message || 'Failed to upload thumbnail');
                                  } finally {
                                    setUploading(upload => ({ ...upload, [`thumbnail-${addLessonModuleId}-${idx}`]: false }));
                                    if (e.target) {
                                      (e.target as HTMLInputElement).value = '';
                                    }
                                  }
                                })();
                              }}
                            />
                          </Button>
                        )}
                      </Box>
                    </Box>
                  ))}
                  {/* Upload Video (if less than 3) */}
                  {(newLessonVideoPairs[addLessonModuleId]?.length || 0) < 3 && (
                    <Button
                      variant="outlined"
                      component="label"
                      size="small"
                      sx={{ mt: 1 }}
                    >
                      {uploading[`video-${addLessonModuleId}`] ? 'Uploading...' : 'Upload Video'}
                      <input
                        type="file"
                        hidden
                        accept="video/*"
                        disabled={uploading[`video-${addLessonModuleId}`]}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          
                          if (file.size > 100 * 1024 * 1024) {
                            showError('Video file exceeds 100MB limit');
                            e.target.value = '';
                            return;
                          }
                          
                          setUploading(upload => ({ ...upload, [`video-${addLessonModuleId}`]: true }));
                          
                          try {
                            const response = await uploadService.uploadVideo(file);
                            if (response.success && response.data) {
                              const fileData = Array.isArray(response.data) ? response.data[0] : response.data;
                              setNewLessonVideoPairs(pairs => ({
                                ...pairs,
                                [addLessonModuleId]: [...(pairs[addLessonModuleId] || []), { 
                                  video: { url: fileData.url, name: fileData.originalName, size: fileData.size }, 
                                  thumbnail: null 
                                }]
                              }));
                              success('Video uploaded successfully!');
                            }
                          } catch (err: any) {
                            showError(err.response?.data?.message || 'Failed to upload video');
                          } finally {
                            setUploading(upload => ({ ...upload, [`video-${addLessonModuleId}`]: false }));
                            e.target.value = '';
                          }
                        }}
                      />
                    </Button>
                  )}
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    Max 3 videos. Only video files. Max size 100MB each.
                  </Typography>
                </>
              )}
              {/* Audio Upload (if type is Audio) */}
              {(newLessonInputs[addLessonModuleId]?.type === 'Audio') && (
                <>
                  {/* Show uploaded audio files */}
                  {(newLessonAudioFiles[addLessonModuleId] || []).map((file, idx) => (
                    <Box key={file.name + idx} sx={{ mt: 1 }}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Chip
                          label={file.name}
                          sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}
                          onDelete={() => setNewLessonAudioFiles(files => ({
                            ...files,
                            [addLessonModuleId]: files[addLessonModuleId].filter((_, i) => i !== idx)
                          }))}
                        />
                      </Stack>
                      {/* Audio preview */}
                      <Box sx={{ mt: 1 }}>
                        <audio
                          src={uploadService.getFileUrl(file.url)}
                          controls
                          style={{ width: '100%', maxWidth: 300, borderRadius: 6, border: '1px solid #eee' }}
                        />
                        {file.storagePath && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                            Location: {file.storagePath}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  ))}
                  {/* Upload Audio (if less than 5) */}
                  {(newLessonAudioFiles[addLessonModuleId]?.length || 0) < 5 && (
                    <Button
                      variant="outlined"
                      component="label"
                      size="small"
                      sx={{ mt: 1 }}
                    >
                      {uploading[`audio-${addLessonModuleId}`] ? 'Uploading...' : 'Upload Audio'}
                      <input
                        type="file"
                        hidden
                        accept="audio/*"
                        disabled={uploading[`audio-${addLessonModuleId}`]}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          
                          if (file.size > 10 * 1024 * 1024) {
                            showError('Audio file exceeds 10MB limit');
                            e.target.value = '';
                            return;
                          }
                          
                          setUploading(upload => ({ ...upload, [`audio-${addLessonModuleId}`]: true }));
                          
                          try {
                            const response = await uploadService.uploadAudio(file);
                            if (response.success && response.data) {
                              const fileData = Array.isArray(response.data) ? response.data[0] : response.data;
                              setNewLessonAudioFiles(files => ({
                                ...files,
                                [addLessonModuleId]: [...(files[addLessonModuleId] || []), {
                                  url: fileData.url,
                                  name: fileData.originalName,
                                  size: fileData.size,
                                  storagePath: fileData.path
                                }]
                              }));
                              success('Audio file uploaded successfully!');
                            }
                          } catch (err: any) {
                            showError(err.response?.data?.message || 'Failed to upload audio');
                          } finally {
                            setUploading(upload => ({ ...upload, [`audio-${addLessonModuleId}`]: false }));
                            e.target.value = '';
                          }
                        }}
                      />
                    </Button>
                  )}
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    Max 5 audio files. Only audio files (MP3, WAV, etc.). Max size 10MB each.
                  </Typography>
                </>
              )}
              {/* Live Lesson Specific Fields */}
              {newLessonInputs[addLessonModuleId]?.type === 'Live' && (
                <>
                  <TextField
                    size="small"
                    label="Start Date and Time"
                    type="datetime-local"
                    value={newLessonLiveFields[addLessonModuleId]?.startDateTime || ''}
                    onChange={e => setNewLessonLiveFields(fields => ({
                      ...fields,
                      [addLessonModuleId]: {
                        ...fields[addLessonModuleId],
                        startDateTime: e.target.value
                      }
                    }))}
                    sx={{ mr: 1, width: 220 }}
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    size="small"
                    label="Duration (minutes)"
                    type="number"
                    value={newLessonLiveFields[addLessonModuleId]?.duration || ''}
                    onChange={e => setNewLessonLiveFields(fields => ({
                      ...fields,
                      [addLessonModuleId]: {
                        ...fields[addLessonModuleId],
                        duration: e.target.value
                      }
                    }))}
                    sx={{ mr: 1, width: 220 }}
                  />
                  <FormControl size="small" sx={{ minWidth: 180 }}>
                    <InputLabel>Virtual Meeting Link</InputLabel>
                    <Select
                      value={newLessonLiveFields[addLessonModuleId]?.meetingLink || ''}
                      onChange={e => setNewLessonLiveFields(fields => ({
                        ...fields,
                        [addLessonModuleId]: {
                          ...fields[addLessonModuleId],
                          meetingLink: e.target.value,
                          customLink: fields[addLessonModuleId]?.customLink || ''
                        }
                      }))}
                      label="Virtual Meeting Link"
                    >
                      <MenuItem value="Google Meet">Google Meet</MenuItem>
                      <MenuItem value="Zoom">Zoom</MenuItem>
                      <MenuItem value="Webex">Webex</MenuItem>
                      <MenuItem value="Custom Link">Custom</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    size="small"
                    label={meetingLinkMeta[newLessonLiveFields[addLessonModuleId]?.meetingLink || 'Custom Link'].label}
                    value={newLessonLiveFields[addLessonModuleId]?.customLink || ''}
                    onChange={e => setNewLessonLiveFields(fields => ({
                      ...fields,
                      [addLessonModuleId]: {
                        ...fields[addLessonModuleId],
                        customLink: e.target.value
                      }
                    }))}
                    sx={{ mr: 1, width: 220 }}
                    placeholder={meetingLinkMeta[newLessonLiveFields[addLessonModuleId]?.meetingLink || 'Custom Link'].placeholder}
                  />
                </>
              )}
              {/* Action Buttons */}
              <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  onClick={() => {
                    handleAddLesson(addLessonModuleId);
                    // Close the form after adding
                    setAddLessonModuleId(null);
                  }}
                  disabled={!newLessonInputs[addLessonModuleId]?.title?.trim()}
                >
                  Save Lesson
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setAddLessonModuleId(null);
                    setNewLessonInputs(inputs => ({ ...inputs, [addLessonModuleId]: { title: '', type: lessonTypes[0] } }));
                    setNewLessonDescriptions(descs => ({ ...descs, [addLessonModuleId]: '' }));
                    setNewLessonResources(res => ({ ...res, [addLessonModuleId]: [] }));
                    setNewLessonVideoPairs(pairs => ({ ...pairs, [addLessonModuleId]: [] }));
                    setNewLessonAudioFiles(files => ({ ...files, [addLessonModuleId]: [] }));
                    setNewLessonPreClassMessages(msgs => ({ ...msgs, [addLessonModuleId]: '' }));
                    setNewLessonPostClassMessages(msgs => ({ ...msgs, [addLessonModuleId]: '' }));
                    setNewLessonLiveFields(fields => ({ ...fields, [addLessonModuleId]: { startDateTime: '', duration: '', meetingLink: '', documents: [] } }));
                    setNewQuizQuestions([{
                      id: 'q-1',
                      question: '',
                      type: 'single',
                      options: [
                        { id: 'opt-1', text: 'Option 1', isCorrect: false },
                        { id: 'opt-2', text: 'Option 2', isCorrect: true }
                      ],
                    }]);
                  }}
                >
                  Cancel
                </Button>
              </Stack>
            </Stack>
          </Paper>
        ) : selectedModuleId ? (
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 2, background: '#fff' }}>
            <Typography variant="h6" fontWeight={700} color="#6C63FF" mb={2}>
              {selectedModuleId === 'new' ? 'Add New Module' : 'Edit Module'}
            </Typography>
            <Stack spacing={2}>
              <TextField
                label="Module Title"
                value={selectedModuleId === 'new' ? newModuleTitle : modules.find(m => m.id === selectedModuleId)?.title || ''}
                onChange={e => selectedModuleId === 'new' ? setNewModuleTitle(e.target.value) : handleEditModule(selectedModuleId, e.target.value)}
                size="small"
                autoFocus
              />
              {selectedModuleId === 'new' && (
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="contained"
                    onClick={handleAddModule}
                    disabled={!newModuleTitle.trim()}
                  >
                    Add Module
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setSelectedModuleId(null);
                      setNewModuleTitle('');
                    }}
                  >
                    Cancel
                  </Button>
                </Stack>
              )}
            </Stack>
          </Paper>
        ) : selectedLessonId ? (
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 2, background: '#fff' }}>
            <Typography variant="h6" fontWeight={700} color="#6C63FF" mb={2}>
              Edit Lesson
            </Typography>
            <Stack spacing={2}>
              <FormControl size="small" sx={{ minWidth: 100 }}>
                <InputLabel id="edit-lesson-type-label">Lesson Type</InputLabel>
                <Select
                  labelId="edit-lesson-type-label"
                  label="Lesson Type"
                  value={lessonInput?.type || lessonTypes[0]}
                  onChange={e => setNewLessonInputs(inputs => ({ ...inputs, [selectedLessonId]: { ...(inputs[selectedLessonId] || { title: '' }), type: e.target.value } }))}
                >
                  {lessonTypes.map(type => (
                    <MenuItem key={type} value={type}>
                      <ListItemIcon>{lessonTypeIcons[type]}</ListItemIcon>
                      <ListItemText primary={type} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Title"
                value={lessonInput?.title || ''}
                onChange={e => setNewLessonInputs(inputs => ({ ...inputs, [selectedLessonId]: { ...(inputs[selectedLessonId] || { type: lessonTypes[0] }), title: e.target.value } }))}
                size="small"
              />
              <TextField
                size="small"
                label="Description"
                value={lessonDescription}
                onChange={e => setNewLessonDescriptions(descs => ({ ...descs, [selectedLessonId]: e.target.value }))}
                sx={{ width: '100%' }}
                multiline
                minRows={2}
              />
              {/* Pre/Post Class Messages */}
              {['Video', 'Text', 'Quiz', 'Assignment', 'Live', 'Audio'].includes(lessonInput?.type || '') && (
                <>
                  <TextField
                    size="small"
                    label="Pre Class Message"
                    value={lessonPreClassMessage}
                    onChange={e => setNewLessonPreClassMessages(msgs => ({ ...msgs, [selectedLessonId]: e.target.value }))}
                    sx={{ width: '100%' }}
                    multiline
                    minRows={1}
                  />
                  <TextField
                    size="small"
                    label="Post Class Message"
                    value={lessonPostClassMessage}
                    onChange={e => setNewLessonPostClassMessages(msgs => ({ ...msgs, [selectedLessonId]: e.target.value }))}
                    sx={{ width: '100%' }}
                    multiline
                    minRows={1}
                  />
                </>
              )}
              {/* Quiz Question Editor */}
              {lessonInput?.type === 'Quiz' && (
                <QuizQuestionEditor value={editQuizQuestions} onChange={setEditQuizQuestions} />
              )}
              {/* Assignment Fields */}
              {lessonInput?.type === 'Assignment' && (
                <Stack spacing={2}>
                  <TextField
                    size="small"
                    label="Instructions"
                    value={editAssignmentFields?.instructions || ''}
                    onChange={e => setEditAssignmentFields(fields => ({
                      ...fields,
                      instructions: e.target.value
                    }))}
                    sx={{ width: '100%' }}
                    multiline
                    minRows={3}
                    placeholder="Enter assignment instructions for students..."
                  />
                  <FormControl size="small" sx={{ minWidth: 200 }}>
                    <InputLabel>Submission Type</InputLabel>
                    <Select
                      value={editAssignmentFields?.submissionType || 'both'}
                      label="Submission Type"
                      onChange={e => setEditAssignmentFields(fields => ({
                        ...fields,
                        submissionType: e.target.value as 'text' | 'file' | 'both'
                      }))}
                    >
                      <MenuItem value="text">Text Only</MenuItem>
                      <MenuItem value="file">File Only</MenuItem>
                      <MenuItem value="both">Text & File</MenuItem>
                    </Select>
                  </FormControl>
                  {(editAssignmentFields?.submissionType === 'file' || editAssignmentFields?.submissionType === 'both') && (
                    <>
                      <TextField
                        size="small"
                        label="Max File Size (MB)"
                        type="number"
                        value={editAssignmentFields?.maxFileSize || 10}
                        onChange={e => setEditAssignmentFields(fields => ({
                          ...fields,
                          maxFileSize: parseInt(e.target.value) || 10
                        }))}
                        inputProps={{ min: 1, max: 100 }}
                        sx={{ width: '100%' }}
                      />
                      <TextField
                        size="small"
                        label="Allowed File Types (comma-separated, e.g., .pdf,.doc,.docx)"
                        value={(editAssignmentFields?.allowedFileTypes || []).join(',')}
                        onChange={e => setEditAssignmentFields(fields => ({
                          ...fields,
                          allowedFileTypes: e.target.value.split(',').map(t => t.trim()).filter(t => t)
                        }))}
                        placeholder=".pdf, .doc, .docx, .txt"
                        sx={{ width: '100%' }}
                        helperText="Enter file extensions separated by commas (e.g., .pdf, .doc, .docx)"
                      />
                    </>
                  )}
                </Stack>
              )}
              {/* Resource Upload */}
              <Box>
                <Button
                  variant="outlined"
                  component="label"
                  size="small"
                  sx={{ mr: 1 }}
                  disabled={(lessonResources?.length || 0) >= 10 || uploading[`resource-${selectedLessonId}`]}
                  startIcon={uploading[`resource-${selectedLessonId}`] ? <CircularProgress size={16} /> : null}
                >
                  {uploading[`resource-${selectedLessonId}`] ? 'Uploading...' : 'Upload Resources'}
                  <input
                    type="file"
                    multiple
                    hidden
                    accept=".pdf,.doc,.docx,.ppt,.pptx,image/*"
                    disabled={uploading[`resource-${selectedLessonId}`]}
                    onChange={async (e) => {
                      const files = Array.from(e.target.files || []);
                      const prevFiles = lessonResources || [];
                      
                      if (prevFiles.length + files.length > 10) {
                        setResourceUploadErrors(errs => ({ ...errs, [selectedLessonId]: 'Cannot upload more than 10 resources.' }));
                        e.target.value = '';
                        return;
                      }
                      
                      setUploading(upload => ({ ...upload, [`resource-${selectedLessonId}`]: true }));
                      setResourceUploadErrors(errs => ({ ...errs, [selectedLessonId]: '' })); // Clear previous errors
                      
                      try {
                        const uploadedFiles: Array<{ url: string, name: string, size: number }> = [];
                        const errors: string[] = [];
                        
                        for (const file of files) {
                          if (file.size > 10 * 1024 * 1024) {
                            errors.push(`File ${file.name} exceeds 10MB.`);
                            continue;
                          }
                          
                          try {
                            const response = await uploadService.uploadResource(file);
                            if (response.success && response.data) {
                              const fileData = Array.isArray(response.data) ? response.data[0] : response.data;
                              uploadedFiles.push({
                                url: fileData.url,
                                name: fileData.originalName,
                                size: fileData.size
                              });
                            }
                          } catch (fileError: any) {
                            errors.push(`Failed to upload ${file.name}: ${fileError.response?.data?.message || fileError.message}`);
                          }
                        }
                        
                        // Update resources state with uploaded files
                        if (uploadedFiles.length > 0) {
                          setNewLessonResources(res => ({
                            ...res,
                            [selectedLessonId]: [...prevFiles, ...uploadedFiles]
                          }));
                          success(`${uploadedFiles.length} resource file(s) uploaded successfully!`);
                        }
                        
                        // Show errors if any
                        if (errors.length > 0) {
                          setResourceUploadErrors(errs => ({ ...errs, [selectedLessonId]: errors.join(' ') }));
                          if (uploadedFiles.length === 0) {
                            showError(errors.join(' '));
                          }
                        }
                      } catch (err: any) {
                        const errorMsg = err.response?.data?.message || 'Failed to upload resource files';
                        setResourceUploadErrors(errs => ({ ...errs, [selectedLessonId]: errorMsg }));
                        showError(errorMsg);
                      } finally {
                        setUploading(upload => ({ ...upload, [`resource-${selectedLessonId}`]: false }));
                        e.target.value = '';
                      }
                    }}
                  />
                </Button>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, mt: 1 }}>
                  Max 10 files. Only PDF, PPT, DOC, DOCX, and images. Max size 10MB each.
                </Typography>
                {resourceUploadErrors[selectedLessonId] && (
                  <Typography color="error" variant="caption" sx={{ display: 'block', mb: 1 }}>
                    {resourceUploadErrors[selectedLessonId]}
                  </Typography>
                )}
                {/* Show uploaded resources */}
                {(lessonResources || []).length > 0 && (
                  <Box sx={{ mt: 1, mb: 1 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                      Uploaded Files ({lessonResources?.length || 0}):
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
                      {(lessonResources || []).map((file, idx) => (
                        <Chip
                          key={file.url + idx}
                          label={file.name}
                          color="success"
                          size="small"
                          onDelete={() => setNewLessonResources(res => ({
                            ...res,
                            [selectedLessonId]: (res[selectedLessonId] || []).filter((_, i) => i !== idx)
                          }))}
                          sx={{ 
                            maxWidth: 200,
                            '& .MuiChip-label': {
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }
                          }}
                        />
                      ))}
                    </Stack>
                  </Box>
                )}
              </Box>
              {/* Video Upload (if type is Video) */}
              {(lessonInput?.type === 'Video') && (
                <>
                  {/* Show video-thumbnail pairs */}
                  {(lessonVideos || []).map((pair, idx) => (
                    <Box key={pair.video.name + idx} sx={{ mt: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                      {/* Video Section */}
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                          Video:
                        </Typography>
                        <Chip
                          label={pair.video.name}
                          color="primary"
                          sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}
                          onDelete={() => setNewLessonVideoPairs(pairs => ({
                            ...pairs,
                            [selectedLessonId]: (pairs[selectedLessonId] || []).filter((_, i) => i !== idx)
                          }))}
                        />
                        {pair.video?.url && (
                          <Box sx={{ mt: 1 }}>
                            <video
                              src={uploadService.getFileUrl(pair.video.url)}
                              controls
                              style={{ maxWidth: 300, maxHeight: 200, borderRadius: 6, border: '1px solid #eee' }}
                              onError={(e) => {
                                console.error('Error loading video:', pair.video.url);
                                (e.target as HTMLVideoElement).style.display = 'none';
                              }}
                            />
                          </Box>
                        )}
                      </Box>
                      
                      {/* Thumbnail Section */}
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                          Thumbnail:
                        </Typography>
                        {pair.thumbnail && pair.thumbnail.url ? (
                          <Box>
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                              <Chip
                                label={pair.thumbnail.name}
                                color="success"
                                size="small"
                                sx={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis' }}
                                onDelete={() => {
                                  const updatedPairs = [...(lessonVideos || [])];
                                  updatedPairs[idx] = { ...updatedPairs[idx], thumbnail: null };
                                  setNewLessonVideoPairs(pairs => ({ ...pairs, [selectedLessonId]: updatedPairs }));
                                }}
                              />
                            </Stack>
                            <Box
                              sx={{
                                width: 150,
                                height: 100,
                                border: '1px solid #e0e0e0',
                                borderRadius: 1,
                                overflow: 'hidden',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: '#f5f5f5'
                              }}
                            >
                              <img
                                src={uploadService.getFileUrl(pair.thumbnail.url)}
                                alt="Thumbnail Preview"
                                style={{ 
                                  maxWidth: '100%', 
                                  maxHeight: '100%', 
                                  objectFit: 'cover',
                                  width: '100%',
                                  height: '100%'
                                }}
                                onError={(e) => {
                                  console.error('Error loading thumbnail:', pair.thumbnail?.url);
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            </Box>
                          </Box>
                        ) : (
                          <Button
                            variant="outlined"
                            component="label"
                            size="small"
                            sx={{ minWidth: 120 }}
                          >
                            {uploading[`thumbnail-${selectedLessonId}-${idx}`] ? 'Uploading...' : 'Upload Thumbnail'}
                            <input
                              type="file"
                              hidden
                              accept="image/*"
                              disabled={uploading[`thumbnail-${selectedLessonId}-${idx}`]}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                
                                setUploading(upload => ({ ...upload, [`thumbnail-${selectedLessonId}-${idx}`]: true }));
                                
                                (async () => {
                                  try {
                                    const response = await uploadService.uploadThumbnail(file);
                                    if (response.success && response.data) {
                                      const fileData = Array.isArray(response.data) ? response.data[0] : response.data;
                                      const updatedPairs = [...(lessonVideos || [])];
                                      updatedPairs[idx] = { ...updatedPairs[idx], thumbnail: { url: fileData.url, name: fileData.originalName } };
                                      setNewLessonVideoPairs(pairs => ({ ...pairs, [selectedLessonId]: updatedPairs }));
                                      success('Thumbnail uploaded successfully!');
                                    }
                                  } catch (error: any) {
                                    showError(error.response?.data?.message || 'Failed to upload thumbnail');
                                  } finally {
                                    setUploading(upload => ({ ...upload, [`thumbnail-${selectedLessonId}-${idx}`]: false }));
                                    if (e.target) {
                                      (e.target as HTMLInputElement).value = '';
                                    }
                                  }
                                })();
                              }}
                            />
                          </Button>
                        )}
                      </Box>
                    </Box>
                  ))}
                  <Button
                    variant="outlined"
                    component="label"
                    size="small"
                    disabled={(lessonVideos?.length || 0) >= 3}
                  >
                    {uploading[`video-${selectedLessonId}`] ? 'Uploading...' : 'Upload Video'}
                    <input
                      type="file"
                      hidden
                      accept="video/*"
                      disabled={uploading[`video-${selectedLessonId}`]}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        
                        if (file.size > 100 * 1024 * 1024) {
                          showError('Video file exceeds 100MB limit');
                          e.target.value = '';
                          return;
                        }
                        
                        setUploading(upload => ({ ...upload, [`video-${selectedLessonId}`]: true }));
                        
                        try {
                          const response = await uploadService.uploadVideo(file);
                          if (response.success && response.data) {
                            const fileData = Array.isArray(response.data) ? response.data[0] : response.data;
                            setNewLessonVideoPairs(pairs => ({
                              ...pairs,
                              [selectedLessonId]: [...(pairs[selectedLessonId] || []), { 
                                video: { url: fileData.url, name: fileData.originalName, size: fileData.size }, 
                                thumbnail: null 
                              }]
                            }));
                            success('Video uploaded successfully!');
                          }
                        } catch (err: any) {
                          showError(err.response?.data?.message || 'Failed to upload video');
                        } finally {
                          setUploading(upload => ({ ...upload, [`video-${selectedLessonId}`]: false }));
                          e.target.value = '';
                        }
                      }}
                    />
                  </Button>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    Max 3 videos. Only video files. Max size 100MB each.
                  </Typography>
                </>
              )}
              {/* Audio Upload (if type is Audio) */}
              {(lessonInput?.type === 'Audio') && (
                <>
                  {(lessonAudioFiles || []).map((file, idx) => (
                    <Box key={file.url + idx} sx={{ mt: 1 }}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Chip
                          label={file.name}
                          sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}
                          onDelete={() => setNewLessonAudioFiles(files => ({
                            ...files,
                            [selectedLessonId]: (files[selectedLessonId] || []).filter((_, i) => i !== idx)
                          }))}
                        />
                      </Stack>
                      {/* Audio preview */}
                      <Box sx={{ mt: 1 }}>
                        <audio
                          src={uploadService.getFileUrl(file.url)}
                          controls
                          style={{ width: '100%', maxWidth: 300, borderRadius: 6, border: '1px solid #eee' }}
                        />
                        {file.storagePath && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                            Location: {file.storagePath}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  ))}
                  <Button
                    variant="outlined"
                    component="label"
                    size="small"
                    disabled={(lessonAudioFiles?.length || 0) >= 5}
                  >
                      {uploading[`audio-${selectedLessonId}`] ? 'Uploading...' : 'Upload Audio'}
                      <input
                        type="file"
                        hidden
                        accept="audio/*"
                        disabled={uploading[`audio-${selectedLessonId}`]}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          
                          if (file.size > 10 * 1024 * 1024) {
                            showError('Audio file exceeds 10MB limit');
                            e.target.value = '';
                            return;
                          }
                          
                          setUploading(upload => ({ ...upload, [`audio-${selectedLessonId}`]: true }));
                          
                          try {
                            const response = await uploadService.uploadAudio(file);
                            if (response.success && response.data) {
                              const fileData = Array.isArray(response.data) ? response.data[0] : response.data;
                              setNewLessonAudioFiles(files => ({
                                ...files,
                                [selectedLessonId]: [...(files[selectedLessonId] || []), {
                                  url: fileData.url,
                                  name: fileData.originalName,
                                  size: fileData.size,
                                  storagePath: fileData.path
                                }]
                              }));
                              success('Audio file uploaded successfully!');
                            }
                          } catch (err: any) {
                            showError(err.response?.data?.message || 'Failed to upload audio');
                          } finally {
                            setUploading(upload => ({ ...upload, [`audio-${selectedLessonId}`]: false }));
                            e.target.value = '';
                          }
                        }}
                      />
                  </Button>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    Max 5 audio files. Only audio files (MP3, WAV, etc.). Max size 10MB each.
                  </Typography>
                </>
              )}
              {/* Live Lesson Specific Fields */}
              {lessonInput?.type === 'Live' && (
                <>
                  <TextField
                    size="small"
                    label="Start Date and Time"
                    type="datetime-local"
                    value={lessonLiveFields?.startDateTime || ''}
                    onChange={e => setNewLessonLiveFields(fields => ({
                      ...fields,
                      [selectedLessonId]: {
                        ...(fields[selectedLessonId] || { startDateTime: '', duration: '', meetingLink: '', documents: [] }),
                        startDateTime: e.target.value
                      }
                    }))}
                    sx={{ mr: 1, width: 220 }}
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    size="small"
                    label="Duration (minutes)"
                    type="number"
                    value={lessonLiveFields?.duration || ''}
                    onChange={e => setNewLessonLiveFields(fields => ({
                      ...fields,
                      [selectedLessonId]: {
                        ...(fields[selectedLessonId] || { startDateTime: '', duration: '', meetingLink: '', documents: [] }),
                        duration: e.target.value
                      }
                    }))}
                    sx={{ mr: 1, width: 220 }}
                  />
                  <FormControl size="small" sx={{ minWidth: 180 }}>
                    <InputLabel>Virtual Meeting Link</InputLabel>
                    <Select
                      value={lessonLiveFields?.meetingLink || ''}
                      onChange={e => setNewLessonLiveFields(fields => ({
                        ...fields,
                        [selectedLessonId]: {
                          ...(fields[selectedLessonId] || { startDateTime: '', duration: '', meetingLink: '', documents: [] }),
                          meetingLink: e.target.value,
                          customLink: fields[selectedLessonId]?.customLink || ''
                        }
                      }))}
                      label="Virtual Meeting Link"
                    >
                      <MenuItem value="Google Meet">Google Meet</MenuItem>
                      <MenuItem value="Zoom">Zoom</MenuItem>
                      <MenuItem value="Webex">Webex</MenuItem>
                      <MenuItem value="Custom Link">Custom</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    size="small"
                    label={meetingLinkMeta[lessonLiveFields?.meetingLink || 'Custom Link'].label}
                    value={lessonLiveFields?.customLink || ''}
                    onChange={e => setNewLessonLiveFields(fields => ({
                      ...fields,
                      [selectedLessonId]: {
                        ...(fields[selectedLessonId] || { startDateTime: '', duration: '', meetingLink: '', documents: [] }),
                        customLink: e.target.value
                      }
                    }))}
                    sx={{ mr: 1, width: 220 }}
                    placeholder={meetingLinkMeta[lessonLiveFields?.meetingLink || 'Custom Link'].placeholder}
                  />
                </>
              )}
              {/* Action Buttons */}
              <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  onClick={() => {
                    const lesson = modules.flatMap(m => m.lessons).find(l => l.id === selectedLessonId);
                    if (lesson && lessonInput) {
                      const modIdx = modules.findIndex(m => m.lessons.some(l => l.id === selectedLessonId));
                      handleEditLesson(modIdx, selectedLessonId, {
                        title: lessonInput.title || '',
                        type: lessonInput.type || lessonTypes[0],
                        description: lessonDescription,
                        preClassMessage: lessonPreClassMessage,
                        postClassMessage: lessonPostClassMessage,
                        resources: lessonResources,
                        videos: lessonVideos,
                        audioFiles: lessonAudioFiles,
                        quizQuestions: lessonInput.type === 'Quiz' ? editQuizQuestions : undefined,
                        liveFields: lessonInput.type === 'Live' ? lessonLiveFields : undefined,
                        assignmentFields: lessonInput.type === 'Assignment' ? editAssignmentFields : undefined
                      });
                    }
                    setSelectedLessonId(null);
                  }}
                  disabled={!lessonInput?.title?.trim()}
                >
                  Save Lesson
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setSelectedLessonId(null);
                    // Clear edit form data
                    setNewLessonInputs(inputs => {
                      const newInputs = { ...inputs };
                      delete newInputs[selectedLessonId];
                      return newInputs;
                    });
                    setNewLessonDescriptions(descs => {
                      const newDescs = { ...descs };
                      delete newDescs[selectedLessonId];
                      return newDescs;
                    });
                    setNewLessonPreClassMessages(msgs => {
                      const newMsgs = { ...msgs };
                      delete newMsgs[selectedLessonId];
                      return newMsgs;
                    });
                    setNewLessonPostClassMessages(msgs => {
                      const newMsgs = { ...msgs };
                      delete newMsgs[selectedLessonId];
                      return newMsgs;
                    });
                    setNewLessonResources(res => {
                      const newRes = { ...res };
                      delete newRes[selectedLessonId];
                      return newRes;
                    });
                    setNewLessonVideoPairs(pairs => {
                      const newPairs = { ...pairs };
                      delete newPairs[selectedLessonId];
                      return newPairs;
                    });
                    setNewLessonAudioFiles(files => {
                      const newFiles = { ...files };
                      delete newFiles[selectedLessonId];
                      return newFiles;
                    });
                    setNewLessonLiveFields(fields => {
                      const newFields = { ...fields };
                      delete newFields[selectedLessonId];
                      return newFields;
                    });
                    setEditQuizQuestions([{
                      id: 'q-1',
                      question: '',
                      type: 'single',
                      options: [
                        { id: 'opt-1', text: 'Option 1', isCorrect: false },
                        { id: 'opt-2', text: 'Option 2', isCorrect: true }
                      ],
                    }]);
                  }}
                >
                  Cancel
                </Button>
              </Stack>
            </Stack>
          </Paper>
        ) : (
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 2, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Select a module or lesson to edit
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Click "Edit" on any module or lesson to modify its details
              </Typography>
            </Box>
          </Paper>
        )}
      </Box>
    </Box>
  );
};

export default CurriculumStep; 