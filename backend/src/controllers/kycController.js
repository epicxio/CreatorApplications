const kycService = require('../services/kycService');
const fileStorage = require('../utils/fileStorage');
const s3Service = require('../services/s3Service');
const { triggerNotification } = require('../services/notificationService');
const path = require('path');
const axios = require('axios');

class KYCController {
  // Get user's KYC profile and documents
  async getKYCProfile(req, res) {
    try {
      const userId = req.user.id;
      const kycData = await kycService.getKYCProfile(userId);
      res.json({
        success: true,
        data: {
          profile: kycData.profile,
          documents: kycData.documents,
          percentUploaded: kycData.percentUploaded,
          uploadedCount: kycData.uploadedCount,
          requiredCount: kycData.requiredCount,
          approvedCount: kycData.approvedCount,
          panCardNumber: kycData.panCardNumber,
          aadharCardNumber: kycData.aadharCardNumber,
          otherDocuments: kycData.otherDocuments
        }
      });
    } catch (error) {
      console.error('Error in getKYCProfile:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Upload KYC document
  async uploadDocument(req, res) {
    try {
      const userId = req.user.id;
      const { documentType, documentName, documentNumber } = req.body;
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      if (!documentType || !documentName || !documentNumber) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields: documentType, documentName, documentNumber'
        });
      }

      const documentData = {
        documentType,
        documentName,
        documentNumber
      };

      const document = await kycService.uploadDocument(userId, documentData, req.file);
      
      // Trigger notification for KYC uploaded
      const user = req.user;
      await triggerNotification('kyc_uploaded', {
        userName: user.name || user.email || '',
        documentType,
        documentName,
        documentNumber
      });
      
      res.json({
        success: true,
        message: 'Document uploaded successfully',
        data: document
      });
    } catch (error) {
      console.error('Error in uploadDocument:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Update existing document
  async updateDocument(req, res) {
    try {
      const userId = req.user.id;
      const { documentId } = req.params;
      const { documentName, documentNumber } = req.body;
      
      const documentData = {
        documentName,
        documentNumber
      };

      const document = await kycService.updateDocument(documentId, userId, documentData, req.file);
      
      res.json({
        success: true,
        message: 'Document updated successfully',
        data: document
      });
    } catch (error) {
      console.error('Error in updateDocument:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Delete document
  async deleteDocument(req, res) {
    try {
      const userId = req.user.id;
      const { documentId } = req.params;

      const result = await kycService.deleteDocument(documentId, userId);
      
      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Error in deleteDocument:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Admin: Get all documents for verification
  async getDocumentsForVerification(req, res) {
    try {
      const { status, documentType, page = 1, limit = 10 } = req.query;
      
      const filters = {};
      if (status) filters.status = status;
      if (documentType) filters.documentType = documentType;

      const documents = await kycService.getDocumentsForVerification(filters);
      
      // Pagination
      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      const paginatedDocuments = documents.slice(startIndex, endIndex);
      
      res.json({
        success: true,
        data: paginatedDocuments,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(documents.length / limit),
          totalDocuments: documents.length,
          hasNextPage: endIndex < documents.length,
          hasPrevPage: page > 1
        }
      });
    } catch (error) {
      console.error('Error in getDocumentsForVerification:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Admin: Verify document
  async verifyDocument(req, res) {
    try {
      const verifiedBy = req.user.id;
      const { documentId } = req.params;
      const { status, remarks } = req.body;

      if (!status || !['pending', 'verified', 'rejected'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status. Must be pending, verified, or rejected'
        });
      }

      const document = await kycService.verifyDocument(documentId, verifiedBy, status, remarks);
      
      if (status === 'verified') {
        const user = await require('../models/User').findById(document.user);
        await triggerNotification('kyc_approved', {
          userName: user?.name || user?.email || '',
          documentType: document.documentType,
          documentName: document.documentName,
          documentNumber: document.documentNumber
        });
      }
      
      res.json({
        success: true,
        message: 'Document verification status updated',
        data: document
      });
    } catch (error) {
      console.error('Error in verifyDocument:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Admin: Get KYC statistics
  async getKYCStatistics(req, res) {
    try {
      const stats = await kycService.getKYCStatistics();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error in getKYCStatistics:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Admin: Get expiring KYC profiles
  async getExpiringProfiles(req, res) {
    try {
      const { daysThreshold = 30 } = req.query;
      
      const profiles = await kycService.getExpiringProfiles(parseInt(daysThreshold));
      
      res.json({
        success: true,
        data: profiles
      });
    } catch (error) {
      console.error('Error in getExpiringProfiles:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Admin: Get storage statistics
  async getStorageStats(req, res) {
    try {
      const stats = await fileStorage.getStorageStats();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error in getStorageStats:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Admin: Clean up temporary files
  async cleanupTempFiles(req, res) {
    try {
      const { maxAge } = req.body;
      const result = await fileStorage.cleanupTempFiles(maxAge);
      
      res.json({
        success: true,
        message: 'Temporary files cleaned up successfully',
        data: result
      });
    } catch (error) {
      console.error('Error in cleanupTempFiles:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Admin: Get KYC profile by user ID
  async getKYCProfileByUserId(req, res) {
    try {
      const { userId } = req.params;
      const profile = await kycService.getKYCProfileByUserId(userId);
      
      res.json({
        success: true,
        data: profile
      });
    } catch (error) {
      console.error('Error in getKYCProfileByUserId:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Admin: Update KYC profile status
  async updateKYCProfileStatus(req, res) {
    try {
      const { userId } = req.params;
      const { status, remarks } = req.body;
      const updatedBy = req.user.id;

      if (!status || !['pending', 'verified', 'rejected', 'expired'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status. Must be pending, verified, rejected, or expired'
        });
      }

      const profile = await kycService.updateKYCProfileStatus(userId, status, remarks, updatedBy);
      
      res.json({
        success: true,
        message: 'KYC profile status updated successfully',
        data: profile
      });
    } catch (error) {
      console.error('Error in updateKYCProfileStatus:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Admin: Export KYC data for user
  async exportKYCData(req, res) {
    try {
      const { userId } = req.params;
      const exportData = await kycService.exportKYCData(userId);
      
      res.json({
        success: true,
        data: exportData
      });
    } catch (error) {
      console.error('Error in exportKYCData:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Admin: Bulk verify documents
  async bulkVerifyDocuments(req, res) {
    try {
      const { documentIds, status, remarks } = req.body;
      const verifiedBy = req.user.id;

      if (!documentIds || !Array.isArray(documentIds) || documentIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Document IDs array is required'
        });
      }

      if (!status || !['pending', 'verified', 'rejected'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status. Must be pending, verified, or rejected'
        });
      }

      const results = await kycService.bulkVerifyDocuments(documentIds, status, remarks, verifiedBy);
      
      res.json({
        success: true,
        message: 'Bulk verification completed',
        data: results
      });
    } catch (error) {
      console.error('Error in bulkVerifyDocuments:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  // Download document file (stream from local or redirect to S3 presigned URL)
  async downloadDocument(req, res) {
    try {
      const { documentId } = req.params;
      const userId = req.user.id;
      const canViewAnyKYC = req.user?.permissions?.some(p =>
        [
          'Creator',
          'Creator Management',
          'Account Management',
          'Brand Management'
        ].includes(p.resource) && (p.action === 'View' || p.action === 'All')
      );
      const { filePath, fileName, mimeType, s3Key } = await kycService.getDocumentForDownload(documentId, userId, canViewAnyKYC);

      if (s3Key) {
        const presignedUrl = await s3Service.getPresignedUrl(s3Key);
        // Proxy the file from S3 to avoid CORS when frontend fetches from a different origin
        const streamResponse = await axios({
          method: 'GET',
          url: presignedUrl,
          responseType: 'stream',
          validateStatus: () => true,
        });
        if (streamResponse.status !== 200) {
          return res.status(404).json({ success: false, message: 'File not found' });
        }
        const contentType = streamResponse.headers['content-type'] || mimeType || 'application/octet-stream';
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
        streamResponse.data.pipe(res);
        return;
      }

      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `inline; filename=\"${fileName}\"`);
      const fs = require('fs');
      const absolutePath = path.isAbsolute(filePath) ? filePath : path.join(__dirname, '..', '..', filePath);
      const fileStream = fs.createReadStream(absolutePath);
      fileStream.on('error', (err) => {
        console.error('KYC download stream error:', err);
        if (!res.headersSent) res.status(404).json({ success: false, message: 'File not found' });
      });
      fileStream.pipe(res);
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  // Save a draft comment to reviewDraftHistory
  async saveDraftComment(req, res) {
    try {
      const { documentId } = req.params;
      const { comment } = req.body;
      const reviewer = req.user.id;
      if (!comment || !comment.trim()) {
        return res.status(400).json({ success: false, message: 'Comment is required.' });
      }
      const history = await kycService.saveDraftComment(documentId, reviewer, comment);
      res.json({ success: true, message: 'Draft comment saved.', data: history });
    } catch (error) {
      console.error('Error saving draft comment:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Get all draft comments for a document
  async getDraftHistory(req, res) {
    try {
      const { documentId } = req.params;
      const history = await kycService.getDraftHistory(documentId);
      res.json({ success: true, data: history });
    } catch (error) {
      console.error('Error fetching draft history:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new KYCController(); 