// Course-related TypeScript interfaces

export interface Course {
  id: string;
  name: string;
  subtitle?: string;
  description: string;
  coverImage?: string;
  instructor: {
    id: string;
    name: string;
    avatar?: string;
  };
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'NA';
  language: string;
  tags: string[];
  visibility: 'Public' | 'Unlisted' | 'Private';
  status: 'Draft' | 'Published' | 'Live & Selling' | 'Paused' | 'Archived';
  createdAt: string;
  lastUpdated: string;
  duration: number; // in minutes
  modules: Module[];
  certificateEnabled: boolean;
  dripEnabled: boolean;
  listedPrice: { [currency: string]: number };
  sellingPrice: { [currency: string]: number };
  enrollments: number;
  completionRate: number;
}

export interface Module {
  id: string;
  title: string;
  description?: string;
  order: number;
  lessons: Lesson[];
  isUnlocked: boolean;
  unlockDate?: string;
}

export interface Lesson {
  id: string;
  title: string;
  description?: string;
  type: 'Video' | 'Text' | 'Audio' | 'Quiz' | 'Assignment' | 'Live';
  duration: number; // in minutes
  order: number;
  isUnlocked: boolean;
  unlockDate?: string;
  content: LessonContent;
  resources: Resource[];
  isCompleted: boolean;
  completedAt?: string;
  watchTime?: number; // in seconds
}

export interface LessonAudioFile {
  url: string;
  name: string;
  size?: number;
  storagePath?: string;
  duration?: number;
}

export interface LessonContent {
  // Video content
  videoUrl?: string;
  thumbnailUrl?: string;
  transcript?: string;
  
  // Text content
  textContent?: string;
  
  // Audio content
  audioUrl?: string;
  audioFiles?: LessonAudioFile[];
  waveformData?: number[];
  
  // Quiz content
  questions?: QuizQuestion[];
  timeLimit?: number; // in minutes
  passingScore?: number; // percentage
  
  // Assignment content
  instructions?: string;
  submissionType?: 'text' | 'file' | 'both';
  maxFileSize?: number; // in MB
  allowedFileTypes?: string[];
  
  // Live content
  meetingLink?: string;
  meetingPlatform?: 'Google Meet' | 'Zoom' | 'Webex' | 'Custom Link';
  startDateTime?: string;
  endDateTime?: string;
  preClassMessage?: string;
  postClassMessage?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'text';
  options?: string[];
  correctAnswer: string | number;
  explanation?: string;
  points: number;
}

export interface Resource {
  id: string;
  name: string;
  type: 'document' | 'image' | 'video' | 'audio' | 'archive' | 'other';
  url: string;
  size: number; // in bytes
  downloadCount: number;
}

export interface Progress {
  courseId: string;
  userId: string;
  overallProgress: number; // percentage
  completedLessons: string[];
  timeSpent: number; // in minutes
  lastAccessed: string;
  enrolledAt: string;
  completedAt?: string;
  certificateEarned?: boolean;
  certificateUrl?: string;
}

export interface Comment {
  id: string;
  lessonId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  parentId?: string; // for replies
  createdAt: string;
  updatedAt: string;
  likes: number;
  isInstructor: boolean;
  replies: Comment[];
}

export interface Note {
  id: string;
  lessonId: string;
  userId: string;
  content: string;
  timestamp?: number; // for video/audio notes
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

export interface LiveSession {
  id: string;
  lessonId: string;
  title: string;
  description?: string;
  startDateTime: string;
  endDateTime: string;
  meetingLink: string;
  meetingPlatform: string;
  maxParticipants?: number;
  currentParticipants: number;
  status: 'scheduled' | 'live' | 'ended' | 'cancelled';
  preClassMessage?: string;
  postClassMessage?: string;
  resources: Resource[];
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  userId: string;
  textSubmission?: string;
  fileSubmissions: FileSubmission[];
  submittedAt: string;
  status: 'pending' | 'submitted' | 'graded';
  grade?: number;
  feedback?: string;
  gradedAt?: string;
  gradedBy?: string;
}

export interface FileSubmission {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  uploadedAt: string;
}

export interface QuizResult {
  id: string;
  quizId: string;
  userId: string;
  answers: { [questionId: string]: string | number | boolean };
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number; // in seconds
  submittedAt: string;
  passed: boolean;
}

// Filter and search interfaces
export interface CourseFilters {
  category?: string;
  level?: string;
  language?: string;
  tags?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  duration?: {
    min: number;
    max: number;
  };
  certificateEnabled?: boolean;
  searchQuery?: string;
}

export interface CourseSearchResult {
  courses: Course[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// API response interfaces
export interface CourseListResponse {
  success: boolean;
  data: CourseSearchResult;
  message?: string;
}

export interface CourseDetailResponse {
  success: boolean;
  data: Course;
  message?: string;
}

export interface ProgressResponse {
  success: boolean;
  data: Progress;
  message?: string;
}

export interface EnrollmentResponse {
  success: boolean;
  data: {
    courseId: string;
    userId: string;
    enrolledAt: string;
  };
  message?: string;
}
