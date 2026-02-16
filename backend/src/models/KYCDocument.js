const mongoose = require('mongoose');

const kycDocumentSchema = new mongoose.Schema({
  // User reference
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Document type and details
  documentType: {
    type: String,
    enum: ['pan_card', 'aadhar_card', 'passport', 'driving_license', 'voter_id', 'other'],
    required: true
  },

  // Document metadata
  documentName: {
    type: String,
    required: true,
    trim: true
  },

  documentNumber: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },

  // File storage details
  fileName: {
    type: String,
    required: true
  },

  originalFileName: {
    type: String,
    required: true
  },

  filePath: {
    type: String,
    required: true
  },

  // S3 key when document is stored in S3 (users/{userId}/kyc/{documentType}/{filename})
  s3Key: {
    type: String,
    default: null
  },

  fileSize: {
    type: Number,
    required: true
  },

  mimeType: {
    type: String,
    required: true
  },

  // Verification status
  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected', 'expired'],
    default: 'pending',
    index: true
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

  // Draft comments history (array of objects)
  reviewDraftHistory: [
    {
      comment: { type: String, trim: true },
      createdAt: { type: Date, default: Date.now },
      reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }
  ],

  // Document expiry (if applicable)
  expiryDate: {
    type: Date
  },

  // Additional metadata
  metadata: {
    type: Map,
    of: String,
    default: {}
  },

  // Security and audit
  isActive: {
    type: Boolean,
    default: true
  },

  // Version control for document updates
  version: {
    type: Number,
    default: 1
  },

  previousVersions: [{
    filePath: String,
    fileName: String,
    updatedAt: Date,
    reason: String
  }],

  // Soft delete
  deletedAt: {
    type: Date
  },

  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  // Indexes for better query performance
  indexes: [
    { userId: 1, documentType: 1 },
    { userId: 1, status: 1 },
    { documentType: 1, status: 1 },
    { verifiedBy: 1 },
    { createdAt: -1 }
  ]
});

// Virtual for document type display name
kycDocumentSchema.virtual('documentTypeDisplay').get(function() {
  const typeMap = {
    'pan_card': 'PAN Card',
    'aadhar_card': 'Aadhar Card',
    'passport': 'Passport',
    'driving_license': 'Driving License',
    'voter_id': 'Voter ID',
    'other': 'Other Document'
  };
  return typeMap[this.documentType] || this.documentType;
});

// Virtual for file extension
kycDocumentSchema.virtual('fileExtension').get(function() {
  return this.fileName.split('.').pop().toLowerCase();
});

// Virtual for is expired
kycDocumentSchema.virtual('isExpired').get(function() {
  if (!this.expiryDate) return false;
  return new Date() > this.expiryDate;
});

// Method to check if document is valid
kycDocumentSchema.methods.isValid = function() {
  return this.status === 'verified' && this.isActive && !this.isExpired;
};

// Method to soft delete document
kycDocumentSchema.methods.softDelete = function(deletedBy) {
  this.deletedAt = new Date();
  this.deletedBy = deletedBy;
  this.isActive = false;
  return this.save();
};

// Method to restore document
kycDocumentSchema.methods.restore = function() {
  this.deletedAt = undefined;
  this.deletedBy = undefined;
  this.isActive = true;
  return this.save();
};

// Static method to get active documents by user
kycDocumentSchema.statics.getActiveByUser = function(userId) {
  return this.find({
    userId,
    isActive: true,
    deletedAt: { $exists: false }
  }).sort({ createdAt: -1 });
};

// Static method to get documents by type and status
kycDocumentSchema.statics.getByTypeAndStatus = function(documentType, status) {
  return this.find({
    documentType,
    status,
    isActive: true,
    deletedAt: { $exists: false }
  }).populate('userId', 'name email');
};

// Pre-save middleware to handle versioning
kycDocumentSchema.pre('save', function(next) {
  if (this.isModified('filePath') && !this.isNew) {
    // Store previous version
    if (this.previousVersions.length >= 5) {
      this.previousVersions.shift(); // Keep only last 5 versions
    }
    
    this.previousVersions.push({
      filePath: this.filePath,
      fileName: this.fileName,
      updatedAt: new Date(),
      reason: 'Document updated'
    });
    
    this.version += 1;
  }
  next();
});

// Ensure virtuals are included in JSON output
kycDocumentSchema.set('toJSON', { virtuals: true });
kycDocumentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('KYCDocument', kycDocumentSchema); 