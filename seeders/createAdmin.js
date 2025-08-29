const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@indiansfrankfurt.com' });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      
      // Update existing user to admin role
      existingAdmin.role = 'admin';
      await existingAdmin.save();
      console.log('Updated existing user to admin role');
      console.log('Admin credentials:');
      console.log('Email: admin@indiansfrankfurt.com');
      console.log('Password: admin123456');
    } else {
      // Create new admin user
      const adminUser = new User({
        username: 'admin',
        email: 'admin@indiansfrankfurt.com',
        password: 'admin123456', // This will be hashed by the User model
        fullName: 'System Administrator',
        role: 'admin',
        bio: 'Platform Administrator for Indians in Frankfurt Hub'
      });

      await adminUser.save();
      console.log('Admin user created successfully!');
      console.log('Admin credentials:');
      console.log('Email: admin@indiansfrankfurt.com');
      console.log('Password: admin123456');
    }

    // Also create a test moderator
    const existingMod = await User.findOne({ email: 'moderator@indiansfrankfurt.com' });
    
    if (!existingMod) {
      const modUser = new User({
        username: 'moderator',
        email: 'moderator@indiansfrankfurt.com',
        password: 'mod123456',
        fullName: 'Community Moderator',
        role: 'moderator',
        bio: 'Community Moderator for Indians in Frankfurt Hub'
      });

      await modUser.save();
      console.log('\nModerator user created successfully!');
      console.log('Moderator credentials:');
      console.log('Email: moderator@indiansfrankfurt.com');
      console.log('Password: mod123456');
    }

    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

createAdminUser();