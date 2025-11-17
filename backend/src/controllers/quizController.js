const Course = require('../models/Course');
const QuizSubmission = require('../models/QuizSubmission');
const { validateQuizQuestions } = require('../middleware/quizValidation');
const { getTimeRemaining, isExpired } = require('../services/quizExpirationService');

/**
 * Get quiz questions for a specific lesson
 * GET /api/quiz/:courseId/:lessonId/questions
 */
const getQuizQuestions = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    const userId = req.user.id;

    // Find the course
    const course = await Course.findOne({ 
      $or: [{ _id: courseId }, { courseId: courseId }]
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Find the lesson
    let lesson = null;
    for (const module of course.modules || []) {
      const foundLesson = module.lessons.find(l => 
        l._id.toString() === lessonId || l.id === lessonId
      );
      if (foundLesson) {
        lesson = foundLesson;
        break;
      }
    }

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    if (lesson.type !== 'Quiz') {
      return res.status(400).json({
        success: false,
        message: 'This lesson is not a quiz'
      });
    }

    // Get quiz questions (without correct answers for security)
    const questions = (lesson.content?.questions || []).map(q => ({
      _id: q._id,
      question: q.question,
      type: q.type,
      options: q.options || [],
      points: q.points || 10,
      explanation: undefined // Don't send explanation until after submission
    }));

    // Get quiz metadata
    const quizMetadata = {
      timeLimit: lesson.content?.timeLimit || null,
      passingScore: lesson.content?.passingScore || 70,
      totalQuestions: questions.length,
      totalPoints: questions.reduce((sum, q) => sum + (q.points || 10), 0)
    };

    // Check for active in-progress submission and include time remaining
    const activeSubmission = await QuizSubmission.findOne({
      userId,
      lessonId: lesson._id || lessonId,
      status: 'in_progress'
    });

    let timeRemaining = null;
    if (activeSubmission && quizMetadata.timeLimit) {
      const remaining = getTimeRemaining(activeSubmission);
      if (remaining !== null && remaining > 0) {
        timeRemaining = remaining; // in seconds
      } else if (isExpired(activeSubmission)) {
        // Auto-expire if time limit exceeded
        activeSubmission.status = 'expired';
        activeSubmission.submittedAt = new Date();
        await activeSubmission.save();
      }
    }

    // Get user's previous attempts
    const previousAttempts = await QuizSubmission.find({
      userId,
      lessonId: lesson._id || lessonId
    }).select('attemptNumber score passed submittedAt status').sort({ attemptNumber: -1 });

    // Check for in-progress attempts and expire them if time limit exceeded
    const inProgressAttempts = previousAttempts.filter(a => a.status === 'in_progress');
    for (const attempt of inProgressAttempts) {
      const submission = await QuizSubmission.findById(attempt._id);
      if (submission && submission.timeLimit && submission.startedAt) {
        const timeElapsed = (new Date() - submission.startedAt) / 1000 / 60; // in minutes
        if (timeElapsed > submission.timeLimit) {
          submission.status = 'expired';
          submission.submittedAt = new Date();
          await submission.save();
        }
      }
    }

    res.json({
      success: true,
      data: {
        courseId: course._id,
        courseName: course.name,
        lessonId: lesson._id || lessonId,
        lessonTitle: lesson.title,
        questions,
        metadata: quizMetadata,
        previousAttempts: previousAttempts.map(attempt => ({
          attemptNumber: attempt.attemptNumber,
          score: attempt.score,
          passed: attempt.passed,
          submittedAt: attempt.submittedAt,
          status: attempt.status
        })),
        activeSubmission: activeSubmission ? {
          submissionId: activeSubmission._id,
          attemptNumber: activeSubmission.attemptNumber,
          timeRemaining: timeRemaining
        } : null
      }
    });
  } catch (error) {
    console.error('Error getting quiz questions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get quiz questions',
      error: error.message
    });
  }
};

/**
 * Start a quiz attempt
 * POST /api/quiz/:courseId/:lessonId/start
 */
const startQuiz = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    const userId = req.user.id;

    // Find the course and lesson
    const course = await Course.findOne({ 
      $or: [{ _id: courseId }, { courseId: courseId }]
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    let lesson = null;
    for (const module of course.modules || []) {
      const foundLesson = module.lessons.find(l => 
        l._id.toString() === lessonId || l.id === lessonId
      );
      if (foundLesson) {
        lesson = foundLesson;
        break;
      }
    }

    if (!lesson || lesson.type !== 'Quiz') {
      return res.status(404).json({
        success: false,
        message: 'Quiz lesson not found'
      });
    }

    // Get attempt count
    const attemptCount = await QuizSubmission.getAttemptCount(userId, lesson._id || lessonId);
    const nextAttemptNumber = attemptCount + 1;

    // Create new submission
    const submission = new QuizSubmission({
      courseId: course._id,
      lessonId: lesson._id || lessonId,
      userId,
      attemptNumber: nextAttemptNumber,
      status: 'in_progress',
      timeLimit: lesson.content?.timeLimit || null,
      passingScore: lesson.content?.passingScore || 70,
      startedAt: new Date(),
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    await submission.save();

    res.json({
      success: true,
      data: {
        submissionId: submission._id,
        attemptNumber: submission.attemptNumber,
        startedAt: submission.startedAt,
        timeLimit: submission.timeLimit
      }
    });
  } catch (error) {
    console.error('Error starting quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start quiz',
      error: error.message
    });
  }
};

/**
 * Submit quiz answers and auto-grade
 * POST /api/quiz/:submissionId/submit
 */
const submitQuiz = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { answers } = req.body;
    const userId = req.user.id;

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: 'Answers array is required'
      });
    }

    // Find submission
    const submission = await QuizSubmission.findOne({
      _id: submissionId,
      userId // Ensure user owns this submission
    });

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Quiz submission not found'
      });
    }

    if (submission.status !== 'in_progress') {
      return res.status(400).json({
        success: false,
        message: 'Quiz has already been submitted'
      });
    }

    // Check if quiz has expired (time limit exceeded)
    if (submission.timeLimit && submission.startedAt) {
      const timeElapsed = (new Date() - submission.startedAt) / 1000 / 60; // in minutes
      if (timeElapsed > submission.timeLimit) {
        // Mark as expired
        submission.status = 'expired';
        submission.submittedAt = new Date();
        await submission.save();
        
        return res.status(400).json({
          success: false,
          message: 'Quiz time limit has expired. Your quiz has been automatically submitted.',
          expired: true
        });
      }
    }

    // Get course and lesson to access quiz questions
    const course = await Course.findById(submission.courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    let lesson = null;
    for (const module of course.modules || []) {
      const foundLesson = module.lessons.find(l => 
        l._id.toString() === submission.lessonId.toString()
      );
      if (foundLesson) {
        lesson = foundLesson;
        break;
      }
    }

    if (!lesson || lesson.type !== 'Quiz') {
      return res.status(404).json({
        success: false,
        message: 'Quiz lesson not found'
      });
    }

    const quizQuestions = lesson.content?.questions || [];

    // Grade answers
    const gradedAnswers = answers.map(answerData => {
      const question = quizQuestions.find(q => 
        q._id.toString() === answerData.questionId
      );

      if (!question) {
        return {
          questionId: answerData.questionId,
          answer: answerData.answer,
          isCorrect: false,
          pointsEarned: 0,
          pointsPossible: 0
        };
      }

      const pointsPossible = question.points || 10;
      let isCorrect = false;
      let pointsEarned = 0;

      // Compare answers based on question type
      if (question.type === 'multiple-choice') {
        // For multiple choice, compare the answer
        if (Array.isArray(question.correctAnswer)) {
          // Multiple correct answers
          const userAnswers = Array.isArray(answerData.answer) 
            ? answerData.answer.sort() 
            : [answerData.answer];
          const correctAnswers = question.correctAnswer.sort();
          isCorrect = JSON.stringify(userAnswers) === JSON.stringify(correctAnswers);
        } else {
          // Single correct answer
          isCorrect = answerData.answer === question.correctAnswer;
        }
      } else if (question.type === 'true-false') {
        isCorrect = answerData.answer === question.correctAnswer;
      } else if (question.type === 'text') {
        // For text questions, we might need manual grading
        // For now, do a case-insensitive comparison
        const userAnswer = String(answerData.answer).toLowerCase().trim();
        const correctAnswer = String(question.correctAnswer).toLowerCase().trim();
        isCorrect = userAnswer === correctAnswer;
      }

      // Award points if correct
      if (isCorrect) {
        pointsEarned = pointsPossible;
      }

      return {
        questionId: question._id,
        answer: answerData.answer,
        isCorrect,
        pointsEarned,
        pointsPossible
      };
    });

    // Update submission
    submission.answers = gradedAnswers;
    submission.submittedAt = new Date();
    submission.status = 'graded';
    
    // Calculate time spent
    if (submission.startedAt) {
      submission.timeSpent = Math.floor((submission.submittedAt - submission.startedAt) / 1000);
    }

    await submission.save();

    // Include explanations in response
    const resultsWithExplanations = gradedAnswers.map(gradedAnswer => {
      const question = quizQuestions.find(q => 
        q._id.toString() === gradedAnswer.questionId.toString()
      );
      return {
        ...gradedAnswer,
        question: question?.question,
        correctAnswer: question?.correctAnswer,
        explanation: question?.explanation
      };
    });

    res.json({
      success: true,
      data: {
        submissionId: submission._id,
        totalPoints: submission.totalPoints,
        maxPoints: submission.maxPoints,
        score: submission.score,
        passingScore: submission.passingScore,
        passed: submission.passed,
        timeSpent: submission.timeSpent,
        submittedAt: submission.submittedAt,
        results: resultsWithExplanations
      }
    });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit quiz',
      error: error.message
    });
  }
};

/**
 * Get quiz results for a submission
 * GET /api/quiz/:submissionId/results
 */
const getQuizResults = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const userId = req.user.id;

    const submission = await QuizSubmission.findOne({
      _id: submissionId,
      userId
    }).populate('courseId', 'name courseId').populate('userId', 'name email');

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Quiz submission not found'
      });
    }

    // Get course and lesson for question details
    const course = await Course.findById(submission.courseId);
    let lesson = null;
    for (const module of course.modules || []) {
      const foundLesson = module.lessons.find(l => 
        l._id.toString() === submission.lessonId.toString()
      );
      if (foundLesson) {
        lesson = foundLesson;
        break;
      }
    }

    const quizQuestions = lesson?.content?.questions || [];

    // Combine submission answers with question details
    const detailedResults = submission.answers.map(answer => {
      const question = quizQuestions.find(q => 
        q._id.toString() === answer.questionId.toString()
      );
      return {
        questionId: answer.questionId,
        question: question?.question || 'Question not found',
        type: question?.type,
        options: question?.options || [],
        userAnswer: answer.answer,
        correctAnswer: question?.correctAnswer,
        isCorrect: answer.isCorrect,
        pointsEarned: answer.pointsEarned,
        pointsPossible: answer.pointsPossible,
        explanation: question?.explanation
      };
    });

    res.json({
      success: true,
      data: {
        submissionId: submission._id,
        courseId: course._id,
        courseName: course.name,
        lessonId: lesson?._id,
        lessonTitle: lesson?.title,
        totalPoints: submission.totalPoints,
        maxPoints: submission.maxPoints,
        score: submission.score,
        passingScore: submission.passingScore,
        passed: submission.passed,
        attemptNumber: submission.attemptNumber,
        timeSpent: submission.timeSpent,
        submittedAt: submission.submittedAt,
        results: detailedResults
      }
    });
  } catch (error) {
    console.error('Error getting quiz results:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get quiz results',
      error: error.message
    });
  }
};

/**
 * Get all quiz attempts for a user in a lesson
 * GET /api/quiz/:courseId/:lessonId/attempts
 */
const getQuizAttempts = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    const userId = req.user.id;

    // Find the course to get the lesson
    const course = await Course.findOne({ 
      $or: [{ _id: courseId }, { courseId: courseId }]
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    let lesson = null;
    for (const module of course.modules || []) {
      const foundLesson = module.lessons.find(l => 
        l._id.toString() === lessonId || l.id === lessonId
      );
      if (foundLesson) {
        lesson = foundLesson;
        break;
      }
    }

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }

    const attempts = await QuizSubmission.getUserAttempts(userId, lesson._id || lessonId);

    res.json({
      success: true,
      data: {
        lessonId: lesson._id || lessonId,
        lessonTitle: lesson.title,
        attempts: attempts.map(attempt => ({
          submissionId: attempt._id,
          attemptNumber: attempt.attemptNumber,
          score: attempt.score,
          totalPoints: attempt.totalPoints,
          maxPoints: attempt.maxPoints,
          passed: attempt.passed,
          status: attempt.status,
          submittedAt: attempt.submittedAt,
          timeSpent: attempt.timeSpent
        }))
      }
    });
  } catch (error) {
    console.error('Error getting quiz attempts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get quiz attempts',
      error: error.message
    });
  }
};

module.exports = {
  getQuizQuestions,
  startQuiz,
  submitQuiz,
  getQuizResults,
  getQuizAttempts
};

