# Curriculum Files Migration to S3

## Overview

All curriculum file uploads (videos, audio, documents, images, thumbnails) have been migrated from local storage to AWS S3.

## Changes Made

### 1. Upload Controller (`backend/src/controllers/uploadController.js`)

**Before:**
- Used `multer.diskStorage()` to save files locally
- Files saved to `backend/uploads/courses/{type}/`
- Returned local file paths

**After:**
- Uses `multer.memoryStorage()` to keep files in memory
- Files uploaded directly to S3
- Returns S3 URLs and presigned URLs

### 2. File Storage Location

**S3 Structure:**
```
creators/{creatorId}/courses/{courseId}/
├── videos/          # Video files
├── audio/           # Audio files
├── documents/       # PDFs, DOC, DOCX, PPT, PPTX, etc.
├── images/          # Image files
└── thumbnails/      # Video thumbnails
```

### 3. Updated Upload Endpoints

All upload endpoints now require:
- **Authentication**: User must be logged in
- **Course ID**: Must be provided in request body or query string as `courseId`

**Endpoints:**
- `POST /api/upload/video` - Upload video files
- `POST /api/upload/audio` - Upload audio files
- `POST /api/upload/document` - Upload documents (DOC, DOCX, PPT, etc.)
- `POST /api/upload/image` - Upload images
- `POST /api/upload/thumbnail` - Upload video thumbnails
- `POST /api/upload/pdf` - Upload PDF files
- `POST /api/upload/resource` - Upload resource files (legacy)
- `POST /api/upload/resources` - Upload multiple resources (legacy)

## Request Format

### Single File Upload

```javascript
// FormData
const formData = new FormData();
formData.append('file', fileObject);
formData.append('courseId', '507f191e810c19729de860ea'); // Required

// Headers
{
  'Authorization': 'Bearer YOUR_TOKEN',
  'Content-Type': 'multipart/form-data'
}
```

### Response Format

```json
{
  "success": true,
  "data": {
    "filename": "1699123456789-550e8400-video.mp4",
    "originalName": "my-video.mp4",
    "s3Key": "creators/507f1f77bcf86cd799439011/courses/507f191e810c19729de860ea/videos/1699123456789-550e8400-video.mp4",
    "url": "https://creator-applications.s3.ap-south-1.amazonaws.com/creators/...",
    "presignedUrl": "https://creator-applications.s3.ap-south-1.amazonaws.com/...?X-Amz-Algorithm=...",
    "size": 10485760,
    "mimetype": "video/mp4"
  },
  "message": "Video file uploaded successfully to S3"
}
```

## File Type Mapping

| Upload Type | S3 Folder | Max Size |
|------------|-----------|----------|
| video | videos | 500MB |
| audio | audio | 50MB |
| document | documents | 10MB |
| image | images | 10MB |
| thumbnail | thumbnails | 5MB |
| pdf | documents | 10MB |
| resource | documents | 10MB |

## Frontend Integration

### Before (Local Storage)
```typescript
const response = await uploadService.uploadVideo(file);
// Response: { url: '/uploads/courses/videos/filename.mp4' }
```

### After (S3)
```typescript
const formData = new FormData();
formData.append('file', file);
formData.append('courseId', courseId); // Required

const response = await uploadService.uploadVideo(formData);
// Response: { 
//   url: 'https://creator-applications.s3.ap-south-1.amazonaws.com/...',
//   presignedUrl: 'https://creator-applications.s3.ap-south-1.amazonaws.com/...?X-Amz-...'
// }
```

## Important Notes

1. **Course ID Required**: All uploads now require `courseId` in the request
2. **S3 URLs**: Use `url` for public access or `presignedUrl` for temporary access
3. **Presigned URLs**: Expire after 1 hour (configurable)
4. **File Validation**: Files are validated before upload (size and MIME type)
5. **Error Handling**: Clear error messages if S3 is not configured or courseId is missing

## Migration Checklist

- [x] Updated upload controller to use S3
- [x] Changed multer to memory storage
- [x] Added S3 upload helper function
- [x] Updated all upload endpoints
- [x] Added courseId requirement
- [ ] Update frontend upload service
- [ ] Update frontend to send courseId
- [ ] Test all upload endpoints
- [ ] Migrate existing local files to S3 (optional)

## Testing

Test each upload endpoint:

```bash
# Test video upload
curl -X POST http://localhost:5001/api/upload/video \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@video.mp4" \
  -F "courseId=507f191e810c19729de860ea"

# Test audio upload
curl -X POST http://localhost:5001/api/upload/audio \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@audio.mp3" \
  -F "courseId=507f191e810c19729de860ea"
```

## Troubleshooting

### Error: "Course ID is required"
- **Solution**: Add `courseId` to request body or query string

### Error: "S3 is not configured"
- **Solution**: Check `.env` file has AWS credentials set

### Error: "File validation failed"
- **Solution**: Check file size and MIME type match allowed values

### Files not accessible
- **Solution**: Use `presignedUrl` for temporary access or configure bucket for public access

## Next Steps

1. Update frontend upload service to include `courseId`
2. Update frontend to use S3 URLs instead of local paths
3. Test all upload functionality
4. Consider migrating existing local files to S3 (see `MIGRATION_TO_S3.md`)

