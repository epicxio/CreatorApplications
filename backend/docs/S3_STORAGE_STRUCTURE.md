# AWS S3 Storage Structure

## Overview

This document describes the folder structure and organization of files stored in AWS S3 for the Creator Marketplace Platform.

## S3 Bucket Configuration

- **Bucket Name**: `creator-applications`
- **Region**: `ap-south-1` (Mumbai)
- **Access**: Private (files accessed via presigned URLs or public URLs if configured)

## Folder Structure

```
creator-applications/
├── creators/
│   └── {creatorId}/
│       └── courses/
│           └── {courseId}/
│               ├── videos/
│               │   └── {timestamp}-{uuid}-{filename}.mp4
│               ├── audio/
│               │   └── {timestamp}-{uuid}-{filename}.mp3
│               ├── documents/
│               │   └── {timestamp}-{uuid}-{filename}.pdf
│               ├── images/
│               │   └── {timestamp}-{uuid}-{filename}.jpg
│               ├── thumbnails/
│               │   └── {timestamp}-{uuid}-{filename}.jpg
│               └── certificates/
│                   └── {timestamp}-{uuid}-{filename}.png
│
├── users/
│   └── {userId}/
│       └── kyc/
│           ├── pan_card/
│           │   └── {timestamp}-{uuid}-{sanitizedName}.pdf
│           ├── aadhar_card/
│           ├── passport/
│           ├── driving_license/
│           ├── voter_id/
│           └── other/
│               └── {timestamp}-{uuid}-{sanitizedName}.pdf
│
└── students/
    └── {studentId}/
        └── certificates/
            └── {courseId}/
                └── {timestamp}-{uuid}-{filename}.pdf
```

## Detailed Structure

### Creator Files

All files uploaded by creators for their courses are stored under:
```
creators/{creatorId}/courses/{courseId}/{fileType}/{filename}
```

#### 1. Videos
- **Path**: `creators/{creatorId}/courses/{courseId}/videos/{filename}`
- **Purpose**: Course video lessons
- **Allowed Formats**: MP4, MOV, AVI, WebM, MKV
- **Max Size**: 500MB
- **Example**: `creators/507f1f77bcf86cd799439011/courses/507f191e810c19729de860ea/videos/1699123456789-550e8400-course-intro.mp4`

#### 2. Audio
- **Path**: `creators/{creatorId}/courses/{courseId}/audio/{filename}`
- **Purpose**: Audio lessons, podcasts
- **Allowed Formats**: MP3, WAV, OGG, AAC, M4A
- **Max Size**: 50MB
- **Example**: `creators/507f1f77bcf86cd799439011/courses/507f191e810c19729de860ea/audio/1699123456789-550e8400-lesson-audio.mp3`

#### 3. Documents
- **Path**: `creators/{creatorId}/courses/{courseId}/documents/{filename}`
- **Purpose**: PDFs, Word docs, PowerPoint presentations, Excel files
- **Allowed Formats**: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX
- **Max Size**: 10MB
- **Example**: `creators/507f1f77bcf86cd799439011/courses/507f191e810c19729de860ea/documents/1699123456789-550e8400-course-material.pdf`

#### 4. Images
- **Path**: `creators/{creatorId}/courses/{courseId}/images/{filename}`
- **Purpose**: Course cover images, lesson images, resources
- **Allowed Formats**: JPEG, PNG, GIF, WebP, SVG
- **Max Size**: 5MB
- **Example**: `creators/507f1f77bcf86cd799439011/courses/507f191e810c19729de860ea/images/1699123456789-550e8400-cover-image.jpg`

#### 5. Thumbnails
- **Path**: `creators/{creatorId}/courses/{courseId}/thumbnails/{filename}`
- **Purpose**: Video thumbnails
- **Allowed Formats**: JPEG, PNG, GIF, WebP
- **Max Size**: 5MB
- **Example**: `creators/507f1f77bcf86cd799439011/courses/507f191e810c19729de860ea/thumbnails/1699123456789-550e8400-video-thumb.jpg`

#### 6. Certificates (Template)
- **Path**: `creators/{creatorId}/courses/{courseId}/certificates/{filename}`
- **Purpose**: Certificate templates, signatures, logos used for course certificates
- **Allowed Formats**: JPEG, PNG, PDF
- **Max Size**: 5MB
- **Example**: `creators/507f1f77bcf86cd799439011/courses/507f191e810c19729de860ea/certificates/1699123456789-550e8400-signature.png`

### User Files (KYC)

Identity documents for KYC verification are stored under:
```
users/{userId}/kyc/{documentType}/{filename}
```

- **Path**: `users/{userId}/kyc/{documentType}/{filename}`
- **Purpose**: PAN, Aadhar, passport, driving license, voter ID, and other identity documents
- **Document types**: `pan_card`, `aadhar_card`, `passport`, `driving_license`, `voter_id`, `other`
- **Allowed formats**: JPEG, PNG, PDF
- **Max size**: 5MB
- **Example**: `users/507f1f77bcf86cd799439011/kyc/pan_card/1738765432123-a1b2c3d4-pan_card.pdf`
- **Access**: Presigned URLs only (via `GET /api/kyc/documents/:documentId/download`). New uploads go to S3 when configured; legacy local files still served from disk.

### Student Files

All files generated for students are stored under:
```
students/{studentId}/certificates/{courseId}/{filename}
```

#### 1. Certificates (Generated)
- **Path**: `students/{studentId}/certificates/{courseId}/{filename}`
- **Purpose**: Generated certificates for completed courses
- **Allowed Formats**: PDF, JPEG, PNG
- **Max Size**: 5MB
- **Example**: `students/507f1f77bcf86cd799439012/certificates/507f191e810c19729de860ea/1699123456789-550e8400-certificate.pdf`

## File Naming Convention

All files follow this naming pattern:
```
{timestamp}-{uuid}-{originalName}
```

- **timestamp**: Unix timestamp in milliseconds (e.g., `1699123456789`)
- **uuid**: Short UUID (8 characters) for uniqueness (e.g., `550e8400`)
- **originalName**: Sanitized original filename with extension

**Example**: `1699123456789-550e8400-course-introduction-video.mp4`

## Access Patterns

### Public Access
- Files can be accessed via public URLs if bucket is configured for public access
- Format: `https://creator-applications.s3.ap-south-1.amazonaws.com/{s3Key}`

### Presigned URLs
- For private files, use presigned URLs with expiration
- Default expiration: 1 hour
- Format: Generated via S3 service

### Direct S3 Access
- Use AWS SDK to access files directly
- Requires proper IAM permissions

## Security Considerations

1. **Access Control**: All files are private by default
2. **Presigned URLs**: Used for temporary access (1 hour default)
3. **IAM Policies**: Restrict access to specific paths based on user roles
4. **CORS**: Configure CORS for frontend access if needed
5. **Encryption**: Enable S3 server-side encryption (SSE)

## Best Practices

1. **File Organization**: Always use the structured folder paths
2. **Naming**: Use the generateUniqueFilename() method for consistent naming
3. **Validation**: Validate file type and size before upload
4. **Cleanup**: Delete unused files to save storage costs
5. **Backup**: Consider versioning for important files
6. **CDN**: Use CloudFront for better performance (optional)

## Migration from Local Storage

When migrating from local storage to S3:

1. **Backup**: Ensure all local files are backed up
2. **Upload**: Use migration script to upload files to S3
3. **Update URLs**: Update database records with S3 URLs
4. **Verify**: Verify all files are accessible
5. **Cleanup**: Remove local files after verification

See `MIGRATION_TO_S3.md` for detailed migration steps.

## Examples

### Creator Upload Video
```javascript
const s3Key = s3Service.generateS3Key(
  'creator',
  '507f1f77bcf86cd799439011',  // creatorId
  'videos',
  '507f191e810c19729de860ea',  // courseId
  '1699123456789-550e8400-intro.mp4'
);
```

### Student Certificate
```javascript
const s3Key = s3Service.generateS3Key(
  'student',
  '507f1f77bcf86cd799439012',  // studentId
  'certificate',
  '507f191e810c19729de860ea',  // courseId
  '1699123456789-550e8400-cert.pdf'
);
```

### KYC Document
```javascript
const s3Key = s3Service.generateS3Key(
  'user',
  '507f1f77bcf86cd799439011',  // userId
  'kyc',
  'pan_card',                    // documentType
  '1738765432123-a1b2c3d4-pan_card.pdf'
);
// Result: users/507f1f77bcf86cd799439011/kyc/pan_card/1738765432123-a1b2c3d4-pan_card.pdf
```

## Monitoring and Maintenance

1. **Storage Usage**: Monitor bucket size and costs
2. **Access Logs**: Enable S3 access logging
3. **Lifecycle Policies**: Set up lifecycle policies for old files
4. **Cost Optimization**: Use appropriate storage classes (Standard, IA, Glacier)

