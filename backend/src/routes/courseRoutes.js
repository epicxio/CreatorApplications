const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Get all courses (with filters)
router.get('/', courseController.getCourses);

// Get courses by current instructor (for course management page)
router.get('/my-courses', courseController.getCoursesByInstructor);

// Save course as draft (can be called from any step)
// IMPORTANT: These routes must come BEFORE /:id routes to avoid route conflicts
router.post('/draft', courseController.saveDraft); // Create new draft
router.post('/:id/draft', courseController.saveDraft); // Update existing draft

// Create new course (draft)
router.post('/', courseController.createCourse);

// Get course by ID (must come after specific routes)
router.get('/:id', courseController.getCourseById);

// Update course
router.put('/:id', courseController.updateCourse);

// Publish course
router.post('/:id/publish', courseController.publishCourse);

// Delete course
router.delete('/:id', courseController.deleteCourse);

module.exports = router;

