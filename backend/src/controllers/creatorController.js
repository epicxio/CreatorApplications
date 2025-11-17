const Creator = require('../models/Creator');
const crypto = require('crypto');

// Helper to generate next creatorId
async function getNextCreatorId() {
  const last = await Creator.findOne({ creatorId: { $exists: true } })
    .sort({ creatorId: -1 })
    .collation({ locale: 'en_US', numericOrdering: true });
  if (!last || !last.creatorId) return 'CA00001';
  const num = parseInt(last.creatorId.replace('CA', '')) + 1;
  return 'CA' + num.toString().padStart(5, '0');
}

// Creator sign up (status: pending)
exports.signupCreator = async (req, res) => {
  try {
    const { name, email, username, phoneNumber, password, bio, instagram, facebook, youtube } = req.body;
    if (!username || !phoneNumber || !password) {
      console.error('Missing required fields:', req.body);
    }
    if (!username) return res.status(400).json({ message: 'Username is required.' });
    if (!phoneNumber) return res.status(400).json({ message: 'Phone number is required.' });
    if (!password) return res.status(400).json({ message: 'Password is required.' });
    const existingEmail = await Creator.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: 'Creator with this email already exists.' });
    }
    const existingUsername = await Creator.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: 'Username is already taken.' });
    }
    const existingPhone = await Creator.findOne({ phoneNumber });
    if (existingPhone) {
      return res.status(400).json({ message: 'Phone number is already registered.' });
    }
    // Hash the password using SHA-256
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
    const creatorId = await getNextCreatorId();
    const creator = new Creator({
      name,
      email,
      username,
      phoneNumber,
      passwordHash,
      bio,
      instagram,
      facebook,
      youtube,
      creatorId,
      status: 'pending',
    });
    await creator.save();
    res.status(201).json({ message: 'Request sent to Creator Admin.', creatorId });
  } catch (err) {
    console.error('Creator signup error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update creator details (except creatorId)
exports.updateCreator = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, bio, instagram, facebook, youtube, status } = req.body;
    const creator = await Creator.findByIdAndUpdate(
      id,
      { name, email, bio, instagram, facebook, youtube, status },
      { new: true, runValidators: true, context: 'query' }
    );
    if (!creator) return res.status(404).json({ message: 'Creator not found' });
    res.json({ message: 'Creator updated', creator });
  } catch (err) {
    if (err.code === 11000 && err.keyPattern && err.keyPattern.email) {
      return res.status(400).json({ message: 'A creator with this email already exists.' });
    }
    console.error('Update creator error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all pending creators
exports.getPendingCreators = async (req, res) => {
  try {
    const pending = await Creator.find({ status: 'pending' });
    res.json(pending);
  } catch (err) {
    console.error('Get pending creators error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Approve creator
exports.approveCreator = async (req, res) => {
  try {
    const { id } = req.params;
    const creator = await Creator.findByIdAndUpdate(id, { status: 'active' }, { new: true });
    if (!creator) return res.status(404).json({ message: 'Creator not found' });
    res.json({ message: 'Creator approved', creator });
  } catch (err) {
    console.error('Approve creator error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Reject creator
exports.rejectCreator = async (req, res) => {
  try {
    const { id } = req.params;
    const creator = await Creator.findByIdAndUpdate(id, { status: 'rejected' }, { new: true });
    if (!creator) return res.status(404).json({ message: 'Creator not found' });
    res.json({ message: 'Creator rejected', creator });
  } catch (err) {
    console.error('Reject creator error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Soft delete creator (set status to 'deleted')
exports.softDeleteCreator = async (req, res) => {
  try {
    const { id } = req.params;
    const creator = await Creator.findByIdAndUpdate(
      id,
      { status: 'deleted' },
      { new: true }
    );
    if (!creator) return res.status(404).json({ message: 'Creator not found' });
    res.json({ message: 'Creator soft deleted', creator });
  } catch (err) {
    console.error('Soft delete creator error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Check if username is taken
exports.checkUsername = async (req, res) => {
  try {
    const { username } = req.query;
    if (!username) return res.status(400).json({ message: 'Username is required.' });
    const existing = await Creator.findOne({ username });
    if (existing) {
      return res.json({ taken: true });
    }
    res.json({ taken: false });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Check if phone number is registered
exports.checkPhoneNumber = async (req, res) => {
  try {
    const { phoneNumber } = req.query;
    if (!phoneNumber) return res.status(400).json({ message: 'Phone number is required.' });
    const existing = await Creator.findOne({ phoneNumber });
    if (existing) {
      return res.json({ taken: true });
    }
    res.json({ taken: false });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 