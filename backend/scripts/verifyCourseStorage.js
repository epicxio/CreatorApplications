/**
 * ============================================================================
 * VERIFY COURSE STORAGE IN MONGODB
 * ============================================================================
 * 
 * This script verifies that courses are being saved to MongoDB Atlas.
 * 
 * Usage: node backend/scripts/verifyCourseStorage.js
 * 
 * ============================================================================
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Course = require('../src/models/Course');

const verifyCourseStorage = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI not found in .env file');
    }

    console.log('🔌 Connecting to MongoDB Atlas...');
    console.log('📍 Database URI:', mongoUri.replace(/\/\/.*@/, '//*****:*****@')); // Hide credentials
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB Atlas\n');

    // Get database name from URI
    const dbName = mongoose.connection.db.databaseName;
    console.log(`📊 Database Name: ${dbName}`);
    console.log(`📦 Collection Name: courses\n`);

    // Count total courses
    const totalCourses = await Course.countDocuments();
    console.log(`📈 Total Courses in Database: ${totalCourses}`);

    // Get all courses
    const courses = await Course.find({})
      .populate('instructor', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);

    if (courses.length > 0) {
      console.log(`\n📋 Recent Courses (showing up to 10):`);
      console.log('─'.repeat(80));
      courses.forEach((course, index) => {
        console.log(`\n${index + 1}. Course ID: ${course._id}`);
        console.log(`   Name: ${course.name}`);
        console.log(`   Status: ${course.status}`);
        console.log(`   Instructor: ${course.instructor?.name || 'N/A'} (${course.instructor?.email || 'N/A'})`);
        console.log(`   Created: ${course.createdAt}`);
        console.log(`   Last Updated: ${course.lastUpdated}`);
        console.log(`   Modules: ${course.modules?.length || 0}`);
        console.log(`   Duration: ${course.duration} minutes`);
      });
      console.log('\n' + '─'.repeat(80));
    } else {
      console.log('\n⚠️  No courses found in database.');
      console.log('   This is normal if you haven\'t created any courses yet.');
    }

    // Show database statistics
    console.log('\n📊 Database Statistics:');
    const stats = await mongoose.connection.db.stats();
    console.log(`   Collections: ${stats.collections}`);
    console.log(`   Data Size: ${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Storage Size: ${(stats.storageSize / 1024 / 1024).toFixed(2)} MB`);

    // List all collections
    console.log('\n📚 All Collections in Database:');
    const collections = await mongoose.connection.db.listCollections().toArray();
    collections.forEach(col => {
      console.log(`   - ${col.name}`);
    });

    // Verify Course model is registered
    console.log('\n✅ Course Model Status:');
    console.log(`   Model Name: ${Course.modelName}`);
    console.log(`   Collection Name: ${Course.collection.name}`);
    console.log(`   Model Registered: ${mongoose.models.Course ? 'Yes' : 'No'}`);

    console.log('\n✅ Verification Complete!');
    console.log('\n💡 To view courses in MongoDB Atlas:');
    console.log('   1. Go to https://cloud.mongodb.com');
    console.log(`   2. Navigate to your cluster`);
    console.log(`   3. Click "Browse Collections"`);
    console.log(`   4. Select database: "${dbName}"`);
    console.log(`   5. Select collection: "courses"`);

  } catch (error) {
    console.error('\n❌ Error verifying course storage:', error);
    console.error('\n🔍 Troubleshooting:');
    console.error('   1. Check if MONGODB_URI is set in .env file');
    console.error('   2. Verify MongoDB Atlas connection string is correct');
    console.error('   3. Ensure your IP is whitelisted in MongoDB Atlas');
    console.error('   4. Check if the database name in URI is correct');
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB Atlas');
  }
};

// Run verification
verifyCourseStorage();

