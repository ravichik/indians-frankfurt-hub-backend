const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  siteName: {
    type: String,
    default: 'Indians in Frankfurt Hub'
  },
  contactEmail: {
    type: String,
    default: 'admin@indiansfrankfurt.com'
  },
  registration: {
    type: String,
    enum: ['open', 'approval', 'closed'],
    default: 'open'
  },
  autoModerate: {
    type: Boolean,
    default: true
  },
  emailVerification: {
    type: Boolean,
    default: true
  },
  spamProtection: {
    type: Boolean,
    default: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure only one settings document exists
settingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

settingsSchema.statics.updateSettings = async function(updates) {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create(updates);
  } else {
    Object.assign(settings, updates);
    settings.updatedAt = new Date();
    await settings.save();
  }
  return settings;
};

module.exports = mongoose.model('Settings', settingsSchema);