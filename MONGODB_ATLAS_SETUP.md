# MongoDB Atlas Setup Guide

## Quick Setup Steps

### 1. Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up for a free account

### 2. Create a Free Cluster
1. Click "Build a Cluster"
2. Choose **FREE** Shared Cluster
3. Select Cloud Provider: **AWS**
4. Select Region: **Frankfurt (eu-central-1)** for best performance
5. Cluster Name: `indians-frankfurt-hub` (or any name you prefer)
6. Click "Create Cluster" (takes 1-3 minutes)

### 3. Set Up Database Access
1. Go to **Security → Database Access**
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Username: `admin` (or your preferred username)
5. Password: Click "Autogenerate Secure Password" and **SAVE IT**
6. Database User Privileges: Select "Atlas Admin"
7. Click "Add User"

### 4. Set Up Network Access
1. Go to **Security → Network Access**
2. Click "Add IP Address"
3. For development, click "Allow Access from Anywhere" (0.0.0.0/0)
   - Note: For production, add only specific IP addresses
4. Click "Confirm"

### 5. Get Your Connection String
1. Go to **Deployment → Database**
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Driver: Node.js, Version: 4.1 or later
5. Copy the connection string, it looks like:
   ```
   mongodb+srv://<username>:<password>@cluster-name.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### 6. Update Your .env File
Replace the MONGODB_URI in your `.env` file:

```env
# Replace <username> with your database username
# Replace <password> with your database password
# Replace cluster-name.xxxxx with your actual cluster address
# Add the database name after .net/

MONGODB_URI=mongodb+srv://admin:YourPassword123@cluster-name.xxxxx.mongodb.net/indians-frankfurt-hub?retryWrites=true&w=majority
```

**Example:**
```env
MONGODB_URI=mongodb+srv://admin:MySecurePass123@indians-hub.abc123.mongodb.net/indians-frankfurt-hub?retryWrites=true&w=majority
```

### 7. Test Connection
Run this command to test the connection and seed data:
```bash
cd backend
npm run seed
```

If successful, you'll see:
```
Connected to MongoDB
Cleared existing data
Created sample users
Created sample events
Created sample forum posts
Database seeded successfully!
```

### 8. Start the Server
```bash
npm run dev
```

## Troubleshooting

### Connection Errors

#### "Authentication failed"
- Double-check username and password in connection string
- Ensure no special characters in password or URL-encode them:
  - @ becomes %40
  - : becomes %3A
  - / becomes %2F

#### "Network Error" or "Timeout"
- Check Network Access settings - ensure your IP is whitelisted
- Try "Allow access from anywhere" for testing
- Check if your firewall is blocking the connection

#### "Invalid connection string"
- Ensure the format is exactly:
  ```
  mongodb+srv://username:password@cluster.mongodb.net/database-name?retryWrites=true&w=majority
  ```
- No spaces in the connection string
- Database name comes after .net/

### View Data in Atlas
1. Go to **Deployment → Database**
2. Click "Browse Collections"
3. You'll see your database and collections after seeding

### MongoDB Atlas Free Tier Limits
- 512 MB storage
- Shared RAM and vCPU
- Perfect for development and small projects
- Upgrade to paid tier for production use

## Security Best Practices
1. **Never commit .env file** to Git
2. Use strong passwords
3. Restrict IP access in production
4. Use read-only users where possible
5. Enable 2FA on your Atlas account

## Need Your Connection String?
If you need help setting up, provide me with:
1. Your cluster name
2. Your database username (NOT the password)
3. The cluster address shown in Atlas

And I'll help you format the connection string correctly.