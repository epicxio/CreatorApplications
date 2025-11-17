const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Core user fields (required for all user types)
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  username: { type: String, unique: true, sparse: true },
  phoneNumber: { type: String, unique: true, sparse: true },
  passwordHash: { type: String, required: true },
  userType: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'UserType', 
    required: true 
  },
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    required: true
  },
  status: { type: String, enum: ['active', 'inactive', 'pending', 'rejected', 'deleted'], default: 'active' },
  
  // User IDs
  userId: { type: String, unique: true, sparse: true }, // Universal user ID for all types
  creatorId: { type: String, unique: true, sparse: true }, // CA00001 format for creators only
  
  // Authentication & security fields
  lastLogin: { type: Date },
  passwordResetRequired: { type: Boolean, default: false },
  temporaryPassword: { type: String },
  
  // Organization/Corporate fields (for employees, admins)
  organization: { type: String },
  department: { type: String },
  grade: { type: String },
  class: { type: String },
  
  // Creator-specific fields (for creators, influencers)
  bio: { type: String },
  socialMedia: {
    instagram: { type: String },
    facebook: { type: String },
    youtube: { type: String },
    tiktok: { type: String },
    twitter: { type: String },
    linkedin: { type: String }
  },
  
  // Brand-specific fields (for brands, companies)
  companyName: { type: String },
  industry: { type: String },
  website: { type: String },
  
  // Account Manager specific fields
  assignedClients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  assignedScreens: [{ type: String }],
  
  // Common metadata
  profileImage: { type: String },
  address: {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String },
    zipCode: { type: String }
  },
  
  // Verification fields
  isEmailVerified: { type: Boolean, default: false },
  isPhoneVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  
  // Creator categories & subcategories
  categories: [
    {
      mainCategoryId: { type: String, required: true },
      subCategoryIds: [{ type: String, required: true }]
    }
  ],
  
  // Preferences
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false }
    },
    language: { type: String, default: 'en' },
    timezone: { type: String, default: 'UTC' }
  }
}, { 
  timestamps: true,
  // Add indexes for better query performance
  indexes: [
    { email: 1 },
    { userType: 1 },
    { status: 1 },
    { userId: 1 },
    { creatorId: 1 },
    { 'socialMedia.instagram': 1 }
  ]
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return this.name;
});

// Method to get user type name
userSchema.methods.getUserTypeName = function() {
  return this.userType ? this.userType.name : 'Unknown';
};

// Method to check if user is creator
userSchema.methods.isCreator = function() {
  return this.userType && this.userType.name === 'creator';
};

// Method to check if user is admin
userSchema.methods.isAdmin = function() {
  return this.userType && ['admin', 'superadmin'].includes(this.userType.name);
};

// Method to check if user is brand
userSchema.methods.isBrand = function() {
  return this.userType && this.userType.name === 'brand';
};

// Pre-save middleware to generate user IDs if needed
userSchema.pre('save', async function(next) {
  // Generate universal user ID if not exists
  if (this.isNew && !this.userId) {
    this.userId = await generateUserId(this.userType);
  }
  
  // Always generate creatorId for new creators
  if (this.isNew && !this.creatorId) {
    // Always fetch the creator UserType ObjectId
    const UserType = require('./UserType');
    const creatorType = await UserType.findOne({ name: 'creator' });
    if (creatorType && this.userType && this.userType.toString() === creatorType._id.toString()) {
    this.creatorId = await generateCreatorId();
    }
  }
  next();
});

// Function to generate universal user ID
async function generateUserId(userType) {
  const prefix = getUserTypePrefix(userType);
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}${timestamp}${random}`;
}

// Function to generate creator ID
async function generateCreatorId() {
  const lastCreator = await mongoose.model('User').findOne(
    { creatorId: { $regex: /^CA\d+$/ } },
    {},
    { sort: { creatorId: -1 } }
  );
  
  let nextNumber = 1;
  if (lastCreator && lastCreator.creatorId) {
    const lastNumber = parseInt(lastCreator.creatorId.replace('CA', ''));
    nextNumber = lastNumber + 1;
  }
  
  return `CA${nextNumber.toString().padStart(5, '0')}`;
}

// Function to get prefix based on user type
function getUserTypePrefix(userType) {
  const typeMap = {
    'superadmin': 'SA',
    'admin': 'AD',
    'creator': 'CR',
    'brand': 'BR',
    'accountmanager': 'AM',
    'employee': 'EM',
    'ceo creator': 'CC'
  };
  
  return typeMap[userType?.name?.toLowerCase()] || 'US';
}

// Static method to get users by type
userSchema.statics.getByType = function(userTypeName) {
  return this.find({}).populate({
    path: 'userType',
    match: { name: userTypeName }
  }).then(users => users.filter(user => user.userType));
};

// Static method to get creators
userSchema.statics.getCreators = function() {
  return this.getByType('creator');
};

// Static method to get admins
userSchema.statics.getAdmins = function() {
  return this.find({}).populate({
    path: 'userType',
    match: { name: { $in: ['admin', 'superadmin'] } }
  }).then(users => users.filter(user => user.userType));
};

module.exports = mongoose.model('User', userSchema); 