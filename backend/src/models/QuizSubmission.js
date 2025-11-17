const mongoose = require('mongoose');

// Answer schema for individual question answers
const answerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
  answer: { type: mongoose.Schema.Types.Mixed, required: true }, // Can be string or array
  isCorrect: { type: Boolean, default: false },
  pointsEarned: { type: Number, default: 0 },
  pointsPossible: { type: Number, default: 0 }
}, { _id: true });

// Quiz submission schema
const quizSubmissionSchema = new mongoose.Schema({
  // References
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
    index: true
  },
  lessonId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Submission details
  answers: [answerSchema],
  
  // Scoring
  totalPoints: { type: Number, default: 0 },
  maxPoints: { type: Number, default: 0 },
  score: { type: Number, default: 0 }, // Percentage
  passingScore: { type: Number, default: 70 }, // Percentage required to pass
  passed: { type: Boolean, default: false },
  
  // Timing
  startedAt: { type: Date, default: Date.now },
  submittedAt: { type: Date },
  timeSpent: { type: Number, default: 0 }, // in seconds
  timeLimit: { type: Number }, // in minutes
  
  // Status
  status: {
    type: String,
    enum: ['in_progress', 'submitted', 'graded', 'expired'],
    default: 'in_progress'
  },
  
  // Attempt tracking
  attemptNumber: { type: Number, default: 1 },
  
  // Metadata
  ipAddress: String,
  userAgent: String,
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Compound index for finding user's submissions for a specific quiz
quizSubmissionSchema.index({ userId: 1, lessonId: 1, attemptNumber: 1 }, { unique: true });

// Index for finding all submissions for a quiz
quizSubmissionSchema.index({ courseId: 1, lessonId: 1 });

// Pre-save hook to calculate score and passed status
quizSubmissionSchema.pre('save', function(next) {
  if (this.answers && this.answers.length > 0) {
    // Calculate total points earned
    this.totalPoints = this.answers.reduce((sum, answer) => sum + (answer.pointsEarned || 0), 0);
    
    // Calculate max points possible
    this.maxPoints = this.answers.reduce((sum, answer) => sum + (answer.pointsPossible || 0), 0);
    
    // Calculate percentage score
    if (this.maxPoints > 0) {
      this.score = Math.round((this.totalPoints / this.maxPoints) * 100);
    }
    
    // Determine if passed
    this.passed = this.score >= this.passingScore;
    
    // Update status if submitted
    if (this.submittedAt && this.status === 'in_progress') {
      this.status = 'submitted';
    }
  }
  
  this.updatedAt = new Date();
  next();
});

// Method to get the best attempt for a user
quizSubmissionSchema.statics.getBestAttempt = async function(userId, lessonId) {
  return this.findOne({ userId, lessonId })
    .sort({ score: -1, submittedAt: -1 })
    .exec();
};

// Method to get all attempts for a user
quizSubmissionSchema.statics.getUserAttempts = async function(userId, lessonId) {
  return this.find({ userId, lessonId })
    .sort({ attemptNumber: -1 })
    .exec();
};

// Method to get attempt count for a user
quizSubmissionSchema.statics.getAttemptCount = async function(userId, lessonId) {
  return this.countDocuments({ userId, lessonId });
};

const QuizSubmission = mongoose.model('QuizSubmission', quizSubmissionSchema);

module.exports = QuizSubmission;

