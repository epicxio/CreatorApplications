import api from './api';

export interface UploadedFile {
  filename: string;
  originalName: string;
  path?: string;
  s3Key?: string;
  url: string;
  presignedUrl?: string;
  size: number;
  mimetype: string;
}

export interface UploadResponse {
  success: boolean;
  data: UploadedFile | UploadedFile[];
  message: string;
}

class UploadService {
  private baseUrl = '/upload'; // api instance already has '/api' in baseURL

  /**
   * Helper method to determine file type from file extension
   */
  private getFileType(file: File): 'pdf' | 'image' | 'document' | 'resource' {
    const fileName = file.name.toLowerCase();
    const extension = fileName.split('.').pop() || '';

    // PDF files
    if (extension === 'pdf') {
      return 'pdf';
    }

    // Image files
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(extension)) {
      return 'image';
    }

    // Document files (DOC, DOCX, PPT, PPTX, XLS, XLSX, TXT, RTF, ODT, ODS, ODP)
    if (['doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt', 'rtf', 'odt', 'ods', 'odp'].includes(extension)) {
      return 'document';
    }

    // Default to legacy resource endpoint
    return 'resource';
  }

  /**
   * Upload a PDF file
   */
  async uploadPDF(file: File, courseId?: string | null): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (courseId) {
      formData.append('courseId', courseId);
    }

    const response = await api.post<UploadResponse>(`${this.baseUrl}/pdf`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }

  /**
   * Upload an image file
   */
  async uploadImage(file: File, courseId?: string | null): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (courseId) {
      formData.append('courseId', courseId);
    }

    const response = await api.post<UploadResponse>(`${this.baseUrl}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }

  /**
   * Upload a document file (DOC, DOCX, PPT, PPTX, etc.)
   */
  async uploadDocument(file: File, courseId?: string | null): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (courseId) {
      formData.append('courseId', courseId);
    }

    const response = await api.post<UploadResponse>(`${this.baseUrl}/document`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }

  /**
   * Upload a single resource file (automatically routes to correct endpoint based on file type)
   */
  async uploadResource(file: File, courseId?: string | null): Promise<UploadResponse> {
    const fileType = this.getFileType(file);

    switch (fileType) {
      case 'pdf':
        return this.uploadPDF(file, courseId);
      case 'image':
        return this.uploadImage(file, courseId);
      case 'document':
        return this.uploadDocument(file, courseId);
      default:
        // Legacy resource endpoint for unknown types
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'resources');
        if (courseId) {
          formData.append('courseId', courseId);
        }

        const response = await api.post<UploadResponse>(`${this.baseUrl}/resource`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        return response.data;
    }
  }

  /**
   * Upload multiple resource files
   */
  async uploadMultipleResources(files: File[], courseId?: string | null): Promise<UploadResponse> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    formData.append('type', 'resources');
    if (courseId) {
      formData.append('courseId', courseId);
    }

    const response = await api.post<UploadResponse>(`${this.baseUrl}/resources`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }

  /**
   * Upload a video file
   */
  async uploadVideo(file: File, courseId?: string | null): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (courseId) {
      formData.append('courseId', courseId);
    }

    const response = await api.post<UploadResponse>(`${this.baseUrl}/video`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }

  /**
   * Upload a thumbnail image for a video
   */
  async uploadThumbnail(file: File, courseId?: string | null): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (courseId) {
      formData.append('courseId', courseId);
    }

    const response = await api.post<UploadResponse>(`${this.baseUrl}/thumbnail`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }

  /**
   * Upload an audio file
   */
  async uploadAudio(file: File, courseId?: string | null): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (courseId) {
      formData.append('courseId', courseId);
    }

    const response = await api.post<UploadResponse>(`${this.baseUrl}/audio`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }

  /**
   * Get full URL for an uploaded file
   * Handles both S3 URLs (http/https) and local paths
   */
  getFileUrl(url: string | undefined | null, presignedUrl?: string | null): string {
    // Handle null/undefined/empty URLs
    if (!url) {
      return '';
    }
    
    // Prefer presigned URL if available (for S3 private files)
    if (presignedUrl && presignedUrl.startsWith('http')) {
      return presignedUrl;
    }
    
    // If URL already includes http/https, return as is (S3 URLs)
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // Otherwise, prepend API base URL (for local files - legacy support)
    const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
    // Remove /api if present since uploads are served directly
    const baseUrl = apiBaseUrl.replace('/api', '');
    
    // Ensure url starts with / if it doesn't already
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    
    return `${baseUrl}${cleanUrl}`;
  }
}

const uploadService = new UploadService();
export default uploadService;

