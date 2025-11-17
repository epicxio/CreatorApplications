require('dotenv').config({ path: '../../.env' });
const mongoose = require('mongoose');
const KYCDocument = require('../models/KYCDocument');
const KYCProfile = require('../models/KYCProfile');

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  throw new Error('MONGODB_URI not found in environment variables');
}

async function migrate() {
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB Atlas');

    // Insert dummy KYC Document
    const dummyDoc = await KYCDocument.create({
      userId: new mongoose.Types.ObjectId(),
      documentType: 'pan_card',
      documentName: 'Dummy User',
      documentNumber: 'DUMMY1234X',
      fileName: 'dummy.pdf',
      originalFileName: 'dummy.pdf',
      filePath: '/tmp/dummy.pdf',
      fileSize: 1,
      mimeType: 'application/pdf'
    });

    // Insert dummy KYC Profile
    const dummyProfile = await KYCProfile.create({
      userId: new mongoose.Types.ObjectId(),
      requiredDocuments: {
        panCard: { isRequired: true, isSubmitted: false, isVerified: false },
        aadharCard: { isRequired: true, isSubmitted: false, isVerified: false },
        otherDocuments: []
      }
    });

    // Clean up: delete dummy docs
    await KYCDocument.deleteOne({ _id: dummyDoc._id });
    await KYCProfile.deleteOne({ _id: dummyProfile._id });

    console.log('KYC collections created in MongoDB Atlas!');

    // List collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections in database:', collections.map(c => c.name));
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

migrate();