const { SitemapStream, streamToPromise } = require('sitemap');
const { Readable } = require('stream');
const ForumPost = require('../models/ForumPost');
const Event = require('../models/Event');
const User = require('../models/User');

class SitemapGenerator {
  constructor() {
    this.baseUrl = process.env.SITE_URL || 'https://www.frankfurtindians.com';
  }

  async generateSitemap() {
    try {
      // Fetch all public content
      const [forumPosts, events, users] = await Promise.all([
        ForumPost.find({ isLocked: false }).select('_id updatedAt category').lean(),
        Event.find({ status: 'published' }).select('_id updatedAt').lean(),
        User.find({ isActive: true }).select('_id updatedAt').lean()
      ]);

      // Create sitemap links
      const links = [];

      // Static pages with high priority
      links.push(
        { url: '/', changefreq: 'daily', priority: 1.0 },
        { url: '/forum', changefreq: 'daily', priority: 0.9 },
        { url: '/events', changefreq: 'weekly', priority: 0.9 },
        { url: '/resources', changefreq: 'weekly', priority: 0.8 },
        { url: '/resources/settling-in', changefreq: 'monthly', priority: 0.7 },
        { url: '/resources/jobs', changefreq: 'weekly', priority: 0.8 },
        { url: '/resources/housing', changefreq: 'weekly', priority: 0.8 },
        { url: '/resources/healthcare', changefreq: 'monthly', priority: 0.7 },
        { url: '/resources/education', changefreq: 'monthly', priority: 0.7 },
        { url: '/resources/legal', changefreq: 'monthly', priority: 0.6 },
        { url: '/login', changefreq: 'yearly', priority: 0.3 },
        { url: '/register', changefreq: 'yearly', priority: 0.4 },
        { url: '/privacy-policy', changefreq: 'yearly', priority: 0.2 },
        { url: '/terms-and-conditions', changefreq: 'yearly', priority: 0.2 }
      );

      // Forum posts
      forumPosts.forEach(post => {
        links.push({
          url: `/forum/post/${post._id}`,
          lastmod: post.updatedAt,
          changefreq: 'weekly',
          priority: 0.6,
          img: [
            {
              url: `${this.baseUrl}/api/og/forum/${post._id}`,
              title: 'Forum post image',
            }
          ]
        });
      });

      // Events
      events.forEach(event => {
        links.push({
          url: `/events/${event._id}`,
          lastmod: event.updatedAt,
          changefreq: 'weekly',
          priority: 0.7,
          img: [
            {
              url: `${this.baseUrl}/api/og/event/${event._id}`,
              title: 'Event image',
            }
          ]
        });
      });

      // User profiles (only public profiles)
      users.forEach(user => {
        links.push({
          url: `/profile/${user._id}`,
          lastmod: user.updatedAt,
          changefreq: 'monthly',
          priority: 0.4
        });
      });

      // Create a stream to write to
      const stream = new SitemapStream({ 
        hostname: this.baseUrl,
        cacheTime: 600000, // 10 min cache
        xmlns: {
          image: true,
          video: false,
          news: false
        }
      });

      // Return sitemap XML
      const data = await streamToPromise(Readable.from(links).pipe(stream));
      return data.toString();
    } catch (error) {
      console.error('Error generating sitemap:', error);
      throw error;
    }
  }

  async generateNewsSitemap() {
    try {
      // Fetch recent forum posts (last 2 days)
      const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
      const recentPosts = await ForumPost.find({
        isLocked: false,
        createdAt: { $gte: twoDaysAgo }
      })
      .populate('author', 'name')
      .select('_id title content category createdAt author tags')
      .lean();

      const links = recentPosts.map(post => ({
        url: `/forum/post/${post._id}`,
        news: {
          publication: {
            name: 'Frankfurt Indians',
            language: 'en'
          },
          publication_date: post.createdAt.toISOString(),
          title: post.title,
          keywords: post.tags?.join(', ') || post.category
        }
      }));

      const stream = new SitemapStream({ 
        hostname: this.baseUrl,
        xmlns: {
          news: true,
          image: false,
          video: false
        }
      });

      const data = await streamToPromise(Readable.from(links).pipe(stream));
      return data.toString();
    } catch (error) {
      console.error('Error generating news sitemap:', error);
      throw error;
    }
  }

  async generateImageSitemap() {
    try {
      const [forumPosts, events] = await Promise.all([
        ForumPost.find({ isLocked: false }).select('_id title').lean(),
        Event.find({ status: 'published' }).select('_id title').lean()
      ]);

      const links = [];

      // Forum post images
      forumPosts.forEach(post => {
        links.push({
          url: `/forum/post/${post._id}`,
          img: [
            {
              url: `${this.baseUrl}/api/og/forum/${post._id}`,
              caption: post.title,
              title: post.title,
              license: 'https://creativecommons.org/licenses/by/4.0/'
            }
          ]
        });
      });

      // Event images
      events.forEach(event => {
        links.push({
          url: `/events/${event._id}`,
          img: [
            {
              url: `${this.baseUrl}/api/og/event/${event._id}`,
              caption: event.title,
              title: event.title,
              license: 'https://creativecommons.org/licenses/by/4.0/'
            }
          ]
        });
      });

      const stream = new SitemapStream({ 
        hostname: this.baseUrl,
        xmlns: {
          image: true,
          video: false,
          news: false
        }
      });

      const data = await streamToPromise(Readable.from(links).pipe(stream));
      return data.toString();
    } catch (error) {
      console.error('Error generating image sitemap:', error);
      throw error;
    }
  }

  generateSitemapIndex() {
    const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${this.baseUrl}/sitemap.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${this.baseUrl}/sitemap-news.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${this.baseUrl}/sitemap-images.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
</sitemapindex>`;

    return sitemapIndex;
  }
}

module.exports = new SitemapGenerator();