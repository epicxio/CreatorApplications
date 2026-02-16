# AWS S3 Integration - Complete Documentation

## 📚 Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Folder Structure](#folder-structure)
4. [API Reference](#api-reference)
5. [Usage Examples](#usage-examples)
6. [Configuration](#configuration)
7. [Security](#security)
8. [Troubleshooting](#troubleshooting)

## Overview

The Creator Marketplace Platform uses AWS S3 for storing all course-related files including:
- **Creator Files**: Videos, audio, documents, images, thumbnails, certificate templates
- **Student Files**: Generated certificates

### Key Features

- ✅ Structured folder organization
- ✅ Automatic file validation
- ✅ Presigned URL generation
- ✅ Secure file access
- ✅ Easy migration from local storage

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install aws-sdk
```

### 2. Configure Environment Variables

Add to `.env`:

```env
AWS_ACCESS_KEY_ID=<YOUR_AWS_ACCESS_KEY_ID>
AWS_SECRET_ACCESS_KEY=<YOUR_AWS_SECRET_ACCESS_KEY>
AWS_REGION=ap-south-1
AWS_S3_BUCKET=creator-applications
```

### 3. Test Connection

```bash
node backend/scripts/testS3Connection.js
```

### 4. Use in Your Code

```javascript
const s3Service = require('./src/services/s3Service');

// Upload file
const result = await s3Service.uploadFile(
  fileBuffer,
  s3Key,
  'video/mp4'
);
```

## Folder Structure

See [S3_STORAGE_STRUCTURE.md](./S3_STORAGE_STRUCTURE.md) for detailed folder organization.

### Quick Reference

```
creators/{creatorId}/courses/{courseId}/
  ├── videos/
  ├── audio/
  ├── documents/
  ├── images/
  ├── thumbnails/
  └── certificates/

students/{studentId}/certificates/{courseId}/
```

## API Reference

### S3Service Methods

#### `uploadFile(fileBuffer, s3Key, contentType, metadata)`

Upload a file to S3.

**Parameters:**
- `fileBuffer` (Buffer): File content
- `s3Key` (string): S3 key (path)
- `contentType` (string): MIME type
- `metadata` (object): Optional metadata

**Returns:** Promise with upload result

**Example:**
```javascript
const result = await s3Service.uploadFile(
  fileBuffer,
  'creators/123/courses/456/videos/video.mp4',
  'video/mp4',
  { originalName: 'my-video.mp4' }
);
```

#### `getFile(s3Key)`

Retrieve a file from S3.

**Parameters:**
- `s3Key` (string): S3 key (path)

**Returns:** Promise with file buffer

#### `deleteFile(s3Key)`

Delete a file from S3.

**Parameters:**
- `s3Key` (string): S3 key (path)

**Returns:** Promise with delete result

#### `getPresignedUrl(s3Key, expiration)`

Generate a presigned URL for temporary file access.

**Parameters:**
- `s3Key` (string): S3 key (path)
- `expiration` (number): Expiration in seconds (default: 3600)

**Returns:** Promise with presigned URL

#### `generateS3Key(type, userId, fileType, courseId, filename)`

Generate S3 key based on folder structure.

**Parameters:**
- `type` (string): 'creator' or 'student'
- `userId` (string): Creator ID or Student ID
- `fileType` (string): 'video', 'audio', 'document', etc.
- `courseId` (string): Course ID
- `filename` (string): Filename

**Returns:** S3 key string

## Usage Examples

### Upload Creator Video

```javascript
const s3Service = require('./src/services/s3Service');
const { uploadToS3 } = require('./src/utils/s3UploadHelper');

// In your upload controller
const result = await uploadToS3(
  req.file,                    // Multer file object
  'creator',                   // Type
  req.user._id.toString(),     // Creator ID
  'videos',                   // File type
  req.body.courseId           // Course ID
);

res.json({
  success: true,
  url: result.url,
  s3Key: result.s3Key
});
```

### Generate Student Certificate

```javascript
const s3Key = s3Service.generateS3Key(
  'student',
  studentId,
  'certificate',
  courseId,
  'certificate.pdf'
);

await s3Service.uploadFile(
  certificateBuffer,
  s3Key,
  'application/pdf'
);
```

### Get Presigned URL

```javascript
const url = await s3Service.getPresignedUrl(
  'creators/123/courses/456/videos/video.mp4',
  3600 // 1 hour
);
```

## Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `AWS_ACCESS_KEY_ID` | AWS access key | Yes |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | Yes |
| `AWS_REGION` | AWS region | Yes |
| `AWS_S3_BUCKET` | S3 bucket name | Yes |

### File Size Limits

| File Type | Max Size |
|-----------|----------|
| Video | 500MB |
| Audio | 50MB |
| Document | 10MB |
| Image | 5MB |
| Certificate | 5MB |

## Security

### Best Practices

1. **Never commit credentials** to version control
2. **Use IAM roles** in production
3. **Enable encryption** at rest
4. **Use presigned URLs** for temporary access
5. **Implement access logging**
6. **Regular key rotation**

### IAM Policy Example

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::creator-applications/*"
    }
  ]
}
```

## Troubleshooting

### Common Issues

1. **Access Denied**
   - Check IAM permissions
   - Verify bucket policy
   - Ensure credentials are correct

2. **File Not Found**
   - Verify S3 key is correct
   - Check file exists in bucket
   - Review upload logs

3. **Presigned URL Expired**
   - Generate new URL
   - Increase expiration time
   - Use public URLs if appropriate

### Debug Mode

Enable debug logging:

```javascript
// In s3Config.js
AWS.config.update({
  logger: console
});
```

## Related Documentation

- [S3 Setup Guide](./S3_SETUP_GUIDE.md) - Initial setup instructions
- [S3 Storage Structure](./S3_STORAGE_STRUCTURE.md) - Folder organization
- [Migration Guide](./MIGRATION_TO_S3.md) - Migrating from local storage

## Support

For issues or questions:
1. Check AWS S3 documentation
2. Review error logs
3. Test with connection script
4. Verify IAM permissions

---

**Last Updated**: January 2025
**Version**: 1.0.0

