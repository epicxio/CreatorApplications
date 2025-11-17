const KYCDocument = require('../models/KYCDocument');
const KYCProfile = require('../models/KYCProfile');
const User = require('../models/User');
const fileStorage = require('../utils/fileStorage');

class KYCService {
  // Get KYC profile for user
  async getKYCProfile(userId) {
    try {
      let profile = await KYCProfile.findOne({ userId })
        .populate('userId', 'name email userType')
        .populate('verifiedBy', 'name email');

      if (!profile) {
        // Create new profile if doesn't exist
        profile = new KYCProfile({ userId });
        await profile.save();
      }

      // Get documents for this user
      const documents = await KYCDocument.getActiveByUser(userId);

      // Required document logic
      // 1 PAN, 1 Aadhar, 1 Other (minimum 1) required for 100%
      let uploadedCount = 0;
      let approvedCount = 0;
      let panCardNumber = null;
      let aadharCardNumber = null;
      let otherDocuments = documents.filter(doc => doc.documentType === 'other');

      // PAN
      const panDoc = documents.find(doc => doc.documentType === 'pan_card');
      if (panDoc) {
        uploadedCount += 1;
        panCardNumber = panDoc.documentNumber;
        if (panDoc.status === 'verified') approvedCount += 1;
      }

      // AADHAR
      const aadharDoc = documents.find(doc => doc.documentType === 'aadhar_card');
      if (aadharDoc) {
        uploadedCount += 1;
        aadharCardNumber = aadharDoc.documentNumber;
        if (aadharDoc.status === 'verified') approvedCount += 1;
      }

      // OTHER (only 1 counts for progress)
      if (otherDocuments.length > 0) {
        uploadedCount += 1;
        if (otherDocuments[0].status === 'verified') approvedCount += 1;
      }

      const requiredCount = 3;
      const percentUploaded = Math.round((uploadedCount / requiredCount) * 100);

      return {
        profile,
        documents,
        percentUploaded,
        uploadedCount,
        requiredCount,
        approvedCount,
        panCardNumber,
        aadharCardNumber,
        otherDocuments
      };
    } catch (error) {
      console.error('Error getting KYC profile:', error);
      throw new Error(`Failed to get KYC profile: ${error.message}`);
    }
  }

  // Upload KYC document
  async uploadDocument(userId, documentData, file) {
    try {
      const { documentType, documentName, documentNumber } = documentData;

      // Validate document type
      const validTypes = ['pan_card', 'aadhar_card', 'passport', 'driving_license', 'voter_id', 'other'];
      if (!validTypes.includes(documentType)) {
        throw new Error('Invalid document type');
      }

      // Check if user exists
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Save file to storage
      const fileInfo = await fileStorage.saveFile(file, userId, documentType);

      // Create or update KYC document
      const kycDocument = new KYCDocument({
        userId,
        documentType,
        documentName,
        documentNumber,
        fileName: fileInfo.fileName,
        originalFileName: fileInfo.originalFileName,
        filePath: fileInfo.filePath,
        fileSize: fileInfo.fileSize,
        mimeType: fileInfo.mimeType
      });

      await kycDocument.save();

      // Update KYC profile
      await this.updateKYCProfile(userId, documentType, kycDocument._id);

      return kycDocument;
    } catch (error) {
      console.error('Error uploading KYC document:', error);
      throw new Error(`Failed to upload document: ${error.message}`);
    }
  }

  // Update KYC profile after document upload
  async updateKYCProfile(userId, documentType, documentId) {
    try {
      let profile = await KYCProfile.findOne({ userId });
      
      if (!profile) {
        profile = new KYCProfile({ userId });
      }

      // Update document status based on type
      if (documentType === 'pan_card') {
        profile.requiredDocuments.panCard.isSubmitted = true;
        profile.requiredDocuments.panCard.documentId = documentId;
      } else if (documentType === 'aadhar_card') {
        profile.requiredDocuments.aadharCard.isSubmitted = true;
        profile.requiredDocuments.aadharCard.documentId = documentId;
      } else {
        // Add to other documents
        const existingIndex = profile.requiredDocuments.otherDocuments.findIndex(
          doc => doc.documentType === documentType
        );
        
        if (existingIndex >= 0) {
          profile.requiredDocuments.otherDocuments[existingIndex].isSubmitted = true;
          profile.requiredDocuments.otherDocuments[existingIndex].documentId = documentId;
        } else {
          profile.requiredDocuments.otherDocuments.push({
            documentType,
            isRequired: false,
            isSubmitted: true,
            isVerified: false,
            documentId
          });
        }
      }

      profile.lastSubmittedAt = new Date();
      await profile.updateStatus();
      
      return profile;
    } catch (error) {
      console.error('Error updating KYC profile:', error);
      throw new Error(`Failed to update KYC profile: ${error.message}`);
    }
  }

  // Update existing document
  async updateDocument(documentId, userId, documentData, file) {
    try {
      const document = await KYCDocument.findOne({ _id: documentId, userId });
      if (!document) {
        throw new Error('Document not found');
      }

      // Only update file if a new file is uploaded
      if (file) {
        // Archive old file
        if (document.filePath) {
          await fileStorage.archiveFile(document.filePath, 'document_update');
        }
        // Save new file
        const fileInfo = await fileStorage.saveFile(file, userId, document.documentType);
        document.fileName = fileInfo.fileName;
        document.originalFileName = fileInfo.originalFileName;
        document.filePath = fileInfo.filePath;
        document.fileSize = fileInfo.fileSize;
        document.mimeType = fileInfo.mimeType;
        document.status = 'pending'; // Reset status for re-verification
      }
      // Always update name/number if provided
      if (documentData.documentName) document.documentName = documentData.documentName;
      if (documentData.documentNumber) document.documentNumber = documentData.documentNumber;
      await document.save();
      return document;
    } catch (error) {
      console.error('Error updating document:', error);
      throw new Error(`Failed to update document: ${error.message}`);
    }
  }

  // Delete document
  async deleteDocument(documentId, userId) {
    try {
      const document = await KYCDocument.findOne({ _id: documentId, userId });
      if (!document) {
        throw new Error('Document not found');
      }

      // Archive file
      if (document.filePath) {
        await fileStorage.archiveFile(document.filePath, 'document_deletion');
      }

      // Soft delete document
      await document.softDelete(userId);

      // Update KYC profile
      await this.updateKYCProfileAfterDeletion(userId, document.documentType);

      return { success: true, message: 'Document deleted successfully' };
    } catch (error) {
      console.error('Error deleting document:', error);
      throw new Error(`Failed to delete document: ${error.message}`);
    }
  }

  // Update KYC profile after document deletion
  async updateKYCProfileAfterDeletion(userId, documentType) {
    try {
      const profile = await KYCProfile.findOne({ userId });
      if (!profile) return;

      if (documentType === 'pan_card') {
        profile.requiredDocuments.panCard.isSubmitted = false;
        profile.requiredDocuments.panCard.isVerified = false;
        profile.requiredDocuments.panCard.documentId = null;
      } else if (documentType === 'aadhar_card') {
        profile.requiredDocuments.aadharCard.isSubmitted = false;
        profile.requiredDocuments.aadharCard.isVerified = false;
        profile.requiredDocuments.aadharCard.documentId = null;
      } else {
        const docIndex = profile.requiredDocuments.otherDocuments.findIndex(
          doc => doc.documentType === documentType
        );
        if (docIndex >= 0) {
          profile.requiredDocuments.otherDocuments[docIndex].isSubmitted = false;
          profile.requiredDocuments.otherDocuments[docIndex].isVerified = false;
          profile.requiredDocuments.otherDocuments[docIndex].documentId = null;
        }
      }

      await profile.updateStatus();
    } catch (error) {
      console.error('Error updating profile after deletion:', error);
    }
  }

  // Verify document (admin function)
  async verifyDocument(documentId, verifiedBy, status, remarks = '') {
    try {
      const document = await KYCDocument.findById(documentId);
      if (!document) {
        throw new Error('Document not found');
      }

      document.status = status;
      document.verifiedBy = verifiedBy;
      document.verifiedAt = new Date();
      document.verificationRemarks = remarks;

      await document.save();

      // Update KYC profile verification status
      await this.updateKYCProfileVerification(document.userId, document.documentType, status);

      return document;
    } catch (error) {
      console.error('Error verifying document:', error);
      throw new Error(`Failed to verify document: ${error.message}`);
    }
  }

  // Update KYC profile verification status
  async updateKYCProfileVerification(userId, documentType, status) {
    try {
      const profile = await KYCProfile.findOne({ userId });
      if (!profile) return;

      const isVerified = status === 'verified';

      if (documentType === 'pan_card') {
        profile.requiredDocuments.panCard.isVerified = isVerified;
      } else if (documentType === 'aadhar_card') {
        profile.requiredDocuments.aadharCard.isVerified = isVerified;
      } else {
        const docIndex = profile.requiredDocuments.otherDocuments.findIndex(
          doc => doc.documentType === documentType
        );
        if (docIndex >= 0) {
          profile.requiredDocuments.otherDocuments[docIndex].isVerified = isVerified;
        }
      }

      // Check if all required documents are verified
      const allRequiredVerified = this.checkAllRequiredDocumentsVerified(profile);
      
      if (allRequiredVerified && profile.status === 'pending_verification') {
        await profile.markAsVerified(profile.verifiedBy, 'All required documents verified');
      }

      await profile.save();
    } catch (error) {
      console.error('Error updating profile verification:', error);
    }
  }

  // Check if all required documents are verified
  checkAllRequiredDocumentsVerified(profile) {
    const requiredDocs = [
      profile.requiredDocuments.panCard,
      profile.requiredDocuments.aadharCard,
      ...profile.requiredDocuments.otherDocuments.filter(doc => doc.isRequired)
    ];

    return requiredDocs.every(doc => doc.isSubmitted && doc.isVerified);
  }

  // Get documents for verification (admin function)
  async getDocumentsForVerification(filters = {}) {
    try {
      const query = { isActive: true };
      
      if (filters.status) {
        query.status = filters.status;
      }
      
      if (filters.documentType) {
        query.documentType = filters.documentType;
      }

      const documents = await KYCDocument.find(query)
        .populate('userId', 'userId creatorId name email userType')
        .populate('verifiedBy', 'name email')
        .sort({ createdAt: -1 });

      return documents;
    } catch (error) {
      console.error('Error getting documents for verification:', error);
      throw new Error(`Failed to get documents: ${error.message}`);
    }
  }

  // Get KYC statistics
  async getKYCStatistics() {
    try {
      const stats = {
        totalProfiles: await KYCProfile.countDocuments({ isActive: true }),
        byStatus: {},
        byDocumentType: {},
        recentUploads: 0,
        pendingVerifications: 0
      };

      // Count by status
      const statuses = ['not_started', 'in_progress', 'pending_verification', 'verified', 'rejected'];
      for (const status of statuses) {
        stats.byStatus[status] = await KYCProfile.countDocuments({ 
          status, 
          isActive: true 
        });
      }

      // Count by document type
      const documentTypes = ['pan_card', 'aadhar_card', 'passport', 'driving_license', 'voter_id', 'other'];
      for (const docType of documentTypes) {
        stats.byDocumentType[docType] = await KYCDocument.countDocuments({ 
          documentType: docType,
          isActive: true 
        });
      }

      // Recent uploads (last 7 days)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      stats.recentUploads = await KYCDocument.countDocuments({
        createdAt: { $gte: sevenDaysAgo },
        isActive: true
      });

      // Pending verifications
      stats.pendingVerifications = await KYCDocument.countDocuments({
        status: 'pending',
        isActive: true
      });

      return stats;
    } catch (error) {
      console.error('Error getting KYC statistics:', error);
      throw new Error(`Failed to get statistics: ${error.message}`);
    }
  }

  // Get expiring KYC profiles
  async getExpiringProfiles(daysThreshold = 30) {
    try {
      return await KYCProfile.getExpiringProfiles(daysThreshold);
    } catch (error) {
      console.error('Error getting expiring profiles:', error);
      throw new Error(`Failed to get expiring profiles: ${error.message}`);
    }
  }

  // Bulk verify documents
  async bulkVerifyDocuments(documentIds, verifiedBy, status, remarks = '') {
    try {
      const results = [];
      
      for (const documentId of documentIds) {
        try {
          const result = await this.verifyDocument(documentId, verifiedBy, status, remarks);
          results.push({ documentId, success: true, document: result });
        } catch (error) {
          results.push({ documentId, success: false, error: error.message });
        }
      }

      return results;
    } catch (error) {
      console.error('Error bulk verifying documents:', error);
      throw new Error(`Failed to bulk verify documents: ${error.message}`);
    }
  }

  // Export KYC data
  async exportKYCData(userId) {
    try {
      const profile = await this.getKYCProfile(userId);
      const documents = await KYCDocument.getActiveByUser(userId);
      
      return {
        profile: profile.profile,
        documents,
        exportDate: new Date(),
        totalDocuments: documents.length,
        verifiedDocuments: documents.filter(doc => doc.status === 'verified').length
      };
    } catch (error) {
      console.error('Error exporting KYC data:', error);
      throw new Error(`Failed to export KYC data: ${error.message}`);
    }
  }

  // Add this to your KYCService class
  async getDocumentForDownload(documentId, userId, isAdmin = false) {
    const KYCDocument = require('../models/KYCDocument');
    let query = { _id: documentId, isActive: true };
    if (!isAdmin) query.userId = userId;
    const doc = await KYCDocument.findOne(query);
    if (!doc) throw new Error('Document not found');
    return {
      filePath: doc.filePath,
      fileName: doc.fileName,
      mimeType: doc.mimeType,
    };
  }

  // Save a draft comment to reviewDraftHistory
  async saveDraftComment(documentId, reviewerId, comment) {
    try {
      const doc = await KYCDocument.findById(documentId);
      if (!doc) throw new Error('Document not found');
      doc.reviewDraftHistory.push({
        comment,
        reviewer: reviewerId,
        createdAt: new Date()
      });
      await doc.save();
      return doc.reviewDraftHistory;
    } catch (error) {
      console.error('Error saving draft comment:', error);
      throw new Error(`Failed to save draft comment: ${error.message}`);
    }
  }

  // Get all draft comments for a document
  async getDraftHistory(documentId) {
    try {
      const doc = await KYCDocument.findById(documentId).populate('reviewDraftHistory.reviewer', 'name email');
      if (!doc) throw new Error('Document not found');
      return doc.reviewDraftHistory;
    } catch (error) {
      console.error('Error fetching draft history:', error);
      throw new Error(`Failed to fetch draft history: ${error.message}`);
    }
  }
}

module.exports = new KYCService(); 