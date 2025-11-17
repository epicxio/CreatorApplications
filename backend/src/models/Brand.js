const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  website: {
    type: String,
    trim: true
  },
  industry: {
    type: String,
    required: true,
    enum: ['Fashion', 'Technology', 'Food', 'Health', 'Education', 'Entertainment', 'Other']
  },
  companySize: {
    type: String,
    enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']
  },
  description: {
    type: String,
    maxLength: 1000
  },
  logo: {
    type: String // URL to S3 bucket
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  role: {
    type: String,
    default: 'brand'
  }
}, {
  timestamps: true
});

// Only keep one index for companyName
brandSchema.index({ companyName: 1 });

const Brand = mongoose.model('Brand', brandSchema);

module.exports = Brand; 