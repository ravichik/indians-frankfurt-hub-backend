const { createCanvas, loadImage, registerFont } = require('canvas');
const path = require('path');
const fs = require('fs');

class OGImageGenerator {
  constructor() {
    this.width = 1200;
    this.height = 630;
    this.backgroundColor = '#1a1a2e';
    this.accentColor = '#ff6b6b';
    this.textColor = '#ffffff';
  }

  async generateImage(options = {}) {
    const {
      title = 'Frankfurt Indians',
      subtitle = 'Connect with the Indian Community',
      category = '',
      author = '',
      logo = true,
      backgroundImage = null,
      customColors = {}
    } = options;

    // Override default colors if provided
    const colors = {
      bg: customColors.bg || this.backgroundColor,
      accent: customColors.accent || this.accentColor,
      text: customColors.text || this.textColor
    };

    // Create canvas
    const canvas = createCanvas(this.width, this.height);
    const ctx = canvas.getContext('2d');

    // Draw background
    if (backgroundImage) {
      try {
        const img = await loadImage(backgroundImage);
        ctx.drawImage(img, 0, 0, this.width, this.height);
        // Add overlay for text readability
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(0, 0, this.width, this.height);
      } catch (error) {
        // Fallback to solid color
        ctx.fillStyle = colors.bg;
        ctx.fillRect(0, 0, this.width, this.height);
      }
    } else {
      // Gradient background
      const gradient = ctx.createLinearGradient(0, 0, this.width, this.height);
      gradient.addColorStop(0, colors.bg);
      gradient.addColorStop(1, this.adjustBrightness(colors.bg, -20));
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, this.width, this.height);
    }

    // Add decorative elements
    this.drawDecorativeElements(ctx, colors);

    // Draw category badge if provided
    if (category) {
      this.drawCategoryBadge(ctx, category, colors);
    }

    // Draw main title
    ctx.fillStyle = colors.text;
    ctx.font = 'bold 72px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Word wrap for long titles
    const titleLines = this.wrapText(ctx, title, this.width - 100);
    const titleY = this.height / 2 - (titleLines.length - 1) * 40;
    
    titleLines.forEach((line, index) => {
      ctx.fillText(line, this.width / 2, titleY + index * 80);
    });

    // Draw subtitle
    if (subtitle) {
      ctx.fillStyle = this.adjustBrightness(colors.text, -30);
      ctx.font = '32px Arial';
      ctx.fillText(subtitle, this.width / 2, titleY + titleLines.length * 80 + 20);
    }

    // Draw author if provided
    if (author) {
      ctx.fillStyle = colors.accent;
      ctx.font = '24px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`By ${author}`, 60, this.height - 60);
    }

    // Draw site branding
    this.drawBranding(ctx, colors);

    return canvas.toBuffer('image/png');
  }

  drawDecorativeElements(ctx, colors) {
    // Draw decorative circles
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = colors.accent;
    
    // Top-right circle
    ctx.beginPath();
    ctx.arc(this.width - 100, 100, 150, 0, Math.PI * 2);
    ctx.fill();
    
    // Bottom-left circle
    ctx.beginPath();
    ctx.arc(100, this.height - 100, 120, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.globalAlpha = 1;

    // Draw accent line
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(60, this.height / 2 - 150);
    ctx.lineTo(200, this.height / 2 - 150);
    ctx.stroke();
  }

  drawCategoryBadge(ctx, category, colors) {
    const badgeWidth = ctx.measureText(category.toUpperCase()).width + 40;
    const badgeX = 60;
    const badgeY = 60;
    
    // Draw badge background
    ctx.fillStyle = colors.accent;
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeWidth, 40, 20);
    ctx.fill();
    
    // Draw badge text
    ctx.fillStyle = colors.text;
    ctx.font = 'bold 18px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(category.toUpperCase(), badgeX + 20, badgeY + 20);
  }

  drawBranding(ctx, colors) {
    // Site name
    ctx.fillStyle = colors.text;
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText('frankfurtindians.com', this.width - 60, this.height - 60);
    
    // Indian flag colors as small bars
    const flagY = this.height - 40;
    const flagWidth = 60;
    const flagHeight = 4;
    
    // Saffron
    ctx.fillStyle = '#FF9933';
    ctx.fillRect(this.width - 60 - flagWidth, flagY, flagWidth/3, flagHeight);
    
    // White
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(this.width - 60 - flagWidth + flagWidth/3, flagY, flagWidth/3, flagHeight);
    
    // Green
    ctx.fillStyle = '#138808';
    ctx.fillRect(this.width - 60 - flagWidth + 2*flagWidth/3, flagY, flagWidth/3, flagHeight);
  }

  wrapText(ctx, text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }
    
    return lines.slice(0, 3); // Limit to 3 lines
  }

  adjustBrightness(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255))
      .toString(16).slice(1);
  }

  // Generate specific OG images for different page types
  async generateForumPostImage(post) {
    return this.generateImage({
      title: post.title,
      subtitle: `Posted in ${post.category}`,
      category: 'FORUM',
      author: post.author?.name || 'Community Member',
      customColors: {
        bg: '#2c3e50',
        accent: '#e74c3c',
        text: '#ffffff'
      }
    });
  }

  async generateEventImage(event) {
    return this.generateImage({
      title: event.title,
      subtitle: new Date(event.date).toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      category: 'EVENT',
      customColors: {
        bg: '#27ae60',
        accent: '#f39c12',
        text: '#ffffff'
      }
    });
  }

  async generateResourceImage(resource) {
    return this.generateImage({
      title: resource.title,
      subtitle: resource.description,
      category: resource.category?.toUpperCase() || 'RESOURCE',
      customColors: {
        bg: '#34495e',
        accent: '#3498db',
        text: '#ffffff'
      }
    });
  }

  async generateProfileImage(user) {
    return this.generateImage({
      title: user.name,
      subtitle: `Member since ${new Date(user.createdAt).getFullYear()}`,
      category: 'PROFILE',
      customColors: {
        bg: '#8e44ad',
        accent: '#e67e22',
        text: '#ffffff'
      }
    });
  }
}

module.exports = new OGImageGenerator();