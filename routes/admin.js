const express = require('express');
const router = express.Router();
const User = require('../models/User');
const ForumPost = require('../models/ForumPost');
const Event = require('../models/Event');
const Settings = require('../models/Settings');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const { startOfDay, startOfWeek, startOfMonth, subDays } = require('date-fns');

// Apply authentication and admin middleware to all routes
router.use(authMiddleware);
router.use(adminMiddleware);

// Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const today = startOfDay(new Date());
    const thisWeek = startOfWeek(new Date());
    const thisMonth = startOfMonth(new Date());

    // Get user statistics
    const totalUsers = await User.countDocuments();
    const newUsersToday = await User.countDocuments({ joinedDate: { $gte: today } });
    const activeUsers = await User.countDocuments({ lastActive: { $gte: subDays(new Date(), 7) } });

    // Get post statistics
    const totalPosts = await ForumPost.countDocuments();
    const postsToday = await ForumPost.countDocuments({ createdAt: { $gte: today } });
    
    // Get flagged content
    const flaggedContent = await ForumPost.countDocuments({ 
      $or: [
        { flaggedForReview: true },
        { flagCount: { $gt: 0 } }
      ]
    });

    // Get events
    const totalEvents = await Event.countDocuments().catch(() => 0);

    // Get pending reports (placeholder)
    const pendingReports = 0;

    res.json({
      totalUsers,
      newUsersToday,
      activeUsers,
      totalPosts,
      postsToday,
      flaggedContent,
      totalEvents,
      pendingReports
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Get analytics data
router.get('/analytics', async (req, res) => {
  try {
    const userGrowth = [];
    const postActivity = [];
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    // User growth data (last 7 days)
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const nextDate = subDays(new Date(), i - 1);

      const count = await User.countDocuments({
        joinedDate: {
          $gte: startOfDay(date),
          $lt: startOfDay(nextDate)
        }
      });

      userGrowth.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        users: count
      });
    }

    // Post activity (last 7 days) - Real data
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const nextDate = subDays(new Date(), i - 1);

      const posts = await ForumPost.countDocuments({
        createdAt: {
          $gte: startOfDay(date),
          $lt: startOfDay(nextDate)
        }
      });

      // Count replies
      const postsWithReplies = await ForumPost.find({
        'replies.createdAt': {
          $gte: startOfDay(date),
          $lt: startOfDay(nextDate)
        }
      });

      let replies = 0;
      postsWithReplies.forEach(post => {
        if (post.replies) {
          replies += post.replies.filter(reply => {
            const replyDate = new Date(reply.createdAt);
            return replyDate >= startOfDay(date) && replyDate < startOfDay(nextDate);
          }).length;
        }
      });

      postActivity.push({
        day: days[6 - i],
        posts,
        replies
      });
    }

    // Top categories - Real data from actual posts
    const categoryStats = await ForumPost.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    const topCategories = categoryStats.map(stat => ({
      name: stat._id.charAt(0).toUpperCase() + stat._id.slice(1).replace(/-/g, ' '),
      value: stat.count
    }));

    // User engagement metrics
    const totalPosts = await ForumPost.countDocuments();
    const totalUsers = await User.countDocuments();
    const averagePostsPerUser = totalUsers > 0 ? (totalPosts / totalUsers).toFixed(1) : 0;

    // Get most active users
    const mostActiveUsers = await ForumPost.aggregate([
      {
        $group: {
          _id: '$author',
          postCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          username: '$user.username',
          postCount: 1
        }
      },
      {
        $sort: { postCount: -1 }
      },
      {
        $limit: 5
      }
    ]);

    const userEngagement = mostActiveUsers.map(user => ({
      username: user.username,
      posts: user.postCount,
      engagement: Math.min(100, (user.postCount / Math.max(1, totalPosts / totalUsers)) * 20)
    }));

    res.json({
      userGrowth,
      postActivity,
      topCategories,
      userEngagement,
      summary: {
        averagePostsPerUser: parseFloat(averagePostsPerUser),
        totalCategories: categoryStats.length,
        mostActiveCategory: topCategories[0]?.name || 'None'
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Get all users with pagination and filters
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search, status } = req.query;
    
    const query = {};
    
    if (role && role !== 'all') {
      query.role = role;
    }
    
    if (status === 'banned') {
      query.isBanned = true;
    }
    
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { fullName: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ joinedDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await User.countDocuments(query);

    // Add post and reply counts for each user
    const usersWithStats = await Promise.all(users.map(async (user) => {
      const posts = await ForumPost.countDocuments({ author: user._id });
      const allPosts = await ForumPost.find({});
      let replies = 0;
      
      allPosts.forEach(post => {
        if (post.replies) {
          replies += post.replies.filter(r => r.author?.toString() === user._id.toString()).length;
        }
      });

      return {
        ...user.toObject(),
        posts,
        replies
      };
    }));

    res.json({
      users: usersWithStats,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Update user role
router.patch('/users/:userId/role', async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['user', 'moderator', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User role updated', user });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

// Ban/unban user
router.patch('/users/:userId/ban', async (req, res) => {
  try {
    const { ban } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { isBanned: ban },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ 
      message: ban ? 'User banned successfully' : 'User unbanned successfully',
      user 
    });
  } catch (error) {
    console.error('Error updating user ban status:', error);
    res.status(500).json({ error: 'Failed to update user ban status' });
  }
});

// Delete user
router.delete('/users/:userId', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Also delete user's posts
    await ForumPost.deleteMany({ author: req.params.userId });

    res.json({ message: 'User and associated content deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Get flagged content
router.get('/flagged-content', async (req, res) => {
  try {
    const posts = await ForumPost.find({
      $or: [
        { flaggedForReview: true },
        { flagCount: { $gt: 0 } }
      ]
    })
    .populate('author', 'username email')
    .sort({ flagCount: -1, createdAt: -1 })
    .limit(20);

    // Get moderation queue (placeholder)
    const queue = [];

    res.json({
      posts,
      queue
    });
  } catch (error) {
    console.error('Error fetching flagged content:', error);
    res.status(500).json({ error: 'Failed to fetch flagged content' });
  }
});

// Approve post
router.patch('/posts/:postId/approve', async (req, res) => {
  try {
    const post = await ForumPost.findByIdAndUpdate(
      req.params.postId,
      {
        flaggedForReview: false,
        flagCount: 0,
        moderationReport: null
      },
      { new: true }
    );

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json({ message: 'Post approved', post });
  } catch (error) {
    console.error('Error approving post:', error);
    res.status(500).json({ error: 'Failed to approve post' });
  }
});

// Reject/delete post
router.delete('/posts/:postId', async (req, res) => {
  try {
    const post = await ForumPost.findByIdAndDelete(req.params.postId);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

// Get system settings
router.get('/settings', async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Update system settings
router.patch('/settings', async (req, res) => {
  try {
    const { siteName, contactEmail, registration, autoModerate, emailVerification, spamProtection } = req.body;

    const updateData = {};
    if (siteName !== undefined) updateData.siteName = siteName;
    if (contactEmail !== undefined) updateData.contactEmail = contactEmail;
    if (registration !== undefined) updateData.registration = registration;
    if (autoModerate !== undefined) updateData.autoModerate = autoModerate;
    if (emailVerification !== undefined) updateData.emailVerification = emailVerification;
    if (spamProtection !== undefined) updateData.spamProtection = spamProtection;

    const settings = await Settings.updateSettings(updateData);
    res.json({ message: 'Settings updated successfully', settings });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

module.exports = router;