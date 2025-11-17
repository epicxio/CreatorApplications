const path = require('path');
const dotenv = require('dotenv');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const brandRoutes = require('./routes/brandRoutes');
const roleRoutes = require('./routes/roleRoutes');
const permissionRoutes = require('./routes/permissionRoutes');
const userRoutes = require('./routes/userRoutes');
const userTypeRoutes = require('./routes/userTypeRoutes');
const creatorRoutes = require('./routes/creatorRoutes');
const instagramAuth = require('./routes/instagramAuth');
const authRoutes = require('./routes/authRoutes');
const { syncPermissions, assignAllPermissionsToSuperAdmin } = require('./services/permissionSeeder');
const kycRoutes = require('./routes/kycRoutes');
const creatorCategoryRoutes = require('./routes/creatorCategoryRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const notificationTypeRoutes = require('./routes/notificationTypeRoutes');
const courseRoutes = require('./routes/courseRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const quizRoutes = require('./routes/quizRoutes');

const dotEnvPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: dotEnvPath });

console.log(`--- Server attempting to load .env file from: ${dotEnvPath} ---`);
console.log(`--- MONGODB_URI loaded: ${process.env.MONGODB_URI ? '******' : 'NOT FOUND'} ---`);

const app = express();

app.use(cors({origin: 'http://localhost:3000',
  credentials: true}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (!process.env.MONGODB_URI) {
  console.error('FATAL ERROR: MONGODB_URI is not defined.');
  process.exit(1);
}

mongoose.connect(process.env.MONGODB_URI)
  .catch(err => console.error('Initial MongoDB connection error:', err));

app.use('/api/brands', brandRoutes);
app.use('/api/users', userRoutes);
app.use('/api/user-types', userTypeRoutes);
app.use('/api/creators', creatorRoutes);
app.use('/auth/instagram', instagramAuth);
app.use('/api/auth', authRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/permissions', permissionRoutes);
app.use('/api/kyc', kycRoutes);
app.use('/api/creator-categories', creatorCategoryRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/notification-types', notificationTypeRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/quiz', quizRoutes);

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Creator Marketplace API' });
});

const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
};
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

mongoose.connection.once('open', async () => {
  console.log('✅ Connected to MongoDB');
  app.listen(PORT, async () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    
    // ✅ AUTOMATIC: Sync permissions and assign to Super Admin on every server start
    try {
      await syncPermissions(); // This already calls assignAllPermissionsToSuperAdmin internally
      console.log('✅ Permissions synced and Super Admin updated automatically.');
    } catch (error) {
      console.error('❌ Error during permission sync:', error);
    }

    // ✅ AUTOMATIC: Start quiz expiration service (runs every minute)
    const { expireQuizzes } = require('./services/quizExpirationService');
    setInterval(async () => {
      try {
        await expireQuizzes();
      } catch (error) {
        console.error('❌ Error in quiz expiration service:', error);
      }
    }, 60000); // Run every 60 seconds (1 minute)
    console.log('✅ Quiz expiration service started (runs every minute)');
  });
});

mongoose.connection.on('error', err => {
  console.error('MongoDB connection error:', err);
});
