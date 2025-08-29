const mongoose = require('mongoose');
const ForumPost = require('../models/ForumPost');
const User = require('../models/User'); // Need to load User model for populate to work
require('dotenv').config();

async function getForumPosts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const posts = await ForumPost.find()
      .populate('author', 'username')
      .sort('-createdAt')
      .limit(10);
    
    console.log('\n=== EXISTING FORUM POSTS ===\n');
    
    posts.forEach((post, index) => {
      console.log(`${index + 1}. TITLE: ${post.title}`);
      console.log(`   AUTHOR: ${post.author?.username || 'Unknown'}`);
      console.log(`   CATEGORY: ${post.category}`);
      console.log(`   CONTENT: ${post.content.substring(0, 200)}...`);
      console.log(`   REPLIES: ${post.replies?.length || 0}`);
      console.log(`   POST ID: ${post._id}`);
      console.log('-----------------------------------\n');
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

getForumPosts();