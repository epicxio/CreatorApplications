const mongoose = require('mongoose');

const courseEnrollmentSchema = new mongoose.Schema({
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
  enrolledAt: {
    type: Date,
    default: Date.now,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'dropped'],
    default: 'active'
  },
  completedAt: { type: Date },
  /** When the user first reached the certificate completion % (for display on certificate) */
  certificateEarnedAt: { type: Date },
  certificateIssuedAt: { type: Date },
  certificateUrl: { type: String }
}, {
  timestamps: true,
  collection: 'courseenrollments'
});

// Unique compound index: one enrollment per user per course
courseEnrollmentSchema.index({ courseId: 1, userId: 1 }, { unique: true });
courseEnrollmentSchema.index({ userId: 1 });
courseEnrollmentSchema.index({ courseId: 1 });

const CourseEnrollment = mongoose.model('CourseEnrollment', courseEnrollmentSchema);
module.exports = CourseEnrollment;
