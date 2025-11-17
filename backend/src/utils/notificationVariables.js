const User = require('../models/User');

function getUserFieldDescriptions() {
  const schema = User.schema.paths;
  const customDescriptions = {
    name: "User's full name",
    email: "User's email address",
    phoneNumber: "User's phone number",
    role: "User's role",
    userType: "User type",
    bio: "User bio",
    username: "Username",
    creatorId: "Creator ID",
    userId: "User ID",
    status: "User status",
    profileImage: "Profile image URL"
  };
  return Object.keys(schema).map(field => ({
    variable: field,
    description: customDescriptions[field] || field
  }));
}

const contextFields = [
  { variable: 'courseTitle', description: 'Course title (if provided)' },
  { variable: 'brandName', description: 'Brand name (if provided)' },
  { variable: 'documentType', description: 'KYC document type (if provided)' },
  { variable: 'documentName', description: 'KYC document name (if provided)' },
  { variable: 'documentNumber', description: 'KYC document number (if provided)' }
];

function getAllNotificationVariables() {
  return [
    ...getUserFieldDescriptions(),
    ...contextFields
  ];
}

module.exports = { getAllNotificationVariables }; 