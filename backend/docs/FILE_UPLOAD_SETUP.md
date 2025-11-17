# File Upload Setup - Local Storage

## Overview
This document describes the file upload system for course resources and videos. Currently, files are stored on the local drive. Later, this can be migrated to AWS S3 or another cloud storage service.

## Backend Setup

### 1. Upload Routes
- **Location**: `backend/src/routes/uploadRoutes.js`
- **Base URL**: `/api/upload`
- **Authentication**: All routes require authentication

### 2. Available Endpoints

#### Upload Single Resource
- **POST** `/api/upload/resource`
- **Body**: FormData with `file` field
- **Max Size**: 2MB
- **Allowed Types**: PDF, DOC, DOCX, PPT, PPTX, Images

#### Upload Multiple Resources
- **POST** `/api/upload/resources`
- **Body**: FormData with `files` array
- **Max Files**: 10
- **Max Size**: 2MB each

#### Upload Video
- **POST** `/api/upload/video`
- **Body**: FormData with `file` field
- **Max Size**: 100MB
- **Allowed Types**: MP4, MOV, AVI, WebM, MKV

#### Upload Thumbnail
- **POST** `/api/upload/thumbnail`
- **Body**: FormData with `file` field
- **Max Size**: 5MB
- **Allowed Types**: Images (JPEG, PNG, GIF, WebP)

#### Upload Audio
- **POST** `/api/upload/audio`
- **Body**: FormData with `file` field
- **Max Size**: 10MB
- **Allowed Types**: MP3, WAV, OGG, AAC, M4A

### 3. File Storage Structure

```
backend/
  uploads/
    courses/
      resources/     # PDF, DOC, DOCX, PPT, PPTX, Images
      videos/        # Video files
      thumbnails/    # Video thumbnails
      audio/         # Audio files
```

### 4. File Naming
Files are saved with unique names: `{timestamp}-{uuid}{extension}`

Example: `1699123456789-550e8400-e29b-41d4-a716-446655440000.pdf`

### 5. Static File Serving
Files are served statically at: `http://localhost:5001/uploads/courses/{type}/{filename}`

## Frontend Integration

### 1. Upload Service
- **Location**: `frontend/src/services/uploadService.ts`
- Provides methods for all upload types
- Handles file URLs and API communication

### 2. Usage Example

```typescript
import uploadService from '../../services/uploadService';

// Upload a resource file
const response = await uploadService.uploadResource(file);
if (response.success) {
  const fileUrl = response.data.url; // e.g., "/uploads/courses/resources/..."
  // Store fileUrl in lesson data
}
```

### 3. File URL Format
- **Relative URL**: `/uploads/courses/resources/filename.pdf`
- **Full URL**: `http://localhost:5001/uploads/courses/resources/filename.pdf`

## Migration to Cloud Storage (Future)

When migrating to AWS S3 or another cloud storage:

1. **Update Upload Controller** (`backend/src/controllers/uploadController.js`):
   - Replace `multer.diskStorage` with cloud storage SDK
   - Update file saving logic to upload to cloud
   - Return cloud URLs instead of local paths

2. **Update File Serving**:
   - Remove static file serving from Express
   - Files will be served directly from cloud storage

3. **Update Frontend**:
   - Update `uploadService.getFileUrl()` to handle cloud URLs
   - No other changes needed if URLs are properly formatted

## Environment Variables

Optional environment variable:
- `UPLOAD_BASE_DIR`: Base directory for uploads (default: `uploads`)

## Notes

- Files are stored permanently on the local drive
- Consider implementing file cleanup for deleted courses
- File size limits can be adjusted in `uploadController.js`
- All uploads require authentication

