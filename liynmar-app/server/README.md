# LiynMar Tutorial Services - Backend API

Backend server for the LiynMar Online Tutorial Services application built with Node.js, Express, and MongoDB.

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (v8.2.2 or higher)
- npm or yarn

## Installation

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
   - Copy `.env` file and update the values
   - Set your MongoDB connection string in `MONGODB_URI`
   - Change `JWT_SECRET` to a secure random string

4. Start MongoDB service (if running locally):
```bash
# Windows
net start MongoDB

# Or if using MongoDB as a service
mongod
```

## Running the Server

### Development mode (with auto-reload):
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

The server will run on `http://localhost:5000` by default.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)

### Teachers
- `GET /api/teachers` - Get all teachers
- `GET /api/teachers/deleted` - Get deleted teachers
- `GET /api/teachers/:id` - Get single teacher
- `POST /api/teachers` - Create teacher
- `PUT /api/teachers/:id` - Update teacher
- `DELETE /api/teachers/:id` - Soft delete teacher
- `PATCH /api/teachers/:id/restore` - Restore deleted teacher
- `DELETE /api/teachers/:id/permanent` - Permanently delete teacher

### Students
- `GET /api/students` - Get all students
- `GET /api/students/deleted` - Get deleted students
- `GET /api/students/:id` - Get single student
- `POST /api/students` - Create student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Soft delete student
- `PATCH /api/students/:id/restore` - Restore deleted student
- `DELETE /api/students/:id/permanent` - Permanently delete student
- `PATCH /api/students/:id/assign-teacher` - Assign teacher to student
- `PATCH /api/students/:id/unassign-teacher` - Unassign teacher from student

### Bookings
- `GET /api/bookings` - Get all bookings
- `GET /api/bookings/stats` - Get booking statistics
- `GET /api/bookings/teacher/:teacherId` - Get bookings by teacher
- `GET /api/bookings/:id` - Get single booking
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Delete booking

### Health Check
- `GET /api/health` - Check server status

## Database Models

### User
- username (String, required, unique)
- email (String, required, unique)
- password (String, required, hashed)
- role (String: admin/user)
- isActive (Boolean)

### Teacher
- name (String, required)
- subject (String, required)
- phone (String, required)
- email (String, required, unique)
- facebook (String)
- status (String: active/inactive)
- daysAvailable (Array)
- usualTime (String)
- jobExperience (Array)
- isDeleted (Boolean)
- deletedAt (Date)

### Student
- parentFacebookName (String, required)
- studentName (String, required)
- gradeLevel (String, required)
- assignedTeacherId (ObjectId, ref: Teacher)
- status (String: active/inactive)
- isDeleted (Boolean)
- deletedAt (Date)

### Booking
- teacherId (ObjectId, ref: Teacher, required)
- teacherName (String, required)
- studentName (String, required)
- subject (String, required)
- date (Date, required)
- time (String, required)
- duration (String, required)
- status (String: pending/completed/cancelled)
- sessionNotes (String)
- isDeleted (Boolean)

## Environment Variables

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/liynmar_tutorial
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:3000
```

## Error Handling

All API endpoints return standardized error responses:

```json
{
  "status": "error",
  "message": "Error message here"
}
```

Success responses:

```json
{
  "status": "success",
  "data": { ... },
  "results": 10
}
```

## Security Features

- Password hashing with bcrypt
- JWT authentication
- CORS configuration
- Input validation
- Environment variable protection

## Development

To add new features:

1. Create model in `/models`
2. Create controller in `/controllers`
3. Create routes in `/routes`
4. Import routes in `server.js`

## Testing

```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Test with specific endpoints
curl http://localhost:5000/api/teachers
```

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check MongoDB URI in `.env`
- Verify MongoDB version compatibility

### Port Already in Use
- Change PORT in `.env` file
- Kill process using port 5000

### Module Not Found Errors
- Run `npm install` again
- Delete `node_modules` and reinstall

## License

ISC
