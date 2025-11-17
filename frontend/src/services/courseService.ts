import { 
  Course, 
  Module, 
  Lesson, 
  Progress, 
  Comment, 
  Note, 
  CourseFilters, 
  CourseSearchResult,
  CourseListResponse,
  CourseDetailResponse,
  ProgressResponse,
  EnrollmentResponse
} from '../types/course';
import api from './api';

// Mock course data based on the structure from CourseBuilderPage
const mockCourses: Course[] = [
  {
    id: '1',
    name: 'Motion Design 101',
    subtitle: 'Learn the fundamentals of motion graphics',
    description: 'A comprehensive course covering the basics of motion design, from keyframes to advanced animations. Perfect for beginners who want to create stunning visual content.',
    coverImage: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400&h=300&fit=crop',
    instructor: {
      id: 'instructor-1',
      name: 'Sarah Chen',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face'
    },
    category: 'Design',
    level: 'Beginner',
    language: 'English',
    tags: ['Motion Graphics', 'After Effects', 'Animation', 'Design'],
    visibility: 'Public',
    status: 'Live & Selling',
    createdAt: '2025-01-15T10:00:00Z',
    lastUpdated: '2025-01-20T12:00:00Z',
    duration: 480, // 8 hours
    modules: [
      {
        id: 'module-1',
        title: 'Introduction to Motion Design',
        description: 'Get started with the basics of motion design',
        order: 1,
        isUnlocked: true,
        lessons: [
          {
            id: 'lesson-1',
            title: 'Welcome to Motion Design',
            description: 'Introduction to the course and what you\'ll learn',
            type: 'Video',
            duration: 15,
            order: 1,
            isUnlocked: true,
            content: {
              videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
              thumbnailUrl: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400&h=300&fit=crop'
            },
            resources: [],
            isCompleted: false
          },
          {
            id: 'lesson-2',
            title: 'Understanding Keyframes',
            description: 'Learn the fundamental concept of keyframes in animation',
            type: 'Video',
            duration: 25,
            order: 2,
            isUnlocked: true,
            content: {
              videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
              thumbnailUrl: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400&h=300&fit=crop'
            },
            resources: [
              {
                id: 'resource-1',
                name: 'Keyframes Cheat Sheet',
                type: 'document',
                url: '/resources/keyframes-cheat-sheet.pdf',
                size: 1024000,
                downloadCount: 45
              }
            ],
            isCompleted: false
          },
          {
            id: 'lesson-3',
            title: 'Keyframes Quiz',
            description: 'Test your understanding of keyframes',
            type: 'Quiz',
            duration: 10,
            order: 3,
            isUnlocked: true,
            content: {
              questions: [
                {
                  id: 'q1',
                  question: 'What is a keyframe in animation?',
                  type: 'multiple-choice',
                  options: [
                    'A frame that contains no animation',
                    'A frame that defines the start or end of an animation',
                    'A frame that plays in slow motion',
                    'A frame that repeats infinitely'
                  ],
                  correctAnswer: 1,
                  explanation: 'A keyframe defines the start or end of an animation transition.',
                  points: 10
                }
              ],
              timeLimit: 10,
              passingScore: 70
            },
            resources: [],
            isCompleted: false
          }
        ]
      },
      {
        id: 'module-2',
        title: 'Advanced Techniques',
        description: 'Master advanced motion design techniques',
        order: 2,
        isUnlocked: true,
        lessons: [
          {
            id: 'lesson-4',
            title: 'Easing and Timing',
            description: 'Learn how to create smooth, natural animations',
            type: 'Video',
            duration: 30,
            order: 1,
            isUnlocked: true,
            content: {
              videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_3mb.mp4',
              thumbnailUrl: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400&h=300&fit=crop'
            },
            resources: [],
            isCompleted: false
          },
          {
            id: 'lesson-5',
            title: 'Live Session: Q&A with Instructor',
            description: 'Join our live Q&A session to ask questions',
            type: 'Live',
            duration: 60,
            order: 2,
            isUnlocked: true,
            content: {
              meetingLink: 'https://meet.google.com/abc-defg-hij',
              meetingPlatform: 'Google Meet',
              startDateTime: '2025-01-25T14:00:00Z',
              endDateTime: '2025-01-25T15:00:00Z',
              preClassMessage: 'Please prepare your questions about easing and timing!'
            },
            resources: [],
            isCompleted: false
          }
        ]
      }
    ],
    certificateEnabled: true,
    dripEnabled: false,
    listedPrice: { INR: 2000, USD: 25, EUR: 23 },
    sellingPrice: { INR: 1500, USD: 19, EUR: 17 },
    enrollments: 250,
    completionRate: 80
  },
  {
    id: '2',
    name: 'Web Development Bootcamp',
    subtitle: 'From Zero to Full-Stack Developer',
    description: 'Complete web development course covering HTML, CSS, JavaScript, React, Node.js, and more. Build real-world projects and land your first developer job.',
    coverImage: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop',
    instructor: {
      id: 'instructor-2',
      name: 'Mike Johnson',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
    },
    category: 'Technology',
    level: 'Beginner',
    language: 'English',
    tags: ['Web Development', 'JavaScript', 'React', 'Node.js', 'HTML', 'CSS'],
    visibility: 'Public',
    status: 'Live & Selling',
    createdAt: '2025-01-10T10:00:00Z',
    lastUpdated: '2025-01-18T15:30:00Z',
    duration: 1200, // 20 hours
    modules: [
      {
        id: 'module-1',
        title: 'HTML & CSS Fundamentals',
        description: 'Learn the building blocks of web development',
        order: 1,
        isUnlocked: true,
        lessons: [
          {
            id: 'lesson-1',
            title: 'Introduction to HTML',
            description: 'Understanding HTML structure and semantic elements',
            type: 'Video',
            duration: 45,
            order: 1,
            isUnlocked: true,
            content: {
              videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_4mb.mp4',
              thumbnailUrl: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop'
            },
            resources: [],
            isCompleted: false
          },
          {
            id: 'lesson-2',
            title: 'CSS Styling Basics',
            description: 'Learn how to style your HTML with CSS',
            type: 'Video',
            duration: 50,
            order: 2,
            isUnlocked: true,
            content: {
              videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4',
              thumbnailUrl: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop'
            },
            resources: [],
            isCompleted: false
          },
          {
            id: 'lesson-3',
            title: 'Build Your First Website',
            description: 'Create a complete website using HTML and CSS',
            type: 'Assignment',
            duration: 120,
            order: 3,
            isUnlocked: true,
            content: {
              instructions: 'Create a personal portfolio website using HTML and CSS. Include sections for About, Projects, and Contact.',
              submissionType: 'both',
              maxFileSize: 10,
              allowedFileTypes: ['.html', '.css', '.zip']
            },
            resources: [],
            isCompleted: false
          }
        ]
      }
    ],
    certificateEnabled: true,
    dripEnabled: true,
    listedPrice: { INR: 5000, USD: 60, EUR: 55 },
    sellingPrice: { INR: 4000, USD: 48, EUR: 44 },
    enrollments: 180,
    completionRate: 75
  },
  {
    id: '3',
    name: 'Digital Marketing Mastery',
    subtitle: 'Complete Guide to Online Marketing',
    description: 'Master digital marketing strategies including SEO, social media, email marketing, and paid advertising. Grow your business online.',
    coverImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
    instructor: {
      id: 'instructor-3',
      name: 'Emily Rodriguez',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face'
    },
    category: 'Marketing',
    level: 'Intermediate',
    language: 'English',
    tags: ['Digital Marketing', 'SEO', 'Social Media', 'Email Marketing', 'Analytics'],
    visibility: 'Public',
    status: 'Live & Selling',
    createdAt: '2025-01-05T10:00:00Z',
    lastUpdated: '2025-01-22T09:15:00Z',
    duration: 600, // 10 hours
    modules: [
      {
        id: 'module-1',
        title: 'Marketing Fundamentals',
        description: 'Understanding the basics of digital marketing',
        order: 1,
        isUnlocked: true,
        lessons: [
          {
            id: 'lesson-1',
            title: 'Introduction to Digital Marketing',
            description: 'Overview of digital marketing landscape and strategies',
            type: 'Text',
            duration: 20,
            order: 1,
            isUnlocked: true,
            content: {
              textContent: 'Digital marketing encompasses all marketing efforts that use an electronic device or the internet. Businesses leverage digital channels such as search engines, social media, email, and other websites to connect with current and prospective customers.'
            },
            resources: [],
            isCompleted: false
          },
          {
            id: 'lesson-2',
            title: 'Marketing Strategy Podcast',
            description: 'Listen to industry experts discuss marketing strategies',
            type: 'Audio',
            duration: 35,
            order: 2,
            isUnlocked: true,
            content: {
              audioUrl: 'https://sample-videos.com/zip/10/mp3/SampleAudio_0.4mb.mp3'
            },
            resources: [],
            isCompleted: false
          }
        ]
      }
    ],
    certificateEnabled: true,
    dripEnabled: false,
    listedPrice: { INR: 3000, USD: 35, EUR: 32 },
    sellingPrice: { INR: 2500, USD: 30, EUR: 27 },
    enrollments: 95,
    completionRate: 85
  }
];

// Mock progress data
const mockProgress: Progress[] = [
  {
    courseId: '1',
    userId: 'user-1',
    overallProgress: 25,
    completedLessons: ['lesson-1'],
    timeSpent: 15,
    lastAccessed: '2025-01-20T10:30:00Z',
    enrolledAt: '2025-01-15T10:00:00Z'
  }
];

// Mock comments data
const mockComments: Comment[] = [
  {
    id: 'comment-1',
    lessonId: 'lesson-1',
    userId: 'user-1',
    userName: 'John Doe',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    content: 'Great explanation! This really helped me understand keyframes.',
    createdAt: '2025-01-20T10:30:00Z',
    updatedAt: '2025-01-20T10:30:00Z',
    likes: 5,
    isInstructor: false,
    replies: []
  },
  {
    id: 'comment-2',
    lessonId: 'lesson-1',
    userId: 'instructor-1',
    userName: 'Sarah Chen',
    userAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
    content: 'Thank you! Feel free to ask if you have any questions.',
    parentId: 'comment-1',
    createdAt: '2025-01-20T11:00:00Z',
    updatedAt: '2025-01-20T11:00:00Z',
    likes: 2,
    isInstructor: true,
    replies: []
  }
];

class CourseService {
  // Get all courses with optional filtering (for course management page)
  async getCourses(filters?: CourseFilters, page: number = 1, limit: number = 10): Promise<CourseListResponse> {
    try {
      const params: any = {
        page,
        limit
      };

      if (filters) {
        if (filters.category) params.category = filters.category;
        if (filters.level) params.level = filters.level;
        if (filters.language) params.language = filters.language;
        if (filters.tags && filters.tags.length > 0) params.tags = filters.tags;
        if (filters.searchQuery) params.searchQuery = filters.searchQuery;
        if (filters.certificateEnabled !== undefined) params.certificateEnabled = filters.certificateEnabled.toString();
      }

      const response = await api.get('/courses/my-courses', { params });
      
      // Transform backend response to match frontend format
      const formattedCourses: Course[] = response.data.courses.map((course: any) => ({
        id: course.id,
        courseId: course.courseId, // Include courseId from backend
        name: course.name,
        subtitle: course.subtitle || '',
        description: course.description || '',
        coverImage: course.coverImage || '',
        instructor: {
          id: course.instructor?.id || course.instructor?._id || '',
          name: course.instructor?.name || '',
          avatar: course.instructor?.avatar || ''
        },
        category: course.category || '',
        level: (course.level || 'Beginner') as 'Beginner' | 'Intermediate' | 'Advanced',
        language: course.language || 'English',
        tags: course.tags || [],
        visibility: course.visibility as 'Public' | 'Unlisted' | 'Private',
        status: course.status as 'Draft' | 'Published' | 'Live & Selling' | 'Paused' | 'Archived',
        createdAt: course.createdAt,
        lastUpdated: course.lastUpdated,
        duration: course.duration || 0,
        modules: course.modules || [],
        certificateEnabled: course.certificateEnabled,
        dripEnabled: course.dripEnabled,
        listedPrice: course.listedPrice || { INR: 0, USD: 0, EUR: 0 },
        sellingPrice: course.sellingPrice || { INR: 0, USD: 0, EUR: 0 },
        enrollments: course.enrollments || 0,
        completionRate: course.completionRate || 0
      }));

      return {
        success: true,
        data: {
          courses: formattedCourses,
          total: response.data.total,
          page: response.data.page,
          limit: response.data.limit,
          hasMore: response.data.hasMore
        }
      };
    } catch (error: any) {
      console.error('Error fetching courses:', error);
      return {
        success: false,
        data: {
          courses: [],
          total: 0,
          page: 1,
          limit: 10,
          hasMore: false
        },
        message: error.response?.data?.message || 'Failed to fetch courses'
      };
    }
  }

  // Get course by ID
  async getCourse(courseId: string): Promise<CourseDetailResponse> {
    try {
      const response = await api.get(`/courses/${courseId}`);
      
      // Transform backend course to frontend format
      const courseData = response.data.data;
      const course: Course = {
        id: courseData._id || courseData.id,
        name: courseData.name,
        subtitle: courseData.subtitle || '',
        description: courseData.description || '',
        coverImage: courseData.coverImage || '',
        instructor: {
          id: courseData.instructor?._id || courseData.instructor?.id || '',
          name: courseData.instructor?.name || '',
          avatar: courseData.instructor?.avatar || ''
        },
        category: courseData.category || '',
        level: courseData.level || 'Beginner',
        language: courseData.language || 'English',
        tags: courseData.tags || [],
        visibility: courseData.visibility || 'Public',
        status: courseData.status || 'Draft',
        createdAt: courseData.createdAt || new Date().toISOString(),
        lastUpdated: courseData.lastUpdated || new Date().toISOString(),
        duration: courseData.duration || 0,
        modules: courseData.modules || [],
        certificateEnabled: courseData.certificateEnabled || false,
        dripEnabled: courseData.dripEnabled || false,
        listedPrice: courseData.listedPrice || { INR: 0, USD: 0, EUR: 0 },
        sellingPrice: courseData.sellingPrice || { INR: 0, USD: 0, EUR: 0 },
        enrollments: courseData.enrollments || 0,
        completionRate: courseData.completionRate || 0
      };

      return {
        success: true,
        data: course
      };
    } catch (error: any) {
      console.error('Error fetching course:', error);
      return {
        success: false,
        data: {} as Course,
        message: error.response?.data?.message || 'Failed to fetch course'
      };
    }
  }

  // Create new course (draft)
  async createCourse(courseData: Partial<Course>): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const response = await api.post('/courses', courseData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Course created successfully'
      };
    } catch (error: any) {
      console.error('Error creating course:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create course'
      };
    }
  }

  // Save course as draft (can be called from any step)
  async saveDraft(courseId: string | null, courseData: Partial<Course>): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const url = courseId ? `/courses/${courseId}/draft` : '/courses/draft';
      const response = await api.post(url, courseData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Draft saved successfully'
      };
    } catch (error: any) {
      console.error('Error saving draft:', error);
      
      // Handle network errors
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        return {
          success: false,
          message: 'Cannot connect to server. Please make sure the backend server is running on port 5001.'
        };
      }
      
      // Handle authentication errors
      if (error.response?.status === 401) {
        return {
          success: false,
          message: 'You are not authenticated. Please log in and try again.'
        };
      }
      
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to save draft'
      };
    }
  }

  // Update course
  async updateCourse(courseId: string, courseData: Partial<Course>): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const response = await api.put(`/courses/${courseId}`, courseData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Course updated successfully'
      };
    } catch (error: any) {
      console.error('Error updating course:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update course'
      };
    }
  }

  // Publish course
  async publishCourse(courseId: string, status: string = 'Live & Selling'): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const response = await api.post(`/courses/${courseId}/publish`, { status });
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Course published successfully'
      };
    } catch (error: any) {
      console.error('Error publishing course:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to publish course'
      };
    }
  }

  // Delete course
  async deleteCourse(courseId: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await api.delete(`/courses/${courseId}`);
      return {
        success: true,
        message: response.data.message || 'Course deleted successfully'
      };
    } catch (error: any) {
      console.error('Error deleting course:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete course'
      };
    }
  }

  // Enroll in course
  async enrollCourse(courseId: string, userId: string): Promise<EnrollmentResponse> {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if course exists
      const course = mockCourses.find(c => c.id === courseId);
      if (!course) {
        return {
          success: false,
          data: {
            courseId,
            userId,
            enrolledAt: new Date().toISOString()
          },
          message: 'Course not found'
        };
      }

      // Check if already enrolled
      const existingProgress = mockProgress.find(p => p.courseId === courseId && p.userId === userId);
      if (existingProgress) {
        return {
          success: false,
          data: {
            courseId,
            userId,
            enrolledAt: existingProgress.enrolledAt
          },
          message: 'Already enrolled in this course'
        };
      }

      // Add to progress
      const newProgress: Progress = {
        courseId,
        userId,
        overallProgress: 0,
        completedLessons: [],
        timeSpent: 0,
        lastAccessed: new Date().toISOString(),
        enrolledAt: new Date().toISOString()
      };
      mockProgress.push(newProgress);

      return {
        success: true,
        data: {
          courseId,
          userId,
          enrolledAt: newProgress.enrolledAt
        }
      };
    } catch (error) {
      return {
        success: false,
        data: {
          courseId,
          userId,
          enrolledAt: new Date().toISOString()
        },
        message: 'Failed to enroll in course'
      };
    }
  }

  // Get user's progress for a course
  async getProgress(courseId: string, userId: string): Promise<ProgressResponse> {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));

      const progress = mockProgress.find(p => p.courseId === courseId && p.userId === userId);
      
      if (!progress) {
        return {
          success: false,
          data: {} as Progress,
          message: 'Progress not found'
        };
      }

      return {
        success: true,
        data: progress
      };
    } catch (error) {
      return {
        success: false,
        data: {} as Progress,
        message: 'Failed to fetch progress'
      };
    }
  }

  // Update lesson completion
  async completeLesson(courseId: string, lessonId: string, userId: string): Promise<{ success: boolean; message?: string }> {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));

      const progress = mockProgress.find(p => p.courseId === courseId && p.userId === userId);
      if (!progress) {
        return {
          success: false,
          message: 'Progress not found'
        };
      }

      if (!progress.completedLessons.includes(lessonId)) {
        progress.completedLessons.push(lessonId);
        
        // Recalculate overall progress
        const course = mockCourses.find(c => c.id === courseId);
        if (course) {
          const totalLessons = course.modules.reduce((total, module) => total + module.lessons.length, 0);
          progress.overallProgress = Math.round((progress.completedLessons.length / totalLessons) * 100);
        }
      }

      return {
        success: true
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to complete lesson'
      };
    }
  }

  // Get comments for a lesson
  async getComments(lessonId: string): Promise<Comment[]> {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      return mockComments.filter(c => c.lessonId === lessonId);
    } catch (error) {
      return [];
    }
  }

  // Add comment
  async addComment(lessonId: string, userId: string, content: string, parentId?: string): Promise<Comment> {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const newComment: Comment = {
        id: `comment-${Date.now()}`,
        lessonId,
        userId,
        userName: 'Current User', // In real app, get from user context
        content,
        parentId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        likes: 0,
        isInstructor: false,
        replies: []
      };

      mockComments.push(newComment);
      return newComment;
    } catch (error) {
      throw new Error('Failed to add comment');
    }
  }

  // Get categories
  async getCategories(): Promise<string[]> {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      return ['Design', 'Technology', 'Marketing', 'Business', 'Health', 'Education', 'Other'];
    } catch (error) {
      return [];
    }
  }

  // Get levels
  async getLevels(): Promise<string[]> {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      return ['Beginner', 'Intermediate', 'Advanced'];
    } catch (error) {
      return [];
    }
  }

  // Get languages
  async getLanguages(): Promise<string[]> {
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      return ['English', 'Hindi', 'Spanish', 'French', 'German', 'Other'];
    } catch (error) {
      return [];
    }
  }
}

export const courseService = new CourseService();
