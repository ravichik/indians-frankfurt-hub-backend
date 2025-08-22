const { ContentModerationService } = require('./services/contentModeration');

console.log('Testing Content Moderation with Reduced Sensitivity\n');
console.log('='*50);

// Test cases
const testCases = [
  {
    title: 'Normal post about housing',
    content: 'Looking for a 2-bedroom apartment in Frankfurt. Budget is 1500 euros.',
    expected: 'Should pass'
  },
  {
    title: 'URGENT: NEED HELP WITH VISA!!!',
    content: 'Hi everyone!! I need help with my visa application!! Can someone guide me???',
    expected: 'Should pass (caps under 30 chars, some punctuation allowed)'
  },
  {
    title: 'Selling my car - Good deal!',
    content: 'Check out this amazing deal: https://example.com and https://cars.com. More info at https://mysite.com',
    expected: 'Should pass (URLs allowed up to 5)'
  },
  {
    title: 'Damn, this weather sucks',
    content: 'Hell, the weather in Frankfurt is so bad. What the hell do you guys do on weekends?',
    expected: 'Should pass (mild profanity removed from blocklist)'
  },
  {
    title: 'This is fucking terrible',
    content: 'The fucking service at this place was horrible',
    expected: 'Should be flagged/blocked (severe profanity)'
  },
  {
    title: 'Spam spam spam spam spam spam',
    content: 'BUY NOW!!!!!! CLICK HERE!!!!!! AMAZING DEAL!!!!!!',
    expected: 'Should be flagged (excessive repetition and punctuation)'
  }
];

// Run tests
testCases.forEach((test, index) => {
  console.log(`\nTest ${index + 1}: ${test.expected}`);
  console.log('-'*40);
  console.log(`Title: "${test.title}"`);
  console.log(`Content: "${test.content}"`);
  
  const titleResult = ContentModerationService.moderateContent(test.title);
  const contentResult = ContentModerationService.moderateContent(test.content);
  
  console.log('\nTitle Moderation:');
  console.log(`  Clean: ${titleResult.isClean}`);
  console.log(`  Severity: ${titleResult.severity}`);
  console.log(`  Flagged Words: ${titleResult.flaggedWords.length > 0 ? titleResult.flaggedWords.join(', ') : 'None'}`);
  console.log(`  Spam Score: ${titleResult.spamScore}`);
  
  console.log('\nContent Moderation:');
  console.log(`  Clean: ${contentResult.isClean}`);
  console.log(`  Severity: ${contentResult.severity}`);
  console.log(`  Flagged Words: ${contentResult.flaggedWords.length > 0 ? contentResult.flaggedWords.join(', ') : 'None'}`);
  console.log(`  Spam Score: ${contentResult.spamScore}`);
  
  // Check if would be blocked
  const titleBlocked = titleResult.severity === 'high' && titleResult.flaggedWords.length > 0;
  const contentBlocked = contentResult.severity === 'high' && contentResult.flaggedWords.length > 1;
  
  console.log('\nWould be blocked?');
  console.log(`  Title: ${titleBlocked ? 'YES' : 'NO'}`);
  console.log(`  Content: ${contentBlocked ? 'YES' : 'NO'}`);
});

console.log('\n' + '='*50);
console.log('Content Moderation Test Complete!');
console.log('\nSummary of Changes:');
console.log('- Reduced bad words list to only severe offensive words');
console.log('- Increased spam thresholds (repetition, URLs, caps, punctuation)');
console.log('- Rate limiting increased from 5 to 10 posts per 10 minutes');
console.log('- All caps title check increased from 10 to 30 characters');
console.log('- Title blocking requires both high severity AND flagged words');
console.log('- Content blocking requires high severity AND multiple flagged words');