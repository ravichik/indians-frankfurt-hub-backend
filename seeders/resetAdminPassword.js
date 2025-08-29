const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

dotenv.config();

const resetAdminPassword = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find the admin user
    let adminUser = await User.findOne({ email: 'admin@indiansfrankfurt.com' });
    
    if (adminUser) {
      // Update password and role
      const hashedPassword = await bcrypt.hash('admin123456', 10);
      adminUser.password = hashedPassword;
      adminUser.role = 'admin';
      await adminUser.save();
      
      console.log('Admin password reset successfully!');
      console.log('Updated credentials:');
      console.log('Email: admin@indiansfrankfurt.com');
      console.log('Password: admin123456');
      console.log('Role:', adminUser.role);
    } else {
      // Create new admin user with hashed password
      const hashedPassword = await bcrypt.hash('admin123456', 10);
      
      adminUser = new User({
        username: 'admin',
        email: 'admin@indiansfrankfurt.com',
        password: hashedPassword,
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

    // List all users to verify
    console.log('\nVerifying user in database:');
    const verifyUser = await User.findOne({ email: 'admin@indiansfrankfurt.com' }).select('email username role');
    console.log('Found user:', verifyUser);

    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  } catch (error) {
    console.error('Error resetting admin password:', error);
    process.exit(1);
  }
};

resetAdminPassword();