const express = require('express');
const router = express.Router();
const creatorCategoryController = require('../controllers/creatorCategoryController');

// GET /api/creator-categories
router.get('/', creatorCategoryController.getAllCategories);

module.exports = router; 