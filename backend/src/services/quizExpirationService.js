const QuizSubmission = require('../models/QuizSubmission');

/**
 * Service to expire in-progress quizzes that have exceeded their time limit
 * This should be run periodically (e.g., every minute via cron job)
 */
const expireQuizzes = async () => {
  try {
    // Find all in-progress submissions
    const inProgressSubmissions = await QuizSubmission.find({
      status: 'in_progress',
      timeLimit: { $exists: true, $ne: null },
      startedAt: { $exists: true }
    });

    const now = new Date();
    let expiredCount = 0;

    for (const submission of inProgressSubmissions) {
      if (submission.timeLimit && submission.startedAt) {
        const timeElapsed = (now - submission.startedAt) / 1000 / 60; // in minutes
        
        if (timeElapsed > submission.timeLimit) {
          // Mark as expired
          submission.status = 'expired';
          submission.submittedAt = now;
          submission.timeSpent = Math.floor((now - submission.startedAt) / 1000);
          await submission.save();
          expiredCount++;
          
          console.log(`⏰ Quiz expired: Submission ${submission._id} (User: ${submission.userId}, Lesson: ${submission.lessonId})`);
        }
      }
    }

    if (expiredCount > 0) {
      console.log(`✅ Expired ${expiredCount} quiz submission(s)`);
    }

    return { expiredCount };
  } catch (error) {
    console.error('❌ Error expiring quizzes:', error);
    throw error;
  }
};

/**
 * Get time remaining for a quiz submission
 */
const getTimeRemaining = (submission) => {
  if (!submission.timeLimit || !submission.startedAt) {
    return null;
  }

  const now = new Date();
  const timeElapsed = (now - submission.startedAt) / 1000 / 60; // in minutes
  const timeRemaining = submission.timeLimit - timeElapsed;

  return Math.max(0, Math.floor(timeRemaining * 60)); // Return in seconds, minimum 0
};

/**
 * Check if a quiz submission has expired
 */
const isExpired = (submission) => {
  if (!submission.timeLimit || !submission.startedAt) {
    return false;
  }

  const now = new Date();
  const timeElapsed = (now - submission.startedAt) / 1000 / 60; // in minutes
  
  return timeElapsed > submission.timeLimit;
};

module.exports = {
  expireQuizzes,
  getTimeRemaining,
  isExpired
};

