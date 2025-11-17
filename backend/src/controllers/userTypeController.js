const UserType = require('../models/UserType');

const createUserType = async (req, res) => {
  try {
    const { name, description, icon, color } = req.body;
    const userType = new UserType({
      name,
      description,
      icon,
      color,
    });
    await userType.save();
    res.status(201).json(userType);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getUserTypes = async (req, res) => {
  try {
    const userTypes = await UserType.find({ isActive: true });
    res.json(userTypes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserType = async (req, res) => {
  try {
    const userType = await UserType.findById(req.params.id);
    if (!userType) {
      res.status(404).json({ message: 'User type not found' });
      return;
    }
    res.json(userType);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUserType = async (req, res) => {
  try {
    const { name, description, icon, color } = req.body;
    const userType = await UserType.findById(req.params.id);
    
    if (!userType) {
      res.status(404).json({ message: 'User type not found' });
      return;
    }

    userType.name = name || userType.name;
    userType.description = description || userType.description;
    userType.icon = icon || userType.icon;
    userType.color = color || userType.color;

    await userType.save();
    res.json(userType);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteUserType = async (req, res) => {
  try {
    const userType = await UserType.findById(req.params.id);
    
    if (!userType) {
      res.status(404).json({ message: 'User type not found' });
      return;
    }

    userType.isActive = false;
    await userType.save();
    
    res.json({ message: 'User type deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createUserType,
  getUserTypes,
  getUserType,
  updateUserType,
  deleteUserType,
}; 