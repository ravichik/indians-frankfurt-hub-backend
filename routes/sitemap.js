const express = require('express');
const router = express.Router();
const sitemapGenerator = require('../services/sitemapGenerator');

// Cache sitemaps for 1 hour
const CACHE_DURATION = 60 * 60 * 1000;
let sitemapCache = {
  main: { data: null, timestamp: 0 },
  news: { data: null, timestamp: 0 },
  images: { data: null, timestamp: 0 },
  index: { data: null, timestamp: 0 }
};

// Helper function to check cache
const getCachedOrGenerate = async (type, generator) => {
  const now = Date.now();
  const cache = sitemapCache[type];
  
  if (cache.data && (now - cache.timestamp) < CACHE_DURATION) {
    return cache.data;
  }
  
  const data = await generator();
  sitemapCache[type] = { data, timestamp: now };
  return data;
};

// Main sitemap
router.get('/sitemap.xml', async (req, res) => {
  try {
    const sitemap = await getCachedOrGenerate('main', () => 
      sitemapGenerator.generateSitemap()
    );
    
    res.header('Content-Type', 'application/xml');
    res.header('Cache-Control', 'public, max-age=3600');
    res.send(sitemap);
  } catch (error) {
    console.error('Error serving sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
});

// News sitemap
router.get('/sitemap-news.xml', async (req, res) => {
  try {
    const sitemap = await getCachedOrGenerate('news', () => 
      sitemapGenerator.generateNewsSitemap()
    );
    
    res.header('Content-Type', 'application/xml');
    res.header('Cache-Control', 'public, max-age=3600');
    res.send(sitemap);
  } catch (error) {
    console.error('Error serving news sitemap:', error);
    res.status(500).send('Error generating news sitemap');
  }
});

// Image sitemap
router.get('/sitemap-images.xml', async (req, res) => {
  try {
    const sitemap = await getCachedOrGenerate('images', () => 
      sitemapGenerator.generateImageSitemap()
    );
    
    res.header('Content-Type', 'application/xml');
    res.header('Cache-Control', 'public, max-age=3600');
    res.send(sitemap);
  } catch (error) {
    console.error('Error serving image sitemap:', error);
    res.status(500).send('Error generating image sitemap');
  }
});

// Sitemap index
router.get('/sitemap-index.xml', async (req, res) => {
  try {
    const sitemapIndex = await getCachedOrGenerate('index', () => 
      Promise.resolve(sitemapGenerator.generateSitemapIndex())
    );
    
    res.header('Content-Type', 'application/xml');
    res.header('Cache-Control', 'public, max-age=3600');
    res.send(sitemapIndex);
  } catch (error) {
    console.error('Error serving sitemap index:', error);
    res.status(500).send('Error generating sitemap index');
  }
});

// Force refresh all sitemaps (admin only)
router.post('/refresh-sitemaps', async (req, res) => {
  try {
    // Clear cache
    sitemapCache = {
      main: { data: null, timestamp: 0 },
      news: { data: null, timestamp: 0 },
      images: { data: null, timestamp: 0 },
      index: { data: null, timestamp: 0 }
    };
    
    // Pre-generate all sitemaps
    await Promise.all([
      getCachedOrGenerate('main', () => sitemapGenerator.generateSitemap()),
      getCachedOrGenerate('news', () => sitemapGenerator.generateNewsSitemap()),
      getCachedOrGenerate('images', () => sitemapGenerator.generateImageSitemap()),
      getCachedOrGenerate('index', () => Promise.resolve(sitemapGenerator.generateSitemapIndex()))
    ]);
    
    res.json({ 
      success: true, 
      message: 'All sitemaps refreshed successfully' 
    });
  } catch (error) {
    console.error('Error refreshing sitemaps:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error refreshing sitemaps' 
    });
  }
});

module.exports = router;