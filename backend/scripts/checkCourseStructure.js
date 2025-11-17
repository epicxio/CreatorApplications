/**
 * ============================================================================
 * CHECK COURSE STRUCTURE IN MONGODB ATLAS
 * ============================================================================
 * 
 * This script verifies the Course collection structure and courseId field.
 * 
 * Usage: node backend/scripts/checkCourseStructure.js
 * 
 * ============================================================================
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Course = require('../src/models/Course');

const checkCourseStructure = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI not found in .env file');
    }

    console.log('🔌 Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB Atlas\n');

    // Get database and collection info
    const dbName = mongoose.connection.db.databaseName;
    const collectionName = Course.collection.name;
    
    console.log('📊 DATABASE INFORMATION:');
    console.log(`   Database Name: ${dbName}`);
    console.log(`   Collection Name: ${collectionName}`);
    console.log(`   Model Name: ${Course.modelName}\n`);

    // Get collection stats
    const stats = await mongoose.connection.db.collection(collectionName).stats();
    console.log('📈 COLLECTION STATISTICS:');
    console.log(`   Document Count: ${stats.count}`);
    console.log(`   Size: ${(stats.size / 1024).toFixed(2)} KB`);
    console.log(`   Storage Size: ${(stats.storageSize / 1024).toFixed(2)} KB\n`);

    // Get sample course to see structure
    const sampleCourse = await Course.findOne({});
    
    if (sampleCourse) {
      console.log('📋 SAMPLE COURSE DOCUMENT STRUCTURE:');
      console.log('   Fields in document:');
      Object.keys(sampleCourse.toObject()).forEach(key => {
        const value = sampleCourse[key];
        const type = Array.isArray(value) ? 'Array' : typeof value;
        const preview = typeof value === 'string' && value.length > 50 
          ? value.substring(0, 50) + '...' 
          : value;
        console.log(`     - ${key}: ${type} = ${JSON.stringify(preview)}`);
      });
      console.log('\n');

      // Check courseId specifically
      console.log('🆔 COURSE ID FIELD:');
      console.log(`   Field Name: courseId`);
      console.log(`   Value: ${sampleCourse.courseId || 'NOT SET'}`);
      console.log(`   Type: ${typeof sampleCourse.courseId}`);
      
      if (sampleCourse.courseId) {
        console.log(`   Format: ${sampleCourse.courseId}`);
        // Parse the format
        const match = sampleCourse.courseId.match(/^C-([A-Z]{3})-(\\d+)$/);
        if (match) {
          console.log(`   ✅ Valid format: C-{Creator Initials}-{Number}`);
          console.log(`   Creator Initials: ${match[1]}`);
          console.log(`   Sequence Number: ${match[2]}`);
        }
      }
      console.log('\n');
    } else {
      console.log('⚠️  No courses found in collection.\n');
    }

    // Check indexes
    const indexes = await Course.collection.getIndexes();
    console.log('🔍 INDEXES ON COLLECTION:');
    Object.keys(indexes).forEach(indexName => {
      console.log(`   - ${indexName}:`, JSON.stringify(indexes[indexName]));
    });
    console.log('\n');

    // Count courses with courseId
    const coursesWithId = await Course.countDocuments({ courseId: { $exists: true, $ne: null } });
    const coursesWithoutId = await Course.countDocuments({ courseId: { $exists: false } });
    
    console.log('📊 COURSE ID STATISTICS:');
    console.log(`   Courses with courseId: ${coursesWithId}`);
    console.log(`   Courses without courseId: ${coursesWithoutId}`);
    console.log(`   Total courses: ${await Course.countDocuments()}\n`);

    // Show all courseIds
    if (coursesWithId > 0) {
      const allCourseIds = await Course.find({ courseId: { $exists: true } })
        .select('courseId name instructor')
        .populate('instructor', 'name')
        .limit(10);
      
      console.log('📝 SAMPLE COURSE IDs (showing up to 10):');
      allCourseIds.forEach(course => {
        console.log(`   ${course.courseId} - ${course.name} (Instructor: ${course.instructor?.name || 'N/A'})`);
      });
      console.log('\n');
    }

    console.log('✅ Structure check complete!');
    console.log('\n💡 SUMMARY:');
    console.log(`   Collection: ${collectionName}`);
    console.log(`   Field Name: courseId`);
    console.log(`   Format: C-{Creator Initials}-{Number}`);
    console.log(`   Example: C-JOH-0001, C-SAR-0002`);

  } catch (error) {
    console.error('\n❌ Error checking course structure:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB Atlas');
  }
};

// Run check
checkCourseStructure();

