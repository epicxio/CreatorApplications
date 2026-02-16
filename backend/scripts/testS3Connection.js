/**
 * S3 Connection Test Script
 * 
 * Tests the S3 configuration and connection
 * Run: node backend/scripts/testS3Connection.js
 */

const path = require('path');

// Load .env from backend directory (parent of scripts directory)
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const s3Service = require('../src/services/s3Service');
const { isS3Configured } = require('../src/config/s3Config');

async function testConnection() {
  console.log('🧪 Testing S3 Connection...\n');

  // Check configuration
  if (!isS3Configured()) {
    console.error('❌ S3 is not properly configured!');
    console.error('Please set the following environment variables:');
    console.error('  - AWS_ACCESS_KEY_ID');
    console.error('  - AWS_SECRET_ACCESS_KEY');
    console.error('  - AWS_REGION');
    console.error('  - AWS_S3_BUCKET');
    process.exit(1);
  }

  console.log('✅ S3 Configuration Valid\n');

  try {
    // Test 1: File Upload
    console.log('📤 Test 1: Uploading test file...');
    const testKey = 'test/connection-test.txt';
    const testContent = Buffer.from('S3 connection test - ' + new Date().toISOString());
    
    const uploadResult = await s3Service.uploadFile(
      testContent,
      testKey,
      'text/plain',
      {
        test: 'true',
        timestamp: new Date().toISOString()
      }
    );
    
    console.log('   ✅ Upload successful');
    console.log('   📍 Location:', uploadResult.location);
    console.log('   🔑 Key:', uploadResult.key);
    console.log('   🌐 URL:', uploadResult.url);

    // Test 2: File Retrieval
    console.log('\n📥 Test 2: Retrieving test file...');
    const fileContent = await s3Service.getFile(testKey);
    const contentString = fileContent.toString();
    console.log('   ✅ File retrieval successful');
    console.log('   📄 Content:', contentString.substring(0, 50) + '...');

    // Test 3: Presigned URL
    console.log('\n🔗 Test 3: Generating presigned URL...');
    const presignedUrl = await s3Service.getPresignedUrl(testKey, 3600);
    console.log('   ✅ Presigned URL generated');
    console.log('   🔗 URL:', presignedUrl.substring(0, 80) + '...');

    // Test 4: File Exists
    console.log('\n🔍 Test 4: Checking if file exists...');
    const exists = await s3Service.fileExists(testKey);
    console.log('   ✅ File exists:', exists);

    // Test 5: List Files
    console.log('\n📋 Test 5: Listing files in test directory...');
    const files = await s3Service.listFiles('test/');
    console.log('   ✅ Found', files.length, 'file(s)');
    files.forEach((file, index) => {
      console.log(`   ${index + 1}. ${file.Key} (${(file.Size / 1024).toFixed(2)} KB)`);
    });

    // Test 6: Delete File
    console.log('\n🗑️  Test 6: Deleting test file...');
    await s3Service.deleteFile(testKey);
    console.log('   ✅ File deleted successfully');

    // Test 7: Verify Deletion
    console.log('\n🔍 Test 7: Verifying file deletion...');
    const stillExists = await s3Service.fileExists(testKey);
    console.log('   ✅ File deleted:', !stillExists);

    console.log('\n🎉 All tests passed! S3 configuration is working correctly.\n');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('   Error details:', error);
    process.exit(1);
  }
}

// Run tests
testConnection();

