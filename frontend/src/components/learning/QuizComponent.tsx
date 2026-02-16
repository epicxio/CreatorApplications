import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  TextField,
  Stack,
  LinearProgress,
  Alert,
  Card,
  CardContent,
  Chip,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Timer as TimerIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import quizService, {
  QuizQuestion,
  QuizMetadata,
  QuizAnswer,
  QuizResult,
  QuizAttempt
} from '../../services/quizService';
import { useToast } from '../../hooks/useToast';
import ToastNotification from '../common/ToastNotification';

interface QuizComponentProps {
  courseId: string;
  lessonId: string;
  onComplete?: (_passed: boolean, _score: number) => void;
}

const QuizComponent: React.FC<QuizComponentProps> = ({
  courseId,
  lessonId,
  onComplete
}) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [metadata, setMetadata] = useState<QuizMetadata | null>(null);
  const [answers, setAnswers] = useState<{ [questionId: string]: string | string[] | boolean }>({});
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<QuizResult[] | null>(null);
  const [, setShowResults] = useState(false);
  const [previousAttempts, setPreviousAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, setStartedAt] = useState<Date | null>(null);
  const [, setActiveSubmission] = useState<{ submissionId: string; timeRemaining: number | null } | null>(null);
  
  const { toast, success, error: showError, hideToast } = useToast();

  // Load quiz questions
  useEffect(() => {
    const loadQuiz = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await quizService.getQuizQuestions(courseId, lessonId);
        
        if (response.success && response.data) {
          setQuestions(response.data.questions);
          setMetadata(response.data.metadata);
          
          // Check for active submission
          if (response.data.activeSubmission) {
            setSubmissionId(response.data.activeSubmission.submissionId);
            setActiveSubmission({
              submissionId: response.data.activeSubmission.submissionId,
              timeRemaining: response.data.activeSubmission.timeRemaining
            });
            if (response.data.activeSubmission.timeRemaining) {
              setTimeRemaining(response.data.activeSubmission.timeRemaining);
            }
            // Calculate startedAt from time remaining
            if (metadata?.timeLimit && response.data.activeSubmission.timeRemaining) {
              const elapsed = (metadata.timeLimit * 60) - response.data.activeSubmission.timeRemaining;
              setStartedAt(new Date(Date.now() - elapsed * 1000));
            }
          }
          
          // Load previous attempts
          const attemptsResponse = await quizService.getQuizAttempts(courseId, lessonId);
          if (attemptsResponse.success && attemptsResponse.data) {
            setPreviousAttempts(attemptsResponse.data.attempts);
          }
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load quiz');
        showError(err.response?.data?.message || 'Failed to load quiz');
      } finally {
        setLoading(false);
      }
    };

    loadQuiz();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- courseId, lessonId are the triggers
  }, [courseId, lessonId, showError]);

  // Start quiz attempt
  const startQuiz = async () => {
    try {
      setError(null);
      const response = await quizService.startQuiz(courseId, lessonId);
      
      if (response.success && response.data) {
        setSubmissionId(response.data.submissionId);
        setStartedAt(new Date(response.data.startedAt));
        
        // Set time limit if available
        if (response.data.timeLimit) {
          setTimeRemaining(response.data.timeLimit * 60); // Convert minutes to seconds
        }
        
        success('Quiz started! Good luck!');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to start quiz');
      showError(err.response?.data?.message || 'Failed to start quiz');
    }
  };

  // Timer countdown
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0) {
      if (timeRemaining === 0 && submissionId && !results) {
        // Time expired, auto-submit
        handleSubmit();
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === null || prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- handleSubmit intentionally excluded to avoid loop
  }, [timeRemaining, submissionId, results]);

  // Handle answer change
  const handleAnswerChange = (questionId: string, answer: string | string[] | boolean) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  // Handle multiple choice answer (for multi-select questions)
  const _handleMultipleChoiceChange = (questionId: string, option: string, checked: boolean) => {
    setAnswers(prev => {
      const current = prev[questionId] as string[] || [];
      if (checked) {
        return { ...prev, [questionId]: [...current, option] };
      } else {
        return { ...prev, [questionId]: current.filter(a => a !== option) };
      }
    });
  };

  // Submit quiz
  const handleSubmit = async () => {
    if (!submissionId) return;

    // Check if all questions are answered
    const unansweredQuestions = questions.filter(q => !answers[q._id]);
    if (unansweredQuestions.length > 0) {
      const confirmSubmit = window.confirm(
        `You have ${unansweredQuestions.length} unanswered question(s). Do you want to submit anyway?`
      );
      if (!confirmSubmit) return;
    }

    try {
      setIsSubmitting(true);
      
      // Convert answers to API format
      const quizAnswers: QuizAnswer[] = questions.map(q => ({
        questionId: q._id,
        answer: answers[q._id] || (q.type === 'multiple-choice' ? [] : '')
      }));

      const response = await quizService.submitQuiz(submissionId, quizAnswers);
      
      if (response.success && response.data) {
        setResults(response.data.results);
        setShowResults(true);
        setTimeRemaining(null);
        
        if (onComplete) {
          onComplete(response.data.passed, response.data.score);
        }
        
        success(
          response.data.passed 
            ? `Congratulations! You passed with ${response.data.score}%` 
            : `You scored ${response.data.score}%. Passing score is ${response.data.passingScore}%`
        );
      }
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to submit quiz');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress
  const calculateProgress = (): number => {
    if (questions.length === 0) return 0;
    const answered = Object.keys(answers).filter(key => {
      const answer = answers[key];
      return answer !== undefined && answer !== null && 
             (Array.isArray(answer) ? answer.length > 0 : answer !== '');
    }).length;
    return (answered / questions.length) * 100;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !submissionId) {
    return (
      <Alert severity="error" action={
        <Button color="inherit" size="small" onClick={() => window.location.reload()}>
          Retry
        </Button>
      }>
        {error}
      </Alert>
    );
  }

  // Show start screen if quiz hasn't started
  if (!submissionId) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Quiz: {metadata?.totalQuestions || 0} Questions
        </Typography>
        {metadata && (
          <Stack spacing={2} sx={{ mt: 3, maxWidth: 400, mx: 'auto' }}>
            <Typography variant="body1">
              <strong>Total Points:</strong> {metadata.totalPoints}
            </Typography>
            <Typography variant="body1">
              <strong>Passing Score:</strong> {metadata.passingScore}%
            </Typography>
            {metadata.timeLimit && (
              <Typography variant="body1" color="warning.main">
                <strong>Time Limit:</strong> {metadata.timeLimit} minutes
              </Typography>
            )}
            {previousAttempts.length > 0 && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Previous Attempts:
                </Typography>
                {previousAttempts.map(attempt => (
                  <Chip
                    key={attempt.submissionId}
                    label={`Attempt ${attempt.attemptNumber}: ${attempt.score}% ${attempt.passed ? '✓' : '✗'}`}
                    color={attempt.passed ? 'success' : 'default'}
                    size="small"
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
              </Box>
            )}
          </Stack>
        )}
        <Button
          variant="contained"
          size="large"
          onClick={startQuiz}
          sx={{ mt: 4, px: 4 }}
        >
          Start Quiz
        </Button>
      </Paper>
    );
  }

  // Show quiz form
  if (!results) {
    return (
      <Box>
        {/* Timer and Progress */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">
              Quiz in Progress
            </Typography>
            {timeRemaining !== null && (
              <Chip
                icon={<TimerIcon />}
                label={formatTime(timeRemaining)}
                color={timeRemaining < 60 ? 'error' : 'default'}
                sx={{ fontSize: '1rem', fontWeight: 'bold' }}
              />
            )}
          </Stack>
          <LinearProgress 
            variant="determinate" 
            value={calculateProgress()} 
            sx={{ height: 8, borderRadius: 4 }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            {Object.keys(answers).filter(k => {
              const a = answers[k];
              return a !== undefined && a !== null && (Array.isArray(a) ? a.length > 0 : a !== '');
            }).length} of {questions.length} questions answered
          </Typography>
        </Paper>

        {/* Questions */}
        <Stack spacing={3}>
          {questions.map((question, index) => (
            <motion.div
              key={question._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Question {index + 1} ({question.points} points)
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {question.question}
                  </Typography>

                  {question.type === 'multiple-choice' && (
                    <FormControl component="fieldset">
                      <RadioGroup
                        value={answers[question._id] || ''}
                        onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                      >
                        {question.options.map((option, optIndex) => (
                          <FormControlLabel
                            key={optIndex}
                            value={option}
                            control={<Radio />}
                            label={option}
                          />
                        ))}
                      </RadioGroup>
                    </FormControl>
                  )}

                  {question.type === 'true-false' && (
                    <FormControl component="fieldset">
                      <RadioGroup
                        value={String(answers[question._id] || '')}
                        onChange={(e) => handleAnswerChange(question._id, e.target.value === 'true')}
                      >
                        <FormControlLabel value="true" control={<Radio />} label="True" />
                        <FormControlLabel value="false" control={<Radio />} label="False" />
                      </RadioGroup>
                    </FormControl>
                  )}

                  {question.type === 'text' && (
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      value={answers[question._id] || ''}
                      onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                      placeholder="Type your answer here..."
                    />
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </Stack>

        {/* Submit Button */}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleSubmit}
            disabled={isSubmitting || timeRemaining === 0}
            sx={{ px: 4 }}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
          </Button>
        </Box>

        <ToastNotification
          toast={toast}
          onClose={hideToast}
        />
      </Box>
    );
  }

  // Show results
  return (
    <Box>
      <Paper sx={{ p: 4, mb: 3, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Quiz Results
        </Typography>
        <Typography variant="h3" color={results.some(r => r.isCorrect) ? 'success.main' : 'error.main'}>
          {results.reduce((sum, r) => sum + r.pointsEarned, 0)} / {results.reduce((sum, r) => sum + r.pointsPossible, 0)}
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Score: {Math.round((results.reduce((sum, r) => sum + r.pointsEarned, 0) / results.reduce((sum, r) => sum + r.pointsPossible, 0)) * 100)}%
        </Typography>
      </Paper>

      <Stack spacing={3}>
        {results.map((result, index) => (
          <Card key={result.questionId}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  Question {index + 1}
                </Typography>
                {result.isCorrect ? (
                  <Chip icon={<CheckIcon />} label="Correct" color="success" />
                ) : (
                  <Chip icon={<CancelIcon />} label="Incorrect" color="error" />
                )}
              </Stack>
              <Typography variant="body1" paragraph>
                {result.question}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Stack spacing={1}>
                <Typography variant="body2">
                  <strong>Your Answer:</strong> {Array.isArray(result.userAnswer) ? result.userAnswer.join(', ') : String(result.userAnswer)}
                </Typography>
                <Typography variant="body2" color={result.isCorrect ? 'success.main' : 'error.main'}>
                  <strong>Correct Answer:</strong> {Array.isArray(result.correctAnswer) ? result.correctAnswer.join(', ') : String(result.correctAnswer)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Points:</strong> {result.pointsEarned} / {result.pointsPossible}
                </Typography>
                {result.explanation && (
                  <Alert severity="info" sx={{ mt: 1 }}>
                    <strong>Explanation:</strong> {result.explanation}
                  </Alert>
                )}
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>

      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => {
            setSubmissionId(null);
            setAnswers({});
            setResults(null);
            setShowResults(false);
            setTimeRemaining(null);
            startQuiz();
          }}
          sx={{ mr: 2 }}
        >
          Retake Quiz
        </Button>
        <Button
          variant="contained"
          onClick={() => setShowResults(false)}
        >
          Close
        </Button>
      </Box>

      <ToastNotification
        toast={toast}
        onClose={hideToast}
      />
    </Box>
  );
};

export default QuizComponent;
