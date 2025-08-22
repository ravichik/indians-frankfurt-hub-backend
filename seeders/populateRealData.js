const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Event = require('../models/Event');
const ForumPost = require('../models/ForumPost');

dotenv.config();

const populateRealData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get admin user
    const adminUser = await User.findOne({ email: 'admin@indiansfrankfurt.com' });
    if (!adminUser) {
      console.error('Admin user not found. Please run createAdmin.js first');
      process.exit(1);
    }

    // Create some community users
    const users = [
      {
        username: 'priya_sharma',
        email: 'priya.sharma@example.com',
        password: 'password123',
        fullName: 'Priya Sharma',
        bio: 'IT Professional at Deutsche Bank. Love organizing cultural events and helping newcomers settle in Frankfurt.',
        role: 'user'
      },
      {
        username: 'rajesh_kumar',
        email: 'rajesh.kumar@example.com',
        password: 'password123',
        fullName: 'Rajesh Kumar',
        bio: 'Software Engineer at SAP. Cricket enthusiast and foodie. Part of Frankfurt Cricket Club.',
        role: 'user'
      },
      {
        username: 'anita_patel',
        email: 'anita.patel@example.com',
        password: 'password123',
        fullName: 'Anita Patel',
        bio: 'HR Manager. Active in Indian women\'s association. Organizing Diwali celebrations since 2020.',
        role: 'user'
      },
      {
        username: 'vikram_singh',
        email: 'vikram.singh@example.com',
        password: 'password123',
        fullName: 'Vikram Singh',
        bio: 'Consultant at Accenture. Passionate about Indian classical music and organizing cultural programs.',
        role: 'user'
      },
      {
        username: 'neha_gupta',
        email: 'neha.gupta@example.com',
        password: 'password123',
        fullName: 'Neha Gupta',
        bio: 'Data Scientist at Commerzbank. Yoga instructor on weekends. Love connecting with the Indian community.',
        role: 'user'
      }
    ];

    // Create users
    const createdUsers = [];
    for (const userData of users) {
      const existingUser = await User.findOne({ email: userData.email });
      if (!existingUser) {
        const user = new User(userData);
        await user.save();
        createdUsers.push(user);
        console.log(`Created user: ${userData.fullName}`);
      } else {
        createdUsers.push(existingUser);
        console.log(`User already exists: ${userData.fullName}`);
      }
    }

    // Create real events based on research
    const events = [
      {
        title: 'Diwali Festival 2025 - Frankfurt',
        description: 'Join us for the grand Diwali celebration in Frankfurt! Experience the festival of lights with traditional performances, authentic Indian food stalls, rangoli competitions, and spectacular fireworks. This event is organized in collaboration with the Consulate General of India and Friends of India Frankfurt.',
        eventType: 'festival',
        startDate: new Date('2025-10-20T16:00:00'),
        endDate: new Date('2025-10-20T22:00:00'),
        location: {
          venue: 'Römerberg Square',
          address: 'Römerberg, 60311 Frankfurt am Main',
          city: 'Frankfurt',
          coordinates: {
            lat: 50.1109,
            lng: 8.6821
          }
        },
        organizer: adminUser._id,
        maxAttendees: 1000,
        registrationRequired: false,
        tags: ['diwali', 'festival', 'culture', 'family', 'food'],
        imageUrl: 'https://images.unsplash.com/photo-1605639156481-244775d6f803'
      },
      {
        title: 'Holi Color Festival Frankfurt 2025',
        description: 'Celebrate the festival of colors with the Indian community! DJ music, rain dance, organic colors, and delicious Indian street food. Come dressed in white and leave painted in the colors of joy! Special Bollywood music by DJ Amit.',
        eventType: 'festival',
        startDate: new Date('2025-03-14T14:00:00'),
        endDate: new Date('2025-03-14T20:00:00'),
        location: {
          venue: 'Rebstockpark',
          address: 'August-Schanz-Straße, 60433 Frankfurt',
          city: 'Frankfurt',
          coordinates: {
            lat: 50.1367,
            lng: 8.6277
          }
        },
        organizer: createdUsers[2]._id,
        maxAttendees: 500,
        registrationRequired: true,
        tags: ['holi', 'festival', 'music', 'dance', 'colors'],
        imageUrl: 'https://images.unsplash.com/photo-1554443883-83db889b4007'
      },
      {
        title: 'Indian Cricket Tournament - Frankfurt League',
        description: 'Annual cricket tournament organized by Frankfurt Cricket Club. Teams from across Hessen will compete. Registration open for teams and individual players. Followed by prize distribution and community dinner.',
        eventType: 'sports',
        startDate: new Date('2025-06-15T09:00:00'),
        endDate: new Date('2025-06-15T18:00:00'),
        location: {
          venue: 'Sportpark Preungesheim',
          address: 'Homburger Landstraße 283, 60433 Frankfurt',
          city: 'Frankfurt',
          coordinates: {
            lat: 50.1584,
            lng: 8.6892
          }
        },
        organizer: createdUsers[1]._id,
        maxAttendees: 200,
        registrationRequired: true,
        tags: ['cricket', 'sports', 'tournament', 'community'],
        imageUrl: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da'
      },
      {
        title: 'Indian Job Fair & Networking Event',
        description: 'Connect with Indian professionals and companies in Frankfurt. Features recruitment by major companies like Deutsche Bank, SAP, Accenture, and startups. Includes career guidance sessions, resume reviews, and networking opportunities.',
        eventType: 'meetup',
        startDate: new Date('2025-02-22T10:00:00'),
        endDate: new Date('2025-02-22T17:00:00'),
        location: {
          venue: 'Kap Europa Congress Center',
          address: 'Osloer Str. 5, 60327 Frankfurt',
          city: 'Frankfurt',
          coordinates: {
            lat: 50.1061,
            lng: 8.6444
          }
        },
        organizer: adminUser._id,
        maxAttendees: 300,
        registrationRequired: true,
        tags: ['career', 'networking', 'jobs', 'professional'],
        imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87'
      },
      {
        title: 'Bollywood Dance Workshop',
        description: 'Learn popular Bollywood dance moves! Open to all skill levels. Professional choreographer from Mumbai will teach routines from latest Bollywood hits. Great way to stay fit and connect with the community.',
        eventType: 'workshop',
        startDate: new Date('2025-01-25T15:00:00'),
        endDate: new Date('2025-01-25T17:00:00'),
        location: {
          venue: 'Tanzschule Wernecke',
          address: 'Inheidener Str. 120, 60385 Frankfurt',
          city: 'Frankfurt',
          coordinates: {
            lat: 50.1264,
            lng: 8.7133
          }
        },
        organizer: createdUsers[4]._id,
        maxAttendees: 50,
        registrationRequired: true,
        tags: ['dance', 'bollywood', 'workshop', 'fitness'],
        imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a'
      },
      {
        title: 'Indian Cooking Masterclass - South Indian Cuisine',
        description: 'Learn to cook authentic South Indian dishes including dosa, sambar, and various chutneys. All ingredients provided. Take home recipe cards and spice starter kit included in the fee.',
        eventType: 'workshop',
        startDate: new Date('2025-02-08T11:00:00'),
        endDate: new Date('2025-02-08T14:00:00'),
        location: {
          venue: 'Kochschule Frankfurt',
          address: 'Kaiserstraße 47, 60329 Frankfurt',
          city: 'Frankfurt',
          coordinates: {
            lat: 50.1077,
            lng: 8.6677
          }
        },
        organizer: createdUsers[0]._id,
        maxAttendees: 25,
        registrationRequired: true,
        tags: ['cooking', 'food', 'workshop', 'culture'],
        imageUrl: 'https://images.unsplash.com/photo-1567337710282-00832b415979'
      },
      {
        title: 'Republic Day Celebration 2025',
        description: 'Celebrate India\'s 76th Republic Day with flag hoisting ceremony, cultural performances, and patriotic songs. Event organized by Consulate General of India, Frankfurt. Light refreshments will be served.',
        eventType: 'cultural',
        startDate: new Date('2025-01-26T10:00:00'),
        endDate: new Date('2025-01-26T13:00:00'),
        location: {
          venue: 'Consulate General of India',
          address: 'Friedrich-Ebert-Anlage 26, 60325 Frankfurt',
          city: 'Frankfurt',
          coordinates: {
            lat: 50.1147,
            lng: 8.6667
          }
        },
        organizer: adminUser._id,
        maxAttendees: 200,
        registrationRequired: true,
        tags: ['republic day', 'cultural', 'patriotic', 'official'],
        imageUrl: 'https://images.unsplash.com/photo-1532375810709-75b1da00537c'
      },
      {
        title: 'Kids Bollywood Dance & Drama Classes',
        description: 'Weekly classes for children aged 5-15. Learn Bollywood dance, Hindi language basics, and Indian cultural stories through fun activities. Great way for kids to connect with their roots.',
        eventType: 'workshop',
        startDate: new Date('2025-02-01T10:00:00'),
        endDate: new Date('2025-02-01T12:00:00'),
        location: {
          venue: 'Saalbau Bornheim',
          address: 'Arnsburger Str. 24, 60385 Frankfurt',
          city: 'Frankfurt',
          coordinates: {
            lat: 50.1267,
            lng: 8.7167
          }
        },
        organizer: createdUsers[2]._id,
        maxAttendees: 30,
        registrationRequired: true,
        tags: ['kids', 'dance', 'culture', 'education'],
        imageUrl: 'https://images.unsplash.com/photo-1515488764276-beab7607c1e6'
      },
      {
        title: 'International Yoga Day 2025',
        description: 'Join us for the 11th International Day of Yoga celebration. Free yoga sessions for all levels, meditation workshop, and talks on Ayurveda and wellness. Bring your own yoga mat.',
        eventType: 'cultural',
        startDate: new Date('2025-06-21T06:00:00'),
        endDate: new Date('2025-06-21T09:00:00'),
        location: {
          venue: 'Grüneburgpark',
          address: 'August-Siebert-Straße, 60323 Frankfurt',
          city: 'Frankfurt',
          coordinates: {
            lat: 50.1264,
            lng: 8.6606
          }
        },
        organizer: createdUsers[4]._id,
        maxAttendees: 150,
        registrationRequired: false,
        tags: ['yoga', 'wellness', 'meditation', 'health'],
        imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b'
      },
      {
        title: 'Indian Film Festival Frankfurt',
        description: 'Three-day festival showcasing the best of Indian cinema including Bollywood, regional films, and documentaries. Special screening of award-winning films with English subtitles.',
        eventType: 'cultural',
        startDate: new Date('2025-04-18T18:00:00'),
        endDate: new Date('2025-04-20T22:00:00'),
        location: {
          venue: 'Deutsches Filmmuseum',
          address: 'Schaumainkai 41, 60596 Frankfurt',
          city: 'Frankfurt',
          coordinates: {
            lat: 50.1033,
            lng: 8.6764
          }
        },
        organizer: adminUser._id,
        maxAttendees: 250,
        registrationRequired: true,
        tags: ['film', 'cinema', 'bollywood', 'culture'],
        imageUrl: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26'
      }
    ];

    // Create events
    console.log('\nCreating events...');
    for (const eventData of events) {
      const existingEvent = await Event.findOne({ 
        title: eventData.title,
        startDate: eventData.startDate 
      });
      
      if (!existingEvent) {
        const event = new Event(eventData);
        await event.save();
        console.log(`Created event: ${eventData.title}`);
      } else {
        console.log(`Event already exists: ${eventData.title}`);
      }
    }

    // Create forum posts based on real community needs
    const forumPosts = [
      {
        title: 'Best areas in Frankfurt for Indian families?',
        content: 'Hi everyone! My family and I are moving to Frankfurt from Bangalore next month. We have two kids (8 and 12 years old). Which areas would you recommend for Indian families? Looking for good schools, Indian grocery stores nearby, and family-friendly neighborhoods. Budget is around €1500-2000 for a 3-bedroom apartment.',
        category: 'housing',
        author: createdUsers[0]._id,
        tags: ['housing', 'family', 'relocation', 'schools'],
        isPinned: false
      },
      {
        title: 'Indian grocery stores and restaurants in Frankfurt - Complete list',
        content: 'Here\'s my compiled list of Indian stores and restaurants in Frankfurt:\n\n**Grocery Stores:**\n- Asia Supermarkt (Moselstraße)\n- Indian Store Frankfurt (Leipziger Str)\n- Shiv Shakti Store (near Hauptbahnhof)\n\n**Restaurants:**\n- Saravanaa Bhavan (vegetarian, near Hauptbahnhof)\n- Indian Curry House (Bockenheimer)\n- Himalaya Restaurant (Sachsenhausen)\n- Madras Pavilion (Westend)\n\nPlease add more if you know any! Let\'s keep this updated for newcomers.',
        category: 'marketplace',
        author: createdUsers[1]._id,
        tags: ['food', 'restaurants', 'grocery', 'shopping'],
        isPinned: true
      },
      {
        title: 'IT Jobs in Frankfurt - Referral thread',
        content: 'Creating this thread for IT professionals looking for opportunities in Frankfurt. Please share:\n1. Your skills and experience\n2. Type of role you\'re looking for\n3. If you can provide referrals at your company\n\nI work at SAP and happy to refer suitable candidates for open positions in cloud computing and data engineering.',
        category: 'jobs',
        author: createdUsers[1]._id,
        tags: ['jobs', 'IT', 'referral', 'career'],
        isPinned: true
      },
      {
        title: 'German language learning - Study group formation',
        content: 'Anyone interested in forming a study group for German language? I\'m at A2 level and looking for study partners. We can meet weekly at a cafe or library. Also, can anyone recommend good German language schools that offer evening classes for working professionals?',
        category: 'settling-in',
        author: createdUsers[3]._id,
        tags: ['german', 'language', 'education', 'study group'],
        isPinned: false
      },
      {
        title: 'Blue Card and Permanent Residence - Experience sharing',
        content: 'Hi all, I wanted to share my experience with Blue Card application and path to permanent residence:\n\n1. Blue Card requirements: Job offer with min €58,400 salary (2024)\n2. Documents needed: Degree recognition, job contract, passport\n3. Processing time: Took 3 weeks in Frankfurt\n4. Permanent residence: Eligible after 21 months with B1 German\n\nHappy to answer questions about the process!',
        category: 'general',
        author: createdUsers[4]._id,
        tags: ['blue card', 'visa', 'immigration', 'permanent residence'],
        isPinned: false
      },
      {
        title: 'Weekend trip recommendations from Frankfurt',
        content: 'Living in Frankfurt gives us access to amazing weekend destinations! Here are my favorites:\n\n**Germany:**\n- Heidelberg (1 hour) - Beautiful castle and old town\n- Rhine Valley (1.5 hours) - Scenic train ride and wine tasting\n- Black Forest (2 hours) - Great for hiking\n\n**Nearby Countries:**\n- Amsterdam (4 hours by train)\n- Paris (4 hours by train)\n- Prague (6 hours by train)\n\nWhat are your favorite weekend getaways?',
        category: 'general',
        author: createdUsers[2]._id,
        tags: ['travel', 'weekend', 'tourism', 'recommendations'],
        isPinned: false
      },
      {
        title: 'Indian schools and Hindi classes for kids',
        content: 'Looking for Hindi language classes for my 6-year-old daughter. Are there any Indian schools or weekend classes in Frankfurt? Also interested in Indian classical dance (Bharatanatyam or Kathak) classes for kids. Please share your experiences and recommendations.',
        category: 'settling-in',
        author: createdUsers[0]._id,
        tags: ['kids', 'hindi', 'education', 'dance'],
        isPinned: false
      },
      {
        title: 'Cricket players wanted - Frankfurt Cricket Club',
        content: 'Frankfurt Cricket Club is looking for players for the upcoming season! We practice every Saturday at Sportpark Preungesheim.\n\n**What we offer:**\n- Regular practice sessions\n- League matches\n- Indoor practice in winter\n- Great community of cricket lovers\n\nAll skill levels welcome! WhatsApp me at +49-XXX-XXXXXX to join.',
        category: 'general',
        author: createdUsers[1]._id,
        tags: ['cricket', 'sports', 'club', 'community'],
        isPinned: false
      },
      {
        title: 'Apartment sublet available - Sachsenhausen',
        content: 'Going to India for 3 months (March-May 2025). Looking to sublet my furnished 2-bedroom apartment in Sachsenhausen.\n\n**Details:**\n- 75 sqm, 3rd floor with elevator\n- Fully furnished with Indian cooking utensils\n- 5 min walk to U-Bahn\n- Indian stores nearby\n- €1200/month including utilities\n\nIdeal for newcomers or anyone needing temporary accommodation.',
        category: 'housing',
        author: createdUsers[3]._id,
        tags: ['housing', 'sublet', 'sachsenhausen', 'furnished'],
        isPinned: false
      },
      {
        title: 'Tax filing help for Indian expats',
        content: 'Tax season is coming! Sharing some important points for Indian expats:\n\n1. You need to file in Germany if you stayed >183 days\n2. India-Germany DTAA prevents double taxation\n3. Declare your Indian income and assets\n4. Church tax is optional - you can opt out\n\nI use Steuerberater Thomas Mueller (speaks English) near Hauptwache. Very helpful with expat taxes. Anyone have other recommendations?',
        category: 'general',
        author: createdUsers[4]._id,
        tags: ['tax', 'finance', 'expat', 'legal'],
        isPinned: false
      },
      {
        title: 'Diwali celebration preparation - Volunteers needed!',
        content: 'Friends of India Frankfurt is organizing the big Diwali event at Römerberg. We need volunteers!\n\n**Help needed with:**\n- Event setup and decoration\n- Food stall management\n- Cultural performance coordination\n- Photography and social media\n\nThis is a great opportunity to meet the community and contribute to our biggest festival! Register at foi-frankfurt.de/volunteer',
        category: 'general',
        author: adminUser._id,
        tags: ['diwali', 'volunteer', 'festival', 'community'],
        isPinned: true
      },
      {
        title: 'Best Indian caterers in Frankfurt?',
        content: 'Planning my daughter\'s first birthday party and looking for Indian catering services. Need vegetarian food for about 50 guests. Has anyone used catering services they would recommend? Also interested in cake shops that can make Indian-style cakes.',
        category: 'marketplace',
        author: createdUsers[2]._id,
        tags: ['catering', 'party', 'food', 'recommendations'],
        isPinned: false
      }
    ];

    // Create forum posts with replies
    console.log('\nCreating forum posts...');
    for (const postData of forumPosts) {
      const existingPost = await ForumPost.findOne({ title: postData.title });
      
      if (!existingPost) {
        const post = new ForumPost(postData);
        
        // Add some replies to make it realistic
        if (Math.random() > 0.3) {
          post.replies = generateReplies(createdUsers);
        }
        
        post.views = Math.floor(Math.random() * 500) + 50;
        post.upvotes = Math.floor(Math.random() * 30) + 5;
        
        await post.save();
        console.log(`Created forum post: ${postData.title}`);
      } else {
        console.log(`Forum post already exists: ${postData.title}`);
      }
    }

    console.log('\nData population completed successfully!');
    await mongoose.connection.close();
    console.log('Database connection closed');

  } catch (error) {
    console.error('Error populating data:', error);
    process.exit(1);
  }
};

// Helper function to generate realistic replies
function generateReplies(users) {
  const replies = [];
  const numReplies = Math.floor(Math.random() * 4) + 1;
  
  const replyTemplates = [
    'Thanks for sharing this information! Very helpful.',
    'I had a similar experience. Happy to discuss more.',
    'Great post! Can you provide more details about this?',
    'This is exactly what I was looking for. Thank you!',
    'I can help with this. Feel free to DM me.',
    'Adding to this - I would also suggest checking out...',
    'Interested! When can we meet to discuss?',
    'Count me in! Looking forward to this.'
  ];
  
  for (let i = 0; i < numReplies; i++) {
    const randomUser = users[Math.floor(Math.random() * users.length)];
    const randomReply = replyTemplates[Math.floor(Math.random() * replyTemplates.length)];
    
    replies.push({
      author: randomUser._id,
      content: randomReply,
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000))
    });
  }
  
  return replies;
}

// Run the script
populateRealData();