const nodemailer = require('nodemailer');

// For development, we'll use a simple console log
// In production, you would configure a real email service like Gmail, SendGrid, etc.
const sendPasswordResetEmail = async (email, resetUrl) => {
  try {
    // For development purposes, we'll just log the reset URL
    console.log('=================================');
    console.log('PASSWORD RESET REQUEST');
    console.log('Email:', email);
    console.log('Reset URL:', resetUrl);
    console.log('=================================');
    
    // In production, you would use something like:
    /*
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: 'noreply@indiansfrankfurt.com',
      to: email,
      subject: 'Password Reset Request - Indians in Frankfurt Hub',
      html: `
        <h2>Password Reset Request</h2>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #9333ea; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>If you didn't request this, please ignore this email.</p>
        <p>This link will expire in 1 hour.</p>
      `
    };

    await transporter.sendMail(mailOptions);
    */
    
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
};

module.exports = { sendPasswordResetEmail };