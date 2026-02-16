const s3Service = require('../services/s3Service');
const { isS3Configured } = require('../config/s3Config');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

/**
 * S3 Upload Helper
 * 
 * Provides multer storage engine for S3 uploads
 * Works seamlessly with existing multer setup
 */

// Memory storage for S3 (we'll upload from memory buffer)
const memoryStorage = multer.memoryStorage();

/**
 * Create multer instance for S3 uploads
 * @param {Object} options - Upload options
 * @returns {multer.Multer} Multer instance
 */
const createS3Multer = (options = {}) => {
  const {
    fileFilter,
    limits = {}
  } = options;

  return multer({
    storage: memoryStorage,
    fileFilter: fileFilter,
    limits: limits
  });
};

/**
 * Upload file to S3 after multer processing
 * @param {Object} file - Multer file object
 * @param {string} type - 'creator' or 'student'
 * @param {string} userId - Creator ID or Student ID
 * @param {string} fileType - 'video', 'audio', 'document', 'image', 'thumbnail', 'certificate'
 * @param {string} courseId - Course ID (required for creator files)
 * @returns {Promise<Object>} Upload result
 */
const uploadToS3 = async (file, type, userId, fileType, courseId = null) => {
  if (!isS3Configured()) {
    throw new Error('S3 is not configured. Please set AWS credentials in environment variables.');
  }

  // Validate file
  const validation = s3Service.validateFile(file, fileType);
  if (!validation.isValid) {
    throw new Error(`File validation failed: ${validation.errors.join(', ')}`);
  }

  // Generate unique filename
  const uniqueFilename = s3Service.generateUniqueFilename(file.originalname);

  // Generate S3 key
  const s3Key = s3Service.generateS3Key(type, userId, fileType, courseId, uniqueFilename);

  // Upload to S3
  const result = await s3Service.uploadFile(
    file.buffer,
    s3Key,
    file.mimetype,
    {
      originalName: file.originalname,
      uploadedBy: userId,
      courseId: courseId || 'N/A',
      fileType: fileType
    }
  );

  return {
    success: true,
    filename: uniqueFilename,
    originalName: file.originalname,
    s3Key: result.key,
    url: result.url,
    presignedUrl: await s3Service.getPresignedUrl(result.key),
    size: file.size,
    mimetype: file.mimetype,
    location: result.location,
    bucket: result.bucket
  };
};

/**
 * Upload multiple files to S3
 * @param {Array} files - Array of multer file objects
 * @param {string} type - 'creator' or 'student'
 * @param {string} userId - Creator ID or Student ID
 * @param {string} fileType - File type
 * @param {string} courseId - Course ID
 * @returns {Promise<Array>} Array of upload results
 */
const uploadMultipleToS3 = async (files, type, userId, fileType, courseId = null) => {
  const uploadPromises = files.map(file => 
    uploadToS3(file, type, userId, fileType, courseId)
  );
  
  return Promise.all(uploadPromises);
};

/**
 * Delete file from S3
 * @param {string} s3Key - S3 key
 * @returns {Promise<Object>} Delete result
 */
const deleteFromS3 = async (s3Key) => {
  if (!isS3Configured()) {
    throw new Error('S3 is not configured');
  }

  return await s3Service.deleteFile(s3Key);
};

/**
 * Get presigned URL for file access
 * @param {string} s3Key - S3 key
 * @param {number} expiration - Expiration in seconds
 * @returns {Promise<string>} Presigned URL
 */
const getPresignedUrl = async (s3Key, expiration = 3600) => {
  if (!isS3Configured()) {
    throw new Error('S3 is not configured');
  }

  return await s3Service.getPresignedUrl(s3Key, expiration);
};

module.exports = {
  createS3Multer,
  uploadToS3,
  uploadMultipleToS3,
  deleteFromS3,
  getPresignedUrl
};

