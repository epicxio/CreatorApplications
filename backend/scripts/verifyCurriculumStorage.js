/**
 * ============================================================================
 * VERIFY CURRICULUM STORAGE IN MONGODB ATLAS
 * ============================================================================
 * 
 * This script verifies that Curriculum (modules and lessons) are properly
 * stored in MongoDB Atlas and linked to the courseId.
 * 
 * Usage: node backend/scripts/verifyCurriculumStorage.js
 * 
 * ============================================================================
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Course = require('../src/models/Course');

const verifyCurriculumStorage = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI not found in .env file');
    }

    console.log('🔌 Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB Atlas\n');

    const dbName = mongoose.connection.db.databaseName;
    const collectionName = Course.collection.name;
    
    console.log('📊 DATABASE INFORMATION:');
    console.log(`   Database Name: ${dbName}`);
    console.log(`   Collection Name: ${collectionName}\n`);

    // Get all courses with modules
    const coursesWithModules = await Course.find({ 
      modules: { $exists: true, $ne: [] },
      $expr: { $gt: [{ $size: "$modules" }, 0] }
    }).populate('instructor', 'name');

    console.log(`📚 COURSES WITH CURRICULUM: ${coursesWithModules.length}\n`);

    if (coursesWithModules.length === 0) {
      console.log('⚠️  No courses with modules found.\n');
      
      // Check total courses
      const totalCourses = await Course.countDocuments();
      console.log(`📊 Total courses in database: ${totalCourses}`);
      
      if (totalCourses > 0) {
        const sampleCourse = await Course.findOne({});
        console.log(`\n📝 Sample Course Structure:`);
        console.log(`   Course ID: ${sampleCourse.courseId || sampleCourse._id}`);
        console.log(`   Course Name: ${sampleCourse.name}`);
        console.log(`   Has modules field: ${sampleCourse.modules !== undefined}`);
        console.log(`   Modules count: ${sampleCourse.modules?.length || 0}`);
      }
    } else {
      coursesWithModules.forEach((course, index) => {
        console.log(`\n📖 COURSE ${index + 1}:`);
        console.log(`   🆔 Course ID: ${course.courseId || course._id}`);
        console.log(`   📝 Course Name: ${course.name}`);
        console.log(`   👤 Instructor: ${course.instructor?.name || 'N/A'}`);
        console.log(`   📚 Modules Count: ${course.modules.length}`);
        
        const totalLessons = course.modules.reduce((sum, mod) => sum + (mod.lessons?.length || 0), 0);
        console.log(`   📖 Total Lessons: ${totalLessons}`);
        console.log(`   ⏱️  Total Duration: ${course.duration || 0} minutes`);
        
        // Show module details
        course.modules.forEach((module, modIdx) => {
          console.log(`\n   📑 MODULE ${modIdx + 1}:`);
          console.log(`      Title: ${module.title}`);
          console.log(`      Description: ${module.description || 'N/A'}`);
          console.log(`      Order: ${module.order}`);
          console.log(`      Module ID: ${module._id}`);
          console.log(`      Lessons Count: ${module.lessons?.length || 0}`);
          
          if (module.lessons && module.lessons.length > 0) {
            module.lessons.forEach((lesson, lessonIdx) => {
              console.log(`\n      📝 LESSON ${lessonIdx + 1}:`);
              console.log(`         Title: ${lesson.title}`);
              console.log(`         Type: ${lesson.type}`);
              console.log(`         Description: ${lesson.description || 'N/A'}`);
              console.log(`         Duration: ${lesson.duration || 0} minutes`);
              console.log(`         Order: ${lesson.order}`);
              console.log(`         Lesson ID: ${lesson._id}`);
              console.log(`         Is Unlocked: ${lesson.isUnlocked !== undefined ? lesson.isUnlocked : true}`);
              if (lesson.content) {
                const contentKeys = Object.keys(lesson.content).filter(key => lesson.content[key] !== undefined && lesson.content[key] !== null && lesson.content[key] !== '');
                console.log(`         Content Fields: ${contentKeys.length > 0 ? contentKeys.join(', ') : 'None'}`);
              }
              if (lesson.resources && lesson.resources.length > 0) {
                console.log(`         Resources: ${lesson.resources.length}`);
              }
            });
          }
        });
        
        console.log(`\n   🔗 REFERENCE LINK:`);
        console.log(`      Course Document ID: ${course._id}`);
        console.log(`      Course ID (Human-readable): ${course.courseId || 'N/A'}`);
        console.log(`      All modules and lessons are embedded in this course document`);
        console.log(`      Query by courseId: Course.findOne({ courseId: "${course.courseId || course._id}" })`);
      });
    }

    // Statistics
    console.log(`\n\n📊 CURRICULUM STATISTICS:`);
    const allCourses = await Course.find({});
    const coursesWithCurriculum = allCourses.filter(c => c.modules && c.modules.length > 0);
    const totalModules = allCourses.reduce((sum, c) => sum + (c.modules?.length || 0), 0);
    const totalLessons = allCourses.reduce((sum, c) => {
      if (c.modules) {
        return sum + c.modules.reduce((modSum, mod) => modSum + (mod.lessons?.length || 0), 0);
      }
      return sum;
    }, 0);
    
    console.log(`   Total Courses: ${allCourses.length}`);
    console.log(`   Courses with Curriculum: ${coursesWithCurriculum.length}`);
    console.log(`   Total Modules: ${totalModules}`);
    console.log(`   Total Lessons: ${totalLessons}`);
    
    if (totalModules > 0) {
      const avgLessonsPerModule = (totalLessons / totalModules).toFixed(2);
      console.log(`   Average Lessons per Module: ${avgLessonsPerModule}`);
    }

    console.log(`\n✅ Curriculum verification complete!`);
    console.log(`\n💡 SUMMARY:`);
    console.log(`   Collection: ${collectionName}`);
    console.log(`   Curriculum Structure: Modules and Lessons are embedded in Course documents`);
    console.log(`   Reference: Each course has a courseId that links all curriculum data`);
    console.log(`   Query Example: Course.findOne({ courseId: "C-XXX-0001" })`);

  } catch (error) {
    console.error('\n❌ Error verifying curriculum storage:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB Atlas');
  }
};

// Run verification
verifyCurriculumStorage();

