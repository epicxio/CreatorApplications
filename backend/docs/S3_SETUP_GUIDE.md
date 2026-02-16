# AWS S3 Setup Guide

## Overview

This guide will help you set up AWS S3 for file storage in the Creator Marketplace Platform.

## Prerequisites

1. AWS Account
2. AWS Access Key ID and Secret Access Key
3. S3 Bucket created in AWS Console

## Step 1: Create S3 Bucket

1. Log in to [AWS Console](https://console.aws.amazon.com/)
2. Navigate to **S3** service
3. Click **Create bucket**
4. Configure bucket:
   - **Bucket name**: `creator-applications`
   - **Region**: `ap-south-1` (Mumbai)
   - **Block Public Access**: Enable (for security)
   - **Versioning**: Optional (recommended for production)
   - **Encryption**: Enable server-side encryption
5. Click **Create bucket**

## Step 2: Configure IAM User and Permissions

### Create IAM User

1. Navigate to **IAM** service in AWS Console
2. Click **Users** → **Create user**
3. Enter username: `creator-app-s3-user`
4. Select **Programmatic access**
5. Click **Next: Permissions**

### Attach S3 Policy

1. Click **Attach policies directly**
2. Create a custom policy with the following JSON:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket",
        "s3:PutObjectAcl"
      ],
      "Resource": [
        "arn:aws:s3:::creator-applications",
        "arn:aws:s3:::creator-applications/*"
      ]
    }
  ]
}
```

3. Name the policy: `CreatorAppS3Access`
4. Attach the policy to the user
5. Click **Next** → **Create user**

### Save Credentials

1. **IMPORTANT**: Save the Access Key ID and Secret Access Key
2. You won't be able to see the Secret Access Key again
3. Download the CSV file for safekeeping

## Step 3: Configure Environment Variables

Add the following to your `.env` file in the backend directory:

```env
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=<YOUR_AWS_ACCESS_KEY_ID>
AWS_SECRET_ACCESS_KEY=<YOUR_AWS_SECRET_ACCESS_KEY>
AWS_REGION=ap-south-1
AWS_S3_BUCKET=creator-applications

# Optional: S3 Configuration
S3_PRESIGNED_URL_EXPIRATION=3600
```

## Step 4: Install AWS SDK

```bash
cd backend
npm install aws-sdk
```

## Step 5: Verify Configuration

### Test S3 Connection

Create a test script `backend/scripts/testS3Connection.js`:

```javascript
require('dotenv').config();
const s3Service = require('../src/services/s3Service');

async function testConnection() {
  try {
    console.log('Testing S3 connection...');
    
    // Test file upload
    const testKey = 'test/connection-test.txt';
    const testContent = Buffer.from('S3 connection test');
    
    const uploadResult = await s3Service.uploadFile(
      testContent,
      testKey,
      'text/plain'
    );
    
    console.log('✅ Upload successful:', uploadResult.url);
    
    // Test file retrieval
    const fileContent = await s3Service.getFile(testKey);
    console.log('✅ File retrieval successful');
    
    // Test presigned URL
    const presignedUrl = await s3Service.getPresignedUrl(testKey);
    console.log('✅ Presigned URL generated:', presignedUrl);
    
    // Cleanup test file
    await s3Service.deleteFile(testKey);
    console.log('✅ Test file deleted');
    
    console.log('\n🎉 S3 configuration is working correctly!');
  } catch (error) {
    console.error('❌ S3 connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();
```

Run the test:

```bash
node backend/scripts/testS3Connection.js
```

## Step 6: CORS Configuration (Optional)

If you need to access S3 files directly from the frontend, configure CORS:

1. Go to your S3 bucket → **Permissions** → **CORS**
2. Add the following CORS configuration:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedOrigins": [
      "http://localhost:3000",
      "https://yourdomain.com"
    ],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

## Step 7: Bucket Policies (Optional)

For additional security, you can add bucket policies:

1. Go to your S3 bucket → **Permissions** → **Bucket policy**
2. Add policy to restrict access:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowAppAccess",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::YOUR_ACCOUNT_ID:user/creator-app-s3-user"
      },
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::creator-applications/*"
    }
  ]
}
```

## Step 8: Enable Versioning (Recommended)

1. Go to your S3 bucket → **Properties** → **Versioning**
2. Click **Enable**
3. This allows you to recover deleted or overwritten files

## Step 9: Set Up Lifecycle Policies (Optional)

To manage storage costs:

1. Go to your S3 bucket → **Management** → **Lifecycle rules**
2. Create a rule to:
   - Move old files to Glacier after 90 days
   - Delete old versions after 365 days

## Troubleshooting

### Common Issues

1. **Access Denied**
   - Check IAM user permissions
   - Verify bucket policy
   - Ensure credentials are correct

2. **Region Mismatch**
   - Verify `AWS_REGION` matches bucket region
   - Check bucket region in S3 console

3. **Bucket Not Found**
   - Verify bucket name is correct
   - Check bucket exists in the specified region

4. **CORS Errors**
   - Configure CORS policy
   - Check allowed origins

### Debug Mode

Enable debug logging:

```javascript
// In s3Config.js, add:
AWS.config.update({
  logger: console
});
```

## Security Best Practices

1. **Never commit credentials** to version control
2. **Use IAM roles** in production (EC2, Lambda)
3. **Rotate access keys** regularly
4. **Enable MFA** for IAM users
5. **Use bucket policies** to restrict access
6. **Enable encryption** at rest
7. **Enable access logging** for audit trails

## Next Steps

1. Review [S3_STORAGE_STRUCTURE.md](./S3_STORAGE_STRUCTURE.md) for folder organization
2. Check [MIGRATION_TO_S3.md](./MIGRATION_TO_S3.md) for migrating existing files
3. Update your application code to use S3 service

## Support

For issues or questions:
1. Check AWS S3 documentation
2. Review error logs
3. Test with the connection script
4. Verify IAM permissions

