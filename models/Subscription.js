const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  type: {
    type: String,
    enum: ['blog', 'events', 'all'],
    default: 'blog'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  subscribedAt: {
    type: Date,
    default: Date.now
  },
  unsubscribedAt: {
    type: Date,
    default: null
  },
  unsubscribeToken: {
    type: String,
    unique: true,
    sparse: true,
    index: true
  },
  preferences: {
    frequency: {
      type: String,
      enum: ['immediate', 'daily', 'weekly'],
      default: 'weekly'
    },
    categories: [{
      type: String
    }]
  },
  metadata: {
    source: {
      type: String,
      default: 'website'
    },
    ipAddress: String,
    userAgent: String
  }
}, {
  timestamps: true
});

// Generate unsubscribe token before saving
subscriptionSchema.pre('save', function(next) {
  if (!this.unsubscribeToken) {
    this.unsubscribeToken = require('crypto').randomBytes(32).toString('hex');
  }
  next();
});

// Index for better query performance
subscriptionSchema.index({ email: 1, isActive: 1 });

module.exports = mongoose.model('Subscription', subscriptionSchema);