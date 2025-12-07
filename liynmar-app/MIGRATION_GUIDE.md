# Migration Guide: LocalStorage to MongoDB Backend

## Overview
This guide will help you migrate from the localStorage-based application to a full-stack application with Node.js + Express + MongoDB backend.

## Prerequisites Completed
- ✅ MongoDB 8.2.2 installation in progress

## Architecture Changes

### Before (localStorage)
```
React App → localStorage (browser)
```

### After (Full-Stack)
```
React App → API Layer → Express Server → MongoDB
```

## Step 1: Install Server Dependencies

1. Open a new terminal and navigate to the server directory:
```powershell
cd "c:\Users\Kayeen Campana\LiynMar Online Tutorial Services\liynmar-app\server"
```

2. Install all backend dependencies:
```powershell
npm install
```

This will install:
- express (web framework)
- mongoose (MongoDB ODM)
- cors (cross-origin requests)
- dotenv (environment variables)
- bcryptjs (password hashing)
- jsonwebtoken (JWT authentication)
- express-validator (input validation)
- nodemon (auto-restart during development)

## Step 2: Configure MongoDB

1. Ensure MongoDB is installed and running:
```powershell
# Check if MongoDB service is running
net start MongoDB

# Or start MongoDB manually
mongod
```

2. Update MongoDB connection string in `server\.env`:
```env
MONGODB_URI=mongodb://localhost:27017/liynmar_tutorial
```

If using MongoDB Atlas (cloud), use:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/liynmar_tutorial
```

3. Change JWT secret to something secure:
```env
JWT_SECRET=your_very_secure_random_secret_key_12345
```

## Step 3: Start the Backend Server

1. In the server directory, run:
```powershell
npm run dev
```

You should see:
```
✅ MongoDB Connected: localhost
📊 Database: liynmar_tutorial
🚀 Server is running on port 5000
```

## Step 4: Test Backend API

Open a new terminal and test the health endpoint:
```powershell
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "success",
  "message": "Server is running",
  "timestamp": "2025-12-06T..."
}
```

## Step 5: Install Client Dependencies (if needed)

The client already has axios installed. If you need to reinstall:
```powershell
cd "c:\Users\Kayeen Campana\LiynMar Online Tutorial Services\liynmar-app\client"
npm install
```

## Step 6: What's Next

The backend is ready! The next steps are to update the React components to use the API instead of localStorage. This includes:

### Components that need updating:
1. **Teachers.jsx** - Replace localStorage with teacherService API calls
2. **Students.jsx** - Replace localStorage with studentService API calls  
3. **Bookings.jsx** - Replace localStorage with bookingService API calls
4. **Auth.jsx** - Use authService for login/registration
5. **Dashboard.jsx** - Fetch data from API

Would you like me to update these components now, or would you prefer to:
- Test the backend first
- Create some sample data in MongoDB
- Review the API structure

## API Services Created

All API services are ready in `client/src/services/`:
- `api.js` - Axios instance with auth interceptors
- `teacherService.js` - All teacher operations
- `studentService.js` - All student operations
- `bookingService.js` - All booking operations
- `authService.js` - Authentication operations

## Key Benefits of Migration

1. **Data Persistence** - Data stored in MongoDB, not browser
2. **Multi-device Access** - Access from any device
3. **Better Security** - JWT authentication, password hashing
4. **Scalability** - Can handle many users
5. **Data Relationships** - Proper linking between teachers, students, bookings
6. **Backup & Recovery** - MongoDB backup capabilities
7. **Advanced Queries** - Complex filtering and aggregations

## Database Collections

MongoDB will automatically create these collections:
- `users` - Admin/user accounts
- `teachers` - Teacher profiles
- `students` - Student records
- `bookings` - Booking/session records

## Environment Variables

### Server (.env)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/liynmar_tutorial
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:3000
```

### Client (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## Troubleshooting

### MongoDB Connection Failed
```
Error: connect ECONNREFUSED
```
**Solution:** Ensure MongoDB service is running
```powershell
net start MongoDB
```

### Port 5000 Already in Use
**Solution:** Change PORT in server/.env or kill the process:
```powershell
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### CORS Errors
**Solution:** Verify CLIENT_URL in server/.env matches your React app URL

### Module Not Found
**Solution:** 
```powershell
cd server
npm install
```

## Next Steps

Let me know when MongoDB installation is complete and the server is running successfully. Then I'll update all the React components to use the new backend API instead of localStorage.

The migration will maintain all existing features while adding:
- Proper user authentication
- Persistent data storage
- Better error handling
- Loading states
- Real-time data synchronization
