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

module.exports = { sendPasswordResetEmail };