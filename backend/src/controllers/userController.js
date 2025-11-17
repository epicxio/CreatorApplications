const User = require('../models/User');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const UserType = require('../models/UserType');
const Role = require('../models/Role');
const mongoose = require('mongoose');
const CreatorCategory = require('../models/CreatorCategory');

// Get all users with optional filtering
const getUsers = async (req, res) => {
  try {
    const { userType, status, search } = req.query;
    let query = {};
    
    // Filter by user type
    if (userType && userType !== 'all') {
      query['userType'] = userType;
    }
    
    // Filter by status
    if (status && status !== 'all') {
      query['status'] = status;
    }
    
    // Search functionality
    if (search) {
      query['$or'] = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { creatorId: { $regex: search, $options: 'i' } },
        { 'socialMedia.instagram': { $regex: search, $options: 'i' } }
      ];
    }
    
    // Always populate userType and role (with name)
    const users = await User.find(query)
      .populate('userType', 'name icon color')
      .populate('role', 'name');
    // For each user, ensure assignedScreens is from DB if present
    const usersWithScreens = users.map(user => {
      const userObj = user.toObject();
      // Compute assignedScreens dynamically from permissions
      userObj.assignedScreens = [];
      if (user.role && user.role.permissions && user.role.permissions.length > 0) {
        userObj.assignedScreens = user.role.permissions
          .filter(p => p.action === 'View')
          .map(p => p.resource);
        userObj.assignedScreens = Array.from(new Set(userObj.assignedScreens));
      }
      return userObj;
    });
    res.json(usersWithScreens);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

// Get creators specifically
const getCreators = async (req, res) => {
  try {
    // Find the userType for 'creator'
    const creatorType = await UserType.findOne({ name: 'creator' });
    if (!creatorType) return res.status(400).json({ message: 'Creator user type not found.' });
    // Find all users with userType = creatorType._id
    const creators = await User.find({ userType: creatorType._id }).populate('userType', 'name icon color').populate('role', 'name');
    // For each creator, ensure assignedScreens is from DB if present
    const creatorsWithScreens = creators.map(user => {
      const userObj = user.toObject();
      // Compute assignedScreens dynamically from permissions
      userObj.assignedScreens = [];
      if (user.role && user.role.permissions && user.role.permissions.length > 0) {
        userObj.assignedScreens = user.role.permissions
          .filter(p => p.action === 'View')
          .map(p => p.resource);
        userObj.assignedScreens = Array.from(new Set(userObj.assignedScreens));
      }
      return userObj;
    });
    res.json(creatorsWithScreens);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching creators', error: error.message });
  }
};

// Get a single user by ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('userType').populate('role');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const userObj = user.toObject();
    // Compute assignedScreens dynamically from permissions
    userObj.assignedScreens = [];
    if (user.role && user.role.permissions && user.role.permissions.length > 0) {
      userObj.assignedScreens = user.role.permissions
        .filter(p => p.action === 'View')
        .map(p => p.resource);
      userObj.assignedScreens = Array.from(new Set(userObj.assignedScreens));
    }
    res.json(userObj);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
};

// Create a new user
const createUser = async (req, res) => {
  const { 
    name, 
    email, 
    password, 
    userType, 
    role,
    organization, 
    department, 
    status,
    // Creator-specific fields
    bio,
    socialMedia,
    // Brand-specific fields
    companyName,
    industry,
    website,
    // Common fields
    phoneNumber,
    address
  } = req.body;
  
  try {
    // Validate required fields
    if (!name || !email || !password || !userType || !role) {
      return res.status(400).json({ 
        message: 'Missing required fields. Name, email, password, userType, and role are required.' 
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Validate that the role exists
    const roleExists = await Role.findById(role);
    if (!roleExists) {
      return res.status(400).json({ message: 'Invalid role. Please select a valid role.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      passwordHash,
      userType,
      role,
      organization,
      department,
      status,
      bio,
      socialMedia,
      companyName,
      industry,
      website,
      phoneNumber,
      address
    });

    const savedUser = await newUser.save();
    const populatedUser = await User.findById(savedUser._id).populate('userType').populate('role');
    res.status(201).json(populatedUser);
  } catch (error) {
    res.status(400).json({ message: 'Error creating user', error: error.message });
  }
};

// Update a user
const updateUser = async (req, res) => {
  try {
    console.log('--- UPDATE USER: RECEIVED ---');
    console.log('ID:', req.params.id);
    console.log('Body:', JSON.stringify(req.body, null, 2));

    // If social fields are present at top-level, move them to socialMedia
    const socialFields = ['instagram', 'facebook', 'youtube'];
    if (!req.body.socialMedia) req.body.socialMedia = {};
    for (const field of socialFields) {
      if (req.body[field]) {
        req.body.socialMedia[field] = req.body[field];
        delete req.body[field];
      }
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate({ path: 'role', populate: { path: 'permissions' } }).populate('userType');

    if (!updatedUser) {
      console.log('--- UPDATE USER: FAILED - USER NOT FOUND ---');
      return res.status(404).json({ message: 'User not found' });
    }

    // Recompute assignedScreens from permissions and save to DB
    let assignedScreens = [];
    if (updatedUser.role && updatedUser.role.permissions && updatedUser.role.permissions.length > 0) {
      assignedScreens = updatedUser.role.permissions
        .filter(p => p.action === 'View')
        .map(p => p.resource);
      assignedScreens = Array.from(new Set(assignedScreens));
    }
    updatedUser.assignedScreens = assignedScreens;
    await updatedUser.save();

    const userObject = updatedUser.toObject();
    userObject.assignedScreens = assignedScreens;
    console.log('--- UPDATE USER: SENDING BACK ---');
    console.log(JSON.stringify(userObject, null, 2));
    res.json(userObject);
  } catch (error) {
    console.log('--- UPDATE USER: FAILED - SERVER ERROR ---');
    console.error(error);
    res.status(400).json({ message: 'Error updating user', error: error.message });
  }
};

// Delete a user (soft delete)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.status = 'deleted';
    await user.save();

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
};

// Reset user password
const resetPassword = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate a secure temporary password
    const temporaryPassword = crypto.randomBytes(8).toString('hex');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(temporaryPassword, salt);

    user.passwordHash = passwordHash;
    user.passwordResetRequired = true;
    user.temporaryPassword = temporaryPassword; // For testing only

    await user.save();
    
    res.json({ 
      message: 'Password has been reset successfully. A temporary password has been generated.',
      temporaryPassword: temporaryPassword // For testing only. Remove in production.
    });
  } catch (error) {
    res.status(500).json({ message: 'Error resetting password', error: error.message });
  }
};

// Get user statistics
const getUserStats = async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $lookup: {
          from: 'usertypes',
          localField: 'userType',
          foreignField: '_id',
          as: 'userTypeInfo'
        }
      },
      {
        $group: {
          _id: '$userTypeInfo.name',
          count: { $sum: 1 },
          active: {
            $sum: {
              $cond: [{ $eq: ['$status', 'active'] }, 1, 0]
            }
          },
          inactive: {
            $sum: {
              $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0]
            }
          }
        }
      }
    ]);
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user statistics', error: error.message });
  }
};

// Check if username is taken
const checkUsername = async (req, res) => {
  try {
    res.set('Cache-Control', 'no-store');
    const { username } = req.query;
    if (!username) return res.status(400).json({ message: 'Username is required.' });
    const existing = await User.findOne({ username });
    res.json({ taken: !!existing });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Check if phone number is registered
const checkPhoneNumber = async (req, res) => {
  try {
    res.set('Cache-Control', 'no-store');
    const { phoneNumber } = req.query;
    if (!phoneNumber) return res.status(400).json({ message: 'Phone number is required.' });
    const existing = await User.findOne({ phoneNumber });
    res.json({ taken: !!existing });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Creator signup (status: pending)
const signupCreator = async (req, res) => {
  try {
    const { name, email, username, phoneNumber, password, bio, socialMedia } = req.body;
    if (!username || !phoneNumber || !password) {
      return res.status(400).json({ message: 'Username, phone number, and password are required.' });
    }
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: 'Username is already taken.' });
    }
    const existingPhone = await User.findOne({ phoneNumber });
    if (existingPhone) {
      return res.status(400).json({ message: 'Phone number is already registered.' });
    }
    // Find creator userType
    const creatorType = await UserType.findOne({ name: 'creator' });
    if (!creatorType) return res.status(400).json({ message: 'Creator user type not found.' });
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const newUser = new User({
      name,
      email,
      username,
      phoneNumber,
      passwordHash,
      userType: creatorType._id,
      status: 'pending',
      bio,
      socialMedia
    });
    await newUser.save();
    res.status(201).json({ message: 'Request sent to Creator Admin.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all pending creators
const getPendingCreators = async (req, res) => {
  try {
    const creatorType = await UserType.findOne({ name: 'creator' });
    if (!creatorType) return res.status(400).json({ message: 'Creator user type not found.' });
    const pending = await User.find({ userType: creatorType._id, status: 'pending' });
    res.json(pending);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Approve creator
const approveCreator = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(id, { status: 'active' }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'Creator approved', user });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Reject creator
const rejectCreator = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(id, { status: 'rejected' }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'Creator rejected', user });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get a creator's categories
const getCreatorCategories = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    console.log('--- GET CREATOR CATEGORIES ---');
    console.log('User ID:', req.params.id);
    console.log('Categories:', user.categories);
    res.json({ categories: user.categories || [] });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
};

// Update a creator's categories
const updateCreatorCategories = async (req, res) => {
  try {
    console.log('--- UPDATE CREATOR CATEGORIES ---');
    console.log('User ID:', req.params.id);
    console.log('Body:', JSON.stringify(req.body, null, 2));
    const { categories } = req.body;
    if (!Array.isArray(categories)) {
      return res.status(400).json({ message: 'Categories must be an array' });
    }
    // Validate each category's mainCategoryId
    for (const cat of categories) {
      if (!cat.mainCategoryId || !mongoose.Types.ObjectId.isValid(cat.mainCategoryId)) {
        return res.status(400).json({ message: 'Invalid or missing mainCategoryId in categories' });
      }
      // Check if mainCategoryId exists in creatorcollections
      const exists = await CreatorCategory.findById(cat.mainCategoryId);
      if (!exists) {
        return res.status(400).json({ message: `mainCategoryId ${cat.mainCategoryId} does not exist in creatorcollections` });
      }
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { categories } },
      { new: true, runValidators: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    console.log('Saved categories:', user.categories);
    res.json({ categories: user.categories });
  } catch (error) {
    res.status(500).json({ message: 'Error updating categories', error: error.message });
  }
};

module.exports = {
  getUsers,
  getCreators,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  resetPassword,
  getUserStats,
  checkUsername,
  checkPhoneNumber,
  signupCreator,
  getPendingCreators,
  approveCreator,
  rejectCreator,
  getCreatorCategories,
  updateCreatorCategories,
}; 