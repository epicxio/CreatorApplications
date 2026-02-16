const multer = require('multer');
const path = require('path');
const s3Service = require('../services/s3Service');

// Use memory storage for S3 uploads (files will be uploaded to S3, not saved locally)
const memoryStorage = multer.memoryStorage();

// File filter for PDFs
const pdfFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF files are allowed.'), false);
  }
};

// File filter for images
const imageFilter = (req, file, cb) => {
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'image/bmp'
  ];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only image files (JPG, PNG, GIF, WEBP, SVG, BMP) are allowed.'), false);
  }
};

// File filter for documents (DOC, DOCX, PPT, PPTX, TXT, etc.)
const documentFilter = (req, file, cb) => {
  const allowedMimes = [
    'application/msword', // .doc
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/vnd.ms-powerpoint', // .ppt
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
    'application/vnd.ms-excel', // .xls
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'text/plain', // .txt
    'application/rtf', // .rtf
    'application/vnd.oasis.opendocument.text', // .odt
    'application/vnd.oasis.opendocument.spreadsheet', // .ods
    'application/vnd.oasis.opendocument.presentation' // .odp
  ];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only document files (DOC, DOCX, PPT, PPTX, XLS, XLSX, TXT, RTF, ODT, ODS, ODP) are allowed.'), false);
  }
};

// Legacy resource filter (for backward compatibility - accepts all resource types)
const resourceFilter = (req, file, cb) => {
  const allowedMimes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp'
  ];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, DOCX, PPT, PPTX, and images are allowed.'), false);
  }
};

// File filter for videos
const videoFilter = (req, file, cb) => {
  const allowedMimes = [
    'video/mp4',
    'video/mpeg',
    'video/quicktime',
    'video/x-msvideo', // .avi
    'video/webm',
    'video/x-matroska' // .mkv
  ];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only video files (MP4, MOV, AVI, etc.) are allowed.'), false);
  }
};

// File filter for thumbnails (images only)
const thumbnailFilter = (req, file, cb) => {
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp'
  ];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only image files are allowed for thumbnails.'), false);
  }
};

// File filter for audio
const audioFilter = (req, file, cb) => {
  const allowedMimes = [
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/ogg',
    'audio/webm',
    'audio/aac',
    'audio/x-m4a'
  ];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only audio files (MP3, WAV, OGG, etc.) are allowed.'), false);
  }
};

// Multer configurations - using memory storage for S3 uploads
const uploadPDF = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB for PDFs
  },
  fileFilter: pdfFilter
});

const uploadImage = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB for images
  },
  fileFilter: imageFilter
});

const uploadDocument = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB for documents
  },
  fileFilter: documentFilter
});

// Legacy resource upload (for backward compatibility)
const uploadResource = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB for resources
  },
  fileFilter: resourceFilter
});

const uploadVideo = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB for videos (matching S3 config)
  },
  fileFilter: videoFilter
});

const uploadThumbnail = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB for thumbnails
  },
  fileFilter: thumbnailFilter
});

const uploadAudio = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB for audio files (matching S3 config)
  },
  fileFilter: audioFilter
});

// Helper function to upload file to S3
const uploadFileToS3 = async (req, fileType, file) => {
  const creatorId = req.user._id.toString();
  const courseId = req.body.courseId || req.query.courseId;
  
  // Debug logging
  console.log('📤 Upload Request Details:');
  console.log('   File Type:', fileType);
  console.log('   Creator ID:', creatorId);
  console.log('   Course ID from body:', req.body.courseId);
  console.log('   Course ID from query:', req.query.courseId);
  console.log('   Final Course ID:', courseId);
  console.log('   File Name:', file.originalname);
  console.log('   File Size:', file.size);
  console.log('   File MIME:', file.mimetype);
  
  if (!courseId) {
    console.error('❌ Course ID missing!');
    console.error('   Request body keys:', Object.keys(req.body));
    console.error('   Request query keys:', Object.keys(req.query));
    throw new Error('Course ID is required. Please provide courseId in request body or query.');
  }

  // Map upload types to validation types (for s3Service.validateFile)
  const validationTypeMap = {
    'pdf': 'document',
    'image': 'image',
    'document': 'document',
    'resource': 'document',
    'video': 'video',
    'thumbnail': 'image', // Thumbnails are images
    'audio': 'audio'
  };

  // Map upload types to S3 folder names (for S3 key generation)
  const s3FolderMap = {
    'pdf': 'documents',
    'image': 'images',
    'document': 'documents',
    'resource': 'documents',
    'video': 'videos',
    'thumbnail': 'thumbnails',
    'audio': 'audio'
  };

  const validationType = validationTypeMap[fileType] || 'document';
  const s3Folder = s3FolderMap[fileType] || 'documents';
  
  // Validate with validation type
  const validation = s3Service.validateFile(file, validationType);
  if (!validation.isValid) {
    throw new Error(`File validation failed: ${validation.errors.join(', ')}`);
  }

  // Generate unique filename
  const uniqueFilename = s3Service.generateUniqueFilename(file.originalname);

  // Generate S3 key with folder name
  const s3Key = s3Service.generateS3Key('creator', creatorId, s3Folder, courseId, uniqueFilename);

  // Upload to S3
  const result = await s3Service.uploadFile(
    file.buffer,
    s3Key,
    file.mimetype,
    {
      originalName: file.originalname,
      uploadedBy: creatorId,
      courseId: courseId,
      fileType: validationType
    }
  );

  return {
    success: true,
    filename: uniqueFilename,
    originalName: file.originalname,
    s3Key: result.key,
    url: result.url,
    presignedUrl: await s3Service.getPresignedUrl(result.key),
    size: file.size,
    mimetype: file.mimetype,
    location: result.location,
    bucket: result.bucket
  };
};

// Upload PDF file
const uploadPDFFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No PDF file uploaded'
      });
    }

    const result = await uploadFileToS3(req, 'pdf', req.file);
    
    res.json({
      success: true,
      data: {
        filename: result.filename,
        originalName: result.originalName,
        s3Key: result.s3Key,
        url: result.url,
        presignedUrl: result.presignedUrl,
        size: result.size,
        mimetype: result.mimetype
      },
      message: 'PDF file uploaded successfully to S3'
    });
  } catch (error) {
    console.error('Error uploading PDF to S3:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload PDF file',
      error: error.message
    });
  }
};

// Upload image file
const uploadImageFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file uploaded'
      });
    }

    const result = await uploadFileToS3(req, 'image', req.file);
    
    res.json({
      success: true,
      data: {
        filename: result.filename,
        originalName: result.originalName,
        s3Key: result.s3Key,
        url: result.url,
        presignedUrl: result.presignedUrl,
        size: result.size,
        mimetype: result.mimetype
      },
      message: 'Image file uploaded successfully to S3'
    });
  } catch (error) {
    console.error('Error uploading image to S3:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload image file',
      error: error.message
    });
  }
};

// Upload document file (DOC, DOCX, PPT, PPTX, etc.)
const uploadDocumentFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No document file uploaded'
      });
    }

    const result = await uploadFileToS3(req, 'document', req.file);
    
    res.json({
      success: true,
      data: {
        filename: result.filename,
        originalName: result.originalName,
        s3Key: result.s3Key,
        url: result.url,
        presignedUrl: result.presignedUrl,
        size: result.size,
        mimetype: result.mimetype
      },
      message: 'Document file uploaded successfully to S3'
    });
  } catch (error) {
    console.error('Error uploading document to S3:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload document file',
      error: error.message
    });
  }
};

// Upload single resource file (legacy - for backward compatibility)
const uploadResourceFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const result = await uploadFileToS3(req, 'resource', req.file);
    
    res.json({
      success: true,
      data: {
        filename: result.filename,
        originalName: result.originalName,
        s3Key: result.s3Key,
        url: result.url,
        presignedUrl: result.presignedUrl,
        size: result.size,
        mimetype: result.mimetype
      },
      message: 'Resource file uploaded successfully to S3'
    });
  } catch (error) {
    console.error('Error uploading resource to S3:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload resource file',
      error: error.message
    });
  }
};

// Upload multiple resource files
const uploadMultipleResources = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const uploadPromises = req.files.map(file => uploadFileToS3(req, 'resource', file));
    const results = await Promise.all(uploadPromises);
    
    const uploadedFiles = results.map(result => ({
      filename: result.filename,
      originalName: result.originalName,
      s3Key: result.s3Key,
      url: result.url,
      presignedUrl: result.presignedUrl,
      size: result.size,
      mimetype: result.mimetype
    }));
    
    res.json({
      success: true,
      data: uploadedFiles,
      message: `${uploadedFiles.length} resource file(s) uploaded successfully to S3`
    });
  } catch (error) {
    console.error('Error uploading resources to S3:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload resource files',
      error: error.message
    });
  }
};

// Upload video file
const uploadVideoFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No video file uploaded'
      });
    }

    const result = await uploadFileToS3(req, 'video', req.file);
    
    res.json({
      success: true,
      data: {
        filename: result.filename,
        originalName: result.originalName,
        s3Key: result.s3Key,
        url: result.url,
        presignedUrl: result.presignedUrl,
        size: result.size,
        mimetype: result.mimetype
      },
      message: 'Video file uploaded successfully to S3'
    });
  } catch (error) {
    console.error('Error uploading video to S3:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload video file',
      error: error.message
    });
  }
};

// Upload thumbnail for video
const uploadThumbnailFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No thumbnail file uploaded'
      });
    }

    const result = await uploadFileToS3(req, 'thumbnail', req.file);
    
    res.json({
      success: true,
      data: {
        filename: result.filename,
        originalName: result.originalName,
        s3Key: result.s3Key,
        url: result.url,
        presignedUrl: result.presignedUrl,
        size: result.size,
        mimetype: result.mimetype
      },
      message: 'Thumbnail uploaded successfully to S3'
    });
  } catch (error) {
    console.error('Error uploading thumbnail to S3:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload thumbnail',
      error: error.message
    });
  }
};

// Upload audio file
const uploadAudioFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No audio file uploaded'
      });
    }

    const result = await uploadFileToS3(req, 'audio', req.file);
    
    res.json({
      success: true,
      data: {
        filename: result.filename,
        originalName: result.originalName,
        s3Key: result.s3Key,
        url: result.url,
        presignedUrl: result.presignedUrl,
        size: result.size,
        mimetype: result.mimetype
      },
      message: 'Audio file uploaded successfully to S3'
    });
  } catch (error) {
    console.error('Error uploading audio to S3:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload audio file',
      error: error.message
    });
  }
};

// Error handling middleware for multer
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Please check the maximum file size allowed.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Please check the maximum number of files allowed.'
      });
    }
  }
  if (error.message.includes('Invalid file type')) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  next(error);
};

module.exports = {
  uploadPDF,
  uploadImage,
  uploadDocument,
  uploadResource, // Legacy - for backward compatibility
  uploadVideo,
  uploadThumbnail,
  uploadAudio,
  uploadPDFFile,
  uploadImageFile,
  uploadDocumentFile,
  uploadResourceFile, // Legacy - for backward compatibility
  uploadMultipleResources,
  uploadVideoFile,
  uploadThumbnailFile,
  uploadAudioFile,
  handleMulterError
};

