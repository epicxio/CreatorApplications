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

    if (user.status === 'suspended') {
      return res.status(403).json({
        message: 'User Suspended. Kindly Contact Admin.',
        suspended: true,
        suspendedReason: user.suspendedReason || null
      });
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
      async (err, token) => {
        if (err) throw err;
        
        // Get full user data with populated fields for complete user object
        const fullUser = await User.findById(user._id)
          .select('-passwordHash')
          .populate('userType', 'name')
          .populate({
            path: 'role',
            populate: { path: 'permissions' }
          })
          .lean();
        
        // Compute assignedScreens dynamically from permissions
        let assignedScreens = [];
        if (fullUser.role && fullUser.role.permissions && fullUser.role.permissions.length > 0) {
          assignedScreens = fullUser.role.permissions
            .filter(p => p.action === 'View')
            .map(p => p.resource);
          assignedScreens = Array.from(new Set(assignedScreens));
        }
        fullUser.assignedScreens = assignedScreens;
        fullUser.categories = fullUser.categories || [];
        
        // Fire-and-forget: create KYC reminder notification for creators with incomplete KYC
        if (fullUser.userType && fullUser.userType.name === 'creator') {
          setImmediate(async () => {
            try {
              const kycService = require('../services/kycService');
              const Notification = require('../models/Notification');
              const kycData = await kycService.getKYCProfile(user._id);
              if (kycData.percentUploaded < 100) {
                const recentCutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                const existing = await Notification.findOne({
                  user: user._id,
                  eventType: 'creator_kyc_reminder',
                  read: false,
                  createdAt: { $gte: recentCutoff }
                });
                if (!existing) {
                  await Notification.create({
                    user: user._id,
                    title: 'KYC Required',
                    message: 'Please upload your KYC documents to proceed.',
                    eventType: 'creator_kyc_reminder',
                    read: false,
                    delivered: false,
                    channels: ['inApp']
                  });
                }
              }
            } catch (e) {
              console.warn('KYC reminder notification:', e.message);
            }
          });
        }
        
        // Return token along with complete user data to avoid extra API call
        res.json({ 
          token,
          user: fullUser
        });
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