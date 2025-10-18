const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://localhost:3003',
      process.env.CLIENT_URL,
      process.env.FRONTEND_URL,
      // Add your production and Vercel frontend URLs
      'https://www.frankfurtindians.com',
      'https://frankfurtindians.com',
      'https://indians-frankfurt-hub.vercel.app',
      'https://indians-frankfurt-hub-*.vercel.app'
    ].filter(Boolean);
    
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);
    
    // Check if origin is allowed
    if (allowedOrigins.indexOf(origin) !== -1 || origin.includes('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
const authRoutes = require('./routes/auth');
const forumRoutes = require('./routes/forum');
const eventsRoutes = require('./routes/events');
const resourcesRoutes = require('./routes/resources');
const usersRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const ogImageRoutes = require('./routes/ogImage');
const sitemapRoutes = require('./routes/sitemap');
const blogRoutes = require('./routes/blog');
const subscriptionRoutes = require('./routes/subscription');

app.use('/api/auth', authRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/resources', resourcesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/og', ogImageRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/subscription', subscriptionRoutes);

// Sitemap routes (no /api prefix for SEO)
app.use('/', sitemapRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Indians in Frankfurt Hub API is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
}); 
