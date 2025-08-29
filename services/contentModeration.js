const badWords = [
  // Only block severe offensive words and slurs
  'nigger', 'nigga', 'faggot', 'fag',
  // Extreme profanity only
  'fuck', 'fucking', 'cunt',
  // Clear hate speech
  'terrorist', 'jihad', 'nazi'
];

// Hindi/Indian language inappropriate words
const hindiProfanity = [
  // Add Hindi/regional inappropriate words
  // This is a placeholder - add actual words as needed
];

// Combine all word lists
const allBadWords = [...badWords, ...hindiProfanity];

class ContentModerationService {
  /**
   * Check if content contains inappropriate language
   * @param {string} text - Text to check
   * @returns {object} - Moderation result
   */
  static moderateContent(text) {
    if (!text) {
      return { isClean: true, flaggedWords: [], severity: 'none' };
    }

    const lowerText = text.toLowerCase();
    const flaggedWords = [];
    let severity = 'none';

    // Check for bad words
    for (const word of allBadWords) {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      if (regex.test(lowerText)) {
        flaggedWords.push(word);
      }
    }

    // Check for spam patterns (reduced sensitivity)
    const spamPatterns = [
      /(\b\w+\b)\s+\1{5,}/gi, // Repeated words (increased threshold from 3 to 5)
      /(http|https):\/\/[^\s]+/gi, // URLs (allow more)
      /\b[A-Z]{10,}\b/g, // All caps words (increased threshold from 5 to 10)
      /[!?]{5,}/g, // Excessive punctuation (increased threshold from 3 to 5)
    ];

    let spamScore = 0;
    
    // Check for repeated words
    if (spamPatterns[0].test(text)) spamScore += 1;
    
    // Check for too many URLs (increased threshold from 3 to 5)
    const urlMatches = text.match(spamPatterns[1]);
    if (urlMatches && urlMatches.length > 5) spamScore += 1;
    
    // Check for excessive caps (increased threshold from 5 to 10)
    const capsMatches = text.match(spamPatterns[2]);
    if (capsMatches && capsMatches.length > 10) spamScore += 1;
    
    // Check for excessive punctuation
    if (spamPatterns[3].test(text)) spamScore += 1;

    // Determine severity (more lenient thresholds)
    if (flaggedWords.length > 2 || spamScore > 5) {
      severity = 'high';
    } else if (flaggedWords.length > 0 || spamScore > 3) {
      severity = 'medium';
    } else if (spamScore > 1) {
      severity = 'low';
    }

    return {
      isClean: flaggedWords.length === 0 && spamScore === 0,
      flaggedWords,
      spamScore,
      severity,
      requiresReview: severity === 'high' || flaggedWords.length > 0
    };
  }

  /**
   * Clean inappropriate content from text
   * @param {string} text - Text to clean
   * @returns {string} - Cleaned text
   */
  static cleanContent(text) {
    if (!text) return text;

    let cleanedText = text;

    // Replace bad words with asterisks
    for (const word of allBadWords) {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const replacement = word[0] + '*'.repeat(word.length - 1);
      cleanedText = cleanedText.replace(regex, replacement);
    }

    return cleanedText;
  }

  /**
   * Check if user should be rate limited
   * @param {Array} recentPosts - User's recent posts
   * @returns {boolean} - Whether to rate limit
   */
  static shouldRateLimit(recentPosts) {
    if (!recentPosts || recentPosts.length === 0) return false;

    // Check if posting too frequently (increased from 5 to 10 posts in 10 minutes)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const recentCount = recentPosts.filter(post => 
      new Date(post.createdAt) > tenMinutesAgo
    ).length;

    return recentCount >= 10;
  }

  /**
   * Validate post title
   * @param {string} title - Post title
   * @returns {object} - Validation result
   */
  static validateTitle(title) {
    const errors = [];

    // Convert to string if not already
    const titleStr = String(title || '');

    if (!titleStr || titleStr.trim().length === 0) {
      errors.push('Title is required');
    }

    if (titleStr && titleStr.length < 5) {
      errors.push('Title must be at least 5 characters');
    }

    if (titleStr && titleStr.length > 200) {
      errors.push('Title must be less than 200 characters');
    }

    // Check if title is all caps (more lenient - only flag if > 30 chars)
    if (titleStr && titleStr === titleStr.toUpperCase() && titleStr.length > 30) {
      errors.push('Please avoid using all caps in title');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate post content
   * @param {string} content - Post content
   * @returns {object} - Validation result
   */
  static validateContent(content) {
    const errors = [];

    // Convert to string if not already
    const contentStr = String(content || '');

    if (!contentStr || contentStr.trim().length === 0) {
      errors.push('Content is required');
    }

    if (contentStr && contentStr.length < 10) {
      errors.push('Content must be at least 10 characters');
    }

    if (contentStr && contentStr.length > 10000) {
      errors.push('Content must be less than 10000 characters');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Generate moderation report for admin
   * @param {object} post - Post object
   * @param {object} moderationResult - Moderation result
   * @returns {object} - Report object
   */
  static generateModerationReport(post, moderationResult) {
    return {
      postId: post._id,
      authorId: post.author,
      timestamp: new Date(),
      moderationResult,
      action: moderationResult.severity === 'high' ? 'blocked' : 'flagged',
      requiresManualReview: moderationResult.requiresReview
    };
  }
}

// Middleware for content moderation
const moderateContentMiddleware = (req, res, next) => {
  const { title, content } = req.body;

  // Validate title if present
  if (title !== undefined && title !== null) {
    const titleStr = String(title);
    const titleValidation = ContentModerationService.validateTitle(titleStr);
    if (!titleValidation.isValid) {
      return res.status(400).json({ 
        error: 'Invalid title', 
        details: titleValidation.errors 
      });
    }

    const titleModeration = ContentModerationService.moderateContent(titleStr);
    // Only block if severity is high AND there are flagged words
    if (titleModeration.severity === 'high' && titleModeration.flaggedWords.length > 0) {
      return res.status(400).json({ 
        error: 'Title contains inappropriate content',
        message: 'Please revise your title and try again'
      });
    }

    // Clean the title
    req.body.title = ContentModerationService.cleanContent(titleStr);
  }

  // Validate content if present
  if (content !== undefined && content !== null) {
    const contentStr = String(content);
    const contentValidation = ContentModerationService.validateContent(contentStr);
    if (!contentValidation.isValid) {
      return res.status(400).json({ 
        error: 'Invalid content', 
        details: contentValidation.errors 
      });
    }

    const contentModeration = ContentModerationService.moderateContent(contentStr);
    // Only block if severity is high AND there are multiple flagged words
    if (contentModeration.severity === 'high' && contentModeration.flaggedWords.length > 1) {
      return res.status(400).json({ 
        error: 'Content contains inappropriate language or spam',
        message: 'Please revise your content and try again'
      });
    }

    // Only flag for review if there are actual bad words
    if (contentModeration.flaggedWords.length > 0) {
      req.body.flaggedForReview = true;
      req.body.moderationReport = contentModeration;
    }
    
    req.body.content = ContentModerationService.cleanContent(contentStr);
  }

  next();
};

module.exports = {
  ContentModerationService,
  moderateContentMiddleware
};