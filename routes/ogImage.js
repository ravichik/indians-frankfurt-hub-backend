const express = require('express');
const router = express.Router();
const ogImageGenerator = require('../services/ogImageGenerator');
const ForumPost = require('../models/ForumPost');
const Event = require('../models/Event');
const User = require('../models/User');

// Cache generated images for 7 days
const CACHE_DURATION = 7 * 24 * 60 * 60;

// Generate default OG image
router.get('/default', async (req, res) => {
  try {
    const image = await ogImageGenerator.generateImage({
      title: 'Frankfurt Indians',
      subtitle: 'Connect with the Indian Community in Frankfurt',
      category: 'COMMUNITY'
    });

    res.set({
      'Content-Type': 'image/png',
      'Cache-Control': `public, max-age=${CACHE_DURATION}`,
    });
    res.send(image);
  } catch (error) {
    console.error('Error generating default OG image:', error);
    res.status(500).send('Error generating image');
  }
});

// Generate OG image for forum posts
router.get('/forum/:postId', async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.postId)
      .populate('author', 'name');

    if (!post) {
      return res.status(404).send('Post not found');
    }

    const image = await ogImageGenerator.generateForumPostImage(post);

    res.set({
      'Content-Type': 'image/png',
      'Cache-Control': `public, max-age=${CACHE_DURATION}`,
    });
    res.send(image);
  } catch (error) {
    console.error('Error generating forum OG image:', error);
    res.status(500).send('Error generating image');
  }
});

// Generate OG image for events
router.get('/event/:eventId', async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);

    if (!event) {
      return res.status(404).send('Event not found');
    }

    const image = await ogImageGenerator.generateEventImage(event);

    res.set({
      'Content-Type': 'image/png',
      'Cache-Control': `public, max-age=${CACHE_DURATION}`,
    });
    res.send(image);
  } catch (error) {
    console.error('Error generating event OG image:', error);
    res.status(500).send('Error generating image');
  }
});

// Generate OG image for user profiles
router.get('/profile/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('name createdAt');

    if (!user) {
      return res.status(404).send('User not found');
    }

    const image = await ogImageGenerator.generateProfileImage(user);

    res.set({
      'Content-Type': 'image/png',
      'Cache-Control': `public, max-age=${CACHE_DURATION}`,
    });
    res.send(image);
  } catch (error) {
    console.error('Error generating profile OG image:', error);
    res.status(500).send('Error generating image');
  }
});

// Generate custom OG image with query parameters
router.get('/custom', async (req, res) => {
  try {
    const {
      title = 'Frankfurt Indians',
      subtitle = '',
      category = '',
      author = '',
      bgColor,
      accentColor,
      textColor
    } = req.query;

    const customColors = {};
    if (bgColor) customColors.bg = `#${bgColor}`;
    if (accentColor) customColors.accent = `#${accentColor}`;
    if (textColor) customColors.text = `#${textColor}`;

    const image = await ogImageGenerator.generateImage({
      title,
      subtitle,
      category,
      author,
      customColors: Object.keys(customColors).length > 0 ? customColors : undefined
    });

    res.set({
      'Content-Type': 'image/png',
      'Cache-Control': `public, max-age=${CACHE_DURATION}`,
    });
    res.send(image);
  } catch (error) {
    console.error('Error generating custom OG image:', error);
    res.status(500).send('Error generating image');
  }
});

module.exports = router;