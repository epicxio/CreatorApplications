const Course = require('../models/Course');
const User = require('../models/User');
const CourseEnrollment = require('../models/CourseEnrollment');
const CourseProgress = require('../models/CourseProgress');
const CourseOrder = require('../models/CourseOrder');
const AffiliateCode = require('../models/AffiliateCode');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const { validateQuizQuestions } = require('../middleware/quizValidation');
const { isS3Configured } = require('../config/s3Config');
const s3UploadHelper = require('../utils/s3UploadHelper');

// Helper function to find course by either ObjectId or formatted courseId
const findCourseById = async (id) => {
  // Check if it's a valid MongoDB ObjectId (24 hex characters)
  if (mongoose.Types.ObjectId.isValid(id) && id.length === 24) {
    return await Course.findById(id);
  }
  // Otherwise, try to find by formatted courseId
  return await Course.findOne({ courseId: id });
};

/** Build a snapshot of course state at publish time for version history and diff. */
const buildPublishSnapshot = (course) => {
  const modules = (course.modules && Array.isArray(course.modules)) ? course.modules : [];
  const dripMethods = (course.dripMethods && Array.isArray(course.dripMethods)) ? course.dripMethods : [];
  const faqs = (course.faqs && Array.isArray(course.faqs)) ? course.faqs : [];
  const listedPrice = course.listedPrice && typeof course.listedPrice === 'object' ? course.listedPrice : {};
  const sellingPrice = course.sellingPrice && typeof course.sellingPrice === 'object' ? course.sellingPrice : {};
  return {
    details: {
      name: course.name || '',
      subtitle: course.subtitle || '',
      description: (course.description || '').slice(0, 200),
      category: course.category || '',
      level: course.level || '',
      language: course.language || ''
    },
    curriculum: {
      moduleCount: modules.length,
      modules: modules.map((m, i) => ({
        title: m.title || `Module ${i + 1}`,
        lessonCount: (m.lessons && Array.isArray(m.lessons)) ? m.lessons.length : 0
      }))
    },
    drip: {
      dripEnabled: !!course.dripEnabled,
      dripMethodCount: dripMethods.length,
      dripDisplayOption: course.dripDisplayOption || 'titleAndLessons'
    },
    certificate: {
      certificateEnabled: !!course.certificateEnabled,
      certificateTitle: course.certificateTitle || ''
    },
    payment: {
      listedPriceINR: listedPrice.INR ?? 0,
      listedPriceUSD: listedPrice.USD ?? 0,
      sellingPriceINR: sellingPrice.INR ?? 0,
      sellingPriceUSD: sellingPrice.USD ?? 0,
      installmentsOn: !!course.installmentsOn
    },
    additional: {
      affiliateActive: !!course.affiliateActive,
      affiliateRewardPercentage: course.affiliateRewardPercentage ?? 0,
      watermarkRemovalEnabled: !!course.watermarkRemovalEnabled,
      faqsCount: faqs.length
    }
  };
};

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
      .populate('instructor', 'name email avatar userId creatorId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Course.countDocuments(query);

    // Format courses for frontend (matching the expected structure)
    const formattedCourses = courses.map(course => ({
      id: course._id.toString(),
      courseId: course.courseId || course._id.toString(), // Use courseId if available, fallback to _id
      name: course.name,
      creatorId: course.instructor?.creatorId || null,
      creatorName: course.instructor?.name ?? null,
      instructorUserId: course.instructor?.userId || (course.instructor?._id ? course.instructor._id.toString() : null),
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

    const course = await findCourseById(id);
    if (course) {
      await course.populate('instructor', 'name email avatar bio');
    }

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
    const existingCourse = await findCourseById(id);
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

    // Use the MongoDB _id for findByIdAndUpdate
    const course = await Course.findByIdAndUpdate(
      existingCourse._id,
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
      const existingCourse = await findCourseById(id);
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

      // Update lastUpdated timestamp
      const now = new Date();
      courseData.lastUpdated = now;

      // Log what we're about to save
      console.log(`\n📝 UPDATING COURSE:`);
      console.log(`   Course ID: ${existingCourse._id}`);
      console.log(`   Old lastUpdated: ${existingCourse.lastUpdated}`);
      console.log(`   New lastUpdated: ${now}`);
      console.log(`   Modules being saved: ${courseData.modules?.length || 0}`);
      if (courseData.modules && courseData.modules.length > 0) {
        courseData.modules.forEach((mod, idx) => {
          console.log(`   Module ${idx + 1}: "${mod.title}" (${mod.lessons?.length || 0} lessons)`);
        });
      }

      // Use the MongoDB _id for findByIdAndUpdate
      // Explicitly set modules and lastUpdated to ensure they're saved
      const updateData = {
        ...courseData,
        lastUpdated: now
      };
      // Once published, never revert status to Draft when saving (e.g. "Save as Draft" after publish)
      if (existingCourse.status && existingCourse.status !== 'Draft') {
        updateData.status = existingCourse.status;
      }
      // Ensure Step 5 Additional Details are persisted when sent (affiliate can get lost in spread)
      if (courseData.affiliateActive !== undefined && courseData.affiliateActive !== null) {
        updateData.affiliateActive = courseData.affiliateActive === true || courseData.affiliateActive === 'true';
      }
      if (courseData.affiliateRewardPercentage !== undefined && courseData.affiliateRewardPercentage !== null) {
        const pct = Number(courseData.affiliateRewardPercentage);
        if (!Number.isNaN(pct)) updateData.affiliateRewardPercentage = Math.max(0, Math.min(100, pct));
      }
      if (courseData.watermarkRemovalEnabled !== undefined && courseData.watermarkRemovalEnabled !== null) {
        updateData.watermarkRemovalEnabled = courseData.watermarkRemovalEnabled === true || courseData.watermarkRemovalEnabled === 'true';
      }
      if (Array.isArray(courseData.faqs)) {
        updateData.faqs = courseData.faqs;
      }

      course = await Course.findByIdAndUpdate(
        existingCourse._id,
        { $set: updateData },
        { new: true, runValidators: true }
      ).populate('instructor', 'name email avatar');
      
      // Verify the update worked
      if (!course) {
        throw new Error('Failed to update course');
      }
      
      // Verify lastUpdated was actually saved
      console.log(`   ✅ Saved lastUpdated: ${course.lastUpdated}`);
      if (course.lastUpdated.getTime() !== now.getTime()) {
        console.warn(`   ⚠️  WARNING: lastUpdated mismatch! Expected: ${now}, Got: ${course.lastUpdated}`);
      }

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

    const course = await findCourseById(id);
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

    const now = new Date();
    const currentHistory = course.publishHistory && Array.isArray(course.publishHistory) ? course.publishHistory : [];
    const nextVersion = currentHistory.length + 1;
    const snapshot = buildPublishSnapshot(course);
    const updatePayload = {
      status,
      $push: {
        publishHistory: { version: nextVersion, publishedAt: now, snapshot }
      }
    };
    const updated = await Course.findByIdAndUpdate(
      course._id,
      updatePayload,
      { new: true, runValidators: true }
    ).populate('instructor', 'name email avatar');

    if (!updated) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update course status'
      });
    }

    res.json({
      success: true,
      data: updated,
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

    const course = await findCourseById(id);
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

    await Course.findByIdAndDelete(course._id);

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
      .populate('instructor', 'name email avatar userId creatorId')
      .sort({ lastUpdated: -1, createdAt: -1 }) // Sort by lastUpdated first, then createdAt
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Course.countDocuments(query);

    // Format courses for frontend
    const formattedCourses = courses.map(course => ({
      id: course._id.toString(),
      courseId: course.courseId || course._id.toString(), // Use courseId if available, fallback to _id
      name: course.name,
      creatorId: course.instructor?.creatorId || null,
      creatorName: course.instructor?.name ?? null,
      instructorUserId: course.instructor?.userId || (course.instructor?._id ? course.instructor._id.toString() : null),
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

// Enroll current user in a course (idempotent)
const enroll = async (req, res) => {
  try {
    const { id: courseIdParam } = req.params;
    const course = await findCourseById(courseIdParam);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    const courseId = course._id;
    const userId = req.user._id;

    let enrollment = await CourseEnrollment.findOne({ courseId, userId });
    if (enrollment) {
      return res.json({
        success: true,
        data: {
          courseId: courseId.toString(),
          userId: userId.toString(),
          enrolledAt: enrollment.enrolledAt.toISOString()
        },
        message: 'Already enrolled in this course'
      });
    }

    enrollment = new CourseEnrollment({
      courseId,
      userId,
      status: 'active'
    });
    await enrollment.save();

    await Course.findByIdAndUpdate(courseId, { $inc: { enrollments: 1 } });

    let progress = await CourseProgress.findOne({ courseId, userId });
    if (!progress) {
      progress = new CourseProgress({
        courseId,
        userId,
        overallProgress: 0,
        completedLessonIds: [],
        lastAccessedAt: new Date()
      });
      await progress.save();
    }

    res.status(201).json({
      success: true,
      data: {
        courseId: courseId.toString(),
        userId: userId.toString(),
        enrolledAt: enrollment.enrolledAt.toISOString()
      },
      message: 'Enrolled successfully'
    });
  } catch (error) {
    console.error('Error enrolling in course:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to enroll in course',
      error: error.message
    });
  }
};

// Get all progress records for current user (enrolled courses list + progress)
const getMyProgress = async (req, res) => {
  try {
    const userId = req.user._id;
    const progressList = await CourseProgress.find({ userId })
      .sort({ lastAccessedAt: -1 })
      .lean();

    const enrollmentList = await CourseEnrollment.find({ userId }).lean();
    const enrollmentByCourse = Object.fromEntries(
      enrollmentList.map((e) => [e.courseId.toString(), e])
    );

    const data = progressList.map((p) => {
      const enrollment = enrollmentByCourse[p.courseId.toString()];
      const certificateEarned = !!(enrollment && enrollment.certificateUrl);
      const certificateUrl = enrollment && enrollment.certificateUrl ? enrollment.certificateUrl : undefined;
      const certificateIssuedAt = enrollment && enrollment.certificateIssuedAt ? enrollment.certificateIssuedAt.toISOString() : undefined;
      return {
        courseId: p.courseId.toString(),
        userId: p.userId.toString(),
        overallProgress: p.overallProgress || 0,
        completedLessons: p.completedLessonIds || [],
        timeSpent: p.timeSpent || 0,
        lastAccessed: p.lastAccessedAt ? p.lastAccessedAt.toISOString() : new Date().toISOString(),
        enrolledAt: p.createdAt ? p.createdAt.toISOString() : new Date().toISOString(),
        completedAt: p.completedAt ? p.completedAt.toISOString() : undefined,
        certificateEarned,
        certificateUrl,
        certificateIssuedAt
      };
    });

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error fetching my progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch progress',
      error: error.message
    });
  }
};

// Get current user's progress for a course
const getProgress = async (req, res) => {
  try {
    const { id: courseIdParam } = req.params;
    const course = await findCourseById(courseIdParam);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    const courseId = course._id;
    const userId = req.user._id;

    const progress = await CourseProgress.findOne({ courseId, userId });
    if (!progress) {
      return res.json({
        success: false,
        message: 'Progress not found',
        data: null
      });
    }

    const enrollment = await CourseEnrollment.findOne({ courseId, userId });
    const certificateEarned = !!(enrollment && enrollment.certificateUrl);
    const certificateUrl = enrollment && enrollment.certificateUrl ? enrollment.certificateUrl : undefined;
    const certificateIssuedAt = enrollment && enrollment.certificateIssuedAt ? enrollment.certificateIssuedAt.toISOString() : undefined;
    const certificateEarnedAt = enrollment && enrollment.certificateEarnedAt ? enrollment.certificateEarnedAt.toISOString() : undefined;

    res.json({
      success: true,
      data: {
        courseId: progress.courseId.toString(),
        userId: progress.userId.toString(),
        overallProgress: progress.overallProgress,
        completedLessons: progress.completedLessonIds || [],
        timeSpent: progress.timeSpent || 0,
        lastAccessed: progress.lastAccessedAt.toISOString(),
        enrolledAt: progress.createdAt.toISOString(),
        completedAt: progress.completedAt ? progress.completedAt.toISOString() : undefined,
        certificateEarned,
        certificateUrl,
        certificateIssuedAt,
        certificateEarnedAt
      }
    });
  } catch (error) {
    console.error('Error fetching progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch progress',
      error: error.message
    });
  }
};

// Mark a lesson as completed and update progress
const completeLesson = async (req, res) => {
  try {
    const { id: courseIdParam } = req.params;
    const { lessonId } = req.body;
    if (!lessonId) {
      return res.status(400).json({
        success: false,
        message: 'lessonId is required'
      });
    }

    const course = await findCourseById(courseIdParam);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    const courseId = course._id;
    const userId = req.user._id;

    const progress = await CourseProgress.findOne({ courseId, userId });
    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Progress not found. Enroll in the course first.'
      });
    }

    const completedIds = progress.completedLessonIds || [];
    const lessonIdStr = String(lessonId);
    if (completedIds.includes(lessonIdStr)) {
      return res.json({
        success: true,
        data: {
          overallProgress: progress.overallProgress,
          completedLessons: completedIds
        },
        message: 'Lesson already completed'
      });
    }

    completedIds.push(lessonIdStr);
    const totalLessons = (course.modules || []).reduce(
      (sum, mod) => sum + (mod.lessons && mod.lessons.length ? mod.lessons.length : 0),
      0
    );
    const overallProgress = totalLessons > 0
      ? Math.round((completedIds.length / totalLessons) * 100)
      : 0;

    progress.completedLessonIds = completedIds;
    progress.overallProgress = overallProgress;
    progress.lastAccessedAt = new Date();
    const threshold = course.certificateEnabled ? (course.certificateCompletionPercentage ?? 100) : 101;
    if (overallProgress >= 100) {
      progress.completedAt = new Date();
      await CourseEnrollment.updateOne(
        { courseId, userId },
        { status: 'completed', completedAt: new Date() }
      );
    }
    if (overallProgress >= threshold) {
      await CourseEnrollment.updateOne(
        { courseId, userId, certificateEarnedAt: { $exists: false } },
        { $set: { certificateEarnedAt: new Date() } }
      );
    }
    await progress.save();

    res.json({
      success: true,
      data: {
        overallProgress: progress.overallProgress,
        completedLessons: progress.completedLessonIds
      },
      message: 'Lesson completed'
    });
  } catch (error) {
    console.error('Error completing lesson:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete lesson',
      error: error.message
    });
  }
};

// Upload certificate PDF (learner has completed required %; frontend generates PDF and uploads)
const uploadCertificate = async (req, res) => {
  try {
    const { id: courseIdParam } = req.params;
    const course = await findCourseById(courseIdParam);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    if (!course.certificateEnabled) {
      return res.status(400).json({ success: false, message: 'Certificates are not enabled for this course' });
    }

    const courseId = course._id;
    const userId = req.user._id;
    const threshold = course.certificateCompletionPercentage ?? 100;

    const [enrollment, progress] = await Promise.all([
      CourseEnrollment.findOne({ courseId, userId }),
      CourseProgress.findOne({ courseId, userId })
    ]);

    if (!enrollment || !progress) {
      return res.status(403).json({
        success: false,
        message: 'Enrollment and progress required. Enroll and complete the course first.'
      });
    }
    if (progress.overallProgress < threshold) {
      return res.status(403).json({
        success: false,
        message: `Complete at least ${threshold}% of the course to earn a certificate.`
      });
    }

    if (enrollment.certificateUrl) {
      return res.json({
        success: true,
        data: { certificateUrl: enrollment.certificateUrl },
        message: 'Certificate already issued'
      });
    }

    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        success: false,
        message: 'Certificate PDF file is required (field: certificate)'
      });
    }

    let certificateUrl;
    const userIdStr = userId.toString();
    const courseIdStr = courseId.toString();

    if (isS3Configured()) {
      const result = await s3UploadHelper.uploadToS3(
        req.file,
        'student',
        userIdStr,
        'certificate',
        courseIdStr
      );
      certificateUrl = result.url || result.presignedUrl;
    } else {
      const dir = path.join(__dirname, '../uploads/students', userIdStr, 'certificates', courseIdStr);
      fs.mkdirSync(dir, { recursive: true });
      const filename = `certificate-${Date.now()}.pdf`;
      const filePath = path.join(dir, filename);
      fs.writeFileSync(filePath, req.file.buffer);
      // API_BASE_URL should be set in production so certificate links are reachable from the frontend
      const baseUrl = process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 5001}`;
      certificateUrl = `${baseUrl}/uploads/students/${userIdStr}/certificates/${courseIdStr}/${filename}`;
    }

    const issuedAt = new Date();
    await CourseEnrollment.updateOne(
      { courseId, userId },
      {
        certificateUrl,
        certificateIssuedAt: issuedAt,
        ...(enrollment && !enrollment.certificateEarnedAt ? { certificateEarnedAt: issuedAt } : {})
      }
    );

    res.json({
      success: true,
      data: { certificateUrl },
      message: 'Certificate issued successfully'
    });
  } catch (error) {
    console.error('Error uploading certificate:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload certificate',
      error: error.message
    });
  }
};

// Upload certificate template PDF for a course (creator only). Stored in S3 or local; used when issuing learner certificates.
const uploadCertificateTemplate = async (req, res) => {
  try {
    const { id: courseIdParam } = req.params;
    const course = await findCourseById(courseIdParam);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'Super Admin') {
      return res.status(403).json({ success: false, message: 'Only the course instructor can upload the certificate template' });
    }
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        success: false,
        message: 'Certificate template PDF file is required (field: template)'
      });
    }

    const courseId = course._id;
    const userId = req.user._id;
    const userIdStr = userId.toString();
    const courseIdStr = courseId.toString();
    let templatePdfUrl;

    if (isS3Configured()) {
      const result = await s3UploadHelper.uploadToS3(
        req.file,
        'creator',
        userIdStr,
        'certificateTemplate',
        courseIdStr
      );
      templatePdfUrl = result.url || result.presignedUrl;
    } else {
      const dir = path.join(__dirname, '../uploads/creators', userIdStr, 'courses', courseIdStr, 'certificate-template');
      fs.mkdirSync(dir, { recursive: true });
      const filename = 'certificate-template.pdf';
      const filePath = path.join(dir, filename);
      fs.writeFileSync(filePath, req.file.buffer);
      const baseUrl = process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 5001}`;
      templatePdfUrl = `${baseUrl}/uploads/creators/${userIdStr}/courses/${courseIdStr}/certificate-template/${filename}`;
    }

    course.certificateTemplatePdfUrl = templatePdfUrl;
    course.lastUpdated = new Date();
    await course.save();

    return res.json({
      success: true,
      data: { certificateTemplatePdfUrl: templatePdfUrl },
      message: 'Certificate template saved successfully'
    });
  } catch (err) {
    console.error('Error uploading certificate template:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to upload certificate template',
      error: err.message
    });
  }
};

// Checkout: create order (simulate paid) and enroll user (no gateway integration yet)
const checkout = async (req, res) => {
  try {
    const { id: courseIdParam } = req.params;
    const { currency = 'INR', paymentMethod, affiliateCode: affiliateCodeParam } = req.body;

    if (!paymentMethod || typeof paymentMethod !== 'string' || !paymentMethod.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Payment method is required'
      });
    }

    const course = await findCourseById(courseIdParam);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const userId = req.user._id;
    const courseId = course._id;

    // Resolve amount from course selling price for the given currency
    const currencyUpper = (currency || 'INR').toUpperCase();
    const sellingPriceObj = course.sellingPrice || {};
    let amount = sellingPriceObj[currencyUpper];
    if (amount == null || amount === undefined) {
      amount = sellingPriceObj.INR ?? sellingPriceObj.USD ?? sellingPriceObj.EUR ?? sellingPriceObj.GBP ?? 0;
    }
    const finalCurrency = amount != null && sellingPriceObj[currencyUpper] != null ? currencyUpper : (sellingPriceObj.INR != null ? 'INR' : 'USD');

    // If course is free, allow direct enroll path (frontend may call enroll instead); here we still allow checkout for consistency
    const numericAmount = Number(amount) || 0;

    // Check that the selected payment method is enabled for this course (creator config)
    const paymentMethods = course.paymentMethods || {};
    const universal = paymentMethods.universal || {};
    const perCurrency = paymentMethods[finalCurrency] || paymentMethods[currencyUpper] || {};
    const methodEnabled = universal[paymentMethod] === true || perCurrency[paymentMethod] === true;
    // If no payment methods configured yet, allow any (backward compatibility)
    const hasAnyConfig = Object.keys(universal).length > 0 || Object.keys(perCurrency).length > 0;
    if (hasAnyConfig && !methodEnabled) {
      return res.status(400).json({
        success: false,
        message: `Payment method "${paymentMethod}" is not enabled for this course`
      });
    }

    // Idempotent: if already enrolled, check for existing paid order; if exists return success
    let enrollment = await CourseEnrollment.findOne({ courseId, userId });
    if (enrollment) {
      const existingOrder = await CourseOrder.findOne({ courseId, userId, status: 'paid' });
      if (existingOrder) {
        return res.json({
          success: true,
          data: {
            orderId: existingOrder._id.toString(),
            courseId: courseId.toString(),
            userId: userId.toString(),
            enrolledAt: enrollment.enrolledAt.toISOString(),
            alreadyEnrolled: true
          },
          message: 'Already purchased and enrolled'
        });
      }
      // Enrolled but no order (e.g. free enroll): still create order and return
    }

    let affiliateCodeDoc = null;
    if (affiliateCodeParam && typeof affiliateCodeParam === 'string' && affiliateCodeParam.trim()) {
      const code = affiliateCodeParam.trim().toUpperCase();
      affiliateCodeDoc = await AffiliateCode.findOne({
        courseId,
        code,
        status: 'active'
      });
      if (affiliateCodeDoc && course.affiliateActive && course.affiliateRewardPercentage > 0 && numericAmount > 0) {
        // Valid affiliate; will set on order and update after save
      } else {
        affiliateCodeDoc = null;
      }
    }

    const order = new CourseOrder({
      courseId,
      userId,
      amount: numericAmount,
      currency: finalCurrency,
      paymentMethod: paymentMethod.trim(),
      status: 'paid',
      paidAt: new Date(),
      ...(affiliateCodeDoc && {
        affiliateCodeId: affiliateCodeDoc._id,
        affiliateRewardAmount: Math.round((numericAmount * (course.affiliateRewardPercentage || 0)) / 100),
        affiliateRewardCurrency: finalCurrency
      })
    });
    await order.save();

    if (affiliateCodeDoc && order.affiliateRewardAmount > 0) {
      const earnings = affiliateCodeDoc.earningsByCurrency || { INR: 0, USD: 0, EUR: 0, GBP: 0 };
      const cur = order.affiliateRewardCurrency || 'INR';
      earnings[cur] = (earnings[cur] || 0) + order.affiliateRewardAmount;
      await AffiliateCode.findByIdAndUpdate(affiliateCodeDoc._id, {
        $inc: { conversions: 1 },
        $set: { earningsByCurrency: earnings }
      });
    }

    if (!enrollment) {
      enrollment = new CourseEnrollment({
        courseId,
        userId,
        status: 'active'
      });
      await enrollment.save();
      await Course.findByIdAndUpdate(courseId, { $inc: { enrollments: 1 } });
    }

    let progress = await CourseProgress.findOne({ courseId, userId });
    if (!progress) {
      progress = new CourseProgress({
        courseId,
        userId,
        overallProgress: 0,
        completedLessonIds: [],
        lastAccessedAt: new Date()
      });
      await progress.save();
    }

    res.status(201).json({
      success: true,
      data: {
        orderId: order._id.toString(),
        courseId: courseId.toString(),
        userId: userId.toString(),
        enrolledAt: enrollment.enrolledAt.toISOString()
      },
      message: 'Payment recorded and enrolled successfully'
    });
  } catch (error) {
    console.error('Error in checkout:', error);
    res.status(500).json({
      success: false,
      message: 'Checkout failed',
      error: error.message
    });
  }
};

// Create affiliate code for current user for a course (learner/any user becomes affiliate)
const createAffiliateCode = async (req, res) => {
  try {
    const { id: courseIdParam } = req.params;
    const course = await findCourseById(courseIdParam);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    if (!course.affiliateActive) {
      return res.status(400).json({
        success: false,
        message: 'Affiliate program is not enabled for this course'
      });
    }
    const userId = req.user._id;
    const courseId = course._id;

    const existing = await AffiliateCode.findOne({ courseId, affiliateUserId: userId });
    if (existing) {
      const baseUrl = req.protocol + '://' + req.get('host');
      const courseSlug = course.courseId || courseId.toString();
      const link = `${baseUrl}/courses/${courseSlug}?ref=${existing.code}`;
      return res.json({
        success: true,
        data: {
          affiliateCodeId: existing._id.toString(),
          code: existing.code,
          link,
          displayName: existing.displayName,
          conversions: existing.conversions,
          earningsByCurrency: existing.earningsByCurrency
        },
        message: 'You already have an affiliate code for this course'
      });
    }

    const displayName = (req.body.displayName && String(req.body.displayName).trim()) || req.user.name || 'Affiliate';
    const codeBase = (req.user.name || userId.toString()).replace(/\s+/g, '').substring(0, 6).toUpperCase() || 'A';
    let code = codeBase;
    let attempts = 0;
    while (await AffiliateCode.findOne({ courseId, code })) {
      code = codeBase + (attempts > 0 ? attempts : '');
      attempts++;
      if (attempts > 999) {
        code = codeBase + Date.now().toString(36).toUpperCase().slice(-4);
        break;
      }
    }

    const affiliateCode = new AffiliateCode({
      affiliateUserId: userId,
      courseId,
      code,
      displayName: displayName.substring(0, 80),
      status: 'active'
    });
    await affiliateCode.save();

    const baseUrl = req.protocol + '://' + req.get('host');
    const courseSlug = course.courseId || courseId.toString();
    const link = `${baseUrl}/courses/${courseSlug}?ref=${code}`;

    res.status(201).json({
      success: true,
      data: {
        affiliateCodeId: affiliateCode._id.toString(),
        code: affiliateCode.code,
        link,
        displayName: affiliateCode.displayName,
        conversions: 0,
        earningsByCurrency: affiliateCode.earningsByCurrency
      },
      message: 'Affiliate code created successfully'
    });
  } catch (error) {
    console.error('Error creating affiliate code:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create affiliate code',
      error: error.message
    });
  }
};

// List affiliates for a course (creator only)
const getAffiliatesByCourse = async (req, res) => {
  try {
    const { id: courseIdParam } = req.params;
    const course = await findCourseById(courseIdParam);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'Super Admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view affiliates for this course' });
    }
    const courseId = course._id;
    const list = await AffiliateCode.find({ courseId })
      .populate('affiliateUserId', 'name email avatar')
      .sort({ conversions: -1, createdAt: -1 })
      .lean();
    const baseUrl = req.protocol + '://' + req.get('host');
    const courseSlug = course.courseId || courseId.toString();
    const data = list.map((row) => ({
      affiliateCodeId: row._id.toString(),
      code: row.code,
      link: `${baseUrl}/courses/${courseSlug}?ref=${row.code}`,
      displayName: row.displayName,
      status: row.status,
      clicks: row.clicks,
      conversions: row.conversions,
      earningsByCurrency: row.earningsByCurrency || {},
      affiliateUserId: row.affiliateUserId?._id?.toString(),
      affiliateName: row.affiliateUserId?.name,
      affiliateEmail: row.affiliateUserId?.email,
      createdAt: row.createdAt
    }));
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching affiliates:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch affiliates',
      error: error.message
    });
  }
};

// My affiliate codes (current user as promoter)
const getMyAffiliateCodes = async (req, res) => {
  try {
    const userId = req.user._id;
    const list = await AffiliateCode.find({ affiliateUserId: userId })
      .populate('courseId', 'name courseId coverImage sellingPrice affiliateRewardPercentage')
      .sort({ updatedAt: -1 })
      .lean();
    const baseUrl = req.protocol + '://' + req.get('host');
    const data = list.map((row) => {
      const course = row.courseId;
      const courseSlug = course?.courseId || (course?._id?.toString());
      const link = courseSlug ? `${baseUrl}/courses/${courseSlug}?ref=${row.code}` : '';
      return {
        affiliateCodeId: row._id.toString(),
        code: row.code,
        link,
        displayName: row.displayName,
        status: row.status,
        clicks: row.clicks,
        conversions: row.conversions,
        earningsByCurrency: row.earningsByCurrency || {},
        courseId: course?._id?.toString(),
        courseName: course?.name,
        courseCourseId: course?.courseId,
        affiliateRewardPercentage: course?.affiliateRewardPercentage
      };
    });
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching my affiliate codes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch affiliate codes',
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
  getCoursesByInstructor,
  getMyProgress,
  enroll,
  checkout,
  getProgress,
  completeLesson,
  uploadCertificate,
  uploadCertificateTemplate,
  createAffiliateCode,
  getAffiliatesByCourse,
  getMyAffiliateCodes
};

