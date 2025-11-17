const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }
  try {
    const user = await User.findOne({ email }).populate('userType', 'name').populate('role', 'name');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Block login if userType is missing or invalid
    if (!user.userType || typeof user.userType !== 'object' || !user.userType.name) {
      return res.status(403).json({ message: 'User type missing or invalid. Please contact support.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Update lastLogin timestamp
    user.lastLogin = new Date();
    await user.save();

    // Check if password reset is required
    if (user.passwordResetRequired) {
      return res.status(403).json({ 
        message: 'Password reset is required. Please change your password.',
        passwordResetRequired: true,
        userId: user._id
      });
    }

    console.log('User found:', user);
    const payload = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        userType: (user.userType && typeof user.userType === 'object' && user.userType.name) ? user.userType.name : null,
        role: (user.role && typeof user.role === 'object' && user.role.name) ? user.role.name : null
      }
    };

    // Sign token
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '5h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.changePassword = async (req, res) => {
    const { userId, oldPassword, newPassword } = req.body;

    if (!userId || !oldPassword || !newPassword) {
        return res.status(400).json({ message: 'User ID, old password, and new password are required.' });
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid old password.' });
        }
        
        const salt = await bcrypt.genSalt(10);
        user.passwordHash = await bcrypt.hash(newPassword, salt);
        user.passwordResetRequired = false;
        user.temporaryPassword = undefined;

        await user.save();

        res.json({ message: 'Password changed successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-passwordHash')
      .populate('userType', 'name')
      .populate({
        path: 'role',
        populate: { path: 'permissions' }
      });

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Compute assignedScreens dynamically from permissions
    let assignedScreens = [];
    if (user.role && user.role.permissions && user.role.permissions.length > 0) {
      assignedScreens = user.role.permissions
        .filter(p => p.action === 'View')
        .map(p => p.resource);
      assignedScreens = Array.from(new Set(assignedScreens));
    }
    const userObject = user.toObject();
    userObject.assignedScreens = assignedScreens;
    // Always include categories (empty array if missing)
    userObject.categories = userObject.categories || [];
    res.json(userObject);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
}; 