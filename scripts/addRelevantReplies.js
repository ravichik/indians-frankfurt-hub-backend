const mongoose = require('mongoose');
const User = require('../models/User');
const ForumPost = require('../models/ForumPost');
require('dotenv').config();

// Map of post IDs to relevant replies from our Indian users
const targetedReplies = {
  // Haircut post
  '68ae104fd0d1d569b81fb94b': [
    {
      username: 'arjun_mehta',
      content: `Thanks for sharing! I've been going there for 6 months now. The barber's name is Raj and he's from Mumbai. Very friendly guy and understands different Indian hairstyles well. 

Pro tip: Go on weekdays before 5 PM to avoid the queue. Also, he does threading for €3 extra which is hard to find at this price point in Frankfurt.`
    },
    {
      username: 'rohit_bangalore',
      content: `10 Euros is unbeatable! I used to pay €25 at other places. Just went there last week based on recommendations from this forum. The basement location is a bit tricky to find - look for the blue "Herren Friseur" sign near the Döner shop. 

He also speaks Hindi/English which makes it easier to explain what you want!`
    }
  ],
  
  // Indian Temples post
  '68a9ed38a08bf196913d2965': [
    {
      username: 'kavya_shah',
      content: `Adding to this list - there's also a small Jain temple in Bad Homburg (20 mins from Frankfurt) for those interested. They organize Paryushan celebrations every year.

For Gujarati community, Hari Om Temple has Sunderkand path every Tuesday evening at 7 PM. Great community feeling!`
    },
    {
      username: 'priya_nair',
      content: `The Asamai Mandir celebrates all major South Indian festivals beautifully! They had an amazing Onam celebration last month with traditional sadhya. 

For those looking for yoga and meditation, they also conduct free sessions every Saturday morning at 9 AM.`
    }
  ],
  
  // Family visit visa post
  '68a89c417b5641d65d4eb296': [
    {
      username: 'aditya_punjabi',
      content: `Just went through this process for my parents last month. Few additional tips:
- Bank statements should show at least €80-100 per day per person
- Travel insurance is mandatory - I used Bajaj Allianz (covers up to age 85)
- Hotel bookings can be refundable ones from Booking.com
- Return flight tickets are essential

The whole process took about 15 days at Mumbai consulate.`
    },
    {
      username: 'kavya_shah',
      content: `Important point about Verpflichtungserklärung - even if not required, having one speeds up the visa process significantly. I got mine from Frankfurt Ausländerbehörde in 30 minutes (cost €29). 

Also, write a detailed invitation letter mentioning your job, salary, and accommodation details. This really helps!`
    }
  ],
  
  // Indian catering post
  '68a7b438836bbe93b47b7d28': [
    {
      username: 'priya_nair',
      content: `Congratulations on your daughter's first birthday! 🎉

I highly recommend "Taste of India Catering" by Sharma ji. We used them for my son's birthday last month. Excellent Gujarati/Punjabi vegetarian menu. They charge around €12-15 per person for a full meal including starters, main course, and desserts. They also provide plates and cutlery.

Contact: +49 176 12345678 (WhatsApp available)`
    },
    {
      username: 'kavya_shah',
      content: `For pure vegetarian Gujarati catering, try "Kathiyawadi Rasoi" - they specialize in traditional items like dhokla, khandvi, undhiyu. Perfect for kids' parties as they can make less spicy versions. 

They're based in Offenbach but deliver to Frankfurt. Price is reasonable - around €10 per person for 50 guests. They also do live jalebi counter which kids love!`
    }
  ],
  
  // Tax filing post
  '68a7b438836bbe93b47b7d1f': [
    {
      username: 'aditya_punjabi',
      content: `Great summary! Adding few points from my experience:

For Indian expats, don't forget about DTAA (Double Taxation Avoidance Agreement) between India and Germany. You need to file Form 10F to avoid double taxation on Indian income.

I use WISO Steuer software (€35) - has English interface and specifically handles expat scenarios well. Got €2000 refund last year just by claiming relocation expenses properly!`
    },
    {
      username: 'arjun_mehta',
      content: `For IT professionals on Blue Card - you can claim home office expenses, professional courses (including Udemy/Coursera), and even German language course fees. 

Also, if you're married and your spouse isn't working, file jointly (Zusammenveranlagung) for better tax benefits. Saved me almost €3000 last year.`
    }
  ],
  
  // Weekend trips post
  '68a7b438836bbe93b47b7d0d': [
    {
      username: 'rohit_bangalore',
      content: `My top 3 weekend destinations from Frankfurt:

1. **Heidelberg** (1 hour) - Beautiful castle, old town, and romantic atmosphere. Don't miss the Philosophenweg trail!

2. **Cologne** (1.5 hours by ICE) - Amazing cathedral, great museums, and vibrant nightlife. Try the local Kölsch beer!

3. **Black Forest** (2 hours) - Perfect for nature lovers. We did the Triberg waterfalls and had authentic Black Forest cake.

Pro tip: Get the Quer-durchs-Land-Ticket for €44 - unlimited regional train travel for up to 5 people on weekends!`
    },
    {
      username: 'priya_nair',
      content: `For families with kids, I highly recommend:

- **Europa Park** (2 hours) - Germany's best theme park
- **Legoland Germany** (3 hours) - Kids paradise!
- **Mainz** (30 mins) - Beautiful old town, less touristy than Heidelberg

For flight deals, check Frankfurt Hahn airport (not just FRA). Got return tickets to Barcelona for €40!`
    }
  ],
  
  // Blue Card post  
  '68a7b438836bbe93b47b7d06': [
    {
      username: 'arjun_mehta',
      content: `Thanks for sharing! My timeline for reference:
- Applied: January 2023
- Blue Card received: March 2023 (took 8 weeks due to anabin verification)
- Started A1 German immediately
- Passed B1 exam: October 2024
- Applied for settlement permit: November 2024
- Permanent residence approved: December 2024 (21 months total!)

The German language really accelerates the process. VHS Frankfurt courses are affordable and good quality.`
    },
    {
      username: 'aditya_punjabi',
      content: `One important tip - your Blue Card is tied to your job for the first 2 years. If you change jobs, you need approval from Ausländerbehörde first! 

Also, for permanent residence, they check if you've paid into the pension system for at least 21/33 months. Keep all your salary slips and pension statements (Rentenversicherung) ready.`
    }
  ],
  
  // German language study group
  '68a7b438836bbe93b47b7d01': [
    {
      username: 'kavya_shah',
      content: `Count me in! I'm also at A2 level. I can host study sessions at Goethe University library on weekends - we have access to great learning resources there.

For apps, I highly recommend:
- Busuu (better than Duolingo for German)
- Deutsche Welle Learn German (free and comprehensive)
- Anki for vocabulary (I have a 2000-word deck I can share)

Let's create a WhatsApp group? My number: +49 151 23456789`
    },
    {
      username: 'rohit_bangalore',
      content: `Interested! Currently finishing A1, but motivated to level up quickly. 

For anyone looking for teachers, I recommend Praxis Deutsch language school in Sachsenhausen. They have evening batches perfect for working professionals. €400 for 2 months, small groups (max 8 people).

Also, watching German shows with subtitles helps a lot - try "Dark" on Netflix or "Türkisch für Anfänger" for easier content.`
    }
  ],
  
  // IT Jobs referral thread
  '68a7b437836bbe93b47b7cfb': [
    {
      username: 'arjun_mehta',
      content: `SAP is actively hiring! We need:
- Full-stack developers (Java/React)
- Cloud architects (AWS/Azure)
- DevOps engineers
- ABAP developers (for S/4HANA)

German language is a plus but not mandatory for technical roles. We have good relocation support and Blue Card sponsorship. Feel free to DM me with your CV. 

Also, check out Frankfurt Tech Meetup group - great for networking and many recruiters attend.`
    },
    {
      username: 'rohit_bangalore',
      content: `For consultancy opportunities, Big 4 (Deloitte, PwC, EY, KPMG) are always hiring IT consultants. They prefer:
- SAP expertise (especially S/4HANA migration)
- Cloud certifications
- Agile/Scrum experience
- Basic German (A2) helps a lot

Salaries range from €65-85k for senior consultants. Happy to refer at my firm (one of Big 4) - need 3+ years experience minimum.`
    }
  ],
  
  // Indian restaurants post
  '68a7b437836bbe93b47b7cf6': [
    {
      username: 'priya_nair',
      content: `Great list! Adding my favorites:

**Saravanaa Bhavan** (Kaiserstraße) - Authentic South Indian, their dosas are exactly like Chennai! Weekend thali for €12.90 is amazing value.

**Indian Curry House** (Bornheim) - Best Kerala fish curry I've had outside India. Their appam is freshly made and perfect. Owner is from Kochi and very friendly.

**Punjabi Tadka** (Sachsenhausen) - Proper Punjabi dhaba style food. Their butter chicken and dal makhani are to die for!`
    },
    {
      username: 'aditya_punjabi',
      content: `For authentic North Indian, don't miss **Delhi 6** in Westend. Owner is from Chandni Chowk and the chaat items are incredible - gol gappe, aloo tikki, papdi chaat all under €6!

Also, **Himalaya** near Hauptwache has great momos and Tibetan/Nepali food if you want something different. Their buff momos and thukpa are comfort food for me now!`
    }
  ]
};

async function addRelevantReplies() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Get our Indian users
    const indianUsernames = ['arjun_mehta', 'priya_nair', 'rohit_bangalore', 'kavya_shah', 'aditya_punjabi'];
    const users = await User.find({ username: { $in: indianUsernames } });
    
    if (users.length === 0) {
      console.log('No Indian users found. Please run populateForumData.js first');
      process.exit(1);
    }
    
    const userMap = {};
    users.forEach(user => {
      userMap[user.username] = user;
    });
    
    console.log(`Found ${users.length} Indian users`);
    
    // Process each post
    for (const [postId, replies] of Object.entries(targetedReplies)) {
      const post = await ForumPost.findById(postId);
      
      if (!post) {
        console.log(`Post ${postId} not found, skipping...`);
        continue;
      }
      
      console.log(`\nProcessing post: ${post.title}`);
      
      // Clear existing replies from our test users to avoid duplicates
      const indianUserIds = users.map(u => u._id.toString());
      post.replies = post.replies.filter(reply => 
        !indianUserIds.includes(reply.author.toString())
      );
      
      // Add new relevant replies
      for (const replyData of replies) {
        const user = userMap[replyData.username];
        
        if (!user) {
          console.log(`User ${replyData.username} not found, skipping...`);
          continue;
        }
        
        const newReply = {
          author: user._id,
          content: replyData.content,
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 3 * 24 * 60 * 60 * 1000)), // Random time in last 3 days
          likes: []
        };
        
        post.replies.push(newReply);
        
        // Update user contributions
        user.contributions = user.contributions || {};
        user.contributions.points = (user.contributions.points || 0) + 2;
        user.contributions.postsCreated = (user.contributions.postsCreated || 0) + 1;
        
        // Update level based on points
        const points = user.contributions.points;
        if (points >= 100) user.contributions.level = 'Champion';
        else if (points >= 50) user.contributions.level = 'Expert';
        else if (points >= 25) user.contributions.level = 'Contributor';
        else if (points >= 10) user.contributions.level = 'Member';
        else user.contributions.level = 'Newcomer';
        
        await user.save();
        console.log(`  ✓ Added reply from ${user.username}`);
      }
      
      await post.save();
    }
    
    console.log('\n✅ Successfully added relevant replies to all forum posts!');
    process.exit(0);
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

addRelevantReplies();