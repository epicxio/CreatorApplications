const mongoose = require('mongoose');

/**
 * Affiliate code: links a promoter (affiliateUserId) to a course with a unique code.
 * When a learner visits with ?ref=CODE and completes checkout, the order is attributed
 * to this affiliate and reward is calculated from course.affiliateRewardPercentage.
 */
const affiliateCodeSchema = new mongoose.Schema({
  affiliateUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  /** Unique code per course (e.g. "JOHN", "MARIA10"). Used in ?ref=CODE. */
  code: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  /** Optional display name for the affiliate (e.g. "John's link") */
  displayName: { type: String, trim: true },
  status: {
    type: String,
    enum: ['active', 'paused'],
    default: 'active'
  },
  /** Number of times the affiliate link was used (optional; can be incremented on visit) */
  clicks: { type: Number, default: 0 },
  /** Number of successful referrals (paid orders attributed to this code) */
  conversions: { type: Number, default: 0 },
  /** Earnings per currency, e.g. { INR: 1000, USD: 12 } */
  earningsByCurrency: {
    type: mongoose.Schema.Types.Mixed,
    default: () => ({ INR: 0, USD: 0, EUR: 0, GBP: 0 })
  }
}, {
  timestamps: true,
  collection: 'affiliatecodes'
});

affiliateCodeSchema.index({ courseId: 1, code: 1 }, { unique: true });
affiliateCodeSchema.index({ affiliateUserId: 1 });
affiliateCodeSchema.index({ courseId: 1 });

const AffiliateCode = mongoose.model('AffiliateCode', affiliateCodeSchema);
module.exports = AffiliateCode;
