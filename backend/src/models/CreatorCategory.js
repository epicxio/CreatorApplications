const mongoose = require('mongoose');

const SubcategorySchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: String,
  description: String
}, { _id: false });

const CreatorCategorySchema = new mongoose.Schema({
  id: String,
  name: String,
  description: String,
  subcategories: [SubcategorySchema],
  createdAt: Date,
  updatedAt: Date
}, { collection: 'creatorcollections' });

module.exports = mongoose.model('CreatorCategory', CreatorCategorySchema); 