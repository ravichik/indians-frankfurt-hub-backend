const nodemailer = require('nodemailer');

const sendPasswordResetEmail = async (email, resetUrl) => {
  try {
    // Log for debugging
    console.log('=================================');
    console.log('PASSWORD RESET REQUEST');
    console.log('Email:', email);
    console.log('Reset URL:', resetUrl);
    console.log('=================================');
    
    // Check if email credentials are configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || process.env.EMAIL_PASS === 'your-app-specific-password') {
      console.log('WARNING: Email service not configured. Please set EMAIL_USER and EMAIL_PASS in .env');
      console.log('For Gmail, use an app-specific password from: https://myaccount.google.com/apppasswords');
      // Still return true to not break the flow
      return true;
    }
    
    // Create transporter with Gmail service
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: `Indians Frankfurt Hub <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset Request - Indians in Frankfurt Hub',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #FF9933 0%, #FFFFFF 50%, #138808 100%); padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background-color: #9333ea; color: white !important; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="color: white; margin: 0;">Indians in Frankfurt Hub</h1>
            </div>
            <div class="content">
              <h2>Password Reset Request</h2>
              <p>Hello,</p>
              <p>We received a request to reset your password for your Indians in Frankfurt Hub account.</p>
              <p>Click the button below to reset your password:</p>
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </div>
              <p style="font-size: 14px; color: #666;">Or copy and paste this link in your browser:</p>
              <p style="font-size: 12px; word-break: break-all; color: #666;">${resetUrl}</p>
              <hr style="border: 1px solid #eee; margin: 20px 0;">
              <p style="font-size: 14px; color: #666;">This link will expire in 1 hour for security reasons.</p>
              <p style="font-size: 14px; color: #666;">If you didn't request this password reset, please ignore this email. Your password will remain unchanged.</p>
            </div>
            <div class="footer">
              <p>© 2025 Indians in Frankfurt Hub. All rights reserved.</p>
              <p>Connecting the Indian community in Frankfurt and Rhine-Main region</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Password reset email sent successfully to:', email);
    
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    // Don't throw error to not break the flow, but log it
    console.error('Failed to send email. User can still use the reset token if they have access to logs.');
    return true;
  }
};

// Helper function to create email transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Admin notification email
const ADMIN_EMAIL = 'frankfurtindians@gmail.com';

// Send notification for new user registration
const sendNewUserNotification = async (user) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || process.env.EMAIL_PASS === 'your-app-specific-password') {
      console.log('WARNING: Email service not configured. Skipping new user notification.');
      return true;
    }

    const transporter = createTransporter();

    const mailOptions = {
      from: `Indians Frankfurt Hub <${process.env.EMAIL_USER}>`,
      to: ADMIN_EMAIL,
      subject: '🆕 New User Registered - Indians in Frankfurt Hub',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #FF9933 0%, #FFFFFF 50%, #138808 100%); padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .info-box { background: #e0f2fe; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #0288d1; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="color: white; margin: 0;">🆕 New User Registration</h1>
            </div>
            <div class="content">
              <h2>New Member Joined the Community!</h2>
              <div class="info-box">
                <p><strong>Username:</strong> ${user.username}</p>
                <p><strong>Full Name:</strong> ${user.fullName}</p>
                <p><strong>Email:</strong> ${user.email}</p>
                <p><strong>Join Date:</strong> ${new Date(user.joinedDate).toLocaleString()}</p>
                <p><strong>Auth Provider:</strong> ${user.authProvider}</p>
                <p><strong>Role:</strong> ${user.role}</p>
              </div>
              <p>This user has just joined the Indians in Frankfurt Hub community!</p>
            </div>
            <div class="footer">
              <p>© 2025 Indians in Frankfurt Hub - Admin Notifications</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('New user notification sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending new user notification:', error);
    return false;
  }
};

// Send notification for new forum post
const sendNewPostNotification = async (post, author) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || process.env.EMAIL_PASS === 'your-app-specific-password') {
      console.log('WARNING: Email service not configured. Skipping new post notification.');
      return true;
    }

    const transporter = createTransporter();

    const mailOptions = {
      from: `Indians Frankfurt Hub <${process.env.EMAIL_USER}>`,
      to: ADMIN_EMAIL,
      subject: '📝 New Forum Post - Indians in Frankfurt Hub',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #FF9933 0%, #FFFFFF 50%, #138808 100%); padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .post-box { background: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #ffc107; }
            .content-preview { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 10px 0; border-left: 3px solid #6c757d; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="color: white; margin: 0;">📝 New Forum Post</h1>
            </div>
            <div class="content">
              <h2>New Post Created in Forum</h2>
              <div class="post-box">
                <h3 style="margin-top: 0;">${post.title}</h3>
                <p><strong>Author:</strong> ${author.username} (${author.fullName})</p>
                <p><strong>Category:</strong> ${post.category}</p>
                <p><strong>Posted:</strong> ${new Date(post.createdAt).toLocaleString()}</p>
                ${post.tags && post.tags.length > 0 ? `<p><strong>Tags:</strong> ${post.tags.join(', ')}</p>` : ''}
              </div>
              <div class="content-preview">
                <strong>Content Preview:</strong><br>
                ${post.content.substring(0, 300)}${post.content.length > 300 ? '...' : ''}
              </div>
            </div>
            <div class="footer">
              <p>© 2025 Indians in Frankfurt Hub - Admin Notifications</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('New post notification sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending new post notification:', error);
    return false;
  }
};

// Send notification for new reply
const sendNewReplyNotification = async (post, reply, replyAuthor) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || process.env.EMAIL_PASS === 'your-app-specific-password') {
      console.log('WARNING: Email service not configured. Skipping new reply notification.');
      return true;
    }

    const transporter = createTransporter();

    const mailOptions = {
      from: `Indians Frankfurt Hub <${process.env.EMAIL_USER}>`,
      to: ADMIN_EMAIL,
      subject: '💬 New Reply Posted - Indians in Frankfurt Hub',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #FF9933 0%, #FFFFFF 50%, #138808 100%); padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .reply-box { background: #d1ecf1; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #17a2b8; }
            .content-preview { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 10px 0; border-left: 3px solid #28a745; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="color: white; margin: 0;">💬 New Reply Posted</h1>
            </div>
            <div class="content">
              <h2>New Reply Added to Forum Thread</h2>
              <div class="reply-box">
                <h3 style="margin-top: 0;">Reply to: "${post.title}"</h3>
                <p><strong>Reply Author:</strong> ${replyAuthor.username} (${replyAuthor.fullName})</p>
                <p><strong>Original Post Category:</strong> ${post.category}</p>
                <p><strong>Reply Time:</strong> ${new Date(reply.createdAt).toLocaleString()}</p>
              </div>
              <div class="content-preview">
                <strong>Reply Content:</strong><br>
                ${reply.content.substring(0, 300)}${reply.content.length > 300 ? '...' : ''}
              </div>
            </div>
            <div class="footer">
              <p>© 2025 Indians in Frankfurt Hub - Admin Notifications</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('New reply notification sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending new reply notification:', error);
    return false;
  }
};

// Send notification for new event
const sendNewEventNotification = async (event, author) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || process.env.EMAIL_PASS === 'your-app-specific-password') {
      console.log('WARNING: Email service not configured. Skipping new event notification.');
      return true;
    }

    const transporter = createTransporter();

    const mailOptions = {
      from: `Indians Frankfurt Hub <${process.env.EMAIL_USER}>`,
      to: ADMIN_EMAIL,
      subject: '🗓️ New Event Created - Indians in Frankfurt Hub',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #FF9933 0%, #FFFFFF 50%, #138808 100%); padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .event-box { background: #ffeaa7; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #fdcb6e; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="color: white; margin: 0;">🗓️ New Event Created</h1>
            </div>
            <div class="content">
              <h2>New Event Added to Platform</h2>
              <div class="event-box">
                <h3 style="margin-top: 0;">${event.title}</h3>
                <p><strong>Organizer:</strong> ${author.username} (${author.fullName})</p>
                <p><strong>Event Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
                <p><strong>Event Time:</strong> ${event.time || 'TBD'}</p>
                <p><strong>Location:</strong> ${event.location || 'TBD'}</p>
                <p><strong>Created:</strong> ${new Date(event.createdAt).toLocaleString()}</p>
                ${event.maxAttendees ? `<p><strong>Max Attendees:</strong> ${event.maxAttendees}</p>` : ''}
                ${event.description ? `<div style="margin-top: 10px;"><strong>Description:</strong><br>${event.description.substring(0, 300)}${event.description.length > 300 ? '...' : ''}</div>` : ''}
              </div>
            </div>
            <div class="footer">
              <p>© 2025 Indians in Frankfurt Hub - Admin Notifications</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('New event notification sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending new event notification:', error);
    return false;
  }
};

// Send notification for new blog post
const sendNewBlogPostNotification = async (blogPost, author) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || process.env.EMAIL_PASS === 'your-app-specific-password') {
      console.log('WARNING: Email service not configured. Skipping new blog post notification.');
      return true;
    }

    const transporter = createTransporter();

    const mailOptions = {
      from: `Indians Frankfurt Hub <${process.env.EMAIL_USER}>`,
      to: ADMIN_EMAIL,
      subject: '📰 New Blog Post Published - Indians in Frankfurt Hub',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #FF9933 0%, #FFFFFF 50%, #138808 100%); padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .blog-box { background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #28a745; }
            .content-preview { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 10px 0; border-left: 3px solid #6c757d; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="color: white; margin: 0;">📰 New Blog Post Published</h1>
            </div>
            <div class="content">
              <h2>New Blog Article Available</h2>
              <div class="blog-box">
                <h3 style="margin-top: 0;">${blogPost.title}</h3>
                <p><strong>Author:</strong> ${author.name || author.fullName || author.username}</p>
                <p><strong>Category:</strong> ${blogPost.category || 'General'}</p>
                <p><strong>Status:</strong> ${blogPost.status}</p>
                <p><strong>Published:</strong> ${new Date(blogPost.createdAt).toLocaleString()}</p>
                ${blogPost.tags && blogPost.tags.length > 0 ? `<p><strong>Tags:</strong> ${blogPost.tags.join(', ')}</p>` : ''}
                ${blogPost.slug ? `<p><strong>Slug:</strong> ${blogPost.slug}</p>` : ''}
                ${blogPost.readTime ? `<p><strong>Read Time:</strong> ${blogPost.readTime} min</p>` : ''}
              </div>
              ${blogPost.excerpt ? `
                <div class="content-preview">
                  <strong>Excerpt:</strong><br>
                  ${blogPost.excerpt}
                </div>
              ` : ''}
              ${blogPost.content ? `
                <div class="content-preview">
                  <strong>Content Preview:</strong><br>
                  ${blogPost.content.substring(0, 400)}${blogPost.content.length > 400 ? '...' : ''}
                </div>
              ` : ''}
            </div>
            <div class="footer">
              <p>© 2025 Indians in Frankfurt Hub - Admin Notifications</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('New blog post notification sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending new blog post notification:', error);
    return false;
  }
};

module.exports = {
  sendPasswordResetEmail,
  sendNewUserNotification,
  sendNewPostNotification,
  sendNewReplyNotification,
  sendNewEventNotification,
  sendNewBlogPostNotification
};