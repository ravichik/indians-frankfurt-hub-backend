const mongoose = require('mongoose');
const User = require('../models/User');
const ForumPost = require('../models/ForumPost');
require('dotenv').config();

// Indian user data
const indianUsers = [
  {
    username: 'arjun_mehta',
    email: 'arjun.mehta@email.com',
    password: 'Password123!',
    fullName: 'Arjun Mehta',
    bio: 'Software Developer at SAP, moved to Frankfurt in 2022. Love exploring German culture while staying connected to my roots.',
    contributions: {
      points: 15,
      postsCreated: 2,
      thanksReceived: 3,
      level: 'Member'
    }
  },
  {
    username: 'priya_nair',
    email: 'priya.nair@email.com', 
    password: 'Password123!',
    fullName: 'Priya Nair',
    bio: 'Data Scientist working in fintech. Originally from Kerala, now calling Frankfurt home. Passionate about South Indian cuisine and yoga.',
    contributions: {
      points: 25,
      postsCreated: 3,
      thanksReceived: 5,
      level: 'Contributor'
    }
  },
  {
    username: 'rohit_bangalore',
    email: 'rohit.bg@email.com',
    password: 'Password123!',
    fullName: 'Rohit Krishnan',
    bio: 'IT Consultant from Bangalore. Cricket enthusiast looking to connect with fellow Indians in Frankfurt. Weekend chef experimenting with Indo-German fusion!',
    contributions: {
      points: 8,
      postsCreated: 1,
      thanksReceived: 2,
      level: 'Newcomer'
    }
  },
  {
    username: 'kavya_shah',
    email: 'kavya.shah@email.com',
    password: 'Password123!',
    fullName: 'Kavya Shah',
    bio: 'PhD student at Goethe University. Gujarati family, loves organizing cultural events. Always happy to help newcomers settle in Frankfurt!',
    contributions: {
      points: 35,
      postsCreated: 5,
      thanksReceived: 8,
      level: 'Expert'
    }
  },
  {
    username: 'aditya_punjabi',
    email: 'aditya.singh@email.com',
    password: 'Password123!',
    fullName: 'Aditya Singh',
    bio: 'Investment Banking professional. Punjabi at heart, German by choice. Looking for good Indian restaurants and cricket buddies in Frankfurt.',
    contributions: {
      points: 12,
      postsCreated: 2,
      thanksReceived: 3,
      level: 'Member'
    }
  }
];

// Realistic forum replies based on common topics
const forumReplies = {
  // Replies about finding Indian groceries
  groceries: [
    {
      user: 'arjun_mehta',
      content: `I've been shopping at India Store Frankfurt near Hauptbahnhof for 2 years now. They have excellent South Indian spices and fresh curry leaves every Thursday. The owner is very friendly and can order specific items if you ask. 

For fresh vegetables, I also recommend the Turkish shops on Münchener Straße - they often have okra, drumsticks, and fresh coriander at better prices.`
    },
    {
      user: 'priya_nair',
      content: `Adding to the list - Ambika Supermarkt in Offenbach is worth the trip! They have the largest selection of South Indian items I've found. Pro tip: They get fresh idli/dosa batter on weekends. 

Also, REWE now stocks some Indian products like MDH masalas and Patak's sauces in their international aisle.`
    },
    {
      user: 'kavya_shah',
      content: `For Gujarati specialties, there's a small shop in Bockenheim that stocks khakhra, fafda, and other snacks. The owner imports directly from Ahmedabad. I can share the exact address if anyone's interested.

Also, Amazon.de has started stocking more Indian brands recently - good for pantry staples when you can't make it to the physical stores.`
    }
  ],
  
  // Replies about accommodation
  accommodation: [
    {
      user: 'rohit_bangalore',
      content: `Currently looking for accommodation myself! The housing market here is crazy compared to Bangalore. From what I've learned:
- Start with WG-Gesucht for shared apartments
- Immobilienscout24 for direct rentals
- Join Facebook groups like "Indians in Frankfurt - Housing"

Anyone knows good areas for IT professionals working near Eschborn?`
    },
    {
      user: 'aditya_punjabi',
      content: `I stayed in a serviced apartment from Homelike for my first 3 months - expensive but gives you time to find something permanent. 

For areas: Nordend and Bornheim are great for young professionals. Good connectivity and lots of restaurants/cafes. Avoid Gallus and parts of Bahnhofsviertel if you're new to the city.`
    },
    {
      user: 'kavya_shah',
      content: `For students and newcomers on a budget, check out the Studentenwohnheim options even if you're not a student - some accept young professionals too. 

Important tip: NEVER transfer money before seeing the apartment in person and signing a proper contract. There are many scams targeting Indians unfortunately.`
    }
  ],
  
  // Replies about visa and Blue Card
  visa: [
    {
      user: 'arjun_mehta',
      content: `Got my Blue Card last year! The process at Frankfurt Ausländerbehörde took about 6 weeks. Make sure you have:
- Salary above €58,400 (2024 threshold for IT)
- Recognized degree (get it evaluated by anabin if needed)
- Job contract
- Health insurance proof

Book your appointment online ASAP - slots fill up quickly!`
    },
    {
      user: 'priya_nair',
      content: `Adding my experience - if you're in STEM fields, the salary requirement is lower (around €45,552). Also, with Blue Card you can get permanent residence in just 21 months if you have B1 German, otherwise 33 months.

I highly recommend taking German classes from day 1. Volkshochschule offers affordable courses.`
    }
  ],
  
  // Replies about community events
  events: [
    {
      user: 'kavya_shah',
      content: `We're organizing a Garba night for Navratri at Saalbau Bornheim! Last year we had 200+ participants. This year we're planning:
- Professional dhol players
- Gujarati snacks and chai
- Dandiya sticks available
- Prizes for best traditional dress

Will post the registration link soon. Early bird tickets will be €15.`
    },
    {
      user: 'aditya_punjabi',
      content: `Count me in for Garba! Also, any cricket enthusiasts here? We have a WhatsApp group for weekend cricket at Rebstockpark. We play every Saturday morning from May to September. Mixed skill levels welcome!`
    },
    {
      user: 'priya_nair',
      content: `There's a South Indian classical music group that meets monthly at Musikschule Frankfurt. We have tabla, veena, and vocal performances. Very informal and welcoming to all levels. Next session is on the 15th at 4 PM.`
    }
  ],
  
  // General helpful replies
  general: [
    {
      user: 'arjun_mehta',
      content: `Great question! From my experience, Frankfurt is very international and Indians generally integrate well. My tips for newcomers:
1. Open a bank account with ING or DKB (English support)
2. Get liability insurance (Haftpflichtversicherung) - it's essential
3. Register your address (Anmeldung) within 14 days
4. Join local Indian WhatsApp/Telegram groups for real-time help`
    },
    {
      user: 'rohit_bangalore',
      content: `This is exactly the kind of information I was looking for when I arrived 3 months ago! The community here is really helpful. 

One thing I'd add - get the RMV app for public transport. The monthly pass is expensive (€91) but worth it if you commute daily.`
    },
    {
      user: 'kavya_shah',
      content: `Welcome to Frankfurt! Feel free to DM me if you need any help settling in. We have a informal meetup every first Sunday of the month at Palmengarten cafe. Great way to meet other Indians and share experiences.

Also check out the Indian Professionals Frankfurt group on LinkedIn - good for networking.`
    }
  ]
};

async function populateForumData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/indians-frankfurt-hub');
    console.log('Connected to MongoDB');

    // Create users
    const createdUsers = [];
    for (const userData of indianUsers) {
      // Check if user already exists
      let user = await User.findOne({ email: userData.email });
      if (!user) {
        user = new User(userData);
        await user.save();
        console.log(`Created user: ${userData.username}`);
      } else {
        console.log(`User already exists: ${userData.username}`);
      }
      createdUsers.push(user);
    }

    // Get existing forum posts
    const posts = await ForumPost.find().sort('-createdAt').limit(10);
    
    if (posts.length === 0) {
      console.log('No forum posts found to add replies to');
      process.exit(0);
    }

    console.log(`Found ${posts.length} posts to add replies to`);

    // Add replies to posts based on their content/category
    for (const post of posts) {
      const postTitle = post.title.toLowerCase();
      const postContent = post.content.toLowerCase();
      
      let relevantReplies = [];
      
      // Determine which replies are relevant based on post content
      if (postTitle.includes('grocer') || postContent.includes('food') || postContent.includes('shop')) {
        relevantReplies = forumReplies.groceries;
      } else if (postTitle.includes('accommodation') || postTitle.includes('apartment') || postContent.includes('housing')) {
        relevantReplies = forumReplies.accommodation;
      } else if (postTitle.includes('visa') || postTitle.includes('blue card') || postContent.includes('permit')) {
        relevantReplies = forumReplies.visa;
      } else if (postTitle.includes('event') || postTitle.includes('meetup') || postContent.includes('community')) {
        relevantReplies = forumReplies.events;
      } else {
        relevantReplies = forumReplies.general;
      }
      
      // Add 1-2 random replies to each post
      const numReplies = Math.floor(Math.random() * 2) + 1;
      const selectedReplies = relevantReplies.sort(() => 0.5 - Math.random()).slice(0, numReplies);
      
      for (const replyData of selectedReplies) {
        const user = createdUsers.find(u => u.username === replyData.user);
        if (user && !post.replies.some(r => r.author.toString() === user._id.toString())) {
          post.replies.push({
            author: user._id,
            content: replyData.content,
            createdAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)) // Random time in last week
          });
          
          // Update user contribution points
          user.contributions.points += 2;
          user.contributions.postsCreated += 1;
          await user.save();
          
          console.log(`Added reply from ${user.username} to post: ${post.title.substring(0, 30)}...`);
        }
      }
      
      await post.save();
    }

    console.log('\n✅ Successfully populated forum with Indian users and realistic replies!');
    console.log(`Created ${createdUsers.length} users and added replies to ${posts.length} posts`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error populating data:', error);
    process.exit(1);
  }
}

// Run the script
populateForumData();