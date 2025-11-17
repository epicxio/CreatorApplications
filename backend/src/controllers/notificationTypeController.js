const NotificationType = require('../models/NotificationType');

function isErrorWithMessage(error) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string'
  );
}

function toErrorWithMessage(maybeError) {
  if (isErrorWithMessage(maybeError)) return maybeError;
  try {
    return new Error(JSON.stringify(maybeError));
  } catch {
    return new Error(String(maybeError));
  }
}

function getErrorMessage(error) {
  return toErrorWithMessage(error).message;
}

// Create a new notification type
const createNotificationType = async (req, res) => {
  try {
    const {
      title,
      messageTemplate,
      roles,
      channels,
      isActive,
      priority,
      schedule,
      eventType
    } = req.body;

    const notificationType = new NotificationType({
      title,
      messageTemplate,
      roles,
      channels,
      isActive: isActive !== undefined ? isActive : true,
      priority: priority || 'medium',
      schedule: schedule || { enabled: false },
      eventType,
      createdBy: req.user._id
    });

    await notificationType.save();
    
    const populatedNotificationType = await NotificationType.findById(notificationType._id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    res.status(201).json(populatedNotificationType);
  } catch (error) {
    res.status(400).json({ message: getErrorMessage(error) });
  }
};

// Get all notification types with optional filtering
const getAllNotificationTypes = async (req, res) => {
  try {
    const { isActive, role, search } = req.query;
    
    let query = {};
    
    // Filter by active status
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    
    // Filter by role
    if (role && role !== 'all') {
      query.roles = role;
    }
    
    // Search by title
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }
    
    const notificationTypes = await NotificationType.find(query)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(notificationTypes);
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

// Get notification type by ID
const getNotificationTypeById = async (req, res) => {
  try {
    const notificationType = await NotificationType.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');
    
    if (!notificationType) {
      return res.status(404).json({ message: 'Notification type not found' });
    }
    
    res.json(notificationType);
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

// Update notification type
const updateNotificationType = async (req, res) => {
  try {
    const {
      title,
      messageTemplate,
      roles,
      channels,
      isActive,
      priority,
      schedule,
      eventType
    } = req.body;

    const updateData = {
      title,
      messageTemplate,
      roles,
      channels,
      isActive,
      priority,
      schedule,
      eventType,
      updatedBy: req.user._id
    };

    // Remove undefined fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const notificationType = await NotificationType.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!notificationType) {
      return res.status(404).json({ message: 'Notification type not found' });
    }

    res.json(notificationType);
  } catch (error) {
    res.status(400).json({ message: getErrorMessage(error) });
  }
};

// Delete notification type (soft delete)
const deleteNotificationType = async (req, res) => {
  try {
    const notificationType = await NotificationType.findById(req.params.id);
    
    if (!notificationType) {
      return res.status(404).json({ message: 'Notification type not found' });
    }

    // Soft delete by setting isActive to false
    notificationType.isActive = false;
    notificationType.updatedBy = req.user._id;
    await notificationType.save();

    res.json({ message: 'Notification type deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

// Toggle active status
const toggleActiveStatus = async (req, res) => {
  try {
    const notificationType = await NotificationType.findById(req.params.id);
    
    if (!notificationType) {
      return res.status(404).json({ message: 'Notification type not found' });
    }

    notificationType.isActive = !notificationType.isActive;
    notificationType.updatedBy = req.user._id;
    await notificationType.save();

    res.json({
      message: `Notification type ${notificationType.isActive ? 'activated' : 'deactivated'} successfully`,
      isActive: notificationType.isActive
    });
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

// Get notification types by role
const getNotificationTypesByRole = async (req, res) => {
  try {
    const { role } = req.params;
    
    const notificationTypes = await NotificationType.find({
      roles: role,
      isActive: true
    })
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(notificationTypes);
  } catch (error) {
    res.status(500).json({ message: getErrorMessage(error) });
  }
};

module.exports = {
  createNotificationType,
  getAllNotificationTypes,
  getNotificationTypeById,
  updateNotificationType,
  deleteNotificationType,
  toggleActiveStatus,
  getNotificationTypesByRole
}; 