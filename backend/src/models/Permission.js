const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({
  resource: { // e.g., 'User', 'Campaign', 'Role'
    type: String,
    required: true,
  },
  action: { // e.g., 'Create', 'View', 'Edit', 'Delete'
    type: String,
    required: true,
  },
  description: {
    type: String,
  }
}, { timestamps: true });

// Ensure that the combination of resource and action is unique
permissionSchema.index({ resource: 1, action: 1 }, { unique: true });

const Permission = mongoose.model('Permission', permissionSchema);

module.exports = Permission; 