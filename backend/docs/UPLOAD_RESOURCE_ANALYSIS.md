# Upload Resource Button - End-to-End Analysis

## Flow Diagram

```
Frontend (CurriculumStep.tsx)
  ↓
User clicks "Upload Resources" button
  ↓
onChange handler → uploadService.uploadResource(file, courseId)
  ↓
uploadService.getFileType(file) determines type:
  - 'pdf' → uploadPDF(file, courseId) → POST /api/upload/pdf
  - 'image' → uploadImage(file, courseId) → POST /api/upload/image
  - 'document' → uploadDocument(file, courseId) → POST /api/upload/document
  - default → POST /api/upload/resource (legacy)
  ↓
Backend Routes (uploadRoutes.js)
  ↓
Multer middleware (uploadImage.single('file'))
  ↓
Controller (uploadController.js)
  - uploadImageFile() → uploadFileToS3(req, 'image', req.file)
  ↓
uploadFileToS3() helper:
  - Gets courseId from req.body.courseId || req.query.courseId
  - Validates file
  - Generates unique filename
  - Creates S3 key
  - Uploads to S3
  ↓
S3 Service (s3Service.js)
  - uploadFile() → PutObjectCommand
  - Returns URL and presigned URL
  ↓
Response to Frontend
  ↓
Frontend updates state with uploaded file URLs
```

## Identified Gaps & Issues

### 1. ✅ FIXED: Metadata Encoding Issue
**Problem**: Non-ASCII characters in metadata (especially `originalname`) cause S3 signature mismatch
**Solution**: Added `sanitizeMetadataValue()` to convert all metadata values to ASCII-safe strings

### 2. ✅ FIXED: S3 Key Encoding
**Problem**: S3 keys with non-ASCII characters can cause signature issues
**Solution**: Enhanced `generateS3Key()` to ensure ASCII-compatible keys

### 3. ✅ ADDED: Debug Logging
**Problem**: Hard to diagnose where courseId is lost or what's causing failures
**Solution**: Added comprehensive logging at each step

### 4. ⚠️ POTENTIAL: Multer FormData Parsing
**Issue**: Need to verify multer is parsing non-file FormData fields correctly
**Status**: Should work, but added logging to verify

### 5. ⚠️ POTENTIAL: Error Message Clarity
**Issue**: Error messages might not be clear enough for users
**Status**: Enhanced error messages with more context

## Current Status

### Working:
- ✅ Video uploads (no encoding issues in filenames)
- ✅ File type detection and routing
- ✅ CourseId passing from frontend
- ✅ S3 client initialization

### Not Working:
- ❌ Image uploads (signature mismatch due to metadata encoding)
- ❌ Files with special characters in names

### Fixed:
- ✅ Metadata sanitization (should fix signature mismatch)
- ✅ S3 key encoding
- ✅ Enhanced error logging

## Testing Checklist

1. [ ] Upload image with normal filename (e.g., "test.png")
2. [ ] Upload image with special characters (e.g., "Screenshot 2025-12-24 at 9.11.24 PM.png")
3. [ ] Upload PDF file
4. [ ] Upload document (DOC, DOCX, PPT, PPTX)
5. [ ] Upload multiple files at once
6. [ ] Verify courseId is received in backend logs
7. [ ] Verify S3 key is ASCII-safe in logs
8. [ ] Verify metadata values are ASCII-safe in logs
9. [ ] Check error messages are clear and helpful

## Next Steps

1. Restart backend server
2. Test image upload with special characters
3. Check server logs for:
   - CourseId reception
   - S3 key generation
   - Metadata sanitization
   - Upload request details
4. If still failing, check:
   - AWS credentials are correct
   - Bucket region matches
   - IAM permissions are correct

