const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Role = require('../models/Role');
const Permission = require('../models/Permission');

module.exports = async function (req, res, next) {
  // Get token from header
  const token = req.header('Authorization')?.split(' ')[1];

  // Check if not token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;

    // Fetch user from DB to get role and permissions
    const user = await User.findById(req.user.id).populate({
      path: 'role',
      populate: { path: 'permissions' }
    });
    if (!user) {
      return res.status(401).json({ msg: 'User not found' });
    }
    req.user._id = user._id;
    req.user.role = user.role && user.role.name ? user.role.name : null;
    req.user.permissions = user.role && user.role.permissions ? user.role.permissions.map(p => ({ resource: p.resource, action: p.action })) : [];

    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
}; 