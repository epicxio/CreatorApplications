export interface Question {
  id: string;
  text: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  options?: string[];
  correctAnswer?: string;
}

export interface Assessment {
  id: string;
  title: string;
  dueDate: string;
  status: 'pending' | 'completed';
  questions: Question[];
} 