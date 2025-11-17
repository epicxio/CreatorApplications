const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  uploadPDF,
  uploadImage,
  uploadDocument,
  uploadResource,
  uploadVideo,
  uploadThumbnail,
  uploadAudio,
  uploadPDFFile,
  uploadImageFile,
  uploadDocumentFile,
  uploadResourceFile,
  uploadMultipleResources,
  uploadVideoFile,
  uploadThumbnailFile,
  uploadAudioFile,
  handleMulterError
} = require('../controllers/uploadController');

// All upload routes require authentication
router.use(auth);

// Upload PDF file
router.post('/pdf', uploadPDF.single('file'), handleMulterError, uploadPDFFile);

// Upload image file
router.post('/image', uploadImage.single('file'), handleMulterError, uploadImageFile);

// Upload document file (DOC, DOCX, PPT, PPTX, etc.)
router.post('/document', uploadDocument.single('file'), handleMulterError, uploadDocumentFile);

// Upload single resource file (legacy - for backward compatibility)
router.post('/resource', uploadResource.single('file'), handleMulterError, uploadResourceFile);

// Upload multiple resource files (legacy - for backward compatibility)
router.post('/resources', uploadResource.array('files', 10), handleMulterError, uploadMultipleResources);

// Upload video file
router.post('/video', uploadVideo.single('file'), handleMulterError, uploadVideoFile);

// Upload thumbnail for video
router.post('/thumbnail', uploadThumbnail.single('file'), handleMulterError, uploadThumbnailFile);

// Upload audio file
router.post('/audio', uploadAudio.single('file'), handleMulterError, uploadAudioFile);

module.exports = router;

