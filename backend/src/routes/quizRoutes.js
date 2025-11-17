const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getQuizQuestions,
  startQuiz,
  submitQuiz,
  getQuizResults,
  getQuizAttempts
} = require('../controllers/quizController');

// All quiz routes require authentication
router.use(auth);

// Get quiz questions for a lesson
router.get('/:courseId/:lessonId/questions', getQuizQuestions);

// Start a new quiz attempt
router.post('/:courseId/:lessonId/start', startQuiz);

// Submit quiz answers
router.post('/:submissionId/submit', submitQuiz);

// Get quiz results for a submission
router.get('/:submissionId/results', getQuizResults);

// Get all attempts for a quiz
router.get('/:courseId/:lessonId/attempts', getQuizAttempts);

module.exports = router;

