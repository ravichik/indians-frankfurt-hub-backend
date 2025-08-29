const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/indians-frankfurt-hub';
    
    // Validate MongoDB URI format for production
    if (process.env.NODE_ENV === 'production' && mongoUri.includes('mongodb+srv://')) {
      // Check if the URI contains the generic 'cluster' placeholder
      if (mongoUri.includes('@cluster.mongodb.net')) {
        console.error('❌ ERROR: Invalid MongoDB URI detected!');
        console.error('Your URI contains "cluster" which is a placeholder.');
        console.error('');
        console.error('Current URI:', mongoUri);
        console.error('');
        console.error('You need to replace "cluster" with your actual MongoDB Atlas cluster name.');
        console.error('');
        console.error('To find your cluster name:');
        console.error('1. Go to MongoDB Atlas (https://cloud.mongodb.com)');
        console.error('2. Sign in to your account');
        console.error('3. Look at your cluster - it will have a name like "cluster0" or a custom name');
        console.error('4. Click "Connect" on your cluster');
        console.error('5. Choose "Connect your application"');
        console.error('6. Copy the connection string - it will have the correct cluster name');
        console.error('');
        console.error('Example correct format:');
        console.error('mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/dbname?retryWrites=true&w=majority');
        console.error('');
        process.exit(1);
      }
      
      // Additional validation for common issues
      const uriParts = mongoUri.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@([^\/]+)\/([^?]+)/);
      if (!uriParts) {
        console.error('❌ ERROR: Malformed MongoDB URI');
        console.error('Please check your MONGODB_URI format');
        process.exit(1);
      }
      
      const [, username, password, host, database] = uriParts;
      console.log('MongoDB Connection Details:');
      console.log(`- Username: ${username}`);
      console.log(`- Host: ${host}`);
      console.log(`- Database: ${database}`);
    }
    
    // Remove deprecated options for MongoDB driver 4.0+
    const conn = await mongoose.connect(mongoUri);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Create indexes for better performance
    await createIndexes();
    
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    
    if (error.message.includes('querySrv ENOTFOUND _mongodb._tcp.cluster.mongodb.net')) {
      console.error('');
      console.error('This error means your cluster name is invalid or missing.');
      console.error('The "cluster" in your URI is just a placeholder!');
      console.error('');
      console.error('Please update your MONGODB_URI with the actual cluster name from MongoDB Atlas.');
    }
    
    // Don't exit process immediately in production, allow for retries
    if (process.env.NODE_ENV === 'production') {
      console.error('');
      console.error('MongoDB connection failed. Please check your MONGODB_URI environment variable.');
      console.error('Expected format: mongodb+srv://username:password@clustername.mongodb.net/dbname?retryWrites=true&w=majority');
      console.error('');
      console.error('Note: "clustername" should be your actual cluster name (e.g., "cluster0"), not the word "cluster"');
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