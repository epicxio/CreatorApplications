const mongoose = require('mongoose');

const UserTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: 'PersonOutline'
  },
  color: {
    type: String,
    default: 'primary'
  },
  isActive: {
    type: Boolean,
    default: true
  },
}, {
  timestamps: true
});

module.exports = mongoose.model('UserType', UserTypeSchema); 