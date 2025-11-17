# KYC (Know Your Customer) System

## Overview

The KYC system provides comprehensive document verification functionality for the Creator Marketplace platform. It allows users to upload identity documents (PAN Card, Aadhar Card, etc.) and enables administrators to verify these documents.

## Features

### 🔐 **Security & Compliance**
- Secure file storage with organized directory structure
- Document versioning and audit trails
- Soft delete functionality for data retention
- Role-based access control (RBAC)

### 📁 **Document Management**
- Support for multiple document types (PAN, Aadhar, Passport, etc.)
- File validation (size, type, format)
- Automatic file archiving and backup
- Document status tracking (pending, verified, rejected, expired)

### 👥 **User Experience**
- Progress tracking for KYC completion
- Real-time status updates
- Document preview and download capabilities
- Bulk operations for administrators

### 🏗️ **System Architecture**

```
uploads/
├── kyc/
│   ├── pan_cards/          # PAN card documents
│   ├── aadhar_cards/       # Aadhar card documents
│   ├── other_documents/    # Other government documents
│   ├── temp/              # Temporary files
│   ├── archived/          # Archived/old versions
│   └── backups/           # System backups
```

## Database Collections

### 1. **KYCDocument Collection**
Stores individual document metadata and file references.

```javascript
{
  _id: ObjectId,
  userId: ObjectId,           // Reference to User
  documentType: String,       // 'pan_card', 'aadhar_card', etc.
  documentName: String,       // Full name as per document
  documentNumber: String,     // Document number (PAN, Aadhar, etc.)
  fileName: String,           // Generated unique filename
  originalFileName: String,   // Original uploaded filename
  filePath: String,          // File system path
  fileSize: Number,          // File size in bytes
  mimeType: String,          // File MIME type
  status: String,            // 'pending', 'verified', 'rejected', 'expired'
  verifiedBy: ObjectId,      // Admin who verified
  verifiedAt: Date,          // Verification timestamp
  verificationRemarks: String,
  expiryDate: Date,          // Document expiry (if applicable)
  isActive: Boolean,         // Soft delete flag
  version: Number,           // Document version
  previousVersions: Array,   // Version history
  createdAt: Date,
  updatedAt: Date
}
```

### 2. **KYCProfile Collection**
Tracks overall KYC status and completion for each user.

```javascript
{
  _id: ObjectId,
  userId: ObjectId,           // Reference to User
  status: String,            // 'not_started', 'in_progress', 'pending_verification', 'verified', 'rejected'
  completionPercentage: Number, // 0-100
  requiredDocuments: {
    panCard: {
      isRequired: Boolean,
      isSubmitted: Boolean,
      isVerified: Boolean,
      documentId: ObjectId
    },
    aadharCard: { /* same structure */ },
    otherDocuments: [/* array of additional documents */]
  },
  verifiedBy: ObjectId,      // Admin who verified
  verifiedAt: Date,
  verificationRemarks: String,
  kycExpiryDate: Date,       // KYC expiry date
  lastSubmittedAt: Date,
  rejectionReason: String,
  rejectionDetails: Array,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints

### User Endpoints (Authentication Required)

#### Get KYC Profile
```http
GET /api/kyc/profile
```
Returns user's KYC profile and uploaded documents.

#### Upload Document
```http
POST /api/kyc/upload
Content-Type: multipart/form-data

{
  "documentType": "pan_card",
  "documentName": "John Doe",
  "documentNumber": "ABCDE1234F",
  "document": [file]
}
```

#### Update Document
```http
PUT /api/kyc/documents/:documentId
Content-Type: multipart/form-data

{
  "documentName": "John Doe Updated",
  "documentNumber": "ABCDE1234F",
  "document": [file]
}
```

#### Delete Document
```http
DELETE /api/kyc/documents/:documentId
```

#### Download Document
```http
GET /api/kyc/documents/:documentId/download
```

### Admin Endpoints (KYC Permissions Required)

#### Get Documents for Verification
```http
GET /api/kyc/admin/documents?status=pending&documentType=pan_card&page=1&limit=10
```

#### Verify Document
```http
PUT /api/kyc/admin/documents/:documentId/verify
{
  "status": "verified",
  "remarks": "Document verified successfully"
}
```

#### Get KYC Statistics
```http
GET /api/kyc/admin/statistics
```

#### Get Expiring Profiles
```http
GET /api/kyc/admin/expiring-profiles?daysThreshold=30
```

#### Bulk Verify Documents
```http
POST /api/kyc/admin/bulk-verify
{
  "documentIds": ["id1", "id2", "id3"],
  "status": "verified",
  "remarks": "Bulk verification completed"
}
```

#### Get Storage Statistics
```http
GET /api/kyc/admin/storage-stats
```

#### Clean Up Temporary Files
```http
POST /api/kyc/admin/cleanup-temp
{
  "maxAge": 86400000  // 24 hours in milliseconds
}
```

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Variables
Ensure your `.env` file contains:
```env
MONGODB_URI=mongodb+srv://market:market123@cluster0.h5wid8t.mongodb.net/creatormarketplace?retryWrites=true&w=majority
UPLOAD_BASE_DIR=uploads
```

### 3. Create Upload Directories
The system will automatically create the required directory structure on startup.

### 4. Insert KYC Permissions
```bash
cd backend/src/scripts
node insertKYCPermissions.js
```

### 5. Start the Server
```bash
npm run dev
```

## File Storage Structure

The system organizes uploaded files in a structured manner:

```
uploads/
├── kyc/
│   ├── pan_cards/
│   │   ├── user123_pan_card_john_doe_1703123456789_abc123.pdf
│   │   └── user456_pan_card_jane_smith_1703123456790_def456.jpg
│   ├── aadhar_cards/
│   │   ├── user123_aadhar_card_123456789012_1703123456789_ghi789.pdf
│   │   └── user456_aadhar_card_987654321098_1703123456790_jkl012.jpg
│   ├── other_documents/
│   │   ├── user123_passport_passport123_1703123456789_mno345.pdf
│   │   └── user456_driving_license_dl123456_1703123456790_pqr678.jpg
│   ├── temp/
│   │   └── [temporary files for processing]
│   ├── archived/
│   │   └── [old versions and deleted files]
│   └── backups/
│       └── [system backups by date]
```

## Security Features

### File Validation
- **Size Limit**: 5MB maximum per file
- **Allowed Types**: JPG, PNG, PDF
- **Virus Scanning**: Files are validated for malicious content

### Access Control
- **Authentication**: All endpoints require valid JWT token
- **Authorization**: Admin endpoints require KYC permissions
- **File Access**: Users can only access their own documents

### Data Protection
- **Soft Delete**: Documents are archived, not permanently deleted
- **Version Control**: Previous versions are preserved
- **Audit Trail**: All actions are logged with timestamps

## Usage Examples

### Frontend Integration

#### Upload PAN Card
```javascript
const formData = new FormData();
formData.append('documentType', 'pan_card');
formData.append('documentName', 'John Doe');
formData.append('documentNumber', 'ABCDE1234F');
formData.append('document', fileInput.files[0]);

const response = await fetch('/api/kyc/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

#### Get KYC Profile
```javascript
const response = await fetch('/api/kyc/profile', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const kycData = await response.json();
console.log('KYC Completion:', kycData.data.completionPercentage + '%');
```

### Admin Operations

#### Verify Document
```javascript
const response = await fetch(`/api/kyc/admin/documents/${documentId}/verify`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${adminToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    status: 'verified',
    remarks: 'Document verified successfully'
  })
});
```

## Monitoring and Maintenance

### Regular Tasks
1. **Clean Temporary Files**: Run cleanup script weekly
2. **Monitor Storage**: Check storage statistics monthly
3. **Backup Verification**: Ensure backups are working
4. **Expiry Notifications**: Monitor expiring KYC profiles

### Health Checks
```http
GET /api/kyc/health
```

### Storage Statistics
```http
GET /api/kyc/admin/storage-stats
```

## Error Handling

The system includes comprehensive error handling:

- **File Validation Errors**: Size, type, format validation
- **Database Errors**: Connection, query, validation errors
- **Permission Errors**: Unauthorized access attempts
- **Storage Errors**: File system, disk space issues

## Performance Considerations

- **File Size Limits**: 5MB per file to prevent storage issues
- **Database Indexes**: Optimized queries with proper indexing
- **Caching**: Consider implementing Redis for frequently accessed data
- **CDN**: For production, consider using CDN for file serving

## Troubleshooting

### Common Issues

1. **File Upload Fails**
   - Check file size (max 5MB)
   - Verify file type (JPG, PNG, PDF only)
   - Ensure upload directory has write permissions

2. **Permission Denied**
   - Verify user has KYC permissions
   - Check JWT token validity
   - Ensure proper role assignment

3. **Database Connection Issues**
   - Verify MongoDB URI in .env
   - Check network connectivity
   - Ensure MongoDB service is running

### Logs
Check server logs for detailed error information:
```bash
npm run dev
```

## Future Enhancements

1. **OCR Integration**: Automatic document text extraction
2. **Face Recognition**: Photo verification against documents
3. **Third-party Verification**: Integration with government APIs
4. **Mobile App**: Native mobile application
5. **Real-time Notifications**: WebSocket integration
6. **Advanced Analytics**: Detailed reporting and insights

## Support

For technical support or questions about the KYC system, please refer to the development team or create an issue in the project repository. 