# LiynMar Tutorial Services - Quick Start Guide

## Prerequisites
- Node.js (v14 or higher)
- MongoDB (Local or Atlas)
- npm or yarn

---

## Running the Application

### 1. Backend Setup (Server)

**Navigate to server directory:**
```powershell
cd "c:\Users\Kayeen Campana\LiynMar Online Tutorial Services\liynmar-app\server"
```

**Install dependencies:**
```powershell
npm install
```

**Setup MongoDB:**
- Option A: Local MongoDB - Ensure MongoDB service is running
- Option B: MongoDB Atlas - See `server/MONGODB_SETUP.md`

**Create .env file:**
```env
MONGODB_URI=mongodb://localhost:27017/liynmar-tutorial
JWT_SECRET=your-secret-key-here
PORT=5000
```

**Create Admin Account:**
```powershell
node scripts/setupAdmin.js
```

**Default Admin Credentials:**
- Email: kayeencampana@gmail.com
- Password: Admin@123

**Start the server:**
```powershell
node server.js
```

Server should run on `http://localhost:5000`

---

### 2. Frontend Setup (Client)

**Navigate to client directory:**
```powershell
cd "c:\Users\Kayeen Campana\LiynMar Online Tutorial Services\liynmar-app\client"
```

**Install dependencies:**
```powershell
npm install
```

**Start the development server:**
```powershell
npm run dev
```

**Open your browser:**
Navigate to `http://localhost:5173`

---

## First Time Login

1. **Go to**: http://localhost:5173
2. **Login with**:
   - Email: `kayeencampana@gmail.com`
   - Password: `Admin@123`
3. **You will have full admin access to all features**

---

## Application Structure

```
liynmar-app/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   └── Layout/
│   │   │       ├── Header.jsx        # Top navigation with search
│   │   │       ├── Sidebar.jsx       # Side nav with role-based locks
│   │   │       └── *.css
│   │   ├── pages/
│   │   │   ├── Auth.jsx              # Login/Register page
│   │   │   ├── Dashboard.jsx         # Main dashboard with graphs
│   │   │   ├── Teachers.jsx          # Teachers list table
│   │   │   ├── TeacherProfile.jsx    # Individual teacher profile
│   │   │   ├── Students.jsx          # Students management
│   │   │   ├── Bookings.jsx          # Booking management
│   │   │   ├── Employees.jsx         # Employee management (NEW!)
│   │   │   └── *.css
│   │   ├── services/
│   │   │   ├── authService.js        # Authentication API
│   │   │   ├── teacherService.js     # Teacher API calls
│   │   │   ├── studentService.js     # Student API calls
│   │   │   └── bookingService.js     # Booking API calls
│   │   ├── context/
│   │   │   └── AuthContext.jsx       # Auth context with role
│   │   ├── App.jsx                   # Main app with routes
│   │   └── main.jsx                  # Entry point
│   └── package.json
├── server/
│   ├── config/
│   │   └── database.js               # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js         # Auth logic
│   │   ├── teacherController.js      # Teacher CRUD
│   │   ├── studentController.js      # Student CRUD
│   │   └── bookingController.js      # Booking CRUD
│   ├── middleware/
│   │   ├── authMiddleware.js         # JWT verification
│   │   └── roleMiddleware.js         # Role-based access (NEW!)
│   ├── models/
│   │   ├── User.js                   # User schema with roles (NEW!)
│   │   ├── Teacher.js                # Teacher schema
│   │   ├── Student.js                # Student schema
│   │   └── Booking.js                # Booking schema
│   ├── routes/
│   │   ├── authRoutes.js             # Auth endpoints
│   │   ├── teacherRoutes.js          # Teacher endpoints
│   │   ├── studentRoutes.js          # Student endpoints
│   │   └── bookingRoutes.js          # Booking endpoints
│   ├── scripts/
│   │   └── setupAdmin.js             # Admin setup script
│   ├── server.js                     # Express server
│   └── package.json
└── README.md
```

---

## Key Features Implemented

### ✅ 1. Role-Based Access Control (NEW!)
- **Location**: Entire application
- **Roles**:
  - **Admin (Owner)**: Full access to all sections
  - **Teacher Manager**: Limited to Teachers section
  - **Booking Manager**: Limited to Bookings and Students sections
- **Features**:
  - Backend middleware protection
  - Frontend visual locks
  - JWT authentication
  - Secure role validation

### ✅ 2. Employee Management (NEW!)
- **Location**: `/employees` (Admin only)
- **Features**:
  - Create employee accounts
  - Assign roles (Teacher Manager/Booking Manager)
  - View all employees in table
  - Filter by role type
  - Soft delete with tracking
  - Role-based access descriptions

### ✅ 3. Dashboard
- **Location**: `/dashboard` (Admin only)
- **Features**:
  - Metric cards with Week/Month/Year filters
  - Revenue trend graph
  - Session status donut chart
  - Most booked subjects bar chart
  - Top 10 teachers ranked list

### ✅ 4. Teachers Management
- **Location**: `/teachers` (Admin + Teacher Manager)
- **Features**:
  - Complete teacher list with filters
  - Add/Edit/Delete teachers
  - Search functionality
  - Active/Inactive status
  - Soft delete with restore
  - Job experience tracking
  - Click to view detailed profile

### ✅ 5. Students Management
- **Location**: `/students` (Admin + Booking Manager)
- **Features**:
  - Student profiles
  - Parent/Guardian information
  - Academic tracking
  - Teacher assignments
  - Search and filter

### ✅ 6. Bookings Management
- **Location**: `/bookings` (Admin + Booking Manager)
- **Features**:
  - Create new bookings
  - Weekly schedule management
  - Student-teacher assignments
  - Real-time booking summary

### ✅ 7. Teacher Profile
- **Location**: `/teachers/:id`
- **Features**:
  - Contact information display
  - Professional information
  - Weekly student bookings table
  - **Interactive session status management**:
    - Click any day cell to change status
    - Status options: C, A, P, T, S, N
    - Automatic earnings calculation
  - Company share calculation (25%)
  - Week navigation

---

## User Roles & Access

### Admin (Owner)
```
✅ Dashboard
✅ Teachers (full CRUD)
✅ Students (full CRUD)
✅ Bookings (full CRUD)
✅ Employees (exclusive access)
✅ Analytics
```

### Teacher Manager
```
❌ Dashboard (locked)
✅ Teachers (full CRUD)
❌ Students (locked)
❌ Bookings (locked)
❌ Employees (locked)
❌ Analytics (locked)
```

### Booking Manager
```
❌ Dashboard (locked)
❌ Teachers (locked)
✅ Students (full CRUD)
✅ Bookings (full CRUD)
❌ Employees (locked)
❌ Analytics (locked)
```

---

## Creating Employee Accounts

**As Admin:**

1. Navigate to "Employees" in sidebar
2. Click "+ Add Employee"
3. Fill in the form:
   - Full Name
   - Email Address (must be unique)
   - Contact Number
   - Password (min 6 characters)
   - Role: Select "Teacher Manager" or "Booking Manager"
4. Click "Create Employee"

**Note**: The new employee can now login with their email and password, and they will only see the sections they have access to.

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `GET /api/auth/users` - Get all users (Admin only)
- `DELETE /api/auth/users/:id` - Delete user (Admin only)

### Teachers (Protected: Admin + Teacher Manager)
- `GET /api/teachers` - Get all teachers
- `POST /api/teachers` - Create teacher
- `GET /api/teachers/:id` - Get teacher by ID
- `PUT /api/teachers/:id` - Update teacher
- `DELETE /api/teachers/:id` - Soft delete teacher
- `PUT /api/teachers/:id/restore` - Restore deleted teacher

### Students (Protected: Admin + Booking Manager)
- `GET /api/students` - Get all students
- `POST /api/students` - Create student
- `GET /api/students/:id` - Get student by ID
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student

### Bookings (Protected: Admin + Booking Manager)
- `GET /api/bookings` - Get all bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/:id` - Get booking by ID
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Delete booking

---
    - **Flexible weekly schedule**:
      - Different times per day
      - Different durations per day (30 mins to 2 hours)
    - Real-time booking summary
    - Weekly total calculation

### ✅ 5. Search Functionality
- Context-aware search in header
- Filters by multiple criteria
- Real-time results

---

## Using the Application

### Creating a Booking

1. Navigate to **Bookings** page
2. Use search if needed to find specific teacher
3. Click **Book** button on desired teacher
4. Fill in the booking form:
   
   **Student Information:**
   - Student Name
   - Grade Level
   
   **Parent Information:**
   - Parent Name
   - Contact Number
   - Facebook Link (optional)
   
   **Session Details:**
   - Subject (pre-filled, can modify)
   - Start Date
   - Default Preferred Time
   
   **Weekly Schedule:**
   - Check the days you want
   - For each day, set:
     - Specific time (or use default)
     - Duration (30 mins, 1 hour, 1.5 hours, or 2 hours)
   
   **Booking Summary** (right sidebar):
   - Shows total sessions
   - Lists all rates for each day
   - Displays weekly total

5. Review the summary
6. Click **Confirm Booking**

The booking will now appear in the teacher's profile!

### Managing Session Statuses

1. Go to **Teachers** page
2. Click on a teacher's **View Profile** button
3. Scroll to the weekly student table
4. Click on any day cell (M, T, W, Th, F, Sa, Su)
5. Select new status from dropdown:
   - **C** - Completed & Paid (counted in earnings)
   - **A** - Advance Paid (counted in earnings)
   - **P** - Pending (not counted)
   - **T** - Teacher Absent (not counted)
   - **S** - Student Absent (not counted)
   - **N** - No Schedule (removes from schedule)
6. Earnings automatically update

### Viewing Analytics

1. Navigate to **Dashboard**
2. Use the **Week/Month/Year** buttons to change period
3. View the four graphs:
   - Revenue trends
   - Session completion status
   - Most booked subjects
   - Top 10 teachers

---

## Sample Data

The application comes with sample data for demonstration:

**Teachers:**
- Sarah Johnson (Mathematics) - Active
- Michael Chen (Physics) - Inactive
- Emily Santos (English) - Active
- David Martinez (Chemistry) - Active
- Lisa Wong (Biology) - Active

**Dashboard Metrics:**
- Reflects realistic educational business data
- Changes based on selected time period

---

## Customization

### Changing Colors

Edit `src/index.css` CSS variables:

```css
:root {
  --color-primary: #8B7355;      /* Main brown color */
  --color-secondary: #C9A869;    /* Tan/gold color */
  --color-success: #7D9B76;      /* Green */
  --color-error: #B86B6B;        /* Red */
  /* ... more variables */
}
```

### Adding Teachers

Currently using sample data. To add real teachers:
1. Implement backend API
2. Update `teacherService.js`
3. Connect to database

### Modifying Hourly Rates

In sample data, all teachers have `hourlyRate: 125`
- Modify in `Bookings.jsx` sample data
- Or fetch from backend API

---

## Next Steps for Backend Implementation

### Recommended Tech Stack:
- **Server**: Node.js + Express
- **Database**: MongoDB
- **Authentication**: JWT tokens

### API Endpoints Needed:

```
GET    /api/teachers              # Get all teachers
GET    /api/teachers/:id          # Get teacher by ID
POST   /api/teachers              # Create teacher
PUT    /api/teachers/:id          # Update teacher
DELETE /api/teachers/:id          # Delete teacher

GET    /api/bookings              # Get all bookings
POST   /api/bookings              # Create booking
PUT    /api/bookings/:id          # Update booking
DELETE /api/bookings/:id          # Delete booking

GET    /api/sessions              # Get all sessions
PUT    /api/sessions/:id/status   # Update session status

GET    /api/analytics/revenue     # Get revenue data
GET    /api/analytics/teachers    # Get teacher stats
GET    /api/analytics/subjects    # Get subject stats
```

### Database Schema Examples:

**Teacher:**
```javascript
{
  _id: ObjectId,
  name: String,
  subject: String,
  email: String,
  phone: String,
  facebook: String,
  major: String,
  status: String, // 'active' or 'inactive'
  hourlyRate: Number,
  daysAvailable: [String],
  usualTime: String,
  createdAt: Date,
  updatedAt: Date
}
```

**Booking:**
```javascript
{
  _id: ObjectId,
  teacherId: ObjectId,
  studentName: String,
  studentGrade: String,
  parentName: String,
  parentPhone: String,
  parentFacebook: String,
  subject: String,
  startDate: Date,
  weeklySchedule: [{
    day: String,
    time: String,
    duration: Number,
    rate: Number,
    status: String // 'C', 'A', 'P', 'T', 'S', 'N'
  }],
  additionalNotes: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Troubleshooting

### Port Already in Use
If port 5173 is busy:
```powershell
# Change port in vite.config.js
server: {
  port: 3000
}
```

### Dependencies Not Installing
```powershell
# Clear cache and reinstall
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

### Build Errors
```powershell
# Clear build cache
npm run build -- --force
```

---

## Browser Compatibility

Tested and working on:
- Chrome 90+
- Firefox 88+
- Edge 90+
- Safari 14+

---

## Performance Tips

1. **Lazy Loading**: Components load on demand
2. **Memoization**: Use React.memo for heavy components
3. **Pagination**: Add for large teacher lists
4. **Debouncing**: Search has built-in debouncing

---

## Support & Contact

For technical support or questions:
- Review the `FEATURES.md` documentation
- Check the inline code comments
- Contact the development team

---

**Happy Teaching Management! 📚**
