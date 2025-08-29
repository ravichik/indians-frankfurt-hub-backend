const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

// Import models
const User = require('../models/User');
const Event = require('../models/Event');
const ForumPost = require('../models/ForumPost');

const seedDatabase = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/indians-frankfurt-hub');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Event.deleteMany({});
    await ForumPost.deleteMany({});
    console.log('Cleared existing data');

    // Create sample users
    const users = await User.create([
      {
        username: 'admin',
        email: 'admin@indiansfrankfurt.com',
        password: await bcrypt.hash('admin123', 10),
        fullName: 'Admin User',
        role: 'admin',
        bio: 'Community administrator',
        location: 'Frankfurt',
        interests: ['Community Building', 'Events', 'Networking']
      },
      {
        username: 'rajesh_kumar',
        email: 'rajesh@example.com',
        password: await bcrypt.hash('password123', 10),
        fullName: 'Rajesh Kumar',
        bio: 'Software Engineer at SAP, living in Frankfurt since 2020',
        location: 'Frankfurt',
        interests: ['Technology', 'Cricket', 'Bollywood']
      },
      {
        username: 'priya_sharma',
        email: 'priya@example.com',
        password: await bcrypt.hash('password123', 10),
        fullName: 'Priya Sharma',
        bio: 'Data Scientist, yoga enthusiast, foodie',
        location: 'Bad Homburg',
        interests: ['Yoga', 'Cooking', 'Travel']
      }
    ]);
    console.log('Created sample users');

    // Create sample events
    const events = await Event.create([
      {
        title: 'Diwali Celebration 2025',
        description: 'Join us for the biggest Diwali celebration in Frankfurt! Enjoy traditional music, dance performances, delicious Indian food, and fireworks display.',
        eventType: 'festival',
        startDate: new Date('2025-10-20T18:00:00'),
        endDate: new Date('2025-10-20T23:00:00'),
        location: {
          venue: 'Palmengarten Frankfurt',
          address: 'Siesmayerstraße 61, 60323 Frankfurt am Main',
          city: 'Frankfurt',
          coordinates: {
            lat: 50.1234,
            lng: 8.6789
          }
        },
        organizer: users[0]._id,
        maxAttendees: 500,
        registrationRequired: true,
        tags: ['diwali', 'festival', 'culture', 'family-friendly'],
        imageUrl: '/images/diwali-2025.jpg'
      },
      {
        title: 'Indian Professionals Networking Meetup',
        description: 'Monthly networking event for Indian professionals in Frankfurt. Connect with fellow professionals, share experiences, and build your network.',
        eventType: 'meetup',
        startDate: new Date('2025-02-15T19:00:00'),
        endDate: new Date('2025-02-15T21:30:00'),
        location: {
          venue: 'WeWork Frankfurt',
          address: 'Taunusanlage 8, 60329 Frankfurt am Main',
          city: 'Frankfurt'
        },
        organizer: users[1]._id,
        maxAttendees: 50,
        registrationRequired: true,
        tags: ['networking', 'professionals', 'career']
      },
      {
        title: 'Holi Color Festival 2025',
        description: 'Celebrate the festival of colors with the Indian community in Frankfurt. Live DJ, organic colors, traditional snacks, and lots of fun!',
        eventType: 'festival',
        startDate: new Date('2025-03-14T14:00:00'),
        endDate: new Date('2025-03-14T18:00:00'),
        location: {
          venue: 'Rebstockpark',
          address: 'Rebstockpark, 60486 Frankfurt am Main',
          city: 'Frankfurt'
        },
        organizer: users[0]._id,
        maxAttendees: 300,
        registrationRequired: true,
        tags: ['holi', 'festival', 'colors', 'outdoor']
      },
      {
        title: 'Yoga & Meditation Workshop',
        description: 'Learn authentic Indian yoga practices and meditation techniques. Suitable for beginners and experienced practitioners.',
        eventType: 'workshop',
        startDate: new Date('2025-01-25T10:00:00'),
        endDate: new Date('2025-01-25T12:00:00'),
        location: {
          venue: 'Yoga Studio Frankfurt',
          address: 'Mainzer Landstraße 49, 60329 Frankfurt',
          city: 'Frankfurt'
        },
        organizer: users[2]._id,
        maxAttendees: 20,
        registrationRequired: true,
        tags: ['yoga', 'meditation', 'wellness', 'health']
      },
      {
        title: 'Cricket Tournament - Frankfurt Indians',
        description: 'Annual cricket tournament for Indian cricket enthusiasts. Form your team and compete for the championship trophy!',
        eventType: 'sports',
        startDate: new Date('2025-06-07T09:00:00'),
        endDate: new Date('2025-06-07T18:00:00'),
        location: {
          venue: 'Sportpark Preungesheim',
          address: 'Homburger Landstraße 283, 60435 Frankfurt',
          city: 'Frankfurt'
        },
        organizer: users[1]._id,
        maxAttendees: 200,
        registrationRequired: true,
        tags: ['cricket', 'sports', 'tournament', 'outdoor']
      }
    ]);
    console.log('Created sample events');

    // Create sample forum posts
    const forumPosts = await ForumPost.create([
      {
        title: 'Best Indian Restaurants in Frankfurt?',
        content: 'Hi everyone! I recently moved to Frankfurt and looking for authentic Indian restaurants. Any recommendations?',
        category: 'general',
        author: users[1]._id,
        tags: ['restaurants', 'food', 'recommendations'],
        views: 125,
        likes: [],
        replies: [
          {
            author: users[2]._id,
            content: 'You must try Saravanaa Bhavan in Kaiserstraße! They have amazing South Indian food.',
            likes: [],
            createdAt: new Date()
          },
          {
            author: users[0]._id,
            content: 'For North Indian cuisine, I recommend Indian Palace near Hauptbahnhof. Their butter chicken is excellent!',
            likes: [],
            createdAt: new Date()
          }
        ]
      },
      {
        title: 'German Language Classes for Indians',
        content: 'Can anyone recommend good German language schools that understand the needs of Indian students? Looking for A1-B2 level courses.',
        category: 'general',
        author: users[2]._id,
        tags: ['german', 'language', 'education'],
        views: 89,
        likes: []
      },
      {
        title: 'Housing Tips for Newcomers',
        content: 'Just compiled a list of tips for finding accommodation in Frankfurt. Hope this helps newcomers!\n\n1. Start early - Frankfurt housing market is competitive\n2. Prepare documents: SCHUFA, proof of income, references\n3. Check areas: Bornheim, Nordend, Sachsenhausen are popular\n4. Use platforms: ImmobilienScout24, WG-Gesucht\n5. Consider temporary options initially',
        category: 'housing',
        author: users[1]._id,
        tags: ['housing', 'tips', 'newcomers', 'accommodation'],
        views: 234,
        likes: [],
        isPinned: true
      },
      {
        title: 'Indian Grocery Stores in Frankfurt',
        content: 'Here\'s a comprehensive list of Indian grocery stores in Frankfurt:\n\n1. Asia Supermarkt - Moselstraße\n2. Indian Store - Kaiserstraße\n3. Patel Brothers - Hanauer Landstraße\n\nAll have good selections of spices, lentils, rice, and frozen items.',
        category: 'marketplace',
        author: users[0]._id,
        tags: ['grocery', 'shopping', 'indian-stores'],
        views: 567,
        likes: [],
        isPinned: true
      }
    ]);
    console.log('Created sample forum posts');

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeder
seedDatabase();