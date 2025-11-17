const mongoose = require('mongoose');

const CreatorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true, unique: true },
  bio: { type: String },
  instagram: { type: String },
  facebook: { type: String },
  youtube: { type: String },
  creatorId: { type: String, unique: true, sparse: true }, // Sequential CreatorId like CA00001
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'pending', 'rejected', 'deleted'],
    default: 'active' 
  },
  // Add OAuth fields later for edit/connect
}, { timestamps: true });

module.exports = mongoose.model('Creator', CreatorSchema);