const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const Brand = require('../models/Brand');

// Register new brand
exports.registerBrand = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      companyName,
      email,
      password,
      website,
      industry,
      companySize,
      description
    } = req.body;

    // Check if brand already exists
    const existingBrand = await Brand.findOne({ email });
    if (existingBrand) {
      return res.status(400).json({ message: 'Brand with this email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new brand
    const brand = new Brand({
      companyName,
      email,
      password: hashedPassword,
      website,
      industry,
      companySize,
      description
    });

    await brand.save();

    // Return success response (excluding password)
    const brandResponse = brand.toObject();
    delete brandResponse.password;

    res.status(201).json({
      message: 'Brand registered successfully',
      brand: brandResponse
    });

  } catch (error) {
    console.error('Brand registration error:', error);
    res.status(500).json({ message: 'Server error during brand registration' });
  }
};

// Get all brands (for testing)
exports.getAllBrands = async (req, res) => {
  try {
    const brands = await Brand.find().select('-password');
    res.json(brands);
  } catch (error) {
    console.error('Error fetching brands:', error);
    res.status(500).json({ message: 'Error fetching brands' });
  }
}; 