const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');

// Helper function to create storage with a fixed upload type
const createStorage = (uploadType) => {
  return multer.diskStorage({
    destination: async (req, file, cb) => {
      const baseDir = process.env.UPLOAD_BASE_DIR || path.join(__dirname, '../../uploads');
      const uploadDir = path.join(baseDir, 'courses', uploadType);
      
      // Ensure directory exists
      try {
        await fs.mkdir(uploadDir, { recursive: true });
        cb(null, uploadDir);
      } catch (error) {
        cb(error, null);
      }
    },
    filename: (req, file, cb) => {
      // Generate unique filename: timestamp-uuid-originalname
      const uniqueName = `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
      cb(null, uniqueName);
    }
  });
};

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

// Multer configurations - each uses its own storage with fixed folder
const uploadPDF = multer({
  storage: createStorage('pdfs'), // Always save to 'pdfs' folder
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB for PDFs
  },
  fileFilter: pdfFilter
});

const uploadImage = multer({
  storage: createStorage('images'), // Always save to 'images' folder
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB for images
  },
  fileFilter: imageFilter
});

const uploadDocument = multer({
  storage: createStorage('documents'), // Always save to 'documents' folder
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB for documents
  },
  fileFilter: documentFilter
});

// Legacy resource upload (for backward compatibility)
const uploadResource = multer({
  storage: createStorage('resources'), // Always save to 'resources' folder
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB for resources
  },
  fileFilter: resourceFilter
});

const uploadVideo = multer({
  storage: createStorage('videos'), // Always save to 'videos' folder
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB for videos (adjust as needed)
  },
  fileFilter: videoFilter
});

const uploadThumbnail = multer({
  storage: createStorage('thumbnails'), // Always save to 'thumbnails' folder
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB for thumbnails
  },
  fileFilter: thumbnailFilter
});

const uploadAudio = multer({
  storage: createStorage('audio'), // Always save to 'audio' folder
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB for audio files
  },
  fileFilter: audioFilter
});

// Upload PDF file
const uploadPDFFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No PDF file uploaded'
      });
    }

    const fileUrl = `/uploads/courses/pdfs/${req.file.filename}`;
    
    res.json({
      success: true,
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: req.file.path,
        url: fileUrl,
        size: req.file.size,
        mimetype: req.file.mimetype
      },
      message: 'PDF file uploaded successfully'
    });
  } catch (error) {
    console.error('Error uploading PDF:', error);
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

    const fileUrl = `/uploads/courses/images/${req.file.filename}`;
    
    res.json({
      success: true,
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: req.file.path,
        url: fileUrl,
        size: req.file.size,
        mimetype: req.file.mimetype
      },
      message: 'Image file uploaded successfully'
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload image file',
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

    const fileUrl = `/uploads/courses/documents/${req.file.filename}`;
    
    res.json({
      success: true,
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: req.file.path,
        url: fileUrl,
        size: req.file.size,
        mimetype: req.file.mimetype
      },
      message: 'Document file uploaded successfully'
    });
  } catch (error) {
    console.error('Error uploading document:', error);
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

    // Generate URL path (relative to uploads directory)
    const fileUrl = `/uploads/courses/resources/${req.file.filename}`;
    
    res.json({
      success: true,
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: req.file.path,
        url: fileUrl,
        size: req.file.size,
        mimetype: req.file.mimetype
      },
      message: 'Resource file uploaded successfully'
    });
  } catch (error) {
    console.error('Error uploading resource:', error);
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

    const uploadedFiles = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      path: file.path,
      url: `/uploads/courses/resources/${file.filename}`,
      size: file.size,
      mimetype: file.mimetype
    }));
    
    res.json({
      success: true,
      data: uploadedFiles,
      message: `${uploadedFiles.length} resource file(s) uploaded successfully`
    });
  } catch (error) {
    console.error('Error uploading resources:', error);
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

    const fileUrl = `/uploads/courses/videos/${req.file.filename}`;
    
    res.json({
      success: true,
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: req.file.path,
        url: fileUrl,
        size: req.file.size,
        mimetype: req.file.mimetype
      },
      message: 'Video file uploaded successfully'
    });
  } catch (error) {
    console.error('Error uploading video:', error);
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

    const fileUrl = `/uploads/courses/thumbnails/${req.file.filename}`;
    
    res.json({
      success: true,
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: req.file.path,
        url: fileUrl,
        size: req.file.size,
        mimetype: req.file.mimetype
      },
      message: 'Thumbnail uploaded successfully'
    });
  } catch (error) {
    console.error('Error uploading thumbnail:', error);
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

    const fileUrl = `/uploads/courses/audio/${req.file.filename}`;
    
    res.json({
      success: true,
      data: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: req.file.path,
        url: fileUrl,
        size: req.file.size,
        mimetype: req.file.mimetype
      },
      message: 'Audio file uploaded successfully'
    });
  } catch (error) {
    console.error('Error uploading audio:', error);
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

