const express = require('express');
const router = express.Router();
const User = require('../models/User');
const ForumPost = require('../models/ForumPost');
const Event = require('../models/Event');
const { authMiddleware } = require('../middleware/auth');

// Get user statistics
router.get('/:userId/stats', authMiddleware, async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log('Fetching stats for userId:', userId);
    
    // Get forum posts count
    const postsCount = await ForumPost.countDocuments({ author: userId });
    console.log('Posts count:', postsCount);
    
    // Get replies count - check all posts for replies by this user
    const allPosts = await ForumPost.find({});
    let repliesCount = 0;
    
    allPosts.forEach(post => {
      if (post.replies && post.replies.length > 0) {
        post.replies.forEach(reply => {
          if (reply.author && reply.author.toString() === userId.toString()) {
            repliesCount++;
          }
        });
      }
    });
    
    console.log('Replies count:', repliesCount);
    
    // Get events attended count (if Event model exists)
    let eventsCount = 0;
    try {
      const events = await Event.find({ 'attendees': userId });
      eventsCount = events.length;
    } catch (err) {
      // Event model might not exist yet
      eventsCount = 0;
    }
    
    // Get total likes received on posts
    const userPosts = await ForumPost.find({ author: userId });
    const totalLikes = userPosts.reduce((count, post) => count + (post.likes?.length || 0), 0);
    
    console.log('Sending stats:', { posts: postsCount, replies: repliesCount, events: eventsCount, likes: totalLikes });
    
    res.json({
      posts: postsCount,
      replies: repliesCount,
      events: eventsCount,
      likes: totalLikes,
      connections: Math.floor(Math.random() * 50) + 10 // Placeholder for now
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'Failed to fetch user statistics' });
  }
});

// Get user's forum posts
router.get('/:userId/posts', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const userId = req.params.userId;
    
    const posts = await ForumPost.find({ author: userId })
      .populate('author', 'username fullName avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const count = await ForumPost.countDocuments({ author: userId });
    
    res.json({
      posts,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error('Error fetching user posts:', error);
    res.status(500).json({ error: 'Failed to fetch user posts' });
  }
});

// Get user's events
router.get('/:userId/events', authMiddleware, async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Placeholder response since Event model might not be fully implemented
    res.json({
      events: [],
      upcoming: [],
      past: [],
      total: 0
    });
  } catch (error) {
    console.error('Error fetching user events:', error);
    res.status(500).json({ error: 'Failed to fetch user events' });
  }
});

// Update user profile
router.patch('/:userId/profile', authMiddleware, async (req, res) => {
  try {
    // Check if user is updating their own profile
    if (req.user.userId !== req.params.userId && req.user.id !== req.params.userId && req.user._id?.toString() !== req.params.userId) {
      return res.status(403).json({ error: 'Unauthorized to update this profile' });
    }
    
    const allowedUpdates = ['fullName', 'username', 'bio', 'location', 'occupation', 'interests'];
    const updates = {};
    
    // Check if username is being updated and if it's unique
    if (req.body.username && req.body.username !== req.user.username) {
      const existingUser = await User.findOne({ username: req.body.username });
      if (existingUser) {
        return res.status(400).json({ error: 'Username already taken' });
      }
    }
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });
    
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      updates,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: error.message || 'Failed to update profile' });
  }
});

// Legacy endpoint for backwards compatibility
router.patch('/:userId', authMiddleware, async (req, res) => {
  // Redirect to the new endpoint
  req.url = `${req.url}/profile`;
  router.handle(req, res);
});

module.exports = router;