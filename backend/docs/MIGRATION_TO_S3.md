# Migration Guide: Local Storage to AWS S3

## Overview

This guide will help you migrate existing files from local storage to AWS S3.

## Prerequisites

1. S3 bucket configured and accessible
2. AWS credentials set in `.env`
3. Backup of all local files
4. Database backup

## Migration Strategy

### Phase 1: Preparation

1. **Backup Local Files**
   ```bash
   # Create backup directory
   mkdir -p ~/backups/uploads
   
   # Copy all uploads
   cp -r backend/uploads ~/backups/uploads-$(date +%Y%m%d)
   ```

2. **Backup Database**
   ```bash
   # MongoDB backup
   mongodump --db=your_database_name --out=~/backups/db-$(date +%Y%m%d)
   ```

3. **Verify S3 Connection**
   ```bash
   node backend/scripts/testS3Connection.js
   ```

### Phase 2: Migration Script

Create migration script: `backend/scripts/migrateToS3.js`

```javascript
require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');
const s3Service = require('../src/services/s3Service');
const mongoose = require('mongoose');
const Course = require('../src/models/Course');

// Configuration
const UPLOAD_BASE_DIR = path.join(__dirname, '../uploads');
const BATCH_SIZE = 10; // Upload 10 files at a time

/**
 * Migrate files from local storage to S3
 */
async function migrateToS3() {
  try {
    console.log('🚀 Starting migration to S3...\n');

    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database\n');

    // Migrate course files
    await migrateCourseFiles();
    
    // Migrate KYC files
    await migrateKYCFiles();

    console.log('\n✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

/**
 * Migrate course-related files
 */
async function migrateCourseFiles() {
  console.log('📦 Migrating course files...');
  
  const coursesDir = path.join(UPLOAD_BASE_DIR, 'courses');
  const fileTypes = ['videos', 'audio', 'documents', 'images', 'thumbnails', 'certificates'];
  
  // Get all courses from database
  const courses = await Course.find({});
  console.log(`Found ${courses.length} courses to migrate\n`);

  for (const course of courses) {
    const creatorId = course.instructor.toString();
    const courseId = course._id.toString();

    console.log(`Migrating files for course: ${course.name} (${courseId})`);

    for (const fileType of fileTypes) {
      const localDir = path.join(coursesDir, fileType);
      
      try {
        const files = await fs.readdir(localDir);
        console.log(`  - ${fileType}: ${files.length} files`);

        for (const file of files) {
          const localPath = path.join(localDir, file);
          
          try {
            // Read file
            const fileBuffer = await fs.readFile(localPath);
            
            // Determine MIME type
            const ext = path.extname(file).toLowerCase();
            const mimeTypes = {
              '.mp4': 'video/mp4',
              '.mp3': 'audio/mpeg',
              '.pdf': 'application/pdf',
              '.jpg': 'image/jpeg',
              '.png': 'image/png',
              // Add more as needed
            };
            const contentType = mimeTypes[ext] || 'application/octet-stream';

            // Generate S3 key
            const s3Key = s3Service.generateS3Key(
              'creator',
              creatorId,
              fileType,
              courseId,
              file
            );

            // Upload to S3
            await s3Service.uploadFile(fileBuffer, s3Key, contentType, {
              migratedFrom: localPath,
              migratedAt: new Date().toISOString()
            });

            console.log(`    ✅ Uploaded: ${file}`);

            // Update database with S3 URL
            await updateCourseFileReferences(course, fileType, file, s3Key);

          } catch (error) {
            console.error(`    ❌ Failed to migrate ${file}:`, error.message);
          }
        }
      } catch (error) {
        if (error.code !== 'ENOENT') {
          console.error(`  ❌ Error reading ${fileType} directory:`, error.message);
        }
      }
    }

    console.log(`✅ Completed migration for course: ${course.name}\n`);
  }
}

/**
 * Update course document with S3 URLs
 */
async function updateCourseFileReferences(course, fileType, filename, s3Key) {
  // This is a simplified example - adjust based on your schema
  const s3Url = s3Service.getPublicUrl(s3Key);
  
  // Update modules/lessons with S3 URLs
  if (course.modules && course.modules.length > 0) {
    for (const module of course.modules) {
      if (module.lessons && module.lessons.length > 0) {
        for (const lesson of module.lessons) {
          // Update video URLs
          if (fileType === 'videos' && lesson.content && lesson.content.videoUrl) {
            if (lesson.content.videoUrl.includes(filename)) {
              lesson.content.videoUrl = s3Url;
              lesson.content.s3Key = s3Key;
            }
          }
          
          // Update thumbnail URLs
          if (fileType === 'thumbnails' && lesson.content && lesson.content.thumbnailUrl) {
            if (lesson.content.thumbnailUrl.includes(filename)) {
              lesson.content.thumbnailUrl = s3Url;
              lesson.content.thumbnailS3Key = s3Key;
            }
          }
          
          // Update resource URLs
          if (fileType === 'documents' && lesson.resources) {
            lesson.resources.forEach(resource => {
              if (resource.url && resource.url.includes(filename)) {
                resource.url = s3Url;
                resource.s3Key = s3Key;
              }
            });
          }
        }
      }
    }
    
    await course.save();
  }
}

/**
 * Migrate KYC files
 */
async function migrateKYCFiles() {
  console.log('📦 Migrating KYC files...');
  // Similar implementation for KYC files
  // Adjust paths and logic based on your KYC file structure
}

// Run migration
migrateToS3();
```

### Phase 3: Run Migration

1. **Dry Run** (Test without uploading):
   ```bash
   # Modify script to log only, don't upload
   node backend/scripts/migrateToS3.js --dry-run
   ```

2. **Full Migration**:
   ```bash
   node backend/scripts/migrateToS3.js
   ```

3. **Verify Migration**:
   ```bash
   # Check S3 bucket
   aws s3 ls s3://creator-applications/creators/ --recursive
   
   # Verify file counts
   # Compare local file count with S3 file count
   ```

### Phase 4: Update Application Code

1. **Update Upload Controller**
   - Switch from local storage to S3
   - Update file URL generation
   - Test upload functionality

2. **Update File Retrieval**
   - Use presigned URLs for private files
   - Update frontend to use S3 URLs

3. **Update Database**
   - Ensure all file references point to S3 URLs
   - Add `s3Key` field for future reference

### Phase 5: Verification

1. **Test File Upload**
   - Upload new files via application
   - Verify files appear in S3
   - Check URLs are correct

2. **Test File Access**
   - Access files via presigned URLs
   - Verify files load correctly
   - Check expiration works

3. **Test File Deletion**
   - Delete files via application
   - Verify files removed from S3

### Phase 6: Cleanup

**⚠️ IMPORTANT: Only after full verification**

1. **Archive Local Files** (Don't delete immediately):
   ```bash
   # Move to archive
   mv backend/uploads backend/uploads-archived-$(date +%Y%m%d)
   ```

2. **Monitor for Issues**:
   - Watch for 404 errors
   - Check file access logs
   - Monitor S3 costs

3. **Delete Local Files** (After 30 days):
   ```bash
   # Only after confirming everything works
   rm -rf backend/uploads-archived-*
   ```

## Rollback Plan

If migration fails:

1. **Restore Local Files**:
   ```bash
   cp -r ~/backups/uploads-* backend/uploads
   ```

2. **Restore Database**:
   ```bash
   mongorestore --db=your_database_name ~/backups/db-*
   ```

3. **Revert Code Changes**:
   ```bash
   git checkout HEAD~1
   ```

## Best Practices

1. **Test in Staging First**
   - Always test migration in staging environment
   - Verify all functionality works

2. **Incremental Migration**
   - Migrate in batches
   - Test after each batch

3. **Monitor Costs**
   - Watch S3 storage costs
   - Monitor data transfer costs

4. **Keep Backups**
   - Don't delete local files immediately
   - Keep backups for at least 30 days

## Troubleshooting

### Common Issues

1. **File Not Found in S3**
   - Check S3 key generation
   - Verify file was uploaded
   - Check IAM permissions

2. **URL Access Denied**
   - Check bucket policy
   - Verify presigned URL generation
   - Check CORS configuration

3. **Migration Timeout**
   - Increase batch size
   - Add retry logic
   - Process in smaller chunks

## Support

For issues during migration:
1. Check S3 service logs
2. Verify AWS credentials
3. Review error messages
4. Test S3 connection

