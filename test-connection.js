const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

console.log('Testing MongoDB Atlas connection...');
console.log('Connection string (password hidden):', process.env.MONGODB_URI.replace(/:[^:]*@/, ':****@'));

async function testConnection() {
  try {
    console.log('Attempting to connect...');
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ Successfully connected to MongoDB Atlas!');
    console.log('Database name:', mongoose.connection.name);
    console.log('Host:', mongoose.connection.host);
    
    // List collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Existing collections:', collections.map(c => c.name));
    
    await mongoose.connection.close();
    console.log('Connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed!');
    console.error('Error type:', error.name);
    console.error('Error message:', error.message);
    
    if (error.name === 'MongooseServerSelectionError') {
      console.log('\nPossible issues:');
      console.log('1. IP not whitelisted - Check Network Access in Atlas');
      console.log('2. Wrong username/password - Check Database Access in Atlas');
      console.log('3. Cluster might be paused or not ready');
      console.log('4. Network/firewall blocking the connection');
    }
    
    process.exit(1);
  }
}

testConnection();