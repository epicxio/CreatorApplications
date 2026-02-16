const mongoose = require('mongoose');

const courseOrderSchema = new mongoose.Schema({
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
  amount: { type: Number, required: true },
  currency: { type: String, required: true, default: 'INR' },
  paymentMethod: { type: String, required: true }, // e.g. 'Credit/Debit Cards', 'Buy Now Pay Later', 'UPI'
  status: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'paid'
  },
  paidAt: { type: Date, default: Date.now },
  gatewayOrderId: { type: String }, // for future gateway integration
  gateway: { type: String }, // e.g. 'stripe', 'razorpay', 'bnpl_simpl'
  // Affiliate attribution
  affiliateCodeId: { type: mongoose.Schema.Types.ObjectId, ref: 'AffiliateCode' },
  affiliateRewardAmount: { type: Number },
  affiliateRewardCurrency: { type: String }
}, {
  timestamps: true,
  collection: 'courseorders'
});

courseOrderSchema.index({ courseId: 1, userId: 1 });
courseOrderSchema.index({ userId: 1 });
courseOrderSchema.index({ status: 1 });

const CourseOrder = mongoose.model('CourseOrder', courseOrderSchema);
module.exports = CourseOrder;
