const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const initializeUserContributions = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/indians-frankfurt-hub');
    console.log('Connected to MongoDB');

    // Find all users without contributions field
    const users = await User.find({ contributions: { $exists: false } });
    console.log(`Found ${users.length} users without contribution data`);

    // Initialize contributions for each user
    for (const user of users) {
      user.contributions = {
        points: 0,
        postsCreated: 0,
        solutionsProvided: 0,
        eventsCreated: 0,
        thanksReceived: 0,
        helpfulAnswers: 0,
        badges: [],
        level: 'Newcomer',
        lastContribution: null
      };
      
      await user.save();
      console.log(`Initialized contributions for user: ${user.username}`);
    }

    console.log('All users updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing contributions:', error);
    process.exit(1);
  }
};

// Run the initialization
initializeUserContributions();