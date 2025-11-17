module.exports.hasPermission = (resource, action) => (req, res, next) => {
  // Allow superadmin all access
  if (req.user && req.user.role && req.user.role === 'superadmin') {
    return next();
  }

  // Permissions should be attached to req.user.permissions
  const userPermissions = req.user && req.user.permissions;
  if (!userPermissions) {
    return res.status(403).json({ success: false, message: 'No permissions found for user.' });
  }

  // Check if the user has the required permission
  const has = userPermissions.some(
    (perm) =>
      perm.resource === resource &&
      (perm.action === action || perm.action === 'All')
  );

  if (has) {
    return next();
  } else {
    return res.status(403).json({
      success: false,
      message: `You do not have permission to ${action} ${resource}.`,
    });
  }
}; 