const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const fixAdminAccount = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Delete existing admin if exists
    await User.deleteOne({ email: 'admin@indiansfrankfurt.com' });
    console.log('Deleted existing admin account if it existed');

    // Create fresh admin user - password will be hashed by the model's pre-save hook
    const adminUser = new User({
      username: 'admin',
      email: 'admin@indiansfrankfurt.com',
      password: 'admin123456', // This will be automatically hashed by the model
      fullName: 'System Administrator',
      role: 'admin',
      bio: 'Platform Administrator for Indians in Frankfurt Hub'
    });

    await adminUser.save();
    console.log('Admin user created successfully!');
    console.log('\n=================================');
    console.log('ADMIN LOGIN CREDENTIALS:');
    console.log('Email: admin@indiansfrankfurt.com');
    console.log('Password: admin123456');
    console.log('=================================\n');

    // Test the password to make sure it works
    const testUser = await User.findOne({ email: 'admin@indiansfrankfurt.com' });
    const passwordWorks = await testUser.comparePassword('admin123456');
    console.log('Password verification test:', passwordWorks ? 'PASSED ✓' : 'FAILED ✗');

    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  } catch (error) {
    console.error('Error fixing admin account:', error);
    process.exit(1);
  }
};

fixAdminAccount();