const express = require('express');
const router = express.Router();
const Creator = require('../models/Creator');
const creatorController = require('../controllers/creatorController');

const mockCourses = [
  {
    id: '1',
    name: 'Motion Design 101',
    createdAt: '2025-07-13T10:00:00Z',
    type: 'Free',
    access: { mode: 'Lifetime' },
    enrollments: 250,
    completionRate: 80,
    status: 'Live & Selling',
    lastUpdated: '2025-07-13T12:00:00Z',
    visibility: 'Public',
    certificateEnabled: true,
    dripEnabled: true,
    installmentsOn: false,
    affiliateActive: false,
    listedPrice: { INR: 2000, USD: 25, EUR: 23 },
    sellingPrice: { INR: 1500, USD: 19, EUR: 17 },
  },
  {
    id: '2',
    name: 'Untitled course',
    createdAt: '2025-06-30T10:00:00Z',
    type: 'Paid',
    access: { mode: 'Date-Range', startDate: '2025-06-30T10:00:00Z', endDate: '2025-12-31T10:00:00Z' },
    enrollments: 0,
    completionRate: 0,
    status: 'Draft',
    lastUpdated: '2025-06-30T10:00:00Z',
    visibility: 'Private',
    certificateEnabled: false,
    dripEnabled: false,
    installmentsOn: true,
    affiliateActive: true,
    listedPrice: { INR: 1000, USD: 12, EUR: 11 },
    sellingPrice: { INR: 800, USD: 9, EUR: 8 },
  }
];

// Add Creator (with creatorId auto-generation)
router.post('/add', async (req, res) => {
  try {
    const { name, email, bio, instagram, facebook, youtube, status } = req.body;
    const existing = await Creator.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Creator with this email already exists.' });
    }
    // Generate next creatorId
    const last = await Creator.findOne({ creatorId: { $exists: true } })
      .sort({ creatorId: -1 })
      .collation({ locale: 'en_US', numericOrdering: true });
    let creatorId = 'CA00001';
    if (last && last.creatorId) {
      const num = parseInt(last.creatorId.replace('CA', '')) + 1;
      creatorId = 'CA' + num.toString().padStart(5, '0');
    }
    const creator = new Creator({ name, email, bio, instagram, facebook, youtube, status, creatorId });
    await creator.save();
    res.status(201).json(creator);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// (Optional) Get all creators (excluding soft-deleted)
router.get('/', async (req, res) => {
  const creators = await Creator.find({ status: { $ne: 'deleted' } });
  res.json(creators);
});

// Creator sign up
router.post('/signup', creatorController.signupCreator);

// Get all pending creators
router.get('/pending', creatorController.getPendingCreators);

// Approve creator
router.post('/:id/approve', creatorController.approveCreator);

// Reject creator
router.post('/:id/reject', creatorController.rejectCreator);

// Update creator details
router.put('/:id', creatorController.updateCreator);

// Soft delete creator
router.delete('/:id', creatorController.softDeleteCreator);

// Check if username is taken
router.get('/check-username', creatorController.checkUsername);

// Check if phone number is registered
router.get('/check-phone', creatorController.checkPhoneNumber);

router.get('/courses', async (req, res) => {
  res.json({ courses: mockCourses });
});

module.exports = router;