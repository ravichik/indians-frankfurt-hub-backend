const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Remove deprecated options for MongoDB driver 4.0+
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/indians-frankfurt-hub');

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Create indexes for better performance
    await createIndexes();
    
  } catch (error) {
    console.error(`Error: ${error.message}`);
    // Don't exit process immediately in production, allow for retries
    if (process.env.NODE_ENV === 'production') {
      console.error('MongoDB connection failed. Please check your MONGODB_URI environment variable.');
      console.error('Expected format: mongodb+srv://username:password@clustername.mongodb.net/dbname?retryWrites=true&w=majority');
    }
    process.exit(1);
  }
};

const createIndexes = async () => {
  try {
    // User indexes
    const User = require('../models/User');
    await User.createIndexes();
    
    // Event indexes
    const Event = require('../models/Event');
    await Event.createIndexes();
    
    // ForumPost indexes
    const ForumPost = require('../models/ForumPost');
    await ForumPost.createIndexes();
    
    console.log('Database indexes created successfully');
  } catch (error) {
    console.error('Error creating indexes:', error);
  }
};

module.exports = connectDB;