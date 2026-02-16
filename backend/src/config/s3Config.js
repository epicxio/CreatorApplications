require('dotenv').config();

/**
 * AWS S3 Configuration (AWS SDK v3)
 * 
 * This module exports the S3 configuration and client setup.
 * Make sure to set the following environment variables:
 * - AWS_ACCESS_KEY_ID
 * - AWS_SECRET_ACCESS_KEY
 * - AWS_REGION
 * - AWS_S3_BUCKET
 */

const { S3Client } = require('@aws-sdk/client-s3');

// Validate required environment variables
const requiredEnvVars = [
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_REGION',
  'AWS_S3_BUCKET'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.warn(`⚠️  Missing S3 environment variables: ${missingVars.join(', ')}`);
  console.warn('S3 functionality will be disabled. Please set these variables in your .env file.');
}

// Trim credentials to remove any whitespace and validate
// Also remove any newlines, carriage returns, or other control characters
const accessKeyId = process.env.AWS_ACCESS_KEY_ID 
  ? process.env.AWS_ACCESS_KEY_ID.trim().replace(/[\r\n\t]/g, '') 
  : undefined;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY 
  ? process.env.AWS_SECRET_ACCESS_KEY.trim().replace(/[\r\n\t]/g, '') 
  : undefined;
const region = process.env.AWS_REGION 
  ? process.env.AWS_REGION.trim().replace(/[\r\n\t]/g, '') 
  : 'ap-south-1';
const bucket = process.env.AWS_S3_BUCKET 
  ? process.env.AWS_S3_BUCKET.trim().replace(/[\r\n\t]/g, '') 
  : 'creator-applications';

// Validate credentials are present
if (accessKeyId && secretAccessKey) {
  console.log('✅ S3 credentials loaded');
  console.log('   Region:', region);
  console.log('   Bucket:', bucket);
  console.log('   Access Key:', accessKeyId.substring(0, 4) + '...');
} else {
  console.warn('⚠️  S3 credentials not fully configured');
}

// Create S3 client factory function to ensure fresh credentials
const createS3Client = () => {
  // Re-read credentials to ensure we have the latest values
  const currentAccessKeyId = process.env.AWS_ACCESS_KEY_ID 
    ? process.env.AWS_ACCESS_KEY_ID.trim().replace(/[\r\n\t]/g, '') 
    : undefined;
  const currentSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY 
    ? process.env.AWS_SECRET_ACCESS_KEY.trim().replace(/[\r\n\t]/g, '') 
    : undefined;
  const currentRegion = process.env.AWS_REGION 
    ? process.env.AWS_REGION.trim().replace(/[\r\n\t]/g, '') 
    : 'ap-south-1';

  if (currentAccessKeyId && currentSecretAccessKey) {
    return new S3Client({
      region: currentRegion,
      credentials: {
        accessKeyId: currentAccessKeyId,
        secretAccessKey: currentSecretAccessKey
      }
    });
  } else {
    // Create a dummy client that will fail gracefully
    return new S3Client({
      region: currentRegion,
      credentials: {
        accessKeyId: '',
        secretAccessKey: ''
      }
    });
  }
};

// Create initial S3 client
let s3 = createS3Client();

// S3 Configuration
const s3Config = {
  bucket: bucket,
  region: region,
  // URL expiration for presigned URLs (in seconds)
  presignedUrlExpiration: 3600, // 1 hour
  // Maximum file sizes (in bytes)
  maxFileSizes: {
    video: 500 * 1024 * 1024,      // 500MB
    audio: 50 * 1024 * 1024,        // 50MB
    document: 10 * 1024 * 1024,     // 10MB
    image: 10 * 1024 * 1024,        // 10MB (increased to match resource upload limit)
    certificate: 5 * 1024 * 1024,   // 5MB
    certificateTemplate: 10 * 1024 * 1024, // 10MB - creator upload per course (generated PDFs with images)
    kyc: 5 * 1024 * 1024            // 5MB - KYC identity documents
  },
  // Allowed MIME types
  allowedMimeTypes: {
    video: [
      'video/mp4',
      'video/mpeg',
      'video/quicktime',
      'video/x-msvideo',
      'video/webm',
      'video/x-matroska'
    ],
    audio: [
      'audio/mpeg',
      'audio/mp3',
      'audio/wav',
      'audio/ogg',
      'audio/aac',
      'audio/x-m4a'
    ],
    document: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ],
    image: [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      'image/bmp',
      'image/x-png', // Alternative PNG MIME type
      'image/pjpeg' // Alternative JPEG MIME type
    ],
    certificate: [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'application/pdf'
    ],
    certificateTemplate: ['application/pdf'],
    kyc: [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'application/pdf'
    ]
  }
};

// Check if S3 is properly configured
const isS3Configured = () => {
  return missingVars.length === 0 && 
         accessKeyId && 
         secretAccessKey &&
         bucket;
};

module.exports = {
  s3,
  s3Config,
  isS3Configured,
  createS3Client // Export factory function for creating fresh clients
};

