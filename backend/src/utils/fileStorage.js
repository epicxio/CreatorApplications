const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

class FileStorage {
  constructor() {
    this.baseDir = process.env.UPLOAD_BASE_DIR || 'uploads';
    this.maxFileSize = 5 * 1024 * 1024; // 5MB
    this.allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'application/pdf'
    ];
    
    this.ensureDirectories();
  }

  // Ensure all required directories exist
  async ensureDirectories() {
    const directories = [
      this.baseDir,
      path.join(this.baseDir, 'kyc'),
      path.join(this.baseDir, 'kyc', 'pan_cards'),
      path.join(this.baseDir, 'kyc', 'aadhar_cards'),
      path.join(this.baseDir, 'kyc', 'other_documents'),
      path.join(this.baseDir, 'kyc', 'temp'),
      path.join(this.baseDir, 'kyc', 'archived')
    ];

    for (const dir of directories) {
      try {
        await fs.access(dir);
      } catch (error) {
        await fs.mkdir(dir, { recursive: true });
        console.log(`Created directory: ${dir}`);
      }
    }
  }

  // Generate unique filename
  generateFileName(originalName, userId, documentType) {
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');
    const extension = path.extname(originalName);
    const sanitizedName = path.basename(originalName, extension)
      .replace(/[^a-zA-Z0-9]/g, '_')
      .toLowerCase();
    
    return `${userId}_${documentType}_${sanitizedName}_${timestamp}_${randomString}${extension}`;
  }

  // Get directory path for document type
  getDocumentDirectory(documentType) {
    const typeMap = {
      'pan_card': 'pan_cards',
      'aadhar_card': 'aadhar_cards',
      'passport': 'other_documents',
      'driving_license': 'other_documents',
      'voter_id': 'other_documents',
      'other': 'other_documents'
    };

    const subDir = typeMap[documentType] || 'other_documents';
    return path.join(this.baseDir, 'kyc', subDir);
  }

  // Validate file
  validateFile(file) {
    const errors = [];

    // Check file size
    if (file.size > this.maxFileSize) {
      errors.push(`File size exceeds maximum limit of ${this.maxFileSize / (1024 * 1024)}MB`);
    }

    // Check mime type
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      errors.push(`File type ${file.mimetype} is not allowed. Allowed types: ${this.allowedMimeTypes.join(', ')}`);
    }

    return errors;
  }

  // Save file to storage
  async saveFile(file, userId, documentType) {
    try {
      // Validate file
      const validationErrors = this.validateFile(file);
      if (validationErrors.length > 0) {
        throw new Error(`File validation failed: ${validationErrors.join(', ')}`);
      }

      // Generate unique filename
      const fileName = this.generateFileName(file.originalname, userId, documentType);
      const directory = this.getDocumentDirectory(documentType);
      const filePath = path.join(directory, fileName);

      // Ensure directory exists
      await fs.mkdir(directory, { recursive: true });

      // Save file
      await fs.writeFile(filePath, file.buffer);

      // Return file info
      return {
        fileName,
        originalFileName: file.originalname,
        filePath,
        fileSize: file.size,
        mimeType: file.mimetype,
        uploadDate: new Date()
      };
    } catch (error) {
      console.error('Error saving file:', error);
      throw new Error(`Failed to save file: ${error.message}`);
    }
  }

  // Move file to archived directory
  async archiveFile(filePath, reason = 'document_update') {
    try {
      const fileName = path.basename(filePath);
      const archivedPath = path.join(this.baseDir, 'kyc', 'archived', `${Date.now()}_${fileName}`);
      
      await fs.rename(filePath, archivedPath);
      
      return {
        originalPath: filePath,
        archivedPath,
        archivedAt: new Date(),
        reason
      };
    } catch (error) {
      console.error('Error archiving file:', error);
      throw new Error(`Failed to archive file: ${error.message}`);
    }
  }

  // Delete file
  async deleteFile(filePath) {
    try {
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }

  // Get file info
  async getFileInfo(filePath) {
    try {
      const stats = await fs.stat(filePath);
      return {
        exists: true,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        isFile: stats.isFile(),
        isDirectory: stats.isDirectory()
      };
    } catch (error) {
      return {
        exists: false,
        error: error.message
      };
    }
  }

  // Create temporary file path
  createTempPath(originalName) {
    const tempDir = path.join(this.baseDir, 'kyc', 'temp');
    const tempFileName = `${uuidv4()}_${path.basename(originalName)}`;
    return path.join(tempDir, tempFileName);
  }

  // Clean up temporary files
  async cleanupTempFiles(maxAge = 24 * 60 * 60 * 1000) { // 24 hours
    try {
      const tempDir = path.join(this.baseDir, 'kyc', 'temp');
      const files = await fs.readdir(tempDir);
      const now = Date.now();

      for (const file of files) {
        const filePath = path.join(tempDir, file);
        const stats = await fs.stat(filePath);
        
        if (now - stats.mtime.getTime() > maxAge) {
          await fs.unlink(filePath);
          console.log(`Cleaned up temp file: ${file}`);
        }
      }
    } catch (error) {
      console.error('Error cleaning up temp files:', error);
    }
  }

  // Get storage statistics
  async getStorageStats() {
    try {
      const kycDir = path.join(this.baseDir, 'kyc');
      const stats = {
        totalFiles: 0,
        totalSize: 0,
        byType: {
          pan_cards: { count: 0, size: 0 },
          aadhar_cards: { count: 0, size: 0 },
          other_documents: { count: 0, size: 0 },
          archived: { count: 0, size: 0 }
        }
      };

      const subDirs = ['pan_cards', 'aadhar_cards', 'other_documents', 'archived'];
      
      for (const subDir of subDirs) {
        const dirPath = path.join(kycDir, subDir);
        try {
          const files = await fs.readdir(dirPath);
          stats.byType[subDir].count = files.length;
          
          for (const file of files) {
            const filePath = path.join(dirPath, file);
            const fileStats = await fs.stat(filePath);
            stats.byType[subDir].size += fileStats.size;
            stats.totalSize += fileStats.size;
          }
        } catch (error) {
          // Directory doesn't exist or is empty
        }
      }

      stats.totalFiles = Object.values(stats.byType).reduce((sum, type) => sum + type.count, 0);
      
      return stats;
    } catch (error) {
      console.error('Error getting storage stats:', error);
      throw new Error(`Failed to get storage stats: ${error.message}`);
    }
  }

  // Create backup of file
  async createBackup(filePath, backupReason = 'manual_backup') {
    try {
      const fileName = path.basename(filePath);
      const backupDir = path.join(this.baseDir, 'kyc', 'backups', new Date().toISOString().split('T')[0]);
      const backupPath = path.join(backupDir, `${Date.now()}_${fileName}`);
      
      await fs.mkdir(backupDir, { recursive: true });
      await fs.copyFile(filePath, backupPath);
      
      return {
        originalPath: filePath,
        backupPath,
        backedUpAt: new Date(),
        reason: backupReason
      };
    } catch (error) {
      console.error('Error creating backup:', error);
      throw new Error(`Failed to create backup: ${error.message}`);
    }
  }
}

// Create singleton instance
const fileStorage = new FileStorage();

module.exports = fileStorage; 