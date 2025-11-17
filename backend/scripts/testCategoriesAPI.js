// Usage: node backend/scripts/testCategoriesAPI.js
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/creator-marketplace';

async function testCategoriesAPI() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    // Get the database and collection directly
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Find a creator user
    const creatorUserTypeId = new mongoose.Types.ObjectId("68568dcc9fc5c3d96f8cff4b");
    const creatorUser = await usersCollection.findOne({ userType: creatorUserTypeId });
    
    if (!creatorUser) {
      console.error('No creator user found!');
      return;
    }

    console.log(`Testing with creator user: ${creatorUser.name} (${creatorUser.email})`);
    console.log(`User ID: ${creatorUser._id}`);

    // Test GET categories endpoint
    console.log('\n--- Testing GET /api/users/:id/categories ---');
    try {
      const response = await fetch(`http://localhost:5001/api/users/${creatorUser._id}/categories`);
      const data = await response.json();
      console.log('GET Response:', data);
    } catch (error) {
      console.error('GET request failed:', error.message);
    }

    // Test POST categories endpoint
    console.log('\n--- Testing POST /api/users/:id/categories ---');
    const testCategories = [
      {
        mainCategoryId: "test-category-1",
        subCategoryIds: ["test-sub-1", "test-sub-2"]
      }
    ];

    try {
      const response = await fetch(`http://localhost:5001/api/users/${creatorUser._id}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ categories: testCategories })
      });
      const data = await response.json();
      console.log('POST Response:', data);
    } catch (error) {
      console.error('POST request failed:', error.message);
    }

    // Verify the update in database
    console.log('\n--- Verifying database update ---');
    const updatedUser = await usersCollection.findOne({ _id: creatorUser._id });
    console.log('Updated user categories:', updatedUser.categories);

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

testCategoriesAPI(); 