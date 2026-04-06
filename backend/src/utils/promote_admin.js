const mongoose = require('mongoose');
const path = require('path');
const User = require('../models/User.model');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const promoteAdmin = async (email) => {
  try {
    if (!process.env.MONGO_URI) {
      console.error('MONGO_URI not found in .env file');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB...');

    const user = await User.findOneAndUpdate(
      { email },
      { role: 'Admin' },
      { new: true }
    );

    if (!user) {
      console.error(`User with email ${email} not found.`);
      process.exit(1);
    }

    console.log(`SUCCESS: User ${user.name} (${user.email}) has been promoted to Admin.`);
    process.exit(0);
  } catch (error) {
    console.error('Error promoting user:', error.message);
    process.exit(1);
  }
};

const email = process.argv[2];
if (!email) {
  console.log('Usage: node src/utils/promote_admin.js <email>');
  process.exit(1);
}

promoteAdmin(email);
