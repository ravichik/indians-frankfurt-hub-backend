const badWords = [
  // Offensive words list
  'abuse', 'hate', 'racist', 'sexist', 'spam',
  // Common profanity
  'fuck', 'fucking', 'fucker', 'fucked', 'fucks', 'shit', 'shitty', 
  'ass', 'asshole', 'bastard', 'bitch', 'damn', 'hell', 'piss',
  'dick', 'cock', 'pussy', 'cunt', 'whore', 'slut',
  // Variations and combinations
  'f*ck', 'fck', 'fuk', 'sh*t', 'sh1t', 'a$$', '@ss',
  'b*tch', 'b1tch', 'd*mn', 'h*ll',
  // Slurs and hate speech
  'nigger', 'nigga', 'faggot', 'fag', 'retard', 'retarded',
  'gay' // when used as an insult
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

    // Check for spam patterns
    const spamPatterns = [
      /(\b\w+\b)\s+\1{3,}/gi, // Repeated words
      /(http|https):\/\/[^\s]+/gi, // URLs (limit them)
      /\b[A-Z]{5,}\b/g, // All caps words
      /[!?]{3,}/g, // Excessive punctuation
    ];

    let spamScore = 0;
    
    // Check for repeated words
    if (spamPatterns[0].test(text)) spamScore += 2;
    
    // Check for too many URLs
    const urlMatches = text.match(spamPatterns[1]);
    if (urlMatches && urlMatches.length > 3) spamScore += 2;
    
    // Check for excessive caps
    const capsMatches = text.match(spamPatterns[2]);
    if (capsMatches && capsMatches.length > 5) spamScore += 1;
    
    // Check for excessive punctuation
    if (spamPatterns[3].test(text)) spamScore += 1;

    // Determine severity
    if (flaggedWords.length > 0 || spamScore > 3) {
      severity = 'high';
    } else if (spamScore > 1) {
      severity = 'medium';
    } else if (spamScore > 0) {
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

    // Check if posting too frequently (more than 5 posts in 10 minutes)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const recentCount = recentPosts.filter(post => 
      new Date(post.createdAt) > tenMinutesAgo
    ).length;

    return recentCount >= 5;
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

    // Check if title is all caps
    if (titleStr && titleStr === titleStr.toUpperCase() && titleStr.length > 10) {
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
    if (titleModeration.severity === 'high') {
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
    if (contentModeration.severity === 'high') {
      return res.status(400).json({ 
        error: 'Content contains inappropriate language or spam',
        message: 'Please revise your content and try again'
      });
    }

    // Clean the content but preserve it for review if needed
    if (contentModeration.requiresReview) {
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