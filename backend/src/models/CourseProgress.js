const mongoose = require('mongoose');

const courseProgressSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  completedLessonIds: {
    type: [String],
    default: []
  },
  overallProgress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  timeSpent: {
    type: Number,
    default: 0
  },
  lastAccessedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: { type: Date }
}, {
  timestamps: true,
  collection: 'courseprogresses'
});

// Unique compound index: one progress record per user per course
courseProgressSchema.index({ courseId: 1, userId: 1 }, { unique: true });
courseProgressSchema.index({ userId: 1 });
courseProgressSchema.index({ courseId: 1 });

const CourseProgress = mongoose.model('CourseProgress', courseProgressSchema);
module.exports = CourseProgress;
