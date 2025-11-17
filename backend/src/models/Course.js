const mongoose = require('mongoose');

// Resource schema for lesson resources
const resourceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['document', 'image', 'video', 'audio', 'archive', 'other'],
    required: true 
  },
  url: { type: String, required: true },
  size: { type: Number, default: 0 }, // in bytes
  downloadCount: { type: Number, default: 0 }
}, { _id: true });

// Audio file schema for audio lessons
const audioFileSchema = new mongoose.Schema({
  name: { type: String },
  url: { type: String, required: true },
  size: { type: Number, default: 0 },
  storagePath: { type: String },
  duration: { type: Number } // in seconds, optional
}, { _id: true });

// Quiz question schema
const quizQuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['multiple-choice', 'true-false', 'text'],
    required: true 
  },
  options: [String],
  correctAnswer: { type: mongoose.Schema.Types.Mixed, required: true },
  explanation: String,
  points: { type: Number, default: 10 }
}, { _id: true });

// Lesson content schema (supports Video, Text, Audio, Quiz, Assignment, Live)
const lessonContentSchema = new mongoose.Schema({
  // Video content
  videoUrl: String,
  thumbnailUrl: String,
  transcript: String,
  
  // Text content
  textContent: String,
  
  // Audio content
  audioUrl: String,
  audioFiles: [audioFileSchema],
  waveformData: [Number],
  
  // Quiz content
  questions: [quizQuestionSchema],
  timeLimit: Number, // in minutes
  passingScore: Number, // percentage
  
  // Assignment content
  instructions: String,
  submissionType: { 
    type: String, 
    enum: ['text', 'file', 'both'] 
  },
  maxFileSize: Number, // in MB
  allowedFileTypes: [String],
  
  // Live content
  meetingLink: String,
  meetingPlatform: { 
    type: String, 
    enum: ['Google Meet', 'Zoom', 'Webex', 'Custom Link'] 
  },
  startDateTime: Date,
  endDateTime: Date,
  preClassMessage: String,
  postClassMessage: String
}, { _id: false });

// Lesson schema
const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  type: { 
    type: String, 
    enum: ['Video', 'Text', 'Audio', 'Quiz', 'Assignment', 'Live'],
    required: true 
  },
  duration: { type: Number, default: 0 }, // in minutes
  order: { type: Number, required: true },
  isUnlocked: { type: Boolean, default: true },
  unlockDate: Date,
  content: { type: lessonContentSchema, required: true },
  resources: [resourceSchema]
}, { _id: true, timestamps: true });

// Drip method schema
const dripMethodSchema = new mongoose.Schema({
  moduleId: { type: String, required: true },
  method: { 
    type: String, 
    enum: ['immediate', 'days', 'date'],
    required: true 
  },
  action: mongoose.Schema.Types.Mixed, // can be number (days) or string (date)
  unlockDate: Date // calculated date when method is 'date'
}, { _id: false });

// Module schema
const moduleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  order: { type: Number, required: true },
  lessons: [lessonSchema],
  isUnlocked: { type: Boolean, default: true },
  unlockDate: Date
}, { _id: true, timestamps: true });

// Certificate signature schema
const certificateSignatureSchema = new mongoose.Schema({
  name: { type: String, required: true },
  designation: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['upload', 'draw'],
    required: true 
  },
  image: String, // base64 or URL
  enabled: { type: Boolean, default: true },
  isDefault: { type: Boolean, default: false }
}, { _id: true });

// FAQ schema
const faqSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true }
}, { _id: true });

// Course schema
const courseSchema = new mongoose.Schema({
  // Course ID (auto-generated: C-{creator initials}-{number})
  courseId: { type: String, unique: true, sparse: true },
  
  // Step 1: Course Details
  name: { type: String, required: true },
  subtitle: String,
  description: { type: String, required: true },
  coverImage: String, // URL or base64
  
  // Instructor reference
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Course metadata
  category: { type: String, required: true },
  level: { 
    type: String, 
    enum: ['Beginner', 'Intermediate', 'Advanced', 'NA'],
    required: true 
  },
  language: { type: String, default: 'English' },
  tags: [String],
  visibility: { 
    type: String, 
    enum: ['Public', 'Unlisted', 'Private'],
    default: 'Public' 
  },
  
  // Step 2: Curriculum
  modules: [moduleSchema],
  duration: { type: Number, default: 0 }, // total duration in minutes
  
  // Step 3: Drip Content
  dripEnabled: { type: Boolean, default: false },
  dripMethods: [dripMethodSchema],
  dripDisplayOption: { 
    type: String, 
    enum: ['title', 'titleAndLessons', 'hide'],
    default: 'titleAndLessons' 
  },
  dripHideUnlockDate: { type: Boolean, default: false },
  dripSendCommunication: { type: Boolean, default: false },
  
  // Step 4: Certificate
  certificateEnabled: { type: Boolean, default: false },
  certificateTemplate: { type: String, default: '1' },
  certificateTitle: { type: String, default: 'Certificate of Completion' },
  certificateDescription: { 
    type: String, 
    default: 'This is to certify that [Name] has successfully completed the course' 
  },
  certificateCompletionPercentage: { type: Number, default: 100 },
  certificateApplicationLogoEnabled: { type: Boolean, default: true },
  certificateSignatures: [certificateSignatureSchema],
  certificateCreatorLogo: String, // URL or base64
  
  // Step 5: Payment Details
  // Pricing
  listedPrice: {
    INR: { type: Number, default: 0 },
    USD: { type: Number, default: 0 },
    EUR: { type: Number, default: 0 },
    GBP: { type: Number, default: 0 }
  },
  sellingPrice: {
    INR: { type: Number, default: 0 },
    USD: { type: Number, default: 0 },
    EUR: { type: Number, default: 0 },
    GBP: { type: Number, default: 0 }
  },
  // Pricing mode
  globalPricingEnabled: { type: Boolean, default: true },
  currencySpecificPricingEnabled: { type: Boolean, default: false },
  // EMI/Installments
  installmentsOn: { type: Boolean, default: false },
  installmentPeriod: { type: Number, default: 30 }, // days
  numberOfInstallments: { type: Number, default: 3 },
  bufferTime: { type: Number, default: 7 }, // days
  
  // Step 6: Additional Details
  affiliateActive: { type: Boolean, default: false },
  affiliateRewardPercentage: { type: Number, default: 10 },
  watermarkRemovalEnabled: { type: Boolean, default: false },
  faqs: [faqSchema],
  
  // Course status and access
  status: { 
    type: String, 
    enum: ['Draft', 'Published', 'Live & Selling', 'Paused', 'Archived'],
    default: 'Draft' 
  },
  access: {
    mode: { 
      type: String, 
      enum: ['Lifetime', 'Date-Range'],
      default: 'Lifetime' 
    },
    startDate: Date,
    endDate: Date
  },
  
  // Course type (Free/Paid/Invite Only)
  type: { 
    type: String, 
    enum: ['Free', 'Paid', 'Invite Only'],
    default: 'Free' 
  },
  
  // Statistics
  enrollments: { type: Number, default: 0 },
  completionRate: { type: Number, default: 0 },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

// Update lastUpdated on save
courseSchema.pre('save', async function(next) {
  this.lastUpdated = new Date();
  
  // Calculate total duration from modules
  if (this.modules && this.modules.length > 0) {
    let totalDuration = 0;
    this.modules.forEach(module => {
      if (module.lessons && module.lessons.length > 0) {
        module.lessons.forEach(lesson => {
          totalDuration += lesson.duration || 0;
        });
      }
    });
    this.duration = totalDuration;
  }
  
  // Determine course type based on pricing
  if (this.sellingPrice && (this.sellingPrice.INR > 0 || this.sellingPrice.USD > 0 || this.sellingPrice.EUR > 0 || this.sellingPrice.GBP > 0)) {
    this.type = 'Paid';
  } else {
    this.type = 'Free';
  }
  
  // Generate courseId if not exists and instructor is populated
  if (this.isNew && !this.courseId && this.instructor) {
    try {
      // If instructor is already populated (object), use it directly
      // Otherwise, we'll generate it in the controller after populating
      if (typeof this.instructor === 'object' && this.instructor.name) {
        this.courseId = await generateCourseId(this.instructor.name);
      }
    } catch (error) {
      console.error('Error generating courseId:', error);
      // Continue without courseId - will be generated in controller
    }
  }
  
  next();
});

// Function to generate course ID: C-{first 3 letters of creator name}-{number}
async function generateCourseId(creatorName) {
  // Get first 3 letters of creator name (uppercase, remove spaces)
  const creatorInitials = creatorName
    .replace(/\s+/g, '') // Remove spaces
    .substring(0, 3)
    .toUpperCase()
    .padEnd(3, 'X'); // Pad with X if less than 3 characters
  
  // Find the last course with this creator's prefix
  const prefix = `C-${creatorInitials}-`;
  const lastCourse = await mongoose.model('Course').findOne(
    { courseId: { $regex: `^${prefix}\\d+$` } },
    {},
    { sort: { courseId: -1 } }
  );
  
  let nextNumber = 1;
  if (lastCourse && lastCourse.courseId) {
    const lastNumber = parseInt(lastCourse.courseId.replace(prefix, ''));
    nextNumber = lastNumber + 1;
  }
  
  return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
}

// Export the function for use in controller
courseSchema.statics.generateCourseId = generateCourseId;

// Indexes for efficient querying
courseSchema.index({ instructor: 1, status: 1 });
courseSchema.index({ category: 1, level: 1 });
courseSchema.index({ tags: 1 });
courseSchema.index({ status: 1, visibility: 1 });
courseSchema.index({ createdAt: -1 });
courseSchema.index({ courseId: 1 }); // Index for courseId lookups

module.exports = mongoose.model('Course', courseSchema);

