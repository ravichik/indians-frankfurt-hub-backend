const express = require('express');
const router = express.Router();
const BlogPost = require('../models/BlogPost');
const { authMiddleware: auth } = require('../middleware/auth');

// Get all published blog posts (public)
router.get('/posts', async (req, res) => {
  try {
    const { 
      category, 
      tag, 
      search, 
      page = 1, 
      limit = 9,
      featured 
    } = req.query;

    const query = { status: 'published' };
    
    if (category) query.category = category;
    if (tag) query.tags = { $in: [tag] };
    if (featured === 'true') query.isFeatured = true;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    const posts = await BlogPost.find(query)
      .populate('author', 'name avatar')
      .sort({ publishedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-content -comments');

    const count = await BlogPost.countDocuments(query);

    res.json({
      posts,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalPosts: count
    });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    res.status(500).json({ message: 'Error fetching blog posts' });
  }
});

// Get single blog post by slug (public)
router.get('/posts/:slug', async (req, res) => {
  try {
    const post = await BlogPost.findOne({ 
      slug: req.params.slug,
      status: 'published'
    })
    .populate('author', 'name avatar bio')
    .populate('comments.author', 'name avatar');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Increment view count
    post.views = (post.views || 0) + 1;
    await post.save();

    res.json(post);
  } catch (error) {
    console.error('Error fetching blog post:', error);
    res.status(500).json({ message: 'Error fetching blog post' });
  }
});

// Get related posts (public)
router.get('/posts/:slug/related', async (req, res) => {
  try {
    const currentPost = await BlogPost.findOne({ slug: req.params.slug });
    if (!currentPost) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const relatedPosts = await BlogPost.find({
      _id: { $ne: currentPost._id },
      status: 'published',
      $or: [
        { category: currentPost.category },
        { tags: { $in: currentPost.tags } }
      ]
    })
    .populate('author', 'name')
    .limit(3)
    .select('title slug excerpt featuredImage publishedAt readingTime');

    res.json(relatedPosts);
  } catch (error) {
    console.error('Error fetching related posts:', error);
    res.status(500).json({ message: 'Error fetching related posts' });
  }
});

// Create new blog post (admin only)
router.post('/posts', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can create blog posts' });
    }

    // Generate slug if not provided
    let slug = req.body.slug;
    if (!slug && req.body.title) {
      slug = req.body.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      
      // Add timestamp to ensure uniqueness
      slug = `${slug}-${Date.now()}`;
    }

    const blogPost = new BlogPost({
      ...req.body,
      slug,
      author: req.user.userId
    });

    await blogPost.save();
    await blogPost.populate('author', 'name avatar');

    res.status(201).json(blogPost);
  } catch (error) {
    console.error('Error creating blog post:', error);
    res.status(500).json({ message: 'Error creating blog post', error: error.message });
  }
});

// Update blog post (admin only)
router.put('/posts/:id', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can update blog posts' });
    }

    // If updating title and no slug provided, generate new slug
    if (req.body.title && !req.body.slug) {
      const existingPost = await BlogPost.findById(req.params.id);
      if (existingPost && existingPost.title !== req.body.title) {
        req.body.slug = req.body.title
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim();
        
        // Add timestamp to ensure uniqueness if slug changed
        req.body.slug = `${req.body.slug}-${Date.now()}`;
      }
    }

    const post = await BlogPost.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('author', 'name avatar');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    console.error('Error updating blog post:', error);
    res.status(500).json({ message: 'Error updating blog post', error: error.message });
  }
});

// Delete blog post (admin only)
router.delete('/posts/:id', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can delete blog posts' });
    }

    const post = await BlogPost.findByIdAndDelete(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    res.status(500).json({ message: 'Error deleting blog post' });
  }
});

// Like/unlike a blog post
router.post('/posts/:id/like', auth, async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const userIndex = post.likes.indexOf(req.user.userId);
    
    if (userIndex > -1) {
      // Unlike
      post.likes.splice(userIndex, 1);
    } else {
      // Like
      post.likes.push(req.user.userId);
    }

    await post.save();
    res.json({ likes: post.likes.length, liked: userIndex === -1 });
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({ message: 'Error updating like status' });
  }
});

// Add comment to blog post
router.post('/posts/:id/comments', auth, async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (!post.allowComments) {
      return res.status(403).json({ message: 'Comments are disabled for this post' });
    }

    post.comments.push({
      content: req.body.content,
      author: req.user.userId
    });

    await post.save();
    await post.populate('comments.author', 'name avatar');

    res.status(201).json(post.comments[post.comments.length - 1]);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Error adding comment' });
  }
});

// Get single post for admin editing (including drafts)
router.get('/admin/posts/:id', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const post = await BlogPost.findById(req.params.id)
      .populate('author', 'name avatar');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    console.error('Error fetching post for edit:', error);
    res.status(500).json({ message: 'Error fetching post' });
  }
});

// Get all posts for admin (including drafts)
router.get('/admin/posts', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const posts = await BlogPost.find()
      .populate('author', 'name')
      .sort({ createdAt: -1 })
      .select('-content -comments');

    res.json(posts);
  } catch (error) {
    console.error('Error fetching admin posts:', error);
    res.status(500).json({ message: 'Error fetching posts' });
  }
});

// Get blog statistics (admin only)
router.get('/admin/stats', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const totalPosts = await BlogPost.countDocuments();
    const publishedPosts = await BlogPost.countDocuments({ status: 'published' });
    const draftPosts = await BlogPost.countDocuments({ status: 'draft' });
    const totalViews = await BlogPost.aggregate([
      { $group: { _id: null, total: { $sum: '$views' } } }
    ]);
    const totalLikes = await BlogPost.aggregate([
      { $group: { _id: null, total: { $sum: { $size: '$likes' } } } }
    ]);

    res.json({
      totalPosts,
      publishedPosts,
      draftPosts,
      totalViews: totalViews[0]?.total || 0,
      totalLikes: totalLikes[0]?.total || 0
    });
  } catch (error) {
    console.error('Error fetching blog stats:', error);
    res.status(500).json({ message: 'Error fetching statistics' });
  }
});

module.exports = router;