// backend/src/utils/generateHash.js

const crypto = require('crypto');

// Change this password to the one you want to hash
const password = 'Test@12345';

const hash = crypto.createHash('sha256').update(password).digest('hex');
console.log('SHA-256 hash:', hash);