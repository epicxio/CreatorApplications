const express = require('express');
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');
const { hasPermission } = require('../middleware/permissions');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

// Lazy load kycController to avoid circular dependencies
const getKycController = () => {
  const kycController = require('../controllers/kycController');
  return kycController;
};

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPG, PNG, and PDF files are allowed.'), false);
    }
  }
});

// Error handling middleware for multer
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 5MB.'
      });
    }
  }
  if (error.message.includes('Invalid file type')) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  next(error);
};

// Debug: Log all available methods on kycController
console.log('Available kycController methods:', Object.keys(getKycController()));

// Sanity check for controller methods
[
  'getKYCProfile',
  'uploadDocument',
  'updateDocument',
  'deleteDocument',
  'getDocumentsForVerification',
  'verifyDocument',
  'getKYCStatistics',
  'getExpiringProfiles',
  'getStorageStats',
  'cleanupTempFiles',
  'getKYCProfileByUserId',
  'updateKYCProfileStatus',
  'exportKYCData',
  'bulkVerifyDocuments',
  'downloadDocument',
  'saveDraftComment',
  'getDraftHistory'
].forEach(fn => {
  if (typeof getKycController()[fn] !== 'function') {
    console.error(`KYC Controller method missing or not a function: ${fn}`);
    console.error('All available methods:', Object.keys(getKycController()));
    throw new Error(`KYC Controller method missing or not a function: ${fn}`);
  }
});

// User Routes (require authentication)
// GET /api/kyc/profile - Get user's KYC profile
router.get('/profile', auth, asyncHandler(getKycController().getKYCProfile));

// POST /api/kyc/upload - Upload KYC document
router.post('/upload', auth, upload.single('document'), handleMulterError, asyncHandler(getKycController().uploadDocument));

// PUT /api/kyc/documents/:documentId - Update existing document
router.put('/documents/:documentId', auth, upload.single('document'), handleMulterError, asyncHandler(getKycController().updateDocument));

// DELETE /api/kyc/documents/:documentId - Delete document
router.delete('/documents/:documentId', auth, asyncHandler(getKycController().deleteDocument));

// Admin Routes (require admin permissions)
// GET 
//  - Get all documents for verification
router.get('/admin/documents', 
  auth,
  hasPermission('KYC', 'View'), 
  asyncHandler(getKycController().getDocumentsForVerification)
);

// PUT /api/kyc/admin/documents/:documentId/verify - Verify document
router.put('/admin/documents/:documentId/verify', 
  auth,
  hasPermission('KYC', 'Edit'), 
  asyncHandler(getKycController().verifyDocument)
);

// GET /api/kyc/admin/statistics - Get KYC statistics
router.get('/admin/statistics', 
  auth,
  hasPermission('KYC', 'View'), 
  asyncHandler(getKycController().getKYCStatistics)
);

// GET /api/kyc/admin/expiring-profiles - Get expiring KYC profiles
router.get('/admin/expiring-profiles', 
  auth,
  hasPermission('KYC', 'View'), 
  asyncHandler(getKycController().getExpiringProfiles)
);

// GET /api/kyc/admin/storage-stats - Get storage statistics
router.get('/admin/storage-stats', 
  auth,
  hasPermission('KYC', 'View'), 
  asyncHandler(getKycController().getStorageStats)
);

// POST /api/kyc/admin/cleanup-temp - Clean up temporary files
router.post('/admin/cleanup-temp', 
  auth,
  hasPermission('KYC', 'Delete'), 
  asyncHandler(getKycController().cleanupTempFiles)
);

// GET /api/kyc/admin/users/:userId/profile - Get KYC profile by user ID
router.get('/admin/users/:userId/profile', 
  auth,
  hasPermission('KYC', 'View'), 
  asyncHandler(getKycController().getKYCProfileByUserId)
);

// PUT /api/kyc/admin/users/:userId/status - Update KYC profile status
router.put('/admin/users/:userId/status', 
  auth,
  hasPermission('KYC', 'Edit'), 
  asyncHandler(getKycController().updateKYCProfileStatus)
);

// Export routes
// GET /api/kyc/admin/users/:userId/export - Export KYC data for user
router.get('/admin/users/:userId/export', 
  auth,
  hasPermission('KYC', 'View'), 
  asyncHandler(getKycController().exportKYCData)
);

// Bulk operations
// POST /api/kyc/admin/bulk-verify - Bulk verify documents
router.post('/admin/bulk-verify', 
  auth,
  hasPermission('KYC', 'Edit'), 
  asyncHandler(getKycController().bulkVerifyDocuments)
);

// File download route (protected)
// GET /api/kyc/documents/:documentId/download - Download document file
router.get('/documents/:documentId/download', auth, asyncHandler(getKycController().downloadDocument));

// Save a draft comment to reviewDraftHistory
router.post('/documents/:documentId/draft', auth, asyncHandler(getKycController().saveDraftComment));

// Get all draft comments for a document
router.get('/documents/:documentId/draft-history', auth, asyncHandler(getKycController().getDraftHistory));

// Health check route
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'KYC API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
router.use((error, req, res, next) => {
  console.error('KYC Routes Error:', error);
  
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: Object.values(error.errors).map(err => err.message)
    });
  }
  
  if (error.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }
  
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

module.exports = router; 