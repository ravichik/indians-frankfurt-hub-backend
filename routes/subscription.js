const express = require('express');
const router = express.Router();
const Subscription = require('../models/Subscription');
const nodemailer = require('nodemailer');

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'indiansfrankfurthub@gmail.com',
    pass: process.env.EMAIL_PASS
  }
});

// Subscribe endpoint
router.post('/subscribe', async (req, res) => {
  try {
    const { email, type = 'blog', preferences = {} } = req.body;

    // Check if email is already subscribed
    const existingSubscription = await Subscription.findOne({ email });

    if (existingSubscription) {
      if (existingSubscription.isActive) {
        return res.status(400).json({ 
          success: false, 
          message: 'This email is already subscribed!' 
        });
      } else {
        // Reactivate subscription
        existingSubscription.isActive = true;
        existingSubscription.subscribedAt = new Date();
        existingSubscription.unsubscribedAt = null;
        await existingSubscription.save();

        return res.json({ 
          success: true, 
          message: 'Welcome back! Your subscription has been reactivated.' 
        });
      }
    }

    // Create new subscription
    const subscription = new Subscription({
      email,
      type,
      preferences,
      metadata: {
        source: 'website',
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    });

    await subscription.save();

    // Send welcome email
    try {
      const welcomeEmail = {
        from: process.env.EMAIL_USER || 'indiansfrankfurthub@gmail.com',
        to: email,
        subject: 'Welcome to Frankfurt Indians Newsletter!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #FF9933 0%, #138808 100%); padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">Frankfurt Indians</h1>
            </div>
            <div style="padding: 20px; background: #f9fafb;">
              <h2 style="color: #1a202c;">Welcome to our Newsletter!</h2>
              <p style="color: #4a5568; line-height: 1.6;">
                Thank you for subscribing to the Frankfurt Indians newsletter. 
                You'll now receive the latest updates about:
              </p>
              <ul style="color: #4a5568; line-height: 1.8;">
                <li>New blog posts and articles</li>
                <li>Upcoming Indian events in Frankfurt</li>
                <li>Community news and announcements</li>
                <li>Resources and tips for Indian expats</li>
              </ul>
              <p style="color: #4a5568; line-height: 1.6;">
                Stay connected with the Indian community in Frankfurt!
              </p>
              <div style="text-align: center; margin-top: 30px;">
                <a href="https://www.frankfurtindians.com/blog" 
                   style="display: inline-block; background: #FF9933; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px;">
                  Visit Our Blog
                </a>
              </div>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              <p style="color: #94a3b8; font-size: 12px; text-align: center;">
                You're receiving this because you subscribed at frankfurtindians.com<br>
                <a href="https://www.frankfurtindians.com/unsubscribe?token=${subscription.unsubscribeToken}" 
                   style="color: #94a3b8;">
                  Unsubscribe
                </a>
              </p>
            </div>
          </div>
        `
      };

      await transporter.sendMail(welcomeEmail);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail the subscription if email fails
    }

    res.status(201).json({ 
      success: true, 
      message: 'Successfully subscribed! Check your email for confirmation.' 
    });

  } catch (error) {
    console.error('Subscription error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: 'This email is already subscribed!' 
      });
    }

    res.status(500).json({ 
      success: false, 
      message: 'Failed to subscribe. Please try again.' 
    });
  }
});

// Unsubscribe endpoint
router.post('/unsubscribe', async (req, res) => {
  try {
    const { email, token } = req.body;

    let subscription;
    
    if (token) {
      subscription = await Subscription.findOne({ unsubscribeToken: token });
    } else if (email) {
      subscription = await Subscription.findOne({ email });
    }

    if (!subscription) {
      return res.status(404).json({ 
        success: false, 
        message: 'Subscription not found' 
      });
    }

    subscription.isActive = false;
    subscription.unsubscribedAt = new Date();
    await subscription.save();

    res.json({ 
      success: true, 
      message: 'You have been successfully unsubscribed.' 
    });

  } catch (error) {
    console.error('Unsubscribe error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to unsubscribe. Please try again.' 
    });
  }
});

// Get subscription status
router.get('/status/:email', async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ 
      email: req.params.email 
    });

    if (!subscription) {
      return res.json({ 
        subscribed: false 
      });
    }

    res.json({ 
      subscribed: subscription.isActive,
      type: subscription.type,
      preferences: subscription.preferences
    });

  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to check subscription status' 
    });
  }
});

// Update preferences
router.put('/preferences', async (req, res) => {
  try {
    const { email, preferences } = req.body;

    const subscription = await Subscription.findOne({ email, isActive: true });

    if (!subscription) {
      return res.status(404).json({ 
        success: false, 
        message: 'Subscription not found' 
      });
    }

    subscription.preferences = { ...subscription.preferences, ...preferences };
    await subscription.save();

    res.json({ 
      success: true, 
      message: 'Preferences updated successfully' 
    });

  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update preferences' 
    });
  }
});

module.exports = router;