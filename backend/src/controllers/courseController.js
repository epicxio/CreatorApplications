const Course = require('../models/Course');
const User = require('../models/User');
const mongoose = require('mongoose');
const { validateQuizQuestions } = require('../middleware/quizValidation');

// Get all courses with filtering and pagination
const getCourses = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      level,
      language,
      tags,
      searchQuery,
      certificateEnabled,
      status,
      visibility,
      instructorId // Filter by instructor
    } = req.query;

    const query = {};

    // Build filter query
    if (category) query.category = category;
    if (level) query.level = level;
    if (language) query.language = language;
    if (status) query.status = status;
    if (visibility) query.visibility = visibility;
    if (instructorId) query.instructor = instructorId;
    if (certificateEnabled !== undefined) {
      query.certificateEnabled = certificateEnabled === 'true';
    }

    // Tag filtering
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      query.tags = { $in: tagArray };
    }

    // Search query
    if (searchQuery) {
      query.$or = [
        { name: { $regex: searchQuery, $options: 'i' } },
        { description: { $regex: searchQuery, $options: 'i' } },
        { tags: { $regex: searchQuery, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const courses = await Course.find(query)
      .populate('instructor', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Course.countDocuments(query);

    // Format courses for frontend (matching the expected structure)
    const formattedCourses = courses.map(course => ({
      id: course._id.toString(),
      courseId: course.courseId || course._id.toString(), // Use courseId if available, fallback to _id
      name: course.name,
      createdAt: course.createdAt.toISOString(),
      type: course.type,
      access: course.access,
      enrollments: course.enrollments,
      completionRate: course.completionRate,
      status: course.status,
      lastUpdated: course.lastUpdated.toISOString(),
      visibility: course.visibility,
      certificateEnabled: course.certificateEnabled,
      dripEnabled: course.dripEnabled,
      installmentsOn: course.installmentsOn,
      affiliateActive: course.affiliateActive,
      listedPrice: course.listedPrice,
      sellingPrice: course.sellingPrice
    }));

    res.json({
      success: true,
      courses: formattedCourses,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      hasMore: skip + courses.length < total
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch courses',
      error: error.message 
    });
  }
};

// Get course by ID
const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id)
      .populate('instructor', 'name email avatar bio');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch course',
      error: error.message
    });
  }
};

// Create new course (draft)
const createCourse = async (req, res) => {
  try {
    const courseData = req.body;
    
    // Set instructor from authenticated user
    if (!courseData.instructor) {
      courseData.instructor = req.user._id;
    }

    // Ensure status is Draft for new courses
    courseData.status = 'Draft';

    // Calculate duration if modules are provided
    if (courseData.modules && courseData.modules.length > 0) {
      let totalDuration = 0;
      courseData.modules.forEach(module => {
        if (module.lessons && module.lessons.length > 0) {
          module.lessons.forEach(lesson => {
            totalDuration += lesson.duration || 0;
          });
        }
      });
      courseData.duration = totalDuration;
    }

    // Validate quiz questions if any quiz lessons exist
    if (courseData.modules && Array.isArray(courseData.modules)) {
      for (const module of courseData.modules) {
        if (module.lessons && Array.isArray(module.lessons)) {
          for (const lesson of module.lessons) {
            if (lesson.type === 'Quiz' && lesson.content && lesson.content.questions) {
              const validation = validateQuizQuestions(lesson.content.questions);
              if (!validation.valid) {
                return res.status(400).json({
                  success: false,
                  message: `Quiz validation failed: ${validation.error}`,
                  error: validation.error
                });
              }
            }
          }
        }
      }
    }

    // Generate courseId if not provided
    if (!courseData.courseId) {
      // Get instructor details to generate courseId
      const instructor = await User.findById(courseData.instructor);
      if (instructor && instructor.name) {
        courseData.courseId = await Course.generateCourseId(instructor.name);
      }
    }

    const course = new Course(courseData);
    await course.save();

    // ✅ DATABASE SAVE CONFIRMATION
    console.log(`\n💾 COURSE SAVED TO MONGODB ATLAS:`);
    console.log(`   📍 Database: ${mongoose.connection.db.databaseName}`);
    console.log(`   📦 Collection: courses`);
    console.log(`   🆔 Course ID: ${course.courseId || course._id}`);
    console.log(`   📝 Course Name: ${course.name}`);
    console.log(`   👤 Instructor: ${course.instructor}`);
    console.log(`   📊 Status: ${course.status}`);
    console.log(`   ⏰ Created At: ${course.createdAt}\n`);

    const populatedCourse = await Course.findById(course._id)
      .populate('instructor', 'name email avatar');

    res.status(201).json({
      success: true,
      data: populatedCourse,
      message: 'Course draft created successfully'
    });
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to create course',
      error: error.message
    });
  }
};

// Update course (supports partial updates for draft saving)
const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if course exists and user has permission
    const existingCourse = await Course.findById(id);
    if (!existingCourse) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Verify instructor ownership (unless admin)
    if (existingCourse.instructor.toString() !== req.user._id.toString() && req.user.role !== 'Super Admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this course'
      });
    }

    // Recalculate duration if modules are updated
    if (updateData.modules) {
      let totalDuration = 0;
      updateData.modules.forEach(module => {
        if (module.lessons && module.lessons.length > 0) {
          module.lessons.forEach(lesson => {
            totalDuration += lesson.duration || 0;
          });
        }
      });
      updateData.duration = totalDuration;
    }

    // Validate quiz questions if any quiz lessons exist
    if (updateData.modules && Array.isArray(updateData.modules)) {
      for (const module of updateData.modules) {
        if (module.lessons && Array.isArray(module.lessons)) {
          for (const lesson of module.lessons) {
            if (lesson.type === 'Quiz' && lesson.content && lesson.content.questions) {
              const validation = validateQuizQuestions(lesson.content.questions);
              if (!validation.valid) {
                return res.status(400).json({
                  success: false,
                  message: `Quiz validation failed: ${validation.error}`,
                  error: validation.error
                });
              }
            }
          }
        }
      }
    }

    // Update lastUpdated timestamp
    updateData.lastUpdated = new Date();

    const course = await Course.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('instructor', 'name email avatar');

    res.json({
      success: true,
      data: course,
      message: 'Course updated successfully'
    });
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to update course',
      error: error.message
    });
  }
};

// Save course as draft (can be called from any step)
const saveDraft = async (req, res) => {
  try {
    const { id } = req.params; // Optional: if provided, update existing; if not, create new
    const courseData = req.body;

    // Set instructor from authenticated user
    if (!courseData.instructor) {
      courseData.instructor = req.user._id;
    }

    // Ensure status is Draft
    courseData.status = 'Draft';

    // Provide default values for required fields when saving drafts
    // Use "NA" for mandatory fields that are not filled (abrupt exit scenario)
    if (!courseData.description || courseData.description.trim() === '') {
      courseData.description = courseData.name ? `Course: ${courseData.name}` : 'Course description will be added later';
    }
    if (!courseData.category || courseData.category.trim() === '') {
      courseData.category = 'NA'; // Use "NA" for abrupt exit
    }
    if (!courseData.level || courseData.level.trim() === '') {
      courseData.level = 'NA'; // Use "NA" for abrupt exit
    }
    if (!courseData.language || courseData.language.trim() === '') {
      courseData.language = 'NA'; // Use "NA" for abrupt exit
    }

    // Validate quiz questions if any quiz lessons exist
    if (courseData.modules && Array.isArray(courseData.modules)) {
      for (const module of courseData.modules) {
        if (module.lessons && Array.isArray(module.lessons)) {
          for (const lesson of module.lessons) {
            if (lesson.type === 'Quiz' && lesson.content && lesson.content.questions) {
              const validation = validateQuizQuestions(lesson.content.questions);
              if (!validation.valid) {
                return res.status(400).json({
                  success: false,
                  message: `Quiz validation failed: ${validation.error}`,
                  error: validation.error
                });
              }
            }
          }
        }
      }
    }

    let course;
    if (id) {
      // Update existing course
      const existingCourse = await Course.findById(id);
      if (!existingCourse) {
        return res.status(404).json({
          success: false,
          message: 'Course not found'
        });
      }

      // Verify ownership
      if (existingCourse.instructor.toString() !== req.user._id.toString() && req.user.role !== 'Super Admin') {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to update this course'
        });
      }

      // Generate courseId if not exists
      if (!courseData.courseId && !existingCourse.courseId) {
        const instructor = await User.findById(existingCourse.instructor);
        if (instructor && instructor.name) {
          courseData.courseId = await Course.generateCourseId(instructor.name);
        }
      }

      // Calculate duration if modules are provided
      if (courseData.modules) {
        let totalDuration = 0;
        courseData.modules.forEach(module => {
          if (module.lessons && module.lessons.length > 0) {
            module.lessons.forEach(lesson => {
              totalDuration += lesson.duration || 0;
            });
          }
        });
        courseData.duration = totalDuration;
      }

      course = await Course.findByIdAndUpdate(
        id,
        { $set: courseData },
        { new: true, runValidators: true }
      ).populate('instructor', 'name email avatar');

      // ✅ DATABASE UPDATE CONFIRMATION
      console.log(`\n💾 COURSE UPDATED IN MONGODB ATLAS:`);
      console.log(`   📍 Database: ${mongoose.connection.db.databaseName}`);
      console.log(`   📦 Collection: courses`);
      console.log(`   🆔 Course ID: ${course.courseId || course._id}`);
      console.log(`   📝 Course Name: ${course.name}`);
      console.log(`   📚 Modules Count: ${course.modules?.length || 0}`);
      if (course.modules && course.modules.length > 0) {
        const totalLessons = course.modules.reduce((sum, mod) => sum + (mod.lessons?.length || 0), 0);
        console.log(`   📖 Total Lessons: ${totalLessons}`);
        course.modules.forEach((mod, idx) => {
          console.log(`   📑 Module ${idx + 1}: "${mod.title}" (${mod.lessons?.length || 0} lessons)`);
        });
      }
      console.log(`   ⏰ Last Updated: ${course.lastUpdated}\n`);
    } else {
      // Create new course
      // Generate courseId if not provided
      if (!courseData.courseId) {
        const instructor = await User.findById(courseData.instructor);
        if (instructor && instructor.name) {
          courseData.courseId = await Course.generateCourseId(instructor.name);
        }
      }

      if (courseData.modules && courseData.modules.length > 0) {
        let totalDuration = 0;
        courseData.modules.forEach(module => {
          if (module.lessons && module.lessons.length > 0) {
            module.lessons.forEach(lesson => {
              totalDuration += lesson.duration || 0;
            });
          }
        });
        courseData.duration = totalDuration;
      }

      course = new Course(courseData);
      await course.save();
      await course.populate('instructor', 'name email avatar');

      // ✅ DATABASE SAVE CONFIRMATION
      console.log(`\n💾 COURSE SAVED TO MONGODB ATLAS:`);
      console.log(`   📍 Database: ${mongoose.connection.db.databaseName}`);
      console.log(`   📦 Collection: courses`);
      console.log(`   🆔 Course ID: ${course.courseId || course._id}`);
      console.log(`   📝 Course Name: ${course.name}`);
      console.log(`   👤 Instructor: ${course.instructor?.name || 'N/A'}`);
      console.log(`   📊 Status: ${course.status}`);
      console.log(`   📚 Modules Count: ${course.modules?.length || 0}`);
      if (course.modules && course.modules.length > 0) {
        const totalLessons = course.modules.reduce((sum, mod) => sum + (mod.lessons?.length || 0), 0);
        console.log(`   📖 Total Lessons: ${totalLessons}`);
        course.modules.forEach((mod, idx) => {
          console.log(`   📑 Module ${idx + 1}: "${mod.title}" (${mod.lessons?.length || 0} lessons)`);
        });
      }
      console.log(`   ⏰ Created At: ${course.createdAt}\n`);
    }

    res.json({
      success: true,
      data: course,
      message: 'Draft saved successfully'
    });
  } catch (error) {
    console.error('Error saving draft:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to save draft',
      error: error.message
    });
  }
};

// Publish course
const publishCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { status = 'Live & Selling' } = req.body;

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Verify ownership
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'Super Admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to publish this course'
      });
    }

    // Validate required fields before publishing
    if (!course.name || !course.description || !course.category || !course.level) {
      return res.status(400).json({
        success: false,
        message: 'Course must have name, description, category, and level before publishing'
      });
    }

    course.status = status;
    await course.save();

    res.json({
      success: true,
      data: course,
      message: 'Course published successfully'
    });
  } catch (error) {
    console.error('Error publishing course:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to publish course',
      error: error.message
    });
  }
};

// Delete course
const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Verify ownership
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'Super Admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this course'
      });
    }

    await Course.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete course',
      error: error.message
    });
  }
};

// Get courses by instructor (for course management page)
const getCoursesByInstructor = async (req, res) => {
  try {
    const instructorId = req.user._id;
    const { status, page = 1, limit = 10 } = req.query;

    const query = { instructor: instructorId };
    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const courses = await Course.find(query)
      .populate('instructor', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Course.countDocuments(query);

    // Format courses for frontend
    const formattedCourses = courses.map(course => ({
      id: course._id.toString(),
      courseId: course.courseId || course._id.toString(), // Use courseId if available, fallback to _id
      name: course.name,
      createdAt: course.createdAt.toISOString(),
      type: course.type,
      access: course.access,
      enrollments: course.enrollments,
      completionRate: course.completionRate,
      status: course.status,
      lastUpdated: course.lastUpdated.toISOString(),
      visibility: course.visibility,
      certificateEnabled: course.certificateEnabled,
      dripEnabled: course.dripEnabled,
      installmentsOn: course.installmentsOn,
      affiliateActive: course.affiliateActive,
      listedPrice: course.listedPrice,
      sellingPrice: course.sellingPrice
    }));

    res.json({
      success: true,
      courses: formattedCourses,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      hasMore: skip + courses.length < total
    });
  } catch (error) {
    console.error('Error fetching instructor courses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch courses',
      error: error.message
    });
  }
};

module.exports = {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  saveDraft,
  publishCourse,
  deleteCourse,
  getCoursesByInstructor
};

