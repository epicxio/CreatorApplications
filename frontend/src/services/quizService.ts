import api from './api';

export interface QuizQuestion {
  _id: string;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'text';
  options: string[];
  points: number;
}

export interface QuizMetadata {
  timeLimit: number | null;
  passingScore: number;
  totalQuestions: number;
  totalPoints: number;
}

export interface PreviousAttempt {
  attemptNumber: number;
  score: number;
  passed: boolean;
  submittedAt: string;
}

export interface ActiveSubmission {
  submissionId: string;
  attemptNumber: number;
  timeRemaining: number | null; // in seconds
}

export interface QuizQuestionsResponse {
  success: boolean;
  data: {
    courseId: string;
    courseName: string;
    lessonId: string;
    lessonTitle: string;
    questions: QuizQuestion[];
    metadata: QuizMetadata;
    previousAttempts: PreviousAttempt[];
    activeSubmission: ActiveSubmission | null;
  };
}

export interface StartQuizResponse {
  success: boolean;
  data: {
    submissionId: string;
    attemptNumber: number;
    startedAt: string;
    timeLimit: number | null;
  };
}

export interface QuizAnswer {
  questionId: string;
  answer: string | string[] | boolean;
}

export interface SubmitQuizRequest {
  answers: QuizAnswer[];
}

export interface QuizResult {
  questionId: string;
  question: string;
  correctAnswer: string | string[] | boolean;
  userAnswer: string | string[] | boolean;
  isCorrect: boolean;
  pointsEarned: number;
  pointsPossible: number;
  explanation?: string;
}

export interface SubmitQuizResponse {
  success: boolean;
  data: {
    submissionId: string;
    totalPoints: number;
    maxPoints: number;
    score: number;
    passingScore: number;
    passed: boolean;
    timeSpent: number;
    submittedAt: string;
    results: QuizResult[];
  };
}

export interface QuizAttempt {
  submissionId: string;
  attemptNumber: number;
  score: number;
  totalPoints: number;
  maxPoints: number;
  passed: boolean;
  status: string;
  submittedAt: string;
  timeSpent: number;
}

export interface QuizAttemptsResponse {
  success: boolean;
  data: {
    lessonId: string;
    lessonTitle: string;
    attempts: QuizAttempt[];
  };
}

class QuizService {
  /**
   * Get quiz questions for a lesson
   */
  async getQuizQuestions(courseId: string, lessonId: string): Promise<QuizQuestionsResponse> {
    const response = await api.get<QuizQuestionsResponse>(
      `/quiz/${courseId}/${lessonId}/questions`
    );
    return response.data;
  }

  /**
   * Start a new quiz attempt
   */
  async startQuiz(courseId: string, lessonId: string): Promise<StartQuizResponse> {
    const response = await api.post<StartQuizResponse>(
      `/quiz/${courseId}/${lessonId}/start`
    );
    return response.data;
  }

  /**
   * Submit quiz answers
   */
  async submitQuiz(submissionId: string, answers: QuizAnswer[]): Promise<SubmitQuizResponse> {
    const response = await api.post<SubmitQuizResponse>(
      `/quiz/${submissionId}/submit`,
      { answers }
    );
    return response.data;
  }

  /**
   * Get quiz results for a submission
   */
  async getQuizResults(submissionId: string): Promise<SubmitQuizResponse> {
    const response = await api.get<SubmitQuizResponse>(
      `/quiz/${submissionId}/results`
    );
    return response.data;
  }

  /**
   * Get all quiz attempts for a lesson
   */
  async getQuizAttempts(courseId: string, lessonId: string): Promise<QuizAttemptsResponse> {
    const response = await api.get<QuizAttemptsResponse>(
      `/quiz/${courseId}/${lessonId}/attempts`
    );
    return response.data;
  }
}

const quizService = new QuizService();
export default quizService;

