# Indians in Frankfurt Hub - Backend API

Backend API server for the Indians in Frankfurt Hub community platform.

## 🚀 Technologies

- Node.js & Express.js
- MongoDB with Mongoose ODM
- JWT Authentication
- Google OAuth Integration
- Content Moderation System
- CORS enabled for cross-origin requests

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account (for production)
- Google Cloud Console account (for OAuth)

## 🛠️ Installation

1. **Clone the repository**
```bash
git clone https://github.com/ravichik/indians-frankfurt-hub-backend.git
cd indians-frankfurt-hub-backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
Create a `.env` file in the root directory:
```env
# Server
PORT=5000

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority

# JWT
JWT_SECRET=your-jwt-secret-key-here

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
CLIENT_URL=http://localhost:3000

# Environment
NODE_ENV=development
```

## 🏃‍♂️ Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/google` - Google OAuth login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/profile` - Get user profile

### Forum
- `GET /api/forum/posts` - Get all forum posts
- `GET /api/forum/posts/:id` - Get single post
- `POST /api/forum/posts` - Create new post
- `PATCH /api/forum/posts/:id` - Update post
- `DELETE /api/forum/posts/:id` - Delete post
- `POST /api/forum/posts/:id/reply` - Reply to post
- `POST /api/forum/posts/:id/like` - Like/unlike post

### Events
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get single event
- `POST /api/events` - Create new event
- `PATCH /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event
- `POST /api/events/:id/rsvp` - RSVP to event

### Resources
- `GET /api/resources` - Get resources
- `GET /api/resources/categories` - Get resource categories

### Admin
- `GET /api/admin/stats` - Get dashboard statistics
- `GET /api/admin/users` - Get all users
- `PATCH /api/admin/users/:id/role` - Update user role
- `GET /api/admin/analytics` - Get analytics data

## 🚀 Deployment to Vercel

1. **Deploy to Vercel**
```bash
vercel
```

2. **Add Environment Variables in Vercel Dashboard**
- Go to Project Settings → Environment Variables
- Add all variables from `.env` file

3. **Configure MongoDB Atlas**
- Allow access from anywhere (0.0.0.0/0)
- Get connection string and update `MONGODB_URI`

## 🔧 Database Setup

### Create Admin User
```bash
node seeders/fixAdmin.js
```
Default admin credentials:
- Email: admin@indiansfrankfurt.com
- Password: admin123456

### Seed Sample Data
```bash
node seeders/seed.js
```

## 🔒 Security Features

- JWT token authentication
- Password hashing with bcrypt
- Content moderation for inappropriate language
- CORS configuration for specific origins
- Role-based access control (Admin, Moderator, User)
- Input validation and sanitization

## 📊 Content Moderation

The API includes automatic content moderation that:
- Filters profanity and inappropriate language
- Blocks posts/replies with offensive content
- Provides clean error messages to users

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Verify MongoDB URI is correct
- Check network access allows your IP
- Ensure database user has proper permissions

### CORS Errors
- Update `FRONTEND_URL` in environment variables
- Check `server.js` includes your frontend domain

### Authentication Issues
- Verify JWT_SECRET is set
- Check token expiration settings
- Ensure headers include Authorization token

## 📝 API Documentation

### Health Check
```
GET /api/health
```
Response:
```json
{
  "status": "OK",
  "message": "Indians in Frankfurt Hub API is running",
  "environment": "production",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License

## 📞 Support

For support, email support@indiansfrankfurt.com

---
Built with ❤️ for the Indian community in Frankfurt