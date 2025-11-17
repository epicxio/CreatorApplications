const CreatorCategory = require('../models/CreatorCategory');

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await CreatorCategory.find({});
    res.json(categories);
  } catch (err) {
    console.error('Error fetching creator categories:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 