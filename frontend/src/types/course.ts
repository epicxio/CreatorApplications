// Course-related TypeScript interfaces

export interface Course {
  id: string;
  courseId?: string; // Formatted course ID like "C-ADM-0001"
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
  certificateTemplate?: string;
  /** URL of certificate template PDF (creator upload); used when issuing learner certificates */
  certificateTemplatePdfUrl?: string;
  certificateTitle?: string;
  certificateDescription?: string;
  certificateCompletionPercentage?: number;
  certificateApplicationLogoEnabled?: boolean;
  certificateApplicationLogo?: string;
  certificateSignatures?: Array<{
    _id?: string;
    name: string;
    designation: string;
    type: 'upload' | 'draw';
    image?: string;
    enabled?: boolean;
    isDefault?: boolean;
  }>;
  certificateCreatorLogo?: string;
  dripEnabled: boolean;
  dripMethods?: Array<{
    moduleId: string;
    method: 'immediate' | 'days' | 'date';
    action?: string | number;
    unlockDate?: string;
  }>;
  dripDisplayOption?: 'title' | 'titleAndLessons' | 'hide';
  dripHideUnlockDate?: boolean;
  dripSendCommunication?: boolean;
  listedPrice: { [currency: string]: number };
  sellingPrice: { [currency: string]: number };
  enrollments: number;
  completionRate: number;
  /** Creator-configured payment methods: { universal: { [method]: boolean }, USD: { ... }, INR: { ... } } */
  paymentMethods?: Record<string, { [key: string]: boolean }>;
  /** Which currencies are enabled for payments: { INR: true, USD: false, ... } */
  enabledCurrencies?: { [key: string]: boolean };
  requirePaymentBeforeAccess?: boolean;
  sendPaymentReceipts?: boolean;
  enableAutomaticInvoicing?: boolean;
  globalPricingEnabled?: boolean;
  currencySpecificPricingEnabled?: boolean;
  installmentsOn?: boolean;
  installmentPeriod?: number;
  numberOfInstallments?: number;
  bufferTime?: number;
  /** Step 5 Additional Details: course FAQs (creator-defined, shown to learners) */
  faqs?: Array<{ question: string; answer: string }>;
  affiliateActive?: boolean;
  affiliateRewardPercentage?: number;
  /** Course configuration (collections): when true, application watermark is removed from curriculum videos/documents. */
  watermarkRemovalEnabled?: boolean;
  /** Publish history: version, date/time, and snapshot of what was saved (for display and diff). */
  publishHistory?: Array<{
    version: number;
    publishedAt: string;
    snapshot?: PublishSnapshot;
  }>;
}

/** Snapshot of course state at publish time (for version history and diff). */
export interface PublishSnapshot {
  details?: { name: string; subtitle: string; description: string; category: string; level: string; language: string };
  curriculum?: { moduleCount: number; modules: Array<{ title: string; lessonCount: number }> };
  drip?: { dripEnabled: boolean; dripMethodCount: number; dripDisplayOption: string };
  certificate?: { certificateEnabled: boolean; certificateTitle: string };
  payment?: {
    listedPriceINR: number; listedPriceUSD: number;
    sellingPriceINR: number; sellingPriceUSD: number;
    installmentsOn: boolean;
  };
  additional?: {
    affiliateActive: boolean; affiliateRewardPercentage: number;
    watermarkRemovalEnabled: boolean; faqsCount: number;
  };
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
  certificateIssuedAt?: string;
  /** When the user first reached the certificate completion % (for display on certificate as "Completed on") */
  certificateEarnedAt?: string;
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

export interface CheckoutResponse {
  success: boolean;
  data: {
    orderId: string;
    courseId: string;
    userId: string;
    enrolledAt: string;
    alreadyEnrolled?: boolean;
  };
  message?: string;
}

/** Single affiliate code (creator view: list by course; affiliate view: my codes) */
export interface AffiliateCodeItem {
  affiliateCodeId: string;
  code: string;
  link: string;
  displayName?: string;
  status: 'active' | 'paused';
  clicks: number;
  conversions: number;
  earningsByCurrency: { [currency: string]: number };
  /** Creator view only */
  affiliateUserId?: string;
  affiliateName?: string;
  affiliateEmail?: string;
  createdAt?: string;
  /** My codes view only */
  courseId?: string;
  courseName?: string;
  courseCourseId?: string;
  affiliateRewardPercentage?: number;
}

export interface AffiliateCodesResponse {
  success: boolean;
  data: AffiliateCodeItem[];
  message?: string;
}

export interface CreateAffiliateCodeResponse {
  success: boolean;
  data: {
    affiliateCodeId: string;
    code: string;
    link: string;
    displayName?: string;
    conversions: number;
    earningsByCurrency: { [currency: string]: number };
  };
  message?: string;
}
