/**
 * ============================================================================
 * BACKFILL COURSE IDs FOR EXISTING COURSES
 * ============================================================================
 * 
 * This script generates courseId for all existing courses that don't have one.
 * 
 * Format: C-{first 3 letters of creator name}-{number}
 * 
 * Usage: node backend/scripts/backfillCourseIds.js
 * 
 * ============================================================================
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Course = require('../src/models/Course');
const User = require('../src/models/User');

const backfillCourseIds = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI not found in .env file');
    }

    console.log('🔌 Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB Atlas\n');

    // Find all courses without courseId
    const coursesWithoutId = await Course.find({
      $or: [
        { courseId: { $exists: false } },
        { courseId: null }
      ]
    }).populate('instructor', 'name');

    console.log(`📊 Found ${coursesWithoutId.length} courses without courseId\n`);

    if (coursesWithoutId.length === 0) {
      console.log('✅ All courses already have courseId!');
      await mongoose.disconnect();
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    for (const course of coursesWithoutId) {
      try {
        // Get instructor name
        let instructorName = null;
        
        if (course.instructor) {
          if (typeof course.instructor === 'object' && course.instructor.name) {
            instructorName = course.instructor.name;
          } else {
            // Fetch instructor if not populated
            const instructor = await User.findById(course.instructor);
            instructorName = instructor?.name;
          }
        }

        if (!instructorName) {
          console.log(`⚠️  Skipping course "${course.name}" (ID: ${course._id}) - No instructor name found`);
          errorCount++;
          continue;
        }

        // Generate courseId
        const courseId = await Course.generateCourseId(instructorName);

        // Update course
        course.courseId = courseId;
        await course.save();

        console.log(`✅ Updated: ${course.name}`);
        console.log(`   Course ID: ${courseId}`);
        console.log(`   Instructor: ${instructorName}\n`);

        successCount++;
      } catch (error) {
        console.error(`❌ Error updating course "${course.name}":`, error.message);
        errorCount++;
      }
    }

    console.log('\n📊 BACKFILL SUMMARY:');
    console.log(`   ✅ Successfully updated: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   📝 Total processed: ${coursesWithoutId.length}\n`);

    // Verify all courses now have courseId
    const remaining = await Course.countDocuments({
      $or: [
        { courseId: { $exists: false } },
        { courseId: null }
      ]
    });

    if (remaining === 0) {
      console.log('✅ All courses now have courseId!');
    } else {
      console.log(`⚠️  ${remaining} courses still missing courseId`);
    }

  } catch (error) {
    console.error('\n❌ Error during backfill:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB Atlas');
  }
};

// Run backfill
backfillCourseIds();

