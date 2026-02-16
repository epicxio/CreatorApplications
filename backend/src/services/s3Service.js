const { s3: defaultS3, s3Config, isS3Configured, createS3Client } = require('../config/s3Config');
const { 
  PutObjectCommand, 
  GetObjectCommand, 
  DeleteObjectCommand, 
  DeleteObjectsCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  CopyObjectCommand
} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

/**
 * S3 Service
 * 
 * Handles all S3 operations including upload, download, delete, and presigned URL generation.
 * 
 * Folder Structure:
 * - creators/{creatorId}/courses/{courseId}/videos|audio|documents|images|.../{filename}
 * - students/{studentId}/certificates/{courseId}/{filename}
 * - users/{userId}/kyc/{documentType}/{filename}  (KYC identity documents)
 */

class S3Service {
  constructor() {
    if (!isS3Configured()) {
      console.warn('⚠️  S3 is not properly configured. File operations will fail.');
    }
  }

  /**
   * Generate S3 key (path) for a file
   * @param {string} type - 'creator' | 'student' | 'user'
   * @param {string} userId - Creator ID, Student ID, or User ID
   * @param {string} fileType - For creator: 'videos'|'audio'|'documents'|etc. For user: 'kyc'
   * @param {string} courseIdOrDocumentType - Course ID (creator/student) or documentType (user/kyc)
   * @param {string} filename - Filename
   * @returns {string} S3 key
   */
  generateS3Key(type, userId, fileType, courseIdOrDocumentType, filename) {
    // fileType here is the folder name (e.g., 'videos', 'images', 'documents')
    // Filename should already be sanitized by generateUniqueFilename
    // S3 keys should be UTF-8 strings, not URL-encoded
    const safeUserId = String(userId).replace(/[^\w\-]/g, '');
    const safeCourseId = String(courseIdOrDocumentType).replace(/[^\w\-]/g, '');
    const safeFileType = String(fileType).replace(/[^\w\-]/g, '');
    
    // Ensure filename is ASCII-safe for S3 key (S3 keys should be ASCII-compatible)
    let safeFilename = String(filename);
    try {
      safeFilename = Buffer.from(safeFilename, 'utf8').toString('ascii');
      if (safeFilename.includes('?')) {
        safeFilename = Buffer.from(String(filename), 'utf8')
          .toString('ascii')
          .replace(/[^\x20-\x7E]/g, '_')
          .replace(/\?/g, '_');
      }
    } catch (e) {
      const ext = path.extname(String(filename));
      safeFilename = `file${ext}`;
      console.warn('⚠️  Using fallback filename due to encoding issue');
    }
    
    if (type === 'creator') {
      if (!courseIdOrDocumentType) {
        throw new Error('Course ID is required for creator files');
      }
      const s3Key = `creators/${safeUserId}/courses/${safeCourseId}/${safeFileType}/${safeFilename}`;
      console.log('📦 Generated S3 Key:', s3Key);
      return s3Key;
    } else if (type === 'student') {
      if (fileType === 'certificate') {
        if (!courseIdOrDocumentType) {
          throw new Error('Course ID is required for student certificates');
        }
        return `students/${safeUserId}/certificates/${safeCourseId}/${safeFilename}`;
      }
      throw new Error(`Invalid file type for student: ${fileType}`);
    } else if (type === 'user') {
      // KYC: users/{userId}/kyc/{documentType}/{filename}
      if (fileType !== 'kyc') {
        throw new Error('Invalid file type for user. Only "kyc" is supported.');
      }
      const safeDocumentType = String(courseIdOrDocumentType).replace(/[^\w\-]/g, '');
      return `users/${safeUserId}/kyc/${safeDocumentType}/${safeFilename}`;
    }
    throw new Error(`Invalid type: ${type}. Must be 'creator', 'student', or 'user'`);
  }

  /**
   * Generate unique filename
   * @param {string} originalName - Original filename
   * @returns {string} Unique filename
   */
  generateUniqueFilename(originalName) {
    // Log original filename for debugging
    console.log('📝 Original filename:', originalName);
    console.log('📝 Original filename bytes:', Buffer.from(originalName).toString('hex'));
    
    // Normalize the filename to handle encoding issues
    let normalizedName = originalName;
    try {
      // Handle potential encoding issues - try to fix corrupted UTF-8
      // If the filename appears to be double-encoded or has encoding issues, fix it
      if (originalName.includes('â') || originalName.includes('Â')) {
        // Likely a UTF-8 encoding issue - try to fix
        normalizedName = Buffer.from(originalName, 'latin1').toString('utf8');
        console.log('📝 Normalized filename:', normalizedName);
      }
    } catch (e) {
      console.warn('⚠️  Filename normalization failed:', e.message);
      normalizedName = originalName;
    }
    
    const ext = path.extname(normalizedName);
    let baseName = path.basename(normalizedName, ext);
    
    // Sanitize filename: remove/replace special characters that cause encoding issues
    // First, replace any non-ASCII characters and special symbols
    baseName = baseName
      .normalize('NFD') // Normalize to decomposed form
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/[^\x00-\x7F]/g, '_') // Replace any remaining non-ASCII with underscore
      .replace(/[^\w\-_\.]/g, '_') // Replace any non-word, non-hyphen, non-underscore, non-dot characters
      .replace(/\s+/g, '_') // Replace spaces with underscores
      .replace(/_{2,}/g, '_') // Replace multiple underscores with single
      .replace(/^_+|_+$/g, '') // Remove leading/trailing underscores
      .substring(0, 100); // Limit length to avoid issues
    
    // If baseName is empty after sanitization, use a default
    if (!baseName || baseName.trim() === '') {
      baseName = 'file';
    }
    
    const timestamp = Date.now();
    const uuid = uuidv4().substring(0, 8);
    const finalFilename = `${timestamp}-${uuid}-${baseName}${ext}`;
    console.log('✅ Final sanitized filename:', finalFilename);
    return finalFilename;
  }

  /**
   * Validate file
   * @param {Object} file - File object with mimetype and size
   * @param {string} fileType - Type of file
   * @returns {Object} Validation result
   */
  validateFile(file, fileType) {
    const errors = [];

    // Check file size
    const maxSize = s3Config.maxFileSizes[fileType];
    if (!maxSize) {
      errors.push(`Invalid file type: ${fileType}`);
    } else if (file.size > maxSize) {
      errors.push(`File size exceeds maximum allowed size of ${maxSize / 1024 / 1024}MB`);
    }

    // Check MIME type
    const allowedTypes = s3Config.allowedMimeTypes[fileType];
    if (!allowedTypes) {
      errors.push(`Invalid file type: ${fileType}`);
    } else if (!allowedTypes.includes(file.mimetype)) {
      errors.push(`Invalid MIME type: ${file.mimetype}. Allowed types: ${allowedTypes.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Upload file to S3
   * @param {Buffer} fileBuffer - File buffer
   * @param {string} s3Key - S3 key (path)
   * @param {string} contentType - MIME type
   * @param {Object} metadata - Optional metadata
   * @returns {Promise<Object>} Upload result with URL and key
   */
  async uploadFile(fileBuffer, s3Key, contentType, metadata = {}) {
    if (!isS3Configured()) {
      throw new Error('S3 is not properly configured');
    }

    // Ensure S3 key is valid UTF-8 and doesn't have encoding issues
    let validS3Key = s3Key;
    try {
      // Verify the key is valid UTF-8
      Buffer.from(s3Key, 'utf8').toString('utf8');
    } catch (e) {
      // If not valid, try to fix it
      validS3Key = Buffer.from(s3Key, 'latin1').toString('utf8');
      console.warn('⚠️  Fixed S3 key encoding');
    }

    // S3 metadata keys must be lowercase and can only contain certain characters
    // Metadata values must be HTTP header-safe (no newlines, control chars, or special chars)
    // S3 metadata values are sent as HTTP headers (x-amz-meta-*), so they must be header-safe
    const sanitizeMetadataValue = (value) => {
      let str = String(value);
      try {
        // Remove or replace characters that are invalid in HTTP headers
        // HTTP headers cannot contain: \r, \n, and certain control characters
        str = str
          .replace(/[\r\n\t]/g, ' ') // Replace newlines and tabs with spaces
          .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
          .replace(/[^\x20-\x7E]/g, '_'); // Replace non-ASCII with underscore
        
        // Ensure it's a valid ASCII string
        str = Buffer.from(str, 'utf8').toString('ascii');
        
        // If conversion produced replacement characters, clean them up
        if (str.includes('?')) {
          str = str.replace(/\?/g, '_');
        }
        
        // Remove any remaining problematic characters for HTTP headers
        // HTTP header values should not contain: :, ;, =, ", and should be trimmed
        // Also remove any characters that might cause issues in HTTP headers
        str = str
          .replace(/[:;="]/g, '_') // Replace HTTP header delimiters and quotes
          .replace(/[^\x20-\x7E]/g, '_') // Final pass: replace any remaining non-printable ASCII
          .trim()
          .replace(/\s+/g, ' '); // Normalize multiple spaces to single space
        
        // Final validation: ensure it only contains printable ASCII (space to ~)
        str = str.replace(/[^\x20-\x7E]/g, '_');
          
      } catch (e) {
        // If encoding fails, use a very safe value
        console.warn('⚠️  Metadata value sanitization failed, using fallback:', e.message);
        str = 'file';
      }
      
      // Limit length and ensure it's not empty
      str = str.substring(0, 2048);
      if (!str || str.trim() === '') {
        str = 'file';
      }
      
      return str;
    };

    const s3Metadata = {
      uploadedat: new Date().toISOString(), // S3 metadata keys are lowercase
      ...Object.fromEntries(
        Object.entries(metadata).map(([k, v]) => [
          k.toLowerCase().replace(/[^a-z0-9_-]/g, '_'), // Sanitize metadata keys
          sanitizeMetadataValue(v) // Sanitize metadata values to be ASCII-safe
        ])
      )
    };

    // Log the exact command being sent (without sensitive data)
    console.log('📤 S3 Upload Request:');
    console.log('   Bucket:', s3Config.bucket);
    console.log('   Key:', validS3Key);
    console.log('   ContentType:', contentType);
    console.log('   Body Size:', fileBuffer.length, 'bytes');
    console.log('   Metadata Keys:', Object.keys(s3Metadata).join(', '));

    const command = new PutObjectCommand({
      Bucket: s3Config.bucket,
      Key: validS3Key,
      Body: fileBuffer,
      ContentType: contentType,
      Metadata: s3Metadata
    });

    try {
      // Use a fresh S3 client to ensure credentials are current
      const s3Client = createS3Client();
      const result = await s3Client.send(command);
      return {
        success: true,
        key: s3Key,
        location: this.getPublicUrl(s3Key),
        bucket: s3Config.bucket,
        etag: result.ETag,
        url: this.getPublicUrl(s3Key)
      };
    } catch (error) {
      console.error('S3 upload error details:');
      console.error('  Bucket:', s3Config.bucket);
      console.error('  Region:', s3Config.region);
      console.error('  Key:', s3Key);
      console.error('  ContentType:', contentType);
      console.error('  Error Code:', error.Code || error.name);
      console.error('  Error Message:', error.message);
      if (error.Code === 'SignatureDoesNotMatch' || error.name === 'SignatureDoesNotMatch') {
        console.error('  ⚠️  Signature mismatch - Check AWS credentials and region');
        const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
        console.error('  Access Key ID:', accessKeyId ? `${accessKeyId.trim().substring(0, 4)}...` : 'NOT SET');
        console.error('  Secret Key Length:', process.env.AWS_SECRET_ACCESS_KEY ? process.env.AWS_SECRET_ACCESS_KEY.trim().length : 'NOT SET');
        console.error('  Region:', s3Config.region);
        console.error('  Bucket:', s3Config.bucket);
      }
      throw new Error(`Failed to upload file to S3: ${error.message}`);
    }
  }

  /**
   * Upload file from stream
   * @param {Stream} stream - File stream
   * @param {string} s3Key - S3 key (path)
   * @param {string} contentType - MIME type
   * @param {Object} metadata - Optional metadata
   * @returns {Promise<Object>} Upload result
   */
  async uploadStream(stream, s3Key, contentType, metadata = {}) {
    if (!isS3Configured()) {
      throw new Error('S3 is not properly configured');
    }

    const command = new PutObjectCommand({
      Bucket: s3Config.bucket,
      Key: s3Key,
      Body: stream,
      ContentType: contentType,
      Metadata: {
        uploadedAt: new Date().toISOString(),
        ...Object.fromEntries(
          Object.entries(metadata).map(([k, v]) => [k, String(v)])
        )
      }
    });

    try {
      const result = await s3.send(command);
      return {
        success: true,
        key: s3Key,
        location: this.getPublicUrl(s3Key),
        bucket: s3Config.bucket,
        etag: result.ETag,
        url: this.getPublicUrl(s3Key)
      };
    } catch (error) {
      console.error('S3 upload error:', error);
      throw new Error(`Failed to upload file to S3: ${error.message}`);
    }
  }

  /**
   * Get file from S3
   * @param {string} s3Key - S3 key (path)
   * @returns {Promise<Buffer>} File buffer
   */
  async getFile(s3Key) {
    if (!isS3Configured()) {
      throw new Error('S3 is not properly configured');
    }

    const command = new GetObjectCommand({
      Bucket: s3Config.bucket,
      Key: s3Key
    });

    try {
      const result = await s3.send(command);
      // Convert stream to buffer
      const chunks = [];
      for await (const chunk of result.Body) {
        chunks.push(chunk);
      }
      return Buffer.concat(chunks);
    } catch (error) {
      if (error.name === 'NoSuchKey' || error.$metadata?.httpStatusCode === 404) {
        throw new Error(`File not found: ${s3Key}`);
      }
      console.error('S3 get error:', error);
      throw new Error(`Failed to get file from S3: ${error.message}`);
    }
  }

  /**
   * Delete file from S3
   * @param {string} s3Key - S3 key (path)
   * @returns {Promise<Object>} Delete result
   */
  async deleteFile(s3Key) {
    if (!isS3Configured()) {
      throw new Error('S3 is not properly configured');
    }

    const command = new DeleteObjectCommand({
      Bucket: s3Config.bucket,
      Key: s3Key
    });

    try {
      await s3.send(command);
      return {
        success: true,
        key: s3Key
      };
    } catch (error) {
      console.error('S3 delete error:', error);
      throw new Error(`Failed to delete file from S3: ${error.message}`);
    }
  }

  /**
   * Delete multiple files from S3
   * @param {string[]} s3Keys - Array of S3 keys
   * @returns {Promise<Object>} Delete result
   */
  async deleteFiles(s3Keys) {
    if (!isS3Configured()) {
      throw new Error('S3 is not properly configured');
    }

    if (!s3Keys || s3Keys.length === 0) {
      return { success: true, deleted: [] };
    }

    const command = new DeleteObjectsCommand({
      Bucket: s3Config.bucket,
      Delete: {
        Objects: s3Keys.map(key => ({ Key: key }))
      }
    });

    try {
      const result = await s3.send(command);
      return {
        success: true,
        deleted: result.Deleted || [],
        errors: result.Errors || []
      };
    } catch (error) {
      console.error('S3 delete multiple error:', error);
      throw new Error(`Failed to delete files from S3: ${error.message}`);
    }
  }

  /**
   * Generate presigned URL for file access
   * @param {string} s3Key - S3 key (path)
   * @param {number} expiration - Expiration time in seconds (default: 1 hour)
   * @returns {Promise<string>} Presigned URL
   */
  async getPresignedUrl(s3Key, expiration = s3Config.presignedUrlExpiration) {
    if (!isS3Configured()) {
      throw new Error('S3 is not properly configured');
    }

    const command = new GetObjectCommand({
      Bucket: s3Config.bucket,
      Key: s3Key
    });

    try {
      // Use a fresh S3 client to ensure credentials are current
      const s3Client = createS3Client();
      const url = await getSignedUrl(s3Client, command, { expiresIn: expiration });
      return url;
    } catch (error) {
      console.error('S3 presigned URL error:', error);
      throw new Error(`Failed to generate presigned URL: ${error.message}`);
    }
  }

  /**
   * Get public URL for file (if bucket is public)
   * @param {string} s3Key - S3 key (path)
   * @returns {string} Public URL
   */
  getPublicUrl(s3Key) {
    return `https://${s3Config.bucket}.s3.${s3Config.region}.amazonaws.com/${s3Key}`;
  }

  /**
   * Check if file exists in S3
   * @param {string} s3Key - S3 key (path)
   * @returns {Promise<boolean>} True if file exists
   */
  async fileExists(s3Key) {
    if (!isS3Configured()) {
      return false;
    }

    const command = new HeadObjectCommand({
      Bucket: s3Config.bucket,
      Key: s3Key
    });

    try {
      await s3.send(command);
      return true;
    } catch (error) {
      if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
        return false;
      }
      throw error;
    }
  }

  /**
   * List files in a directory
   * @param {string} prefix - S3 key prefix (directory path)
   * @returns {Promise<Array>} Array of file objects
   */
  async listFiles(prefix) {
    if (!isS3Configured()) {
      throw new Error('S3 is not properly configured');
    }

    const command = new ListObjectsV2Command({
      Bucket: s3Config.bucket,
      Prefix: prefix
    });

    try {
      const result = await s3.send(command);
      return result.Contents || [];
    } catch (error) {
      console.error('S3 list error:', error);
      throw new Error(`Failed to list files: ${error.message}`);
    }
  }

  /**
   * Copy file within S3
   * @param {string} sourceKey - Source S3 key
   * @param {string} destinationKey - Destination S3 key
   * @returns {Promise<Object>} Copy result
   */
  async copyFile(sourceKey, destinationKey) {
    if (!isS3Configured()) {
      throw new Error('S3 is not properly configured');
    }

    const command = new CopyObjectCommand({
      Bucket: s3Config.bucket,
      CopySource: `${s3Config.bucket}/${sourceKey}`,
      Key: destinationKey
    });

    try {
      const result = await s3.send(command);
      return {
        success: true,
        key: destinationKey,
        etag: result.CopyObjectResult?.ETag
      };
    } catch (error) {
      console.error('S3 copy error:', error);
      throw new Error(`Failed to copy file: ${error.message}`);
    }
  }
}

module.exports = new S3Service();

