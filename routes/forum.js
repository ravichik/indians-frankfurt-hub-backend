const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const ForumPost = require('../models/ForumPost');
const { authMiddleware, moderatorMiddleware } = require('../middleware/auth');
const { moderateContentMiddleware } = require('../services/contentModeration');

router.get('/posts', async (req, res) => {
  try {
    const { category, page = 1, limit = 10 } = req.query;
    const query = category ? { category } : {};
    
    const posts = await ForumPost.find(query)
      .populate('author', 'username fullName avatar')
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await ForumPost.countDocuments(query);

    res.json({
      posts,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/posts/:id', async (req, res) => {
  try {
    const post = await ForumPost.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    )
    .populate('author', 'username fullName avatar')
    .populate('replies.author', 'username fullName avatar');

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/posts', authMiddleware, moderateContentMiddleware, [
  body('title').notEmpty().trim(),
  body('content').notEmpty(),
  body('category').isIn(['settling-in', 'cultural-events', 'jobs', 'housing', 'general', 'marketplace'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, content, category, tags } = req.body;

    const post = new ForumPost({
      title,
      content,
      category,
      tags: tags || [],
      author: req.user.userId
    });

    await post.save();
    await post.populate('author', 'username fullName avatar');
    
    // Update user's contribution stats
    const User = require('../models/User');
    await User.findByIdAndUpdate(req.user.userId, {
      $inc: { 
        'contributions.postsCreated': 1,
        'contributions.points': 5
      },
      'contributions.lastContribution': new Date()
    });

    res.status(201).json({
      message: 'Post created successfully',
      post
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/posts/:id/reply', authMiddleware, moderateContentMiddleware, [
  body('content').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const post = await ForumPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.isLocked) {
      return res.status(403).json({ error: 'This post is locked' });
    }

    post.replies.push({
      content: req.body.content,
      author: req.user.userId
    });

    await post.save();
    await post.populate('replies.author', 'username fullName avatar');

    res.status(201).json({
      message: 'Reply added successfully',
      reply: post.replies[post.replies.length - 1]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update post (admin/moderator or author only)
router.patch('/posts/:id', authMiddleware, moderateContentMiddleware, async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if user is admin/moderator or post author
    const isAdmin = req.user.role === 'admin';
    const isModerator = req.user.role === 'moderator';
    const isAuthor = post.author.toString() === req.user.userId;

    if (!isAdmin && !isModerator && !isAuthor) {
      return res.status(403).json({ error: 'Not authorized to edit this post' });
    }

    const { title, content, category, tags } = req.body;
    
    // Update basic fields
    if (title) post.title = title;
    if (content) post.content = content;
    
    // Allow admin/moderator to update category and tags
    if (isAdmin || isModerator) {
      if (category !== undefined) post.category = category;
      if (tags !== undefined) post.tags = tags;
    }
    
    post.lastEdited = new Date();
    post.editedBy = req.user.userId;

    await post.save();
    await post.populate('author', 'username fullName avatar');

    res.json({ message: 'Post updated successfully', post });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete post (admin/moderator only)
router.delete('/posts/:id', authMiddleware, async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if user is admin/moderator
    const isAdmin = req.user.role === 'admin';
    const isModerator = req.user.role === 'moderator';

    if (!isAdmin && !isModerator) {
      return res.status(403).json({ error: 'Not authorized to delete this post' });
    }

    await ForumPost.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Thank a post
router.post('/posts/:id/thank', authMiddleware, async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id)
      .populate('author', 'username fullName contributions');
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const userId = req.user.userId;
    
    // Check if user already thanked this post
    const alreadyThanked = post.thanks.includes(userId);
    
    if (alreadyThanked) {
      // Remove thank
      post.thanks = post.thanks.filter(id => id.toString() !== userId);
      
      // Update author's contribution points
      const User = require('../models/User');
      await User.findByIdAndUpdate(post.author._id, {
        $inc: { 
          'contributions.thanksReceived': -1,
          'contributions.points': -2
        }
      });
      
      await post.save();
      res.json({ 
        message: 'Thank removed', 
        thanked: false,
        thanksCount: post.thanks.length 
      });
    } else {
      // Add thank
      post.thanks.push(userId);
      
      // Update author's contribution points
      const User = require('../models/User');
      const updatedAuthor = await User.findByIdAndUpdate(
        post.author._id, 
        {
          $inc: { 
            'contributions.thanksReceived': 1,
            'contributions.points': 2
          },
          'contributions.lastContribution': new Date()
        },
        { new: true }
      );
      
      // Check and update level based on points
      const points = updatedAuthor.contributions.points;
      let newLevel = 'Newcomer';
      if (points >= 100) newLevel = 'Champion';
      else if (points >= 50) newLevel = 'Expert';
      else if (points >= 25) newLevel = 'Contributor';
      else if (points >= 10) newLevel = 'Member';
      
      if (updatedAuthor.contributions.level !== newLevel) {
        updatedAuthor.contributions.level = newLevel;
        await updatedAuthor.save();
      }
      
      await post.save();
      res.json({ 
        message: 'Thank you added!', 
        thanked: true,
        thanksCount: post.thanks.length 
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark post as solution (admin/moderator or original author)
router.patch('/posts/:id/solution', authMiddleware, async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const isAdmin = req.user.role === 'admin';
    const isModerator = req.user.role === 'moderator';
    
    if (!isAdmin && !isModerator) {
      return res.status(403).json({ error: 'Not authorized to mark as solution' });
    }

    post.isSolution = !post.isSolution;
    
    if (post.isSolution) {
      // Award points to solution provider
      const User = require('../models/User');
      await User.findByIdAndUpdate(post.author, {
        $inc: { 
          'contributions.solutionsProvided': 1,
          'contributions.points': 10
        }
      });
    }
    
    await post.save();
    res.json({ 
      message: post.isSolution ? 'Marked as solution' : 'Unmarked as solution',
      isSolution: post.isSolution
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete reply (admin/moderator only)
router.delete('/posts/:postId/reply/:replyId', authMiddleware, async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if user is admin/moderator
    const isAdmin = req.user.role === 'admin';
    const isModerator = req.user.role === 'moderator';

    if (!isAdmin && !isModerator) {
      return res.status(403).json({ error: 'Not authorized to delete replies' });
    }

    // Remove the reply
    post.replies = post.replies.filter(
      reply => reply._id.toString() !== req.params.replyId
    );

    await post.save();
    res.json({ message: 'Reply deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/posts/:id/like', authMiddleware, async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const userIndex = post.likes.indexOf(req.user.userId);
    if (userIndex > -1) {
      post.likes.splice(userIndex, 1);
    } else {
      post.likes.push(req.user.userId);
    }

    await post.save();
    res.json({ likes: post.likes.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/posts/:id/lock', [authMiddleware, moderatorMiddleware], async (req, res) => {
  try {
    const post = await ForumPost.findByIdAndUpdate(
      req.params.id,
      { isLocked: req.body.isLocked },
      { new: true }
    );

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json({ message: 'Post lock status updated', isLocked: post.isLocked });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Pin/Unpin post (admin only)
router.patch('/posts/:id/pin', authMiddleware, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can pin/unpin posts' });
    }

    const post = await ForumPost.findByIdAndUpdate(
      req.params.id,
      { isPinned: req.body.isPinned },
      { new: true }
    ).populate('author', 'username fullName avatar');

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json({ 
      message: `Post ${req.body.isPinned ? 'pinned' : 'unpinned'} successfully`, 
      post 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;