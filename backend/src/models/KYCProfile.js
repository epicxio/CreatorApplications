const mongoose = require('mongoose');

const kycProfileSchema = new mongoose.Schema({
  // User reference
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },

  // Overall KYC status
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'pending_verification', 'verified', 'rejected', 'expired'],
    default: 'not_started',
    index: true
  },

  // KYC completion percentage
  completionPercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },

  // Required documents status
  requiredDocuments: {
    panCard: {
      isRequired: { type: Boolean, default: true },
      isSubmitted: { type: Boolean, default: false },
      isVerified: { type: Boolean, default: false },
      documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'KYCDocument' }
    },
    aadharCard: {
      isRequired: { type: Boolean, default: true },
      isSubmitted: { type: Boolean, default: false },
      isVerified: { type: Boolean, default: false },
      documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'KYCDocument' }
    },
    otherDocuments: [{
      documentType: { type: String, required: true },
      isRequired: { type: Boolean, default: false },
      isSubmitted: { type: Boolean, default: false },
      isVerified: { type: Boolean, default: false },
      documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'KYCDocument' }
    }]
  },

  // Verification details
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  verifiedAt: {
    type: Date
  },

  verificationRemarks: {
    type: String,
    trim: true
  },

  // KYC expiry
  kycExpiryDate: {
    type: Date
  },

  // Last submission date
  lastSubmittedAt: {
    type: Date
  },

  // Rejection details
  rejectionReason: {
    type: String,
    trim: true
  },

  rejectionDetails: [{
    documentType: String,
    reason: String,
    field: String
  }],

  // Additional metadata
  metadata: {
    type: Map,
    of: String,
    default: {}
  },

  // Audit fields
  isActive: {
    type: Boolean,
    default: true
  },

  // Version tracking
  version: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true,
  indexes: [
    { userId: 1 },
    { status: 1 },
    { completionPercentage: 1 },
    { verifiedBy: 1 },
    { createdAt: -1 }
  ]
});

// Virtual for is KYC expired
kycProfileSchema.virtual('isExpired').get(function() {
  if (!this.kycExpiryDate) return false;
  return new Date() > this.kycExpiryDate;
});

// Virtual for is KYC valid
kycProfileSchema.virtual('isValid').get(function() {
  return this.status === 'verified' && this.isActive && !this.isExpired;
});

// Virtual for days until expiry
kycProfileSchema.virtual('daysUntilExpiry').get(function() {
  if (!this.kycExpiryDate) return null;
  const now = new Date();
  const expiry = new Date(this.kycExpiryDate);
  const diffTime = expiry - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Method to calculate completion percentage
kycProfileSchema.methods.calculateCompletionPercentage = function() {
  const requiredDocs = Object.values(this.requiredDocuments).filter(doc => doc.isRequired);
  const submittedDocs = requiredDocs.filter(doc => doc.isSubmitted);
  
  if (requiredDocs.length === 0) return 100;
  
  const percentage = Math.round((submittedDocs.length / requiredDocs.length) * 100);
  this.completionPercentage = percentage;
  return percentage;
};

// Method to update status based on completion
kycProfileSchema.methods.updateStatus = function() {
  const completion = this.calculateCompletionPercentage();
  if (completion === 0) {
    this.status = 'not_started';
  } else if (completion < 100) {
    this.status = 'in_progress';
  } else if (this.status === 'not_started' || this.status === 'in_progress') {
    this.status = 'pending_verification';
  }
};

// Method to mark as verified
kycProfileSchema.methods.markAsVerified = function(verifiedBy, remarks = '') {
  this.status = 'verified';
  this.verifiedBy = verifiedBy;
  this.verifiedAt = new Date();
  this.verificationRemarks = remarks;
  this.kycExpiryDate = new Date(Date.now() + (365 * 24 * 60 * 60 * 1000)); // 1 year from now
  return this.save();
};

// Method to mark as rejected
kycProfileSchema.methods.markAsRejected = function(rejectionReason, rejectionDetails = []) {
  this.status = 'rejected';
  this.rejectionReason = rejectionReason;
  this.rejectionDetails = rejectionDetails;
  return this.save();
};

// Static method to get KYC profiles by status
kycProfileSchema.statics.getByStatus = function(status) {
  return this.find({ status, isActive: true })
    .populate('userId', 'name email userType')
    .populate('verifiedBy', 'name email')
    .sort({ createdAt: -1 });
};

// Static method to get pending verifications
kycProfileSchema.statics.getPendingVerifications = function() {
  return this.find({ 
    status: 'pending_verification',
    isActive: true 
  })
    .populate('userId', 'name email userType')
    .sort({ lastSubmittedAt: 1 });
};

// Static method to get expiring KYC profiles
kycProfileSchema.statics.getExpiringProfiles = function(daysThreshold = 30) {
  const thresholdDate = new Date(Date.now() + (daysThreshold * 24 * 60 * 60 * 1000));
  return this.find({
    status: 'verified',
    isActive: true,
    kycExpiryDate: { $lte: thresholdDate, $gt: new Date() }
  })
    .populate('userId', 'name email')
    .sort({ kycExpiryDate: 1 });
};

// Pre-save middleware to handle status updates
kycProfileSchema.pre('save', function(next) {
  if (this.isModified('requiredDocuments')) {
    this.updateStatus();
  }
  next();
});

// Ensure virtuals are included in JSON output
kycProfileSchema.set('toJSON', { virtuals: true });
kycProfileSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('KYCProfile', kycProfileSchema); 