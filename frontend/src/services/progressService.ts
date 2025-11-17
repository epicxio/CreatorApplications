import { Progress, Lesson, Course } from '../types/course';

class ProgressService {
  private storageKey = 'learner_progress';

  // Get progress from localStorage
  private getStoredProgress(): Progress[] {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading progress from localStorage:', error);
      return [];
    }
  }

  // Save progress to localStorage
  private saveProgress(progress: Progress[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(progress));
    } catch (error) {
      console.error('Error saving progress to localStorage:', error);
    }
  }

  // Get user's progress for a specific course
  getCourseProgress(courseId: string, userId: string): Progress | null {
    const allProgress = this.getStoredProgress();
    return allProgress.find(p => p.courseId === courseId && p.userId === userId) || null;
  }

  // Get all user's progress
  getAllProgress(userId: string): Progress[] {
    const allProgress = this.getStoredProgress();
    return allProgress.filter(p => p.userId === userId);
  }

  // Initialize progress for a new course enrollment
  initializeProgress(courseId: string, userId: string): Progress {
    const allProgress = this.getStoredProgress();
    
    const newProgress: Progress = {
      courseId,
      userId,
      overallProgress: 0,
      completedLessons: [],
      timeSpent: 0,
      lastAccessed: new Date().toISOString(),
      enrolledAt: new Date().toISOString()
    };

    allProgress.push(newProgress);
    this.saveProgress(allProgress);
    return newProgress;
  }

  // Mark lesson as completed
  completeLesson(courseId: string, lessonId: string, userId: string, course: Course): Progress {
    const allProgress = this.getStoredProgress();
    let progress = allProgress.find(p => p.courseId === courseId && p.userId === userId);

    if (!progress) {
      progress = this.initializeProgress(courseId, userId);
    }

    // Add lesson to completed list if not already there
    if (!progress.completedLessons.includes(lessonId)) {
      progress.completedLessons.push(lessonId);
      
      // Recalculate overall progress
      const totalLessons = course.modules.reduce((total, module) => total + module.lessons.length, 0);
      progress.overallProgress = Math.round((progress.completedLessons.length / totalLessons) * 100);
      
      // Update last accessed time
      progress.lastAccessed = new Date().toISOString();
    }

    this.saveProgress(allProgress);
    return progress;
  }

  // Add time spent on lesson
  addTimeSpent(courseId: string, lessonId: string, userId: string, timeSpent: number): void {
    const allProgress = this.getStoredProgress();
    const progress = allProgress.find(p => p.courseId === courseId && p.userId === userId);

    if (progress) {
      progress.timeSpent += timeSpent;
      progress.lastAccessed = new Date().toISOString();
      this.saveProgress(allProgress);
    }
  }

  // Check if lesson is completed
  isLessonCompleted(courseId: string, lessonId: string, userId: string): boolean {
    const progress = this.getCourseProgress(courseId, userId);
    return progress ? progress.completedLessons.includes(lessonId) : false;
  }

  // Get completion percentage for a course
  getCompletionPercentage(courseId: string, userId: string, course: Course): number {
    const progress = this.getCourseProgress(courseId, userId);
    if (!progress) return 0;

    const totalLessons = course.modules.reduce((total, module) => total + module.lessons.length, 0);
    return totalLessons > 0 ? Math.round((progress.completedLessons.length / totalLessons) * 100) : 0;
  }

  // Get next lesson to complete
  getNextLesson(courseId: string, userId: string, course: Course): Lesson | null {
    const progress = this.getCourseProgress(courseId, userId);
    const completedLessons = progress ? progress.completedLessons : [];

    for (const module of course.modules) {
      for (const lesson of module.lessons) {
        if (!completedLessons.includes(lesson.id) && lesson.isUnlocked) {
          return lesson;
        }
      }
    }

    return null;
  }

  // Get current lesson (last accessed or first incomplete)
  getCurrentLesson(courseId: string, userId: string, course: Course): Lesson | null {
    const progress = this.getCourseProgress(courseId, userId);
    
    if (!progress) {
      // Return first unlocked lesson
      for (const module of course.modules) {
        for (const lesson of module.lessons) {
          if (lesson.isUnlocked) {
            return lesson;
          }
        }
      }
      return null;
    }

    // Find the last completed lesson and return the next one
    const completedLessons = progress.completedLessons;
    let foundLastCompleted = false;

    for (const module of course.modules) {
      for (const lesson of module.lessons) {
        if (foundLastCompleted && lesson.isUnlocked) {
          return lesson;
        }
        if (completedLessons.includes(lesson.id)) {
          foundLastCompleted = true;
        }
      }
    }

    // If no next lesson found, return the first unlocked lesson
    for (const module of course.modules) {
      for (const lesson of module.lessons) {
        if (lesson.isUnlocked) {
          return lesson;
        }
      }
    }

    return null;
  }

  // Mark course as completed
  completeCourse(courseId: string, userId: string, course: Course): Progress {
    const allProgress = this.getStoredProgress();
    let progress = allProgress.find(p => p.courseId === courseId && p.userId === userId);

    if (!progress) {
      progress = this.initializeProgress(courseId, userId);
    }

    // Mark all lessons as completed
    const allLessonIds = course.modules.flatMap(module => module.lessons.map(lesson => lesson.id));
    progress.completedLessons = allLessonIds;
    progress.overallProgress = 100;
    progress.completedAt = new Date().toISOString();
    progress.certificateEarned = course.certificateEnabled;
    progress.lastAccessed = new Date().toISOString();

    this.saveProgress(allProgress);
    return progress;
  }

  // Get learning statistics
  getLearningStats(userId: string): {
    totalCourses: number;
    completedCourses: number;
    totalTimeSpent: number;
    averageCompletionRate: number;
  } {
    const allProgress = this.getAllProgress(userId);
    
    const totalCourses = allProgress.length;
    const completedCourses = allProgress.filter(p => p.overallProgress === 100).length;
    const totalTimeSpent = allProgress.reduce((total, p) => total + p.timeSpent, 0);
    const averageCompletionRate = totalCourses > 0 
      ? Math.round(allProgress.reduce((total, p) => total + p.overallProgress, 0) / totalCourses)
      : 0;

    return {
      totalCourses,
      completedCourses,
      totalTimeSpent,
      averageCompletionRate
    };
  }

  // Clear all progress (for testing or account reset)
  clearAllProgress(userId: string): void {
    const allProgress = this.getStoredProgress();
    const filteredProgress = allProgress.filter(p => p.userId !== userId);
    this.saveProgress(filteredProgress);
  }

  // Export progress data
  exportProgress(userId: string): string {
    const progress = this.getAllProgress(userId);
    return JSON.stringify(progress, null, 2);
  }

  // Import progress data
  importProgress(userId: string, progressData: string): boolean {
    try {
      const importedProgress = JSON.parse(progressData);
      if (Array.isArray(importedProgress)) {
        const allProgress = this.getStoredProgress();
        const filteredProgress = allProgress.filter(p => p.userId !== userId);
        const newProgress = [...filteredProgress, ...importedProgress];
        this.saveProgress(newProgress);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error importing progress:', error);
      return false;
    }
  }
}

export const progressService = new ProgressService();
