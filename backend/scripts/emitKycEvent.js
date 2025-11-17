// Usage: node emitKycEvent.js <userEmail or userId>
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const eventBus = require('../src/services/eventBus');
const User = require('../src/models/User');
const NotificationEvent = require('../src/models/NotificationEvent');
const { initDynamicEventListeners } = require('../src/services/dynamicEventDispatcher');

async function main() {
  const arg = process.argv[2];
  if (!arg) {
    console.error('Usage: node emitKycEvent.js <userEmail or userId>');
    process.exit(1);
  }
  await mongoose.connect(process.env.MONGODB_URI);
  await initDynamicEventListeners();
  let user;
  if (arg.match(/^[0-9a-fA-F]{24}$/)) {
    user = await User.findById(arg);
  } else {
    user = await User.findOne({ email: arg });
  }
  if (!user) {
    console.error('User not found:', arg);
    process.exit(1);
  }
  console.log('Found user:', user.email, user._id);
  // Emit the KYC event
  console.log('Emitting kyc_uploaded event...');
  eventBus.emit('kyc_uploaded', {
    userId: user._id,
    userName: user.name || user.email,
    documentType: 'pan_card',
    documentName: 'PAN Card',
    documentNumber: 'TEST1234',
    test: true
  });
  console.log('Emitted kyc_uploaded event for user:', user.email || user._id);
  setTimeout(() => {
    console.log('emitKycEvent.js script completed and exiting.');
    process.exit(0);
  }, 1000); // Give time for async listeners
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
}); 