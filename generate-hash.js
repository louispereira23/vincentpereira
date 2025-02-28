const bcrypt = require('bcryptjs');

// Password to hash
const password = 'adminpassword';

// Generate a salt
const salt = bcrypt.genSaltSync(10);

// Hash the password
const hash = bcrypt.hashSync(password, salt);

console.log('Generated hash for "adminpassword":', hash);

// Verify the hash
const isMatch = bcrypt.compareSync(password, hash);
console.log('Verification (should be true):', isMatch);

// Test with the original hash from .env
const originalHash = '$2a$10$eCrTlnvQBDfv6YaALBBJz.3hRcVXxN4/K.Kp7s4t0Agwe9.mPvmXe';
console.log('Original hash matches "adminpassword"?', bcrypt.compareSync(password, originalHash)); 