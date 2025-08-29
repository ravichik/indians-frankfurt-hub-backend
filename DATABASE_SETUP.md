# Database Setup Guide

## Prerequisites

- MongoDB installed locally or MongoDB Atlas account
- Node.js and npm installed

## Local MongoDB Setup

### 1. Install MongoDB

#### Windows:
Download and install MongoDB Community Server from: https://www.mongodb.com/try/download/community

#### Mac:
```bash
brew tap mongodb/brew
brew install mongodb-community
```

#### Linux:
Follow the official MongoDB installation guide for your distribution.

### 2. Start MongoDB Service

#### Windows:
MongoDB should start automatically as a service. If not:
```bash
net start MongoDB
```

#### Mac/Linux:
```bash
mongod
```

## Project Database Setup

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the backend directory with:
```env
MONGODB_URI=mongodb://localhost:27017/indians-frankfurt-hub
JWT_SECRET=your-secret-key-change-this-in-production
PORT=5000
```

### 3. Seed the Database
Run the seeder to populate initial data:
```bash
node seeders/seed.js
```

This will create:
- 3 sample users (including an admin)
- 5 sample events (Diwali, Holi, Cricket Tournament, etc.)
- 4 sample forum posts

### 4. Start the Server
```bash
npm run dev
```

## MongoDB Atlas Setup (Cloud)

### 1. Create Atlas Account
Visit https://cloud.mongodb.com and create a free account.

### 2. Create a Cluster
- Choose a free tier cluster
- Select your preferred region (Frankfurt for better latency)

### 3. Configure Database Access
- Create a database user with password
- Add your IP address to the whitelist

### 4. Get Connection String
- Click "Connect" on your cluster
- Choose "Connect your application"
- Copy the connection string

### 5. Update .env
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/indians-frankfurt-hub?retryWrites=true&w=majority
```

## Database Schema

### Collections:

#### Users
- username (unique)
- email (unique)
- password (hashed)
- fullName
- bio
- location
- interests
- role (user/admin)
- createdAt

#### Events
- title
- description
- eventType (festival/meetup/workshop/cultural/sports)
- startDate
- endDate
- location (venue, address, city, coordinates)
- organizer (ref: User)
- attendees (array of User refs)
- maxAttendees
- registrationRequired
- tags
- imageUrl
- createdAt

#### ForumPosts
- title
- content
- category (general/housing/jobs/food/education/local)
- author (ref: User)
- replies (embedded documents)
- tags
- views
- upvotes
- isPinned
- createdAt

## Default Users

After seeding, you can login with:

### Admin Account:
- Email: admin@indiansfrankfurt.com
- Password: admin123

### Test Users:
- Email: rajesh@example.com
- Password: password123

- Email: priya@example.com
- Password: password123

## Troubleshooting

### MongoDB Connection Failed
- Ensure MongoDB service is running
- Check if port 27017 is not blocked
- Verify MONGODB_URI in .env file

### Seeder Errors
- Make sure MongoDB is running
- Check if the database name is correct
- Ensure all model files exist in /models directory

### Port Already in Use
- Change PORT in .env file
- Or stop the process using the port:
  ```bash
  # Windows
  netstat -ano | findstr :5000
  taskkill /PID <PID> /F
  
  # Mac/Linux
  lsof -i :5000
  kill -9 <PID>
  ```

## Backup and Restore

### Backup Database
```bash
mongodump --db indians-frankfurt-hub --out ./backup
```

### Restore Database
```bash
mongorestore --db indians-frankfurt-hub ./backup/indians-frankfurt-hub
```